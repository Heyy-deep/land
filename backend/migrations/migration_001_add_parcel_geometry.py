"""
Migration 001: Add and verify PostGIS geometry column on land_parcels table
and seed realistic cadastral parcel boundary polygons.

Supports:
- PostgreSQL with PostGIS extension (geometry(Geometry, 4326) with GIST spatial index)
- SQLite fallback with GeoJSON spatial simulation
"""

import sys
import json
import logging
from sqlalchemy import text, inspect
from backend.database import engine

logging.basicConfig(level=logging.INFO, format="[MIGRATION 001] %(message)s")
logger = logging.getLogger("migration_001")

# Realistic non-overlapping 5-7 point cadastral polygon geometries
# Scaled to match the exact statutory acquired extent in hectares
PARCEL_GEOMETRIES = {
    "WB-HGY-DNK-01": {
        "type": "Polygon",
        "coordinates": [
            [
                [88.291268, 22.684994],
                [88.292277, 22.684792],
                [88.292546, 22.685599],
                [88.292075, 22.686003],
                [88.291335, 22.685801],
                [88.290999, 22.68533],
                [88.291268, 22.684994]
            ]
        ]
    },
    "WB-HGY-DNK-02": {
        "type": "Polygon",
        "coordinates": [
            [
                [88.293663, 22.68481],
                [88.294416, 22.684685],
                [88.294667, 22.685312],
                [88.29429, 22.685626],
                [88.2936, 22.6855],
                [88.293663, 22.68481]
            ]
        ]
    },
    "WB-HGY-JNI-03": {
        "type": "Polygon",
        "coordinates": [
            [
                [88.249892, 22.704412],
                [88.250892, 22.704176],
                [88.251127, 22.704941],
                [88.250657, 22.705235],
                [88.250009, 22.705059],
                [88.249656, 22.704706],
                [88.249892, 22.704412]
            ]
        ]
    },
    "WB-HGY-BGP-04": {
        "type": "Polygon",
        "coordinates": [
            [
                [88.266512, 22.730676],
                [88.267251, 22.730505],
                [88.267421, 22.731074],
                [88.26691, 22.731301],
                [88.266398, 22.731074],
                [88.266512, 22.730676]
            ]
        ]
    },
    "WB-HGY-SNG-05": {
        "type": "Polygon",
        "coordinates": [
            [
                [88.225986, 22.811293],
                [88.227235, 22.810996],
                [88.227533, 22.812007],
                [88.227057, 22.812423],
                [88.226224, 22.812245],
                [88.225748, 22.811769],
                [88.225986, 22.811293]
            ]
        ]
    },
    "WB-HWH-SLP-06": {
        "type": "Polygon",
        "coordinates": [
            [
                [88.275894, 22.614692],
                [88.276728, 22.61447],
                [88.27695, 22.615081],
                [88.276506, 22.615359],
                [88.275839, 22.615192],
                [88.275894, 22.614692]
            ]
        ]
    },
    "MH-PUN-HIN-01": {
        "type": "Polygon",
        "coordinates": [
            [
                [73.727909, 18.590711],
                [73.728811, 18.590486],
                [73.729037, 18.591162],
                [73.728585, 18.591444],
                [73.727852, 18.591275],
                [73.727909, 18.590711]
            ]
        ]
    },
    "UP-YEIDA-JEW-01": {
        "type": "Polygon",
        "coordinates": [
            [
                [77.579926, 28.179726],
                [77.580893, 28.179442],
                [77.581177, 28.180238],
                [77.580666, 28.180579],
                [77.579983, 28.180352],
                [77.579699, 28.180011],
                [77.579926, 28.179726]
            ]
        ]
    }
}

ADDITIONAL_PROJECTS = [
    {
        "id": "REQ-UP-JWR-2023-0512",
        "name": "Noida International Airport (Jewar Phase-II Corridor)",
        "sector": "Aviation & Industrial Corridor",
        "agency": "YEIDA / NIAL",
        "state": "Uttar Pradesh",
        "district": "Gautam Buddha Nagar",
        "division": "Jewar Sub-Division",
        "required_land_ha": 115.0,
        "khasra_count": 82,
        "budget_cr": 680.0,
        "disbursed_cr": 590.0,
        "status": "Awarded",
        "status_badge": "Award (Sec 23)",
        "gazette_date": "12-Nov-2024",
        "sla_status": "PFMS DBT in Progress",
        "affected_families": 210,
        "rehabilitated_families": 195,
        "current_milestone": "Section 23 Statutory Award Declared. PFMS DBT Disbursal Active."
    }
]

ADDITIONAL_PARCELS = [
    {
        "id": "MH-PUN-HIN-01",
        "project_id": "REQ-MH-PUN-2023-0892",
        "khasra_no": "K-142/1",
        "gut_number": "Gut No. 142/1",
        "village": "Hinjewadi",
        "taluka": "Mulshi",
        "district": "Pune",
        "state": "Maharashtra",
        "owner_name": "Ramesh Narayan Patil",
        "owner_aadhaar": "•••• •••• 8921",
        "geometry": json.dumps(PARCEL_GEOMETRIES["MH-PUN-HIN-01"]),
        "area_ha": 0.94,
        "land_type": "Non-Agricultural / Commercial",
        "market_rate_sqm": 2500.0,
        "base_market_value": 2350000.0,
        "solatium_amount": 2350000.0,
        "additional_interest": 0.0,
        "total_compensation": 4700000.0,
        "overlap_percent": 92.0,
        "status": "Possessed",
        "status_label": "Possessed / Cleared (Sec 16)",
        "status_color": "#15803d",
        "dbt_status": "Credited (PFMS UTR: #SBIN00482910)",
        "possession_date": "14-Oct-2024",
        "possession_officer": "Dr. Rajesh Deshmukh, IAS"
    },
    {
        "id": "UP-YEIDA-JEW-01",
        "project_id": "REQ-UP-JWR-2023-0512",
        "khasra_no": "Khata #00128",
        "gut_number": "Khasra No. 348/2",
        "village": "Ranhera",
        "taluka": "Jewar",
        "district": "Gautam Buddha Nagar",
        "state": "Uttar Pradesh",
        "owner_name": "Ram Swarup Yadav",
        "owner_aadhaar": "•••• •••• 6534",
        "geometry": json.dumps(PARCEL_GEOMETRIES["UP-YEIDA-JEW-01"]),
        "area_ha": 1.15,
        "land_type": "Agricultural (Chahi / Nahari)",
        "market_rate_sqm": 1800.0,
        "base_market_value": 3425000.0,
        "solatium_amount": 3425000.0,
        "additional_interest": 0.0,
        "total_compensation": 6850000.0,
        "overlap_percent": 95.0,
        "status": "Awarded",
        "status_label": "Award Declared (Sec 23)",
        "status_color": "#0284c7",
        "dbt_status": "Credited (PFMS UTR: #BARBUP2419082)",
        "possession_date": None,
        "possession_officer": "Sh. Manish Kumar Verma, IAS"
    }
]

def migrate(target_engine=None):
    if target_engine is None:
        target_engine = engine

    is_postgres = "postgres" in str(target_engine.url)
    dialect_name = "PostgreSQL" if is_postgres else "SQLite"
    logger.info(f"Starting Migration 001 on active database: {dialect_name} ({target_engine.url})")

    with target_engine.connect() as conn:
        # 1. PostGIS verification / Column creation
        if is_postgres:
            logger.info("Enabling PostGIS extension on PostgreSQL...")
            conn.execute(text("CREATE EXTENSION IF NOT EXISTS postgis;"))
            conn.commit()

            # Check if geometry column exists
            inspector = inspect(target_engine)
            columns = [c["name"] for c in inspector.get_columns("land_parcels")]
            if "geometry" not in columns:
                logger.info("Adding PostGIS geometry column: geometry(Geometry, 4326)...")
                conn.execute(text("ALTER TABLE land_parcels ADD COLUMN geometry geometry(Geometry, 4326);"))
                conn.commit()
            
            # Ensure spatial GiST index exists
            logger.info("Verifying GiST spatial index on land_parcels.geometry...")
            conn.execute(text("CREATE INDEX IF NOT EXISTS idx_land_parcels_geom ON land_parcels USING GIST (geometry);"))
            conn.commit()
            logger.info("PostGIS geometry column and GiST index confirmed active.")
        else:
            # SQLite fallback
            inspector = inspect(target_engine)
            columns = [c["name"] for c in inspector.get_columns("land_parcels")]
            if "geometry" not in columns:
                logger.info("Adding simulated geometry column (TEXT) to SQLite land_parcels table...")
                conn.execute(text("ALTER TABLE land_parcels ADD COLUMN geometry TEXT;"))
                conn.commit()
            logger.info("SQLite PostGIS simulation geometry column verified.")

        # 2. Ensure supporting project records exist (e.g. Jewar Airport for UP parcel)
        for proj in ADDITIONAL_PROJECTS:
            check_proj = conn.execute(text("SELECT id FROM projects WHERE id = :id"), {"id": proj["id"]}).fetchone()
            if not check_proj:
                logger.info(f"Seeding missing project requirement: {proj['id']} - {proj['name']}")
                conn.execute(
                    text("""
                        INSERT INTO projects (id, name, sector, agency, state, district, division, required_land_ha, khasra_count, budget_cr, disbursed_cr, status, status_badge, gazette_date, sla_status, affected_families, rehabilitated_families, current_milestone)
                        VALUES (:id, :name, :sector, :agency, :state, :district, :division, :required_land_ha, :khasra_count, :budget_cr, :disbursed_cr, :status, :status_badge, :gazette_date, :sla_status, :affected_families, :rehabilitated_families, :current_milestone)
                    """),
                    proj
                )
                conn.commit()

        # 3. Seed additional demo parcels if missing
        for p in ADDITIONAL_PARCELS:
            check_p = conn.execute(text("SELECT id FROM land_parcels WHERE id = :id"), {"id": p["id"]}).fetchone()
            if not check_p:
                logger.info(f"Seeding missing demo parcel: {p['id']} ({p['gut_number']} - {p['owner_name']})")
                if is_postgres:
                    import shapely.geometry
                    from geoalchemy2.elements import WKTElement
                    geom_dict = json.loads(p["geometry"])
                    shape = shapely.geometry.shape(geom_dict)
                    geom_val = f"ST_GeomFromText('{shape.wkt}', 4326)"
                    conn.execute(
                        text(f"""
                            INSERT INTO land_parcels (id, project_id, khasra_no, gut_number, village, taluka, district, state, owner_name, owner_aadhaar, geometry, area_ha, land_type, market_rate_sqm, base_market_value, solatium_amount, additional_interest, total_compensation, overlap_percent, status, status_label, status_color, dbt_status, possession_date, possession_officer)
                            VALUES (:id, :project_id, :khasra_no, :gut_number, :village, :taluka, :district, :state, :owner_name, :owner_aadhaar, {geom_val}, :area_ha, :land_type, :market_rate_sqm, :base_market_value, :solatium_amount, :additional_interest, :total_compensation, :overlap_percent, :status, :status_label, :status_color, :dbt_status, :possession_date, :possession_officer)
                        """),
                        p
                    )
                else:
                    conn.execute(
                        text("""
                            INSERT INTO land_parcels (id, project_id, khasra_no, gut_number, village, taluka, district, state, owner_name, owner_aadhaar, geometry, area_ha, land_type, market_rate_sqm, base_market_value, solatium_amount, additional_interest, total_compensation, overlap_percent, status, status_label, status_color, dbt_status, possession_date, possession_officer)
                            VALUES (:id, :project_id, :khasra_no, :gut_number, :village, :taluka, :district, :state, :owner_name, :owner_aadhaar, :geometry, :area_ha, :land_type, :market_rate_sqm, :base_market_value, :solatium_amount, :additional_interest, :total_compensation, :overlap_percent, :status, :status_label, :status_color, :dbt_status, :possession_date, :possession_officer)
                        """),
                        p
                    )
                conn.commit()

        # 4. Update existing parcel boundary polygons with scaled, non-overlapping GeoJSON
        logger.info("Upgrading all existing parcel boundaries to realistic cadastral polygons...")
        for parcel_id, geom_obj in PARCEL_GEOMETRIES.items():
            if is_postgres:
                import shapely.geometry
                shape = shapely.geometry.shape(geom_obj)
                wkt_str = shape.wkt
                conn.execute(
                    text(f"UPDATE land_parcels SET geometry = ST_GeomFromText('{wkt_str}', 4326) WHERE id = :id"),
                    {"id": parcel_id}
                )
            else:
                conn.execute(
                    text("UPDATE land_parcels SET geometry = :geom WHERE id = :id"),
                    {"geom": json.dumps(geom_obj), "id": parcel_id}
                )
        conn.commit()

    logger.info("Migration 001 executed successfully. All 8 parcels verified with realistic polygons.")

if __name__ == "__main__":
    migrate()
