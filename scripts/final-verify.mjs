import { spawn } from 'child_process';
import fs from 'fs';

async function run() {
  const edge = spawn('C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe', [
    '--headless=new', '--remote-debugging-port=9222', '--disable-gpu', '--no-sandbox'
  ]);
  await new Promise(r => setTimeout(r, 2000));

  try {
    const res = await fetch('http://127.0.0.1:9222/json/new?http://localhost:5173/about', { method: 'PUT' });
    const target = await res.json();
    const ws = new WebSocket(target.webSocketDebuggerUrl);
    await new Promise(r => ws.onopen = r);

    let id = 1;
    function send(m, p = {}) {
      return new Promise(resolve => {
        const c = id++;
        const handler = (e) => {
          const d = JSON.parse(e.data);
          if (d.id === c) { ws.removeEventListener('message', handler); resolve(d.result); }
        };
        ws.addEventListener('message', handler);
        ws.send(JSON.stringify({ id: c, method: m, params: p }));
      });
    }

    // ----- Desktop 1440x900 -----
    await send('Emulation.setDeviceMetricsOverride', { width: 1440, height: 900, deviceScaleFactor: 1, mobile: false });
    await new Promise(r => setTimeout(r, 2000));

    // Scroll to showcase
    await send('Runtime.evaluate', { expression: `document.querySelector('.pinned-partners-showcase-section')?.scrollIntoView({behavior:'instant',block:'start'})` });
    await new Promise(r => setTimeout(r, 800));

    // DOM inspection
    const desktop = await send('Runtime.evaluate', { expression: `JSON.stringify({
      docW: document.documentElement.scrollWidth,
      winW: window.innerWidth,
      overflow: document.documentElement.scrollWidth > window.innerWidth,
      showcaseExists: !!document.querySelector('.pinned-partners-showcase-section'),
      splitCardExists: !!document.querySelector('.split-card'),
      stageBoxExists: !!document.querySelector('.stage-box'),
      imgExists: !!document.querySelector('.stage-img'),
      detailsExists: !!document.querySelector('.details-box'),
      dotsCount: document.querySelectorAll('.dot').length,
      arrowCount: document.querySelectorAll('.arrow-btn').length,
      title: document.querySelector('.partner-title')?.textContent,
      fullname: document.querySelector('.partner-fullname')?.textContent,
      category: document.querySelector('.cat-badge')?.textContent,
      index: document.querySelector('.partner-index')?.textContent,
      desc: document.querySelector('.partner-desc')?.textContent?.substring(0, 80),
      imgSrc: document.querySelector('.stage-img')?.src,
      splitW: Math.round(document.querySelector('.split-card')?.getBoundingClientRect()?.width || 0),
      splitH: Math.round(document.querySelector('.split-card')?.getBoundingClientRect()?.height || 0),
      stageW: Math.round(document.querySelector('.stage-box')?.getBoundingClientRect()?.width || 0),
      stageH: Math.round(document.querySelector('.stage-box')?.getBoundingClientRect()?.height || 0),
      consoleErrors: []
    })`, returnByValue: true });
    console.log('=== DESKTOP 1440x900 ===');
    console.log(JSON.parse(desktop.result.value));

    // Screenshot
    const ss1 = await send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync('C:/Users/asus/.gemini/antigravity/brain/7f041f0f-7a9e-4147-b408-505a9cc40807/final-desktop-partner1.png', Buffer.from(ss1.data, 'base64'));
    console.log('Saved final-desktop-partner1.png');

    // Click NEXT
    await send('Runtime.evaluate', { expression: `Array.from(document.querySelectorAll('.arrow-btn')).find(b=>b.textContent.includes('NEXT'))?.click()` });
    await new Promise(r => setTimeout(r, 500));

    const p2 = await send('Runtime.evaluate', { expression: `JSON.stringify({
      title: document.querySelector('.partner-title')?.textContent,
      index: document.querySelector('.partner-index')?.textContent,
      imgSrc: document.querySelector('.stage-img')?.src
    })`, returnByValue: true });
    console.log('After NEXT click:', JSON.parse(p2.result.value));

    const ss2 = await send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync('C:/Users/asus/.gemini/antigravity/brain/7f041f0f-7a9e-4147-b408-505a9cc40807/final-desktop-partner2.png', Buffer.from(ss2.data, 'base64'));
    console.log('Saved final-desktop-partner2.png');

    // Check all 5 sections exist on the page
    const sections = await send('Runtime.evaluate', { expression: `JSON.stringify({
      citadelCard: !!document.querySelector('.hero-citadel-card'),
      pillarsGrid: !!document.querySelector('.grid-3-col'),
      pillarCount: document.querySelectorAll('.pillar-card').length,
      teamGrid: !!document.querySelector('.grid-2-col'),
      teamCardCount: document.querySelectorAll('.team-group-card').length,
      whatsappLink: !!document.querySelector('.join-team-callout a[href*=\"whatsapp\"]'),
      partnersShowcase: !!document.querySelector('.pinned-partners-showcase-section'),
      provinceExplore: !!document.querySelector('.province-explore-section'),
      exploreCardCount: document.querySelectorAll('.province-explore-card').length
    })`, returnByValue: true });
    console.log('=== CONTENT PRESERVATION CHECK ===');
    console.log(JSON.parse(sections.result.value));

    // Console errors
    const errors = await send('Runtime.evaluate', { expression: `JSON.stringify(window.__consoleErrors || [])`, returnByValue: true });
    console.log('Console errors captured:', JSON.parse(errors.result.value));

    // ----- Mobile 375x812 -----
    await send('Emulation.setDeviceMetricsOverride', { width: 375, height: 812, deviceScaleFactor: 2, mobile: true });
    await new Promise(r => setTimeout(r, 1000));
    await send('Runtime.evaluate', { expression: `document.querySelector('.pinned-partners-showcase-section')?.scrollIntoView({behavior:'instant',block:'start'})` });
    await new Promise(r => setTimeout(r, 600));

    const mobile = await send('Runtime.evaluate', { expression: `JSON.stringify({
      docW: document.documentElement.scrollWidth,
      winW: window.innerWidth,
      overflow: document.documentElement.scrollWidth > window.innerWidth,
      splitW: Math.round(document.querySelector('.split-card')?.getBoundingClientRect()?.width || 0),
      stageW: Math.round(document.querySelector('.stage-box')?.getBoundingClientRect()?.width || 0),
      stageH: Math.round(document.querySelector('.stage-box')?.getBoundingClientRect()?.height || 0),
      splitPosition: getComputedStyle(document.querySelector('.split-card')).position
    })`, returnByValue: true });
    console.log('=== MOBILE 375x812 ===');
    console.log(JSON.parse(mobile.result.value));

    const ss3 = await send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync('C:/Users/asus/.gemini/antigravity/brain/7f041f0f-7a9e-4147-b408-505a9cc40807/final-mobile-partner.png', Buffer.from(ss3.data, 'base64'));
    console.log('Saved final-mobile-partner.png');

    ws.close();
    console.log('\n=== ALL BROWSER VERIFICATION CHECKS COMPLETE ===');
  } catch (err) {
    console.error('Error:', err);
  } finally {
    edge.kill();
  }
}

run();
