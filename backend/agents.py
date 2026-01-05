from typing import Dict, List, Optional
import os
from groq import Groq
from google import genai
from google.genai import types
import requests
import random
import time
import threading
from collections import defaultdict

# ==================== RATE LIMITER ====================
class RateLimiter:
    """Token bucket rate limiter for API calls"""

    def __init__(self, calls_per_minute: int = 10, calls_per_hour: int = 100):
        self.calls_per_minute = calls_per_minute
        self.calls_per_hour = calls_per_hour
        self.minute_calls = defaultdict(list)  # provider -> list of timestamps
        self.hour_calls = defaultdict(list)
        self.lock = threading.Lock()

    def can_call(self, provider: str) -> bool:
        """Check if we can make a call to this provider"""
        with self.lock:
            now = time.time()
            minute_ago = now - 60
            hour_ago = now - 3600

            # Clean old calls
            self.minute_calls[provider] = [t for t in self.minute_calls[provider] if t > minute_ago]
            self.hour_calls[provider] = [t for t in self.hour_calls[provider] if t > hour_ago]

            return (len(self.minute_calls[provider]) < self.calls_per_minute and
                    len(self.hour_calls[provider]) < self.calls_per_hour)

    def record_call(self, provider: str):
        """Record a call to this provider"""
        with self.lock:
            now = time.time()
            self.minute_calls[provider].append(now)
            self.hour_calls[provider].append(now)

    def wait_if_needed(self, provider: str, max_wait: float = 10.0) -> bool:
        """Wait until we can make a call, returns False if max_wait exceeded"""
        start = time.time()
        while not self.can_call(provider):
            if time.time() - start > max_wait:
                return False
            time.sleep(0.5)
        return True

# Global rate limiters for each provider
rate_limiters = {
    'openrouter': RateLimiter(calls_per_minute=15, calls_per_hour=200),
    'groq': RateLimiter(calls_per_minute=20, calls_per_hour=500),
    'gemini': RateLimiter(calls_per_minute=15, calls_per_hour=1000),
}

# ==================== BASE AGENT ====================
class ConsultantAgent:
    """Base class for consultant agents"""

    def __init__(self, name: str, role: str, specialty: str, personality: str, model_config: Dict):
        self.name = name
        self.role = role
        self.specialty = specialty
        self.personality = personality
        self.model_config = model_config

    def generate_response(self, context: str, previous_arguments: List[Dict] = None) -> str:
        """Generate a response based on context and previous arguments"""
        raise NotImplementedError

def get_api_key_from_pool(key_type: str) -> str:
    """Get an API key from the pool with rotation"""
    if key_type == 'openrouter':
        keys = os.getenv('OPENROUTER_API_KEYS', '').split(',')
    elif key_type == 'groq':
        keys = os.getenv('GROQ_API_KEYS', '').split(',')
    elif key_type == 'gemini':
        return os.getenv('GOOGLE_GEMINI_API_KEY', '')
    else:
        return os.getenv(f'{key_type.upper()}_API_KEY', '')

    keys = [k.strip() for k in keys if k.strip()]
    return random.choice(keys) if keys else ''

# ==================== OPENROUTER AGENT ====================
class OpenRouterAgent(ConsultantAgent):
    """Agent that uses OpenRouter API"""

    def generate_response(self, context: str, previous_arguments: List[Dict] = None) -> str:
        api_key = get_api_key_from_pool('openrouter')
        if not api_key:
            return f"[{self.name}] API key not configured."

        # Rate limiting
        limiter = rate_limiters.get('openrouter')
        if limiter and not limiter.wait_if_needed('openrouter'):
            return f"[{self.name}] Rate limited. Insight: {self.specialty.split(',')[0]} is critical."

        prompt = self._build_prompt(context, previous_arguments)

        try:
            if limiter:
                limiter.record_call('openrouter')

            response = requests.post(
                url="https://openrouter.ai/api/v1/chat/completions",
                headers={
                    "Authorization": f"Bearer {api_key}",
                    "Content-Type": "application/json"
                },
                json={
                    "model": self.model_config['model'],
                    "messages": [{"role": "user", "content": prompt}],
                    "max_tokens": 800,
                    "temperature": 0.7
                },
                timeout=30
            )
            response.raise_for_status()
            return response.json()['choices'][0]['message']['content']
        except Exception as e:
            return f"[{self.name}] Analysis pending. Key insight: Focus on {self.specialty.split(',')[0]}."

    def _build_prompt(self, context: str, previous_arguments: List[Dict] = None) -> str:
        prompt = f"""You are {self.name}, a {self.role}.

Personality: {self.personality}
Specialty: {self.specialty}

Problem Context:
{context}
"""
        if previous_arguments:
            prompt += "\n\nPrevious Arguments from Other Consultants:\n"
            for arg in previous_arguments[-4:]:
                if not arg['argument'].startswith('['):
                    prompt += f"\n{arg['agent']}: {arg['argument'][:200]}...\n"
            prompt += "\nRespond to these arguments with your unique perspective. Be direct and concise (max 150 words)."
        else:
            prompt += "\nProvide your initial analysis. Be concise (max 150 words)."

        return prompt

# ==================== GROQ AGENT ====================
class GroqAgent(ConsultantAgent):
    """Agent that uses Groq API"""

    def generate_response(self, context: str, previous_arguments: List[Dict] = None) -> str:
        api_key = get_api_key_from_pool('groq')
        if not api_key:
            return f"[{self.name}] API key not configured."

        # Rate limiting
        limiter = rate_limiters.get('groq')
        if limiter and not limiter.wait_if_needed('groq'):
            return f"[{self.name}] Rate limited. Key insight: {self.specialty.split(',')[0]} requires attention."

        prompt = self._build_prompt(context, previous_arguments)

        try:
            if limiter:
                limiter.record_call('groq')

            client = Groq(api_key=api_key)
            response = client.chat.completions.create(
                messages=[{"role": "user", "content": prompt}],
                model=self.model_config['model'],
                max_tokens=800,
                temperature=0.7
            )
            return response.choices[0].message.content
        except Exception as e:
            return f"[{self.name}] Analysis pending. Key insight: {self.specialty.split(',')[0]} requires attention."

    def _build_prompt(self, context: str, previous_arguments: List[Dict] = None) -> str:
        prompt = f"""You are {self.name}, a {self.role}.

Personality: {self.personality}
Specialty: {self.specialty}

Problem Context:
{context}
"""
        if previous_arguments:
            prompt += "\n\nPrevious Arguments:\n"
            for arg in previous_arguments[-4:]:
                if not arg['argument'].startswith('['):
                    prompt += f"{arg['agent']}: {arg['argument'][:200]}...\n"
            prompt += "\nYour response (max 150 words):"
        else:
            prompt += "\nYour analysis (max 150 words):"

        return prompt

# ==================== GEMINI AGENT ====================
class GeminiAgent(ConsultantAgent):
    """Agent that uses Google AI Studio Gemini API (new SDK)"""

    def generate_response(self, context: str, previous_arguments: List[Dict] = None) -> str:
        api_key = get_api_key_from_pool('gemini')
        if not api_key:
            return f"[{self.name}] Gemini API key not configured."

        # Rate limiting
        limiter = rate_limiters.get('gemini')
        if limiter and not limiter.wait_if_needed('gemini'):
            return f"[{self.name}] Rate limited. Focus on {self.specialty.split(',')[0]}."

        prompt = self._build_prompt(context, previous_arguments)

        try:
            if limiter:
                limiter.record_call('gemini')

            # Create client with new SDK
            client = genai.Client(api_key=api_key)

            # Generate response
            response = client.models.generate_content(
                model=self.model_config['model'],
                contents=prompt,
                config=types.GenerateContentConfig(
                    max_output_tokens=800,
                    temperature=0.7
                )
            )

            return response.text
        except Exception as e:
            return f"[{self.name}] Analysis pending. Key insight: {self.specialty.split(',')[0]} is crucial."

    def _build_prompt(self, context: str, previous_arguments: List[Dict] = None) -> str:
        prompt = f"""You are {self.name}, a {self.role}.

Personality: {self.personality}
Specialty: {self.specialty}

Problem Context:
{context}
"""
        if previous_arguments:
            prompt += "\n\nPrevious Arguments from Other Consultants:\n"
            for arg in previous_arguments[-4:]:
                if not arg['argument'].startswith('['):
                    prompt += f"\n{arg['agent']}: {arg['argument'][:200]}...\n"
            prompt += "\nRespond with your unique perspective. Be direct and concise (max 150 words)."
        else:
            prompt += "\nProvide your initial analysis. Be concise (max 150 words)."

        return prompt

# ==================== AGENT CONFIGURATIONS ====================
# Diverse models across providers - each agent uses a different model family
# Model diversity: DeepSeek, Gemini, Mixtral, Mistral, Llama, Qwen, Phi
AGENT_CONFIGS = [
    {
        "name": "PRIYA SHARMA",
        "role": "India Market Strategy Lead",
        "specialty": "Indian enterprise market, government projects, budget constraints, cultural nuances",
        "personality": "Authoritative, culturally aware, relationship-focused, pragmatic about Indian business realities",
        "model": {"model": "nex-agi/deepseek-v3.1-nex-n1:free", "provider": "openrouter"},  # DeepSeek V3
        "avatar_url": "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&h=200&fit=crop"
    },
    {
        "name": "ARJUN IYER",
        "role": "Technology Architect (India Stack)",
        "specialty": "India Stack (UPI, Aadhaar), massive scale systems, mobile-first, low-bandwidth optimization",
        "personality": "Technical, pragmatic, focused on frugal innovation and cost optimization",
        "model": {"model": "gemini-2.0-flash", "provider": "gemini"},  # Google Gemini 2.0
        "avatar_url": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop"
    },
    {
        "name": "SNEHA KAPOOR",
        "role": "Digital Transformation Lead",
        "specialty": "Enterprise transformation, change management, legacy system migration, stakeholder management",
        "personality": "Empathetic, strategic, experienced with organizational dynamics",
        "model": {"model": "mixtral-8x7b-32768", "provider": "groq"},  # Mixtral 8x7B
        "avatar_url": "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=200&h=200&fit=crop"
    },
    {
        "name": "RAHUL MENON",
        "role": "SaaS & Product Strategy",
        "specialty": "SaaS for Indian SMBs, pricing models, payment integration, freemium strategies",
        "personality": "Product-minded, data-driven, understands Indian SMB psychology",
        "model": {"model": "mistralai/mistral-small-3.1-24b-instruct:free", "provider": "openrouter"},  # Mistral Small
        "avatar_url": "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&h=200&fit=crop"
    },
    {
        "name": "DR. KAVITA REDDY",
        "role": "Data & AI Specialist",
        "specialty": "AI for Indian languages, recommendation systems, computer vision, fraud detection",
        "personality": "Analytical, detail-oriented, focused on data quality and practical AI",
        "model": {"model": "llama-3.3-70b-versatile", "provider": "groq"},  # Llama 3.3 70B
        "avatar_url": "https://images.unsplash.com/photo-1594824476967-48c8b964273f?w=200&h=200&fit=crop"
    },
    {
        "name": "VIKRAM SINGH",
        "role": "Security & Compliance (India)",
        "specialty": "RBI, SEBI, IRDAI regulations, payment security, UPI security",
        "personality": "Risk-averse, thorough, focused on compliance",
        "model": {"model": "qwen/qwen3-32b:free", "provider": "openrouter"},  # Qwen 3 32B
        "avatar_url": "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=200&h=200&fit=crop"
    },
    {
        "name": "ANITA DESAI",
        "role": "Customer & Market Insights",
        "specialty": "Tier 2/3 cities, Bharat market, customer behavior, trust-building",
        "personality": "Empathetic, customer-obsessed, focused on ground realities",
        "model": {"model": "gemini-1.5-flash", "provider": "gemini"},  # Gemini 1.5 Flash
        "avatar_url": "https://images.unsplash.com/photo-1551836022-deb4988cc6c0?w=200&h=200&fit=crop"
    },
    {
        "name": "SAMEER MALHOTRA",
        "role": "The Reality Check (Startup Veteran)",
        "specialty": "Execution challenges, budget realities, failure prevention",
        "personality": "Skeptical, direct, focused on identifying risks",
        "model": {"model": "microsoft/phi-4:free", "provider": "openrouter"},  # Microsoft Phi-4
        "avatar_url": "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=200&h=200&fit=crop"
    }
]

# ==================== AGENT FACTORY ====================
def create_agent(config: Dict) -> ConsultantAgent:
    """Factory function to create appropriate agent"""
    provider = config['model']['provider']

    if provider == 'openrouter':
        return OpenRouterAgent(
            name=config['name'],
            role=config['role'],
            specialty=config['specialty'],
            personality=config['personality'],
            model_config=config['model']
        )
    elif provider == 'groq':
        return GroqAgent(
            name=config['name'],
            role=config['role'],
            specialty=config['specialty'],
            personality=config['personality'],
            model_config=config['model']
        )
    elif provider == 'gemini':
        return GeminiAgent(
            name=config['name'],
            role=config['role'],
            specialty=config['specialty'],
            personality=config['personality'],
            model_config=config['model']
        )
    else:
        raise ValueError(f"Unknown provider: {provider}")

def get_all_agents() -> List[ConsultantAgent]:
    """Get all configured agents"""
    return [create_agent(config) for config in AGENT_CONFIGS]

def get_rate_limiter_status() -> Dict:
    """Get current rate limiter status for monitoring"""
    status = {}
    for provider, limiter in rate_limiters.items():
        with limiter.lock:
            now = time.time()
            minute_ago = now - 60
            hour_ago = now - 3600
            minute_calls = len([t for t in limiter.minute_calls[provider] if t > minute_ago])
            hour_calls = len([t for t in limiter.hour_calls[provider] if t > hour_ago])
            status[provider] = {
                'calls_last_minute': minute_calls,
                'calls_last_hour': hour_calls,
                'minute_limit': limiter.calls_per_minute,
                'hour_limit': limiter.calls_per_hour
            }
    return status
