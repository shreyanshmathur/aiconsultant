import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { FileText, Users, Database, Search } from 'lucide-react';

export default function Dashboard() {
  const navigate = useNavigate();
  const [selectedMode, setSelectedMode] = useState(null);

  const modes = [
    {
      id: 'research',
      title: 'Research Only',
      description: 'Deep vendor analysis, competitor intelligence, and market research',
      icon: Search,
      color: 'accent'
    },
    {
      id: 'full-consulting',
      title: 'Full Consulting',
      description: '8-agent conference room debate with comprehensive deliverables',
      icon: Users,
      color: 'primary'
    }
  ];

  const handleStart = () => {
    if (selectedMode === 'research') {
      navigate('/research');
    } else if (selectedMode === 'full-consulting') {
      navigate('/consulting');
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-6 py-12">
        <div className="max-w-6xl mx-auto">
          <div className="mb-16">
            <h1 className="text-5xl font-bold mb-4 text-foreground" data-testid="dashboard-title">
              Consultant AI
            </h1>
            <p className="text-lg text-muted-foreground">
              McKinsey-grade consulting powered by 8 specialized AI agents
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 mb-12">
            {modes.map((mode) => {
              const Icon = mode.icon;
              const isSelected = selectedMode === mode.id;
              
              return (
                <Card
                  key={mode.id}
                  data-testid={`mode-card-${mode.id}`}
                  className={`p-8 cursor-pointer border-2 hover-scale ${
                    isSelected ? 'border-accent shadow-lg' : 'border-border'
                  }`}
                  onClick={() => setSelectedMode(mode.id)}
                >
                  <Icon className={`w-12 h-12 mb-4 ${
                    isSelected ? 'text-accent' : 'text-muted-foreground'
                  }`} />
                  <h3 className="text-2xl font-bold mb-2">{mode.title}</h3>
                  <p className="text-muted-foreground">{mode.description}</p>
                </Card>
              );
            })}
          </div>

          <div className="flex gap-4">
            <Button
              data-testid="start-button"
              onClick={handleStart}
              disabled={!selectedMode}
              size="lg"
              className="uppercase tracking-widest text-xs font-semibold"
            >
              Start Project
            </Button>
            <Button
              data-testid="deliverables-bank-button"
              onClick={() => navigate('/deliverables')}
              variant="outline"
              size="lg"
              className="uppercase tracking-widest text-xs font-semibold"
            >
              <Database className="w-4 h-4 mr-2" />
              Deliverables Bank
            </Button>
          </div>

          <div className="mt-16 grid md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-4xl font-bold text-accent mb-2">8</div>
              <div className="text-sm text-muted-foreground">AI Consultants</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-accent mb-2">50+</div>
              <div className="text-sm text-muted-foreground">Free APIs</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-accent mb-2">3</div>
              <div className="text-sm text-muted-foreground">Debate Rounds</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-accent mb-2">100%</div>
              <div className="text-sm text-muted-foreground">Sector Agnostic</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
