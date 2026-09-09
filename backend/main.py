import os
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from backend.database import engine, Base, SessionLocal
from backend.seed_data import seed_database
from backend.routers import (
    auth_router,
    dashboards_router,
    projects_router,
    parcels_router,
    compensation_router,
    rehabilitation_router,
    documents_router,
    objections_router
)

UPLOAD_DIR = os.getenv("UPLOAD_DIR", "uploads")
os.makedirs(UPLOAD_DIR, exist_ok=True)

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Initialize all database tables
    Base.metadata.create_all(bind=engine)
    # Seed initial users, projects, and parcels
    db = SessionLocal()
    try:
        seed_database(db)
    finally:
        db.close()
    yield

app = FastAPI(
    title="National Land Acquisition & Management System (NLAMS)",
    description=(
        "Unified Departmental Land Acquisition RESTful API Engine (SIH 26016) "
        "under RFCTLARR Act 2013 for the Department of Land Resources (DoLR), "
        "Ministry of Rural Development, Government of India."
    ),
    version="2.0.0",
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS Middleware allowing localhost:3000 and Vercel deployments
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Static file serving for uploaded documents
app.mount("/uploads", StaticFiles(directory=UPLOAD_DIR), name="uploads")

# Include Routers
app.include_router(auth_router.router)
app.include_router(dashboards_router.router)
app.include_router(projects_router.router)
app.include_router(parcels_router.router)
app.include_router(compensation_router.router)
app.include_router(rehabilitation_router.router)
app.include_router(documents_router.router)
app.include_router(objections_router.router)

@app.get("/", tags=["System Health"])
def root():
    return {
        "system": "National Land Acquisition & Management System (NLAMS)",
        "version": "2.0.0",
        "status": "OPERATIONAL",
        "statute": "RFCTLARR Act 2013 / IT Act 2000",
        "documentation": "/docs",
        "database": "PostgreSQL+PostGIS / Spatial Engine Active",
        "supported_roles": [
            "central-ministry",
            "state-revenue",
            "dro-cala",
            "requiring-body",
            "rehab-authority",
            "citizen"
        ]
    }

if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("BACKEND_PORT", "8000"))
    host = os.getenv("BACKEND_HOST", "0.0.0.0")
    uvicorn.run("backend.main:app", host=host, port=port, reload=True)
