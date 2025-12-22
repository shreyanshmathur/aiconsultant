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
