import {useEffect,useMemo,useState} from 'react';
import {useNavigate} from 'react-router-dom';
import './NpcDialogue.css';

// Convert the existing 4x2 portrait sheet into a separate image for each NPC.
// Each portrait is independently cropped at its native 128x128 resolution;
// no CSS offsets, atlas bleed or accidentally mixed characters.
const portraitCache=new Map();
const ATLAS='/assets/onboarding/npc-portraits-atlas.webp';
function usePortrait(index){
 const [src,setSrc]=useState(()=>portraitCache.get(index)||null);
 useEffect(()=>{
  let alive=true;
  if(portraitCache.has(index)){setSrc(portraitCache.get(index));return;}
  const img=new Image();
  img.onload=()=>{
   if(!alive)return;
   const canvas=document.createElement('canvas');
   canvas.width=128;canvas.height=128;
   const ctx=canvas.getContext('2d');
   ctx?.drawImage(img,(index%4)*128,Math.floor(index/4)*128,128,128,0,0,128,128);
   const url=canvas.toDataURL('image/png');
   portraitCache.set(index,url);setSrc(url);
  };
  img.src=ATLAS;
  return ()=>{alive=false;};
 },[index]);
 return src;
}
export function NpcPortrait({portraitIndex=0,name='Character',className=''}) {
 const src=usePortrait(portraitIndex);
 return <div className={'np-portrait-frame '+className}>
  {src?<img className="np-portrait-image" src={src} alt={name} draggable="false"/>:
    <span className="np-portrait-loading" aria-hidden="true">✦</span>}
 </div>;
}
export default function NpcDialogue({npc,onClose}) {
 const navigate=useNavigate();
 const message=npc?.message||'';
 const [shown,setShown]=useState(0);
 useEffect(()=>{
  if(!npc)return;
  const reduced=window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
  setShown(reduced?message.length:0);
  if(reduced)return;
  let amount=0;
  const timer=window.setInterval(()=>{amount=Math.min(message.length,amount+2);setShown(amount);if(amount>=message.length)window.clearInterval(timer);},22);
  return ()=>window.clearInterval(timer);
 },[npc?.id,message]);
 useEffect(()=>{
  if(!npc)return;
  const onKey=e=>{
   if(e.key==='Escape'){e.stopPropagation();onClose();}
   if(e.key==='Enter'&&shown<message.length){setShown(message.length);}
  };
  window.addEventListener('keydown',onKey);
  return ()=>window.removeEventListener('keydown',onKey);
 },[npc,onClose,shown,message.length]);
 if(!npc)return null;
 const continueToPage=()=>{
  if(shown<message.length){setShown(message.length);return;}
  onClose();
  if(npc.route)navigate(npc.route);
 };
 return <div className="np-dialogue-backdrop" onMouseDown={e=>{if(e.target===e.currentTarget)onClose();}}>
  <section className="np-dialogue" role="dialog" aria-modal="true" aria-label={npc.name+' dialogue'}>
   <button type="button" className="np-dialogue-close" onClick={onClose} aria-label="Close dialogue">×</button>
   <div className="np-dialogue-main">
    <NpcPortrait portraitIndex={npc.portraitIndex} name={npc.name}/>
    <div className="np-dialogue-copy">
     <div className="np-dialogue-role">{npc.title}</div>
     <h2>{npc.name}</h2>
     <p aria-live="off">{message.slice(0,shown)}{shown<message.length&&<span className="np-caret" aria-hidden="true">▍</span>}</p>
     {npc.note&&<p className="np-dialogue-note">{npc.note}</p>}
    </div>
   </div>
   <div className="np-dialogue-actions">
    <button type="button" className="np-dialogue-later" onClick={onClose}>Not now</button>
    <button type="button" className="np-dialogue-enter" onClick={continueToPage}>
     {shown<message.length?'Skip text':npc.actionLabel||'Explore'} <span aria-hidden="true">➜</span>
    </button>
   </div>
  </section>
 </div>;
}
