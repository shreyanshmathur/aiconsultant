import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Loader2, Download, ArrowLeft } from 'lucide-react';
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
        vendor_name: formData.vendorName,
        industry: formData.industry
      });

      setResults(researchResponse.data);
      toast.success('Research completed successfully');
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
            results?.website_analysis?.analysis || '',
            `Competitors: ${results?.competitor_analysis?.length || 0} identified`,
            results?.market_position?.analysis || ''
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

        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold mb-8" data-testid="research-title">
            Deep Research
          </h1>

          {!results ? (
            <Card className="p-8">
              <form onSubmit={handleSubmit}>
                <div className="space-y-6">
                  <div>
                    <Label htmlFor="title">Project Title</Label>
                    <Input
                      id="title"
                      data-testid="project-title-input"
                      value={formData.title}
                      onChange={(e) => setFormData({...formData, title: e.target.value})}
                      placeholder="e.g., ERP Vendor Analysis"
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
                      placeholder="Describe the research objective..."
                      rows={4}
                      required
                    />
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="vendor">Vendor Name</Label>
                      <Input
                        id="vendor"
                        data-testid="vendor-name-input"
                        value={formData.vendorName}
                        onChange={(e) => setFormData({...formData, vendorName: e.target.value})}
                        placeholder="e.g., SAP"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="industry">Industry</Label>
                      <Input
                        id="industry"
                        data-testid="industry-input"
                        value={formData.industry}
                        onChange={(e) => setFormData({...formData, industry: e.target.value})}
                        placeholder="e.g., ERP Software"
                        required
                      />
                    </div>
                  </div>

                  <Button
                    data-testid="start-research-button"
                    type="submit"
                    disabled={loading}
                    size="lg"
                    className="uppercase tracking-widest text-xs font-semibold"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Analyzing...
                      </>
                    ) : (
                      'Start Research'
                    )}
                  </Button>
                </div>
              </form>
            </Card>
          ) : (
            <div className="space-y-6">
              <Card className="p-8" data-testid="research-results">
                <h2 className="text-2xl font-bold mb-6">Research Results</h2>
                
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold mb-2">Website Analysis</h3>
                    <p className="text-muted-foreground">
                      {results.website_analysis?.analysis || 'No data available'}
                    </p>
                  </div>

                  <div>
                    <h3 className="font-semibold mb-2">Competitor Analysis</h3>
                    <p className="text-muted-foreground">
                      {results.competitor_analysis?.length || 0} competitors identified
                    </p>
                  </div>

                  <div>
                    <h3 className="font-semibold mb-2">Market Position</h3>
                    <p className="text-muted-foreground">
                      {results.market_position?.analysis || 'No data available'}
                    </p>
                  </div>
                </div>
              </Card>

              <div className="flex gap-4">
                <Button
                  data-testid="download-deliverable-button"
                  onClick={handleDownloadDeliverable}
                  size="lg"
                  className="uppercase tracking-widest text-xs font-semibold"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Generate Deliverable
                </Button>
                <Button
                  data-testid="new-research-button"
                  onClick={() => {
                    setResults(null);
                    setFormData({ title: '', problem: '', vendorName: '', industry: '' });
                  }}
                  variant="outline"
                  size="lg"
                  className="uppercase tracking-widest text-xs font-semibold"
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
