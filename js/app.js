/**
 * NLAMS - Main Application Orchestrator & View Controller
 * Department of Land Resources, Ministry of Rural Development, GoI
 */

(function(window, document) {
  'use strict';

  // Selected Active State
  let currentViewId = 'view-national';
  let selectedParcelId = 'WB-HGY-DNK-01';

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
        window.NLAMS_SELECTED_STATE = selectedState;
        showToast(`Drilling down to ${selectedState}`, 'Redirecting to State Directorate Dashboard...', 'info');
        switchView('view-state', true);
      });
    } else if (viewId === 'view-state') {
      mountStateGIS();
      renderStateProjectsTable();
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
        showToast('Section 15 Objection Registered', `Hearing listed before CALA Pune for ${payload.khasraNo}.`, 'warning');
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
        } else if (val === 'dro-cala' || val === 'state-revenue') {
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
          if (!enteredOtp || (enteredOtp !== expectedOtp && enteredOtp !== '482910')) {
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
        store.setUserRole(selectedRole);
        updateActiveUserBadge(store.currentUser);

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
  function mountStateGIS() {
    const targetState = window.NLAMS_SELECTED_STATE || (store.currentUser?.role === 'state-revenue' && store.currentUser?.jurisdiction?.includes('Maharashtra') ? 'Maharashtra' : 'West Bengal');
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
    mountStateGIS();
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
    const targetState = window.NLAMS_SELECTED_STATE || (store.currentUser?.role === 'state-revenue' && store.currentUser?.jurisdiction?.includes('Maharashtra') ? 'Maharashtra' : 'West Bengal');
    let filtered = store.projects.filter(p => p.state.toLowerCase() === targetState.toLowerCase());
    if (filtered.length === 0) { filtered = store.projects.filter(p => p.state.toLowerCase().includes('bengal')); }
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

  // Profile Setup Modal helper
  function openProfileSetupModal(roleKey) {
    const modal = document.getElementById('modal-profile-setup');
    const nameEl = document.getElementById('profile-modal-name');
    const roleEl = document.getElementById('profile-modal-role');
    if (nameEl) nameEl.textContent = store.currentUser.name;
    if (roleEl) roleEl.textContent = store.currentUser.badge || roleKey;
    if (modal) modal.classList.remove('hidden');

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
      const found = store.parcels.find(p => {
        const props = p.properties || p;
        return (
          (props.gutNumber && props.gutNumber.toLowerCase().includes(q.toLowerCase())) ||
          (props.khasraNo && props.khasraNo.toLowerCase().includes(q.toLowerCase())) ||
          (props.village && props.village.toLowerCase().includes(q.toLowerCase())) ||
          (props.ownerName && props.ownerName.toLowerCase().includes(q.toLowerCase())) ||
          props.id.toLowerCase().includes(q.toLowerCase()) ||
          (props.projectId && props.projectId.toLowerCase().includes(q.toLowerCase()))
        );
      });

      if (found) {
        const props = found.properties || found;
        selectedParcelId = props.id;
        renderCitizenParcel(props.id);
        showToast('Parcel Record Found', `Loaded record for ${props.gutNumber} (${props.village})`, 'success');
      } else {
        showToast('No Record Found', `No cadastral parcel matched '${q}'. Try 'RS/LR-412/1', 'Dag No. 412/1', or 'Dankuni'`, 'warning');
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

    // Objection Form
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

        const parcel = store.parcels.find(p => (p.properties || p).id === selectedParcelId) || store.parcels[0];
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

  // Dynamic 8-Stage Citizen Milestone Journey
  function renderCitizenMilestones(props) {
    const listEl = document.getElementById('cit-milestones-list');
    const badgeEl = document.getElementById('cit-milestone-stage-badge');
    if (!listEl) return;

    const status = props.status; // 'Submitted', 'Scrutiny', 'Scrutinized', 'Notified', 'Awarded', 'Possessed', 'Closed'
    
    const stages = [
      { num: 1, name: 'Proposal Submission (Form 1)', desc: `${props.projectName} RoW Requisition Registered`, key: 'Submitted' },
      { num: 2, name: 'Digital Scrutiny & RoR Validation', desc: 'Verified against MahaBhumi 7/12 land records', key: 'Scrutinized' },
      { num: 3, name: 'Section 11 & 19 Gazette Declaration', desc: `Statutory Gazette Published: ${props.gazetteRef || 'GSR 742(E)'}`, key: 'Notified' },
      { num: 4, name: 'Section 3G Award Declaration', desc: `₹${(props.totalCompensation/100000).toFixed(2)} Lakhs determined with 100% solatium`, key: 'Awarded' },
      { num: 5, name: 'Compensation DBT Disbursed', desc: props.dbtStatus || 'Aadhaar PFMS Direct Transfer', key: 'Disbursed' },
      { num: 6, name: 'R&R Model Colony Resettlement', desc: 'Section 31 housing plot & annuity grants', key: 'Resettled' },
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
  }

  function renderCitizenParcel(parcelId) {
    // Dynamic parcel lookup
    const parcel = store.parcels.find(p => (p.properties || p).id === parcelId) || store.parcels[0];
    const props = parcel.properties || parcel;
    selectedParcelId = props.id;

    const titleEl = document.getElementById('cit-gut-title');
    const statusPill = document.getElementById('cit-status-pill');
    const projEl = document.getElementById('cit-project-name');
    const areaEl = document.getElementById('cit-area');
    const typeEl = document.getElementById('cit-type');
    const valEl = document.getElementById('cit-total-val');
    const calcFinalEl = document.getElementById('cit-calc-final');
    const dbtDescEl = document.getElementById('cit-dbt-desc');
    const pillsContainer = document.getElementById('cit-parcel-pills');

    if (titleEl) titleEl.textContent = props.gutNumber;
    if (statusPill) {
      statusPill.textContent = props.statusLabel.toUpperCase();
      statusPill.style.backgroundColor = props.statusColor || '#15803d';
      statusPill.style.color = '#ffffff';
    }
    if (projEl) projEl.textContent = `${props.projectName} (${props.village} Sector)`;
    if (areaEl) areaEl.textContent = `${props.areaHa} Ha`;
    if (typeEl) typeEl.textContent = props.landType;
    if (valEl) valEl.textContent = `₹${(props.totalCompensation / 100000).toFixed(2)} L`;
    if (calcFinalEl) calcFinalEl.textContent = `₹${props.totalCompensation.toLocaleString('en-IN')}`;
    if (dbtDescEl) {
      dbtDescEl.textContent = `Status: ${props.dbtStatus || 'Pending Section 3G Award'} | Entitlement: ${props.rrEntitlement || 'Eligible for Model Colony Plot'}`;
    }

    // Render Quick Selection Pills
    if (pillsContainer) {
      pillsContainer.innerHTML = store.parcels.slice(0, 4).map(p => {
        const pProps = p.properties || p;
        const isSelected = pProps.id === selectedParcelId;
        return `
          <button onclick="window.selectCitizenParcel('${pProps.id}')" class="px-2 py-0.5 rounded text-xs font-bold transition-all border ${isSelected ? 'bg-primary text-on-primary border-primary' : 'bg-surface-container-low text-on-surface hover:bg-surface-container border-outline-variant/40'}">
            ${pProps.gutNumber}
          </button>
        `;
      }).join('');
    }

    // Render dynamic milestones
    renderCitizenMilestones(props);
  }

  window.selectCitizenParcel = function(parcelId) {
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
    window.NLAMS_SELECTED_STATE = stateName;
    switchView('view-state', true);
    showToast(`State Directorate: ${stateName}`, `Displaying ${stateName} state corridor pipeline metrics.`, 'info');
  };

  // 7. Global Demo Triggers & Accessibility
    function setupGlobalDemoTriggers() {
    // 1. Trigger Live Lifecycle Action (wired to both button IDs)
    const handleLifecycleAction = () => {
      const res = store.triggerDemoLifecycleStep();
      showToast('Real-Time Statutory Sync', res.message, 'success');
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

    // 8. User Profile Badge & Dropdown Popup Menu
    const userBadge = document.getElementById('header-user-badge');
    const userMenu = document.getElementById('user-profile-menu');
    const popupLogout = document.getElementById('btn-popup-logout');
    const popupSettings = document.getElementById('btn-popup-settings');

    if (userBadge && userMenu) {
      userBadge.addEventListener('click', (e) => {
        e.stopPropagation();
        userMenu.classList.toggle('hidden');
        const nameEl = document.getElementById('popup-profile-name');
        const deptEl = document.getElementById('popup-profile-dept');
        const jurEl = document.getElementById('popup-profile-jurisdiction');
        if (nameEl) nameEl.textContent = store.currentUser.name;
        if (deptEl) deptEl.textContent = store.currentUser.badge;
        if (jurEl) jurEl.textContent = `Jurisdiction: ${store.currentUser.jurisdiction}`;
      });

      document.addEventListener('click', (e) => {
        if (!userMenu.contains(e.target) && !userBadge.contains(e.target)) {
          userMenu.classList.add('hidden');
        }
      });
    }

    if (popupLogout) {
      popupLogout.addEventListener('click', (e) => {
        e.preventDefault();
        if (userMenu) userMenu.classList.add('hidden');
        handleLogout();
      });
    }

    if (popupSettings) {
      popupSettings.addEventListener('click', (e) => {
        e.preventDefault();
        if (userMenu) userMenu.classList.add('hidden');
        openProfileSetupModal(getUserRole());
      });
    }

    // 9. Language Selector
    const langSelect = document.getElementById('lang-select');
    if (langSelect) {
      langSelect.addEventListener('change', (e) => {
        const val = e.target.value;
        document.documentElement.lang = val;
        const langName = val === 'hi' ? 'हिन्दी (Hindi)' : 'English';
        showToast('Language Preference', `Switched display language to ${langName}.`, 'info');
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
