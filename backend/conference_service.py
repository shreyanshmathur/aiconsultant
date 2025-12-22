from typing import List, Dict
import asyncio
from agents import get_all_agents, AGENT_CONFIGS

class ConferenceRoomService:
    """Service for orchestrating multi-agent debates"""
    
    def __init__(self):
        self.agents = get_all_agents()
        self.debate_rounds = 3
    
    async def conduct_debate(self, problem: str) -> Dict:
        """Conduct a full debate session with all agents"""
        debate_history = []
        
        for round_num in range(self.debate_rounds):
            round_arguments = []
            
            for agent in self.agents:
                previous_args = debate_history if round_num > 0 else None
                
                argument = agent.generate_response(problem, previous_args)
                
                round_arguments.append({
                    "agent": agent.name,
                    "role": agent.role,
                    "argument": argument,
                    "round": round_num + 1
                })
                
                await asyncio.sleep(0.5)
            
            debate_history.extend(round_arguments)
        
        consensus = self._synthesize_consensus(debate_history)
        
        return {
            "problem": problem,
            "debate_history": debate_history,
            "consensus": consensus,
            "total_rounds": self.debate_rounds
        }
    
    def _synthesize_consensus(self, debate_history: List[Dict]) -> Dict:
        """Synthesize consensus from debate history"""
        final_round = [arg for arg in debate_history if arg['round'] == self.debate_rounds]
        
        return {
            "summary": "Based on the multi-perspective analysis from our consulting team, here are the key insights:",
            "recommendations": [
                "Recommendation 1: Based on market analysis",
                "Recommendation 2: Based on technical feasibility",
                "Recommendation 3: Based on financial projections"
            ],
            "next_steps": [
                "Conduct detailed feasibility study",
                "Develop implementation roadmap",
                "Prepare stakeholder presentations"
            ]
        }
    
    def get_agent_info(self) -> List[Dict]:
        """Get information about all agents"""
        return AGENT_CONFIGS
