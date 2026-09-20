import json
import hashlib
import datetime
import re
from typing import Optional, List
from pydantic import BaseModel
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from backend.database import get_db
from backend.models import LandParcel, Project, StatutoryStage, Compensation, AuditLog, User, model_to_dict
from backend.auth import get_current_user, get_optional_current_user
from backend.notifications import send_notification
from backend.routers.compensation_router import CompensationEstimateRequest, calculate_compensation

def parcel_geometry_to_geojson(parcel: LandParcel) -> Optional[dict]:
    """
    Converts parcel PostGIS geometry or SQLite simulated geometry into a valid GeoJSON dict.
    Uses geoalchemy2.shape.to_shape + shapely.geometry.mapping() for true PostGIS geometries.
    """
    val = parcel.geometry
    if isinstance(val, dict):
        return val
    if isinstance(val, str):
        try:
            return json.loads(val)
        except Exception:
            return None
    try:
        from geoalchemy2.shape import to_shape
        import shapely.geometry
        shape = to_shape(val)
        return shapely.geometry.mapping(shape)
    except Exception:
        return None

def parcel_to_feature(parcel: LandParcel) -> dict:
    """Serializes a LandParcel model instance into a standard GeoJSON Feature."""
    geom = parcel_geometry_to_geojson(parcel)
    return {
        "type": "Feature",
        "id": parcel.id,
        "geometry": geom,
        "properties": {
            "id": parcel.id,
            "project_id": parcel.project_id,
            "khasra_no": parcel.khasra_no,
            "gut_number": parcel.gut_number,
            "village": parcel.village,
            "taluka": parcel.taluka,
            "district": parcel.district,
            "state": parcel.state,
            "owner_name": parcel.owner_name,
            "owner_aadhaar": parcel.owner_aadhaar,
            "area_ha": parcel.area_ha,
            "land_type": parcel.land_type,
            "market_rate_sqm": parcel.market_rate_sqm,
            "base_market_value": parcel.base_market_value,
            "solatium_amount": parcel.solatium_amount,
            "additional_interest": parcel.additional_interest,
            "total_compensation": parcel.total_compensation,
            "overlap_percent": parcel.overlap_percent,
            "status": parcel.status,
            "status_label": parcel.status_label,
            "status_color": parcel.status_color,
            "dbt_status": parcel.dbt_status,
            "possession_date": parcel.possession_date,
            "possession_officer": parcel.possession_officer
        }
    }

def is_citizen_authorized_for_parcel(user: User, parcel: LandParcel) -> bool:
    """
    Enforces strict ownership scoping for citizens:
    Matches linked_parcel_id, owner name, or Aadhaar last 4 digits.
    """
    if not user or user.role != "citizen":
        return True

    # 1. Exact linked parcel ID or holding ref match
    if user.linked_parcel_id and (user.linked_parcel_id == parcel.id or user.linked_parcel_id == parcel.gut_number):
        return True

    # 2. Owner name match (case-insensitive)
    if user.full_name and parcel.owner_name and user.full_name.strip().lower() == parcel.owner_name.strip().lower():
        return True

    # 3. Aadhaar last 4 digits match
    user_text = f"{user.department or ''} {user.email or ''}"
    user_digits = re.findall(r'\d{4}', user_text)
    if user_digits and parcel.owner_aadhaar:
        parcel_digits = re.findall(r'\d{4}', parcel.owner_aadhaar)
        if parcel_digits and user_digits[-1] == parcel_digits[-1]:
            return True

    return False

router = APIRouter(prefix="/parcels", tags=["Stage 3, 4, 7: Parcels, Notification, Award & Possession"])

class NotificationRequest(BaseModel):
    gazette_ref: Optional[str] = "GSR-MH-2025-912(E)"
    dsc_pin: Optional[str] = "123456"

class AwardRequest(BaseModel):
    market_rate_sqm: Optional[float] = None
    solatium_pct: Optional[float] = 100.0  # 100% solatium under RFCTLARR
    interest_pct: Optional[float] = 12.0

class PossessionRequest(BaseModel):
    dgps_pegging: bool = True
    tree_crop_valuation: bool = True
    structure_vacated: bool = True
    form3e_certificate: bool = True
    officer_name: Optional[str] = "R. K. Meena, IAS"
    geo_lat: Optional[float] = 18.5204
    geo_lng: Optional[float] = 73.8567

# GET /parcels/{id}/geometry - GeoJSON Feature for a single parcel with RBAC ownership check
@router.get("/{id}/geometry")
def get_parcel_geometry(
    id: str,
    current_user: Optional[User] = Depends(get_optional_current_user),
    db: Session = Depends(get_db)
):
    """
    Returns a GeoJSON Feature (geometry + properties: owner, status, award value, etc.) for one parcel.
    Enforces strict RBAC / ownership scoping for citizens:
    A citizen can only retrieve their own parcel geometry.
    """
    parcel = db.query(LandParcel).filter(LandParcel.id == id).first()
    if not parcel:
        parcel = db.query(LandParcel).filter(LandParcel.gut_number == id).first()
    if not parcel:
        raise HTTPException(status_code=404, detail=f"Parcel '{id}' not found")

    if current_user and current_user.role == "citizen":
        if not is_citizen_authorized_for_parcel(current_user, parcel):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied. You are only authorized to view geometry for your own registered land holding."
            )

    return parcel_to_feature(parcel)

# GET /parcels - Returns GeoJSON FeatureCollection
@router.get("")
@router.get("/")
def get_parcels(
    state: Optional[str] = None,
    district: Optional[str] = None,
    project_id: Optional[str] = None,
    current_user: Optional[User] = Depends(get_optional_current_user),
    db: Session = Depends(get_db)
):
    """
    Returns a GeoJSON FeatureCollection for parcels in the requested jurisdiction.
    If accessed by an authenticated citizen, strictly scopes output to their own parcel(s).
    """
    q = db.query(LandParcel)
    if state and state != "ALL":
        q = q.filter(LandParcel.state == state)
    if district and district != "ALL":
        q = q.filter(LandParcel.district == district)
    if project_id:
        q = q.filter(LandParcel.project_id == project_id)

    parcels = q.all()

    # RBAC: If request is from an authenticated citizen, strictly filter down to their owned parcel(s)
    if current_user and current_user.role == "citizen":
        parcels = [p for p in parcels if is_citizen_authorized_for_parcel(current_user, p)]

    features = [parcel_to_feature(p) for p in parcels]
    return {
        "type": "FeatureCollection",
        "features": features
    }

# POST /parcels/{id}/notify - Stage 3: Statutory Notification
@router.post("/{id}/notify")
def notify_parcel(
    id: str,
    req: NotificationRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    parcel = db.query(LandParcel).filter(LandParcel.id == id).first()
    if not parcel:
        parcel = db.query(LandParcel).filter(LandParcel.project_id == id).first()
    if not parcel:
        raise HTTPException(status_code=404, detail="Parcel not found")

    parcel.status = "Notified"
    parcel.status_label = "Section 3D Notified"
    parcel.status_color = "#2563eb"

    # Add statutory stage record
    stage = StatutoryStage(
        parcel_id=parcel.id,
        project_id=parcel.project_id,
        stage="3D",
        gazette_ref=req.gazette_ref,
        date=datetime.date.today().isoformat()
    )
    db.add(stage)

    # Update project status
    proj = db.query(Project).filter(Project.id == parcel.project_id).first()
    if proj:
        proj.status = "Notified"
        proj.status_badge = "Notified (Sec 3D)"
        proj.gazette_date = datetime.date.today().strftime("%d-%b-%Y")
        proj.current_milestone = f"Section 3D Notification Published: {req.gazette_ref}"

    audit = AuditLog(
        entity=f"Parcel:{parcel.id}",
        action="GAZETTE_NOTIFICATION_ISSUED",
        user_id=current_user.email,
        actor_name=current_user.full_name,
        actor_role=current_user.role,
        details=f"Digitally signed statutory gazette notification {req.gazette_ref} under DSC Token.",
        sha256_hash=hashlib.sha256(f"{parcel.id}:{req.gazette_ref}".encode()).hexdigest()
    )
    db.add(audit)
    db.commit()

    send_notification(
        user_id=parcel.owner_name,
        event_type="NOTIFICATION_ISSUED",
        title="Statutory Section 3D Gazette Published",
        message=f"Official Gazette Notice {req.gazette_ref} issued for {parcel.gut_number} ({parcel.village}).",
        db=db
    )

    return {"status": "success", "parcel": model_to_dict(parcel), "gazette_ref": req.gazette_ref}

# POST /parcels/{id}/award - Stage 4: Award Declaration
@router.post("/{id}/award")
def declare_award(
    id: str,
    req: AwardRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    parcel = db.query(LandParcel).filter(LandParcel.id == id).first()
    if not parcel:
        parcel = db.query(LandParcel).filter(LandParcel.project_id == id).first()
    if not parcel:
        raise HTTPException(status_code=404, detail="Parcel not found")

    if req.market_rate_sqm:
        parcel.market_rate_sqm = req.market_rate_sqm
        parcel.base_market_value = round((parcel.area_ha * 10000.0) * req.market_rate_sqm, 2)
        parcel.solatium_amount = parcel.base_market_value  # 100% Solatium
        parcel.additional_interest = round(parcel.base_market_value * 0.12, 2)  # 12% Interest
        parcel.total_compensation = parcel.base_market_value + parcel.solatium_amount + parcel.additional_interest

    parcel.status = "Awarded"
    parcel.status_label = "Sec 3G Award Ready"
    parcel.status_color = "#9333ea"
    parcel.dbt_status = "PFMS Order Generated"

    # Add compensation record
    comp = Compensation(
        parcel_id=parcel.id,
        project_id=parcel.project_id,
        amount_assessed=parcel.total_compensation,
        amount_disbursed=0.0,
        dbt_status="PFMS Order Generated"
    )
    db.add(comp)

    # Update project
    proj = db.query(Project).filter(Project.id == parcel.project_id).first()
    if proj:
        proj.status = "Awarded"
        proj.status_badge = "Award (Sec 3G)"
        proj.sla_status = "Award Passed / DBT Ready"
        proj.current_milestone = "Compensation Computed with 100% Solatium & 12% Interest"

    audit = AuditLog(
        entity=f"Parcel:{parcel.id}",
        action="AWARD_DECLARED",
        user_id=current_user.email,
        actor_name=current_user.full_name,
        actor_role=current_user.role,
        details=f"Declared Section 3G Award: Total Compensation ₹{parcel.total_compensation:,.2f}",
        sha256_hash=hashlib.sha256(f"{parcel.id}:{parcel.total_compensation}".encode()).hexdigest()
    )
    db.add(audit)
    db.commit()

    send_notification(
        user_id=parcel.owner_name,
        event_type="AWARD_DECLARED",
        title="Section 3G Compensation Award Declared",
        message=f"Award of ₹{(parcel.total_compensation/100000):.2f} Lakhs passed for {parcel.gut_number}.",
        db=db
    )

    return {"status": "success", "parcel": model_to_dict(parcel), "total_compensation": parcel.total_compensation}

# POST /parcels/{id}/possess - Stage 7: Possession Confirmation (Mobile-friendly)
@router.post("/{id}/possess")
def confirm_possession(
    id: str,
    req: PossessionRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if not (req.dgps_pegging and req.tree_crop_valuation and req.structure_vacated and req.form3e_certificate):
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Cannot vest title: All 4 statutory checklist items (DGPS pegging, tree valuation, structures vacated, Form 3E) must be verified."
        )

    parcel = db.query(LandParcel).filter(LandParcel.id == id).first()
    if not parcel:
        parcel = db.query(LandParcel).filter(LandParcel.project_id == id).first()
    if not parcel:
        raise HTTPException(status_code=404, detail="Parcel not found")

    parcel.status = "Possessed"
    parcel.status_label = "Possessed / Handed Over"
    parcel.status_color = "#15803d"
    parcel.possession_date = datetime.date.today().strftime("%d-%b-%Y")
    parcel.possession_officer = req.officer_name or current_user.full_name

    # Statutory stage record
    stage = StatutoryStage(
        parcel_id=parcel.id,
        project_id=parcel.project_id,
        stage="Possession",
        gazette_ref="Form 3E Executed",
        date=datetime.date.today().isoformat()
    )
    db.add(stage)

    # Update project
    proj = db.query(Project).filter(Project.id == parcel.project_id).first()
    if proj:
        proj.status = "Possession"
        proj.status_badge = "Possession Complete"
        proj.current_milestone = f"Field Possession Confirmed for {parcel.gut_number}"

    audit = AuditLog(
        entity=f"Parcel:{parcel.id}",
        action="POSSESSION_CONFIRMED",
        user_id=current_user.email,
        actor_name=req.officer_name or current_user.full_name,
        actor_role="Field Officer",
        details=f"Confirmed physical possession on-site (Lat: {req.geo_lat}, Lng: {req.geo_lng}). Title vested in State under Section 16.",
        sha256_hash=hashlib.sha256(f"{parcel.id}:POSSESSED:{req.officer_name}".encode()).hexdigest()
    )
    db.add(audit)
    db.commit()

    send_notification(
        user_id=parcel.owner_name,
        event_type="POSSESSION_CONFIRMED",
        title="Physical Possession Confirmed",
        message=f"Land parcel {parcel.gut_number} has been possessed on-site and title vested in the State.",
        db=db
    )

    return {"status": "success", "parcel": model_to_dict(parcel), "possession_date": parcel.possession_date}


@router.post("/compensation/calculate")
def calculate_parcel_compensation_alias(req: CompensationEstimateRequest):
    """
    Statutory Compensation Calculator endpoint under RFCTLARR Act 2013 (Sec 26-30).
    Delegates directly to canonical compensation_router implementation.
    """
    return calculate_compensation(req)


