import {readFileSync,readdirSync,existsSync,statSync} from 'node:fs';
import {join,resolve} from 'node:path';
const root=resolve('dist');
function walk(p){return readdirSync(p,{withFileTypes:true}).flatMap(e=>e.isDirectory()?walk(join(p,e.name)):[join(p,e.name)]);}
const files=walk(root),html=files.filter(p=>p.endsWith('.html')),errors=[];
for(const file of html){const text=readFileSync(file,'utf8');if(!text.includes('name="description"'))errors.push(`${file}: no description`);
 for(const m of text.matchAll(/(?:href|src)="([^"<>]+)"/g)){const value=m[1].replaceAll('&amp;','&');if(!value.startsWith('/ios/')&&!value.startsWith('#'))continue;const url=new URL(value,'https://sabino.pro/ios/'+file.slice(root.length+1).replace(/index\.html$/,''));let target=join(root,decodeURIComponent(url.pathname.slice('/ios/'.length)));if(existsSync(target)&&statSync(target).isDirectory())target=join(target,'index.html');if(!existsSync(target)){errors.push(`${file}: missing ${value}`);continue;}if(url.hash&&target.endsWith('.html')){const id=decodeURIComponent(url.hash.slice(1));if(!readFileSync(target,'utf8').includes(`id="${id}"`))errors.push(`${file}: missing anchor ${value}`);}}
 if(/\/home\/sabino|\/run\/media\/|-----BEGIN .*PRIVATE KEY/.test(text))errors.push(`${file}: private content pattern`);
}
if(errors.length){console.error([...new Set(errors)].join('\n'));process.exit(1);}console.log(`Checked ${html.length} HTML pages and their local links/assets.`);
