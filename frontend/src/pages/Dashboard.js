import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { motion } from 'framer-motion';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Search, Users, Database, Sparkles, ArrowRight, FileText, TrendingUp } from 'lucide-react';

export default function Dashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const modes = [
    {
      id: 'research',
      title: 'Research Mode',
      description: 'AI-powered vendor analysis with multi-vendor comparison and scoring',
      icon: Search,
      features: ['Auto vendor discovery', 'Competitor analysis', 'Scoring & rankings'],
      gradient: 'from-blue-500/20 to-cyan-500/20',
      iconBg: 'from-blue-500 to-cyan-500',
      path: '/research'
    },
    {
      id: 'consulting',
      title: 'Conference Room',
      description: '8 AI consultants collaborate and debate your business challenges',
      icon: Users,
      features: ['Multi-agent debate', 'Strategic synthesis', 'Action roadmap'],
      gradient: 'from-purple-500/20 to-pink-500/20',
      iconBg: 'from-purple-500 to-pink-500',
      path: '/consulting'
    }
  ];

  const quickActions = [
    { icon: FileText, label: 'View Deliverables', path: '/deliverables', color: 'text-emerald-500' },
    { icon: TrendingUp, label: 'New Research', path: '/research', color: 'text-blue-500' },
    { icon: Users, label: 'Start Debate', path: '/consulting', color: 'text-purple-500' }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative py-12 lg:py-20 hero-glow">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/5 via-purple-500/5 to-transparent dark:from-blue-600/10 dark:via-purple-500/10" />
        
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-4xl mx-auto text-center mb-12"
          >
            {/* Welcome message */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 }}
              className="inline-flex items-center gap-2 px-4 py-2 glass-card mb-6"
            >
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span className="text-sm font-medium text-muted-foreground">
                {user ? `Welcome back, ${user.name?.split(' ')[0]}` : 'Welcome to Consultant AI'}
              </span>
            </motion.div>
            
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-4 tracking-tight">
              <span className="gradient-text">Strategy Command Center</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Choose your analysis mode and get McKinsey-grade insights in minutes
            </p>
          </motion.div>

          {/* Mode Selection - One Click Cards */}
          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto mb-12">
            {modes.map((mode, index) => {
              const Icon = mode.icon;
              return (
                <motion.div
                  key={mode.id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 + index * 0.1 }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Card
                    className={`glass-card p-8 cursor-pointer hover-lift overflow-hidden relative group`}
                    onClick={() => navigate(mode.path)}
                    data-testid={`mode-card-${mode.id}`}
                  >
                    {/* Background gradient */}
                    <div className={`absolute inset-0 bg-gradient-to-br ${mode.gradient} opacity-50 group-hover:opacity-70 transition-opacity`} />
                    
                    <div className="relative z-10">
                      <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${mode.iconBg} flex items-center justify-center mb-6 shadow-lg`}>
                        <Icon className="w-8 h-8 text-white" />
                      </div>
                      
                      <h2 className="text-2xl font-bold mb-3">{mode.title}</h2>
                      <p className="text-muted-foreground mb-6 leading-relaxed">{mode.description}</p>
                      
                      <div className="space-y-2 mb-6">
                        {mode.features.map((feature, idx) => (
                          <div key={idx} className="flex items-center gap-2 text-sm text-muted-foreground">
                            <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                            {feature}
                          </div>
                        ))}
                      </div>
                      
                      <Button className="w-full btn-primary group-hover:shadow-xl">
                        Get Started
                        <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                      </Button>
                    </div>
                  </Card>
                </motion.div>
              );
            })}
          </div>

          {/* Quick Actions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="flex flex-wrap justify-center gap-4"
          >
            {quickActions.map((action, index) => {
              const Icon = action.icon;
              return (
                <Button
                  key={index}
                  variant="outline"
                  onClick={() => navigate(action.path)}
                  className="glass-card border-2 hover:border-primary/50 px-6"
                  data-testid={`quick-action-${index}`}
                >
                  <Icon className={`w-4 h-4 mr-2 ${action.color}`} />
                  {action.label}
                </Button>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
            {[
              { value: '8', label: 'AI Consultants', icon: Users },
              { value: '50+', label: 'Data Sources', icon: Database },
              { value: '3', label: 'Debate Rounds', icon: TrendingUp },
              { value: '100%', label: 'AI Powered', icon: Sparkles }
            ].map((stat, index) => {
              const StatIcon = stat.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 + index * 0.1 }}
                >
                  <Card className="glass-card p-6 text-center hover-lift">
                    <StatIcon className="w-8 h-8 mx-auto mb-3 text-primary/70" />
                    <div className="text-3xl font-bold gradient-text mb-1">{stat.value}</div>
                    <div className="text-sm text-muted-foreground">{stat.label}</div>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}
