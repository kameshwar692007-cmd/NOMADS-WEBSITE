import {useEffect,useState} from 'react';
import {useNavigate} from 'react-router-dom';
import './NpcDialogue.css';

const INDEX={ 'hero-guide':0, receptionist:1,'arena-host':2, developer:3,
 'event-coordinator':4,'community-manager':5,'partnership-rep':6 };
export function NpcPortrait({portrait='hero-guide',className=''}) {
 const i=INDEX[portrait]??0;
 return <div className={'np-portrait '+className}
   role="img" aria-label={portrait.replaceAll('-',' ')}
   style={{'--np-portrait-x':`${i%4*100/3}%`,'--np-portrait-y':`${Math.floor(i/4)*100}%`}}/>;
}

export default function NpcDialogue({npc,onClose}) {
 const navigate=useNavigate();
 const message=npc?.message||'';
 const [shown,setShown]=useState(0);
 useEffect(()=>{
  if(!npc)return;
  setShown(0);
  if(window.matchMedia?.('(prefers-reduced-motion: reduce)').matches){setShown(message.length);return;}
  let count=0;
  const timer=window.setInterval(()=>{count=Math.min(message.length,count+2);setShown(count);if(count>=message.length)window.clearInterval(timer);},24);
  return ()=>window.clearInterval(timer);
 },[npc?.id,message]);
 useEffect(()=>{
  if(!npc)return;
  const key=e=>{
   if(e.key==='Escape'){onClose();return;}
   if(e.key==='Enter'&&shown<message.length){setShown(message.length);}
  };
  window.addEventListener('keydown',key);
  return ()=>window.removeEventListener('keydown',key);
 },[npc,onClose,shown,message.length]);
 if(!npc)return null;
 const handleContinue=()=>{
  if(shown<message.length){setShown(message.length);return;}
  if(npc.route){onClose();navigate(npc.route);}
  else onClose();
 };
 return <div className="np-dialogue-backdrop" role="presentation" onMouseDown={e=>{if(e.target===e.currentTarget)onClose();}}>
  <section className="np-dialogue" role="dialog" aria-modal="true" aria-label={npc.name+' dialogue'}>
   <button type="button" className="np-dialogue-close" onClick={onClose} aria-label="Close dialogue">×</button>
   <div className="np-dialogue-main">
    <NpcPortrait portrait={npc.portrait}/>
    <div className="np-dialogue-copy">
     <div className="np-dialogue-role">{npc.title}</div>
     <h2>{npc.name}</h2>
     <p aria-live="off">{message.slice(0,shown)}{shown<message.length&&<span className="np-caret" aria-hidden="true">▍</span>}</p>
     {npc.note&&<p className="np-dialogue-note">{npc.note}</p>}
    </div>
   </div>
   <div className="np-dialogue-actions">
    <button type="button" className="np-dialogue-later" onClick={onClose}>Not now</button>
    <button type="button" className="np-dialogue-enter" onClick={handleContinue}>
      {shown<message.length?'Continue':npc.actionLabel||'Explore'} <span aria-hidden="true">➜</span>
    </button>
   </div>
  </section>
 </div>;
}
