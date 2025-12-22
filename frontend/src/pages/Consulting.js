import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'framer-motion';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Progress } from '../components/ui/progress';
import { Loader2, Download, ArrowLeft, Users, MessageSquare, Lightbulb, Target, AlertTriangle, Clock } from 'lucide-react';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export default function Consulting() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [stage, setStage] = useState('form');
  const [projectId, setProjectId] = useState(null);
  const [agents, setAgents] = useState([]);
  const [formData, setFormData] = useState({ title: '', problem: '' });
  const [debateData, setDebateData] = useState(null);
  const [progress, setProgress] = useState(0);

  useEffect(() => { fetchAgents(); }, []);

  const fetchAgents = async () => {
    try {
      const response = await axios.get(`${API}/agents`);
      setAgents(response.data);
    } catch (error) {
      console.error('Failed to fetch agents:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStage('debate');
    setProgress(10);

    try {
      const projectResponse = await axios.post(`${API}/projects`, {
        title: formData.title,
        problem_statement: formData.problem,
        project_type: 'full_consulting'
      }, { withCredentials: true });

      const newProjectId = projectResponse.data.id;
      setProjectId(newProjectId);
      setProgress(30);

      const debateResponse = await axios.post(`${API}/conference/debate`, {
        project_id: newProjectId,
        problem: formData.problem
      }, { withCredentials: true });

      setDebateData(debateResponse.data);
      setProgress(100);
      setStage('results');
      toast.success('Conference room debate completed!');
    } catch (error) {
      toast.error('Consultation failed. Please try again.');
      setStage('form');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateDeliverables = async () => {
    try {
      setLoading(true);

      await axios.post(`${API}/deliverables/excel`, {
        project_id: projectId,
        deliverable_type: 'current_state',
        content: {
          problem: formData.problem,
          findings: debateData?.consensus?.recommendations || []
        }
      });

      await axios.post(`${API}/deliverables/excel`, {
        project_id: projectId,
        deliverable_type: 'future_state',
        content: {
          problem: formData.problem,
          solution: debateData?.consensus?.summary || '',
          roadmap: debateData?.consensus?.next_steps || []
        }
      });

      await axios.post(`${API}/deliverables/ppt`, {
        project_id: projectId,
        deliverable_type: 'presentation',
        content: {
          title: formData.title,
          text: `Problem: ${formData.problem}\n\nConsensus: ${debateData?.consensus?.summary || ''}\n\nRecommendations:\n${debateData?.consensus?.recommendations?.join('\n') || ''}`
        }
      });

      toast.success('All deliverables generated!');
      navigate('/deliverables');
    } catch (error) {
      toast.error('Failed to generate deliverables');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Button variant="ghost" onClick={() => navigate('/dashboard')} className="mb-6" data-testid="back-button">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Dashboard
        </Button>

        <div className="max-w-6xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-lg">
                <Users className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold gradient-text">Conference Room</h1>
                <p className="text-muted-foreground">8 AI consultants debating your challenge</p>
              </div>
            </div>
          </motion.div>

          {stage === 'form' && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <Card className="glass-card p-8 max-w-2xl">
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <Label className="text-base font-medium">Project Title *</Label>
                    <Input
                      value={formData.title}
                      onChange={(e) => setFormData({...formData, title: e.target.value})}
                      placeholder="e.g., Digital Transformation Strategy"
                      required
                      className="mt-2 input-glass"
                      data-testid="project-title-input"
                    />
                  </div>

                  <div>
                    <Label className="text-base font-medium">Problem Statement *</Label>
                    <Textarea
                      value={formData.problem}
                      onChange={(e) => setFormData({...formData, problem: e.target.value})}
                      placeholder="Describe your business challenge in detail..."
                      rows={6}
                      required
                      className="mt-2 input-glass"
                      data-testid="problem-statement-input"
                    />
                  </div>

                  <Button type="submit" disabled={loading} size="lg" className="btn-primary w-full" data-testid="start-consulting-button">
                    <Users className="w-5 h-5 mr-2" />
                    Enter Conference Room
                  </Button>
                </form>
              </Card>
            </motion.div>
          )}

          {stage === 'debate' && (
            <div className="space-y-8">
              <Card className="glass-card p-8" data-testid="debate-progress">
                <h2 className="text-2xl font-bold mb-4 gradient-text">Conference Room in Session</h2>
                <p className="text-muted-foreground mb-6">
                  8 consultant agents are analyzing your problem and debating solutions...
                </p>
                <Progress value={progress} className="mb-4 h-3" />
                <p className="text-sm text-muted-foreground">{progress}% complete</p>
              </Card>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {agents.slice(0, 8).map((agent, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: idx * 0.1 }}
                  >
                    <Card className="glass-card p-4 text-center hover-lift">
                      <div className="w-16 h-16 rounded-full mx-auto mb-3 overflow-hidden bg-gradient-to-br from-primary/20 to-purple-500/20">
                        <img src={agent.avatar_url} alt={agent.name} className="w-full h-full object-cover" />
                      </div>
                      <h3 className="font-semibold text-sm mb-1 truncate">{agent.name}</h3>
                      <p className="text-xs text-muted-foreground truncate">{agent.role}</p>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {stage === 'results' && debateData && (
            <div className="space-y-6">
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                <Card className="glass-card p-8" data-testid="debate-results">
                  <h2 className="text-2xl font-bold mb-6 gradient-text">Strategic Analysis Complete</h2>
                  
                  {/* Executive Summary */}
                  <div className="p-6 glass-card bg-gradient-to-r from-blue-500/10 to-purple-500/10 mb-8">
                    <h3 className="font-bold text-lg mb-3 flex items-center gap-2">
                      <Target className="w-5 h-5 text-primary" />
                      Executive Summary
                    </h3>
                    <p className="text-muted-foreground leading-relaxed">{debateData.consensus?.summary}</p>
                  </div>

                  {/* Key Insights */}
                  {debateData.consensus?.key_insights && (
                    <div className="mb-8">
                      <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                        <Lightbulb className="w-5 h-5 text-amber-500" />
                        Key Insights
                      </h3>
                      <div className="space-y-3">
                        {debateData.consensus.key_insights.map((insight, idx) => (
                          <div key={idx} className="p-4 rounded-xl bg-amber-500/10 border-l-4 border-amber-500">
                            <p>{insight}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Recommendations */}
                  {debateData.consensus?.recommendations && (
                    <div className="mb-8">
                      <h3 className="font-bold text-lg mb-4">Strategic Recommendations</h3>
                      <div className="grid md:grid-cols-2 gap-4">
                        {debateData.consensus.recommendations.map((rec, idx) => (
                          <div key={idx} className="p-4 glass-card bg-emerald-500/5 border-emerald-500/20">
                            <div className="flex items-start gap-3">
                              <div className="w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center flex-shrink-0 text-sm font-bold">
                                {idx + 1}
                              </div>
                              <p className="text-muted-foreground flex-1">{rec}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Next Steps */}
                  {debateData.consensus?.next_steps && (
                    <div className="mb-8">
                      <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                        <Clock className="w-5 h-5 text-blue-500" />
                        Implementation Timeline
                      </h3>
                      <div className="space-y-3">
                        {debateData.consensus.next_steps.map((step, idx) => (
                          <div key={idx} className="flex items-start gap-4 p-4 glass-card">
                            <p className="text-muted-foreground flex-1">{step}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Risk Factors */}
                  {debateData.consensus?.risk_factors && (
                    <div className="mb-8">
                      <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                        <AlertTriangle className="w-5 h-5 text-red-500" />
                        Risk Factors
                      </h3>
                      <div className="space-y-2">
                        {debateData.consensus.risk_factors.map((risk, idx) => (
                          <div key={idx} className="p-4 rounded-xl bg-red-500/10 border-l-4 border-red-400">
                            <p className="text-muted-foreground">{risk}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Estimated Impact */}
                  {debateData.consensus?.estimated_impact && (
                    <div className="p-6 glass-card bg-gradient-to-r from-purple-500/10 to-pink-500/10">
                      <h3 className="font-bold text-lg mb-4">Estimated Impact</h3>
                      <div className="grid md:grid-cols-3 gap-4">
                        <div className="text-center p-4">
                          <div className="text-3xl mb-2">📈</div>
                          <div className="text-sm text-muted-foreground mb-1">ARR Growth</div>
                          <div className="font-semibold">{debateData.consensus.estimated_impact.arr_growth}</div>
                        </div>
                        <div className="text-center p-4">
                          <div className="text-3xl mb-2">💰</div>
                          <div className="text-sm text-muted-foreground mb-1">CAC Reduction</div>
                          <div className="font-semibold">{debateData.consensus.estimated_impact.cac_reduction}</div>
                        </div>
                        <div className="text-center p-4">
                          <div className="text-3xl mb-2">⏰</div>
                          <div className="text-sm text-muted-foreground mb-1">Timeline</div>
                          <div className="font-semibold">{debateData.consensus.estimated_impact.timeline}</div>
                        </div>
                      </div>
                    </div>
                  )}
                </Card>
              </motion.div>

              {/* Debate Transcript */}
              <Card className="glass-card p-8" data-testid="debate-transcript">
                <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 text-primary" />
                  Debate Transcript
                </h2>
                <div className="space-y-4 max-h-96 overflow-y-auto custom-scrollbar">
                  {debateData.debate_history?.map((entry, idx) => {
                    const agent = agents.find(a => a.name === entry.agent);
                    return (
                      <div key={idx} className="flex gap-4 p-3 rounded-xl hover:bg-muted/30 transition-colors">
                        <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0 bg-gradient-to-br from-primary/20 to-purple-500/20">
                          {agent && <img src={agent.avatar_url} alt={agent.name} className="w-full h-full object-cover" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-semibold text-sm mb-1">
                            {entry.agent}
                            <span className="text-xs text-muted-foreground ml-2">Round {entry.round}</span>
                          </div>
                          <p className="text-sm text-muted-foreground">{entry.argument}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </Card>

              <div className="flex flex-wrap gap-4">
                <Button onClick={handleGenerateDeliverables} disabled={loading} size="lg" className="btn-primary" data-testid="generate-deliverables-button">
                  {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Download className="w-4 h-4 mr-2" />}
                  Generate All Deliverables
                </Button>
                <Button
                  onClick={() => {
                    setStage('form');
                    setFormData({ title: '', problem: '' });
                    setDebateData(null);
                    setProgress(0);
                  }}
                  variant="outline"
                  size="lg"
                  className="glass-card"
                  data-testid="new-consulting-button"
                >
                  New Consultation
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
