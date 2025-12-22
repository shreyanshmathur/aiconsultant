import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Progress } from '../components/ui/progress';
import { Loader2, Download, ArrowLeft, MessageSquare } from 'lucide-react';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export default function Consulting() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [stage, setStage] = useState('form');
  const [projectId, setProjectId] = useState(null);
  const [agents, setAgents] = useState([]);
  const [formData, setFormData] = useState({
    title: '',
    problem: ''
  });
  const [debateData, setDebateData] = useState(null);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    fetchAgents();
  }, []);

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
      });

      const projectId = projectResponse.data.id;
      setProjectId(projectId);
      setProgress(30);

      const debateResponse = await axios.post(`${API}/conference/debate`, {
        project_id: projectId,
        problem: formData.problem
      });

      setDebateData(debateResponse.data);
      setProgress(100);
      setStage('results');
      toast.success('Conference room debate completed');
    } catch (error) {
      console.error('Consulting error:', error);
      toast.error('Failed to conduct consultation');
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

      toast.success('All deliverables generated! Check Deliverables Bank.');
    } catch (error) {
      console.error('Deliverable error:', error);
      toast.error('Failed to generate deliverables');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background" style={{backgroundColor: '#F8F9FA'}}>
      <div className="container mx-auto px-6 py-8">
        <Button
          data-testid="back-button"
          variant="ghost"
          onClick={() => navigate('/')}
          className="mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Dashboard
        </Button>

        <div className="max-w-7xl mx-auto">
          <h1 className="text-4xl font-bold mb-8" data-testid="consulting-title">
            Full Consulting Experience
          </h1>

          {stage === 'form' && (
            <Card className="p-8 max-w-2xl">
              <form onSubmit={handleSubmit}>
                <div className="space-y-6">
                  <div>
                    <Label htmlFor="title">Project Title</Label>
                    <Input
                      id="title"
                      data-testid="project-title-input"
                      value={formData.title}
                      onChange={(e) => setFormData({...formData, title: e.target.value})}
                      placeholder="e.g., Digital Transformation Strategy"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="problem">Problem Statement</Label>
                    <Textarea
                      id="problem"
                      data-testid="problem-statement-input"
                      value={formData.problem}
                      onChange={(e) => setFormData({...formData, problem: e.target.value})}
                      placeholder="Describe your business challenge in detail..."
                      rows={6}
                      required
                    />
                  </div>

                  <Button
                    data-testid="start-consulting-button"
                    type="submit"
                    disabled={loading}
                    size="lg"
                    className="uppercase tracking-widest text-xs font-semibold"
                  >
                    Enter Conference Room
                  </Button>
                </div>
              </form>
            </Card>
          )}

          {stage === 'debate' && (
            <div className="space-y-8">
              <Card className="p-8" data-testid="debate-progress">
                <h2 className="text-2xl font-bold mb-4">Conference Room in Session</h2>
                <p className="text-muted-foreground mb-6">
                  8 consultant agents are analyzing your problem and debating solutions...
                </p>
                <Progress value={progress} className="mb-4" />
                <p className="text-sm text-muted-foreground">{progress}% complete</p>
              </Card>

              <div className="grid md:grid-cols-4 gap-4">
                {agents.slice(0, 8).map((agent, idx) => (
                  <Card key={idx} className="p-4 agent-card">
                    <img
                      src={agent.avatar_url}
                      alt={agent.name}
                      className="w-16 h-16 rounded-full mb-3 object-cover"
                    />
                    <h3 className="font-semibold text-sm mb-1">{agent.name}</h3>
                    <p className="text-xs text-muted-foreground">{agent.role}</p>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {stage === 'results' && debateData && (
            <div className="space-y-6">
              <Card className="p-8 bg-white shadow-xl" data-testid="debate-results">
                <h2 className="text-3xl font-bold text-slate-900 mb-6">Consulting Analysis Complete</h2>
                
                <div className="space-y-8">
                  {/* Summary */}
                  <div className="p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
                    <h3 className="font-bold text-xl text-slate-900 mb-3">Executive Summary</h3>
                    <p className="text-slate-700 leading-relaxed">
                      {debateData.consensus?.summary}
                    </p>
                  </div>

                  {/* Key Insights */}
                  {debateData.consensus?.key_insights && (
                    <div>
                      <h3 className="font-bold text-xl text-slate-900 mb-4">Key Insights</h3>
                      <div className="space-y-3">
                        {debateData.consensus.key_insights.map((insight, idx) => (
                          <div key={idx} className="p-4 bg-amber-50 border-l-4 border-amber-500 rounded">
                            <p className="text-slate-800">{insight}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Recommendations */}
                  {debateData.consensus?.recommendations && (
                    <div>
                      <h3 className="font-bold text-xl text-slate-900 mb-4">Strategic Recommendations</h3>
                      <div className="grid md:grid-cols-2 gap-4">
                        {debateData.consensus.recommendations.map((rec, idx) => (
                          <div key={idx} className="p-4 bg-green-50 border border-green-200 rounded-lg">
                            <div className="flex items-start gap-3">
                              <div className="w-6 h-6 rounded-full bg-green-500 text-white flex items-center justify-center flex-shrink-0 text-sm font-bold">
                                {idx + 1}
                              </div>
                              <p className="text-slate-700 flex-1">{rec}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Next Steps Timeline */}
                  {debateData.consensus?.next_steps && (
                    <div>
                      <h3 className="font-bold text-xl text-slate-900 mb-4">Implementation Timeline</h3>
                      <div className="space-y-3">
                        {debateData.consensus.next_steps.map((step, idx) => (
                          <div key={idx} className="flex items-start gap-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                            <div className="text-2xl">{idx === 0 ? '📅' : idx === debateData.consensus.next_steps.length - 1 ? '♾️' : '⏱️'}</div>
                            <p className="text-slate-700 flex-1">{step}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Risk Factors */}
                  {debateData.consensus?.risk_factors && (
                    <div>
                      <h3 className="font-bold text-xl text-slate-900 mb-4">Risk Factors & Considerations</h3>
                      <div className="space-y-2">
                        {debateData.consensus.risk_factors.map((risk, idx) => (
                          <div key={idx} className="p-4 bg-red-50 border-l-4 border-red-400 rounded">
                            <p className="text-slate-700">{risk}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Estimated Impact */}
                  {debateData.consensus?.estimated_impact && (
                    <div className="p-6 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border border-purple-200">
                      <h3 className="font-bold text-xl text-slate-900 mb-4">Estimated Impact</h3>
                      <div className="grid md:grid-cols-3 gap-4">
                        <div className="text-center">
                          <div className="text-3xl mb-2">📈</div>
                          <div className="text-sm text-slate-600 mb-1">ARR Growth</div>
                          <div className="font-semibold text-slate-900">{debateData.consensus.estimated_impact.arr_growth}</div>
                        </div>
                        <div className="text-center">
                          <div className="text-3xl mb-2">💰</div>
                          <div className="text-sm text-slate-600 mb-1">CAC Reduction</div>
                          <div className="font-semibold text-slate-900">{debateData.consensus.estimated_impact.cac_reduction}</div>
                        </div>
                        <div className="text-center">
                          <div className="text-3xl mb-2">⏰</div>
                          <div className="text-sm text-slate-600 mb-1">Timeline</div>
                          <div className="font-semibold text-slate-900">{debateData.consensus.estimated_impact.timeline}</div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </Card>

              <Card className="p-8" data-testid="debate-transcript">
                <h2 className="text-2xl font-bold mb-6">Debate Transcript</h2>
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {debateData.debate_history?.map((entry, idx) => {
                    const agent = agents.find(a => a.name === entry.agent);
                    return (
                      <div key={idx} className="flex gap-4">
                        {agent && (
                          <img
                            src={agent.avatar_url}
                            alt={agent.name}
                            className="w-10 h-10 rounded-full object-cover flex-shrink-0"
                          />
                        )}
                        <div className="flex-1">
                          <div className="font-semibold text-sm mb-1">
                            {entry.agent} <span className="text-xs text-muted-foreground">Round {entry.round}</span>
                          </div>
                          <p className="text-sm text-muted-foreground">{entry.argument}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </Card>

              <div className="flex gap-4">
                <Button
                  data-testid="generate-deliverables-button"
                  onClick={handleGenerateDeliverables}
                  disabled={loading}
                  size="lg"
                  className="uppercase tracking-widest text-xs font-semibold"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Download className="w-4 h-4 mr-2" />
                      Generate All Deliverables
                    </>
                  )}
                </Button>
                <Button
                  data-testid="new-consulting-button"
                  onClick={() => {
                    setStage('form');
                    setFormData({ title: '', problem: '' });
                    setDebateData(null);
                    setProgress(0);
                  }}
                  variant="outline"
                  size="lg"
                  className="uppercase tracking-widest text-xs font-semibold"
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
