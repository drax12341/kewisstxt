'use strict';
const $ = selector => document.querySelector(selector);
const $$ = selector => [...document.querySelectorAll(selector)];
const textureAssetQuery = new URL(document.currentScript.src).search;
const palettes = {
  kewiss:{accent:'#ef3e58',rgb:'239,62,88',light:'#ffb4bd',low:'#68172f',label:'Original materials / crimson overlay',description:'Original Minecraft materials with clean crimson animation and combat accents.'},
  fire:{accent:'#f88a3f',rgb:'248,138,63',light:'#ffe3aa',low:'#9b3020',label:'Original materials / warm overlay',description:'Original Minecraft materials with warm animation and ember combat accents.'},
  eclipse:{accent:'#a166f2',rgb:'161,102,242',light:'#dfb9ff',low:'#39215d',label:'Original materials / violet overlay',description:'Original Minecraft materials with violet animation and combat accents.'},
  drax:{accent:'#328fff',rgb:'50,143,255',light:'#b4f5ff',low:'#163e83',label:'Original materials / cyan overlay',description:'Original Minecraft materials with cyan animation and icy highlights.'}
};
const itemNames={netherite_sword:'Netherite sword',netherite_axe:'Netherite axe',netherite_spear:'Netherite spear',mace:'Mace',trident:'Trident',ender_pearl:'Ender pearl',wind_charge:'Wind charge'};
const reduced=matchMedia('(prefers-reduced-motion: reduce)');
let theme='kewiss',tinted=false,energy=true,playing=!reduced.matches,speed=1,phase=0,lastTime=0,hitTime=performance.now()-180,frameRequest=0,comparing=false,comparison=.5;
let combatStudyAge=null;
let saved={};try{saved=JSON.parse(localStorage.getItem('kewiss-preview-v2')||'{}');}catch{}
if(palettes[saved.theme])theme=saved.theme;
tinted=false;
if(typeof saved.energy==='boolean')energy=saved.energy;
function persist(){try{localStorage.setItem('kewiss-preview-v2',JSON.stringify({theme,tinted,energy}));}catch{}}
let toastTimer;
function toast(message){const el=$('#toast');el.textContent=message;el.hidden=false;clearTimeout(toastTimer);toastTimer=setTimeout(()=>el.hidden=true,3500);}
const sheets=new Map(),loading=new Map(),contexts=new WeakMap(),visible=new WeakMap();
function assetKey(canvas){const orb=['ender_pearl','wind_charge'].includes(canvas.dataset.item);return `${theme}-${canvas.dataset.item}${tinted?'-tinted':''}${energy?(orb?'-hotbar':''):'-still'}`;}
function getSheet(key){
  if(sheets.has(key))return;
  if(!loading.has(key)){
    const img=new Image();
    const promise=new Promise(resolve=>{
      img.onload=()=>{sheets.set(key,img);loading.delete(key);resolve(img);invalidate();};
      img.onerror=()=>{loading.delete(key);resolve(null);toast('A preview could not load. Refresh to try again.');};
    });
    loading.set(key,promise);img.src=`assets/${key}.png${textureAssetQuery}`;
  }
}
function loadCurrent(){for(const canvas of $$('.sprite'))getSheet(assetKey(canvas));if(comparing)getSheet(`${theme}-${$('#inspect-sprite').dataset.item}-still`);getSheet('combat-sprites-'+theme);}
const visibility=new IntersectionObserver(entries=>{for(const e of entries)visible.set(e.target,e.isIntersecting);invalidate();},{rootMargin:'80px'});
for(const canvas of $$('.sprite')){contexts.set(canvas,canvas.getContext('2d'));visible.set(canvas,true);visibility.observe(canvas);}
visibility.observe($('#combat-canvas'));
function paintSprite(canvas){
  if(visible.get(canvas)===false)return;
  const key=assetKey(canvas),image=sheets.get(key);if(!image)return;
  const ctx=contexts.get(canvas);ctx.clearRect(0,0,64,64);ctx.imageSmoothingEnabled=false;
  const frames=image.height/image.width;
  const sample=energy?(phase%4800)/4800*frames:0,frame=Math.floor(sample),blend=sample-frame;
  ctx.globalCompositeOperation='source-over';ctx.globalAlpha=1;ctx.drawImage(image,0,frame*64,64,64,0,0,64,64);
  ctx.globalAlpha=1;ctx.globalCompositeOperation='source-over';canvas.dataset.frame=String(frame);canvas.dataset.loaded=key;
  if(canvas.id==='inspect-sprite'){
    const original=sheets.get(`${theme}-${canvas.dataset.item}-still`);
    if(comparing&&original){ctx.save();ctx.beginPath();ctx.rect(0,0,64*comparison,64);ctx.clip();ctx.clearRect(0,0,64,64);ctx.drawImage(original,0,0,64,64);ctx.restore();ctx.fillStyle='#ffffffaa';ctx.fillRect(Math.floor(64*comparison),0,.35,64);}
    canvas.dataset.compared=String(comparing&&!!original);
    const timeline=$('#timeline');if(timeline){timeline.value=Math.round(phase%4800/4.8);$('#frame-position').textContent=`${frame+1} / ${frames} frames`;}
  }
}
function invalidate(){if(!frameRequest&&!document.hidden)frameRequest=requestAnimationFrame(render);}
function render(now){
  frameRequest=0;if(document.hidden)return;
  if(lastTime&&playing)phase+=Math.min(100,now-lastTime)*speed;
  lastTime=now;
  for(const canvas of $$('.sprite'))paintSprite(canvas);
  if(visible.get($('#combat-canvas'))!==false)paintCombat(combatStudyAge??(playing?(now-hitTime)/1000:.22));
  if(playing)invalidate();
}
function setPlaying(value){playing=value;lastTime=0;document.documentElement.dataset.previewPlaying=String(value);const button=$('#animation-toggle');button.textContent=value?'Pause preview Ⅱ':'Play preview ▶';button.setAttribute('aria-pressed',String(value));button.setAttribute('aria-label',value?'Pause all animation previews':'Play all animation previews');invalidate();}
$('#animation-toggle').addEventListener('click',()=>{setPlaying(!playing);hitTime=performance.now();});
reduced.addEventListener('change',e=>{if(e.matches)setPlaying(false);});
document.addEventListener('visibilitychange',()=>{lastTime=0;if(document.hidden){cancelAnimationFrame(frameRequest);frameRequest=0;}else invalidate();});
function setTheme(value){
  theme=value;const palette=palettes[value],root=document.documentElement;
  root.dataset.theme=value;root.style.setProperty('--accent',palette.accent);root.style.setProperty('--accent-rgb',palette.rgb);root.style.setProperty('--highlight',palette.light);
  $$('.theme-tabs button').forEach(button=>{const selected=button.dataset.style===value;button.classList.toggle('active',selected);button.setAttribute('aria-pressed',String(selected));});
  $('.crimson-tag').textContent=value.toUpperCase();$('.inspector-word').textContent=value.toUpperCase();$('.art-description').textContent=palette.label;
  $('.theme-count').textContent=`0${Object.keys(palettes).indexOf(value)+1} / 04`;$('#theme-description').textContent=palette.description;
  hitTime=performance.now();loadCurrent();persist();invalidate();
}
$$('[data-style]').forEach(button=>button.addEventListener('click',()=>setTheme(button.dataset.style)));
$$('[data-pick]').forEach(button=>button.addEventListener('click',()=>{
  $$('[data-pick]').forEach(other=>{other.classList.toggle('active',other===button);other.setAttribute('aria-pressed',String(other===button));});
  $('#inspect-sprite').dataset.item=button.dataset.pick;$('#inspect-sprite').setAttribute('aria-label',`Animated ${itemNames[button.dataset.pick]} preview`);
  $('#item-name').textContent=itemNames[button.dataset.pick];$('#item-index').textContent=`ITEM / 0${Object.keys(itemNames).indexOf(button.dataset.pick)+1}`;
  $('#item-view').textContent=['ender_pearl','wind_charge'].includes(button.dataset.pick)?'HOTBAR VIEW · clean animated edges':'ANIMATED ITEM TEXTURE';loadCurrent();invalidate();
}));
function switchButton(id,initial,callback){const button=$(id);button.setAttribute('aria-checked',String(initial));button.addEventListener('click',()=>{const value=button.getAttribute('aria-checked')!=='true';button.setAttribute('aria-checked',String(value));callback(value);invalidate();});}

switchButton('#energy-toggle',energy,value=>{energy=value;loadCurrent();persist();});
switchButton('#sweep-toggle',true,()=>replay());switchButton('#crit-toggle',true,()=>replay());
$('#preview-speed').addEventListener('input',e=>{speed=Number(e.target.value);$('#speed-value').textContent=speed.toFixed(1)+'×';invalidate();});
function replay(){combatStudyAge=null;document.querySelectorAll("[data-sweep-phase]").forEach(b=>b.setAttribute("aria-pressed","false"));hitTime=performance.now();invalidate();}
$('#replay-effect').addEventListener('click',replay);$('#combat-canvas').addEventListener('click',replay);
$('#sweep-style').addEventListener('change',replay);$('#crit-style').addEventListener('change',replay);
function smooth(t){t=Math.max(0,Math.min(1,t));return t*t*(3-2*t);}
const effectCanvas=$('#combat-canvas'),effect=effectCanvas.getContext('2d');
const sweepSurface=document.createElement('canvas');sweepSurface.width=576;sweepSurface.height=288;const sweepPaint=sweepSurface.getContext('2d');
function paintCombat(age){
  const ctx=effect,p=palettes[theme],w=900,h=500;ctx.clearRect(0,0,w,h);
  ctx.strokeStyle='#ffffff07';ctx.lineWidth=1;
  for(let i=0;i<12;i++){ctx.beginPath();ctx.moveTo(w/2+(i-5.5)*35,285);ctx.lineTo(w/2+(i-5.5)*150,h);ctx.stroke();}
  for(let y=300;y<h;y+=35){ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(w,y);ctx.stroke();}
  // An abstract practice target gives the demonstration a center without implying a game screenshot.
  ctx.fillStyle='#1b202b';ctx.strokeStyle='#363f51';ctx.lineWidth=2;
  ctx.fillRect(423,140,54,54);ctx.strokeRect(423,140,54,54);ctx.fillRect(414,199,72,95);ctx.strokeRect(414,199,72,95);
  ctx.fillStyle='#151a24';ctx.fillRect(415,300,30,56);ctx.fillRect(455,300,30,56);ctx.fillRect(375,205,32,80);ctx.fillRect(493,205,32,80);
  ctx.strokeStyle=p.low;ctx.strokeRect(430,220,40,40);ctx.fillStyle=p.accent;ctx.globalAlpha=.35;ctx.fillRect(446,235,8,8);ctx.globalAlpha=1;
    const atlas=sheets.get('combat-sprites-'+theme);let t=age%2.2;if(!atlas||t>1.1)return;
    ctx.imageSmoothingEnabled=false;
    if($('#sweep-toggle').getAttribute('aria-checked')==='true'&&t<.96){
      const progress=t/.96,style=['flame','crescent','lightning'].indexOf($('#sweep-style').value),size=Number($('#sweep-size')?.value||100)/100;
      const sample=progress*191,base=Math.floor(sample),frame=style*192+base,blend=sample-base,width=445*size,x=450+(.5-smooth(progress))*20*size,height=width/2;
      const c=sweepPaint;c.clearRect(0,0,576,288);c.imageSmoothingEnabled=false;c.globalCompositeOperation='source-over';c.globalAlpha=1-blend;
      c.drawImage(atlas,frame%8*96,Math.floor(frame/8)*48,96,48,0,0,576,288);
      if(blend>0&&base<191){const next=frame+1;c.globalCompositeOperation='lighter';c.globalAlpha=blend;c.drawImage(atlas,next%8*96,Math.floor(next/8)*48,96,48,0,0,576,288);}
      c.globalAlpha=1;c.globalCompositeOperation='destination-in';
      const front=1.25-3*progress,back=front+1.5,mask=c.createLinearGradient(0,0,576,0);
      for(let i=0;i<=128;i++){const u=i/128,alpha=smooth((u-front)/.35)*smooth((back-u)/.35);mask.addColorStop(u,'rgba(255,255,255,'+alpha+')');}
      c.fillStyle=mask;c.fillRect(0,0,576,288);c.globalCompositeOperation='source-over';
      ctx.globalAlpha=1;ctx.drawImage(sweepSurface,x-width/2,260-height/2,width,height);
      $('#sweep-time').value=String(Math.round(progress*1000));$('#sweep-time-value').value=(Math.round(sample)+1)+' / 192';
    }
    if($('#crit-toggle').getAttribute('aria-checked')==='true')for(let i=0;i<19;i++){
      const time=t-(i%5)*.011,life=.48+(i%4)*.1;if(time<=0||time>=life)continue;
      const progress=time/life,angle=i*2.399963,travel=26+(1-Math.exp(-time*4))*(100+(i%4)*20);
      const x=450+Math.cos(angle)*travel,y=230+Math.sin(angle)*travel*.8-time*100+time*time*100;
      const style=$('#crit-style').value,kind=style==='lightning'?3:style==='mixed'&&i%5===0?3:i%3;
      const size=(19+i%4*4)*(.65+.35*smooth(time/.065))*(1-.24*progress);
      ctx.globalAlpha=smooth(time/.035)*(1-smooth((progress-.48)/.52));
      ctx.drawImage(atlas,(kind*8+Math.min(7,Math.floor(progress*8)))*16,3456,16,16,x-size/2,y-size/2,size,size);
    }
    ctx.globalAlpha=1;
}
const installs={jar:[['Get Fabric ready.','Use <strong>Minecraft Java 1.21.11</strong>, <strong>Java 21+</strong> and <strong>Fabric Loader 0.18.4+</strong>. Fabric API is included in the JAR.'],['Update your Fabric instance.','Open the folder of the Fabric instance you launch. Replace the older KewissTxT JAR in its <code>mods</code> folder with the download above, then restart Minecraft. The mod includes all textures; keep its standalone ZIP disabled.'],['Make it yours.','Launch that Fabric profile and enter a world or server. Type <code>/kewisdistxt</code> in Minecraft chat and press <strong>Enter</strong>, or press <strong>Right Shift</strong>. Choose your theme, combat style and sounds.']],zip:[['Use Java 1.21.11.','The standalone pack is for <strong>Minecraft Java 1.21.11</strong>. No mod loader is needed for the animated textures.'],['Keep it zipped.','Download the ZIP above and put it in <code>.minecraft/resourcepacks</code>. Leave it zipped.'],['Enable your pack.','Open <strong>Options → Resource Packs</strong>, enable KewissTxT and apply. You get the default Kewiss item textures and hotbar.']]};
let installType='jar',release;
function setInstall(type){installType=type;$$('[data-install]').forEach(button=>{const selected=button.dataset.install===type;button.classList.toggle('active',selected);button.setAttribute('aria-pressed',String(selected));});$('#install-steps').innerHTML=installs[type].map(([title,body],i)=>`<article class="install-step"><span class="step-number">0${i+1}</span><h3>${title}</h3><p>${body}</p></article>`).join('');$('#copy-hash').textContent=`Copy ${type.toUpperCase()} SHA-256 ↗`;}
$$('[data-install]').forEach(button=>button.addEventListener('click',()=>setInstall(button.dataset.install)));
async function copy(value,success){try{await navigator.clipboard.writeText(value);toast(success);return true;}catch{toast('Clipboard unavailable. Select and copy the text manually.');return false;}}
$('#copy-command').addEventListener('click',async()=>{const copied=await copy('/kewisdistxt','Settings command copied. Paste it into Minecraft chat.');$('#copy-status').textContent=copied?'Copied. Paste it into Minecraft chat.':'Type /kewisdistxt in Minecraft chat.';});
$('#copy-hash').addEventListener('click',()=>{if(release?.[installType]?.sha256)copy(release[installType].sha256,`${installType.toUpperCase()} SHA-256 copied.`);else toast('Release information is loading. Try again in a moment.');});
fetch('release.json',{cache:'no-cache'}).then(response=>{if(!response.ok)throw Error('Release unavailable');return response.json();}).then(data=>{release=data;for(const type of ['jar','zip'])$(`[data-size="${type}"]`).textContent=(data[type].bytes/1024/1024).toFixed(1)+' MB';}).catch(()=>{});
let currentAudio,currentButton,audioSerial=0;
function stopAudio(){if(currentAudio){currentAudio.pause();currentAudio.currentTime=0;}if(currentButton){currentButton.classList.remove('playing');currentButton.setAttribute('aria-pressed','false');currentButton.querySelector('.play-icon').textContent='▶';}}
$$('[data-audio]').forEach(button=>button.addEventListener('click',async()=>{
  const wasPlaying=currentButton===button&&currentAudio&&!currentAudio.paused;stopAudio();const serial=++audioSerial;if(wasPlaying)return;
  currentButton=button;const audio=new Audio(`assets/${button.dataset.audio}.ogg`);currentAudio=audio;audio.volume=.6;
  audio.addEventListener('ended',()=>{if(serial!==audioSerial)return;stopAudio();$('#audio-status').textContent='Preview finished.';},{once:true});
  try{await audio.play();if(serial!==audioSerial){audio.pause();return;}button.classList.add('playing');button.setAttribute('aria-pressed','true');button.querySelector('.play-icon').textContent='Ⅱ';$('#audio-status').textContent=`Playing ${button.querySelector('strong').textContent}.`;}
  catch{if(serial===audioSerial){stopAudio();$('#audio-status').textContent='Audio could not play. Try again.';toast('Audio could not play. Check your browser sound settings.');}}
}));
const dialog=$('#capture-dialog');$('#open-capture').addEventListener('click',()=>{dialog.querySelector('img').src='assets/combat-'+theme+'.png';dialog.querySelector('img').alt='Actual Minecraft combat capture · '+theme;dialog.querySelector('p').textContent='Actual Minecraft capture · '+theme;dialog.showModal();});$('.dialog-close').addEventListener('click',()=>dialog.close());dialog.addEventListener('click',e=>{if(e.target===dialog)dialog.close();});
if(!reduced.matches){document.documentElement.classList.add('motion-ready');const reveal=new IntersectionObserver(entries=>{for(const e of entries)if(e.isIntersecting){e.target.classList.add('visible');reveal.unobserve(e.target);}},{threshold:.12});$$('.reveal').forEach(el=>reveal.observe(el));}
let scrollPending=false;addEventListener('scroll',()=>{if(scrollPending)return;scrollPending=true;requestAnimationFrame(()=>{scrollPending=false;const max=document.documentElement.scrollHeight-innerHeight;$('.scroll-progress').style.width=(max>0?scrollY/max*100:0)+'%';});},{passive:true});
setInstall('jar');setPlaying(playing);setTheme(theme);

document.querySelectorAll('[data-sweep-phase]').forEach(button=>button.addEventListener('click',()=>{combatStudyAge=Number(button.dataset.sweepPhase)*.96;document.querySelectorAll('[data-sweep-phase]').forEach(b=>b.setAttribute('aria-pressed',String(b===button)));invalidate();}));

$('#sweep-time').addEventListener('input',e=>{combatStudyAge=Number(e.target.value)/1000*.96;document.querySelectorAll('[data-sweep-phase]').forEach(b=>b.setAttribute('aria-pressed','false'));$('#sweep-time-value').value=(Math.round(Number(e.target.value)/1000*191)+1)+' / 192';invalidate();});
