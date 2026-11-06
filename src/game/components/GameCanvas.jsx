// Campus controller: click-to-travel, keyboard WASD/arrows and mobile D-pad.
import { useState, useEffect, useRef, useCallback } from 'react';
import { LOCATIONS, findClickedBuilding, findNearbyLocation } from '../data/locationData.js';
import { getSpawnPoint, buildPathToPoint } from '../data/travelPaths.js';
import { WORLD_WIDTH, WORLD_HEIGHT } from '../data/mapData.js';
import { AutoTravelSystem } from '../systems/autoTravel.js';
import { CameraSystem } from '../systems/camera.js';
import { resolveMovement, resolvePathMovement } from '../systems/collision.js';
import { loadAllAssets } from '../systems/assetLoader.js';
import { renderWorld, screenToWorld } from '../systems/renderer.js';
import './GameControls.css';

const MOBILE_ZOOM=1.15;
const SPEED=135;
const KEY_TO_DIRECTION={
  ArrowUp:'up',ArrowDown:'down',ArrowLeft:'left',ArrowRight:'right',
  w:'up',a:'left',s:'down',d:'right',
};
const VECTORS={up:[0,-1],down:[0,1],left:[-1,0],right:[1,0]};
function getZoom(rect,isMobile){
  if(isMobile)return MOBILE_ZOOM;
  return Math.max(.52,Math.min(1,Math.min(rect.width/WORLD_WIDTH,rect.height/WORLD_HEIGHT)*.985));
}
function isTypingTarget(target){
  return !!target?.closest?.('input,textarea,select,[contenteditable="true"]');
}
export default function GameCanvas({
  onLocationInteract,isMobile,directoryTravelTarget,onDirectoryTravelConsumed,paused=false
}){
  const canvasRef=useRef(null);
  const assetsRef=useRef(null);
  const cameraRef=useRef(new CameraSystem());
  const travelRef=useRef(new AutoTravelSystem());
  const playerRef=useRef({x:0,y:0,direction:'down',moving:false,walkCycleTime:0});
  const interactRef=useRef(onLocationInteract);
  const keyRef=useRef(new Set());
  const touchRef=useRef(null);
  const pausedRef=useRef(paused);
  const nearbyPromptedRef=useRef(null);
  const [loaded,setLoaded]=useState(false);
  const [traveling,setTraveling]=useState(false);
  const [message,setMessage]=useState('');
  const [loadError,setLoadError]=useState('');
  useEffect(()=>{interactRef.current=onLocationInteract;},[onLocationInteract]);
  useEffect(()=>{pausedRef.current=paused;if(paused){keyRef.current.clear();touchRef.current=null;}},[paused]);

  useEffect(()=>{
    let mounted=true;
    const spawn=getSpawnPoint();
    playerRef.current={x:spawn.x-16,y:spawn.y-40,direction:'down',moving:false,walkCycleTime:0};
    cameraRef.current.snapTo(spawn.x,spawn.y);
    loadAllAssets().then(assets=>{
      if(mounted){assetsRef.current=assets;setLoaded(true);}
    }).catch(error=>{if(mounted)setLoadError(error.message);});
    return ()=>{mounted=false;travelRef.current.cancel();};
  },[]);

  const goToLocation=useCallback(id=>{
    const loc=LOCATIONS.find(item=>item.id===id);
    if(!loc)return;
    const player=playerRef.current,x=player.x+16,y=player.y+40;
    setMessage('');
    if(Math.hypot(x-loc.entranceX,y-loc.entranceY)<=20){
      travelRef.current.cancel();setTraveling(false);
      nearbyPromptedRef.current=id;interactRef.current(loc);return;
    }
    const started=travelRef.current.startTravel(x,y,id,()=>{
      setTraveling(false);
      nearbyPromptedRef.current=id;
      interactRef.current(loc);
    });
    setTraveling(started);
    if(!started)setMessage('No safe route found. Move toward a path and try again.');
  },[]);

  useEffect(()=>{
    if(!loaded||!directoryTravelTarget)return;
    goToLocation(directoryTravelTarget);
    onDirectoryTravelConsumed?.();
  },[directoryTravelTarget,loaded,goToLocation,onDirectoryTravelConsumed]);

  useEffect(()=>{
    const onKeyDown=e=>{
      const direction=KEY_TO_DIRECTION[e.key];
      if(!direction||isTypingTarget(e.target)||pausedRef.current||!assetsRef.current)return;
      e.preventDefault();
      keyRef.current.delete(direction);
      keyRef.current.add(direction);
    };
    const onKeyUp=e=>{
      const direction=KEY_TO_DIRECTION[e.key];
      if(direction){keyRef.current.delete(direction);if(!isTypingTarget(e.target))e.preventDefault();}
    };
    const blur=()=>{keyRef.current.clear();touchRef.current=null;};
    window.addEventListener('keydown',onKeyDown);
    window.addEventListener('keyup',onKeyUp);
    window.addEventListener('blur',blur);
    return ()=>{window.removeEventListener('keydown',onKeyDown);window.removeEventListener('keyup',onKeyUp);window.removeEventListener('blur',blur);};
  },[]);

  const handleClick=useCallback(e=>{
    const canvas=canvasRef.current;
    if(!canvas||!assetsRef.current||pausedRef.current)return;
    const rect=canvas.getBoundingClientRect();
    const dpr=Math.min(window.devicePixelRatio||1,1.5);
    const point=screenToWorld(
      (e.clientX-rect.left)*dpr,(e.clientY-rect.top)*dpr,
      cameraRef.current,getZoom(rect,isMobile)*dpr,canvas.width,canvas.height
    );
    const building=findClickedBuilding(point.x,point.y);
    if(building){goToLocation(building.id);return;}
    const player=playerRef.current;
    const path=buildPathToPoint(player.x+16,player.y+40,point.x,point.y);
    const started=travelRef.current.startPath(path,()=>setTraveling(false));
    setTraveling(started);
    setMessage(started?'':'That area is blocked. Click an open path or move with the controls.');
  },[isMobile,goToLocation]);

  const startTouchDirection=(e,direction)=>{
    if(pausedRef.current)return;
    e.preventDefault();
    e.currentTarget.setPointerCapture?.(e.pointerId);
    touchRef.current=direction;
  };
  const endTouchDirection=(e,direction)=>{
    e.preventDefault();
    if(touchRef.current===direction)touchRef.current=null;
    if(e.currentTarget.hasPointerCapture?.(e.pointerId))e.currentTarget.releasePointerCapture(e.pointerId);
  };

  useEffect(()=>{
    if(!loaded)return;
    const canvas=canvasRef.current;
    const ctx=canvas?.getContext('2d',{alpha:false});
    if(!canvas||!ctx)return;
    let animationId,lastTime=0,blockedFrames=0;
    const loop=now=>{
      const dt=lastTime?Math.max(0,Math.min((now-lastTime)/1000,.04)):1/60;
      lastTime=now;
      const dpr=Math.min(window.devicePixelRatio||1,1.5);
      const rect=canvas.getBoundingClientRect();
      const width=Math.max(1,Math.round(rect.width*dpr));
      const height=Math.max(1,Math.round(rect.height*dpr));
      if(canvas.width!==width||canvas.height!==height){canvas.width=width;canvas.height=height;}
      const zoom=getZoom(rect,isMobile),player=playerRef.current;
      let moved=false;
      const direction=!pausedRef.current&&(touchRef.current||[...keyRef.current].at(-1));
      if(direction){
        if(travelRef.current.isActive()){travelRef.current.cancel();setTraveling(false);}
        const [vx,vy]=VECTORS[direction],step=SPEED*dt;
        const next=resolveMovement(player.x,player.y,vx*step,vy*step);
        const distance=Math.hypot(next.x-player.x,next.y-player.y);
        player.x=next.x;player.y=next.y;player.direction=direction;
        moved=distance>.08;
        blockedFrames=0;
      }else if(!pausedRef.current&&travelRef.current.isActive()){
        const p=travelRef.current.update(player.x+16,player.y+40,dt);
        if(p&&!p.arrived){
          player.direction=p.direction;
          const next=resolvePathMovement(player.x,player.y,p.dx,p.dy);
          const distance=Math.hypot(next.x-player.x,next.y-player.y);
          player.x=next.x;player.y=next.y;moved=distance>.08;
          if(!moved&&Math.hypot(p.dx,p.dy)>.1){
            blockedFrames++;
            if(blockedFrames===12){
              const destination=travelRef.current.getDestinationId();
              if(destination){
                travelRef.current.startTravel(player.x+16,player.y+40,destination,()=>{
                  const loc=LOCATIONS.find(l=>l.id===destination);
                  setTraveling(false);
                  if(loc){nearbyPromptedRef.current=loc.id;interactRef.current(loc);}
                });
              }else{travelRef.current.cancel();setTraveling(false);}
            }
            if(blockedFrames>30){
              travelRef.current.cancel();setTraveling(false);
              setMessage('Route blocked. Move toward the nearest open path.');
            }
          }else blockedFrames=0;
        }
      }else{blockedFrames=0;}
      if(moved)player.walkCycleTime=((player.walkCycleTime??0)+dt*1000)%620;
      else player.walkCycleTime=0;
      player.moving=moved;

      if(!pausedRef.current&&!travelRef.current.isActive()){
        const feetX=player.x+16,feetY=player.y+40;
        const near=findNearbyLocation(feetX,feetY);
        const nearest=near&&Math.hypot(feetX-near.entranceX,feetY-near.entranceY)<=28?near:null;
        if(!nearest){nearbyPromptedRef.current=null;}
        else if(moved&&nearbyPromptedRef.current!==nearest.id){
          nearbyPromptedRef.current=nearest.id;
          interactRef.current(nearest);
        }
      }
      cameraRef.current.update(player.x+16,player.y+40,width,height,zoom*dpr);
      renderWorld(ctx,assetsRef.current,cameraRef.current,player,zoom*dpr,width,height,now);
      animationId=requestAnimationFrame(loop);
    };
    animationId=requestAnimationFrame(loop);
    return ()=>cancelAnimationFrame(animationId);
  },[loaded,isMobile]);

  if(loadError)return <div className="game-loading" role="alert">Could not load the game: {loadError}</div>;
  if(!loaded)return <div className="game-loading"><div className="loading-content">Loading Nomad's Province...</div></div>;
  return <div className="canvas-wrapper">
    <canvas ref={canvasRef} className="world-canvas" onClick={handleClick} aria-label="Interactive campus. Use WASD or arrows, tap the mobile direction pad, or click a destination."/>
    {isMobile&&<div className="campus-dpad" aria-label="Touch movement controls">
      {['up','left','down','right'].map(direction=><button
        key={direction} type="button"
        className={'campus-dpad-key campus-dpad-'+direction}
        aria-label={'Move '+direction}
        onPointerDown={e=>startTouchDirection(e,direction)}
        onPointerUp={e=>endTouchDirection(e,direction)}
        onPointerCancel={e=>endTouchDirection(e,direction)}
        onLostPointerCapture={()=>{if(touchRef.current===direction)touchRef.current=null;}}
        onContextMenu={e=>e.preventDefault()}
      >{{up:'▲',left:'◀',down:'▼',right:'▶'}[direction]}</button>)}
    </div>}
    {message&&<div className="game-action-message" role="status" onClick={()=>setMessage('')}>{message}</div>}
    {traveling&&<div className="game-travel-status" role="status">Walking to destination...</div>}
  </div>;
}
