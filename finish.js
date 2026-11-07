/* The preview reads the game's cloud atlas and 960-pose binary timeline. */
(()=>{
  'use strict';
  const by=id=>document.getElementById(id),canvas=by('explosion-canvas'),view=new KewissExplosionView(canvas);
  const clamp=(v,a,b)=>Math.max(a,Math.min(b,v)),ease=t=>{t=clamp(t,0,1);return t*t*(3-2*t);};
  const mix=(a,b,t)=>{let c=0;for(let s=0;s<24;s+=8)c|=Math.round((a>>s&255)*(1-t)+(b>>s&255)*t)<<s;return c;};
  let data,loading,visible=false,request=0,run=false,time=.48,last=0,enabled=true,sound=false,loaded=false;
  let yaw=.34,pitch=.28,zoom=126,lookHeight=16,drag;
  const audio=new Audio('assets/shield_explosion.ogg');audio.preload='none';audio.volume=.65;
  let soundtrackStarted=false;
  const duration=()=>Number(by('blast-duration').value),rate=()=>Number(by('blast-speed').value);
  function stopSound(){audio.pause();audio.currentTime=0;soundtrackStarted=false;}
  function playSound(){stopSound();if(enabled&&sound){soundtrackStarted=true;audio.playbackRate=rate();audio.play().catch(()=>by('blast-status').textContent='Tap Replay to start the sound.');}}
  function image(url){return new Promise((resolve,reject)=>{const img=new Image();img.onload=()=>resolve(img);img.onerror=()=>reject(Error('Could not load '+url));img.src=url;});}
  async function load(){
    if(loading)return loading;
    loading=Promise.all([
      fetch('assets/explosion-scene.json').then(r=>{if(!r.ok)throw Error('Timeline unavailable');return r.json();}).then(async meta=>{
        const response=await fetch('assets/'+meta.timeline);if(!response.ok)throw Error('Timeline unavailable');const bytes=await response.arrayBuffer();
        if(bytes.byteLength!==meta.frames*meta.stride*4)throw Error('Incomplete timeline');return {...meta,timeline:new Float32Array(bytes)};
      }),image('assets/explosion-smoke.png')
    ]).then(([scene,atlas])=>{
      data=scene;view.setAtlas(atlas);loaded=true;by('blast-status').textContent='Ready. Replay, orbit, or explore a stage.';by('blast-loading').hidden=true;paint();
    }).catch(()=>{by('blast-status').textContent='The preview could not load. You can still view the in-game captures.';by('blast-loading').hidden=true;});return loading;
  }
  function camera(){
    const cy=Math.cos(yaw),sy=Math.sin(yaw),cp=Math.cos(pitch),sp=Math.sin(pitch);
    return {eye:[sy*zoom*cp,lookHeight+sp*zoom,cy*zoom*cp],right:[cy,0,-sy],up:[-sy*sp,cp,-cy*sp],forward:[-sy*cp,-sp,-cy*cp]};
  }
  function paint(){
    const lines=[],clouds=[],shards=[],cam=camera(),scale=Number(by('blast-size').value)/100;
    const line=(a,b,width,color,alpha=1,up=false)=>lines.push({a,b,width,color,alpha,up});
    for(let i=-80;i<=80;i+=8){line([i,0,-80],[i,0,80],.025,0x796477,.15);line([-80,0,i],[80,0,i],.025,0x796477,.15);}
    line([-.9,.02,0],[.9,.02,0],.035,0xE7B8C4,.6);line([0,.02,-.9],[0,.02,.9],.035,0xE7B8C4,.6);
    if(loaded&&enabled){
      const frame=time*(data.frames-1),a=Math.floor(frame),b=Math.min(a+1,data.frames-1),fraction=frame-a;
      const value=index=>data.timeline[a*data.stride+index]*(1-fraction)+data.timeline[b*data.stride+index]*fraction;
      for(let ring=0;ring<4;ring++){
        const radius=value(ring*2)*scale,alpha=value(ring*2+1);if(alpha<.003||radius<.2)continue;
        let previous=[radius,.13+ring*.05,0];
        for(let i=1;i<=160;i++){
          const angle=i*Math.PI*2/160,r=radius*(1+.002*Math.sin(angle*11+time*7)),point=[Math.cos(angle)*r,.13+ring*.05,Math.sin(angle)*r];
          for(const [width,color,strength]of [[.48,0x7b182b,.28],[.13,0xec3e4c,.8],[.032,0xffe0bc,.76]])line(previous,point,width*scale,color,alpha*strength,true);previous=point;
        }
      }
      const impact=ease(time/.008)*Math.exp(-time*65);
      const glow=ease(time/.012)*(1-ease((time-.12)/.26));
      if(glow>.003)for(let band=0;band<10;band++){const radius=(band+.5)*1.7*scale;let previous=[radius,.065,0];for(let i=1;i<=64;i++){const angle=i*Math.PI*2/64,point=[Math.cos(angle)*radius,.065,Math.sin(angle)*radius];line(previous,point,.86*scale,mix(0xffcc6b,0xc5262e,band/9),glow*.26*(1-band/10)**2,true);previous=point;}}
      if(impact>.005)for(let ray=0;ray<12;ray++){const angle=ray*Math.PI/6,length=(2.8+time*90)*(ray%3===0?1.35:1)*scale;line([0,1.1,0],[cam.right[0]*Math.cos(angle)*length,1.1+Math.sin(angle)*length,cam.right[2]*Math.cos(angle)*length],.11*scale,0xffd6bd,impact*.8);}
      const beam=value(8);
      if(beam>.003){
        for(const [width,color,alpha]of [[2.6,0x9c1736,.11],[.62,0xf33e56,.62],[.16,0xffe2c2,.9]])line([0,0,0],[0,42*scale,0],width*scale,color,beam*alpha);
        for(let strand=0;strand<5;strand++){
          let previous=[0,0,0];for(let segment=1;segment<=32;segment++){
            const h=segment*42/32,angle=h*.20+time*11+strand*Math.PI*2/5,radius=(.32+Math.sin(h*.10+time*4)*.18)*scale,point=[Math.cos(angle)*radius,h*scale,Math.sin(angle)*radius];
            line(previous,point,.035*scale,strand%2===0?0xffc2a2:0xef3352,beam*.48);previous=point;
          }
        }

      }
      const window=(t,start,end)=>ease((t-start)/.075)*(1-ease((t-end+.18)/.18)),cracks=window(time,.025,.42);
      if(cracks>0)for(let i=0;i<18;i++){
        const angle=i*2.399963,length=value(0)*(.65+.25*Math.sin(i*7));let previous=[0,.09,0];
        for(let j=1;j<=12;j++){const r=length*j/12,bend=Math.sin(j*1.7+i)*1.2,point=[(Math.cos(angle)*r-Math.sin(angle)*bend)*scale,.09,(Math.sin(angle)*r+Math.cos(angle)*bend)*scale];line(previous,point,.055*scale,0xcf284b,cracks*.65,true);previous=point;}
      }
      globalThis.kewissFantasyGeometry(time,scale,line);
      const random=(index,channel)=>.5+.5*Math.sin(index*78.233+channel*19.19+1.7);
      for(let i=0;i<160;i++){
        const born=.025+i%13*.004,age=(time-born)*6,life=1.7+random(i,7)*2.1,angle=i*2.399963,speed=12+random(i,2)*31,vertical=9+random(i,3)*28;
        const travel=speed*(1-Math.exp(-Math.max(0,age)*.52))/.52,y=2+vertical*age-8*age*age,previous=Math.max(0,age-.035),oldTravel=speed*(1-Math.exp(-previous*.52))/.52;
        if(age<=0||age>=life||y<0)continue;const alpha=ease(age/.10)*(1-ease((age-life+.5)/.5)),heat=Math.max(0,1-age/life);
        const point=[Math.cos(angle)*travel*scale,y*scale,Math.sin(angle)*travel*scale],tail=[Math.cos(angle)*oldTravel*scale,(2+vertical*previous-8*previous*previous)*scale,Math.sin(angle)*oldTravel*scale];
        line(tail,point,.028*scale,mix(0xa71d39,0xffdeaf,heat),alpha*.9);if(i%3===0)line(tail,point,.12*scale,0xd32743,alpha*.12);
      }
      for(let i=0;i<32;i++){
        const age=(time-.025-i%5*.007)*6,life=1.4+random(i,9)*1.5,angle=i*2.399963+.3,speed=8+random(i,11)*24,travel=speed*(1-Math.exp(-Math.max(0,age)*.5))/.5,y=1.2+(9+random(i,12)*21)*age-8.5*age*age;
        if(age<=0||age>=life||y<0)continue;const alpha=ease(age/.1)*(1-ease((age-life+.4)/.4)),heat=Math.max(0,1-age/life);
        shards.push({position:[Math.cos(angle)*travel*scale,y*scale,Math.sin(angle)*travel*scale],size:(.10+random(i,13)*.24)*scale,rotation:age*(2+random(i,14)*4)+angle,alpha, color:mix(0x241b23,0xd94444,heat*.65)});
      }
      for(let i=0;i<data.puffs;i++){
        const start=9+i*8,position=[value(start)*scale,value(start+1)*scale,value(start+2)*scale],distance=position.reduce((sum,n,k)=>sum+(n-cam.eye[k])**2,0);
        clouds.push({position,size:value(start+3)*scale,alpha:value(start+4),texture:value(start+5),rotation:value(start+6),aspect:value(start+7),distance});
      }
      clouds.sort((x,y)=>y.distance-x.distance);canvas.dataset.frame=String(Math.round(frame));canvas.dataset.ready='true';
    }
    view.render({camera:cam,lines,clouds,shards});
    by('blast-time').value=String(Math.round(time*1000));by('blast-time-value').value=`${(time*duration()).toFixed(2)} / ${duration().toFixed(2)}s`;
    const phase=time<.10?0:time<.31?1:time<.70?2:3;
    by('blast-stage').textContent=!enabled?'Effect off':time>.98?'Complete':['Impact','Shockwave','Rolling crown','Fading ash'][phase];
    document.querySelectorAll('[data-blast-phase]').forEach((button,i)=>button.setAttribute('aria-pressed',String(i===phase)));
    by('blast-frame').textContent=`${Math.round(time*(data?.frames-1||959))+1} / ${data?.frames||960}`;
  }
  function state(){by('blast-pause').textContent=run?'Pause':'Resume';by('blast-pause').setAttribute('aria-pressed',String(!run));}
  function tick(now){request=0;if(document.hidden||!visible)return;if(run&&enabled){if(last)time=Math.min(1,time+(now-last)/1000/duration()*rate());last=now;if(time>=1){run=false;state();by('blast-status').textContent='A little ash. Then quiet. Replay to go again.';}}paint();if(run)request=requestAnimationFrame(tick);}
  function schedule(){if(!request&&visible&&!document.hidden)request=requestAnimationFrame(tick);}
  by('blast-replay').addEventListener('click',async()=>{await load();if(!loaded||!enabled)return;time=0;last=0;run=true;playSound();state();by('blast-status').textContent='Shield destroyed · eruption at the victim';schedule();});
  by('blast-pause').addEventListener('click',()=>{if(!loaded||!enabled)return;if(time>=1)time=0;run=!run;last=0;if(!run)audio.pause();else if(sound&&soundtrackStarted&&!audio.ended)audio.play().catch(()=>{});state();schedule();});
  by('blast-time').addEventListener('input',e=>{run=false;stopSound();time=Number(e.target.value)/1000;state();paint();});
  by('blast-enabled').addEventListener('click',()=>{enabled=!enabled;by('blast-enabled').setAttribute('aria-checked',String(enabled));if(!enabled){run=false;stopSound();}by('blast-replay').disabled=!enabled;by('blast-pause').disabled=!enabled;state();paint();});
  by('blast-sound').addEventListener('click',()=>{sound=!sound;by('blast-sound').setAttribute('aria-checked',String(sound));if(!sound)stopSound();});
  by('blast-volume').addEventListener('input',e=>{audio.volume=Number(e.target.value)/100;by('blast-volume-value').value=e.target.value+'%';});
  by('blast-size').addEventListener('input',e=>{by('blast-size-value').value=e.target.value+' blocks';paint();});
  by('blast-duration').addEventListener('input',e=>{by('blast-duration-value').value=Number(e.target.value).toFixed(1)+' seconds';paint();});
  by('blast-speed').addEventListener('change',()=>{audio.playbackRate=rate();last=0;});
  by('blast-trigger').addEventListener('change',e=>{by('trigger-detail').textContent=e.target.value==='shield'?'Your mace must destroy the blocking shield at zero durability. The blast starts at that player.':`The same player must ${e.target.value==='totem'?'pop a totem':'die'} within 1.0 second of the shield breaking. The blast starts at the victim. Either event order can qualify.`;});
  function resetCamera(){yaw=.34;pitch=.28;zoom=126;lookHeight=16;document.querySelectorAll('[data-blast-camera]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.blastCamera==='orbit')));paint();}
  by('blast-camera').addEventListener('click',resetCamera);
  by('blast-zoom-in').addEventListener('click',()=>{zoom=clamp(zoom-12,82,240);paint();});by('blast-zoom-out').addEventListener('click',()=>{zoom=clamp(zoom+12,82,240);paint();});
  document.querySelectorAll('[data-blast-camera]').forEach(button=>button.addEventListener('click',()=>{resetCamera();const mode=button.dataset.blastCamera;if(mode==='ground'){yaw=0;pitch=-.20;zoom=105;lookHeight=22.5;}if(mode==='detail'){yaw=-.65;pitch=.29;zoom=90;lookHeight=22;}document.querySelectorAll('[data-blast-camera]').forEach(b=>b.setAttribute('aria-pressed',String(b===button)));paint();}));
  document.querySelectorAll('[data-blast-phase]').forEach(button=>button.addEventListener('click',async()=>{await load();if(!loaded)return;run=false;stopSound();time=Number(button.dataset.blastPhase);state();paint();}));
  by('blast-backdrop').addEventListener('click',()=>{const light=by('blast-backdrop').getAttribute('aria-pressed')!=='true';by('blast-backdrop').setAttribute('aria-pressed',String(light));by('finisher-view').dataset.backdrop=light?'daylight':'studio';});
  function expandedState(value){by('blast-expand').setAttribute('aria-pressed',String(value));by('blast-expand').setAttribute('aria-label',value?'Exit expanded explosion viewer':'Expand explosion viewer');}
  by('blast-expand').addEventListener('click',async()=>{if(by('finisher-view').classList.contains('expanded')){by('finisher-view').classList.remove('expanded');expandedState(false);return;}try{document.fullscreenElement?await document.exitFullscreen():await by('finisher-view').requestFullscreen();}catch{by('finisher-view').classList.add('expanded');expandedState(true);}});
  document.addEventListener('fullscreenchange',()=>expandedState(Boolean(document.fullscreenElement)));
  document.addEventListener('keydown',e=>{if(e.key==='Escape'&&by('finisher-view').classList.contains('expanded')){by('finisher-view').classList.remove('expanded');expandedState(false);}});
  canvas.addEventListener('pointerdown',e=>{if(e.button!==0)return;drag={x:e.clientX,y:e.clientY,yaw,pitch};canvas.setPointerCapture(e.pointerId);});
  canvas.addEventListener('pointermove',e=>{if(!drag)return;yaw=drag.yaw-(e.clientX-drag.x)*.008;pitch=clamp(drag.pitch+(e.clientY-drag.y)*.004,-.23,.85);paint();});
  canvas.addEventListener('pointerup',()=>drag=null);canvas.addEventListener('pointercancel',()=>drag=null);
  canvas.addEventListener('keydown',e=>{if(!['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','+','-','='].includes(e.key))return;e.preventDefault();if(e.key==='ArrowLeft')yaw-=.1;if(e.key==='ArrowRight')yaw+=.1;if(e.key==='ArrowUp')pitch=clamp(pitch+.05,-.23,.85);if(e.key==='ArrowDown')pitch=clamp(pitch-.05,-.23,.85);if(e.key==='+'||e.key==='=')zoom=clamp(zoom-12,82,240);if(e.key==='-')zoom=clamp(zoom+12,82,240);paint();});
  new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;if(visible){load();last=0;schedule();}else{cancelAnimationFrame(request);request=0;last=0;stopSound();}},{rootMargin:'120px'}).observe(by('finisher'));
  document.addEventListener('visibilitychange',()=>{last=0;if(document.hidden){stopSound();cancelAnimationFrame(request);request=0;}else schedule();});
  by('blast-capture').addEventListener('click',()=>showCapture('assets/explosion-crown.png','Actual Minecraft capture · 100-block crimson aftershock'));
  function showCapture(src,caption){const dialog=by('capture-dialog');dialog.querySelector('img').src=src;dialog.querySelector('img').alt=caption;dialog.querySelector('p').textContent=caption;dialog.showModal();}
  document.querySelectorAll('[data-game-capture]').forEach(button=>button.addEventListener('click',()=>showCapture(button.dataset.gameCapture,button.dataset.caption)));
  // All icons are packed from the actual 36px game assets; original icons come from Minecraft.
  const vitalCanvas=by('vital-canvas'),v=vitalCanvas.getContext('2d'),icons=new Map();let manifest,vitalVisible=false,vitalRequest=0,vitalEnabled=true,lastVitalTime=0;
  const parts={hearts:true,food:true,armor:true,air:true};
  function currentTheme(){return document.documentElement.dataset.theme||'kewiss';}
  async function loadVitals(){
    if(!manifest)manifest=await fetch('assets/vital-icons.json').then(r=>r.json());
    for(const name of [currentTheme(),'vanilla'])if(!icons.has(name)){icons.set(name,null);image('assets/vital-atlas-'+name+'.png').then(img=>{icons.set(name,img);scheduleVitals();});}
  }
  function paintVitals(now){
    vitalRequest=0;if(!vitalVisible||document.hidden)return;const name=currentTheme();if(!icons.has(name))loadVitals().catch(()=>{});
    const colors={kewiss:['#e93859','#ff9cac','#690f26'],fire:['#f47836','#ffd491','#8d241b'],eclipse:['#a166f2','#dfb9ff','#38205e'],drax:['#328fff','#b4f5ff','#163e83']},p=colors[name]||colors.kewiss;
    v.clearRect(0,0,960,360);v.imageSmoothingEnabled=false;v.fillStyle='#9b8ca4';v.font='10px monospace';
    function icon(key,x,y,part,size=27){const sheet=icons.get(vitalEnabled&&parts[part]?name:'vanilla'),index=manifest?.names.indexOf(key);if(!sheet||index<0)return;const sx=index%10*36,sy=Math.floor(index/10)*36;v.drawImage(sheet,sx,sy,36,36,x,y,size,size);}
    v.fillText('HEALTH + ABSORPTION',100,68);v.fillText('FOOD + SATURATION',566,68);
    for(let i=0;i<10;i++){
      const x=100+i*28;icon('heart/container',x,91,'hearts');if(i<8)icon('heart/full',x,91,'hearts');if(i===8)icon('heart/half',x,91,'hearts');
      const fx=566+(9-i)*28;icon('food_empty',fx,91,'food');if(i<8)icon('food_full',fx,91,'food');if(i===8)icon('food_half',fx,91,'food');
      const fill=clamp((Number(by('vital-saturation').value)-i*2)/2,0,1);v.fillStyle='#392334';v.fillRect(fx+2,121,23,2);v.fillStyle=p[1];v.fillRect(fx+2,121,Math.round(23*fill),2);
      icon(i<6?'armor_full':i===6?'armor_half':'armor_empty',x,171,'armor');icon(i<8?'air':i===8?'air_bursting':'air_empty',566+i*28,171,'air');
    }
    icon('heart/absorbing_full',100,125,'hearts');icon('heart/absorbing_full',128,125,'hearts');icon('heart/absorbing_half',156,125,'hearts');
    v.fillStyle='#9b8ca4';v.fillText('ARMOR',100,158);v.fillText('AIR',566,158);
    // Hotbar/offhand frame uses the same traveling highlight equation as SmoothHotbar.
    const hx=225,hy=264,slot=56;v.fillStyle='#0b0a10';v.fillRect(hx,hy,510,62);
    v.strokeStyle=p[2];v.lineWidth=2;for(let i=0;i<9;i++){v.strokeRect(hx+i*slot+3,hy+3,50,55);v.fillStyle='#62556c';v.font='9px monospace';v.fillText(String(i+1),hx+i*slot+8,hy+13);}
    const offX=139;v.fillStyle='#0b0a10';v.fillRect(offX,hy,64,62);v.strokeStyle=p[0];v.strokeRect(offX+2,hy+2,60,58);v.fillStyle=p[2];v.fillRect(hx+slot*3+3,hy+3,50,55);
    const animate=typeof playing!=='undefined'&&playing;if(animate)lastVitalTime=now;
    for(let i=0;i<55;i++){const glint=.3+.7*Math.pow(.5+.5*Math.sin(i/2.5*.19+lastVitalTime/1000*1.4),3);v.globalAlpha=glint;v.fillStyle=p[1];v.fillRect(offX+5+i,hy+2,1,2);v.fillRect(hx+slot*3+5+i*.87,hy+2,1,2);}v.globalAlpha=1;
    v.fillStyle=p[0];v.fillRect(offX+5,hy+58,54,2);v.fillRect(hx+slot*3+5,hy+58,46,2);
    v.fillStyle='#95829f';v.font='9px monospace';v.fillText('OFFHAND',145,345);v.fillText('ANIMATED FRAME STUDY',407,345);by('vital-theme-label').textContent=name.toUpperCase();
    vitalCanvas.dataset.ready=String(Boolean(manifest&&icons.get(name)&&icons.get('vanilla')));
    if(animate)vitalRequest=requestAnimationFrame(paintVitals);
  }
  function scheduleVitals(){if(!vitalRequest&&vitalVisible&&!document.hidden)vitalRequest=requestAnimationFrame(paintVitals);}
  new IntersectionObserver(entries=>{vitalVisible=entries[0].isIntersecting;if(vitalVisible){loadVitals().then(scheduleVitals).catch(()=>{});}else{cancelAnimationFrame(vitalRequest);vitalRequest=0;}},{rootMargin:'80px'}).observe(by('vitals'));
  new MutationObserver(scheduleVitals).observe(document.documentElement,{attributes:true,attributeFilter:['data-theme']});
  document.addEventListener('visibilitychange',scheduleVitals);
  by('vital-enabled').addEventListener('click',()=>{vitalEnabled=!vitalEnabled;by('vital-enabled').setAttribute('aria-checked',String(vitalEnabled));scheduleVitals();});
  document.querySelectorAll('[data-vital]').forEach(button=>button.addEventListener('click',()=>{const part=button.dataset.vital;parts[part]=!parts[part];button.setAttribute('aria-pressed',String(parts[part]));scheduleVitals();}));
  by('vital-saturation').addEventListener('input',e=>{by('vital-saturation-value').value=e.target.value+' / 20';scheduleVitals();});
  by('vital-capture').addEventListener('click',()=>showCapture('assets/vital-hud.png','Actual Minecraft capture · themed health, armor, food and animated offhand'));
  by('sweep-size').addEventListener('input',e=>{by('sweep-size-value').value=e.target.value+'%';if(typeof replay==='function')replay();});
  by('animation-toggle').addEventListener('click',()=>{if(!playing){run=false;stopSound();by('blast-pause').textContent='Resume';by('blast-pause').setAttribute('aria-pressed','true');}scheduleVitals();});
  const shared=new URLSearchParams(location.search);
  for(const [key,id,min,max]of [['sweepSize','sweep-size',50,150],['diameter','blast-size',48,144],['duration','blast-duration',4,8]]){
    if(!shared.has(key))continue;const value=Number(shared.get(key));if(Number.isFinite(value)){by(id).value=String(clamp(value,min,max));by(id).dispatchEvent(new Event('input'));}
  }
  if(['shield','totem','kill'].includes(shared.get('trigger'))){by('blast-trigger').value=shared.get('trigger');by('blast-trigger').dispatchEvent(new Event('change'));}
  for(const [key,id]of [['explosion','blast-enabled'],['vitals','vital-enabled']])if(shared.get(key)==='0')by(id).click();
})();
