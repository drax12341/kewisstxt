/* Pixel sampling stays off the input/render thread. One job is accepted at a time. */
importScripts('anime-dynamics.js');
let renderer=null;
self.onmessage=async event=>{
 const message=event.data;
 try{
  if(message.type==='init'){
   renderer=new KewissAnimeDynamics.Renderer(message.options);
   if(!await renderer.loaded)throw new Error('Artwork could not be loaded');
   self.postMessage({type:'ready',state:renderer.getState()});return;
  }
  if(message.type!=='render'||!renderer?.ready)return;
  const frames=[];
  for(const kind of message.kinds){const canvas=renderer.render(kind,message.time,message.options);if(!canvas)continue;const bitmap=await createImageBitmap(canvas);frames.push({kind,key:renderer.frames.get(kind).key,bitmap});}
  self.postMessage({type:'frames',frames,state:renderer.getState()},frames.map(frame=>frame.bitmap));
 }catch(error){self.postMessage({type:'error',message:String(error?.message||error)});}
};
