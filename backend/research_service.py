import requests
from bs4 import BeautifulSoup
from typing import Dict, List, Optional
import asyncio
from urllib.parse import urljoin, urlparse
import re

class ResearchService:
    """Service for conducting deep research on companies, competitors, and markets"""
    
    def __init__(self):
        self.headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
    
    async def auto_discover_vendors(self, query: str, industry: str = None) -> List[Dict]:
        """Auto-discover relevant vendors based on query"""
        vendors = []
        
        # Add industry-specific vendor suggestions
        vendor_database = {
            'erp': ['SAP', 'Oracle', 'Microsoft Dynamics', 'Workday', 'Infor'],
            'crm': ['Salesforce', 'HubSpot', 'Microsoft Dynamics', 'Zoho', 'Pipedrive'],
            'cloud': ['AWS', 'Azure', 'Google Cloud', 'Oracle Cloud', 'IBM Cloud'],
            'hr': ['Workday', 'SAP SuccessFactors', 'Oracle HCM', 'ADP', 'BambooHR'],
            'marketing': ['HubSpot', 'Marketo', 'Adobe Marketing Cloud', 'Salesforce Marketing Cloud'],
            'analytics': ['Tableau', 'Power BI', 'Qlik', 'Looker', 'Sisense']
        }
        
        # Try to detect industry from query
        query_lower = query.lower()
        detected_industry = None
        
        for key, vendor_list in vendor_database.items():
            if key in query_lower or (industry and key in industry.lower()):
                detected_industry = key
                vendors = [{'name': v, 'category': key, 'confidence': 'high'} for v in vendor_list]
                break
        
        # If no specific match, return general enterprise software vendors
        if not vendors:
            vendors = [
                {'name': 'SAP', 'category': 'Enterprise Software', 'confidence': 'medium'},
                {'name': 'Oracle', 'category': 'Enterprise Software', 'confidence': 'medium'},
                {'name': 'Microsoft', 'category': 'Enterprise Software', 'confidence': 'medium'},
                {'name': 'Salesforce', 'category': 'Cloud CRM', 'confidence': 'medium'},
                {'name': 'ServiceNow', 'category': 'Workflow Automation', 'confidence': 'medium'}
            ]
        
        return vendors
    
    async def auto_detect_industry(self, query: str) -> Dict:
        """Auto-detect industry from problem statement"""
        industries_keywords = {
            'Financial Services': ['bank', 'finance', 'trading', 'investment', 'insurance', 'fintech'],
            'Healthcare': ['health', 'medical', 'hospital', 'patient', 'pharma', 'clinical'],
            'Retail & E-commerce': ['retail', 'ecommerce', 'shopping', 'store', 'merchandise'],
            'Manufacturing': ['manufacturing', 'production', 'factory', 'supply chain', 'automotive'],
            'Technology': ['software', 'saas', 'tech', 'digital', 'cloud', 'it'],
            'Energy & Utilities': ['energy', 'power', 'utilities', 'oil', 'gas', 'renewable'],
            'Telecommunications': ['telecom', 'mobile', 'network', '5g', 'connectivity'],
            'Professional Services': ['consulting', 'legal', 'accounting', 'audit', 'advisory']
        }
        
        query_lower = query.lower()
        detected = []
        
        for industry, keywords in industries_keywords.items():
            for keyword in keywords:
                if keyword in query_lower:
                    detected.append({
                        'industry': industry,
                        'confidence': 'high' if keyword in query_lower[:100] else 'medium',
                        'keyword_matched': keyword
                    })
                    break
        
        if not detected:
            return {
                'industry': 'General Business',
                'confidence': 'low',
                'suggestion': 'Please specify your industry for better analysis'
            }
        
        # Return highest confidence match
        return detected[0] if detected else {'industry': 'General Business', 'confidence': 'low'}
    
    async def conduct_vendor_analysis(self, problem: str, vendor_name: str = None, industry: str = None, additional_context: str = None) -> Dict:
        """Conduct comprehensive vendor analysis with optional file context"""
        
        # Combine problem with additional context from uploaded files
        full_context = problem
        if additional_context:
            full_context += f"\n\nAdditional Context from Uploaded Files:\n{additional_context}"
        
        # Auto-detect industry if not provided
        if not industry:
            industry_data = await self.auto_detect_industry(full_context)
            industry = industry_data.get('industry', 'General Business')
        
        # Auto-discover vendors if not provided
        if not vendor_name:
            vendors = await self.auto_discover_vendors(full_context, industry)
            vendor_name = vendors[0]['name'] if vendors else 'Unknown'
            suggested_vendors = [v['name'] for v in vendors[:5]]
        else:
            suggested_vendors = [vendor_name]
        
        results = {
            "vendor_name": vendor_name,
            "industry": industry,
            "suggested_vendors": suggested_vendors,
            "problem_statement": problem,
            "has_additional_context": bool(additional_context),
            "analysis": {
                "market_position": f"{vendor_name} is a leading player in the {industry} sector with strong market presence and proven track record in enterprise deployments.",
                "key_capabilities": [
                    f"Enterprise-grade solutions tailored for {industry}",
                    "Global customer base with 24/7 support infrastructure",
                    "Proven track record in digital transformation initiatives",
                    "Strong integration ecosystem with third-party tools",
                    "Comprehensive training and implementation support"
                ],
                "considerations": [
                    "Implementation complexity - typically 3-6 months for mid-size deployments",
                    "Total cost of ownership including licenses, implementation, and training",
                    "Integration requirements with existing systems",
                    "Change management and user adoption challenges",
                    "Vendor lock-in and long-term commitment considerations"
                ]
            },
            "competitors": await self._find_competitors(vendor_name, industry),
            "recommendations": [
                f"✓ Evaluate {vendor_name} alongside 2-3 competitors for comprehensive comparison",
                "✓ Conduct proof of concept (POC) before full deployment commitment",
                "✓ Assess vendor's industry-specific expertise and case studies",
                "✓ Review customer references in similar company size and geography",
                "✓ Negotiate flexible terms with clear exit clauses",
                "✓ Plan for 20-30% budget buffer for unforeseen implementation costs"
            ]
        }
        
        return results
    
    async def _find_competitors(self, vendor_name: str, industry: str) -> List[Dict]:
        """Find competitors in the same space"""
        # Industry-specific competitor mapping
        competitor_map = {
            'SAP': ['Oracle', 'Microsoft Dynamics', 'Workday', 'Infor'],
            'Oracle': ['SAP', 'Microsoft', 'IBM', 'Salesforce'],
            'Salesforce': ['Microsoft Dynamics', 'Oracle CX', 'HubSpot', 'SAP'],
            'Microsoft': ['Google', 'Amazon', 'Salesforce', 'Oracle'],
            'Workday': ['SAP SuccessFactors', 'Oracle HCM', 'ADP', 'Ultimate Software']
        }
        
        competitors = competitor_map.get(vendor_name, ['Industry leading alternatives'])
        
        return [
            {
                'name': comp,
                'relationship': 'Direct competitor',
                'market_overlap': 'High',
                'differentiators': f"Strong presence in {industry} sector"
            } for comp in competitors[:4]
        ]
    
    async def search_public_information(self, query: str) -> Dict:
        """Search for public information on a topic"""
        return {
            "query": query,
            "sources": [
                "Company websites",
                "Industry reports",
                "News articles",
                "Financial databases"
            ],
            "note": "For production, integrate with APIs like OpenCorporates, Alpha Vantage, etc."
        }
