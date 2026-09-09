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

    print("[NLAMS Seed] Seeding authentic West Bengal / Hooghly and National benchmark records...")

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
            email="secretary.rev@wb.gov.in",
            password_hash=get_password_hash("nlams2025"),
            full_name="Dr. Amitava Das, IAS",
            role="state-revenue",
            jurisdiction_scope="West Bengal",
            department="Land & Land Reforms and Refugee Relief Dept, West Bengal"
        ),
        User(
            email="dro.hooghly@wb.gov.in",
            password_hash=get_password_hash("nlams2025"),
            full_name="Smt. Sreemoyee Sen, WBCS (Exe)",
            role="dro-cala",
            jurisdiction_scope="Hooghly",
            department="District Land & Land Reforms Office (DLLRO), Hooghly"
        ),
        User(
            email="kmda.officer@kmda.wb.gov.in",
            password_hash=get_password_hash("nlams2025"),
            full_name="Er. Sourav Ganguly, Chief Engineer",
            role="requiring-body",
            jurisdiction_scope="West Bengal",
            department="Kolkata Metropolitan Development Authority (KMDA)"
        ),
        User(
            email="pwd.roads@wb.gov.in",
            password_hash=get_password_hash("nlams2025"),
            full_name="Er. Kalyan Kumar Dey, Executive Engineer",
            role="requiring-body",
            jurisdiction_scope="West Bengal",
            department="Public Works Department (Roads Wing), West Bengal"
        ),
        User(
            email="rehab.officer@wb.gov.in",
            password_hash=get_password_hash("nlams2025"),
            full_name="P. K. Biswas, Dy. Collector (R&R)",
            role="rehab-authority",
            jurisdiction_scope="Hooghly",
            department="Rehabilitation & Resettlement Authority, Hooghly"
        ),
        User(
            email="subrata.ghosh@gmail.com",
            password_hash=get_password_hash("nlams2025"),
            full_name="Subrata Ghosh",
            role="citizen",
            jurisdiction_scope="Hooghly",
            linked_parcel_id="WB-HGY-DNK-01",
            department="Landowner (Aadhaar: •••• •••• 1012, Mouza: Dankuni JL 34)"
        )
    ]
    db.add_all(users)
    db.commit()

    # 2. Seed realistic projects (West Bengal Hooghly Focus + National Benchmark Corridors)
    projects_data = [
        # West Bengal / Hooghly Projects (modeled on official LA notices)
        {
            "id": "REQ-WB-HGY-2023-0101",
            "name": "EDFC Land Acquisition (Dankuni Freight Terminal & Rail Linkage)",
            "sector": "Dedicated Freight Corridor",
            "agency": "DFCCIL / Indian Railways / KMDA",
            "state": "West Bengal",
            "district": "Hooghly",
            "division": "Chanditala-II & Dankuni Municipality",
            "required_land_ha": 88.4,
            "khasra_count": 64,
            "budget_cr": 450.0,
            "disbursed_cr": 380.0,
            "status": "Possession",
            "status_badge": "Possession (Sec 38)",
            "gazette_date": "12-Jan-2024",
            "sla_status": "Vested in Railway Authority",
            "affected_families": 240,
            "rehabilitated_families": 232,
            "current_milestone": "Land Vested in DFCCIL. Track Construction Commenced."
        },
        {
            "id": "REQ-WB-HGY-2023-0205",
            "name": "GAIL RoU Natural Gas Pipeline Corridor (Jagatballavpur - Dankuni Spur)",
            "sector": "Energy & Gas Grid",
            "agency": "GAIL (India) Ltd / KMDA",
            "state": "West Bengal",
            "district": "Hooghly",
            "division": "Chanditala-II (Janai & Begampur)",
            "required_land_ha": 42.6,
            "khasra_count": 48,
            "budget_cr": 180.0,
            "disbursed_cr": 145.0,
            "status": "Awarded",
            "status_badge": "Award (Sec 3G)",
            "gazette_date": "18-Mar-2024",
            "sla_status": "PFMS DBT in Progress",
            "affected_families": 160,
            "rehabilitated_families": 140,
            "current_milestone": "Section 3G Statutory Award Passed. DBT Payments Active."
        },
        {
            "id": "REQ-WB-HGY-2024-0318",
            "name": "Varanasi-Kolkata Greenfield Expressway (NH-319B Hooghly Section)",
            "sector": "Greenfield Expressway",
            "agency": "NHAI (PIU Kolkata)",
            "state": "West Bengal",
            "district": "Hooghly",
            "division": "Singur & Chanditala Alignment",
            "required_land_ha": 124.5,
            "khasra_count": 112,
            "budget_cr": 520.0,
            "disbursed_cr": 180.0,
            "status": "Notified",
            "status_badge": "Notified (Sec 3D)",
            "gazette_date": "14-Aug-2024",
            "sla_status": "Joint Measurement Survey (JMS)",
            "affected_families": 380,
            "rehabilitated_families": 50,
            "current_milestone": "Section 3D Gazette Published. JMS Schedule Underway."
        },
        {
            "id": "REQ-WB-HGY-2024-0402",
            "name": "SH-13 Dankuni-Champadanga 4-Lane Industrial Corridor Widening",
            "sector": "Highway Expressway",
            "agency": "PWD (Roads Wing), West Bengal",
            "state": "West Bengal",
            "district": "Hooghly",
            "division": "Begampur & Chanditala Sub-Division",
            "required_land_ha": 36.8,
            "khasra_count": 54,
            "budget_cr": 210.0,
            "disbursed_cr": 45.0,
            "status": "Scrutinized",
            "status_badge": "Scrutiny Cleared",
            "gazette_date": "Pending Gazette",
            "sla_status": "Awaiting State Gazette Signing",
            "affected_families": 190,
            "rehabilitated_families": 0,
            "current_milestone": "Digital Scrutiny Approved. Sent to State Gazette."
        },
        {
            "id": "REQ-WB-HGY-2023-0511",
            "name": "Lower Damodar Flood Drainage & Embankment Resettlement",
            "sector": "Irrigation & Flood Management",
            "agency": "Irrigation & Waterways Department, WB",
            "state": "West Bengal",
            "district": "Hooghly",
            "division": "Arambagh & Khanakul Division",
            "required_land_ha": 62.0,
            "khasra_count": 86,
            "budget_cr": 160.0,
            "disbursed_cr": 150.0,
            "status": "Possession",
            "status_badge": "Possession Complete",
            "gazette_date": "24-Oct-2023",
            "sla_status": "Embankment Work Underway",
            "affected_families": 210,
            "rehabilitated_families": 210,
            "current_milestone": "Possession Handed Over. R&R Resettlement Colony Allotted."
        },
        {
            "id": "REQ-WB-HGY-2024-0619",
            "name": "400/220kV Rishra-Singur Power Transmission Corridor",
            "sector": "Power Transmission",
            "agency": "WBSEB / WBSETCL",
            "state": "West Bengal",
            "district": "Hooghly",
            "division": "Serampore & Singur Division",
            "required_land_ha": 28.5,
            "khasra_count": 38,
            "budget_cr": 140.0,
            "disbursed_cr": 0.0,
            "status": "Submitted",
            "status_badge": "Submitted (Sec 4)",
            "gazette_date": "Pending Scrutiny",
            "sla_status": "Under CALA Scrutiny",
            "affected_families": 85,
            "rehabilitated_families": 0,
            "current_milestone": "Form 1 Proposal under Scrutiny by CALA Hooghly"
        },
        {
            "id": "REQ-WB-HGY-2024-0720",
            "name": "Chanditala-Singur Surface Water Treatment & Pipeline Scheme",
            "sector": "Water & Sanitation",
            "agency": "Public Health Engineering (PHE) Dept, WB",
            "state": "West Bengal",
            "district": "Hooghly",
            "division": "Singur (Beraberi JL 24)",
            "required_land_ha": 21.2,
            "khasra_count": 26,
            "budget_cr": 115.0,
            "disbursed_cr": 95.0,
            "status": "Awarded",
            "status_badge": "Award (Sec 23/30)",
            "gazette_date": "10-May-2024",
            "sla_status": "DBT Disbursal Active",
            "affected_families": 95,
            "rehabilitated_families": 80,
            "current_milestone": "Award Passed. Solatium and Interest Paid to Landowners."
        },
        # National Multi-State Benchmark Projects
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
            "current_milestone": "Section 3A Hearing of Objections Active"
        },
        {
            "id": "REQ-TN-CHE-2024-0422",
            "name": "Chennai Outer Ring Rail Corridor (Pkg-2)",
            "sector": "Rail Freight Corridor",
            "agency": "Southern Railway",
            "state": "Tamil Nadu",
            "district": "Kanchipuram",
            "division": "Sriperumbudur",
            "required_land_ha": 98.5,
            "khasra_count": 164,
            "budget_cr": 640.0,
            "disbursed_cr": 540.0,
            "status": "Awarded",
            "status_badge": "Award (Sec 3G)",
            "gazette_date": "22-Jul-2024",
            "sla_status": "DBT Clearance",
            "affected_families": 280,
            "rehabilitated_families": 240,
            "current_milestone": "Compensation DBT 85% Disbursed"
        },
        {
            "id": "REQ-RJ-JPR-2024-0510",
            "name": "Delhi-Mumbai Expressway Spur (Jaipur Ring Section)",
            "sector": "Expressway",
            "agency": "NHAI",
            "state": "Rajasthan",
            "district": "Jaipur",
            "division": "Chaksu Taluka",
            "required_land_ha": 115.0,
            "khasra_count": 190,
            "budget_cr": 720.0,
            "disbursed_cr": 680.0,
            "status": "Possession",
            "status_badge": "Possession Complete",
            "gazette_date": "05-Feb-2024",
            "sla_status": "Vested in State",
            "affected_families": 310,
            "rehabilitated_families": 310,
            "current_milestone": "Land Vested in NHAI. Paving Underway."
        }
    ]

    for pdata in projects_data:
        project = Project(**pdata)
        db.add(project)

    # 3. Seed Realistic Cadastral Land Parcels (Grounded in Hooghly Mouzas)
    parcels_data = [
        {
            "id": "WB-HGY-DNK-01",
            "project_id": "REQ-WB-HGY-2023-0101",
            "khasra_no": "RS/LR-412/1",
            "gut_number": "Dag No. 412/1",
            "village": "Dankuni (JL 34)",
            "taluka": "Chanditala-II",
            "district": "Hooghly",
            "state": "West Bengal",
            "owner_name": "Subrata Ghosh",
            "owner_aadhaar": "•••• •••• 1012",
            "geometry": json.dumps({
                "type": "Polygon",
                "coordinates": [[[88.291, 22.685], [88.295, 22.683], [88.296, 22.687], [88.292, 22.688], [88.291, 22.685]]]
            }),
            "area_ha": 1.42,
            "land_type": "Agricultural (Sali / Bastu)",
            "market_rate_sqm": 1000.0,
            "base_market_value": 14200000.0,
            "solatium_amount": 14200000.0,
            "additional_interest": 3408000.0,
            "total_compensation": 31808000.0,
            "overlap_percent": 100.0,
            "status": "Possessed",
            "status_label": "Possessed / Vested (Sec 38)",
            "status_color": "#15803d",
            "dbt_status": "Credited via PFMS (UTR: #SBINWB2408912)",
            "possession_date": "18-Oct-2024",
            "possession_officer": "Smt. Sreemoyee Sen, WBCS"
        },
        {
            "id": "WB-HGY-DNK-02",
            "project_id": "REQ-WB-HGY-2023-0101",
            "khasra_no": "RS/LR-412/2",
            "gut_number": "Dag No. 412/2",
            "village": "Dankuni (JL 34)",
            "taluka": "Chanditala-II",
            "district": "Hooghly",
            "state": "West Bengal",
            "owner_name": "Anirban Mukherjee & Bros",
            "owner_aadhaar": "•••• •••• 4519",
            "geometry": json.dumps({
                "type": "Polygon",
                "coordinates": [[[88.296, 22.682], [88.300, 22.680], [88.301, 22.684], [88.297, 22.685], [88.296, 22.682]]]
            }),
            "area_ha": 0.85,
            "land_type": "Commercial / Bastu (Dokan)",
            "market_rate_sqm": 2500.0,
            "base_market_value": 21250000.0,
            "solatium_amount": 21250000.0,
            "additional_interest": 5100000.0,
            "total_compensation": 47600000.0,
            "overlap_percent": 85.0,
            "status": "Scrutiny",
            "status_label": "Under Joint Survey Scrutiny",
            "status_color": "#d97706",
            "dbt_status": "Pending CALA Scrutiny Approval"
        },
        {
            "id": "WB-HGY-JNI-03",
            "project_id": "REQ-WB-HGY-2023-0205",
            "khasra_no": "RS/LR-218/4",
            "gut_number": "Dag No. 218/4",
            "village": "Janai (JL 49)",
            "taluka": "Chanditala-II",
            "district": "Hooghly",
            "state": "West Bengal",
            "owner_name": "Debashis Banerjee",
            "owner_aadhaar": "•••• •••• 8820",
            "geometry": json.dumps({
                "type": "Polygon",
                "coordinates": [[[88.248, 22.705], [88.252, 22.703], [88.254, 22.707], [88.249, 22.708], [88.248, 22.705]]]
            }),
            "area_ha": 1.15,
            "land_type": "Agricultural (Aman Sali)",
            "market_rate_sqm": 900.0,
            "base_market_value": 10350000.0,
            "solatium_amount": 10350000.0,
            "additional_interest": 2484000.0,
            "total_compensation": 23184000.0,
            "overlap_percent": 100.0,
            "status": "Awarded",
            "status_label": "Award Declared (Sec 3G)",
            "status_color": "#133e7c",
            "dbt_status": "PFMS DBT Mandate Generated (#PFMS2024HGY)"
        },
        {
            "id": "WB-HGY-BGP-04",
            "project_id": "REQ-WB-HGY-2024-0402",
            "khasra_no": "RS/LR-105/3",
            "gut_number": "Dag No. 105/3",
            "village": "Begampur (JL 41)",
            "taluka": "Chanditala-II",
            "district": "Hooghly",
            "state": "West Bengal",
            "owner_name": "Mousumi Das",
            "owner_aadhaar": "•••• •••• 6314",
            "geometry": json.dumps({
                "type": "Polygon",
                "coordinates": [[[88.265, 22.731], [88.269, 22.729], [88.270, 22.733], [88.266, 22.734], [88.265, 22.731]]]
            }),
            "area_ha": 0.62,
            "land_type": "Residential (Bastu)",
            "market_rate_sqm": 1500.0,
            "base_market_value": 9300000.0,
            "solatium_amount": 9300000.0,
            "additional_interest": 2232000.0,
            "total_compensation": 20832000.0,
            "overlap_percent": 90.0,
            "status": "Scrutiny",
            "status_label": "Dossier Review Pending",
            "status_color": "#d97706",
            "dbt_status": "Awaiting JMS Sign-off"
        },
        {
            "id": "WB-HGY-SNG-05",
            "project_id": "REQ-WB-HGY-2024-0720",
            "khasra_no": "RS/LR-520/1A",
            "gut_number": "Dag No. 520/1A",
            "village": "Beraberi (Singur JL 24)",
            "taluka": "Singur",
            "district": "Hooghly",
            "state": "West Bengal",
            "owner_name": "Partha Pratim Roy",
            "owner_aadhaar": "•••• •••• 9245",
            "geometry": json.dumps({
                "type": "Polygon",
                "coordinates": [[[88.225, 22.812], [88.229, 22.810], [88.230, 22.815], [88.226, 22.816], [88.225, 22.812]]]
            }),
            "area_ha": 1.95,
            "land_type": "Agricultural (Do-Fasli Sali)",
            "market_rate_sqm": 850.0,
            "base_market_value": 16575000.0,
            "solatium_amount": 16575000.0,
            "additional_interest": 3978000.0,
            "total_compensation": 37128000.0,
            "overlap_percent": 100.0,
            "status": "Awarded",
            "status_label": "Award Passed (Sec 23/30)",
            "status_color": "#133e7c",
            "dbt_status": "Disbursed ₹37.1 Lakhs via PFMS DBT"
        },
        {
            "id": "WB-HWH-SLP-06",
            "project_id": "REQ-WB-HGY-2023-0101",
            "khasra_no": "RS/LR-88/2",
            "gut_number": "Dag No. 88/2",
            "village": "Salap (JL 12)",
            "taluka": "Domjur",
            "district": "Howrah",
            "state": "West Bengal",
            "owner_name": "Tapas Kumar Mondal",
            "owner_aadhaar": "•••• •••• 3190",
            "geometry": json.dumps({
                "type": "Polygon",
                "coordinates": [[[88.275, 22.615], [88.280, 22.612], [88.282, 22.617], [88.277, 22.619], [88.275, 22.615]]]
            }),
            "area_ha": 0.78,
            "land_type": "Commercial (Highway Frontage)",
            "market_rate_sqm": 3200.0,
            "base_market_value": 24960000.0,
            "solatium_amount": 24960000.0,
            "additional_interest": 5990400.0,
            "total_compensation": 55910400.0,
            "overlap_percent": 100.0,
            "status": "Objection",
            "status_label": "Civil Court Stay / Sec 64 Reference",
            "status_color": "#dc2626",
            "dbt_status": "Escrow Deposited with Land Acquisition Tribunal"
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
        details="Seeded authentic West Bengal / Hooghly land acquisition projects, real mouzas, and national corridors.",
        sha256_hash=hashlib.sha256(b"NLAMS_WB_HOOGHLY_GENESIS_2025").hexdigest()
    )
    db.add(audit)
    db.commit()
    print("[NLAMS Seed] Seed data loaded successfully!")
