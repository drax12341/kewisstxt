(()=>{
  const links=[...document.querySelectorAll('.nav nav a[href^="#"]')];
  const sections=links.map(a=>document.querySelector(a.getAttribute('href'))).filter(Boolean).sort((a,b)=>a.compareDocumentPosition(b)&Node.DOCUMENT_POSITION_FOLLOWING?-1:1);
  let pending=false;
  function update(){pending=false;let current=sections[0];for(const section of sections)if(section.getBoundingClientRect().top<innerHeight*.36)current=section;for(const a of links){const active=a.getAttribute('href')==='#'+current?.id;a.classList.toggle('active',active);active?a.setAttribute('aria-current','location'):a.removeAttribute('aria-current');}}
  addEventListener('scroll',()=>{if(!pending){pending=true;requestAnimationFrame(update);}},{passive:true});update();
  const video=document.getElementById('native-sweep-video');if(video)new IntersectionObserver(entries=>{if(!entries[0].isIntersecting)video.pause();}).observe(video);
})();
