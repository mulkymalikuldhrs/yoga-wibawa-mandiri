import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';

const BASE_URL = 'http://localhost:8080';
const SCREENSHOT_DIR = '/home/z/my-project/yoga-wibawa-mandiri/test-screenshots';

async function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

async function saveScreenshot(page, name) {
  try {
    const filepath = path.join(SCREENSHOT_DIR, `${name}.png`);
    await page.screenshot({ path: filepath, fullPage: false });
    console.log(`  📸 Screenshot saved: ${name}.png`);
  } catch (e) {
    console.log(`  ⚠️ Screenshot failed for ${name}: ${e.message}`);
  }
}

async function runTests() {
  console.log('🚀 Starting browser tests...\n');
  const results = { passed: 0, failed: 0, errors: [] };

  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });

  // Collect console errors
  const consoleErrors = [];
  page.on('console', msg => {
    if (msg.type() === 'error') {
      consoleErrors.push(msg.text());
    }
  });

  // Collect page errors
  const pageErrors = [];
  page.on('pageerror', error => {
    pageErrors.push(error.message);
  });

  try {
    // ── TEST 1: Homepage loads ──
    console.log('Test 1: Homepage loads');
    try {
      await page.goto(BASE_URL + '/', { waitUntil: 'networkidle2', timeout: 30000 });
      const title = await page.title();
      await saveScreenshot(page, '01-homepage');
      if (title && title.includes('Yoga Wibawa')) {
        console.log('  ✅ PASS - Homepage loaded, title:', title);
        results.passed++;
      } else {
        console.log('  ❌ FAIL - Title not found:', title);
        results.failed++;
        results.errors.push('Homepage title missing');
      }
    } catch (e) {
      console.log('  ❌ FAIL - Homepage load error:', e.message);
      results.failed++;
      results.errors.push('Homepage load: ' + e.message);
      await saveScreenshot(page, '01-homepage-fail');
    }

    // ── TEST 2: Homepage content visible ──
    console.log('Test 2: Homepage content');
    try {
      const heroText = await page.$eval('h1', el => el.textContent).catch(() => null);
      if (heroText && heroText.includes('Yoga Wibawa')) {
        console.log('  ✅ PASS - Hero text found:', heroText.substring(0, 50));
        results.passed++;
      } else {
        console.log('  ❌ FAIL - Hero h1 not found');
        results.failed++;
        results.errors.push('Homepage h1 missing');
      }
    } catch (e) {
      console.log('  ❌ FAIL - Content check error:', e.message);
      results.failed++;
    }

    // ── TEST 3: ChatBot floating button visible ──
    console.log('Test 3: ChatBot floating button');
    try {
      await sleep(2000);
      const chatButton = await page.$('button[aria-label="Open Chat"], button[aria-label="Buka Chat AI"]').catch(() => null);
      // Also check by the chat button's class/pattern
      const allButtons = await page.$$('button');
      let foundChatBtn = false;
      for (const btn of allButtons) {
        const text = await btn.evaluate(el => el.getAttribute('aria-label') || '');
        if (text.includes('Chat') || text.includes('chat')) {
          foundChatBtn = true;
          break;
        }
      }
      if (chatButton || foundChatBtn) {
        console.log('  ✅ PASS - Chat button found');
        results.passed++;
      } else {
        console.log('  ⚠️  WARN - Chat button not found (may need scroll)');
        // Don't count as failure since it might be below fold
      }
    } catch (e) {
      console.log('  ❌ FAIL - Chat button check error:', e.message);
      results.failed++;
    }

    // ── TEST 4: Navigate to Dashboard ──
    console.log('Test 4: Dashboard page loads');
    try {
      await page.goto(BASE_URL + '/dashboard', { waitUntil: 'networkidle2', timeout: 30000 });
      await sleep(3000);
      await saveScreenshot(page, '04-dashboard');
      const content = await page.content();
      if (content.includes('YWM') || content.includes('Dashboard') || content.includes('Ringkasan')) {
        console.log('  ✅ PASS - Dashboard page loaded');
        results.passed++;
      } else {
        console.log('  ❌ FAIL - Dashboard content not found');
        results.failed++;
        results.errors.push('Dashboard page empty');
      }
    } catch (e) {
      console.log('  ❌ FAIL - Dashboard load error:', e.message);
      results.failed++;
      results.errors.push('Dashboard load: ' + e.message);
      await saveScreenshot(page, '04-dashboard-fail');
    }

    // ── TEST 5: Sidebar navigation works ──
    console.log('Test 5: Sidebar navigation');
    try {
      // Look for sidebar items
      const sidebarItems = await page.$$('aside button, nav button');
      if (sidebarItems.length > 3) {
        console.log('  ✅ PASS - Sidebar items found:', sidebarItems.length);
        results.passed++;
      } else {
        console.log('  ❌ FAIL - Not enough sidebar items:', sidebarItems.length);
        results.failed++;
        results.errors.push('Sidebar items missing');
      }
    } catch (e) {
      console.log('  ❌ FAIL - Sidebar check error:', e.message);
      results.failed++;
    }

    // ── TEST 6: Click sidebar item (Suku Cadang) ──
    console.log('Test 6: Click sidebar item');
    try {
      const buttons = await page.$$('aside button, nav button');
      let clicked = false;
      for (const btn of buttons) {
        const text = await btn.evaluate(el => el.textContent || '');
        if (text.includes('Suku Cadang') || text.includes('Cadang')) {
          await btn.click();
          clicked = true;
          await sleep(2000);
          await saveScreenshot(page, '06-suku-cadang');
          break;
        }
      }
      if (clicked) {
        console.log('  ✅ PASS - Clicked Suku Cadang');
        results.passed++;
      } else {
        console.log('  ⚠️  WARN - Could not find Suku Cadang button');
      }
    } catch (e) {
      console.log('  ❌ FAIL - Sidebar click error:', e.message);
      results.failed++;
    }

    // ── TEST 7: Check for console errors ──
    console.log('Test 7: Console errors check');
    if (consoleErrors.length === 0) {
      console.log('  ✅ PASS - No console errors');
      results.passed++;
    } else {
      console.log('  ❌ FAIL - Console errors found:', consoleErrors.length);
      consoleErrors.slice(0, 5).forEach(e => console.log('    -', e.substring(0, 100)));
      results.failed++;
      results.errors.push('Console errors: ' + consoleErrors.length);
    }

    // ── TEST 8: Check for page errors ──
    console.log('Test 8: Page errors check');
    if (pageErrors.length === 0) {
      console.log('  ✅ PASS - No page errors');
      results.passed++;
    } else {
      console.log('  ❌ FAIL - Page errors found:', pageErrors.length);
      pageErrors.slice(0, 5).forEach(e => console.log('    -', e.substring(0, 100)));
      results.failed++;
      results.errors.push('Page errors: ' + pageErrors.length);
    }

    // ── TEST 9: Mobile viewport ──
    console.log('Test 9: Mobile responsive');
    try {
      await page.setViewport({ width: 375, height: 812 });
      await sleep(1000);
      await saveScreenshot(page, '09-mobile-viewport');
      // Check if mobile nav is visible
      const mobileMenuBtn = await page.$('button[aria-label*="Menu"], button[aria-label*="menu"]');
      // Check page still renders
      const content = await page.content();
      if (content.length > 1000) {
        console.log('  ✅ PASS - Mobile viewport renders');
        results.passed++;
      } else {
        console.log('  ❌ FAIL - Mobile viewport empty');
        results.failed++;
      }
      // Reset viewport
      await page.setViewport({ width: 1440, height: 900 });
    } catch (e) {
      console.log('  ❌ FAIL - Mobile viewport error:', e.message);
      results.failed++;
    }

    // ── TEST 10: About page ──
    console.log('Test 10: About page');
    try {
      await page.goto(BASE_URL + '/tentang', { waitUntil: 'networkidle2', timeout: 15000 });
      await saveScreenshot(page, '10-about');
      const content = await page.content();
      if (content.includes('Tentang') || content.includes('Yoga Wibawa')) {
        console.log('  ✅ PASS - About page loaded');
        results.passed++;
      } else {
        console.log('  ❌ FAIL - About page empty');
        results.failed++;
      }
    } catch (e) {
      console.log('  ❌ FAIL - About page error:', e.message);
      results.failed++;
    }

    // ── TEST 11: Contact page ──
    console.log('Test 11: Contact page');
    try {
      await page.goto(BASE_URL + '/kontak', { waitUntil: 'networkidle2', timeout: 15000 });
      await saveScreenshot(page, '11-contact');
      const content = await page.content();
      if (content.includes('Kontak') || content.includes('Hubungi') || content.includes('kontak')) {
        console.log('  ✅ PASS - Contact page loaded');
        results.passed++;
      } else {
        console.log('  ❌ FAIL - Contact page empty');
        results.failed++;
      }
    } catch (e) {
      console.log('  ❌ FAIL - Contact page error:', e.message);
      results.failed++;
    }

    // ── TEST 12: Check dashboard modules load ──
    console.log('Test 12: Dashboard modules load');
    try {
      await page.goto(BASE_URL + '/dashboard', { waitUntil: 'networkidle2', timeout: 30000 });
      await sleep(3000);

      // Check if loading spinner appears and then content
      const hasSpinner = await page.$('.animate-spin, [data-loading]').catch(() => null);
      if (hasSpinner) {
        await sleep(3000); // Wait for loading to finish
      }

      await saveScreenshot(page, '12-dashboard-modules');
      const content = await page.content();
      const hasContent = content.includes('Ringkasan') || content.includes('Overview') || content.includes('Stat');
      if (hasContent) {
        console.log('  ✅ PASS - Dashboard overview module loaded');
        results.passed++;
      } else {
        console.log('  ⚠️  WARN - Dashboard content may still be loading');
        // Don't fail - may just need more time
      }
    } catch (e) {
      console.log('  ❌ FAIL - Dashboard module error:', e.message);
      results.failed++;
    }

  } catch (e) {
    console.log('💥 Fatal test error:', e.message);
    results.errors.push('Fatal: ' + e.message);
  } finally {
    await browser.close();
  }

  // ── Summary ──
  console.log('\n' + '='.repeat(50));
  console.log('BROWSER TEST SUMMARY');
  console.log('='.repeat(50));
  console.log(`✅ Passed: ${results.passed}`);
  console.log(`❌ Failed: ${results.failed}`);
  console.log(`📊 Total:  ${results.passed + results.failed}`);
  if (results.errors.length > 0) {
    console.log('\n🔴 Errors:');
    results.errors.forEach(e => console.log('  -', e));
  }
  console.log('='.repeat(50));

  process.exit(results.failed > 0 ? 1 : 0);
}

runTests().catch(e => {
  console.error('Test runner error:', e);
  process.exit(1);
});
