(()=>{'use strict';
const $=id=>document.getElementById(id),reduced=matchMedia('(prefers-reduced-motion: reduce)'),N=64,F=96,assetQuery=new URL(document.currentScript.src).search;
const presets=[['Ember','gradient','#FFF0A0','#FF4B18'],['Soul','gradient','#DFFFFF','#09B8CD'],['Red','gradient','#FFB5BF','#D51035'],['Purple','gradient','#E8CCFF','#7835DE'],['Blue','gradient','#C3F6FF','#2366ED'],['Red + black','gradient','#F12F46','#101017'],['White','solid','#F4F7FC','#328FFF'],['Green','gradient','#DEFFC0','#36C56A'],['Rose','separate','#FFDBEA','#EE4086'],['Ice','separate','#EFFFFF','#328FFF']];
let mode='gradient',colors=['#FFF0A0','#FF4B18'],paused=reduced.matches,phase=0,last=0,dark=false,bolts=true,exporting=false;
const hex=s=>{s=s.trim().replace(/^#/,'');if(/^[a-f\d]{3}$/i.test(s))s=[...s].map(x=>x+x).join('');return /^[a-f\d]{6}$/i.test(s)?'#'+s.toUpperCase():null;},rgb=s=>parseInt(s.slice(1),16),clamp=(v,a,b)=>Math.max(a,Math.min(b,v)),mix=(a,b,t)=>{let c=0;for(let s=0;s<24;s+=8)c|=Math.round((a>>s&255)*(1-t)+(b>>s&255)*t)<<s;return c;};
function frame(m,a,b,time,variant){const pixels=new Uint8ClampedArray(N*N*4),p=time*Math.PI*2;for(let x=0;x<N;x++){const u=x/63,crest=.39+.12*Math.sin(u*27+p+variant*2)+.08*Math.sin(u*51-p*2)+.035*Math.sin(u*83+p*3);for(let y=0;y<N;y++){const rise=(63-y)/63,edge=(crest-rise)*N;if(edge<=0)continue;const heat=clamp(1-rise/Math.max(.01,crest),0,1),flicker=.88+.12*Math.sin(u*31+rise*21-p*2),t=m==='solid'?0:m==='gradient'?Math.pow(1-heat,.65):heat>.62?0:1;let c=mix(a,b,t);c=mix(c,0xffffff,heat*heat*.24*flicker);const i=(y*N+x)*4;pixels[i]=c>>16&255;pixels[i+1]=c>>8&255;pixels[i+2]=c&255;pixels[i+3]=Math.round(clamp(edge/1.7,0,1)*255);}}return pixels;}
const tile=document.createElement('canvas');tile.width=tile.height=64;const tc=tile.getContext('2d'),canvas=$('fire119'),ctx=canvas.getContext('2d');
function renderFire(){tc.putImageData(new ImageData(frame(mode,rgb(colors[0]),rgb(colors[1]),phase,0),64,64),0,0);ctx.clearRect(0,0,480,256);ctx.fillStyle='#352e30';ctx.beginPath();ctx.moveTo(70,207);ctx.lineTo(240,172);ctx.lineTo(410,207);ctx.lineTo(240,246);ctx.closePath();ctx.fill();ctx.imageSmoothingEnabled=false;const h=110+Number($('fire119-height').value)*1.8;ctx.drawImage(tile,75,210-h,330,h);canvas.dataset.colors=colors.join(',');canvas.dataset.mode=mode;canvas.dataset.height=$('fire119-height').value;canvas.dataset.frame=String(Math.floor(phase*96));canvas.dataset.ready='true';}
const images=new Map();for(const file of ['golden_apple-dark-lightning.png','golden_apple-gold-lightning.png','golden_apple.png','golden_apple-original.png','totem_of_undying-lightning.png','totem_of_undying-original.png']){const im=new Image();im.onload=()=>{images.set(file,im);renderItems();};im.src='assets/'+file+assetQuery;}
function drawItem(id,file,animated){const c=$(id),g=c.getContext('2d'),im=images.get(file);g.clearRect(0,0,c.width,c.height);if(!im)return;g.imageSmoothingEnabled=false;g.globalAlpha=1;g.globalCompositeOperation='source-over';if(animated){const at=Math.floor(phase*(im.height/im.width));g.drawImage(im,0,at*64,64,64,0,0,c.width,c.height);}else g.drawImage(im,0,0,c.width,c.height);c.dataset.dark=String(dark);c.dataset.lightning=String(bolts);c.dataset.ready='true';}
function renderItems(){drawItem('apple119',bolts?'golden_apple-'+(dark?'dark':'gold')+'-lightning.png':dark?'golden_apple.png':'golden_apple-original.png',bolts);drawItem('totem119',bolts?'totem_of_undying-lightning.png':'totem_of_undying-original.png',bolts);}
function sync(){['a','b'].forEach((c,i)=>{$('fire119-'+c).value=colors[i];$('fire119-hex-'+c).value=colors[i];$('fire119-hex-'+c).removeAttribute('aria-invalid');});$('fire119-mode').value=mode;$('fire119-export').disabled=exporting;renderFire();}
for(const p of presets){const b=document.createElement('button');b.type='button';b.textContent=p[0];b.onclick=()=>{mode=p[1];colors=p.slice(2);sync();};$('fire119-presets').append(b);}
for(const [i,c]of ['a','b'].entries()){$('fire119-'+c).oninput=e=>{colors[i]=e.target.value.toUpperCase();sync();};$('fire119-hex-'+c).oninput=e=>{const value=hex(e.target.value);e.target.setAttribute('aria-invalid',String(!value));if(value){colors[i]=value;$('fire119-'+c).value=value;}const invalid=['a','b'].some(c=>!hex($('fire119-hex-'+c).value));$('fire119-export').disabled=exporting||invalid;if(!exporting)$('fire119-status').textContent=invalid?'Enter a valid color such as #FF2233.':'In game: /kewisdistxt → Fire. Use colors, then Apply.';renderFire();};}
$('fire119-mode').onchange=e=>{mode=e.target.value;renderFire();};$('fire119-height').oninput=renderFire;$('fire119-swap').onclick=()=>{colors.reverse();sync();};
function pauseLabel(){$('fire119-pause').textContent=paused?'Play motion':'Pause motion';$('fire119-pause').setAttribute('aria-pressed',String(paused));}pauseLabel();$('fire119-pause').onclick=()=>{paused=!paused;pauseLabel();};
$('apple119-skin').onclick=()=>{dark=!dark;$('apple119-skin').textContent='Charcoal skin: '+(dark?'ON':'OFF');$('apple119-skin').setAttribute('aria-pressed',String(dark));renderItems();};$('item119-bolts').onclick=()=>{bolts=!bolts;$('item119-bolts').textContent='Flame aura: '+(bolts?'ON':'OFF');$('item119-bolts').setAttribute('aria-pressed',String(bolts));renderItems();};
function model(sprite,height,crossed){const top=16*(.5+height),faces={north:{uv:[0,0,16,16],texture:'#fire'},south:{uv:[0,0,16,16],texture:'#fire'}},plane={from:[0,0,8],to:[16,top,8],shade:false,faces};return JSON.stringify({ambientocclusion:false,textures:{particle:'minecraft:block/'+sprite,fire:'minecraft:block/'+sprite},elements:crossed?[{...plane,rotation:{origin:[8,0,8],axis:'y',angle:45,rescale:true}},{...plane,rotation:{origin:[8,0,8],axis:'y',angle:-45,rescale:true}}]:[plane]});}
$('fire119-export').onclick=async()=>{
 const button=$('fire119-export'),status=$('fire119-status');if(exporting||['a','b'].some(c=>!hex($('fire119-hex-'+c).value)))return;
 exporting=true;button.disabled=true;button.setAttribute('aria-busy','true');status.textContent='Preparing your custom fire ZIP…';
 const capturedHex=colors.slice(),capturedMode=mode,captured=capturedHex.map(rgb),height=Number($('fire119-height').value)/100,soul=$('fire119-soul').checked;
 try{
  const text=s=>new TextEncoder().encode(s),files=[['pack.mcmeta',text(JSON.stringify({pack:{pack_format:75,min_format:[75,0],max_format:[75,0],description:'KewissTxT custom low fire / '+capturedHex.join(' + ')}}))]];
  let completed=0;
  for(const type of ['fire','soul_fire'])for(let v=0;v<2;v++){
   status.textContent='Preparing fire textures '+(completed+1)+' of 4…';
   const sprite=type+'_'+v,c=typeof OffscreenCanvas==='function'?new OffscreenCanvas(N,N*F):document.createElement('canvas');c.width=N;c.height=N*F;
   const g=c.getContext('2d'),a=type==='soul_fire'&&!soul?0xdfffff:captured[0],b=type==='soul_fire'&&!soul?0x09b8cd:captured[1];
   for(let f=0;f<F;f++)g.putImageData(new ImageData(frame(capturedMode,a,b,f/F,v),N,N),0,f*N);
   // HTML canvas PNG callbacks can wait for idle time while the live studios animate.
   const blob=typeof c.convertToBlob==='function'?await c.convertToBlob({type:'image/png'}):await new Promise((resolve,reject)=>c.toBlob(blob=>blob?resolve(blob):reject(Error('Could not encode fire texture'))));
   files.push(['assets/minecraft/textures/block/'+sprite+'.png',new Uint8Array(await blob.arrayBuffer())],['assets/minecraft/textures/block/'+sprite+'.png.mcmeta',text('{"animation":{"frametime":1,"interpolate":true}}')]);
   for(const kind of type==='fire'?['floor','side','side_alt','up','up_alt']:['floor','side','side_alt'])files.push(['assets/minecraft/models/block/'+type+'_'+kind+v+'.json',text(model(sprite,height,kind==='floor'))]);
   completed++;
  }
  const url=URL.createObjectURL(window.kewissZip(files)),a=document.createElement('a');a.href=url;a.download='Kewiss-Low-Fire-'+capturedHex[0].slice(1)+'.zip';a.click();setTimeout(()=>URL.revokeObjectURL(url),2000);
  status.textContent='Custom fire ZIP downloaded. Enable it above your other resource packs.';
 }catch(e){status.textContent='Could not export fire. Please retry.';console.error(e);}
 finally{exporting=false;button.disabled=['a','b'].some(c=>!hex($('fire119-hex-'+c).value));button.removeAttribute('aria-busy');}
};
const visible=new IntersectionObserver(entries=>{onScreen=entries[0].isIntersecting;});let onScreen=true;visible.observe($('fire-studio'));
function animate(now){if(last&&!paused&&!document.hidden&&onScreen)phase=(phase+Math.min(now-last,100)/4800)%1;last=now;if(onScreen){renderFire();renderItems();}requestAnimationFrame(animate);}sync();requestAnimationFrame(animate);
window.kewissFire119={frame,model};
})();
