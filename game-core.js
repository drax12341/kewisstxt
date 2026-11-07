/* Small deterministic physics core shared by the game and its regression checks. */
(()=>{'use strict';class Flight{
 static MODES={calm:{speed:110,gravity:670,boost:-255,gap:90},standard:{speed:145,gravity:790,boost:-270,gap:72},hyper:{speed:205,gravity:890,boost:-285,gap:62}};
 constructor(random=Math.random,mode='standard'){this.random=random;this.configure(mode);}
 configure(mode){this.mode=Object.hasOwn(Flight.MODES,mode)?mode:'standard';this.rules={...Flight.MODES[this.mode]};this.reset();}
 reset(){this.y=195;this.vy=0;this.score=0;this.distance=0;this.running=false;this.over=false;this.paused=false;this.pipes=[this.pipe(1000),this.pipe(1330),this.pipe(1660)];}
 pipe(x){return{x,y:100+this.random()*120,scored:false};}
 flap(){if(this.over)this.reset();this.running=true;this.paused=false;this.vy=this.rules.boost;}
 step(dt){if(!this.running||this.paused||this.over)return;dt=Number.isFinite(dt)?Math.min(.04,Math.max(0,dt)):0;this.distance+=this.rules.speed*dt;this.vy+=this.rules.gravity*dt;this.y+=this.vy*dt;
 for(const p of this.pipes){p.x-=this.rules.speed*dt;if(!p.scored&&p.x+62<180){p.scored=true;this.score++;}if(p.x< -80)Object.assign(p,this.pipe(Math.max(...this.pipes.map(q=>q.x))+330));
 if(p.x<195&&p.x+62>165&&(this.y-13<p.y-this.rules.gap||this.y+13>p.y+this.rules.gap))this.over=true;}
 if(this.y<16||this.y>367)this.over=true;if(this.over)this.running=false;
 }
}globalThis.KewissFlight=Flight;})();
