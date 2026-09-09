import os
from datetime import datetime, timezone
from contextlib import asynccontextmanager
from fastapi import FastAPI, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from sqlalchemy import text
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
    # Initialize all database tables (automatic migration on startup)
    Base.metadata.create_all(bind=engine)
    # Seed initial baseline users, projects, and parcels if database is empty
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

# Dynamic CORS Middleware configuration for Render, Vercel, and local development
cors_origins_raw = os.getenv("CORS_ORIGINS", "*")
if cors_origins_raw == "*":
    allow_origins = ["*"]
else:
    allow_origins = [o.strip() for o in cors_origins_raw.split(",") if o.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allow_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Static file serving for uploaded documents
app.mount("/uploads", StaticFiles(directory=UPLOAD_DIR), name="uploads")

# Include Departmental Feature Routers
app.include_router(auth_router.router)
app.include_router(dashboards_router.router)
app.include_router(projects_router.router)
app.include_router(parcels_router.router)
app.include_router(compensation_router.router)
app.include_router(rehabilitation_router.router)
app.include_router(documents_router.router)
app.include_router(objections_router.router)

# Health Check Endpoints (Render Health Check Path: /health)
@app.get("/health", tags=["System Health"])
@app.get("/api/health", tags=["System Health"])
def health_check():
    """
    Ultra-fast (<100ms) unauthenticated health check endpoint for Render, Docker, and uptime monitoring.
    Verifies live database connectivity using a lightweight SELECT 1 query.
    """
    db_status = "connected"
    db_error = None
    try:
        db = SessionLocal()
        db.execute(text("SELECT 1"))
        db.close()
    except Exception as e:
        db_status = "error"
        db_error = str(e)

    is_healthy = db_status == "connected"
    return {
        "status": "healthy" if is_healthy else "degraded",
        "server": "online",
        "database": db_status,
        "db_error": db_error,
        "environment": os.getenv("ENVIRONMENT", os.getenv("NODE_ENV", "development")),
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "version": "2.0.0"
    }

@app.get("/", tags=["System Health"])
def root():
    return {
        "system": "National Land Acquisition & Management System (NLAMS)",
        "version": "2.0.0",
        "status": "OPERATIONAL",
        "statute": "RFCTLARR Act 2013 / IT Act 2000",
        "documentation": "/docs",
        "health_check": "/health",
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
    # Render assigns dynamic port via PORT environment variable
    port = int(os.getenv("PORT", os.getenv("BACKEND_PORT", "8000")))
    host = os.getenv("BACKEND_HOST", "0.0.0.0")
    uvicorn.run("backend.main:app", host=host, port=port, reload=False)
