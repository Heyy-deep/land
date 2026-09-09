/**
 * NLAMS - Main Application Orchestrator & View Controller
 * Department of Land Resources, Ministry of Rural Development, GoI
 */

(function(window, document) {
  'use strict';

  // Selected Active State
  let currentViewId = 'view-national';
  let selectedParcelId = 'GUT-143-3A';

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
    'view-login': '<button data-view="view-login" class="dash-nav-btn px-spacing-sm py-1.5 rounded flex items-center gap-1 font-label-md text-label-md text-primary-fixed-dim hover:bg-primary-container hover:text-on-primary transition-colors cursor-pointer whitespace-nowrap"><span class="material-symbols-outlined text-[16px]">lock</span> SSO Portal</button>',
    'view-national': '<button data-view="view-national" class="dash-nav-btn px-spacing-sm py-1.5 rounded flex items-center gap-1 font-label-md text-label-md text-primary-fixed-dim hover:bg-primary-container hover:text-on-primary transition-colors cursor-pointer whitespace-nowrap"><span class="material-symbols-outlined text-[16px]">analytics</span> 1. National Dashboard</button>',
    'view-state': '<button data-view="view-state" class="dash-nav-btn px-spacing-sm py-1.5 rounded flex items-center gap-1 font-label-md text-label-md text-primary-fixed-dim hover:bg-primary-container hover:text-on-primary transition-colors cursor-pointer whitespace-nowrap"><span class="material-symbols-outlined text-[16px]">map</span> 2. State Dashboard</button>',
    'view-district': '<button data-view="view-district" class="dash-nav-btn px-spacing-sm py-1.5 rounded flex items-center gap-1 font-label-md text-label-md text-primary-fixed-dim hover:bg-primary-container hover:text-on-primary transition-colors cursor-pointer whitespace-nowrap"><span class="material-symbols-outlined text-[16px]">share_location</span> 3. District / CALA</button>',
    'view-agency': '<button data-view="view-agency" class="dash-nav-btn px-spacing-sm py-1.5 rounded flex items-center gap-1 font-label-md text-label-md text-primary-fixed-dim hover:bg-primary-container hover:text-on-primary transition-colors cursor-pointer whitespace-nowrap"><span class="material-symbols-outlined text-[16px]">add_box</span> 4. Implementing Agency</button>',
    'view-citizen': '<button data-view="view-citizen" class="dash-nav-btn px-spacing-sm py-1.5 rounded flex items-center gap-1 font-label-md text-label-md text-primary-fixed-dim hover:bg-primary-container hover:text-on-primary transition-colors cursor-pointer whitespace-nowrap"><span class="material-symbols-outlined text-[16px]">badge</span> 5. Citizen Portal</button>'
  };

  const LOGOUT_TAB_TEMPLATE = '<button id="btn-navbar-logout" class="dash-nav-btn px-spacing-sm py-1.5 rounded flex items-center gap-1 font-label-md text-label-md text-primary-fixed-dim hover:bg-primary-container hover:text-on-primary transition-colors cursor-pointer whitespace-nowrap"><span class="material-symbols-outlined text-[16px]">logout</span> Sign Out / लॉग आउट</button>';

  function isUserAuthenticated() {
    return sessionStorage.getItem('nlams_is_authenticated') === 'true';
  }

  function getUserRole() {
    return sessionStorage.getItem('nlams_session_role') || store.currentUser?.role || 'central-ministry';
  }

  function handleLogout() {
    sessionStorage.removeItem('nlams_is_authenticated');
    sessionStorage.removeItem('nlams_session_role');
    updateActiveUserBadge({ name: 'Public Portal', badge: 'Not Authenticated', jurisdiction: 'Guest' });
    showToast('Session Terminated', 'Logged out successfully from NLAMS. Returning to SSO Portal.', 'info');
    renderNavbar();
    if (window.location.hash !== '#/login') {
      window.history.replaceState(null, '', '#/login');
    }
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

    // Initial Renders
    renderNationalDashboard();
    renderNationalProjectsTable();
    renderStateProjectsTable();
    renderDistrictCALAQueue();
    renderCitizenParcel(selectedParcelId);

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
        handleLogout();
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

    // Header active user badge click allows quick sign out
    const userBadge = document.querySelector('#active-user-name')?.closest('.flex');
    if (userBadge) {
      userBadge.style.cursor = 'pointer';
      userBadge.title = isUserAuthenticated() ? 'Click to Sign Out' : 'SSO Portal';
      userBadge.addEventListener('click', () => {
        if (isUserAuthenticated()) {
          if (confirm(`Currently signed in as ${store.currentUser.name} (${store.currentUser.badge}). Sign out?`)) {
            handleLogout();
          }
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
    renderNationalDashboard();
    renderNationalProjectsTable();
    renderStateProjectsTable();
    renderDistrictCALAQueue();
    if (selectedParcelId) {
      renderCitizenParcel(selectedParcelId);
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
        showToast('Section 15 Objection Registered', `Hearing listed before CALA Pune for ${payload.khasraNo}.`, 'warning');
        break;
      case 'RR_COMPLETED':
        showToast('R&R Resettlement Completed', `Rehabilitated ${payload.familiesCount} displaced families with alternative housing & grants under Section 31.`, 'success');
        break;
    }
  }

  // 1. SSO Portal & Login Controller (Requirements 1, 6)
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

    // Login Form Submission -> Assign role, update navbar with RBAC & navigate (Requirements 1, 2, 6)
    const loginForm = document.getElementById('nlams-auth-form');
    if (loginForm) {
      loginForm.addEventListener('submit', () => {
        const selectedRole = roleSelect ? roleSelect.value : 'central-ministry';

        // Set session state
        sessionStorage.setItem('nlams_is_authenticated', 'true');
        sessionStorage.setItem('nlams_session_role', selectedRole);
        store.setUserRole(selectedRole);
        updateActiveUserBadge(store.currentUser);

        // Render RBAC navbar (removes all other 4 dashboard tabs)
        renderNavbar();

        // Redirect to authorized dashboard
        const roleConfig = ROLE_DASHBOARD_MAP[selectedRole] || ROLE_DASHBOARD_MAP['central-ministry'];
        showToast('e-KYC Authentication Successful', `Authenticated via UIDAI OTP as ${store.currentUser.badge}. Redirecting to ${roleConfig.dashboardName}...`, 'success');
        switchView(roleConfig.viewId, true);
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
        renderNavbar();

        showToast('MeriPehchaan SSO Connected', 'Fetched Aadhaar and Land Ownership token from DigiLocker repository.', 'info');
        switchView('view-citizen', true);
      });
    }
  }

  // 2. National Dashboard Render & Controllers
  function setupNationalDashboard() {
    const stateFilter = document.getElementById('nat-state-filter');
    const searchInput = document.getElementById('nat-search-projects-input');

    if (stateFilter) {
      stateFilter.addEventListener('change', () => {
        renderNationalProjectsTable(stateFilter.value, searchInput ? searchInput.value.trim().toLowerCase() : '');
      });
    }

    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        renderNationalProjectsTable(stateFilter ? stateFilter.value : 'ALL', e.target.value.trim().toLowerCase());
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

  function renderNationalProjectsTable(filterState = 'ALL', searchQuery = '') {
    const tbody = document.getElementById('nat-projects-table-body');
    if (!tbody) return;

    let filtered = [...store.projects];
    if (filterState !== 'ALL') {
      filtered = filtered.filter(p => p.state.toLowerCase() === filterState.toLowerCase());
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
  }

  // 3. State Dashboard Controller (Scoped to Maharashtra)
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

    // Strict State-Level Scoping: Maharashtra Only
    let filtered = store.projects.filter(p => p.state === 'Maharashtra');
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
  }

  // 4. District / CALA Dashboard Controller
  let activeSigningProjectId = 'REQ-MH-THN-2023-0892';

  function setupDistrictDashboard() {
    const btnApprove = document.getElementById('btn-cala-approve');
    const btnAward = document.getElementById('btn-cala-award');
    const btnRework = document.getElementById('btn-cala-rework');
    const btnReject = document.getElementById('btn-cala-reject');
    const btnDisburse = document.getElementById('btn-cala-disburse');
    const btnPossession = document.getElementById('btn-cala-possession');
    const btnViewDossier = document.getElementById('btn-cala-view-dossier');
    const btnBulk = document.getElementById('btn-cala-bulk-action');

    if (btnApprove) {
      btnApprove.addEventListener('click', async () => {
        const res = await window.NLAMS_API.submitScrutinyDecision(selectedParcelId, 'APPROVE', 'Passed Bhulekh Validation & RoR Verification', store.currentUser.name);
        if (res.ok) {
          updateDocketView(selectedParcelId);
          renderDistrictCALAQueue();
          mountDistrictGIS();
        }
      });
    }

    if (btnRework) {
      btnRework.addEventListener('click', async () => {
        const reason = prompt('Enter statutory discrepancy details for sending back proposal for rework:', 'Update KML right-of-way corridor boundary and clarify non-agricultural mutation.');
        if (reason) {
          const res = await window.NLAMS_API.submitScrutinyDecision(selectedParcelId, 'SEND_BACK', reason, store.currentUser.name);
          if (res.ok) {
            updateDocketView(selectedParcelId);
            renderDistrictCALAQueue();
            mountDistrictGIS();
          }
        }
      });
    }

    if (btnReject) {
      btnReject.addEventListener('click', async () => {
        const reason = prompt('Enter grounds for statutory proposal rejection under Section 7:', 'Proposal violates eco-sensitive buffer zone constraints and overlaps with protected forest land.');
        if (reason) {
          const res = await window.NLAMS_API.submitScrutinyDecision(selectedParcelId, 'REJECT', reason, store.currentUser.name);
          if (res.ok) {
            updateDocketView(selectedParcelId);
            renderDistrictCALAQueue();
            mountDistrictGIS();
          }
        }
      });
    }

    if (btnAward) {
      btnAward.addEventListener('click', () => {
        const parcel = store.parcels.find(p => p.id === selectedParcelId || p.properties?.id === selectedParcelId);
        if (parcel) {
          const props = parcel.properties || parcel;
          store.declareAward(props.projectId);
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
          if (props.status === 'Scrutiny') {
            props.status = 'Possessed';
            props.statusLabel = 'Possessed / Handed Over';
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
    if (badgeEl) badgeEl.textContent = props.statusLabel.toUpperCase();
    if (ownerEl) ownerEl.textContent = props.ownerName;
    if (areaEl) areaEl.textContent = `${props.areaHa} Ha (${props.areaSqM} m²)`;
    if (typeEl) typeEl.textContent = props.landType;
    if (overlapEl) overlapEl.textContent = `${props.overlapPercent}% RoW`;
  }

  function renderDistrictCALAQueue() {
    const listEl = document.getElementById('cala-parcels-list');
    if (!listEl) return;

    listEl.innerHTML = store.parcels.map(p => {
      const props = p.properties || p;
      return `
        <div onclick="window.selectCALAParcel('${props.id}')" class="p-spacing-xs rounded bg-surface-container-low hover:bg-surface-container cursor-pointer flex items-center justify-between border border-outline-variant/30 transition-colors ${props.id === selectedParcelId ? 'border-primary bg-surface-container' : ''}">
          <div class="flex flex-col">
            <span class="font-label-sm text-label-sm font-bold text-on-surface">${props.gutNumber} • ${props.ownerName.split(' ')[0]}</span>
            <span class="text-legal-code font-legal-code text-on-surface-variant">${props.areaHa} Ha • ${props.statusLabel.slice(0, 20)}</span>
          </div>
          <span class="w-2.5 h-2.5 rounded-full" style="background-color: ${props.statusColor || '#15803d'}"></span>
        </div>
      `;
    }).join('');

    updateDocketView(selectedParcelId);
  }

  // 5. Implementing Agency Dashboard Controller
  function setupAgencyDashboard() {
    const form = document.getElementById('form-new-proposal');
    if (form) {
      form.addEventListener('submit', async (e) => {
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

        const res = await window.NLAMS_API.submitProposal(data, store.currentUser.name);
        if (res.ok) {
          showToast('Form 1 Submission Success', `Project ${res.data.id} registered and forwarded to District CALA Scrutiny Queue!`, 'success');
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

  // 6. Citizen Dashboard Controller (Strictly Scoped to Ramesh Narayan Patil & Gut No. 142/1)
  function setupCitizenDashboard() {
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

        const parcel = store.parcels.find(p => (p.properties || p).id === 'GUT-142-1') || store.parcels[0];
        const props = parcel.properties || parcel;

        store.fileObjection({
          parcelId: props.id,
          khasraNo: props.gutNumber,
          type: type,
          grounds: grounds
        });

        document.getElementById('obj-grounds').value = '';
      });
    }
  }

  function renderCitizenParcel(parcelId) {
    // Strictly Scoped to Authenticated Landowner (Ramesh Narayan Patil -> GUT-142-1)
    const citizenParcel = store.parcels.find(p => (p.properties || p).id === 'GUT-142-1') || store.parcels[0];
    const props = citizenParcel.properties || citizenParcel;
    selectedParcelId = props.id;

    const titleEl = document.getElementById('cit-gut-title');
    const statusPill = document.getElementById('cit-status-pill');
    const projEl = document.getElementById('cit-project-name');
    const areaEl = document.getElementById('cit-area');
    const typeEl = document.getElementById('cit-type');
    const valEl = document.getElementById('cit-total-val');
    const calcFinalEl = document.getElementById('cit-calc-final');
    const dbtDescEl = document.getElementById('cit-dbt-desc');

    if (titleEl) titleEl.textContent = props.gutNumber;
    if (statusPill) statusPill.textContent = props.statusLabel.toUpperCase();
    if (projEl) projEl.textContent = `${props.projectName} (${props.village} Sector)`;
    if (areaEl) areaEl.textContent = `${props.areaHa} Ha`;
    if (typeEl) typeEl.textContent = props.landType;
    if (valEl) valEl.textContent = `₹${(props.totalCompensation / 100000).toFixed(2)} L`;
    if (calcFinalEl) calcFinalEl.textContent = `₹${props.totalCompensation.toLocaleString('en-IN')}`;
    if (dbtDescEl) {
      dbtDescEl.textContent = `Status: ${props.dbtStatus} on ${props.disbursedDate}. Entitlement: ${props.rrEntitlement}`;
    }
  }

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
      if (modal) modal.classList.remove('hidden');
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

      const modal = document.getElementById('modal-scrutiny-dossier');
      if (modal) modal.classList.remove('hidden');
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
        const res = await window.NLAMS_API.submitScrutinyDecision(selectedParcelId, 'APPROVE', remarks, store.currentUser.name);
        if (res.ok) {
          document.getElementById('modal-scrutiny-dossier')?.classList.add('hidden');
          updateDocketView(selectedParcelId);
          renderDistrictCALAQueue();
          mountDistrictGIS();
        }
      });
    }

    if (dossierReworkBtn) {
      dossierReworkBtn.addEventListener('click', async () => {
        const remarks = document.getElementById('dossier-decision-remarks')?.value || 'KML alignment boundary discrepancy. Returned for revision.';
        const res = await window.NLAMS_API.submitScrutinyDecision(selectedParcelId, 'SEND_BACK', remarks, store.currentUser.name);
        if (res.ok) {
          document.getElementById('modal-scrutiny-dossier')?.classList.add('hidden');
          updateDocketView(selectedParcelId);
          renderDistrictCALAQueue();
          mountDistrictGIS();
        }
      });
    }

    if (dossierRejectBtn) {
      dossierRejectBtn.addEventListener('click', async () => {
        const remarks = document.getElementById('dossier-decision-remarks')?.value || 'Statutory grounds: Violates Section 7 environmental baseline.';
        const res = await window.NLAMS_API.submitScrutinyDecision(selectedParcelId, 'REJECT', remarks, store.currentUser.name);
        if (res.ok) {
          document.getElementById('modal-scrutiny-dossier')?.classList.add('hidden');
          updateDocketView(selectedParcelId);
          renderDistrictCALAQueue();
          mountDistrictGIS();
        }
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
      if (modal) modal.classList.remove('hidden');
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

        const res = await window.NLAMS_API.verifyAndConfirmPossession(selectedParcelId, checklist, officerName);
        if (res.ok) {
          document.getElementById('modal-possession-checklist')?.classList.add('hidden');
          showToast('Title Vested in State', `All 4 statutory checklist points verified. Land title vested under RFCTLARR Section 16.`, 'success');
          updateDocketView(selectedParcelId);
          renderDistrictCALAQueue();
          mountDistrictGIS();
        } else {
          showToast('Verification Incomplete', res.message, 'warning');
        }
      });
    }

    // --- 7D. Statutory R&R Resettlement Modal ---
    window.openRNRModal = function(projectId) {
      const proj = store.projects.find(p => p.id === projectId) || store.projects[0];
      const titleEl = document.getElementById('rnr-project-title');
      if (titleEl && proj) titleEl.textContent = `${proj.name} (${proj.district})`;
      const famInput = document.getElementById('rnr-families-count');
      if (famInput && proj) famInput.value = proj.affectedFamilies || 120;
      const modal = document.getElementById('modal-rnr-resettlement');
      if (modal) modal.classList.remove('hidden');
    };

    const btnCalaRnr = document.getElementById('btn-cala-rnr');
    if (btnCalaRnr) {
      btnCalaRnr.addEventListener('click', () => {
        const parcel = store.parcels.find(p => p.id === selectedParcelId || p.properties?.id === selectedParcelId);
        const projId = parcel ? (parcel.properties || parcel).projectId : 'REQ-MH-PUN-2023-0892';
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
        const projId = parcel ? (parcel.properties || parcel).projectId : 'REQ-MH-PUN-2023-0892';

        const res = await window.NLAMS_API.completeResettlement(projId, count, officer);
        if (res.ok) {
          document.getElementById('modal-rnr-resettlement')?.classList.add('hidden');
          showToast('R&R Complete', `Successfully marked R&R complete for ${count} displaced families under Section 31.`, 'success');
        }
      });
    }
  }

  // Drilldown helper
  window.drillToState = function(stateName) {
    if (stateName === 'Maharashtra') {
      switchView('view-state');
      showToast('State Directorate Loaded', 'Viewing Maharashtra Revenue & Cadastral Matrix.', 'info');
    } else {
      showToast(`State Directorate: ${stateName}`, `Displaying ${stateName} state corridor pipeline metrics.`, 'info');
    }
  };

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
