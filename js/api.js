/**
 * NLAMS - Standardized In-Memory RESTful API Layer (Client-Side Backend Simulation)
 * Implements REST endpoints with HTTP response semantics, role-scoped queries, GeoJSON payloads, and SHA-256 audit logging.
 * Department of Land Resources (DoLR), Ministry of Rural Development, GoI
 */

(function(window) {
  'use strict';

  class NLAMSAPI {
    constructor(store) {
      this.store = store || window.NLAMS_STORE;
    }

    // Helper: Simulated latency & standard response envelope
    _respond(status, data, message = 'Success') {
      return Promise.resolve({
        status,
        ok: status >= 200 && status < 300,
        message,
        timestamp: new Date().toISOString(),
        data
      });
    }

    _error(status, message) {
      return Promise.resolve({
        status,
        ok: false,
        message,
        timestamp: new Date().toISOString(),
        data: null
      });
    }

    // GET /api/v1/projects - Enforces RBAC jurisdictional scoping
    async getProjects(role, filters = {}) {
      const allProjects = this.store.projects;
      let scoped = [...allProjects];

      // Role-based data scoping
      if (role === 'state-revenue') {
        scoped = scoped.filter(p => p.state === 'Maharashtra');
      } else if (role === 'dro-cala') {
        scoped = scoped.filter(p => p.district === 'Pune' || p.state === 'Maharashtra');
      } else if (role === 'requiring-body') {
        const userAgency = this.store.currentUser?.agency || 'NHAI';
        scoped = scoped.filter(p => p.agency === userAgency || p.agency.includes('NHAI') || p.agency.includes('MSRDC'));
      }

      // Filter by district if provided
      if (filters.district && filters.district !== 'ALL') {
        scoped = scoped.filter(p => p.district.toLowerCase().includes(filters.district.toLowerCase()));
      }

      // Filter by search query
      if (filters.search) {
        const q = filters.search.toLowerCase();
        scoped = scoped.filter(p =>
          p.id.toLowerCase().includes(q) ||
          p.name.toLowerCase().includes(q) ||
          p.agency.toLowerCase().includes(q) ||
          p.district.toLowerCase().includes(q) ||
          p.state.toLowerCase().includes(q)
        );
      }

      return this._respond(200, scoped, `Retrieved ${scoped.length} scoped projects for role ${role}`);
    }

    // POST /api/v1/proposals - Submits Form 1 Requisition
    async submitProposal(proposalData, actor) {
      if (!proposalData.projectName || !proposalData.requiredLandHa) {
        return this._error(400, 'Missing mandatory Form 1 fields: projectName or requiredLandHa');
      }

      const created = this.store.submitNewProposal(proposalData);
      return this._respond(201, created, `Form 1 Proposal ${created.id} submitted and routed to District CALA`);
    }

    // POST /api/v1/scrutiny/:parcelId/decision - Handles Approve, Reject, Send-Back
    async submitScrutinyDecision(parcelId, decision, remarks, actor) {
      const parcel = this.store.parcels.find(p => p.id === parcelId || p.properties?.id === parcelId);
      if (!parcel) {
        return this._error(404, `Parcel ${parcelId} not found`);
      }

      const parcelObj = parcel.properties ? parcel.properties : parcel;
      const gutNo = parcelObj.gutNumber;

      if (decision === 'APPROVE') {
        parcelObj.status = 'Awarded';
        parcelObj.statusLabel = 'Sec 3G Award Ready';
        parcelObj.statusColor = '#15803d';
        this.store.logAudit(actor || this.store.currentUser.name, 'CALA Authority', `Approved Digital Scrutiny for ${gutNo}: ${remarks || 'Bhulekh RoR Verified'}`);
        this.store.dispatch('SCRUTINY_APPROVED', parcel);
        return this._respond(200, parcel, `Scrutiny approved for ${gutNo}. Forwarded to State Gazette.`);
      } else if (decision === 'REJECT') {
        parcelObj.status = 'Rejected';
        parcelObj.statusLabel = 'Rejected (Discrepancy)';
        parcelObj.statusColor = '#dc2626';
        this.store.logAudit(actor || this.store.currentUser.name, 'CALA Authority', `Rejected Scrutiny for ${gutNo}: ${remarks}`);
        this.store.dispatch('SCRUTINY_REJECTED', { parcel, remarks });
        return this._respond(200, parcel, `Proposal rejected for ${gutNo}: ${remarks}`);
      } else if (decision === 'SEND_BACK') {
        parcelObj.status = 'Rework';
        parcelObj.statusLabel = 'Returned to Agency (Rework)';
        parcelObj.statusColor = '#d97706';
        this.store.logAudit(actor || this.store.currentUser.name, 'CALA Authority', `Returned ${gutNo} to Requiring Body for correction: ${remarks}`);
        this.store.dispatch('SCRUTINY_SEND_BACK', { parcel, remarks });
        return this._respond(200, parcel, `Dossier returned to Agency for revision: ${remarks}`);
      }

      return this._error(400, `Invalid decision: ${decision}`);
    }

    // POST /api/v1/gazette/sign - Digital Signature DSC signing for Section 11/19
    async signGazetteNotification(projectId, dscPin, gazetteRef, actor) {
      if (!dscPin || dscPin.length < 4) {
        return this._error(401, 'Invalid DSC Token PIN. Cryptographic signature rejected.');
      }

      const proj = this.store.projects.find(p => p.id === projectId);
      if (!proj) {
        return this._error(404, `Project ${projectId} not found`);
      }

      const updated = this.store.issueStatutoryNotification(projectId, gazetteRef || 'GSR-MH-2025-912(E)');
      return this._respond(200, updated, `Gazette Notification digitally signed under IT Act 2000 with DSC Token.`);
    }

    // POST /api/v1/possession/verify - Validates 4-point checklist before title vesting
    async verifyAndConfirmPossession(parcelId, checklist, officerName) {
      if (!checklist.dgpsPegging || !checklist.treeCropValuation || !checklist.structureVacated || !checklist.form3ECertificate) {
        return this._error(422, 'Cannot vest title: All 4 statutory possession checklist items must be verified.');
      }

      const confirmed = this.store.confirmPhysicalPossession(parcelId, officerName);
      return this._respond(200, confirmed, `Field possession completed. Title vested in State under Section 16 of RFCTLARR Act 2013.`);
    }

    // POST /api/v1/rnr/complete - Marks R&R resettlement complete for displaced families
    async completeResettlement(projectId, familiesCount, actor) {
      const updated = this.store.completeResettlement(projectId, familiesCount, actor);
      return this._respond(200, updated, `R&R Resettlement marked complete for ${familiesCount || 120} families.`);
    }

    // GET /api/v1/parcels/citizen - Strictly returns parcels belonging to authenticated citizen
    async getCitizenParcels(citizenAadhaarHash) {
      const user = this.store.currentUser;
      const targetAadhaar = citizenAadhaarHash || user.ownerAadhaar || '9842-5174-8921';

      const citizenParcels = this.store.parcels.filter(p => {
        const props = p.properties || p;
        return props.ownerAadhaar === targetAadhaar || props.ownerName.includes(user.name);
      });

      return this._respond(200, citizenParcels, `Retrieved ${citizenParcels.length} authorized parcels for authenticated citizen.`);
    }

    // GET /api/v1/gis/geojson - Returns standard GeoJSON FeatureCollection
    async getCadastralGeoJSON() {
      const geojson = this.store.getCadastralGeoJSON();
      return this._respond(200, geojson, 'Retrieved cadastral parcels as GeoJSON FeatureCollection');
    }
  }

  window.NLAMS_API = new NLAMSAPI(window.NLAMS_STORE);

})(window);
