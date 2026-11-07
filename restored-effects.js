/* Compositor-positioned pointer; one short-lived, bounded ribbon renderer. */
(()=>{'use strict';
const control=document.getElementById('cursorMode');if(!control)return;
const body=document.body,media=matchMedia('(prefers-reduced-motion: reduce)'),styleControl=document.getElementById('sparkStyle'),qualityControl=document.getElementById('sparkQuality');
const canvas=document.createElement('canvas');canvas.id='cursorTrail';canvas.setAttribute('aria-hidden','true');body.append(canvas);
const g=canvas.getContext('2d',{alpha:true});if(!g)return;
let mode='orbit',inside=false,frame=0,points=[],pulses=[],hoverTarget=null,style=styleControl.value,quality=qualityControl.value,lastPaint=0,paintCount=0,dirty=null;
const LIMIT=40,LIFE=340;
try{const saved=localStorage.getItem('kewiss-cursor-mode');if(['orbit','precision','native'].includes(saved))mode=saved;}catch{}
const motion=()=>!media.matches&&!document.hidden&&!body.classList.contains('motion-off');
const active=()=>inside&&mode!=='native'&&motion();
const drawable=()=>active()&&!body.classList.contains('space-gallery-open')&&!body.classList.contains('universe-viewing');
function reset(){points=[];pulses=[];cancelAnimationFrame(frame);frame=0;lastPaint=0;g.clearRect(0,0,canvas.width,canvas.height);dirty=null;canvas.dataset.points='0';canvas.dataset.pulses='0';}
function request(){if(!frame&&drawable())frame=requestAnimationFrame(paint);}
function sync(){if(body.dataset.cursor!==mode)body.dataset.cursor=mode;if(control.value!==mode)control.value=mode;const ready=active();if(body.classList.contains('cursor-ready')!==ready)body.classList.toggle('cursor-ready',ready);if(!drawable())reset();}
function resize(){canvas.width=Math.ceil(innerWidth);canvas.height=Math.ceil(innerHeight);dirty=null;request();}
function sample(x,y,time){
 if(!Number.isFinite(x)||!Number.isFinite(y))return;
 const previous=points.at(-1);if(previous&&Math.hypot(x-previous.x,y-previous.y)<2){previous.time=time;return;}
 points.push({x,y,time});if(points.length>LIMIT)points.splice(0,points.length-LIMIT);
}
function path(offset=0){
 const first=points[0];g.beginPath();g.moveTo(first.x,first.y+offset);
 for(let i=1;i<points.length;i++){const before=points[i-1],point=points[i];g.quadraticCurveTo(before.x,before.y+offset,(before.x+point.x)*.5,(before.y+point.y)*.5+offset);}
 const end=points.at(-1);g.lineTo(end.x,end.y+offset);
}
function star(x,y,size){g.beginPath();g.moveTo(x,y-size);g.lineTo(x+size*.25,y-size*.25);g.lineTo(x+size,y);g.lineTo(x+size*.25,y+size*.25);g.lineTo(x,y+size);g.lineTo(x-size*.25,y+size*.25);g.lineTo(x-size,y);g.lineTo(x-size*.25,y-size*.25);g.closePath();g.fill();}
function paint(now){
 frame=0;if(!drawable()){reset();return;}lastPaint=now;
 if(dirty)g.clearRect(dirty.x,dirty.y,dirty.w,dirty.h);
 points=points.filter(point=>now-point.time<LIFE);pulses=pulses.filter(pulse=>now-pulse.time<(pulse.life||440));
 const all=[...points,...pulses];if(!all.length){dirty=null;canvas.dataset.points='0';canvas.dataset.pulses='0';return;}
 const xs=all.map(p=>p.x),ys=all.map(p=>p.y);dirty={x:Math.min(...xs)-36,y:Math.min(...ys)-36,w:Math.max(...xs)-Math.min(...xs)+72,h:Math.max(...ys)-Math.min(...ys)+72};
 const cyan=style==='ember'?'#ffbb83':'#93dfff',bright=style==='ember'?'#fff0d2':'#f1fbff';
 g.save();g.lineCap='round';g.lineJoin='round';
 if(points.length>1&&style!=='off'){
  const first=points[0],last=points.at(-1),fade=Math.max(0,1-(now-last.time)/LIFE),gradient=g.createLinearGradient(first.x,first.y,last.x+.01,last.y+.01);
  gradient.addColorStop(0,'#9edaff00');gradient.addColorStop(.35,cyan+'66');gradient.addColorStop(.8,cyan);gradient.addColorStop(1,bright);
  g.strokeStyle=gradient;g.globalAlpha=fade*.12;g.lineWidth=quality==='high'?7:5;path();g.stroke();
  for(let i=1;i<points.length;i++){const before=points[i-1],point=points[i],next=points[Math.min(i+1,points.length-1)],weight=(i/(points.length-1))**1.4;g.globalAlpha=fade*(.18+.82*weight);g.lineWidth=.3+1.8*weight;g.beginPath();g.moveTo(i===1?before.x:(before.x+point.x)*.5,i===1?before.y:(before.y+point.y)*.5);g.quadraticCurveTo(point.x,point.y,(point.x+next.x)*.5,(point.y+next.y)*.5);g.stroke();}
  if(style==='twin'){g.globalAlpha=fade*.28;g.lineWidth=.55;path(2.5);g.stroke();}
  g.fillStyle=bright;
  for(let i=2;i<points.length;i+=quality==='low'?8:5){const p=points[i],age=(now-p.time)/LIFE;g.globalAlpha=Math.max(0,1-age)*fade*.8;star(p.x+Math.sin(i*2.4)*7,p.y+Math.cos(i*1.7)*7,1+(1-age)*1.5);}
 }
 for(const pulse of pulses){const t=(now-pulse.time)/(pulse.life||440),hover=pulse.type==='hover';g.globalAlpha=(1-t)**2*(hover?.45:1);g.lineWidth=hover?.7:1.2;g.strokeStyle=cyan;g.beginPath();g.arc(pulse.x,pulse.y,4+t*(hover?12:24),0,Math.PI*2);g.stroke();g.fillStyle=bright;for(let i=0;i<4;i++){const angle=i*Math.PI*.5+Math.PI*.25,r=5+t*(hover?10:21);star(pulse.x+Math.cos(angle)*r,pulse.y+Math.sin(angle)*r,(hover?1.4:2)*(1-t));}}
 g.restore();paintCount++;canvas.dataset.points=String(points.length);canvas.dataset.pulses=String(pulses.length);
 request();
}
control.addEventListener('change',()=>{if(!['orbit','precision','native'].includes(control.value))return;mode=control.value;try{localStorage.setItem('kewiss-cursor-mode',mode);}catch{}sync();});
styleControl.addEventListener('change',()=>{style=styleControl.value;if(style==='off')points=[];request();});
qualityControl.addEventListener('change',()=>{quality=qualityControl.value;});
addEventListener('pointermove',event=>{
 if(event.pointerType==='touch')return;
 if(!inside){inside=true;sync();}
 if(!drawable()||style==='off')return;
 const events=typeof event.getCoalescedEvents==='function'?event.getCoalescedEvents():[];
 for(const point of events.slice(-6))sample(point.clientX,point.clientY,performance.now());
 sample(event.clientX,event.clientY,performance.now());request();
},{passive:true});
addEventListener('pointerdown',event=>{if(event.pointerType==='touch'||event.button!==0)return;if(!inside){inside=true;sync();}if(!drawable())return;pulses.push({x:event.clientX,y:event.clientY,time:performance.now()});if(pulses.length>4)pulses.shift();request();},{passive:true});
addEventListener('pointerover',event=>{if(event.pointerType==='touch')return;const target=event.target.closest?.('a,button,summary,select,input[type=range]')||null;if(target===hoverTarget)return;hoverTarget=target;if(!target||!drawable())return;pulses.push({x:event.clientX,y:event.clientY,time:performance.now(),life:260,type:'hover'});if(pulses.length>4)pulses.shift();request();},{passive:true});
addEventListener('pointerout',event=>{if(!event.relatedTarget){inside=false;sync();}},{passive:true});
addEventListener('blur',()=>{inside=false;sync();});
addEventListener('resize',resize);document.addEventListener('visibilitychange',sync);media.addEventListener('change',sync);
new MutationObserver(sync).observe(body,{attributes:true,attributeFilter:['class']});
resize();sync();
window.KewissCursor=Object.freeze({getState(){return{mode,active:active(),renderer:'native-svg-pointer',trail:style,points:points.length,pulses:pulses.length,pending:!!frame,paintCount,lastPaint,limit:LIMIT};}});
})();
