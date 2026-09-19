"""
AI Risk Scoring Router for NLAMS (SIH 26016).
Provides REST endpoints to forecast litigation and delay risk for land acquisition cases.
"""

import datetime
from typing import Optional, Dict, Any
from pydantic import BaseModel
from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from backend.database import get_db
from backend.models import LandParcel, Project, StatutoryStage, Objection, ScrutinyLog
from ml.risk_model import predict_risk

router = APIRouter(tags=["AI Risk Scoring (Litigation & Delay Forecasting)"])


class RiskScoreOverride(BaseModel):
    days_since_notification: Optional[int] = None
    encumbrance_flags: Optional[int] = None
    compensation_ratio: Optional[float] = None
    prior_disputes_in_district: Optional[int] = None
    duplicate_claim_flag: Optional[int] = None


def _calculate_parcel_features(parcel: LandParcel, db: Session) -> Dict[str, Any]:
    """Extracts RFCTLARR risk features from database records for a given parcel."""
    # 1. days_since_notification
    days_since_notification = 30
    stage = db.query(StatutoryStage).filter(
        StatutoryStage.parcel_id == parcel.id
    ).order_by(StatutoryStage.created_at.desc()).first()

    if stage and stage.date:
        try:
            stage_dt = datetime.datetime.fromisoformat(stage.date).date()
            days_since_notification = max(0, (datetime.date.today() - stage_dt).days)
        except Exception:
            days_since_notification = 45
    elif parcel.created_at:
        days_since_notification = max(0, (datetime.datetime.utcnow() - parcel.created_at).days)

    # 2. encumbrance_flags
    # Count objections + scrutiny rework/rejection logs + status indicators
    objections_count = db.query(Objection).filter(Objection.parcel_id == parcel.id).count()
    reworks_count = db.query(ScrutinyLog).filter(
        (ScrutinyLog.parcel_id == parcel.id) & (ScrutinyLog.decision.in_(["REJECT", "SEND_BACK"]))
    ).count()
    status_flag = 1 if parcel.status in ["Objection", "Rejected", "Rework"] else 0
    encumbrance_flags = min(5, objections_count + reworks_count + status_flag)

    # 3. compensation_ratio
    # Evaluates awarded compensation against expected statutory market value (base * statutory 2x solatium benchmark)
    if parcel.base_market_value and parcel.base_market_value > 0 and parcel.total_compensation:
        expected_benchmark = parcel.base_market_value * 2.0
        compensation_ratio = round(parcel.total_compensation / expected_benchmark, 2)
        compensation_ratio = max(0.5, min(1.5, compensation_ratio))
    else:
        compensation_ratio = 1.0

    # 4. prior_disputes_in_district
    # Objections registered across all parcels within the same district corridor
    prior_disputes = db.query(Objection).join(
        LandParcel, Objection.parcel_id == LandParcel.id
    ).filter(LandParcel.district == parcel.district).count()
    prior_disputes_in_district = min(10, prior_disputes)

    # 5. duplicate_claim_flag
    # Multiple claimants or ownership disputes on this particular khasra or parcel
    distinct_claimants = db.query(Objection.claimant_name).filter(
        (Objection.parcel_id == parcel.id) | (Objection.khasra_no == parcel.khasra_no)
    ).distinct().count()
    duplicate_claim_flag = 1 if distinct_claimants > 1 else 0

    return {
        "days_since_notification": int(days_since_notification),
        "encumbrance_flags": int(encumbrance_flags),
        "compensation_ratio": float(compensation_ratio),
        "prior_disputes_in_district": int(prior_disputes_in_district),
        "duplicate_claim_flag": int(duplicate_claim_flag)
    }


def _calculate_project_features(project: Project, db: Session) -> Dict[str, Any]:
    """Extracts aggregated corridor risk features when case_id points to an acquisition project."""
    days = 60
    if project.created_at:
        days = max(0, (datetime.datetime.utcnow() - project.created_at).days)

    district_disputes = db.query(Objection).join(
        LandParcel, Objection.parcel_id == LandParcel.id
    ).filter(LandParcel.district == project.district).count()

    parcels = db.query(LandParcel).filter(LandParcel.project_id == project.id).all()
    objection_parcels = sum(1 for p in parcels if p.status == "Objection")

    comp_ratio = 1.0
    if project.budget_cr and project.budget_cr > 0 and project.disbursed_cr:
        comp_ratio = max(0.5, min(1.5, round(project.disbursed_cr / (project.budget_cr * 0.8), 2)))

    return {
        "days_since_notification": min(400, days),
        "encumbrance_flags": min(5, objection_parcels),
        "compensation_ratio": comp_ratio,
        "prior_disputes_in_district": min(10, district_disputes),
        "duplicate_claim_flag": 1 if objection_parcels >= 2 else 0
    }


@router.post("/api/risk-score/{case_id}", status_code=status.HTTP_200_OK)
@router.post("/risk-score/{case_id}", status_code=status.HTTP_200_OK)
def get_case_risk_score(
    case_id: str,
    override: Optional[RiskScoreOverride] = None,
    db: Session = Depends(get_db)
) -> Dict[str, Any]:
    """
    Evaluates litigation and delay risk for a land acquisition case/parcel.
    Pulls live parameters from the database, applies AI risk forecasting model,
    and returns risk score, risk level, and top contributing factors.
    Falls back gracefully to sensible defaults if data is incomplete or case is missing.
    """
    try:
        parcel = db.query(LandParcel).filter(LandParcel.id == case_id).first()
        if not parcel:
            # Check by Khasra or Gut number
            parcel = db.query(LandParcel).filter(
                (LandParcel.khasra_no == case_id) | (LandParcel.gut_number == case_id)
            ).first()

        if parcel:
            features = _calculate_parcel_features(parcel, db)
            case_type = "LandParcel"
            title = f"{parcel.id} ({parcel.village}, {parcel.district})"
        else:
            project = db.query(Project).filter(Project.id == case_id).first()
            if project:
                features = _calculate_project_features(project, db)
                case_type = "Project"
                title = f"{project.name} ({project.district})"
            else:
                # Sensible default fallback for missing or incomplete case data
                features = {
                    "days_since_notification": 45,
                    "encumbrance_flags": 0,
                    "compensation_ratio": 1.0,
                    "prior_disputes_in_district": 1,
                    "duplicate_claim_flag": 0
                }
                case_type = "DefaultBaseline"
                title = f"Unregistered / External Case: {case_id}"

        # Apply any caller-specified feature overrides
        if override:
            override_dict = override.model_dump(exclude_none=True)
            features.update(override_dict)

        # Run AI Model Inference
        prediction = predict_risk(features)

        return {
            "case_id": case_id,
            "case_type": case_type,
            "title": title,
            "features_evaluated": features,
            "risk_score": prediction["risk_score"],
            "risk_level": prediction["risk_level"],
            "top_factors": prediction["top_factors"],
            "status": "success"
        }

    except Exception as exc:
        # Sensible fail-safe default response rather than crashing
        fallback_features = {
            "days_since_notification": 30,
            "encumbrance_flags": 0,
            "compensation_ratio": 1.0,
            "prior_disputes_in_district": 1,
            "duplicate_claim_flag": 0
        }
        fallback_pred = predict_risk(fallback_features)
        return {
            "case_id": case_id,
            "case_type": "Fallback",
            "title": f"Case {case_id}",
            "features_evaluated": fallback_features,
            "risk_score": fallback_pred["risk_score"],
            "risk_level": fallback_pred["risk_level"],
            "top_factors": fallback_pred["top_factors"],
            "status": "partial_data_fallback",
            "warning": f"Handled with sensible defaults due to: {str(exc)}"
        }
