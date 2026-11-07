import { spawn } from 'child_process';
import fs from 'fs';

async function run() {
  const edge = spawn('C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe', [
    '--headless=new',
    '--remote-debugging-port=9222',
    '--disable-gpu',
    '--no-sandbox'
  ]);

  await new Promise(r => setTimeout(r, 1500));

  try {
    const res = await fetch('http://127.0.0.1:9222/json/new?http://localhost:5173/about', { method: 'PUT' });
    const target = await res.json();
    const ws = new WebSocket(target.webSocketDebuggerUrl);
    await new Promise(r => ws.onopen = r);

    let id = 1;
    function send(m, p = {}) {
      return new Promise(res => {
        const c = id++;
        const h = (e) => {
          const d = JSON.parse(e.data);
          if (d.id === c) { ws.removeEventListener('message', h); res(d.result); }
        };
        ws.addEventListener('message', h);
        ws.send(JSON.stringify({ id: c, method: m, params: p }));
      });
    }

    await send('Emulation.setDeviceMetricsOverride', { width: 1440, height: 900, deviceScaleFactor: 1, mobile: false });
    await new Promise(r => setTimeout(r, 1500));

    // Scroll to showcase section
    await send('Runtime.evaluate', {
      expression: `
        (() => {
          const el = document.querySelector('.pinned-partners-showcase-section');
          if (el) el.scrollIntoView();
        })()
      `
    });

    await new Promise(r => setTimeout(r, 800));

    // Inspect layout
    const info = await send('Runtime.evaluate', {
      expression: `
        (() => {
          const showcase = document.querySelector('.pinned-partners-showcase-section');
          if (!showcase) return { found: false };
          const rect = showcase.getBoundingClientRect();
          const sticky = document.querySelector('.sticky-stage-col');
          const stickyRect = sticky ? sticky.getBoundingClientRect() : null;
          const stickyCard = document.querySelector('.sticky-stage-card');
          const cardRect = stickyCard ? stickyCard.getBoundingClientRect() : null;
          const triggers = document.querySelector('.scroll-triggers-col');
          const triggersRect = triggers ? triggers.getBoundingClientRect() : null;
          const triggerCards = Array.from(document.querySelectorAll('.partner-scroll-trigger-card')).map(c => {
            const r = c.getBoundingClientRect();
            return {
              title: c.querySelector('.trigger-title')?.textContent,
              top: Math.round(r.top),
              bottom: Math.round(r.bottom),
              height: Math.round(r.height),
              isActive: c.classList.contains('is-active')
            };
          });

          return {
            found: true,
            showcaseTop: Math.round(rect.top),
            showcaseHeight: Math.round(rect.height),
            stickyTop: stickyRect ? Math.round(stickyRect.top) : null,
            stickyHeight: stickyRect ? Math.round(stickyRect.height) : null,
            cardHeight: cardRect ? Math.round(cardRect.height) : null,
            triggersHeight: triggersRect ? Math.round(triggersRect.height) : null,
            viewportHeight: window.innerHeight,
            triggerCards: triggerCards.slice(0, 5)
          };
        })()
      `,
      returnByValue: true
    });

    console.log('Layout evaluation:', JSON.stringify(info.result.value, null, 2));

    // Capture screenshot
    const ss = await send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync('showcase-screenshot.png', Buffer.from(ss.data, 'base64'));
    console.log('Saved showcase-screenshot.png');

    ws.close();
    await fetch('http://127.0.0.1:9222/json/close/' + target.id, { method: 'PUT' });
  } finally {
    edge.kill();
  }
}

run().catch(console.error);
