import random
import datetime
from typing import Optional
from pydantic import BaseModel
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from backend.database import get_db
from backend.models import Objection, LandParcel, User
from backend.auth import get_current_user
from backend.notifications import send_notification

router = APIRouter(prefix="/objections", tags=["Stage 9: Citizen Objections (Section 15)"])

class ObjectionCreate(BaseModel):
    parcel_id: str
    khasra_no: str
    objection_type: str
    grounds: str
    project_id: Optional[str] = None
    document_name: Optional[str] = None

class ObjectionOutcomeUpdate(BaseModel):
    status: str  # e.g. "Upheld", "Rejected", "Hearing Scheduled", "In-Progress"
    outcome_notes: str
    hearing_date: Optional[str] = None
    officer_name: Optional[str] = None

@router.post("", status_code=status.HTTP_201_CREATED)
def file_objection(
    req: ObjectionCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    obj_id = f"OBJ-2025-{random.randint(1000, 9999)}"

    new_obj = Objection(
        id=obj_id,
        parcel_id=req.parcel_id,
        khasra_no=req.khasra_no,
        claimant_name=current_user.full_name,
        objection_type=req.objection_type,
        grounds=req.grounds,
        status="Hearing Listed",
        hearing_date="15-Dec-2025",
        action_taken="CALA Notice Issued to Requiring Body",
        document_name=req.document_name or "",
        project_id=req.project_id or ""
    )
    db.add(new_obj)
    db.commit()
    db.refresh(new_obj)

    send_notification(
        user_id="dro.pune@dolr.gov.in",
        event_type="OBJECTION_FILED",
        title="Section 15 Statutory Objection Registered",
        message=f"Claimant {current_user.full_name} filed objection for {req.khasra_no}: {req.objection_type}.",
        db=db
    )

    return new_obj

@router.put("/{obj_id}/outcome")
def record_hearing_outcome(
    obj_id: str,
    req: ObjectionOutcomeUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    obj = db.query(Objection).filter(Objection.id == obj_id).first()
    if not obj:
        raise HTTPException(status_code=404, detail=f"Objection {obj_id} not found")

    obj.status = req.status
    obj.action_taken = req.outcome_notes
    if req.hearing_date:
        obj.hearing_date = req.hearing_date

    db.commit()
    db.refresh(obj)

    send_notification(
        user_id="citizen@dolr.gov.in",
        event_type="OBJECTION_OUTCOME_RECORDED",
        title=f"Section 15 Hearing Order: {req.status}",
        message=f"Statutory order for {obj.khasra_no} pronounced: {req.outcome_notes}",
        db=db
    )

    return obj

@router.get("")
def list_objections(
    parcel_id: Optional[str] = None,
    project_id: Optional[str] = None,
    db: Session = Depends(get_db)
):
    q = db.query(Objection)
    if parcel_id:
        q = q.filter(Objection.parcel_id == parcel_id)
    if project_id:
        q = q.filter(Objection.project_id == project_id)
    return q.order_by(Objection.created_at.desc()).all()
