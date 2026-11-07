/* Section-driven scenery. No perpetual render loop or scroll interception. */
(()=>{'use strict';
const sky=document.getElementById('journeySky');if(!sky)return;
const sections=[...document.querySelectorAll('[data-space-sector]')],routes=[...document.querySelectorAll('[data-route]')],prefers=matchMedia('(prefers-reduced-motion: reduce)'),hero=document.getElementById('hero');
let queued=0,active='',started=false;
const moving=()=>!prefers.matches&&!document.hidden&&!document.body.classList.contains('motion-off');
function update(){
 queued=0;if(document.hidden)return;
 const middle=innerHeight*.42;let current=sections[0];
 for(const section of sections){const rect=section.getBoundingClientRect();if(rect.top<=middle)current=section;else break;}
 if(!current)return;
 const rect=current.getBoundingClientRect(),sector=current.dataset.spaceSector;
 sky.dataset.sky=sector;sky.dataset.location=current.id;document.body.dataset.spaceSector=sector;
 document.body.dataset.spacePastHero=String(hero.getBoundingClientRect().bottom<innerHeight*.3);
 const shift=moving()?Math.max(-24,Math.min(24,(middle-rect.top)/Math.max(rect.height,1)*48-24)):0;
 sky.style.setProperty('--journey-shift',`${shift.toFixed(1)}px`);
 for(const section of sections){const detail=section.querySelector('.sector-detail');if(detail){const r=section.getBoundingClientRect();detail.style.setProperty('--object-shift',`${moving()?Math.max(-18,Math.min(18,(r.top-innerHeight*.4)*.025)):0}px`);}}
 let route=current.id;if(route.startsWith('vista-'))route=route==='vista-rings'?'textures':'inspect';
 if(!routes.some(link=>link.dataset.route===route)){const previous=sections.slice(0,sections.indexOf(current)+1).reverse().find(s=>routes.some(link=>link.dataset.route===s.id));route=previous?.id||'';}
 for(const link of routes){if(link.dataset.route===route)link.setAttribute('aria-current','location');else link.removeAttribute('aria-current');}
 active=current.id;started=true;
}
function request(){if(!queued&&!document.hidden)queued=requestAnimationFrame(update);}
for(const vista of document.querySelectorAll('.space-vista')){
 const image=vista.querySelector('.vista-image');
 for(const button of vista.querySelectorAll('[data-vista-view]'))button.addEventListener('click',()=>{
  image.style.setProperty('--vista-x',`${Number(button.dataset.x)}%`);image.style.setProperty('--vista-y',`${Number(button.dataset.y)}%`);image.style.setProperty('--vista-zoom',String(Number(button.dataset.zoom)));
  for(const option of vista.querySelectorAll('[data-vista-view]'))option.setAttribute('aria-pressed',String(option===button));
 });
}
const gallery=document.getElementById('spaceGallery'),galleryImage=document.getElementById('spaceGalleryImage'),title=document.getElementById('spaceGalleryTitle'),caption=document.getElementById('spaceGalleryCaption');
const artwork={rings:{file:'anime-space-rings.webp',title:'The ringed world',alt:'An anime-realistic painting of a luminous ringed blue planet, small moons, painted cloud bands and distant constellations.',caption:'Follow the fine rings, the quiet moons and the painted storm bands.',views:[['wide','Full view',50,50,1],['rings','The rings',38,66,1.55],['moons','Small moons',84,60,1.65],['storms','Storm bands',85,32,1.6]]},horizon:{file:'anime-space-horizon.webp',title:'The cloud sea',alt:'An anime-realistic painting of a moonlit cloud ocean, swirling star currents, a distant galaxy and two moons.',caption:'Drifting clouds below. A painted river of stars above.',views:[['wide','Full view',50,50,1],['galaxy','Distant galaxy',12,15,1.6],['clouds','Cloud currents',45,85,1.5],['planet','Blue horizon',93,10,1.5]]}};
let selected='rings',focus='wide',returnFocus=null;
const focusControls=document.getElementById('galleryFocus'),galleryFrame=gallery.querySelector('.space-gallery-frame');
function focusView(key){const view=artwork[selected].views.find(view=>view[0]===key);if(!view)return;focus=key;galleryFrame.style.setProperty('--gallery-x',view[2]+'%');galleryFrame.style.setProperty('--gallery-y',view[3]+'%');galleryFrame.style.setProperty('--gallery-zoom',String(view[4]));for(const button of focusControls.querySelectorAll('button'))button.setAttribute('aria-pressed',String(button.dataset.galleryFocus===key));}
function choose(key){if(!Object.hasOwn(artwork,key))return;selected=key;const scene=artwork[key];galleryImage.src='assets/'+scene.file;galleryImage.alt=scene.alt;title.textContent=scene.title;caption.textContent=scene.caption;for(const button of gallery.querySelectorAll('[data-gallery-scene]'))button.setAttribute('aria-pressed',String(button.dataset.galleryScene===key));focusControls.replaceChildren(...scene.views.map(view=>{const button=document.createElement('button');button.type='button';button.className='control';button.dataset.galleryFocus=view[0];button.textContent=view[1];button.addEventListener('click',()=>focusView(view[0]));return button;}));focusView('wide');}
function open(key){if(!Object.hasOwn(artwork,key))return;returnFocus=document.activeElement;choose(key);gallery.showModal();document.body.classList.add('space-gallery-open');gallery.querySelector('[data-space-close]').focus();}
function close(){gallery.close();}
gallery.addEventListener('close',()=>{document.body.classList.remove('space-gallery-open');if(returnFocus?.isConnected)returnFocus.focus();});
gallery.querySelector('[data-space-close]').addEventListener('click',close);
for(const button of document.querySelectorAll('[data-space-open]'))button.addEventListener('click',()=>open(button.dataset.spaceOpen));
for(const button of gallery.querySelectorAll('[data-gallery-scene]'))button.addEventListener('click',()=>choose(button.dataset.galleryScene));
gallery.addEventListener('keydown',event=>{if(event.key==='ArrowLeft'||event.key==='ArrowRight'){event.preventDefault();choose(selected==='rings'?'horizon':'rings');}event.stopPropagation();});
addEventListener('scroll',request,{passive:true});addEventListener('resize',request);
prefers.addEventListener('change',request);
document.addEventListener('visibilitychange',()=>{if(document.hidden){cancelAnimationFrame(queued);queued=0;}else request();});
new MutationObserver(request).observe(document.body,{attributes:true,attributeFilter:['class']});
// A gallery sits in the browser's top layer; keep the document behind it still.
document.body.classList.add('journey-ready');
update();
window.KewissJourney=Object.freeze({refresh:request,getState(){return{active,started,scene:sky.dataset.sky,motion:moving(),galleryOpen:gallery.open,selected,focus};}});
})();
