import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { motion } from 'framer-motion';
import { Button } from '../components/ui/button';
import { Sparkles, ArrowRight, Users, Search, FileText, Shield } from 'lucide-react';

export default function Landing() {
  const navigate = useNavigate();
  const { user, login } = useAuth();

  // If already logged in, redirect to dashboard
  React.useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  const features = [
    {
      icon: Search,
      title: "AI Research",
      description: "Intelligent vendor analysis with multi-vendor comparison and scoring"
    },
    {
      icon: Users,
      title: "Conference Room",
      description: "8 AI consultants debate your challenges from unique perspectives"
    },
    {
      icon: FileText,
      title: "Deliverables",
      description: "Generate professional Excel reports and presentations instantly"
    },
    {
      icon: Shield,
      title: "Enterprise Ready",
      description: "Secure, scalable, and built for serious business decisions"
    }
  ];

  return (
    <div className="min-h-screen bg-background overflow-hidden">
      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center justify-center hero-glow">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/5 via-purple-500/5 to-transparent dark:from-blue-600/10 dark:via-purple-500/10" />
        
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center max-w-4xl mx-auto"
          >
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center gap-2 px-4 py-2 glass-card mb-8"
            >
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span className="text-sm font-medium text-muted-foreground">
                Powered by 8 Specialized AI Consultants
              </span>
            </motion.div>
            
            {/* Main heading */}
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold mb-6 tracking-tight">
              <span className="gradient-text">Consultant AI</span>
            </h1>
            
            <p className="text-xl sm:text-2xl text-muted-foreground mb-8 max-w-2xl mx-auto leading-relaxed">
              McKinsey-grade strategic consulting powered by artificial intelligence. 
              Get vendor analysis, multi-perspective debates, and actionable insights.
            </p>
            
            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="flex flex-col sm:flex-row gap-4 justify-center"
            >
              <Button
                onClick={login}
                size="lg"
                className="btn-primary text-lg px-10 py-6"
                data-testid="hero-login-btn"
              >
                Get Started Free
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
              <Button
                onClick={() => navigate('/dashboard')}
                variant="outline"
                size="lg"
                className="glass-card text-lg px-10 py-6 border-2"
                data-testid="try-demo-btn"
              >
                Try Demo
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 relative">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Enterprise-Grade AI Consulting
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Everything you need to make data-driven strategic decisions
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="glass-card p-8 hover-lift"
                >
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center mb-6">
                    <Icon className="w-7 h-7 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="py-24 relative">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="glass-card p-12 text-center max-w-3xl mx-auto"
          >
            <h2 className="text-3xl font-bold mb-4">Ready to Transform Your Strategy?</h2>
            <p className="text-lg text-muted-foreground mb-8">
              Join forward-thinking leaders using AI to make better decisions
            </p>
            <Button
              onClick={login}
              size="lg"
              className="btn-primary text-lg px-12 py-6"
              data-testid="bottom-cta-btn"
            >
              Start Free with Google
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
