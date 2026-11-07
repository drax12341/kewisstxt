/* Animated illustrated sky: bounded star geometry, slow parallax and a user-triggered warp. */
(()=>{'use strict';const canvas=document.getElementById('cartoonStars');if(!canvas)return;
const ctx=canvas.getContext('2d'),scene=document.getElementById('toonHero'),button=document.getElementById('cosmosWarp'),status=document.getElementById('warpStatus'),prefers=matchMedia('(prefers-reduced-motion: reduce)');
let stars=[],width=0,height=0,raf=0,lastDraw=0,warpUntil=0,warpTimer=0,parallaxX=0,parallaxY=0,disposed=false;
const colors=['#BEDCFF','#FFD8AE','#D3B7FF','#AAF1F5','#F2D9FA'];
const enabled=()=>!prefers.matches&&!document.body.classList.contains('motion-off')&&!document.hidden;
const tunnel=document.createElement('div');tunnel.className='warp-tunnel';tunnel.setAttribute('aria-hidden','true');for(let i=0;i<3;i++)tunnel.append(document.createElement('span'));document.body.append(tunnel);
function generate(){let seed=29641;const rand=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};const count=width<640?46:84;stars=Array.from({length:count},(_,i)=>({u:rand(),v:rand(),r:i%6===0?4.5+rand()*3.5:i%3===0?2.2+rand()*2:1+rand()*1.3,phase:rand()*Math.PI*2,depth:.25+rand()*.75,spin:rand()*Math.PI,kind:i%6,color:colors[i%colors.length]}));canvas.dataset.stars=String(count);}
function star(x,y,r,color,kind,spin=0){ctx.save();ctx.translate(x,y);ctx.rotate(spin);ctx.fillStyle=color;ctx.strokeStyle=color;ctx.lineWidth=1;ctx.beginPath();
 if(kind===0||kind===3){const points=kind===0?8:10;for(let n=0;n<points;n++){const a=n/points*Math.PI*2-Math.PI/2,rad=n%2?r*(kind===0?.20:.43):r;const px=Math.cos(a)*rad,py=Math.sin(a)*rad;n?ctx.lineTo(px,py):ctx.moveTo(px,py);}ctx.closePath();kind===3?ctx.stroke():ctx.fill();}
 else if(kind===1){ctx.moveTo(0,-r);ctx.lineTo(r*.55,0);ctx.lineTo(0,r);ctx.lineTo(-r*.55,0);ctx.closePath();ctx.stroke();}
 else if(kind===4){ctx.moveTo(0,-r);ctx.lineTo(0,r);ctx.moveTo(-r,0);ctx.lineTo(r,0);ctx.stroke();}
 else{ctx.arc(0,0,r*.5,0,Math.PI*2);ctx.fill();}ctx.restore();}
function render(now,moving){ctx.clearRect(0,0,width,height);const time=moving?now/1000:0,warping=moving&&warpUntil>now,progress=warping?1-(warpUntil-now)/1800:0;
 for(const point of stars){let x=point.u*width+parallaxX*point.depth,y=point.v*height+parallaxY*point.depth;const glint=moving?.65+.35*Math.sin(time*.9+point.phase):.85;ctx.globalAlpha=(point.kind===0?.8:.48)*glint;const radius=point.r*(point.kind===0?.92+glint*.15:1);
  if(warping){const dx=x-width*.61,dy=y-height*.43,distance=Math.hypot(dx,dy)||1,boost=Math.sin(Math.PI*progress),length=(20+point.depth*105)*boost;x+=dx*progress*.30;y+=dy*progress*.30;ctx.strokeStyle=point.color;ctx.lineWidth=point.kind===0?1.5:.8;ctx.beginPath();ctx.moveTo(x-dx/distance*length,y-dy/distance*length);ctx.lineTo(x,y);ctx.stroke();}
  star(x,y+Math.sin(time*.21+point.phase)*3*Number(moving),radius,point.color,point.kind,point.kind===3?point.spin+time*.025:0);
 }
 if(moving){for(let i=0;i<2;i++){const phase=(time+i*8)%18;if(phase>1.5&&phase<3.1){const p=(phase-1.5)/1.6,x=width*(.8-p*.5),y=height*(.04+p*.37)+i*height*.18;ctx.globalAlpha=Math.sin(p*Math.PI)*.65;ctx.strokeStyle=i?'#DFBCFF':'#B4EDFF';ctx.lineWidth=1.6;ctx.beginPath();ctx.moveTo(x+45,y-21);ctx.lineTo(x,y);ctx.stroke();star(x,y,4.5,i?'#DFBCFF':'#B4EDFF',0);}}}
 ctx.globalAlpha=1;canvas.dataset.warp=String(warping);canvas.dataset.lastFrame=String(Math.floor(now));
}
function tick(now){raf=0;if(disposed)return;if(!enabled()){render(now,false);return;}if(now-lastDraw>=32){render(now,true);lastDraw=now;}raf=requestAnimationFrame(tick);}
function start(){if(!raf&&!disposed&&enabled())raf=requestAnimationFrame(tick);}
function resetParallax(){parallaxX=parallaxY=0;document.documentElement.style.setProperty('--sky-x','0px');document.documentElement.style.setProperty('--sky-y','0px');}
function endWarp(){clearTimeout(warpTimer);warpTimer=0;warpUntil=0;if(document.body.classList.contains('cosmos-warping'))document.body.classList.remove('cosmos-warping');canvas.dataset.warp='false';if(button){button.setAttribute('aria-pressed','false');button.innerHTML='<span>✧</span> Take a warp jump <i>↗</i>';}}
function sync(){if(!enabled()){cancelAnimationFrame(raf);raf=0;endWarp();resetParallax();render(performance.now(),false);}else start();}
function resize(){width=innerWidth;height=innerHeight;const ratio=Math.min(devicePixelRatio||1,1.5);canvas.width=Math.round(width*ratio);canvas.height=Math.round(height*ratio);ctx.setTransform(ratio,0,0,ratio,0,0);generate();render(performance.now(),false);start();}
function jump(){if(!enabled()){if(status)status.textContent='Warp motion is paused. Enable Motion in the atmosphere controls to take a jump.';return false;}if(warpUntil>performance.now()){if(status)status.textContent='Already on the way. Give the stars a moment.';return false;}
 warpUntil=performance.now()+1800;document.body.classList.add('cosmos-warping');canvas.dataset.warp='true';if(button){button.setAttribute('aria-pressed','true');button.innerHTML='<span>✧</span> Warping… <i>↗</i>';}if(status)status.textContent='Hold on. We’re taking the scenic route.';window.KewissSpaceFX?.burst(width*.65,height*.32,42);window.KewissApp?.unlock('secret');warpTimer=setTimeout(()=>{endWarp();if(status)status.textContent='Welcome back to your orbit.';},1900);start();return true;}
button?.addEventListener('click',jump);button?.setAttribute('aria-pressed','false');
addEventListener('pointermove',event=>{if(!enabled()||event.pointerType==='touch')return;parallaxX=(event.clientX/Math.max(1,width)-.5)*24;parallaxY=(event.clientY/Math.max(1,height)-.5)*18;document.documentElement.style.setProperty('--sky-x',parallaxX.toFixed(2)+'px');document.documentElement.style.setProperty('--sky-y',parallaxY.toFixed(2)+'px');},{passive:true});
addEventListener('resize',resize);document.addEventListener('visibilitychange',sync);prefers.addEventListener('change',sync);new MutationObserver(sync).observe(document.body,{attributes:true,attributeFilter:['class']});
if(scene)scene.dataset.artStyle='illustrated';resize();
window.KewissCosmos=Object.freeze({jump,getState(){return{enabled:enabled(),stars:stars.length,warpActive:warpUntil>performance.now(),parallaxX,parallaxY,photographicBackground:false};}});
})();
