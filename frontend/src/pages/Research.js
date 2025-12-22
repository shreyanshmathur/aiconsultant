import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'framer-motion';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Loader2, Download, ArrowLeft, Sparkles, Search, TrendingUp, Trophy, Star } from 'lucide-react';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export default function Research() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [projectId, setProjectId] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    problem: '',
    vendorName: '',
    industry: ''
  });
  const [results, setResults] = useState(null);
  const [suggestedVendors, setSuggestedVendors] = useState([]);
  const [detectedIndustry, setDetectedIndustry] = useState(null);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [uploadedContext, setUploadedContext] = useState('');

  const handleFileUpload = async (event) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    const formDataObj = new FormData();
    for (let i = 0; i < files.length; i++) {
      formDataObj.append('files', files[i]);
    }

    try {
      const response = await axios.post(`${API}/research/upload`, formDataObj, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      setUploadedFiles(response.data.extracted_content);
      const combinedContext = response.data.extracted_content
        .map(f => `${f.filename}:\n${f.content}`)
        .join('\n\n');
      setUploadedContext(combinedContext);
      
      toast.success(`${response.data.files_processed} file(s) processed`);
    } catch (error) {
      toast.error('Failed to upload files');
    }
  };

  useEffect(() => {
    if (formData.problem && formData.problem.length > 20) {
      const debounce = setTimeout(() => autoDiscoverContext(), 1000);
      return () => clearTimeout(debounce);
    }
  }, [formData.problem]);

  const autoDiscoverContext = () => {
    const problem = formData.problem.toLowerCase();
    
    if (problem.includes('erp') || problem.includes('enterprise resource')) {
      setSuggestedVendors(['SAP', 'Oracle', 'Microsoft Dynamics', 'Workday']);
      setDetectedIndustry('Enterprise Software');
    } else if (problem.includes('crm') || problem.includes('customer relationship')) {
      setSuggestedVendors(['Salesforce', 'HubSpot', 'Microsoft Dynamics', 'Zoho']);
      setDetectedIndustry('CRM & Sales');
    } else if (problem.includes('cloud')) {
      setSuggestedVendors(['AWS', 'Azure', 'Google Cloud', 'IBM']);
      setDetectedIndustry('Cloud Computing');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const projectResponse = await axios.post(`${API}/projects`, {
        title: formData.title,
        problem_statement: formData.problem,
        project_type: 'research'
      }, { withCredentials: true });

      const newProjectId = projectResponse.data.id;
      setProjectId(newProjectId);

      const researchResponse = await axios.post(`${API}/research/vendor-analysis`, {
        project_id: newProjectId,
        query: formData.problem,
        vendor_name: formData.vendorName || null,
        industry: formData.industry || null,
        additional_context: uploadedContext || null
      }, { withCredentials: true });

      setResults(researchResponse.data);
      toast.success('Research completed!');
    } catch (error) {
      toast.error('Research failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadDeliverable = async () => {
    try {
      await axios.post(`${API}/deliverables/excel`, {
        project_id: projectId,
        deliverable_type: 'current_state',
        content: {
          problem: formData.problem,
          findings: [
            `Vendor: ${results?.vendor_name}`,
            `Industry: ${results?.industry}`,
            `Analysis: ${results?.analysis?.market_position || ''}`,
            ...(results?.recommendations || [])
          ]
        }
      });
      toast.success('Excel report generated! View in Deliverables.');
      navigate('/deliverables');
    } catch (error) {
      toast.error('Failed to generate deliverable');
    }
  };

  const getScoreColor = (score) => {
    if (score >= 8) return 'score-high';
    if (score >= 7) return 'score-medium';
    return 'score-low';
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Button
          variant="ghost"
          onClick={() => navigate('/dashboard')}
          className="mb-6 hover:bg-primary/10"
          data-testid="back-button"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Dashboard
        </Button>

        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <div className="flex items-center gap-4 mb-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center shadow-lg">
                <Search className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold gradient-text">AI-Powered Research</h1>
                <p className="text-muted-foreground">Vendor analysis with intelligent comparison</p>
              </div>
            </div>
          </motion.div>

          {!results ? (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
              <Card className="glass-card p-8">
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <Label className="text-base font-medium">Project Title *</Label>
                    <Input
                      value={formData.title}
                      onChange={(e) => setFormData({...formData, title: e.target.value})}
                      placeholder="e.g., ERP Vendor Analysis for Manufacturing"
                      required
                      className="mt-2 input-glass"
                      data-testid="project-title-input"
                    />
                  </div>

                  <div>
                    <Label className="text-base font-medium">Problem Statement *</Label>
                    <p className="text-sm text-muted-foreground mb-2">Describe your research objective. AI will auto-detect industry and suggest vendors.</p>
                    <Textarea
                      value={formData.problem}
                      onChange={(e) => setFormData({...formData, problem: e.target.value})}
                      placeholder="e.g., We need to evaluate ERP solutions for our mid-size manufacturing company..."
                      rows={5}
                      required
                      className="mt-2 input-glass"
                      data-testid="problem-statement-input"
                    />
                  </div>

                  {(suggestedVendors.length > 0 || detectedIndustry) && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="p-4 glass-card bg-primary/5 border-primary/20"
                    >
                      <div className="flex items-start gap-3">
                        <Sparkles className="w-5 h-5 text-primary mt-0.5" />
                        <div className="flex-1">
                          <p className="font-medium text-primary mb-2">AI Detected Context</p>
                          {detectedIndustry && (
                            <p className="text-sm text-muted-foreground mb-2">
                              Industry: <span className="font-semibold text-foreground">{detectedIndustry}</span>
                            </p>
                          )}
                          {suggestedVendors.length > 0 && (
                            <div className="flex flex-wrap gap-2 mt-2">
                              {suggestedVendors.map((vendor, idx) => (
                                <button
                                  key={idx}
                                  type="button"
                                  onClick={() => setFormData({...formData, vendorName: vendor})}
                                  className={`px-3 py-1.5 text-xs rounded-full transition-all ${
                                    formData.vendorName === vendor 
                                      ? 'bg-primary text-primary-foreground' 
                                      : 'bg-background border hover:border-primary'
                                  }`}
                                >
                                  {vendor}
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  )}

                  <div>
                    <Label className="text-base font-medium">Upload Context (Optional)</Label>
                    <p className="text-sm text-muted-foreground mb-2">Add PDF or Excel files with company data</p>
                    <input
                      type="file"
                      multiple
                      accept=".pdf,.xlsx,.xls"
                      onChange={handleFileUpload}
                      className="mt-2 block w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20"
                    />
                    {uploadedFiles.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-2">
                        {uploadedFiles.map((file, idx) => (
                          <span key={idx} className="px-3 py-1 text-xs bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-full">
                            ✓ {file.filename}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label className="text-base font-medium">Vendor Name (Optional)</Label>
                      <Input
                        value={formData.vendorName}
                        onChange={(e) => setFormData({...formData, vendorName: e.target.value})}
                        placeholder="e.g., SAP"
                        className="mt-2 input-glass"
                        data-testid="vendor-name-input"
                      />
                    </div>
                    <div>
                      <Label className="text-base font-medium">Industry (Optional)</Label>
                      <Input
                        value={formData.industry}
                        onChange={(e) => setFormData({...formData, industry: e.target.value})}
                        placeholder="e.g., Manufacturing"
                        className="mt-2 input-glass"
                        data-testid="industry-input"
                      />
                    </div>
                  </div>

                  <Button
                    type="submit"
                    disabled={loading}
                    size="lg"
                    className="btn-primary w-full md:w-auto"
                    data-testid="start-research-button"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        Analyzing...
                      </>
                    ) : (
                      <>
                        <TrendingUp className="w-5 h-5 mr-2" />
                        Start Research
                      </>
                    )}
                  </Button>
                </form>
              </Card>
            </motion.div>
          ) : (
            <div className="space-y-6">
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                <Card className="glass-card p-8" data-testid="research-results">
                  <h2 className="text-2xl font-bold mb-6 gradient-text">Research Results</h2>
                  
                  {/* Primary Info */}
                  <div className="grid md:grid-cols-2 gap-4 mb-8">
                    <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/20">
                      <p className="text-sm text-blue-600 dark:text-blue-400 font-medium mb-1">Primary Vendor</p>
                      <p className="text-xl font-bold">{results.vendor_name}</p>
                    </div>
                    <div className="p-4 rounded-xl bg-purple-500/10 border border-purple-500/20">
                      <p className="text-sm text-purple-600 dark:text-purple-400 font-medium mb-1">Industry</p>
                      <p className="text-xl font-bold">{results.industry}</p>
                    </div>
                  </div>

                  {/* Market Position */}
                  <div className="p-6 glass-card bg-gradient-to-r from-blue-500/5 to-purple-500/5 mb-8">
                    <h3 className="font-semibold text-lg mb-3">📊 Market Position</h3>
                    <p className="text-muted-foreground leading-relaxed">{results.analysis?.market_position}</p>
                  </div>

                  {/* Vendor Comparison */}
                  {results.vendor_comparison && Object.keys(results.vendor_comparison).length > 0 && (
                    <div className="mb-8">
                      <h3 className="font-bold text-xl mb-4 flex items-center gap-2">
                        <Trophy className="w-5 h-5 text-amber-500" />
                        Vendor Comparison
                      </h3>
                      
                      {/* Winner Banner */}
                      {results.recommended_vendor && (
                        <div className="mb-6 p-4 glass-card bg-gradient-to-r from-emerald-500/10 to-green-500/10 border-emerald-500/20">
                          <div className="flex items-center gap-3">
                            <span className="text-3xl">🥇</span>
                            <div>
                              <p className="text-sm text-emerald-600 dark:text-emerald-400 font-medium">Recommended Vendor</p>
                              <p className="text-xl font-bold">{results.recommended_vendor}</p>
                              {results.recommendation_reason && (
                                <p className="text-sm text-muted-foreground mt-1">{results.recommendation_reason}</p>
                              )}
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Comparison Table */}
                      <div className="overflow-x-auto rounded-xl border border-border">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="bg-muted/50">
                              <th className="px-4 py-3 text-left font-semibold">Vendor</th>
                              <th className="px-4 py-3 text-center font-semibold">Score</th>
                              <th className="px-4 py-3 text-center font-semibold">Features</th>
                              <th className="px-4 py-3 text-center font-semibold">Pricing</th>
                              <th className="px-4 py-3 text-center font-semibold">Ease of Use</th>
                              <th className="px-4 py-3 text-left font-semibold">Best For</th>
                            </tr>
                          </thead>
                          <tbody>
                            {Object.entries(results.vendor_comparison)
                              .sort((a, b) => (b[1].total_score || 0) - (a[1].total_score || 0))
                              .map(([vendorName, data], idx) => (
                                <tr key={vendorName} className={`border-t border-border ${idx === 0 ? 'bg-emerald-500/5' : ''}`}>
                                  <td className="px-4 py-3">
                                    <div className="flex items-center gap-2">
                                      {idx === 0 && <span>🥇</span>}
                                      {idx === 1 && <span>🥈</span>}
                                      {idx === 2 && <span>🥉</span>}
                                      <span className="font-medium">{vendorName}</span>
                                    </div>
                                  </td>
                                  <td className="px-4 py-3 text-center">
                                    <span className={`px-2 py-1 rounded-full text-xs font-bold ${getScoreColor(data.total_score)}`}>
                                      {(data.total_score || 0).toFixed(1)}
                                    </span>
                                  </td>
                                  <td className="px-4 py-3 text-center mono">{data.scores?.features?.toFixed(1) || '-'}</td>
                                  <td className="px-4 py-3 text-center mono">{data.scores?.pricing?.toFixed(1) || '-'}</td>
                                  <td className="px-4 py-3 text-center mono">{data.scores?.ease_of_use?.toFixed(1) || '-'}</td>
                                  <td className="px-4 py-3 text-xs text-muted-foreground">{data.best_for || '-'}</td>
                                </tr>
                              ))}
                          </tbody>
                        </table>
                      </div>

                      {/* Vendor Cards */}
                      <div className="mt-6 grid md:grid-cols-2 gap-4">
                        {Object.entries(results.vendor_comparison)
                          .sort((a, b) => (b[1].total_score || 0) - (a[1].total_score || 0))
                          .slice(0, 4)
                          .map(([vendorName, data], idx) => (
                            <div key={vendorName} className={`p-4 rounded-xl border ${idx === 0 ? 'border-emerald-500/30 bg-emerald-500/5' : 'border-border'}`}>
                              <div className="flex justify-between items-start mb-3">
                                <h4 className="font-bold">{vendorName}</h4>
                                <span className={`px-2 py-1 rounded-full text-xs font-bold ${getScoreColor(data.total_score)}`}>
                                  {(data.total_score || 0).toFixed(1)}/10
                                </span>
                              </div>
                              
                              {data.strengths?.length > 0 && (
                                <div className="mb-3">
                                  <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 mb-1">Strengths:</p>
                                  <ul className="text-xs text-muted-foreground space-y-1">
                                    {data.strengths.slice(0, 2).map((s, i) => (
                                      <li key={i}>✓ {s}</li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                              
                              {data.weaknesses?.length > 0 && (
                                <div>
                                  <p className="text-xs font-semibold text-red-600 dark:text-red-400 mb-1">Considerations:</p>
                                  <ul className="text-xs text-muted-foreground space-y-1">
                                    {data.weaknesses.slice(0, 2).map((w, i) => (
                                      <li key={i}>• {w}</li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                            </div>
                          ))}
                      </div>
                    </div>
                  )}

                  {/* Recommendations */}
                  {results.recommendations?.length > 0 && (
                    <div className="mb-8">
                      <h3 className="font-semibold text-lg mb-4">Strategic Recommendations</h3>
                      <div className="space-y-3">
                        {results.recommendations.map((rec, idx) => (
                          <div key={idx} className="p-4 rounded-xl bg-amber-500/10 border-l-4 border-amber-500">
                            <div className="flex items-start gap-3">
                              <span className="text-amber-600 dark:text-amber-400 font-bold">{idx + 1}.</span>
                              <p className="text-muted-foreground">{rec}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </Card>
              </motion.div>

              <div className="flex flex-wrap gap-4">
                <Button onClick={handleDownloadDeliverable} size="lg" className="btn-primary" data-testid="download-deliverable-button">
                  <Download className="w-5 h-5 mr-2" />
                  Generate Excel Report
                </Button>
                <Button
                  onClick={() => {
                    setResults(null);
                    setFormData({ title: '', problem: '', vendorName: '', industry: '' });
                    setSuggestedVendors([]);
                    setDetectedIndustry(null);
                  }}
                  variant="outline"
                  size="lg"
                  className="glass-card"
                  data-testid="new-research-button"
                >
                  New Research
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
