import assert from 'node:assert/strict';
import test from 'node:test';
import {assertPublishable,compareEligible,eligibleClaim,makePrecheck,type Claim} from '../src/evidence';
import {demoProperties} from '../src/demo';
test('datos de inventario no se presentan como hechos externos verificados',()=>{
 const p=makePrecheck(demoProperties[0],'vivienda',110000000);
 assert.equal(p.verifiedCount,0);
 assert.equal(p.declaredCount,2);
 assert.ok(p.missingCount>=5);
 assert.equal(p.findings.find(x=>x.key==='hazard')?.status,'desconocido');
});
test('no hay recomendación integral si faltan datos normativos o naturales',()=>{
 const a=makePrecheck(demoProperties[1],'oficina',150000000);
 const b=makePrecheck(demoProperties[2],'oficina',130000000);
 assert.equal(compareEligible(a,b),'insuficiente');
});
test('bloquear etiquetas verificadas sin respaldo',()=>{
 const c:Claim={id:'x',label:'Flujo peatonal',value:'450',verification:'verificado',source:null,observed_at:null,license_reviewed:false,resolution:null,limitation:'sin aforo'};
 assert.equal(eligibleClaim(c),false);
 assert.deepEqual(assertPublishable([c]),{ok:false,blocked:['x']});
});
test('dato observado completo puede publicarse como afirmación verificada',()=>{
 const c:Claim={id:'y',label:'Habitantes',value:'23',verification:'verificado',source:'INE Censo',observed_at:'2024-04-01',license_reviewed:true,resolution:'manzana',limitation:'residentes, no población diurna'};
 assert.equal(eligibleClaim(c),true);
});
