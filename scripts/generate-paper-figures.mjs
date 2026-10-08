import {writeFileSync} from 'node:fs';
import {data} from './content.mjs';
const evidence=data('evidence');
const xml=s=>String(s).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;');
const value=(id,p)=>{
 const record=evidence.find(e=>e.id===id);
 for(const x of record.excerpts.filter(x=>x.format==='json')){
  const fields=JSON.parse(x.content);
  if(Object.hasOwn(fields,p))return fields[p];
  for(const prefix of Object.keys(fields))if(p.startsWith(prefix+'/')){
   let v=fields[prefix];for(const k of p.slice(prefix.length+1).split('/'))v=v[k];return v;
  }
 }
 throw Error(`Missing figure source ${id}: ${p}`);
};
const text=(x,y,s,size=18,color='#21384f',extra='')=>`<text x="${x}" y="${y}" fill="${color}" font-size="${size}" ${extra}>${xml(s)}</text>`;
const line=(x1,y1,x2,y2,dash=false)=>`<path d="M${x1} ${y1}L${x2} ${y2}" stroke="#59768f" stroke-width="2" fill="none" ${dash?'stroke-dasharray="6 5"':''}/>`;
const box=(x,y,w,h,title,sub,accent=false)=>`<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="5" fill="${accent?'#e0eafa':'#fff'}" stroke="${accent?'#3568b5':'#bac9d5'}"/>${text(x+18,y+28,title,19,'#173653','font-weight="600"')}${text(x+18,y+52,sub,13)}`;
const arrow=(x,y,dir='down')=>dir==='down'?`<path d="M${x} ${y}v18m-5-5 5 5 5-5" stroke="#59768f" fill="none" stroke-width="2"/>`:`<path d="M${x} ${y}h18m-5-5 5 5-5 5" stroke="#59768f" fill="none" stroke-width="2"/>`;
const svg=(name,w,h,title,desc,body)=>writeFileSync(`public/figures/${name}.svg`,`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}" role="img" aria-labelledby="title desc"><title id="title">${xml(title)}</title><desc id="desc">${xml(desc)}</desc><rect width="${w}" height="${h}" fill="#f5f8fb"/><g font-family="Arial, sans-serif">${body}</g></svg>\n`);

svg('native-architecture',960,660,'Native runtime and separate boot/recovery stages','Explanatory architecture of the 7E18 A64 route; the pre-XNU NuttX selector, resident EL2 compatibility and separate Jumpdrive recovery have distinct lifetimes.',
 text(32,38,'7E18 / PHYSICAL PINEPHONE',14,'#3568b5','letter-spacing="2"')+
 box(44,62,580,72,'Stock applications and frameworks','SpringBoard · Camera · Photos · Celestial / FigRecorder')+arrow(334,137)+
 box(44,159,580,72,'Original IOKit hardware providers','MMC / explicit-key AES · display · input / power · H1ISP / JPEG',true)+arrow(334,234)+
 box(44,256,580,72,'Adapted original XNU · AArch32','7E18 / XNU 1357 · exact-build guards and bindings')+arrow(334,331)+
 box(44,353,580,72,'Resident EL2 compatibility / reset','Selective architectural handling · final drained WDOG0 reset')+arrow(334,428)+
 box(44,450,580,72,'A64 hardware · Cortex-A53','Physical execution · MMIO / DMA / panel / sensor / PMIC',true)+
 box(658,62,258,90,'Boot-time preparation','Tow-Boot / TF-A → NuttX')+text(676,133,'Panel initialization + selector',13)+
 line(658,179,642,179,true)+line(642,179,642,292,true)+line(642,292,624,292,true)+
 box(658,222,258,82,'Checked profile staging','Kernel identity · separate OS window')+
 box(658,353,258,90,'Recovery after reset','RTC route → Jumpdrive Linux')+text(676,424,'Fresh hashes / filesystem checks',13)+line(624,389,658,389,true)+
 text(44,566,'BOOT-TIME ≠ RESIDENT RUNTIME ≠ RECOVERY',14,'#3568b5','font-weight="600"')+
 text(44,592,'NuttX prepares the display before XNU; Jumpdrive is a separate recovery OS.',15)+
 text(44,618,'Ordinary AArch32 instructions execute on A53. This is not a complete Apple board model.',15));

svg('trial-loop',960,410,'Bounded physical trial loop','Freeze and preflight, bounded capture, separate recovery, fresh integrity checks and owner hand acceptance; failures return to diagnosis.',
 text(30,35,'EACH TRIAL DECLARES ITS OWN WRITE AND RECOVERY SCOPE',14,'#3568b5','letter-spacing="1"')+
 box(30,64,275,78,'1. Freeze + preflight','Exact inputs · read-only baselines')+arrow(309,103,'right')+
 box(342,64,275,78,'2. Boot + capture','Exclusive UART · finite diagnostics',true)+arrow(622,103,'right')+
 box(654,64,275,78,'3. Recover','Watchdog / RTC → Jumpdrive')+arrow(790,150)+line(790,168,790,208)+
 box(654,226,275,78,'4. Fresh readback','Immutable hashes · fsck · media',true)+line(645,265,620,265)+
 box(342,226,275,78,'5. Owner acceptance','Visible use · separate hand result')+line(330,265,307,265)+
 box(30,226,275,78,'6. Record the boundary','Accepted scope + retained failure')+
 line(168,219,168,147,true)+text(30,347,'Failure → diagnosis → a newly frozen trial, without overwriting the old conclusion.',16)+
 text(30,375,'Accepted normal profiles keep boot/runtime watchdogs off; diagnostic leases are finite.',15));

const metrics=[['Native deliveries','native/fps'],['Distinct selected images','renderer/fps'],['Panel update counter','panel_update_fps']];
const prefixes=['/controlled_phone_comparison/phone13','/controlled_phone_comparison/phone14'];
const camera=metrics.map(([label,key])=>({label,unit:'events/s',evidence:'E59',values:prefixes.map((p,i)=>({queue:value('E59',p+'/queue_capacity'),value:value('E59',p+'/'+key),pointer:p+'/'+key}))}));
let chart=text(30,36,'LEGACY 4A102 CAMERA / ONE PHYSICAL PAIR',14,'#3568b5','letter-spacing="1"');
chart+=`<rect x="635" y="27" width="14" height="14" fill="#3568b5"/>${text(657,39,'Two slots',14)}<rect x="785" y="27" width="14" height="14" fill="#8ab2e4"/>${text(807,39,'Six slots',14)}`;
for(let i=0;i<camera.length;i++){
 const y=83+i*110;chart+=text(30,y+26,camera[i].label,17);
 for(let j=0;j<2;j++){const v=camera[i].values[j].value;chart+=`<rect x="270" y="${y+j*31}" width="${v/35*550}" height="23" fill="${j?'#8ab2e4':'#3568b5'}"/>`+text(282+v/35*550,y+17+j*31,v.toFixed(3),14)}
}
for(let v=0;v<=35;v+=5)chart+=text(270+v/35*550,420,v,12,'#59768f')+line(270+v/35*550,407,270+v/35*550,412);
chart+=text(30,448,'events/s · Unequal intervals. Selection/update counters do not prove individual physical frames.',14);
svg('camera-rates',960,470,'Different camera counters measure different boundaries','Two-slot versus six-slot legacy 4A102 preview comparison; no 7E18 frame rate is inferred.',chart);

const prefix='/physical_followup/later64_frame_interval/metrics';
const display=['source','expand','total','gap','log'].map(k=>({label:k,unit:'ms',evidence:'E50',value:value('E50',prefix+'/'+k+'/mean_ms'),samples:value('E50',prefix+'/'+k+'/samples'),pointer:prefix+'/'+k+'/mean_ms'}));
chart=text(30,35,'7E18 IDLE DISPLAY / 64 LATER PRESENTATIONS',14,'#3568b5','letter-spacing="1"');
const labels={source:'Source work',expand:'2× expansion',total:'Total work',gap:'Presentation gap',log:'Diagnostic log'};
for(let i=0;i<4;i++){const d=display[i],y=78+i*56;chart+=text(30,y+21,labels[d.label],16)+`<rect x="245" y="${y}" height="28" width="${d.value/15*570}" fill="${d.label==='total'?'#3568b5':'#8ab2e4'}"/>`+text(256+d.value/15*570,y+20,d.value.toFixed(4)+' ms',14)}
chart+=text(30,336,'Log: '+display[4].value.toFixed(4)+' ms · ONE SAMPLE',17,'#3568b5','font-weight="600"');
chart+=text(30,369,'The log is reported separately, not plotted against the 64-sample work means.',15);
chart+=text(30,409,'Zero sampled changes · elapsed counter timing · no clock or cache-policy change.',14);
svg('display-timing',960,450,'Idle display elapsed work and separate logging cost','Sixty-four later physical presentations with zero sampled changes; logging has only one sample.',chart);

svg('usb-ladder',960,390,'USB progress ends before ordinary pairing','Enumeration and stock mux handshake pass in finite physical trials; listener timing is sampled, while pairing and AFC remain pending.',
 text(30,35,'7E18 PHYSICAL USB / SEPARATE TRIALS, SEPARATE GATES',14,'#3568b5','letter-spacing="1"')+
 box(30,69,275,86,'1. EP0 + enumeration','Address / descriptors / configuration',true)+text(49,138,'Passed in later finite trials',13)+arrow(310,112,'right')+
 box(342,69,275,86,'2. Stock mux v2','Real family / native bulk transport',true)+text(360,138,'Handshake passed; pairing pending',13)+arrow(622,112,'right')+
 box(654,69,275,86,'3. Local listener','First positive sample after startup')+text(672,138,'41.237 s · not exact bind time',13)+
 box(342,223,587,85,'4. Ordinary pairing → information / syslog / AFC','PENDING · identity stability, service lifetime and replug acceptance')+
 line(792,162,792,218,true)+text(30,245,'Retained failures',17,'#3568b5','font-weight="600"')+
 text(30,273,'Address timing / DATAEND',13)+text(30,296,'Fixed 30 s delay / refusal',13)+
 text(30,351,'Scoped diagnostic success coexists with a false original whole-run capture gate.',15));

writeFileSync('public/paper-evaluation.json',JSON.stringify({schemaVersion:1,publication:data('publication'),camera,display,limits:'Curated selected values; measurement scopes are E59 (4A102 queue pair) and E50 (7E18 idle elapsed interval). No 7E18 Camera FPS is derived.'},null,2)+'\n');
console.log('Generated five original paper figures from curated evidence and explicit architecture.');
