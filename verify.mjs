import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import vm from 'node:vm';
import {fileURLToPath} from 'node:url';
const root=path.dirname(fileURLToPath(import.meta.url));
for(const page of ['index.html','lab.html']){
 const html=fs.readFileSync(path.join(root,page),'utf8');
 const ids=[...html.matchAll(/\bid="([^"]+)"/g)].map(m=>m[1]);assert.equal(ids.length,new Set(ids).size,'Duplicate IDs in '+page);
 for(const m of html.matchAll(/(?:href|src|poster)="([^"#]+)"/g)){
  const target=m[1].split('?')[0];if(/^(?:https?:|mailto:|data:)/.test(target))continue;
  assert(!target.startsWith('/'),'Root-relative path breaks project Pages: '+target);
  assert(fs.existsSync(path.join(root,target)),`Broken ${page} link: ${target}`);
 }
 for(const m of html.matchAll(/href="#([^"]+)"/g))assert(ids.includes(m[1]),'Broken section anchor: '+m[1]);
}
const release=JSON.parse(fs.readFileSync(path.join(root,'release.json')));
for(const type of ['jar','zip']){
 const artifact=release[type],bytes=fs.readFileSync(path.join(root,artifact.file));
 assert.equal(bytes.length,artifact.bytes);assert.equal(crypto.createHash('sha256').update(bytes).digest('hex'),artifact.sha256);
}
const context={};vm.runInNewContext(fs.readFileSync(path.join(root,'game-core.js'),'utf8'),context);
const game=new context.KewissFlight(()=>.5);game.flap();game.paused=true;game.step(.04);assert.equal(game.y,195);game.paused=false;game.pipes[0].x=100;game.step(.01);assert.equal(game.score,1);game.pipes[0].x=175;game.y=20;game.step(.01);assert(game.over);game.flap();assert(game.running&&!game.over&&game.score===0);
game.configure('calm');assert.equal(game.rules.gap,90);assert.equal(game.rules.speed,110);game.configure('hyper');assert.equal(game.rules.gap,62);assert.equal(game.rules.speed,205);
const particleContext={document:{getElementById:()=>null}};vm.runInNewContext(fs.readFileSync(path.join(root,'space-fx.js'),'utf8'),particleContext);const sparks=new particleContext.KewissSparks(()=>.5);for(let i=0;i<50;i++)sparks.emit(5,5,{count:50});assert.equal(sparks.particles.length,360);for(let i=0;i<30;i++)sparks.step(.05);assert.equal(sparks.particles.length,0);
for(const file of ['assets/draxion-skin.png','assets/kewisdis-skin.png','assets/anime-universe-master.png','assets/anime-universe-sky.png','assets/anime-ringed-world.png','assets/anime-cloud-horizon.png'])assert(fs.statSync(path.join(root,file)).size>1000);
for(const file of ['foundation.css','space.css','anime-universe.css','deep-space.css','space-journey.css','anime-space-restore.css','comet-cursor.css','lab-orbital.css'])for(const match of fs.readFileSync(path.join(root,file),'utf8').matchAll(/url\(['"]?([^)'"\s]+)['"]?\)/g)){const target=decodeURIComponent(match[1]);if(!/^(https?:|data:|#)/.test(target))assert(fs.existsSync(path.join(root,target)),'Missing CSS asset: '+target);}
const landing=fs.readFileSync(path.join(root,'index.html'),'utf8');assert(!landing.includes('orbital-nebula.png'));assert(!landing.includes('cartoon-cosmos'));assert(!landing.includes('toon-blackhole'));assert(!fs.readFileSync(path.join(root,'space.css'),'utf8').includes('orbital-nebula.png'));
assert(!landing.includes('real-orbit.js'));assert(!landing.includes('orbital-renderer.js'));assert(landing.includes('anime-universe.js'));assert(landing.includes('anime-universe.css'));
assert.equal((landing.match(/data-depth=/g)||[]).length,6);assert(landing.includes('aria-labelledby="universeTitle"'));
for(const file of ['anime-dynamics.js','anime-universe.js','kewiss.js','space.js','space-fx.js','space-journey.js','restored-effects.js','art-renderer.js','anime-art-worker.js'])new vm.Script(fs.readFileSync(path.join(root,file),'utf8'),{filename:file});
assert.equal((landing.match(/data-surface=/g)||[]).length,6);assert.equal((landing.match(/data-location=/g)||[]).length,5);assert(landing.includes('anime-dynamics.js'));assert(landing.includes('id="cosmosLoadView"'));assert(release.website.surfaceFlow&&release.website.slowMeteors);
assert.equal(release.website.design,'deep-space');assert(landing.includes('deep-space.css'));assert(landing.includes('assets/anime-space-sky.webp'));assert(landing.includes('class="sky-settings"'));assert.equal(JSON.parse(fs.readFileSync(path.join(root,'assets/web-item-model.json'))).parent,'minecraft:item/generated');
console.log('PASS: landing/lab links and IDs, exact download hashes, game modes, particle budgets, deep-space artwork, placed-only cobweb model, observatory markup, script syntax and CSS paths.');

assert(landing.includes('space-journey.js'));assert.equal((landing.match(/class="space-vista"/g)||[]).length,0);assert.equal((landing.match(/data-sky-image=/g)||[]).length,3);assert(landing.includes('<dialog id="spaceGallery"'));

assert.equal(release.website.artStyle,'anime-realistic');assert(release.website.customCursor&&release.website.surfaceFlow&&release.website.heroPortraits);assert(landing.includes('id="cursorMode"'));assert(landing.includes('restored-effects.js'));
