import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { ArrowLeft, Key, Save } from 'lucide-react';
import { toast } from 'sonner';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export default function Settings() {
  const navigate = useNavigate();
  const [apiKeys, setApiKeys] = useState({
    OPENROUTER_API_KEY: '',
    GROQ_API_KEY: '',
    GEMINI_API_KEY: ''
  });

  const handleSave = async () => {
    try {
      for (const [keyName, keyValue] of Object.entries(apiKeys)) {
        if (keyValue) {
          await axios.post(`${API}/settings/api-keys`, {
            key_name: keyName,
            key_value: keyValue
          });
        }
      }
      toast.success('API keys saved successfully');
    } catch (error) {
      console.error('Failed to save API keys:', error);
      toast.error('Failed to save API keys');
    }
  };

  return (
    <div className="min-h-screen bg-background">
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

        <div className="max-w-2xl mx-auto">
          <h1 className="text-4xl font-bold mb-8" data-testid="settings-title">
            API Settings
          </h1>

          <Card className="p-8">
            <div className="space-y-6">
              <div>
                <Label htmlFor="openrouter">OpenRouter API Key</Label>
                <Input
                  id="openrouter"
                  data-testid="openrouter-key-input"
                  type="password"
                  value={apiKeys.OPENROUTER_API_KEY}
                  onChange={(e) => setApiKeys({...apiKeys, OPENROUTER_API_KEY: e.target.value})}
                  placeholder="sk-or-..."
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Used by 6 agents (PRIYA, ARJUN, RAHUL, KAVITA, VIKRAM, SAMEER)
                </p>
              </div>

              <div>
                <Label htmlFor="groq">Groq API Key</Label>
                <Input
                  id="groq"
                  data-testid="groq-key-input"
                  type="password"
                  value={apiKeys.GROQ_API_KEY}
                  onChange={(e) => setApiKeys({...apiKeys, GROQ_API_KEY: e.target.value})}
                  placeholder="gsk_..."
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Used by 1 agent (SNEHA)
                </p>
              </div>

              <div>
                <Label htmlFor="gemini">Google Gemini API Key</Label>
                <Input
                  id="gemini"
                  data-testid="gemini-key-input"
                  type="password"
                  value={apiKeys.GEMINI_API_KEY}
                  onChange={(e) => setApiKeys({...apiKeys, GEMINI_API_KEY: e.target.value})}
                  placeholder="AI..."
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Used by 1 agent (ANITA)
                </p>
              </div>

              <div className="pt-4 border-t border-border">
                <Button
                  data-testid="save-keys-button"
                  onClick={handleSave}
                  size="lg"
                  className="uppercase tracking-widest text-xs font-semibold"
                >
                  <Save className="w-4 h-4 mr-2" />
                  Save API Keys
                </Button>
              </div>

              <div className="mt-6 p-4 bg-muted rounded">
                <h3 className="font-semibold mb-2 text-sm">How to get API keys:</h3>
                <ul className="text-xs text-muted-foreground space-y-1">
                  <li>• OpenRouter: Visit openrouter.ai and sign up</li>
                  <li>• Groq: Visit console.groq.com and create an API key</li>
                  <li>• Gemini: Visit ai.google.dev and get an API key</li>
                </ul>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
