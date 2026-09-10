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

    // 3. Render Cadastral Land Parcel Viewer (for District/CALA Dashboard)
    renderCadastralViewer: function(containerId, activeParcelId, onParcelSelect) {
      const container = document.getElementById(containerId);
      if (!container) return;

      const store = window.NLAMS_STORE;
      const parcels = store ? store.parcels : [];
      const rawSelected = parcels.find(p => p.id === activeParcelId || (p.properties && p.properties.id === activeParcelId)) || parcels[0] || {};
      const selected = rawSelected.properties ? { ...rawSelected.properties, coordinates: rawSelected.properties.svgCoordinates || { x: 230, y: 190 } } : { ...rawSelected };

      if (!selected.coordinates) selected.coordinates = { x: 230, y: 190 };
      if (!selected.gutNumber) selected.gutNumber = 'Dag No. 412/1';
      if (!selected.village) selected.village = 'Dankuni (JL 34)';
      if (!selected.statusLabel) selected.statusLabel = 'Possessed / Vested';
      if (!selected.ownerName) selected.ownerName = 'Subrata Ghosh';
      if (!selected.areaHa) selected.areaHa = 1.42;
      if (!selected.areaSqM) selected.areaSqM = 14200;
      if (!selected.landType) selected.landType = 'Agricultural (Sali / Bastu)';
      if (!selected.overlapPercent) selected.overlapPercent = 100;
      if (!selected.totalCompensation) selected.totalCompensation = 31808000;

      container.innerHTML = `
        <div class="relative w-full h-[580px] max-h-[580px] bg-surface-dim overflow-hidden select-none rounded border border-outline-variant/30" style="height: 580px; max-height: 580px; overflow: hidden;">
          <!-- Cartographic Grid Lines and RoW Corridor Background -->
          <svg id="cadastral-svg" class="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="cadastralGridPattern" width="48" height="48" patternUnits="userSpaceOnUse">
                <path d="M 48 0 L 0 0 0 48" fill="none" stroke="currentColor" stroke-width="0.5" class="text-surface-variant opacity-80"/>
              </pattern>
              
              <linearGradient id="rowBufferGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stop-color="#133e7c" stop-opacity="0.25" />
                <stop offset="50%" stop-color="#fe932c" stop-opacity="0.35" />
                <stop offset="100%" stop-color="#133e7c" stop-opacity="0.25" />
              </linearGradient>
            </defs>

            <!-- Grid Background -->
            <rect width="100%" height="100%" fill="url(#cadastralGridPattern)"></rect>

            <!-- Authentic Mouza Boundaries (Hooghly Acquisition Corridor) -->
            <!-- Mouza 1: Dankuni (JL 34) -->
            <path d="M 120,60 L 380,40 L 410,260 L 150,280 Z" fill="#f8fafc" fill-opacity="0.12" stroke="#64748b" stroke-width="1.5" stroke-dasharray="6,4"></path>
            <text x="170" y="75" fill="#475569" class="font-legal-code text-legal-code font-bold uppercase tracking-wider">
              MOUZA: DANKUNI (JL NO. 34) • CHANDITALA-II
            </text>

            <!-- Mouza 2: Janai (JL 49) -->
            <path d="M 380,40 L 680,20 L 710,240 L 410,260 Z" fill="#f8fafc" fill-opacity="0.10" stroke="#64748b" stroke-width="1.5" stroke-dasharray="6,4"></path>
            <text x="440" y="55" fill="#475569" class="font-legal-code text-legal-code font-bold uppercase tracking-wider">
              MOUZA: JANAI (JL NO. 49) • CHANDITALA-II
            </text>

            <!-- Mouza 3: Begampur (JL 41) -->
            <path d="M 150,280 L 410,260 L 440,510 L 170,530 Z" fill="#f8fafc" fill-opacity="0.10" stroke="#64748b" stroke-width="1.5" stroke-dasharray="6,4"></path>
            <text x="180" y="300" fill="#475569" class="font-legal-code text-legal-code font-bold uppercase tracking-wider">
              MOUZA: BEGAMPUR (JL NO. 41) • SH-13 CORRIDOR
            </text>

            <!-- Mouza 4: Garalgachha (JL 52) -->
            <path d="M 410,260 L 710,240 L 740,490 L 440,510 Z" fill="#f8fafc" fill-opacity="0.10" stroke="#64748b" stroke-width="1.5" stroke-dasharray="6,4"></path>
            <text x="470" y="280" fill="#475569" class="font-legal-code text-legal-code font-bold uppercase tracking-wider">
              MOUZA: GARALGACHHA (JL NO. 52) • DANKUNI PS
            </text>

            <!-- Proposed 110m Wide EDFC Dankuni Freight Terminal & Rail Linkage Buffer -->
            <polygon points="30,220 740,90 770,175 60,305" fill="url(#rowBufferGrad)"></polygon>
            <polyline points="30,220 740,90" stroke="#133e7c" stroke-width="2.5" stroke-dasharray="6,4"></polyline>
            <polyline points="60,305 770,175" stroke="#133e7c" stroke-width="2.5" stroke-dasharray="6,4"></polyline>

            <!-- Dedicated Freight Rail Center Line Alignment -->
            <line x1="45" y1="262" x2="755" y2="132" stroke="#fe932c" stroke-width="3" stroke-dasharray="8,6"></line>
            <text x="240" y="190" transform="rotate(-11 240 190)" fill="#00285b" class="font-legal-code text-legal-code font-bold tracking-widest opacity-90 uppercase">
              EDFC Dankuni Freight Terminal & Rail Linkage 110m RoW Alignment (Chainage: 0+000 to 18+400)
            </text>

            <!-- Cadastral Parcels Layer (Grounded in Authentic Hooghly Mouzas) -->
            <!-- Parcel 1: WB-HGY-DNK-01 (Dankuni JL 34, Dag 412/1) - Possessed (Green) -->
            <polygon class="parcel-polygon cursor-pointer transition-all hover:opacity-90" data-id="WB-HGY-DNK-01"
                     points="160,140 280,115 295,215 180,230" fill="#15803d" fill-opacity="0.55" stroke="#15803d" stroke-width="2.5"></polygon>
            <text x="185" y="175" fill="#003112" class="font-legal-code text-legal-code font-bold pointer-events-none">Dag 412/1 [Possessed]</text>
            <text x="185" y="190" fill="#003112" class="text-label-sm font-label-sm pointer-events-none">Subrata Ghosh</text>

            <!-- Parcel 2: WB-HGY-DNK-02 (Dankuni JL 34, Dag 412/2) - Scrutiny (Amber) -->
            <polygon class="parcel-polygon cursor-pointer transition-all hover:opacity-90" data-id="WB-HGY-DNK-02"
                     points="290,110 400,90 415,185 305,205" fill="#d97706" fill-opacity="0.5" stroke="#d97706" stroke-width="2"></polygon>
            <text x="315" y="145" fill="#904d00" class="font-legal-code text-legal-code font-bold pointer-events-none">Dag 412/2 [Scrutiny]</text>
            <text x="315" y="160" fill="#904d00" class="text-label-sm font-label-sm pointer-events-none">A. Mukherjee</text>

            <!-- Parcel 3: WB-HGY-JNI-03 (Janai JL 49, Dag 218/4) - Awarded (Blue) -->
            <polygon class="parcel-polygon cursor-pointer transition-all hover:opacity-90" data-id="WB-HGY-JNI-03"
                     points="450,75 580,55 600,160 470,175" fill="#133e7c" fill-opacity="0.55" stroke="#133e7c" stroke-width="2.5"></polygon>
            <text x="480" y="110" fill="#00285b" class="font-legal-code text-legal-code font-bold pointer-events-none">Dag 218/4 [Awarded]</text>
            <text x="480" y="125" fill="#00285b" class="text-label-sm font-label-sm pointer-events-none">D. Banerjee (Sec 3G)</text>

            <!-- Parcel 4: WB-HGY-BGP-04 (Begampur JL 41, Dag 105/3) - Scrutiny (Amber) -->
            <polygon class="parcel-polygon cursor-pointer transition-all hover:opacity-90" data-id="WB-HGY-BGP-04"
                     points="220,320 340,300 360,400 240,415" fill="#d97706" fill-opacity="0.5" stroke="#d97706" stroke-width="2"></polygon>
            <text x="245" y="360" fill="#904d00" class="font-legal-code text-legal-code font-bold pointer-events-none">Dag 105/3 [Scrutiny]</text>
            <text x="245" y="375" fill="#904d00" class="text-label-sm font-label-sm pointer-events-none">Mousumi Das</text>

            <!-- Parcel 5: WB-HGY-SNG-05 (Beraberi Singur JL 24, Dag 520/1A) - Awarded (Blue) -->
            <polygon class="parcel-polygon cursor-pointer transition-all hover:opacity-90" data-id="WB-HGY-SNG-05"
                     points="490,270 630,245 660,370 520,390" fill="#133e7c" fill-opacity="0.55" stroke="#133e7c" stroke-width="2.5"></polygon>
            <text x="525" y="315" fill="#00285b" class="font-legal-code text-legal-code font-bold pointer-events-none">Dag 520/1A [Awarded]</text>
            <text x="525" y="330" fill="#00285b" class="text-label-sm font-label-sm pointer-events-none">P. P. Roy (PHE Scheme)</text>

            <!-- Parcel 6: WB-HWH-SLP-06 (Salap JL 12, Dag 88/2) - Objection / Stay (Red) -->
            <polygon class="parcel-polygon cursor-pointer transition-all hover:opacity-90" data-id="WB-HWH-SLP-06"
                     points="360,390 490,370 515,480 385,495" fill="#dc2626" fill-opacity="0.55" stroke="#dc2626" stroke-width="2.5"></polygon>
            <text x="395" y="435" fill="#93000a" class="font-legal-code text-legal-code font-bold pointer-events-none">Dag 88/2 [CIVIL STAY]</text>
            <text x="395" y="450" fill="#93000a" class="text-label-sm font-label-sm pointer-events-none">T. K. Mondal (Sec 64)</text>
          </svg>

          <!-- Selected Active Marker Pin -->
          <div id="gis-marker-pin" class="absolute pointer-events-none z-10 transition-all duration-300"
               style="top: ${selected.coordinates.y}px; left: ${selected.coordinates.x}px; transform: translate(-50%, -100%);">
            <div class="flex items-center gap-spacing-xs bg-primary text-on-primary px-spacing-sm py-spacing-2xs rounded shadow-xl text-legal-code font-legal-code font-bold tracking-wider">
              <span class="w-2 h-2 rounded-full bg-secondary-container animate-ping"></span>
              <span>ACTIVE SELECTION: ${selected.gutNumber}</span>
            </div>
            <span class="material-symbols-outlined text-secondary text-[36px] drop-shadow-md block text-center">location_on</span>
          </div>

          <!-- Floating Detailed Cadastral Callout / Tooltip -->
          <div class="absolute bottom-spacing-lg left-spacing-lg w-84 bg-surface-container-lowest/95 backdrop-blur-sm rounded shadow-xl p-spacing-md z-20 border border-outline-variant/30">
            <div class="flex items-start justify-between gap-spacing-xs mb-spacing-xs">
              <div>
                <span class="text-legal-code font-legal-code text-primary uppercase font-bold tracking-wider">Cadastral Inspector</span>
                <h3 id="gis-popup-title" class="font-headline-sm text-headline-sm text-on-surface font-bold leading-tight">${selected.gutNumber} • ${selected.village}</h3>
              </div>
              <span id="gis-popup-badge" class="px-spacing-xs py-spacing-2xs rounded bg-secondary-fixed text-on-secondary-fixed font-legal-code text-legal-code font-bold uppercase">
                ${selected.statusLabel.slice(0, 18)}
              </span>
            </div>
            <div class="space-y-spacing-xs text-body-sm font-body-sm text-on-surface-variant">
              <div class="flex justify-between py-spacing-2xs">
                <span>Landowner:</span>
                <strong id="gis-popup-owner" class="font-bold text-on-surface">${selected.ownerName}</strong>
              </div>
              <div class="flex justify-between py-spacing-2xs">
                <span>Acquisition Extent:</span>
                <span id="gis-popup-area" class="font-bold text-on-surface">${selected.areaHa} Hectares (${selected.areaSqM} m²)</span>
              </div>
              <div class="flex justify-between py-spacing-2xs">
                <span>Classification:</span>
                <span id="gis-popup-type" class="font-bold text-on-surface">${selected.landType}</span>
              </div>
              <div class="flex justify-between py-spacing-2xs">
                <span>Right of Way Impact:</span>
                <span id="gis-popup-overlap" class="font-bold text-secondary font-headline-sm">${selected.overlapPercent}% Corridor Overlap</span>
              </div>
              <div class="flex justify-between py-spacing-2xs">
                <span>Estimated Value:</span>
                <span id="gis-popup-val" class="font-bold text-primary font-headline-sm">₹${(selected.totalCompensation / 100000).toFixed(2)} Lakhs</span>
              </div>
              <div class="flex items-center gap-spacing-xs pt-spacing-xs text-tertiary text-label-sm font-label-sm font-semibold">
                <span class="material-symbols-outlined text-[16px]">check_circle</span>
                <span>BanglarBhumi GIS & WBLA Database Synced</span>
              </div>
            </div>
          </div>

          <!-- Floating GIS Layer Overlay Selector Control -->
          <div class="absolute top-spacing-md right-spacing-md bg-surface-container-lowest/95 backdrop-blur-sm p-spacing-sm rounded shadow-lg z-20 flex flex-col gap-spacing-xs border border-outline-variant/30">
            <span class="text-legal-code font-legal-code uppercase text-on-surface-variant font-bold tracking-wider mb-spacing-2xs">Active Layers</span>
            <label class="flex items-center gap-spacing-xs cursor-pointer text-label-sm font-label-sm text-on-surface hover:text-primary">
              <input type="checkbox" checked class="w-4 h-4 accent-primary rounded">
              <span>Mouza Cadastre (1:4000)</span>
            </label>
            <label class="flex items-center gap-spacing-xs cursor-pointer text-label-sm font-label-sm text-on-surface hover:text-primary">
              <input type="checkbox" checked class="w-4 h-4 accent-primary rounded">
              <span>110m EDFC Alignment Buffer</span>
            </label>
            <label class="flex items-center gap-spacing-xs cursor-pointer text-label-sm font-label-sm text-on-surface hover:text-primary">
              <input type="checkbox" checked class="w-4 h-4 accent-primary rounded">
              <span>BanglarBhumi Khasra Grid</span>
            </label>
            <div class="pt-spacing-xs border-t border-outline-variant/30 mt-1">
              <button id="btn-export-geojson-gis" class="w-full flex items-center justify-center gap-1 px-2 py-1 bg-primary text-on-primary text-legal-code font-legal-code font-bold rounded hover:bg-primary-container transition-colors shadow-sm">
                <span class="material-symbols-outlined text-[14px]">download</span>
                Export RFC 7946 GeoJSON
              </button>
            </div>
          </div>
        </div>
      `;

      // Add click handlers on polygons
      const polys = container.querySelectorAll('.parcel-polygon');
      polys.forEach(poly => {
        poly.addEventListener('click', () => {
          const parcelId = poly.getAttribute('data-id');
          if (onParcelSelect) onParcelSelect(parcelId);
        });
      });

      const exportGeoJsonBtn = container.querySelector('#btn-export-geojson-gis');
      if (exportGeoJsonBtn) {
        exportGeoJsonBtn.addEventListener('click', () => {
          GISEngine.downloadCadastralGeoJSON();
        });
      }
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
