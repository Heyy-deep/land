/**
 * NLAMS - Main Application Orchestrator & View Controller
 * Department of Land Resources, Ministry of Rural Development, GoI
 */

(function(window, document) {
  'use strict';

  // Selected Active State
  let currentViewId = 'view-national'; // Start on National Overview
  let selectedParcelId = 'GUT-143-3A';

  // DOM Elements Cache
  let views = {};
  let navButtons = [];
  let store = window.NLAMS_STORE;

  // Initialize Application
  function init() {
    cacheDOM();
    setupNavigation();
    setupAuthInteractions();
    setupStateDashboard();
    setupDistrictDashboard();
    setupAgencyDashboard();
    setupCitizenDashboard();
    setupGlobalDemoTriggers();
    setupAccessibility();

    // Subscribe to Central Shared Reactive Store
    store.subscribe((event, payload) => {
      handleStoreUpdate(event, payload);
    });

    // Initial Renders
    renderNationalDashboard();
    renderStateProjectsTable();
    renderDistrictCALAQueue();
    renderCitizenParcel(selectedParcelId);

    // Initial View
    switchView('view-national');

    showToast('National Land Acquisition System Live', 'Connected to NIC MeghRaj Cloud Node DEL-04 with real-time PostgreSQL+PostGIS synchronization.', 'info');
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

  // Navigation & View Switching
  function setupNavigation() {
    navButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        const viewId = btn.getAttribute('data-view');
        switchView(viewId);
      });
    });

    // Header brand link returns to National view
    const homeLink = document.getElementById('brand-home-link');
    if (homeLink) {
      homeLink.addEventListener('click', () => switchView('view-national'));
    }
  }

  function switchView(viewId) {
    if (!views[viewId]) return;
    currentViewId = viewId;

    // Hide all views
    Object.values(views).forEach(v => {
      if (v) v.classList.add('hidden');
    });

    // Show target view
    views[viewId].classList.remove('hidden');

    // Update active nav button
    navButtons.forEach(btn => {
      if (btn.getAttribute('data-view') === viewId) {
        btn.classList.add('active-nav-tab');
      } else {
        btn.classList.remove('active-nav-tab');
      }
    });

    // Auto-align role with view
    const roleMapping = {
      'view-national': 'central-ministry',
      'view-state': 'state-revenue',
      'view-district': 'dro-cala',
      'view-agency': 'requiring-body',
      'view-citizen': 'citizen'
    };

    if (roleMapping[viewId]) {
      store.setUserRole(roleMapping[viewId]);
      updateActiveUserBadge(store.currentUser);
    }

    // Mount GIS components when corresponding view is opened
    if (viewId === 'view-national') {
      window.GISEngine.renderNationalMap('national-gis-map-container', (selectedState) => {
        showToast(`Drilling down to ${selectedState}`, 'Redirecting to State Directorate Dashboard...', 'info');
        switchView('view-state');
      });
    } else if (viewId === 'view-district') {
      mountDistrictGIS();
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function updateActiveUserBadge(user) {
    const nameEl = document.getElementById('active-user-name');
    const roleEl = document.getElementById('active-user-role-label');
    if (nameEl) nameEl.textContent = user.name;
    if (roleEl) roleEl.textContent = `${user.badge} | ${user.jurisdiction}`;
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
      <span class="material-symbols-outlined ${iconColor} text-2xl shrink-0">${icon}</span>
      <div class="flex flex-col min-w-0">
        <span class="font-label-md text-label-md font-bold text-primary">${title}</span>
        <span class="font-body-sm text-body-sm text-on-surface-variant mt-0.5">${message}</span>
      </div>
      <button class="ml-auto text-on-surface-variant hover:text-on-surface text-sm">&times;</button>
    `;

    toast.querySelector('button').addEventListener('click', () => {
      toast.remove();
    });

    tray.appendChild(toast);

    // Animate in
    setTimeout(() => {
      toast.classList.remove('translate-x-4', 'opacity-0');
    }, 20);

    // Auto remove after 5 seconds
    setTimeout(() => {
      toast.classList.add('opacity-0', 'translate-x-4');
      setTimeout(() => toast.remove(), 300);
    }, 5000);
  }

  // Reactive Store Update Listener
  function handleStoreUpdate(event, payload) {
    renderNationalDashboard();
    renderStateProjectsTable();
    renderDistrictCALAQueue();
    renderCitizenParcel(selectedParcelId);

    if (currentViewId === 'view-district') {
      mountDistrictGIS();
    }

    // Trigger specific feedback toasts based on statutory events
    switch(event) {
      case 'PROPOSAL_SUBMITTED':
        showToast('New Acquisition Proposal Generated', `[${payload.id}] ${payload.name} routed to District CALA queue for digital scrutiny.`, 'success');
        break;
      case 'SCRUTINY_APPROVED':
        showToast('Digital Scrutiny Approved', `${payload.name} verified against MahaBhumi cadastral records. Ready for State Section 11/19 Gazette.`, 'success');
        break;
      case 'NOTIFICATION_ISSUED':
        showToast('Statutory Gazette Published', `Section 3D Notification signed for ${payload.name}. RoW corridor geo-tagged on GIS.`, 'success');
        break;
      case 'AWARD_DECLARED':
        showToast('Section 3G Award Declared', `Statutory compensation computed with 100% solatium for ${payload.name}. Ready for PFMS DBT.`, 'success');
        break;
      case 'COMPENSATION_DISBURSED':
        showToast('Direct Benefit Transfer (DBT) Credited', `Compensation credited to ${payload.ownerName} for ${payload.gutNumber}. PFMS Ledger synced.`, 'success');
        break;
      case 'POSSESSION_CONFIRMED':
        showToast('Physical Possession Handed Over', `${payload.gutNumber} confirmed by Field Officer. Cadastral map updated to Possessed (Green).`, 'success');
        break;
      case 'OBJECTION_FILED':
        showToast('Section 15 Objection Registered', `Hearing listed before CALA Pune for ${payload.khasraNo}.`, 'warning');
        break;
    }
  }

  // 1. SSO Portal & Login Controller
  function setupAuthInteractions() {
    const roleSelect = document.getElementById('user-role-select');
    const roleDesc = document.getElementById('role-desc');
    const rolePill = document.getElementById('role-privilege-pill');

    const roleCapabilities = {
      'citizen': 'Citizen Access: View published Section 11 notices, check award compensation payment vouchers, and track rehabilitation entitlements.',
      'dro-cala': 'CALA / DRO Authority: Enter Award Enquiry proceedings, upload Section 19 declaration maps, and issue formal land vesting orders.',
      'requiring-body': 'Requiring Body (NHAI/Railways): Submit Form 1 acquisition proposals, upload CAD/GIS shapefiles, and remit compensation deposits.',
      'state-revenue': 'State Revenue Dept: Validate RoR/Jamabandi mutations, verify cadastral boundaries, and monitor tehsil-level pendency.',
      'central-ministry': 'DoLR Apex Dashboard: Review national multi-state mega-corridor status, oversee MIS disbursal audits, and policy reports.'
    };

    if (roleSelect && roleDesc) {
      roleSelect.addEventListener('change', (e) => {
        const val = e.target.value;
        if (roleCapabilities[val]) {
          roleDesc.textContent = roleCapabilities[val];
          rolePill.classList.remove('bg-surface-container-low');
          rolePill.classList.add('bg-surface-container');
        }
      });
    }

    // Toggle Aadhaar Masking
    const toggleMaskBtn = document.getElementById('btn-toggle-mask');
    const maskText = document.getElementById('mask-status-text');
    const uid1 = document.getElementById('login-uid-1');
    const uid2 = document.getElementById('login-uid-2');

    if (toggleMaskBtn && uid1 && uid2) {
      let isMasked = true;
      toggleMaskBtn.addEventListener('click', () => {
        isMasked = !isMasked;
        uid1.type = isMasked ? 'password' : 'text';
        uid2.type = isMasked ? 'password' : 'text';
        maskText.textContent = isMasked ? 'Show Unmasked' : 'Mask Digits';
      });
    }

    // Auto-focus shift across OTP inputs
    const otpInputs = document.querySelectorAll('.otp-box');
    otpInputs.forEach((input, index) => {
      input.addEventListener('keyup', (e) => {
        if (e.key >= '0' && e.key <= '9') {
          if (index < otpInputs.length - 1) {
            otpInputs[index + 1].focus();
          }
        } else if (e.key === 'Backspace') {
          if (index > 0 && !input.value) {
            otpInputs[index - 1].focus();
          }
        }
      });
    });

    // Login Form Submission -> Redirect to matching dashboard
    const loginForm = document.getElementById('nlams-auth-form');
    if (loginForm) {
      loginForm.addEventListener('submit', () => {
        const selectedRole = roleSelect ? roleSelect.value : 'central-ministry';
        store.setUserRole(selectedRole);

        const targetViews = {
          'central-ministry': 'view-national',
          'state-revenue': 'view-state',
          'dro-cala': 'view-district',
          'requiring-body': 'view-agency',
          'citizen': 'view-citizen'
        };

        showToast('e-KYC Authentication Successful', `Authenticated via UIDAI OTP. Redirecting to ${store.currentUser.badge} Dashboard...`, 'success');
        switchView(targetViews[selectedRole] || 'view-national');
      });
    }

    // DigiLocker Login Button
    const digiBtn = document.getElementById('btn-digilocker-login');
    if (digiBtn) {
      digiBtn.addEventListener('click', () => {
        showToast('MeriPehchaan SSO Connected', 'Fetched Aadhaar and Land Ownership token from DigiLocker repository.', 'info');
        store.setUserRole('citizen');
        switchView('view-citizen');
      });
    }
  }

  // 2. National Dashboard Render
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

  // 3. State Dashboard Controller
  function setupStateDashboard() {
    const distFilter = document.getElementById('state-district-filter');
    if (distFilter) {
      distFilter.addEventListener('change', () => {
        renderStateProjectsTable(distFilter.value);
      });
    }

    const searchInput = document.getElementById('search-projects-input');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        renderStateProjectsTable(distFilter ? distFilter.value : 'ALL', e.target.value.toLowerCase());
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
        showToast('PFMS Ledger Synchronization', 'Synced 36 District CALA bank accounts with Central Treasury.', 'success');
      });
    }

    const directiveBtn = document.getElementById('btn-issue-state-directive');
    if (directiveBtn) {
      directiveBtn.addEventListener('click', () => {
        showToast('State Nodal Directive Issued', 'Priority notice dispatched to Palghar Collectorate to complete JMS within 14 days.', 'warning');
      });
    }
  }

  function renderStateProjectsTable(filterDistrict = 'ALL', searchQuery = '') {
    const tbody = document.getElementById('state-projects-table-body');
    if (!tbody) return;

    const stats = store.getStateStats();
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

    let filtered = store.projects;
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

    tbody.innerHTML = filtered.map(p => {
      const badgeColors = {
        'Possession': 'bg-surface-container text-tertiary',
        'Awarded': 'bg-surface-container text-primary',
        'Notified': 'bg-surface-container-highest text-primary-container',
        'Scrutinized': 'bg-surface-container text-secondary',
        'Submitted': 'bg-surface-container-high text-on-surface-variant',
        'Closed': 'bg-surface-container text-tertiary'
      };
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
              <button onclick="window.advanceProjectPipeline('${p.id}')" class="px-2 py-1 bg-surface-container hover:bg-primary hover:text-on-primary text-primary rounded font-label-sm text-xs font-bold transition-colors" title="Advance Lifecycle Stage">
                Advance →
              </button>
            </div>
          </td>
        </tr>
      `;
    }).join('');
  }

  // 4. District / CALA Dashboard Controller
  function setupDistrictDashboard() {
    const btnApprove = document.getElementById('btn-cala-approve');
    const btnAward = document.getElementById('btn-cala-award');
    const btnDisburse = document.getElementById('btn-cala-disburse');
    const btnPossession = document.getElementById('btn-cala-possession');
    const btnBulk = document.getElementById('btn-cala-bulk-action');

    if (btnApprove) {
      btnApprove.addEventListener('click', () => {
        const parcel = store.parcels.find(p => p.id === selectedParcelId);
        if (parcel) {
          parcel.status = 'Awarded';
          parcel.statusLabel = 'Sec 3G Award Ready';
          store.logAudit(store.currentUser.name, 'CALA Pune', `Approved Digital Scrutiny for ${parcel.gutNumber}`);
          store.dispatch('SCRUTINY_APPROVED', parcel);
        }
      });
    }

    if (btnAward) {
      btnAward.addEventListener('click', () => {
        const parcel = store.parcels.find(p => p.id === selectedParcelId);
        if (parcel) {
          parcel.status = 'Awarded';
          parcel.statusLabel = 'Sec 3G Award Passed';
          store.declareAward(parcel.projectId);
        }
      });
    }

    if (btnDisburse) {
      btnDisburse.addEventListener('click', () => {
        store.disburseCompensation(selectedParcelId);
      });
    }

    if (btnPossession) {
      btnPossession.addEventListener('click', () => {
        store.confirmPhysicalPossession(selectedParcelId, store.currentUser.name);
      });
    }

    if (btnBulk) {
      btnBulk.addEventListener('click', () => {
        store.parcels.forEach(p => {
          if (p.status === 'Scrutiny') {
            p.status = 'Possessed';
            p.statusLabel = 'Possessed / Handed Over';
          }
        });
        store.dispatch('POSSESSION_CONFIRMED', store.parcels[2]);
        showToast('Bulk Clearance Completed', 'All pending cadastral parcels cleared under Section 16 vesting.', 'success');
      });
    }
  }

  function mountDistrictGIS() {
    window.GISEngine.renderCadastralViewer('district-cadastral-gis-mount', selectedParcelId, (parcelId) => {
      selectedParcelId = parcelId;
      updateDocketView(parcelId);
      mountDistrictGIS();
    });
  }

  function updateDocketView(parcelId) {
    const parcel = store.parcels.find(p => p.id === parcelId);
    if (!parcel) return;

    const titleEl = document.getElementById('docket-gut-title');
    const projEl = document.getElementById('docket-project-name');
    const badgeEl = document.getElementById('docket-status-badge');
    const ownerEl = document.getElementById('docket-owner-name');
    const areaEl = document.getElementById('docket-area');
    const typeEl = document.getElementById('docket-type');
    const overlapEl = document.getElementById('docket-overlap');

    if (titleEl) titleEl.textContent = parcel.gutNumber;
    if (projEl) projEl.textContent = parcel.projectName;
    if (badgeEl) badgeEl.textContent = parcel.statusLabel.toUpperCase();
    if (ownerEl) ownerEl.textContent = parcel.ownerName;
    if (areaEl) areaEl.textContent = `${parcel.areaHa} Ha (${parcel.areaSqM} m²)`;
    if (typeEl) typeEl.textContent = parcel.landType;
    if (overlapEl) overlapEl.textContent = `${parcel.overlapPercent}% RoW`;
  }

  function renderDistrictCALAQueue() {
    const listEl = document.getElementById('cala-parcels-list');
    if (!listEl) return;

    listEl.innerHTML = store.parcels.map(p => `
      <div onclick="window.selectCALAParcel('${p.id}')" class="p-spacing-xs rounded bg-surface-container-low hover:bg-surface-container cursor-pointer flex items-center justify-between border border-outline-variant/30 transition-colors ${p.id === selectedParcelId ? 'border-primary bg-surface-container' : ''}">
        <div class="flex flex-col">
          <span class="font-label-sm text-label-sm font-bold text-on-surface">${p.gutNumber} • ${p.ownerName.split(' ')[0]}</span>
          <span class="text-legal-code font-legal-code text-on-surface-variant">${p.areaHa} Ha • ${p.statusLabel.slice(0, 20)}</span>
        </div>
        <span class="w-2.5 h-2.5 rounded-full" style="background-color: ${p.statusColor || '#15803d'}"></span>
      </div>
    `).join('');

    updateDocketView(selectedParcelId);
  }

  // 5. Implementing Agency Dashboard Controller
  function setupAgencyDashboard() {
    const form = document.getElementById('form-new-proposal');
    if (form) {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        const data = {
          projectName: document.getElementById('prop-name').value,
          agency: document.getElementById('prop-agency').value,
          sector: document.getElementById('prop-sector').value,
          district: document.getElementById('prop-district').value,
          requiredLandHa: document.getElementById('prop-land-ha').value,
          budgetCr: document.getElementById('prop-budget-cr').value,
          khasraCount: Math.floor(Math.random() * 200) + 40,
          affectedFamilies: Math.floor(Math.random() * 500) + 80
        };

        const created = store.submitNewProposal(data);
        showToast('Form 1 Submission Success', `Project ${created.id} initiated and sent to District Scrutiny Queue!`, 'success');
        switchView('view-district');
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

  // 6. Citizen Dashboard Controller
  function setupCitizenDashboard() {
    const searchBtn = document.getElementById('btn-citizen-search');
    const searchInput = document.getElementById('citizen-khasra-search');

    function executeSearch() {
      const q = searchInput.value.trim().toLowerCase();
      const matched = store.parcels.find(p => 
        p.gutNumber.toLowerCase().includes(q) || 
        p.khasraNo.toLowerCase().includes(q) ||
        p.ownerName.toLowerCase().includes(q)
      ) || store.parcels[0];

      renderCitizenParcel(matched.id);
      showToast('Land Record Retrieved', `Loaded digital cadastral record for ${matched.gutNumber} from Bhoomi database.`, 'info');
    }

    if (searchBtn) searchBtn.addEventListener('click', executeSearch);
    if (searchInput) {
      searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') executeSearch();
      });
    }

    // File Objection Form
    const objForm = document.getElementById('form-file-objection');
    if (objForm) {
      objForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const type = document.getElementById('obj-type').value;
        const grounds = document.getElementById('obj-grounds').value;

        if (!grounds.trim()) {
          alert('Please enter statement of grounds for objection.');
          return;
        }

        const parcel = store.parcels.find(p => p.id === selectedParcelId) || store.parcels[0];
        store.fileObjection({
          parcelId: parcel.id,
          khasraNo: parcel.gutNumber,
          type: type,
          grounds: grounds
        });

        document.getElementById('obj-grounds').value = '';
      });
    }
  }

  function renderCitizenParcel(parcelId) {
    const parcel = store.parcels.find(p => p.id === parcelId) || store.parcels[0];
    selectedParcelId = parcel.id;

    const titleEl = document.getElementById('cit-gut-title');
    const statusPill = document.getElementById('cit-status-pill');
    const projEl = document.getElementById('cit-project-name');
    const areaEl = document.getElementById('cit-area');
    const typeEl = document.getElementById('cit-type');
    const valEl = document.getElementById('cit-total-val');
    const calcFinalEl = document.getElementById('cit-calc-final');
    const dbtDescEl = document.getElementById('cit-dbt-desc');

    if (titleEl) titleEl.textContent = parcel.gutNumber;
    if (statusPill) statusPill.textContent = parcel.statusLabel.toUpperCase();
    if (projEl) projEl.textContent = `${parcel.projectName} (${parcel.village} Sector)`;
    if (areaEl) areaEl.textContent = `${parcel.areaHa} Ha`;
    if (typeEl) typeEl.textContent = parcel.landType;
    if (valEl) valEl.textContent = `₹${(parcel.totalCompensation / 100000).toFixed(2)} L`;
    if (calcFinalEl) calcFinalEl.textContent = `₹${parcel.totalCompensation.toLocaleString('en-IN')}`;
    if (dbtDescEl) {
      dbtDescEl.textContent = `Status: ${parcel.dbtStatus} on ${parcel.disbursedDate}. Entitlement: ${parcel.rrEntitlement}`;
    }
  }

  // 7. Global Demo Triggers & Accessibility
  function setupGlobalDemoTriggers() {
    const demoBtn = document.getElementById('btn-trigger-demo');
    if (demoBtn) {
      demoBtn.addEventListener('click', () => {
        const res = store.triggerDemoLifecycleStep();
        showToast('Real-Time Statutory Sync', res.message, 'success');
      });
    }

    // Export Handlers
    const expGazette = document.getElementById('btn-export-gazette');
    if (expGazette) {
      expGazette.addEventListener('click', () => {
        showToast('Gazette Export Ready', 'Downloaded Official Extraordinary Gazette Notification schedule PDF with digital signature.', 'info');
      });
    }

    const expLedger = document.getElementById('btn-export-ledger');
    if (expLedger) {
      expLedger.addEventListener('click', () => {
        showToast('PFMS Ledger Exported', 'Exported direct beneficiary transfer transaction reconciliation spreadsheet.', 'info');
      });
    }
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
    mountDistrictGIS();
  };

  window.inspectProjectGIS = function(projectId) {
    switchView('view-district');
  };

  window.advanceProjectPipeline = function(projectId) {
    const proj = store.projects.find(p => p.id === projectId);
    if (!proj) return;

    if (proj.stage === 'Submitted') {
      store.scrutinizeProposal(projectId, 'APPROVE');
    } else if (proj.stage === 'Scrutinized') {
      store.issueStatutoryNotification(projectId, 'GSR-MH-2024-912');
    } else if (proj.stage === 'Notified') {
      store.declareAward(projectId);
    } else if (proj.stage === 'Awarded') {
      proj.stage = 'Possession';
      proj.statusBadge = 'Possession';
      proj.slaStatus = 'Complete';
      store.logAudit(store.currentUser.name, 'Field Officer', `Possession handed over for ${proj.name}`);
      store.dispatch('POSSESSION_CONFIRMED', proj);
    }
  };

  // Launch when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})(window, document);
