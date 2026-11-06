import {useEffect,useState} from 'react';
import './BookIntro.css';

// No WebGL engine or extra 3D dependencies: CSS perspective + a real page turn.
// Intro is intentionally skippable and does not gate the game asset loader.
export default function BookIntro({onComplete}) {
 const [ready,setReady]=useState(false);
 useEffect(()=>{
  if(window.matchMedia?.('(prefers-reduced-motion: reduce)').matches){setReady(true);return;}
  const timer=window.setTimeout(()=>setReady(true),2100);
  return ()=>window.clearTimeout(timer);
 },[]);
 useEffect(()=>{
  const key=e=>{if(e.key==='Escape')onComplete();};
  window.addEventListener('keydown',key);
  return ()=>window.removeEventListener('keydown',key);
 },[onComplete]);
 return <div className="np-book-intro" role="dialog" aria-modal="true" aria-label="Welcome to Nomad's Province">
  <button type="button" className="np-book-skip" onClick={onComplete}>Skip intro →</button>
  <div className="np-book-center">
   <div className="np-book-scene" aria-hidden="true">
    <div className="np-book-spread">
      <div className="np-book-page np-book-left"><span className="np-book-emblem">NP</span><span className="np-book-flourish">✧  EST. FOR EXPLORERS  ✧</span></div>
      <div className="np-book-page np-book-right">
        <img src="/assets/game/headquarters-banner.webp" alt="" className="np-book-insignia"/>
        <strong>WELCOME TO<br/>NOMAD'S PROVINCE</strong>
        <span className="np-book-caption">HEADQUARTERS CAMPUS</span>
        <p>Where gamers, creators and innovators come together.</p>
      </div>
      <div className="np-book-front"></div>
    </div>
   </div>
   <div className={'np-book-cta '+(ready?'np-book-cta-ready':'')}>
    <div className="np-book-cta-kicker">YOUR ADVENTURE BEGINS HERE</div>
    <button type="button" onClick={onComplete}>Enter the World <span aria-hidden="true">➜</span></button>
   </div>
  </div>
 </div>;
}
