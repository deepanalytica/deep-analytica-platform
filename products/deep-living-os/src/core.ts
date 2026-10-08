export type Stage = { id: number; name: string; explanation: string; next: string };
export const STAGES: Stage[] = [
  {id:1,name:'Acuerdo inicial',explanation:'Definimos precio, condiciones de venta, responsabilidades y honorarios.',next:'Firmar autorización y reunir antecedentes.'},
  {id:2,name:'Preparación',explanation:'Revisamos información, obtenemos documentos y preparamos el anuncio.',next:'Validar datos y aprobar publicación.'},
  {id:3,name:'Comercialización',explanation:'Publicamos, atendemos interesados y coordinamos visitas.',next:'Gestionar consultas y propuestas.'},
  {id:4,name:'Oferta',explanation:'Un comprador propone un precio, plazos y forma de pago. El propietario decide.',next:'Aceptar, rechazar o contraofertar por escrito.'},
  {id:5,name:'Promesa',explanation:'Si corresponde, se formalizan compromisos, condiciones y plazos.',next:'Revisión jurídica, firmas y honorarios según acuerdo.'},
  {id:6,name:'Escritura',explanation:'Se verifican antecedentes, financiamiento y texto de escritura definitiva.',next:'Resolver observaciones y coordinar firma.'},
  {id:7,name:'Inscripción y pagos',explanation:'Se comprueban las condiciones para inscribir y liberar el precio.',next:'Confirmar inscripción, instrucciones y pagos.'},
  {id:8,name:'Entrega',explanation:'Se coordinan las llaves y el acta de entrega según las condiciones pactadas.',next:'Cerrar expediente y emitir comprobantes.'}
];
export type Property = { id:string; title:string; address:string; commune:string; sector?:string; price:number; bedrooms:number; bathrooms:number; parking:boolean; area?:number; operation_type:'venta'|'arriendo'; property_type:'casa'|'departamento'|'oficina'|'local'|'terreno'; status:'disponible'|'reservada'|'vendida'|'arrendada'; org_id?:string };
export type Demand = { id:string; client_name:string; commune:string; budget_max:number; bedrooms_min:number; parking_required:boolean; operation_type:'venta'|'arriendo'; property_type?:string; preferred_sector?:string; status?:string; org_id?:string };
export type Deal = { id:string; title:string; stage:number; price:number; org_id?:string; property_id?:string|null; updated_at?:string; created_at?:string };
export type Task = { id:string; title:string; deal_id:string; status:'pendiente'|'hecha'; due_at?:string|null; blocking:boolean; visibility?:'interno'|'cliente'; org_id?:string };
export type DealEvent = { id:string; deal_id:string; summary:string; created_at:string; stage:number; visibility:'interno'|'cliente'; org_id?:string };
export function normalize(value:string):string {return value.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().trim();}
export function parseNeed(text:string):Partial<Demand>{
 const q=normalize(text);
 const places=['curico','talca','san javier','villa alegre','linares','parral','constitucion','rancagua','santiago','maule'];
 const city=places.find(x=>q.includes(x));
 const m=q.match(/(?:maximo|hasta|presupuesto|menos de|tope)?\s*\$?\s*(\d+(?:[.,]\d+)?)\s*(millones?|mill|mm)\b/);
 const n=q.match(/(\d+)\s*(?:dormitorios?|habitaciones?|piezas?)/);
 const amount=m?Math.round(Number(m[1].replace(',','.'))*1_000_000):undefined;
 const type=q.includes('departamento')?'departamento':q.includes('casa')?'casa':q.includes('oficina')?'oficina':q.includes('local')?'local':undefined;
 return {commune: city, budget_max:amount, bedrooms_min:n?Number(n[1]):undefined, parking_required:q.includes('estacionamiento')||q.includes('garage'), property_type:type,operation_type:q.includes('arrend')?'arriendo':'venta'};
}
export function matchDemand(d:Demand, properties:Property[]){
 const matches=properties.filter(p=>p.status==='disponible'&&p.operation_type===d.operation_type&&normalize(p.commune)===normalize(d.commune)&&p.price<=d.budget_max&&p.bedrooms>=d.bedrooms_min&&(!d.parking_required||p.parking)&&(!d.property_type||d.property_type===p.property_type));
 return matches.map(p=>({property:p,score:Math.min(100,80+(d.preferred_sector&&normalize(p.sector||'')===normalize(d.preferred_sector)?12:0)+(p.price<=d.budget_max*.9?8:0))})).sort((a,b)=>b.score-a.score||a.property.price-b.property.price);
}
export function commission(price:number, rate:number, addVat:boolean){const net=Math.round(Math.max(0,price)*Math.max(0,rate)/100);const vat=addVat?Math.round(net*.19):0;return {net,vat,total:net+vat};}
export function mayAdvance(current:number,next:number,tasks:Task[],dealId:string){
 if(next!==current+1||current<1||next>8)return {ok:false,reason:'Solo se puede avanzar una etapa a la vez.'};
 const blocking=tasks.filter(t=>t.deal_id===dealId&&t.blocking&&t.status!=='hecha');
 return blocking.length?{ok:false,reason:'Hay '+blocking.length+' tarea(s) bloqueante(s) sin resolver.'}:{ok:true,reason:'Listo para revisión y avance.'};
}
export function priorities(deals:Deal[],tasks:Task[],today=new Date()){
 const cutoff=today.getTime(), alerts:{level:'alta'|'media';title:string;detail:string;dealId:string}[]=[];
 for(const t of tasks.filter(t=>t.status!=='hecha')){
  const deal=deals.find(d=>d.id===t.deal_id); if(!deal)continue;
  if(t.due_at&&new Date(t.due_at).getTime()<cutoff)alerts.push({level:'alta',title:'Tarea vencida',detail:deal.title+' · '+t.title,dealId:deal.id});
  else if(t.blocking)alerts.push({level:'media',title:'Bloqueo de avance',detail:deal.title+' · '+t.title,dealId:deal.id});
 }
 return alerts.sort((a,b)=>a.level==='alta'?-1:b.level==='alta'?1:0);
}
export const pesos=(value:number)=>new Intl.NumberFormat('es-CL',{style:'currency',currency:'CLP',maximumFractionDigits:0}).format(value||0);
