import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'framer-motion';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Loader2, Download, ArrowLeft, Sparkles, Search, TrendingUp, AlertCircle } from 'lucide-react';
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

  useEffect(() => {
    if (formData.problem && formData.problem.length > 20) {
      const debounce = setTimeout(() => {
        autoDiscoverContext();
      }, 1000);
      return () => clearTimeout(debounce);
    }
  }, [formData.problem]);

  const autoDiscoverContext = async () => {
    // This would call the backend to auto-detect industry and vendors
    // For now, simple client-side detection
    const problem = formData.problem.toLowerCase();
    
    if (problem.includes('erp') || problem.includes('enterprise resource')) {
      setSuggestedVendors(['SAP', 'Oracle', 'Microsoft Dynamics']);
      setDetectedIndustry('Enterprise Software');
    } else if (problem.includes('crm') || problem.includes('customer relationship')) {
      setSuggestedVendors(['Salesforce', 'HubSpot', 'Microsoft Dynamics']);
      setDetectedIndustry('CRM & Sales');
    } else if (problem.includes('cloud')) {
      setSuggestedVendors(['AWS', 'Azure', 'Google Cloud']);
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
      });

      const projectId = projectResponse.data.id;
      setProjectId(projectId);

      const researchResponse = await axios.post(`${API}/research/vendor-analysis`, {
        project_id: projectId,
        problem: formData.problem,
        vendor_name: formData.vendorName || null,
        industry: formData.industry || null
      });

      setResults(researchResponse.data);
      toast.success('Research completed successfully!');
    } catch (error) {
      console.error('Research error:', error);
      toast.error('Failed to conduct research');
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
            ...results?.recommendations || []
          ]
        }
      });
      toast.success('Deliverable generated! Check Deliverables Bank.');
    } catch (error) {
      console.error('Deliverable error:', error);
      toast.error('Failed to generate deliverable');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Button
          data-testid="back-button"
          variant="ghost"
          onClick={() => navigate('/')}
          className="mb-6 hover:bg-white/50"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Dashboard
        </Button>

        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-blue-100 rounded-xl">
                <Search className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-slate-900" data-testid="research-title">
                  AI-Powered Research
                </h1>
                <p className="text-slate-600">Vendor analysis and market intelligence</p>
              </div>
            </div>
          </motion.div>

          {!results ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Card className="p-8 bg-white shadow-xl">
                <form onSubmit={handleSubmit}>
                  <div className="space-y-6">
                    <div>
                      <Label htmlFor="title" className="text-slate-700 font-medium">Project Title *</Label>
                      <Input
                        id="title"
                        data-testid="project-title-input"
                        value={formData.title}
                        onChange={(e) => setFormData({...formData, title: e.target.value})}
                        placeholder="e.g., ERP Vendor Analysis for Manufacturing"
                        required
                        className="mt-2 bg-slate-50 border-slate-200 focus:border-blue-500 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <Label htmlFor="problem" className="text-slate-700 font-medium">Problem Statement *</Label>
                      <p className="text-sm text-slate-500 mb-2">Describe your research objective. AI will auto-detect industry and suggest vendors.</p>
                      <Textarea
                        id="problem"
                        data-testid="problem-statement-input"
                        value={formData.problem}
                        onChange={(e) => setFormData({...formData, problem: e.target.value})}
                        placeholder="e.g., We need to evaluate ERP solutions for our mid-size manufacturing company..."
                        rows={5}
                        required
                        className="mt-2 bg-slate-50 border-slate-200 focus:border-blue-500 focus:ring-blue-500"
                      />
                    </div>

                    {(suggestedVendors.length > 0 || detectedIndustry) && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="p-4 bg-blue-50 border border-blue-200 rounded-lg"
                      >
                        <div className="flex items-start gap-2">
                          <Sparkles className="w-5 h-5 text-blue-600 mt-0.5" />
                          <div className="flex-1">
                            <p className="font-medium text-blue-900 mb-2">AI Detected Context</p>
                            {detectedIndustry && (
                              <p className="text-sm text-blue-700 mb-2">Industry: <span className="font-semibold">{detectedIndustry}</span></p>
                            )}
                            {suggestedVendors.length > 0 && (
                              <div>
                                <p className="text-sm text-blue-700 mb-1">Suggested vendors:</p>
                                <div className="flex flex-wrap gap-2">
                                  {suggestedVendors.map((vendor, idx) => (
                                    <button
                                      key={idx}
                                      type="button"
                                      onClick={() => setFormData({...formData, vendorName: vendor})}
                                      className="px-3 py-1 text-xs bg-white border border-blue-300 rounded-full hover:bg-blue-50 transition-colors"
                                    >
                                      {vendor}
                                    </button>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    )}

                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="vendor" className="text-slate-700 font-medium">Vendor Name (Optional)</Label>
                        <p className="text-sm text-slate-500 mb-2">Leave blank for AI to suggest</p>
                        <Input
                          id="vendor"
                          data-testid="vendor-name-input"
                          value={formData.vendorName}
                          onChange={(e) => setFormData({...formData, vendorName: e.target.value})}
                          placeholder="e.g., SAP"
                          className="mt-2 bg-slate-50 border-slate-200 focus:border-blue-500 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <Label htmlFor="industry" className="text-slate-700 font-medium">Industry (Optional)</Label>
                        <p className="text-sm text-slate-500 mb-2">AI will auto-detect</p>
                        <Input
                          id="industry"
                          data-testid="industry-input"
                          value={formData.industry}
                          onChange={(e) => setFormData({...formData, industry: e.target.value})}
                          placeholder="e.g., Manufacturing"
                          className="mt-2 bg-slate-50 border-slate-200 focus:border-blue-500 focus:ring-blue-500"
                        />
                      </div>
                    </div>

                    <Button
                      data-testid="start-research-button"
                      type="submit"
                      disabled={loading}
                      size="lg"
                      className="w-full md:w-auto bg-slate-900 hover:bg-slate-800 text-white font-semibold shadow-lg"
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
                  </div>
                </form>
              </Card>
            </motion.div>
          ) : (
            <div className="space-y-6">
              <Card className="p-8 bg-white shadow-xl" data-testid="research-results">
                <h2 className="text-2xl font-bold text-slate-900 mb-6">Research Results</h2>
                
                <div className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="p-4 bg-blue-50 rounded-lg">
                      <p className="text-sm text-blue-600 font-medium mb-1">Vendor</p>
                      <p className="text-xl font-bold text-slate-900">{results.vendor_name}</p>
                    </div>
                    <div className="p-4 bg-purple-50 rounded-lg">
                      <p className="text-sm text-purple-600 font-medium mb-1">Industry</p>
                      <p className="text-xl font-bold text-slate-900">{results.industry}</p>
                    </div>
                  </div>

                  {results.suggested_vendors && results.suggested_vendors.length > 1 && (
                    <div>
                      <h3 className="font-semibold text-slate-900 mb-3">Suggested Vendors</h3>
                      <div className="flex flex-wrap gap-2">
                        {results.suggested_vendors.map((vendor, idx) => (
                          <span key={idx} className="px-4 py-2 bg-slate-100 text-slate-700 rounded-full text-sm">
                            {vendor}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  <div>
                    <h3 className="font-semibold text-slate-900 mb-3">Analysis</h3>
                    <p className="text-slate-700 leading-relaxed">
                      {results.analysis?.market_position}
                    </p>
                  </div>

                  {results.analysis?.key_capabilities && (
                    <div>
                      <h3 className="font-semibold text-slate-900 mb-3">Key Capabilities</h3>
                      <ul className="space-y-2">
                        {results.analysis.key_capabilities.map((cap, idx) => (
                          <li key={idx} className="flex items-start gap-2 text-slate-700">
                            <div className="w-1.5 h-1.5 rounded-full bg-green-500 mt-2" />
                            {cap}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {results.recommendations && (
                    <div>
                      <h3 className="font-semibold text-slate-900 mb-3">Recommendations</h3>
                      <div className="space-y-3">
                        {results.recommendations.map((rec, idx) => (
                          <div key={idx} className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
                            <p className="text-slate-700">{rec}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </Card>

              <div className="flex flex-col sm:flex-row gap-4">
                <Button
                  data-testid="download-deliverable-button"
                  onClick={handleDownloadDeliverable}
                  size="lg"
                  className="bg-slate-900 hover:bg-slate-800 text-white font-semibold shadow-lg"
                >
                  <Download className="w-5 h-5 mr-2" />
                  Generate Excel Report
                </Button>
                <Button
                  data-testid="new-research-button"
                  onClick={() => {
                    setResults(null);
                    setFormData({ title: '', problem: '', vendorName: '', industry: '' });
                    setSuggestedVendors([]);
                    setDetectedIndustry(null);
                  }}
                  variant="outline"
                  size="lg"
                  className="border-2 border-slate-200 hover:border-slate-300 font-semibold"
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
