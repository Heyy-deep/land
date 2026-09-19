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


def format_inr(amount: float) -> str:
    try:
        val = int(round(amount))
        s = str(abs(val))
        if len(s) <= 3:
            res = s
        else:
            last3 = s[-3:]
            remaining = s[:-3]
            chunks = []
            while len(remaining) > 2:
                chunks.append(remaining[-2:])
                remaining = remaining[:-2]
            if remaining:
                chunks.append(remaining)
            chunks.reverse()
            res = ",".join(chunks) + "," + last3
        return f"₹{res}" if val >= 0 else f"-₹{res}"
    except Exception:
        return f"₹{amount:,.0f}"


class CompensationEstimateRequest(BaseModel):
    area: float
    area_unit: Optional[str] = "ha"  # "ha", "acres", "sqm"
    circle_rate: float
    circle_rate_unit: Optional[str] = "sqm"  # "sqm", "ha", "acres"
    multiplier_factor: Optional[float] = 1.0
    trees_valuation: Optional[float] = 0.0
    wells_valuation: Optional[float] = 0.0
    structures_valuation: Optional[float] = 0.0
    solatium_pct: Optional[float] = 100.0
    interest_pct: Optional[float] = 12.0
    interest_years: Optional[float] = 2.0
    start_date: Optional[str] = None
    end_date: Optional[str] = None
    include_interest_in_total: Optional[bool] = False


@router.post("/calculate")
def calculate_compensation(req: CompensationEstimateRequest):
    """
    Statutory Compensation Calculator under RFCTLARR Act 2013 (Sec 26-30).
    Computes:
    - Base Market Value = Area (converted to m²) × Circle Rate (per m²) × Multiplier Factor (Sec 26)
    - Itemized Assets Valuation = Trees + Wells + Structures (Sec 29)
    - Mandatory 100% Solatium Award (Sec 30(1))
    - Additional Statutory Interest @ 12% p.a. (Sec 30(3))
    - Final Disbursal Amount
    """
    area_input = max(0.0, float(req.area or 0.0))
    unit = (req.area_unit or "ha").lower()

    # Convert Area to square meters
    if unit in ("ha", "hectare", "hectares"):
        area_sqm = area_input * 10000.0
    elif unit in ("acre", "acres"):
        area_sqm = area_input * 4046.85642
    else:  # sqm / sq. meters
        area_sqm = area_input

    rate_input = max(0.0, float(req.circle_rate or 0.0))
    rate_unit = (req.circle_rate_unit or "sqm").lower()

    # Convert Circle Rate to ₹ per square meter
    if rate_unit in ("ha", "hectare", "hectares"):
        rate_sqm = rate_input / 10000.0
    elif rate_unit in ("acre", "acres"):
        rate_sqm = rate_input / 4046.85642
    else:  # sqm
        rate_sqm = rate_input

    multiplier = max(1.0, float(req.multiplier_factor or 1.0))
    solatium_pct = max(0.0, float(req.solatium_pct if req.solatium_pct is not None else 100.0))
    interest_pct = max(0.0, float(req.interest_pct if req.interest_pct is not None else 12.0))

    # Calculate Interest duration
    interest_years = max(0.0, float(req.interest_years if req.interest_years is not None else 2.0))
    if req.start_date and req.end_date:
        try:
            d1 = datetime.datetime.strptime(req.start_date, "%Y-%m-%d")
            d2 = datetime.datetime.strptime(req.end_date, "%Y-%m-%d")
            days = max(0, (d2 - d1).days)
            interest_years = round(days / 365.25, 2)
        except Exception:
            pass

    # 1. Base Market Value (Section 26)
    base_market_value = round(area_sqm * rate_sqm * multiplier, 2)

    # 2. Asset Valuations (Section 29)
    trees_val = max(0.0, float(req.trees_valuation or 0.0))
    wells_val = max(0.0, float(req.wells_valuation or 0.0))
    structures_val = max(0.0, float(req.structures_valuation or 0.0))
    assets_valuation = round(trees_val + wells_val + structures_val, 2)

    market_value_subtotal = round(base_market_value + assets_valuation, 2)

    # 3. Mandatory 100% Solatium Award (Section 30(1))
    solatium_amount = round(market_value_subtotal * (solatium_pct / 100.0), 2)

    # 4. Additional Statutory Interest (Section 30(3))
    additional_interest = round(base_market_value * (interest_pct / 100.0) * (interest_years if interest_years > 0 else 1.0), 2)

    # 5. Final Disbursal Amount
    # Matching Section 3G Award Statement: Base + Solatium (+ interest if selected)
    include_interest = bool(req.include_interest_in_total)
    if include_interest:
        final_disbursal_amount = round(market_value_subtotal + solatium_amount + additional_interest, 2)
    else:
        final_disbursal_amount = round(market_value_subtotal + solatium_amount, 2)

    total_with_interest = round(market_value_subtotal + solatium_amount + additional_interest, 2)

    return {
        "status": "success",
        "inputs": {
            "area": area_input,
            "area_unit": unit,
            "area_sqm": round(area_sqm, 2),
            "circle_rate": rate_input,
            "circle_rate_unit": rate_unit,
            "circle_rate_sqm": round(rate_sqm, 2),
            "multiplier_factor": multiplier,
            "trees_valuation": trees_val,
            "wells_valuation": wells_val,
            "structures_valuation": structures_val,
            "assets_valuation": assets_valuation,
            "solatium_pct": solatium_pct,
            "interest_pct": interest_pct,
            "interest_years": interest_years,
            "include_interest_in_total": include_interest
        },
        "breakdown": {
            "base_market_value": base_market_value,
            "base_market_value_formatted": format_inr(base_market_value),
            "trees_valuation": trees_val,
            "trees_valuation_formatted": format_inr(trees_val),
            "wells_valuation": wells_val,
            "wells_valuation_formatted": format_inr(wells_val),
            "structures_valuation": structures_val,
            "structures_valuation_formatted": format_inr(structures_val),
            "assets_valuation": assets_valuation,
            "assets_valuation_formatted": format_inr(assets_valuation),
            "market_value_subtotal": market_value_subtotal,
            "market_value_subtotal_formatted": format_inr(market_value_subtotal),
            "solatium_amount": solatium_amount,
            "solatium_amount_formatted": f"+ {format_inr(solatium_amount)}",
            "additional_interest": additional_interest,
            "additional_interest_formatted": f"+ {format_inr(additional_interest)}",
            "final_disbursal_amount": final_disbursal_amount,
            "final_disbursal_amount_formatted": format_inr(final_disbursal_amount),
            "total_with_interest": total_with_interest,
            "total_with_interest_formatted": format_inr(total_with_interest)
        },
        "statutory_references": {
            "base_market_value": "Section 26, RFCTLARR Act 2013",
            "multiplier_factor": "Schedule 1, RFCTLARR Act 2013",
            "assets_valuation": "Section 29, RFCTLARR Act 2013",
            "solatium": "Section 30(1), RFCTLARR Act 2013 (Mandatory 100%)",
            "interest": f"Section 30(3), RFCTLARR Act 2013 ({interest_pct}% p.a. for {interest_years} yr{'s' if interest_years != 1 else ''})"
        },
        "disclaimer": "Statutory Estimate Tool under RFCTLARR Act 2013 Sec 26–30 for exploration and transparency. Official awards are declared exclusively through the formal Section 3G enquiry process."
    }

