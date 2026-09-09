import random
import datetime
import hashlib
from pydantic import BaseModel
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from backend.database import get_db
from backend.models import Compensation, LandParcel, Project, AuditLog, User
from backend.auth import get_current_user
from backend.notifications import send_notification

router = APIRouter(prefix="/compensation", tags=["Stage 5: Compensation & PFMS DBT"])

class DisburseRequest(BaseModel):
    amount: Optional[float] = None
    account_number: Optional[str] = "SBIN0004210984"
    ifsc: Optional[str] = "SBIN0001420"

@router.post("/{id}/disburse")
def disburse_compensation(
    id: str,  # Parcel ID or Compensation ID
    req: DisburseRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Stage 5: PFMS Direct Benefit Transfer Disbursement."""
    parcel = db.query(LandParcel).filter(LandParcel.id == id).first()
    comp = None
    if not parcel:
        # Check if id corresponds to Compensation table id
        try:
            num_id = int(id)
            comp = db.query(Compensation).filter(Compensation.id == num_id).first()
            if comp:
                parcel = db.query(LandParcel).filter(LandParcel.id == comp.parcel_id).first()
        except ValueError:
            pass

    if not parcel:
        raise HTTPException(status_code=404, detail=f"Parcel or Compensation record '{id}' not found")

    utr_number = f"PFMS{random.randint(10000000, 99999999)}"
    disbursed_amount = req.amount or parcel.total_compensation

    parcel.dbt_status = f"Credited (PFMS UTR: #{utr_number})"
    parcel.status = "Disbursed"
    parcel.status_label = "DBT Disbursed"

    # Record or update compensation
    comp = db.query(Compensation).filter(Compensation.parcel_id == id).first()
    if not comp:
        comp = Compensation(
            parcel_id=id,
            project_id=parcel.project_id,
            amount_assessed=parcel.total_compensation,
            amount_disbursed=disbursed_amount,
            pfms_txn_id=utr_number,
            dbt_status="Credited",
            disbursed_at=datetime.datetime.utcnow()
        )
        db.add(comp)
    else:
        comp.amount_disbursed = disbursed_amount
        comp.pfms_txn_id = utr_number
        comp.dbt_status = "Credited"
        comp.disbursed_at = datetime.datetime.utcnow()

    # Update project disbursed total
    proj = db.query(Project).filter(Project.id == parcel.project_id).first()
    if proj:
        proj.disbursed_cr = min(proj.budget_cr, round(proj.disbursed_cr + (disbursed_amount / 10000000.0), 2))
        proj.current_milestone = f"Compensation Disbursed via PFMS (UTR: #{utr_number})"

    audit = AuditLog(
        entity=f"Parcel:{id}",
        action="PFMS_DBT_DISBURSED",
        user_id=current_user.email,
        actor_name=current_user.full_name,
        actor_role="Finance Authority",
        details=f"Direct Benefit Transfer of ₹{disbursed_amount:,.2f} remitted to {parcel.owner_name} [UTR: {utr_number}]",
        sha256_hash=hashlib.sha256(f"{id}:{disbursed_amount}:{utr_number}".encode()).hexdigest()
    )
    db.add(audit)
    db.commit()

    send_notification(
        user_id=parcel.owner_name,
        event_type="COMPENSATION_DISBURSED",
        title="Direct Benefit Transfer Credited",
        message=f"₹{(disbursed_amount/100000):.2f} Lakhs credited to bank account for {parcel.gut_number}. UTR: #{utr_number}.",
        db=db
    )

    return {
        "status": "success",
        "parcel_id": id,
        "amount_disbursed": disbursed_amount,
        "pfms_txn_id": utr_number,
        "dbt_status": parcel.dbt_status
    }
