import test from 'node:test';
import assert from 'node:assert/strict';
import {DEFAULT_ASSUMPTIONS,SCENARIOS,runDecisionModel,validateInputs,type Assumptions} from '../src/decision-engine';

const model=(updates:Partial<Assumptions>={},scenario='base')=>runDecisionModel({...DEFAULT_ASSUMPTIONS,...updates},scenario as typeof SCENARIOS[number]['id'],20261027,500);
const get=(data:ReturnType<typeof model>,id:string)=>data.actions.find(a=>a.id===id)!;
test('el motor produce los mismos resultados para la misma semilla',()=>{
 const a=model(),b=model();
 assert.deepEqual(a.actions.map(x=>({id:x.id,mean:x.mean,p10:x.p10,cvar10:x.cvar10})),b.actions.map(x=>({id:x.id,mean:x.mean,p10:x.p10,cvar10:x.cvar10})));
});
test('parámetros financieros fuera de rango se rechazan explícitamente',()=>{
 assert.ok(validateInputs({...DEFAULT_ASSUMPTIONS,price:-1}).length>0);
 assert.ok(validateInputs({...DEFAULT_ASSUMPTIONS,occupancy:2}).length>0);
 assert.throws(()=>model({discountRate:-1}),/fuera de rango/);
});
test('título no regularizado impide disposición y arriendo',()=>{
 const out=model({legalCleared:false});
 assert.equal(get(out,'sell_now').allowed,false);
 assert.equal(get(out,'rent').allowed,false);
 assert.equal(get(out,'hold').allowed,true);
 assert.ok(out.tree.some(x=>x.status==='bloqueo'));
});
test('habitabilidad no verificada bloquea arriendos',()=>{
 const out=model({habitable:false});
 assert.equal(get(out,'rent').allowed,false);
 assert.equal(get(out,'renovate_rent').allowed,false);
 assert.equal(get(out,'mitigate_rent').allowed,false);
 assert.equal(get(out,'sell_now').allowed,true);
});
test('liquidez inmediata evita alternativas diferidas',()=>{
 const out=model({liquidityUrgent:true});
 assert.equal(get(out,'sell_now').allowed,true);
 assert.equal(get(out,'rent').allowed,false);
 assert.equal(get(out,'sell_later').allowed,false);
});
test('con nulo crecimiento, sin eventos y sin volatilidad la distribución es determinista',()=>{
 const out=model({priceVolatility:0,eventProbability:0,annualPriceGrowth:0,annualRentGrowth:0});
 const sell=get(out,'sell_now'),rent=get(out,'rent');
 assert.equal(sell.p10,sell.p90);
 assert.ok(Math.abs(rent.p10-rent.p90)<.01);
});
test('un arriendo más alto mejora el valor de la alternativa arrendar, manteniendo la semilla',()=>{
 const low=model({monthlyRent:250000}),high=model({monthlyRent:950000});
 assert.ok(get(high,'rent').mean>get(low,'rent').mean);
});
test('seguro y riesgo no son certificaciones: escenarios mantienen advertencias',()=>{
 const out=model({},'inundacion');
 assert.ok(out.warnings.some(w=>w.includes('probabilidades')));
 assert.equal(out.scenario.family,'amenaza');
 assert.ok(out.tree.some(t=>t.question.includes('amenaza')));
});
test('se calculan percentiles y CVaR con relación ordinal coherente',()=>{
 const out=model();
 for(const a of out.actions.filter(x=>x.allowed)){
  assert.ok(a.cvar10<=a.p10+1e-6);
  assert.ok(a.p10<=a.median+1e-6);
  assert.ok(a.median<=a.p90+1e-6);
  assert.ok(a.probBetterThanSell>=0&&a.probBetterThanSell<=1);
 }
});
test('el modelo solo expone acciones y escenarios conocidos',()=>{
 assert.equal(model().actions.length,7);
 assert.equal(SCENARIOS.length,14);
 assert.throws(()=>runDecisionModel(DEFAULT_ASSUMPTIONS,'base',123,5),/Iteraciones/);
});
