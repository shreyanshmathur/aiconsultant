import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Search, Users, Database, Sparkles, ChevronRight, BarChart3, FileText } from 'lucide-react';

export default function Dashboard() {
  const navigate = useNavigate();
  const [selectedMode, setSelectedMode] = useState(null);

  const modes = [
    {
      id: 'research',
      title: 'Research Mode',
      description: 'AI-powered vendor analysis and market intelligence',
      icon: Search,
      features: ['Auto vendor discovery', 'Competitor analysis', 'Market insights'],
      gradient: 'from-blue-50 to-indigo-50',
      iconColor: 'text-blue-600',
      borderColor: 'border-blue-200'
    },
    {
      id: 'full-consulting',
      title: 'Full Consulting',
      description: '8 AI consultants collaborate on your challenge',
      icon: Users,
      features: ['Multi-agent debate', 'Strategic recommendations', 'Complete deliverables'],
      gradient: 'from-purple-50 to-pink-50',
      iconColor: 'text-purple-600',
      borderColor: 'border-purple-200'
    }
  ];

  const stats = [
    { value: '8', label: 'AI Consultants', icon: Users },
    { value: '50+', label: 'Data Sources', icon: Database },
    { value: '3', label: 'Debate Rounds', icon: BarChart3 },
    { value: '100%', label: 'Free to Use', icon: Sparkles }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-7xl mx-auto"
        >
          {/* Header */}
          <div className="text-center mb-12">
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              className="inline-flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-sm rounded-full shadow-sm mb-6 border border-slate-200"
            >
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span className="text-sm font-medium text-slate-700">Powered by 8 Specialized AI Agents</span>
            </motion.div>
            
            <h1 className="text-4xl md:text-6xl font-bold text-slate-900 mb-4" data-testid="dashboard-title">
              Consultant AI
            </h1>
            <p className="text-lg md:text-xl text-slate-600 max-w-2xl mx-auto">
              McKinsey-grade consulting powered by AI
            </p>
          </div>

          {/* Mode Selection */}
          <div className="grid md:grid-cols-2 gap-6 mb-12">
            {modes.map((mode) => {
              const Icon = mode.icon;
              const isSelected = selectedMode === mode.id;
              
              return (
                <motion.div
                  key={mode.id}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Card
                    data-testid={`mode-card-${mode.id}`}
                    className={`p-8 cursor-pointer transition-all duration-300 bg-white hover:shadow-xl ${
                      isSelected ? `ring-2 ring-offset-2 ${mode.borderColor} ring-opacity-50 shadow-lg` : 'shadow-md hover:shadow-lg'
                    }`}
                    onClick={() => setSelectedMode(mode.id)}
                  >
                    <div className="flex items-start justify-between mb-6">
                      <div className={`p-4 rounded-2xl bg-gradient-to-br ${mode.gradient}`}>
                        <Icon className={`w-8 h-8 ${mode.iconColor}`} />
                      </div>
                      {isSelected && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="w-6 h-6 rounded-full bg-gradient-to-r from-green-400 to-emerald-500 flex items-center justify-center"
                        >
                          <ChevronRight className="w-4 h-4 text-white" />
                        </motion.div>
                      )}
                    </div>
                    
                    <h3 className="text-2xl font-bold text-slate-900 mb-3">{mode.title}</h3>
                    <p className="text-slate-600 mb-4">{mode.description}</p>
                    
                    <div className="space-y-2">
                      {mode.features.map((feature, idx) => (
                        <div key={idx} className="flex items-center gap-2 text-sm text-slate-500">
                          <div className="w-1.5 h-1.5 rounded-full bg-slate-300" />
                          {feature}
                        </div>
                      ))}
                    </div>
                  </Card>
                </motion.div>
              );
            })}
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <Button
              data-testid="start-button"
              onClick={() => selectedMode && navigate(selectedMode === 'research' ? '/research' : '/consulting')}
              disabled={!selectedMode}
              size="lg"
              className="bg-slate-900 hover:bg-slate-800 text-white px-8 py-6 text-base font-semibold disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transition-all"
            >
              Start Project
              <ChevronRight className="w-5 h-5 ml-2" />
            </Button>
            <Button
              data-testid="deliverables-bank-button"
              onClick={() => navigate('/deliverables')}
              variant="outline"
              size="lg"
              className="border-2 border-slate-200 hover:border-slate-300 text-slate-700 px-8 py-6 text-base font-semibold bg-white hover:bg-slate-50 shadow-md hover:shadow-lg transition-all"
            >
              <Database className="w-5 h-5 mr-2" />
              View Deliverables
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {stats.map((stat, index) => {
              const StatIcon = stat.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="p-6 text-center bg-white shadow-md hover:shadow-lg transition-shadow">
                    <StatIcon className="w-8 h-8 mx-auto mb-3 text-slate-400" />
                    <div className="text-3xl font-bold text-slate-900 mb-1">{stat.value}</div>
                    <div className="text-sm text-slate-600">{stat.label}</div>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      </div>
    </div>
  );
}