import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

const read=p=>readFileSync(new URL('../'+p,import.meta.url),'utf8');

test('shared scroll reveal handles future async/tab content without forcing a re-render',()=>{
 const shell=read('src/game/components/GameShell.jsx');
 assert.ok(shell.includes('new IntersectionObserver('));
 assert.ok(shell.includes('new MutationObserver('));
 assert.ok(shell.includes('mutations.observe(content, { childList: true, subtree: true })'));
 assert.ok(shell.includes('observer.unobserve(entry.target)'));
 assert.ok(shell.includes('mutations.disconnect(); observer.disconnect();'));
 assert.ok(shell.includes('record.addedNodes'));
 assert.ok(shell.includes('.province-explore-intro'));
});
test('reduced-motion visitors never have content hidden by scroll effects',()=>{
 const shell=read('src/game/components/GameShell.jsx');
 const css=read('src/GamifiedPages.css');
 assert.ok(shell.includes("matchMedia?.('(prefers-reduced-motion: reduce)').matches"));
 assert.match(css,/@media \(prefers-reduced-motion: reduce\)/);
 assert.match(css,/\.scroll-reveal, \.scroll-reveal\.revealed/);
 assert.match(css,/opacity: 1 !important/);
});
