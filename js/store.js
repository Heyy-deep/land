/**
 * NLAMS - Central Reactive In-Memory Database & Event Bus
 * Simulating PostgreSQL + PostGIS with real-time Pub/Sub synchronization
 * Department of Land Resources (DoLR), Ministry of Rural Development, GoI
 */

(function(window) {
  'use strict';

  // Seed Projects Data (aligned with PDF & Stitch Slides)
  const INITIAL_PROJECTS = [
    {
      id: "REQ-MH-THN-2023-0892",
      name: "Samruddhi Mahamarg Phase-II Spur",
      agency: "MSRDC",
      sector: "Expressway / Linear Infra",
      state: "Maharashtra",
      district: "Thane",
      division: "Kalyan & Bhiwandi Taluka",
      requiredLandHa: 1480.25,
      khasraCount: 3420,
      stage: "Possession", // Stages: Submitted, Scrutinized, Notified, Awarded, Disbursed, R&R, Possession, Closed
      statusBadge: "Possession",
      budgetCr: 2450.0,
      disbursedCr: 2352.0,
      percentDisbursed: 96,
      gazetteDate: "18-Jan-2024",
      slaStatus: "Complete",
      affectedFamilies: 2840,
      rehabilitatedFamilies: 2710,
      currentMilestone: "Physical Handover Completed",
      coordinates: { lat: 19.2183, lng: 73.0867 }
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
      id: "REQ-MH-PLG-2024-0441",
      name: "Vadhavan Port Freight Rail-Road Link",
      agency: "JNPA / Railways",
      sector: "Ports & Railways",
      state: "Maharashtra",
      district: "Palghar",
      division: "Dahanu & Palghar Coastal",
      requiredLandHa: 2110.50,
      khasraCount: 4890,
      stage: "Notified",
      statusBadge: "Notified (Sec 3D)",
      budgetCr: 3890.0,
      disbursedCr: 1244.8,
      percentDisbursed: 32,
      gazetteDate: "12-Oct-2024",
      slaStatus: "Objections Phase (Sec 3C)",
      affectedFamilies: 3200,
      rehabilitatedFamilies: 1200,
      currentMilestone: "Hearing Objections under Section 3C",
      coordinates: { lat: 19.9833, lng: 72.7167 }
    },
    {
      id: "REQ-MH-SOL-2024-0518",
      name: "Nagpur-Goa Shaktipeeth Expressway Sec-1",
      agency: "MSRDC",
      sector: "Expressway / Green Corridor",
      state: "Maharashtra",
      district: "Solapur",
      division: "Pandharpur Alignment",
      requiredLandHa: 1820.00,
      khasraCount: 2940,
      stage: "Scrutinized",
      statusBadge: "Scrutinized",
      budgetCr: 2100.0,
      disbursedCr: 315.0,
      percentDisbursed: 15,
      gazetteDate: "02-Nov-2024",
      slaStatus: "Sec 3A Pending",
      affectedFamilies: 1980,
      rehabilitatedFamilies: 420,
      currentMilestone: "Joint Measurement Survey (JMS) Complete",
      coordinates: { lat: 17.6599, lng: 75.3218 }
    },
    {
      id: "REQ-MH-THN-2024-0988",
      name: "Bhiwandi Multi-Modal Logistic Hub",
      agency: "MIDC",
      sector: "Industrial / Warehousing",
      state: "Maharashtra",
      district: "Thane",
      division: "Bhiwandi Sub-Registry",
      requiredLandHa: 940.00,
      khasraCount: 1610,
      stage: "Submitted",
      statusBadge: "Submitted",
      budgetCr: 1120.0,
      disbursedCr: 0.0,
      percentDisbursed: 0,
      gazetteDate: "18-Aug-2024",
      slaStatus: "Delayed by 14d",
      affectedFamilies: 650,
      rehabilitatedFamilies: 0,
      currentMilestone: "Under Digital Scrutiny & SIA Scoping",
      coordinates: { lat: 19.2967, lng: 73.0631 }
    },
    {
      id: "REQ-MH-JAL-2023-0104",
      name: "Marathwada Water Grid Pipeline Pkg-4",
      agency: "WRD Maharashtra",
      sector: "Irrigation & Water Supply",
      state: "Maharashtra",
      district: "Jalna & Beed",
      division: "Ambad & Georai Belt",
      requiredLandHa: 620.40,
      khasraCount: 1450,
      stage: "Closed",
      statusBadge: "Closed / Archived",
      budgetCr: 820.0,
      disbursedCr: 820.0,
      percentDisbursed: 100,
      gazetteDate: "14-Jul-2024",
      slaStatus: "Closed",
      affectedFamilies: 1150,
      rehabilitatedFamilies: 1150,
      currentMilestone: "Project Complete - Records Archived in Vault",
      coordinates: { lat: 19.8347, lng: 75.8816 }
    },
    {
      id: "REQ-MH-RGD-2024-0309",
      name: "Virar-Alibaug Multi-Modal Corridor (Pkg-2)",
      agency: "MSRDC",
      sector: "Linear Infra / Ring Corridor",
      state: "Maharashtra",
      district: "Raigad",
      division: "Panvel & Uran Sector",
      requiredLandHa: 1240.60,
      khasraCount: 2760,
      stage: "Awarded",
      statusBadge: "Award (Sec 3G)",
      budgetCr: 2850.0,
      disbursedCr: 1824.0,
      percentDisbursed: 64,
      gazetteDate: "28-Sep-2024",
      slaStatus: "Target Dec 2024",
      affectedFamilies: 2100,
      rehabilitatedFamilies: 1450,
      currentMilestone: "PFMS DBT Disbursal in Progress",
      coordinates: { lat: 18.9894, lng: 73.1175 }
    }
  ];

  // Cadastral Land Parcels (matching District GIS Map)
  const INITIAL_PARCELS = [
    {
      id: "GUT-142-1",
      gutNumber: "Gut No. 142/1",
      khasraNo: "K-142/1",
      village: "Hinjewadi",
      taluka: "Mulshi",
      district: "Pune",
      projectId: "REQ-MH-PUN-2024-0112",
      projectName: "Pune Metro Line 3 Extension",
      ownerName: "Ramesh Narayan Patil",
      ownerAadhaar: "9842-5174-8921",
      ownerMobile: "+91 98450 12418",
      areaHa: 0.94,
      areaSqM: 9400,
      landType: "Jirayat (Agricultural Tier-1)",
      baseMarketRatePerSqM: 2500,
      solatiumPercent: 100,
      interestPercent: 12,
      totalCompensation: 4700000,
      status: "Possessed",
      statusLabel: "Possessed / Sec 3G Passed",
      statusColor: "#15803d",
      dbtStatus: "Credited (PFMS UTR: #SBIN00482910)",
      disbursedDate: "14-Oct-2024",
      rrEntitlement: "₹5,00,000 Resettlement Grant + Housing Site Allotment",
      rrStatus: "Grant Paid, Housing Under Construction",
      overlapPercent: 92,
      coordinates: { x: 180, y: 110 }
    },
    {
      id: "GUT-142-2",
      gutNumber: "Gut No. 142/2",
      khasraNo: "K-142/2",
      village: "Hinjewadi",
      taluka: "Mulshi",
      district: "Pune",
      projectId: "REQ-MH-PUN-2024-0112",
      projectName: "Pune Metro Line 3 Extension",
      ownerName: "Sunita D. Deshmukh",
      ownerAadhaar: "4512-8823-1490",
      ownerMobile: "+91 98231 44512",
      areaHa: 1.12,
      areaSqM: 11200,
      landType: "Bagayat (Irrigated Cash Crop)",
      baseMarketRatePerSqM: 3000,
      solatiumPercent: 100,
      interestPercent: 12,
      totalCompensation: 6720000,
      status: "Awarded",
      statusLabel: "Sec 3G Award Passed",
      statusColor: "#15803d",
      dbtStatus: "Disbursal Underway (PFMS Pending Treasury Release)",
      disbursedDate: "Expected 25-Nov-2024",
      rrEntitlement: "Annuity Option: ₹30,000/month for 20 years",
      rrStatus: "Enrolled in National Annuity Portal",
      overlapPercent: 78,
      coordinates: { x: 310, y: 85 }
    },
    {
      id: "GUT-143-3A",
      gutNumber: "Gut No. 143/3A",
      khasraNo: "K-143/3A",
      village: "Hinjewadi",
      taluka: "Mulshi",
      district: "Pune",
      projectId: "REQ-MH-PUN-2024-0112",
      projectName: "Pune Metro Line 3 Extension",
      ownerName: "Anant Govind Joshi & 2 Others",
      ownerAadhaar: "7741-9231-6450",
      ownerMobile: "+91 94220 89134",
      areaHa: 1.42,
      areaSqM: 14200,
      landType: "Jirayat (Agricultural Tier-1)",
      baseMarketRatePerSqM: 2800,
      solatiumPercent: 100,
      interestPercent: 12,
      totalCompensation: 8420000,
      status: "Scrutiny",
      statusLabel: "Pending Scrutiny / Joint Measurement Survey (JMS)",
      statusColor: "#d97706",
      dbtStatus: "Awaiting Section 3G Award Declaration",
      disbursedDate: "Pending CALA Order",
      rrEntitlement: "Eligible for Alternative Commercial Plot (150 m²)",
      rrStatus: "Verification in Progress",
      overlapPercent: 84.2,
      coordinates: { x: 295, y: 230 }
    },
    {
      id: "GUT-144-B",
      gutNumber: "Gut No. 144/B",
      khasraNo: "K-144/B",
      village: "Hinjewadi",
      taluka: "Mulshi",
      district: "Pune",
      projectId: "REQ-MH-PUN-2024-0112",
      projectName: "Pune Metro Line 3 Extension",
      ownerName: "Baburao Shankarrao Gaikwad",
      ownerAadhaar: "6120-4491-3012",
      ownerMobile: "+91 99701 55678",
      areaHa: 0.85,
      areaSqM: 8500,
      landType: "Non-Agricultural (Commercial Permit)",
      baseMarketRatePerSqM: 4200,
      solatiumPercent: 100,
      interestPercent: 12,
      totalCompensation: 7140000,
      status: "Scrutiny",
      statusLabel: "Mutation Error in Bhulekh RoR",
      statusColor: "#d97706",
      dbtStatus: "On Hold (Bhulekh Mutation Mismatch)",
      disbursedDate: "Pending Revenue Hearing",
      rrEntitlement: "Commercial Shop Allotment in Transit Hub",
      rrStatus: "Claim Filed",
      overlapPercent: 65,
      coordinates: { x: 460, y: 160 }
    },
    {
      id: "GUT-145",
      gutNumber: "Gut No. 145",
      khasraNo: "K-145",
      village: "Hinjewadi",
      taluka: "Mulshi",
      district: "Pune",
      projectId: "REQ-MH-PUN-2024-0112",
      projectName: "Pune Metro Line 3 Extension",
      ownerName: "Vikas Pandurang Shinde",
      ownerAadhaar: "3184-9021-4756",
      ownerMobile: "+91 98812 33412",
      areaHa: 1.30,
      areaSqM: 13000,
      landType: "Jirayat (Agricultural)",
      baseMarketRatePerSqM: 2600,
      solatiumPercent: 100,
      interestPercent: 12,
      totalCompensation: 6760000,
      status: "Possessed",
      statusLabel: "Possessed / Cleared",
      statusColor: "#15803d",
      dbtStatus: "Credited (PFMS UTR: #HDFC00291845)",
      disbursedDate: "02-Aug-2024",
      rrEntitlement: "₹6,50,000 One-time Livelihood Grant",
      rrStatus: "Disbursed in Full",
      overlapPercent: 95,
      coordinates: { x: 140, y: 340 }
    },
    {
      id: "GUT-147",
      gutNumber: "Gut No. 147",
      khasraNo: "K-147",
      village: "Hinjewadi",
      taluka: "Mulshi",
      district: "Pune",
      projectId: "REQ-MH-PUN-2024-0112",
      projectName: "Pune Metro Line 3 Extension",
      ownerName: "Mahendra Kulkarni & Legal Heirs",
      ownerAadhaar: "5512-3891-2094",
      ownerMobile: "+91 97654 22109",
      areaHa: 1.75,
      areaSqM: 17500,
      landType: "Jirayat with Orchard (Mango & Coconut)",
      baseMarketRatePerSqM: 3200,
      solatiumPercent: 100,
      interestPercent: 12,
      totalCompensation: 11200000,
      status: "Objection",
      statusLabel: "Civil Stay / Tree Valuation Dispute (Sec 15)",
      statusColor: "#dc2626",
      dbtStatus: "Escrow Deposited (Pending Tribunal Order)",
      disbursedDate: "In Escrow Account",
      rrEntitlement: "Dispute under Land Acquisition Tribunal",
      rrStatus: "Hearing Listed for 18-Nov-2024",
      overlapPercent: 88,
      coordinates: { x: 550, y: 310 }
    }
  ];

  // Objections & Grievance Registry (RFCTLARR Sec 15)
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
      actor: "NIC MeghRaj Node DEL-04",
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

  // Store Class definition
  class NLAMSStore {
    constructor() {
      this.projects = JSON.parse(localStorage.getItem('nlams_projects')) || INITIAL_PROJECTS;
      this.parcels = JSON.parse(localStorage.getItem('nlams_parcels')) || INITIAL_PARCELS;
      this.objections = JSON.parse(localStorage.getItem('nlams_objections')) || INITIAL_OBJECTIONS;
      this.audit = JSON.parse(localStorage.getItem('nlams_audit')) || INITIAL_AUDIT;
      this.listeners = [];
      this.currentUser = {
        role: 'central-ministry', // default starting role
        name: 'Dr. A. K. Vardhan, IAS',
        title: 'Nodal Director (Land Systems), Central Ministry / DoLR',
        jurisdiction: 'National Apex Directorate, New Delhi',
        authMethod: 'Aadhaar e-KYC',
        uid: '•••• •••• 8921'
      };
    }

    save() {
      try {
        localStorage.setItem('nlams_projects', JSON.stringify(this.projects));
        localStorage.setItem('nlams_parcels', JSON.stringify(this.parcels));
        localStorage.setItem('nlams_objections', JSON.stringify(this.objections));
        localStorage.setItem('nlams_audit', JSON.stringify(this.audit));
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
      if (this.audit.length > 50) this.audit.pop();
    }

    // Role Impersonation / Switching
    setUserRole(roleKey) {
      const rolesMap = {
        'central-ministry': {
          role: 'central-ministry',
          name: 'Dr. A. K. Vardhan, IAS',
          title: 'Nodal Director (Land Systems)',
          dept: 'Department of Land Resources (DoLR), MoRD',
          jurisdiction: 'Central Ministry (National)',
          badge: 'Central Ministry'
        },
        'state-revenue': {
          role: 'state-revenue',
          name: 'P. K. Deshmukh, IAS',
          title: 'Principal Secretary (Revenue & Forest)',
          dept: 'Revenue & Land Reforms Department, Govt of Maharashtra',
          jurisdiction: 'Maharashtra State Directorate',
          badge: 'State Government'
        },
        'dro-cala': {
          role: 'dro-cala',
          name: 'R. K. Meena, IAS',
          title: 'Collector & CALA Authority',
          dept: 'Pune District Administration',
          jurisdiction: 'Pune District Collectorate',
          badge: 'District Authority / CALA'
        },
        'requiring-body': {
          role: 'requiring-body',
          name: 'Col. Rajesh Verma',
          title: 'Chief General Manager (Land Acquisition)',
          dept: 'National Highways Authority of India (NHAI) / MSRDC',
          jurisdiction: 'Western Corridor Infra Cell',
          badge: 'Implementing Agency'
        },
        'citizen': {
          role: 'citizen',
          name: 'Ramesh Narayan Patil',
          title: 'Affected Landowner / Patta Holder',
          dept: 'Khasra Gut 142/1, Hinjewadi Village',
          jurisdiction: 'Mulshi Taluka, Pune District',
          badge: 'Citizen / Landowner'
        }
      };

      if (rolesMap[roleKey]) {
        this.currentUser = Object.assign({}, this.currentUser, rolesMap[roleKey]);
        this.logAudit(this.currentUser.name, this.currentUser.badge, `Switched session context to ${this.currentUser.badge}`);
        this.dispatch('ROLE_CHANGED', this.currentUser);
      }
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

      // Fixed baseline + calculated dynamic totals
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
    getStateStats() {
      let totalBudget = 0;
      let totalDisbursed = 0;
      let totalHa = 0;
      let totalFamilies = 0;

      this.projects.forEach(p => {
        if (p.state === "Maharashtra") {
          totalBudget += Number(p.budgetCr);
          totalDisbursed += Number(p.disbursedCr);
          totalHa += Number(p.requiredLandHa);
          totalFamilies += Number(p.affectedFamilies);
        }
      });

      const totalAllocatedCr = 14850.0;
      const disbursedCr = 11420.5 + (totalDisbursed - 8986.0) * 0.1;
      const pendingCr = totalAllocatedCr - disbursedCr;
      const percentUtilized = ((disbursedCr / totalAllocatedCr) * 100).toFixed(1);

      return {
        allocatedCr: totalAllocatedCr.toLocaleString('en-IN', { minimumFractionDigits: 2 }),
        disbursedCr: disbursedCr.toLocaleString('en-IN', { minimumFractionDigits: 2 }),
        pendingCr: pendingCr.toLocaleString('en-IN', { minimumFractionDigits: 2 }),
        percentUtilized,
        totalProjects: 214 + (this.projects.length - INITIAL_PROJECTS.length),
        totalPossessedHa: (38410.6 + totalHa * 0.1).toFixed(1),
        targetHa: "44,200",
        familiesCount: 48320 + totalFamilies,
        avgTurnaroundMonths: "9.4"
      };
    }

    // Pipeline Action 1: Proposal Submission (Implementing Agency)
    submitNewProposal(data) {
      const newId = `REQ-MH-${(data.district || 'PUN').toUpperCase().slice(0,3)}-2025-${Math.floor(1000 + Math.random()*9000)}`;
      const newProject = {
        id: newId,
        name: data.projectName,
        agency: data.agency || 'NHAI',
        sector: data.sector || 'Linear Infra / Highway',
        state: 'Maharashtra',
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
        coordinates: { lat: 18.5204, lng: 73.8567 }
      };

      this.projects.unshift(newProject);
      this.logAudit(this.currentUser.name, 'Implementing Agency', `Submitted Acquisition Proposal [${newId}]: ${newProject.name}`);
      this.dispatch('PROPOSAL_SUBMITTED', newProject);
      return newProject;
    }

    // Pipeline Action 2: Digital Scrutiny (District CALA)
    scrutinizeProposal(projectId, decision, remarks) {
      const proj = this.projects.find(p => p.id === projectId);
      if (!proj) return null;

      if (decision === 'APPROVE') {
        proj.stage = 'Scrutinized';
        proj.statusBadge = 'Scrutinized';
        proj.slaStatus = 'Sec 3A / Sec 11 Ready';
        proj.currentMilestone = 'Digital Scrutiny Approved. Sent to State Gazette.';
        this.logAudit(this.currentUser.name, 'CALA Authority', `Approved Proposal Scrutiny for ${proj.id}: ${remarks || 'Passed Bhulekh Validation'}`);
        this.dispatch('SCRUTINY_APPROVED', proj);
      } else if (decision === 'REJECT') {
        proj.stage = 'Rejected';
        proj.statusBadge = 'Rejected / Rework';
        proj.slaStatus = 'Returned to Agency';
        proj.currentMilestone = `Discrepancy: ${remarks}`;
        this.logAudit(this.currentUser.name, 'CALA Authority', `Returned Proposal ${proj.id} for revision: ${remarks}`);
        this.dispatch('SCRUTINY_REJECTED', proj);
      }
      return proj;
    }

    // Pipeline Action 3: Statutory Gazette Notification (State Govt)
    issueStatutoryNotification(projectId, gazetteRef) {
      const proj = this.projects.find(p => p.id === projectId);
      if (!proj) return null;

      proj.stage = 'Notified';
      proj.statusBadge = 'Notified (Sec 3D)';
      proj.gazetteDate = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
      proj.slaStatus = 'Gazette Published';
      proj.currentMilestone = `Digitally Signed Notification: ${gazetteRef || 'GSR 742(E)'}`;
      
      this.logAudit(this.currentUser.name, 'State Revenue Directorate', `Published Section 3D/Section 19 Gazette for ${proj.id} [${gazetteRef || 'GSR 742(E)'}]`);
      this.dispatch('NOTIFICATION_ISSUED', proj);
      return proj;
    }

    // Pipeline Action 4: Award Declaration (CALA Authority)
    declareAward(projectId) {
      const proj = this.projects.find(p => p.id === projectId);
      if (!proj) return null;

      proj.stage = 'Awarded';
      proj.statusBadge = 'Award (Sec 3G)';
      proj.slaStatus = 'Award Passed / DBT Ready';
      proj.currentMilestone = 'Compensation Computed with 100% Solatium & 12% Interest';

      // Update associated parcels in this project
      this.parcels.forEach(parcel => {
        if (parcel.projectId === projectId && parcel.status === 'Scrutiny') {
          parcel.status = 'Awarded';
          parcel.statusLabel = 'Sec 3G Award Passed';
          parcel.dbtStatus = 'PFMS Order Generated (Disbursing)';
        }
      });

      this.logAudit(this.currentUser.name, 'CALA Authority', `Declared Section 3G Statutory Award for project ${proj.id}`);
      this.dispatch('AWARD_DECLARED', proj);
      return proj;
    }

    // Pipeline Action 5: PFMS Compensation Disbursement
    disburseCompensation(parcelId) {
      const parcel = this.parcels.find(p => p.id === parcelId);
      if (!parcel) return null;

      const utr = `PFMS${Math.floor(10000000 + Math.random()*90000000)}`;
      parcel.dbtStatus = `Credited (PFMS UTR: #${utr})`;
      parcel.disbursedDate = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
      
      // Update parent project
      const proj = this.projects.find(p => p.id === parcel.projectId);
      if (proj) {
        proj.disbursedCr = Math.min(proj.budgetCr, +(proj.disbursedCr + (parcel.totalCompensation / 10000000)).toFixed(1));
        proj.percentDisbursed = Math.round((proj.disbursedCr / proj.budgetCr) * 100);
      }

      this.logAudit(this.currentUser.name, 'Central PFMS Node', `Disbursed ₹${(parcel.totalCompensation/100000).toFixed(2)} Lakhs DBT to ${parcel.ownerName} [UTR: ${utr}]`);
      this.dispatch('COMPENSATION_DISBURSED', parcel);
      return parcel;
    }

    // Pipeline Action 6 & 7: Physical Possession (Field Officer)
    confirmPhysicalPossession(parcelId, officerName) {
      const parcel = this.parcels.find(p => p.id === parcelId);
      if (!parcel) return null;

      parcel.status = 'Possessed';
      parcel.statusLabel = 'Possessed / Handed Over';
      parcel.statusColor = '#15803d';
      
      const proj = this.projects.find(p => p.id === parcel.projectId);
      if (proj) {
        proj.stage = 'Possession';
        proj.statusBadge = 'Possession';
        proj.currentMilestone = `Field Possession Confirmed for ${parcel.gutNumber}`;
      }

      this.logAudit(officerName || this.currentUser.name, 'Field Survey Officer', `Confirmed physical possession for ${parcel.gutNumber} [Vesting under Sec 16]`);
      this.dispatch('POSSESSION_CONFIRMED', parcel);
      return parcel;
    }

    // Pipeline Action: File Objection (Citizen)
    fileObjection(data) {
      const newObj = {
        id: `OBJ-2025-${Math.floor(1000 + Math.random()*9000)}`,
        parcelId: data.parcelId || 'GUT-143-3A',
        khasraNo: data.khasraNo || 'Gut No. 143/3A',
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

    // Interactive Demo Shortcut: Run One Full Statutory Cycle
    triggerDemoLifecycleStep() {
      // Find a project that can advance
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

      // If all projects advanced, trigger a parcel possession
      const scrutinyParcel = this.parcels.find(p => p.status === 'Scrutiny');
      if (scrutinyParcel) {
        scrutinyParcel.status = 'Possessed';
        scrutinyParcel.statusLabel = 'Possessed / Cleared';
        this.confirmPhysicalPossession(scrutinyParcel.id, 'CALA Inspection Cell');
        return { message: `Field possession confirmed for ${scrutinyParcel.gutNumber}!` };
      }

      return { message: 'All pipeline stages are actively in sync across the 5 dashboards.' };
    }
  }

  // Export singleton to global scope
  window.NLAMS_STORE = new NLAMSStore();

})(window);
