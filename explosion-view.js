/* Shared game artwork, rendered with continuous cloud-frame blending. Canvas is the compatibility path. */
(()=>{
  'use strict';
  const add=(a,b)=>a.map((v,i)=>v+b[i]),mul=(a,n)=>a.map(v=>v*n),sub=(a,b)=>add(a,mul(b,-1));
  const cross=(a,b)=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]];
  const unit=a=>mul(a,1/(Math.hypot(...a)||1)),dot=(a,b)=>a.reduce((s,v,i)=>s+v*b[i],0);
  const rgba=(color,alpha)=>{if(typeof color==='string')color=parseInt(color.replace('#',''),16);return [(color>>16&255)/255,(color>>8&255)/255,(color&255)/255,alpha];};
  const vertex=`#version 300 es
    precision highp float;
    layout(location=0) in vec3 position;
    layout(location=1) in vec4 value;
    uniform vec3 eye, cameraRight, cameraUp, cameraForward;
    uniform vec2 focal;
    out vec4 payload;
    void main(){vec3 p=position-eye;float z=dot(p,cameraForward);gl_Position=vec4(dot(p,cameraRight)*focal.x,dot(p,cameraUp)*focal.y,1.0004*z-0.20004,z);payload=value;}`;
  const colorFragment=`#version 300 es
    precision highp float;in vec4 payload;out vec4 result;void main(){result=payload;}`;
  const cloudFragment=`#version 300 es
    precision highp float;
    uniform sampler2D cloudAtlas;
    in vec4 payload;out vec4 result;
    void main(){
      vec2 uv=payload.xy,grid=vec2(textureSize(cloudAtlas,0))/192.0,cell=floor(uv*grid);
      vec2 nextUv=uv+(cell.x<15.0?vec2(1.0/grid.x,0.0):vec2(-(grid.x-1.0)/grid.x,1.0/grid.y));
      if(cell.x>=15.0&&(cell.y==15.0||cell.y>=grid.y-1.0))nextUv=uv;
      vec4 a=texture(cloudAtlas,uv),b=texture(cloudAtlas,nextUv);
      float alpha=mix(a.a,b.a,payload.z);
      if(alpha*payload.w<.003)discard;
      vec3 rgb=mix(a.rgb*a.a,b.rgb*b.a,payload.z)/max(alpha,.0001);
      result=vec4(rgb,alpha*payload.w);
    }`;
  class ExplosionView {
    constructor(canvas){
      this.canvas=canvas;this.ctx=canvas.getContext('2d');this.cache=new Map();this.surface=document.createElement('canvas');this.surface.width=canvas.width;this.surface.height=canvas.height;
      try{
        const gl=this.surface.getContext('webgl2',{alpha:true,antialias:true,preserveDrawingBuffer:true,premultipliedAlpha:true});
        if(!gl)throw Error('No WebGL2 context');this.gl=gl;
        this.color=this.program(vertex,colorFragment);this.cloud=this.program(vertex,cloudFragment);
        this.buffer=gl.createBuffer();this.vao=gl.createVertexArray();gl.bindVertexArray(this.vao);gl.bindBuffer(gl.ARRAY_BUFFER,this.buffer);
        gl.enableVertexAttribArray(0);gl.vertexAttribPointer(0,3,gl.FLOAT,false,28,0);gl.enableVertexAttribArray(1);gl.vertexAttribPointer(1,4,gl.FLOAT,false,28,12);
        gl.enable(gl.BLEND);gl.blendFuncSeparate(gl.SRC_ALPHA,gl.ONE_MINUS_SRC_ALPHA,gl.ONE,gl.ONE_MINUS_SRC_ALPHA);gl.enable(gl.DEPTH_TEST);gl.depthFunc(gl.LEQUAL);gl.disable(gl.CULL_FACE);
        this.canvas.dataset.renderer='webgl2';
        this.surface.addEventListener('webglcontextlost',e=>{e.preventDefault();this.gl=null;this.canvas.dataset.renderer='canvas';});
      }catch(error){this.gl=null;this.canvas.dataset.renderer='canvas';this.canvas.dataset.renderFailure=error.message;}
    }
    program(vs,fs){
      const gl=this.gl,program=gl.createProgram();
      for(const [type,source]of [[gl.VERTEX_SHADER,vs],[gl.FRAGMENT_SHADER,fs]]){
        const shader=gl.createShader(type);gl.shaderSource(shader,source);gl.compileShader(shader);if(!gl.getShaderParameter(shader,gl.COMPILE_STATUS))throw Error(gl.getShaderInfoLog(shader));gl.attachShader(program,shader);gl.deleteShader(shader);
      }
      gl.linkProgram(program);if(!gl.getProgramParameter(program,gl.LINK_STATUS))throw Error(gl.getProgramInfoLog(program));
      const uniforms={};for(const key of ['eye','cameraRight','cameraUp','cameraForward','focal','cloudAtlas'])uniforms[key]=gl.getUniformLocation(program,key);return {program,uniforms};
    }
    setAtlas(image){
      this.atlas=image;this.cache.clear();if(!this.gl)return;
      const gl=this.gl;this.texture=gl.createTexture();gl.bindTexture(gl.TEXTURE_2D,this.texture);gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL,false);gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL,false);
      gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,image);
      for(const param of [gl.TEXTURE_MIN_FILTER,gl.TEXTURE_MAG_FILTER])gl.texParameteri(gl.TEXTURE_2D,param,gl.LINEAR);
      for(const param of [gl.TEXTURE_WRAP_S,gl.TEXTURE_WRAP_T])gl.texParameteri(gl.TEXTURE_2D,param,gl.CLAMP_TO_EDGE);
    }
    render(scene){
      const ctx=this.ctx;ctx.clearRect(0,0,this.canvas.width,this.canvas.height);
      this.gl?this.gpu(scene):this.compatible(scene);
      ctx.globalAlpha=1;ctx.fillStyle='#9a8191';ctx.font='10px monospace';ctx.fillText('SHIELD BREAK / VICTIM-CENTERED',24,this.canvas.height-22);
    }
    gpu(scene){
      const gl=this.gl,camera=scene.camera,colors=[],clouds=[];
      const quad=(list,points,values)=>{for(const index of [0,1,2,0,2,3])list.push(...points[index],...values[index]);};
      const view=unit(mul(camera.eye,-1));
      for(const line of scene.lines){
        if(line.alpha<.002)continue;let side=cross(sub(line.b,line.a),line.up?[0,1,0]:view);if(Math.hypot(...side)<1e-8)side=[1,0,0];side=mul(unit(side),line.width);
        const color=rgba(line.color,line.alpha);quad(colors,[add(line.a,side),add(line.b,side),sub(line.b,side),sub(line.a,side)],[color,color,color,color]);
      }
      const right=camera.right,up=unit(cross(right,view));
      for(const shard of scene.shards){
        const r=mul(add(mul(right,Math.cos(shard.rotation)),mul(up,Math.sin(shard.rotation))),shard.size),u=mul(sub(mul(up,Math.cos(shard.rotation)),mul(right,Math.sin(shard.rotation))),shard.size*.55),color=rgba(shard.color,shard.alpha);
        quad(colors,[sub(shard.position,r),add(shard.position,u),add(shard.position,r),sub(shard.position,u)],[color,color,color,color]);
      }
      for(const cloud of scene.clouds){
        if(cloud.alpha<.003)continue;
        const r=mul(add(mul(right,Math.cos(cloud.rotation)),mul(up,Math.sin(cloud.rotation))),cloud.size*.5),u=mul(sub(mul(up,Math.cos(cloud.rotation)),mul(right,Math.sin(cloud.rotation))),cloud.size*cloud.aspect*.5);
        const f=Math.min(383,Math.floor(cloud.texture)),w=cloud.texture-f,padding=.5/this.atlas.width,paddingY=.5/this.atlas.height,rows=this.atlas.height/(this.atlas.width/16);
        const u0=f%16/16+padding,u1=(f%16+1)/16-padding,v0=Math.floor(f/16)/rows+paddingY,v1=(Math.floor(f/16)+1)/rows-paddingY;
        quad(clouds,[add(sub(cloud.position,r),u),sub(sub(cloud.position,r),u),sub(add(cloud.position,r),u),add(add(cloud.position,r),u)],[[u0,v0,w,cloud.alpha],[u0,v1,w,cloud.alpha],[u1,v1,w,cloud.alpha],[u1,v0,w,cloud.alpha]]);
      }
      gl.viewport(0,0,this.canvas.width,this.canvas.height);gl.clearColor(0,0,0,0);gl.depthMask(true);gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);gl.bindVertexArray(this.vao);gl.bindBuffer(gl.ARRAY_BUFFER,this.buffer);
      const draw=(program,values)=>{
        if(!values.length)return;gl.useProgram(program.program);const u=program.uniforms;
        gl.uniform3fv(u.eye,camera.eye);gl.uniform3fv(u.cameraRight,camera.right);gl.uniform3fv(u.cameraUp,camera.up);gl.uniform3fv(u.cameraForward,camera.forward);gl.uniform2f(u.focal,1800/this.canvas.width,1800/this.canvas.height);
        gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(values),gl.DYNAMIC_DRAW);gl.drawArrays(gl.TRIANGLES,0,values.length/7);
      };
      // Translucent glow must not write an opaque depth silhouette into the smoke.
      gl.depthMask(false);gl.activeTexture(gl.TEXTURE0);gl.bindTexture(gl.TEXTURE_2D,this.texture);gl.useProgram(this.cloud.program);gl.uniform1i(this.cloud.uniforms.cloudAtlas,0);draw(this.cloud,clouds);draw(this.color,colors);gl.depthMask(true);
      this.ctx.drawImage(this.surface,0,0);
    }
    tile(texture){
      const frame=Math.min(383,Math.floor(texture)),fraction=Math.round((texture-frame)*16)/16,key=frame*17+Math.round(fraction*16);
      if(this.cache.has(key))return this.cache.get(key);
      const canvas=document.createElement('canvas');const tileSize=this.atlas.width/16;canvas.width=canvas.height=tileSize;const c=canvas.getContext('2d');
      c.globalAlpha=1-fraction;c.drawImage(this.atlas,frame%16*tileSize,Math.floor(frame/16)*tileSize,tileSize,tileSize,0,0,tileSize,tileSize);
      if(fraction){const next=Math.min(frame<256?255:383,frame+1);c.globalCompositeOperation='lighter';c.globalAlpha=fraction;c.drawImage(this.atlas,next%16*tileSize,Math.floor(next/16)*tileSize,tileSize,tileSize,0,0,tileSize,tileSize);}
      this.cache.set(key,canvas);if(this.cache.size>384){const old=this.cache.keys().next().value;this.cache.get(old).width=0;this.cache.delete(old);}return canvas;
    }
    compatible(scene){
      const c=this.ctx,camera=scene.camera;
      const project=position=>{const p=sub(position,camera.eye),depth=dot(p,camera.forward);return {x:500+dot(p,camera.right)*900/depth,y:325-dot(p,camera.up)*900/depth,depth,scale:900/depth};};
      for(const line of scene.lines){const a=project(line.a),b=project(line.b);if(a.depth<.1||b.depth<.1)continue;c.beginPath();c.moveTo(a.x,a.y);c.lineTo(b.x,b.y);c.lineWidth=Math.max(.4,line.width*(a.scale+b.scale));c.strokeStyle=typeof line.color==='string'?line.color:'#'+line.color.toString(16).padStart(6,'0');c.globalAlpha=line.alpha;c.stroke();}
      for(const shard of scene.shards){const p=project(shard.position);if(p.depth<.1)continue;c.save();c.translate(p.x,p.y);c.rotate(-shard.rotation);c.globalAlpha=shard.alpha;c.fillStyle='#a33b42';c.fillRect(-shard.size*p.scale,-shard.size*p.scale*.55,shard.size*p.scale*2,shard.size*p.scale*1.1);c.restore();}
      for(const cloud of scene.clouds){const p=project(cloud.position);if(p.depth<.1||cloud.alpha<.003)continue;const size=cloud.size*p.scale;c.save();c.globalAlpha=cloud.alpha;c.translate(p.x,p.y);c.rotate(-cloud.rotation);c.imageSmoothingEnabled=true;c.drawImage(this.tile(cloud.texture),-size/2,-size*cloud.aspect/2,size,size*cloud.aspect);c.restore();}
    }
  }
  window.KewissExplosionView=ExplosionView;
})();
