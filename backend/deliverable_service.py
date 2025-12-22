import openpyxl
from openpyxl.styles import Font, PatternFill, Alignment, Border, Side
import requests
import os
from typing import Dict, List
from datetime import datetime
import json

class DeliverableService:
    """Service for generating consulting deliverables (Excel, PPT)"""
    
    def __init__(self):
        self.gamma_api_key = os.getenv('GAMMA_API_KEY', '')
    
    def generate_excel_report(self, project_data: Dict, analysis_type: str) -> str:
        """Generate Excel financial model or analysis report"""
        wb = openpyxl.Workbook()
        
        if analysis_type == "financial_model":
            self._create_financial_model(wb, project_data)
        elif analysis_type == "current_state":
            self._create_current_state_analysis(wb, project_data)
        elif analysis_type == "future_state":
            self._create_future_state_analysis(wb, project_data)
        else:
            self._create_summary_report(wb, project_data)
        
        filename = f"{analysis_type}_{datetime.now().strftime('%Y%m%d_%H%M%S')}.xlsx"
        filepath = f"/app/deliverables/{filename}"
        
        os.makedirs("/app/deliverables", exist_ok=True)
        wb.save(filepath)
        
        return filename
    
    def _create_financial_model(self, wb, data: Dict):
        """Create financial model worksheet"""
        ws = wb.active
        ws.title = "Financial Model"
        
        header_fill = PatternFill(start_color="0F172A", end_color="0F172A", fill_type="solid")
        header_font = Font(color="FFFFFF", bold=True, size=12)
        
        ws['A1'] = "Financial Analysis Model"
        ws['A1'].font = Font(bold=True, size=16)
        ws['A1'].alignment = Alignment(horizontal='left')
        
        ws['A3'] = "Category"
        ws['B3'] = "Year 1"
        ws['C3'] = "Year 2"
        ws['D3'] = "Year 3"
        ws['E3'] = "Total"
        
        for cell in ['A3', 'B3', 'C3', 'D3', 'E3']:
            ws[cell].fill = header_fill
            ws[cell].font = header_font
        
        categories = [
            "Revenue",
            "Cost of Goods Sold",
            "Gross Profit",
            "Operating Expenses",
            "EBITDA",
            "Net Income"
        ]
        
        for idx, category in enumerate(categories, start=4):
            ws[f'A{idx}'] = category
            ws[f'A{idx}'].font = Font(bold=True)
        
        ws.column_dimensions['A'].width = 25
        for col in ['B', 'C', 'D', 'E']:
            ws.column_dimensions[col].width = 15
    
    def _create_current_state_analysis(self, wb, data: Dict):
        """Create current state analysis worksheet"""
        ws = wb.active
        ws.title = "Current State"
        
        ws['A1'] = "Current State Analysis"
        ws['A1'].font = Font(bold=True, size=16)
        
        ws['A3'] = "Problem Statement:"
        ws['A3'].font = Font(bold=True)
        ws['A4'] = data.get('problem', 'No problem statement provided')
        ws['A4'].alignment = Alignment(wrap_text=True)
        
        ws['A6'] = "Key Findings:"
        ws['A6'].font = Font(bold=True)
        
        findings = data.get('findings', [])
        for idx, finding in enumerate(findings, start=7):
            ws[f'A{idx}'] = f"• {finding}"
            ws[f'A{idx}'].alignment = Alignment(wrap_text=True)
        
        ws.column_dimensions['A'].width = 80
    
    def _create_future_state_analysis(self, wb, data: Dict):
        """Create future state analysis worksheet"""
        ws = wb.active
        ws.title = "Future State"
        
        ws['A1'] = "Future State Vision"
        ws['A1'].font = Font(bold=True, size=16)
        
        ws['A3'] = "Recommended Solution:"
        ws['A3'].font = Font(bold=True)
        ws['A4'] = data.get('solution', 'No solution provided')
        ws['A4'].alignment = Alignment(wrap_text=True)
        
        ws['A6'] = "Implementation Roadmap:"
        ws['A6'].font = Font(bold=True)
        
        roadmap = data.get('roadmap', [])
        for idx, step in enumerate(roadmap, start=7):
            ws[f'A{idx}'] = f"{idx-6}. {step}"
            ws[f'A{idx}'].alignment = Alignment(wrap_text=True)
        
        ws.column_dimensions['A'].width = 80
    
    def _create_summary_report(self, wb, data: Dict):
        """Create summary report worksheet"""
        ws = wb.active
        ws.title = "Executive Summary"
        
        ws['A1'] = "Executive Summary"
        ws['A1'].font = Font(bold=True, size=16)
        
        ws['A3'] = "Project Overview:"
        ws['A3'].font = Font(bold=True)
        ws['A4'] = data.get('overview', 'Summary not available')
        
        ws.column_dimensions['A'].width = 80
    
    async def generate_ppt_via_gamma(self, content: Dict) -> Dict:
        """Generate PPT presentation using Gamma API with HTML fallback"""
        if not self.gamma_api_key:
            return await self._generate_html_presentation(content)
        
        try:
            headers = {
                "Authorization": f"Bearer {self.gamma_api_key}",
                "Content-Type": "application/json"
            }
            
            # Try Gamma API v1.0
            payload = {
                "inputText": content.get('text', ''),
                "title": content.get('title', 'Consulting Report')
            }
            
            # Try multiple possible endpoints
            endpoints = [
                "https://api.gamma.app/v1.0/presentations",
                "https://api.gamma.app/api/v1/decks",
                "https://api.gamma.app/v1.0/decks"
            ]
            
            for endpoint in endpoints:
                try:
                    response = requests.post(
                        endpoint,
                        headers=headers,
                        json=payload,
                        timeout=30
                    )
                    
                    if response.status_code in [200, 201]:
                        result = response.json()
                        return {
                            "success": True,
                            "presentation_url": result.get('url', result.get('webUrl', '')),
                            "presentation_id": result.get('id', ''),
                            "type": "gamma"
                        }
                except:
                    continue
            
            # If all Gamma endpoints fail, use HTML presentation
            return await self._generate_html_presentation(content)
            
        except Exception as e:
            return await self._generate_html_presentation(content)
    
    async def _generate_html_presentation(self, content: Dict) -> Dict:
        """Generate a professional HTML presentation file"""
        try:
            filename = f"presentation_{datetime.now().strftime('%Y%m%d_%H%M%S')}.html"
            filepath = f"/app/deliverables/{filename}"
            
            os.makedirs("/app/deliverables", exist_ok=True)
            
            title = content.get('title', 'Consulting Report')
            text = content.get('text', 'No content provided')
            
            # Parse text into slides
            slides = self._parse_content_to_slides(title, text)
            
            html_content = self._generate_presentation_html(title, slides)
            
            with open(filepath, 'w') as f:
                f.write(html_content)
            
            return {
                "success": True,
                "presentation_url": f"/api/deliverables/{filename}",
                "presentation_id": filename,
                "type": "html",
                "note": "Interactive HTML presentation. Open in browser for best experience."
            }
        except Exception as e:
            return {
                "success": False,
                "error": str(e)
            }
    
    def _parse_content_to_slides(self, title: str, text: str) -> List[Dict]:
        """Parse text content into slide format"""
        slides = [{"title": title, "content": ["Executive Summary"], "type": "title"}]
        
        lines = text.split('\n')
        current_section = None
        current_content = []
        
        for line in lines:
            line = line.strip()
            if not line:
                continue
            
            # Check for section headers
            if line.startswith('Problem:') or line.startswith('Challenge:'):
                if current_section:
                    slides.append({"title": current_section, "content": current_content, "type": "content"})
                current_section = "The Challenge"
                current_content = [line.replace('Problem:', '').replace('Challenge:', '').strip()]
            elif line.startswith('Consensus:') or line.startswith('Summary:'):
                if current_section:
                    slides.append({"title": current_section, "content": current_content, "type": "content"})
                current_section = "Executive Summary"
                current_content = [line.replace('Consensus:', '').replace('Summary:', '').strip()]
            elif line.startswith('Recommendation') or line.startswith('Next Step'):
                if current_section:
                    slides.append({"title": current_section, "content": current_content, "type": "content"})
                current_section = "Recommendations"
                current_content = []
            elif line.startswith(('-', '•', '*')) or (len(line) > 2 and line[0].isdigit() and line[1] in '.):'):
                clean = line.lstrip('-•*0123456789.)').strip()
                if clean:
                    current_content.append(clean)
            elif current_section:
                current_content.append(line)
        
        if current_section and current_content:
            slides.append({"title": current_section, "content": current_content, "type": "content"})
        
        # Add conclusion slide
        slides.append({"title": "Next Steps", "content": ["Review recommendations", "Schedule follow-up meeting", "Begin implementation planning"], "type": "content"})
        
        return slides
    
    def _generate_presentation_html(self, title: str, slides: List[Dict]) -> str:
        """Generate professional HTML presentation"""
        slides_html = ""
        for i, slide in enumerate(slides):
            slide_type = slide.get('type', 'content')
            
            if slide_type == 'title':
                slides_html += f'''
                <div class="slide title-slide" data-slide="{i}">
                    <h1>{slide['title']}</h1>
                    <p class="subtitle">{slide['content'][0] if slide['content'] else ''}</p>
                </div>
                '''
            else:
                content_html = ""
                for item in slide.get('content', []):
                    content_html += f"<li>{item}</li>\n"
                
                slides_html += f'''
                <div class="slide" data-slide="{i}">
                    <h2>{slide['title']}</h2>
                    <ul>{content_html}</ul>
                </div>
                '''
        
        return f'''<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{title}</title>
    <style>
        * {{ margin: 0; padding: 0; box-sizing: border-box; }}
        body {{
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
            background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);
            color: white;
            min-height: 100vh;
        }}
        .presentation {{
            max-width: 1200px;
            margin: 0 auto;
            padding: 40px 20px;
        }}
        .slide {{
            background: rgba(255, 255, 255, 0.05);
            backdrop-filter: blur(20px);
            border: 1px solid rgba(255, 255, 255, 0.1);
            border-radius: 24px;
            padding: 60px;
            margin-bottom: 40px;
            min-height: 500px;
            display: flex;
            flex-direction: column;
            justify-content: center;
        }}
        .title-slide {{
            text-align: center;
            background: linear-gradient(135deg, rgba(59, 130, 246, 0.2) 0%, rgba(147, 51, 234, 0.2) 100%);
        }}
        .title-slide h1 {{
            font-size: 3.5rem;
            font-weight: 700;
            margin-bottom: 20px;
            background: linear-gradient(135deg, #60a5fa, #a78bfa);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
        }}
        .subtitle {{
            font-size: 1.5rem;
            color: rgba(255, 255, 255, 0.7);
        }}
        h2 {{
            font-size: 2.5rem;
            font-weight: 600;
            margin-bottom: 40px;
            color: #60a5fa;
        }}
        ul {{
            list-style: none;
            padding: 0;
        }}
        li {{
            font-size: 1.25rem;
            line-height: 1.8;
            padding: 15px 0;
            padding-left: 40px;
            position: relative;
            color: rgba(255, 255, 255, 0.9);
        }}
        li::before {{
            content: '→';
            position: absolute;
            left: 0;
            color: #60a5fa;
        }}
        .nav {{
            position: fixed;
            bottom: 30px;
            right: 30px;
            display: flex;
            gap: 10px;
        }}
        .nav button {{
            background: rgba(255, 255, 255, 0.1);
            border: 1px solid rgba(255, 255, 255, 0.2);
            color: white;
            padding: 15px 25px;
            border-radius: 12px;
            cursor: pointer;
            font-size: 1rem;
            transition: all 0.3s;
        }}
        .nav button:hover {{
            background: rgba(255, 255, 255, 0.2);
        }}
        .slide-counter {{
            position: fixed;
            bottom: 30px;
            left: 30px;
            color: rgba(255, 255, 255, 0.5);
            font-size: 0.9rem;
        }}
        @media print {{
            .slide {{ page-break-after: always; min-height: 100vh; }}
            .nav, .slide-counter {{ display: none; }}
        }}
    </style>
</head>
<body>
    <div class="presentation">
        {slides_html}
    </div>
    <div class="nav">
        <button onclick="prevSlide()">← Previous</button>
        <button onclick="nextSlide()">Next →</button>
    </div>
    <div class="slide-counter">
        <span id="current">1</span> / <span id="total">{len(slides)}</span>
    </div>
    <script>
        let currentSlide = 0;
        const slides = document.querySelectorAll('.slide');
        const total = slides.length;
        
        function showSlide(n) {{
            slides.forEach((s, i) => s.style.display = i === n ? 'flex' : 'none');
            document.getElementById('current').textContent = n + 1;
        }}
        
        function nextSlide() {{ if (currentSlide < total - 1) showSlide(++currentSlide); }}
        function prevSlide() {{ if (currentSlide > 0) showSlide(--currentSlide); }}
        
        document.addEventListener('keydown', (e) => {{
            if (e.key === 'ArrowRight' || e.key === ' ') nextSlide();
            if (e.key === 'ArrowLeft') prevSlide();
        }});
        
        showSlide(0);
    </script>
</body>
</html>'''
