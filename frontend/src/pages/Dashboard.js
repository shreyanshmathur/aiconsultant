import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { FileText, Users, Database, Search, Sparkles, Zap, TrendingUp } from 'lucide-react';
import ParticleBackground from '../components/ParticleBackground';
import '../enhanced.css';

export default function Dashboard() {
  const navigate = useNavigate();
  const [selectedMode, setSelectedMode] = useState(null);

  const modes = [
    {
      id: 'research',
      title: 'Research Only',
      description: 'Deep vendor analysis, competitor intelligence, and market research',
      icon: Search,
      gradient: 'from-purple-600 to-blue-600',
      color: 'bg-gradient-to-r from-purple-600 to-blue-600'
    },
    {
      id: 'full-consulting',
      title: 'Full Consulting',
      description: '8-agent conference room debate with comprehensive deliverables',
      icon: Users,
      gradient: 'from-pink-600 to-rose-600',
      color: 'bg-gradient-to-r from-pink-600 to-rose-600'
    }
  ];

  const stats = [
    { value: '8', label: 'AI Consultants', icon: Users, color: 'text-purple-500' },
    { value: '50+', label: 'Free APIs', icon: Database, color: 'text-blue-500' },
    { value: '3', label: 'Debate Rounds', icon: Zap, color: 'text-pink-500' },
    { value: '100%', label: 'Sector Agnostic', icon: TrendingUp, color: 'text-rose-500' }
  ];

  const handleStart = () => {
    if (selectedMode === 'research') {
      navigate('/research');
    } else if (selectedMode === 'full-consulting') {
      navigate('/consulting');
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden" style={{background: 'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)', backgroundSize: '400% 400%', animation: 'gradient-shift 15s ease infinite'}}>
      <ParticleBackground />
      
      <div className="content-layer container mx-auto px-6 py-12">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-6xl mx-auto"
        >
          <div className="mb-16 text-center">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-card mb-6"
            >
              <Sparkles className="w-4 h-4 text-yellow-300" />
              <span className="text-white text-sm font-medium">Powered by 8 Specialized AI Agents</span>
            </motion.div>
            
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="text-6xl md:text-7xl font-bold mb-6 text-white text-glow"
              data-testid="dashboard-title"
            >
              Consultant AI
            </motion.h1>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.6 }}
              className="text-xl text-white/90 max-w-2xl mx-auto"
            >
              McKinsey-grade consulting powered by cutting-edge AI technology
            </motion.p>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.6 }}
            className="grid md:grid-cols-2 gap-8 mb-12"
          >
            {modes.map((mode, index) => {
              const Icon = mode.icon;
              const isSelected = selectedMode === mode.id;
              
              return (
                <motion.div
                  key={mode.id}
                  whileHover={{ scale: 1.05, y: -10 }}
                  whileTap={{ scale: 0.95 }}
                  transition={{ type: 'spring', stiffness: 300 }}
                >
                  <Card
                    data-testid={`mode-card-${mode.id}`}
                    className={`p-8 cursor-pointer border-2 relative overflow-hidden group ${
                      isSelected ? 'border-white glow-effect' : 'border-white/30 glass-card'
                    }`}
                    onClick={() => setSelectedMode(mode.id)}
                  >
                    <div className="absolute inset-0 bg-gradient-to-r ${mode.gradient} opacity-0 group-hover:opacity-10 transition-opacity" />
                    
                    <div className="relative z-10">
                      <div className={`inline-flex p-4 rounded-xl ${mode.color} mb-4 group-hover:scale-110 transition-transform`}>
                        <Icon className="w-8 h-8 text-white" />
                      </div>
                      <h3 className="text-3xl font-bold mb-3 text-white">{mode.title}</h3>
                      <p className="text-white/80 text-lg">{mode.description}</p>
                    </div>
                    
                    {isSelected && (
                      <motion.div
                        layoutId="selected-indicator"
                        className="absolute top-4 right-4"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: 'spring' }}
                      >
                        <div className="w-6 h-6 rounded-full bg-white flex items-center justify-center">
                          <div className="w-3 h-3 rounded-full bg-gradient-to-r ${mode.gradient}" />
                        </div>
                      </motion.div>
                    )}
                  </Card>
                </motion.div>
              );
            })}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.6 }}
            className="flex flex-wrap gap-4 mb-16 justify-center"
          >
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                data-testid="start-button"
                onClick={handleStart}
                disabled={!selectedMode}
                size="lg"
                className="uppercase tracking-widest text-sm font-bold px-8 py-6 bg-white text-purple-600 hover:bg-white/90 disabled:opacity-50 shadow-2xl"
              >
                <Zap className="w-5 h-5 mr-2" />
                Start Project
              </Button>
            </motion.div>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                data-testid="deliverables-bank-button"
                onClick={() => navigate('/deliverables')}
                size="lg"
                className="uppercase tracking-widest text-sm font-bold px-8 py-6 glass-card text-white border-white/30 hover:bg-white/10"
              >
                <Database className="w-5 h-5 mr-2" />
                Deliverables Bank
              </Button>
            </motion.div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1, duration: 0.6 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-6"
          >
            {stats.map((stat, index) => {
              const StatIcon = stat.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 1 + index * 0.1 }}
                  whileHover={{ y: -5 }}
                >
                  <Card className="p-6 text-center glass-card border-white/20 hover:border-white/40 transition-all">
                    <StatIcon className={`w-8 h-8 mx-auto mb-3 ${stat.color}`} />
                    <div className="text-4xl font-bold text-white mb-2">{stat.value}</div>
                    <div className="text-sm text-white/70">{stat.label}</div>
                  </Card>
                </motion.div>
              );
            })}
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
