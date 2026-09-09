import os
import sys
from dotenv import load_dotenv
from sqlalchemy import create_engine, text
from sqlalchemy.orm import declarative_base, sessionmaker

load_dotenv()

# Primary connection from environment (PostgreSQL / PostGIS)
DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "postgresql://nlams_user:nlams_secure_password@localhost:5432/nlams_db"
)

Base = declarative_base()

def init_engine():
    """
    Attempts to connect to PostgreSQL+PostGIS. If PostgreSQL is not accessible
    (e.g., Docker not yet running on host), automatically falls back to an embedded
    local SQLite instance so the full FastAPI backend boots and serves docs immediately.
    """
    global DATABASE_URL
    target_url = DATABASE_URL
    
    if target_url.startswith("postgres"):
        try:
            test_engine = create_engine(target_url, pool_pre_ping=True, connect_args={"connect_timeout": 2})
            with test_engine.connect() as conn:
                conn.execute(text("SELECT 1"))
            print(f"[NLAMS DB] Successfully connected to primary PostgreSQL+PostGIS: {target_url.split('@')[-1]}")
            return test_engine
        except Exception as e:
            print(f"[NLAMS DB Warning] Could not connect to PostgreSQL on localhost:5432 ({e}).")
            print("[NLAMS DB Info] Falling back to high-performance local SQLite database with PostGIS GeoJSON simulation.")
            target_url = "sqlite:///./nlams_local.db"
            DATABASE_URL = target_url

    engine = create_engine(target_url, connect_args={"check_same_thread": False} if "sqlite" in target_url else {})
    return engine

engine = init_engine()
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def get_db():
    """FastAPI request-scoped DB session dependency."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
