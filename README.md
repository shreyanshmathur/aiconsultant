# Consultant AI - McKinsey-Grade AI Consulting Platform

A comprehensive consulting AI system powered by 8 specialized AI agents that provides deep research, multi-agent debates, and professional deliverables.

## Features

### 🔍 Research Module
- Deep vendor analysis and competitor intelligence
- Web scraping and market research
- Automated data gathering from public sources
- Integration with 50+ free APIs for business intelligence

### 👥 Conference Room (8 AI Agents)
- **PRIYA SHARMA** - India Market Strategy Lead (Qwen 235B via OpenRouter)
- **ARJUN IYER** - Technology Architect (DeepSeek V3.1 via OpenRouter)
- **SNEHA KAPOOR** - Digital Transformation Lead (Llama 3.3 70B via Groq)
- **RAHUL MENON** - SaaS & Product Strategy (Mistral Small via OpenRouter)
- **DR. KAVITA REDDY** - Data & AI Specialist (Qwen Coder 480B via OpenRouter)
- **VIKRAM SINGH** - Security & Compliance (Hermes 3 405B via OpenRouter)
- **ANITA DESAI** - Customer & Market Insights (Gemini 2.0 Flash via Google)
- **SAMEER MALHOTRA** - The Reality Check (Llama 3.3 70B via OpenRouter)

### 📊 Deliverable Generation
- Excel financial models and analysis reports
- PowerPoint presentations via Gamma API
- Current State, Future State, and Conclusion reports
- Professional consulting frameworks (McKinsey, BCG, PWC style)

### 🗄️ Deliverables Bank
- Centralized repository for all past projects
- Search and filter functionality
- One-click download of all deliverables

## Tech Stack

- **Frontend:** React 19, Tailwind CSS, Shadcn UI
- **Backend:** FastAPI (Python), Motor (MongoDB async)
- **Database:** MongoDB
- **AI Models:** OpenRouter, Groq, Google Gemini
- **Deliverables:** openpyxl (Excel), Gamma API (PPT)

## Getting Started

### API Keys Required

To use the 8-agent conference room, you need:

1. **OpenRouter API Key** - Get from https://openrouter.ai (for 6 agents)
2. **Groq API Key** - Get from https://console.groq.com (for 1 agent)
3. **Google Gemini API Key** - Get from https://ai.google.dev (for 1 agent)
4. **Gamma API Key** - Already configured for PPT generation

Configure keys in the Settings page.

## Usage

### 1. Research Only Mode
- Select "Research Only" on dashboard
- Enter project details, vendor name, and industry
- Get comprehensive vendor analysis
- Download Excel deliverable

### 2. Full Consulting Mode
- Select "Full Consulting" on dashboard
- Enter problem statement
- Watch 8 agents debate in real-time (3 rounds)
- Get consensus recommendations
- Generate Excel + PPT deliverables

### 3. Deliverables Bank
- View all past projects
- Search and filter
- Download deliverables

## Project Structure

```
/app/
├── backend/
│   ├── server.py              # Main FastAPI app
│   ├── agents.py              # 8 AI consultant agents
│   ├── conference_service.py  # Multi-agent debate
│   ├── research_service.py    # Research module
│   └── deliverable_service.py # Excel & PPT generation
├── frontend/
│   ├── src/pages/             # Dashboard, Research, Consulting, etc.
│   └── src/components/ui/     # Shadcn UI components
└── deliverables/              # Generated files
```

## API Endpoints

- `POST /api/projects` - Create project
- `POST /api/research/vendor-analysis` - Conduct research
- `POST /api/conference/debate` - Run agent debate
- `POST /api/deliverables/excel` - Generate Excel
- `POST /api/deliverables/ppt` - Generate PPT
- `GET /api/deliverables/{filename}` - Download file

## Design

- **Typography**: Playfair Display + Inter
- **Colors**: Deep Navy (#0F172A) + White + Electric Blue (#2563EB)
- **Style**: Professional, McKinsey-grade consulting interface

## License

MIT License - Built with Emergent
