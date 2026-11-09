// Campus controller: click-to-travel, keyboard WASD/arrows and mobile thumb joystick.
import { useState, useEffect, useRef, useCallback } from 'react';
import { LOCATIONS, findClickedBuilding, findNearbyLocation } from '../data/locationData.js';
import { getSpawnPoint, buildPathToPoint } from '../data/travelPaths.js';
import { WORLD_WIDTH, WORLD_HEIGHT } from '../data/mapData.js';
import { AutoTravelSystem } from '../systems/autoTravel.js';
import { CameraSystem } from '../systems/camera.js';
import { resolveMovement, resolvePathMovement } from '../systems/collision.js';
import { loadAllAssets } from '../systems/assetLoader.js';
import { renderWorld, screenToWorld } from '../systems/renderer.js';
import { sound } from '../systems/soundFx.js';
import './GameControls.css';
import {getNpcAtWorldPoint,getNearbyNpc} from '../data/npcDialogues.js';

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
  onLocationInteract,onNpcInteract,isMobile,directoryTravelTarget,onDirectoryTravelConsumed,paused=false
}){
  const canvasRef=useRef(null);
  const assetsRef=useRef(null);
  const cameraRef=useRef(new CameraSystem());
  const travelRef=useRef(new AutoTravelSystem());
  const playerRef=useRef({x:0,y:0,direction:'down',moving:false,walkCycleTime:0});
  const interactRef=useRef(onLocationInteract);
  const npcRef=useRef(onNpcInteract);
  const keyRef=useRef(new Set());
  const touchRef=useRef(null);
  const joystickPointer=useRef(null);
  const [joystickOffset,setJoystickOffset]=useState({x:0,y:0});
  const pausedRef=useRef(paused);
  const nearbyPromptedRef=useRef(null);
  const [loaded,setLoaded]=useState(false);
  const [traveling,setTraveling]=useState(false);
  const [message,setMessage]=useState('');
  const [loadError,setLoadError]=useState('');
  useEffect(()=>{interactRef.current=onLocationInteract;},[onLocationInteract]);
  useEffect(()=>{npcRef.current=onNpcInteract;},[onNpcInteract]);
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
      nearbyPromptedRef.current=id;
      sound.playArrival();
      interactRef.current(loc);
      return;
    }
    const started=travelRef.current.startTravel(x,y,id,()=>{
      setTraveling(false);
      nearbyPromptedRef.current=id;
      sound.playArrival();
      interactRef.current(loc);
    });
    setTraveling(started);
    if(started){
      sound.playBlip();
    }else{
      sound.playCancel();
      setMessage('No safe route found. Move toward a path and try again.');
    }
  },[]);

  useEffect(()=>{
    if(!loaded||!directoryTravelTarget)return;
    goToLocation(directoryTravelTarget);
    onDirectoryTravelConsumed?.();
  },[directoryTravelTarget,loaded,goToLocation,onDirectoryTravelConsumed]);

  useEffect(()=>{
    const onKeyDown=e=>{
      if((e.key==='e'||e.key==='E')&&!e.repeat&&!pausedRef.current&&!isTypingTarget(e.target)){
        const player=playerRef.current;
        const nearby=getNearbyNpc(player.x+16,player.y+40,55);
        if(nearby){
          e.preventDefault();
          travelRef.current.cancel();
          setTraveling(false);
          sound.playInteract();
          npcRef.current?.(nearby);
        }
        return;
      }
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
    const npc=getNpcAtWorldPoint(point.x,point.y,39);
    if(npc){
      travelRef.current.cancel();
      setTraveling(false);
      sound.playInteract();
      npcRef.current?.(npc);
      return;
    }
    const building=findClickedBuilding(point.x,point.y);
    if(building){
      sound.playSelect();
      goToLocation(building.id);
      return;
    }
    const player=playerRef.current;
    const path=buildPathToPoint(player.x+16,player.y+40,point.x,point.y);
    const started=travelRef.current.startPath(path,()=>setTraveling(false));
    setTraveling(started);
    if(started){
      sound.playBlip();
    }else{
      sound.playCancel();
    }
    setMessage(started?'':'That area is blocked. Click an open path or move with the controls.');
  },[isMobile,goToLocation]);

  const updateJoystick=(e)=>{
    const rect=e.currentTarget.getBoundingClientRect();
    const dx=e.clientX-(rect.left+rect.width/2);
    const dy=e.clientY-(rect.top+rect.height/2);
    const radius=Math.min(rect.width,rect.height)*.3;
    const distance=Math.hypot(dx,dy);
    const scale=distance>radius?radius/distance:1;
    const x=dx*scale,y=dy*scale;
    setJoystickOffset({x,y});
    if(distance<radius*.24){touchRef.current=null;return;}
    touchRef.current=Math.abs(dx)>Math.abs(dy)
      ? (dx>0?'right':'left')
      : (dy>0?'down':'up');
  };
  const startJoystick=e=>{
    if(pausedRef.current)return;
    e.preventDefault();
    if(joystickPointer.current!==null)return;
    joystickPointer.current=e.pointerId;
    e.currentTarget.setPointerCapture?.(e.pointerId);
    sound.playHapticClick();
    updateJoystick(e);
  };
  const moveJoystick=e=>{
    if(joystickPointer.current!==e.pointerId)return;
    e.preventDefault();
    if(pausedRef.current){resetJoystick();return;}
    updateJoystick(e);
  };
  const resetJoystick=()=>{
    joystickPointer.current=null;
    touchRef.current=null;
    setJoystickOffset({x:0,y:0});
  };
  const endJoystick=e=>{
    if(joystickPointer.current!==e.pointerId)return;
    e.preventDefault();
    if(e.currentTarget.hasPointerCapture?.(e.pointerId)){
      e.currentTarget.releasePointerCapture(e.pointerId);
    }
    resetJoystick();
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
                  if(loc){
                    nearbyPromptedRef.current=loc.id;
                    sound.playArrival();
                    interactRef.current(loc);
                  }
                });
              }else{travelRef.current.cancel();setTraveling(false);}
            }
            if(blockedFrames>30){
              travelRef.current.cancel();setTraveling(false);
              sound.playCancel();
              setMessage('Route blocked. Move toward the nearest open path.');
            }
          }else blockedFrames=0;
        }
      }else{blockedFrames=0;}
      if(moved) player.walkCycleTime=((player.walkCycleTime??0)+dt*1000)%620;
      else player.walkCycleTime=0;
      if(moved) sound.playFootstep();
      player.moving=moved;

      if(!pausedRef.current&&!travelRef.current.isActive()){
        const feetX=player.x+16,feetY=player.y+40;
        const near=findNearbyLocation(feetX,feetY);
        const nearest=near&&Math.hypot(feetX-near.entranceX,feetY-near.entranceY)<=28?near:null;
        if(!nearest){nearbyPromptedRef.current=null;}
        else if(moved&&nearbyPromptedRef.current!==nearest.id){
          nearbyPromptedRef.current=nearest.id;
          sound.playArrival();
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
    <canvas ref={canvasRef} className="world-canvas" onClick={handleClick} aria-label="Interactive campus. Use WASD or arrows, drag the mobile joystick, or click a destination."/>
    {isMobile&&<div className="campus-joystick" aria-label="Touch movement controls">
      <button type="button" className="campus-joystick-base"
        aria-label="Movement joystick; drag to walk"
        onPointerDown={startJoystick}
        onPointerMove={moveJoystick}
        onPointerUp={endJoystick}
        onPointerCancel={endJoystick}
        onLostPointerCapture={resetJoystick}
        onContextMenu={e=>e.preventDefault()}>
        <span className="campus-joystick-guide" aria-hidden="true" />
        <span className="campus-joystick-knob" aria-hidden="true"
          style={{transform:`translate(${joystickOffset.x}px,${joystickOffset.y}px)`}} />
      </button>
    </div>}
    {message&&<div className="game-action-message" role="status" onClick={()=>setMessage('')}>{message}</div>}
    {traveling&&<div className="game-travel-status" role="status">Walking to destination...</div>}
  </div>;
}
