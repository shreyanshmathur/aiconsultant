import openpyxl
from openpyxl.styles import Font, PatternFill, Alignment
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
        """Generate PPT presentation using Gamma API"""
        if not self.gamma_api_key:
            return {
                "success": False,
                "error": "Gamma API key not configured"
            }
        
        try:
            headers = {
                "Authorization": f"Bearer {self.gamma_api_key}",
                "Content-Type": "application/json"
            }
            
            payload = {
                "text": content.get('text', ''),
                "title": content.get('title', 'Consulting Report'),
                "theme": "professional"
            }
            
            response = requests.post(
                "https://api.gamma.app/v1/generate",
                headers=headers,
                json=payload,
                timeout=30
            )
            
            if response.status_code == 200:
                result = response.json()
                return {
                    "success": True,
                    "presentation_url": result.get('url', ''),
                    "presentation_id": result.get('id', '')
                }
            else:
                return {
                    "success": False,
                    "error": f"Gamma API error: {response.status_code}"
                }
        except Exception as e:
            return {
                "success": False,
                "error": str(e)
            }
