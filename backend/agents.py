from typing import Dict, List, Optional
import os
from groq import Groq
import google.generativeai as genai
import requests

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

class OpenRouterAgent(ConsultantAgent):
    """Agent that uses OpenRouter API"""
    
    def generate_response(self, context: str, previous_arguments: List[Dict] = None) -> str:
        api_key = os.getenv('OPENROUTER_API_KEY', '')
        if not api_key:
            return f"[{self.name}] API key not configured. Please add OPENROUTER_API_KEY to settings."
        
        prompt = self._build_prompt(context, previous_arguments)
        
        try:
            response = requests.post(
                url="https://openrouter.ai/api/v1/chat/completions",
                headers={
                    "Authorization": f"Bearer {api_key}",
                },
                json={
                    "model": self.model_config['model'],
                    "messages": [{"role": "user", "content": prompt}],
                    "max_tokens": 800,
                    "temperature": 0.7
                }
            )
            response.raise_for_status()
            return response.json()['choices'][0]['message']['content']
        except Exception as e:
            return f"[{self.name}] Error: {str(e)}"
    
    def _build_prompt(self, context: str, previous_arguments: List[Dict] = None) -> str:
        prompt = f"""You are {self.name}, a {self.role}.

Personality: {self.personality}
Specialty: {self.specialty}

Problem Context:
{context}
"""
        if previous_arguments:
            prompt += "\n\nPrevious Arguments from Other Consultants:\n"
            for arg in previous_arguments:
                prompt += f"\n{arg['agent']}: {arg['argument']}\n"
            prompt += "\nRespond to these arguments and provide your perspective. Be direct, professional, and use consulting frameworks when relevant."
        else:
            prompt += "\nProvide your initial analysis and recommendation. Be concise (max 150 words)."
        
        return prompt

class GroqAgent(ConsultantAgent):
    """Agent that uses Groq API"""
    
    def generate_response(self, context: str, previous_arguments: List[Dict] = None) -> str:
        api_key = os.getenv('GROQ_API_KEY', '')
        if not api_key:
            return f"[{self.name}] API key not configured. Please add GROQ_API_KEY to settings."
        
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
            return f"[{self.name}] Error: {str(e)}"
    
    def _build_prompt(self, context: str, previous_arguments: List[Dict] = None) -> str:
        prompt = f"""You are {self.name}, a {self.role}.

Personality: {self.personality}
Specialty: {self.specialty}

Problem Context:
{context}
"""
        if previous_arguments:
            prompt += "\n\nPrevious Arguments from Other Consultants:\n"
            for arg in previous_arguments:
                prompt += f"\n{arg['agent']}: {arg['argument']}\n"
            prompt += "\nRespond to these arguments and provide your perspective. Be direct and professional."
        else:
            prompt += "\nProvide your initial analysis. Be concise (max 150 words)."
        
        return prompt

class GeminiAgent(ConsultantAgent):
    """Agent that uses Google Gemini API"""
    
    def generate_response(self, context: str, previous_arguments: List[Dict] = None) -> str:
        api_key = os.getenv('GEMINI_API_KEY', '')
        if not api_key:
            return f"[{self.name}] API key not configured. Please add GEMINI_API_KEY to settings."
        
        prompt = self._build_prompt(context, previous_arguments)
        
        try:
            genai.configure(api_key=api_key)
            model = genai.GenerativeModel(self.model_config['model'])
            response = model.generate_content(prompt)
            return response.text
        except Exception as e:
            return f"[{self.name}] Error: {str(e)}"
    
    def _build_prompt(self, context: str, previous_arguments: List[Dict] = None) -> str:
        prompt = f"""You are {self.name}, a {self.role}.

Personality: {self.personality}
Specialty: {self.specialty}

Problem Context:
{context}
"""
        if previous_arguments:
            prompt += "\n\nPrevious Arguments from Other Consultants:\n"
            for arg in previous_arguments:
                prompt += f"\n{arg['agent']}: {arg['argument']}\n"
            prompt += "\nProvide your customer-focused perspective on these arguments."
        else:
            prompt += "\nProvide your analysis from a customer and market perspective. Be concise (max 150 words)."
        
        return prompt

# Agent configurations based on the document
AGENT_CONFIGS = [
    {
        "name": "PRIYA SHARMA",
        "role": "India Market Strategy Lead",
        "specialty": "Indian enterprise market, government projects, budget constraints, cultural nuances",
        "personality": "Authoritative, culturally aware, relationship-focused, pragmatic about Indian business realities",
        "model": {"model": "qwen/qwen-3-235b-a22b", "provider": "openrouter"},
        "avatar_url": "https://images.unsplash.com/photo-1758599543120-4e462429a4d7?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDQ2NDN8MHwxfHNlYXJjaHwxfHxidXNpbmVzcyUyMHdvbWFuJTIwcG9ydHJhaXQlMjBjb3Jwb3JhdGUlMjBoZWFkc2hvdHxlbnwwfHx8fDE3NjYzOTQ1MTV8MA&ixlib=rb-4.1.0&q=85"
    },
    {
        "name": "ARJUN IYER",
        "role": "Technology Architect (India Stack)",
        "specialty": "India Stack (UPI, Aadhaar), massive scale systems, mobile-first, low-bandwidth optimization",
        "personality": "Technical, pragmatic, focused on frugal innovation and cost optimization",
        "model": {"model": "deepseek/deepseek-chat", "provider": "openrouter"},
        "avatar_url": "https://images.unsplash.com/photo-1762522927402-f390672558d8?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2NjZ8MHwxfHNlYXJjaHwxfHxidXNpbmVzcyUyMG1hbiUyMHBvcnRyYWl0JTIwY29ycG9yYXRlJTIwaGVhZHNob3R8ZW58MHx8fHwxNzY2Mzk0NTE2fDA&ixlib=rb-4.1.0&q=85"
    },
    {
        "name": "SNEHA KAPOOR",
        "role": "Digital Transformation Lead",
        "specialty": "Enterprise transformation, change management, legacy system migration, stakeholder management",
        "personality": "Empathetic, strategic, experienced with organizational dynamics and resistance to change",
        "model": {"model": "llama-3.3-70b-versatile", "provider": "groq"},
        "avatar_url": "https://images.unsplash.com/photo-1762522926984-e721bff0d6c6?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDQ2NDN8MHwxfHNlYXJjaHwyfHxidXNpbmVzcyUyMHdvbWFuJTIwcG9ydHJhaXQlMjBjb3Jwb3JhdGUlMjBoZWFkc2hvdHxlbnwwfHx8fDE3NjYzOTQ1MTV8MA&ixlib=rb-4.1.0&q=85"
    },
    {
        "name": "RAHUL MENON",
        "role": "SaaS & Product Strategy",
        "specialty": "SaaS for Indian SMBs, pricing models, payment integration, freemium strategies",
        "personality": "Product-minded, data-driven, understands Indian SMB psychology and constraints",
        "model": {"model": "mistralai/mistral-small-2501", "provider": "openrouter"},
        "avatar_url": "https://images.unsplash.com/photo-1762522926157-bcc04bf0b10a?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2NjZ8MHwxfHNlYXJjaHwyfHxidXNpbmVzcyUyMG1hbiUyMHBvcnRyYWl0JTIwY29ycG9yYXRlJTIwaGVhZHNob3R8ZW58MHx8fHwxNzY2Mzk0NTE2fDA&ixlib=rb-4.1.0&q=85"
    },
    {
        "name": "DR. KAVITA REDDY",
        "role": "Data & AI Specialist",
        "specialty": "AI for Indian languages, recommendation systems, computer vision, fraud detection",
        "personality": "Analytical, detail-oriented, focused on data quality and practical AI applications",
        "model": {"model": "qwen/qwen-3-coder-480b-a35b", "provider": "openrouter"},
        "avatar_url": "https://images.unsplash.com/photo-1762505464553-1f4eb1578f23?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDQ2NDN8MHwxfHNlYXJjaHwzfHxidXNpbmVzcyUyMHdvbWFuJTIwcG9ydHJhaXQlMjBjb3Jwb3JhdGUlMjBoZWFkc2hvdHxlbnwwfHx8fDE3NjYzOTQ1MTV8MA&ixlib=rb-4.1.0&q=85"
    },
    {
        "name": "VIKRAM SINGH",
        "role": "Security & Compliance (India)",
        "specialty": "RBI, SEBI, IRDAI regulations, payment security, UPI security, Aadhaar compliance",
        "personality": "Risk-averse, thorough, focused on compliance and security implications",
        "model": {"model": "nousresearch/hermes-3-llama-3.1-405b", "provider": "openrouter"},
        "avatar_url": "https://images.unsplash.com/photo-1568585105565-e372998a195d?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2NjZ8MHwxfHNlYXJjaHwzfHxidXNpbmVzcyUyMG1hbiUyMHBvcnRyYWl0JTIwY29ycG9yYXRlJTIwaGVhZHNob3R8ZW58MHx8fHwxNzY2Mzk0NTE2fDA&ixlib=rb-4.1.0&q=85"
    },
    {
        "name": "ANITA DESAI",
        "role": "Customer & Market Insights",
        "specialty": "Tier 2/3 cities, Bharat market, customer behavior, trust-building, language barriers",
        "personality": "Empathetic, customer-obsessed, focused on ground realities and customer psychology",
        "model": {"model": "gemini-2.0-flash-exp", "provider": "gemini"},
        "avatar_url": "https://images.unsplash.com/photo-1758691737587-7630b4d31d16?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDQ2NDN8MHwxfHNlYXJjaHw0fHxidXNpbmVzcyUyMHdvbWFuJTIwcG9ydHJhaXQlMjBjb3Jwb3JhdGUlMjBoZWFkc2hvdHxlbnwwfHx8fDE3NjYzOTQ1MTV8MA&ixlib=rb-4.1.0&q=85"
    },
    {
        "name": "SAMEER MALHOTRA",
        "role": "The Reality Check (Startup Veteran)",
        "specialty": "Execution challenges, budget realities, failure prevention, practical constraints",
        "personality": "Skeptical, direct, focused on identifying risks and preventing failures",
        "model": {"model": "meta-llama/llama-3.3-70b-instruct", "provider": "openrouter"},
        "avatar_url": "https://images.unsplash.com/photo-1758518729314-b02874db8c37?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2NjZ8MHwxfHNlYXJjaHw0fHxidXNpbmVzcyUyMG1hbiUyMHBvcnRyYWl0JTIwY29ycG9yYXRlJTIwaGVhZHNob3R8ZW58MHx8fHwxNzY2Mzk0NTE2fDA&ixlib=rb-4.1.0&q=85"
    }
]

def create_agent(config: Dict) -> ConsultantAgent:
    """Factory function to create appropriate agent based on provider"""
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
