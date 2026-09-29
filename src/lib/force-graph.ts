// Small, bounded force layout. No network, perpetual animation or third-party runtime.
// Motion model: the simulation cools (alpha) rather than halting on a frame budget; the camera and the
// reset glide are critically damped springs that keep their velocity when retargeted mid-flight; a
// reduced-motion preference jumps straight to each end state.
const svg=document.querySelector<SVGSVGElement>('#force-graph')!;
const camera=document.querySelector<SVGGElement>('#graph-camera')!;
const articles=JSON.parse(document.querySelector('#map-data')!.textContent!);
const domains=['Foundations','Machine','Storage','Graphics','Interaction','Method'];
const centers=[[220,140],[560,145],[820,330],[710,580],[365,600],[155,380]];
function initial(a:any){const group=articles.filter((b:any)=>b.section===a.section),i=group.findIndex((b:any)=>b.slug===a.slug),[cx,cy]=centers[domains.indexOf(a.section)],angle=i/group.length*Math.PI*2-.6;return {x:cx+Math.cos(angle)*95,y:cy+Math.sin(angle)*90,cx,cy};}
const nodes=articles.map((a:any)=>({...initial(a),slug:a.slug,vx:0,vy:0,hx:0,hy:0,sx:0,sy:0,el:svg.querySelector<SVGAElement>(`[data-force-node="${a.slug}"]`)!}));
const bySlug=new Map(nodes.map((n:any)=>[n.slug,n]));
const edges=Array.from(svg.querySelectorAll<SVGLineElement>('[data-edge-from]')).map(el=>({el,a:bySlug.get(el.dataset.edgeFrom!) as any,b:bySlug.get(el.dataset.edgeTo!) as any}));
const reduced=matchMedia('(prefers-reduced-motion: reduce)');
const STEP=1000/60,ALPHA_MIN=.004,ALPHA_DECAY=.035,DRAG_ALPHA=.45,CAMERA_W=14,GLIDE_W=9,MIN_S=Math.log(.55),MAX_S=Math.log(2.5);
let alpha=0,alphaTarget=0,gliding=false,frame=0,last=0,acc=0,active=!document.querySelector<HTMLElement>('#floating-graph')!.hidden,drag:any=null;
// Camera: log scale plus the graph point at the viewport centre, so zoom and pan share one straight path.
const cam={s:0,x:500,y:390},goal={s:0,x:500,y:390},cv={s:0,x:0,y:0};
// Exact step of a critically damped spring toward g.
function spring(x:number,v:number,g:number,w:number,dt:number){const d=x-g,e=Math.exp(-w*dt),c=v+w*d;return [g+(d+c*dt)*e,(v-w*c*dt)*e];}
function transform(){const k=Math.exp(cam.s);camera.setAttribute('transform',`translate(${(500-cam.x*k).toFixed(2)} ${(390-cam.y*k).toFixed(2)}) scale(${k.toFixed(4)})`);}
function draw(){for(const n of nodes)n.el.setAttribute('transform',`translate(${n.x.toFixed(2)} ${n.y.toFixed(2)})`);for(const e of edges){e.el.setAttribute('x1',e.a.x.toFixed(2));e.el.setAttribute('y1',e.a.y.toFixed(2));e.el.setAttribute('x2',e.b.x.toFixed(2));e.el.setAttribute('y2',e.b.y.toFixed(2));}}
function tick(){
 alpha+=(alphaTarget-alpha)*ALPHA_DECAY;
 for(let i=0;i<nodes.length;i++)for(let j=i+1;j<nodes.length;j++){
  const a=nodes[i],b=nodes[j],dx=b.x-a.x,dy=b.y-a.y,d=Math.max(1,Math.hypot(dx,dy));
  const force=(Math.min(4,1800/(d*d))+(d<145?(145-d)*.026:0))*alpha;
  a.vx-=dx/d*force;a.vy-=dy/d*force;b.vx+=dx/d*force;b.vy+=dy/d*force;
 }
 for(const {a,b} of edges){const dx=b.x-a.x,dy=b.y-a.y,d=Math.max(1,Math.hypot(dx,dy)),f=(d-175)*.0045*alpha;a.vx+=dx/d*f;a.vy+=dy/d*f;b.vx-=dx/d*f;b.vy-=dy/d*f;}
 for(const n of nodes){if(drag?.node===n){n.vx=n.vy=0;continue;}n.vx=(n.vx+(n.cx-n.x)*.003*alpha)*.82;n.vy=(n.vy+(n.cy-n.y)*.003*alpha)*.82;n.x=Math.max(85,Math.min(915,n.x+n.vx));n.y=Math.max(40,Math.min(700,n.y+n.vy));}
}
// The canonical layout is computed once, off screen, so every visit shows the same map.
function settle(){nodes.forEach((n:any,i:number)=>Object.assign(n,initial(articles[i]),{vx:0,vy:0}));alpha=alphaTarget=1;for(let i=0;i<240;i++)tick();alphaTarget=0;while(alpha>=ALPHA_MIN)tick();for(const n of nodes){n.hx=n.x;n.hy=n.y;n.vx=n.vy=0;}alpha=0;}
function running(){return gliding||alpha>=ALPHA_MIN||alphaTarget>0;}
function stepCamera(dt:number){let moving=false;for(const key of ['s','x','y'] as const){const [x,v]=spring(cam[key],cv[key],goal[key],CAMERA_W,dt),eps=key==='s'?1e-4:.02;if(Math.abs(x-goal[key])<eps&&Math.abs(v)<eps*10){cam[key]=goal[key];cv[key]=0;}else{cam[key]=x;cv[key]=v;moving=true;}}transform();return moving;}
function stepGlide(dt:number){let moving=false;for(const n of nodes){if(drag?.node===n)continue;const [x,vx]=spring(n.x,n.sx,n.hx,GLIDE_W,dt),[y,vy]=spring(n.y,n.sy,n.hy,GLIDE_W,dt);if(Math.hypot(x-n.hx,y-n.hy)<.05&&Math.hypot(vx,vy)<.5){n.x=n.hx;n.y=n.hy;n.sx=n.sy=0;}else{n.x=x;n.y=y;n.sx=vx;n.sy=vy;moving=true;}}gliding=moving;}
function loop(now:number){
 frame=0;const dt=Math.min(64,now-last);last=now;let moved=false;
 if(gliding){stepGlide(dt/1000);moved=true;}
 else if(alpha>=ALPHA_MIN||alphaTarget>0){acc=Math.min(acc+dt,STEP*4);while(acc>=STEP){tick();acc-=STEP;}moved=true;}
 const cameraMoving=cam.s!==goal.s||cam.x!==goal.x||cam.y!==goal.y||cv.s!==0||cv.x!==0||cv.y!==0?stepCamera(dt/1000):false;
 if(moved)draw();
 if(running()||cameraMoving)frame=requestAnimationFrame(loop);
}
function schedule(){if(!frame&&active&&!document.hidden){last=performance.now();acc=0;frame=requestAnimationFrame(loop);}}
// Jump every motion to its end state: reduced motion, or the graph leaving the screen.
function finish(){cancelAnimationFrame(frame);frame=0;if(gliding)for(const n of nodes){n.x=n.hx;n.y=n.hy;n.sx=n.sy=0;}gliding=false;alphaTarget=0;while(alpha>=ALPHA_MIN)tick();alpha=0;for(const n of nodes)n.vx=n.vy=0;Object.assign(cam,goal);cv.s=cv.x=cv.y=0;transform();draw();}
function setView(s:number,x:number,y:number,animate=true){goal.s=Math.max(MIN_S,Math.min(MAX_S,s));goal.x=x;goal.y=y;if(animate&&active&&!reduced.matches){schedule();return;}Object.assign(cam,goal);cv.s=cv.x=cv.y=0;transform();}
function hold(){Object.assign(goal,cam);cv.s=cv.x=cv.y=0;}
// Visible area in viewBox units; the SVG letterboxes when its min-height exceeds the 1000×780 aspect.
function viewport(){const r=svg.getBoundingClientRect();if(!r.width||!r.height)return {w:1000,h:780};const u=Math.max(1000/r.width,780/r.height);return {w:r.width*u,h:r.height*u};}
function place(n:any){return gliding?{x:n.hx,y:n.hy}:n;}
function bounds(list:any[]){const p=list.map(place);return {x0:Math.min(...p.map(n=>n.x))-85,x1:Math.max(...p.map(n=>n.x))+85,y0:Math.min(...p.map(n=>n.y))-40,y1:Math.max(...p.map(n=>n.y))+65};}
function frameBox({x0,x1,y0,y1}:any,animate=true){const v=viewport();setView(Math.log(Math.min(v.w/(x1-x0),v.h/(y1-y0))),(x0+x1)/2,(y0+y1)/2,animate);}
// Bring nodes into view with the least camera travel: pan if they fit at this zoom, otherwise zoom out.
function reveal(list:any[],animate=true){
 if(!list.length)return;const b=bounds(list),v=viewport(),k=Math.exp(goal.s),hw=v.w/2/k,hh=v.h/2/k;
 if(b.x1-b.x0>2*hw||b.y1-b.y0>2*hh){frameBox(b,animate);return;}
 const x=Math.max(b.x1-hw,Math.min(goal.x,b.x0+hw)),y=Math.max(b.y1-hh,Math.min(goal.y,b.y0+hh));
 if(x!==goal.x||y!==goal.y)setView(goal.s,x,y,animate);
}
function selection(){return nodes.filter((n:any)=>n.el.classList.contains('selected')||n.el.classList.contains('connected'));}
function reset(animate=true){
 const k=matchMedia('(max-width:600px)').matches?2.2:1;alpha=alphaTarget=0;setView(Math.log(k),500,390,animate);
 if(reduced.matches||!active){for(const n of nodes){n.x=n.hx;n.y=n.hy;n.vx=n.vy=n.sx=n.sy=0;}gliding=false;draw();}
 else{for(const n of nodes){n.vx=n.vy=n.sx=n.sy=0;}gliding=true;schedule();}
}
function point(e:PointerEvent|WheelEvent){const p=new DOMPoint(e.clientX,e.clientY);return p.matrixTransform(svg.getScreenCTM()!.inverse());}
function toGraph(p:{x:number,y:number}){const k=Math.exp(cam.s);return {x:cam.x+(p.x-500)/k,y:cam.y+(p.y-390)/k};}
// Zoom about a viewBox point, keeping the graph point beneath it fixed. Buttons compound on the target.
function zoomAt(factor:number,p={x:500,y:390},animate=true){const base=animate?goal:cam,k0=Math.exp(base.s),s=Math.max(MIN_S,Math.min(MAX_S,base.s+Math.log(factor))),k=Math.exp(s),gx=base.x+(p.x-500)/k0,gy=base.y+(p.y-390)/k0;setView(s,gx-(p.x-500)/k,gy-(p.y-390)/k,animate);}
// Pointer velocity over the last ~80 ms, in graph units per second.
function velocity(samples:any[],releasedAt:number){
 const end=samples[samples.length-1];
 if(releasedAt-end.t>=80)return {x:0,y:0};
 const first=samples.find(s=>releasedAt-s.t<=80)||end,dt=(releasedAt-first.t)/1000;
 return dt>0?{x:(end.x-first.x)/dt,y:(end.y-first.y)/dt}:{x:0,y:0};
}
svg.addEventListener('pointerdown',e=>{
 if(e.button!==0||e.ctrlKey||e.metaKey||e.shiftKey||e.altKey)return;
 const link=(e.target as Element).closest<SVGAElement>('[data-force-node]'),node=link?bySlug.get(link.dataset.forceNode!) as any:null,p=point(e),g=toGraph(p);
 hold();if(node&&gliding){gliding=false;for(const n of nodes)n.sx=n.sy=0;}
 drag={node,link,start:p,cx:cam.x,cy:cam.y,ox:node?node.x-g.x:0,oy:node?node.y-g.y:0,moved:false,samples:[{t:e.timeStamp,x:node?node.x:cam.x,y:node?node.y:cam.y}]};
 svg.setPointerCapture(e.pointerId);svg.classList.add('dragging');link?.classList.add('grabbed');
});
svg.addEventListener('pointermove',e=>{
 if(!drag)return;const p=point(e),g=toGraph(p);
 if(!drag.moved&&Math.hypot(p.x-drag.start.x,p.y-drag.start.y)>4){drag.moved=true;if(drag.node&&!reduced.matches){alphaTarget=DRAG_ALPHA;schedule();}}
 if(!drag.moved)return;
 if(drag.node){drag.node.x=Math.max(30,Math.min(970,g.x+drag.ox));drag.node.y=Math.max(20,Math.min(740,g.y+drag.oy));drag.samples.push({t:e.timeStamp,x:drag.node.x,y:drag.node.y});if(drag.samples.length>12)drag.samples.shift();draw();}
 else{const k=Math.exp(cam.s);cam.x=drag.cx-(p.x-drag.start.x)/k;cam.y=drag.cy-(p.y-drag.start.y)/k;drag.samples.push({t:e.timeStamp,x:cam.x,y:cam.y});if(drag.samples.length>12)drag.samples.shift();hold();transform();}
});
function release(e:PointerEvent){
 if(!drag)return;const previous=drag;drag=null;svg.classList.remove('dragging');previous.link?.classList.remove('grabbed');if(svg.hasPointerCapture(e.pointerId))svg.releasePointerCapture(e.pointerId);
 const fling=previous.moved&&e.type!=='pointercancel'&&!reduced.matches?velocity(previous.samples,e.timeStamp):null;
 // A released node keeps its momentum and the layout cools around it.
 if(previous.node&&previous.moved&&!reduced.matches){alphaTarget=0;alpha=Math.max(alpha,.3);if(fling){const v=Math.hypot(fling.x,fling.y)*STEP/1000,m=v>18?18/v:1;previous.node.vx=fling.x*STEP/1000*m;previous.node.vy=fling.y*STEP/1000*m;}schedule();}
 // A released pan coasts to rest on the camera spring.
 else if(!previous.node&&fling){const k=Math.exp(cam.s),limit=900/k,v=Math.hypot(fling.x,fling.y),m=v>limit?limit/v:1;cv.x=fling.x*m;cv.y=fling.y*m;goal.x=cam.x+cv.x/CAMERA_W;goal.y=cam.y+cv.y/CAMERA_W;schedule();}
 if(previous.link){if(previous.moved){previous.link.dataset.dragged='true';setTimeout(()=>delete previous.link.dataset.dragged,0);}else if(e.type!=='pointercancel'){previous.link.dispatchEvent(new MouseEvent('click',{bubbles:true,cancelable:true}));}}
}
svg.addEventListener('pointerup',release);svg.addEventListener('pointercancel',release);
svg.addEventListener('wheel',e=>{if(!e.ctrlKey&&!e.metaKey)return;e.preventDefault();hold();zoomAt(Math.exp(-e.deltaY*.003),point(e),false);},{passive:false});
// Keyboard focus must never land on a node outside the visible canvas.
svg.addEventListener('focusin',e=>{const link=(e.target as Element).closest?.('[data-force-node]') as SVGAElement|null;if(link&&!drag&&link.matches(':focus-visible'))reveal([bySlug.get(link.dataset.forceNode!)]);});
document.querySelector('#graph-in')!.addEventListener('click',()=>zoomAt(1.2));document.querySelector('#graph-out')!.addEventListener('click',()=>zoomAt(1/1.2));document.querySelector('#graph-fit')!.addEventListener('click',()=>frameBox(bounds(nodes)));
document.addEventListener('atlas-graph-reset',()=>reset());
document.addEventListener('atlas-graph-focus',()=>{if(active)reveal(selection());});
document.addEventListener('atlas-graph-view',((e:CustomEvent)=>{active=e.detail==='graph';if(active){reveal(selection(),false);schedule();}else finish();}) as EventListener);
document.addEventListener('visibilitychange',()=>{if(!document.hidden)schedule();});
reduced.addEventListener('change',()=>{if(reduced.matches)finish();});
settle();
// Entrance: each domain unfolds from its centre into the canonical layout.
for(const n of nodes){n.x=n.cx+(n.hx-n.cx)*.55;n.y=n.cy+(n.hy-n.cy)*.55;}
reset(false);reveal(selection(),false);
