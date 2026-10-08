import assert from 'node:assert/strict';
import test from 'node:test';
import {commission,matchDemand,mayAdvance,parseNeed,priorities} from '../src/core';
import {demoDemands,demoProperties,demoDeals,demoTasks} from '../src/demo';
test('comision con IVA y sin IVA',()=>{
 assert.deepEqual(commission(100_000_000,2,true),{net:2_000_000,vat:380_000,total:2_380_000});
 assert.equal(commission(100_000_000,2,false).total,2_000_000);
});
test('interpretar presupuesto, comuna, dormitorios y estacionamiento',()=>{
 const p=parseNeed('Busco casa en Curicó hasta 120 millones, 3 dormitorios con estacionamiento');
 assert.equal(p.budget_max,120_000_000);assert.equal(p.commune,'curico');assert.equal(p.bedrooms_min,3);assert.equal(p.parking_required,true);
});
test('filtro duro rechaza fuera de precio o tipo',()=>{
 const m=matchDemand(demoDemands[0],demoProperties);
 assert.equal(m.length,2);assert.ok(m.every(x=>x.property.price<=120_000_000)); assert.ok(m.every(x=>x.property.property_type==='casa'));
});
test('bloqueos impiden el avance y no permiten saltos',()=>{
 assert.equal(mayAdvance(4,5,demoTasks,'O-301').ok,false);
 assert.equal(mayAdvance(4,6,[], 'O-301').ok,false);
 assert.equal(mayAdvance(4,5,[], 'O-301').ok,true);
});
test('prioridades generadas solo desde tareas existentes',()=>{
 assert.ok(priorities(demoDeals,demoTasks,new Date('2026-10-12')).some(a=>a.level==='alta'));
 assert.ok(priorities([],demoTasks).length===0);
});
