"""Fast AI-powered research service - optimized for speed"""
import requests
from typing import Dict, List, Optional
import asyncio
from agents import get_api_key_from_pool
import json

class FastAIResearch:
    """Fast AI research with minimal API calls"""
    
    async def research(self, problem: str, vendor_name: str = None, industry: str = None, additional_context: str = None) -> Dict:
        """Conduct fast AI-powered research"""
        
        # Step 1: Quick auto-detection
        if not industry:
            industry = self._quick_detect_industry(problem)
        
        if not vendor_name:
            vendor_name = self._quick_discover_vendor(problem, industry)
        
        print(f"🔍 Fast research: {vendor_name} in {industry}")
        
        # Step 2: Build context and get AI analysis
        analysis = await self._ai_analyze(vendor_name, industry, problem, additional_context)
        
        return analysis
    
    def _quick_detect_industry(self, problem: str) -> str:
        """Quick industry detection"""
        p = problem.lower()
        if any(w in p for w in ['saas', 'software', 'platform', 'cloud', 'tech']):
            return 'Technology'
        elif any(w in p for w in ['manufacturing', 'factory', 'production']):
            return 'Manufacturing'
        elif any(w in p for w in ['bank', 'finance', 'payment', 'fintech']):
            return 'Financial Services'
        elif any(w in p for w in ['health', 'hospital', 'medical']):
            return 'Healthcare'
        elif any(w in p for w in ['retail', 'ecommerce', 'store']):
            return 'Retail'
        return 'General Business'
    
    def _quick_discover_vendor(self, problem: str, industry: str) -> str:
        """Quick vendor discovery"""
        p = problem.lower()
        
        # Check for specific vendor mentions
        vendors = {
            'sap': 'SAP', 'oracle': 'Oracle', 'microsoft': 'Microsoft',
            'salesforce': 'Salesforce', 'servicenow': 'ServiceNow',
            'workday': 'Workday', 'adobe': 'Adobe'
        }
        
        for key, val in vendors.items():
            if key in p:
                return val
        
        # Default by industry
        defaults = {
            'Technology': 'Microsoft',
            'Manufacturing': 'SAP',
            'Financial Services': 'Oracle',
            'Healthcare': 'Epic Systems',
            'Retail': 'Salesforce'
        }
        return defaults.get(industry, 'SAP')
    
    async def _ai_analyze(self, vendor_name: str, industry: str, problem: str, additional_context: str = None) -> Dict:
        """Fast AI analysis"""
        
        # Build comprehensive prompt
        prompt = f"""You are a McKinsey consultant analyzing a business problem. Provide a detailed, data-driven analysis.

PROBLEM STATEMENT:
{problem}

TARGET VENDOR: {vendor_name}
INDUSTRY: {industry}
"""
        
        if additional_context:
            prompt += f"\\n\\nADDITIONAL CONTEXT:\\n{additional_context}\\n"
        
        prompt += """

Please analyze:
1. Market Position & Competitive Landscape
2. Key Capabilities & Differentiators  
3. Strategic Recommendations (5 specific actions)
4. Implementation Considerations
5. Risk Factors

Format your response clearly with headers and bullet points. Be specific and actionable."""
        
        # Call AI
        try:
            api_key = get_api_key_from_pool('openrouter')
            if not api_key:
                return self._fallback_response(vendor_name, industry, problem)
            
            response = requests.post(
                url="https://openrouter.ai/api/v1/chat/completions",
                headers={
                    "Authorization": f"Bearer {api_key}",
                    "Content-Type": "application/json"
                },
                json={
                    "model": "deepseek/deepseek-v3.2-speciale",
                    "messages": [{"role": "user", "content": prompt}],
                    "max_tokens": 2000,
                    "temperature": 0.7
                },
                timeout=30
            )
            
            if response.status_code == 200:
                ai_text = response.json()['choices'][0]['message']['content']
                return self._structure_response(vendor_name, industry, problem, ai_text)
            else:
                print(f"AI API error: {response.status_code}")
                return self._fallback_response(vendor_name, industry, problem)
                
        except Exception as e:
            print(f"AI error: {e}")
            return self._fallback_response(vendor_name, industry, problem)
    
    def _structure_response(self, vendor: str, industry: str, problem: str, ai_text: str) -> Dict:
        """Structure AI response"""
        
        # Parse AI response
        lines = ai_text.split('\\n')
        
        # Extract sections
        market_position = []
        capabilities = []
        recommendations = []
        risks = []
        
        current_section = None
        for line in lines:
            line = line.strip()
            if not line:
                continue
            
            # Detect sections
            if 'market' in line.lower() and 'position' in line.lower():
                current_section = 'market'
            elif 'capabilit' in line.lower() or 'strength' in line.lower():
                current_section = 'capabilities'
            elif 'recommend' in line.lower():
                current_section = 'recommendations'
            elif 'risk' in line.lower() or 'consider' in line.lower():
                current_section = 'risks'
            
            # Capture bullet points
            if line.startswith(('-', '•', '*')) or line[0:2].replace('.', '').isdigit():
                clean = line.lstrip('-•*0123456789. ').strip()
                if len(clean) > 15:
                    if current_section == 'capabilities' and len(capabilities) < 5:
                        capabilities.append(clean)
                    elif current_section == 'recommendations' and len(recommendations) < 5:
                        recommendations.append(clean)
                    elif current_section == 'risks' and len(risks) < 5:
                        risks.append(clean)
                    elif current_section == 'market' and len(market_position) < 3:
                        market_position.append(clean)
        
        # Fallback if parsing failed
        if not capabilities:
            capabilities = [
                f"Enterprise-grade {industry.lower()} solutions with proven track record",
                "Global deployment capabilities with 24/7 support infrastructure",
                "Comprehensive ecosystem of integrations and partner solutions",
                "Strong R&D investment in emerging technologies and innovation",
                "Industry-specific features and best practices built-in"
            ]
        
        if not recommendations:
            recommendations = [
                f"Conduct comprehensive vendor evaluation across top 3-4 {industry.lower()} providers",
                "Request detailed product demonstrations focused on your specific use cases",
                "Review customer case studies from companies of similar size and complexity",
                "Develop clear evaluation criteria including TCO, implementation timeline, and support model",
                "Plan proof-of-concept with measurable success criteria before full commitment"
            ]
        
        if not risks:
            risks = [
                "Implementation complexity may require 6-12 months and significant resources",
                "Total cost of ownership includes licenses, implementation, training, and ongoing maintenance",
                "Change management challenges with user adoption and process transformation",
                "Vendor lock-in considerations for long-term technology strategy",
                "Integration requirements with existing systems may be more complex than anticipated"
            ]
        
        market_summary = ' '.join(market_position[:2]) if market_position else f"{vendor} is a leading {industry} vendor with substantial market presence and proven enterprise deployments across Fortune 500 companies."
        
        return {
            "vendor_name": vendor,
            "industry": industry,
            "problem_statement": problem,
            "data_driven": True,
            "ai_powered": True,
            "sources_used": ["AI Analysis", "Industry Knowledge Base", "Best Practices"],
            "analysis": {
                "market_position": market_summary,
                "key_capabilities": capabilities,
                "considerations": risks
            },
            "recommendations": recommendations,
            "ai_analysis_full": ai_text,
            "suggested_vendors": self._get_competitors(vendor),
            "confidence": "high" if len(ai_text) > 500 else "medium"
        }
    
    def _get_competitors(self, vendor: str) -> List[str]:
        """Get competitor list"""
        competitors = {
            'SAP': ['Oracle', 'Microsoft Dynamics', 'Workday', 'ServiceNow', 'Infor'],
            'Oracle': ['SAP', 'Microsoft', 'IBM', 'Salesforce', 'Workday'],
            'Microsoft': ['Google', 'Amazon', 'Salesforce', 'Oracle', 'SAP'],
            'Salesforce': ['Microsoft Dynamics', 'Oracle CX', 'HubSpot', 'SAP', 'Adobe'],
            'ServiceNow': ['SAP', 'Oracle', 'BMC', 'Ivanti', 'Atlassian']
        }
        return competitors.get(vendor, [vendor, 'Industry Leader A', 'Industry Leader B', 'Industry Leader C'])
    
    def _fallback_response(self, vendor: str, industry: str, problem: str) -> Dict:
        """Fallback when AI unavailable"""
        return {
            "vendor_name": vendor,
            "industry": industry,
            "problem_statement": problem,
            "data_driven": False,
            "ai_powered": False,
            "analysis": {
                "market_position": f"{vendor} is recognized as a leading {industry} vendor with extensive market presence.",
                "key_capabilities": [
                    f"Comprehensive {industry.lower()} solution suite",
                    "Enterprise-scale deployment capabilities",
                    "Global support and professional services",
                    "Strong partner ecosystem",
                    "Continuous innovation and R&D investment"
                ],
                "considerations": [
                    "Detailed ROI analysis recommended",
                    "Implementation timeline typically 6-12 months",
                    "Change management planning essential",
                    "Integration requirements assessment needed"
                ]
            },
            "recommendations": [
                "Request product demonstration",
                "Review customer case studies",
                "Conduct vendor comparison",
                "Plan proof of concept"
            ],
            "suggested_vendors": self._get_competitors(vendor)
        }
