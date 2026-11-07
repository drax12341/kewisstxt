/* Keep only the newest scene request; never queue a backlog of animation frames. */
(()=>{'use strict';
class ArtRenderer{
 constructor(options={}){
  this.options=options;this.compact=innerWidth<640;this.ready=false;this.frames=new Map();this.busy=false;this.queued=false;this.wanted=null;this.kinds=new Set();this.backend='starting';this.state={};this.disposed=false;
  this.loaded=new Promise(resolve=>{this.settle=resolve;});
  if(typeof Worker!=='undefined'&&typeof OffscreenCanvas!=='undefined'&&typeof createImageBitmap==='function'){
   try{
    this.worker=new Worker('anime-art-worker.js');
    this.timer=setTimeout(()=>this.fallback(),5000);
    this.worker.onmessage=event=>this.receive(event.data);
    this.worker.onerror=()=>this.fallback();
    this.worker.postMessage({type:'init',options:{...options,compact:this.compact}});
   }catch{this.fallback();}
  }else this.fallback();
 }
 fallback(){
  if(this.disposed||this.delegate)return;
  clearTimeout(this.timer);this.worker?.terminate();this.worker=null;this.busy=false;
  for(const frame of this.frames.values())frame.bitmap?.close();
  this.delegate=new KewissAnimeDynamics.Renderer({...this.options,compact:true,resolution:.85});
  this.ready=false;this.backend='main-thread-compact';this.frames=this.delegate.frames;
  this.delegate.loaded.then(ready=>{if(this.disposed)return;this.ready=ready;this.settle(ready);this.onframe?.();});
 }
 receive(message){
  if(this.disposed||this.delegate){for(const frame of message.frames||[])frame.bitmap?.close();return;}
  if(message.type==='error'){this.fallback();return;}
  if(message.type==='ready'){clearTimeout(this.timer);this.ready=true;this.backend='worker';this.state=message.state;this.settle(true);return;}
  if(message.type!=='frames')return;
  this.busy=false;this.state=message.state;
  for(const frame of message.frames){this.frames.get(frame.kind)?.bitmap?.close();this.frames.set(frame.kind,{key:frame.key,bitmap:frame.bitmap});}
  this.onframe?.();this.schedule();
 }
 render(kind,time,options={}){
  if(this.delegate)return this.delegate.render(kind,time,options);
  if(!this.ready||this.disposed)return null;
  this.kinds.add(kind);this.wanted={time,options};this.schedule();
  return this.frames.get(kind)?.bitmap||null;
 }
 schedule(){
  if(this.delegate||this.disposed||this.queued||this.busy||!this.wanted||!this.worker)return;
  this.queued=true;
  queueMicrotask(()=>{
   this.queued=false;if(this.disposed||this.busy||!this.worker||!this.wanted)return;
   const {time,options}=this.wanted,fps=this.compact?12:15;
   const kinds=[...this.kinds].filter(kind=>{const key=[Math.floor((options.frameClock??time)*fps),options.weather||'aurora',options.speed||1,kind==='clouds'&&options.aurora>0?1:0].join(':');return this.frames.get(kind)?.key!==key;});
   if(!kinds.length)return;
   this.busy=true;this.worker.postMessage({type:'render',kinds,time,options});
  });
 }
 getState(){const state=this.delegate?.getState()||this.state;return{...state,ready:this.ready,backend:this.backend,cachedFrames:this.frames.size,inFlight:this.busy,pendingJobs:this.busy?1:0};}
 dispose(){this.disposed=true;clearTimeout(this.timer);this.worker?.terminate();for(const frame of this.frames.values())frame.bitmap?.close();this.frames.clear();}
}
window.KewissArtRenderer=ArtRenderer;
})();
