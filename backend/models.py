import datetime
from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, Text, ForeignKey
from sqlalchemy.orm import relationship
from backend.database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    full_name = Column(String(255), nullable=False)
    role = Column(String(50), nullable=False, index=True)  # central-ministry, state-revenue, dro-cala, requiring-body, citizen, rehab-authority
    jurisdiction_scope = Column(String(100), default="ALL")  # e.g., "ALL", "Maharashtra", "Pune", "Gujarat"
    department = Column(String(150), nullable=True)
    linked_parcel_id = Column(String(50), nullable=True)  # for citizens
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

class Project(Base):
    __tablename__ = "projects"

    id = Column(String(64), primary_key=True, index=True)  # e.g. REQ-MH-PUN-2025-1042
    name = Column(String(255), nullable=False)
    sector = Column(String(100), nullable=False)
    agency = Column(String(100), nullable=False)  # NHAI, Railways/MRIDC, MSRDC, etc.
    requiring_body_id = Column(String(100), nullable=True)
    implementing_agency_id = Column(String(100), nullable=True)
    state = Column(String(100), nullable=False, index=True)
    district = Column(String(100), nullable=False, index=True)
    division = Column(String(100), default="Central Sub-Division")
    required_land_ha = Column(Float, nullable=False, default=0.0)
    khasra_count = Column(Integer, default=1)
    budget_cr = Column(Float, nullable=False, default=0.0)
    disbursed_cr = Column(Float, default=0.0)
    status = Column(String(50), default="Submitted", index=True)  # Submitted, Scrutinized, Notified, Awarded, Possession, Closed, Rejected, Rework
    status_badge = Column(String(50), default="Submitted")
    gazette_date = Column(String(50), default="Pending Scrutiny")
    sla_status = Column(String(100), default="Under Scrutiny Queue")
    affected_families = Column(Integer, default=0)
    rehabilitated_families = Column(Integer, default=0)
    current_milestone = Column(String(255), default="Form 1 Proposal Submitted")
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    # Relationships
    parcels = relationship("LandParcel", back_populates="project", cascade="all, delete-orphan")
    documents = relationship("Document", back_populates="project", cascade="all, delete-orphan")

class LandParcel(Base):
    __tablename__ = "land_parcels"

    id = Column(String(64), primary_key=True, index=True)  # e.g. GUT-142-1
    project_id = Column(String(64), ForeignKey("projects.id"), nullable=False, index=True)
    khasra_no = Column(String(100), nullable=False)
    gut_number = Column(String(100), nullable=False)
    village = Column(String(150), nullable=False)
    taluka = Column(String(100), default="Haveli")
    district = Column(String(100), nullable=False, index=True)
    state = Column(String(100), nullable=False, index=True)
    owner_name = Column(String(255), nullable=False)
    owner_aadhaar = Column(String(50), default="•••• •••• 8921")
    geometry = Column(Text, nullable=False)  # GeoJSON representation of polygon
    area_ha = Column(Float, nullable=False, default=1.0)
    land_type = Column(String(100), default="Agricultural (Jirayat)")
    market_rate_sqm = Column(Float, default=500.0)
    base_market_value = Column(Float, default=0.0)
    solatium_amount = Column(Float, default=0.0)
    additional_interest = Column(Float, default=0.0)
    total_compensation = Column(Float, default=0.0)
    overlap_percent = Column(Float, default=100.0)
    status = Column(String(50), default="Scrutiny", index=True)  # Scrutiny, Awarded, Notified, Disbursed, Possessed, Rejected, Rework
    status_label = Column(String(100), default="Pending Scrutiny")
    status_color = Column(String(20), default="#d97706")
    dbt_status = Column(String(100), default="Pending Award")
    possession_date = Column(String(50), nullable=True)
    possession_officer = Column(String(100), nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    # Relationships
    project = relationship("Project", back_populates="parcels")
    statutory_stages = relationship("StatutoryStage", back_populates="parcel", cascade="all, delete-orphan")
    compensation_records = relationship("Compensation", back_populates="parcel", cascade="all, delete-orphan")

class StatutoryStage(Base):
    __tablename__ = "statutory_stages"

    id = Column(Integer, primary_key=True, autoincrement=True)
    parcel_id = Column(String(64), ForeignKey("land_parcels.id"), nullable=False, index=True)
    project_id = Column(String(64), nullable=True)
    stage = Column(String(50), nullable=False)  # 3A, 3D, 3G, Possession
    gazette_ref = Column(String(100), nullable=True)
    date = Column(String(50), default=lambda: datetime.date.today().isoformat())
    document_ref = Column(String(255), nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    parcel = relationship("LandParcel", back_populates="statutory_stages")

class ScrutinyLog(Base):
    __tablename__ = "scrutiny_log"

    id = Column(Integer, primary_key=True, autoincrement=True)
    project_id = Column(String(64), nullable=False, index=True)
    parcel_id = Column(String(64), nullable=True)
    reviewer_id = Column(String(100), nullable=False)
    reviewer_name = Column(String(150), nullable=False)
    decision = Column(String(50), nullable=False)  # APPROVE, REJECT, SEND_BACK
    comments = Column(Text, nullable=True)
    timestamp = Column(DateTime, default=datetime.datetime.utcnow)

class Compensation(Base):
    __tablename__ = "compensation"

    id = Column(Integer, primary_key=True, autoincrement=True)
    parcel_id = Column(String(64), ForeignKey("land_parcels.id"), nullable=False, index=True)
    project_id = Column(String(64), nullable=True)
    amount_assessed = Column(Float, nullable=False, default=0.0)
    amount_disbursed = Column(Float, default=0.0)
    pfms_txn_id = Column(String(100), nullable=True)
    dbt_status = Column(String(100), default="Pending Award")
    disbursed_at = Column(DateTime, nullable=True)

    parcel = relationship("LandParcel", back_populates="compensation_records")

class Rehabilitation(Base):
    __tablename__ = "rehabilitation"

    id = Column(Integer, primary_key=True, autoincrement=True)
    parcel_id = Column(String(64), nullable=True)
    project_id = Column(String(64), nullable=False, index=True)
    families_affected = Column(Integer, default=0)
    families_rehabilitated = Column(Integer, default=0)
    grant_status = Column(String(100), default="Under Assessment")  # Disbursed, Housing Allocated, Complete
    officer_name = Column(String(100), nullable=True)
    completed_at = Column(DateTime, nullable=True)

class Document(Base):
    __tablename__ = "documents"

    id = Column(Integer, primary_key=True, autoincrement=True)
    project_id = Column(String(64), ForeignKey("projects.id"), nullable=False, index=True)
    parcel_id = Column(String(64), nullable=True)
    type = Column(String(100), nullable=False)  # Form 1, KML Shapefile, SIA Report, 7/12 RoR, Gazette Notice
    file_name = Column(String(255), nullable=False)
    file_url = Column(String(500), nullable=False)
    version = Column(Integer, default=1)
    uploaded_by = Column(String(150), default="Requiring Body")
    uploaded_at = Column(DateTime, default=datetime.datetime.utcnow)

    project = relationship("Project", back_populates="documents")

class AuditLog(Base):
    __tablename__ = "audit_log"

    id = Column(Integer, primary_key=True, autoincrement=True)
    entity = Column(String(100), nullable=False)
    action = Column(String(255), nullable=False)
    user_id = Column(String(100), nullable=True)
    actor_name = Column(String(150), nullable=False)
    actor_role = Column(String(100), nullable=False)
    details = Column(Text, nullable=True)
    sha256_hash = Column(String(64), nullable=False)
    timestamp = Column(DateTime, default=datetime.datetime.utcnow)

class Notification(Base):
    __tablename__ = "notifications"

    id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(String(100), nullable=True, index=True)
    event_type = Column(String(100), nullable=False)  # PROPOSAL_APPROVED, NOTIFICATION_ISSUED, AWARD_DECLARED, DBT_DISBURSED, POSSESSION_CONFIRMED
    title = Column(String(255), nullable=False)
    message = Column(Text, nullable=False)
    is_read = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

class Objection(Base):
    __tablename__ = "objections"

    id = Column(String(64), primary_key=True, index=True)  # OBJ-2025-XXXX
    parcel_id = Column(String(64), nullable=False, index=True)
    khasra_no = Column(String(100), nullable=False)
    claimant_name = Column(String(255), nullable=False)
    objection_type = Column(String(150), nullable=False)
    grounds = Column(Text, nullable=False)
    status = Column(String(50), default="Hearing Listed")
    hearing_date = Column(String(100), default="15-Dec-2025")
    action_taken = Column(Text, default="CALA Notice Issued to Requiring Body")
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

def model_to_dict(obj):
    if not obj:
        return None
    res = {}
    for c in obj.__table__.columns:
        val = getattr(obj, c.name)
        if isinstance(val, (datetime.datetime, datetime.date)):
            res[c.name] = val.isoformat()
        else:
            res[c.name] = val
    return res
