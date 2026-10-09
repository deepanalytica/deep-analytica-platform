import {makePrecheck,type Finding,type Claim} from './evidence';
import type {Property} from './core';

export type Report = {
 schema_version:'DL-REPORT-0.2';
 report_type:'precheck_preliminar';
 issued_at:string;
 verified_external_sources:0;
 verified_external_data:false;
 property:{id:string;name:string;address:string;commune:string;price_clp:number;operation_type:string};
 purpose:string;
 budget_clp:number;
 findings:Finding[];
 claims:Claim[];
 missing_verifications:number;
 declaration:'Este documento se basa en antecedentes declarados por el usuario, sin consulta en línea a fuentes públicas ni certificación técnica o jurídica.';
 required_followups:string[];
};
export function buildPrecheckReport(property:Property,purpose:string,budget:number,now:Date=new Date()):Report {
 const p=makePrecheck(property,purpose,budget);
 return {
  schema_version:'DL-REPORT-0.2',report_type:'precheck_preliminar',issued_at:now.toISOString(),
  verified_external_sources:0,verified_external_data:false,
  property:{id:property.id,name:property.title,address:property.address,commune:property.commune,
   price_clp:property.price,operation_type:property.operation_type},
  purpose,budget_clp:Math.max(0,budget),findings:p.findings,claims:p.claims,
  missing_verifications:p.missingCount,
  declaration:'Este documento se basa en antecedentes declarados por el usuario, sin consulta en línea a fuentes públicas ni certificación técnica o jurídica.',
  required_followups:[
   'Confirmar dirección, rol e identidad del inmueble con documentos adecuados.',
   'Revisar normativa y factibilidad según la actividad propuesta.',
   'Obtener información de accesibilidad y transporte con cobertura suficiente.',
   'Solicitar antecedentes técnicos de amenazas si corresponde.',
   'Verificar títulos, representación, gravámenes y condiciones contractuales mediante profesionales competentes.'
  ]
 };
}
export function safeReportFilename(report:Report):string {
 const name=report.property.name.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/(^-|-$)/g,'').slice(0,42);
 return 'deep-living-precheck-'+(name||'propiedad')+'-'+report.issued_at.slice(0,10)+'.json';
}
