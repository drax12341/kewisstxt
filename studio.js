'use strict';
// The frame explorer and compare use the same source sheets as the mod.
$('#compare-toggle').addEventListener('click',()=>{
  comparing=!comparing;$('#compare-toggle').setAttribute('aria-checked',String(comparing));
  $('#compare-position').disabled=!comparing;loadCurrent();invalidate();
});
$('#compare-position').addEventListener('input',event=>{comparison=Number(event.target.value)/100;invalidate();});
$('#timeline').addEventListener('input',event=>{
  setPlaying(false);const image=sheets.get(assetKey($('#inspect-sprite'))),frames=image?image.height/image.width:96;
  phase=Math.min(frames-1,Math.floor(Number(event.target.value)*frames/1000))*4800/frames;invalidate();
});

function setupUrl(){
  const url=new URL(location.href);url.search='';url.hash='collection';
  for(const [key,value]of Object.entries({theme,item:$('#inspect-sprite').dataset.item,tint:Number(tinted),energy:Number(energy),sweep:$('#sweep-style').value,crit:$('#crit-style').value,sweeps:$('#sweep-toggle').getAttribute('aria-checked')==='true'?1:0,crits:$('#crit-toggle').getAttribute('aria-checked')==='true'?1:0}))url.searchParams.set(key,value);
  for(const [key,value]of Object.entries({sweepSize:$('#sweep-size').value,explosion:$('#blast-enabled').getAttribute('aria-checked')==='true'?1:0,trigger:$('#blast-trigger').value,diameter:$('#blast-size').value,duration:$('#blast-duration').value,vitals:$('#vital-enabled').getAttribute('aria-checked')==='true'?1:0}))url.searchParams.set(key,value);
  return url.href;
}
$('#share-setup').addEventListener('click',async()=>{
  const url=setupUrl(),field=$('#share-url');field.value=url;
  if(await copy(url,'Setup link copied. Your theme, weapon and combat choices are included.'))field.hidden=true;
  else{field.hidden=false;field.focus();field.select();}
});
const shared=new URLSearchParams(location.search);
if(palettes[shared.get('theme')])setTheme(shared.get('theme'));
if(itemNames[shared.get('item')])$(`[data-pick="${shared.get('item')}"]`).click();
for(const [key,id]of [['energy','energy-toggle'],['sweeps','sweep-toggle'],['crits','crit-toggle']])if(['0','1'].includes(shared.get(key))){
  const button=$('#'+id);if((button.getAttribute('aria-checked')==='true')!==(shared.get(key)==='1'))button.click();
}
for(const key of ['sweep','crit']){
  const select=$('#'+key+'-style'),value=shared.get(key);
  if([...select.options].some(option=>option.value===value)){select.value=value;select.dispatchEvent(new Event('change'));}
}

// Rolling windows match the in-game left/right CPS model. Ping/FPS here are labeled examples.
const clickTimes=[[],[]],readouts=$('#hud-readouts'),cps=$('#cps-readout');
let hudShadow=true,hudMotion=true,lastClick=-Infinity,burstAt=-Infinity,previousRise=0,demoUntil=0,hudVisible=false,hudRequest=0,lastHudPaint=0;
function paintHud(now){
  hudRequest=0;if(!hudVisible||document.hidden)return;
  if(now-lastHudPaint>=16){
    lastHudPaint=now;
    for(const list of clickTimes)while(list.length&&now-list[0]>=2000)list.shift();
    const counts=clickTimes.map(list=>list.filter(time=>now-time<1000).length);
    const previous=clickTimes.map(list=>list.filter(time=>now-time>=1000).length);
    const rise=Math.max(0,counts[0]-previous[0],counts[1]-previous[1]);
    if(rise>=9&&previousRise<9)burstAt=now;previousRise=rise;
    const click=Math.exp(-(now-lastClick)/105),age=now-burstAt;
    const burst=Math.exp(-age/240)*(1-Math.exp(-(age+8)/25));
    const animate=hudMotion&&playing,energy=animate?Math.min(1,click*.48+burst*.65+Math.max(0,...counts.map(n=>(n-14)/5))*.55):0;
    const text=counts.join(' | ');if($('#click-value').textContent!==text)$('#click-value').textContent=text;
    cps.style.setProperty('--hud-scale',animate?1+click*.025+burst*.045:1);
    cps.style.setProperty('--hud-lift',animate?(-click*.35-burst*.8)+'px':'0px');cps.style.setProperty('--energy',energy);
    const status=now<demoUntil?'Burst demonstration':Math.max(...counts)>=15?'Fast clicks · energy rising':rise>=9?'Burst · smooth settle':counts.some(Boolean)?'Counting your physical presses.':'Ready when you are.';
    if($('#click-state').textContent!==status)$('#click-state').textContent=status;
    readouts.classList.toggle('shadow-off',!hudShadow);
  }
  hudRequest=requestAnimationFrame(paintHud);
}
function scheduleHud(){if(!hudRequest&&hudVisible&&!document.hidden)hudRequest=requestAnimationFrame(paintHud);}
new IntersectionObserver(entries=>{hudVisible=entries[0].isIntersecting;if(!hudVisible){cancelAnimationFrame(hudRequest);hudRequest=0;}else scheduleHud();},{rootMargin:'80px'}).observe($('#hud-lab'));
document.addEventListener('visibilitychange',()=>{if(document.hidden){cancelAnimationFrame(hudRequest);hudRequest=0;}else scheduleHud();});
function resetClicks(){clickTimes.forEach(list=>list.length=0);lastClick=burstAt=-Infinity;previousRise=demoUntil=0;scheduleHud();}
function recordClick(button){if(button!==0&&button!==2)return;if(performance.now()<demoUntil)resetClicks();const now=performance.now();clickTimes[button===0?0:1].push(now);lastClick=now;scheduleHud();}
$('#click-pad').addEventListener('pointerdown',event=>{if(event.button===0||event.button===2){event.preventDefault();recordClick(event.button);}});
$('#click-pad').addEventListener('contextmenu',event=>event.preventDefault());
$('#click-pad').addEventListener('click',event=>{if(event.detail===0)recordClick(0);});
$('#demo-burst').addEventListener('click',()=>{resetClicks();const now=performance.now();for(let i=0;i<12;i++)clickTimes[0].push(now-i*18);lastClick=now;demoUntil=now+1500;scheduleHud();});
$('#reset-clicks').addEventListener('click',resetClicks);
for(const [id,set]of [['hud-shadow',value=>hudShadow=value],['hud-motion',value=>hudMotion=value]])$('#'+id).addEventListener('click',event=>{const button=event.currentTarget,value=button.getAttribute('aria-checked')!=='true';button.setAttribute('aria-checked',String(value));set(value);scheduleHud();});
