import hashlib
import json
import random
from typing import Optional, List
from pydantic import BaseModel
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from backend.database import get_db
from backend.models import Project, LandParcel, ScrutinyLog, AuditLog, User, model_to_dict
from backend.auth import get_current_user
from backend.notifications import send_notification

router = APIRouter(prefix="/projects", tags=["Stage 1 & 2: Projects & Scrutiny"])

class ProposalCreate(BaseModel):
    name: str
    sector: str
    agency: Optional[str] = "National Highways Authority of India (NHAI)"
    state: Optional[str] = "Maharashtra"
    district: Optional[str] = "Pune"
    division: Optional[str] = "Haveli Sub-Division"
    required_land_ha: float
    budget_cr: float
    affected_families: Optional[int] = 120

class ScrutinyDecision(BaseModel):
    decision: str  # APPROVE, REJECT, SEND_BACK
    comments: Optional[str] = "Bhulekh RoR records verified against cadastre."

@router.post("", status_code=status.HTTP_201_CREATED)
def submit_proposal(
    req: ProposalCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Stage 1: Proposal Submission by Land Requiring Body."""
    state_prefix = (req.state[:2] if req.state else "MH").upper()
    dist_prefix = (req.district[:3] if req.district else "PUN").upper()
    proj_id = f"REQ-{state_prefix}-{dist_prefix}-2025-{random.randint(1000, 9999)}"

    new_project = Project(
        id=proj_id,
        name=req.name,
        sector=req.sector,
        agency=req.agency,
        state=req.state,
        district=req.district,
        division=req.division,
        required_land_ha=req.required_land_ha,
        budget_cr=req.budget_cr,
        disbursed_cr=0.0,
        status="Submitted",
        status_badge="Submitted",
        gazette_date="Pending Scrutiny",
        sla_status="Under Scrutiny Queue",
        affected_families=req.affected_families or 120,
        rehabilitated_families=0,
        current_milestone="Form 1 Proposal Submitted for CALA Scrutiny"
    )
    db.add(new_project)

    # Auto-generate corresponding initial parcel for scrutiny
    parcel_id = f"GUT-{random.randint(200, 899)}"
    gut_num = f"Gut No. {random.randint(150, 450)}/{chr(65 + random.randint(0, 5))}"
    base_val = round(req.required_land_ha * 650000.0, 2)

    new_parcel = LandParcel(
        id=parcel_id,
        project_id=proj_id,
        khasra_no=f"K-{random.randint(100, 900)}",
        gut_number=gut_num,
        village=f"{req.district} Sector {random.randint(1, 6)}",
        taluka="Haveli",
        district=req.district,
        state=req.state,
        owner_name="M/s Greenfield Agritech & Joint Landholders",
        owner_aadhaar="•••• •••• 9102",
        geometry=json.dumps({
            "type": "Polygon",
            "coordinates": [[[73.85, 18.52], [73.86, 18.52], [73.86, 18.53], [73.85, 18.53], [73.85, 18.52]]]
        }),
        area_ha=req.required_land_ha,
        land_type="Dry Agricultural (Jirayat)",
        market_rate_sqm=650.0,
        base_market_value=base_val,
        solatium_amount=base_val,
        additional_interest=round(base_val * 0.12, 2),
        total_compensation=round(base_val * 2.12, 2),
        status="Scrutiny",
        status_label="Pending Scrutiny",
        status_color="#d97706",
        dbt_status="Pending Section 3G Award"
    )
    db.add(new_parcel)

    # Audit log
    audit = AuditLog(
        entity=f"Project:{proj_id}",
        action="PROPOSAL_SUBMITTED",
        user_id=current_user.email,
        actor_name=current_user.full_name,
        actor_role=current_user.role,
        details=f"Submitted Form 1 Acquisition Proposal: {req.name} ({gut_num})",
        sha256_hash=hashlib.sha256(f"{proj_id}:{req.name}".encode()).hexdigest()
    )
    db.add(audit)
    db.commit()
    db.refresh(new_project)

    # Trigger notification
    send_notification(
        user_id="dro.pune@dolr.gov.in",
        event_type="PROPOSAL_SUBMITTED",
        title="New Form 1 Requisition Queued",
        message=f"Proposal {proj_id} ({req.name}) submitted by {req.agency} has arrived in your District Scrutiny Queue.",
        db=db
    )

    res = model_to_dict(new_project)
    res["parcel_id"] = new_parcel.id
    return res

@router.post("/{id}/scrutiny")
def submit_scrutiny(
    id: str,
    req: ScrutinyDecision,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Stage 2: Digital Scrutiny by District Authority (Approve, Reject, Send Back)."""
    proj = db.query(Project).filter(Project.id == id).first()
    if not proj:
        raise HTTPException(status_code=404, detail="Project not found")

    d = req.decision.upper().strip()
    if d in ["APPROVE", "APPROVED"]:
        decision = "APPROVE"
        proj.status = "Scrutinized"
        proj.status_badge = "Scrutiny Cleared"
        proj.sla_status = "Awaiting State Gazette Signing"
        proj.current_milestone = "Digital Scrutiny Approved. Sent to State Gazette."
    elif d in ["REJECT", "REJECTED"]:
        decision = "REJECT"
        proj.status = "Rejected"
        proj.status_badge = "Rejected (Sec 7)"
        proj.sla_status = "Rejected per Section 7 constraints"
        proj.current_milestone = f"Rejected: {req.comments}"
    elif d in ["SEND_BACK", "SEND-BACK", "REWORK", "RETURN"]:
        decision = "SEND_BACK"
        proj.status = "Rework"
        proj.status_badge = "Returned (Rework)"
        proj.sla_status = "Agency Revision Required"
        proj.current_milestone = f"Revision Requested: {req.comments}"
    else:
        raise HTTPException(status_code=400, detail=f"Invalid scrutiny decision: {req.decision}")

    # Update associated parcels
    parcels = db.query(LandParcel).filter(LandParcel.project_id == id).all()
    for p in parcels:
        if decision == "APPROVE":
            p.status = "Scrutiny"
            p.status_label = "Scrutiny Cleared"
            p.status_color = "#15803d"
        elif decision == "REJECT":
            p.status = "Rejected"
            p.status_label = "Rejected"
            p.status_color = "#dc2626"
        elif decision == "SEND_BACK":
            p.status = "Rework"
            p.status_label = "Returned for Revision"
            p.status_color = "#d97706"

    # Log scrutiny entry
    log = ScrutinyLog(
        project_id=id,
        reviewer_id=current_user.email,
        reviewer_name=current_user.full_name,
        decision=decision,
        comments=req.comments
    )
    db.add(log)

    audit = AuditLog(
        entity=f"Project:{id}",
        action=f"SCRUTINY_{decision}",
        user_id=current_user.email,
        actor_name=current_user.full_name,
        actor_role=current_user.role,
        details=f"Scrutiny decision [{decision}]: {req.comments}",
        sha256_hash=hashlib.sha256(f"{id}:{decision}:{req.comments}".encode()).hexdigest()
    )
    db.add(audit)
    db.commit()

    send_notification(
        user_id="state.mh@dolr.gov.in",
        event_type=f"SCRUTINY_{decision}",
        title=f"Project {id} Scrutiny {decision}",
        message=f"{proj.name} scrutiny decision [{decision}] recorded by {current_user.full_name}.",
        db=db
    )

    return {"status": "success", "project": model_to_dict(proj), "decision": decision}

@router.post("/{id}/close")
def close_project(
    id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Stage 8: Project Closure and Document Archival."""
    proj = db.query(Project).filter(Project.id == id).first()
    if not proj:
        raise HTTPException(status_code=404, detail="Project not found")

    proj.status = "Closed"
    proj.status_badge = "Project Closed"
    proj.current_milestone = "Acquisition Lifecycle Completed and Archived"

    audit = AuditLog(
        entity=f"Project:{id}",
        action="PROJECT_CLOSED",
        user_id=current_user.email,
        actor_name=current_user.full_name,
        actor_role=current_user.role,
        details="Project marked completed and archived with version control.",
        sha256_hash=hashlib.sha256(f"{id}:CLOSED".encode()).hexdigest()
    )
    db.add(audit)
    db.commit()

    return {"status": "success", "project": model_to_dict(proj), "message": f"Project {id} closed and archived."}

@router.get("")
def list_projects(
    state: Optional[str] = None,
    district: Optional[str] = None,
    agency: Optional[str] = None,
    status_filter: Optional[str] = None,
    db: Session = Depends(get_db)
):
    q = db.query(Project)
    if state and state != "ALL":
        q = q.filter(Project.state == state)
    if district and district != "ALL":
        q = q.filter(Project.district == district)
    if agency:
        q = q.filter(Project.agency == agency)
    if status_filter:
        q = q.filter(Project.status == status_filter)
    projects = q.order_by(Project.created_at.desc()).all()
    return [model_to_dict(p) for p in projects]

@router.get("/{id}")
def get_project(id: str, db: Session = Depends(get_db)):
    proj = db.query(Project).filter(Project.id == id).first()
    if not proj:
        raise HTTPException(status_code=404, detail="Project not found")
    return model_to_dict(proj)
