// Real mobile Chromium check. No browser-mocking: starts the actual Vite site and uses CDP.
import {spawn,spawnSync} from 'node:child_process';
import {mkdir,writeFile} from 'node:fs/promises';
const pause=ms=>new Promise(r=>setTimeout(r,ms));
const failures=[],passed=[];let chromeProcess,server,socket,nextId=0;
function check(label,result,details=''){(result?passed:failures).push(label+(details?' — '+details:''));console.log((result?'PASS ':'FAIL ')+label+(details?' — '+details:''));}
const chrome=['google-chrome','google-chrome-stable','chromium','chromium-browser'].find(n=>spawnSync('which',[n]).status===0);
if(!chrome)throw Error('No Chrome/Chromium installed on this runner');
async function ready(url){for(let i=0;i<100;i++){try{const r=await fetch(url);if(r.ok)return r;}catch{}await pause(200);}throw Error('Timed out waiting for '+url);}
function cmd(method,params={}){
 return new Promise((resolve,reject)=>{
  const id=++nextId,timeout=setTimeout(()=>{socket.removeEventListener('message',handler);reject(Error('Timeout '+method));},20000);
  function handler(event){const data=JSON.parse(event.data);if(data.id!==id)return;clearTimeout(timeout);socket.removeEventListener('message',handler);if(data.error)reject(Error(data.error.message));else resolve(data.result);}
  socket.addEventListener('message',handler);
  socket.send(JSON.stringify({id,method,params}));
 });
}
async function evalJs(expr){const result=await cmd('Runtime.evaluate',{expression:expr,returnByValue:true,awaitPromise:true});if(result.exceptionDetails)throw Error(result.exceptionDetails.text);return result.result.value;}
async function exists(selector){return evalJs('!!document.querySelector('+JSON.stringify(selector)+')');}
async function waitFor(selector){for(let i=0;i<85;i++){if(await exists(selector))return true;await pause(150);}return false;}
async function click(selector){return evalJs('(()=>{const a=document.querySelector('+JSON.stringify(selector)+');if(!a)return false;a.click();return true})()');}
async function view(w,h){await cmd('Emulation.setDeviceMetricsOverride',{width:w,height:h,deviceScaleFactor:1,mobile:w<900});}
async function navigate(path){await cmd('Page.navigate',{url:'http://127.0.0.1:5173'+path});await pause(650);}
async function screenshot(name){const data=await cmd('Page.captureScreenshot',{format:'png',captureBeyondViewport:false});await writeFile('qa-screenshots/'+name+'.png',Buffer.from(data.data,'base64'));}
async function runViewport(w,h){
 await view(w,h);await navigate('/');await evalJs('sessionStorage.removeItem("np-campus-welcomed-v2")');await navigate('/');
 check(w+'px intro loads',await waitFor('.np-revolver'));
 await pause(2700);
 check(w+'px intro auto closes',!(await exists('.np-revolver')));
 check(w+'px header menu exists',await waitFor('.campus-menu-button'));
 const fit=await evalJs('(()=>{return [".campus-fixed-brand",".campus-menu-button"].every(s=>{const e=document.querySelector(s);if(!e)return false;const r=e.getBoundingClientRect();return r.left>=-1&&r.right<=innerWidth+1&&getComputedStyle(e).display!=="none"})})()');
 check(w+'px logo + menu fit viewport',fit);
 const logoCheck=await evalJs('(()=>{const e=document.querySelector(".campus-fixed-brand"); const img=e?.querySelector("img");if(!e||!img)return null;const r=e.getBoundingClientRect();return {width:r.width,src:new URL(img.src).pathname}})()');
 check(w+'px original Headquarters banner present',logoCheck?.src==='/assets/game/headquarters-banner-client.png',JSON.stringify(logoCheck));
 if(w<=390)check(w+'px banner legible (at least 130px)',logoCheck?.width>=130,JSON.stringify(logoCheck));
 await screenshot('campus-'+w);
 await click('.campus-menu-button');
 check(w+'px campus menu opens',await waitFor('.menu-drawer'));
 await screenshot('campus-menu-'+w);
 await click('.menu-close-btn');
 await click('.campus-fixed-brand');
 check(w+'px logo replays intro',await waitFor('.np-revolver'));
 await pause(2700);
 if(w<=768){
  check(w+'px mobile joystick exists',await waitFor('.campus-joystick-base'));
  const pos=await evalJs('(()=>{const r=document.querySelector(".campus-joystick-base")?.getBoundingClientRect();return r?{x:r.left+r.width/2,y:r.top+r.height/2}:null})()');
  if(pos){
   await cmd('Input.dispatchMouseEvent',{type:'mouseMoved',x:pos.x,y:pos.y});
   await cmd('Input.dispatchMouseEvent',{type:'mousePressed',x:pos.x,y:pos.y,button:'left',clickCount:1});
   await cmd('Input.dispatchMouseEvent',{type:'mouseMoved',x:pos.x+28,y:pos.y,button:'left',buttons:1});
   await pause(160);
   const moved=await evalJs('document.querySelector(".campus-joystick-knob")?.style.transform');
   check(w+'px joystick responds to drag',!!moved&&moved!=='translate(0px, 0px)',moved);
   await cmd('Input.dispatchMouseEvent',{type:'mouseReleased',x:pos.x+28,y:pos.y,button:'left',clickCount:1});
   await pause(160);
   const reset=await evalJs('document.querySelector(".campus-joystick-knob")?.style.transform');
   check(w+'px joystick resets on release',reset==='translate(0px, 0px)',reset);
  }
  await screenshot('joystick-'+w);
 }
 await navigate('/studio');
 check(w+'px Studio projects visible',await waitFor('.studio-project-grid'));
 check(w+'px Re-Assemble removed',!(await exists('.blueprint-assembler')));
 // Verify actual page scrolling instead of only checking a sticky navbar.
 const styles=await evalJs('(()=>({html:getComputedStyle(document.documentElement).overflowY,body:getComputedStyle(document.body).overflowY,touch:getComputedStyle(document.body).touchAction}))()');
 check(w+'px normal document overflow',styles.html!=='hidden'&&styles.body!=='hidden'&&styles.touch!=='none',JSON.stringify(styles));
 await evalJs('window.scrollTo(0,900)');
 await pause(400);
 const scrollAfter=await evalJs('window.scrollY');
 check(w+'px scrolling genuinely changes window.scrollY',scrollAfter>150,scrollAfter+'px');
 await cmd('Input.dispatchMouseEvent',{type:'mouseWheel',x:Math.floor(w/2),y:Math.floor(h/2),deltaX:0,deltaY:320});
 await pause(350);
 const scrollAfterWheel=await evalJs('window.scrollY');
 check(w+'px mouse wheel scrolls page',scrollAfterWheel>scrollAfter+50,scrollAfter+'px → '+scrollAfterWheel+'px');
 await cmd('Input.dispatchKeyEvent',{type:'keyDown',key:'ArrowDown',code:'ArrowDown',windowsVirtualKeyCode:40,nativeVirtualKeyCode:40});
 await cmd('Input.dispatchKeyEvent',{type:'keyUp',key:'ArrowDown',code:'ArrowDown',windowsVirtualKeyCode:40,nativeVirtualKeyCode:40});
 await pause(250);
 const scrollAfterArrow=await evalJs('window.scrollY');
 check(w+'px ArrowDown scrolls inner page',scrollAfterArrow>scrollAfterWheel,scrollAfterWheel+'px → '+scrollAfterArrow+'px');
 const menu=await evalJs('(()=>{const b=document.querySelector(".hud-sandwich-btn");if(!b)return null;const r=b.getBoundingClientRect();return {top:r.top,bottom:r.bottom,right:r.right,display:getComputedStyle(b).display}})()');
 if(w<=1040){
  check(w+'px Studio hamburger stays visible after scroll',!!menu&&menu.display!=='none'&&menu.top>=-1&&menu.bottom<=h+1&&menu.right<=w+1,JSON.stringify(menu));
  await click('.hud-sandwich-btn');
  check(w+'px Studio menu opens',await waitFor('.hud-mobile-drawer'));
 }else{
  check(w+'px Studio desktop navigation visible',await evalJs('getComputedStyle(document.querySelector(".hud-center-nav")).display!=="none"'));
 }
 await screenshot('studio-menu-'+w);
 check(w+'px no horizontal overflow',!(await evalJs('document.documentElement.scrollWidth>innerWidth+1')));

 // Client's restored HQ Allies showcase: full logo, 1:1 asset and cyber-stage layout.
 await navigate('/about');
 check(w+'px HQ partner showcase renders',await waitFor('.showcase-allies-grid'));
 const partnerCount=await evalJs('document.querySelectorAll(".showcase-ally-tile").length');
 check(w+'px all 14 allies are shown',partnerCount===14,String(partnerCount));
 const huddleButton='[aria-label="View Huddle Global in the Allies carousel"]';
 check(w+'px Huddle Global selectable',await click(huddleButton));
 await pause(250);
 const huddle=await evalJs('(()=>{const img=document.querySelector(".stage-box img");const stage=document.querySelector(".stage-wrapper");if(!img||!stage)return null;const r=stage.getBoundingClientRect();return {src:new URL(img.src).pathname,naturalWidth:img.naturalWidth,naturalHeight:img.naturalHeight,width:r.width,height:r.height}})()');
 check(w+'px original full Huddle Global logo loaded',
   huddle?.src==='/assets/partners-1x1/huddle-global-original-square.webp' && huddle.naturalWidth===409 && huddle.naturalHeight===409,JSON.stringify(huddle));
 check(w+'px logo showcase is visually square',
   !!huddle && Math.abs(huddle.width-huddle.height)<=2,JSON.stringify(huddle));
 check(w+'px HQ Previous/Next available',
   await exists('[aria-label="Previous Partner"]') && await exists('[aria-label="Next Partner"]'));
 check(w+'px no Pause button in HQ',
   !(await exists('[aria-label="Pause partner carousel"]')));
 check(w+'px original video-style split-card rendered',await exists('.split-card') && await exists('.dots-group') && await exists('.arrows-group'));
 check(w+'px gallery matches original framed logo design',await exists('.showcase-ally-frame .stage-corner.tl'));
 check(w+'px HQ no horizontal overflow',!(await evalJs('document.documentElement.scrollWidth>innerWidth+1')));
 await screenshot('hq-huddle-'+w);
}
try{
 await mkdir('qa-screenshots',{recursive:true});
 server=spawn('npm',['run','dev','--','--host','127.0.0.1','--port','5173','--strictPort'],{stdio:'ignore'});
 await ready('http://127.0.0.1:5173');
 chromeProcess=spawn(chrome,['--headless=new','--remote-debugging-port=9333','--user-data-dir=/tmp/nomads-qa-'+process.pid,'--no-sandbox','--disable-dev-shm-usage','--disable-gpu','about:blank'],{stdio:'ignore'});
 await ready('http://127.0.0.1:9333/json/version');
 const target=await (await fetch('http://127.0.0.1:9333/json/new?http://127.0.0.1:5173',{method:'PUT'})).json();
 socket=new WebSocket(target.webSocketDebuggerUrl);
 await new Promise((resolve,reject)=>{socket.addEventListener('open',resolve,{once:true});socket.addEventListener('error',reject,{once:true});});
 await cmd('Page.enable');await cmd('Runtime.enable');
 for(const [w,h] of [[375,812],[390,844],[768,1024],[1440,900]]){try{await runViewport(w,h);}catch(err){check(w+'px browser check',false,err.message);}}
}catch(err){check('Browser setup',false,err.message);}
finally{
 socket?.close();chromeProcess?.kill();server?.kill();
 console.log('RESULT '+passed.length+' passed; '+failures.length+' failed');
 if(failures.length){console.log(failures.join('\n'));process.exitCode=1;}
}
