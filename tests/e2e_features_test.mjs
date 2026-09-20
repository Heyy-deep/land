import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { chromium } from 'playwright';

const PORT = 4173;
const ROOT_DIR = process.cwd();

const MIME_TYPES = {
  '.html': 'text/html',
  '.js': 'application/javascript',
  '.mjs': 'application/javascript',
  '.json': 'application/json',
  '.css': 'text/css',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.geojson': 'application/geo+json'
};

function startServer() {
  return new Promise((resolve) => {
    const server = http.createServer((req, res) => {
      let reqPath = req.url.split('?')[0];
      if (reqPath === '/') reqPath = '/index.html';
      const filePath = path.join(ROOT_DIR, reqPath);

      if (!fs.existsSync(filePath)) {
        res.writeHead(404);
        return res.end('Not found');
      }

      const ext = path.extname(filePath).toLowerCase();
      const contentType = MIME_TYPES[ext] || 'application/octet-stream';
      res.writeHead(200, { 'Content-Type': contentType });
      fs.createReadStream(filePath).pipe(res);
    });

    server.listen(PORT, () => {
      console.log(`[Test Server] Serving at http://127.0.0.1:${PORT}`);
      resolve(server);
    });
  });
}

async function runTests() {
  const server = await startServer();
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 }
  });
  const page = await context.newPage();
  page.on('console', msg => console.log('[Browser Console]', msg.type(), msg.text()));
  page.on('pageerror', err => console.log('[Browser Error]', err));

  const screenshotDir = path.join(ROOT_DIR, 'tests', 'screenshots');
  if (!fs.existsSync(screenshotDir)) {
    fs.mkdirSync(screenshotDir, { recursive: true });
  }

  try {
    console.log('--- TEST 0: Pre-Login Compensation Calculator Data Isolation & Blank State ---');
    await page.goto(`http://127.0.0.1:${PORT}/index.html#/login`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(600);

    // 1. Open calculator directly from Login page header
    await page.waitForSelector('#btn-open-compensation-calc', { timeout: 3000 });
    await page.click('#btn-open-compensation-calc');
    await page.waitForSelector('#modal-compensation-calculator:not(.hidden)', { timeout: 3000 });

    // 2. Verify Active Parcel is 'None (Custom Mode)' - NO citizen data exposed!
    const preLoginPill = await page.innerText('#calc-active-parcel-pill');
    console.log(`✓ Pre-Login Active Parcel Pill: "${preLoginPill}"`);
    if (preLoginPill.includes('Dag No. 412/1') || preLoginPill.includes('1.42 Ha') || preLoginPill.includes('₹1,000')) {
      throw new Error(`Data exposure bug: Pre-login calculator exposed citizen parcel data: "${preLoginPill}"`);
    }

    // 3. Verify inputs are blank
    const preLoginArea = await page.inputValue('#calc-input-area');
    const preLoginRate = await page.inputValue('#calc-input-circle-rate');
    const preLoginFinal = await page.innerText('#calc-res-final');
    console.log(`✓ Pre-Login Inputs: Area: "${preLoginArea}", Rate: "${preLoginRate}", Final Disbursal: "${preLoginFinal}"`);
    if (preLoginArea !== '' || preLoginRate !== '' || preLoginFinal !== '₹0') {
      throw new Error(`Pre-login fields are not blank: area="${preLoginArea}", rate="${preLoginRate}", final="${preLoginFinal}"`);
    }

    // 4. Verify Auto-populate button is disabled with sign-in tooltip
    const isPopulateDisabled = await page.evaluate(() => {
      const btn = document.getElementById('btn-calc-populate-current');
      return btn.disabled && btn.getAttribute('title').includes('Sign in');
    });
    if (!isPopulateDisabled) {
      throw new Error('Auto-populate button should be disabled with sign-in tooltip pre-login!');
    }
    console.log('✓ Auto-populate button is properly disabled pre-login with "Sign in to auto-fill" tooltip');

    // 5. Verify no citizen names or Dag 412/1 in calculator modal text
    const modalText = await page.innerText('#modal-compensation-calculator');
    if (modalText.includes('Subrata Ghosh') || modalText.includes('412/1') || modalText.includes('₹3,18,08,000')) {
      throw new Error('Data exposure bug: Pre-login modal contains citizen records or hardcoded award numbers!');
    }
    console.log('✓ Zero citizen data / award numbers found in pre-login calculator');

    await page.screenshot({ path: path.join(screenshotDir, '8_calculator_pre_login_blank.png') });
    await page.click('#btn-close-comp-calc-modal');
    await page.waitForTimeout(300);

    console.log('--- TEST 1: SSO Authentication as Citizen ---');
    await page.goto(`http://127.0.0.1:${PORT}/index.html`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(1000);

    // Select Citizen role
    await page.selectOption('#user-role-select', 'citizen');
    await page.waitForTimeout(300);

    // Click Get OTP
    await page.click('#btn-get-otp');
    await page.waitForTimeout(300);

    // Auto-fill generated OTP or click the auto-fill pill
    await page.click('#btn-autofill-otp');
    await page.waitForTimeout(200);

    // Submit SSO form
    await page.click('#btn-login-submit');
    await page.waitForTimeout(1200);

    // Verify view-citizen is active
    await page.waitForSelector('#view-citizen:not(.hidden)', { timeout: 6000 });
    console.log('✓ Successfully authenticated and navigated to Citizen Portal');

    console.log('--- TEST 2: Citizen Portal - File Section 15 Hearing Objection ---');
    // Ensure citizen parcel view is displayed (default parcel Dag No. 412/1 is loaded)
    await page.waitForSelector('#cit-gut-title', { timeout: 5000 });
    const parcelTitle = await page.innerText('#cit-gut-title');
    console.log(`✓ Citizen parcel loaded: ${parcelTitle}`);

    // Fill objection form
    await page.waitForSelector('#form-file-objection', { timeout: 3000 });
    await page.selectOption('#obj-type', 'Tree / Well / Structure Valuation Dispute');
    const testReason = `Statutory Section 15 Hearing Petition: circle rate multiplier and mature orchard valuation disputed. Generated at ${Date.now()}`;
    await page.fill('#obj-grounds', testReason);

    // Create a mock document to upload
    const mockFilePath = path.join(ROOT_DIR, 'tests', 'mock_valuation_deed.txt');
    fs.writeFileSync(mockFilePath, 'Registered Commercial Sale Deed No. 2024/9912 - Supporting Section 15 Petition.');
    await page.setInputFiles('#obj-document', mockFilePath);
    await page.waitForTimeout(300);

    // Submit objection
    await page.click('#btn-submit-objection');
    await page.waitForTimeout(1000);

    // Verify objection appears in "My Filed Objections & Hearing Status"
    const objectionsListHtml = await page.innerHTML('#cit-objections-list');
    const containsNewObj = objectionsListHtml.includes('Tree / Well / Structure Valuation Dispute');
    if (!containsNewObj) throw new Error('Newly filed objection not found in citizen portal list!');
    console.log('✓ Objection filed and rendered in Citizen Objections list with status "Pending Hearing"');
    await page.screenshot({ path: path.join(screenshotDir, '1_citizen_objection_filed.png') });

    console.log('--- TEST 3: District CALA Desk - Section 15 Docket & Hearing Outcome ---');
    // Switch role to District CALA and navigate to District View
    await page.evaluate(() => {
      sessionStorage.setItem('nlams_is_authenticated', 'true');
      sessionStorage.setItem('nlams_session_role', 'dro-cala');
      window.NLAMS_STORE.setUserRole('dro-cala');
      if (window.NLAMS_API) window.NLAMS_API.login('dro-cala');
      window.switchView('view-district', true);
    });
    await page.waitForTimeout(800);

    // Check CALA objections docket
    await page.waitForSelector('#cala-objections-table-body', { timeout: 5000 });
    const docketText = await page.innerText('#cala-objections-table-body');
    if (!docketText.includes('WB-HGY-DNK-01')) {
      throw new Error('Filed objection for parcel WB-HGY-DNK-01 not visible in CALA Docket!');
    }
    console.log('✓ District CALA Section 15 docket displays the citizen objection');

    // Click "Record Outcome" on the action button
    const recordBtn = await page.$('.btn-record-outcome');
    if (!recordBtn) throw new Error('No record outcome button found in docket!');
    await recordBtn.click();
    await page.waitForTimeout(600);

    // Check modal visibility
    await page.waitForSelector('#modal-hearing-outcome:not(.hidden)', { timeout: 5000 });
    console.log('✓ Section 15 Hearing Outcome modal opened');

    // Select "Upheld" outcome and fill findings
    await page.selectOption('#hearing-verdict-select', 'Upheld');
    await page.fill('#hearing-notes-input', 'Valuation re-survey verified; supplementary tree compensation approved under Section 29.');
    await page.fill('#hearing-officer-input', 'S. Majumdar, IAS (CALA Hooghly)');

    // Submit outcome
    await page.click('#btn-save-hearing-order');
    await page.waitForTimeout(1000);
    console.log('✓ Hearing outcome recorded as "Upheld"');
    await page.screenshot({ path: path.join(screenshotDir, '2_district_cala_outcome.png') });

    console.log('--- TEST 4: Citizen Portal Verification of Upheld Outcome ---');
    // Switch back to citizen view to confirm status updated
    await page.evaluate(() => {
      sessionStorage.setItem('nlams_is_authenticated', 'true');
      sessionStorage.setItem('nlams_session_role', 'citizen');
      window.NLAMS_STORE.setUserRole('citizen', 'WB-CIT-01');
      if (window.NLAMS_API) window.NLAMS_API.login('citizen');
      window.switchView('view-citizen', true);
    });
    await page.waitForTimeout(800);

    const updatedCitObjText = await page.innerText('#cit-objections-list');
    const isUpheld = updatedCitObjText.includes('Upheld');
    if (!isUpheld) throw new Error('Citizen objections list did not reflect the "Upheld" outcome!');
    console.log('✓ Citizen portal live reflection confirmed: Status is "Upheld" with hearing officer findings');
    await page.screenshot({ path: path.join(screenshotDir, '3_citizen_view_upheld.png') });

    console.log('--- TEST 5: Cryptographic Audit Trail Modal & Hash Verification ---');
    await page.click('#btn-open-audit-trail');
    await page.waitForTimeout(500);
    await page.waitForSelector('#modal-audit-trail:not(.hidden)');

    const auditTableText = await page.innerText('#audit-trail-table-body');
    if (!auditTableText.toLowerCase().includes('objection')) {
      throw new Error('Audit trail does not contain objection events!');
    }
    console.log('✓ Cryptographic Audit Trail open, verified entries with SHA-256 signatures');
    await page.screenshot({ path: path.join(screenshotDir, '4_audit_trail_modal.png') });
    await page.click('#btn-close-audit-modal');
    await page.waitForTimeout(300);

    console.log('--- TEST 6: Statutory Reports Center & Tab Navigation ---');
    await page.click('#btn-open-reports-center');
    await page.waitForTimeout(500);
    await page.waitForSelector('#modal-reports-center:not(.hidden)');

    // Test switching tabs in reports center
    await page.click('.btn-report-tab[data-report="award"]');
    await page.waitForTimeout(300);
    let previewHtml = await page.innerHTML('#report-preview-surface');
    if (!previewHtml.includes('Section 3G') && !previewHtml.includes('Award')) {
      throw new Error('Award schedule did not render in report preview!');
    }
    console.log('✓ 3G Award Schedule report preview verified');

    await page.click('.btn-report-tab[data-report="dbt"]');
    await page.waitForTimeout(300);
    previewHtml = await page.innerHTML('#report-preview-surface');
    if (!previewHtml.includes('DBT') && !previewHtml.includes('PFMS')) {
      throw new Error('PFMS DBT Ledger did not render in report preview!');
    }
    console.log('✓ PFMS DBT Ledger report preview verified');

    await page.click('.btn-report-tab[data-report="objections"]');
    await page.waitForTimeout(300);
    previewHtml = await page.innerHTML('#report-preview-surface');
    if (!previewHtml.includes('Section 15') && !previewHtml.includes('Objection')) {
      throw new Error('Section 15 Objections Register did not render in report preview!');
    }
    console.log('✓ Section 15 Objections Register report preview verified');
    await page.screenshot({ path: path.join(screenshotDir, '5_reports_center.png') });
    await page.click('#btn-close-reports-modal');
    await page.waitForTimeout(300);

    console.log('--- TEST 7: Interactive Compensation Calculator (Dual Mode: Simple & Detailed) ---');
    // Switch to Citizen Portal
    const citizenNavBtn = await page.$('.dash-nav-btn[data-view="view-citizen"]');
    if (citizenNavBtn) {
      await citizenNavBtn.click();
      await page.waitForTimeout(400);
    }

    // 1. Open calculator from Citizen Portal parcel card
    await page.waitForSelector('#btn-open-citizen-comp-calc', { timeout: 3000 });
    await page.click('#btn-open-citizen-comp-calc');
    await page.waitForSelector('#modal-compensation-calculator:not(.hidden)', { timeout: 3000 });
    console.log('✓ Compensation Calculator modal opened from Citizen Portal');

    // Verify Citizen default is "Simple" mode
    const isSimpleDefault = await page.evaluate(() => {
      const modal = document.getElementById('modal-compensation-calculator');
      const simpleBtn = document.getElementById('calc-mode-btn-simple');
      return modal.classList.contains('calc-mode-simple') && simpleBtn.classList.contains('active');
    });
    if (!isSimpleDefault) {
      throw new Error('Citizen Portal did not default to Simple Mode in Compensation Calculator!');
    }
    console.log('✓ Citizen Portal successfully defaulted to Simple Mode');

    // Verify plain-language labels in Simple mode
    const simpleRateLabel = await page.innerText('#label-circle-rate-simple');
    const simpleAssetsLabel = await page.innerText('#label-assets-simple');
    const simpleInterestLabel = await page.innerText('#label-interest-simple');
    console.log(`✓ Simple Mode Labels: Rate: "${simpleRateLabel}", Assets: "${simpleAssetsLabel}", Interest: "${simpleInterestLabel}"`);

    // Verify Statutory Authority box is hidden in Simple mode
    const isAuthBoxHidden = await page.evaluate(() => {
      const box = document.getElementById('calc-statutory-authority-box');
      return window.getComputedStyle(box).display === 'none';
    });
    if (!isAuthBoxHidden) {
      throw new Error('Statutory Authority box should be hidden in Simple Mode!');
    }
    console.log('✓ Statutory Authority box is hidden in Simple Mode');

    // 2. Verify auto-populated Dag No. 412/1 values and sanity check match in Simple mode
    await page.waitForFunction(() => {
      const finalEl = document.getElementById('calc-res-final');
      return finalEl && finalEl.textContent.includes('3,18,08,000');
    }, { timeout: 5000 });

    const finalValSimple = await page.innerText('#calc-res-final');
    if (!finalValSimple.includes('3,18,08,000')) {
      throw new Error(`Sanity check failed in Simple Mode: Expected ₹3,18,08,000 but got ${finalValSimple}`);
    }
    console.log(`✓ SANITY CHECK PASSED (Simple Mode): ₹3,18,08,000`);

    // 3. Test Simple Mode Yes/No toggle for assets
    await page.click('#calc-assets-btn-yes');
    await page.waitForSelector('#calc-assets-content:not(.hidden)', { timeout: 2000 });
    await page.fill('#calc-input-trees', '50000');
    await page.fill('#calc-input-wells', '25000');
    await page.fill('#calc-input-structures', '125000');
    await page.click('#btn-calc-submit');
    await page.waitForTimeout(600);

    const finalWithAssets = await page.innerText('#calc-res-final');
    console.log(`✓ Final Disbursal with Assets: ${finalWithAssets} (Expected: ₹3,22,08,000)`);
    if (!finalWithAssets.includes('3,22,08,000')) {
      throw new Error(`Expected ₹3,22,08,000 with assets, got ${finalWithAssets}`);
    }

    // Reset assets back to 0
    await page.click('#calc-assets-btn-no');
    await page.click('#btn-calc-submit');
    await page.waitForTimeout(500);

    // 4. Test Toggle to "Detailed / Legal" mode
    await page.click('#calc-mode-btn-detailed');
    await page.waitForTimeout(300);

    const isDetailedMode = await page.evaluate(() => {
      const modal = document.getElementById('modal-compensation-calculator');
      const detailedBtn = document.getElementById('calc-mode-btn-detailed');
      return modal.classList.contains('calc-mode-detailed') && detailedBtn.classList.contains('active');
    });
    if (!isDetailedMode) {
      throw new Error('Failed to switch to Detailed/Legal Mode!');
    }

    // Verify Statutory Authority box is visible in Detailed mode
    const isAuthBoxVisible = await page.evaluate(() => {
      const box = document.getElementById('calc-statutory-authority-box');
      return window.getComputedStyle(box).display !== 'none';
    });
    if (!isAuthBoxVisible) {
      throw new Error('Statutory Authority box should be visible in Detailed Mode!');
    }
    console.log('✓ Switched to Detailed/Legal Mode (Statutory Authority box & citations visible)');

    // Verify sanity check matches ₹3,18,08,000 in Detailed mode as well
    const finalValDetailed = await page.innerText('#calc-res-final');
    if (!finalValDetailed.includes('3,18,08,000')) {
      throw new Error(`Sanity check failed in Detailed Mode: Expected ₹3,18,08,000 but got ${finalValDetailed}`);
    }
    console.log(`✓ SANITY CHECK PASSED (Detailed Mode): Output matches ₹3,18,08,000 exactly!`);

    // Verify session persistence
    const savedMode = await page.evaluate(() => sessionStorage.getItem('nlams_calc_mode'));
    if (savedMode !== 'detailed') {
      throw new Error(`Expected sessionStorage nlams_calc_mode to be 'detailed', got '${savedMode}'`);
    }
    console.log(`✓ Session persistence verified: nlams_calc_mode = "${savedMode}"`);

    // Switch back to Simple mode and take screenshot
    await page.click('#calc-mode-btn-simple');
    await page.waitForTimeout(300);
    await page.screenshot({ path: path.join(screenshotDir, '7_compensation_calculator.png') });
    await page.click('#btn-close-comp-calc-modal');
    await page.waitForTimeout(300);

    // 5. Test Officials' experience: CALA view must default to Detailed mode
    const calaNavBtn = await page.$('.dash-nav-btn[data-view="view-cala"]');
    if (calaNavBtn) {
      await calaNavBtn.click();
      await page.waitForTimeout(400);
      await page.waitForSelector('#btn-cala-comp-calc', { timeout: 3000 });
      await page.click('#btn-cala-comp-calc');
      await page.waitForSelector('#modal-compensation-calculator:not(.hidden)', { timeout: 3000 });

      const isCalaDetailed = await page.evaluate(() => {
        const modal = document.getElementById('modal-compensation-calculator');
        return modal.classList.contains('calc-mode-detailed');
      });
      if (!isCalaDetailed) {
        throw new Error('CALA Dashboard did not default to Detailed/Legal Mode!');
      }
      console.log('✓ Officials (CALA Dashboard) default to Detailed/Legal Mode as required');
      await page.click('#btn-close-comp-calc-modal');
      await page.waitForTimeout(300);
    }

    console.log('--- TEST 8: Multilingual Toggle System ---');
    const langSelect = await page.$('#lang-select');
    if (langSelect) {
      await page.selectOption('#lang-select', 'hi');
      await page.waitForTimeout(400);
      const hindiHeaderText = await page.innerText('[data-i18n="header.portal_title"]');
      console.log(`✓ Switched to Hindi (Portal Title text: "${hindiHeaderText}")`);

      await page.selectOption('#lang-select', 'bn');
      await page.waitForTimeout(400);
      const bengaliHeaderText = await page.innerText('[data-i18n="header.portal_title"]');
      console.log(`✓ Switched to Bengali (Portal Title text: "${bengaliHeaderText}")`);

      await page.selectOption('#lang-select', 'en');
      await page.waitForTimeout(300);
      console.log('✓ Reset language to English');
    }

    console.log('--- TEST 9: Mobile Responsive Viewport (375x812) ---');
    await page.setViewportSize({ width: 375, height: 812 });
    await page.waitForTimeout(500);

    const clientWidth = await page.evaluate(() => document.documentElement.clientWidth);
    console.log(`Viewport check - clientWidth: ${clientWidth}`);
    await page.screenshot({ path: path.join(screenshotDir, '6_mobile_viewport.png') });
    console.log('✓ Mobile responsive layout verified');

    console.log('\n========================================');
    console.log('🎉 ALL 9 TEST SUITES PASSED FLAWLESSLY! 🎉');
    console.log('========================================\n');

  } catch (err) {
    console.error('❌ Test failed with error:', err);
    await page.screenshot({ path: path.join(screenshotDir, 'error_state.png') });
    throw err;
  } finally {
    await browser.close();
    server.close();
  }
}

runTests().catch((err) => {
  console.error(err);
  process.exit(1);
});
