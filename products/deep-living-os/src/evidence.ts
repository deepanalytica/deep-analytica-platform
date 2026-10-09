import type {Property} from './core';
export type Verification='verificado'|'declarado'|'estimado'|'pendiente'|'no_sustentado';
export type Claim={
 id:string;label:string;value:string|null;verification:Verification;source:string|null;
 observed_at:string|null;license_reviewed:boolean;resolution:string|null;limitation:string;
};
export type Finding={key:string;label:string;status:'cumple'|'no_cumple'|'desconocido';explanation:string};
export type Precheck={title:string;purpose:string;findings:Finding[];claims:Claim[];verifiedCount:number;declaredCount:number;missingCount:number;recommendation:string;};

export function eligibleClaim(claim:Claim):boolean{
 return claim.verification==='verificado'&&Boolean(claim.value!==null&&claim.source&&claim.observed_at&&claim.license_reviewed&&claim.resolution);
}
export function makePrecheck(property:Property,purpose:string,budget:number):Precheck {
 // No external data are manufactured. Inventory fields are assertions by an operator,
 // not independently verified territorial facts.
 const price=Number(property.price);
 const findings:Finding[]=[
  {key:'price',label:'Precio dentro del presupuesto',status:budget>0?(price<=budget?'cumple':'no_cumple'):'desconocido',
   explanation:budget>0?(price<=budget?'El precio publicado cumple el máximo ingresado, sin incluir gastos e impuestos.':'El precio declarado supera el presupuesto ingresado.'):'Falta presupuesto para comparar.'},
  {key:'zoning',label:'Uso permitido / destino',status:'desconocido',explanation:'Solicitar certificado o respaldo urbanístico aplicable; no consultado.'},
  {key:'mobility',label:'Locomoción y tráfico horario',status:'desconocido',explanation:'No se han consultado recorridos ni aforos; presencia de paraderos no indica frecuencias.'},
  {key:'safety',label:'Seguridad del entorno',status:'desconocido',explanation:'Sin datos oficiales contextualizados; no es posible asignar una calificación.'},
  {key:'hazard',label:'Amenazas territoriales',status:'desconocido',explanation:'Sin análisis oficial a escala predial ni inspección; ausencia de registros no significa ausencia de amenazas.'},
  {key:'ownership',label:'Titularidad y gravámenes',status:'desconocido',explanation:'Se requiere documentación registral y, cuando corresponda, revisión jurídica.'},
  {key:'services',label:'Servicios e infraestructura',status:'desconocido',explanation:'Sin validación de oferta real, disponibilidad de suministros o accesibilidad.'},
 ];
 const claims:Claim[]=[
  {id:'price',label:'Precio declarado en cartera',value:String(price),verification:'declarado',source:'Inventario ingresado por usuario',observed_at:null,license_reviewed:true,resolution:'registro de inmueble',limitation:'Pendiente de contrastar con aviso, propietario o tasación.'},
  {id:'location',label:'Ubicación declarada',value:property.commune,verification:'declarado',source:'Inventario ingresado por usuario',observed_at:null,license_reviewed:true,resolution:'comuna',limitation:'No corresponde a geocodificación predial validada.'}
 ];
 return {title:property.title,purpose,findings,claims,verifiedCount:claims.filter(eligibleClaim).length,
 declaredCount:claims.filter(c=>c.verification==='declarado').length,
 missingCount:findings.filter(f=>f.status==='desconocido').length,
 recommendation:'Evaluación preliminar. No emitir una recomendación de compra o arriendo sin resolver las verificaciones esenciales.'};
}
export function compareEligible(a:Precheck,b:Precheck):'a'|'b'|'insuficiente' {
 // Comparing prices alone cannot determine contextual suitability.
 const af=a.findings.find(f=>f.key==='price'),bf=b.findings.find(f=>f.key==='price');
 if(!af||!bf||af.status==='desconocido'||bf.status==='desconocido')return 'insuficiente';
 const must=['zoning','hazard','ownership'];
 if(must.some(k=>a.findings.find(f=>f.key===k)?.status==='desconocido'||b.findings.find(f=>f.key===k)?.status==='desconocido'))return 'insuficiente';
 return af.status==='cumple'&&bf.status!=='cumple'?'a':bf.status==='cumple'&&af.status!=='cumple'?'b':'insuficiente';
}
export function assertPublishable(claims:Claim[]):{ok:boolean;blocked:string[]} {
 const blocked=claims.filter(c=>c.verification==='verificado'&&!eligibleClaim(c)).map(c=>c.id);
 return {ok:blocked.length===0,blocked};
}
