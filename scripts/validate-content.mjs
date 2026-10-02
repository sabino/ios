import {createHash} from 'node:crypto';
import {writeFileSync,mkdirSync,readFileSync} from 'node:fs';
import {data,readArticles,validate} from './content.mjs';
const articles=readArticles(),evidence=data('evidence'),sources=data('sources'),publication=data('publication');
const errors=validate(articles,evidence,sources);if(errors.length){console.error(errors.join('\n'));process.exit(1);}
const slugs=new Set(articles.map(a=>a.slug));
for(const a of articles)if(!slugs.has(data('reading')[a.slug]?.next))throw Error(`Unresolved continuation ${a.slug}`);
for(const e of data('timeline'))if(!slugs.has(e.chapter)||!evidence.some(r=>r.id===e.evidence))throw Error(`Unresolved timeline record ${e.date}`);
for(const [, ,slug]of data('glossary'))if(!slugs.has(slug))throw Error(`Unresolved glossary chapter ${slug}`);
for(const c of data('corrections'))for(const id of c.evidence)if(!evidence.some(e=>e.id===id))throw Error(`Unknown correction evidence ${id}`);
mkdirSync('public',{recursive:true});
const search=[...articles.map(({slug,title,description,section,order,body})=>({slug,title,description,section,order,body,href:`/ios/articles/${slug}/`})),...evidence.map((e,i)=>({slug:e.id,title:`${e.id}: ${e.title}`,description:e.observation,section:e.environment+' · Evidence',order:100+i,body:JSON.stringify([e.exhibits,e.excerpts]),href:`/ios/evidence/${e.id}/`}))];
writeFileSync('public/search.json',JSON.stringify(search));
mkdirSync('public/evidence/data',{recursive:true});mkdirSync('public/evidence/excerpts',{recursive:true});
for(const e of evidence){
 writeFileSync(`public/evidence/data/${e.id}.json`,JSON.stringify({schemaVersion:2,publication,record:e},null,2)+'\n');
 for(const x of e.excerpts)writeFileSync(`public/evidence/excerpts/${e.id}-${x.id}.txt`,`${e.id} / ${x.document}\nSource SHA-256: ${x.sha256}\nLocator: ${x.locator}\n${x.note}\n\n${x.content}\n`);
 for(const x of e.exhibits.filter(x=>x.kind==='image')){const bytes=readFileSync('public/'+x.src.slice('/ios/'.length));if(createHash('sha256').update(bytes).digest('hex')!==x.sha256)throw Error(`${e.id}: capture hash mismatch`);}
}
writeFileSync('public/atlas.json',JSON.stringify({schemaVersion:2,publication,articles,evidence,sources,corrections:data('corrections'),glossary:data('glossary'),reading:data('reading'),timeline:data('timeline')},null,2)+'\n');
const routes=['','status/','library/','map/','timeline/','evidence/','method/','sources/','glossary/',...['boot','pixels','method'].map(s=>`tours/${s}/`),...articles.map(a=>`articles/${a.slug}/`),...evidence.map(e=>`evidence/${e.id}/`)];
writeFileSync('public/sitemap.xml',`<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${routes.map(r=>`<url><loc>https://sabino.pro/ios/${r}</loc><lastmod>${publication.date}</lastmod></url>`).join('')}</urlset>\n`);
console.log(`Validated ${articles.length} chapters, ${evidence.length} evidence records, ${sources.length} sources; generated public indexes.`);
