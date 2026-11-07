(()=>{'use strict';
const section=document.getElementById('surface136');if(!section)return;
const $=id=>document.getElementById(id),query=new URL(document.currentScript.src).search,reduced=matchMedia('(prefers-reduced-motion: reduce)'),cache=new Map();
let paused=reduced.matches,clock=0,last=0,visible=false;
function image(kind){const palette=$(kind+'136-palette').value,key=kind+'136-'+palette+'.png';if(!cache.has(key)){const im=new Image();cache.set(key,im);im.onload=draw;im.onerror=()=>{$('surface136-status').textContent='This palette could not load. Choose another palette or refresh.';};im.src='assets/'+key+query;}return cache.get(key);}
function draw(){const frame=Math.floor(clock/4.8*192)%192;let ready=0;
 for(const kind of ['apple','totem']){const canvas=$(kind+'136-canvas'),im=image(kind);if(!im.complete||!im.naturalWidth)continue;const g=canvas.getContext('2d');g.clearRect(0,0,320,320);g.imageSmoothingEnabled=false;g.drawImage(im,0,frame*64,64,64,0,0,320,320);canvas.dataset.frame=String(frame);canvas.dataset.frames=String(im.height/64);canvas.dataset.palette=$(kind+'136-palette').value;ready++;}
 $('surface136-time').value=String(frame);$('surface136-frame').textContent=(frame+1)+' / 192';
 if(ready===2)$('surface136-status').textContent='Exact in-game artwork · 192 poses · 4.8-second loop';
}
function label(){$('surface136-play').textContent=paused?'Play previews':'Pause previews';$('surface136-play').setAttribute('aria-pressed',String(!paused));}
for(const kind of ['apple','totem'])$(kind+'136-palette').addEventListener('change',()=>{$('surface136-status').textContent='Loading palette…';draw();});
$('surface136-play').onclick=()=>{paused=!paused;label();draw();};
$('surface136-time').oninput=e=>{clock=Number(e.target.value)/192*4.8+1e-8;paused=true;label();draw();};
reduced.addEventListener('change',e=>{if(e.matches){paused=true;label();}});
new IntersectionObserver(e=>{visible=e[0].isIntersecting;},{rootMargin:'100px'}).observe(section);
function tick(now){const dt=last?Math.min(.1,(now-last)/1000):0;last=now;if(visible&&!document.hidden&&!paused){clock=(clock+dt)%4.8;draw();}requestAnimationFrame(tick);}
label();draw();requestAnimationFrame(tick);
})();
