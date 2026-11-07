import { spawn } from 'child_process';
import fs from 'fs';

async function run() {
  console.log('Starting Edge CDP inspection...');
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
      return new Promise(resolve => {
        const c = id++;
        const h = (e) => {
          const d = JSON.parse(e.data);
          if (d.id === c) {
            ws.removeEventListener('message', h);
            resolve(d.result);
          }
        };
        ws.addEventListener('message', h);
        ws.send(JSON.stringify({ id: c, method: m, params: p }));
      });
    }

    // 1. Desktop Test (1440x900)
    await send('Emulation.setDeviceMetricsOverride', { width: 1440, height: 900, deviceScaleFactor: 1, mobile: false });
    await new Promise(r => setTimeout(r, 1500));

    // Scroll to showcase section
    await send('Runtime.evaluate', {
      expression: `
        (() => {
          const el = document.querySelector('.pinned-partners-showcase-section');
          if (el) el.scrollIntoView({ behavior: 'instant', block: 'center' });
        })()
      `
    });
    await new Promise(r => setTimeout(r, 800));

    const desktopInfo = await send('Runtime.evaluate', {
      expression: `
        (() => {
          const card = document.querySelector('.split-card');
          const stage = document.querySelector('.stage-box');
          const img = document.querySelector('.stage-img');
          const title = document.querySelector('.partner-title');
          const desc = document.querySelector('.partner-desc');
          const dots = document.querySelectorAll('.dot');
          const prevBtn = document.querySelector('.arrow-btn');

          return {
            docScrollWidth: document.documentElement.scrollWidth,
            winInnerWidth: window.innerWidth,
            hasHOverflow: document.documentElement.scrollWidth > window.innerWidth,
            cardRect: card ? card.getBoundingClientRect() : null,
            stageRect: stage ? stage.getBoundingClientRect() : null,
            imgRect: img ? img.getBoundingClientRect() : null,
            title: title ? title.textContent : null,
            desc: desc ? desc.textContent : null,
            dotsCount: dots.length,
            imgSrc: img ? img.src : null
          };
        })()
      `,
      returnByValue: true
    });

    console.log('Desktop 1440x900 layout:', JSON.stringify(desktopInfo?.result?.value || desktopInfo, null, 2));

    // Capture screenshot of desktop partner 1
    const screenshot1 = await send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync('C:/Users/asus/.gemini/antigravity/brain/7f041f0f-7a9e-4147-b408-505a9cc40807/about-verified-desktop-1.png', Buffer.from(screenshot1.data, 'base64'));
    console.log('Saved about-verified-desktop-1.png');

    // Click NEXT button
    await send('Runtime.evaluate', {
      expression: `
        (() => {
          const btns = Array.from(document.querySelectorAll('.arrow-btn'));
          const next = btns.find(b => b.textContent.includes('NEXT'));
          if (next) next.click();
        })()
      `
    });
    await new Promise(r => setTimeout(r, 600));

    const partner2Info = await send('Runtime.evaluate', {
      expression: `
        (() => {
          const title = document.querySelector('.partner-title');
          const index = document.querySelector('.partner-index');
          const img = document.querySelector('.stage-img');
          return {
            title: title ? title.textContent : null,
            index: index ? index.textContent : null,
            imgSrc: img ? img.src : null
          };
        })()
      `,
      returnByValue: true
    });
    console.log('Partner 2 after NEXT click:', JSON.stringify(partner2Info?.result?.value || partner2Info, null, 2));

    const screenshot2 = await send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync('C:/Users/asus/.gemini/antigravity/brain/7f041f0f-7a9e-4147-b408-505a9cc40807/about-verified-desktop-2.png', Buffer.from(screenshot2.data, 'base64'));
    console.log('Saved about-verified-desktop-2.png');

    // 2. Mobile Test (375x812)
    await send('Emulation.setDeviceMetricsOverride', { width: 375, height: 812, deviceScaleFactor: 2, mobile: true });
    await new Promise(r => setTimeout(r, 1000));

    await send('Runtime.evaluate', {
      expression: `
        (() => {
          const el = document.querySelector('.pinned-partners-showcase-section');
          if (el) el.scrollIntoView({ behavior: 'instant', block: 'center' });
        })()
      `
    });
    await new Promise(r => setTimeout(r, 600));

    const mobileInfo = await send('Runtime.evaluate', {
      expression: `
        (() => {
          const card = document.querySelector('.split-card');
          const stage = document.querySelector('.stage-box');
          const img = document.querySelector('.stage-img');
          return {
            docScrollWidth: document.documentElement.scrollWidth,
            winInnerWidth: window.innerWidth,
            hasHOverflow: document.documentElement.scrollWidth > window.innerWidth,
            cardRect: card ? card.getBoundingClientRect() : null,
            stageRect: stage ? stage.getBoundingClientRect() : null,
            imgRect: img ? img.getBoundingClientRect() : null
          };
        })()
      `,
      returnByValue: true
    });
    console.log('Mobile 375x812 layout:', JSON.stringify(mobileInfo?.result?.value || mobileInfo, null, 2));

    const screenshotMobile = await send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync('C:/Users/asus/.gemini/antigravity/brain/7f041f0f-7a9e-4147-b408-505a9cc40807/about-verified-mobile.png', Buffer.from(screenshotMobile.data, 'base64'));
    console.log('Saved about-verified-mobile.png');

    ws.close();
  } catch (err) {
    console.error('Error in test:', err);
  } finally {
    edge.kill();
  }
}

run();
