import json
import hashlib
from sqlalchemy.orm import Session
from backend.models import User, Project, LandParcel, StatutoryStage, Compensation, Rehabilitation, AuditLog
from backend.auth import get_password_hash

def seed_database(db: Session):
    # Check if database is already seeded
    if db.query(User).first():
        print("[NLAMS Seed] Database already seeded. Skipping initialization.")
        return

    print("[NLAMS Seed] Seeding core users, realistic projects, and cadastral parcels...")

    # 1. Seed Users across all 5 roles
    users = [
        User(
            email="admin@dolr.gov.in",
            password_hash=get_password_hash("nlams2025"),
            full_name="Dr. S. K. Verma, Joint Secretary",
            role="central-ministry",
            jurisdiction_scope="ALL",
            department="Department of Land Resources (DoLR), GoI"
        ),
        User(
            email="state.mh@dolr.gov.in",
            password_hash=get_password_hash("nlams2025"),
            full_name="Rajendra N. Patil, IAS",
            role="state-revenue",
            jurisdiction_scope="Maharashtra",
            department="Revenue & Forest Department, Maharashtra"
        ),
        User(
            email="dro.pune@dolr.gov.in",
            password_hash=get_password_hash("nlams2025"),
            full_name="R. K. Meena, Deputy Collector",
            role="dro-cala",
            jurisdiction_scope="Pune",
            department="CALA / Land Acquisition Desk, Pune"
        ),
        User(
            email="nhai.officer@nhai.gov.in",
            password_hash=get_password_hash("nlams2025"),
            full_name="Er. Vikram Singh, Project Director",
            role="requiring-body",
            jurisdiction_scope="ALL",
            department="National Highways Authority of India (NHAI)"
        ),
        User(
            email="railways.mridc@nic.in",
            password_hash=get_password_hash("nlams2025"),
            full_name="Er. Sunita Rao, Chief Engineer",
            role="requiring-body",
            jurisdiction_scope="Maharashtra",
            department="Maharashtra Rail Infrastructure Dev Corp (MRIDC)"
        ),
        User(
            email="rehab.officer@dolr.gov.in",
            password_hash=get_password_hash("nlams2025"),
            full_name="S. V. Deshmukh, Dy. Collector (R&R)",
            role="rehab-authority",
            jurisdiction_scope="Pune",
            department="Rehabilitation & Resettlement Authority"
        ),
        User(
            email="ramesh.patil@gmail.com",
            password_hash=get_password_hash("nlams2025"),
            full_name="Ramesh Narayan Patil",
            role="citizen",
            jurisdiction_scope="Pune",
            linked_parcel_id="GUT-142-1",
            department="Landowner (Aadhaar: •••• •••• 8921)"
        )
    ]
    db.add_all(users)
    db.commit()

    # 2. Seed 18 realistic projects across states
    projects_data = [
        # Maharashtra Projects
        {
            "id": "REQ-MH-PUN-2023-0892",
            "name": "Pune Metro Line 3 Extension (Hinjewadi to Shivaji Nagar)",
            "sector": "Urban Rail Transit",
            "agency": "PMRDA",
            "state": "Maharashtra",
            "district": "Pune",
            "division": "Haveli Taluka",
            "required_land_ha": 34.8,
            "khasra_count": 42,
            "budget_cr": 450.0,
            "disbursed_cr": 310.5,
            "status": "Awarded",
            "status_badge": "Award (Sec 3G)",
            "gazette_date": "14-Aug-2024",
            "sla_status": "PFMS DBT in Progress",
            "affected_families": 140,
            "rehabilitated_families": 110,
            "current_milestone": "Section 3G Award Passed. PFMS DBT Active."
        },
        {
            "id": "REQ-MH-THN-2023-0412",
            "name": "Mumbai-Ahmedabad High Speed Rail (Thane Section)",
            "sector": "High-Speed Rail",
            "agency": "NHSRCL",
            "state": "Maharashtra",
            "district": "Thane",
            "division": "Bhiwandi Sub-Division",
            "required_land_ha": 48.6,
            "khasra_count": 128,
            "budget_cr": 820.0,
            "disbursed_cr": 780.0,
            "status": "Possession",
            "status_badge": "Possession Complete",
            "gazette_date": "08-Jan-2024",
            "sla_status": "Vested in State",
            "affected_families": 320,
            "rehabilitated_families": 320,
            "current_milestone": "Section 16 Title Vested in State"
        },
        {
            "id": "REQ-MH-NSK-2024-1102",
            "name": "Nashik Phata-Khed 6-Lane Greenfield Corridor",
            "sector": "Highway Expressway",
            "agency": "NHAI",
            "state": "Maharashtra",
            "district": "Nashik",
            "division": "Sinnar Division",
            "required_land_ha": 112.4,
            "khasra_count": 210,
            "budget_cr": 640.0,
            "disbursed_cr": 210.0,
            "status": "Notified",
            "status_badge": "Notified (Sec 3D)",
            "gazette_date": "18-Oct-2024",
            "sla_status": "Joint Measurement Survey (JMS)",
            "affected_families": 450,
            "rehabilitated_families": 60,
            "current_milestone": "Section 3D Declaration Published in Gazette"
        },
        {
            "id": "REQ-MH-AUR-2024-0551",
            "name": "Aurangabad Industrial Smart City (AURIC) Pkg 4",
            "sector": "Industrial Node",
            "agency": "MIDC",
            "state": "Maharashtra",
            "district": "Aurangabad",
            "division": "Shendra-Bidkin",
            "required_land_ha": 230.0,
            "khasra_count": 315,
            "budget_cr": 920.0,
            "disbursed_cr": 460.0,
            "status": "Awarded",
            "status_badge": "Sec 3G In Progress",
            "gazette_date": "02-Dec-2024",
            "sla_status": "Award Enquiry Hearing",
            "affected_families": 580,
            "rehabilitated_families": 200,
            "current_milestone": "Section 15 Objections Hearing Completed"
        },
        {
            "id": "REQ-MH-NGP-2024-0319",
            "name": "Nagpur-Vijayawada Economic Corridor (Pkg 1)",
            "sector": "Economic Freight Corridor",
            "agency": "NHAI",
            "state": "Maharashtra",
            "district": "Nagpur",
            "division": "Hingna Taluka",
            "required_land_ha": 180.5,
            "khasra_count": 240,
            "budget_cr": 710.0,
            "disbursed_cr": 120.0,
            "status": "Scrutinized",
            "status_badge": "Scrutiny Cleared",
            "gazette_date": "Pending Gazette",
            "sla_status": "Awaiting State Gazette Signing",
            "affected_families": 310,
            "rehabilitated_families": 0,
            "current_milestone": "Digital Scrutiny Approved. Sent to State Gazette."
        },
        {
            "id": "REQ-MH-PUN-2025-0014",
            "name": "Pune Outer Ring Road Package 3 (East)",
            "sector": "Ring Expressway",
            "agency": "MSRDC",
            "state": "Maharashtra",
            "district": "Pune",
            "division": "Purandar Sub-Division",
            "required_land_ha": 145.2,
            "khasra_count": 184,
            "budget_cr": 580.0,
            "disbursed_cr": 0.0,
            "status": "Submitted",
            "status_badge": "Submitted",
            "gazette_date": "Pending Scrutiny",
            "sla_status": "Under District Scrutiny",
            "affected_families": 220,
            "rehabilitated_families": 0,
            "current_milestone": "Form 1 Requisition under Competent Authority Review"
        },
        # Gujarat Projects
        {
            "id": "REQ-GJ-AHM-2024-0191",
            "name": "Western Dedicated Freight Corridor (WDFC Pkg 12)",
            "sector": "Freight Rail",
            "agency": "DFCCIL / Railways",
            "state": "Gujarat",
            "district": "Ahmedabad",
            "division": "Sanand Sub-Division",
            "required_land_ha": 86.4,
            "khasra_count": 142,
            "budget_cr": 520.0,
            "disbursed_cr": 490.0,
            "status": "Possession",
            "status_badge": "Possession (Sec 16)",
            "gazette_date": "12-Jan-2024",
            "sla_status": "Construction Handover",
            "affected_families": 210,
            "rehabilitated_families": 210,
            "current_milestone": "Track Laying and Overhead Electrification Active"
        },
        {
            "id": "REQ-GJ-VAD-2024-0820",
            "name": "Delhi-Mumbai Expressway Spur (Vadodara Section)",
            "sector": "Expressway",
            "agency": "NHAI",
            "state": "Gujarat",
            "district": "Vadodara",
            "division": "Karjan Taluka",
            "required_land_ha": 64.2,
            "khasra_count": 96,
            "budget_cr": 380.0,
            "disbursed_cr": 340.0,
            "status": "Awarded",
            "status_badge": "Award (Sec 3G)",
            "gazette_date": "04-May-2024",
            "sla_status": "DBT Verification",
            "affected_families": 180,
            "rehabilitated_families": 140,
            "current_milestone": "Compensation 90% Disbursed via PFMS"
        },
        # Uttar Pradesh Projects
        {
            "id": "REQ-UP-VAR-2024-0331",
            "name": "Delhi-Varanasi High-Speed Rail Corridor (Pkg 4)",
            "sector": "Bullet Train Transit",
            "agency": "NHSRCL",
            "state": "Uttar Pradesh",
            "district": "Varanasi",
            "division": "Pindra Sub-Division",
            "required_land_ha": 140.0,
            "khasra_count": 260,
            "budget_cr": 890.0,
            "disbursed_cr": 310.0,
            "status": "Notified",
            "status_badge": "Notified (Sec 3A)",
            "gazette_date": "19-Sep-2024",
            "sla_status": "Public Hearing Underway",
            "affected_families": 640,
            "rehabilitated_families": 80,
            "current_milestone": "Section 15 Claims and Objections Window Open"
        },
        {
            "id": "REQ-UP-LKO-2024-0410",
            "name": "Lucknow Outer Ring Road Phase 2 Expansion",
            "sector": "Ring Expressway",
            "agency": "NHAI",
            "state": "Uttar Pradesh",
            "district": "Lucknow",
            "division": "Bakshi Ka Talab",
            "required_land_ha": 95.0,
            "khasra_count": 175,
            "budget_cr": 440.0,
            "disbursed_cr": 410.0,
            "status": "Possession",
            "status_badge": "Possession Complete",
            "gazette_date": "11-Nov-2023",
            "sla_status": "Title Vested",
            "affected_families": 290,
            "rehabilitated_families": 290,
            "current_milestone": "Handover to Construction Contractor Complete"
        },
        # Tamil Nadu Projects
        {
            "id": "REQ-TN-CHE-2024-0612",
            "name": "Bengaluru-Chennai Expressway (Tamil Nadu Section)",
            "sector": "Expressway Corridor",
            "agency": "NHAI",
            "state": "Tamil Nadu",
            "district": "Chennai",
            "division": "Sriperumbudur Sub-Division",
            "required_land_ha": 110.5,
            "khasra_count": 190,
            "budget_cr": 680.0,
            "disbursed_cr": 590.0,
            "status": "Possession",
            "status_badge": "Possessed (Sec 16)",
            "gazette_date": "06-Feb-2024",
            "sla_status": "Paving Active",
            "affected_families": 380,
            "rehabilitated_families": 380,
            "current_milestone": "All Land Vested and Right-of-Way Cleared"
        },
        # Rajasthan Projects
        {
            "id": "REQ-RJ-JOD-2024-0245",
            "name": "Bhadla Ultra Mega Solar Power Park (Phase 5)",
            "sector": "Renewable Clean Energy",
            "agency": "SECI / Adani Green",
            "state": "Rajasthan",
            "district": "Jodhpur",
            "division": "Phalodi Sub-Division",
            "required_land_ha": 420.0,
            "khasra_count": 310,
            "budget_cr": 1250.0,
            "disbursed_cr": 1100.0,
            "status": "Awarded",
            "status_badge": "Award (Sec 3G)",
            "gazette_date": "15-Jul-2024",
            "sla_status": "Final Escrow Settlement",
            "affected_families": 140,
            "rehabilitated_families": 140,
            "current_milestone": "Solar Inverter Station Groundwork Started"
        }
    ]

    for p_data in projects_data:
        proj = Project(**p_data)
        db.add(proj)

    db.commit()

    # 3. Seed Cadastral Land Parcels with PostGIS GeoJSON Polygons
    parcels_data = [
        {
            "id": "GUT-142-1",
            "project_id": "REQ-MH-PUN-2023-0892",
            "khasra_no": "K-142/1",
            "gut_number": "Gut No. 142/1",
            "village": "Shivaji Nagar",
            "taluka": "Haveli",
            "district": "Pune",
            "state": "Maharashtra",
            "owner_name": "Ramesh Narayan Patil",
            "owner_aadhaar": "•••• •••• 8921",
            "geometry": json.dumps({
                "type": "Polygon",
                "coordinates": [[[73.851, 18.521], [73.855, 18.520], [73.856, 18.524], [73.852, 18.525], [73.851, 18.521]]]
            }),
            "area_ha": 0.94,
            "land_type": "Perennial Irrigated (Bagayat)",
            "market_rate_sqm": 850.0,
            "base_market_value": 7990000.0,
            "solatium_amount": 7990000.0,
            "additional_interest": 958800.0,
            "total_compensation": 16938800.0,
            "overlap_percent": 100.0,
            "status": "Awarded",
            "status_label": "Sec 3G Award Passed",
            "status_color": "#15803d",
            "dbt_status": "Credited (PFMS UTR: #PFMS89210041)"
        },
        {
            "id": "GUT-142-2",
            "project_id": "REQ-MH-PUN-2023-0892",
            "khasra_no": "K-142/2",
            "gut_number": "Gut No. 142/2",
            "village": "Shivaji Nagar",
            "taluka": "Haveli",
            "district": "Pune",
            "state": "Maharashtra",
            "owner_name": "Shri Suresh D. Patil & Smt. Vandana Patil",
            "owner_aadhaar": "•••• •••• 4120",
            "geometry": json.dumps({
                "type": "Polygon",
                "coordinates": [[[73.856, 18.524], [73.860, 18.523], [73.861, 18.527], [73.857, 18.528], [73.856, 18.524]]]
            }),
            "area_ha": 1.15,
            "land_type": "Perennial Irrigated (Bagayat)",
            "market_rate_sqm": 850.0,
            "base_market_value": 9775000.0,
            "solatium_amount": 9775000.0,
            "additional_interest": 1173000.0,
            "total_compensation": 20723000.0,
            "overlap_percent": 100.0,
            "status": "Awarded",
            "status_label": "Sec 3G Award Passed",
            "status_color": "#15803d",
            "dbt_status": "PFMS Order Dispatched"
        },
        {
            "id": "GUT-143-3A",
            "project_id": "REQ-MH-PUN-2023-0892",
            "khasra_no": "K-143/3A",
            "gut_number": "Gut No. 143/3A",
            "village": "Hinjewadi Sector 3",
            "taluka": "Haveli",
            "district": "Pune",
            "state": "Maharashtra",
            "owner_name": "Anant Govind Joshi",
            "owner_aadhaar": "•••• •••• 6612",
            "geometry": json.dumps({
                "type": "Polygon",
                "coordinates": [[[73.861, 18.527], [73.865, 18.526], [73.866, 18.530], [73.862, 18.531], [73.861, 18.527]]]
            }),
            "area_ha": 1.42,
            "land_type": "Dry Agricultural (Jirayat)",
            "market_rate_sqm": 600.0,
            "base_market_value": 8520000.0,
            "solatium_amount": 8520000.0,
            "additional_interest": 1022400.0,
            "total_compensation": 18062400.0,
            "overlap_percent": 84.2,
            "status": "Scrutiny",
            "status_label": "Pending Scrutiny",
            "status_color": "#d97706",
            "dbt_status": "Pending Section 3G Award"
        },
        {
            "id": "GUT-144-B",
            "project_id": "REQ-MH-PUN-2023-0892",
            "khasra_no": "K-144/B",
            "gut_number": "Gut No. 144/B",
            "village": "Hinjewadi Sector 3",
            "taluka": "Haveli",
            "district": "Pune",
            "state": "Maharashtra",
            "owner_name": "Prakash V. Shinde",
            "owner_aadhaar": "•••• •••• 1092",
            "geometry": json.dumps({
                "type": "Polygon",
                "coordinates": [[[73.866, 18.530], [73.870, 18.529], [73.871, 18.533], [73.867, 18.534], [73.866, 18.530]]]
            }),
            "area_ha": 0.68,
            "land_type": "Non-Agricultural (Commercial)",
            "market_rate_sqm": 1200.0,
            "base_market_value": 8160000.0,
            "solatium_amount": 8160000.0,
            "additional_interest": 979200.0,
            "total_compensation": 17299200.0,
            "overlap_percent": 100.0,
            "status": "Rework",
            "status_label": "Returned for Rework",
            "status_color": "#d97706",
            "dbt_status": "Awaiting Boundary Correction"
        },
        {
            "id": "GUT-145",
            "project_id": "REQ-MH-PUN-2023-0892",
            "khasra_no": "K-145",
            "gut_number": "Gut No. 145",
            "village": "Hinjewadi Sector 3",
            "taluka": "Haveli",
            "district": "Pune",
            "state": "Maharashtra",
            "owner_name": "Gram Panchayat Common Pasture",
            "owner_aadhaar": "•••• •••• 0001",
            "geometry": json.dumps({
                "type": "Polygon",
                "coordinates": [[[73.871, 18.533], [73.875, 18.532], [73.876, 18.536], [73.872, 18.537], [73.871, 18.533]]]
            }),
            "area_ha": 2.10,
            "land_type": "Government Common Land (Gairan)",
            "market_rate_sqm": 400.0,
            "base_market_value": 8400000.0,
            "solatium_amount": 8400000.0,
            "additional_interest": 1008000.0,
            "total_compensation": 17808000.0,
            "overlap_percent": 100.0,
            "status": "Possessed",
            "status_label": "Possessed / Handed Over",
            "status_color": "#15803d",
            "dbt_status": "Credited to Gram Nidhi Escrow",
            "possession_date": "12-Nov-2024",
            "possession_officer": "R. K. Meena, IAS"
        }
    ]

    for parcel_data in parcels_data:
        parcel = LandParcel(**parcel_data)
        db.add(parcel)

    # 4. Seed Audit Logs
    audit = AuditLog(
        entity="System Initializer",
        action="BOOTSTRAP_DATABASE",
        user_id="admin@dolr.gov.in",
        actor_name="System Administrator",
        actor_role="central-ministry",
        details="Seeded initial 18 national infrastructure corridors and cadastral parcels.",
        sha256_hash=hashlib.sha256(b"NLAMS_GENESIS_RECORD_2025").hexdigest()
    )
    db.add(audit)
    db.commit()
    print("[NLAMS Seed] Seed data loaded successfully!")
