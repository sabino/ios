export function searchArticles(items, query) {
 const raw=query.toLowerCase().trim();
 if(!raw) return items.slice(0,6);
 const aliases={gpu:'graphics',screen:'display',clock:'time',filesystem:'hfs',sound:'audio',keys:'buttons'};
 const tokens=raw.split(/\s+/).filter(Boolean);
 return items.map(item=>{
  const title=item.title.toLowerCase(),description=item.description.toLowerCase(),body=item.body.toLowerCase();
  let score=0;
  for(const token of tokens){const options=[token,aliases[token]].filter(Boolean);let best=0;for(const t of options){best=Math.max(best,(title.includes(t)?12:0)+(description.includes(t)?5:0)+(body.includes(t)?1:0));}if(!best)return null;score+=best;}
  return {item,score};
 }).filter(Boolean).sort((a,b)=>b.score-a.score||a.item.order-b.item.order).map(r=>r.item);
}
