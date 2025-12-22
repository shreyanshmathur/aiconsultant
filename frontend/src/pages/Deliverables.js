import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { ArrowLeft, Download, Search, FileText, Calendar } from 'lucide-react';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export default function Deliverables() {
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const response = await axios.get(`${API}/projects`);
      setProjects(response.data);
    } catch (error) {
      console.error('Failed to fetch projects:', error);
      toast.error('Failed to load projects');
    } finally {
      setLoading(false);
    }
  };

  const filteredProjects = projects.filter(project =>
    project.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    project.problem_statement.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleDownload = async (filename) => {
    try {
      window.open(`${API}/deliverables/${filename}`, '_blank');
      toast.success('Downloading deliverable...');
    } catch (error) {
      console.error('Download error:', error);
      toast.error('Failed to download deliverable');
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

        <div className="max-w-6xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-4xl font-bold" data-testid="deliverables-title">
              Deliverables Bank
            </h1>
          </div>

          <div className="mb-8">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
              <Input
                data-testid="search-input"
                placeholder="Search projects..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {loading ? (
            <div className="text-center py-12 text-muted-foreground">
              Loading projects...
            </div>
          ) : filteredProjects.length === 0 ? (
            <Card className="p-12 text-center">
              <FileText className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">No Deliverables Yet</h3>
              <p className="text-muted-foreground mb-6">
                Start a research or consulting project to generate deliverables
              </p>
              <Button onClick={() => navigate('/')}>Go to Dashboard</Button>
            </Card>
          ) : (
            <div className="space-y-4">
              {filteredProjects.map((project) => (
                <Card key={project.id} className="p-6" data-testid={`project-card-${project.id}`}>
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <h3 className="text-xl font-bold mb-2">{project.title}</h3>
                      <p className="text-sm text-muted-foreground mb-2">
                        {project.problem_statement}
                      </p>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {new Date(project.created_at).toLocaleDateString()}
                        </span>
                        <span className="px-2 py-1 bg-secondary rounded text-foreground">
                          {project.project_type}
                        </span>
                      </div>
                    </div>
                  </div>

                  {project.deliverables && project.deliverables.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-border">
                      <div className="text-sm font-semibold mb-2">Deliverables:</div>
                      <div className="flex flex-wrap gap-2">
                        {project.deliverables.map((deliverable, idx) => (
                          <Button
                            key={idx}
                            data-testid={`download-button-${idx}`}
                            size="sm"
                            variant="outline"
                            onClick={() => handleDownload(deliverable)}
                          >
                            <Download className="w-3 h-3 mr-1" />
                            {deliverable}
                          </Button>
                        ))}
                      </div>
                    </div>
                  )}
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
