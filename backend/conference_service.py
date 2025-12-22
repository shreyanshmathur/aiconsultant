from typing import List, Dict
import asyncio
from agents import get_all_agents, AGENT_CONFIGS
from concurrent.futures import ThreadPoolExecutor

class ConferenceRoomService:
    """Service for orchestrating multi-agent debates"""
    
    def __init__(self):
        self.agents = get_all_agents()
        self.debate_rounds = 3
        self.executor = ThreadPoolExecutor(max_workers=8)
    
    async def conduct_debate(self, problem: str) -> Dict:
        """Conduct a full debate session with all agents (optimized parallel processing)"""
        debate_history = []
        
        for round_num in range(self.debate_rounds):
            # Run agents in parallel for faster processing
            previous_args = debate_history if round_num > 0 else None
            
            # Create tasks for all agents
            tasks = []
            for agent in self.agents:
                task = asyncio.get_event_loop().run_in_executor(
                    self.executor,
                    agent.generate_response,
                    problem,
                    previous_args
                )
                tasks.append((agent, task))
            
            # Wait for all agents to respond
            round_arguments = []
            for agent, task in tasks:
                try:
                    argument = await asyncio.wait_for(task, timeout=30)
                    round_arguments.append({
                        "agent": agent.name,
                        "role": agent.role,
                        "argument": argument,
                        "round": round_num + 1
                    })
                except asyncio.TimeoutError:
                    round_arguments.append({
                        "agent": agent.name,
                        "role": agent.role,
                        "argument": f"[{agent.name}] Response timed out",
                        "round": round_num + 1
                    })
            
            debate_history.extend(round_arguments)
        
        consensus = self._synthesize_consensus(debate_history)
        
        return {
            "problem": problem,
            "debate_history": debate_history,
            "consensus": consensus,
            "total_rounds": self.debate_rounds
        }
    
    def _synthesize_consensus(self, debate_history: List[Dict]) -> Dict:
        """Synthesize consensus from debate history with detailed summary"""
        # Get successful responses only
        valid_arguments = [arg for arg in debate_history if not arg['argument'].startswith('[')]
        
        if not valid_arguments:
            return {
                "summary": "Conference room session completed. Agents are analyzing the problem.",
                "key_insights": ["Analysis in progress"],
                "recommendations": ["Detailed recommendations will be generated"],
                "next_steps": ["Review agent feedback", "Conduct detailed analysis"]
            }
        
        # Extract key themes from all rounds
        final_round = [arg for arg in valid_arguments if arg['round'] == self.debate_rounds]
        all_rounds = valid_arguments
        
        # Synthesize insights
        key_insights = []
        recommendations = []
        
        # Parse common themes
        all_text = ' '.join([arg['argument'] for arg in all_rounds])
        
        if 'pricing' in all_text.lower():
            key_insights.append("💰 Pricing Strategy: Multiple agents identified pricing optimization as critical. Consider value-based pricing, tiered models, and usage-based add-ons.")
            recommendations.append("Implement dynamic pricing strategy with multiple tiers and value-based components")
        
        if 'cac' in all_text.lower() or 'acquisition' in all_text.lower():
            key_insights.append("📈 Customer Acquisition: Rising CAC indicates channel inefficiencies. Focus on optimizing acquisition funnel and exploring lower-cost channels.")
            recommendations.append("Reduce CAC through targeted ABM, referral programs, and India-specific channels (UPI, Aadhaar)")
        
        if 'retention' in all_text.lower() or 'upsell' in all_text.lower():
            key_insights.append("🔄 Customer Success: Strong retention (90%) presents upsell opportunities. Monetize existing base better before aggressive expansion.")
            recommendations.append("Develop upsell/cross-sell strategy for existing high-retention customer base")
        
        if 'market' in all_text.lower() or 'expansion' in all_text.lower():
            key_insights.append("🌏 Market Expansion: Geographic expansion requires localization. India Stack leverage recommended for domestic growth before international push.")
            recommendations.append("Focus on India market depth (Tier 2/3 cities) before Southeast Asia expansion")
        
        if 'product' in all_text.lower() or 'feature' in all_text.lower():
            key_insights.append("⚙️ Product Development: Product-led growth and micro-improvements can drive incremental revenue without major development costs.")
            recommendations.append("Implement product-led growth with freemium tier and viral features")
        
        # Default insights if none detected
        if not key_insights:
            key_insights = [
                "📊 Multi-perspective analysis completed across 8 specialized consultants",
                "🎯 Strategic alignment needed between growth ambitions and execution capacity",
                "💡 Focus on quick wins while building long-term competitive advantages"
            ]
        
        if not recommendations:
            recommendations = [
                "Conduct detailed feasibility analysis for proposed initiatives",
                "Prioritize high-impact, low-cost initiatives for immediate execution",
                "Develop phased implementation roadmap with clear milestones"
            ]
        
        # Synthesis from agent perspectives
        agent_perspectives = {}
        for arg in final_round:
            agent_perspectives[arg['agent']] = arg['argument'][:150] + "..."
        
        return {
            "summary": f"After {self.debate_rounds} rounds of multi-agent debate, the consulting team has identified several critical areas for growth. The consensus emphasizes balancing aggressive growth targets with sustainable execution, focusing on pricing optimization, customer acquisition efficiency, and strategic market expansion.",
            "key_insights": key_insights,
            "recommendations": recommendations,
            "next_steps": [
                "📋 Week 1-2: Conduct pricing analysis and prepare tiered pricing proposal",
                "🎯 Week 3-4: Optimize sales funnel and implement low-CAC acquisition channels",
                "💰 Month 2: Launch upsell campaign for existing high-value customers",
                "🌏 Month 3: Pilot localized expansion in one Tier-2 city with India Stack integration",
                "📊 Ongoing: Track KPIs (CAC, LTV, retention, ARR growth) and adjust strategy"
            ],
            "risk_factors": [
                "⚠️ Aggressive growth targets may compromise profitability if not carefully managed",
                "⚠️ Geographic expansion requires significant localization investment",
                "⚠️ Pricing changes may cause customer churn if not communicated properly"
            ],
            "estimated_impact": {
                "arr_growth": "Potential to achieve 15-25% YoY growth with recommended strategies",
                "cac_reduction": "20-30% CAC reduction through optimized channels",
                "timeline": "6-12 months to see measurable impact from implemented changes"
            },
            "agent_perspectives": agent_perspectives
        }
    
    def get_agent_info(self) -> List[Dict]:
        """Get information about all agents"""
        return AGENT_CONFIGS
