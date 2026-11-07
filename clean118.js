(()=>{
 const by=id=>document.getElementById(id),row=by('flame-hotbar'),focus=by('flame-inspector'),r=row.getContext('2d'),f=focus.getContext('2d');
 const items=['netherite_sword','netherite_axe','netherite_spear','trident','bow','crossbow_standby','mace','ender_pearl','wind_charge'],names=['Netherite sword','Netherite axe','Netherite spear','Trident','Bow','Crossbow','Mace','Ender pearl','Wind charge'];
 const sheets=new Map(),pending=new Map(),colors={kewiss:'#ef496a',fire:'#f99d4c',eclipse:'#b387ff',drax:'#58b6ff'},assetQuery=new URL(document.currentScript.src).search;
 let theme='kewiss',selected=0,play=!matchMedia('(prefers-reduced-motion: reduce)').matches,phase=0,last=0,visible=false,request=0;
 function load(){for(const item of items){const key=theme+'-'+item;if(sheets.has(key)||pending.has(key))continue;const image=new Image();pending.set(key,image);image.onload=()=>{pending.delete(key);sheets.set(key,image);paint();};image.onerror=()=>{pending.delete(key);by('flame-status').textContent='A flame texture could not load. Refresh to retry.';};image.src='assets/flames-'+key+'.png'+assetQuery;}}
 function sprite(ctx,image,x,y,size){if(!image)return;const count=image.height/64,a=Math.floor(phase/96*count);ctx.globalAlpha=1;ctx.globalCompositeOperation='source-over';ctx.drawImage(image,0,a*64,64,64,x,y,size,size);}
 function paint(){r.clearRect(0,0,1000,260);r.imageSmoothingEnabled=f.imageSmoothingEnabled=false;r.fillStyle='#0b0d13';r.fillRect(54,74,892,108);r.strokeStyle='#4a3a53';r.lineWidth=2;
  for(let i=0;i<9;i++){const x=62+i*98;r.strokeStyle=i===selected?colors[theme]:'#4a3a53';r.strokeRect(x,81,92,94);sprite(r,sheets.get(theme+'-'+items[i]),x+14,89,64);r.fillStyle='#b9adc3';r.font='13px monospace';r.fillText(String(i+1),x+6,98);}
  f.clearRect(0,0,64,64);sprite(f,sheets.get(theme+'-'+items[selected]),0,0,64);
  row.dataset.theme=theme;row.dataset.frame=String(Math.floor(phase));row.dataset.playing=String(play);row.dataset.visible=String(visible);row.dataset.ready=String(items.every(item=>sheets.has(theme+'-'+item)));focus.dataset.item=items[selected];
  const selectedSheet=sheets.get(theme+'-'+items[selected]),frames=selectedSheet?selectedSheet.height/64:192;
  by('flame-palette-label').textContent=theme.toUpperCase();by('flame-item-label').textContent=names[selected];by('flame-time').step='.5';by('flame-time').max='95.5';by('flame-time').value=String(phase);by('flame-time-label').value=(Math.floor(phase/96*frames)+1)+' / '+frames;
  by('flame-pause').textContent=play?'Pause flames':'Play flames';by('flame-pause').setAttribute('aria-pressed',String(!play));if(row.dataset.ready==='true')by('flame-status').textContent='Actual hotbar artwork • '+theme+' • original Minecraft silhouettes';
 }
 function tick(now){request=0;if(!visible||document.hidden)return;if(play){if(last)phase=(phase+(now-last)/50)%96;last=now;}paint();if(play)request=requestAnimationFrame(tick);}
 function schedule(){if(!request&&visible&&!document.hidden)request=requestAnimationFrame(tick);}
 for(const button of document.querySelectorAll('[data-flame-theme]'))button.addEventListener('click',()=>{theme=button.dataset.flameTheme;for(const other of document.querySelectorAll('[data-flame-theme]'))other.setAttribute('aria-pressed',String(other===button));load();paint();schedule();});
 by('flame-item').addEventListener('change',e=>{selected=items.indexOf(e.target.value);paint();});
 by('flame-pause').addEventListener('click',()=>{play=!play;last=0;paint();schedule();});by('flame-reset').addEventListener('click',()=>{phase=0;last=0;paint();});
 by('flame-time').addEventListener('input',e=>{play=false;phase=Number(e.target.value);last=0;paint();});
 row.addEventListener('click',e=>{const rect=row.getBoundingClientRect(),x=(e.clientX-rect.left)/rect.width*1000;const index=Math.floor((x-62)/98);if(index>=0&&index<9){selected=index;by('flame-item').value=items[index];paint();}});
 new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;last=0;if(visible){load();schedule();}else{cancelAnimationFrame(request);request=0;}},{rootMargin:'80px'}).observe(by('hotbar-flames'));
 document.addEventListener('visibilitychange',()=>{last=0;if(document.hidden){cancelAnimationFrame(request);request=0;}else schedule();});load();paint();
 new MutationObserver(()=>{play=document.documentElement.dataset.previewPlaying==='true';last=0;paint();schedule();}).observe(document.documentElement,{attributes:true,attributeFilter:['data-preview-playing']});
})();
