/* Bounded, time-based sparks. No pointer interception, external libraries or audio. */
(()=>{'use strict';
class Sparks{
 constructor(random=Math.random){this.random=random;this.particles=[];this.limit=360;}
 emit(x,y,{count=30,style='twin',trail=false}={}){
  if(!Number.isFinite(x)||!Number.isFinite(y)||style==='off')return;
  const amount=Math.min(Math.max(0,Math.floor(count)),this.limit),room=this.limit-this.particles.length;
  if(amount>room)this.particles.splice(0,amount-room);
  for(let i=0;i<amount;i++){
   const angle=this.random()*Math.PI*2,speed=trail?8+this.random()*35:32+this.random()*190,life=trail?.16+this.random()*.25:.35+this.random()*.55;
   const color=style==='comet'?'#7cedff':style==='ember'?'#ff966b':i%3===0?'#ff9d77':i%3===1?'#72eaff':'#e4fbff';
   this.particles.push({x,y,px:x,py:y,vx:Math.cos(angle)*speed,vy:Math.sin(angle)*speed-(trail?12:25),age:0,life,size:trail?.6+this.random()*.8:.8+this.random()*1.5,color,gravity:trail?10:100,trail});
  }
 }
 step(dt){dt=Number.isFinite(dt)?Math.min(.05,Math.max(0,dt)):0;for(const p of this.particles){p.px=p.x;p.py=p.y;p.age+=dt;p.vx*=Math.pow(.5,dt);p.vy+=p.gravity*dt;p.x+=p.vx*dt;p.y+=p.vy*dt;}this.particles=this.particles.filter(p=>p.age<p.life);}
 clear(){this.particles.length=0;}
}
globalThis.KewissSparks=Sparks;
const canvas=document.getElementById('spaceFx');if(!canvas)return;
const ctx=canvas.getContext('2d'),engine=new Sparks(),prefers=matchMedia('(prefers-reduced-motion: reduce)');
let style='twin',quality='normal',running=false,last=0,trailAt=0,lastX=null,lastY=null,frameId=0;
const settings={low:{limit:160,burst:18,trail:1},normal:{limit:360,burst:34,trail:2},high:{limit:650,burst:60,trail:3}};
const enabled=()=>style!=='off'&&!prefers.matches&&!document.hidden&&!document.body.classList.contains('motion-off');
function resize(){const dpr=Math.min(devicePixelRatio||1,1.5);canvas.width=Math.round(innerWidth*dpr);canvas.height=Math.round(innerHeight*dpr);ctx.setTransform(dpr,0,0,dpr,0,0);if(engine.particles.length)request();}
function clear(){engine.clear();canvas.dataset.particles='0';ctx.clearRect(0,0,innerWidth,innerHeight);cancelAnimationFrame(frameId);running=false;last=0;}
function request(){if(!running&&enabled()){running=true;last=0;frameId=requestAnimationFrame(tick);}}
function tick(now){if(!enabled()){clear();return;}const dt=last?Math.min(.05,(now-last)/1000):1/60;last=now;engine.step(dt);ctx.clearRect(0,0,innerWidth,innerHeight);ctx.save();ctx.globalCompositeOperation='lighter';
 for(let i=0;i<engine.particles.length;i++){const p=engine.particles[i];ctx.globalAlpha=Math.pow(1-p.age/p.life,1.45);ctx.strokeStyle=p.color;ctx.fillStyle=p.color;ctx.lineWidth=p.size;ctx.beginPath();ctx.moveTo(p.px,p.py);ctx.lineTo(p.x,p.y);ctx.stroke();if(!p.trail&&i%5===0){const r=p.size*2.4;ctx.beginPath();ctx.moveTo(p.x,p.y-r);ctx.lineTo(p.x+r*.25,p.y-r*.25);ctx.lineTo(p.x+r,p.y);ctx.lineTo(p.x+r*.25,p.y+r*.25);ctx.lineTo(p.x,p.y+r);ctx.lineTo(p.x-r*.25,p.y+r*.25);ctx.lineTo(p.x-r,p.y);ctx.lineTo(p.x-r*.25,p.y-r*.25);ctx.closePath();ctx.fill();}else ctx.fillRect(p.x-p.size*.5,p.y-p.size*.5,p.size,p.size);}
 ctx.restore();canvas.dataset.particles=String(engine.particles.length);
 if(engine.particles.length)frameId=requestAnimationFrame(tick);else{running=false;last=0;}
}
function burst(x,y,count=settings[quality].burst){if(!enabled())return false;engine.emit(x,y,{count,style});request();return true;}
function celebrate(){if(!enabled())return false;const points=[[innerWidth*.32,innerHeight*.36],[innerWidth*.65,innerHeight*.28],[innerWidth*.5,innerHeight*.53]];for(const [x,y]of points)engine.emit(x,y,{count:Math.round(settings[quality].burst*1.35),style});request();return true;}
addEventListener('pointermove',event=>{if(document.body.classList.contains('anime-restored'))return;if(!enabled()||event.pointerType==='touch')return;const now=performance.now(),distance=lastX==null?10:Math.hypot(event.clientX-lastX,event.clientY-lastY);if(now-trailAt<22||distance<4)return;trailAt=now;lastX=event.clientX;lastY=event.clientY;engine.emit(lastX,lastY,{count:settings[quality].trail,style,trail:true});request();},{passive:true});
addEventListener('pointerdown',event=>{if(event.button!==0)return;burst(event.clientX,event.clientY,event.pointerType==='touch'?Math.min(24,settings[quality].burst):settings[quality].burst);},{passive:true});
addEventListener('resize',resize);document.addEventListener('visibilitychange',()=>{if(document.hidden)clear();});prefers.addEventListener('change',()=>{if(prefers.matches)clear();});new MutationObserver(()=>{if(!enabled())clear();}).observe(document.body,{attributes:true,attributeFilter:['class']});resize();
globalThis.KewissSpaceFX=Object.freeze({
 setStyle(value){if(!['twin','comet','ember','off'].includes(value))return;style=value;canvas.dataset.style=style;if(!enabled())clear();},
 setQuality(value){if(!Object.hasOwn(settings,value))return;quality=value;engine.limit=settings[value].limit;if(engine.particles.length>engine.limit)engine.particles.splice(0,engine.particles.length-engine.limit);canvas.dataset.quality=value;},
 burst,celebrate,clear,getState(){return{style,quality,particles:engine.particles.length,limit:engine.limit,enabled:enabled()};}
});
})();
