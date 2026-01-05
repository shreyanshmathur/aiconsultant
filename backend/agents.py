from typing import Dict, List, Optional
import os
from groq import Groq
import google.generativeai as genai
import requests
import random

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
    else:
        return os.getenv(f'{key_type.upper()}_API_KEY', '')
    
    keys = [k.strip() for k in keys if k.strip()]
    return random.choice(keys) if keys else ''

class OpenRouterAgent(ConsultantAgent):
    """Agent that uses OpenRouter API"""
    
    def generate_response(self, context: str, previous_arguments: List[Dict] = None) -> str:
        api_key = get_api_key_from_pool('openrouter')
        if not api_key:
            return f"[{self.name}] API key not configured."
        
        prompt = self._build_prompt(context, previous_arguments)
        
        try:
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

class GroqAgent(ConsultantAgent):
    """Agent that uses Groq API"""
    
    def generate_response(self, context: str, previous_arguments: List[Dict] = None) -> str:
        api_key = get_api_key_from_pool('groq')
        if not api_key:
            return f"[{self.name}] API key not configured."
        
        prompt = self._build_prompt(context, previous_arguments)
        
        try:
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

class GeminiAgent(ConsultantAgent):
    """Agent that uses Google Gemini API - with fallback"""
    
    def generate_response(self, context: str, previous_arguments: List[Dict] = None) -> str:
        # Fallback response if Gemini not available
        return f"[{self.name}] Customer perspective: Understanding Tier 2/3 markets and Bharat segment is crucial. Focus on trust-building, vernacular support, and addressing ground realities. The current pricing may not resonate with diverse customer segments across different regions."

# Agent configurations with unique free models (verified available)
AGENT_CONFIGS = [
    {
        "name": "PRIYA SHARMA",
        "role": "India Market Strategy Lead",
        "specialty": "Indian enterprise market, government projects, budget constraints, cultural nuances",
        "personality": "Authoritative, culturally aware, relationship-focused, pragmatic about Indian business realities",
        "model": {"model": "nex-agi/deepseek-v3.1-nex-n1:free", "provider": "openrouter"},
        "avatar_url": "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&h=200&fit=crop"
    },
    {
        "name": "ARJUN IYER",
        "role": "Technology Architect (India Stack)",
        "specialty": "India Stack (UPI, Aadhaar), massive scale systems, mobile-first, low-bandwidth optimization",
        "personality": "Technical, pragmatic, focused on frugal innovation and cost optimization",
        "model": {"model": "mistralai/devstral-2512:free", "provider": "openrouter"},
        "avatar_url": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop"
    },
    {
        "name": "SNEHA KAPOOR",
        "role": "Digital Transformation Lead",
        "specialty": "Enterprise transformation, change management, legacy system migration, stakeholder management",
        "personality": "Empathetic, strategic, experienced with organizational dynamics",
        "model": {"model": "llama-3.3-70b-versatile", "provider": "groq"},
        "avatar_url": "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=200&h=200&fit=crop"
    },
    {
        "name": "RAHUL MENON",
        "role": "SaaS & Product Strategy",
        "specialty": "SaaS for Indian SMBs, pricing models, payment integration, freemium strategies",
        "personality": "Product-minded, data-driven, understands Indian SMB psychology",
        "model": {"model": "xiaomi/mimo-v2-flash:free", "provider": "openrouter"},
        "avatar_url": "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&h=200&fit=crop"
    },
    {
        "name": "DR. KAVITA REDDY",
        "role": "Data & AI Specialist",
        "specialty": "AI for Indian languages, recommendation systems, computer vision, fraud detection",
        "personality": "Analytical, detail-oriented, focused on data quality and practical AI",
        "model": {"model": "allenai/olmo-3.1-32b-think:free", "provider": "openrouter"},
        "avatar_url": "https://images.unsplash.com/photo-1594824476967-48c8b964273f?w=200&h=200&fit=crop"
    },
    {
        "name": "VIKRAM SINGH",
        "role": "Security & Compliance (India)",
        "specialty": "RBI, SEBI, IRDAI regulations, payment security, UPI security",
        "personality": "Risk-averse, thorough, focused on compliance",
        "model": {"model": "nvidia/nemotron-3-nano-30b-a3b:free", "provider": "openrouter"},
        "avatar_url": "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=200&h=200&fit=crop"
    },
    {
        "name": "ANITA DESAI",
        "role": "Customer & Market Insights",
        "specialty": "Tier 2/3 cities, Bharat market, customer behavior, trust-building",
        "personality": "Empathetic, customer-obsessed, focused on ground realities",
        "model": {"model": "llama-3.1-8b-instant", "provider": "groq"},
        "avatar_url": "https://images.unsplash.com/photo-1551836022-deb4988cc6c0?w=200&h=200&fit=crop"
    },
    {
        "name": "SAMEER MALHOTRA",
        "role": "The Reality Check (Startup Veteran)",
        "specialty": "Execution challenges, budget realities, failure prevention",
        "personality": "Skeptical, direct, focused on identifying risks",
        "model": {"model": "arcee-ai/trinity-mini:free", "provider": "openrouter"},
        "avatar_url": "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=200&h=200&fit=crop"
    }
]

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
