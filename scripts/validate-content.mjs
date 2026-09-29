import {writeFileSync,mkdirSync} from 'node:fs';
import {data,readArticles,validate} from './content.mjs';
const articles=readArticles(),evidence=data('evidence'),sources=data('sources'),publication=data('publication');
const errors=validate(articles,evidence,sources);if(errors.length){console.error(errors.join('\n'));process.exit(1);}
const slugs=new Set(articles.map(a=>a.slug));
for(const [, ,slug]of data('glossary'))if(!slugs.has(slug))throw Error(`Unresolved glossary chapter ${slug}`);
for(const c of data('corrections'))for(const id of c.evidence)if(!evidence.some(e=>e.id===id))throw Error(`Unknown correction evidence ${id}`);
mkdirSync('public',{recursive:true});
writeFileSync('public/search.json',JSON.stringify(articles.map(({slug,title,description,section,order,body})=>({slug,title,description,section,order,body}))));
writeFileSync('public/atlas.json',JSON.stringify({schemaVersion:1,publication,articles,evidence,sources,corrections:data('corrections'),glossary:data('glossary')},null,2)+'\n');
const routes=['','library/','map/','evidence/','method/','sources/','glossary/',...['boot','pixels','method'].map(s=>`tours/${s}/`),...articles.map(a=>`articles/${a.slug}/`),...evidence.map(e=>`evidence/${e.id}/`)];
writeFileSync('public/sitemap.xml',`<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${routes.map(r=>`<url><loc>https://sabino.pro/ios/${r}</loc><lastmod>${publication.date}</lastmod></url>`).join('')}</urlset>\n`);
console.log(`Validated ${articles.length} chapters, ${evidence.length} evidence records, ${sources.length} sources; generated public indexes.`);
