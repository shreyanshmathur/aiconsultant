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

from conference_service import ConferenceRoomService
from research_service import ResearchService
from deliverable_service import DeliverableService

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Initialize services
conference_service = ConferenceRoomService()
research_service = ResearchService()
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

# Research endpoints
@api_router.post("/research/vendor-analysis")
async def conduct_vendor_analysis(request: ResearchRequest):
    """Conduct vendor analysis with optional vendor and industry"""
    
    # Use problem statement as the main input
    problem = request.query or "General business analysis"
    
    results = await research_service.conduct_vendor_analysis(
        problem=problem,
        vendor_name=request.vendor_name,
        industry=request.industry
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
    
    return FileResponse(filepath, filename=filename)

# Settings endpoints
@api_router.post("/settings/api-keys")
async def update_api_key(key_update: APIKeyUpdate):
    """Update API key (stored in environment for session)"""
    os.environ[key_update.key_name] = key_update.key_value
    return {"success": True, "message": f"API key {key_update.key_name} updated"}

# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()