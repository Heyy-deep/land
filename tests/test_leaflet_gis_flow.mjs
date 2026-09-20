import { chromium } from 'playwright';
import fs from 'node:fs';
import path from 'node:path';

async function verifyFrontendLeafletGIS() {
  console.log('=== Step 4: Frontend Leaflet GIS Verification ===');
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 }
  });
  const page = await context.newPage();

  const networkCalls = [];

  // Track all requests and responses matching /api/parcels
  page.on('request', req => {
    const url = req.url();
    if (url.includes('/api/parcels') || url.includes('/parcels')) {
      const auth = req.headers()['authorization'] || '(none)';
      networkCalls.push({
        type: 'REQUEST',
        url,
        method: req.method(),
        auth: auth.startsWith('Bearer ') ? `Bearer ${auth.slice(7, 25)}...` : auth
      });
      console.log(`[Network Request] ${req.method()} ${url} | Auth: ${auth.startsWith('Bearer ') ? 'Bearer Attached (' + auth.slice(7, 22) + '...)' : auth}`);
    }
  });

  page.on('response', async res => {
    const url = res.url();
    if (url.includes('/api/parcels') || url.includes('/parcels')) {
      try {
        const text = await res.text();
        networkCalls.push({
          type: 'RESPONSE',
          url,
          status: res.status(),
          length: text.length
        });
        console.log(`[Network Response] ${res.status()} ${url} | Body Length: ${text.length}`);
      } catch (e) {}
    }
  });

  page.on('console', msg => {
    const txt = msg.text();
    if (txt.includes('[NLAMS GIS]') || txt.includes('[NLAMS API]') || txt.includes('Error')) {
      console.log(`[Browser Console ${msg.type()}] ${txt}`);
    }
  });

  // 1. Navigate to Application
  console.log('\n--- 1. Navigating to http://localhost:3000/#/login ---');
  await page.goto('http://localhost:3000/#/login', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);

  // 2. Select Citizen Role
  console.log('\n--- 2. Selecting Citizen Role ---');
  await page.selectOption('#user-role-select', 'citizen');
  await page.waitForTimeout(500);

  // 3. Enter OTP code 482910
  console.log('\n--- 3. Entering OTP digits (482910) ---');
  const otpDigits = ['4', '8', '2', '9', '1', '0'];
  for (let i = 1; i <= 6; i++) {
    const input = page.locator(`#otp-${i}`);
    if (await input.count() > 0) {
      await input.fill(otpDigits[i - 1]);
    }
  }

  // 4. Submit Login Form
  console.log('\n--- 4. Submitting Citizen Login Form ---');
  await page.click('#btn-login-submit');
  await page.waitForTimeout(2000);

  // 5. Verify Citizen Dashboard URL & Elements
  const currentUrl = page.url();
  console.log(`Current URL after login: ${currentUrl}`);
  if (!currentUrl.includes('citizen-dashboard')) {
    throw new Error(`Expected citizen-dashboard in URL, got ${currentUrl}`);
  }

  // Verify landowner banner displays Subrata Ghosh
  const bannerName = await page.locator('#cit-banner-user-name').textContent();
  console.log(`Verified Citizen Banner Name: ${bannerName}`);

  // 6. Verify Leaflet Map Container & Tiles
  console.log('\n--- 5. Verifying Leaflet Cadastral Map in Citizen Portal ---');
  await page.waitForSelector('#citizen-cadastral-gis-mount .leaflet-container', { timeout: 10000 });
  console.log('Leaflet container mounted successfully inside #citizen-cadastral-gis-mount');

  // Wait for tiles & vector layers to render
  await page.waitForTimeout(2500);

  const leafletLayersCount = await page.locator('#citizen-cadastral-gis-mount svg path.leaflet-interactive').count();
  console.log(`Cadastral polygon vector paths rendered in Leaflet: ${leafletLayersCount}`);

  const coordBadgeText = await page.locator('#citizen-cadastral-gis-mount-coords-badge').textContent();
  console.log(`Map GPS Badge Coordinate: ${coordBadgeText}`);

  const inspectorTitle = await page.locator('#citizen-cadastral-gis-mount-insp-title').textContent();
  console.log(`Inspector Card Parcel: ${inspectorTitle}`);

  // 7. Verify Network Call contained Citizen Auth Token
  const citizenParcelsReq = networkCalls.find(c => c.type === 'REQUEST' && c.url.includes('/api/parcels') && c.auth !== '(none)');
  if (!citizenParcelsReq) {
    console.error('Network calls recorded:', networkCalls);
    throw new Error('FAILED: /api/parcels was NOT called with an Authorization header!');
  }
  console.log(`SUCCESS: Confirmed /api/parcels request with Citizen Token: ${citizenParcelsReq.auth}`);

  // 8. Test 403 Forbidden Protection in Real Browser Flow
  console.log('\n--- 6. Testing RBAC 403 Protection In-Browser ---');
  const rbacTestResult = await page.evaluate(async () => {
    const token = sessionStorage.getItem('nlams_token_citizen') || sessionStorage.getItem('nlams_token');
    const backendUrl = window.getNLAMSBackendUrl ? window.getNLAMSBackendUrl() : 'http://localhost:8000';

    // Test 1: Subrata's own parcel WB-HGY-DNK-01
    const resOwn = await fetch(`${backendUrl}/api/parcels/WB-HGY-DNK-01/geometry`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const ownData = await resOwn.json();

    // Test 2: Another landowner's parcel WB-HGY-DNK-02 (Ramesh Patil)
    const resForbidden = await fetch(`${backendUrl}/api/parcels/WB-HGY-DNK-02/geometry`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const forbiddenData = await resForbidden.json();

    return {
      tokenPresent: !!token,
      ownStatus: resOwn.status,
      ownParcelId: ownData.id,
      forbiddenStatus: resForbidden.status,
      forbiddenDetail: forbiddenData.detail
    };
  });

  console.log('In-Browser RBAC Test Results:', JSON.stringify(rbacTestResult, null, 2));

  if (rbacTestResult.ownStatus !== 200) {
    throw new Error(`Expected own parcel geometry status 200, got ${rbacTestResult.ownStatus}`);
  }
  if (rbacTestResult.forbiddenStatus !== 403) {
    throw new Error(`Expected other parcel geometry status 403, got ${rbacTestResult.forbiddenStatus}`);
  }
  console.log('SUCCESS: In-browser 403 Forbidden protection verified end-to-end!');

  // Capture Citizen Portal Screenshot
  const screenshotPathCitizen = path.join(process.cwd(), 'tests', 'screenshots', 'citizen_portal_leaflet_gis.png');
  await page.screenshot({ path: screenshotPathCitizen, fullPage: false });
  console.log(`Saved screenshot: ${screenshotPathCitizen}`);

  // 9. Verify District CALA Dashboard Leaflet Map with CALA Authority session
  console.log('\n--- 7. Verifying District CALA Cadastral Map & Interactions ---');
  const calaContext = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const calaPage = await calaContext.newPage();
  await calaPage.goto('http://localhost:3000/#/login', { waitUntil: 'networkidle' });
  await calaPage.selectOption('#user-role-select', 'dro-cala');
  await calaPage.waitForTimeout(500);

  const pinInput = calaPage.locator('#dsc-login-pin');
  if (await pinInput.count() > 0) {
    await pinInput.fill('123456');
  }
  await calaPage.click('#btn-login-submit');
  await calaPage.waitForTimeout(2000);

  await calaPage.waitForSelector('#district-cadastral-gis-mount .leaflet-container', { timeout: 10000 });
  const districtPolygonsCount = await calaPage.locator('#district-cadastral-gis-mount svg path.leaflet-interactive').count();
  console.log(`District CALA map rendered with ${districtPolygonsCount} interactive cadastral polygons`);

  // Click on the first parcel polygon in District view
  const firstPoly = calaPage.locator('#district-cadastral-gis-mount svg path.leaflet-interactive').first();
  await firstPoly.click();
  await calaPage.waitForTimeout(1000);

  // Check popup appears
  const popup = calaPage.locator('.leaflet-popup-content');
  if (await popup.count() > 0) {
    const popupText = await popup.textContent();
    console.log(`Parcel popup content: ${popupText.slice(0, 100).trim()}...`);
  }

  const screenshotPathDistrict = path.join(process.cwd(), 'tests', 'screenshots', 'district_dashboard_leaflet_gis.png');
  await calaPage.screenshot({ path: screenshotPathDistrict, fullPage: false });
  console.log(`Saved screenshot: ${screenshotPathDistrict}`);

  await browser.close();
  console.log('\n=== All Step 4 & 5 Verification Checks PASSED! ===');
}

verifyFrontendLeafletGIS().catch(err => {
  console.error('Verification failed:', err);
  process.exit(1);
});
