/** Deep Living / Business Location – local first, no synthetic territorial claims.
 * Manual declarations are NOT external verification. Currency: CLP.
 */
export type ActivityId='psychology'|'dentistry'|'accounting'|'restaurant'|'retail'|'other';
export type LocationStatus='unknown'|'declared_compatible'|'declared_incompatible';
export type SourceKind='declared'|'observed'|'derived'|'unavailable';
export type LocationCandidate={
 id:string;name:string;address:string;commune:string;
 rent:number;commonCosts:number;otherMonthlyCosts:number;setupCost:number;
 estimatedMonthlyUnits:number;unitPrice:number;variableCostPerUnit:number;
 travelMinutes:number|null;parkingSpaces:number|null;
 zoning:LocationStatus;
};
export type BusinessCase={activity:ActivityId;maxMonthlyOccupancy:number;months:number;candidates:LocationCandidate[]};
export type CandidateEvaluation={
 id:string;name:string;status:'blocked'|'review';
 blockReasons:string[];reviewReasons:string[];
 monthlyOccupancy:number;monthlyFixed:number;contributionPerUnit:number|null;
 breakEvenUnits:number|null;netMonthly:number|null;horizonCashflow:number|null;
 scenarios:{label:string;units:number;netMonthly:number|null}[];
 evidence:Record<string,SourceKind>;
};
export const PROFILES:{id:ActivityId;label:string;question:string;required:string[]}[]=[
 {id:'psychology',label:'Consulta de psicología',question:'¿Tus pacientes llegarán en transporte público, automóvil o caminando?',required:['Destino permitido para consulta','Privacidad y aislamiento acústico','Acceso de pacientes']},
 {id:'dentistry',label:'Clínica odontológica',question:'¿Cuántos sillones y qué prestaciones necesitas habilitar?',required:['Destino compatible','Factibilidad y permisos sanitarios','Accesibilidad para pacientes']},
 {id:'accounting',label:'Oficina contable',question:'¿Cuántos clientes asistirán presencialmente cada semana?',required:['Destino compatible','Conectividad y privacidad','Costes mensuales']},
 {id:'restaurant',label:'Local gastronómico',question:'¿Predominarán salón, retiro o reparto a domicilio?',required:['Uso permitido y patente','Factibilidad sanitaria y extracción','Logística y abastecimiento']},
 {id:'retail',label:'Tienda o comercio',question:'¿Las ventas dependen del paso espontáneo o de clientes que llegan especialmente?',required:['Uso y patente','Acceso y exhibición','Carga y descarga']},
 {id:'other',label:'Otra actividad',question:'¿Qué necesitas que tenga el entorno para que tu negocio funcione?',required:['Uso permitido','Accesibilidad','Coste de ocupación']}
];
export const EXAMPLE_CASE:BusinessCase={
 activity:'psychology',maxMonthlyOccupancy:700000,months:24,candidates:[
 {id:'A',name:'Local A · ejemplo',address:'Dirección no proporcionada',commune:'Chile',rent:450000,commonCosts:60000,otherMonthlyCosts:80000,setupCost:3000000,estimatedMonthlyUnits:55,unitPrice:35000,variableCostPerUnit:4000,travelMinutes:null,parkingSpaces:null,zoning:'unknown'},
 {id:'B',name:'Local B · ejemplo',address:'Dirección no proporcionada',commune:'Chile',rent:620000,commonCosts:85000,otherMonthlyCosts:80000,setupCost:1500000,estimatedMonthlyUnits:65,unitPrice:35000,variableCostPerUnit:4000,travelMinutes:null,parkingSpaces:null,zoning:'unknown'}
]};
export function validateBusinessCase(data:BusinessCase):string[]{
 const errors:string[]=[];
 if(!PROFILES.some(p=>p.id===data.activity))errors.push('Actividad desconocida');
 if(!Number.isFinite(data.maxMonthlyOccupancy)||data.maxMonthlyOccupancy<0)errors.push('Presupuesto mensual inválido');
 if(!Number.isInteger(data.months)||data.months<1||data.months>120)errors.push('Horizonte entre 1 y 120 meses');
 if(data.candidates.length<1||data.candidates.length>6)errors.push('Se requieren entre una y seis alternativas');
 const ids=new Set<string>();
 for(const c of data.candidates){
  if(!c.id||ids.has(c.id))errors.push('Identificador duplicado o vacío');
  ids.add(c.id);
  for(const field of ['rent','commonCosts','otherMonthlyCosts','setupCost','estimatedMonthlyUnits','unitPrice','variableCostPerUnit'] as const){
   if(!Number.isFinite(c[field])||c[field]<0)errors.push('Valor no válido en '+c.name+': '+field);
  }
  if(c.travelMinutes!==null&&(!Number.isFinite(c.travelMinutes)||c.travelMinutes<0))errors.push('Tiempo de viaje inválido');
  if(c.parkingSpaces!==null&&(!Number.isInteger(c.parkingSpaces)||c.parkingSpaces<0))errors.push('Estacionamientos inválidos');
  if(!['unknown','declared_compatible','declared_incompatible'].includes(c.zoning))errors.push('Declaración normativa inválida');
 }
 return errors;
}
export function evaluateBusinessCase(data:BusinessCase):CandidateEvaluation[]{
 const problems=validateBusinessCase(data);
 if(problems.length)throw new Error(problems.join('; '));
 return data.candidates.map(c=>{
  const monthlyOccupancy=c.rent+c.commonCosts;
  const monthlyFixed=monthlyOccupancy+c.otherMonthlyCosts;
  const blockReasons:string[]=[];
  const reviewReasons:string[]=[];
  if(monthlyOccupancy>data.maxMonthlyOccupancy)blockReasons.push('Supera el presupuesto máximo mensual de ocupación');
  if(c.zoning==='declared_incompatible')blockReasons.push('Uso declarado incompatible: no contratar sin revisión');
  if(c.zoning==='unknown')reviewReasons.push('Uso de suelo, patente y habilitación sin verificar');
  if(c.zoning==='declared_compatible')reviewReasons.push('Compatibilidad declarada, sin revisión documental independiente');
  if(!c.address.trim()||c.address==='Dirección no proporcionada')reviewReasons.push('Falta dirección confirmada para análisis territorial');
  if(c.travelMinutes===null)reviewReasons.push('No hay tiempos de viaje medidos');
  if(c.parkingSpaces===null)reviewReasons.push('Disponibilidad de estacionamiento no verificada');
  const margin=c.unitPrice-c.variableCostPerUnit;
  const useful=margin>0;
  if(!useful)reviewReasons.push('Margen unitario inexistente o insuficiente para evaluar equilibrio');
  const netMonthly=useful?margin*c.estimatedMonthlyUnits-monthlyFixed:null;
  return {
   id:c.id,name:c.name,status:blockReasons.length?'blocked':'review',blockReasons,reviewReasons,
   monthlyOccupancy,monthlyFixed,contributionPerUnit:useful?margin:null,
   breakEvenUnits:useful?Math.ceil(monthlyFixed/margin):null,
   netMonthly,horizonCashflow:netMonthly===null?null:netMonthly*data.months-c.setupCost,
   scenarios:[.7,1,1.3].map(f=>({label:Math.round(f*100)+'% actividad',units:Math.round(c.estimatedMonthlyUnits*f),
    netMonthly:useful?Math.round(c.estimatedMonthlyUnits*f)*margin-monthlyFixed:null})),
   evidence:{rent:'declared',commonCosts:'declared',travelMinutes:c.travelMinutes===null?'unavailable':'declared',
    parkingSpaces:c.parkingSpaces===null?'unavailable':'declared',zoning:'declared',finance:'derived'}
  };
 });
}
