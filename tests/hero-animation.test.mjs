import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { getHeroFrame, HERO_DRAW_WIDTH, HERO_DRAW_HEIGHT } from '../src/game/systems/renderer.js';

const sprite=readFileSync(new URL('../public/assets/game/characters/player/nomad-goggles-v3.png',import.meta.url));
const loader=readFileSync(new URL('../src/game/systems/assetLoader.js',import.meta.url),'utf8');
const game=readFileSync(new URL('../src/game/components/GameCanvas.jsx',import.meta.url),'utf8');
test('provided 4×4 character atlas is valid transparent PNG and loaded by the game',()=>{
 assert.equal(sprite.toString('ascii',1,4),'PNG');
 assert.equal(sprite.readUInt32BE(16),128);
 assert.equal(sprite.readUInt32BE(20),192);
 assert.ok(loader.includes('nomad-goggles-v3.png'));
 assert.ok(!loader.includes('nomad-hero-v2.svg'));
});
import { PNG } from 'pngjs';
test('every one of the 16 extracted hero frames contains visible pixels',()=>{
 const decoded=PNG.sync.read(sprite);
 assert.equal(decoded.width,128);
 assert.equal(decoded.height,192);
 for(let row=0;row<4;row++)for(let col=0;col<4;col++){
  let visible=0;
  for(let y=row*48;y<(row+1)*48;y++)for(let x=col*32;x<(col+1)*32;x++){
   if(decoded.data[(y*decoded.width+x)*4+3]>16)visible++;
  }
  assert.ok(visible>400,`invisible sprite frame ${row}:${col} (${visible} opaque pixels)`);
 }
});
test('hero size matches NPC proportions while preserving collision feet',()=>{
 assert.equal(HERO_DRAW_WIDTH,32);
 assert.equal(HERO_DRAW_HEIGHT,48);
 assert.ok(game.includes('spawn.x-16,y:spawn.y-40'));
});
test('idle frame fixed and moving phases advance deterministically',()=>{
 for(let direction of ['down','up','left','right']){
  const idle=getHeroFrame({direction,moving:false,walkCycleTime:99999});
  assert.equal(idle.col,0);
  for(let index=0;index<4;index++){
   const walk=getHeroFrame({direction,moving:true,walkCycleTime:index*155});
   assert.equal(walk.row,{down:0,left:1,right:2,up:3}[direction]);
   assert.equal(walk.col,[1,2,3,2][index]);
  }
 }
 assert.ok(game.includes('if (moved) player.walkCycleTime'));
 assert.ok(game.includes('else player.walkCycleTime = 0'));
});
