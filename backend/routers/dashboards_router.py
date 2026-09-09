import json
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func, case
from backend.database import get_db
from backend.models import User, Project, LandParcel, StatutoryStage, Compensation, Rehabilitation, Objection
from backend.auth import get_current_user

router = APIRouter(prefix="/dashboard", tags=["Role-Scoped Dashboards"])

# 1. National Dashboard (Central Ministry)
@router.get("/national")
def get_national_dashboard(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Only central-ministry or state-revenue with view rights
    total_projects = db.query(Project).count()
    total_land_ha = db.query(func.sum(Project.required_land_ha)).scalar() or 0.0
    total_budget_cr = db.query(func.sum(Project.budget_cr)).scalar() or 0.0
    total_disbursed_cr = db.query(func.sum(Project.disbursed_cr)).scalar() or 0.0
    total_families_affected = db.query(func.sum(Project.affected_families)).scalar() or 0
    total_families_rehab = db.query(func.sum(Project.rehabilitated_families)).scalar() or 0

    # Stage funnel
    submitted_count = db.query(Project).filter(Project.status == "Submitted").count()
    scrutiny_count = db.query(Project).filter(Project.status == "Scrutinized").count()
    notified_count = db.query(Project).filter(Project.status == "Notified").count()
    awarded_count = db.query(Project).filter(Project.status == "Awarded").count()
    possession_count = db.query(Project).filter(Project.status == "Possession").count()

    # State-wise aggregation breakdown
    state_rows = db.query(
        Project.state,
        func.count(Project.id).label("project_count"),
        func.sum(Project.required_land_ha).label("total_ha"),
        func.sum(Project.budget_cr).label("total_budget"),
        func.sum(Project.disbursed_cr).label("total_disbursed"),
        func.sum(case((Project.status == 'Possession', 1), else_=0)).label("possessed_count")
    ).group_by(Project.state).all()

    state_breakdown = []
    for row in state_rows:
        pct = round((row.possessed_count / row.project_count * 100) if row.project_count else 0, 1)
        state_breakdown.append({
            "state": row.state,
            "project_count": row.project_count,
            "total_ha": round(row.total_ha or 0, 2),
            "budget_cr": round(row.total_budget or 0, 1),
            "disbursed_cr": round(row.total_disbursed or 0, 1),
            "completion_pct": pct,
            "choropleth_color": "#15803d" if pct >= 75 else ("#d97706" if pct >= 50 else "#dc2626")
        })

    all_projects = db.query(Project).order_by(Project.created_at.desc()).limit(20).all()

    return {
        "kpis": {
            "total_projects": total_projects,
            "total_land_ha": round(total_land_ha, 1),
            "total_budget_cr": round(total_budget_cr, 1),
            "total_disbursed_cr": round(total_disbursed_cr, 1),
            "disbursement_pct": round((total_disbursed_cr / total_budget_cr * 100) if total_budget_cr else 0, 1),
            "families_rehabilitated": total_families_rehab,
            "families_affected": total_families_affected
        },
        "stage_funnel": {
            "submitted": submitted_count,
            "scrutinized": scrutiny_count,
            "notified": notified_count,
            "awarded": awarded_count,
            "possession": possession_count
        },
        "state_breakdown": state_breakdown,
        "projects": all_projects
    }

# 2. State Dashboard (State Government)
@router.get("/state")
def get_state_dashboard(
    state: Optional[str] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Server-side scoping: Query param, user jurisdiction, or default to West Bengal
    target_state = state or (current_user.jurisdiction_scope if current_user.jurisdiction_scope != "ALL" else "West Bengal")

    state_projects = db.query(Project).filter(Project.state == target_state).all()

    total_projects = len(state_projects)
    total_land_ha = sum(p.required_land_ha for p in state_projects)
    total_budget_cr = sum(p.budget_cr for p in state_projects)
    total_disbursed_cr = sum(p.disbursed_cr for p in state_projects)

    # District-wise aggregation
    district_rows = db.query(
        Project.district,
        func.count(Project.id).label("project_count"),
        func.sum(Project.required_land_ha).label("total_ha"),
        func.sum(Project.budget_cr).label("total_budget"),
        func.sum(Project.disbursed_cr).label("total_disbursed")
    ).filter(Project.state == target_state).group_by(Project.district).all()

    district_breakdown = [{
        "district": d.district,
        "project_count": d.project_count,
        "total_ha": round(d.total_ha or 0, 2),
        "budget_cr": round(d.total_budget or 0, 1),
        "disbursed_cr": round(d.total_disbursed or 0, 1),
        "utilization_pct": round(((d.total_disbursed or 0) / (d.total_budget or 1)) * 100, 1)
    } for d in district_rows]

    return {
        "state": target_state,
        "kpis": {
            "total_projects": total_projects,
            "total_land_ha": round(total_land_ha, 1),
            "total_budget_cr": round(total_budget_cr, 1),
            "total_disbursed_cr": round(total_disbursed_cr, 1),
            "utilization_pct": round((total_disbursed_cr / total_budget_cr * 100) if total_budget_cr else 0, 1)
        },
        "district_breakdown": district_breakdown,
        "projects": state_projects
    }

# 3. District / Field Dashboard (CALA Desk & Field Officers)
@router.get("/district")
def get_district_dashboard(
    district: Optional[str] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Server-side scoping: Query param, user jurisdiction, or default to Hooghly
    target_district = district or (current_user.jurisdiction_scope if current_user.jurisdiction_scope not in ("ALL", "West Bengal", "Maharashtra") else "Hooghly")

    parcels = db.query(LandParcel).filter(LandParcel.district == target_district).all()
    projects = db.query(Project).filter(Project.district == target_district).all()

    scrutiny_queue = [p for p in parcels if p.status == "Scrutiny"]
    awarded_parcels = [p for p in parcels if p.status == "Awarded"]
    possessed_parcels = [p for p in parcels if p.status == "Possessed"]

    # Format parcels as GeoJSON FeatureCollection
    features = []
    for p in parcels:
        geom = json.loads(p.geometry) if isinstance(p.geometry, str) else p.geometry
        features.append({
            "type": "Feature",
            "id": p.id,
            "geometry": geom,
            "properties": {
                "id": p.id,
                "khasra_no": p.khasra_no,
                "gut_number": p.gut_number,
                "village": p.village,
                "district": p.district,
                "owner_name": p.owner_name,
                "area_ha": p.area_ha,
                "total_compensation": p.total_compensation,
                "status": p.status,
                "status_label": p.status_label,
                "status_color": p.status_color
            }
        })

    return {
        "district": target_district,
        "total_parcels": len(parcels),
        "pending_scrutiny_count": len(scrutiny_queue),
        "awarded_count": len(awarded_parcels),
        "possessed_count": len(possessed_parcels),
        "scrutiny_queue": parcels,
        "projects": projects,
        "geojson": {
            "type": "FeatureCollection",
            "features": features
        }
    }

# 4. Implementing Agency Dashboard
@router.get("/agency")
def get_agency_dashboard(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    agency_query = db.query(Project)
    if current_user.role == "requiring-body" and current_user.department:
        # Scope to agency keywords if applicable
        agency_query = agency_query.filter(Project.agency.ilike(f"%{current_user.department[:4]}%"))

    projects = agency_query.all()
    return {
        "agency_name": current_user.department or "Implementing Agency",
        "total_submitted": len(projects),
        "projects": projects
    }

# 5. Citizen Dashboard
@router.get("/citizen")
def get_citizen_dashboard(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    target_parcel_id = current_user.linked_parcel_id or "WB-HGY-DNK-01"

    parcel = db.query(LandParcel).filter(LandParcel.id == target_parcel_id).first()
    if not parcel:
        parcel = db.query(LandParcel).first()

    objections = db.query(Objection).filter(Objection.parcel_id == parcel.id).all() if parcel else []

    return {
        "citizen_name": current_user.full_name,
        "linked_parcel_id": parcel.id if parcel else None,
        "parcel": parcel,
        "objections": objections
    }
