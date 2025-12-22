from fastapi import FastAPI, APIRouter, HTTPException, File, UploadFile
from fastapi.responses import FileResponse
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional, Dict, Any
import uuid
from datetime import datetime, timezone
import PyPDF2
import openpyxl
import io

from conference_service import ConferenceRoomService
from research_service import ResearchService
from deliverable_service import DeliverableService
from fast_ai_research import FastAIResearch

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Initialize services
conference_service = ConferenceRoomService()
research_service = ResearchService()
fast_ai_research = FastAIResearch()
deliverable_service = DeliverableService()

# Create the main app without a prefix
app = FastAPI()

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")


# Define Models
class Project(BaseModel):
    model_config = ConfigDict(extra="ignore")
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    title: str
    problem_statement: str
    project_type: str
    status: str = "in_progress"
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    research_data: Optional[Dict[str, Any]] = None
    debate_data: Optional[Dict[str, Any]] = None
    deliverables: List[str] = []

class ProjectCreate(BaseModel):
    title: str
    problem_statement: str
    project_type: str

class ResearchRequest(BaseModel):
    project_id: str
    vendor_name: Optional[str] = None
    industry: Optional[str] = None
    query: Optional[str] = None
    additional_context: Optional[str] = None

class DebateRequest(BaseModel):
    project_id: str
    problem: str

class DeliverableRequest(BaseModel):
    project_id: str
    deliverable_type: str
    content: Dict[str, Any]

class APIKeyUpdate(BaseModel):
    key_name: str
    key_value: str

# Helper functions for file parsing
def extract_text_from_pdf(file_content: bytes) -> str:
    """Extract text from PDF"""
    try:
        pdf_reader = PyPDF2.PdfReader(io.BytesIO(file_content))
        text = ""
        for page in pdf_reader.pages:
            text += page.extract_text() + "\n"
        return text
    except Exception as e:
        return f"Error reading PDF: {str(e)}"

def extract_text_from_excel(file_content: bytes) -> str:
    """Extract text from Excel"""
    try:
        wb = openpyxl.load_workbook(io.BytesIO(file_content))
        text = ""
        for sheet_name in wb.sheetnames:
            sheet = wb[sheet_name]
            text += f"\n--- Sheet: {sheet_name} ---\n"
            for row in sheet.iter_rows(values_only=True):
                row_text = " | ".join([str(cell) if cell is not None else "" for cell in row])
                if row_text.strip():
                    text += row_text + "\n"
        return text
    except Exception as e:
        return f"Error reading Excel: {str(e)}"

# Add your routes to the router instead of directly to app
@api_router.get("/")
async def root():
    return {"message": "Consultant AI Backend API"}

# Agent endpoints
@api_router.get("/agents")
async def get_agents():
    """Get all consultant agents"""
    return conference_service.get_agent_info()

# Project endpoints
@api_router.post("/projects", response_model=Project)
async def create_project(project: ProjectCreate):
    """Create a new consulting project"""
    project_dict = project.model_dump()
    project_obj = Project(**project_dict)
    
    doc = project_obj.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    doc['updated_at'] = doc['updated_at'].isoformat()
    
    await db.projects.insert_one(doc)
    return project_obj

@api_router.get("/projects", response_model=List[Project])
async def get_projects():
    """Get all projects"""
    projects = await db.projects.find({}, {"_id": 0}).to_list(1000)
    
    for project in projects:
        if isinstance(project.get('created_at'), str):
            project['created_at'] = datetime.fromisoformat(project['created_at'])
        if isinstance(project.get('updated_at'), str):
            project['updated_at'] = datetime.fromisoformat(project['updated_at'])
    
    return projects

@api_router.get("/projects/{project_id}", response_model=Project)
async def get_project(project_id: str):
    """Get a specific project"""
    project = await db.projects.find_one({"id": project_id}, {"_id": 0})
    
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    if isinstance(project.get('created_at'), str):
        project['created_at'] = datetime.fromisoformat(project['created_at'])
    if isinstance(project.get('updated_at'), str):
        project['updated_at'] = datetime.fromisoformat(project['updated_at'])
    
    return project

# File upload endpoint
@api_router.post("/research/upload")
async def upload_research_files(files: List[UploadFile] = File(...)):
    """Upload PDF/Excel files for additional context"""
    extracted_content = []
    
    for file in files:
        file_content = await file.read()
        
        if file.filename.endswith('.pdf'):
            text = extract_text_from_pdf(file_content)
            extracted_content.append({
                "filename": file.filename,
                "type": "pdf",
                "content": text[:5000]  # Limit to 5000 chars per file
            })
        elif file.filename.endswith(('.xlsx', '.xls')):
            text = extract_text_from_excel(file_content)
            extracted_content.append({
                "filename": file.filename,
                "type": "excel",
                "content": text[:5000]
            })
        else:
            extracted_content.append({
                "filename": file.filename,
                "type": "unsupported",
                "content": "File type not supported. Please upload PDF or Excel files."
            })
    
    return {
        "success": True,
        "files_processed": len(extracted_content),
        "extracted_content": extracted_content
    }

# Research endpoints
@api_router.post("/research/vendor-analysis")
async def conduct_vendor_analysis(request: ResearchRequest):
    """Conduct fast AI-powered vendor analysis"""
    
    # Use fast AI research service
    problem = request.query or "General business analysis"
    
    results = await fast_ai_research.research(
        problem=problem,
        vendor_name=request.vendor_name,
        industry=request.industry,
        additional_context=request.additional_context
    )
    
    # Update project with research data
    await db.projects.update_one(
        {"id": request.project_id},
        {"$set": {"research_data": results, "updated_at": datetime.now(timezone.utc).isoformat()}}
    )
    
    return results

@api_router.post("/research/search")
async def search_information(request: ResearchRequest):
    """Search for public information"""
    if not request.query:
        raise HTTPException(status_code=400, detail="query is required")
    
    results = await research_service.search_public_information(request.query)
    return results

# Conference room endpoints
@api_router.post("/conference/debate")
async def conduct_debate(request: DebateRequest):
    """Conduct a multi-agent debate"""
    results = await conference_service.conduct_debate(request.problem)
    
    await db.projects.update_one(
        {"id": request.project_id},
        {"$set": {"debate_data": results, "updated_at": datetime.now(timezone.utc).isoformat()}}
    )
    
    return results

# Deliverable endpoints
@api_router.post("/deliverables/excel")
async def generate_excel(request: DeliverableRequest):
    """Generate Excel deliverable"""
    filename = deliverable_service.generate_excel_report(
        request.content,
        request.deliverable_type
    )
    
    await db.projects.update_one(
        {"id": request.project_id},
        {
            "$push": {"deliverables": filename},
            "$set": {"updated_at": datetime.now(timezone.utc).isoformat()}
        }
    )
    
    return {"filename": filename, "type": "excel"}

@api_router.post("/deliverables/ppt")
async def generate_ppt(request: DeliverableRequest):
    """Generate PPT deliverable via Gamma"""
    result = await deliverable_service.generate_ppt_via_gamma(request.content)
    
    if result['success']:
        await db.projects.update_one(
            {"id": request.project_id},
            {
                "$push": {"deliverables": result['presentation_id']},
                "$set": {"updated_at": datetime.now(timezone.utc).isoformat()}
            }
        )
    
    return result

@api_router.get("/deliverables/{filename}")
async def download_deliverable(filename: str):
    """Download a deliverable file"""
    filepath = f"/app/deliverables/{filename}"
    
    if not os.path.exists(filepath):
        raise HTTPException(status_code=404, detail="File not found")
    
    return FileResponse(
        filepath, 
        filename=filename,
        media_type='application/octet-stream'
    )

# Settings endpoints
@api_router.post("/settings/api-keys")
async def update_api_key(key_update: APIKeyUpdate):
    """Update API key (stored in environment for session)"""
    os.environ[key_update.key_name] = key_update.key_value
    return {"success": True, "message": f"API key {key_update.key_name} updated"}

# Mount the router
app.include_router(api_router)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)