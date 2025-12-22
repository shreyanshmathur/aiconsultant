import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'framer-motion';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { ArrowLeft, Download, Search, FileText, Calendar, FileSpreadsheet, Presentation, Folder } from 'lucide-react';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export default function Deliverables() {
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [allFiles, setAllFiles] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('projects');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [projectsRes, filesRes] = await Promise.all([
        axios.get(`${API}/projects`, { withCredentials: true }).catch(() => ({ data: [] })),
        axios.get(`${API}/deliverables`).catch(() => ({ data: { files: [] } }))
      ]);
      setProjects(projectsRes.data || []);
      setAllFiles(filesRes.data?.files || []);
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredProjects = projects.filter(project =>
    project.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    project.problem_statement?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredFiles = allFiles.filter(file =>
    file.filename?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleDownload = (filename) => {
    window.open(`${API}/deliverables/${filename}`, '_blank');
    toast.success('Download started');
  };

  const getFileIcon = (filename) => {
    if (filename.endsWith('.xlsx') || filename.endsWith('.xls')) {
      return <FileSpreadsheet className="w-5 h-5 text-emerald-500" />;
    }
    if (filename.endsWith('.html') || filename.endsWith('.pptx')) {
      return <Presentation className="w-5 h-5 text-orange-500" />;
    }
    return <FileText className="w-5 h-5 text-blue-500" />;
  };

  const getFileType = (filename) => {
    if (filename.endsWith('.xlsx') || filename.endsWith('.xls')) return 'Excel Report';
    if (filename.endsWith('.html')) return 'Presentation';
    if (filename.endsWith('.txt')) return 'Text Document';
    return 'Document';
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
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center shadow-lg">
                <Folder className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold gradient-text">Deliverables Bank</h1>
                <p className="text-muted-foreground">Access and download your generated reports</p>
              </div>
            </div>
          </motion.div>

          {/* Search and Tabs */}
          <div className="mb-8 space-y-4">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
              <Input
                placeholder="Search deliverables..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 input-glass h-12"
                data-testid="search-input"
              />
            </div>

            <div className="flex gap-2">
              <Button
                variant={activeTab === 'projects' ? 'default' : 'outline'}
                onClick={() => setActiveTab('projects')}
                className={activeTab === 'projects' ? 'btn-primary' : 'glass-card'}
              >
                By Project
              </Button>
              <Button
                variant={activeTab === 'files' ? 'default' : 'outline'}
                onClick={() => setActiveTab('files')}
                className={activeTab === 'files' ? 'btn-primary' : 'glass-card'}
              >
                All Files ({allFiles.length})
              </Button>
            </div>
          </div>

          {loading ? (
            <div className="text-center py-12 text-muted-foreground">
              Loading deliverables...
            </div>
          ) : activeTab === 'files' ? (
            /* All Files View */
            filteredFiles.length === 0 ? (
              <Card className="glass-card p-12 text-center">
                <FileText className="w-16 h-16 mx-auto mb-4 text-muted-foreground/50" />
                <h3 className="text-lg font-semibold mb-2">No Files Found</h3>
                <p className="text-muted-foreground">Generate deliverables from Research or Consulting to see them here</p>
              </Card>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredFiles.map((file, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                  >
                    <Card className="glass-card p-6 hover-lift">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center flex-shrink-0">
                          {getFileIcon(file.filename)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-sm truncate mb-1" title={file.filename}>
                            {file.filename}
                          </h3>
                          <p className="text-xs text-muted-foreground mb-3">
                            {getFileType(file.filename)} • {(file.size / 1024).toFixed(1)} KB
                          </p>
                          <Button
                            size="sm"
                            onClick={() => handleDownload(file.filename)}
                            className="w-full btn-primary"
                            data-testid={`download-file-${idx}`}
                          >
                            <Download className="w-4 h-4 mr-2" />
                            Download
                          </Button>
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                ))}
              </div>
            )
          ) : (
            /* Projects View */
            filteredProjects.length === 0 ? (
              <Card className="glass-card p-12 text-center">
                <FileText className="w-16 h-16 mx-auto mb-4 text-muted-foreground/50" />
                <h3 className="text-lg font-semibold mb-2">No Projects Yet</h3>
                <p className="text-muted-foreground mb-6">
                  Start a research or consulting project to generate deliverables
                </p>
                <Button onClick={() => navigate('/dashboard')} className="btn-primary">
                  Go to Dashboard
                </Button>
              </Card>
            ) : (
              <div className="space-y-4">
                {filteredProjects.map((project, idx) => (
                  <motion.div
                    key={project.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                  >
                    <Card className="glass-card p-6 hover-lift" data-testid={`project-card-${project.id}`}>
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex-1">
                          <h3 className="text-xl font-bold mb-2">{project.title}</h3>
                          <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                            {project.problem_statement}
                          </p>
                          <div className="flex items-center gap-4 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {new Date(project.created_at).toLocaleDateString()}
                            </span>
                            <span className="px-2 py-1 rounded-full bg-primary/10 text-primary">
                              {project.project_type}
                            </span>
                          </div>
                        </div>
                      </div>

                      {project.deliverables && project.deliverables.length > 0 && (
                        <div className="mt-4 pt-4 border-t border-border">
                          <div className="text-sm font-semibold mb-3">Deliverables ({project.deliverables.length})</div>
                          <div className="flex flex-wrap gap-2">
                            {project.deliverables.map((deliverable, dIdx) => (
                              <Button
                                key={dIdx}
                                size="sm"
                                variant="outline"
                                onClick={() => handleDownload(deliverable)}
                                className="glass-card text-xs"
                                data-testid={`download-button-${dIdx}`}
                              >
                                {getFileIcon(deliverable)}
                                <span className="ml-2 truncate max-w-32">{deliverable}</span>
                              </Button>
                            ))}
                          </div>
                        </div>
                      )}
                    </Card>
                  </motion.div>
                ))}
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
}
