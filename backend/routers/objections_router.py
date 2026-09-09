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
        action_taken="CALA Notice Issued to Requiring Body"
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

@router.get("")
def list_objections(parcel_id: Optional[str] = None, db: Session = Depends(get_db)):
    q = db.query(Objection)
    if parcel_id:
        q = q.filter(Objection.parcel_id == parcel_id)
    return q.order_by(Objection.created_at.desc()).all()
