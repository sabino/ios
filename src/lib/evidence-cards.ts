// Build-time HTML for evidence previews. A chapter keeps its plain links; each cited record also gains a
// compact card after the paragraph that mentions it. Cards are static HTML so they print and work without
// JavaScript; the client script only adds in-place expansion (src/lib/evidence-peek.ts).
import {evidenceById,envKey,url} from './content';

const escape=(s:string)=>s.replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]!));
// One glyph per environment so identity never depends on color alone.
export const glyphPaths: Record<string,string> = {
 'ipod-reference':'M6 .6 11.4 6 6 11.4.6 6Z',
 'pinephone-qemu':'M1.5 1.5h9v9h-9Z',
 'physical-pinephone':'M6 1 11.4 10.6H.6Z',
 'synthetic-probe':'M4.4.8h3.2v3.6h3.6v3.2H7.6v3.6H4.4V7.6H.8V4.4h3.6Z',
 'static-inspection':'M6 .6 11.4 6 6 11.4.6 6Z M6 3.7 3.7 6 6 8.3 8.3 6Z',
};
export const glyph=(environment:string,cls='env-glyph')=>`<svg class="${cls}" viewBox="0 0 12 12" aria-hidden="true"><path fill-rule="evenodd" d="${glyphPaths[envKey(environment)]}"/></svg>`;

let serial=0;
/** A full card, or a slim row for a record the reader has already met in this chapter. */
export function peekCard(id:string,{exhibit='',repeat=false,from=''}:{exhibit?:string,repeat?:boolean,from?:string}={}){
 const e=evidenceById(id);if(!e)return '';
 const n=++serial,env=envKey(e.environment),target=e.exhibits.find(x=>x.id===exhibit);
 const record=url(`evidence/${e.id}/`)+(from?`?from=${from}`:'')+(target?`#${target.id}`:'');
 const kinds=e.exhibits.length===1?'1 exhibit':`${e.exhibits.length} exhibits`;
 const expand=`<button class="peek-expand" type="button" aria-expanded="false" aria-controls="peek-${n}" hidden><span class="peek-chevron" aria-hidden="true"></span><span class="peek-expand-label">${repeat?'Show':'Show the captured result'}</span></button>`;
 const zoom=`<a class="peek-zoom" href="${record}" aria-label="Open the full record ${e.id}: ${escape(e.title)}"><svg viewBox="0 0 16 16" aria-hidden="true"><circle cx="7" cy="7" r="4.6"/><path d="M10.4 10.4 14 14M7 5v4M5 7h4"/></svg><span>${repeat?'Open':'Open record'}</span></a>`;
 const attrs=`class="evidence-peek${repeat?' is-repeat':''}" data-env="${env}" data-evidence="${e.id}"${target?` data-exhibit="${target.id}"`:''} aria-label="Evidence ${e.id}: ${escape(e.title)}"`;
 if(repeat)return `<aside ${attrs}><div class="peek-row"><span class="peek-tag">${glyph(e.environment)}<span class="peek-id">${e.id}</span></span><span class="peek-title">${escape(target?target.title:e.title)}</span><span class="peek-actions">${expand}${zoom}</span></div><div class="peek-body" id="peek-${n}" hidden></div></aside>`;
 return `<aside ${attrs}><div class="peek-head"><span class="peek-tag">${glyph(e.environment)}<span>${escape(e.environment)}</span></span><span class="peek-id">${e.id}</span></div><p class="peek-title">${escape(e.title)}</p><p class="peek-observation">${escape(e.observation)}</p>${target?`<p class="peek-focus"><span>Cited exhibit</span> ${escape(target.title)}</p>`:''}<div class="peek-foot">${expand}<span class="peek-meta">${kinds} · stated limits</span>${zoom}</div><div class="peek-body" id="peek-${n}" hidden></div></aside>`;
}

const VOID=new Set(['br','img','hr','input','meta','link','wbr','source','col','area','embed','track']);
/** Insert a card after each top-level block that cites evidence. The first mention of a record gets the
 * full card; later mentions get the slim row. */
export function injectEvidence(html:string,from:string){
 const out:string[]=[],seen=new Set<string>();let depth=0,start=0;
 const tag=/<(\/?)([a-zA-Z][a-zA-Z0-9]*)\b[^>]*?(\/?)>/g;let m:RegExpExecArray|null;
 while((m=tag.exec(html))){
  const [whole,close,name,selfClose]=m;const lower=name.toLowerCase();
  // Code is opaque: jump straight to its closing tag.
  if(!close&&lower==='pre'){const end=html.indexOf('</pre>',m.index);if(end<0)break;depth++;tag.lastIndex=end;continue;}
  if(VOID.has(lower)||selfClose)continue;
  depth+=close?-1:1;
  if(depth===0&&close){
   const end=m.index+whole.length,block=html.slice(start,end);out.push(block);start=end;
   const refs=new Map<string,string>();
   for(const r of block.matchAll(/href="\/ios\/evidence\/(E\d+)\/(?:#([\w-]+))?"/g))if(!refs.has(r[1])||r[2])refs.set(r[1],r[2]||refs.get(r[1])||'');
   for(const [id,exhibit] of refs){out.push(peekCard(id,{exhibit,repeat:seen.has(id),from}));seen.add(id);}
  }
 }
 out.push(html.slice(start));
 // Mark inline references so they carry their environment glyph and can talk to the cards.
 return out.join('').replace(/<a href="\/ios\/evidence\/(E\d+)\/(#[\w-]+)?">/g,(whole,id,hash='')=>{const e=evidenceById(id);return e?`<a class="evidence-ref" data-env="${envKey(e.environment)}" data-evidence="${id}" href="/ios/evidence/${id}/${hash}">${glyph(e.environment,'env-glyph ref-glyph')}`:whole;});
}
