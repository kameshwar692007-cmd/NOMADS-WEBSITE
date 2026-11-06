// Click/tap-only interactive headquarters: no keyboard/joystick movement.
import { useState, useEffect, useRef, useCallback } from 'react';
import { LOCATIONS, findClickedBuilding } from '../data/locationData.js';
import { getSpawnPoint, buildPathToPoint } from '../data/travelPaths.js';
import { WORLD_WIDTH, WORLD_HEIGHT } from '../data/mapData.js';
import { AutoTravelSystem } from '../systems/autoTravel.js';
import { CameraSystem } from '../systems/camera.js';
import { resolvePathMovement } from '../systems/collision.js';
import { loadAllAssets } from '../systems/assetLoader.js';
import { renderWorld, screenToWorld } from '../systems/renderer.js';

const MOBILE_ZOOM=1.15;
function getZoom(rect,isMobile){
  if(isMobile)return MOBILE_ZOOM;
  return Math.max(0.52,Math.min(1,Math.min(rect.width/WORLD_WIDTH,rect.height/WORLD_HEIGHT)*0.985));
}
export default function GameCanvas({
  onLocationInteract,
  isMobile,
  directoryTravelTarget,
  onDirectoryTravelConsumed
}){
  const canvasRef=useRef(null);
  const assetsRef=useRef(null);
  const cameraRef=useRef(new CameraSystem());
  const travelRef=useRef(new AutoTravelSystem());
  const playerRef=useRef({x:0,y:0,direction:'down',moving:false});
  const interactRef=useRef(onLocationInteract);
  const [loaded,setLoaded]=useState(false);
  const [traveling,setTraveling]=useState(false);
  const [message,setMessage]=useState('');
  useEffect(()=>{interactRef.current=onLocationInteract;},[onLocationInteract]);
  useEffect(()=>{
    let mounted=true;
    const spawn=getSpawnPoint();
    playerRef.current={x:spawn.x-16,y:spawn.y-40,direction:'down',moving:false,walkCycleTime:0};
    cameraRef.current.snapTo(spawn.x,spawn.y);
    loadAllAssets().then(assets=>{if(mounted){assetsRef.current=assets;setLoaded(true);}});
    return ()=>{mounted=false;travelRef.current.cancel();};
  },[]);

  const goToLocation=useCallback((id)=>{
    const loc=LOCATIONS.find(l=>l.id===id);
    if(!loc)return;
    const player=playerRef.current;
    const x=player.x+16,y=player.y+40;
    setMessage('');
    if(Math.hypot(x-loc.entranceX,y-loc.entranceY)<=18){
      travelRef.current.cancel();setTraveling(false);interactRef.current(loc);return;
    }
    const started=travelRef.current.startTravel(x,y,id,()=>{
      setTraveling(false);interactRef.current(loc);
    });
    setTraveling(started);
    if(!started)setMessage('This entrance is temporarily unreachable. Choose another location.');
  },[]);

  useEffect(()=>{
    if(!loaded||!directoryTravelTarget)return;
    goToLocation(directoryTravelTarget);
    onDirectoryTravelConsumed?.();
  },[directoryTravelTarget,loaded,goToLocation,onDirectoryTravelConsumed]);

  const handleClick=useCallback(e=>{
    const canvas=canvasRef.current;
    if(!canvas||!assetsRef.current)return;
    const rect=canvas.getBoundingClientRect();
    const dpr=Math.min(window.devicePixelRatio||1,1.5);
    const zoom=getZoom(rect,isMobile);
    const point=screenToWorld(
      (e.clientX-rect.left)*dpr,
      (e.clientY-rect.top)*dpr,
      cameraRef.current,zoom*dpr,canvas.width,canvas.height
    );
    const building=findClickedBuilding(point.x,point.y);
    if(building){goToLocation(building.id);return;}
    const player=playerRef.current;
    const path=buildPathToPoint(player.x+16,player.y+40,point.x,point.y);
    const started=travelRef.current.startPath(path,()=>setTraveling(false));
    setTraveling(started);
    setMessage(started?'':'That area is not walkable. Tap a pathway or select a building.');
  },[isMobile,goToLocation]);

  useEffect(()=>{
    if(!loaded)return;
    const canvas=canvasRef.current;
    if(!canvas)return;
    const ctx=canvas.getContext('2d',{alpha:false});
    let animationId,lastTime=0,blockedFrames=0;
    const loop=(now)=>{
      const dt=lastTime?Math.max(0,Math.min((now-lastTime)/1000,.04)):1/60;
      lastTime=now;
      const dpr=Math.min(window.devicePixelRatio||1,1.5);
      const rect=canvas.getBoundingClientRect();
      const width=Math.max(1,Math.round(rect.width*dpr));
      const height=Math.max(1,Math.round(rect.height*dpr));
      if(canvas.width!==width||canvas.height!==height){canvas.width=width;canvas.height=height;}
      const zoom=getZoom(rect,isMobile);
      const player=playerRef.current;
      let moved=false;
      if(travelRef.current.isActive()){
        const p=travelRef.current.update(player.x+16,player.y+40,dt);
        if(p&&!p.arrived){
          player.direction=p.direction;
          const next=resolvePathMovement(player.x,player.y,p.dx,p.dy);
          const distance=Math.hypot(next.x-player.x,next.y-player.y);
          player.x=next.x;player.y=next.y;
          moved=distance>0.08;
          if(!moved&&Math.hypot(p.dx,p.dy)>0.1){
            blockedFrames++;
            if(blockedFrames===15){
              const destination=travelRef.current.getDestinationId();
              if(destination){
                // Replan from actual feet coordinates, never from spawn/plaza.
                travelRef.current.startTravel(player.x+16,player.y+40,destination,()=>{
                  const loc=LOCATIONS.find(l=>l.id===destination);
                  setTraveling(false);if(loc)interactRef.current(loc);
                });
              } else {travelRef.current.cancel();setTraveling(false);}
            }
            if(blockedFrames>35){
              travelRef.current.cancel();
              setTraveling(false);
              setMessage('Path blocked. Tap another reachable destination.');
            }
          }else blockedFrames=0;
        }
      }
      // Advance a stable walk clock only if actual collision-resolved travel occurred.
      // Idle resets to a true stationary frame instead of an arbitrary global-time pose.
      if (moved) player.walkCycleTime = ((player.walkCycleTime ?? 0) + dt*1000) % 620;
      else player.walkCycleTime = 0;
      player.moving=moved;
      cameraRef.current.update(player.x+16,player.y+40,width,height,zoom*dpr);
      renderWorld(ctx,assetsRef.current,cameraRef.current,player,zoom*dpr,width,height,now);
      animationId=requestAnimationFrame(loop);
    };
    animationId=requestAnimationFrame(loop);
    return ()=>cancelAnimationFrame(animationId);
  },[loaded,isMobile]);

  if(!loaded)return <div className="game-loading"><div className="loading-content">Loading Nomad's Province...</div></div>;
  return <div className="canvas-wrapper">
    <canvas ref={canvasRef} className="world-canvas" onClick={handleClick} aria-label="Interactive headquarters. Click or tap a building to travel there."/>
    {message&&<div className="game-action-message" role="status" onClick={()=>setMessage('')}>{message}</div>}
    {traveling&&<div className="game-travel-status" role="status">Walking to destination...</div>}
  </div>;
}
