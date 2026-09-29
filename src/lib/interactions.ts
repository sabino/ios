document.querySelectorAll<HTMLSelectElement>('select[data-appearance]').forEach(select=>{
 select.value=document.documentElement.dataset.appearance||'system';
 select.addEventListener('change',()=> (window as any).setAtlasAppearance(select.value));
});
import {searchArticles} from './search.mjs';
const dialog=document.querySelector<HTMLDialogElement>('.search-dialog');
const input=document.querySelector<HTMLInputElement>('#atlas-search');
const results=document.querySelector<HTMLUListElement>('#search-results');
const status=document.querySelector<HTMLElement>('#search-status');
let index:any[]|null=null;let load:Promise<any>|null=null;
async function renderSearch(){
 if(!input||!results||!status)return;
 try{
  if(!index){status.textContent='Loading the local research index…';load??=fetch('/ios/search.json').then(r=>{if(!r.ok)throw Error();return r.json()});index=await load;}
  const matches=searchArticles(index,input.value);results.replaceChildren();
  status.textContent=input.value.trim()?`${matches.length} matching result${matches.length===1?'':'s'}`:'Start with a chapter, or search a concept.';
  for(const item of matches.slice(0,10)){
   const li=document.createElement('li'),a=document.createElement('a'),small=document.createElement('span'),strong=document.createElement('strong'),p=document.createElement('span');
   a.href=item.href||'/ios/articles/'+item.slug+'/';small.className='search-section';small.textContent=item.section;strong.textContent=item.title;p.className='search-excerpt';p.textContent=item.description;a.append(small,strong,p);li.append(a);results.append(li);
  }
  if(!matches.length){const li=document.createElement('li');li.className='no-results';li.textContent='No matching results. Try fewer words, “memory”, “HID” or “reboot”.';results.append(li);}
 }catch{status.textContent='Search could not load. Browse the chapter index below, or try again.';load=null;}
}
function openSearch(){if(!dialog?.open){dialog?.showModal();input?.focus();renderSearch();}}
document.querySelectorAll('[data-search-open]').forEach(b=>b.addEventListener('click',openSearch));
document.querySelector('[data-search-close]')?.addEventListener('click',()=>dialog?.close());
dialog?.addEventListener('click',e=>{if(e.target===dialog){const r=dialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)dialog.close();}});
input?.addEventListener('input',renderSearch);
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&dialog?.open){e.preventDefault();dialog.close();return;}const tag=(e.target as HTMLElement)?.tagName;if(['INPUT','TEXTAREA','SELECT'].includes(tag)||(e.target as HTMLElement)?.isContentEditable)return;if(e.key==='/'||((e.metaKey||e.ctrlKey)&&e.key==='k')){e.preventDefault();openSearch();}});
const progress=document.querySelector<HTMLElement>('.reading-progress');
if(document.querySelector('.article-prose')){
 const draw=()=>{const max=document.documentElement.scrollHeight-innerHeight;if(progress)progress.style.width=`${max>0?Math.min(100,scrollY/max*100):0}%`;};
 window.addEventListener('scroll',draw,{passive:true});draw();
 const headings=document.querySelectorAll('.article-prose h2');const observer=new IntersectionObserver(entries=>{for(const entry of entries){if(entry.isIntersecting){document.querySelectorAll('.toc a').forEach(a=>a.classList.toggle('active',a.getAttribute('href')==='#'+entry.target.id));}}},{rootMargin:'-90px 0px -65% 0px'});headings.forEach(h=>observer.observe(h));
}
document.querySelectorAll<HTMLButtonElement>('[data-copy-citation]').forEach(b=>b.addEventListener('click',async()=>{try{await navigator.clipboard.writeText(b.dataset.copyCitation||'');b.textContent='Citation copied';setTimeout(()=>b.textContent='Copy citation',2200);}catch{b.textContent='Select the citation below to copy';document.querySelector('#citation')?.scrollIntoView({behavior:'smooth'});}}));
document.querySelectorAll('[data-print]').forEach(b=>b.addEventListener('click',()=>window.print()));
const filters=document.querySelectorAll<HTMLButtonElement>('[data-filter]');filters.forEach(b=>b.addEventListener('click',()=>{const group=b.dataset.filterGroup;const value=b.dataset.filter;document.querySelectorAll<HTMLButtonElement>(`[data-filter-group="${group}"]`).forEach(x=>x.setAttribute('aria-pressed',String(x===b)));let count=0;document.querySelectorAll<HTMLElement>(`[data-filter-item="${group}"]`).forEach(el=>{const visible=value==='All'||el.dataset.category===value;el.hidden=!visible;if(visible)count++;});const message=document.querySelector(`[data-filter-count="${group}"]`);if(message)message.textContent=`${count} ${group==='evidence'?'records':'chapters'} shown`; }));

document.querySelectorAll<HTMLElement>('.prose pre').forEach(pre=>{pre.tabIndex=0;pre.setAttribute('role','region');pre.setAttribute('aria-label','Code example, scroll if needed');});
document.documentElement.dataset.enhanced='true';
