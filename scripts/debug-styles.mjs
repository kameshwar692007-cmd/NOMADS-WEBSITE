import { spawn } from 'child_process';

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

    const cssInfo = await send('Runtime.evaluate', {
      expression: `
        (() => {
          const allRules = [];
          for (let s of document.styleSheets) {
            try {
              for (let r of s.cssRules) {
                if (r.selectorText && (r.selectorText.includes('split') || r.selectorText.includes('stage-wrapper') || r.selectorText.includes('stage-box'))) {
                  allRules.push({ selector: r.selectorText, css: r.cssText });
                }
              }
            } catch(e) {}
          }
          return JSON.stringify({
            matchingRules: allRules,
            allSheetsCount: document.styleSheets.length,
            sheetHrefs: Array.from(document.styleSheets).map(s => s.href || 'inline')
          }, null, 2);
        })()
      `,
      returnByValue: true
    });

    console.log(cssInfo.result.value);

    ws.close();
  } catch (err) {
    console.error(err);
  } finally {
    edge.kill();
  }
}
run();
