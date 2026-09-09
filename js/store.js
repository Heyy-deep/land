/**
 * NLAMS - Central Reactive In-Memory Database & Event Bus
 * Shared Statutory Store with RFC 7946 GeoJSON spatial geometries
 * Department of Land Resources (DoLR), Ministry of Rural Development, GoI
 */

(function(window) {
  'use strict';

  // Seed Projects Data (West Bengal Hooghly Priority Hub + Multi-State National Corridors)
  const INITIAL_PROJECTS = [
    {
      id: "REQ-WB-HGY-2023-0101",
      name: "EDFC Land Acquisition (Dankuni Freight Terminal & Rail Linkage)",
      agency: "DFCCIL / Railways / KMDA",
      sector: "Dedicated Freight Corridor",
      state: "West Bengal",
      district: "Hooghly",
      division: "Chanditala-II & Dankuni Municipality",
      requiredLandHa: 88.40,
      khasraCount: 64,
      stage: "Possession",
      statusBadge: "Possession (Sec 38)",
      budgetCr: 450.0,
      disbursedCr: 380.0,
      percentDisbursed: 84,
      gazetteDate: "12-Jan-2024",
      slaStatus: "Vested in State",
      affectedFamilies: 240,
      rehabilitatedFamilies: 232,
      currentMilestone: "Land Vested in DFCCIL. Rail Spur Construction Commenced.",
      coordinates: { lat: 22.6850, lng: 88.2910 }
    },
    {
      id: "REQ-WB-HGY-2023-0205",
      name: "GAIL RoU Natural Gas Pipeline Corridor (Jagatballavpur - Dankuni Spur)",
      agency: "GAIL (India) Ltd / KMDA",
      sector: "Energy & Gas Grid",
      state: "West Bengal",
      district: "Hooghly",
      division: "Chanditala-II (Janai & Begampur)",
      requiredLandHa: 42.60,
      khasraCount: 48,
      stage: "Awarded",
      statusBadge: "Award (Sec 3G)",
      budgetCr: 180.0,
      disbursedCr: 145.0,
      percentDisbursed: 81,
      gazetteDate: "18-Mar-2024",
      slaStatus: "PFMS DBT in Progress",
      affectedFamilies: 160,
      rehabilitatedFamilies: 140,
      currentMilestone: "Section 3G Award Passed. PFMS DBT Payments Active.",
      coordinates: { lat: 22.7050, lng: 88.2480 }
    },
    {
      id: "REQ-WB-HGY-2024-0318",
      name: "Varanasi-Kolkata Greenfield Expressway (NH-319B Hooghly Section)",
      agency: "NHAI (PIU Kolkata)",
      sector: "Greenfield Expressway",
      state: "West Bengal",
      district: "Hooghly",
      division: "Singur & Chanditala Alignment",
      requiredLandHa: 124.50,
      khasraCount: 112,
      stage: "Notified",
      statusBadge: "Notified (Sec 3D)",
      budgetCr: 520.0,
      disbursedCr: 180.0,
      percentDisbursed: 35,
      gazetteDate: "14-Aug-2024",
      slaStatus: "Joint Measurement Survey (JMS)",
      affectedFamilies: 380,
      rehabilitatedFamilies: 50,
      currentMilestone: "Section 3D Gazette Published. JMS Schedule Underway.",
      coordinates: { lat: 22.7500, lng: 88.2700 }
    },
    {
      id: "REQ-WB-HGY-2024-0402",
      name: "SH-13 Dankuni-Champadanga 4-Lane Industrial Corridor Widening",
      agency: "PWD (Roads Wing), West Bengal",
      sector: "Highway Expressway",
      state: "West Bengal",
      district: "Hooghly",
      division: "Begampur & Chanditala Sub-Division",
      requiredLandHa: 36.80,
      khasraCount: 54,
      stage: "Scrutinized",
      statusBadge: "Scrutiny Cleared",
      budgetCr: 210.0,
      disbursedCr: 45.0,
      percentDisbursed: 21,
      gazetteDate: "Pending Gazette",
      slaStatus: "Awaiting State Gazette Signing",
      affectedFamilies: 190,
      rehabilitatedFamilies: 0,
      currentMilestone: "Digital Scrutiny Approved. Sent to State Gazette.",
      coordinates: { lat: 22.7310, lng: 88.2650 }
    },
    {
      id: "REQ-WB-HGY-2023-0511",
      name: "Lower Damodar Flood Drainage & Embankment Resettlement",
      agency: "Irrigation & Waterways Dept, WB",
      sector: "Irrigation & Flood Control",
      state: "West Bengal",
      district: "Hooghly",
      division: "Arambagh & Khanakul Division",
      requiredLandHa: 62.00,
      khasraCount: 86,
      stage: "Possession",
      statusBadge: "Possession Complete",
      budgetCr: 160.0,
      disbursedCr: 150.0,
      percentDisbursed: 94,
      gazetteDate: "24-Oct-2023",
      slaStatus: "Embankment Work Active",
      affectedFamilies: 210,
      rehabilitatedFamilies: 210,
      currentMilestone: "Possession Handed Over. Model R&R Colony Allotted.",
      coordinates: { lat: 22.8800, lng: 87.7800 }
    },
    {
      id: "REQ-WB-HGY-2024-0619",
      name: "400/220kV Rishra-Singur Power Transmission Corridor",
      agency: "WBSEB / WBSETCL",
      sector: "Power Transmission Grid",
      state: "West Bengal",
      district: "Hooghly",
      division: "Serampore & Singur Division",
      requiredLandHa: 28.50,
      khasraCount: 38,
      stage: "Submitted",
      statusBadge: "Submitted (Sec 4)",
      budgetCr: 140.0,
      disbursedCr: 0.0,
      percentDisbursed: 0,
      gazetteDate: "Pending Scrutiny",
      slaStatus: "Under CALA Scrutiny",
      affectedFamilies: 85,
      rehabilitatedFamilies: 0,
      currentMilestone: "Form 1 Proposal under Scrutiny by CALA Hooghly",
      coordinates: { lat: 22.7600, lng: 88.3100 }
    },
    {
      id: "REQ-WB-HGY-2024-0720",
      name: "Chanditala-Singur Surface Water Treatment & Pipeline Scheme",
      agency: "Public Health Engineering (PHE), WB",
      sector: "Water Supply & Sanitation",
      state: "West Bengal",
      district: "Hooghly",
      division: "Singur (Beraberi JL 24)",
      requiredLandHa: 21.20,
      khasraCount: 26,
      stage: "Awarded",
      statusBadge: "Award (Sec 23/30)",
      budgetCr: 115.0,
      disbursedCr: 95.0,
      percentDisbursed: 83,
      gazetteDate: "10-May-2024",
      slaStatus: "DBT Disbursal Active",
      affectedFamilies: 95,
      rehabilitatedFamilies: 80,
      currentMilestone: "Award Passed. Solatium and Interest Credited to Landowners.",
      coordinates: { lat: 22.8120, lng: 88.2250 }
    },
    {
      id: "REQ-MH-PUN-2024-0112",
      name: "Pune Metro Line 3 Extension",
      agency: "PMRDA",
      sector: "Urban Transit",
      state: "Maharashtra",
      district: "Pune",
      division: "Hinjewadi - Shivaji Nagar",
      requiredLandHa: 324.80,
      khasraCount: 1180,
      stage: "Awarded",
      statusBadge: "Award (Sec 3G)",
      budgetCr: 1840.0,
      disbursedCr: 1435.2,
      percentDisbursed: 78,
      gazetteDate: "04-Sep-2024",
      slaStatus: "Disbursing DBT",
      affectedFamilies: 890,
      rehabilitatedFamilies: 780,
      currentMilestone: "PFMS Direct Benefit Transfer in progress",
      coordinates: { lat: 18.5913, lng: 73.7389 }
    },
    {
      id: "REQ-GJ-SRT-2023-0402",
      name: "Western Dedicated Freight Corridor (WDFC Pkg-2)",
      agency: "DFCCIL / Railways",
      sector: "Rail Freight Corridor",
      state: "Gujarat",
      district: "Surat & Bharuch",
      division: "Western Railway Div",
      requiredLandHa: 3120.00,
      khasraCount: 6840,
      stage: "Possession",
      statusBadge: "Possession",
      budgetCr: 5420.0,
      disbursedCr: 5104.8,
      percentDisbursed: 94,
      gazetteDate: "12-Nov-2023",
      slaStatus: "Operational Testing",
      affectedFamilies: 5200,
      rehabilitatedFamilies: 5040,
      currentMilestone: "Full Right-of-Way Vested in Railway Authority",
      coordinates: { lat: 21.1702, lng: 72.8311 }
    },
    {
      id: "REQ-UP-VAR-2024-0711",
      name: "Delhi-Varanasi High Speed Rail Corridor (Pkg-IV)",
      agency: "NHSRCL",
      sector: "High Speed Rail",
      state: "Uttar Pradesh",
      district: "Varanasi & Prayagraj",
      division: "Eastern UP Alignment",
      requiredLandHa: 2840.50,
      khasraCount: 5410,
      stage: "Scrutinized",
      statusBadge: "Scrutinized",
      budgetCr: 4680.0,
      disbursedCr: 702.0,
      percentDisbursed: 15,
      gazetteDate: "28-Oct-2024",
      slaStatus: "Public Hearing Stage",
      affectedFamilies: 4100,
      rehabilitatedFamilies: 940,
      currentMilestone: "Joint Measurement Survey Completed",
      coordinates: { lat: 25.3176, lng: 82.9739 }
    },
    {
      id: "REQ-TN-KAN-2024-0220",
      name: "Bengaluru-Chennai Expressway (Package-1)",
      agency: "NHAI",
      sector: "Greenfield Expressway",
      state: "Tamil Nadu",
      district: "Kanchipuram & Ranipet",
      division: "Southern Corridor Cell",
      requiredLandHa: 1980.00,
      khasraCount: 3920,
      stage: "Awarded",
      statusBadge: "Award (Sec 3G)",
      budgetCr: 3240.0,
      disbursedCr: 2818.8,
      percentDisbursed: 87,
      gazetteDate: "15-Aug-2024",
      slaStatus: "Disbursing DBT",
      affectedFamilies: 2750,
      rehabilitatedFamilies: 2410,
      currentMilestone: "PFMS Direct Benefit Transfer 87% Completed",
      coordinates: { lat: 12.8342, lng: 79.7036 }
    }
  ];

  // Cadastral Land Parcels (Grounded in Authentic Hooghly Mouzas)
  const INITIAL_GEOJSON_PARCELS = [
    {
      type: "Feature",
      id: "WB-HGY-DNK-01",
      geometry: {
        type: "Polygon",
        coordinates: [
          [
            [88.2910, 22.6850],
            [88.2950, 22.6830],
            [88.2960, 22.6870],
            [88.2920, 22.6880],
            [88.2910, 22.6850]
          ]
        ]
      },
      properties: {
        id: "WB-HGY-DNK-01",
        gutNumber: "Dag No. 412/1",
        khasraNo: "RS/LR-412/1",
        village: "Dankuni (JL 34)",
        taluka: "Chanditala-II",
        district: "Hooghly",
        state: "West Bengal",
        projectId: "REQ-WB-HGY-2023-0101",
        projectName: "EDFC Land Acquisition (Dankuni Freight Terminal & Rail Linkage)",
        ownerName: "Subrata Ghosh",
        ownerAadhaar: "•••• •••• 1012",
        ownerMobile: "+91 98301 45210",
        areaHa: 1.42,
        areaSqM: 14200,
        landType: "Agricultural (Sali / Bastu)",
        baseMarketRatePerSqM: 1000,
        solatiumPercent: 100,
        interestPercent: 12,
        totalCompensation: 31808000,
        status: "Possessed",
        statusLabel: "Possessed / Vested (Sec 38)",
        statusColor: "#15803d",
        dbtStatus: "Credited (PFMS UTR: #SBINWB2408912)",
        disbursedDate: "18-Oct-2024",
        rrEntitlement: "₹50,000 Subsistence Grant + Resettlement Commercial Plot",
        rrStatus: "Subsistence Grant Credited, Commercial Plot Allotted",
        overlapPercent: 100,
        possessionDate: "18-Oct-2024",
        possessionOfficer: "Smt. Sreemoyee Sen, WBCS (Exe)",
        svgCoordinates: { x: 230, y: 190, points: "160,140 280,115 295,215 180,230" }
      }
    },
    {
      type: "Feature",
      id: "WB-HGY-DNK-02",
      geometry: {
        type: "Polygon",
        coordinates: [
          [
            [88.2960, 22.6820],
            [88.3000, 22.6800],
            [88.3010, 22.6840],
            [88.2970, 22.6850],
            [88.2960, 22.6820]
          ]
        ]
      },
      properties: {
        id: "WB-HGY-DNK-02",
        gutNumber: "Dag No. 412/2",
        khasraNo: "RS/LR-412/2",
        village: "Dankuni (JL 34)",
        taluka: "Chanditala-II",
        district: "Hooghly",
        state: "West Bengal",
        projectId: "REQ-WB-HGY-2023-0101",
        projectName: "EDFC Land Acquisition (Dankuni Freight Terminal & Rail Linkage)",
        ownerName: "Anirban Mukherjee & Bros",
        ownerAadhaar: "•••• •••• 4519",
        ownerMobile: "+91 94332 89120",
        areaHa: 0.85,
        areaSqM: 8500,
        landType: "Commercial / Bastu (Dokan)",
        baseMarketRatePerSqM: 2500,
        solatiumPercent: 100,
        interestPercent: 12,
        totalCompensation: 47600000,
        status: "Scrutiny",
        statusLabel: "Under Joint Survey Scrutiny",
        statusColor: "#d97706",
        dbtStatus: "Pending CALA Scrutiny Approval",
        disbursedDate: null,
        rrEntitlement: "One-time Rehabilitation Grant ₹5,00,000",
        rrStatus: "Document Scrutiny in Progress",
        overlapPercent: 85,
        possessionDate: null,
        possessionOfficer: null,
        svgCoordinates: { x: 350, y: 155, points: "290,110 400,90 415,185 305,205" }
      }
    },
    {
      type: "Feature",
      id: "WB-HGY-JNI-03",
      geometry: {
        type: "Polygon",
        coordinates: [
          [
            [88.2480, 22.7050],
            [88.2520, 22.7030],
            [88.2540, 22.7070],
            [88.2490, 22.7080],
            [88.2480, 22.7050]
          ]
        ]
      },
      properties: {
        id: "WB-HGY-JNI-03",
        gutNumber: "Dag No. 218/4",
        khasraNo: "RS/LR-218/4",
        village: "Janai (JL 49)",
        taluka: "Chanditala-II",
        district: "Hooghly",
        state: "West Bengal",
        projectId: "REQ-WB-HGY-2023-0205",
        projectName: "GAIL RoU Natural Gas Pipeline Corridor (Jagatballavpur - Dankuni Spur)",
        ownerName: "Debashis Banerjee",
        ownerAadhaar: "•••• •••• 8820",
        ownerMobile: "+91 98310 77412",
        areaHa: 1.15,
        areaSqM: 11500,
        landType: "Agricultural (Aman Sali)",
        baseMarketRatePerSqM: 900,
        solatiumPercent: 100,
        interestPercent: 12,
        totalCompensation: 23184000,
        status: "Awarded",
        statusLabel: "Award Declared (Sec 3G)",
        statusColor: "#133e7c",
        dbtStatus: "PFMS DBT Mandate Generated (#PFMS2024HGY)",
        disbursedDate: null,
        rrEntitlement: "Agricultural Skill Training Grant + Soil Restoration",
        rrStatus: "Approved by CALA",
        overlapPercent: 100,
        possessionDate: null,
        possessionOfficer: null,
        svgCoordinates: { x: 530, y: 120, points: "450,75 580,55 600,160 470,175" }
      }
    },
    {
      type: "Feature",
      id: "WB-HGY-BGP-04",
      geometry: {
        type: "Polygon",
        coordinates: [
          [
            [88.2650, 22.7310],
            [88.2690, 22.7290],
            [88.2700, 22.7330],
            [88.2660, 22.7340],
            [88.2650, 22.7310]
          ]
        ]
      },
      properties: {
        id: "WB-HGY-BGP-04",
        gutNumber: "Dag No. 105/3",
        khasraNo: "RS/LR-105/3",
        village: "Begampur (JL 41)",
        taluka: "Chanditala-II",
        district: "Hooghly",
        state: "West Bengal",
        projectId: "REQ-WB-HGY-2024-0402",
        projectName: "SH-13 Dankuni-Champadanga 4-Lane Industrial Corridor Widening",
        ownerName: "Mousumi Das",
        ownerAadhaar: "•••• •••• 6314",
        ownerMobile: "+91 97480 33119",
        areaHa: 0.62,
        areaSqM: 6200,
        landType: "Residential (Bastu)",
        baseMarketRatePerSqM: 1500,
        solatiumPercent: 100,
        interestPercent: 12,
        totalCompensation: 20832000,
        status: "Scrutiny",
        statusLabel: "Dossier Review Pending",
        statusColor: "#d97706",
        dbtStatus: "Awaiting JMS Sign-off",
        disbursedDate: null,
        rrEntitlement: "Housing Allotment in Model Village",
        rrStatus: "Under Scrutiny",
        overlapPercent: 90,
        possessionDate: null,
        possessionOfficer: null,
        svgCoordinates: { x: 290, y: 360, points: "220,320 340,300 360,400 240,415" }
      }
    },
    {
      type: "Feature",
      id: "WB-HGY-SNG-05",
      geometry: {
        type: "Polygon",
        coordinates: [
          [
            [88.2250, 22.8120],
            [88.2290, 22.8100],
            [88.2300, 22.8150],
            [88.2260, 22.8160],
            [88.2250, 22.8120]
          ]
        ]
      },
      properties: {
        id: "WB-HGY-SNG-05",
        gutNumber: "Dag No. 520/1A",
        khasraNo: "RS/LR-520/1A",
        village: "Beraberi (Singur JL 24)",
        taluka: "Singur",
        district: "Hooghly",
        state: "West Bengal",
        projectId: "REQ-WB-HGY-2024-0720",
        projectName: "Chanditala-Singur Surface Water Treatment & Pipeline Scheme",
        ownerName: "Partha Pratim Roy",
        ownerAadhaar: "•••• •••• 9245",
        ownerMobile: "+91 98322 11980",
        areaHa: 1.95,
        areaSqM: 19500,
        landType: "Agricultural (Do-Fasli Sali)",
        baseMarketRatePerSqM: 850,
        solatiumPercent: 100,
        interestPercent: 12,
        totalCompensation: 37128000,
        status: "Awarded",
        statusLabel: "Award Passed (Sec 23/30)",
        statusColor: "#133e7c",
        dbtStatus: "Disbursed ₹37.1 Lakhs via PFMS DBT",
        disbursedDate: "15-Oct-2024",
        rrEntitlement: "Agricultural Resettlement Assistance",
        rrStatus: "Approved & Disbursed",
        overlapPercent: 100,
        possessionDate: null,
        possessionOfficer: null,
        svgCoordinates: { x: 575, y: 315, points: "490,270 630,245 660,370 520,390" }
      }
    },
    {
      type: "Feature",
      id: "WB-HWH-SLP-06",
      geometry: {
        type: "Polygon",
        coordinates: [
          [
            [88.2750, 22.6150],
            [88.2800, 22.6120],
            [88.2820, 22.6170],
            [88.2770, 22.6190],
            [88.2750, 22.6150]
          ]
        ]
      },
      properties: {
        id: "WB-HWH-SLP-06",
        gutNumber: "Dag No. 88/2",
        khasraNo: "RS/LR-88/2",
        village: "Salap (JL 12)",
        taluka: "Domjur",
        district: "Howrah",
        state: "West Bengal",
        projectId: "REQ-WB-HGY-2023-0101",
        projectName: "EDFC Land Acquisition (Dankuni Freight Terminal & Rail Linkage)",
        ownerName: "Tapas Kumar Mondal",
        ownerAadhaar: "•••• •••• 3190",
        ownerMobile: "+91 94340 78201",
        areaHa: 0.78,
        areaSqM: 7800,
        landType: "Commercial (Highway Frontage)",
        baseMarketRatePerSqM: 3200,
        solatiumPercent: 100,
        interestPercent: 12,
        totalCompensation: 55910400,
        status: "Objection",
        statusLabel: "Civil Court Stay / Sec 64 Reference",
        statusColor: "#dc2626",
        dbtStatus: "Escrow Deposited with Land Acquisition Tribunal",
        disbursedDate: null,
        rrEntitlement: "Commercial Rehabilitation Shop Allotment",
        rrStatus: "Pending Judicial Determination",
        overlapPercent: 100,
        possessionDate: null,
        possessionOfficer: null,
        svgCoordinates: { x: 440, y: 435, points: "360,390 490,370 515,480 385,495" }
      }
    }
  ];

  // Objections Registry
  const INITIAL_OBJECTIONS = [
    {
      id: "OBJ-2024-884",
      parcelId: "GUT-147",
      khasraNo: "Gut No. 147",
      claimant: "Mahendra Kulkarni",
      type: "Tree & Crop Valuation",
      filingDate: "05-Oct-2024",
      status: "Hearing Scheduled",
      hearingDate: "18-Nov-2024 (Before CALA Pune)",
      grounds: "Valuation omitted 48 mature mango trees and irrigation borewell per Horticulture Dept report.",
      actionTaken: "Independent valuer assigned by District Collector."
    },
    {
      id: "OBJ-2024-912",
      parcelId: "GUT-144-B",
      khasraNo: "Gut No. 144/B",
      claimant: "Baburao Shankarrao Gaikwad",
      type: "Cadastral Boundary Mismatch",
      filingDate: "14-Oct-2024",
      status: "Field Verification",
      hearingDate: "22-Nov-2024",
      grounds: "Adjoining Nala boundary shifted during digital GIS vectorization; 0.15 Ha discrepancy.",
      actionTaken: "JMS Re-survey ordered with DGPS instruments."
    }
  ];

  // Audit Ledger (Immutable cryptographic audit trail simulation)
  const INITIAL_AUDIT = [
    {
      timestamp: "Today, 14:32:05 IST",
      actor: "NIC Central Cloud Registry",
      role: "System Service",
      action: "PFMS DBT Reconciliation Live Sync Completed (48,320 Transactions)",
      hash: "SHA256: 7f9a20b9c3e41c88d92a017e81"
    },
    {
      timestamp: "Today, 11:14:22 IST",
      actor: "P. K. Deshmukh, IAS",
      role: "State Revenue Dept",
      action: "Attested Maharashtra Gazette Notification for REQ-MH-PLG-2024-0441",
      hash: "SHA256: 4e81d2f901ab7c541289de023f"
    },
    {
      timestamp: "Yesterday, 16:45:10 IST",
      actor: "R. K. Meena, IAS",
      role: "District CALA Pune",
      action: "Approved Section 3G Award for Gut 142/2 (Amount: ₹67.20 Lakhs)",
      hash: "SHA256: c3b19409fe7a65239a0187fd12"
    }
  ];

  class NLAMSStore {
    constructor() {
      this.projects = JSON.parse(localStorage.getItem('nlams_projects_v2')) || INITIAL_PROJECTS;
      this.parcels = JSON.parse(localStorage.getItem('nlams_parcels_v2')) || INITIAL_GEOJSON_PARCELS;
      this.objections = JSON.parse(localStorage.getItem('nlams_objections_v2')) || INITIAL_OBJECTIONS;
      this.audit = JSON.parse(localStorage.getItem('nlams_audit_v2')) || INITIAL_AUDIT;
      this.rnrFamilies = JSON.parse(localStorage.getItem('nlams_rnr_families_v2')) || [
        { id: 'FAM-001', headName: 'Sh. Ramesh Narayan Patil', members: 5, category: 'Small Farmer / Landless', plotNo: 'Plot #B-14 (Hinjewadi Model Colony)', housingGrant: '₹2,50,000 Credited (DBT)', annuity: '₹3,000/mo Active', status: 'Settled' },
        { id: 'FAM-002', headName: 'Smt. Shantabai Tukaram Shinde', members: 4, category: 'Agricultural Laborer', plotNo: 'Plot #B-15 (Hinjewadi Model Colony)', housingGrant: '₹2,50,000 Credited (DBT)', annuity: '₹3,000/mo Active', status: 'Settled' },
        { id: 'FAM-003', headName: 'Sh. Dattatraya V. Kulkarni', members: 6, category: 'Titleholder Farmer', plotNo: 'Plot #C-08 (Hinjewadi Model Colony)', housingGrant: '₹2,50,000 Credited (DBT)', annuity: '₹3,000/mo Active', status: 'Settled' },
        { id: 'FAM-004', headName: 'Sh. Suresh Baban Jadhav', members: 3, category: 'Artisan / Tenant', plotNo: 'Plot #A-22 (Hinjewadi Model Colony)', housingGrant: 'In Scrutiny', annuity: 'Pending Allotment', status: 'In-Progress' },
        { id: 'FAM-005', headName: 'Smt. Parvatibai Gaikwad', members: 4, category: 'Widowed Titleholder', plotNo: 'Plot #A-23 (Hinjewadi Model Colony)', housingGrant: 'In Scrutiny', annuity: 'Pending Allotment', status: 'In-Progress' }
      ];
      this.listeners = [];

      this.currentUser = {
        role: 'central-ministry',
        name: 'Dr. A. K. Vardhan, IAS',
        title: 'Nodal Director (Land Systems), Central Ministry / DoLR',
        jurisdiction: 'National Apex Directorate, New Delhi',
        authMethod: 'Aadhaar e-KYC',
        ownerAadhaar: '9842-5174-8921',
        badge: 'Central Ministry'
      };
    }

    save() {
      try {
        localStorage.setItem('nlams_projects_v2', JSON.stringify(this.projects));
        localStorage.setItem('nlams_parcels_v2', JSON.stringify(this.parcels));
        localStorage.setItem('nlams_objections_v2', JSON.stringify(this.objections));
        localStorage.setItem('nlams_audit_v2', JSON.stringify(this.audit));
        localStorage.setItem('nlams_rnr_families_v2', JSON.stringify(this.rnrFamilies));
      } catch (e) {
        console.warn('Storage quota or local access limitation', e);
      }
    }

    subscribe(listener) {
      this.listeners.push(listener);
      return () => {
        this.listeners = this.listeners.filter(l => l !== listener);
      };
    }

    dispatch(event, payload) {
      this.save();
      this.listeners.forEach(fn => fn(event, payload, this));
    }

    logAudit(actor, role, action) {
      const hex = Array.from({length: 24}, () => Math.floor(Math.random()*16).toString(16)).join('');
      const entry = {
        timestamp: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' }) + " IST",
        actor,
        role,
        action,
        hash: `SHA256: ${hex}`
      };
      this.audit.unshift(entry);
      if (this.audit.length > 60) this.audit.pop();
    }

    // Role Impersonation
    registerUser(userData) {
      const newUser = {
        role: userData.role || 'requiring-body',
        name: userData.name || 'Official User',
        email: userData.email || '',
        mobile: userData.mobile || '',
        dept: userData.dept || 'Department of Land Resources',
        jurisdiction: userData.jurisdiction || 'State Directorate',
        designation: userData.designation || 'Project Officer',
        badge: userData.badge || userData.role,
        isRegistered: true,
        registeredAt: new Date().toISOString()
      };
      this.currentUser = Object.assign({}, this.currentUser, newUser);
      this.logAudit(this.currentUser.name, this.currentUser.badge, `New User Registered: ${this.currentUser.name} (${this.currentUser.role})`);
      this.dispatch('USER_REGISTERED', this.currentUser);
      return this.currentUser;
    }

    updateUserProfile(profileData) {
      if (this.currentUser) {
        this.currentUser.dept = profileData.dept || this.currentUser.dept;
        this.currentUser.jurisdiction = profileData.jurisdiction || this.currentUser.jurisdiction;
        this.currentUser.designation = profileData.designation || this.currentUser.designation;
        this.currentUser.profileComplete = true;
        this.logAudit(this.currentUser.name, this.currentUser.badge, `Profile updated: ${this.currentUser.designation}, ${this.currentUser.jurisdiction}`);
        this.dispatch('PROFILE_UPDATED', this.currentUser);
      }
      return this.currentUser;
    }

    setUserRole(roleKey) {
      const rolesMap = {
        'central-ministry': {
          role: 'central-ministry',
          name: 'Dr. S. K. Verma, Joint Secretary',
          title: 'Nodal Director (Land Systems)',
          dept: 'Department of Land Resources (DoLR), MoRD, New Delhi',
          jurisdiction: 'Central Ministry (National)',
          badge: 'Central Ministry',
          ownerAadhaar: null
        },
        'state-revenue': {
          role: 'state-revenue',
          name: 'Dr. Amitava Das, IAS',
          title: 'Principal Secretary (Land & Land Reforms)',
          dept: 'Land & Land Reforms Dept, Govt of West Bengal (Nabanna)',
          jurisdiction: 'West Bengal State Directorate',
          badge: 'State Government',
          ownerAadhaar: null
        },
        'dro-cala': {
          role: 'dro-cala',
          name: 'Smt. Sreemoyee Sen, WBCS (Exe)',
          title: 'District CALA & DLLRO',
          dept: 'Hooghly District Collectorate (Chinsurah)',
          jurisdiction: 'Hooghly District CALA Clearance Desk',
          badge: 'District Authority / CALA',
          ownerAadhaar: null
        },
        'requiring-body': {
          role: 'requiring-body',
          name: 'Er. Sourav Ganguly',
          title: 'Chief Engineer (Land & Infra)',
          dept: 'Kolkata Metropolitan Development Authority (KMDA) / DFCCIL',
          jurisdiction: 'EDFC Dankuni Corridor Cell',
          badge: 'Implementing Agency',
          ownerAadhaar: null
        },
        'citizen': {
          role: 'citizen',
          name: 'Subrata Ghosh',
          title: 'Affected Landowner / Patta Holder',
          dept: 'Dag No. 412/1, Mouza Dankuni (JL 34)',
          jurisdiction: 'Chanditala-II, Hooghly District',
          badge: 'Citizen / Landowner',
          ownerAadhaar: '9876-5432-1012'
        }
      };

      if (rolesMap[roleKey]) {
        this.currentUser = Object.assign({}, this.currentUser, rolesMap[roleKey]);
        this.logAudit(this.currentUser.name, this.currentUser.badge, `Switched session context to ${this.currentUser.badge}`);
        this.dispatch('ROLE_CHANGED', this.currentUser);
      }
    }

    // Standard GeoJSON FeatureCollection Export
    getCadastralGeoJSON() {
      return {
        type: "FeatureCollection",
        crs: {
          type: "name",
          properties: { name: "urn:ogc:def:crs:EPSG::7755" }
        },
        features: this.parcels
      };
    }

    // High Level Roll-Up Computations for National Dashboard
    getNationalStats() {
      let totalLandAcquired = 0;
      let totalBudget = 0;
      let totalDisbursed = 0;
      let totalFamiliesAffected = 0;
      let totalFamiliesRehabilitated = 0;

      this.projects.forEach(p => {
        totalLandAcquired += Number(p.requiredLandHa) || 0;
        totalBudget += Number(p.budgetCr) || 0;
        totalDisbursed += Number(p.disbursedCr) || 0;
        totalFamiliesAffected += Number(p.affectedFamilies) || 0;
        totalFamiliesRehabilitated += Number(p.rehabilitatedFamilies) || 0;
      });

      const baseHa = 184920;
      const baseDisbursed = 48650;
      const baseRehab = 92410;

      return {
        totalAcquiredHa: (baseHa + totalLandAcquired * 0.05).toLocaleString('en-IN', { maximumFractionDigits: 0 }),
        targetHa: "210,000",
        targetAchievedPercent: "88.1%",
        activeProjectsCount: 1428 + this.projects.length - INITIAL_PROJECTS.length,
        linearInfraCount: 942 + Math.floor(this.projects.length / 2),
        urbanIndustrialCount: 486 + Math.ceil(this.projects.length / 2),
        compensationDisbursedCr: (baseDisbursed + (totalDisbursed * 0.02)).toLocaleString('en-IN', { maximumFractionDigits: 0 }),
        aadhaarPfmsPercent: "96.2%",
        familiesRehabilitated: (baseRehab + totalFamiliesRehabilitated * 0.05).toLocaleString('en-IN', { maximumFractionDigits: 0 }),
        familiesTarget: "104,200",
        rehabPercent: "88.7%",
        stageDistribution: {
          sec3A: 28,
          sec3D: 36,
          sec3G: 24,
          possession: 12
        }
      };
    }

    // State Roll-Up Metrics (Maharashtra)
    getStateStats(stateName = "West Bengal") {
      let totalBudget = 0;
      let totalDisbursed = 0;
      let totalHa = 0;
      let totalFamilies = 0;
      let projectCount = 0;

      this.projects.forEach(p => {
        if (p.state.toLowerCase() === stateName.toLowerCase()) {
          totalBudget += Number(p.budgetCr || 0);
          totalDisbursed += Number(p.disbursedCr || 0);
          totalHa += Number(p.requiredLandHa || 0);
          totalFamilies += Number(p.affectedFamilies || 0);
          projectCount++;
        }
      });

      // Default baseline values based on target state
      const isWB = stateName.toLowerCase().includes('bengal');
      const totalAllocatedCr = isWB ? 3850.0 : 14850.0;
      const disbursedCr = isWB ? (2845.0 + totalDisbursed * 0.1) : (11420.5 + totalDisbursed * 0.1);
      const pendingCr = Math.max(0, totalAllocatedCr - disbursedCr);
      const percentUtilized = ((disbursedCr / (totalAllocatedCr || 1)) * 100).toFixed(1);

      return {
        stateName,
        allocatedCr: totalAllocatedCr.toLocaleString('en-IN', { minimumFractionDigits: 2 }),
        disbursedCr: disbursedCr.toLocaleString('en-IN', { minimumFractionDigits: 2 }),
        pendingCr: pendingCr.toLocaleString('en-IN', { minimumFractionDigits: 2 }),
        percentUtilized,
        totalProjects: isWB ? (projectCount || 7) : (projectCount || 12),
        totalPossessedHa: (isWB ? (1842.8 + totalHa * 0.1) : (38410.6 + totalHa * 0.1)).toFixed(1),
        targetHa: isWB ? "2,450" : "44,200",
        familiesCount: isWB ? (3840 + totalFamilies) : (48320 + totalFamilies),
        avgTurnaroundMonths: isWB ? "8.2" : "9.4"
      };
    }

    // Action: Proposal Submission
    submitNewProposal(data) {
      const stateCode = data.state ? data.state.slice(0,2).toUpperCase() : 'MH';
      const distCode = (data.district || 'PUN').toUpperCase().slice(0,3);
      const newId = `REQ-${stateCode}-${distCode}-2025-${Math.floor(1000 + Math.random()*9000)}`;

      const lat = parseFloat(data.lat) || 18.5913;
      const lng = parseFloat(data.lng) || 73.7389;

      const newProject = {
        id: newId,
        name: data.projectName,
        agency: data.agency || 'NHAI',
        sector: data.sector || 'Linear Infra / Highway',
        state: data.state || 'Maharashtra',
        district: data.district || 'Pune',
        division: data.division || 'Central Sub-Division',
        requiredLandHa: parseFloat(data.requiredLandHa) || 120.5,
        khasraCount: parseInt(data.khasraCount) || 45,
        stage: 'Submitted',
        statusBadge: 'Submitted',
        budgetCr: parseFloat(data.budgetCr) || 350.0,
        disbursedCr: 0.0,
        percentDisbursed: 0,
        gazetteDate: 'Pending Scrutiny',
        slaStatus: 'Under Scrutiny Queue',
        affectedFamilies: parseInt(data.affectedFamilies) || 120,
        rehabilitatedFamilies: 0,
        currentMilestone: 'Form 1 Proposal Submitted for CALA Scrutiny',
        coordinates: { lat: lat, lng: lng },
        documents: data.documents || [
          { name: 'Form 1 Requisition Dossier (v1.0)', type: 'PDF', status: 'Verified', size: '2.4 MB' },
          { name: 'Cadastral KML Alignment Vector (v1.0)', type: 'KML', status: 'Georeferenced', size: '840 KB' },
          { name: 'SIA Scoping Terms of Reference (v1.0)', type: 'PDF', status: 'Approved', size: '1.8 MB' }
        ]
      };

      const gutNum = `Gut No. ${Math.floor(150 + Math.random()*250)}/${String.fromCharCode(65 + Math.floor(Math.random()*6))}`;
      const pId = `GUT-${Math.floor(200 + Math.random()*800)}`;
      const delta = 0.005;
      const newParcel = {
        type: "Feature",
        id: pId,
        geometry: {
          type: "Polygon",
          coordinates: [[[lng - delta, lat - delta], [lng + delta, lat - delta], [lng + delta, lat + delta], [lng - delta, lat + delta], [lng - delta, lat - delta]]]
        },
        properties: {
          id: `GUT-${Math.floor(200 + Math.random()*800)}`,
          gutNumber: gutNum,
          village: 'Hinjewadi Sector 4',
          taluka: 'Haveli',
          district: data.district || 'Pune',
          ownerName: 'M/s Greenfield Agritech & Sh. D. V. Kulkarni',
          ownerAadhaar: '•••• •••• 9102',
          areaHa: parseFloat(data.requiredLandHa) || 12.4,
          areaSqM: Math.round((parseFloat(data.requiredLandHa) || 12.4) * 10000),
          landType: 'Dry Agricultural (Jirayat)',
          marketRatePerSqM: 650,
          baseMarketValue: 8060000,
          solatiumAmount: 8060000,
          additionalInterest: 967200,
          totalCompensation: 17087200,
          dbtStatus: 'Pending Section 3G Award',
          status: 'Scrutiny',
          statusLabel: 'Pending Scrutiny',
          statusColor: '#d97706',
          overlapPercent: 100,
          projectId: newId,
          projectName: data.projectName,
          svgCoordinates: { x: 380, y: 160 }
        }
      };

      this.projects.unshift(newProject);
      this.parcels.unshift(newParcel);
      this.logAudit(this.currentUser.name, 'Implementing Agency', `Submitted Acquisition Proposal [${newId}]: ${newProject.name} (${gutNum})`);
      this.dispatch('PROPOSAL_SUBMITTED', newProject);
      return newProject;
    }

    // Action: Scrutiny Decision (Approve / Reject / Send-back)
    scrutinizeProposal(projectId, decision, remarks) {
      const proj = this.projects.find(p => p.id === projectId);
      if (!proj) return null;

      if (decision === 'APPROVE') {
        proj.stage = 'Scrutinized';
        proj.statusBadge = 'Scrutinized';
        proj.slaStatus = 'Sec 3A / Sec 11 Ready';
        proj.currentMilestone = 'Digital Scrutiny Approved. Sent to State Gazette.';
        this.parcels.forEach(p => {
          const props = p.properties || p;
          if (props.projectId === projectId || props.id === projectId) {
            props.status = 'Scrutinized';
            props.statusLabel = 'Scrutiny Passed (MahaBhumi Verified)';
            props.statusColor = '#904d00';
          }
        });
        this.logAudit(this.currentUser.name, 'CALA Authority', `Approved Proposal Scrutiny for ${proj.id}: ${remarks || 'Passed Bhulekh Validation'}`);
        this.dispatch('SCRUTINY_APPROVED', proj);
      } else if (decision === 'REJECT') {
        proj.stage = 'Rejected';
        proj.statusBadge = 'Rejected / Rework';
        proj.slaStatus = 'Returned to Agency';
        proj.currentMilestone = `Discrepancy: ${remarks || 'Rejected per Section 7 constraints'}`;
        this.logAudit(this.currentUser.name, 'CALA Authority', `Rejected Proposal ${proj.id}: ${remarks}`);
        this.dispatch('SCRUTINY_REJECTED', { project: proj, remarks });
      } else if (decision === 'SEND_BACK') {
        proj.stage = 'Rework';
        proj.statusBadge = 'Returned (Rework)';
        proj.slaStatus = 'Agency Revision Required';
        proj.currentMilestone = `Revision Requested: ${remarks || 'Update KML shapefile boundary'}`;
        this.logAudit(this.currentUser.name, 'CALA Authority', `Sent Back Proposal ${proj.id} for revision: ${remarks}`);
        this.dispatch('SCRUTINY_SEND_BACK', { project: proj, remarks });
      }
      return proj;
    }

    // Action: Statutory Notification
    issueStatutoryNotification(projectId, gazetteRef) {
      const proj = this.projects.find(p => p.id === projectId);
      if (!proj) return null;

      proj.stage = 'Notified';
      proj.statusBadge = 'Notified (Sec 3D)';
      proj.gazetteDate = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
      proj.slaStatus = 'Gazette Published';
      proj.currentMilestone = `Digitally Signed Notification: ${gazetteRef || 'GSR 742(E)'}`;

      this.parcels.forEach(p => {
        const props = p.properties || p;
        if (props.projectId === projectId) {
          props.status = 'Notified';
          props.statusLabel = 'Sec 3D Notified (Geo-Tagged)';
          props.statusColor = '#0052cc';
          props.gazetteRef = gazetteRef || 'GSR 742(E)';
        }
      });

      this.logAudit(this.currentUser.name, 'State Revenue Directorate', `Published Section 3D/Section 19 Gazette for ${proj.id} [${gazetteRef || 'GSR 742(E)'}]`);
      this.dispatch('NOTIFICATION_ISSUED', proj);
      return proj;
    }

    // Action: Award Declaration
    declareAward(projectId) {
      const proj = this.projects.find(p => p.id === projectId);
      if (!proj) return null;

      proj.stage = 'Awarded';
      proj.statusBadge = 'Award (Sec 3G)';
      proj.slaStatus = 'Award Passed / DBT Ready';
      proj.currentMilestone = 'Compensation Computed with 100% Solatium & 12% Interest';

      this.parcels.forEach(p => {
        const props = p.properties || p;
        if (props.projectId === projectId && props.status === 'Scrutiny') {
          props.status = 'Awarded';
          props.statusLabel = 'Sec 3G Award Passed';
          props.dbtStatus = 'PFMS Order Generated (Disbursing)';
        }
      });

      this.logAudit(this.currentUser.name, 'CALA Authority', `Declared Section 3G Statutory Award for project ${proj.id}`);
      this.dispatch('AWARD_DECLARED', proj);
      return proj;
    }

    // Action: Compensation Disbursal
    disburseCompensation(parcelId) {
      const parcel = this.parcels.find(p => p.id === parcelId || p.properties?.id === parcelId);
      if (!parcel) return null;

      const props = parcel.properties || parcel;
      const utr = `PFMS${Math.floor(10000000 + Math.random()*90000000)}`;
      props.dbtStatus = `Credited (PFMS UTR: #${utr})`;
      props.disbursedDate = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });

      const proj = this.projects.find(p => p.id === props.projectId);
      if (proj) {
        proj.disbursedCr = Math.min(proj.budgetCr, +(proj.disbursedCr + (props.totalCompensation / 10000000)).toFixed(1));
        proj.percentDisbursed = Math.round((proj.disbursedCr / proj.budgetCr) * 100);
      }

      this.logAudit(this.currentUser.name, 'Central PFMS Node', `Disbursed ₹${(props.totalCompensation/100000).toFixed(2)} Lakhs DBT to ${props.ownerName} [UTR: ${utr}]`);
      this.dispatch('COMPENSATION_DISBURSED', props);
      return props;
    }

    // Action: Confirm Possession
    confirmPhysicalPossession(parcelId, officerName) {
      const parcel = this.parcels.find(p => p.id === parcelId || p.properties?.id === parcelId);
      if (!parcel) return null;

      const props = parcel.properties || parcel;
      props.status = 'Possessed';
      props.statusLabel = 'Possessed / Handed Over';
      props.statusColor = '#15803d';
      props.possessionDate = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
      props.possessionOfficer = officerName || this.currentUser.name;

      const proj = this.projects.find(p => p.id === props.projectId);
      if (proj) {
        proj.stage = 'Possession';
        proj.statusBadge = 'Possession';
        proj.currentMilestone = `Field Possession Confirmed for ${props.gutNumber}`;
      }

      this.logAudit(officerName || this.currentUser.name, 'Field Survey Officer', `Confirmed physical possession for ${props.gutNumber} [Vesting under Sec 16]`);
      this.dispatch('POSSESSION_CONFIRMED', props);
      return props;
    }

    // Action: Complete Rehabilitation & Resettlement (R&R)
    completeResettlement(projectId, familiesCount, officerName) {
      const proj = this.projects.find(p => p.id === projectId) || this.projects[0];
      const count = parseInt(familiesCount) || (proj ? proj.affectedFamilies : 120);
      if (proj) {
        proj.rehabilitatedFamilies = count;
        proj.currentMilestone = `R&R Complete: ${count} Displaced Families Resettled with Housing & Grants`;
      }
      this.logAudit(
        officerName || this.currentUser.name,
        'Rehabilitation Authority',
        `Completed R&R Resettlement for [${proj ? proj.id : 'PUN-METRO'}]: ${count} Families Relocated to Model Colony with Housing & Grants`
      );
      this.dispatch('RR_COMPLETED', { project: proj, familiesCount: count });
      return proj;
    }

    // Action: File Objection
    fileObjection(data) {
      const newObj = {
        id: `OBJ-2025-${Math.floor(1000 + Math.random()*9000)}`,
        parcelId: data.parcelId || 'GUT-142-1',
        khasraNo: data.khasraNo || 'Gut No. 142/1',
        claimant: data.claimant || this.currentUser.name,
        type: data.type || 'Valuation Dispute',
        filingDate: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
        status: 'Hearing Listed',
        hearingDate: '15-Dec-2024 (Before CALA Desk)',
        grounds: data.grounds || 'Claim for additional structure and tree valuation under Section 29.',
        actionTaken: 'CALA notice issued to Requiring Body for rejoinder.'
      };

      this.objections.unshift(newObj);
      this.logAudit(this.currentUser.name, 'Citizen', `Filed Section 15 Statutory Objection [${newObj.id}] for ${newObj.khasraNo}`);
      this.dispatch('OBJECTION_FILED', newObj);
      return newObj;
    }

    // Action: Stage 8 - Project Statutory Closure & Document Archival
    closeAndArchiveProject(projectId, officerName) {
      const proj = this.projects.find(p => p.id === projectId) || this.projects[0];
      if (!proj) return null;

      proj.stage = 'Closed';
      proj.statusBadge = 'Closed (Archived)';
      proj.slaStatus = 'Statutory Lifecycle Completed';
      proj.currentMilestone = 'Project Completed & Archived under RFCTLARR Act 2013';
      proj.closureDate = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
      proj.sha256AuditHash = Array.from(crypto.getRandomValues(new Uint8Array(16)))
        .map(b => b.toString(16).padStart(2, '0')).join('') + '8f9e01ba';
      
      this.parcels.forEach(p => {
        const props = p.properties || p;
        if (props.projectId === proj.id) {
          props.status = 'Closed';
          props.statusLabel = 'Vested & Archived';
          props.statusColor = '#1e293b';
        }
      });

      this.logAudit(
        officerName || this.currentUser.name,
        'Central Competent Authority',
        `Closed and Archived Project [${proj.id}]: Cryptographic Seal #${proj.sha256AuditHash}`
      );
      this.dispatch('PROJECT_CLOSED', proj);
      return proj;
    }

    // Demo Lifecycle Step
    triggerDemoLifecycleStep() {
      const submitted = this.projects.find(p => p.stage === 'Submitted');
      if (submitted) {
        this.scrutinizeProposal(submitted.id, 'APPROVE', 'Auto-Verified against MahaBhumi GIS');
        return { message: `Digital Scrutiny passed for ${submitted.name}! Moved to Notified queue.` };
      }

      const scrutinized = this.projects.find(p => p.stage === 'Scrutinized');
      if (scrutinized) {
        this.issueStatutoryNotification(scrutinized.id, 'GSR-MH-2025-901');
        return { message: `Gazette Notification (Sec 3D) issued for ${scrutinized.name}!` };
      }

      const notified = this.projects.find(p => p.stage === 'Notified');
      if (notified) {
        this.declareAward(notified.id);
        return { message: `Statutory Award (Sec 3G) declared for ${notified.name}!` };
      }

      const scrutinyParcel = this.parcels.find(p => (p.properties || p).status === 'Scrutiny');
      if (scrutinyParcel) {
        const props = scrutinyParcel.properties || scrutinyParcel;
        props.status = 'Possessed';
        props.statusLabel = 'Possessed / Cleared';
        this.confirmPhysicalPossession(props.id, 'CALA Inspection Cell');
        return { message: `Field possession confirmed for ${props.gutNumber}!` };
      }

      return { message: 'All pipeline stages are actively in sync across the 5 dashboards.' };
    }
  }

  window.NLAMS_STORE = new NLAMSStore();

})(window);
