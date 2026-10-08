import {readFileSync,writeFileSync} from 'node:fs';
import {data} from './content.mjs';

export function readPublications(){
 return ['paper','summary','edition'].map(slug=>{
  const text=readFileSync(new URL(`../content/${slug}.md`,import.meta.url),'utf8');
  const match=text.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if(!match)throw Error(`Invalid publication frontmatter: ${slug}`);
  return {slug,...JSON.parse(match[1]),body:match[2].trim()};
 });
}

export function validatePublications(publications,ledger,evidence){
 const errors=[],ids=new Set(evidence.map(e=>e.id)),publication=data('publication');
 if(ledger.sourceRevision!==publication.sourceRevision||ledger.edition!==publication.edition)errors.push('Claim ledger snapshot differs from the edition');
 if(new Set(ledger.claims.map(c=>c.id)).size!==ledger.claims.length)errors.push('Duplicate claim identifier');
 for(const c of ledger.claims){
  if(!/^C\d+$/.test(c.id)||!c.claim||!c.limits||!c.sources?.length||!c.sourceLocators?.length)errors.push(`${c.id}: incomplete claim`);
  if(!c.evidence?.length||c.evidence.some(id=>!ids.has(id)))errors.push(`${c.id}: unresolved evidence`);
  for(const key of ['substrate','method','status'])if(!c.evidenceClass?.[key])errors.push(`${c.id}: missing evidence class ${key}`);
  for(const s of c.sources)if(s.document.includes('/')||!/^[a-f0-9]{64}$/.test(s.sha256))errors.push(`${c.id}: invalid source identity`);
  for(const l of c.sourceLocators)if(!l.locator||!c.sources.some(s=>s.document===l.document))errors.push(`${c.id}: unresolved locator`);
 }
 for(const p of publications){
  if(!p.title||!p.description)errors.push(`${p.slug}: incomplete metadata`);
  for(const m of p.body.matchAll(/\/ios\/evidence\/(E\d+)\//g))if(!ids.has(m[1]))errors.push(`${p.slug}: unresolved evidence ${m[1]}`);
  for(const m of p.body.matchAll(/\]\(#ref-(\d+)\)/g))if(!p.body.includes(`id="ref-${m[1]}"`))errors.push(`${p.slug}: unresolved numbered reference ${m[1]}`);
 }
 const paper=publications.find(p=>p.slug==='paper'),abstract=paper.body.split('## Abstract\n')[1]?.split('\n## ')[0];
 const abstractWords=abstract?.replace(/\[[^\]]*\]\([^)]*\)/g,'').trim().split(/\s+/).length||0;
 if(abstractWords<170||abstractWords>240)errors.push(`Paper abstract has ${abstractWords} words; expected approximately 200`);
 const figures=[...paper.body.matchAll(/id="figure-(\d+)"/g)].map(m=>Number(m[1]));
 if(JSON.stringify(figures)!==JSON.stringify([2,3,4,5,6,7]))errors.push('Paper figures are not in continuous reading order after PLATE 01');
 const serialized=JSON.stringify({publications,ledger});
 if(/\/home\/|\/run\/media\/|-----BEGIN .*PRIVATE KEY|\bgh[pousr]_[A-Za-z0-9]{20,}|\bsk-ant-[A-Za-z0-9_-]{20,}/i.test(serialized))errors.push('Publication contains a private path or credential pattern');
 return errors;
}

export function writeClaimDocument(ledger){
 const cell=s=>String(s).replaceAll('|','\\|').replaceAll('\n',' ');
 const lines=['# Claims ledger — edition '+ledger.edition,'',`Reviewed ${ledger.date} at \`${ledger.sourceRevision}\`. Source basenames, SHA-256 and locators identify reviewed private evidence; they do not establish independent public reproduction. Earlier E01–E40 retain their own revisions.`, '',`The machine-readable ledger is [src/data/claims.json](../src/data/claims.json). Its ${ledger.claims.length} bounded claims separate substrate, method and acceptance. C62 retains an implementation rationale without inventing a standalone physical incident.`, '', '| Claim | Observation | Evidence class | Sources and locators | Limit |','| --- | --- | --- | --- | --- |'];
 for(const c of ledger.claims)lines.push('| '+[c.id,c.claim,Object.values(c.evidenceClass).join('; '),[c.evidence.join(', '),...c.sources.map(s=>s.document+' (`'+s.sha256+'`)'),...c.sourceLocators.map(s=>s.document+': '+s.locator)].join('<br>'),c.limits].map(cell).join(' | ')+' |');
 lines.push('','## Reviewed media','', 'Every new capture is an unchanged selected file. No selector photograph was available for this edition; its route is explained with an original schematic.','', '| Evidence | Source basename | Published SHA-256 | Selection |','| --- | --- | --- | --- |');
 for(const e of data('evidence').filter(e=>Number(e.id.slice(1))>=41))for(const x of e.exhibits.filter(x=>x.kind==='image'))lines.push(`| ${e.id} | ${cell(x.original?.basename||x.src.split('/').at(-1))} | \`${x.sha256}\` | Full ${x.width} × ${x.height}; original bytes and pixels retained; no crop |`);
 writeFileSync(new URL('../docs/CLAIMS.md',import.meta.url),lines.join('\n')+'\n');
}
