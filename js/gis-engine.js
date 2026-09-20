/**
 * NLAMS - GIS & Vector Visualization Engine
 * Handles Thematic State Choropleth Maps, Cadastral Parcel Vectors, and SVG Charts
 * Grounded in West Bengal / Hooghly Cadastral Boundaries and National Corridors
 */

(function(window) {
  'use strict';

  // GeoJSON to SVG Projection Utility
  function projectBounds(geoJsonFeatures, svgWidth = 720, svgHeight = 460, padding = 40) {
    let minLon = Infinity, maxLon = -Infinity, minLat = Infinity, maxLat = -Infinity;

    geoJsonFeatures.forEach(feat => {
      const coords = feat.geometry.type === 'Polygon' ? feat.geometry.coordinates[0] :
                     feat.geometry.type === 'MultiPolygon' ? feat.geometry.coordinates[0][0] : [];
      coords.forEach(([lon, lat]) => {
        if (lon < minLon) minLon = lon;
        if (lon > maxLon) maxLon = lon;
        if (lat < minLat) minLat = lat;
        if (lat > maxLat) maxLat = lat;
      });
    });

    const lonSpan = maxLon - minLon || 1;
    const latSpan = maxLat - minLat || 1;

    return {
      project: function(lon, lat) {
        const x = padding + ((lon - minLon) / lonSpan) * (svgWidth - 2 * padding);
        const y = padding + ((maxLat - lat) / latSpan) * (svgHeight - 2 * padding);
        return { x: Math.round(x * 10) / 10, y: Math.round(y * 10) / 10 };
      },
      toSvgPoints: function(coordinates) {
        return coordinates.map(([lon, lat]) => {
          const pt = this.project(lon, lat);
          return `${pt.x},${pt.y}`;
        }).join(' ');
      }
    };
  }

  const GISEngine = {
    // 1. Render State-Level Thematic SVG Map of India (for National Dashboard)
    renderNationalMap: function(containerId, onStateSelect) {
      const container = document.getElementById(containerId);
      if (!container) return;

      container.innerHTML = `
        <div class="relative w-full max-w-[640px] h-[460px] max-h-[460px] flex items-center justify-center overflow-hidden" style="height: 460px; max-height: 460px; overflow: hidden;">
          <svg class="w-auto h-full max-h-full max-w-full drop-shadow-sm select-none" viewBox="0 0 600 500" preserveAspectRatio="xMidYMid meet" xmlns="http://www.w3.org/2000/svg" style="max-height: 440px; height: 100%; width: auto; overflow: hidden;">
            <defs>
              <filter id="map-glow" x="-10%" y="-10%" width="120%" height="120%">
                <feDropShadow dx="0" dy="2" stdDeviation="3" flood-opacity="0.08"/>
              </filter>
            </defs>

            <!-- Northern States -->
            <path class="state-poly hover:fill-opacity-100 cursor-pointer transition-all" data-state="Jammu & Kashmir" data-pct="88.4"
                  d="M 230,45 L 260,35 L 290,45 L 310,75 L 285,110 L 255,100 L 235,80 Z"
                  fill="#15803d" fill-opacity="0.85" stroke="#ffffff" stroke-width="1.5">
              <title>Jammu & Kashmir / Ladakh (88.4%)</title>
            </path>
            <path class="state-poly hover:fill-opacity-100 cursor-pointer transition-all" data-state="Himachal Pradesh" data-pct="89.1"
                  d="M 230,105 L 265,102 L 275,125 L 245,135 L 225,120 Z"
                  fill="#15803d" fill-opacity="0.8" stroke="#ffffff" stroke-width="1.5">
              <title>Himachal Pradesh (89.1%)</title>
            </path>
            <path class="state-poly hover:fill-opacity-100 cursor-pointer transition-all" data-state="Punjab" data-pct="87.2"
                  d="M 210,122 L 235,122 L 240,150 L 210,145 Z"
                  fill="#15803d" fill-opacity="0.8" stroke="#ffffff" stroke-width="1.5">
              <title>Punjab (87.2%) - Ludhiana EDFC Origin Node</title>
            </path>
            <path class="state-poly hover:fill-opacity-100 cursor-pointer transition-all" data-state="Uttarakhand" data-pct="76.8"
                  d="M 265,120 L 295,125 L 285,155 L 255,145 Z"
                  fill="#d97706" fill-opacity="0.8" stroke="#ffffff" stroke-width="1.5">
              <title>Uttarakhand (76.8%)</title>
            </path>
            <path class="state-poly hover:fill-opacity-100 cursor-pointer transition-all" data-state="Haryana & NCR" data-pct="92.4"
                  d="M 220,150 L 245,148 L 248,175 L 215,170 Z"
                  fill="#15803d" fill-opacity="0.85" stroke="#ffffff" stroke-width="1.5">
              <title>Haryana & NCR (92.4%)</title>
            </path>

            <!-- Rajasthan -->
            <path class="state-poly hover:fill-opacity-100 cursor-pointer transition-all" data-state="Rajasthan" data-pct="78.3"
                  d="M 145,160 L 220,150 L 230,225 L 180,245 L 140,210 Z"
                  fill="#d97706" fill-opacity="0.85" stroke="#ffffff" stroke-width="1.5">
              <title>Rajasthan (78.3%) - High Solar Corridor Activity</title>
            </path>

            <!-- Uttar Pradesh -->
            <path class="state-poly hover:fill-opacity-100 cursor-pointer transition-all" data-state="Uttar Pradesh" data-pct="78.5"
                  d="M 235,155 L 340,165 L 345,215 L 265,225 L 235,190 Z"
                  fill="#d97706" fill-opacity="0.9" stroke="#ffffff" stroke-width="1.5">
              <title>Uttar Pradesh (78.5%) - EDFC / Varanasi HSR Corridor</title>
            </path>

            <!-- Gujarat -->
            <path class="state-poly hover:fill-opacity-100 cursor-pointer transition-all" data-state="Gujarat" data-pct="94.2"
                  d="M 105,215 L 165,210 L 175,275 L 135,285 L 100,250 Z"
                  fill="#15803d" fill-opacity="0.95" stroke="#ffffff" stroke-width="1.5">
              <title>Gujarat (94.2%) - Western DFC & Bullet Train</title>
            </path>

            <!-- Madhya Pradesh -->
            <path class="state-poly hover:fill-opacity-100 cursor-pointer transition-all" data-state="Madhya Pradesh" data-pct="75.4"
                  d="M 190,225 L 295,215 L 310,285 L 235,295 L 185,260 Z"
                  fill="#d97706" fill-opacity="0.85" stroke="#ffffff" stroke-width="1.5">
              <title>Madhya Pradesh (75.4%)</title>
            </path>

            <!-- Bihar -->
            <path class="state-poly hover:fill-opacity-100 cursor-pointer transition-all" data-state="Bihar" data-pct="54.8"
                  d="M 345,175 L 405,185 L 395,230 L 345,220 Z"
                  fill="#ba1a1a" fill-opacity="0.85" stroke="#ffffff" stroke-width="1.5">
              <title>Bihar (54.8%) - Land Registry Digitization Lag</title>
            </path>

            <!-- West Bengal (Featured Deep-Dive State) -->
            <path id="path-wb" class="state-poly cursor-pointer transition-all filter drop-shadow hover:scale-[1.02]" data-state="West Bengal" data-pct="74.2"
                  d="M 400,195 L 430,205 L 425,245 L 435,270 L 415,285 L 388,260 L 395,225 Z"
                  fill="#15803d" fill-opacity="0.95" stroke="#fe932c" stroke-width="2.5">
              <title>West Bengal (74.2%) - EDFC Dankuni Terminal & Hooghly Priority Hub</title>
            </path>

            <!-- North East Region -->
            <path class="state-poly hover:fill-opacity-100 cursor-pointer transition-all" data-state="North-Eastern States / Assam" data-pct="86.1"
                  d="M 435,160 L 515,165 L 530,215 L 470,225 L 440,195 Z"
                  fill="#15803d" fill-opacity="0.85" stroke="#ffffff" stroke-width="1.5">
              <title>North-Eastern States / Assam (86.1%)</title>
            </path>

            <!-- Maharashtra -->
            <path id="path-mh" class="state-poly cursor-pointer transition-all filter drop-shadow hover:scale-[1.01]" data-state="Maharashtra" data-pct="91.4"
                  d="M 165,275 L 260,265 L 285,355 L 195,365 L 160,315 Z"
                  fill="#15803d" fill-opacity="0.9" stroke="#ffffff" stroke-width="2.0">
              <title>Maharashtra (91.4%) - Western Corridor</title>
            </path>

            <!-- Odisha -->
            <path class="state-poly hover:fill-opacity-100 cursor-pointer transition-all" data-state="Odisha" data-pct="61.3"
                  d="M 315,250 L 385,260 L 360,335 L 305,305 Z"
                  fill="#ba1a1a" fill-opacity="0.85" stroke="#ffffff" stroke-width="1.5">
              <title>Odisha (61.3%) - Forest Rights Act Verifications</title>
            </path>

            <!-- Chhattisgarh -->
            <path class="state-poly hover:fill-opacity-100 cursor-pointer transition-all" data-state="Chhattisgarh" data-pct="72.6"
                  d="M 290,245 L 330,240 L 320,325 L 280,310 Z"
                  fill="#d97706" fill-opacity="0.8" stroke="#ffffff" stroke-width="1.5">
              <title>Chhattisgarh (72.6%)</title>
            </path>

            <!-- Southern States -->
            <path class="state-poly hover:fill-opacity-100 cursor-pointer transition-all" data-state="Andhra Pradesh" data-pct="84.2"
                  d="M 260,345 L 315,315 L 310,410 L 255,395 Z"
                  fill="#15803d" fill-opacity="0.85" stroke="#ffffff" stroke-width="1.5">
              <title>Andhra Pradesh (84.2%)</title>
            </path>
            <path class="state-poly hover:fill-opacity-100 cursor-pointer transition-all" data-state="Karnataka" data-pct="88.7"
                  d="M 185,355 L 255,355 L 235,435 L 175,395 Z"
                  fill="#15803d" fill-opacity="0.9" stroke="#ffffff" stroke-width="1.5">
              <title>Karnataka (88.7%)</title>
            </path>
            <path class="state-poly hover:fill-opacity-100 cursor-pointer transition-all" data-state="Tamil Nadu" data-pct="89.5"
                  d="M 225,420 L 275,415 L 255,485 L 215,465 Z"
                  fill="#15803d" fill-opacity="0.9" stroke="#ffffff" stroke-width="1.5">
              <title>Tamil Nadu (89.5%)</title>
            </path>
            <path class="state-poly hover:fill-opacity-100 cursor-pointer transition-all" data-state="Kerala" data-pct="71.2"
                  d="M 195,435 L 220,430 L 205,485 L 190,470 Z"
                  fill="#d97706" fill-opacity="0.85" stroke="#ffffff" stroke-width="1.5">
              <title>Kerala (71.2%)</title>
            </path>

            <!-- Major Industrial Corridors -->
            <!-- Western DFC: Dadri to JNPT -->
            <path d="M 235,170 Q 155,230 165,315" fill="none" stroke="#fe932c" stroke-width="3.5" stroke-dasharray="6 3" stroke-linecap="round">
              <title>Western Dedicated Freight Corridor (WDFC)</title>
            </path>
            <!-- Eastern DFC: Ludhiana to Dankuni (Kolkata/Hooghly) -->
            <path d="M 220,135 Q 295,190 415,270" fill="none" stroke="#133e7c" stroke-width="4.0" stroke-dasharray="6 3" stroke-linecap="round">
              <title>Eastern Dedicated Freight Corridor (EDFC: Ludhiana -> Dankuni)</title>
            </path>
            <!-- Bengaluru-Mumbai Industrial Corridor (BMIC) -->
            <path d="M 180,310 Q 215,380 260,425" fill="none" stroke="#004a1e" stroke-width="2.5" stroke-linecap="round">
              <title>Bengaluru-Mumbai Industrial Corridor (BMIC)</title>
            </path>

            <!-- Pinned Marker for Hooghly / Kolkata (EDFC Terminal) -->
            <g transform="translate(415, 270)">
              <circle r="9" fill="#fe932c" class="animate-ping opacity-75"></circle>
              <circle r="6" fill="#133e7c" stroke="#ffffff" stroke-width="2.5"></circle>
              <text x="12" y="4" font-size="10" font-weight="bold" fill="#00285b" class="drop-shadow-sm">Dankuni (EDFC)</text>
            </g>
          </svg>

          <!-- Floating Inspection Card Over West Bengal / Selected State -->
          <div id="state-inspection-card" class="absolute bottom-4 left-4 max-w-xs bg-surface-container-lowest p-spacing-sm rounded-DEFAULT shadow-md text-on-surface z-20 pointer-events-auto border border-outline-variant/30">
            <div class="flex items-center justify-between gap-spacing-xs border-b border-surface-container pb-spacing-2xs mb-spacing-2xs">
              <div class="flex items-center gap-1.5">
                <span class="w-2 h-2 rounded-full bg-tertiary"></span>
                <span id="card-state-name" class="font-headline-sm text-headline-sm text-primary font-bold">West Bengal</span>
              </div>
              <span id="card-state-pct" class="inline-flex items-center text-[10px] font-bold px-1.5 py-0.5 rounded-DEFAULT bg-tertiary-fixed text-on-tertiary-fixed">
                74.2% Target
              </span>
            </div>
            <div class="space-y-1 font-body-sm text-body-sm">
              <div class="flex justify-between text-on-surface-variant">
                <span>Parcels Acquired:</span>
                <strong id="card-state-ha" class="text-on-surface font-semibold">1,842.8 Ha</strong>
              </div>
              <div class="flex justify-between text-on-surface-variant">
                <span>PFMS DBT Disbursed:</span>
                <strong id="card-state-dbt" class="text-primary font-semibold">₹2,845 Cr</strong>
              </div>
              <div class="flex justify-between text-on-surface-variant">
                <span>Priority Corridor:</span>
                <span class="text-on-surface truncate text-right max-w-[140px]">EDFC Dankuni Terminal & NH-319B</span>
              </div>
            </div>
            <div class="mt-spacing-xs pt-spacing-2xs flex items-center justify-between text-[11px] text-primary font-semibold">
              <button id="btn-drill-state" class="hover:underline flex items-center gap-0.5 text-primary font-bold">
                Drill Down to State Dashboard
                <span class="material-symbols-outlined text-[12px]">chevron_right</span>
              </button>
            </div>
          </div>
        </div>
      `;

      // Attach interactions
      const polys = container.querySelectorAll('.state-poly');
      polys.forEach(p => {
        p.addEventListener('mouseenter', () => {
          const state = p.getAttribute('data-state');
          const pct = p.getAttribute('data-pct');
          const cardState = document.getElementById('card-state-name');
          const cardPct = document.getElementById('card-state-pct');
          const cardHa = document.getElementById('card-state-ha');
          const cardDbt = document.getElementById('card-state-dbt');

          if (cardState) cardState.textContent = state;
          if (cardPct) cardPct.textContent = `${pct}% Target`;

          if (state === 'West Bengal') {
            if (cardHa) cardHa.textContent = '1,842.8 Ha';
            if (cardDbt) cardDbt.textContent = '₹2,845 Cr';
          } else if (state === 'Maharashtra') {
            if (cardHa) cardHa.textContent = '38,410 Ha';
            if (cardDbt) cardDbt.textContent = '₹11,420 Cr';
          }
        });

        p.addEventListener('click', () => {
          const state = p.getAttribute('data-state');
          if (onStateSelect) onStateSelect(state);
        });
      });

      const drillBtn = document.getElementById('btn-drill-state');
      if (drillBtn) {
        drillBtn.addEventListener('click', () => {
          const currentState = document.getElementById('card-state-name')?.textContent || 'West Bengal';
          if (onStateSelect) onStateSelect(currentState);
        });
      }
    },

    // 2. Render State Choropleth Map (Districts of West Bengal)
    renderStateChoropleth: function(containerId, stateName = 'West Bengal', onDistrictSelect) {
      const container = document.getElementById(containerId);
      if (!container) return;

      // Authentic West Bengal District Polygons (SVG Projection)
      container.innerHTML = `
        <div class="relative w-full h-[440px] max-h-[440px] flex flex-col overflow-hidden" style="height: 440px; max-height: 440px; overflow: hidden;">
          <div class="flex items-center justify-between pb-2 border-b border-surface-container">
            <span class="font-headline-sm text-headline-sm text-primary font-bold">
              ${stateName} District-Wise Acquisition Progress
            </span>
            <span class="text-legal-code font-legal-code text-on-surface-variant font-bold uppercase">
              Choropleth (Completion Rate)
            </span>
          </div>

          <div class="relative flex-1 w-full h-full min-h-0 overflow-hidden flex items-center justify-center py-2" style="height: 380px; max-height: 380px; overflow: hidden;">
            <svg class="w-auto h-full max-h-full max-w-full select-none" viewBox="0 0 500 360" preserveAspectRatio="xMidYMid meet" xmlns="http://www.w3.org/2000/svg" style="max-height: 370px; height: 100%; width: auto; overflow: hidden;">
              <defs>
                <filter id="dist-glow">
                  <feDropShadow dx="0" dy="1" stdDeviation="2" flood-opacity="0.12"/>
                </filter>
              </defs>

              <!-- Hooghly District (Highlighted Demo Node) -->
              <polygon class="district-poly cursor-pointer transition-all hover:scale-[1.01]" data-district="Hooghly" data-pct="74.2"
                       points="210,170 250,150 270,185 245,215 205,200"
                       fill="#15803d" fill-opacity="0.9" stroke="#ffffff" stroke-width="2">
                <title>Hooghly (74.2%) - DLLRO Chinsurah / EDFC Terminal</title>
              </polygon>
              <text x="225" y="185" fill="#ffffff" font-size="10" font-weight="bold" class="pointer-events-none">Hooghly</text>

              <!-- Howrah District -->
              <polygon class="district-poly cursor-pointer transition-all hover:scale-[1.01]" data-district="Howrah" data-pct="73.8"
                       points="215,205 255,195 260,230 220,240 210,215"
                       fill="#15803d" fill-opacity="0.85" stroke="#ffffff" stroke-width="1.5">
                <title>Howrah (73.8%) - Kona Expressway & Salap</title>
              </polygon>
              <text x="225" y="222" fill="#ffffff" font-size="9" font-weight="bold" class="pointer-events-none">Howrah</text>

              <!-- Kolkata Metropolitan -->
              <polygon class="district-poly cursor-pointer transition-all hover:scale-[1.01]" data-district="Kolkata" data-pct="87.2"
                       points="260,205 285,200 290,225 265,228"
                       fill="#15803d" fill-opacity="0.95" stroke="#ffffff" stroke-width="1.5">
                <title>Kolkata (87.2%) - KMDA Infrastructure Node</title>
              </polygon>
              <text x="268" y="218" fill="#ffffff" font-size="8" font-weight="bold" class="pointer-events-none">Kol</text>

              <!-- North 24 Parganas -->
              <polygon class="district-poly cursor-pointer transition-all hover:scale-[1.01]" data-district="North 24 Parganas" data-pct="67.2"
                       points="275,175 320,165 345,210 295,225 280,195"
                       fill="#d97706" fill-opacity="0.85" stroke="#ffffff" stroke-width="1.5">
                <title>North 24 Parganas (67.2%) - Barasat / Rajarhat</title>
              </polygon>
              <text x="295" y="195" fill="#ffffff" font-size="9" font-weight="bold" class="pointer-events-none">North 24 Pgs</text>

              <!-- South 24 Parganas -->
              <polygon class="district-poly cursor-pointer transition-all hover:scale-[1.01]" data-district="South 24 Parganas" data-pct="60.8"
                       points="245,235 295,230 330,290 270,310 240,265"
                       fill="#d97706" fill-opacity="0.8" stroke="#ffffff" stroke-width="1.5">
                <title>South 24 Parganas (60.8%) - Alipore HQ</title>
              </polygon>
              <text x="265" y="275" fill="#ffffff" font-size="9" font-weight="bold" class="pointer-events-none">South 24 Pgs</text>

              <!-- Paschim Bardhaman (Industrial) -->
              <polygon class="district-poly cursor-pointer transition-all hover:scale-[1.01]" data-district="Paschim Bardhaman" data-pct="80.7"
                       points="110,135 155,125 170,155 125,165"
                       fill="#15803d" fill-opacity="0.9" stroke="#ffffff" stroke-width="1.5">
                <title>Paschim Bardhaman (80.7%) - Asansol/Durgapur Industrial Belt</title>
              </polygon>
              <text x="120" y="150" fill="#ffffff" font-size="8" font-weight="bold" class="pointer-events-none">P. Bardhaman</text>

              <!-- Purba Bardhaman -->
              <polygon class="district-poly cursor-pointer transition-all hover:scale-[1.01]" data-district="Purba Bardhaman" data-pct="66.6"
                       points="160,130 215,120 230,165 175,170"
                       fill="#d97706" fill-opacity="0.85" stroke="#ffffff" stroke-width="1.5">
                <title>Purba Bardhaman (66.6%) - Agricultural Corridor</title>
              </polygon>
              <text x="180" y="148" fill="#ffffff" font-size="8" font-weight="bold" class="pointer-events-none">Bardhaman</text>

              <!-- Nadia District -->
              <polygon class="district-poly cursor-pointer transition-all hover:scale-[1.01]" data-district="Nadia" data-pct="62.5"
                       points="240,115 285,120 295,165 255,160"
                       fill="#d97706" fill-opacity="0.8" stroke="#ffffff" stroke-width="1.5">
                <title>Nadia (62.5%) - Krishnanagar / NH-34</title>
              </polygon>
              <text x="255" y="142" fill="#ffffff" font-size="9" font-weight="bold" class="pointer-events-none">Nadia</text>

              <!-- Paschim Medinipur -->
              <polygon class="district-poly cursor-pointer transition-all hover:scale-[1.01]" data-district="Paschim Medinipur" data-pct="61.7"
                       points="135,190 195,185 205,245 145,240"
                       fill="#ba1a1a" fill-opacity="0.85" stroke="#ffffff" stroke-width="1.5">
                <title>Paschim Medinipur (61.7%) - Kharagpur Freight Link</title>
              </polygon>
              <text x="150" y="218" fill="#ffffff" font-size="8" font-weight="bold" class="pointer-events-none">Medinipur</text>
            </svg>

            <!-- District Callout Box -->
            <div id="district-info-pill" class="absolute bottom-2 right-2 bg-surface-container-high px-3 py-1.5 rounded shadow text-xs font-semibold text-on-surface flex items-center gap-2 border border-outline-variant/30 pointer-events-auto z-10">
              <span class="w-2.5 h-2.5 rounded-full bg-tertiary"></span>
              <span id="district-info-text">Selected: Hooghly (74.2% Complete • 7 Projects)</span>
            </div>
          </div>
        </div>
      `;

      const distPolys = container.querySelectorAll('.district-poly');
      distPolys.forEach(dp => {
        dp.addEventListener('click', () => {
          const dist = dp.getAttribute('data-district');
          const pct = dp.getAttribute('data-pct');
          const infoText = document.getElementById('district-info-text');
          if (infoText) infoText.textContent = `Selected: ${dist} (${pct}% Complete)`;
          if (onDistrictSelect) onDistrictSelect(dist);
        });
      });
    },

    // Active Leaflet map instances keyed by container ID
    _leafletMaps: {},

    // 3. Render Interactive Cadastral Land Parcel Viewer (Leaflet + OpenStreetMap)
    renderCadastralViewer: async function(containerId, activeParcelId, onParcelSelect, options = {}) {
      const container = document.getElementById(containerId);
      if (!container) return;

      const store = window.NLAMS_STORE;
      const isCitizen = Boolean(options.isCitizen || containerId.includes('citizen') || (store?.currentUser?.role === 'citizen'));
      const activeState = options.state || 'West Bengal';
      const activeDistrict = options.district || 'Hooghly';

      // Clean up previous Leaflet map on this container if it exists
      if (this._leafletMaps[containerId]) {
        try {
          this._leafletMaps[containerId].remove();
        } catch (e) {
          console.warn('[NLAMS GIS] Map cleanup note:', e);
        }
        delete this._leafletMaps[containerId];
      }

      // Container layout with Top Control Bar, Map Mount, Inspector Card, and Choropleth Toggle
      const mapHeight = isCitizen ? '360px' : '580px';
      container.innerHTML = `
        <div class="relative w-full h-[${mapHeight}] max-h-[${mapHeight}] bg-surface-dim overflow-hidden select-none rounded-lg border border-outline-variant/30 flex flex-col" style="height: ${mapHeight}; max-height: ${mapHeight};">
          <!-- Top Floating Control Bar -->
          <div class="absolute top-2.5 left-2.5 right-2.5 z-[500] flex items-center justify-between pointer-events-none gap-2">
            <div class="pointer-events-auto bg-surface-container-lowest/95 backdrop-blur-md px-3 py-1.5 rounded-lg shadow-md border border-outline-variant/40 flex items-center gap-2">
              <span class="material-symbols-outlined text-primary text-[18px]">travel_explore</span>
              <span class="text-xs font-bold text-primary font-headline-sm">
                ${isCitizen ? 'Registered Cadastral Parcel Holding' : 'Cadastral GIS Vector Viewer (Hooghly EDFC)'}
              </span>
              <span id="${containerId}-coords-badge" class="text-[11px] font-mono px-2 py-0.5 bg-surface-container text-on-surface rounded font-semibold">
                GPS: 22.685° N, 88.291° E
              </span>
            </div>

            <div class="pointer-events-auto flex items-center gap-1.5 bg-surface-container-lowest/95 backdrop-blur-md p-1 rounded-lg shadow-md border border-outline-variant/40">
              ${!isCitizen ? `
                <button id="${containerId}-btn-toggle-choropleth" class="px-2.5 py-1 text-xs font-bold rounded bg-surface-container text-primary hover:bg-primary hover:text-on-primary transition-all flex items-center gap-1 cursor-pointer">
                  <span class="material-symbols-outlined text-[15px]">layers</span>
                  <span id="${containerId}-toggle-mode-text">Macro Choropleth</span>
                </button>
              ` : ''}
              <button id="${containerId}-btn-recenter" class="p-1.5 text-on-surface hover:text-primary rounded hover:bg-surface-container transition-colors cursor-pointer" title="Recenter on Active Parcel">
                <span class="material-symbols-outlined text-[18px]">my_location</span>
              </button>
              <button id="${containerId}-btn-export" class="p-1.5 text-on-surface hover:text-primary rounded hover:bg-surface-container transition-colors cursor-pointer" title="Export Cadastral GeoJSON">
                <span class="material-symbols-outlined text-[18px]">download</span>
              </button>
            </div>
          </div>

          <!-- Leaflet Interactive Vector Map Mount -->
          <div id="${containerId}-lmap" class="w-full h-full" style="height: 100%; min-height: 100%; z-index: 1;"></div>

          <!-- District Macro Choropleth Mount (Toggled via Macro Button) -->
          <div id="${containerId}-choropleth-view" class="hidden w-full h-full p-2 bg-surface-container-lowest" style="height: 100%; min-height: 100%; z-index: 2;"></div>

          <!-- Bottom Floating Cadastral Inspector Detail Card -->
          <div id="${containerId}-inspector-card" class="absolute bottom-2.5 left-2.5 z-[500] w-80 bg-surface-container-lowest/95 backdrop-blur-md rounded-xl shadow-xl p-3 border border-outline-variant/40 space-y-1 text-xs font-body-sm transition-all duration-300 pointer-events-auto">
            <div class="flex items-start justify-between gap-1 border-b border-surface-container pb-1">
              <div>
                <span class="text-[10px] font-legal-code uppercase font-bold text-primary tracking-wider">Cadastral Vector</span>
                <h4 id="${containerId}-insp-title" class="font-bold text-sm text-on-surface leading-tight">Loading Parcel...</h4>
              </div>
              <span id="${containerId}-insp-badge" class="px-2 py-0.5 rounded text-[10px] font-bold uppercase font-legal-code bg-tertiary-fixed text-on-tertiary-fixed">
                Status
              </span>
            </div>
            <div class="space-y-1 pt-1 text-on-surface-variant">
              <div class="flex justify-between">
                <span>Landowner:</span>
                <strong id="${containerId}-insp-owner" class="text-on-surface font-semibold">-</strong>
              </div>
              <div class="flex justify-between">
                <span>Acquired Extent:</span>
                <span id="${containerId}-insp-area" class="text-on-surface font-semibold">-</span>
              </div>
              <div class="flex justify-between">
                <span>Award Value:</span>
                <span id="${containerId}-insp-val" class="font-bold text-primary">-</span>
              </div>
              <div class="flex justify-between">
                <span>DBT Status:</span>
                <span id="${containerId}-insp-dbt" class="font-semibold text-tertiary truncate max-w-[180px]">-</span>
              </div>
            </div>
          </div>
        </div>
      `;

      // Helper to ensure Leaflet is loaded before initializing
      const initLeaflet = async () => {
        if (typeof window.L === 'undefined') {
          console.warn('[NLAMS GIS] Leaflet not yet ready, awaiting script...');
          setTimeout(initLeaflet, 100);
          return;
        }

        const mapEl = document.getElementById(`${containerId}-lmap`);
        if (!mapEl) return;

        // Create Leaflet Map Instance
        const map = L.map(`${containerId}-lmap`, {
          zoomControl: true,
          attributionControl: true,
          scrollWheelZoom: true
        });
        GISEngine._leafletMaps[containerId] = map;

        // Add OpenStreetMap Standard Tile Layer
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          maxZoom: 19,
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap</a>'
        }).addTo(map);

        // Fetch Cadastral GeoJSON from Backend with Citizen Token
        let geoData = null;
        try {
          const apiClient = window.NLAMS_API || window.NLAMSAPI;
          if (apiClient) {
            const role = isCitizen ? 'citizen' : (options.role || store?.currentUser?.role || 'dro-cala');
            const params = isCitizen ? {} : { state: activeState, district: activeDistrict };
            console.log(`[NLAMS GIS] Requesting cadastral GeoJSON from /api/parcels with role: '${role}' (Authenticated: ${isCitizen})`);
            const res = await apiClient.getCadastralGeoJSON(params, role);
            if (res && res.data && res.data.features && res.data.features.length > 0) {
              geoData = res.data;
              console.log(`[NLAMS GIS] Successfully loaded ${geoData.features.length} GIS cadastral feature(s) from backend API.`);
            }
          }
        } catch (err) {
          console.warn('[NLAMS GIS] API fetch notice:', err);
        }

        // Fallback to client-side store if API unavailable
        if (!geoData || !geoData.features || geoData.features.length === 0) {
          geoData = store ? store.getCadastralGeoJSON() : { type: 'FeatureCollection', features: [] };
          if (isCitizen && geoData && geoData.features) {
            const user = store?.currentUser || {};
            const userAadhaarLast4 = (user.ownerAadhaar || '').replace(/\D/g, '').slice(-4);
            geoData = {
              type: 'FeatureCollection',
              features: geoData.features.filter(f => {
                const p = f.properties || f;
                if (user.parcelId && (f.id === user.parcelId || p.id === user.parcelId)) return true;
                if (userAadhaarLast4 && p.ownerAadhaar && p.ownerAadhaar.replace(/\D/g, '').endsWith(userAadhaarLast4)) return true;
                if (user.name && p.ownerName && p.ownerName.trim().toLowerCase() === user.name.trim().toLowerCase()) return true;
                return false;
              })
            };
          }
        }

        // Status color mapping per RFCTLARR statutory stages
        const statusColors = {
          'Possessed': '#15803d',
          'Awarded': '#133e7c',
          'Scrutiny': '#d97706',
          'Objection': '#dc2626'
        };

        const getFeatureColor = (f) => {
          const props = f.properties || f;
          return props.statusColor || statusColors[props.status] || '#d97706';
        };

        let activeLayer = null;
        const layersByParcelId = {};

        // Inspector Card updater
        const updateInspector = (props) => {
          const title = document.getElementById(`${containerId}-insp-title`);
          const badge = document.getElementById(`${containerId}-insp-badge`);
          const owner = document.getElementById(`${containerId}-insp-owner`);
          const area = document.getElementById(`${containerId}-insp-area`);
          const val = document.getElementById(`${containerId}-insp-val`);
          const dbt = document.getElementById(`${containerId}-insp-dbt`);
          const coords = document.getElementById(`${containerId}-coords-badge`);

          if (title) title.textContent = `${props.gutNumber || props.khasra_no || props.id} • ${props.village || ''}`;
          if (badge) {
            badge.textContent = (props.statusLabel || props.status || 'Active').slice(0, 20);
            badge.style.backgroundColor = props.statusColor || statusColors[props.status] || '#15803d';
            badge.style.color = '#ffffff';
          }
          if (owner) owner.textContent = props.ownerName || props.owner_name || 'Landowner';
          if (area) area.textContent = `${props.areaHa || props.area_ha || 1.0} Ha (${props.landType || props.land_type || 'Agricultural'})`;
          if (val) {
            const comp = props.totalCompensation || props.total_compensation || 0;
            val.textContent = `₹${(comp / 100000).toFixed(2)} Lakhs`;
          }
          if (dbt) dbt.textContent = props.dbtStatus || props.dbt_status || 'PFMS In Progress';
        };

        // Guard: check if map is still active and mounted in DOM
        if (GISEngine._leafletMaps[containerId] !== map || !document.body.contains(map.getContainer())) {
          return;
        }

        // Render GeoJSON Layer
        const geoLayer = L.geoJSON(geoData, {
          style: function(feature) {
            const isSelected = (feature.id === activeParcelId || feature.properties?.id === activeParcelId);
            const color = getFeatureColor(feature);
            return {
              color: isSelected ? '#fe932c' : color,
              weight: isSelected ? 4 : 2,
              fillColor: color,
              fillOpacity: isSelected ? 0.75 : 0.50,
              dashArray: isSelected ? '' : '3, 3'
            };
          },
          onEachFeature: function(feature, layer) {
            const props = feature.properties || {};
            const pId = feature.id || props.id;
            layersByParcelId[pId] = layer;

            // Popup HTML
            const popupHtml = `
              <div class="p-1.5 space-y-1 font-sans text-xs min-w-[210px]">
                <div class="flex items-center justify-between gap-2 border-b border-gray-200 pb-1">
                  <strong class="text-[#00285b] font-bold text-sm">${props.gutNumber || props.khasra_no || pId}</strong>
                  <span class="px-1.5 py-0.5 rounded text-[10px] font-bold text-white uppercase" style="background:${getFeatureColor(feature)};">
                    ${props.status || 'Active'}
                  </span>
                </div>
                <div class="text-gray-700"><strong>Owner:</strong> ${props.ownerName || props.owner_name || '-'}</div>
                <div class="text-gray-700"><strong>Village:</strong> ${props.village || '-'}, ${props.district || '-'}</div>
                <div class="text-gray-700"><strong>Extent:</strong> ${props.areaHa || props.area_ha || '-'} Ha</div>
                <div class="text-gray-700"><strong>Award:</strong> <span class="font-bold text-[#00285b]">₹${(((props.totalCompensation || props.total_compensation) || 0) / 100000).toFixed(2)} Lakhs</span></div>
                <div class="text-[11px] text-green-800 font-semibold pt-0.5">${props.dbtStatus || props.dbt_status || 'PFMS Direct Benefit Transfer'}</div>
                <button onclick="window.handleCadastralParcelClick('${pId}')" class="w-full mt-1.5 py-1 px-2 bg-[#00285b] text-white text-[11px] font-bold rounded hover:bg-[#133e7c] transition-colors cursor-pointer text-center block">
                  Track Parcel Details &rarr;
                </button>
              </div>
            `;
            layer.bindPopup(popupHtml, { maxWidth: 280, closeButton: false });

            // Layer Interactions
            layer.on({
              mouseover: function(e) {
                const target = e.target;
                if (target !== activeLayer) {
                  target.setStyle({ weight: 3, fillOpacity: 0.70 });
                }
              },
              mouseout: function(e) {
                const target = e.target;
                if (target !== activeLayer) {
                  geoLayer.resetStyle(target);
                }
              },
              click: function(e) {
                if (activeLayer) geoLayer.resetStyle(activeLayer);
                activeLayer = layer;
                layer.setStyle({ color: '#fe932c', weight: 4, fillOpacity: 0.80 });
                layer.openPopup();
                updateInspector(props);

                // Update coordinate pill
                const bounds = layer.getBounds();
                const center = bounds.getCenter();
                const coordBadge = document.getElementById(`${containerId}-coords-badge`);
                if (coordBadge) coordBadge.textContent = `GPS: ${center.lat.toFixed(4)}° N, ${center.lng.toFixed(4)}° E`;

                if (onParcelSelect) onParcelSelect(pId);
              }
            });

            // If this is the active parcel, prime it
            if (pId === activeParcelId) {
              activeLayer = layer;
              updateInspector(props);
            }
          }
        }).addTo(map);

        // Global click bridge for popup action button
        window.handleCadastralParcelClick = function(id) {
          if (onParcelSelect) onParcelSelect(id);
          const citDetail = document.getElementById('cit-gut-title');
          if (citDetail) citDetail.scrollIntoView({ behavior: 'smooth', block: 'center' });
        };

        // Recenter & Fit bounds to parcels
        const fitMapToBounds = () => {
          if (GISEngine._leafletMaps[containerId] !== map || !document.body.contains(map.getContainer())) return;
          try {
            if (activeParcelId && layersByParcelId[activeParcelId]) {
              const targetLayer = layersByParcelId[activeParcelId];
              const b = targetLayer.getBounds();
              map.fitBounds(b, { padding: [40, 40], maxZoom: isCitizen ? 17 : 16 });
              const c = b.getCenter();
              const coordBadge = document.getElementById(`${containerId}-coords-badge`);
              if (coordBadge) coordBadge.textContent = `GPS: ${c.lat.toFixed(4)}° N, ${c.lng.toFixed(4)}° E`;
              const citHeaderBadge = document.getElementById('cit-map-coords-badge');
              if (citHeaderBadge) citHeaderBadge.textContent = `${c.lat.toFixed(4)}° N, ${c.lng.toFixed(4)}° E`;
            } else if (geoLayer.getLayers().length > 0) {
              map.fitBounds(geoLayer.getBounds(), { padding: [30, 30], maxZoom: isCitizen ? 17 : 14 });
            } else {
              // Default center on Dankuni, Hooghly
              map.setView([22.685, 88.291], 15);
            }
          } catch (e) {
            // Handled safely
          }
        };

        fitMapToBounds();
        setTimeout(() => {
          try {
            if (GISEngine._leafletMaps[containerId] === map && document.body.contains(map.getContainer())) {
              map.invalidateSize();
            }
          } catch(e) {}
        }, 250);

        // Recenter Button Click
        const recenterBtn = container.querySelector(`#${containerId}-btn-recenter`);
        if (recenterBtn) {
          recenterBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            fitMapToBounds();
          });
        }

        // Export GeoJSON Button Click
        const exportBtn = container.querySelector(`#${containerId}-btn-export`);
        if (exportBtn) {
          exportBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            GISEngine.downloadCadastralGeoJSON();
          });
        }

        // Toggle View: Cadastral Survey Polygons vs Macro Choropleth View
        const toggleBtn = container.querySelector(`#${containerId}-btn-toggle-choropleth`);
        if (toggleBtn) {
          let showingChoropleth = false;
          toggleBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            const mapDiv = document.getElementById(`${containerId}-lmap`);
            const choroDiv = document.getElementById(`${containerId}-choropleth-view`);
            const label = document.getElementById(`${containerId}-toggle-mode-text`);
            const inspector = document.getElementById(`${containerId}-inspector-card`);

            showingChoropleth = !showingChoropleth;
            if (showingChoropleth) {
              mapDiv.classList.add('hidden');
              choroDiv.classList.remove('hidden');
              if (inspector) inspector.classList.add('hidden');
              if (label) label.textContent = 'Cadastral Parcels';
              GISEngine.renderStateChoropleth(`${containerId}-choropleth-view`, activeState, (dist) => {
                console.log(`[Choropleth Selected] ${dist}`);
              });
            } else {
              choroDiv.classList.add('hidden');
              mapDiv.classList.remove('hidden');
              if (inspector) inspector.classList.remove('hidden');
              if (label) label.textContent = 'Macro Choropleth';
              map.invalidateSize();
              fitMapToBounds();
            }
          });
        }

        // Ensure proper sizing after DOM render
        setTimeout(() => {
          map.invalidateSize();
        }, 150);
      };

      // Execute Leaflet setup
      initLeaflet();
    },

    // 4. RFC 7946 GeoJSON Direct File Download Utility
    downloadCadastralGeoJSON: function() {
      const store = window.NLAMS_STORE;
      const geojson = store ? store.getCadastralGeoJSON() : { type: "FeatureCollection", features: [] };
      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(geojson, null, 2));
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute("href", dataStr);
      downloadAnchor.setAttribute("download", `nlams-hooghly-cadastral-${new Date().toISOString().slice(0,10)}.geojson`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
      if (window.NLAMS_API && window.NLAMS_STORE) {
        window.NLAMS_STORE.logAudit(
          window.NLAMS_STORE.currentUser.name,
          window.NLAMS_STORE.currentUser.badge,
          'Exported Hooghly Cadastral Parcel Layer as RFC 7946 GeoJSON FeatureCollection'
        );
      }
    }
  };

  window.GISEngine = GISEngine;

})(window);
