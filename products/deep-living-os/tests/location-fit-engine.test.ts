import test from 'node:test';
import assert from 'node:assert/strict';
import {EXAMPLE_CASE,PROFILES,evaluateBusinessCase,validateBusinessCase,type BusinessCase} from '../src/location-fit-engine';
const copy=():BusinessCase=>structuredClone(EXAMPLE_CASE);
test('perfiles de actividad con preguntas distintas',()=>{
 assert.equal(PROFILES.length,6);
 assert.equal(new Set(PROFILES.map(x=>x.id)).size,6);
 assert.notEqual(PROFILES[0].question,PROFILES[1].question);
});
test('no inventa datos de accesibilidad ni disponibilidad de estacionamientos',()=>{
 const r=evaluateBusinessCase(copy());
 assert.equal(r[0].evidence.travelMinutes,'unavailable');
 assert.equal(r[0].evidence.parkingSpaces,'unavailable');
 assert.ok(r[0].reviewReasons.some(x=>x.includes('viaje')));
});
test('prohibición declarada bloquea, sin convertir declaración positiva en certificado',()=>{
 const d=copy();d.candidates[0].zoning='declared_incompatible';
 assert.equal(evaluateBusinessCase(d)[0].status,'blocked');
 d.candidates[0].zoning='declared_compatible';
 assert.ok(evaluateBusinessCase(d)[0].reviewReasons.some(x=>x.includes('sin revisión')));
});
test('presupuesto excluye y no se compensa con mejores ingresos',()=>{
 const d=copy();d.maxMonthlyOccupancy=100000;
 d.candidates[0].estimatedMonthlyUnits=500;
 assert.equal(evaluateBusinessCase(d)[0].status,'blocked');
});
test('punto de equilibrio usa margen y coste fijo, no ingresos brutos',()=>{
 const r=evaluateBusinessCase(copy())[0];
 assert.equal(r.contributionPerUnit,31000);
 assert.equal(r.monthlyFixed,590000);
 assert.equal(r.breakEvenUnits,20);
 assert.equal(r.netMonthly,1115000);
});
test('proyección resta inversión inicial y preserva escenarios',()=>{
 const r=evaluateBusinessCase(copy())[0];
 assert.equal(r.horizonCashflow,r.netMonthly!*24-3000000);
 assert.equal(r.scenarios.length,3);
 assert.ok(r.scenarios[0].netMonthly!<r.scenarios[2].netMonthly!);
});
test('sin margen positivo no hay falsa rentabilidad calculada',()=>{
 const d=copy();d.candidates[0].variableCostPerUnit=40000;
 const r=evaluateBusinessCase(d)[0];
 assert.equal(r.netMonthly,null);assert.equal(r.breakEvenUnits,null);
});
test('valida números negativos, horizonte y duplicados',()=>{
 const d=copy();d.candidates[0].rent=-4;d.candidates[1].id='A';d.months=0;
 assert.ok(validateBusinessCase(d).length>=3);
 assert.throws(()=>evaluateBusinessCase(d));
});
test('los parámetros se pueden evaluar en cualquier comuna sin geografía codificada',()=>{
 const d=copy();d.candidates[0].commune='Arica';d.candidates[1].commune='Punta Arenas';
 assert.equal(evaluateBusinessCase(d).length,2);
});
