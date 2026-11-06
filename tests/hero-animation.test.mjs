import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { getHeroFrame, HERO_DRAW_WIDTH, HERO_DRAW_HEIGHT } from '../src/game/systems/renderer.js';

const svg = readFileSync(new URL('../public/assets/game/characters/player/nomad-hero-v2.svg',import.meta.url),'utf8');
const loader = readFileSync(new URL('../src/game/systems/assetLoader.js',import.meta.url),'utf8');
const game = readFileSync(new URL('../src/game/components/GameCanvas.jsx',import.meta.url),'utf8');
test('hero asset is 4x4, correctly registered and has aligned fixed frames',()=>{
  assert.match(svg,/<svg[^>]*width="128"[^>]*height="192"/);
  assert.equal((svg.match(/<g transform="translate\(/g)||[]).length,16);
  for(let y=0;y<4;y++)for(let x=0;x<4;x++)
    assert.ok(svg.includes(`transform="translate(${x*32} ${y*48})"`));
  assert.ok(loader.includes('nomad-hero-v2.svg'));
  assert.ok(!loader.includes('uploaded-hero.png'));
});
test('player is enlarged while keeping fixed collision-foot anchor',()=>{
  assert.equal(HERO_DRAW_WIDTH,40);
  assert.equal(HERO_DRAW_HEIGHT,60);
  assert.ok(game.includes('spawn.x-16,y:spawn.y-40'));
});
test('idle frame fixed and moving phases advance deterministically',()=>{
 for(let direction of ['down','up','left','right']){
  const idle=getHeroFrame({direction,moving:false,walkCycleTime:99999});
  assert.equal(idle.col,0);
  for(let index=0;index<4;index++){
   const walk=getHeroFrame({direction,moving:true,walkCycleTime:index*155});
   assert.equal(walk.row,{down:0,up:1,left:2,right:3}[direction]);
   assert.equal(walk.col,[1,2,3,2][index]);
  }
 }
 assert.ok(game.includes('if (moved) player.walkCycleTime'));
 assert.ok(game.includes('else player.walkCycleTime = 0'));
});
