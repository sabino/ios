// Keep wide Markdown tables scrollable by keyboard, including without JavaScript.
export function accessibleTables(){
 return {
  name:'accessible-tables',
  element:{filter:['table'],visit(node,ctx){
   ctx.setProperty(node,'tabIndex',0);
   const next=ctx.parent(node).children.slice(ctx.indexOf(node)+1).find(n=>n.type==='element');
   const caption=next?.tagName==='p'&&ctx.textContent(next).match(/^Table (\d+)\./);
   if(caption){
    const id=`table-caption-${caption[1]}`;
    ctx.setProperty(next,'id',id);
    ctx.setProperty(node,'ariaDescribedBy',id);
   }
  }},
 };
}
