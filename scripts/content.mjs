import {readFileSync,readdirSync} from 'node:fs';
export const data=name=>JSON.parse(readFileSync(new URL(`../src/data/${name}.json`,import.meta.url),'utf8'));
export function readArticles(){return readdirSync(new URL('../content/articles/',import.meta.url)).filter(f=>f.endsWith('.md')).map(file=>{const text=readFileSync(new URL(`../content/articles/${file}`,import.meta.url),'utf8');const match=text.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);if(!match)throw Error(`Invalid frontmatter: ${file}`);return {...JSON.parse(match[1]),body:match[2].trim()};}).sort((a,b)=>a.order-b.order);}
export function validate(articles,evidence,sources){
 const errors=[];const sets={articles:new Set(articles.map(a=>a.slug)),evidence:new Set(evidence.map(e=>e.id)),sources:new Set(sources.map(s=>s.id))};
 for(const [kind,rows] of Object.entries({articles,evidence,sources}))if(sets[kind].size!==rows.length)errors.push(`Duplicate ${kind} identifier`);
 for(const a of articles){for(const field of ['slug','title','description','section','updated'])if(!a[field])errors.push(`${a.slug}: missing ${field}`);if(a.body.split(/\s+/).length<300)errors.push(`${a.slug}: insufficient editorial context`);
 for(const [field,kind]of [['related','articles'],['evidence','evidence'],['sources','sources']])for(const id of a[field]||[])if(!sets[kind].has(id))errors.push(`${a.slug}: unresolved ${field} ${id}`);
 for(const m of a.body.matchAll(/\/ios\/evidence\/(E\d+)\//g))if(!a.evidence.includes(m[1]))errors.push(`${a.slug}: undeclared evidence ${m[1]}`);
 }
 for(const e of evidence){
  for(const field of ['environment','method','observation','limits','status'])if(!e[field])errors.push(`${e.id}: missing ${field}`);
  if(!e.records.length)errors.push(`${e.id}: no source record`);
  for(const r of e.records)if(!/^[a-f0-9]{64}$/.test(r.sha256)||r.document.includes('/'))errors.push(`${e.id}: invalid provenance`);
  if(!e.exhibits?.length||!e.excerpts?.length){errors.push(`${e.id}: missing inspectable evidence`);continue;}
  const excerptIds=new Set(e.excerpts.map(x=>x.id));const exhibitIds=new Set(e.exhibits.map(x=>x.id));
  if(excerptIds.size!==e.excerpts.length||exhibitIds.size!==e.exhibits.length)errors.push(`${e.id}: duplicate exhibit or excerpt`);
  for(const x of e.excerpts){
   if(!/^[a-z0-9-]+$/.test(x.id)||!x.content||!x.locator||!x.note)errors.push(`${e.id}: incomplete excerpt ${x.id}`);
   if(!e.records.some(r=>r.document===x.document&&r.sha256===x.sha256))errors.push(`${e.id}: untracked excerpt provenance ${x.id}`);
  }
  for(const x of e.exhibits){
   if(!/^[a-z0-9-]+$/.test(x.id)||!x.title||!x.interpretation)errors.push(`${e.id}: incomplete exhibit ${x.id}`);
   if(!x.sourceIds?.length||x.sourceIds.some(id=>!excerptIds.has(id)))errors.push(`${e.id}: unresolved exhibit source ${x.id}`);
   if(x.kind==='table'&&(!x.rows?.length||!x.columns?.length||x.rows.some(r=>r.length!==x.columns.length)))errors.push(`${e.id}: malformed table ${x.id}`);
   if(x.kind==='trace'&&!x.text)errors.push(`${e.id}: empty trace ${x.id}`);
   if(x.kind==='image'&&(!/^\/ios\/evidence\/images\/[a-zA-Z0-9-]+\.(png|jpg)$/.test(x.src)||!x.alt||!x.caption||!x.rights||!(x.width>0&&x.height>0)||!/^[a-f0-9]{64}$/.test(x.sha256)))errors.push(`${e.id}: invalid image ${x.id}`);
   if(!['table','trace','image'].includes(x.kind))errors.push(`${e.id}: unknown exhibit kind`);
  }
 }
 const serialized=JSON.stringify({articles,evidence,sources});
 if(/\/home\/|\/run\/media\/|-----BEGIN .*PRIVATE KEY|\bgh[pousr]_[A-Za-z0-9]{20,}|\bsk-ant-[A-Za-z0-9_-]{20,}|[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i.test(serialized))errors.push('Publication contains a private path, credential pattern or email address');
 return errors;
}
