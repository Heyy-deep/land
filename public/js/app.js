  // ========================================================
  // IN-APP SIGN OUT & STATUTORY PROMPT CONTROLLERS
  // ========================================================
  function promptSignOutModal() {
    const modal = document.getElementById('modal-signout-confirm');
    const u = (window.NLAMS_STORE && window.NLAMS_STORE.currentUser) || {};
    const name = u.name || 'Official User';
    const role = u.badge || u.title || 'Authenticated User';

    if (!modal) {
      handleLogout();
      return;
    }

    const nameEl = document.getElementById('signout-modal-user-name');
    const roleEl = document.getElementById('signout-modal-user-role');
    const confirmNameEl = document.getElementById('signout-modal-confirm-name');
    const initsEl = document.getElementById('signout-avatar-initials');

    if (nameEl) nameEl.textContent = name;
    if (roleEl) roleEl.textContent = role;
    if (confirmNameEl) confirmNameEl.textContent = `${name} (${role})`;
    if (initsEl) {
      const clean = name.replace(/Dr\.|Er\.|Smt\.|Sh\.|Shri|IAS|WBCS|\(Exe\)|,/g, '').trim().split(/\s+/).filter(Boolean);
      initsEl.textContent = clean.length > 1 ? (clean[0][0] + clean[clean.length - 1][0]).toUpperCase() : (clean[0] ? clean[0].slice(0, 2).toUpperCase() : 'NL');
    }

    modal.classList.remove('hidden');
  }

  function closeSignOutModal() {
    const modal = document.getElementById('modal-signout-confirm');
    if (modal) modal.classList.add('hidden');
  }

  function showInAppPrompt(title, subtitle, message, defaultValue = '') {
    return new Promise((resolve) => {
      const modal = document.getElementById('modal-inapp-prompt');
      if (!modal) {
        resolve(defaultValue);
        return;
      }
      const titleEl = document.getElementById('inapp-prompt-title');
      const subEl = document.getElementById('inapp-prompt-subtitle');
      const msgEl = document.getElementById('inapp-prompt-message');
      const inputEl = document.getElementById('inapp-prompt-input');
      const btnConfirm = document.getElementById('btn-confirm-inapp-prompt');
      const btnCancel = document.getElementById('btn-cancel-inapp-prompt');
      const btnClose = document.getElementById('btn-close-inapp-prompt');

      if (titleEl) titleEl.textContent = title;
      if (subEl) subEl.textContent = subtitle || 'Statutory Workflow';
      if (msgEl) msgEl.textContent = message;
      if (inputEl) inputEl.value = defaultValue;

      modal.classList.remove('hidden');
      if (window.i18n && typeof window.i18n.applyTranslations === 'function') {
        window.i18n.applyTranslations(modal);
      }
      if (inputEl) inputEl.focus();

      function onConfirm() {
        cleanup();
        resolve(inputEl ? inputEl.value.trim() : defaultValue);
      }

      function onCancel() {
        cleanup();
        resolve(null);
      }

      function cleanup() {
        if (btnConfirm) btnConfirm.removeEventListener('click', onConfirm);
        if (btnCancel) btnCancel.removeEventListener('click', onCancel);
        if (btnClose) btnClose.removeEventListener('click', onCancel);
        modal.classList.add('hidden');
      }

      if (btnConfirm) btnConfirm.addEventListener('click', onConfirm, { once: true });
      if (btnCancel) btnCancel.addEventListener('click', onCancel, { once: true });
      if (btnClose) btnClose.addEventListener('click', onCancel, { once: true });
    });
  }

  window.promptSignOutModal = promptSignOutModal;
  window.closeSignOutModal = closeSignOutModal;
  window.showInAppPrompt = showInAppPrompt;

  // ========================================================
  // MY PROFILE & STATUTORY IDENTITY DOSSIER CONTROLLER
  // ========================================================
  function openMyProfileModal() {
    const modal = document.getElementById('modal-my-profile');
    if (!modal) return;
    const currentStore = window.NLAMS_STORE || (typeof store !== "undefined" ? store : {});
    const u = currentStore.currentUser || {};

    // 1. Initials calculation
    const initialsEl = document.getElementById('profile-avatar-initials');
    if (initialsEl) {
      const cleanName = (u.name || 'User')
        .replace(/Dr\.|Er\.|Smt\.|Sh\.|Shri|IAS|WBCS|\(Exe\)|,/g, '')
        .trim();
      const parts = cleanName.split(/\s+/).filter(Boolean);
      const inits = parts.length > 1
        ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
        : (parts[0] ? parts[0].slice(0, 2).toUpperCase() : 'NL');
      initialsEl.textContent = inits;
    }

    // 2. Identity Header
    const nameEl = document.getElementById('profile-full-name');
    if (nameEl) nameEl.textContent = u.name || 'Official User';

    const roleEl = document.getElementById('profile-role-badge');
    if (roleEl) roleEl.textContent = u.badge || u.title || 'Official Role';

    const jurEl = document.getElementById('profile-jurisdiction-badge');
    if (jurEl) jurEl.textContent = u.jurisdiction || 'Statutory Jurisdiction';

    const authPill = document.getElementById('profile-auth-status-pill');
    if (authPill) {
      if (u.authType === 'Aadhaar e-KYC' || u.ownerAadhaar) {
        authPill.innerHTML = '<span class="material-symbols-outlined text-[14px]">fingerprint</span> Aadhaar e-KYC Verified';
        authPill.className = 'px-spacing-sm py-1 rounded bg-secondary-container text-on-secondary font-legal-code text-xs font-bold uppercase flex items-center gap-1';
      } else {
        authPill.innerHTML = '<span class="material-symbols-outlined text-[14px]">verified</span> ' + (u.authStatus || 'DSC Level-3 Attested');
        authPill.className = 'px-spacing-sm py-1 rounded bg-tertiary-container text-on-tertiary font-legal-code text-xs font-bold uppercase flex items-center gap-1';
      }
    }

    // 3. Core Identity (Locked Fields)
    const fName = document.getElementById('profile-field-name');
    if (fName) fName.textContent = u.name || '—';

    const fDesig = document.getElementById('profile-field-designation');
    if (fDesig) fDesig.textContent = u.designationOfficial || u.title || u.badge || '—';

    // 4. Contact Details (Editable)
    const mDisplay = document.getElementById('profile-mobile-display');
    const mInput = document.getElementById('profile-mobile-input');
    const mBox = document.getElementById('profile-mobile-edit-box');
    if (mDisplay) mDisplay.textContent = u.maskedMobile || u.mobile || u.ownerMobile || '+91 ••••• •••••';
    if (mInput) mInput.value = u.mobile || u.ownerMobile || '+91 98301 45210';
    if (mBox) mBox.classList.add('hidden');

    const eDisplay = document.getElementById('profile-email-display');
    const eInput = document.getElementById('profile-email-input');
    const eBox = document.getElementById('profile-email-edit-box');
    if (eDisplay) eDisplay.textContent = u.email || 'not.registered@gov.in';
    if (eInput) eInput.value = u.email || 'official@gov.in';
    if (eBox) eBox.classList.add('hidden');

    // 5. Role-Specific Statutory Portfolio Block
    const roleContainer = document.getElementById('profile-role-specific-container');
    if (roleContainer) {
      let roleHtml = '';
      const role = u.role || 'central-ministry';

      if (role === 'central-ministry') {
        roleHtml = `
          <h4 class="font-label-md text-label-md text-primary font-bold flex items-center gap-1">
            <span class="material-symbols-outlined text-[18px]">account_balance</span>
            Central Ministry & Apex Statutory Portfolio
          </h4>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-spacing-sm">
            <div class="p-spacing-sm bg-surface-container-lowest rounded-lg border border-outline-variant/30 space-y-1">
              <div class="flex items-center justify-between text-xs text-on-surface-variant">
                <span class="font-semibold">Nodal Ministry:</span>
                <span class="material-symbols-outlined text-[14px] text-tertiary" title="Identity-locked under GoI Allocation of Business Rules">lock</span>
              </div>
              <div class="font-body-md text-body-md font-bold text-on-surface">${u.ministry || 'Ministry of Rural Development (MoRD)'}</div>
              <span class="text-[10px] text-outline-variant block">Government of India, New Delhi</span>
            </div>
            <div class="p-spacing-sm bg-surface-container-lowest rounded-lg border border-outline-variant/30 space-y-1">
              <div class="flex items-center justify-between text-xs text-on-surface-variant">
                <span class="font-semibold">Nodal Department:</span>
                <span class="material-symbols-outlined text-[14px] text-tertiary" title="Identity-locked under DoLR allocation">lock</span>
              </div>
              <div class="font-body-md text-body-md font-bold text-on-surface">${u.department || 'Department of Land Resources (DoLR)'}</div>
              <span class="text-[10px] text-outline-variant block">Apex Regulatory & Cadastral Directorate</span>
            </div>
            <div class="p-spacing-sm bg-surface-container-lowest rounded-lg border border-outline-variant/30 space-y-1 sm:col-span-2">
              <div class="flex items-center justify-between text-xs text-on-surface-variant">
                <span class="font-semibold">Statutory Oversight & Gazette Sanctum:</span>
                <span class="material-symbols-outlined text-[14px] text-tertiary" title="Identity-locked statutory role">lock</span>
              </div>
              <div class="font-body-md text-body-md font-semibold text-on-surface">National Land Acquisition Roll-up, Gazette Section 3A/3D/3E Sanctum, PFMS Treasury Gateway</div>
              <span class="text-[10px] text-outline-variant block">DoLR National Nodal Jurisdiction across 28 States & 8 UTs</span>
            </div>
          </div>
        `;
      } else if (role === 'state-revenue') {
        roleHtml = `
          <h4 class="font-label-md text-label-md text-primary font-bold flex items-center gap-1">
            <span class="material-symbols-outlined text-[18px]">domain</span>
            State Government Directorate & Cadastral Portfolio
          </h4>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-spacing-sm">
            <div class="p-spacing-sm bg-surface-container-lowest rounded-lg border border-outline-variant/30 space-y-1">
              <div class="flex items-center justify-between text-xs text-on-surface-variant">
                <span class="font-semibold">State Administration:</span>
                <span class="material-symbols-outlined text-[14px] text-tertiary" title="Identity-locked to State Cadre">lock</span>
              </div>
              <div class="font-body-md text-body-md font-bold text-on-surface">${u.stateName || u.state || 'West Bengal'}</div>
              <span class="text-[10px] text-outline-variant block">State Land Revenue Administration</span>
            </div>
            <div class="p-spacing-sm bg-surface-container-lowest rounded-lg border border-outline-variant/30 space-y-1">
              <div class="flex items-center justify-between text-xs text-on-surface-variant">
                <span class="font-semibold">State Directorate:</span>
                <span class="material-symbols-outlined text-[14px] text-tertiary" title="Identity-locked">lock</span>
              </div>
              <div class="font-body-md text-body-md font-bold text-on-surface">${u.directorate || 'Directorate of Land Records & Surveys (Nabanna)'}</div>
              <span class="text-[10px] text-outline-variant block">Apex State Revenue & Requisition Desk</span>
            </div>
            <div class="p-spacing-sm bg-surface-container-lowest rounded-lg border border-outline-variant/30 space-y-1 sm:col-span-2">
              <div class="flex items-center justify-between text-xs text-on-surface-variant">
                <span class="font-semibold">Statutory Authority & Powers:</span>
                <span class="material-symbols-outlined text-[14px] text-tertiary" title="Identity-locked statutory powers">lock</span>
              </div>
              <div class="font-body-md text-body-md font-semibold text-on-surface">RFCTLARR 2013 State Rules, SIA Appraisal Approval, Section 19 Declaration Sanction, SLAO Cadre Oversight</div>
              <span class="text-[10px] text-outline-variant block">State Gazette Publication & Directorate RoU Validation</span>
            </div>
          </div>
        `;
      } else if (role === 'dro-cala') {
        roleHtml = `
          <h4 class="font-label-md text-label-md text-primary font-bold flex items-center gap-1">
            <span class="material-symbols-outlined text-[18px]">location_city</span>
            District Officer & CALA Competent Authority Portfolio
          </h4>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-spacing-sm">
            <div class="p-spacing-sm bg-surface-container-lowest rounded-lg border border-outline-variant/30 space-y-1">
              <div class="flex items-center justify-between text-xs text-on-surface-variant">
                <span class="font-semibold">District Revenue Jurisdiction:</span>
                <span class="material-symbols-outlined text-[14px] text-tertiary" title="Identity-locked to District Collectorate">lock</span>
              </div>
              <div class="font-body-md text-body-md font-bold text-on-surface">${u.districtName || u.district || 'Hooghly District'}</div>
              <span class="text-[10px] text-outline-variant block">Collectorate & District Magistrate Jurisdiction</span>
            </div>
            <div class="p-spacing-sm bg-surface-container-lowest rounded-lg border border-outline-variant/30 space-y-1">
              <div class="flex items-center justify-between text-xs text-on-surface-variant">
                <span class="font-semibold">Revenue Division / Block:</span>
                <span class="material-symbols-outlined text-[14px] text-tertiary" title="Identity-locked">lock</span>
              </div>
              <div class="font-body-md text-body-md font-bold text-on-surface">${u.divisionBlock || 'Burdwan Division / Chinsurah & Chanditala'}</div>
              <span class="text-[10px] text-outline-variant block">Sub-Divisional & Block Land Reforms (BL&LRO)</span>
            </div>
            <div class="p-spacing-sm bg-surface-container-lowest rounded-lg border border-outline-variant/30 space-y-1 sm:col-span-2">
              <div class="flex items-center justify-between text-xs text-on-surface-variant">
                <span class="font-semibold">Statutory Designation & Mandate:</span>
                <span class="material-symbols-outlined text-[14px] text-tertiary" title="Identity-locked under statutory appointment">lock</span>
              </div>
              <div class="font-body-md text-body-md font-semibold text-on-surface">Competent Authority for Land Acquisition (CALA) per Section 3(a) • Award Determination u/s 3G • Physical Possession Vesting u/s 3E</div>
              <span class="text-[10px] text-outline-variant block">Empowered under RFCTLARR 2013 & National Highway / Railway Acts</span>
            </div>
          </div>
        `;
      } else if (role === 'requiring-body') {
        roleHtml = `
          <h4 class="font-label-md text-label-md text-primary font-bold flex items-center gap-1">
            <span class="material-symbols-outlined text-[18px]">engineering</span>
            Implementing Agency & Infrastructure Corridor Portfolio
          </h4>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-spacing-sm">
            <div class="p-spacing-sm bg-surface-container-lowest rounded-lg border border-outline-variant/30 space-y-1">
              <div class="flex items-center justify-between text-xs text-on-surface-variant">
                <span class="font-semibold">Implementing Agency Name:</span>
                <span class="material-symbols-outlined text-[14px] text-tertiary" title="Identity-locked Requiring Body Entity">lock</span>
              </div>
              <div class="font-body-md text-body-md font-bold text-on-surface">${u.agencyName || 'DFCCIL / KMDA'}</div>
              <span class="text-[10px] text-outline-variant block">Statutory Infrastructure Requiring Body</span>
            </div>
            <div class="p-spacing-sm bg-surface-container-lowest rounded-lg border border-outline-variant/30 space-y-1">
              <div class="flex items-center justify-between text-xs text-on-surface-variant">
                <span class="font-semibold">Designation / Executive Role:</span>
                <span class="material-symbols-outlined text-[14px] text-tertiary" title="Identity-locked">lock</span>
              </div>
              <div class="font-body-md text-body-md font-bold text-on-surface">${u.designationOfficial || u.title || 'Chief Engineer (Land & Infra)'}</div>
              <span class="text-[10px] text-outline-variant block">Corridor Acquisition & Civil Works Nodal</span>
            </div>
            <div class="p-spacing-sm bg-surface-container-lowest rounded-lg border border-outline-variant/30 space-y-1 sm:col-span-2">
              <div class="flex items-center justify-between text-xs text-on-surface-variant">
                <span class="font-semibold">Assigned Projects & Corridors:</span>
                <span class="material-symbols-outlined text-[14px] text-tertiary" title="Identity-locked Project Corridor">lock</span>
              </div>
              <div class="font-body-md text-body-md font-semibold text-on-surface">${u.assignedProjects || 'Eastern Dedicated Freight Corridor (EDFC Dankuni - Sonnagar) & Dankuni RoU Link'}</div>
              <span class="text-[10px] text-outline-variant block">Active Project Requisition ID: REQ-WB-HGY-2024-001</span>
            </div>
          </div>
        `;
      } else if (role === 'citizen') {
        const stateTerm = u.stateTerm || (u.state === 'Maharashtra' ? 'Gut No.' : (u.state === 'Uttar Pradesh' ? 'Khasra No.' : 'Dag No.'));
        const holding = u.holdingRef || (u.gutNumber ? `${u.gutNumber} • Mouza ${u.village || ''}` : 'No Registered Holding');
        const address = u.address || `${u.village || 'Dankuni'}, ${u.taluka || 'Chanditala-II'}, ${u.district || 'Hooghly'}, ${u.state || 'West Bengal'}`;
        const recordSystem = u.landRecordSystem || (u.state === 'Maharashtra' ? 'MahaBhumi (MahaBhulekh 7/12)' : (u.state === 'Uttar Pradesh' ? 'UP Bhulekh (Khasra/Khatauni)' : 'Banglarbhumi (e-Bhuchitra)'));

        roleHtml = `
          <h4 class="font-label-md text-label-md text-primary font-bold flex items-center gap-1">
            <span class="material-symbols-outlined text-[18px]">real_estate_agent</span>
            Citizen Landowner & Cadastral Holding Dossier
          </h4>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-spacing-sm">
            <div class="p-spacing-sm bg-surface-container-lowest rounded-lg border border-outline-variant/30 space-y-1">
              <div class="flex items-center justify-between text-xs text-on-surface-variant">
                <span class="font-semibold">Aadhaar-Linked Verified Name:</span>
                <span class="material-symbols-outlined text-[14px] text-tertiary" title="Identity-locked: Matches UIDAI e-KYC 100%">lock</span>
              </div>
              <div class="font-body-md text-body-md font-bold text-on-surface flex items-center gap-1">
                ${u.name}
                <span class="material-symbols-outlined text-tertiary text-sm" title="Matches UIDAI e-KYC exactly">check_circle</span>
              </div>
              <span class="text-[10px] text-tertiary font-bold block">100% Match with Aadhaar e-KYC biometric master</span>
            </div>
            <div class="p-spacing-sm bg-surface-container-lowest rounded-lg border border-outline-variant/30 space-y-1">
              <div class="flex items-center justify-between text-xs text-on-surface-variant">
                <span class="font-semibold">Aadhaar Reference Number:</span>
                <span class="material-symbols-outlined text-[14px] text-tertiary" title="Identity-locked from UIDAI">lock</span>
              </div>
              <div class="font-body-md text-body-md font-bold text-on-surface font-legal-code">${u.maskedAadhaar || '•••• •••• ' + (u.ownerAadhaar ? u.ownerAadhaar.slice(-4) : '1012')}</div>
              <span class="text-[10px] text-outline-variant block">Stored as SHA-256 encrypted statutory hash</span>
            </div>
            <div class="p-spacing-sm bg-surface-container-lowest rounded-lg border border-outline-variant/30 space-y-1 sm:col-span-2">
              <div class="flex items-center justify-between text-xs text-on-surface-variant">
                <span class="font-semibold">Registered Cadastral Holdings (${stateTerm}):</span>
                <span class="material-symbols-outlined text-[14px] text-tertiary" title="Identity-locked from State Land Records Registry">lock</span>
              </div>
              <div class="font-body-md text-body-md font-bold text-primary">${holding}</div>
              <span class="text-[10px] text-outline-variant block">Connected to ${recordSystem}</span>
            </div>
            <div class="p-spacing-sm bg-surface-container-lowest rounded-lg border border-outline-variant/30 space-y-1 sm:col-span-2">
              <div class="flex items-center justify-between text-xs text-on-surface-variant">
                <span class="font-semibold">Official Postal & District/Block Address:</span>
                <span class="material-symbols-outlined text-[14px] text-tertiary" title="Identity-locked from e-KYC">lock</span>
              </div>
              <div class="font-body-md text-body-md font-semibold text-on-surface">${address}</div>
              <span class="text-[10px] text-outline-variant block">Notice delivery address under Section 3(a) and 3E</span>
            </div>
            <div class="p-spacing-sm bg-surface-container-lowest rounded-lg border border-outline-variant/30 space-y-1 sm:col-span-2">
              <div class="flex items-center justify-between text-xs text-on-surface-variant">
                <span class="font-semibold">Linked PFMS Bank Account:</span>
                <span class="material-symbols-outlined text-[14px] text-tertiary" title="Identity-locked for Direct Benefit Transfer">lock</span>
              </div>
              <div class="font-body-md text-body-md font-bold text-secondary font-legal-code">${u.bankAccount || 'Direct Benefit Transfer (DBT) Aadhaar-Seeded Account'}</div>
              <span class="text-[10px] text-tertiary font-semibold block">${u.utrNumber ? u.utrNumber + ' (Direct Benefit Transfer Cleared)' : 'DBT Escrow Disbursal Ready'}</span>
            </div>
          </div>
        `;
      }
      roleContainer.innerHTML = roleHtml;
    }

    // 6. Account Created & Last Login
    const accEl = document.getElementById('profile-account-created');
    if (accEl) accEl.textContent = u.accountCreated || '15-Apr-2023';

    const loginEl = document.getElementById('profile-last-login');
    if (loginEl) loginEl.textContent = u.lastLogin || 'Today, 10:48 AM IST (TLS 1.3)';

    modal.classList.remove('hidden');
    if (window.i18n && typeof window.i18n.applyTranslations === 'function') {
      window.i18n.applyTranslations(modal);
    }
  }

  window.openMyProfileModal = openMyProfileModal;
  window.closeMyProfileModal = closeMyProfileModal;

  function closeMyProfileModal() {
    const modal = document.getElementById('modal-my-profile');
    if (modal) modal.classList.add('hidden');
  }

/**
 * NLAMS - Main Application Orchestrator & View Controller
 * Department of Land Resources, Ministry of Rural Development, GoI
 */

(function(window, document) {
  'use strict';

  // Selected Active State
  let currentViewId = 'view-national';
  let selectedParcelId = null;

  // DOM Elements Cache
  let views = {};
  let navButtons = [];
  let store = window.NLAMS_STORE;

  // ========================================================
  // ROLE-BASED ACCESS CONTROL (RBAC) CONFIGURATION & ROUTING
  // ========================================================
  const ROLE_DASHBOARD_MAP = {
    'central-ministry': {
      viewId: 'view-national',
      route: '/national-dashboard',
      hash: '#/national-dashboard',
      roleLabel: 'Central Ministry / Policy Makers',
      dashboardName: 'National Dashboard'
    },
    'state-revenue': {
      viewId: 'view-state',
      route: '/state-dashboard',
      hash: '#/state-dashboard',
      roleLabel: 'State Government',
      dashboardName: 'State Dashboard'
    },
    'dro-cala': {
      viewId: 'view-district',
      route: '/district-dashboard',
      hash: '#/district-dashboard',
      roleLabel: 'District Collector / Field Officers',
      dashboardName: 'District / CALA Dashboard'
    },
    'requiring-body': {
      viewId: 'view-agency',
      route: '/agency-dashboard',
      hash: '#/agency-dashboard',
      roleLabel: 'Project Implementing Agency',
      dashboardName: 'Implementing Agency Dashboard'
    },
    'citizen': {
      viewId: 'view-citizen',
      route: '/citizen-dashboard',
      hash: '#/citizen-dashboard',
      roleLabel: 'Affected Landowners/Families',
      dashboardName: 'Citizen Portal'
    },
    'rehab-authority': {
      viewId: 'view-district',
      route: '/district-dashboard',
      hash: '#/district-dashboard',
      roleLabel: 'Rehabilitation Authority (R&R Resettlement)',
      dashboardName: 'R&R Resettlement Desk'
    }
  };

  const HASH_TO_VIEW_MAP = {
    '#/login': 'view-login',
    '#/national-dashboard': 'view-national',
    '#/state-dashboard': 'view-state',
    '#/district-dashboard': 'view-district',
    '#/agency-dashboard': 'view-agency',
    '#/citizen-dashboard': 'view-citizen'
  };

  const VIEW_TO_HASH_MAP = {
    'view-login': '#/login',
    'view-national': '#/national-dashboard',
    'view-state': '#/state-dashboard',
    'view-district': '#/district-dashboard',
    'view-agency': '#/agency-dashboard',
    'view-citizen': '#/citizen-dashboard'
  };

  // Nav Tab Template Definitions (Preserves exact DOM classes, markup, and styling)
  const NAV_TAB_TEMPLATES = {
    'view-login': '<button data-view="view-login" class="dash-nav-btn px-spacing-sm py-1.5 rounded flex items-center gap-1 font-label-md text-label-md text-primary-fixed-dim hover:bg-primary-container hover:text-on-primary transition-colors cursor-pointer whitespace-nowrap"><span class="material-symbols-outlined text-[16px]">lock</span> <span data-i18n="nav.sso">SSO Portal</span></button>',
    'view-national': '<button data-view="view-national" class="dash-nav-btn px-spacing-sm py-1.5 rounded flex items-center gap-1 font-label-md text-label-md text-primary-fixed-dim hover:bg-primary-container hover:text-on-primary transition-colors cursor-pointer whitespace-nowrap"><span class="material-symbols-outlined text-[16px]">analytics</span> <span data-i18n="nav.national">1. National Dashboard</span></button>',
    'view-state': '<button data-view="view-state" class="dash-nav-btn px-spacing-sm py-1.5 rounded flex items-center gap-1 font-label-md text-label-md text-primary-fixed-dim hover:bg-primary-container hover:text-on-primary transition-colors cursor-pointer whitespace-nowrap"><span class="material-symbols-outlined text-[16px]">map</span> <span data-i18n="nav.state">2. State Dashboard</span></button>',
    'view-district': '<button data-view="view-district" class="dash-nav-btn px-spacing-sm py-1.5 rounded flex items-center gap-1 font-label-md text-label-md text-primary-fixed-dim hover:bg-primary-container hover:text-on-primary transition-colors cursor-pointer whitespace-nowrap"><span class="material-symbols-outlined text-[16px]">share_location</span> <span data-i18n="nav.district">3. District / CALA</span></button>',
    'view-agency': '<button data-view="view-agency" class="dash-nav-btn px-spacing-sm py-1.5 rounded flex items-center gap-1 font-label-md text-label-md text-primary-fixed-dim hover:bg-primary-container hover:text-on-primary transition-colors cursor-pointer whitespace-nowrap"><span class="material-symbols-outlined text-[16px]">add_box</span> <span data-i18n="nav.agency">4. Implementing Agency</span></button>',
    'view-citizen': '<button data-view="view-citizen" class="dash-nav-btn px-spacing-sm py-1.5 rounded flex items-center gap-1 font-label-md text-label-md text-primary-fixed-dim hover:bg-primary-container hover:text-on-primary transition-colors cursor-pointer whitespace-nowrap"><span class="material-symbols-outlined text-[16px]">badge</span> <span data-i18n="nav.citizen">5. Citizen Portal</span></button>'
  };

  const LOGOUT_TAB_TEMPLATE = '<button id="btn-navbar-logout" class="px-spacing-sm py-1.5 rounded flex items-center gap-1 font-label-md text-label-md bg-error/15 text-error hover:bg-error hover:text-white transition-colors cursor-pointer whitespace-nowrap border border-error/30" title="Sign Out"><span class="material-symbols-outlined text-[16px]">logout</span> <span data-i18n="nav.sign_out_btn">Sign Out</span></button>';

  // Comprehensive State-to-District Mapping
  const STATE_DISTRICT_MAP = {
    'ALL': ['All Districts'],
    'West Bengal': [
      'All Districts', 'Hooghly', 'Howrah', 'Kolkata', 'North 24 Parganas', 'South 24 Parganas', 'Paschim Bardhaman', 'Purba Bardhaman', 'Nadia', 'Murshidabad', 'Malda', 'Darjeeling', 'Jalpaiguri', 'Alipurduar', 'Cooch Behar', 'Uttar Dinajpur', 'Dakshin Dinajpur', 'Birbhum', 'Bankura', 'Purulia', 'Jhargram', 'Paschim Medinipur', 'Purba Medinipur', 'Kalimpong'
    ],
    'Maharashtra': [
      'All Districts', 'Pune', 'Thane', 'Nashik', 'Ahmednagar', 'Palghar', 'Raigad', 'Solapur', 'Nagpur', 'Aurangabad', 'Kolhapur', 'Satara', 'Amravati', 'Nanded'
    ],
    'Gujarat': [
      'All Districts', 'Ahmedabad', 'Vadodara', 'Surat', 'Rajkot', 'Gandhinagar', 'Bharuch', 'Kutch', 'Bhavnagar', 'Jamnagar'
    ],
    'Uttar Pradesh': [
      'All Districts', 'Lucknow', 'Varanasi', 'Prayagraj', 'Kanpur', 'Agra', 'Gautam Buddha Nagar (Noida)', 'Ghaziabad', 'Gorakhpur', 'Ayodhya', 'Meerut'
    ],
    'Tamil Nadu': [
      'All Districts', 'Chennai', 'Coimbatore', 'Madurai', 'Kanchipuram', 'Salem', 'Tiruchirappalli', 'Tiruvallur', 'Vellore'
    ],
    'Rajasthan': [
      'All Districts', 'Jaipur', 'Jodhpur', 'Udaipur', 'Kota', 'Bikaner', 'Ajmer', 'Alwar', 'Bhilwara'
    ]
  };

  function populateDistricts(districtSelectEl, stateName, includeAll = true) {
    if (!districtSelectEl) return;
    const districts = STATE_DISTRICT_MAP[stateName] || STATE_DISTRICT_MAP['ALL'];
    districtSelectEl.innerHTML = districts
      .filter(d => includeAll || d !== 'All Districts')
      .map((d, i) => `<option value="${d === 'All Districts' ? 'ALL' : d}" ${i === 0 ? 'selected' : ''}>${d}</option>`)
      .join('');
  }

  function isUserAuthenticated() {
    return sessionStorage.getItem('nlams_is_authenticated') === 'true';
  }

  function getUserRole() {
    return sessionStorage.getItem('nlams_session_role') || store.currentUser?.role || 'central-ministry';
  }

  function handleLogout() {
    sessionStorage.removeItem('nlams_is_authenticated');
    sessionStorage.removeItem('nlams_session_role');
    sessionStorage.removeItem('nlams_token');
    sessionStorage.removeItem('nlams_calc_mode');
    sessionStorage.removeItem('nlams_citizen_persona');
    selectedParcelId = null;
    window.NLAMS_SELECTED_PARCEL_ID = null;
    if (window.NLAMS_API) {
      window.NLAMS_API.tokens = {};
    }
    store.setUserRole('central-ministry');
    updateActiveUserBadge({ name: 'Public Portal', badge: 'Not Authenticated', jurisdiction: 'Guest' });
    const headerLogout = document.getElementById('btn-header-logout');
    if (headerLogout) headerLogout.classList.add('hidden');
    showToast('Session Terminated', 'Signed out successfully from NLAMS. Returning to SSO Portal.', 'info');
    renderNavbar();
    window.location.hash = '#/login';
    switchView('view-login', true);
  }

  // Initialize Application
  function init() {
    cacheDOM();

    // 1. Session Restoration & RBAC Initialization
    if (isUserAuthenticated()) {
      const savedRole = getUserRole();
      store.setUserRole(savedRole);
      updateActiveUserBadge(store.currentUser);
    } else {
      updateActiveUserBadge({ name: 'Public Portal', badge: 'Not Authenticated', jurisdiction: 'Guest' });
    }
    renderNavbar();

    setupNavigation();
    setupAuthInteractions();
    setupNationalDashboard();
    setupStateDashboard();
    setupDistrictDashboard();
    setupAgencyDashboard();
    setupCitizenDashboard();
    setupModals();
    setupGlobalDemoTriggers();
    setupAccessibility();

    // Subscribe to Central Shared Reactive Store
    store.subscribe((event, payload) => {
      handleStoreUpdate(event, payload);
    });

    // Initial Renders & Backend Hydration
    if (window.NLAMS_API) {
      window.NLAMS_API.getProjects();
      window.NLAMS_API.getCadastralGeoJSON();
    }
    renderNationalDashboard();
    renderNationalProjectsTable();
    renderStateProjectsTable();
    renderDistrictCALAQueue();
    if (isUserAuthenticated()) {
      if (store.currentUser?.role === 'citizen' && store.currentUser.parcelId) {
        renderCitizenParcel(store.currentUser.parcelId);
      } else if (selectedParcelId) {
        renderCitizenParcel(selectedParcelId);
      }
    }

    // Initial View resolution: check session & URL hash
    const initialHash = window.location.hash;
    if (isUserAuthenticated()) {
      const currentRole = getUserRole();
      const roleConfig = ROLE_DASHBOARD_MAP[currentRole] || ROLE_DASHBOARD_MAP['central-ministry'];
      switchView(roleConfig.viewId, true);
    } else {
      // Pre-authentication: unauthenticated users are restricted to view-login
      if (initialHash && initialHash !== '#/login') {
        window.history.replaceState(null, '', '#/login');
      }
      switchView('view-login', true);
    }

    // Register route protection on hash change (Requirement 5)
    window.addEventListener('hashchange', handleHashRouting);

    showToast('National Land Acquisition Portal', 'Secure session established. Ministry of Rural Development & DoLR.', 'info');
  }

  function cacheDOM() {
    views = {
      'view-login': document.getElementById('view-login'),
      'view-national': document.getElementById('view-national'),
      'view-state': document.getElementById('view-state'),
      'view-district': document.getElementById('view-district'),
      'view-agency': document.getElementById('view-agency'),
      'view-citizen': document.getElementById('view-citizen')
    };
    navButtons = document.querySelectorAll('.dash-nav-btn');
  }

  // Dynamic Navbar Rendering (Requirements 2, 3, 4)
  function renderNavbar() {
    const navContainer = document.getElementById('main-dash-nav');
    if (!navContainer) return;

    if (!isUserAuthenticated()) {
      // Pre-authentication state (logged-out): show ONLY 'SSO Portal' tab
      navContainer.innerHTML = NAV_TAB_TEMPLATES['view-login'];
    } else {
      // Post-login state: render ONLY the ONE tab matching user's role + Sign Out button
      const currentRole = getUserRole();
      const roleConfig = ROLE_DASHBOARD_MAP[currentRole] || ROLE_DASHBOARD_MAP['central-ministry'];
      const authorizedTabHtml = NAV_TAB_TEMPLATES[roleConfig.viewId];

      navContainer.innerHTML = [
        authorizedTabHtml,
        LOGOUT_TAB_TEMPLATE
      ].join('');
    }

    if (window.i18n && typeof window.i18n.applyTranslations === 'function') {
      window.i18n.applyTranslations(navContainer);
    }

    navButtons = navContainer.querySelectorAll('.dash-nav-btn');

    navButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        const viewId = btn.getAttribute('data-view');
        if (viewId) {
          switchView(viewId);
        }
      });
    });

    const logoutBtn = document.getElementById('btn-navbar-logout');
    if (logoutBtn) {
      logoutBtn.addEventListener('click', (e) => {
        e.preventDefault();
        promptSignOutModal();
      });
    }

    highlightActiveNavTab(currentViewId);
  }

  function highlightActiveNavTab(viewId) {
    if (!navButtons) return;
    navButtons.forEach(btn => {
      if (btn.getAttribute('data-view') === viewId) {
        btn.classList.add('active-nav-tab');
      } else {
        btn.classList.remove('active-nav-tab');
      }
    });
  }

  // Route Protection & Hash Change Handler (Requirement 5)
  function handleHashRouting() {
    const rawHash = window.location.hash || '';
    if (!rawHash) return;

    const targetView = HASH_TO_VIEW_MAP[rawHash];
    if (!targetView) return;

    if (isUserAuthenticated()) {
      const userRole = getUserRole();
      const roleConfig = ROLE_DASHBOARD_MAP[userRole] || ROLE_DASHBOARD_MAP['central-ministry'];
      const allowedViewId = roleConfig.viewId;

      if (targetView === 'view-login') {
        handleLogout();
        return;
      }

      if (targetView !== allowedViewId) {
        showToast(
          'Access Denied (403)',
          `Direct URL navigation blocked: Role '${store.currentUser.badge || userRole}' is restricted to ${roleConfig.dashboardName}.`,
          'warning'
        );
        const correctHash = roleConfig.hash;
        if (window.location.hash !== correctHash) {
          window.history.replaceState(null, '', correctHash);
        }
        switchView(allowedViewId, true);
        return;
      }
    } else {
      // Unauthenticated state: block direct URL navigation to any dashboard
      if (targetView !== 'view-login') {
        showToast(
          'Authentication Required (401)',
          'Access Denied: Please sign in through the SSO Portal to access dashboard resources.',
          'warning'
        );
        if (window.location.hash !== '#/login') {
          window.history.replaceState(null, '', '#/login');
        }
        switchView('view-login', true);
        return;
      }
    }

    switchView(targetView);
  }

  // Navigation & View Switching with RBAC Route Guard
  function setupNavigation() {
    // Header brand link returns to authorized dashboard (or SSO if logged out)
    const homeLink = document.getElementById('brand-home-link');
    if (homeLink) {
      homeLink.addEventListener('click', () => {
        if (isUserAuthenticated()) {
          const roleConfig = ROLE_DASHBOARD_MAP[getUserRole()] || ROLE_DASHBOARD_MAP['central-ministry'];
          switchView(roleConfig.viewId, true);
        } else {
          switchView('view-login', true);
        }
      });
    }

    // Header active user badge & header sign out button
    const headerLogout = document.getElementById('btn-header-logout');
    if (headerLogout) {
      headerLogout.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        handleLogout();
      });
    }

    const userBadge = document.getElementById('header-user-badge') || document.querySelector('#active-user-name')?.closest('.flex');
    if (userBadge) {
      userBadge.style.cursor = 'pointer';
      userBadge.title = isUserAuthenticated() ? 'Click to view My Profile & Statutory Identity Dossier' : 'Sign in to NLAMS SSO Portal';
      userBadge.addEventListener('click', (e) => {
        if (e.target.closest('#btn-header-logout')) return;
        if (isUserAuthenticated()) {
          openMyProfileModal();
        } else {
          switchView('view-login', true);
        }
      });
    }
  }

  function switchView(viewId, bypassGuard = false) {
    if (!views[viewId]) return;

    // RBAC Route Protection Guard
    if (!bypassGuard) {
      if (!isUserAuthenticated()) {
        if (viewId !== 'view-login') {
          showToast(
            'Authentication Required (401)',
            'Access Denied: Please sign in through the SSO Portal to access this dashboard.',
            'warning'
          );
          if (window.location.hash !== '#/login') {
            window.history.replaceState(null, '', '#/login');
          }
          switchView('view-login', true);
          return;
        }
      } else {
        const userRole = getUserRole();
        const roleConfig = ROLE_DASHBOARD_MAP[userRole] || ROLE_DASHBOARD_MAP['central-ministry'];
        if (viewId !== roleConfig.viewId && viewId !== 'view-login') {
          showToast(
            'Access Denied (403)',
            `Role '${store.currentUser.badge || userRole}' is restricted to ${roleConfig.dashboardName}.`,
            'warning'
          );
          switchView(roleConfig.viewId, true);
          return;
        }
      }
    }

    currentViewId = viewId;

    // Hide all views
    Object.values(views).forEach(v => {
      if (v) v.classList.add('hidden');
    });

    // Show target view
    views[viewId].classList.remove('hidden');

    // Update active nav button
    highlightActiveNavTab(viewId);

    // Sync URL hash
    const targetHash = VIEW_TO_HASH_MAP[viewId];
    if (targetHash && window.location.hash !== targetHash) {
      window.history.replaceState(null, '', targetHash);
    }

    // Mount GIS components when corresponding view is opened
    if (viewId === 'view-national') {
      window.GISEngine.renderNationalMap('national-gis-map-container', (selectedState) => {
        if (isUserAuthenticated() && getUserRole() !== 'central-ministry') {
          showToast('Access Restricted', 'State drilldown view is restricted to Central Ministry / State Revenue.', 'info');
          return;
        }
        window.NLAMS_SELECTED_STATE = selectedState;
        showToast(`Drilling down to ${selectedState}`, 'Redirecting to State Directorate Dashboard...', 'info');
        switchView('view-state', true);
      });
    } else if (viewId === 'view-state') {
      const targetState = getCurrentTargetState();
      updateStateDashboardHeaders(targetState);
      mountStateGIS(targetState);
      renderStateProjectsTable();
    } else if (viewId === 'view-district') {
      mountDistrictGIS();
      const parcel = store.parcels.find(p => p.id === selectedParcelId || p.properties?.id === selectedParcelId);
      if (parcel) {
        const props = parcel.properties || parcel;
        const stateBreadcrumbEl = document.getElementById('district-breadcrumb-state');
        if (stateBreadcrumbEl) stateBreadcrumbEl.textContent = props.state || 'West Bengal';
        const deskBreadcrumbEl = document.getElementById('district-breadcrumb-desk');
        if (deskBreadcrumbEl) deskBreadcrumbEl.textContent = `${props.district || 'Hooghly'} District CALA Clearance Desk`;
      }
    } else if (viewId === 'view-citizen') {
      if (isUserAuthenticated() && store.currentUser?.role === 'citizen' && store.currentUser.parcelId) {
        renderCitizenParcel(store.currentUser.parcelId);
      }
    }

    if (window.i18n && typeof window.i18n.applyTranslations === 'function') {
      window.i18n.applyTranslations(views[viewId]);
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  window.switchView = switchView;

  function updateActiveUserBadge(user) {
    const nameEl = document.getElementById('active-user-name');
    const roleEl = document.getElementById('active-user-role-label');
    const headerLogout = document.getElementById('btn-header-logout');
    if (nameEl) nameEl.textContent = user.name;
    if (roleEl) roleEl.textContent = `${user.badge} | ${user.jurisdiction}`;
    if (headerLogout) {
      if (isUserAuthenticated()) {
        headerLogout.classList.remove('hidden');
      } else {
        headerLogout.classList.add('hidden');
      }
    }
  }

  // Toast System
  function showToast(title, message, type = 'success') {
    const tray = document.getElementById('toast-tray');
    if (!tray) return;

    const toast = document.createElement('div');
    toast.className = `pointer-events-auto p-spacing-md rounded-lg shadow-xl border flex items-start gap-spacing-sm transition-all duration-300 transform translate-x-4 opacity-0 ${
      type === 'success' ? 'bg-surface-container-lowest border-tertiary text-on-surface' :
      type === 'warning' ? 'bg-surface-container-lowest border-secondary text-on-surface' :
      'bg-surface-container-lowest border-primary text-on-surface'
    }`;

    const icon = type === 'success' ? 'check_circle' : type === 'warning' ? 'warning' : 'info';
    const iconColor = type === 'success' ? 'text-tertiary' : type === 'warning' ? 'text-secondary' : 'text-primary';

    toast.innerHTML = `
      <span class="material-symbols-outlined text-xl ${iconColor} shrink-0">${icon}</span>
      <div class="flex flex-col gap-spacing-2xs flex-1">
        <span class="font-label-md text-label-md font-bold text-on-surface leading-tight">${title}</span>
        <span class="font-body-sm text-body-sm text-on-surface-variant leading-snug">${message}</span>
      </div>
      <button class="text-on-surface-variant hover:text-on-surface shrink-0" onclick="this.parentElement.remove()">
        <span class="material-symbols-outlined text-base">close</span>
      </button>
    `;

    tray.appendChild(toast);
    if (window.i18n && typeof window.i18n.applyTranslations === 'function') {
      window.i18n.applyTranslations(toast);
    }
    setTimeout(() => {
      toast.classList.remove('translate-x-4', 'opacity-0');
    }, 10);

    setTimeout(() => {
      toast.classList.add('opacity-0', 'translate-x-4');
      setTimeout(() => toast.remove(), 300);
    }, 4500);
  }

  // Reactive Store Dispatch Listener
  function handleStoreUpdate(event, payload) {
    if (store.currentUser) {
      updateActiveUserBadge(store.currentUser);
    }
    renderNationalDashboard();
    renderNationalProjectsTable();
    renderStateProjectsTable();
    renderDistrictCALAQueue();
    if (typeof renderDistrictCALAObjections === 'function') {
      renderDistrictCALAObjections();
    }
    if (typeof renderStateObjections === 'function') {
      renderStateObjections();
    }
    if (selectedParcelId) {
      if (store.currentUser?.role === 'citizen' && store.currentUser.parcelId) {
        renderCitizenParcel(store.currentUser.parcelId);
      } else {
        renderCitizenParcel(selectedParcelId);
      }
    }
    // Dynamically refresh GIS parcel layers so colors and statuses update on map
    if (typeof mountDistrictGIS === 'function') {
      mountDistrictGIS();
    }

    switch (event) {
      case 'PROPOSAL_SUBMITTED':
        showToast('New Acquisition Proposal Queued', `Project ${payload.id} submitted for initial scrutiny.`, 'info');
        break;
      case 'SCRUTINY_APPROVED':
        showToast('Digital Scrutiny Cleared', `${payload.gutNumber || payload.name} passed land record validation against Bhulekh API.`, 'success');
        break;
      case 'SCRUTINY_REJECTED':
        showToast('Proposal Rejected', `Scrutiny rejected: ${payload.remarks || 'Discrepancy recorded'}`, 'warning');
        break;
      case 'SCRUTINY_SEND_BACK':
        showToast('Returned for Rework', `Dossier returned to Requiring Body for revision: ${payload.remarks || 'KML Boundary Check'}`, 'info');
        break;
      case 'NOTIFICATION_ISSUED':
        showToast('Section 11/19 Gazette Published', `Statutory declaration digitally signed under DSC Token and attested under IT Act 2000.`, 'info');
        break;
      case 'AWARD_DECLARED':
        showToast('Section 3G Award Declared', `Award determination completed with 100% solatium & statutory interest.`, 'success');
        break;
      case 'COMPENSATION_DISBURSED':
        showToast('PFMS DBT Fund Disbursed', `Direct Benefit Transfer remitted to Aadhaar-linked bank account.`, 'success');
        break;
      case 'POSSESSION_CONFIRMED':
        showToast('Physical Possession Handed Over', `${payload.gutNumber || payload.name} confirmed by Field Officer. Title vested in State under Section 16.`, 'success');
        break;
      case 'OBJECTION_FILED':
        showToast('Section 15 Objection Registered', `Hearing listed before CALA Desk for ${payload.khasraNo}. Ref: ${payload.id}`, 'warning');
        break;
      case 'OBJECTION_UPDATED':
        showToast('Section 15 Order Pronounced', `Statutory verdict [${payload.status}] recorded for ${payload.khasraNo}.`, 'success');
        break;
      case 'RR_COMPLETED':
        showToast('R&R Resettlement Completed', `Rehabilitated ${payload.familiesCount} displaced families with alternative housing & grants under Section 31.`, 'success');
        break;
    }
  }

  // 1. SSO Portal & Login Controller (Requirements 1, 6)
    let currentGeneratedOTP = null;
  let otpCountdownTimer = null;

  function setupAuthInteractions() {
    const roleSelect = document.getElementById('user-role-select');
    const roleDesc = document.getElementById('role-desc');
    const rolePill = document.getElementById('role-privilege-pill');

    const roleCapabilities = {
      'citizen': 'Citizen Access: View published Section 11 notices, check award compensation payment vouchers, and track rehabilitation entitlements.',
      'dro-cala': 'CALA / DRO Authority: Enter Award Enquiry proceedings, upload Section 19 declaration maps, and issue formal land vesting orders.',
      'requiring-body': 'Requiring Body (NHAI/Railways): Submit Form 1 acquisition proposals, upload CAD/GIS shapefiles, and remit compensation deposits.',
      'state-revenue': 'State Revenue Dept: Validate RoR/Jamabandi mutations, verify cadastral boundaries, and monitor tehsil-level pendency.',
      'central-ministry': 'DoLR Apex Dashboard: Review national multi-state mega-corridor status, oversee MIS disbursal audits, and policy reports.',
      'rehab-authority': 'Rehabilitation Authority: Oversee Section 31 resettlement schemes, assign model colony housing, and disburse subsistence grants.'
    };

    // Auth method radio buttons and sections
    const authRadioAadhaar = document.querySelector('input[name="auth-method"][value="aadhaar"]');
    const authRadioDsc = document.querySelector('input[name="auth-method"][value="dsc"]');
    const authRadioParichay = document.querySelector('input[name="auth-method"][value="parichay"]');

    const labelAuthAadhaar = document.getElementById('label-auth-aadhaar');
    const labelAuthDsc = document.getElementById('label-auth-dsc');
    const labelAuthParichay = document.getElementById('label-auth-parichay');

    const sectionAadhaar = document.getElementById('auth-section-aadhaar');
    const sectionDsc = document.getElementById('auth-section-dsc');
    const sectionParichay = document.getElementById('auth-section-parichay');

    function selectAuthMethod(method) {
      if (sectionAadhaar) sectionAadhaar.classList.toggle('hidden', method !== 'aadhaar');
      if (sectionDsc) sectionDsc.classList.toggle('hidden', method !== 'dsc');
      if (sectionParichay) sectionParichay.classList.toggle('hidden', method !== 'parichay');

      const updateLabel = (lbl, isSelected) => {
        if (!lbl) return;
        if (isSelected) {
          lbl.classList.add('bg-surface-container-high', 'text-primary', 'border-primary');
          lbl.classList.remove('bg-surface-container-lowest', 'text-on-surface', 'border-outline-variant/40');
        } else {
          lbl.classList.remove('bg-surface-container-high', 'text-primary', 'border-primary');
          lbl.classList.add('bg-surface-container-lowest', 'text-on-surface', 'border-outline-variant/40');
        }
      };
      updateLabel(labelAuthAadhaar, method === 'aadhaar');
      updateLabel(labelAuthDsc, method === 'dsc');
      updateLabel(labelAuthParichay, method === 'parichay');
    }

    document.querySelectorAll('input[name="auth-method"]').forEach(radio => {
      radio.addEventListener('change', (e) => {
        selectAuthMethod(e.target.value);
      });
    });

    if (roleSelect && roleDesc) {
      roleSelect.addEventListener('change', (e) => {
        const val = e.target.value;
        if (roleCapabilities[val]) {
          roleDesc.textContent = roleCapabilities[val];
          if (rolePill) {
            rolePill.classList.remove('bg-surface-container-low');
            rolePill.classList.add('bg-surface-container');
          }
        }
        if (val === 'citizen') {
          if (authRadioAadhaar) {
            authRadioAadhaar.checked = true;
            selectAuthMethod('aadhaar');
          }
          if (uid1 && uid2 && uid3) {
            uid1.value = '9876'; uid2.value = '5432'; uid3.value = '1012';
            validateAadhaarDigits();
          }
        }
        if (val === 'dro-cala' || val === 'state-revenue') {
          if (authRadioDsc) {
            authRadioDsc.checked = true;
            selectAuthMethod('dsc');
          }
        } else if (val === 'central-ministry') {
          if (authRadioParichay) {
            authRadioParichay.checked = true;
            selectAuthMethod('parichay');
          }
        }
      });
    }

    // Toggle Aadhaar Masking
    const toggleMaskBtn = document.getElementById('btn-toggle-mask');
    const maskText = document.getElementById('mask-status-text');
    const uid1 = document.getElementById('login-uid-1');
    const uid2 = document.getElementById('login-uid-2');
    const uid3 = document.getElementById('login-uid-3');
    const btnGetOtp = document.getElementById('btn-get-otp');
    const otpCountdownEl = document.getElementById('otp-countdown');
    const otpErrorMsg = document.getElementById('otp-error-msg');
    const otpErrorText = document.getElementById('otp-error-text');

    if (toggleMaskBtn && uid1 && uid2) {
      let isMasked = true;
      toggleMaskBtn.addEventListener('click', () => {
        isMasked = !isMasked;
        uid1.type = isMasked ? 'password' : 'text';
        uid2.type = isMasked ? 'password' : 'text';
        if (maskText) maskText.textContent = isMasked ? 'Show Unmasked' : 'Mask Digits';
      });
    }

    // Aadhaar 12-digit validation and auto-advance
    function validateAadhaarDigits() {
      const v1 = uid1 ? uid1.value.replace(/\D/g, '') : '';
      const v2 = uid2 ? uid2.value.replace(/\D/g, '') : '';
      const v3 = uid3 ? uid3.value.replace(/\D/g, '') : '';
      if (uid1) uid1.value = v1;
      if (uid2) uid2.value = v2;
      if (uid3) uid3.value = v3;

      const totalDigits = v1.length + v2.length + v3.length;
      const isValid = totalDigits === 12 && v1.length === 4 && v2.length === 4 && v3.length === 4;

      if (btnGetOtp && !otpCountdownTimer) {
        btnGetOtp.disabled = !isValid;
        if (isValid) {
          btnGetOtp.classList.remove('opacity-50', 'cursor-not-allowed', 'bg-surface-container-high', 'text-on-surface-variant');
          btnGetOtp.classList.add('bg-primary', 'text-on-primary', 'hover:bg-primary-container', 'shadow-sm', 'cursor-pointer');
        } else {
          btnGetOtp.classList.add('opacity-50', 'cursor-not-allowed', 'bg-surface-container-high', 'text-on-surface-variant');
          btnGetOtp.classList.remove('bg-primary', 'text-on-primary', 'hover:bg-primary-container', 'shadow-sm', 'cursor-pointer');
        }
      }
      return isValid;
    }

    [uid1, uid2, uid3].forEach((uidInput, idx) => {
      if (!uidInput) return;
      uidInput.addEventListener('input', () => {
        if (uidInput.value.length >= 4) {
          uidInput.value = uidInput.value.slice(0, 4);
          if (idx === 0 && uid2) uid2.focus();
          if (idx === 1 && uid3) uid3.focus();
        }
        validateAadhaarDigits();
      });
      uidInput.addEventListener('keydown', (e) => {
        if (e.key === 'Backspace' && !uidInput.value) {
          if (idx === 1 && uid1) uid1.focus();
          if (idx === 2 && uid2) uid2.focus();
        }
      });
    });

    validateAadhaarDigits();

    // "Get OTP" Button Handler
    if (btnGetOtp) {
      btnGetOtp.addEventListener('click', (e) => {
        e.preventDefault();
        if (!validateAadhaarDigits()) {
          showToast('Invalid Aadhaar Number', 'Please enter all 12 digits of your Aadhaar card.', 'warning');
          return;
        }

        currentGeneratedOTP = Math.floor(100000 + Math.random() * 900000).toString();
        window.__NLAMS_CURRENT_OTP = currentGeneratedOTP;

        console.log('%c[UIDAI OTP GATEWAY] Mock OTP delivered to registered mobile:', 'color: #007bff; font-weight: bold; font-size: 14px;', currentGeneratedOTP);
        showToast('UIDAI OTP Dispatched', `Mock OTP sent to linked mobile: ${currentGeneratedOTP}. Valid for 10 minutes.`, 'success');

        if (otpErrorMsg) otpErrorMsg.classList.add('hidden');

        const firstOtp = document.querySelector('.otp-box');
        if (firstOtp) {
          firstOtp.focus();
          if (firstOtp.select) firstOtp.select();
        }

        if (otpCountdownTimer) clearInterval(otpCountdownTimer);
        let secondsLeft = 30;
        btnGetOtp.disabled = true;
        btnGetOtp.classList.add('opacity-50', 'cursor-not-allowed');

        const updateTimerText = () => {
          if (otpCountdownEl) {
            const formatted = secondsLeft < 10 ? `0${secondsLeft}` : secondsLeft;
            otpCountdownEl.textContent = `Resend in 00:${formatted}`;
          }
        };
        updateTimerText();

        otpCountdownTimer = setInterval(() => {
          secondsLeft -= 1;
          if (secondsLeft <= 0) {
            clearInterval(otpCountdownTimer);
            otpCountdownTimer = null;
            if (otpCountdownEl) otpCountdownEl.textContent = 'Resend OTP';
            btnGetOtp.disabled = false;
            btnGetOtp.classList.remove('opacity-50', 'cursor-not-allowed');
          } else {
            updateTimerText();
          }
        }, 1000);
      });
    }

    // Auto-focus shift across OTP inputs & paste support
    const otpInputs = document.querySelectorAll('.otp-box');
    otpInputs.forEach((input, index) => {
      input.addEventListener('input', () => {
        const val = input.value.replace(/\D/g, '');
        input.value = val ? val[val.length - 1] : '';
        if (input.value && index < otpInputs.length - 1) {
          otpInputs[index + 1].focus();
        }
      });
      input.addEventListener('keydown', (e) => {
        if (e.key === 'Backspace' && !input.value && index > 0) {
          otpInputs[index - 1].focus();
        }
      });
      input.addEventListener('paste', (e) => {
        e.preventDefault();
        const text = (e.clipboardData || window.clipboardData).getData('text').replace(/\D/g, '').slice(0, 6);
        for (let i = 0; i < text.length; i++) {
          if (otpInputs[i]) otpInputs[i].value = text[i];
        }
        if (otpInputs[Math.min(text.length, otpInputs.length - 1)]) {
          otpInputs[Math.min(text.length, otpInputs.length - 1)].focus();
        }
      });
    });

    // Refresh Captcha
    const refreshCaptchaBtn = document.getElementById('btn-refresh-captcha');
    const captchaDisplay = document.getElementById('captcha-display');
    const captchaInput = document.getElementById('captcha-code-input');
    if (refreshCaptchaBtn && captchaDisplay && captchaInput) {
      refreshCaptchaBtn.addEventListener('click', () => {
        const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
        let newCode = '';
        for (let i = 0; i < 5; i++) {
          newCode += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        captchaDisplay.innerHTML = newCode.split('').map((c, idx) => {
          const colors = ['text-primary', 'text-secondary', 'text-tertiary'];
          return `<span class="inline-block ${colors[idx % colors.length]}">${c}</span>`;
        }).join('');
        captchaInput.value = newCode;
      });
    }

    // Login Form Submission -> Assign role, update navbar with RBAC & navigate
    const loginForm = document.getElementById('nlams-auth-form');
    if (loginForm) {
      loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const selectedRole = roleSelect ? roleSelect.value : 'central-ministry';

        const activeMethodRadio = document.querySelector('input[name="auth-method"]:checked');
        const activeMethod = activeMethodRadio ? activeMethodRadio.value : 'aadhaar';

        if (activeMethod === 'aadhaar') {
          let enteredOtp = '';
          otpInputs.forEach(inp => enteredOtp += (inp.value || ''));

          const expectedOtp = currentGeneratedOTP || '482910';
          if (!enteredOtp || (enteredOtp !== expectedOtp && enteredOtp !== '482910' && enteredOtp !== '742983')) {
            if (otpErrorMsg) {
              otpErrorMsg.classList.remove('hidden');
              if (otpErrorText) otpErrorText.textContent = enteredOtp.length < 6 
                ? 'Please enter all 6 digits of the OTP.' 
                : 'Invalid OTP code entered. Please check the code or click "Get OTP".';
            }
            otpInputs.forEach(i => i.classList.add('border-error'));
            showToast('Authentication Failed', 'Invalid OTP code entered. Please check your OTP.', 'error');
            return;
          }
          if (otpErrorMsg) otpErrorMsg.classList.add('hidden');
          otpInputs.forEach(i => i.classList.remove('border-error'));
        } else if (activeMethod === 'dsc') {
          const pin = document.getElementById('dsc-login-pin');
          if (!pin || pin.value.trim().length < 4) {
            showToast('DSC Authentication Error', 'Please enter your 4-digit Cryptographic Hardware Token PIN.', 'warning');
            return;
          }
          showToast('Hardware DSC Verified', 'e-Mudhra Class 3 Government Digital Certificate attestation approved.', 'success');
        } else if (activeMethod === 'parichay') {
          const email = document.getElementById('parichay-email-input');
          if (!email || !email.value.includes('@')) {
            showToast('Parichay SSO Error', 'Please enter a valid government email address (@gov.in / @nic.in).', 'warning');
            return;
          }
          showToast('Parichay SSO Authorized', `Single Sign-On verified for ${email.value}.`, 'success');
        }

        sessionStorage.setItem('nlams_is_authenticated', 'true');
        sessionStorage.setItem('nlams_session_role', selectedRole);
        if (selectedRole === 'citizen') {
          let personaId = sessionStorage.getItem('nlams_citizen_persona');
          const devSelect = document.getElementById('dev-citizen-persona-select');
          if (devSelect && devSelect.value) {
            personaId = devSelect.value;
          }
          if (!personaId) {
            const u1 = document.getElementById('login-uid-1')?.value?.replace(/\D/g, '') || '';
            const u2 = document.getElementById('login-uid-2')?.value?.replace(/\D/g, '') || '';
            const u3 = document.getElementById('login-uid-3')?.value?.replace(/\D/g, '') || '';
            const fullUid = `${u1}${u2}${u3}`;
            if (fullUid.endsWith('8921') || fullUid === '984251748921') {
              personaId = 'MH-CIT-01';
            } else if (fullUid.endsWith('6534') || fullUid === '982143216534') {
              personaId = 'UP-CIT-01';
            } else {
              personaId = 'WB-CIT-01';
            }
          }
          store.setUserRole('citizen', personaId);
        } else {
          store.setUserRole(selectedRole);
        }
        updateActiveUserBadge(store.currentUser);
        if (window.NLAMS_API) {
          window.NLAMS_API.login(selectedRole);
          window.NLAMS_API.getProjects(selectedRole);
        }

        renderNavbar();

        store.currentUser.profileComplete = true;
        const roleConfig = ROLE_DASHBOARD_MAP[selectedRole] || ROLE_DASHBOARD_MAP['central-ministry'];
        showToast('Authentication Successful', `Logged in as ${store.currentUser.name} (${store.currentUser.badge}). Redirecting to ${roleConfig.dashboardName}...`, 'success');
        switchView(roleConfig.viewId, true);
      });
    }

    // Tab Switchers: Sign In vs New Registration
    const tabSignIn = document.getElementById('login-tab-signin');
    const tabRegister = document.getElementById('login-tab-register');
    const authForm = document.getElementById('nlams-auth-form');
    const regForm = document.getElementById('nlams-register-form');

    if (tabSignIn && tabRegister && authForm && regForm) {
      tabSignIn.addEventListener('click', () => {
        authForm.classList.remove('hidden');
        regForm.classList.add('hidden');
        tabSignIn.classList.add('bg-surface-container-lowest', 'text-primary', 'shadow-sm');
        tabSignIn.classList.remove('text-on-surface-variant');
        tabRegister.classList.remove('bg-surface-container-lowest', 'text-primary', 'shadow-sm');
        tabRegister.classList.add('text-on-surface-variant');
      });

      tabRegister.addEventListener('click', () => {
        authForm.classList.add('hidden');
        regForm.classList.remove('hidden');
        tabRegister.classList.add('bg-surface-container-lowest', 'text-primary', 'shadow-sm');
        tabRegister.classList.remove('text-on-surface-variant');
        tabSignIn.classList.remove('bg-surface-container-lowest', 'text-primary', 'shadow-sm');
        tabSignIn.classList.add('text-on-surface-variant');
      });

      regForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const userData = {
          name: document.getElementById('reg-name').value,
          role: document.getElementById('reg-role').value,
          dept: document.getElementById('reg-dept').value,
          jurisdiction: document.getElementById('reg-jurisdiction').value,
          email: document.getElementById('reg-email').value,
          mobile: document.getElementById('reg-mobile').value
        };

        const res = await window.NLAMS_API.registerUser(userData);
        if (res.ok) {
          showToast('Registration Completed', `Welcome ${userData.name}! Initializing official profile setup...`, 'success');
          openProfileSetupModal(userData.role);
        }
      });
    }

    // DigiLocker Login Button -> Authenticates as Citizen
    const digiBtn = document.getElementById('btn-digilocker-login');
    if (digiBtn) {
      digiBtn.addEventListener('click', () => {
        sessionStorage.setItem('nlams_is_authenticated', 'true');
        sessionStorage.setItem('nlams_session_role', 'citizen');
        store.setUserRole('citizen');
        updateActiveUserBadge(store.currentUser);
        if (window.NLAMS_API) {
          window.NLAMS_API.login('citizen');
          window.NLAMS_API.getCitizenParcels();
        }
        renderNavbar();

        showToast('MeriPehchaan SSO Connected', 'Fetched Aadhaar and Land Ownership token from DigiLocker repository.', 'info');
        switchView('view-citizen', true);
      });
    }

    // Isolated Dev-Only Persona Switcher (Only mounted if ?dev=true or ?dev_personas=true or #dev)
    function initDevPersonaSwitcher() {
      const isDev = new URLSearchParams(window.location.search).get('dev') === 'true' 
        || new URLSearchParams(window.location.search).get('dev_personas') === 'true'
        || window.location.hash.includes('dev');
      if (!isDev) return;
      if (document.getElementById('dev-persona-switcher')) return;

      const devBar = document.createElement('div');
      devBar.id = 'dev-persona-switcher';
      devBar.className = 'fixed bottom-4 right-4 z-[9999] bg-slate-900 text-slate-100 border border-slate-700 rounded-lg p-3 shadow-2xl text-xs space-y-1';
      devBar.innerHTML = `
        <div class="flex items-center justify-between gap-2 font-bold text-amber-400">
          <span class="flex items-center gap-1"><span class="material-symbols-outlined text-sm">terminal</span> DEV TEST ONLY</span>
          <button type="button" id="btn-close-dev-bar" class="hover:text-white">&times;</button>
        </div>
        <p class="text-[11px] text-slate-400">Persona override active (?dev=true)</p>
        <select id="dev-citizen-persona-select" class="w-full bg-slate-800 text-white rounded px-2 py-1 border border-slate-600 mt-1 cursor-pointer">
          <option value="WB-CIT-01">Subrata Ghosh (WB)</option>
          <option value="MH-CIT-01">Ramesh Patil (MH)</option>
          <option value="UP-CIT-01">Ram Swarup Yadav (UP)</option>
        </select>
      `;
      document.body.appendChild(devBar);

      document.getElementById('btn-close-dev-bar')?.addEventListener('click', () => {
        devBar.remove();
      });

      const devSelect = document.getElementById('dev-citizen-persona-select');
      devSelect?.addEventListener('change', () => {
        const pid = devSelect.value;
        sessionStorage.setItem('nlams_citizen_persona', pid);
        if (pid === 'WB-CIT-01' && uid1 && uid2 && uid3) {
          uid1.value = '9876'; uid2.value = '5432'; uid3.value = '1012';
        } else if (pid === 'MH-CIT-01' && uid1 && uid2 && uid3) {
          uid1.value = '9842'; uid2.value = '5174'; uid3.value = '8921';
        } else if (pid === 'UP-CIT-01' && uid1 && uid2 && uid3) {
          uid1.value = '9821'; uid2.value = '4321'; uid3.value = '6534';
        }
        validateAadhaarDigits();
      });
    }
    initDevPersonaSwitcher();
  }

  // 2. National Dashboard Render & Controllers
  function setupNationalDashboard() {
    const stateFilter = document.getElementById('nat-state-filter');
    const districtFilter = document.getElementById('nat-district-filter');
    const searchInput = document.getElementById('nat-search-projects-input');

    if (stateFilter) {
      stateFilter.addEventListener('change', () => {
        const selState = stateFilter.value;
        if (districtFilter) {
          populateDistricts(districtFilter, selState, true);
        }
        renderNationalProjectsTable(
          selState,
          districtFilter ? districtFilter.value : 'ALL',
          searchInput ? searchInput.value.trim().toLowerCase() : ''
        );
      });
    }

    if (districtFilter) {
      districtFilter.addEventListener('change', () => {
        renderNationalProjectsTable(
          stateFilter ? stateFilter.value : 'ALL',
          districtFilter.value,
          searchInput ? searchInput.value.trim().toLowerCase() : ''
        );
      });
    }

    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        renderNationalProjectsTable(
          stateFilter ? stateFilter.value : 'ALL',
          districtFilter ? districtFilter.value : 'ALL',
          e.target.value.trim().toLowerCase()
        );
      });
    }
  }

  function renderNationalDashboard() {
    const stats = store.getNationalStats();
    const landEl = document.getElementById('nat-stat-land');
    const projEl = document.getElementById('nat-stat-projects');
    const disbEl = document.getElementById('nat-stat-disbursed');
    const rehabEl = document.getElementById('nat-stat-rehab');

    if (landEl) landEl.textContent = stats.totalAcquiredHa;
    if (projEl) projEl.textContent = stats.activeProjectsCount;
    if (disbEl) disbEl.textContent = `₹${stats.compensationDisbursedCr}`;
    if (rehabEl) rehabEl.textContent = stats.familiesRehabilitated;
  }

  function renderNationalProjectsTable(filterState = 'ALL', filterDistrict = 'ALL', searchQuery = '') {
    const tbody = document.getElementById('nat-projects-table-body');
    if (!tbody) return;

    let filtered = [...store.projects];
    if (filterState !== 'ALL') {
      filtered = filtered.filter(p => p.state.toLowerCase() === filterState.toLowerCase());
    }
    if (filterDistrict !== 'ALL') {
      filtered = filtered.filter(p => p.district.toLowerCase().includes(filterDistrict.toLowerCase()));
    }
    if (searchQuery) {
      filtered = filtered.filter(p =>
        p.id.toLowerCase().includes(searchQuery) ||
        p.name.toLowerCase().includes(searchQuery) ||
        p.agency.toLowerCase().includes(searchQuery) ||
        p.sector.toLowerCase().includes(searchQuery) ||
        p.district.toLowerCase().includes(searchQuery) ||
        p.state.toLowerCase().includes(searchQuery)
      );
    }

    const badgeColors = {
      'Possession': 'bg-surface-container text-tertiary',
      'Awarded': 'bg-surface-container text-primary',
      'Notified': 'bg-surface-container-highest text-primary-container',
      'Scrutinized': 'bg-surface-container text-secondary',
      'Submitted': 'bg-surface-container-high text-on-surface-variant',
      'Closed': 'bg-surface-container text-tertiary'
    };

    tbody.innerHTML = filtered.map(p => {
      const badgeClass = badgeColors[p.stage] || 'bg-surface-container text-primary';
      return `
        <tr class="hover:bg-surface-container-lowest transition-colors">
          <td class="py-spacing-md px-spacing-md">
            <div class="flex flex-col">
              <div class="flex items-center gap-spacing-xs">
                <span class="font-label-md text-label-md font-bold text-on-surface">${p.name}</span>
                <span class="px-spacing-xs py-0.5 bg-surface-container-high text-primary rounded font-legal-code text-legal-code">${p.sector.split('/')[0]}</span>
              </div>
              <span class="font-legal-code text-legal-code text-on-surface-variant">${p.id} • ${p.currentMilestone}</span>
            </div>
          </td>
          <td class="py-spacing-md px-spacing-md">
            <div class="flex flex-col">
              <span class="font-label-md text-label-md font-bold text-primary">${p.state}</span>
              <span class="font-body-sm text-body-sm text-on-surface-variant">${p.district} (${p.division})</span>
            </div>
          </td>
          <td class="py-spacing-md px-spacing-md">
            <span class="px-spacing-sm py-1 bg-surface-container-low text-primary font-semibold text-label-sm rounded border border-outline-variant/30">
              ${p.agency}
            </span>
          </td>
          <td class="py-spacing-md px-spacing-md">
            <div class="flex flex-col">
              <span class="font-label-md text-label-md font-bold text-on-surface">${p.requiredLandHa} Ha</span>
              <span class="font-legal-code text-legal-code text-on-surface-variant">${p.khasraCount} Khasras</span>
            </div>
          </td>
          <td class="py-spacing-md px-spacing-md">
            <span class="inline-flex items-center gap-spacing-2xs px-spacing-sm py-spacing-2xs rounded font-label-sm text-label-sm font-bold uppercase tracking-wider ${badgeClass}">
              <span class="material-symbols-outlined text-[16px]">verified</span>
              ${p.statusBadge}
            </span>
          </td>
          <td class="py-spacing-md px-spacing-md">
            <div class="flex flex-col w-36">
              <div class="flex justify-between font-label-sm text-label-sm font-semibold">
                <span>₹${p.budgetCr} Cr</span>
                <span class="text-tertiary">${p.percentDisbursed}%</span>
              </div>
              <div class="w-full h-1.5 bg-surface-container-high rounded-full overflow-hidden mt-1">
                <div class="bg-tertiary-container h-full rounded-full" style="width: ${p.percentDisbursed}%"></div>
              </div>
              <span class="font-legal-code text-legal-code text-on-surface-variant mt-0.5">Disbursed: ₹${p.disbursedCr} Cr</span>
            </div>
          </td>
          <td class="py-spacing-md px-spacing-md text-right">
            <div class="flex items-center justify-end gap-spacing-xs">
              <button onclick="window.inspectProjectGIS('${p.id}')" class="p-1.5 text-on-surface-variant hover:text-primary hover:bg-surface-container rounded transition-colors" title="Inspect Cadastral GIS">
                <span class="material-symbols-outlined text-[18px]">map</span>
              </button>
              <button onclick="window.drillToState('${p.state}')" class="px-2 py-1 bg-surface-container hover:bg-primary hover:text-on-primary text-primary rounded font-label-sm text-xs font-bold transition-colors whitespace-nowrap" title="Drill into State Directorate">
                State View →
              </button>
            </div>
          </td>
        </tr>
      `;
    }).join('');

    if (window.i18n && typeof window.i18n.applyTranslations === 'function') {
      window.i18n.applyTranslations(tbody);
    }
  }

  // 3. Dynamic State Dashboard Controller (Fully Parameterized by State)
  function getStateAbbreviation(stateName) {
    if (!stateName) return 'WB';
    const map = {
      'West Bengal': 'WB',
      'Maharashtra': 'MS',
      'Gujarat': 'GJ',
      'Uttar Pradesh': 'UP',
      'Tamil Nadu': 'TN',
      'Rajasthan': 'RJ',
      'Karnataka': 'KA',
      'Andhra Pradesh': 'AP',
      'Telangana': 'TS',
      'Odisha': 'OD',
      'Madhya Pradesh': 'MP',
      'Punjab': 'PB',
      'Haryana': 'HR',
      'Bihar': 'BR',
      'Kerala': 'KL',
      'Assam': 'AS'
    };
    if (map[stateName]) return map[stateName];
    const words = stateName.split(' ');
    if (words.length > 1) return words.map(w => w[0]).join('').toUpperCase();
    return stateName.slice(0, 2).toUpperCase();
  }

  function getCurrentTargetState() {
    if (window.NLAMS_SELECTED_STATE) return window.NLAMS_SELECTED_STATE;
    const jur = store.currentUser?.jurisdiction || '';
    if (jur.includes('West Bengal')) return 'West Bengal';
    if (jur.includes('Maharashtra')) return 'Maharashtra';
    if (jur.includes('Gujarat')) return 'Gujarat';
    if (jur.includes('Uttar Pradesh')) return 'Uttar Pradesh';
    if (jur.includes('Tamil Nadu')) return 'Tamil Nadu';
    if (jur.includes('Rajasthan')) return 'Rajasthan';
    const cleaned = jur.replace(/State Directorate|State Government|Directorate|Apex Directorate|Cell|District/gi, '').trim();
    if (cleaned && cleaned !== 'National' && cleaned !== 'Central Ministry' && cleaned !== 'ALL') {
      return cleaned;
    }
    return 'West Bengal';
  }

  function updateStateDashboardHeaders(stateName) {
    const targetState = stateName || getCurrentTargetState();
    const abbr = getStateAbbreviation(targetState);

    // 1. Breadcrumb Portal Name
    const breadcrumbEl = document.getElementById('state-portal-breadcrumb');
    if (breadcrumbEl) {
      breadcrumbEl.textContent = `${targetState} State Land Acquisition & Requisition Portal (${abbr}-LARP)`;
    }

    // 2. Dashboard Title
    const titleEl = document.getElementById('state-dashboard-title');
    if (titleEl) {
      titleEl.textContent = `State Land Acquisition Operations Dashboard - ${targetState}`;
    }

    // 3. Subtitle (Native localized)
    const subtitleEl = document.getElementById('state-dashboard-subtitle');
    if (subtitleEl) {
      const subtitles = {
        'West Bengal': 'State Directorate of Land Acquisition & Revenue Management (West Bengal) • Land & Land Reforms Dept',
        'Maharashtra': 'State Directorate of Land Acquisition & Revenue (Government of Maharashtra) • Revenue & Forest Dept',
        'Gujarat': 'State Directorate of Land Acquisition (Government of Gujarat) • Revenue Dept',
        'Uttar Pradesh': 'State Land Acquisition & Revenue Directorate (Government of Uttar Pradesh) • Board of Revenue',
        'Tamil Nadu': 'Directorate of Land Acquisition & Land Administration (Government of Tamil Nadu)',
        'Rajasthan': 'State Land Acquisition & Revenue Directorate (Government of Rajasthan) • Board of Revenue'
      };
      subtitleEl.textContent = subtitles[targetState] || `State Directorate of Land Acquisition & Revenue Management (${targetState} Government)`;
      if (window.i18n && window.i18n.applyTranslations) {
        window.i18n.applyTranslations(subtitleEl.parentElement);
      }
    }

    // 4. District Filter Options
    const distFilter = document.getElementById('state-district-filter');
    if (distFilter) {
      const currentVal = distFilter.value;
      let optionsHtml = `<option value="ALL">All Districts (${targetState})</option>`;
      if (targetState === 'West Bengal') {
        optionsHtml += `
          <option value="Hooghly">Hooghly (EDFC & NH-319B)</option>
          <option value="Howrah">Howrah (Kona & Salap)</option>
          <option value="North 24 Parganas">North 24 Parganas (Barasat)</option>
          <option value="Kolkata">Kolkata Metropolitan (KMDA)</option>
          <option value="South 24 Parganas">South 24 Parganas (Alipore)</option>
          <option value="Paschim Bardhaman">Paschim Bardhaman (Asansol)</option>
          <option value="Purba Bardhaman">Purba Bardhaman</option>
          <option value="Nadia">Nadia (Krishnanagar)</option>
        `;
      } else if (targetState === 'Maharashtra') {
        optionsHtml += `
          <option value="Pune">Pune (Metro Line 3 & PMRDA)</option>
          <option value="Thane">Thane (High-Speed Rail)</option>
          <option value="Palghar">Palghar (Bullet Train Corridor)</option>
          <option value="Raigad">Raigad (DMIC Node)</option>
          <option value="Nashik">Nashik (Samruddhi Mahamarg)</option>
        `;
      } else {
        const stateProjects = store.projects.filter(p => p.state.toLowerCase() === targetState.toLowerCase());
        const uniqueDists = [...new Set(stateProjects.map(p => p.district))];
        uniqueDists.forEach(d => {
          optionsHtml += `<option value="${d}">${d}</option>`;
        });
      }
      distFilter.innerHTML = optionsHtml;
      if (currentVal && Array.from(distFilter.options).some(o => o.value === currentVal)) {
        distFilter.value = currentVal;
      }
    }

    // 5. Synchronize State Select Filter Dropdown
    const stateSelect = document.getElementById('state-select-filter');
    if (stateSelect) {
      for (let i = 0; i < stateSelect.options.length; i++) {
        if (stateSelect.options[i].value.toLowerCase() === targetState.toLowerCase()) {
          stateSelect.selectedIndex = i;
          break;
        }
      }
    }
  }

  function mountStateGIS(stateName) {
    const targetState = stateName || getCurrentTargetState();
    window.GISEngine.renderStateChoropleth('state-choropleth-mount', targetState, (district) => {
      const distFilter = document.getElementById('state-district-filter');
      if (distFilter) {
        for (let i = 0; i < distFilter.options.length; i++) {
          if (distFilter.options[i].value.toLowerCase() === district.toLowerCase()) {
            distFilter.selectedIndex = i;
            break;
          }
        }
      }
      renderStateProjectsTable(district);
      showToast(`Filtered by ${district}`, `Showing projects in ${district} district.`, 'info');
    });
  }

  function setupStateDashboard() {
    const targetState = getCurrentTargetState();
    const stateSelect = document.getElementById('state-select-filter');
    const distFilter = document.getElementById('state-district-filter');
    const searchInput = document.getElementById('search-projects-input');

    if (stateSelect) {
      if (Array.from(stateSelect.options).some(o => o.value.toLowerCase() === targetState.toLowerCase())) {
        stateSelect.value = targetState;
      }
      populateDistricts(distFilter, stateSelect.value, true);
      stateSelect.addEventListener('change', () => {
        const selState = stateSelect.value;
        window.NLAMS_SELECTED_STATE = selState;
        populateDistricts(distFilter, selState, true);
        updateStateDashboardHeaders(selState);
        mountStateGIS(selState);
        renderStateProjectsTable(
          distFilter ? distFilter.value : 'ALL',
          searchInput ? searchInput.value.toLowerCase() : '',
          selState
        );
      });
    }

    updateStateDashboardHeaders(targetState);
    mountStateGIS(targetState);

    if (distFilter) {
      distFilter.addEventListener('change', () => {
        const selState = stateSelect ? stateSelect.value : getCurrentTargetState();
        renderStateProjectsTable(distFilter.value, searchInput ? searchInput.value.toLowerCase() : '', selState);
      });
    }

    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        const selState = stateSelect ? stateSelect.value : getCurrentTargetState();
        renderStateProjectsTable(distFilter ? distFilter.value : 'ALL', e.target.value.toLowerCase(), selState);
      });
    }

    const newReqBtn = document.getElementById('btn-quick-new-req');
    if (newReqBtn) {
      newReqBtn.addEventListener('click', () => {
        switchView('view-agency');
      });
    }

    const syncBtn = document.getElementById('btn-state-sync');
    if (syncBtn) {
      syncBtn.addEventListener('click', () => {
        const state = getCurrentTargetState();
        showToast('PFMS Ledger Synchronization', `Synced ${state} District CALA bank accounts with State Treasury.`, 'success');
      });
    }

    const directiveBtn = document.getElementById('btn-issue-state-directive');
    if (directiveBtn) {
      directiveBtn.addEventListener('click', () => {
        const state = getCurrentTargetState();
        showToast('State Nodal Directive Issued', `Priority notice dispatched to ${state} Collectorates to complete survey within 14 days.`, 'warning');
      });
    }
  }

  function renderStateProjectsTable(filterDistrict = 'ALL', searchQuery = '', filterState = null) {
    const tbody = document.getElementById('state-projects-table-body');
    if (!tbody) return;

    const targetState = filterState || getCurrentTargetState();
    const stats = store.getStateStats(targetState);
    const disbEl = document.getElementById('state-stat-disbursed');
    const pendEl = document.getElementById('state-stat-pending');
    const haEl = document.getElementById('state-stat-ha');
    const famEl = document.getElementById('state-stat-families');
    const projCountEl = document.getElementById('state-active-proj-count');

    if (disbEl) disbEl.textContent = `₹${stats.disbursedCr} Cr (${stats.percentUtilized}%)`;
    if (pendEl) pendEl.textContent = `₹${stats.pendingCr} Cr`;
    if (haEl) haEl.textContent = `${stats.totalPossessedHa} Ha`;
    if (famEl) famEl.textContent = `${stats.familiesCount.toLocaleString('en-IN')} Families`;
    if (projCountEl) projCountEl.textContent = `${stats.totalProjects} Projects`;

    let filtered = store.projects.filter(p => p.state.toLowerCase() === targetState.toLowerCase());
    if (filtered.length === 0) { filtered = store.projects.filter(p => p.state.toLowerCase().includes(targetState.toLowerCase())); }
    if (filterDistrict !== 'ALL') {
      filtered = filtered.filter(p => p.district.toLowerCase().includes(filterDistrict.toLowerCase()));
    }
    if (searchQuery) {
      filtered = filtered.filter(p => 
        p.id.toLowerCase().includes(searchQuery) ||
        p.name.toLowerCase().includes(searchQuery) ||
        p.agency.toLowerCase().includes(searchQuery) ||
        p.district.toLowerCase().includes(searchQuery)
      );
    }

    const badgeColors = {
      'Possession': 'bg-surface-container text-tertiary',
      'Awarded': 'bg-surface-container text-primary',
      'Notified': 'bg-surface-container-highest text-primary-container',
      'Scrutinized': 'bg-surface-container text-secondary',
      'Submitted': 'bg-surface-container-high text-on-surface-variant',
      'Closed': 'bg-surface-container text-tertiary'
    };

    tbody.innerHTML = filtered.map(p => {
      const badgeClass = badgeColors[p.stage] || 'bg-surface-container text-primary';

      return `
        <tr class="hover:bg-surface-container-lowest transition-colors">
          <td class="py-spacing-md px-spacing-md">
            <div class="flex flex-col">
              <div class="flex items-center gap-spacing-xs">
                <span class="font-label-md text-label-md font-bold text-on-surface">${p.name}</span>
                <span class="px-spacing-xs py-0.5 bg-surface-container-high text-primary rounded font-legal-code text-legal-code">${p.agency}</span>
              </div>
              <span class="font-legal-code text-legal-code text-on-surface-variant">${p.id} • ${p.currentMilestone}</span>
            </div>
          </td>
          <td class="py-spacing-md px-spacing-md">
            <div class="flex flex-col">
              <span class="font-label-md text-label-md font-semibold text-on-surface">${p.district}</span>
              <span class="font-body-sm text-body-sm text-on-surface-variant">${p.division}</span>
            </div>
          </td>
          <td class="py-spacing-md px-spacing-md">
            <div class="flex flex-col">
              <span class="font-label-md text-label-md font-bold text-on-surface">${p.requiredLandHa} Ha</span>
              <span class="font-legal-code text-legal-code text-on-surface-variant">${p.khasraCount} Khasra Parcels</span>
            </div>
          </td>
          <td class="py-spacing-md px-spacing-md">
            <span class="inline-flex items-center gap-spacing-2xs px-spacing-sm py-spacing-2xs rounded font-label-sm text-label-sm font-bold uppercase tracking-wider ${badgeClass}">
              <span class="material-symbols-outlined text-[16px]">verified</span>
              ${p.statusBadge}
            </span>
          </td>
          <td class="py-spacing-md px-spacing-md">
            <div class="flex flex-col w-40">
              <div class="flex justify-between font-label-sm text-label-sm font-semibold">
                <span>₹${p.budgetCr} Cr</span>
                <span class="text-tertiary">${p.percentDisbursed}%</span>
              </div>
              <div class="w-full h-1.5 bg-surface-container-high rounded-full overflow-hidden mt-1">
                <div class="bg-tertiary-container h-full rounded-full" style="width: ${p.percentDisbursed}%"></div>
              </div>
              <span class="font-legal-code text-legal-code text-on-surface-variant mt-0.5">Disbursed: ₹${p.disbursedCr} Cr</span>
            </div>
          </td>
          <td class="py-spacing-md px-spacing-md">
            <div class="flex flex-col">
              <span class="font-label-sm text-label-sm font-semibold text-tertiary flex items-center gap-1">
                <span class="material-symbols-outlined text-[14px]">check_circle</span> ${p.slaStatus}
              </span>
              <span class="font-legal-code text-legal-code text-on-surface-variant">${p.gazetteDate}</span>
            </div>
          </td>
          <td class="py-spacing-md px-spacing-md text-right">
            <div class="flex items-center justify-end gap-spacing-xs">
              <button onclick="window.inspectProjectGIS('${p.id}')" class="p-1.5 text-on-surface-variant hover:text-primary hover:bg-surface-container rounded transition-colors" title="View GIS Cadastral Map">
                <span class="material-symbols-outlined text-[18px]">map</span>
              </button>
              <button onclick="window.openDSCModal('${p.id}')" class="px-2 py-1 bg-surface-container hover:bg-secondary hover:text-on-secondary text-secondary rounded font-label-sm text-xs font-bold transition-colors flex items-center gap-0.5 whitespace-nowrap" title="Digitally e-Sign Gazette with DSC">
                <span class="material-symbols-outlined text-[14px]">draw</span> Sign Gazette
              </button>
              <button onclick="window.advanceProjectPipeline('${p.id}')" class="px-2 py-1 bg-primary text-on-primary hover:bg-primary-container rounded font-label-sm text-xs font-bold transition-colors whitespace-nowrap" title="Advance Lifecycle Stage">
                Advance →
              </button>
            </div>
          </td>
        </tr>
      `;
    }).join('');

    if (window.i18n && typeof window.i18n.applyTranslations === 'function') {
      window.i18n.applyTranslations(tbody);
    }

    renderStateObjections(targetState);
  }

  function renderStateObjections(targetState) {
    const tableBody = document.getElementById('state-objections-table-body');
    const countBadge = document.getElementById('state-objection-pendency-count');
    if (!tableBody) return;

    const objections = store.objections || [];
    if (countBadge) {
      const pendingCount = objections.filter(o => {
        const st = (o.status || '').toLowerCase();
        return !st.includes('upheld') && !st.includes('reject') && !st.includes('dismiss');
      }).length;
      countBadge.textContent = `${pendingCount} PENDING HEARINGS`;
    }

    if (!objections.length) {
      tableBody.innerHTML = `
        <tr>
          <td colspan="6" class="py-6 text-center text-on-surface-variant font-body-sm">
            No active Section 15 hearing petitions registered in the State directory.
          </td>
        </tr>
      `;
      return;
    }

    tableBody.innerHTML = objections.map(o => {
      let statusBadge = `<span class="px-2 py-0.5 rounded text-xs font-bold bg-amber-100 dark:bg-amber-950/40 text-amber-800 dark:text-amber-200 border border-amber-300 dark:border-amber-800 flex items-center gap-1 w-fit"><span class="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span> ${o.status || 'Pending Hearing'}</span>`;
      const s = (o.status || '').toLowerCase();
      if (s.includes('upheld')) {
        statusBadge = `<span class="px-2 py-0.5 rounded text-xs font-bold bg-emerald-100 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-200 border border-emerald-300 dark:border-emerald-800 flex items-center gap-1 w-fit"><span class="material-symbols-outlined text-[14px]">check_circle</span> Upheld</span>`;
      } else if (s.includes('reject') || s.includes('dismiss')) {
        statusBadge = `<span class="px-2 py-0.5 rounded text-xs font-bold bg-rose-100 dark:bg-rose-950/40 text-rose-800 dark:text-rose-200 border border-rose-300 dark:border-rose-800 flex items-center gap-1 w-fit"><span class="material-symbols-outlined text-[14px]">cancel</span> Rejected</span>`;
      } else if (s.includes('scheduled') || s.includes('listed')) {
        statusBadge = `<span class="px-2 py-0.5 rounded text-xs font-bold bg-sky-100 dark:bg-sky-950/40 text-sky-800 dark:text-sky-200 border border-sky-300 dark:border-sky-800 flex items-center gap-1 w-fit"><span class="material-symbols-outlined text-[14px]">calendar_month</span> Scheduled</span>`;
      }

      return `
        <tr class="hover:bg-surface-container transition-colors border-b border-surface-container">
          <td class="py-spacing-sm px-spacing-md">
            <span class="font-bold text-primary font-legal-code text-sm block">${o.id}</span>
            <span class="text-xs text-on-surface-variant">${o.filingDate}</span>
          </td>
          <td class="py-spacing-sm px-spacing-md">
            <strong class="text-on-surface text-sm block">${o.claimant}</strong>
            <span class="text-xs text-secondary font-semibold">${o.projectId || 'Corridor REQ'}</span>
          </td>
          <td class="py-spacing-sm px-spacing-md">
            <span class="text-xs font-bold text-on-surface block">${o.khasraNo}</span>
            <span class="text-[11px] text-on-surface-variant">${o.parcelId}</span>
          </td>
          <td class="py-spacing-sm px-spacing-md">
            <span class="font-semibold text-xs text-primary block">${o.type}</span>
            <span class="text-xs text-on-surface-variant line-clamp-1" title="${o.grounds}">${o.grounds}</span>
          </td>
          <td class="py-spacing-sm px-spacing-md">
            ${statusBadge}
            <span class="text-[11px] text-on-surface-variant block mt-1">${o.hearingDate || 'Pending'}</span>
          </td>
          <td class="py-spacing-sm px-spacing-md">
            <span class="text-xs text-on-surface line-clamp-2 max-w-xs" title="${o.actionTaken || ''}">${o.actionTaken || 'Notice Issued'}</span>
          </td>
        </tr>
      `;
    }).join('');

    if (window.i18n && typeof window.i18n.applyTranslations === 'function') {
      window.i18n.applyTranslations(tableBody);
    }
  }

  // 4. District / CALA Dashboard Controller
  let activeSigningProjectId = 'REQ-WB-HGY-2023-0101';

  function setupDistrictDashboard() {
    const btnApprove = document.getElementById('btn-cala-approve');
    const btnAward = document.getElementById('btn-cala-award');
    const btnRework = document.getElementById('btn-cala-rework');
    const btnReject = document.getElementById('btn-cala-reject');
    const btnDisburse = document.getElementById('btn-cala-disburse');
    const btnPossession = document.getElementById('btn-cala-possession');
    const btnViewDossier = document.getElementById('btn-cala-view-dossier');
    const btnBulk = document.getElementById('btn-cala-bulk-action');
    const btnCalaRnr = document.getElementById('btn-cala-rnr');

    if (btnApprove) {
      btnApprove.addEventListener('click', async () => {
        const parcel = store.parcels.find(p => p.id === selectedParcelId || p.properties?.id === selectedParcelId);
        const props = parcel ? (parcel.properties || parcel) : null;
        if (props) {
          props.status = 'Scrutinized';
          props.statusLabel = 'Scrutiny Cleared (Sec 12)';
          props.statusColor = '#15803d';
        }
        await window.NLAMS_API.submitScrutinyDecision(selectedParcelId, 'APPROVE', 'Passed Bhulekh Validation & RoR Verification', store.currentUser.name);
        updateDocketView(selectedParcelId);
        renderDistrictCALAQueue();
        mountDistrictGIS();
        showToast('Scrutiny Cleared', `Cadastral verification approved for ${props?.gutNumber || selectedParcelId} under Section 12.`, 'success');
      });
    }

    if (btnRework) {
      btnRework.addEventListener('click', async () => {
        const reason = await showInAppPrompt(
          'Send Back Proposal for Statutory Rework',
          'Section 12 Requisition Scrutiny Desk',
          'Enter statutory discrepancy details for sending back proposal for rework:',
          'Update KML right-of-way corridor boundary and clarify non-agricultural mutation.'
        );
        if (reason) {
          const parcel = store.parcels.find(p => p.id === selectedParcelId || p.properties?.id === selectedParcelId);
          const props = parcel ? (parcel.properties || parcel) : null;
          if (props) {
            props.status = 'Rework';
            props.statusLabel = 'Returned for Rework';
            props.statusColor = '#ea580c';
          }
          await window.NLAMS_API.submitScrutinyDecision(selectedParcelId, 'SEND_BACK', reason, store.currentUser.name);
          updateDocketView(selectedParcelId);
          renderDistrictCALAQueue();
          mountDistrictGIS();
          showToast('Sent Back for Rework', `Requisition returned to Requiring Body for cadastral boundary revision.`, 'warning');
        }
      });
    }

    if (btnReject) {
      btnReject.addEventListener('click', async () => {
        const reason = await showInAppPrompt(
          'Statutory Proposal Rejection',
          'Section 7 Environmental & Feasibility Appraisal',
          'Enter grounds for statutory proposal rejection under Section 7:',
          'Proposal violates eco-sensitive buffer zone constraints and overlaps with protected forest land.'
        );
        if (reason) {
          const parcel = store.parcels.find(p => p.id === selectedParcelId || p.properties?.id === selectedParcelId);
          const props = parcel ? (parcel.properties || parcel) : null;
          if (props) {
            props.status = 'Rejected';
            props.statusLabel = 'Proposal Rejected (Sec 7)';
            props.statusColor = '#dc2626';
          }
          await window.NLAMS_API.submitScrutinyDecision(selectedParcelId, 'REJECT', reason, store.currentUser.name);
          updateDocketView(selectedParcelId);
          renderDistrictCALAQueue();
          mountDistrictGIS();
          showToast('Proposal Rejected', `Proposal rejected under Section 7: ${reason}`, 'error');
        }
      });
    }

    if (btnAward) {
      btnAward.addEventListener('click', async () => {
        const parcel = store.parcels.find(p => p.id === selectedParcelId || p.properties?.id === selectedParcelId);
        const props = parcel ? (parcel.properties || parcel) : null;
        if (props) {
          props.status = 'Awarded';
          props.statusLabel = 'Sec 3G Award Declared';
          props.statusColor = '#133e7c';
          props.dbtStatus = 'PFMS Order Generated (Disbursing)';
        }
        const targetProjId = props?.projectId || selectedParcelId;
        await window.NLAMS_API.declareAward(targetProjId);
        updateDocketView(selectedParcelId);
        renderDistrictCALAQueue();
        mountDistrictGIS();
        showToast('3G Statutory Award Declared', `Section 3G award declared for ${props?.gutNumber || selectedParcelId}. 100% Solatium & 12% interest determined.`, 'success');
      });
    }

    if (btnDisburse) {
      btnDisburse.addEventListener('click', () => {
        const parcel = store.parcels.find(p => p.id === selectedParcelId || p.properties?.id === selectedParcelId);
        const props = parcel ? (parcel.properties || parcel) : null;
        store.disburseCompensation(selectedParcelId);
        updateDocketView(selectedParcelId);
        renderDistrictCALAQueue();
        const utr = props?.dbtStatus || 'Credited';
        showToast('PFMS DBT Disbursed', `Compensation payment successfully pushed to PFMS bank gateway for ${props?.ownerName || 'Landowner'}. ${utr}`, 'success');
      });
    }

    if (btnCalaRnr) {
      btnCalaRnr.addEventListener('click', () => {
        const parcel = store.parcels.find(p => p.id === selectedParcelId || p.properties?.id === selectedParcelId);
        const projId = parcel ? (parcel.properties || parcel).projectId : 'REQ-WB-HGY-2023-0101';
        window.openRNRModal(projId);
      });
    }

    if (btnPossession) {
      btnPossession.addEventListener('click', () => {
        window.openPossessionChecklistModal(selectedParcelId);
      });
    }

    if (btnViewDossier) {
      btnViewDossier.addEventListener('click', () => {
        window.openDossierModal(selectedParcelId);
      });
    }

    if (btnBulk) {
      btnBulk.addEventListener('click', () => {
        store.parcels.forEach(p => {
          const props = p.properties || p;
          props.status = 'Possessed';
          props.statusLabel = 'Possessed / Title Vested';
          props.statusColor = '#15803d';
        });
        store.dispatch('POSSESSION_CONFIRMED', store.parcels[0]);
        updateDocketView(selectedParcelId);
        renderDistrictCALAQueue();
        mountDistrictGIS();
        showToast('Bulk Clearance Completed', 'All cadastral parcels cleared and title vested under Section 16.', 'success');
      });
    }
  }

  function mountDistrictGIS() {
    window.GISEngine.renderCadastralViewer('district-cadastral-gis-mount', selectedParcelId, (parcelId) => {
      selectedParcelId = parcelId;
      updateDocketView(parcelId);
      renderDistrictCALAQueue();
      mountDistrictGIS();
    });
  }

  function updateDocketView(parcelId) {
    const parcel = store.parcels.find(p => p.id === parcelId || p.properties?.id === parcelId);
    if (!parcel) return;
    const props = parcel.properties || parcel;

    const titleEl = document.getElementById('docket-gut-title');
    const projEl = document.getElementById('docket-project-name');
    const badgeEl = document.getElementById('docket-status-badge');
    const ownerEl = document.getElementById('docket-owner-name');
    const areaEl = document.getElementById('docket-area');
    const typeEl = document.getElementById('docket-type');
    const overlapEl = document.getElementById('docket-overlap');

    if (titleEl) titleEl.textContent = props.gutNumber;
    if (projEl) projEl.textContent = props.projectName;
    if (badgeEl) {
      badgeEl.textContent = (props.statusLabel || props.status || '').toUpperCase();
      if (props.status === 'Possessed' || props.status === 'Awarded') {
        badgeEl.className = 'font-label-sm text-label-sm font-bold px-spacing-sm py-0.5 rounded bg-tertiary-container text-on-tertiary-container';
      } else if (props.status === 'Scrutinized' || props.status === 'Scrutiny') {
        badgeEl.className = 'font-label-sm text-label-sm font-bold px-spacing-sm py-0.5 rounded bg-secondary-container text-on-secondary-container';
      } else if (props.status === 'Rework') {
        badgeEl.className = 'font-label-sm text-label-sm font-bold px-spacing-sm py-0.5 rounded bg-amber-100 text-amber-900 border border-amber-300';
      } else if (props.status === 'Rejected') {
        badgeEl.className = 'font-label-sm text-label-sm font-bold px-spacing-sm py-0.5 rounded bg-error-container text-on-error-container';
      }
    }
    if (ownerEl) ownerEl.textContent = props.ownerName;
    if (areaEl) areaEl.textContent = `${props.areaHa} Ha (${props.areaSqM} m²)`;
    if (typeEl) typeEl.textContent = props.landType;
    if (overlapEl) overlapEl.textContent = `${props.overlapPercent}% RoW`;

    const stateBreadcrumbEl = document.getElementById('district-breadcrumb-state');
    if (stateBreadcrumbEl) stateBreadcrumbEl.textContent = props.state || 'West Bengal';
    const deskBreadcrumbEl = document.getElementById('district-breadcrumb-desk');
    if (deskBreadcrumbEl) deskBreadcrumbEl.textContent = `${props.district || 'Hooghly'} District CALA Clearance Desk`;

    const docketDetails = document.getElementById('docket-parcel-details');
    if (docketDetails && window.i18n && typeof window.i18n.applyTranslations === 'function') {
      window.i18n.applyTranslations(docketDetails);
    }

    // Asynchronously fetch and render AI Litigation & Delay Risk Score from ML model
    const riskBadgeEl = document.getElementById('docket-risk-badge');
    const riskBarEl = document.getElementById('docket-risk-bar');
    const riskFactorsEl = document.getElementById('docket-risk-factors');

    if (window.NLAMS_API) {
      if (riskBadgeEl) {
        riskBadgeEl.textContent = 'EVALUATING...';
        riskBadgeEl.style.cssText = 'display: inline-block !important; padding: 2px 8px !important; border-radius: 4px !important; font-size: 11px !important; font-weight: 700 !important; background: #eaedff !important; color: #434750 !important; border: 1px solid #c3c6d2 !important;';
      }
      if (riskBarEl) riskBarEl.style.width = '20%';

      window.NLAMS_API.getRiskScore(props.id).then(res => {
        if (!res || !res.data) return;
        const data = res.data;
        const score = typeof data.risk_score === 'number' ? data.risk_score : 0.04;
        const level = (data.risk_level || 'Low').toUpperCase();
        const rawFactors = data.top_factors && data.top_factors.length ? data.top_factors : ['nominal_survey'];
        const factors = rawFactors.map(f => f.replace(/_/g, ' ')).join(', ');

        if (riskBadgeEl) {
          riskBadgeEl.textContent = `${level} RISK (${score.toFixed(2)})`;
          if (level === 'HIGH') {
            riskBadgeEl.style.cssText = 'display: inline-block !important; padding: 2px 8px !important; border-radius: 4px !important; font-size: 11px !important; font-weight: 700 !important; font-family: monospace !important; background: #fee2e2 !important; color: #991b1b !important; border: 1.5px solid #ef4444 !important;';
            if (riskBarEl) {
              riskBarEl.style.cssText = `height: 100% !important; background: #ef4444 !important; border-radius: 9999px !important; width: ${Math.min(100, Math.round(score * 100))}% !important; transition: width 0.5s ease !important;`;
            }
          } else if (level === 'MEDIUM') {
            riskBadgeEl.style.cssText = 'display: inline-block !important; padding: 2px 8px !important; border-radius: 4px !important; font-size: 11px !important; font-weight: 700 !important; font-family: monospace !important; background: #fef3c7 !important; color: #92400e !important; border: 1.5px solid #f59e0b !important;';
            if (riskBarEl) {
              riskBarEl.style.cssText = `height: 100% !important; background: #f59e0b !important; border-radius: 9999px !important; width: ${Math.min(100, Math.round(score * 100))}% !important; transition: width 0.5s ease !important;`;
            }
          } else {
            riskBadgeEl.style.cssText = 'display: inline-block !important; padding: 2px 8px !important; border-radius: 4px !important; font-size: 11px !important; font-weight: 700 !important; font-family: monospace !important; background: #d1fae5 !important; color: #065f46 !important; border: 1.5px solid #10b981 !important;';
            if (riskBarEl) {
              riskBarEl.style.cssText = `height: 100% !important; background: #10b981 !important; border-radius: 9999px !important; width: ${Math.max(4, Math.round(score * 100))}% !important; transition: width 0.5s ease !important;`;
            }
          }
        }

        if (riskFactorsEl) {
          riskFactorsEl.textContent = factors;
          riskFactorsEl.title = factors;
        }
      });
    }
  }

  function renderDistrictCALAQueue() {
    const listEl = document.getElementById('cala-parcels-list');
    if (!listEl) return;

    listEl.innerHTML = store.parcels.map(p => {
      const props = p.properties || p;
      const isHigh = props.status === 'Objection';
      const isMed = props.status === 'Scrutiny';
      const badgeStyle = isHigh 
        ? 'background: #fee2e2 !important; color: #991b1b !important; border: 1px solid #ef4444 !important;' 
        : (isMed 
            ? 'background: #fef3c7 !important; color: #92400e !important; border: 1px solid #f59e0b !important;' 
            : 'background: #d1fae5 !important; color: #065f46 !important; border: 1px solid #10b981 !important;');
      const riskText = isHigh ? 'HIGH RISK' : (isMed ? 'MED RISK' : 'LOW RISK');
      return `
        <div onclick="window.selectCALAParcel('${props.id}')" class="p-spacing-xs rounded bg-surface-container-low hover:bg-surface-container cursor-pointer flex items-center justify-between border border-outline-variant/30 transition-colors ${props.id === selectedParcelId ? 'border-primary bg-surface-container shadow-xs' : ''}">
          <div class="flex flex-col">
            <span class="font-label-sm text-label-sm font-bold text-on-surface">${props.gutNumber} • ${props.ownerName.split(' ')[0]}</span>
            <span class="text-legal-code font-legal-code text-on-surface-variant">${props.areaHa} Ha • ${props.statusLabel.slice(0, 20)}</span>
          </div>
          <div class="flex items-center gap-1.5">
            <span style="display: inline-block !important; padding: 2px 6px !important; border-radius: 4px !important; font-size: 10px !important; font-weight: 700 !important; font-family: monospace !important; ${badgeStyle}">
              ${riskText}
            </span>
            <span class="w-2.5 h-2.5 rounded-full" style="background-color: ${props.statusColor || '#15803d'}"></span>
          </div>
        </div>
      `;
    }).join('');

    if (window.i18n && typeof window.i18n.applyTranslations === 'function') {
      window.i18n.applyTranslations(listEl);
    }

    renderDistrictCALAObjections();
  }

  function renderDistrictCALAObjections() {
    const tableBody = document.getElementById('cala-objections-table-body');
    const countBadge = document.getElementById('cala-objections-count-badge');
    if (!tableBody) return;

    const objections = store.objections || [];
    if (countBadge) {
      const pendingCount = objections.filter(o => {
        const st = (o.status || '').toLowerCase();
        return !st.includes('upheld') && !st.includes('reject') && !st.includes('dismiss');
      }).length;
      countBadge.textContent = `${pendingCount} PENDING HEARINGS`;
    }

    if (!objections.length) {
      tableBody.innerHTML = `
        <tr>
          <td colspan="6" class="py-6 text-center text-on-surface-variant font-body-sm">
            No Section 15 objections registered for this CALA jurisdiction.
          </td>
        </tr>
      `;
      return;
    }

    tableBody.innerHTML = objections.map(o => {
      let statusBadge = `<span class="px-2 py-0.5 rounded text-xs font-bold bg-amber-100 dark:bg-amber-950/40 text-amber-800 dark:text-amber-200 border border-amber-300 dark:border-amber-800 flex items-center gap-1 w-fit"><span class="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span> ${o.status || 'Pending Hearing'}</span>`;
      const s = (o.status || '').toLowerCase();
      if (s.includes('upheld')) {
        statusBadge = `<span class="px-2 py-0.5 rounded text-xs font-bold bg-emerald-100 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-200 border border-emerald-300 dark:border-emerald-800 flex items-center gap-1 w-fit"><span class="material-symbols-outlined text-[14px]">check_circle</span> Upheld</span>`;
      } else if (s.includes('reject') || s.includes('dismiss')) {
        statusBadge = `<span class="px-2 py-0.5 rounded text-xs font-bold bg-rose-100 dark:bg-rose-950/40 text-rose-800 dark:text-rose-200 border border-rose-300 dark:border-rose-800 flex items-center gap-1 w-fit"><span class="material-symbols-outlined text-[14px]">cancel</span> Rejected</span>`;
      } else if (s.includes('scheduled') || s.includes('listed')) {
        statusBadge = `<span class="px-2 py-0.5 rounded text-xs font-bold bg-sky-100 dark:bg-sky-950/40 text-sky-800 dark:text-sky-200 border border-sky-300 dark:border-sky-800 flex items-center gap-1 w-fit"><span class="material-symbols-outlined text-[14px]">calendar_month</span> Scheduled</span>`;
      }

      return `
        <tr class="hover:bg-surface-container transition-colors border-b border-surface-container">
          <td class="py-spacing-sm px-spacing-md">
            <div class="flex flex-col">
              <span class="font-bold text-primary font-legal-code text-sm">${o.id}</span>
              <span class="text-xs text-on-surface-variant">${o.filingDate}</span>
            </div>
          </td>
          <td class="py-spacing-sm px-spacing-md">
            <div class="flex flex-col">
              <strong class="text-on-surface text-sm">${o.claimant}</strong>
              <span class="text-xs text-on-surface-variant">${o.khasraNo} (${o.parcelId})</span>
            </div>
          </td>
          <td class="py-spacing-sm px-spacing-md">
            <div class="flex flex-col max-w-xs">
              <span class="font-semibold text-xs text-secondary truncate">${o.type}</span>
              <span class="text-xs text-on-surface-variant line-clamp-2" title="${o.grounds}">${o.grounds}</span>
              ${o.documentName ? `<span class="text-[11px] text-primary flex items-center gap-0.5 mt-0.5"><span class="material-symbols-outlined text-[12px]">attachment</span> ${o.documentName}</span>` : ''}
            </div>
          </td>
          <td class="py-spacing-sm px-spacing-md">
            ${statusBadge}
            <span class="text-[11px] text-on-surface-variant block mt-1">Hearing: ${o.hearingDate || 'Pending Listing'}</span>
          </td>
          <td class="py-spacing-sm px-spacing-md">
            <span class="text-xs text-on-surface line-clamp-2 max-w-xs" title="${o.actionTaken || 'None'}">${o.actionTaken || 'CALA Notice Issued'}</span>
          </td>
          <td class="py-spacing-sm px-spacing-md text-right">
            <button onclick="window.openHearingOutcomeModal('${o.id}')" class="btn-record-outcome px-spacing-sm py-1 rounded bg-primary text-on-primary hover:bg-primary-container text-xs font-bold transition-all flex items-center gap-1 ml-auto shadow-xs whitespace-nowrap">
              <span class="material-symbols-outlined text-[14px]">gavel</span>
              Record Outcome
            </button>
          </td>
        </tr>
      `;
    }).join('');

    if (window.i18n && typeof window.i18n.applyTranslations === 'function') {
      window.i18n.applyTranslations(tableBody);
    }
  }

  // Profile Setup Modal helper
  function openProfileSetupModal(roleKey) {
    const modal = document.getElementById('modal-profile-setup');
    const nameEl = document.getElementById('profile-modal-name');
    const roleEl = document.getElementById('profile-modal-role');
    if (nameEl) nameEl.textContent = store.currentUser.name;
    if (roleEl) roleEl.textContent = store.currentUser.badge || roleKey;
    if (modal) {
      modal.classList.remove('hidden');
      if (window.i18n && typeof window.i18n.applyTranslations === 'function') {
        window.i18n.applyTranslations(modal);
      }
    }

    const form = document.getElementById('form-profile-setup');
    if (form) {
      form.onsubmit = async (e) => {
        e.preventDefault();
        const profileData = {
          designation: document.getElementById('profile-designation')?.value,
          dept: document.getElementById('profile-dept')?.value,
          jurisdiction: document.getElementById('profile-jurisdiction')?.value
        };
        await window.NLAMS_API.updateProfile(profileData);
        modal.classList.add('hidden');

        // Set session state
        sessionStorage.setItem('nlams_is_authenticated', 'true');
        sessionStorage.setItem('nlams_session_role', store.currentUser.role);
        updateActiveUserBadge(store.currentUser);
        renderNavbar();

        const roleConfig = ROLE_DASHBOARD_MAP[store.currentUser.role] || ROLE_DASHBOARD_MAP['central-ministry'];
        showToast('Profile Configured', `Official profile setup complete. Launching ${roleConfig.dashboardName}...`, 'success');
        switchView(roleConfig.viewId, true);
      };
    }
  }

  // Selected Map-Picker coordinates state
  let currentPickedCoords = { lat: 22.6865, lng: 88.2985 };
  let mapPickerInstance = null;

  function initMapPicker() {
    const btnOpenPicker = document.getElementById('btn-open-map-picker');
    const modalPicker = document.getElementById('modal-map-picker');
    const btnClosePicker = document.getElementById('btn-close-map-picker');
    const btnCancelPicker = document.getElementById('btn-cancel-map-picker');
    const btnConfirmPicker = document.getElementById('btn-confirm-map-picker');
    const coordsText = document.getElementById('map-picker-coords-text');
    const badgeCoords = document.getElementById('badge-selected-coords');

    if (btnOpenPicker && modalPicker) {
      btnOpenPicker.addEventListener('click', () => {
        modalPicker.classList.remove('hidden');
        setTimeout(() => {
          if (!mapPickerInstance && window.L) {
            mapPickerInstance = L.map('picker-leaflet-map').setView([currentPickedCoords.lat, currentPickedCoords.lng], 14);
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
              maxZoom: 18,
              attribution: '© OpenStreetMap | DoLR Cadastral GIS'
            }).addTo(mapPickerInstance);

            let marker = L.marker([currentPickedCoords.lat, currentPickedCoords.lng], { draggable: true }).addTo(mapPickerInstance);

            const updateCoords = (lat, lng) => {
              currentPickedCoords = { lat: +lat.toFixed(4), lng: +lng.toFixed(4) };
              if (coordsText) coordsText.textContent = `Lat: ${currentPickedCoords.lat}, Lng: ${currentPickedCoords.lng} (Custom RoW Corridor)`;
              if (badgeCoords) badgeCoords.textContent = `LAT: ${currentPickedCoords.lat} • LNG: ${currentPickedCoords.lng}`;
            };

            mapPickerInstance.on('click', (e) => {
              marker.setLatLng(e.latlng);
              updateCoords(e.latlng.lat, e.latlng.lng);
            });

            marker.on('dragend', (e) => {
              const pos = marker.getLatLng();
              updateCoords(pos.lat, pos.lng);
            });
          } else if (mapPickerInstance) {
            mapPickerInstance.invalidateSize();
          }
        }, 200);
      });

      const closePicker = () => modalPicker.classList.add('hidden');
      if (btnClosePicker) btnClosePicker.addEventListener('click', closePicker);
      if (btnCancelPicker) btnCancelPicker.addEventListener('click', closePicker);
      if (btnConfirmPicker) {
        btnConfirmPicker.addEventListener('click', () => {
          closePicker();
          showToast('Alignment Selected', `Selected coordinates set to Lat: ${currentPickedCoords.lat}, Lng: ${currentPickedCoords.lng}`, 'info');
        });
      }
    }
  }

  // 5. Implementing Agency Dashboard Controller
  function setupAgencyDashboard() {
    initMapPicker();

    // Dynamic file uploads
    const fileInput = document.getElementById('prop-file-upload-input');
    if (fileInput) {
      fileInput.addEventListener('change', (e) => {
        if (e.target.files && e.target.files.length > 0) {
          const fileName = e.target.files[0].name;
          showToast('Document Uploaded (v1.1)', `Securely archived ${fileName} in NLAMS Document Vault.`, 'success');
        }
      });
    }

    const propState = document.getElementById('prop-state');
    const propDistrict = document.getElementById('prop-district');

    if (propState && propDistrict) {
      populateDistricts(propDistrict, propState.value, false);
      propState.addEventListener('change', () => {
        populateDistricts(propDistrict, propState.value, false);
      });
    }

    const form = document.getElementById('form-new-proposal');
    if (form) {
      form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const data = {
          projectName: document.getElementById('prop-name').value,
          agency: document.getElementById('prop-agency').value,
          sector: document.getElementById('prop-sector').value,
          state: propState ? propState.value : 'Maharashtra',
          district: propDistrict ? propDistrict.value : 'Pune',
          requiredLandHa: document.getElementById('prop-land-ha').value,
          budgetCr: document.getElementById('prop-budget-cr').value,
          lat: currentPickedCoords.lat,
          lng: currentPickedCoords.lng,
          khasraCount: Math.floor(Math.random() * 200) + 40,
          affectedFamilies: Math.floor(Math.random() * 500) + 80
        };

        const res = await window.NLAMS_API.submitProposal(data, store.currentUser.name);
        if (res.ok) {
          showToast('Form 1 Submission Success', `Project ${res.data.id} registered with GIS location and forwarded to District CALA Scrutiny Queue!`, 'success');
          if (getUserRole() === 'dro-cala' || getUserRole() === 'central-ministry') {
            switchView('view-district');
          } else {
            showToast('Workflow Stage: CALA Queue', 'Proposal is under statutory scrutiny. Implementing Agency has no approval jurisdiction.', 'info');
          }
        }
      });
    }

    const submitSwitchBtn = document.getElementById('btn-switch-submit-form');
    if (submitSwitchBtn) {
      submitSwitchBtn.addEventListener('click', () => {
        const formBox = document.getElementById('proposal-form-container');
        if (formBox) {
          formBox.scrollIntoView({ behavior: 'smooth' });
          document.getElementById('prop-name').focus();
        }
      });
    }
  }

  // 6. Dynamic Citizen Dashboard Controller & Search
  function setupCitizenDashboard() {
    const searchInput = document.getElementById('cit-search-input');
    const searchBtn = document.getElementById('btn-cit-search');

    const executeSearch = () => {
      const q = (searchInput?.value || '').trim();
      if (!q) return;
      const user = store.currentUser || {};
      const userAadhaarLast4 = (user.ownerAadhaar || '').replace(/\D/g, '').slice(-4);

      // Scoped strictly to parcels legally owned by the authenticated citizen
      const ownedParcels = store.parcels.filter(p => {
        const props = p.properties || p;
        if (user.parcelId && props.id === user.parcelId) return true;
        if (props.ownerAadhaar && userAadhaarLast4 && props.ownerAadhaar.replace(/\D/g, '').endsWith(userAadhaarLast4)) return true;
        if (props.ownerName && user.name && props.ownerName.trim().toLowerCase() === user.name.trim().toLowerCase()) return true;
        return false;
      });

      const found = ownedParcels.find(p => {
        const props = p.properties || p;
        return (
          (props.gutNumber && props.gutNumber.toLowerCase().includes(q.toLowerCase())) ||
          (props.khasraNo && props.khasraNo.toLowerCase().includes(q.toLowerCase())) ||
          (props.village && props.village.toLowerCase().includes(q.toLowerCase())) ||
          props.id.toLowerCase().includes(q.toLowerCase())
        );
      });

      if (found) {
        const props = found.properties || found;
        selectedParcelId = props.id;
        renderCitizenParcel(props.id);
        showToast('Parcel Record Found', `Loaded record for ${props.gutNumber} (${props.village})`, 'success');
      } else {
        showToast('Access Restricted', `You do not have registered ownership or authority to view records for '${q}'. You can only track your own authenticated holdings.`, 'warning');
      }
    };

    if (searchBtn) searchBtn.addEventListener('click', executeSearch);
    if (searchInput) {
      searchInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          executeSearch();
        }
      });
    }

    // Section 15: Objection Form & Document Attachment
    let attachedDocName = '';
    const docInput = document.getElementById('obj-document');
    const docFileNameEl = document.getElementById('obj-doc-filename');
    if (docInput && docFileNameEl) {
      docInput.addEventListener('change', (e) => {
        if (e.target.files && e.target.files[0]) {
          attachedDocName = e.target.files[0].name;
          docFileNameEl.textContent = attachedDocName;
          docFileNameEl.classList.add('text-primary', 'font-bold');
        }
      });
    }

    const objForm = document.getElementById('form-file-objection');
    if (objForm) {
      objForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const type = document.getElementById('obj-type').value;
        const grounds = document.getElementById('obj-grounds').value;

        if (!grounds.trim()) {
          showToast('Validation Required', 'Please enter statement of grounds for objection under Section 15(1).', 'warning');
          return;
        }

        const parcel = store.parcels.find(p => (p.properties || p).id === selectedParcelId) || store.parcels[0];
        const props = parcel.properties || parcel;

        const newObj = store.fileObjection({
          parcelId: props.id,
          khasraNo: props.gutNumber,
          projectId: props.projectId,
          claimant: store.currentUser.name,
          type: type,
          grounds: grounds,
          documentName: attachedDocName || 'Land_Record_Valuation_Proof.pdf'
        });

        document.getElementById('obj-grounds').value = '';
        if (docFileNameEl) {
          docFileNameEl.textContent = 'Attach Land Records / Valuation Proof (.pdf, .jpg)';
          docFileNameEl.classList.remove('text-primary', 'font-bold');
        }
        if (docInput) docInput.value = '';
        attachedDocName = '';

        showToast('Section 15 Objection Filed', `Objection registered for ${props.gutNumber}. Ref: ${newObj.id}`, 'warning');
        renderCitizenObjections(props);
      });
    }
  }

  // Section 15: Render Citizen's Filed Objections & Hearing Status
  function renderCitizenObjections(props) {
    const listEl = document.getElementById('cit-objections-list');
    const badgeEl = document.getElementById('cit-objections-count-badge');
    if (!listEl) return;

    const parcelId = props.id;
    const khasra = props.gutNumber;
    const objs = (store.objections || []).filter(o => 
      o.parcelId === parcelId || 
      o.khasraNo === khasra ||
      (o.claimant && store.currentUser && o.claimant === store.currentUser.name)
    );

    if (badgeEl) {
      badgeEl.textContent = `${objs.length} Recorded`;
    }

    if (!objs.length) {
      listEl.innerHTML = `
        <div class="p-spacing-md bg-surface-container-low rounded-lg border border-outline-variant/30 text-center flex flex-col items-center justify-center gap-1 text-on-surface-variant">
          <span class="material-symbols-outlined text-secondary text-2xl">verified</span>
          <span class="font-label-sm font-semibold text-on-surface">No Objections Pending</span>
          <p class="text-xs">No Section 15 hearing objections filed for ${khasra}. Landowner may submit an objection below within 60 days of preliminary notification.</p>
        </div>
      `;
      return;
    }

    listEl.innerHTML = objs.map(o => {
      let statusBadge = `<span class="px-2 py-0.5 rounded text-xs font-bold bg-amber-100 dark:bg-amber-950/40 text-amber-800 dark:text-amber-200 border border-amber-300 dark:border-amber-800 flex items-center gap-1"><span class="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span> ${o.status || 'Pending Hearing'}</span>`;
      const s = (o.status || '').toLowerCase();
      if (s.includes('upheld')) {
        statusBadge = `<span class="px-2 py-0.5 rounded text-xs font-bold bg-emerald-100 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-200 border border-emerald-300 dark:border-emerald-800 flex items-center gap-1"><span class="material-symbols-outlined text-[14px]">check_circle</span> Upheld</span>`;
      } else if (s.includes('reject') || s.includes('dismiss')) {
        statusBadge = `<span class="px-2 py-0.5 rounded text-xs font-bold bg-rose-100 dark:bg-rose-950/40 text-rose-800 dark:text-rose-200 border border-rose-300 dark:border-rose-800 flex items-center gap-1"><span class="material-symbols-outlined text-[14px]">cancel</span> Rejected</span>`;
      } else if (s.includes('scheduled') || s.includes('listed')) {
        statusBadge = `<span class="px-2 py-0.5 rounded text-xs font-bold bg-sky-100 dark:bg-sky-950/40 text-sky-800 dark:text-sky-200 border border-sky-300 dark:border-sky-800 flex items-center gap-1"><span class="material-symbols-outlined text-[14px]">calendar_month</span> Scheduled</span>`;
      }

      return `
        <div class="p-spacing-sm bg-surface-container-low rounded-lg border border-outline-variant/30 flex flex-col gap-1.5 transition-all">
          <div class="flex items-start justify-between gap-2">
            <div>
              <span class="font-headline-sm text-sm font-bold text-primary flex items-center gap-1">
                <span class="material-symbols-outlined text-[16px] text-secondary">gavel</span>
                ${o.id} • ${o.type}
              </span>
              <span class="text-[11px] text-on-surface-variant">Filed on ${o.filingDate} • Holding: <strong>${o.khasraNo}</strong></span>
            </div>
            ${statusBadge}
          </div>

          <div class="text-xs text-on-surface bg-surface-container-lowest p-2 rounded border border-outline-variant/20 leading-relaxed">
            <strong>Grounds:</strong> ${o.grounds}
          </div>

          ${o.documentName ? `
            <div class="flex items-center gap-1 text-xs text-primary font-semibold">
              <span class="material-symbols-outlined text-[14px]">attachment</span>
              <span>Evidence: ${o.documentName}</span>
            </div>
          ` : ''}

          <div class="flex flex-wrap items-center justify-between text-[11px] pt-1 border-t border-surface-container text-on-surface-variant">
            <span>Hearing Date: <strong class="text-on-surface">${o.hearingDate || 'Pending Listing'}</strong></span>
            <span class="text-right">CALA Action: <strong class="text-secondary">${o.actionTaken || 'Notice Issued to Requiring Body'}</strong></span>
          </div>
        </div>
      `;
    }).join('');

    if (window.i18n && typeof window.i18n.applyTranslations === 'function') {
      window.i18n.applyTranslations(listEl);
    }
  }

  // Dynamic 8-Stage Citizen Milestone Journey
  function renderCitizenMilestones(props) {
    const listEl = document.getElementById('cit-milestones-list');
    const badgeEl = document.getElementById('cit-milestone-stage-badge');
    if (!listEl) return;

    const status = props.status; // 'Submitted', 'Scrutiny', 'Scrutinized', 'Notified', 'Awarded', 'Possessed', 'Closed'
    
    const userState = store.currentUser?.state || props.state || 'West Bengal';
    let rorDesc = 'Verified against State Digital Land Records (RoR)';
    if (userState === 'West Bengal' || props.state === 'West Bengal') {
      rorDesc = 'Verified against Banglarbhumi e-Bhuchitra RoR';
    } else if (userState === 'Maharashtra' || props.state === 'Maharashtra') {
      rorDesc = 'Verified against MahaBhumi 7/12 land records';
    } else if (userState === 'Uttar Pradesh' || props.state === 'Uttar Pradesh') {
      rorDesc = 'Verified against UP Bhulekh Khatauni records';
    }

    const stages = [
      { num: 1, name: 'Proposal Submission (Form 1)', desc: `${props.projectName} RoW Requisition Registered`, key: 'Submitted' },
      { num: 2, name: 'Digital Scrutiny & RoR Validation', desc: rorDesc, key: 'Scrutinized' },
      { num: 3, name: 'Section 11 & 19 Gazette Declaration', desc: `Statutory Gazette Published: ${props.gazetteRef || 'GSR 742(E)'}`, key: 'Notified' },
      { num: 4, name: 'Section 3G Award Declaration', desc: `₹${(props.totalCompensation/100000).toFixed(2)} Lakhs determined with 100% solatium`, key: 'Awarded' },
      { num: 5, name: 'Compensation DBT Disbursed', desc: props.dbtStatus || 'Aadhaar PFMS Direct Transfer', key: 'Disbursed' },
      { num: 6, name: 'R&R Model Colony Resettlement', desc: props.rrEntitlement || 'Section 31 housing plot & annuity grants', key: 'Resettled' },
      { num: 7, name: 'Physical Possession Handover', desc: 'Title vested under Section 16 of RFCTLARR Act', key: 'Possessed' },
      { num: 8, name: 'Statutory Project Closure & Archival', desc: 'Archived under SHA-256 cryptographic audit seal', key: 'Closed' }
    ];

    // Determine current progress level (1 to 8)
    let activeLevel = 1;
    if (status === 'Scrutiny' || status === 'Submitted') activeLevel = 1;
    else if (status === 'Scrutinized') activeLevel = 2;
    else if (status === 'Notified') activeLevel = 3;
    else if (status === 'Awarded') {
      activeLevel = props.dbtStatus && props.dbtStatus.includes('Credited') ? 5 : 4;
    }
    else if (status === 'Possessed') activeLevel = 7;
    else if (status === 'Closed') activeLevel = 8;

    if (badgeEl) {
      badgeEl.textContent = `Stage ${activeLevel} of 8: ${props.statusLabel}`;
    }

    listEl.innerHTML = stages.map(s => {
      let isCompleted = s.num < activeLevel || (s.num === activeLevel && (status === 'Possessed' || status === 'Closed'));
      let isCurrent = s.num === activeLevel && !(status === 'Possessed' || status === 'Closed');

      let iconStyle = isCompleted ? 'bg-tertiary text-on-tertiary font-bold' : (isCurrent ? 'bg-secondary text-on-secondary font-bold ring-2 ring-secondary/50 animate-pulse' : 'bg-surface-container-high text-on-surface-variant font-medium');
      let textStyle = isCompleted ? 'text-on-surface font-semibold' : (isCurrent ? 'text-primary font-bold' : 'text-on-surface-variant');

      return `
        <div class="flex items-start gap-spacing-sm transition-all">
          <span class="w-6 h-6 rounded-full flex items-center justify-center shrink-0 text-xs ${iconStyle}">
            ${isCompleted ? '✓' : s.num}
          </span>
          <div class="flex flex-col">
            <span class="${textStyle}">${s.name}</span>
            <span class="text-on-surface-variant text-xs">${s.desc}</span>
          </div>
        </div>
      `;
    }).join('');

    if (window.i18n && typeof window.i18n.applyTranslations === 'function') {
      window.i18n.applyTranslations(listEl);
    }
  }

  function renderCitizenParcel(parcelId) {
    const isAuth = isUserAuthenticated();
    const isCitizen = isAuth && store.currentUser?.role === 'citizen';
    let targetParcelId = parcelId;

    // If logged in as citizen, strictly lock to citizen's owned parcels
    if (isCitizen) {
      const user = store.currentUser || {};
      const userAadhaarLast4 = (user.ownerAadhaar || '').replace(/\D/g, '').slice(-4);
      const isOwned = store.parcels.some(p => {
        const pProps = p.properties || p;
        if (pProps.id === parcelId) {
          if (user.parcelId && user.parcelId === parcelId) return true;
          if (pProps.ownerAadhaar && userAadhaarLast4 && pProps.ownerAadhaar.replace(/\D/g, '').endsWith(userAadhaarLast4)) return true;
          if (pProps.ownerName && user.name && pProps.ownerName.trim().toLowerCase() === user.name.trim().toLowerCase()) return true;
        }
        return false;
      });
      targetParcelId = (parcelId && isOwned) ? parcelId : (user.parcelId || null);
    }

    if (!targetParcelId) {
      return;
    }

    // Dynamic parcel lookup
    let parcel = store.parcels.find(p => (p.properties || p).id === targetParcelId);
    if (!parcel && isCitizen && store.currentUser.parcelId) {
      parcel = store.parcels.find(p => (p.properties || p).id === store.currentUser.parcelId);
    }
    if (!parcel) {
      return;
    }
    const props = parcel.properties || parcel;
    selectedParcelId = props.id;

    const user = store.currentUser;
    const isOwnerOfParcel = user && (user.name === props.ownerName || user.parcelId === props.id);

    // 1. Top Right Citizen Card (Single Consistent Identity)
    const cardNameEl = document.getElementById('cit-card-user-name');
    const cardAadhaarEl = document.getElementById('cit-card-aadhaar');
    if (cardNameEl) cardNameEl.textContent = user.name || props.ownerName;
    if (cardAadhaarEl) {
      const masked = user.maskedAadhaar || props.ownerAadhaar || '•••• •••• ' + (user.ownerAadhaar || '1012').slice(-4);
      cardAadhaarEl.textContent = `Aadhaar: ${masked} (Verified)`;
    }

    // 2. Authenticated Landowner Verified Banner (Strict Consistency)
    const bannerNameEl = document.getElementById('cit-banner-user-name');
    const bannerUidEl = document.getElementById('cit-banner-uid-info');
    const bannerHoldingEl = document.getElementById('cit-banner-holding');

    if (bannerNameEl) bannerNameEl.textContent = user.name || props.ownerName;
    if (bannerUidEl) {
      const masked = user.maskedAadhaar || props.ownerAadhaar || '•••• •••• ' + (user.ownerAadhaar || '1012').slice(-4);
      const mobile = user.maskedMobile || user.ownerMobile || props.ownerMobile || '+91 ••••• ••418';
      const docType = user.landRecordDoc || (props.state === 'West Bengal' ? 'Banglarbhumi Verified Patta Holder' : 'DigiLocker Verified Patta Holder');
      bannerUidEl.innerHTML = `UID: <strong>${masked}</strong> • ${docType} • Registered Mobile: ${mobile}`;
    }
    if (bannerHoldingEl) {
      const holding = user.holdingRef || `${props.gutNumber} (${props.khasraNo || props.gutNumber}) • ${props.village}`;
      bannerHoldingEl.textContent = holding;
    }

    // 3. Search Input
    const searchInput = document.getElementById('cit-search-input');
    if (searchInput && (!searchInput.value || searchInput.value.includes('Gut No. 142/1') || isOwnerOfParcel)) {
      searchInput.value = props.gutNumber;
    }

    // 4. Active Land Parcel Status Card
    const titleEl = document.getElementById('cit-gut-title');
    const statusPill = document.getElementById('cit-status-pill');
    const projEl = document.getElementById('cit-project-name');
    const areaEl = document.getElementById('cit-area');
    const typeEl = document.getElementById('cit-type');
    const valEl = document.getElementById('cit-total-val');
    const calcMarketVal = document.getElementById('cit-calc-market-val');
    const calcSolatium = document.getElementById('cit-calc-solatium');
    const calcInterest = document.getElementById('cit-calc-interest');
    const calcFinalEl = document.getElementById('cit-calc-final');
    const dbtDescEl = document.getElementById('cit-dbt-desc');
    const pillsContainer = document.getElementById('cit-parcel-pills');

    if (titleEl) titleEl.textContent = props.gutNumber;
    if (statusPill) {
      statusPill.textContent = (props.statusLabel || props.status || 'POSSESSED').toUpperCase();
      statusPill.style.backgroundColor = props.statusColor || '#15803d';
      statusPill.style.color = '#ffffff';
    }
    if (projEl) projEl.textContent = `${props.projectName} (${props.village} Sector)`;
    if (areaEl) areaEl.textContent = `${props.areaHa} Ha`;
    if (typeEl) typeEl.textContent = props.landType;
    if (valEl) valEl.textContent = `₹${(props.totalCompensation / 100000).toFixed(2)} L`;

    const halfVal = Math.round(props.totalCompensation / 2);
    const intVal = Math.round(props.totalCompensation * 0.12 / 2.12);
    if (calcMarketVal) calcMarketVal.textContent = `₹${halfVal.toLocaleString('en-IN')}`;
    if (calcSolatium) calcSolatium.textContent = `+ ₹${halfVal.toLocaleString('en-IN')}`;
    if (calcInterest) calcInterest.textContent = `+ ₹${intVal.toLocaleString('en-IN')} (Included)`;
    if (calcFinalEl) calcFinalEl.textContent = `₹${props.totalCompensation.toLocaleString('en-IN')}`;

    if (dbtDescEl) {
      const bank = user.bankAccount || (props.state === 'West Bengal' ? 'Punjab National Bank A/c •••• 5012' : 'SBI A/c •••• 4120');
      const utr = user.utrNumber || props.dbtStatus || 'UTR: #SBINWB2408912 on 18-Oct-2024';
      dbtDescEl.textContent = `Amount of ₹${props.totalCompensation.toLocaleString('en-IN')} credited to ${bank} via PFMS Treasury Node. ${utr}`;
    }

    // 5. Quick Select Pills (strictly scoped to authenticated citizen's owned parcels)
    if (pillsContainer) {
      const userAadhaarLast4 = user.ownerAadhaar ? user.ownerAadhaar.replace(/\D/g, '').slice(-4) : '';
      const citizenParcels = store.parcels.filter(p => {
        const pProps = p.properties || p;
        if (user.parcelId && pProps.id === user.parcelId) return true;
        if (pProps.ownerAadhaar && userAadhaarLast4 && pProps.ownerAadhaar.replace(/\D/g, '').endsWith(userAadhaarLast4)) return true;
        if (pProps.ownerName && user.name && pProps.ownerName.trim().toLowerCase() === user.name.trim().toLowerCase()) return true;
        return false;
      });

      pillsContainer.innerHTML = citizenParcels.map(p => {
        const pProps = p.properties || p;
        const isSelected = pProps.id === selectedParcelId;
        return `
          <button onclick="window.selectCitizenParcel('${pProps.id}')" class="px-2 py-0.5 rounded text-xs font-bold transition-all border ${isSelected ? 'bg-primary text-on-primary border-primary' : 'bg-surface-container-low text-on-surface hover:bg-surface-container border-outline-variant/40'}">
            ${pProps.gutNumber}
          </button>
        `;
      }).join('');
    }



    // 6. Dynamic Milestones & Filed Objections Status
    renderCitizenMilestones(props);
    renderCitizenObjections(props);

    if (window.i18n && typeof window.i18n.applyTranslations === 'function') {
      const citPortal = document.getElementById('portal-citizen') || document.getElementById('view-citizen');
      if (citPortal) window.i18n.applyTranslations(citPortal);
    }
  }

  window.selectCitizenParcel = function(parcelId) {
    const isAuth = isUserAuthenticated();
    const isCitizen = isAuth && store.currentUser?.role === 'citizen';
    if (isCitizen) {
      const user = store.currentUser || {};
      const userAadhaarLast4 = (user.ownerAadhaar || '').replace(/\D/g, '').slice(-4);
      const isOwned = store.parcels.some(p => {
        const pProps = p.properties || p;
        if (pProps.id === parcelId) {
          if (user.parcelId && user.parcelId === parcelId) return true;
          if (pProps.ownerAadhaar && userAadhaarLast4 && pProps.ownerAadhaar.replace(/\D/g, '').endsWith(userAadhaarLast4)) return true;
          if (pProps.ownerName && user.name && pProps.ownerName.trim().toLowerCase() === user.name.trim().toLowerCase()) return true;
        }
        return false;
      });
      if (!isOwned) {
        showToast('Access Denied', 'You do not have authorization to view cadastral records belonging to another landowner.', 'error');
        return;
      }
    }
    renderCitizenParcel(parcelId);
  };

  // ========================================================
  // 7. STATUTORY MODALS SYSTEM: DSC SIGNING, DOSSIER & POSSESSION
  // ========================================================
  function setupModals() {
    // --- 7A. DSC Gazette e-Sign Modal ---
    window.openDSCModal = function(projectId) {
      const proj = store.projects.find(p => p.id === projectId) || store.projects[0];
      activeSigningProjectId = proj.id;

      const titleEl = document.getElementById('dsc-project-title');
      const metaEl = document.getElementById('dsc-project-meta');
      const nameEl = document.getElementById('dsc-signatory-name');

      if (titleEl) titleEl.textContent = proj.name;
      if (metaEl) metaEl.textContent = `${proj.id} • ${proj.district} District • ${proj.agency}`;
      if (nameEl) nameEl.textContent = store.currentUser.name;

      const modal = document.getElementById('modal-dsc-sign');
      if (modal) {
        modal.classList.remove('hidden');
        if (window.i18n && typeof window.i18n.applyTranslations === 'function') {
          window.i18n.applyTranslations(modal);
        }
      }
    };

    const closeDscBtn = document.getElementById('btn-close-dsc-modal');
    const cancelDscBtn = document.getElementById('btn-cancel-dsc');
    if (closeDscBtn) closeDscBtn.addEventListener('click', () => document.getElementById('modal-dsc-sign')?.classList.add('hidden'));
    if (cancelDscBtn) cancelDscBtn.addEventListener('click', () => document.getElementById('modal-dsc-sign')?.classList.add('hidden'));

    const dscForm = document.getElementById('form-dsc-sign');
    if (dscForm) {
      dscForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const pin = document.getElementById('dsc-token-pin')?.value;
        const ref = document.getElementById('dsc-gazette-ref')?.value;

        const res = await window.NLAMS_API.signGazetteNotification(activeSigningProjectId, pin, ref, store.currentUser.name);
        if (res.ok) {
          document.getElementById('modal-dsc-sign')?.classList.add('hidden');
          showToast('Gazette Digitally Signed', `Statutory Notification [${ref}] attested with DSC Certificate under IT Act 2000.`, 'success');
          renderNationalProjectsTable();
          renderStateProjectsTable();
        } else {
          showToast('DSC Signature Rejected', res.message, 'warning');
        }
      });
    }

    // --- 7B. Case Scrutiny Dossier Modal ---
    window.openDossierModal = function(parcelId) {
      selectedParcelId = parcelId || selectedParcelId;
      const parcel = store.parcels.find(p => p.id === selectedParcelId || p.properties?.id === selectedParcelId) || store.parcels[2];
      const props = parcel.properties || parcel;

      const modalTitle = document.getElementById('dossier-modal-title');
      const modalMeta = document.getElementById('dossier-modal-meta');

      if (modalTitle) modalTitle.textContent = `Dossier Inspection: ${props.gutNumber}`;
      if (modalMeta) modalMeta.textContent = `${props.projectName} • ${props.khasraNo} • ${props.village} Village`;

      // Reset to first tab
      switchDossierTab('form1');

      // Populate AI Risk Model tab in Dossier
      if (window.NLAMS_API) {
        window.NLAMS_API.getRiskScore(props.id).then(res => {
          if (!res || !res.data) return;
          const data = res.data;
          const score = typeof data.risk_score === 'number' ? data.risk_score : 0.04;
          const level = (data.risk_level || 'Low').toUpperCase();

          const scoreValEl = document.getElementById('dossier-risk-score-val');
          const delayValEl = document.getElementById('dossier-risk-delay-val');
          const levelBadgeEl = document.getElementById('dossier-risk-level-badge');
          const factorsListEl = document.getElementById('dossier-risk-factors-list');

          if (scoreValEl) scoreValEl.textContent = `${score.toFixed(2)} / 1.00`;
          if (delayValEl) {
            if (level === 'HIGH') delayValEl.textContent = 'High Delay (>180 days litigation)';
            else if (level === 'MEDIUM') delayValEl.textContent = 'Moderate (60-120 days scrutiny)';
            else delayValEl.textContent = 'Minimal (<30 days clearance)';
          }

          if (levelBadgeEl) {
            levelBadgeEl.textContent = `${level} RISK`;
            if (level === 'HIGH') {
              levelBadgeEl.className = 'px-2.5 py-1 rounded font-legal-code text-xs font-bold bg-red-100 text-red-800 border border-red-300';
            } else if (level === 'MEDIUM') {
              levelBadgeEl.className = 'px-2.5 py-1 rounded font-legal-code text-xs font-bold bg-amber-100 text-amber-800 border border-amber-300';
            } else {
              levelBadgeEl.className = 'px-2.5 py-1 rounded font-legal-code text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300';
            }
          }

          if (factorsListEl && data.top_factors) {
            factorsListEl.innerHTML = data.top_factors.map(f => `
              <span class="px-2.5 py-1 bg-surface-container rounded border border-outline-variant/30 text-on-surface font-semibold flex items-center gap-1">
                <span class="material-symbols-outlined text-[14px] text-secondary">analytics</span>
                ${f.replace(/_/g, ' ')}
              </span>
            `).join('');
          }
        });
      }

      const modal = document.getElementById('modal-scrutiny-dossier');
      if (modal) {
        modal.classList.remove('hidden');
        if (window.i18n && typeof window.i18n.applyTranslations === 'function') {
          window.i18n.applyTranslations(modal);
        }
      }
    };

    const closeDossierBtn = document.getElementById('btn-close-dossier-modal');
    const cancelDossierBtn = document.getElementById('btn-dossier-close');
    if (closeDossierBtn) closeDossierBtn.addEventListener('click', () => document.getElementById('modal-scrutiny-dossier')?.classList.add('hidden'));
    if (cancelDossierBtn) cancelDossierBtn.addEventListener('click', () => document.getElementById('modal-scrutiny-dossier')?.classList.add('hidden'));

    // Dossier Tab switching
    const dossierTabBtns = document.querySelectorAll('.dossier-tab-btn');
    dossierTabBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const tabKey = btn.getAttribute('data-dossier-tab');
        switchDossierTab(tabKey);
      });
    });

    function switchDossierTab(tabKey) {
      dossierTabBtns.forEach(b => {
        if (b.getAttribute('data-dossier-tab') === tabKey) {
          b.classList.add('active-dossier-tab', 'border-primary', 'text-primary');
          b.classList.remove('border-transparent', 'text-on-surface-variant');
        } else {
          b.classList.remove('active-dossier-tab', 'border-primary', 'text-primary');
          b.classList.add('border-transparent', 'text-on-surface-variant');
        }
      });

      const panes = document.querySelectorAll('.dossier-tab-pane');
      panes.forEach(p => p.classList.add('hidden'));
      const activePane = document.getElementById(`dossier-tab-content-${tabKey}`);
      if (activePane) activePane.classList.remove('hidden');
    }

    // Dossier Actions: Approve, Reject, Send-Back
    const dossierApproveBtn = document.getElementById('btn-dossier-approve');
    const dossierReworkBtn = document.getElementById('btn-dossier-rework');
    const dossierRejectBtn = document.getElementById('btn-dossier-reject');

    if (dossierApproveBtn) {
      dossierApproveBtn.addEventListener('click', async () => {
        const remarks = document.getElementById('dossier-decision-remarks')?.value || 'Bhulekh RoR Verified & Approved';
        const parcel = store.parcels.find(p => p.id === selectedParcelId || p.properties?.id === selectedParcelId);
        const props = parcel ? (parcel.properties || parcel) : null;
        if (props) {
          props.status = 'Scrutinized';
          props.statusLabel = 'Scrutiny Cleared (Sec 12)';
          props.statusColor = '#15803d';
        }
        await window.NLAMS_API.submitScrutinyDecision(selectedParcelId, 'APPROVE', remarks, store.currentUser.name);
        document.getElementById('modal-scrutiny-dossier')?.classList.add('hidden');
        updateDocketView(selectedParcelId);
        renderDistrictCALAQueue();
        mountDistrictGIS();
        showToast('Scrutiny Dossier Approved', `Dossier approved for ${props?.gutNumber || selectedParcelId}.`, 'success');
      });
    }

    if (dossierReworkBtn) {
      dossierReworkBtn.addEventListener('click', async () => {
        const remarks = document.getElementById('dossier-decision-remarks')?.value || 'KML alignment boundary discrepancy. Returned for revision.';
        const parcel = store.parcels.find(p => p.id === selectedParcelId || p.properties?.id === selectedParcelId);
        const props = parcel ? (parcel.properties || parcel) : null;
        if (props) {
          props.status = 'Rework';
          props.statusLabel = 'Returned for Rework';
          props.statusColor = '#ea580c';
        }
        await window.NLAMS_API.submitScrutinyDecision(selectedParcelId, 'SEND_BACK', remarks, store.currentUser.name);
        document.getElementById('modal-scrutiny-dossier')?.classList.add('hidden');
        updateDocketView(selectedParcelId);
        renderDistrictCALAQueue();
        mountDistrictGIS();
        showToast('Dossier Sent Back', `Dossier returned for revision: ${remarks}`, 'warning');
      });
    }

    if (dossierRejectBtn) {
      dossierRejectBtn.addEventListener('click', async () => {
        const remarks = document.getElementById('dossier-decision-remarks')?.value || 'Statutory grounds: Violates Section 7 environmental baseline.';
        const parcel = store.parcels.find(p => p.id === selectedParcelId || p.properties?.id === selectedParcelId);
        const props = parcel ? (parcel.properties || parcel) : null;
        if (props) {
          props.status = 'Rejected';
          props.statusLabel = 'Proposal Rejected (Sec 7)';
          props.statusColor = '#dc2626';
        }
        await window.NLAMS_API.submitScrutinyDecision(selectedParcelId, 'REJECT', remarks, store.currentUser.name);
        document.getElementById('modal-scrutiny-dossier')?.classList.add('hidden');
        updateDocketView(selectedParcelId);
        renderDistrictCALAQueue();
        mountDistrictGIS();
        showToast('Dossier Rejected', `Dossier rejected under Section 7: ${remarks}`, 'error');
      });
    }

    // --- 7C. Field Possession Verification Checklist Modal ---
    window.openPossessionChecklistModal = function(parcelId) {
      selectedParcelId = parcelId || selectedParcelId;
      const parcel = store.parcels.find(p => p.id === selectedParcelId || p.properties?.id === selectedParcelId) || store.parcels[2];
      const props = parcel.properties || parcel;

      const titleEl = document.getElementById('chk-parcel-title');
      if (titleEl) titleEl.textContent = `${props.gutNumber} (${props.areaHa} Ha • ${props.village})`;

      // Reset checkboxes
      const checkboxes = document.querySelectorAll('.possession-check');
      checkboxes.forEach(c => c.checked = false);

      const confirmBtn = document.getElementById('btn-confirm-possession-final');
      if (confirmBtn) {
        confirmBtn.disabled = true;
        confirmBtn.classList.add('opacity-50', 'cursor-not-allowed');
      }

      const modal = document.getElementById('modal-possession-checklist');
      if (modal) {
        modal.classList.remove('hidden');
        if (window.i18n && typeof window.i18n.applyTranslations === 'function') {
          window.i18n.applyTranslations(modal);
        }
      }
    };

    const closePossBtn = document.getElementById('btn-close-possession-modal');
    const cancelPossBtn = document.getElementById('btn-cancel-possession');
    if (closePossBtn) closePossBtn.addEventListener('click', () => document.getElementById('modal-possession-checklist')?.classList.add('hidden'));
    if (cancelPossBtn) cancelPossBtn.addEventListener('click', () => document.getElementById('modal-possession-checklist')?.classList.add('hidden'));

    // Enable button only when all 4 checkboxes are ticked
    const possessionCheckboxes = document.querySelectorAll('.possession-check');
    possessionCheckboxes.forEach(chk => {
      chk.addEventListener('change', () => {
        const allChecked = Array.from(possessionCheckboxes).every(c => c.checked);
        const confirmBtn = document.getElementById('btn-confirm-possession-final');
        if (confirmBtn) {
          confirmBtn.disabled = !allChecked;
          if (allChecked) {
            confirmBtn.classList.remove('opacity-50', 'cursor-not-allowed');
          } else {
            confirmBtn.classList.add('opacity-50', 'cursor-not-allowed');
          }
        }
      });
    });

    const possForm = document.getElementById('form-possession-checklist');
    if (possForm) {
      possForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const officerName = document.getElementById('possession-officer-name')?.value || store.currentUser.name;
        const checklist = {
          dgpsPegging: document.getElementById('chk-possession-dgps')?.checked,
          treeCropValuation: document.getElementById('chk-possession-trees')?.checked,
          structureVacated: document.getElementById('chk-possession-structures')?.checked,
          form3ECertificate: document.getElementById('chk-possession-form3e')?.checked
        };

        await window.NLAMS_API.verifyAndConfirmPossession(selectedParcelId, checklist, officerName);
        document.getElementById('modal-possession-checklist')?.classList.add('hidden');
        showToast('Title Vested in State', `All 4 statutory checklist points verified. Land title vested under RFCTLARR Section 16.`, 'success');
        updateDocketView(selectedParcelId);
        renderDistrictCALAQueue();
        mountDistrictGIS();
      });
    }

    // --- 7D. Statutory R&R Resettlement Modal ---
    window.openRNRModal = function(projectId) {
      const proj = store.projects.find(p => p.id === projectId) || store.projects[0];
      const titleEl = document.getElementById('rnr-project-title');
      if (titleEl && proj) titleEl.textContent = `${proj.name} (${proj.district})`;
      const famInput = document.getElementById('rnr-families-count');
      if (famInput && proj) famInput.value = proj.affectedFamilies || 120;

      // Populate family-by-family R&R docket table
      const tbody = document.getElementById('rnr-families-tbody');
      if (tbody && store.rnrFamilies) {
        tbody.innerHTML = store.rnrFamilies.map(f => `
          <tr class="hover:bg-surface-container transition-colors">
            <td class="p-1 font-semibold">${f.headName}</td>
            <td class="p-1 text-primary font-bold">${f.plotNo}</td>
            <td class="p-1 text-tertiary font-bold">${f.housingGrant}</td>
            <td class="p-1">${f.annuity}</td>
            <td class="p-1"><span class="px-1.5 py-0.5 rounded text-[10px] font-bold ${f.status === 'Settled' ? 'bg-tertiary text-on-tertiary' : 'bg-secondary text-on-secondary'}">${f.status}</span></td>
          </tr>
        `).join('');
      }

      const modal = document.getElementById('modal-rnr-resettlement');
      if (modal) {
        modal.classList.remove('hidden');
        if (window.i18n && typeof window.i18n.applyTranslations === 'function') {
          window.i18n.applyTranslations(modal);
        }
      }
    };

    const btnCalaRnrModalTrigger = document.getElementById('btn-cala-rnr');
    if (btnCalaRnrModalTrigger) {
      btnCalaRnrModalTrigger.addEventListener('click', () => {
        const parcel = store.parcels.find(p => p.id === selectedParcelId || p.properties?.id === selectedParcelId);
        const projId = parcel ? (parcel.properties || parcel).projectId : 'REQ-WB-HGY-2023-0101';
        window.openRNRModal(projId);
      });
    }

    const closeRnrBtn = document.getElementById('btn-close-rnr-modal');
    const cancelRnrBtn = document.getElementById('btn-cancel-rnr');
    if (closeRnrBtn) closeRnrBtn.addEventListener('click', () => document.getElementById('modal-rnr-resettlement')?.classList.add('hidden'));
    if (cancelRnrBtn) cancelRnrBtn.addEventListener('click', () => document.getElementById('modal-rnr-resettlement')?.classList.add('hidden'));

    const rnrForm = document.getElementById('form-rnr-resettlement');
    if (rnrForm) {
      rnrForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const count = document.getElementById('rnr-families-count')?.value || 120;
        const officer = document.getElementById('rnr-officer-name')?.value || store.currentUser.name;
        const parcel = store.parcels.find(p => p.id === selectedParcelId || p.properties?.id === selectedParcelId);
        const projId = parcel ? (parcel.properties || parcel).projectId : 'REQ-WB-HGY-2023-0101';

        await window.NLAMS_API.completeResettlement(projId, count, officer);
        document.getElementById('modal-rnr-resettlement')?.classList.add('hidden');
        showToast('R&R Complete', `Successfully marked R&R complete for ${count} displaced families under Section 31.`, 'success');
      });
    }

    // --- 7G. Section 15 Hearing Outcome Modal ---
    let activeHearingObjId = null;
    window.openHearingOutcomeModal = function(objId) {
      const obj = (store.objections || []).find(o => o.id === objId) || (store.objections || [])[0];
      if (!obj) return;
      activeHearingObjId = obj.id;

      const idEl = document.getElementById('hearing-obj-id');
      const catBadge = document.getElementById('hearing-category-badge');
      const claimantEl = document.getElementById('hearing-claimant-name');
      const khasraEl = document.getElementById('hearing-khasra-no');
      const groundsEl = document.getElementById('hearing-grounds-text');
      const docWrapper = document.getElementById('hearing-doc-wrapper');
      const docNameEl = document.getElementById('hearing-doc-name');
      const verdictSelect = document.getElementById('hearing-verdict-select');
      const dateInput = document.getElementById('hearing-date-input');
      const officerInput = document.getElementById('hearing-officer-input');
      const notesInput = document.getElementById('hearing-notes-input');

      if (idEl) idEl.textContent = `${obj.id} • ${obj.khasraNo}`;
      if (catBadge) catBadge.textContent = obj.type;
      if (claimantEl) claimantEl.textContent = obj.claimant;
      if (khasraEl) khasraEl.textContent = `${obj.khasraNo} (${obj.parcelId})`;
      if (groundsEl) groundsEl.textContent = obj.grounds;

      if (docWrapper && docNameEl) {
        if (obj.documentName) {
          docWrapper.classList.remove('hidden');
          docNameEl.textContent = `Attached: ${obj.documentName}`;
        } else {
          docWrapper.classList.add('hidden');
        }
      }

      if (verdictSelect) {
        if (obj.status && ['Upheld', 'Rejected', 'Hearing Scheduled', 'Field Verification'].includes(obj.status)) {
          verdictSelect.value = obj.status;
        } else {
          verdictSelect.value = 'Upheld';
        }
      }

      if (dateInput) {
        dateInput.value = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
      }

      if (officerInput) {
        officerInput.value = store.currentUser?.name || 'R. K. Meena, IAS (District CALA)';
      }

      if (notesInput) {
        notesInput.value = obj.actionTaken || 'Order pronounced under Section 15(2): Evidence verified. Relief granted to claimant under Section 29.';
      }

      const modal = document.getElementById('modal-hearing-outcome');
      if (modal) {
        modal.classList.remove('hidden');
        if (window.i18n && typeof window.i18n.applyTranslations === 'function') {
          window.i18n.applyTranslations(modal);
        }
      }
    };

    const closeHearingBtn = document.getElementById('btn-close-hearing-modal');
    const cancelHearingBtn = document.getElementById('btn-cancel-hearing');
    if (closeHearingBtn) closeHearingBtn.addEventListener('click', () => document.getElementById('modal-hearing-outcome')?.classList.add('hidden'));
    if (cancelHearingBtn) cancelHearingBtn.addEventListener('click', () => document.getElementById('modal-hearing-outcome')?.classList.add('hidden'));

    const hearingForm = document.getElementById('form-hearing-outcome');
    if (hearingForm) {
      hearingForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const verdict = document.getElementById('hearing-verdict-select')?.value || 'Upheld';
        const hearingDate = document.getElementById('hearing-date-input')?.value;
        const officerName = document.getElementById('hearing-officer-input')?.value;
        const notes = document.getElementById('hearing-notes-input')?.value;

        const updated = store.recordObjectionOutcome(activeHearingObjId, {
          status: verdict,
          hearingDate: hearingDate,
          officerName: officerName,
          outcomeNotes: notes
        });

        document.getElementById('modal-hearing-outcome')?.classList.add('hidden');
        showToast('Section 15 Order Pronounced', `Statutory verdict [${verdict}] recorded for ${updated ? updated.khasraNo : 'objection'}.`, 'success');
        renderDistrictCALAObjections();
        if (typeof renderStateObjections === 'function') {
          renderStateObjections();
        }
        if (typeof renderCitizenParcel === 'function') {
          renderCitizenParcel(selectedParcelId);
        }
      });
    }

    // --- 7H. Cryptographic Audit Trail Modal ---
    function renderAuditTrailTable(filterText = '') {
      const tbody = document.getElementById('audit-trail-table-body');
      const countBadge = document.getElementById('audit-trail-count-badge');
      if (!tbody) return;

      const auditList = store.audit || [];
      if (countBadge) countBadge.textContent = `${auditList.length} Events Logged`;

      let filtered = auditList;
      if (filterText) {
        const q = filterText.toLowerCase();
        filtered = filtered.filter(a => 
          (a.actor || '').toLowerCase().includes(q) ||
          (a.role || '').toLowerCase().includes(q) ||
          (a.action || '').toLowerCase().includes(q) ||
          (a.hash || '').toLowerCase().includes(q)
        );
      }

      if (!filtered.length) {
        tbody.innerHTML = `<tr><td colspan="4" class="py-4 text-center text-on-surface-variant font-body-sm">No matching audit events found.</td></tr>`;
        return;
      }

      tbody.innerHTML = filtered.map(a => `
        <tr class="hover:bg-surface-container transition-colors">
          <td class="py-2 px-3 text-on-surface-variant font-mono whitespace-nowrap">${a.timestamp}</td>
          <td class="py-2 px-3">
            <strong class="text-on-surface block">${a.actor}</strong>
            <span class="text-[11px] text-secondary font-semibold">${a.role}</span>
          </td>
          <td class="py-2 px-3 text-on-surface leading-relaxed">${a.action}</td>
          <td class="py-2 px-3 font-mono text-[11px] text-tertiary select-all" title="${a.hash}">${(a.hash || '').slice(0, 24)}...</td>
        </tr>
      `).join('');
    }

    window.openAuditTrailModal = function() {
      renderAuditTrailTable();
      const modal = document.getElementById('modal-audit-trail');
      if (modal) {
        modal.classList.remove('hidden');
        if (window.i18n && typeof window.i18n.applyTranslations === 'function') {
          window.i18n.applyTranslations(modal);
        }
      }
    };

    const openAuditBtn = document.getElementById('btn-open-audit-trail');
    const closeAuditBtn = document.getElementById('btn-close-audit-modal');
    const searchAuditInput = document.getElementById('audit-search-input');
    if (openAuditBtn) openAuditBtn.addEventListener('click', window.openAuditTrailModal);
    if (closeAuditBtn) closeAuditBtn.addEventListener('click', () => document.getElementById('modal-audit-trail')?.classList.add('hidden'));
    if (searchAuditInput) searchAuditInput.addEventListener('input', (e) => renderAuditTrailTable(e.target.value));

    const exportAuditJson = document.getElementById('btn-export-audit-json');
    if (exportAuditJson) {
      exportAuditJson.addEventListener('click', () => {
        const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(store.audit, null, 2));
        const dlAnchor = document.createElement('a');
        dlAnchor.setAttribute('href', dataStr);
        dlAnchor.setAttribute('download', `nlams_cryptographic_audit_ledger_${Date.now()}.json`);
        document.body.appendChild(dlAnchor);
        dlAnchor.click();
        dlAnchor.remove();
        showToast('Audit Log Exported', 'Downloaded complete SHA-256 JSON audit ledger.', 'info');
      });
    }

    const exportAuditCsv = document.getElementById('btn-export-audit-csv');
    if (exportAuditCsv) {
      exportAuditCsv.addEventListener('click', () => {
        const rows = [
          ['Timestamp', 'Actor', 'Role', 'Action', 'SHA256_Hash'],
          ...(store.audit || []).map(a => [
            `"${(a.timestamp || '').replace(/"/g, '""')}"`,
            `"${(a.actor || '').replace(/"/g, '""')}"`,
            `"${(a.role || '').replace(/"/g, '""')}"`,
            `"${(a.action || '').replace(/"/g, '""')}"`,
            `"${(a.hash || '').replace(/"/g, '""')}"`
          ])
        ];
        const csvContent = 'data:text/csv;charset=utf-8,' + encodeURI(rows.map(r => r.join(',')).join('\n'));
        const dlAnchor = document.createElement('a');
        dlAnchor.setAttribute('href', csvContent);
        dlAnchor.setAttribute('download', `nlams_cryptographic_audit_ledger_${Date.now()}.csv`);
        document.body.appendChild(dlAnchor);
        dlAnchor.click();
        dlAnchor.remove();
        showToast('Audit CSV Exported', 'Downloaded complete audit ledger spreadsheet.', 'info');
      });
    }

    // --- 7I. Statutory Reports & Dossier Center Modal ---
    let currentReportType = 'gazette';
    function renderReportPreview(type = 'gazette') {
      currentReportType = type;
      const surface = document.getElementById('report-preview-surface');
      if (!surface) return;

      const tabs = document.querySelectorAll('.btn-report-tab');
      tabs.forEach(t => {
        if (t.getAttribute('data-report') === type) {
          t.className = 'btn-report-tab px-3 py-1.5 rounded text-xs font-bold bg-primary text-on-primary shadow-xs transition-all';
        } else {
          t.className = 'btn-report-tab px-3 py-1.5 rounded text-xs font-bold bg-surface-container text-on-surface hover:bg-surface-container-high transition-all';
        }
      });

      const activeProj = store.projects[0];
      const dateStr = new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });

      if (type === 'gazette') {
        surface.innerHTML = `
          <div class="max-w-2xl mx-auto bg-surface-container-lowest p-8 rounded-lg shadow-sm border border-outline-variant/40 text-on-surface space-y-6">
            <div class="text-center border-b pb-4 border-outline-variant/40">
              <span class="text-xs uppercase font-bold tracking-widest text-on-surface-variant block">The Gazette of India: Extraordinary</span>
              <span class="text-xs text-on-surface-variant block">PART II — Section 3 — Sub-section (ii) • PUBLISHED BY AUTHORITY</span>
              <h2 class="text-lg font-bold text-primary mt-2">MINISTRY OF RURAL DEVELOPMENT</h2>
              <span class="text-xs font-semibold text-secondary">Department of Land Resources (DoLR)</span>
              <p class="text-xs text-on-surface-variant mt-1">New Delhi, the ${dateStr} • Notification No. S.O. 4128(E)</p>
            </div>

            <div class="text-xs leading-relaxed space-y-3">
              <p><strong>S.O. 4128(E).</strong>—WHEREAS by the notification of the Government of India in the Ministry of Rural Development, published under sub-section (1) of section 11 of the Right to Fair Compensation and Transparency in Land Acquisition, Rehabilitation and Resettlement Act, 2013 (30 of 2013);</p>
              <p>AND WHEREAS the objections filed under Section 15(1) have been duly heard by the Competent Authority (CALA) and disposed of under Section 15(2);</p>
              <p>NOW, THEREFORE, in exercise of powers conferred by sub-section (1) of Section 19 of the said Act, the Central Government hereby declares that the land specified in the Schedule hereto annexed is required for the public infrastructure project, namely: <strong>${activeProj.name} (${activeProj.id})</strong> in District ${activeProj.district}, State of ${activeProj.state}.</p>
            </div>

            <div class="border rounded border-outline-variant/40 p-3 bg-surface-container-low text-xs">
              <div class="font-bold text-primary border-b pb-1 mb-2">Schedule of Demarcated Corridors</div>
              <div class="grid grid-cols-2 gap-2">
                <div><strong>Corridor Length:</strong> 88.40 Hectares</div>
                <div><strong>Survey Blocks:</strong> 64 Khasra / Dag Holdings</div>
                <div><strong>Requiring Body:</strong> ${activeProj.agency}</div>
                <div><strong>Jurisdiction:</strong> ${activeProj.division}</div>
              </div>
            </div>

            <div class="flex items-end justify-between pt-6 border-t border-outline-variant/40 text-xs">
              <div>
                <span class="text-tertiary font-bold flex items-center gap-1">
                  <span class="material-symbols-outlined text-sm">verified</span> Digitally Signed by Principal Secretary
                </span>
                <span class="font-mono text-[10px] text-on-surface-variant">Class-3 DSC • SHA-256: 7f9a20b9c3e41c88d92a017e81</span>
              </div>
              <div class="text-right font-bold text-primary">
                By Order and in the name of the President of India
              </div>
            </div>
          </div>
        `;
      } else if (type === 'award') {
        surface.innerHTML = `
          <div class="max-w-2xl mx-auto bg-surface-container-lowest p-8 rounded-lg shadow-sm border border-outline-variant/40 text-on-surface space-y-6">
            <div class="text-center border-b pb-4 border-outline-variant/40">
              <span class="text-xs uppercase font-bold tracking-widest text-on-surface-variant block">Office of the Competent Authority for Land Acquisition (CALA)</span>
              <h2 class="text-lg font-bold text-primary mt-1">FORM 12 — STATUTORY AWARD DECREE</h2>
              <span class="text-xs font-semibold text-secondary">Sections 23, 26, 27, 28, 29 & 30 of RFCTLARR Act 2013</span>
              <p class="text-xs text-on-surface-variant mt-1">Award Order Ref: CALA/HGY/2024/AW-3G-014 • Dated ${dateStr}</p>
            </div>

            <div class="text-xs space-y-3">
              <p>In the matter of Land Acquisition for <strong>${activeProj.name}</strong>, the undersigned Competent Authority hereby pronounces statutory determination of compensation:</p>
            </div>

            <table class="w-full text-xs text-left border-collapse border border-outline-variant/40">
              <thead class="bg-surface-container font-bold text-primary">
                <tr><th class="p-2 border">Statutory Component</th><th class="p-2 border">RFCTLARR Section</th><th class="p-2 border text-right">Computed Amount</th></tr>
              </thead>
              <tbody>
                <tr><td class="p-2 border">Base Market Value (Circle Rate × Multiplier)</td><td class="p-2 border">Section 26</td><td class="p-2 border text-right font-bold">₹1,59,04,000</td></tr>
                <tr><td class="p-2 border">Mandatory 100% Solatium Award</td><td class="p-2 border">Section 30(1)</td><td class="p-2 border text-right font-bold text-tertiary">+ ₹1,59,04,000</td></tr>
                <tr><td class="p-2 border">12% Additional Statutory Interest</td><td class="p-2 border">Section 30(3)</td><td class="p-2 border text-right font-bold">+ ₹38,16,960</td></tr>
                <tr><td class="p-2 border">Tree, Crop & Structure Assets</td><td class="p-2 border">Section 29</td><td class="p-2 border text-right font-bold text-secondary">+ ₹4,80,000</td></tr>
                <tr class="bg-surface-container-high font-bold text-primary"><td class="p-2 border" colspan="2">TOTAL DETERMINED COMPENSATION</td><td class="p-2 border text-right text-sm">₹3,61,04,960</td></tr>
              </tbody>
            </table>

            <div class="flex items-end justify-between pt-6 border-t border-outline-variant/40 text-xs">
              <div>
                <span class="text-tertiary font-bold">CALA Official Seal & Decree</span>
                <p class="text-[11px] text-on-surface-variant">Approved for Direct PFMS Treasury Disbursal</p>
              </div>
              <div class="text-right font-bold text-primary">
                R. K. Meena, IAS<br/><span class="text-xs font-normal">District Collector & CALA</span>
              </div>
            </div>
          </div>
        `;
      } else if (type === 'dbt') {
        surface.innerHTML = `
          <div class="max-w-2xl mx-auto bg-surface-container-lowest p-6 rounded-lg shadow-sm border border-outline-variant/40 text-on-surface space-y-4">
            <div class="border-b pb-3 border-outline-variant/40 flex justify-between items-start">
              <div>
                <h3 class="text-base font-bold text-primary">PFMS Direct Benefit Transfer (DBT) Treasury Ledger</h3>
                <span class="text-xs text-on-surface-variant">Public Financial Management System • Ministry of Finance Integration</span>
              </div>
              <span class="px-2 py-0.5 rounded bg-tertiary-container text-on-tertiary font-legal-code text-xs font-bold">LIVE SYNC</span>
            </div>

            <table class="w-full text-xs text-left border-collapse">
              <thead class="bg-surface-container text-primary font-bold">
                <tr><th class="p-2">Beneficiary</th><th class="p-2">Bank & Account</th><th class="p-2">UTR Ref</th><th class="p-2 text-right">Amount (₹)</th><th class="p-2">Status</th></tr>
              </thead>
              <tbody class="divide-y text-on-surface">
                <tr><td class="p-2 font-bold">Subrata Ghosh</td><td class="p-2">PNB •••• 5012</td><td class="p-2 font-mono text-[11px]">#SBINWB2408912</td><td class="p-2 text-right font-bold text-primary">₹3,18,08,000</td><td class="p-2 text-tertiary font-bold">Settled</td></tr>
                <tr><td class="p-2 font-bold">Ramesh N. Patil</td><td class="p-2">SBI •••• 4120</td><td class="p-2 font-mono text-[11px]">#MAHABH2499102</td><td class="p-2 text-right font-bold text-primary">₹67,20,000</td><td class="p-2 text-tertiary font-bold">Settled</td></tr>
                <tr><td class="p-2 font-bold">Baburao S. Gaikwad</td><td class="p-2">Bank of Maha •••• 1088</td><td class="p-2 font-mono text-[11px]">#PFMSMH2410884</td><td class="p-2 text-right font-bold text-primary">₹42,50,000</td><td class="p-2 text-secondary font-bold">Processing</td></tr>
              </tbody>
            </table>
          </div>
        `;
      } else if (type === 'objections') {
        const objs = store.objections || [];
        surface.innerHTML = `
          <div class="max-w-3xl mx-auto bg-surface-container-lowest p-6 rounded-lg shadow-sm border border-outline-variant/40 text-on-surface space-y-4">
            <div class="border-b pb-3 border-outline-variant/40 flex justify-between items-start">
              <div>
                <h3 class="text-base font-bold text-primary">Section 15 Statutory Public Hearing & Objections Register</h3>
                <span class="text-xs text-on-surface-variant">RFCTLARR Act 2013 Section 15(2) Proceedings • Single Source of Truth</span>
              </div>
              <span class="px-2 py-0.5 rounded bg-primary-container text-on-primary font-legal-code text-xs font-bold">${objs.length} Petitions</span>
            </div>

            <table class="w-full text-xs text-left border-collapse">
              <thead class="bg-surface-container text-primary font-bold">
                <tr><th class="p-2">Ref ID</th><th class="p-2">Claimant</th><th class="p-2">Holding</th><th class="p-2">Category</th><th class="p-2">Status</th><th class="p-2">Statutory Order</th></tr>
              </thead>
              <tbody class="divide-y text-on-surface">
                ${objs.map(o => `
                  <tr>
                    <td class="p-2 font-mono font-bold text-primary">${o.id}</td>
                    <td class="p-2 font-semibold">${o.claimant}</td>
                    <td class="p-2">${o.khasraNo}</td>
                    <td class="p-2 text-secondary">${o.type}</td>
                    <td class="p-2 font-bold">${o.status}</td>
                    <td class="p-2 text-[11px]">${o.actionTaken || 'Notice Issued'}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        `;
      }
    }

    window.openReportsCenterModal = function(type = 'gazette') {
      renderReportPreview(type);
      const modal = document.getElementById('modal-reports-center');
      if (modal) {
        modal.classList.remove('hidden');
        if (window.i18n && typeof window.i18n.applyTranslations === 'function') {
          window.i18n.applyTranslations(modal);
        }
      }
    };

    const openReportsBtn = document.getElementById('btn-open-reports-center');
    const closeReportsBtn = document.getElementById('btn-close-reports-modal');
    if (openReportsBtn) openReportsBtn.addEventListener('click', () => window.openReportsCenterModal('gazette'));
    if (closeReportsBtn) closeReportsBtn.addEventListener('click', () => document.getElementById('modal-reports-center')?.classList.add('hidden'));

    const reportTabs = document.querySelectorAll('.btn-report-tab');
    reportTabs.forEach(tab => {
      tab.addEventListener('click', () => {
        const type = tab.getAttribute('data-report');
        renderReportPreview(type);
      });
    });

    const printReportBtn = document.getElementById('btn-print-report');
    if (printReportBtn) {
      printReportBtn.addEventListener('click', () => {
        window.print();
      });
    }

    const downloadReportCsvBtn = document.getElementById('btn-download-report-csv');
    if (downloadReportCsvBtn) {
      downloadReportCsvBtn.addEventListener('click', () => {
        let rows = [];
        let filename = 'statutory_report.csv';
        if (currentReportType === 'objections') {
          filename = 'section_15_objections_register.csv';
          rows = [
            ['Ref_ID', 'Filing_Date', 'Claimant', 'Holding_Khasra', 'Category', 'Grounds', 'Status', 'Hearing_Date', 'Action_Taken'],
            ...(store.objections || []).map(o => [
              `"${o.id}"`, `"${o.filingDate}"`, `"${o.claimant}"`, `"${o.khasraNo}"`, `"${o.type}"`,
              `"${(o.grounds || '').replace(/"/g, '""')}"`, `"${o.status}"`, `"${o.hearingDate || ''}"`,
              `"${(o.actionTaken || '').replace(/"/g, '""')}"`
            ])
          ];
        } else if (currentReportType === 'award') {
          filename = 'section_3g_statutory_award.csv';
          rows = [
            ['Component', 'Section', 'Amount_INR'],
            ['Base Market Value', 'Section 26', '15904000'],
            ['100% Solatium', 'Section 30(1)', '15904000'],
            ['12% Statutory Interest', 'Section 30(3)', '3816960'],
            ['Tree & Crop Valuation', 'Section 29', '480000'],
            ['Total Final Award', 'RFCTLARR Act', '36104960']
          ];
        } else if (currentReportType === 'dbt') {
          filename = 'pfms_dbt_disbursal_ledger.csv';
          rows = [
            ['Beneficiary', 'Account_Masked', 'UTR_Reference', 'Amount_INR', 'Status'],
            ['Subrata Ghosh', 'PNB •••• 5012', '#SBINWB2408912', '31808000', 'Settled'],
            ['Ramesh N. Patil', 'SBI •••• 4120', '#MAHABH2499102', '6720000', 'Settled'],
            ['Baburao S. Gaikwad', 'Bank of Maha •••• 1088', '#PFMSMH2410884', '4250000', 'Processing']
          ];
        } else {
          filename = 'section_19_gazette_declaration.csv';
          rows = [
            ['Notification_Ref', 'Project_ID', 'Project_Name', 'State', 'District', 'Demarcated_Area_Ha', 'Status'],
            ['S.O. 4128(E)', store.projects[0].id, store.projects[0].name, store.projects[0].state, store.projects[0].district, store.projects[0].requiredLandHa, 'Gazette Published']
          ];
        }
        const csvContent = 'data:text/csv;charset=utf-8,' + encodeURI(rows.map(r => r.join(',')).join('\n'));
        const dlAnchor = document.createElement('a');
        dlAnchor.setAttribute('href', csvContent);
        dlAnchor.setAttribute('download', filename);
        document.body.appendChild(dlAnchor);
        dlAnchor.click();
        dlAnchor.remove();
        showToast('Report CSV Downloaded', `Exported ${filename}`, 'info');
      });
    }

    // --- 7J. Statutory Compensation Calculator Modal (RFCTLARR Sec 26-30) ---
    const compCalcModal = document.getElementById('modal-compensation-calculator');
    const openCompCalcHeader = document.getElementById('btn-open-compensation-calc');
    const openCompCalcCitizen = document.getElementById('btn-open-citizen-comp-calc');
    const openCompCalcCala = document.getElementById('btn-cala-comp-calc');
    const closeCompCalcBtn = document.getElementById('btn-close-comp-calc-modal');
    const closeCompCalcFooterBtn = document.getElementById('btn-close-comp-calc-modal-footer');
    const compCalcPopulateBtn = document.getElementById('btn-calc-populate-current');
    const compCalcResetBtn = document.getElementById('btn-calc-reset');
    const compCalcSubmitBtn = document.getElementById('btn-calc-submit');
    const compCalcToggleAssetsBtn = document.getElementById('btn-toggle-asset-valuations');

    // Dual Mode Switcher elements
    const calcModeBtnSimple = document.getElementById('calc-mode-btn-simple');
    const calcModeBtnDetailed = document.getElementById('calc-mode-btn-detailed');
    const calcToggleViewLink = document.getElementById('btn-toggle-view-link');
    const calcToggleViewLinkText = document.getElementById('calc-toggle-view-link-text');
    const calcLearnMoreBtn = document.getElementById('btn-calc-learn-more');
    const calcDisclaimerExpandable = document.getElementById('calc-disclaimer-expandable');

    // Simple Mode Specific elements
    const btnToggleSimpleEditMultiplier = document.getElementById('btn-toggle-simple-edit-multiplier');
    const calcSimpleMultiplierEditPanel = document.getElementById('calc-simple-multiplier-edit-panel');
    const calcSimpleInputMultiplier = document.getElementById('calc-simple-input-multiplier');
    const btnApplySimpleMultiplier = document.getElementById('btn-apply-simple-multiplier');
    const calcSimpleMultiplierText = document.getElementById('calc-simple-multiplier-text');
    const calcAssetsBtnNo = document.getElementById('calc-assets-btn-no');
    const calcAssetsBtnYes = document.getElementById('calc-assets-btn-yes');

    // Inputs
    const calcAreaInput = document.getElementById('calc-input-area');
    const calcAreaUnitSelect = document.getElementById('calc-select-area-unit');
    const calcCircleRateInput = document.getElementById('calc-input-circle-rate');
    const calcCircleRateUnitSelect = document.getElementById('calc-select-rate-unit');
    const calcMultiplierInput = document.getElementById('calc-input-multiplier');
    const calcTreesInput = document.getElementById('calc-input-trees');
    const calcWellsInput = document.getElementById('calc-input-wells');
    const calcStructuresInput = document.getElementById('calc-input-structures');
    const calcDateStartInput = document.getElementById('calc-input-date-start');
    const calcDateEndInput = document.getElementById('calc-input-date-end');
    const calcIncludeInterestCheck = document.getElementById('calc-check-include-interest');

    // Display / Label elements
    const calcAreaConvertedLabel = document.getElementById('calc-area-converted-label');
    const calcRateConvertedLabel = document.getElementById('calc-rate-converted-label');
    const calcInterestDurationText = document.getElementById('calc-interest-duration-text');
    const calcActiveParcelPill = document.getElementById('calc-active-parcel-pill');
    const calcAssetsSubtotalBadge = document.getElementById('calc-assets-subtotal-badge');
    const calcAssetsContent = document.getElementById('calc-assets-content');
    const calcAssetsToggleIcon = document.getElementById('calc-assets-toggle-icon');

    // Breakdown result elements
    const calcResBaseMarketVal = document.getElementById('calc-res-base-market-val');
    const calcResAssetsRow = document.getElementById('calc-res-assets-row');
    const calcResAssetsVal = document.getElementById('calc-res-assets-val');
    const calcResAssetsBreakdownText = document.getElementById('calc-res-assets-breakdown-text');
    const calcResMarketSubtotal = document.getElementById('calc-res-market-subtotal');
    const calcResSolatium = document.getElementById('calc-res-solatium');
    const calcResInterest = document.getElementById('calc-res-interest');
    const calcResInterestSubtitle = document.getElementById('calc-res-interest-subtitle');
    const calcResFinal = document.getElementById('calc-res-final');
    const calcResLakhsLabel = document.getElementById('calc-res-lakhs-label');
    const calcResTotalInterest = document.getElementById('calc-res-total-interest');
    const calcBackendStatusPill = document.getElementById('calc-backend-status-pill');

    // Calculator View Mode State (Persisted in sessionStorage)
    let compCalcMode = (typeof sessionStorage !== 'undefined' && sessionStorage.getItem('nlams_calc_mode')) || 'simple';

    function setCompCalcMode(mode, saveSession = true) {
      compCalcMode = mode;
      if (saveSession && typeof sessionStorage !== 'undefined') {
        sessionStorage.setItem('nlams_calc_mode', mode);
      }

      if (compCalcModal) {
        if (mode === 'simple') {
          compCalcModal.classList.remove('calc-mode-detailed');
          compCalcModal.classList.add('calc-mode-simple');
          if (calcModeBtnSimple) {
            calcModeBtnSimple.className = 'active px-2.5 py-1 rounded-md text-xs font-bold transition-all shadow-xs bg-primary text-on-primary cursor-pointer flex items-center gap-1';
          }
          if (calcModeBtnDetailed) {
            calcModeBtnDetailed.className = 'px-2.5 py-1 rounded-md text-xs font-bold transition-all text-on-surface-variant hover:text-on-surface cursor-pointer flex items-center gap-1';
          }
          if (calcToggleViewLinkText) calcToggleViewLinkText.textContent = 'Show full statutory breakdown →';
          const modalTitle = document.getElementById('calc-modal-title');
          if (modalTitle) modalTitle.textContent = 'Land Compensation Calculator';
          const modalBadge = document.getElementById('calc-modal-badge');
          if (modalBadge) modalBadge.textContent = 'Citizen Estimate Mode';
        } else {
          compCalcModal.classList.remove('calc-mode-simple');
          compCalcModal.classList.add('calc-mode-detailed');
          if (calcModeBtnSimple) {
            calcModeBtnSimple.className = 'px-2.5 py-1 rounded-md text-xs font-bold transition-all text-on-surface-variant hover:text-on-surface cursor-pointer flex items-center gap-1';
          }
          if (calcModeBtnDetailed) {
            calcModeBtnDetailed.className = 'active px-2.5 py-1 rounded-md text-xs font-bold transition-all shadow-xs bg-primary text-on-primary cursor-pointer flex items-center gap-1';
          }
          if (calcToggleViewLinkText) calcToggleViewLinkText.textContent = '← Back to Simple view';
          const modalTitle = document.getElementById('calc-modal-title');
          if (modalTitle) modalTitle.textContent = 'Statutory Compensation Calculator';
          const modalBadge = document.getElementById('calc-modal-badge');
          if (modalBadge) modalBadge.textContent = 'RFCTLARR 2013 Sec 26–30';
        }
      }
    }

    function formatINRCurrency(val) {
      if (typeof val !== 'number' || isNaN(val)) return '₹0';
      const rounded = Math.round(val);
      const isNeg = rounded < 0;
      const s = String(Math.abs(rounded));
      if (s.length <= 3) return (isNeg ? '-₹' : '₹') + s;
      const last3 = s.slice(-3);
      let rem = s.slice(0, -3);
      const chunks = [];
      while (rem.length > 2) {
        chunks.push(rem.slice(-2));
        rem = rem.slice(0, -2);
      }
      if (rem.length) chunks.push(rem);
      chunks.reverse();
      return (isNeg ? '-₹' : '₹') + chunks.join(',') + ',' + last3;
    }

    function getActiveCalcParcel() {
      if (!isUserAuthenticated()) {
        return null;
      }

      const currentUserRole = (store.currentUser && store.currentUser.role) || '';

      // Citizen security boundary: Citizens can ONLY ever access their own parcel
      if (currentUserRole === 'citizen') {
        const ownParcelId = store.currentUser && store.currentUser.parcelId;
        if (!ownParcelId) return null;
        const found = (store.parcels || []).find(p => (p.properties || p).id === ownParcelId);
        return found ? (found.properties || found) : null;
      }

      // Officials (CALA, State Directorate, Ministry)
      const pId = window.NLAMS_SELECTED_PARCEL_ID || selectedParcelId;
      if (!pId) return null;
      const parcel = (store.parcels || []).find(p => (p.properties || p).id === pId);
      return parcel ? (parcel.properties || parcel) : null;
    }

    function setBlankCalcState() {
      if (calcActiveParcelPill) {
        calcActiveParcelPill.textContent = 'None (Custom Mode)';
        calcActiveParcelPill.className = 'px-2 py-0.5 rounded bg-surface-container text-on-surface-variant font-legal-code text-xs font-bold border border-outline-variant/30';
      }
      if (calcAreaInput) calcAreaInput.value = '';
      if (calcAreaUnitSelect) calcAreaUnitSelect.value = 'ha';
      if (calcAreaConvertedLabel) calcAreaConvertedLabel.textContent = '= 0 m²';

      if (calcCircleRateInput) calcCircleRateInput.value = '';
      if (calcCircleRateUnitSelect) calcCircleRateUnitSelect.value = 'sqm';
      if (calcRateConvertedLabel) calcRateConvertedLabel.textContent = '= ₹0 / m²';

      if (calcMultiplierInput) calcMultiplierInput.value = '1.00';
      if (calcSimpleInputMultiplier) calcSimpleInputMultiplier.value = '1.00';
      if (calcSimpleMultiplierText) {
        calcSimpleMultiplierText.textContent = 'Standard statutory factor of 1.00× (Urban) / 1.12× (Rural) applies. Sign in to auto-detect from your land records.';
      }
      if (calcSimpleMultiplierEditPanel) calcSimpleMultiplierEditPanel.classList.add('hidden');

      if (calcTreesInput) calcTreesInput.value = '0';
      if (calcWellsInput) calcWellsInput.value = '0';
      if (calcStructuresInput) calcStructuresInput.value = '0';
      if (calcAssetsSubtotalBadge) calcAssetsSubtotalBadge.textContent = '₹0';

      if (calcAssetsBtnNo && calcAssetsBtnYes) {
        calcAssetsBtnNo.className = 'px-3 py-1 rounded-md text-xs font-bold transition-all bg-primary text-on-primary shadow-xs cursor-pointer';
        calcAssetsBtnYes.className = 'px-3 py-1 rounded-md text-xs font-bold transition-all text-on-surface-variant hover:text-on-surface cursor-pointer';
      }
      if (calcAssetsContent) calcAssetsContent.classList.add('hidden');

      if (calcResBaseMarketVal) calcResBaseMarketVal.textContent = '₹0';
      if (calcResMarketSubtotal) calcResMarketSubtotal.textContent = '₹0';
      if (calcResSolatium) calcResSolatium.textContent = '+ ₹0';
      if (calcResAssetsRow) calcResAssetsRow.classList.add('hidden');
      if (calcResAssetsVal) calcResAssetsVal.textContent = '+ ₹0';
      if (calcResInterest) calcResInterest.textContent = '+ ₹0';
      if (calcResFinal) calcResFinal.textContent = '₹0';
      if (calcResLakhsLabel) calcResLakhsLabel.textContent = '₹0.00 Lakhs';
      if (calcResTotalInterest) calcResTotalInterest.textContent = '₹0';

      if (calcBackendStatusPill) {
        calcBackendStatusPill.className = 'px-2 py-0.5 rounded bg-surface-container text-on-surface-variant border border-outline-variant/30 text-[11px] font-bold font-legal-code flex items-center gap-1';
        calcBackendStatusPill.innerHTML = '<span class="w-1.5 h-1.5 rounded-full bg-outline-variant"></span><span>Custom Mode</span>';
      }
    }

    function updateCalcInputPreviews() {
      const areaVal = parseFloat(calcAreaInput?.value) || 0;
      const areaUnit = calcAreaUnitSelect?.value || 'ha';
      let areaSqm = areaVal;
      if (areaUnit === 'ha') areaSqm = areaVal * 10000;
      else if (areaUnit === 'acres') areaSqm = areaVal * 4046.85642;
      if (calcAreaConvertedLabel) calcAreaConvertedLabel.textContent = `= ${Math.round(areaSqm).toLocaleString('en-IN')} m²`;

      const rateVal = parseFloat(calcCircleRateInput?.value) || 0;
      const rateUnit = calcCircleRateUnitSelect?.value || 'sqm';
      let rateSqm = rateVal;
      if (rateUnit === 'ha') rateSqm = rateVal / 10000;
      else if (rateUnit === 'acres') rateSqm = rateVal / 4046.85642;
      if (calcRateConvertedLabel) calcRateConvertedLabel.textContent = `= ${formatINRCurrency(rateSqm)} / m²`;

      const trees = parseFloat(calcTreesInput?.value) || 0;
      const wells = parseFloat(calcWellsInput?.value) || 0;
      const structures = parseFloat(calcStructuresInput?.value) || 0;
      const assetsSubtotal = trees + wells + structures;
      if (calcAssetsSubtotalBadge) calcAssetsSubtotalBadge.textContent = formatINRCurrency(assetsSubtotal);

      if (calcDateStartInput && calcDateEndInput && calcInterestDurationText) {
        if (calcDateStartInput.value && calcDateEndInput.value) {
          const d1 = new Date(calcDateStartInput.value);
          const d2 = new Date(calcDateEndInput.value);
          const diffDays = Math.max(0, (d2 - d1) / (1000 * 60 * 60 * 24));
          const years = (diffDays / 365.25).toFixed(2);
          calcInterestDurationText.textContent = `${years} Years (${Math.round(diffDays)} days)`;
        } else {
          calcInterestDurationText.textContent = '2.00 Years (Default)';
        }
      }
    }

    async function executeBackendCompensationCalculation() {
      const area = parseFloat(calcAreaInput?.value) || 0;
      const area_unit = calcAreaUnitSelect?.value || 'ha';
      const circle_rate = parseFloat(calcCircleRateInput?.value) || 0;
      const circle_rate_unit = calcCircleRateUnitSelect?.value || 'sqm';
      const multiplier_factor = parseFloat(calcMultiplierInput?.value) || 1.0;
      const trees_valuation = parseFloat(calcTreesInput?.value) || 0;
      const wells_valuation = parseFloat(calcWellsInput?.value) || 0;
      const structures_valuation = parseFloat(calcStructuresInput?.value) || 0;
      const start_date = calcDateStartInput?.value || null;
      const end_date = calcDateEndInput?.value || null;
      const include_interest_in_total = Boolean(calcIncludeInterestCheck?.checked);

      const payload = {
        area,
        area_unit,
        circle_rate,
        circle_rate_unit,
        multiplier_factor,
        trees_valuation,
        wells_valuation,
        structures_valuation,
        start_date,
        end_date,
        include_interest_in_total
      };

      if (compCalcSubmitBtn) {
        compCalcSubmitBtn.disabled = true;
        compCalcSubmitBtn.innerHTML = `
          <span class="material-symbols-outlined text-[20px] animate-spin">autorenew</span>
          <span>Computing Award via Backend API...</span>
        `;
      }

      try {
        let result = null;
        if (window.NLAMS_API && typeof window.NLAMS_API.calculateCompensation === 'function') {
          const apiRes = await window.NLAMS_API.calculateCompensation(payload);
          if (apiRes && apiRes.ok && apiRes.data) {
            result = apiRes.data;
          }
        }

        if (!result) {
          const fallbackRes = await fetch('http://127.0.0.1:8000/compensation/calculate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
          });
          if (fallbackRes.ok) {
            result = await fallbackRes.json();
          }
        }

        if (result && result.breakdown) {
          const b = result.breakdown;
          if (calcResBaseMarketVal) calcResBaseMarketVal.textContent = b.base_market_value_formatted || formatINRCurrency(b.base_market_value);
          
          if (b.assets_valuation > 0) {
            if (calcResAssetsRow) calcResAssetsRow.classList.remove('hidden');
            if (calcResAssetsVal) calcResAssetsVal.textContent = b.assets_valuation_formatted || `+ ${formatINRCurrency(b.assets_valuation)}`;
            if (calcResAssetsBreakdownText) {
              calcResAssetsBreakdownText.textContent = `Trees: ${formatINRCurrency(b.trees_valuation)} • Wells: ${formatINRCurrency(b.wells_valuation)} • Struct: ${formatINRCurrency(b.structures_valuation)}`;
            }
          } else {
            if (calcResAssetsRow) calcResAssetsRow.classList.add('hidden');
          }

          if (calcResMarketSubtotal) calcResMarketSubtotal.textContent = b.market_value_subtotal_formatted || formatINRCurrency(b.market_value_subtotal);
          if (calcResSolatium) calcResSolatium.textContent = b.solatium_amount_formatted || `+ ${formatINRCurrency(b.solatium_amount)}`;
          if (calcResInterest) calcResInterest.textContent = b.additional_interest_formatted || `+ ${formatINRCurrency(b.additional_interest)}`;
          if (calcResInterestSubtitle && result.inputs) {
            calcResInterestSubtitle.textContent = `Sec 30(3) for ${result.inputs.interest_years} yrs @ 12% p.a.`;
          }
          if (calcResFinal) calcResFinal.textContent = b.final_disbursal_amount_formatted || formatINRCurrency(b.final_disbursal_amount);
          if (calcResLakhsLabel) {
            const lakhs = (b.final_disbursal_amount / 100000).toFixed(2);
            calcResLakhsLabel.textContent = `₹${lakhs} Lakhs`;
          }
          if (calcResTotalInterest) calcResTotalInterest.textContent = b.total_with_interest_formatted || formatINRCurrency(b.total_with_interest);

          if (calcBackendStatusPill) {
            calcBackendStatusPill.className = 'px-2 py-0.5 rounded bg-tertiary/10 text-tertiary border border-tertiary/20 text-[11px] font-bold font-legal-code flex items-center gap-1';
            calcBackendStatusPill.innerHTML = '<span class="w-1.5 h-1.5 rounded-full bg-tertiary"></span><span>Backend Synced (200 OK)</span>';
          }
        }
      } catch (err) {
        console.error('[Compensation Calculator] Error calling backend:', err);
        if (calcBackendStatusPill) {
          calcBackendStatusPill.className = 'px-2 py-0.5 rounded bg-error/10 text-error border border-error/20 text-[11px] font-bold font-legal-code flex items-center gap-1';
          calcBackendStatusPill.innerHTML = '<span class="w-1.5 h-1.5 rounded-full bg-error"></span><span>Backend Error</span>';
        }
      } finally {
        if (compCalcSubmitBtn) {
          compCalcSubmitBtn.disabled = false;
          compCalcSubmitBtn.innerHTML = `
            <span class="material-symbols-outlined text-[20px]">calculate</span>
            <span class="calc-detailed-only">Calculate Statutory Award (Call Backend API)</span>
            <span class="calc-simple-only">Calculate My Estimated Compensation</span>
          `;
        }
      }
    }

    let calcDebounceTimer = null;
    function triggerDebouncedCalculation() {
      updateCalcInputPreviews();
      clearTimeout(calcDebounceTimer);
      calcDebounceTimer = setTimeout(executeBackendCompensationCalculation, 250);
    }

    function populateCalcFromParcel(parcel) {
      const p = parcel || getActiveCalcParcel();
      if (!p) {
        setBlankCalcState();
        return;
      }
      if (calcAreaInput) calcAreaInput.value = p.areaHa != null ? p.areaHa : '';
      if (calcAreaUnitSelect) calcAreaUnitSelect.value = 'ha';
      if (calcCircleRateInput) calcCircleRateInput.value = p.baseMarketRatePerSqM || '';
      if (calcCircleRateUnitSelect) calcCircleRateUnitSelect.value = 'sqm';

      // Auto-detect and pre-fill statutory rural/urban multiplier
      const isRural = p.landType ? !p.landType.toLowerCase().includes('urban') : (p.state === 'West Bengal');
      const factor = isRural ? 1.12 : 1.00;
      if (calcMultiplierInput) calcMultiplierInput.value = factor;
      if (calcSimpleInputMultiplier) calcSimpleInputMultiplier.value = factor;
      if (calcSimpleMultiplierText) {
        calcSimpleMultiplierText.textContent = isRural
          ? `Your area is classified as rural, so a ${factor}× multiplier applies.`
          : `Your area is classified as urban, so a ${factor}× multiplier applies.`;
      }

      // Default assets to 0 and 'No' in simple mode
      if (calcTreesInput) calcTreesInput.value = 0;
      if (calcWellsInput) calcWellsInput.value = 0;
      if (calcStructuresInput) calcStructuresInput.value = 0;
      if (calcAssetsBtnNo && calcAssetsBtnYes) {
        calcAssetsBtnNo.className = 'px-3 py-1 rounded-md text-xs font-bold transition-all bg-primary text-on-primary shadow-xs cursor-pointer';
        calcAssetsBtnYes.className = 'px-3 py-1 rounded-md text-xs font-bold transition-all text-on-surface-variant hover:text-on-surface cursor-pointer';
      }
      if (calcAssetsContent) calcAssetsContent.classList.add('hidden');

      if (calcActiveParcelPill) {
        calcActiveParcelPill.textContent = `${p.gutNumber || p.id} (${p.areaHa} Ha • ₹${(p.baseMarketRatePerSqM || 1000).toLocaleString('en-IN')}/m²)`;
        calcActiveParcelPill.className = 'px-2 py-0.5 rounded bg-surface-container text-primary font-legal-code text-xs font-bold border border-outline-variant/30';
      }
      updateCalcInputPreviews();
      executeBackendCompensationCalculation();
    }

    function resetCompensationCalculator() {
      const p = getActiveCalcParcel();
      if (p) {
        populateCalcFromParcel(p);
        showToast('Calculator Reset', `Inputs reset to statutory baseline of ${p.gutNumber || p.id}.`, 'info');
      } else {
        setBlankCalcState();
        showToast('Calculator Reset', 'Inputs cleared for custom estimation.', 'info');
      }
    }

    window.openCompensationCalculatorModal = function(parcelId, initialMode = null) {
      const isAuth = isUserAuthenticated();
      const currentUserRole = (isAuth && store.currentUser && store.currentUser.role) || '';
      const isOfficial = ['dro-cala', 'state-revenue', 'central-ministry', 'requiring-body'].includes(currentUserRole);
      const isCitizen = currentUserRole === 'citizen';

      // 1. Determine view mode based on source & role
      if (initialMode) {
        setCompCalcMode(initialMode, false);
      } else {
        if (isOfficial) {
          setCompCalcMode('detailed', false);
        } else {
          const savedMode = (typeof sessionStorage !== 'undefined' && sessionStorage.getItem('nlams_calc_mode')) || 'simple';
          setCompCalcMode(savedMode, false);
        }
      }

      // 2. Configure Auto-populate button state based on authentication
      if (compCalcPopulateBtn) {
        if (!isAuth) {
          compCalcPopulateBtn.disabled = true;
          compCalcPopulateBtn.classList.add('opacity-50', 'cursor-not-allowed', 'pointer-events-none');
          compCalcPopulateBtn.setAttribute('title', 'Sign in to auto-fill from your parcel');
        } else if (isCitizen) {
          compCalcPopulateBtn.disabled = false;
          compCalcPopulateBtn.classList.remove('opacity-50', 'cursor-not-allowed', 'pointer-events-none');
          compCalcPopulateBtn.setAttribute('title', `Auto-fill from your registered parcel (${store.currentUser.gutNumber || store.currentUser.parcelId})`);
        } else {
          // Official
          const hasSelected = Boolean(parcelId || window.NLAMS_SELECTED_PARCEL_ID || selectedParcelId);
          compCalcPopulateBtn.disabled = !hasSelected;
          if (hasSelected) {
            compCalcPopulateBtn.classList.remove('opacity-50', 'cursor-not-allowed', 'pointer-events-none');
            compCalcPopulateBtn.setAttribute('title', 'Auto-populate from selected parcel');
          } else {
            compCalcPopulateBtn.classList.add('opacity-50', 'cursor-not-allowed', 'pointer-events-none');
            compCalcPopulateBtn.setAttribute('title', 'Select a parcel on the docket or map to auto-fill');
          }
        }
      }

      // 3. Resolve active parcel securely
      let p = null;
      if (isAuth) {
        if (isCitizen) {
          // Citizen can ONLY EVER load their own parcel
          p = getActiveCalcParcel();
        } else if (isOfficial) {
          if (parcelId) {
            window.NLAMS_SELECTED_PARCEL_ID = parcelId;
          }
          p = getActiveCalcParcel();
        }
      }

      if (compCalcModal) {
        compCalcModal.classList.remove('hidden');
        if (window.i18n && typeof window.i18n.applyTranslations === 'function') {
          window.i18n.applyTranslations(compCalcModal);
        }
      }

      // 4. Populate or set blank custom state
      if (p) {
        populateCalcFromParcel(p);
      } else {
        setBlankCalcState();
      }
    };

    window.closeCompensationCalculatorModal = function() {
      if (compCalcModal) compCalcModal.classList.add('hidden');
    };

    // Mode Switcher Listeners
    if (calcModeBtnSimple) {
      calcModeBtnSimple.addEventListener('click', () => setCompCalcMode('simple', true));
    }
    if (calcModeBtnDetailed) {
      calcModeBtnDetailed.addEventListener('click', () => setCompCalcMode('detailed', true));
    }
    if (calcToggleViewLink) {
      calcToggleViewLink.addEventListener('click', () => {
        const nextMode = compCalcMode === 'simple' ? 'detailed' : 'simple';
        setCompCalcMode(nextMode, true);
      });
    }
    if (calcLearnMoreBtn && calcDisclaimerExpandable) {
      calcLearnMoreBtn.addEventListener('click', () => {
        calcDisclaimerExpandable.classList.toggle('hidden');
      });
    }

    // Simple Multiplier Edit Toggle
    if (btnToggleSimpleEditMultiplier && calcSimpleMultiplierEditPanel) {
      btnToggleSimpleEditMultiplier.addEventListener('click', () => {
        calcSimpleMultiplierEditPanel.classList.toggle('hidden');
      });
    }
    if (btnApplySimpleMultiplier && calcSimpleInputMultiplier && calcMultiplierInput) {
      btnApplySimpleMultiplier.addEventListener('click', () => {
        const val = parseFloat(calcSimpleInputMultiplier.value) || 1.12;
        calcMultiplierInput.value = val;
        if (calcSimpleMultiplierText) {
          calcSimpleMultiplierText.textContent = `Custom multiplier of ${val}× applied.`;
        }
        calcSimpleMultiplierEditPanel.classList.add('hidden');
        triggerDebouncedCalculation();
        showToast('Multiplier Updated', `Applied factor of ${val}×`, 'info');
      });
    }

    // Simple Itemized Assets Yes/No Toggle
    if (calcAssetsBtnNo && calcAssetsBtnYes && calcAssetsContent) {
      calcAssetsBtnNo.addEventListener('click', () => {
        calcAssetsBtnNo.className = 'px-3 py-1 rounded-md text-xs font-bold transition-all bg-primary text-on-primary shadow-xs cursor-pointer';
        calcAssetsBtnYes.className = 'px-3 py-1 rounded-md text-xs font-bold transition-all text-on-surface-variant hover:text-on-surface cursor-pointer';
        calcAssetsContent.classList.add('hidden');
        if (calcTreesInput) calcTreesInput.value = 0;
        if (calcWellsInput) calcWellsInput.value = 0;
        if (calcStructuresInput) calcStructuresInput.value = 0;
        triggerDebouncedCalculation();
      });

      calcAssetsBtnYes.addEventListener('click', () => {
        calcAssetsBtnYes.className = 'px-3 py-1 rounded-md text-xs font-bold transition-all bg-primary text-on-primary shadow-xs cursor-pointer';
        calcAssetsBtnNo.className = 'px-3 py-1 rounded-md text-xs font-bold transition-all text-on-surface-variant hover:text-on-surface cursor-pointer';
        calcAssetsContent.classList.remove('hidden');
      });
    }

    // Modal Trigger Buttons
    if (openCompCalcHeader) {
      openCompCalcHeader.addEventListener('click', () => {
        const isAuth = isUserAuthenticated();
        const role = (isAuth && store.currentUser && store.currentUser.role) || '';
        const isOfficial = isAuth && ['dro-cala', 'state-revenue', 'central-ministry', 'requiring-body'].includes(role);
        window.openCompensationCalculatorModal(null, isOfficial ? 'detailed' : null);
      });
    }
    if (openCompCalcCitizen) {
      openCompCalcCitizen.addEventListener('click', () => window.openCompensationCalculatorModal(null, 'simple'));
    }
    if (openCompCalcCala) {
      openCompCalcCala.addEventListener('click', () => window.openCompensationCalculatorModal(null, 'detailed'));
    }

    if (closeCompCalcBtn) closeCompCalcBtn.addEventListener('click', window.closeCompensationCalculatorModal);
    if (closeCompCalcFooterBtn) closeCompCalcFooterBtn.addEventListener('click', window.closeCompensationCalculatorModal);
    if (compCalcPopulateBtn) {
      compCalcPopulateBtn.addEventListener('click', () => {
        if (!isUserAuthenticated()) {
          showToast('Authentication Required', 'Please sign in to auto-populate from your land records.', 'warning');
          return;
        }
        const p = getActiveCalcParcel();
        if (p) {
          populateCalcFromParcel(p);
          showToast('Parcel Loaded', `Auto-populated details for ${p.gutNumber || p.id}`, 'success');
        } else {
          showToast('No Parcel Selected', 'Select a cadastral parcel to auto-populate.', 'info');
        }
      });
    }
    if (compCalcResetBtn) compCalcResetBtn.addEventListener('click', resetCompensationCalculator);
    if (compCalcSubmitBtn) compCalcSubmitBtn.addEventListener('click', executeBackendCompensationCalculation);

    [calcAreaInput, calcAreaUnitSelect, calcCircleRateInput, calcCircleRateUnitSelect, calcMultiplierInput, calcTreesInput, calcWellsInput, calcStructuresInput, calcDateStartInput, calcDateEndInput, calcIncludeInterestCheck].forEach(inputEl => {
      if (inputEl) {
        inputEl.addEventListener('input', triggerDebouncedCalculation);
        inputEl.addEventListener('change', triggerDebouncedCalculation);
      }
    });

    document.querySelectorAll('.btn-multiplier-preset').forEach(btn => {
      btn.addEventListener('click', () => {
        const factor = btn.getAttribute('data-factor');
        if (calcMultiplierInput && factor) {
          calcMultiplierInput.value = factor;
          if (calcSimpleInputMultiplier) calcSimpleInputMultiplier.value = factor;
          if (calcSimpleMultiplierText) {
            calcSimpleMultiplierText.textContent = `Applied multiplier factor of ${factor}×`;
          }
          triggerDebouncedCalculation();
        }
      });
    });

    if (compCalcToggleAssetsBtn && calcAssetsContent) {
      compCalcToggleAssetsBtn.addEventListener('click', () => {
        const isHidden = calcAssetsContent.classList.contains('hidden');
        if (isHidden) {
          calcAssetsContent.classList.remove('hidden');
          if (calcAssetsToggleIcon) calcAssetsToggleIcon.style.transform = 'rotate(180deg)';
        } else {
          calcAssetsContent.classList.add('hidden');
          if (calcAssetsToggleIcon) calcAssetsToggleIcon.style.transform = 'rotate(0deg)';
        }
      });
    }

    if (compCalcModal) {
      compCalcModal.addEventListener('click', (e) => {
        if (e.target === compCalcModal) window.closeCompensationCalculatorModal();
      });
    }
  }

  // Drilldown helper
  window.drillToState = function(stateName) {
    window.NLAMS_SELECTED_STATE = stateName;
    updateStateDashboardHeaders(stateName);
    switchView('view-state', true);
    showToast(`State Directorate: ${stateName}`, `Displaying ${stateName} state corridor pipeline metrics.`, 'info');
  };

  // 7. Global Demo Triggers & Accessibility
  function setupGlobalDemoTriggers() {
    // 1. Trigger Live Lifecycle Action (wired to both button IDs)
    const handleLifecycleAction = () => {
      const res = store.triggerDemoLifecycleStep();
      showToast('Real-Time Statutory Sync', res.message, 'success');
      renderNationalProjectsTable();
      renderStateProjectsTable();
      renderDistrictCALAQueue();
      updateDocketView(selectedParcelId);
      mountDistrictGIS();
    };
    const demoBtn = document.getElementById('btn-trigger-demo');
    const lifecycleBtn = document.getElementById('btn-trigger-lifecycle');
    if (demoBtn) demoBtn.addEventListener('click', handleLifecycleAction);
    if (lifecycleBtn) lifecycleBtn.addEventListener('click', handleLifecycleAction);

    // 2. Export Gazette MIS -> Real CSV download
    const expGazette = document.getElementById('btn-export-gazette');
    if (expGazette) {
      expGazette.addEventListener('click', () => {
        const rows = [
          ['Notification_ID', 'Project_ID', 'Project_Name', 'State', 'District', 'Section', 'Gazette_Ref', 'Date', 'Status'],
          ['GAZ-2026-MH-4421', 'PRJ-MH-2026-001', 'Mumbai-Ahmedabad High-Speed Rail Corridor', 'Maharashtra', 'Palghar', 'Section 19(1)', 'Part II-Sec 3(ii) No 1824', '2026-09-08', 'Published'],
          ['GAZ-2026-UP-8812', 'PRJ-UP-2026-003', 'Ganga Expressway Phase II', 'Uttar Pradesh', 'Prayagraj', 'Section 11(1)', 'Part II-Sec 3(i) No 904', '2026-08-20', 'Published'],
          ['GAZ-2026-GJ-3310', 'PRJ-GJ-2026-002', 'Delhi-Mumbai Industrial Corridor Node', 'Gujarat', 'Bharuch', 'Section 20E', 'Part II-Sec 3(ii) No 641', '2026-09-01', 'Published']
        ];
        const csvContent = 'data:text/csv;charset=utf-8,' + rows.map(e => e.join(',')).join('\n');
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement('a');
        link.setAttribute('href', encodedUri);
        link.setAttribute('download', 'NLAMS_Gazette_MIS_Schedule_2026.csv');
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        showToast('Gazette MIS Exported', 'Downloaded Official Extraordinary Gazette Notification Schedule CSV.', 'success');
      });
    }

    // 3. PFMS Ledger Sync -> Real DBT ledger CSV download
    const expLedger = document.getElementById('btn-export-ledger');
    if (expLedger) {
      expLedger.addEventListener('click', () => {
        const rows = [
          ['Transaction_Ref', 'Khasra_No', 'Landowner_Name', 'Aadhaar_Token', 'Bank_IFSC', 'Amount_INR', 'Status', 'Timestamp'],
          ['PFMS-DBT-2026-8831', '412/1', 'Ramesh Tukaram Patil', 'XXXX-XXXX-8921', 'SBIN0001234', '1850000', 'Success', '2026-09-08 14:32:00'],
          ['PFMS-DBT-2026-8832', '412/2', 'Sunita Anand Rao', 'XXXX-XXXX-4412', 'MAHB0000456', '2400000', 'Success', '2026-09-08 15:10:12'],
          ['PFMS-DBT-2026-8833', '415/3', 'Gopal Kisan Shinde', 'XXXX-XXXX-6631', 'BKID0007890', '1250000', 'Success', '2026-09-09 11:20:45']
        ];
        const csvContent = 'data:text/csv;charset=utf-8,' + rows.map(e => e.join(',')).join('\n');
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement('a');
        link.setAttribute('href', encodedUri);
        link.setAttribute('download', 'PFMS_DBT_Disbursal_Ledger_2026.csv');
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        showToast('PFMS Ledger Exported', 'Direct Beneficiary Transfer (DBT) reconciliation ledger synced and downloaded.', 'success');
      });
    }

    // 4. Live GIS Sync
    const liveGisBtn = document.getElementById('btn-live-gis-sync');
    if (liveGisBtn) {
      liveGisBtn.addEventListener('click', () => {
        const now = new Date();
        const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')} IST`;
        const timeEl = document.getElementById('gis-sync-time');
        if (timeEl) timeEl.textContent = `Synced at ${timeStr}`;
        showToast('Live GIS Synchronized', `Survey of India & Bhunaksha spatial cadastral boundaries refreshed (${timeStr}).`, 'success');
      });
    }

    // 5. Reset All Filters (National View)
    const resetFiltersBtn = document.getElementById('btn-nat-reset-filters');
    if (resetFiltersBtn) {
      resetFiltersBtn.addEventListener('click', () => {
        const stateSelect = document.getElementById('nat-state-filter');
        const searchInput = document.getElementById('nat-search-projects-input');
        if (stateSelect) stateSelect.value = 'ALL';
        if (searchInput) searchInput.value = '';
        renderNationalProjectsTable('ALL', '');
        showToast('Filters Reset', 'Restored nationwide project portfolio view.', 'info');
      });
    }

    // 6. Issue Sec 20E Notice
    const sec20eBtn = document.getElementById('btn-sec-20e-notice');
    if (sec20eBtn) {
      sec20eBtn.addEventListener('click', () => {
        showToast('Section 20E Notice Issued', 'Declaration of Acquisition published for Corridor NH-48. CALA notified for summary enquiry proceedings.', 'success');
      });
    }

    // 7. Tribunal Review
    const tribunalBtn = document.getElementById('btn-tribunal-review');
    if (tribunalBtn) {
      tribunalBtn.addEventListener('click', () => {
        showToast('LARRA Tribunal Registry Active', '0 pending judicial stays for Corridor NH-48. All landowner claims expedited per Section 64.', 'info');
      });
    }

    // 8. User Profile Badge, Modal & Dropdown
    const userBadge = document.getElementById('header-user-badge');
    const userMenu = document.getElementById('user-profile-menu');
    const popupLogout = document.getElementById('btn-popup-logout');
    const popupSettings = document.getElementById('btn-popup-settings');
    const popupViewProfile = document.getElementById('btn-popup-view-profile');

    if (userBadge) {
      userBadge.addEventListener('click', (e) => {
        e.stopPropagation();
        if (userMenu) userMenu.classList.add('hidden');
        openMyProfileModal();
      });
    }

    if (popupViewProfile) {
      popupViewProfile.addEventListener('click', (e) => {
        e.preventDefault();
        if (userMenu) userMenu.classList.add('hidden');
        openMyProfileModal();
      });
    }

    if (popupLogout) {
      popupLogout.addEventListener('click', (e) => {
        e.preventDefault();
        if (userMenu) userMenu.classList.add('hidden');
        promptSignOutModal();
      });
    }

    if (popupSettings) {
      popupSettings.addEventListener('click', (e) => {
        e.preventDefault();
        if (userMenu) userMenu.classList.add('hidden');
        openProfileSetupModal(getUserRole());
      });
    }

    // Profile Modal Actions
    const btnCloseProfile = document.getElementById('btn-close-profile-modal');
    if (btnCloseProfile) {
      btnCloseProfile.addEventListener('click', closeMyProfileModal);
    }
    const btnDoneProfile = document.getElementById('btn-profile-done');
    if (btnDoneProfile) {
      btnDoneProfile.addEventListener('click', closeMyProfileModal);
    }
    const btnSignoutProfile = document.getElementById('btn-profile-signout');
    if (btnSignoutProfile) {
      btnSignoutProfile.addEventListener('click', (e) => {
        e.preventDefault();
        closeMyProfileModal();
        promptSignOutModal();
      });
    }

    // Sign Out Confirmation Modal Actions
    const btnCancelSignout = document.getElementById('btn-cancel-signout');
    const btnCloseSignout = document.getElementById('btn-close-signout-modal');
    const btnConfirmSignout = document.getElementById('btn-confirm-signout');

    if (btnCancelSignout) {
      btnCancelSignout.addEventListener('click', closeSignOutModal);
    }
    if (btnCloseSignout) {
      btnCloseSignout.addEventListener('click', closeSignOutModal);
    }
    if (btnConfirmSignout) {
      btnConfirmSignout.addEventListener('click', () => {
        closeSignOutModal();
        handleLogout();
      });
    }

    // Citizen Portal Specific Profile Triggers
    const citCardTrigger = document.getElementById('cit-card-profile-trigger');
    if (citCardTrigger) {
      citCardTrigger.addEventListener('click', openMyProfileModal);
    }
    const citCardUser = document.getElementById('cit-card-user-name');
    if (citCardUser) {
      citCardUser.style.cursor = 'pointer';
      citCardUser.addEventListener('click', openMyProfileModal);
    }
    const citBannerUser = document.getElementById('cit-banner-user-name');
    if (citBannerUser) {
      citBannerUser.style.cursor = 'pointer';
      citBannerUser.addEventListener('click', openMyProfileModal);
    }

    // Editable Mobile Handler with OTP verification simulation
    const btnEditMobile = document.getElementById('btn-edit-mobile');
    const btnSaveMobile = document.getElementById('btn-save-mobile');
    const btnCancelMobile = document.getElementById('btn-cancel-mobile');
    const boxMobile = document.getElementById('profile-mobile-edit-box');
    const inputMobile = document.getElementById('profile-mobile-input');
    const dispMobile = document.getElementById('profile-mobile-display');

    if (btnEditMobile && boxMobile) {
      btnEditMobile.addEventListener('click', () => {
        boxMobile.classList.toggle('hidden');
        if (inputMobile) inputMobile.focus();
      });
    }
    if (btnCancelMobile && boxMobile) {
      btnCancelMobile.addEventListener('click', () => {
        boxMobile.classList.add('hidden');
      });
    }
    if (btnSaveMobile && inputMobile) {
      btnSaveMobile.addEventListener('click', () => {
        const val = inputMobile.value.trim();
        if (val.length < 10) {
          showToast('Invalid Mobile', 'Please enter a valid 10-digit mobile number with country code.', 'error');
          return;
        }
        (window.NLAMS_STORE || store).updateUserContact(val, undefined);
        if (dispMobile) dispMobile.textContent = store.currentUser.maskedMobile || val;
        boxMobile.classList.add('hidden');
        showToast('OTP Verification Sent', 'A verification OTP was sent to ' + val + '. Registered mobile updated successfully.', 'success');
      });
    }

    // Editable Email Handler with verification simulation
    const btnEditEmail = document.getElementById('btn-edit-email');
    const btnSaveEmail = document.getElementById('btn-save-email');
    const btnCancelEmail = document.getElementById('btn-cancel-email');
    const boxEmail = document.getElementById('profile-email-edit-box');
    const inputEmail = document.getElementById('profile-email-input');
    const dispEmail = document.getElementById('profile-email-display');

    if (btnEditEmail && boxEmail) {
      btnEditEmail.addEventListener('click', () => {
        boxEmail.classList.toggle('hidden');
        if (inputEmail) inputEmail.focus();
      });
    }
    if (btnCancelEmail && boxEmail) {
      btnCancelEmail.addEventListener('click', () => {
        boxEmail.classList.add('hidden');
      });
    }
    if (btnSaveEmail && inputEmail) {
      btnSaveEmail.addEventListener('click', () => {
        const val = inputEmail.value.trim();
        if (!val.includes('@') || !val.includes('.')) {
          showToast('Invalid Email', 'Please provide a valid government or registered email address.', 'error');
          return;
        }
        (window.NLAMS_STORE || store).updateUserContact(undefined, val);
        if (dispEmail) dispEmail.textContent = val;
        boxEmail.classList.add('hidden');
        showToast('Verification Dispatched', 'A confirmation link has been sent to ' + val + '. Registered email updated.', 'success');
      });
    }

    // 9. Multilingual (i18n) Language Selector Integration
    const langSelect = document.getElementById('lang-select');
    if (langSelect) {
      langSelect.addEventListener('change', (e) => {
        const val = e.target.value;
        if (window.i18n && typeof window.i18n.setLanguage === 'function') {
          window.i18n.setLanguage(val);
        }
        const supported = window.i18n ? window.i18n.getSupportedLanguages() : null;
        const langObj = supported ? supported[val] : null;
        const langName = langObj ? `${langObj.nativeName} (${langObj.name})` : val;
        showToast('Language Preference', `Switched display language to ${langName}.`, 'info');
      });
    }

    // Global listener for language changes
    window.addEventListener('nlams:language-change', () => {
      renderNavbar();
      renderNationalDashboard();
      renderNationalProjectsTable();
      renderStateProjectsTable();
      renderDistrictCALAQueue();
      if (store.currentUser && store.currentUser.parcelId) {
        renderCitizenParcel(store.currentUser.parcelId);
      } else if (typeof selectedParcelId !== 'undefined' && selectedParcelId) {
        renderCitizenParcel(selectedParcelId);
      }
      if (window.i18n && typeof window.i18n.applyTranslations === 'function') {
        window.i18n.applyTranslations(document.body);
      }
    });
  }

  function setupAccessibility() {
    let currentScale = 1.0;
    const body = document.body;

    const decBtn = document.getElementById('font-decrease');
    const resBtn = document.getElementById('font-reset');
    const incBtn = document.getElementById('font-increase');

    if (decBtn) {
      decBtn.addEventListener('click', () => {
        if (currentScale > 0.85) {
          currentScale -= 0.05;
          body.style.fontSize = `${currentScale * 100}%`;
        }
      });
    }

    if (resBtn) {
      resBtn.addEventListener('click', () => {
        currentScale = 1.0;
        body.style.fontSize = '100%';
      });
    }

    if (incBtn) {
      incBtn.addEventListener('click', () => {
        if (currentScale < 1.25) {
          currentScale += 0.05;
          body.style.fontSize = `${currentScale * 100}%`;
        }
      });
    }
  }

  // Global window helpers for inline HTML callbacks
  window.selectCALAParcel = function(parcelId) {
    selectedParcelId = parcelId;
    updateDocketView(parcelId);
    renderDistrictCALAQueue();
    mountDistrictGIS();
  };

  window.inspectProjectGIS = function(projectId) {
    switchView('view-district');
  };

  window.advanceProjectPipeline = async function(projectId) {
    const proj = store.projects.find(p => p.id === projectId);
    if (!proj) return;

    if (proj.stage === 'Submitted') {
      await window.NLAMS_API.submitScrutinyDecision(projectId, 'APPROVE', 'Bhulekh RoR records verified.');
      showToast('Proposal Approved', `Requisition ${proj.id} cleared for State Gazette notification.`, 'success');
    } else if (proj.stage === 'Scrutinized') {
      await window.NLAMS_API.signGazetteNotification(projectId, '123456', 'GSR-MH-2025-912(E)');
      showToast('Gazette Published', `Section 3D Notification signed for ${proj.id}.`, 'success');
    } else if (proj.stage === 'Notified') {
      await window.NLAMS_API.declareAward(projectId);
      showToast('3G Award Declared', `Statutory award computed for ${proj.id}. Ready for PFMS DBT.`, 'success');
    } else if (proj.stage === 'Awarded') {
      await window.NLAMS_API.verifyAndConfirmPossession(projectId, {
        dgpsPegging: true,
        treeCropValuation: true,
        structureVacated: true,
        form3ECertificate: true
      }, store.currentUser.name);
      showToast('Title Vested', `Section 16 possession verified for ${proj.id}.`, 'success');
    }

    renderNationalProjectsTable();
    renderStateProjectsTable();
    renderDistrictCALAQueue();
    updateDocketView(selectedParcelId);
    mountDistrictGIS();
  };

  // Launch when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})(window, document);
