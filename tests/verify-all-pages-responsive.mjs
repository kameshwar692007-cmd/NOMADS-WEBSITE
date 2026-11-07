// verify-all-pages-responsive.mjs — Comprehensive automated responsiveness test suite
import { spawn } from 'child_process';

const BASE_URL = 'http://localhost:5173';

const VIEWPORTS = [
  { name: 'Mobile Small', width: 360, height: 740, mobile: true },
  { name: 'Mobile Standard (iPhone)', width: 390, height: 844, mobile: true },
  { name: 'Tablet Portrait (iPad)', width: 768, height: 1024, mobile: true },
  { name: 'Tablet Landscape / Netbook', width: 1024, height: 768, mobile: false },
  { name: 'Laptop WXGA', width: 1366, height: 768, mobile: false },
  { name: 'Desktop Full HD', width: 1920, height: 1080, mobile: false }
];

const PAGES = [
  { path: '/', name: 'Home (Canvas & Campus Hub)' },
  { path: '/about', name: 'About Citadel' },
  { path: '/esports', name: 'Esports Arena' },
  { path: '/studio', name: 'Game Studio' },
  { path: '/events', name: 'Event Grounds' },
  { path: '/community', name: 'Community Tribe' },
  { path: '/contact', name: 'Contact Uplink' },
  { path: '/admin', name: 'Admin Command Citadel' }
];

async function run() {
  console.log('🚀 Starting Automated Full-Page Responsive Verification Suite...');
  
  const edge = spawn('C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe', [
    '--headless=new',
    '--remote-debugging-port=9222',
    '--disable-gpu',
    '--no-sandbox'
  ]);

  await new Promise(r => setTimeout(r, 1500));

  let results = [];
  let totalTests = 0;
  let passedTests = 0;
  let failures = [];

  try {
    const res = await fetch(`http://127.0.0.1:9222/json/new?${BASE_URL}`, { method: 'PUT' });
    const target = await res.json();
    const ws = new WebSocket(target.webSocketDebuggerUrl);

    await new Promise((resolve) => ws.onopen = resolve);

    let nextId = 1;
    function send(method, params = {}) {
      return new Promise((resolve, reject) => {
        const curId = nextId++;
        const timeout = setTimeout(() => {
          ws.removeEventListener('message', handler);
          reject(new Error(`Timeout waiting for CDP response ${method}`));
        }, 15000);

        const handler = (msg) => {
          const data = JSON.parse(msg.data);
          if (data.id === curId) {
            clearTimeout(timeout);
            ws.removeEventListener('message', handler);
            if (data.error) reject(new Error(data.error.message));
            else resolve(data.result);
          }
        };
        ws.addEventListener('message', handler);
        ws.send(JSON.stringify({ id: curId, method, params }));
      });
    }

    await send('Page.enable');
    await send('Runtime.enable');

    for (const page of PAGES) {
      console.log(`\n========================================`);
      console.log(`📄 Testing Page: ${page.name} (${page.path})`);
      console.log(`========================================`);

      for (const vp of VIEWPORTS) {
        totalTests++;
        const vpLabel = `${vp.name} (${vp.width}x${vp.height})`;

        // 1. Set Viewport Emulation
        await send('Emulation.setDeviceMetricsOverride', {
          width: vp.width,
          height: vp.height,
          deviceScaleFactor: 1,
          mobile: vp.mobile
        });

        // 2. Navigate to page
        await send('Page.navigate', { url: `${BASE_URL}${page.path}` });
        
        // Wait for page to render and stabilize
        await new Promise(r => setTimeout(r, 600));

        // 3. Evaluate horizontal overflow
        const overflowCheck = await send('Runtime.evaluate', {
          returnByValue: true,
          expression: `
            (() => {
              const docWidth = document.documentElement.scrollWidth;
              const winWidth = window.innerWidth;
              const hasOverflow = docWidth > winWidth + 1; // 1px threshold for subpixel rounding
              
              let overflowingElements = [];
              if (hasOverflow) {
                const all = document.querySelectorAll('*');
                for (const el of all) {
                  const rect = el.getBoundingClientRect();
                  if (rect.right > winWidth + 1) {
                    overflowingElements.push({
                      tag: el.tagName,
                      className: el.className,
                      right: Math.round(rect.right),
                      width: Math.round(rect.width)
                    });
                    if (overflowingElements.length >= 3) break;
                  }
                }
              }

              return {
                docWidth,
                winWidth,
                hasOverflow,
                overflowingElements
              };
            })()
          `
        });

        const overflow = overflowCheck.result.value;

        // 4. Evaluate navigation elements
        const navCheck = await send('Runtime.evaluate', {
          returnByValue: true,
          expression: `
            (() => {
              const hamburger = document.querySelector('.retro-hamburger-btn, .mobile-menu-btn, button[aria-label*="menu" i]');
              const desktopNav = document.querySelector('.retro-desktop-nav, .desktop-nav-links, .nav-links');
              const isMobileWidth = window.innerWidth <= 860;
              
              return {
                isMobileWidth,
                hamburgerVisible: hamburger ? window.getComputedStyle(hamburger).display !== 'none' : false,
                desktopNavVisible: desktopNav ? window.getComputedStyle(desktopNav).display !== 'none' : false
              };
            })()
          `
        });
        const nav = navCheck.result.value;

        // Specific test for Admin Modal if on /admin
        let modalResults = null;
        if (page.path === '/admin') {
          // Attempt to open the modal
          modalResults = await send('Runtime.evaluate', {
            returnByValue: true,
            expression: `
              (() => {
                // Click "CREATE AN EVENT" button
                const btn = Array.from(document.querySelectorAll('button')).find(b => 
                  b.textContent.includes('CREATE') || b.textContent.includes('NEW EVENT')
                );
                if (btn) btn.click();

                const modal = document.querySelector('.admin-form-modal');
                if (!modal) return { modalFound: false };

                const modalRect = modal.getBoundingClientRect();
                const header = modal.querySelector('.modal-header');
                const headerRect = header ? header.getBoundingClientRect() : null;
                const formBody = modal.querySelector('.modal-body-form');
                const formRect = formBody ? formBody.getBoundingClientRect() : null;
                const footer = modal.querySelector('.modal-footer-actions');
                const footerRect = footer ? footer.getBoundingClientRect() : null;
                const winH = window.innerHeight;
                const winW = window.innerWidth;

                // Close the modal
                const closeBtn = modal.querySelector('.modal-close-btn');
                if (closeBtn) closeBtn.click();

                return {
                  modalFound: true,
                  winH,
                  winW,
                  modalTop: Math.round(modalRect.top),
                  modalBottom: Math.round(modalRect.bottom),
                  modalHeight: Math.round(modalRect.height),
                  fitsInViewport: modalRect.top >= 0 && modalRect.bottom <= winH + 1,
                  headerVisible: headerRect ? headerRect.top >= 0 : false,
                  formScrollable: formBody ? formBody.scrollHeight >= formBody.clientHeight : false,
                  footerVisible: footerRect ? footerRect.bottom <= winH + 1 : false
                };
              })()
            `
          });
        }

        // Evaluate PASS / FAIL
        let status = 'PASS';
        let note = '';

        if (overflow.hasOverflow) {
          status = 'FAIL';
          note = `Horizontal overflow: scrollWidth=${overflow.docWidth}px > innerWidth=${overflow.winWidth}px (Culprits: ${JSON.stringify(overflow.overflowingElements)})`;
        }

        if (modalResults && modalResults.result.value && modalResults.result.value.modalFound) {
          const m = modalResults.result.value;
          if (!m.fitsInViewport) {
            status = 'FAIL';
            note += ` | Modal overflow: top=${m.modalTop}, bottom=${m.modalBottom}, screenH=${m.winH}`;
          }
        }

        if (status === 'PASS') {
          passedTests++;
          console.log(`  ✔ [${vpLabel}] PASS — 0 horizontal overflow`);
        } else {
          failures.push({ page: page.name, viewport: vpLabel, reason: note });
          console.log(`  ✖ [${vpLabel}] FAIL — ${note}`);
        }
      }
    }

    console.log(`\n========================================`);
    console.log(`📊 FINAL RESPONSIVENESS VERIFICATION SUMMARY`);
    console.log(`========================================`);
    console.log(`Total Scenarios Tested : ${totalTests}`);
    console.log(`Passed                 : ${passedTests}`);
    console.log(`Failed                 : ${failures.length}`);
    
    if (failures.length > 0) {
      console.log(`\nFailed Scenarios Detail:`);
      failures.forEach((f, idx) => {
        console.log(`${idx + 1}. Page: ${f.page} | Viewport: ${f.viewport} -> ${f.reason}`);
      });
    }

    ws.close();
    await fetch(`http://127.0.0.1:9222/json/close/${target.id}`, { method: 'PUT' });
  } finally {
    edge.kill();
  }
}

run().catch(err => {
  console.error('Test execution failed:', err);
  process.exit(1);
});
