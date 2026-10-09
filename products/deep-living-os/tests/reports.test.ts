import test from 'node:test';
import assert from 'node:assert/strict';
import {buildPrecheckReport,safeReportFilename} from '../src/reports';
import {demoProperties} from '../src/demo';
test('reporte reconoce que no hay fuentes externas conectadas',()=>{
 const r=buildPrecheckReport(demoProperties[0],'oficina contable',250000,new Date('2026-10-08T12:00:00Z'));
 assert.equal(r.schema_version,'DL-REPORT-0.2');
 assert.equal(r.verified_external_data,false);
 assert.equal(r.verified_external_sources,0);
 assert.ok(r.missing_verifications>=5);
 assert.equal(r.findings.find(x=>x.key==='safety')?.status,'desconocido');
 assert.match(JSON.stringify(r),/sin consulta en línea/);
});
test('el nombre de archivo no contiene caracteres extraños o identificadores sensibles',()=>{
 const r=buildPrecheckReport(demoProperties[0],'casa',123,new Date('2026-10-08T12:00:00Z'));
 assert.match(safeReportFilename(r),/^deep-living-precheck-[a-z0-9-]+-2026-10-08\.json$/);
});
