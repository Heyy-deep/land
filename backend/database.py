import os
import sys
from dotenv import load_dotenv
from sqlalchemy import create_engine, text
from sqlalchemy.orm import declarative_base, sessionmaker

load_dotenv()

# Primary connection from environment (PostgreSQL / PostGIS or SQLite fallback)
DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "postgresql://nlams_user:nlams_secure_password@localhost:5432/nlams_db"
)

Base = declarative_base()

def init_engine():
    """
    Initializes SQLAlchemy database engine with automatic Render PostgreSQL format normalization
    and high-performance local SQLite fallback for seamless zero-config local development.
    """
    global DATABASE_URL
    target_url = DATABASE_URL

    # Render uses postgres:// URLs by default; SQLAlchemy 2.0 requires postgresql://
    if target_url.startswith("postgres://"):
        target_url = target_url.replace("postgres://", "postgresql://", 1)
        DATABASE_URL = target_url

    if target_url.startswith("postgresql"):
        try:
            test_engine = create_engine(
                target_url,
                pool_pre_ping=True,
                pool_recycle=300,
                connect_args={"connect_timeout": 3}
            )
            with test_engine.connect() as conn:
                conn.execute(text("SELECT 1"))
            print("[NLAMS DB] Successfully connected to primary PostgreSQL+PostGIS database.")

            # Attempt to ensure PostGIS extension is active
            try:
                with test_engine.connect() as conn:
                    conn.execute(text("CREATE EXTENSION IF NOT EXISTS postgis;"))
                    conn.commit()
                print("[NLAMS DB] PostGIS spatial extension verified & enabled.")
            except Exception as pe:
                print(f"[NLAMS DB Note] PostGIS extension notice: {pe}")

            return test_engine
        except Exception as e:
            print(f"[NLAMS DB Notice] Primary PostgreSQL not accessible ({e}).")
            print("[NLAMS DB Fallback] Initializing high-performance embedded SQLite instance with PostGIS GeoJSON simulation.")
            target_url = "sqlite:///./nlams_local.db"
            DATABASE_URL = target_url

    # SQLite fallback engine
    engine = create_engine(
        target_url,
        connect_args={"check_same_thread": False} if "sqlite" in target_url else {},
        pool_pre_ping=True
    )
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
