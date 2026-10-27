/**
 * Deep Living OS / Decision Intelligence v0.1
 * Motor reproducible de escenarios HIPOTÉTICOS. Nunca infiere motivaciones
 * personales ni se presenta como tasación, pronóstico o estudio de riesgos.
 * No usa conexiones externas, no almacena PII ni ejecuta transacciones.
 */
export type ActionId='sell_now'|'rent'|'hold'|'renovate_sell'|'renovate_rent'|'mitigate_rent'|'sell_later';
export type EventType='familia'|'sucesion'|'finanzas'|'territorio'|'amenaza'|'mercado';
export type ScenarioId='base'|'herencia'|'nido_vacio'|'mudanza'|'liquidez'|'alta_demanda'|'mercado_debil'|'plusvalia'|'inundacion'|'incendio'|'terremoto'|'seguridad'|'costos'|'sin_titulos';
export type Assumptions={
 price:number;monthlyRent:number;occupancy:number;annualMaintenance:number;annualTax:number;
 annualInsurance:number;managementRate:number;saleFeeRate:number;discountRate:number;
 annualPriceGrowth:number;annualRentGrowth:number;priceVolatility:number;eventProbability:number;
 damageFraction:number;insuranceCoverage:number;territorialPriceShock:number;years:number;
 renovationCost:number;renovationPriceLift:number;renovationRentLift:number;
 mitigationCost:number;mitigationDamageFactor:number;liquidityUrgent:boolean;
 legalCleared:boolean;habitable:boolean;
};
export type Scenario={id:ScenarioId;label:string;family:EventType;summary:string;changes:Partial<Assumptions>;note:string};
export type TreeNode={question:string;resolution:string;status:'paso'|'bloqueo'|'revision'};
export type ActionResult={id:ActionId;label:string;allowed:boolean;reason?:string;mean:number;p10:number;median:number;p90:number;cvar10:number;probBetterThanSell:number;values:number[]};
export type DecisionResult={assumptions:Assumptions;scenario:Scenario;seed:number;iterations:number;actions:ActionResult[];top?:ActionResult;warnings:string[];tree:TreeNode[]};

export const ACTIONS:{id:ActionId;label:string;detail:string}[]=[
 {id:'sell_now',label:'Vender ahora',detail:'Liquidez inmediata neta de coste de venta'},
 {id:'rent',label:'Arrendar y conservar',detail:'Flujos netos de arriendo más valor de salida'},
 {id:'hold',label:'Conservar sin arrendar',detail:'Mantener el patrimonio con sus gastos'},
 {id:'renovate_sell',label:'Remodelar y vender',detail:'Inversión en mejoras y posterior venta'},
 {id:'renovate_rent',label:'Remodelar y arrendar',detail:'Mejoras, flujos de renta y valor de salida'},
 {id:'mitigate_rent',label:'Mitigar y arrendar',detail:'Reducción hipotética de pérdidas físicas'},
 {id:'sell_later',label:'Esperar dos años y vender',detail:'Soportar costes y evolución del mercado'}
];

export const DEFAULT_ASSUMPTIONS:Assumptions={
 price:160000000,monthlyRent:650000,occupancy:.88,annualMaintenance:900000,annualTax:650000,
 annualInsurance:350000,managementRate:.08,saleFeeRate:.035,discountRate:.05,
 annualPriceGrowth:.01,annualRentGrowth:.005,priceVolatility:.065,eventProbability:.008,
 damageFraction:.12,insuranceCoverage:.60,territorialPriceShock:.025,years:10,
 renovationCost:12000000,renovationPriceLift:.10,renovationRentLift:.16,
 mitigationCost:10000000,mitigationDamageFactor:.28,liquidityUrgent:false,
 legalCleared:true,habitable:true
};
export const SCENARIOS:Scenario[]=[
 {id:'base',label:'Mercado de referencia',family:'mercado',summary:'Caso sin señales particulares verificadas.',changes:{},note:'Valores didácticos, no calibrados para una comuna.'},
 {id:'herencia',label:'Inmueble heredado',family:'sucesion',summary:'Decidir conservar, arrendar o vender tras una herencia.',changes:{},note:'Requiere regularización sucesoria, permisos de disposición y revisión tributaria.'},
 {id:'nido_vacio',label:'Nido vacío',family:'familia',summary:'La familia revisa los gastos y necesidades de su vivienda.',changes:{annualMaintenance:1500000},note:'Comparación patrimonial parcial: no modela dos viviendas ni preferencias personales.'},
 {id:'mudanza',label:'Traslado de ciudad',family:'familia',summary:'Cambio voluntario de residencia por trabajo o convivencia.',changes:{},note:'La vivienda alternativa, mudanza y financiamiento deben añadirse para recomendación personal.'},
 {id:'liquidez',label:'Necesidad de liquidez',family:'finanzas',summary:'El horizonte y la disponibilidad de caja condicionan la elección.',changes:{liquidityUrgent:true},note:'No se permite recomendar acciones de ingresos diferidos como sustituto de liquidez urgente.'},
 {id:'alta_demanda',label:'Alta demanda de arriendos',family:'mercado',summary:'Mayor ocupación y renta hipotéticas.',changes:{monthlyRent:900000,occupancy:.97},note:'Verificar contratos comparables, no extrapolar anuncios.'},
 {id:'mercado_debil',label:'Mercado inmobiliario débil',family:'mercado',summary:'Menor ocupación y pérdida hipotética de valor real.',changes:{annualPriceGrowth:-.035,occupancy:.73,annualRentGrowth:-.015},note:'Hipótesis de estrés, no previsión de caída inmobiliaria.'},
 {id:'plusvalia',label:'Nueva infraestructura',family:'territorio',summary:'Escenario de valorización favorable por cambios urbanos.',changes:{annualPriceGrowth:.045,annualRentGrowth:.02},note:'La plusvalía exige ventas comparables, plazos y externalidades verificadas.'},
 {id:'inundacion',label:'Inundación o aluvión',family:'amenaza',summary:'Se ensaya una mayor frecuencia y severidad de daños.',changes:{eventProbability:.07,territorialPriceShock:.08,insuranceCoverage:.25},note:'No asignar estas probabilidades a ninguna ubicación real sin estudio técnico.'},
 {id:'incendio',label:'Incendio forestal',family:'amenaza',summary:'Estrés físico sobre un inmueble en un entorno expuesto.',changes:{eventProbability:.055,damageFraction:.20,insuranceCoverage:.30},note:'Probabilidad y cobertura ficticias; no determina habitabilidad.'},
 {id:'terremoto',label:'Terremoto',family:'amenaza',summary:'Evento poco frecuente con posible pérdida considerable.',changes:{eventProbability:.025,damageFraction:.30,insuranceCoverage:.35},note:'Escenario abstracto, no sustituye análisis estructural o norma sísmica.'},
 {id:'seguridad',label:'Cambio en seguridad barrial',family:'territorio',summary:'Hipótesis sobre percepción y demanda inmobiliaria.',changes:{annualPriceGrowth:-.012,occupancy:.80},note:'No equivale a un índice de delitos; se requieren series comparables.'},
 {id:'costos',label:'Altos costes de mantención',family:'finanzas',summary:'Evalúa sensibilidad a gastos recurrentes.',changes:{annualMaintenance:3000000,annualTax:1200000},note:'Obtener recibos y gastos efectivamente asociados al inmueble.'},
 {id:'sin_titulos',label:'Título pendiente de regularización',family:'sucesion',summary:'Los actos de disposición quedan suspendidos.',changes:{legalCleared:false},note:'No ejecutar transacciones hasta determinar facultades de disposición.'}
];
const bound=(v:number,lo:number,hi:number)=>Math.max(lo,Math.min(hi,v));
export function validateInputs(a:Assumptions):string[]{
 const errors:string[]=[];
 const nonNegative:(keyof Assumptions)[]=['price','monthlyRent','annualMaintenance','annualTax','annualInsurance','renovationCost','mitigationCost'];
 for(const key of nonNegative){const n=a[key];if(typeof n!=='number'||!Number.isFinite(n)||n<0)errors.push('Valor no válido para '+key);}
 if(a.price<=0)errors.push('El precio debe ser mayor a cero.');
 for(const key of ['occupancy','managementRate','saleFeeRate','eventProbability','damageFraction','insuranceCoverage','mitigationDamageFactor'] as const)
  if(!Number.isFinite(a[key])||a[key]<0||a[key]>1)errors.push('Proporción fuera de rango: '+key);
 for(const key of ['discountRate','annualPriceGrowth','annualRentGrowth','priceVolatility','territorialPriceShock','renovationPriceLift','renovationRentLift'] as const)
  if(!Number.isFinite(a[key])||a[key]<=-1||a[key]>2)errors.push('Parámetro fuera de rango: '+key);
 if(!Number.isInteger(a.years)||a.years<1||a.years>40)errors.push('Horizonte entre 1 y 40 años.');
 return errors;
}
export function decisionTree(a:Assumptions,scenario:Scenario):TreeNode[]{
 const nodes:TreeNode[]=[
 {question:'¿La necesidad y la ubicación están documentadas?',resolution:'Usar sólo datos aportados; el escenario territorial es hipotético.',status:'revision'},
 {question:'¿Existen facultades legales verificadas?',resolution:a.legalCleared?'Marcadas como declaradas; falta validación externa.':'Restringir venta y arriendo; remitir a evaluación jurídica.',status:a.legalCleared?'paso':'bloqueo'},
 {question:'¿Hay habitabilidad certificada?',resolution:a.habitable?'Estado informado por el usuario, sin inspección técnica.':'Bloquear todas las alternativas de arriendo hasta inspección.',status:a.habitable?'revision':'bloqueo'}
 ];
 if(scenario.family==='amenaza')nodes.push({question:'¿La amenaza y el riesgo residual están verificados?',resolution:'No. Requiere cartografía oficial y revisión técnica antes de usar probabilidades territoriales.',status:'revision'});
 if(a.liquidityUrgent)nodes.push({question:'¿La decisión requiere caja inmediata?',resolution:'Restringir alternativas que no entregan liquidez inmediata.',status:'bloqueo'});
 nodes.push({question:'¿Qué combinación de valor, pérdida extrema y reversibilidad conviene?',resolution:'Comparar media, percentil 10 y CVaR 10; incorporar objetivos personales antes de decidir.',status:'revision'});
 return nodes;
}
function rng(seed:number){let s=seed>>>0;return ()=>{s=(Math.imul(1664525,s)+1013904223)>>>0;return (s+.5)/4294967296;};}
function gaussian(rand:()=>number):number{return Math.sqrt(-2*Math.log(Math.max(1e-9,rand())))*Math.cos(2*Math.PI*rand());}
function percentile(sorted:number[],p:number){const idx=(sorted.length-1)*p,k=Math.floor(idx);return sorted[k]+(sorted[Math.min(sorted.length-1,k+1)]-sorted[k])*(idx-k);}
function moneyNow(a:Assumptions){return a.price*(1-a.saleFeeRate);}
function blocked(id:ActionId,a:Assumptions):string|undefined{
 if(!a.legalCleared&&id!=='hold')return 'Facultades de disposición no verificadas.';
 if(!a.habitable&&(id==='rent'||id==='renovate_rent'||id==='mitigate_rent'))return 'Habitabilidad sin verificar: arriendo bloqueado.';
 if(a.liquidityUrgent&&id!=='sell_now')return 'No entrega la liquidez inmediata exigida.';
 return undefined;
}
function onePath(id:ActionId,a:Assumptions,rand:()=>number):number{
 if(id==='sell_now')return moneyNow(a);
 const renovate=id==='renovate_sell'||id==='renovate_rent';
 const mitigation=id==='mitigate_rent';
 const rent=id==='rent'||id==='renovate_rent'||id==='mitigate_rent';
 const holding=id==='hold';
 const sellYear=id==='renovate_sell'?1:id==='sell_later'?Math.min(2,a.years):a.years;
 let value=a.price*(renovate?(1+a.renovationPriceLift):1);
 let total=-(renovate?a.renovationCost:0)-(mitigation?a.mitigationCost:0);
 const rRent=a.monthlyRent*(renovate?(1+a.renovationRentLift):1);
 for(let y=1;y<=sellYear;y++){
  const annualGrowth=(1+a.annualPriceGrowth)*Math.exp(a.priceVolatility*gaussian(rand)-.5*a.priceVolatility**2);
  value=Math.max(0,value*annualGrowth);
  let loss=0;
  if(rand()<a.eventProbability){
    const severity=bound(a.damageFraction*(.45+rand()*1.35),0,.95);
    loss=value*severity*(mitigation?a.mitigationDamageFactor:1);
    value=Math.max(0,value-loss);
    const indemnity=loss*a.insuranceCoverage;
    total+=(indemnity-loss)/(1+a.discountRate)**y;
    value*=1-bound(a.territorialPriceShock,0,1);
  }
  const income=rent?rRent*12*Math.pow(1+a.annualRentGrowth,y-1)*a.occupancy*(1-a.managementRate):0;
  const expenses=a.annualMaintenance+a.annualTax+a.annualInsurance;
  total+=(income-expenses)/Math.pow(1+a.discountRate,y);
  if(id==='renovate_sell'&&y===1)break;
 }
 const finalValue=holding?value:value*(1-a.saleFeeRate);
 return total+finalValue/Math.pow(1+a.discountRate,sellYear);
}
export function runDecisionModel(base:Assumptions,scenarioId:ScenarioId,seed=20261027,iterations=1600):DecisionResult{
 const scenario=SCENARIOS.find(s=>s.id===scenarioId)||SCENARIOS[0];
 const a={...base,...scenario.changes};
 const errors=validateInputs(a);
 if(errors.length)throw new Error(errors.join(' '));
 if(!Number.isInteger(iterations)||iterations<100||iterations>30000)throw new Error('Iteraciones fuera de rango.');
 const samples=new Map<ActionId,number[]>();const prng=rng(seed);
 for(const action of ACTIONS)samples.set(action.id,[]);
 // Las rutas de cada acción se reproducen con idéntico seed (no son sin embargo trayectorias pareadas).
 for(const action of ACTIONS){
  if(blocked(action.id,a))continue;
  const actionRand=rng((seed+Math.imul(ACTIONS.indexOf(action)+1,2654435761))>>>0);
  const series=samples.get(action.id)!;
  for(let k=0;k<iterations;k++)series.push(onePath(action.id,a,actionRand));
 }
 void prng;
 const sellBaseline=moneyNow(a);
 const results:ActionResult[]=ACTIONS.map(action=>{
  const reason=blocked(action.id,a),values=samples.get(action.id)!.sort((x,y)=>x-y);
  if(reason)return {id:action.id,label:action.label,allowed:false,reason,mean:0,p10:0,median:0,p90:0,cvar10:0,probBetterThanSell:0,values:[]};
  const n=values.length,p10=percentile(values,.1),worst=values.slice(0,Math.max(1,Math.ceil(n*.1)));
  return {id:action.id,label:action.label,allowed:true,mean:values.reduce((s,v)=>s+v,0)/n,
   p10,median:percentile(values,.5),p90:percentile(values,.9),
   cvar10:worst.reduce((s,v)=>s+v,0)/worst.length,
   probBetterThanSell:values.filter(x=>x>sellBaseline).length/n,values};
 });
 const eligible=results.filter(r=>r.allowed).sort((x,y)=>y.mean-x.mean);
 const warnings=['Simulación didáctica en CLP reales; no representa tasación, estudio geológico ni pronóstico.',
  'Resultados sensibles a distribución, costes, impuestos omitidos y condiciones no modeladas.',
  'Las probabilidades de amenaza se han supuesto; no se calculan a partir de la dirección del inmueble.',
  'Revisión jurídica y técnica obligatoria antes de operar.'];
 if(scenario.family==='familia')warnings.push('No modela valores subjetivos, otras viviendas ni mudanza: no recomendar solo por valor presente.');
 return {assumptions:a,scenario,seed,iterations,actions:results,top:eligible[0],warnings,tree:decisionTree(a,scenario)};
}
export function pesosCLP(value:number):string{return Number.isFinite(value)?new Intl.NumberFormat('es-CL',{style:'currency',currency:'CLP',maximumFractionDigits:0}).format(Math.round(value)):'—';}
export function millionCLP(value:number):string{return (value/1000000).toLocaleString('es-CL',{maximumFractionDigits:1,minimumFractionDigits:1})+' MM';}
