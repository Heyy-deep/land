# Real-Time National Land Acquisition & Management System (NLAMS)
### Department of Land Resources (DoLR), Ministry of Rural Development, Government of India

A unified, real-time web-based platform that digitizes the complete land acquisition lifecycle under the **Right to Fair Compensation and Transparency in Land Acquisition, Rehabilitation and Resettlement Act, 2013 (RFCTLARR Act, 2013)**.

---

## Architecture & System Overview

The platform is powered by a **shared reactive database (PostgreSQL + PostGIS simulation)** with real-time Pub/Sub synchronization across **5 interconnected role-based dashboards**:

| # | Dashboard | Stakeholder Role | Key Features |
|---|---|---|---|
| **0** | **SSO Portal** | All Stakeholders | Aadhaar OTP (split 6-digit input), DSC e-Mudhra Token, Parichay / NIC Mail SSO, high-contrast Captcha, DigiLocker / MeriPehchaan integration. |
| **1** | **National Dashboard** | Central Ministry (DoLR) / Policy Makers | Nationwide KPIs, Thematic GIS Choropleth Map of India (with WDFC, EDFC, BMIC corridor overlays), 12-month outflow velocity curves, statutory stage distribution, and nodal escalations. |
| **2** | **State Dashboard** | State Revenue Directorate (Maharashtra) | Consolidated budget outlay & PFMS DBT progress bar, filterable State Cadastral Requisition Matrix, district share donut chart, and collectorate progress bars. |
| **3** | **District / CALA Desk** | District Collector / Field Officers (Pune) | Interactive GIS Cadastral Land Parcel Viewer with 110m RoW corridor buffer, Gut numbers (142/1, 142/2, 143/3A, 144/B, 145, 147), Digital Scrutiny Docket, and Section 3G / 16 approvals. |
| **4** | **Implementing Agency** | NHAI, Railways, MIDC, PMRDA | Form 1 statutory proposal submission wizard, GIS alignment coordinates setup, budget outlay, and document repository with version control. |
| **5** | **Citizen Transparency Portal** | Affected Landowners & Families | Khasra/Aadhaar search, Section 11/19 notice tracking, RFCTLARR Act 2013 compensation & 100% solatium breakdown, real-time PFMS DBT payment status, and Section 15 objection filing form. |

---

## 8-Stage Statutory Lifecycle

1. **Proposal Submission (Agency)**: Land Requiring Body submits Form 1 with corridor coordinates and feasibility studies.
2. **Digital Scrutiny (District/CALA)**: Cross-verified against digitized Bhulekh / MahaBhumi RoR land records.
3. **Statutory Notification (State)**: Section 11 preliminary notification / Section 19 declaration with digital DSC attestation.
4. **Award Declaration (CALA)**: Section 3G award determination with mandatory 100% solatium and 12% statutory interest.
5. **Compensation Disbursement (PFMS DBT)**: Automated electronic fund transfer directly to Aadhaar-seeded bank accounts.
6. **R&R Monitoring (Rehabilitation Authority)**: Family-wise resettlement tracking, housing grants, and annuity vouchers.
7. **Physical Possession (Field Officer)**: Field verification updating GIS cadastral parcel polygons from "Notified/Awarded" to "Possessed" (Green).
8. **Project Closure & Archival**: Immutable SHA-256 cryptographic audit attestation and document archival.

---

## Quick Start & Local Execution

### Prerequisites
- Any modern web browser (Chrome, Edge, Firefox, Safari).
- Python 3 or any static web server (Node.js `http-server`, `npx serve`, etc.).

### Running Locally
```bash
# Clone the repository
git clone https://github.com/Sreemoyeedas/ByteCoder.git
cd ByteCoder

# Start a local HTTP server
python3 -m http.server 3000

# Open in your browser
open http://localhost:3000
```

---

## Design System Fidelity

Built using the official Google Stitch design tokens:
- **Palette**: Deep Navy (`#00285b`), Saffron Secondary (`#904d00`), Forest Green (`#003112`), Lavender Surface (`#faf8ff`).
- **Typography**: `Source Serif 4` (headlines) and `Source Sans 3` (body and labels).
- **Icons**: Google Material Symbols Outlined.
- **Civic Styling**: Indian tricolor top accent, STQC Level-3 / ISO 27001 stamps, and accessibility font-size scalers (`A- / A / A+`).

---

## License & Statutory Compliance
Compliant with Government of India Guidelines for Indian Government Websites (GIGW 3.0), STQC cybersecurity standards, and the RFCTLARR Act, 2013.
