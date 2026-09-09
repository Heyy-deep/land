/**
 * NLAMS - GIS & Vector Visualization Engine
 * Handles Thematic State Choropleth Maps, Cadastral Parcel Vectors, and SVG Charts
 */

(function(window) {
  'use strict';

  const GISEngine = {
    // Render State-Level Thematic SVG Map of India (for National Dashboard)
    renderNationalMap: function(containerId, onStateSelect) {
      const container = document.getElementById(containerId);
      if (!container) return;

      container.innerHTML = `
        <div class="relative w-full aspect-[4/3] max-w-[640px] flex items-center justify-center">
          <svg class="w-full h-full drop-shadow-sm select-none" viewBox="0 0 600 500" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <filter id="map-glow" x="-10%" y="-10%" width="120%" height="120%">
                <feDropShadow dx="0" dy="2" stdDeviation="3" flood-opacity="0.08"/>
              </filter>
            </defs>

            <!-- Northern States (J&K, Ladakh, HP, Punjab, Uttarakhand) -->
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
              <title>Punjab (87.2%)</title>
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
              <title>Uttar Pradesh (78.5%) - Jewar & Varanasi HSR</title>
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

            <!-- West Bengal -->
            <path class="state-poly hover:fill-opacity-100 cursor-pointer transition-all" data-state="West Bengal" data-pct="68.2"
                  d="M 400,195 L 430,205 L 415,275 L 385,255 L 395,225 Z"
                  fill="#d97706" fill-opacity="0.85" stroke="#ffffff" stroke-width="1.5">
              <title>West Bengal (68.2%)</title>
            </path>

            <!-- North East Region -->
            <path class="state-poly hover:fill-opacity-100 cursor-pointer transition-all" data-state="North-Eastern States / Assam" data-pct="86.1"
                  d="M 435,160 L 515,165 L 530,215 L 470,225 L 440,195 Z"
                  fill="#15803d" fill-opacity="0.85" stroke="#ffffff" stroke-width="1.5">
              <title>North-Eastern States / Assam (86.1%)</title>
            </path>

            <!-- Maharashtra (Benchmark State) -->
            <path id="path-mh" class="state-poly cursor-pointer transition-all filter drop-shadow hover:scale-[1.01]" data-state="Maharashtra" data-pct="91.4"
                  d="M 165,275 L 260,265 L 285,355 L 195,365 L 160,315 Z"
                  fill="#15803d" fill-opacity="0.95" stroke="#ffffff" stroke-width="2.5">
              <title>Maharashtra (91.4%) - Top Performer</title>
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

            <!-- Telangana & Andhra Pradesh -->
            <path class="state-poly hover:fill-opacity-100 cursor-pointer transition-all" data-state="Telangana & Andhra Pradesh" data-pct="84.7"
                  d="M 235,325 L 310,320 L 295,395 L 235,375 Z"
                  fill="#15803d" fill-opacity="0.8" stroke="#ffffff" stroke-width="1.5">
              <title>Telangana & Andhra Pradesh (84.7%)</title>
            </path>

            <!-- Karnataka -->
            <path class="state-poly hover:fill-opacity-100 cursor-pointer transition-all" data-state="Karnataka" data-pct="74.2"
                  d="M 195,355 L 255,350 L 245,435 L 190,415 Z"
                  fill="#d97706" fill-opacity="0.85" stroke="#ffffff" stroke-width="1.5">
              <title>Karnataka (74.2%)</title>
            </path>

            <!-- Tamil Nadu & Kerala -->
            <path class="state-poly hover:fill-opacity-100 cursor-pointer transition-all" data-state="Tamil Nadu & Kerala" data-pct="86.8"
                  d="M 230,410 L 285,415 L 260,490 L 215,480 L 210,430 Z"
                  fill="#15803d" fill-opacity="0.9" stroke="#ffffff" stroke-width="1.5">
              <title>Tamil Nadu & Kerala (86.8%)</title>
            </path>

            <!-- Linear Corridor Overlays (NHAI / DFC Lines) -->
            <!-- Western DFC: Delhi to JNPT (Mumbai) -->
            <path d="M 235,165 Q 185,220 180,305" fill="none" stroke="#fe932c" stroke-width="3.5" stroke-dasharray="6 4" stroke-linecap="round">
              <title>Western Dedicated Freight Corridor (WDFC)</title>
            </path>
            <!-- Eastern DFC: Ludhiana to Dankuni -->
            <path d="M 220,135 Q 295,190 405,250" fill="none" stroke="#395e9d" stroke-width="3" stroke-dasharray="5 3" stroke-linecap="round">
              <title>Eastern Dedicated Freight Corridor (EDFC)</title>
            </path>
            <!-- Golden Quadrilateral Chennai to Mumbai branch -->
            <path d="M 180,310 Q 215,380 260,425" fill="none" stroke="#004a1e" stroke-width="2.5" stroke-linecap="round">
              <title>Bengaluru-Mumbai Industrial Corridor (BMIC)</title>
            </path>

            <!-- Pinned Marker for Nodal Inspection (Maharashtra) -->
            <g transform="translate(205, 305)">
              <circle r="8" fill="#133e7c" class="animate-ping opacity-60"></circle>
              <circle r="5" fill="#133e7c" stroke="#ffffff" stroke-width="2"></circle>
            </g>
          </svg>

          <!-- Floating Inspection Card Over Maharashtra -->
          <div id="state-inspection-card" class="absolute bottom-4 left-4 max-w-xs bg-surface-container-lowest p-spacing-sm rounded-DEFAULT shadow-md text-on-surface z-20 pointer-events-auto border border-outline-variant/30">
            <div class="flex items-center justify-between gap-spacing-xs border-b border-surface-container pb-spacing-2xs mb-spacing-2xs">
              <div class="flex items-center gap-1.5">
                <span class="w-2 h-2 rounded-full bg-tertiary"></span>
                <span id="card-state-name" class="font-headline-sm text-headline-sm text-primary font-bold">Maharashtra</span>
              </div>
              <span id="card-state-pct" class="inline-flex items-center text-[10px] font-bold px-1.5 py-0.5 rounded-DEFAULT bg-tertiary-fixed text-on-tertiary-fixed">
                91.4% Target
              </span>
            </div>
            <div class="space-y-1 font-body-sm text-body-sm">
              <div class="flex justify-between text-on-surface-variant">
                <span>Parcels Acquired:</span>
                <strong id="card-state-ha" class="text-on-surface font-semibold">38,410 Ha</strong>
              </div>
              <div class="flex justify-between text-on-surface-variant">
                <span>PFMS DBT Disbursed:</span>
                <strong id="card-state-dbt" class="text-primary font-semibold">₹11,420 Cr</strong>
              </div>
              <div class="flex justify-between text-on-surface-variant">
                <span>Priority Corridors:</span>
                <span class="text-on-surface truncate text-right max-w-[140px]">Mumbai-Nagpur & WDFC</span>
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
          if (cardState) cardState.textContent = state;
          if (cardPct) cardPct.textContent = `${pct}% Target`;
        });

        p.addEventListener('click', () => {
          const state = p.getAttribute('data-state');
          if (onStateSelect) onStateSelect(state);
        });
      });

      const drillBtn = document.getElementById('btn-drill-state');
      if (drillBtn) {
        drillBtn.addEventListener('click', () => {
          if (onStateSelect) onStateSelect('Maharashtra');
        });
      }
    },

    // Render Cadastral Land Parcel Viewer (for District/CALA Dashboard)
    renderCadastralViewer: function(containerId, activeParcelId, onParcelSelect) {
      const container = document.getElementById(containerId);
      if (!container) return;

      const store = window.NLAMS_STORE;
      const parcels = store ? store.parcels : [];
      const selected = parcels.find(p => p.id === activeParcelId) || parcels[2]; // Default Gut 143/3A

      container.innerHTML = `
        <div class="relative w-full h-[580px] bg-surface-dim overflow-hidden select-none rounded border border-outline-variant/30">
          <!-- Cartographic Grid Lines and RoW Corridor Background -->
          <svg id="cadastral-svg" class="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="cadastralGridPattern" width="48" height="48" patternUnits="userSpaceOnUse">
                <path d="M 48 0 L 0 0 0 48" fill="none" stroke="currentColor" stroke-width="0.5" class="text-surface-variant opacity-80"/>
              </pattern>
              
              <linearGradient id="rowBufferGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stop-color="#133e7c" stop-opacity="0.22" />
                <stop offset="50%" stop-color="#fe932c" stop-opacity="0.32" />
                <stop offset="100%" stop-color="#133e7c" stop-opacity="0.22" />
              </linearGradient>
            </defs>

            <!-- Grid Background -->
            <rect width="100%" height="100%" fill="url(#cadastralGridPattern)"></rect>

            <!-- Proposed 110m Wide Highway Right-of-Way (RoW) Corridor Buffer Polygon -->
            <polygon points="20,180 620,40 760,110 90,320" fill="url(#rowBufferGrad)"></polygon>
            <polyline points="20,180 620,40" stroke="#133e7c" stroke-width="2.5" stroke-dasharray="6,4"></polyline>
            <polyline points="90,320 760,110" stroke="#133e7c" stroke-width="2.5" stroke-dasharray="6,4"></polyline>

            <!-- Highway Center Line Alignment -->
            <line x1="55" y1="250" x2="690" y2="75" stroke="#904d00" stroke-width="2" stroke-dasharray="8,6"></line>
            <text x="310" y="145" transform="rotate(-15 310 145)" fill="#00285b" class="font-legal-code text-legal-code font-bold tracking-widest opacity-80 uppercase">
              MSRDC Pkg-2 Outer Ring Road 110m RoW Alignment (Chainage: 42+180 to 44+600)
            </text>

            <!-- Cadastral Parcels Layer -->
            <!-- Parcel 1: Gut 142/1 - Possessed (Green) -->
            <polygon class="parcel-polygon cursor-pointer transition-all hover:opacity-90" data-id="GUT-142-1"
                     points="110,80 230,50 250,150 140,165" fill="#15803d" fill-opacity="0.5" stroke="#15803d" stroke-width="2"></polygon>
            <text x="145" y="115" fill="#003112" class="font-legal-code text-legal-code font-bold pointer-events-none">Gut 142/1 [Possessed]</text>
            <text x="145" y="130" fill="#003112" class="text-label-sm font-label-sm pointer-events-none">0.94 Ha</text>

            <!-- Parcel 2: Gut 142/2 - Awarded (Green/Orange) -->
            <polygon class="parcel-polygon cursor-pointer transition-all hover:opacity-90" data-id="GUT-142-2"
                     points="230,50 350,30 380,120 250,150" fill="#15803d" fill-opacity="0.5" stroke="#15803d" stroke-width="2"></polygon>
            <text x="270" y="90" fill="#003112" class="font-legal-code text-legal-code font-bold pointer-events-none">Gut 142/2 [3G Passed]</text>

            <!-- Parcel 3: Gut 145 - Cleared -->
            <polygon class="parcel-polygon cursor-pointer transition-all hover:opacity-90" data-id="GUT-145"
                     points="70,300 190,260 210,380 90,410" fill="#15803d" fill-opacity="0.4" stroke="#15803d" stroke-width="2"></polygon>
            <text x="105" y="340" fill="#003112" class="font-legal-code text-legal-code font-bold pointer-events-none">Gut 145 [Cleared]</text>

            <!-- Parcel 4: Gut 144/B - Mutation Err (Orange) -->
            <polygon class="parcel-polygon cursor-pointer transition-all hover:opacity-90" data-id="GUT-144-B"
                     points="380,120 510,95 540,210 410,230" fill="#d97706" fill-opacity="0.45" stroke="#d97706" stroke-width="2"></polygon>
            <text x="420" y="160" fill="#663500" class="font-legal-code text-legal-code font-bold pointer-events-none">Gut 144/B [Mutation Err]</text>

            <!-- Parcel 5: Gut 147 - Objection / Court Stay (Red) -->
            <polygon class="parcel-polygon cursor-pointer transition-all hover:opacity-90" data-id="GUT-147"
                     points="460,260 590,230 630,360 490,390" fill="#dc2626" fill-opacity="0.55" stroke="#dc2626" stroke-width="2.5"></polygon>
            <text x="500" y="310" fill="#93000a" class="font-legal-code text-legal-code font-bold pointer-events-none">Gut 147 [CIVIL STAY]</text>
            <text x="500" y="325" fill="#93000a" class="text-label-sm font-label-sm pointer-events-none">Sec 15 Injunction</text>

            <!-- Parcel 6: ACTIVE PARCEL Gut No. 143/3A (Amber/Orange Highlighted) -->
            <polygon class="parcel-polygon cursor-pointer transition-all hover:opacity-90" data-id="GUT-143-3A"
                     points="210,200 370,165 410,300 240,335" fill="#d97706" fill-opacity="0.65" stroke="#904d00" stroke-width="3" stroke-dasharray="4,2"></polygon>
            <polygon points="210,200 370,165 410,300 240,335" fill="none" stroke="#ffffff" stroke-width="1.5" class="pointer-events-none"></polygon>
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
                <span>MahaBhumi GIS & Bhulekh Database Synced</span>
              </div>
            </div>
          </div>

          <!-- Floating GIS Layer Overlay Selector Control -->
          <div class="absolute top-spacing-md right-spacing-md bg-surface-container-lowest/95 backdrop-blur-sm p-spacing-sm rounded shadow-lg z-20 flex flex-col gap-spacing-xs border border-outline-variant/30">
            <span class="text-legal-code font-legal-code uppercase text-on-surface-variant font-bold tracking-wider mb-spacing-2xs">Active Layers</span>
            <label class="flex items-center gap-spacing-xs cursor-pointer text-label-sm font-label-sm text-on-surface hover:text-primary">
              <input type="checkbox" checked class="w-4 h-4 accent-primary rounded">
              <span>Village Cadastre (1:4000)</span>
            </label>
            <label class="flex items-center gap-spacing-xs cursor-pointer text-label-sm font-label-sm text-on-surface hover:text-primary">
              <input type="checkbox" checked class="w-4 h-4 accent-primary rounded">
              <span>110m RoW Alignment Buffer</span>
            </label>
            <label class="flex items-center gap-spacing-xs cursor-pointer text-label-sm font-label-sm text-on-surface hover:text-primary">
              <input type="checkbox" checked class="w-4 h-4 accent-primary rounded">
              <span>Bhulekh Khasra Grid Lines</span>
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

    // RFC 7946 GeoJSON Direct File Download Utility
    downloadCadastralGeoJSON: function() {
      const store = window.NLAMS_STORE;
      const geojson = store ? store.getCadastralGeoJSON() : { type: "FeatureCollection", features: [] };
      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(geojson, null, 2));
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute("href", dataStr);
      downloadAnchor.setAttribute("download", `nlams-cadastral-parcels-${new Date().toISOString().slice(0,10)}.geojson`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
      if (window.NLAMS_API && window.NLAMS_STORE) {
        window.NLAMS_STORE.logAudit(
          window.NLAMS_STORE.currentUser.name,
          window.NLAMS_STORE.currentUser.badge,
          'Exported Cadastral Parcel Layer as RFC 7946 GeoJSON FeatureCollection'
        );
      }
    }
  };

  window.GISEngine = GISEngine;

})(window);
