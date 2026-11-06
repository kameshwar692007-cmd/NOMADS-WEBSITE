import {useEffect,useState} from 'react';
import './BookIntro.css';

const BOOK_STAGES=['arrival','illuminate','open','story','ready'];
export default function BookIntro({onComplete}){
 const [stage,setStage]=useState('arrival');
 useEffect(()=>{
  if(window.matchMedia?.('(prefers-reduced-motion: reduce)').matches){setStage('ready');return;}
  const timers=[
    window.setTimeout(()=>setStage('illuminate'),500),
    window.setTimeout(()=>setStage('open'),1500),
    window.setTimeout(()=>setStage('story'),3200),
    window.setTimeout(()=>setStage('ready'),4350)
  ];
  return ()=>timers.forEach(window.clearTimeout);
 },[]);
 useEffect(()=>{
  const handler=e=>{if(e.key==='Escape'){e.preventDefault();onComplete();}};
  window.addEventListener('keydown',handler);
  return ()=>window.removeEventListener('keydown',handler);
 },[onComplete]);
 return <div className={'np-cinematic np-cinematic-'+stage} role="dialog" aria-modal="true" aria-label="Welcome to Nomad's Province">
   <div className="np-cinematic-grid" aria-hidden="true"/>
   <div className="np-cinematic-aurora" aria-hidden="true"/>
   <div className="np-cinematic-beam np-cinematic-beam-left" aria-hidden="true"/>
   <div className="np-cinematic-beam np-cinematic-beam-right" aria-hidden="true"/>
   <button type="button" className="np-cinematic-skip" onClick={onComplete}>SKIP INTRO <span aria-hidden="true">→</span></button>
   <div className="np-cinematic-logo">
    <img src="/assets/game/headquarters-banner.webp" alt="Nomad's Province Headquarters"/>
    <p>YOUR NEXT ADVENTURE BEGINS HERE</p>
   </div>
   <div className="np-cinematic-platform" aria-hidden="true">
    <div className="np-cinematic-platform-ring"/>
    <div className="np-cinematic-platform-ring np-cinematic-platform-ring-second"/>
   </div>
   <div className="np-book-perspective">
    <div className="np-book-object" aria-label="A glowing book opens to reveal the headquarters">
      <div className="np-book-spine"/>
      <div className="np-book-paper np-book-paper-left">
        <span className="np-book-ornament">✦</span>
        <div className="np-book-seal">NP</div>
        <div className="np-book-small">THE WORLD AWAITS</div>
        <div className="np-book-rule"/>
        <div className="np-book-mini-art" aria-hidden="true">✧ ✧ ✧</div>
      </div>
      <div className="np-book-paper np-book-paper-right">
        <div className="np-book-small">CHAPTER I</div>
        <h1>WELCOME TO<br/>NOMAD'S PROVINCE</h1>
        <div className="np-book-rule"/>
        <h2>HEADQUARTERS CAMPUS</h2>
        <p>Where gamers, creators and innovators come together.</p>
        <div className="np-book-star">✦</div>
      </div>
      <div className="np-book-turn-page" aria-hidden="true">
       <span className="np-book-turn-flourish">✧</span>
      </div>
      <div className="np-book-hardcover" aria-hidden="true">
        <div className="np-book-hardcover-label">
         <span className="np-book-hardcover-emblem">NP</span>
         <strong>NOMAD'S<br/>PROVINCE</strong>
         <small>HEADQUARTERS</small>
        </div>
      </div>
    </div>
   </div>
   <div className="np-cinematic-bottom">
      <div className="np-cinematic-eyebrow">ENTER THE WORLD · DISCOVER YOUR COMMUNITY</div>
      <button type="button" className="np-cinematic-enter" onClick={onComplete}>
        <span>Enter Headquarters</span><span aria-hidden="true">→</span>
      </button>
      <p>Explore the world. Meet the people. Discover what's next.</p>
   </div>
   <div className="np-cinematic-progress" aria-hidden="true"><span/></div>
 </div>;
}
