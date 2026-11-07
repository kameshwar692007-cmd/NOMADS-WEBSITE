import { spawn } from 'child_process';

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

    const check = await send('Runtime.evaluate', {
      expression: `
        (() => {
          const card = document.querySelector('.sticky-stage-card');
          if (!card) return 'card not found';
          const children = Array.from(card.children).map(c => ({
            tag: c.tagName,
            className: c.className,
            height: c.getBoundingClientRect().height,
            width: c.getBoundingClientRect().width,
            computedHeight: window.getComputedStyle(c).height,
            computedWidth: window.getComputedStyle(c).width
          }));
          return { cardW: card.getBoundingClientRect().width, cardH: card.getBoundingClientRect().height, children };
        })()
      `,
      returnByValue: true
    });

    console.log('Card children inspection:', JSON.stringify(check.result.value, null, 2));

    ws.close();
    await fetch('http://127.0.0.1:9222/json/close/' + target.id, { method: 'PUT' });
  } finally {
    edge.kill();
  }
}

run().catch(console.error);
