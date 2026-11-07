import { spawn } from 'child_process';
import fs from 'fs';

async function testInteractions() {
  const edge = spawn('C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe', [
    '--headless=new',
    '--remote-debugging-port=9222',
    '--disable-gpu',
    '--no-sandbox'
  ]);

  await new Promise(r => setTimeout(r, 1500));

  try {
    const res = await fetch('http://127.0.0.1:9222/json/new?http://localhost:5173/test-showcase.html', { method: 'PUT' });
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

    // 1. Desktop Test
    await send('Emulation.setDeviceMetricsOverride', { width: 1440, height: 900, deviceScaleFactor: 1, mobile: false });
    await new Promise(r => setTimeout(r, 1000));

    // Click NEXT button
    await send('Runtime.evaluate', { expression: `document.getElementById('nextBtn').click()` });
    await new Promise(r => setTimeout(r, 600));

    const partner2Text = await send('Runtime.evaluate', {
      expression: `document.getElementById('partnerTitle').textContent`,
      returnByValue: true
    });
    console.log('Partner after NEXT click:', partner2Text.result.value);

    const ssDesktop = await send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync('C:/Users/asus/.gemini/antigravity/brain/7f041f0f-7a9e-4147-b408-505a9cc40807/desktop-partner2.png', Buffer.from(ssDesktop.data, 'base64'));

    // 2. Mobile Test (390x844)
    await send('Emulation.setDeviceMetricsOverride', { width: 390, height: 844, deviceScaleFactor: 1, mobile: true });
    await new Promise(r => setTimeout(r, 600));

    const ssMobile = await send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync('C:/Users/asus/.gemini/antigravity/brain/7f041f0f-7a9e-4147-b408-505a9cc40807/mobile-showcase.png', Buffer.from(ssMobile.data, 'base64'));
    console.log('Mobile screenshot saved');

    ws.close();
    await fetch('http://127.0.0.1:9222/json/close/' + target.id, { method: 'PUT' });
  } finally {
    edge.kill();
  }
}

testInteractions().catch(console.error);
