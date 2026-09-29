// Small, bounded force layout. No network, perpetual animation or third-party runtime.
const svg=document.querySelector<SVGSVGElement>('#force-graph')!;
const camera=document.querySelector<SVGGElement>('#graph-camera')!;
const articles=JSON.parse(document.querySelector('#map-data')!.textContent!);
const domains=['Foundations','Machine','Storage','Graphics','Interaction','Method'];
const centers=[[220,140],[560,145],[820,330],[710,580],[365,600],[155,380]];
function initial(a:any){const group=articles.filter((b:any)=>b.section===a.section),i=group.findIndex((b:any)=>b.slug===a.slug),[cx,cy]=centers[domains.indexOf(a.section)],angle=i/group.length*Math.PI*2-.6;return {x:cx+Math.cos(angle)*95,y:cy+Math.sin(angle)*90,cx,cy};}
const nodes=articles.map((a:any)=>({...initial(a),slug:a.slug,vx:0,vy:0,el:svg.querySelector<SVGAElement>(`[data-force-node="${a.slug}"]`)!}));
const bySlug=new Map(nodes.map((n:any)=>[n.slug,n]));
const edges=Array.from(svg.querySelectorAll<SVGLineElement>('[data-edge-from]')).map(el=>({el,a:bySlug.get(el.dataset.edgeFrom!) as any,b:bySlug.get(el.dataset.edgeTo!) as any}));
const reduced=matchMedia('(prefers-reduced-motion: reduce)');
let scale=1,panX=0,panY=0,frame=0,energy=0,active=!document.querySelector<HTMLElement>('#floating-graph')!.hidden,drag:any=null;
function transform(){camera.setAttribute('transform',`translate(${panX} ${panY}) scale(${scale})`);}
function draw(){for(const n of nodes)n.el.setAttribute('transform',`translate(${n.x.toFixed(2)} ${n.y.toFixed(2)})`);for(const e of edges){e.el.setAttribute('x1',e.a.x);e.el.setAttribute('y1',e.a.y);e.el.setAttribute('x2',e.b.x);e.el.setAttribute('y2',e.b.y);}}
function tick(){
 for(let i=0;i<nodes.length;i++)for(let j=i+1;j<nodes.length;j++){
  const a=nodes[i],b=nodes[j],dx=b.x-a.x,dy=b.y-a.y,d=Math.max(1,Math.hypot(dx,dy));
  const force=Math.min(4,1800/(d*d))+(d<145?(145-d)*.026:0);
  a.vx-=dx/d*force;a.vy-=dy/d*force;b.vx+=dx/d*force;b.vy+=dy/d*force;
 }
 for(const {a,b} of edges){const dx=b.x-a.x,dy=b.y-a.y,d=Math.max(1,Math.hypot(dx,dy)),f=(d-175)*.0045;a.vx+=dx/d*f;a.vy+=dy/d*f;b.vx-=dx/d*f;b.vy-=dy/d*f;}
 for(const n of nodes){if(drag?.node===n){n.vx=n.vy=0;continue;}n.vx=(n.vx+(n.cx-n.x)*.003)*.82;n.vy=(n.vy+(n.cy-n.y)*.003)*.82;n.x=Math.max(85,Math.min(915,n.x+n.vx));n.y=Math.max(40,Math.min(700,n.y+n.vy));}
}
function animate(){frame=0;if(!active||document.hidden)return;if(energy>0){tick();draw();energy--;frame=requestAnimationFrame(animate);}}
function wake(steps=180){energy=steps;if(reduced.matches){for(let i=0;i<steps;i++)tick();draw();return;}if(!frame&&active&&!document.hidden)frame=requestAnimationFrame(animate);}
function reset(){nodes.forEach((n:any,i:number)=>{Object.assign(n,initial(articles[i]));n.vx=n.vy=0;});scale=matchMedia('(max-width:600px)').matches?2.2:1;panX=500-500*scale;panY=390-390*scale;transform();draw();wake(240);}
function fit(){const minX=Math.min(...nodes.map((n:any)=>n.x))-85,maxX=Math.max(...nodes.map((n:any)=>n.x))+85,minY=Math.min(...nodes.map((n:any)=>n.y))-40,maxY=Math.max(...nodes.map((n:any)=>n.y))+65;scale=Math.min(1000/(maxX-minX),780/(maxY-minY));panX=(1000-(maxX+minX)*scale)/2;panY=(780-(maxY+minY)*scale)/2;transform();}
function point(e:PointerEvent|WheelEvent){const p=new DOMPoint(e.clientX,e.clientY);return p.matrixTransform(svg.getScreenCTM()!.inverse());}
function zoom(factor:number,x=500,y=390){const old=scale;scale=Math.max(.55,Math.min(2.5,scale*factor));panX=x-(x-panX)*scale/old;panY=y-(y-panY)*scale/old;transform();}
svg.addEventListener('pointerdown',e=>{if(e.button!==0||e.ctrlKey||e.metaKey||e.shiftKey||e.altKey)return;const link=(e.target as Element).closest<SVGAElement>('[data-force-node]');const p=point(e);drag={node:link?bySlug.get(link.dataset.forceNode!):null,link,start:p,x:p.x,y:p.y,panX,panY,moved:false};svg.setPointerCapture(e.pointerId);svg.classList.add('dragging');});
svg.addEventListener('pointermove',e=>{if(!drag)return;const p=point(e);if(Math.hypot(p.x-drag.start.x,p.y-drag.start.y)>4)drag.moved=true;if(drag.node){drag.node.x=Math.max(30,Math.min(970,(p.x-panX)/scale));drag.node.y=Math.max(20,Math.min(740,(p.y-panY)/scale));draw();if(!reduced.matches)wake(100);}else{panX=drag.panX+p.x-drag.x;panY=drag.panY+p.y-drag.y;transform();}});
function release(e:PointerEvent){if(!drag)return;const previous=drag;drag=null;svg.classList.remove('dragging');if(svg.hasPointerCapture(e.pointerId))svg.releasePointerCapture(e.pointerId);if(previous.link){if(previous.moved){previous.link.dataset.dragged='true';setTimeout(()=>delete previous.link.dataset.dragged,0);}else if(e.type!=='pointercancel'){previous.link.dispatchEvent(new MouseEvent('click',{bubbles:true,cancelable:true}));}}if(!reduced.matches)wake(100);}
svg.addEventListener('pointerup',release);svg.addEventListener('pointercancel',release);
svg.addEventListener('wheel',e=>{if(!e.ctrlKey&&!e.metaKey)return;e.preventDefault();const p=point(e);zoom(Math.exp(-e.deltaY*.003),p.x,p.y);},{passive:false});
document.querySelector('#graph-in')!.addEventListener('click',()=>zoom(1.2));document.querySelector('#graph-out')!.addEventListener('click',()=>zoom(1/1.2));document.querySelector('#graph-fit')!.addEventListener('click',fit);
document.addEventListener('atlas-graph-reset',reset);
document.addEventListener('atlas-graph-view',((e:CustomEvent)=>{active=e.detail==='graph';if(active)wake(90);else{cancelAnimationFrame(frame);frame=0;}}) as EventListener);
document.addEventListener('visibilitychange',()=>{if(!document.hidden&&active)wake(60);});
reduced.addEventListener('change',()=>{cancelAnimationFrame(frame);frame=0;if(reduced.matches){energy=0;draw();}else wake(90);});
reset();
