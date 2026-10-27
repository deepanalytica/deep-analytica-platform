import {useMemo,useState} from 'react';
import {Activity,AlertTriangle,ArrowRight,BarChart3,Building2,CheckCircle2,ChevronDown,Compass,MapPin,Plus,ShieldAlert,SlidersHorizontal,Trash2,Wallet} from 'lucide-react';
import {EXAMPLE_CASE,PROFILES,evaluateBusinessCase,validateBusinessCase,type BusinessCase,type LocationCandidate} from './location-fit-engine';
import './business-location.css';
const clp=(n:number|null)=>n===null?'Sin cálculo':new Intl.NumberFormat('es-CL',{style:'currency',currency:'CLP',maximumFractionDigits:0}).format(n);
const N=(v:string)=>v===''?0:Number(v);
function Field({label,value,onChange,min=0}:{label:string;value:number;onChange:(v:number)=>void;min?:number}){
 return <label className="bl-field">{label}<input type="number" min={min} step="1" value={value} onChange={e=>onChange(N(e.target.value))}/></label>;
}
export default function BusinessLocation(){
 const [study,setStudy]=useState<BusinessCase>(()=>structuredClone(EXAMPLE_CASE));
 const [selected,setSelected]=useState('A');
 const [expanded,setExpanded]=useState(false);
 const profile=PROFILES.find(x=>x.id===study.activity)||PROFILES[0];
 const errors=useMemo(()=>validateBusinessCase(study),[study]);
 const results=useMemo(()=>errors.length?[]:evaluateBusinessCase(study),[errors,study]);
 const candidate=study.candidates.find(c=>c.id===selected)||study.candidates[0];
 const chosen=results.find(r=>r.id===candidate?.id);
 const update=<K extends keyof LocationCandidate>(key:K,value:LocationCandidate[K])=>{
  setStudy(s=>({...s,candidates:s.candidates.map(c=>c.id===candidate.id?{...c,[key]:value}:c)}));
 };
 function addCandidate(){
  if(study.candidates.length>=6)return;
  const id='C'+Date.now().toString(36);
  const next:LocationCandidate={...structuredClone(EXAMPLE_CASE.candidates[0]),id,name:'Nueva alternativa',address:'',commune:'',rent:0,commonCosts:0,otherMonthlyCosts:0,setupCost:0,estimatedMonthlyUnits:0,travelMinutes:null,parkingSpaces:null,zoning:'unknown'};
  setStudy(s=>({...s,candidates:[...s.candidates,next]}));setSelected(id);
 }
 function removeCandidate(){
  if(study.candidates.length<=1)return;
  const next=study.candidates.filter(c=>c.id!==candidate.id);
  setStudy(s=>({...s,candidates:next}));setSelected(next[0].id);
 }
 return <section className="bl-root" aria-labelledby="bl-title">
  <div className="bl-hero">
   <div className="bl-eyebrow"><Compass size={16}/> DEEP LIVING / BUSINESS LOCATION INTELLIGENCE</div>
   <h1 id="bl-title">¿Te conviene esta ubicación para tu negocio?</h1>
   <p>Compara hasta seis locales con tus propias cifras. La factibilidad normativa, transporte y entorno permanecen pendientes hasta disponer de fuentes y verificaciones reales.</p>
   <div className="bl-hero-footer"><span><Activity size={15}/> Cálculo local, inmediato y reproducible</span><span>LABORATORIO · SIN DATOS TERRITORIALES CONECTADOS</span></div>
  </div>
  <div className="bl-warning"><ShieldAlert size={19}/><div><strong>Datos de ejemplo y declaraciones, no hechos verificados.</strong> Los importes iniciales son ficticios, no existen tasas de tráfico, demanda ni permisos obtenidos por dirección. No tomes una decisión contractual solo con este análisis.</div></div>
  <div className="bl-layout">
   <aside className="bl-panel bl-side">
    <div className="bl-panel-head"><strong><SlidersHorizontal size={16}/> Tu negocio</strong><span>01 / 03</span></div>
    <label className="bl-field">Actividad
     <select value={study.activity} onChange={e=>setStudy(s=>({...s,activity:e.target.value as BusinessCase['activity']}))}>{PROFILES.map(p=><option key={p.id} value={p.id}>{p.label}</option>)}</select>
    </label>
    <div className="bl-question"><span>PREGUNTA PARA EL USUARIO</span><strong>{profile.question}</strong><small>Registra esta necesidad en la evaluación profesional antes de contratar.</small></div>
    <Field label="Presupuesto máximo de ocupación / mes (CLP)" value={study.maxMonthlyOccupancy} onChange={v=>setStudy(s=>({...s,maxMonthlyOccupancy:v}))}/>
    <Field label="Horizonte de comparación (meses)" min={1} value={study.months} onChange={v=>setStudy(s=>({...s,months:v}))}/>
    <div className="bl-required"><strong>Verificaciones imprescindibles</strong>{profile.required.map(q=><span key={q}><AlertTriangle size={13}/>{q}</span>)}</div>
    <button type="button" className="bl-reset" onClick={()=>{setStudy(structuredClone(EXAMPLE_CASE));setSelected('A');}}>Restablecer ejemplo</button>
   </aside>
   <div className="bl-main">
    <div className="bl-panel">
     <div className="bl-panel-head"><strong><Building2 size={16}/> Alternativas</strong><span>02 / 03</span></div>
     <div className="bl-choices" role="group" aria-label="Seleccionar inmueble">
      {study.candidates.map(c=><button type="button" key={c.id} className={'bl-choice '+(candidate?.id===c.id?'chosen':'')} onClick={()=>setSelected(c.id)} aria-pressed={candidate?.id===c.id}><MapPin size={15}/><span>{c.name||'Sin nombre'}</span></button>)}
      <button type="button" className="bl-add" onClick={addCandidate} disabled={study.candidates.length>=6}><Plus size={15}/> Agregar</button>
     </div>
     {candidate&&<div className="bl-editor">
      <div className="bl-editor-title"><strong>Datos declarados del inmueble</strong><button type="button" disabled={study.candidates.length===1} onClick={removeCandidate} title="Eliminar alternativa"><Trash2 size={16}/> Quitar</button></div>
      <div className="bl-fields">
       <label className="bl-field">Nombre<input value={candidate.name} onChange={e=>update('name',e.target.value)}/></label>
       <label className="bl-field">Comuna (cualquier comuna de Chile)<input value={candidate.commune} onChange={e=>update('commune',e.target.value)}/></label>
       <label className="bl-field bl-span">Dirección / referencia<input value={candidate.address} onChange={e=>update('address',e.target.value)}/></label>
       <Field label="Arriendo mensual (CLP)" value={candidate.rent} onChange={v=>update('rent',v)}/>
       <Field label="Gastos comunes mensuales (CLP)" value={candidate.commonCosts} onChange={v=>update('commonCosts',v)}/>
       <Field label="Otros gastos fijos del negocio / mes (CLP)" value={candidate.otherMonthlyCosts} onChange={v=>update('otherMonthlyCosts',v)}/>
       <Field label="Costo inicial de habilitación (CLP)" value={candidate.setupCost} onChange={v=>update('setupCost',v)}/>
       <Field label="Servicios/ventas esperados por mes" value={candidate.estimatedMonthlyUnits} onChange={v=>update('estimatedMonthlyUnits',v)}/>
       <Field label="Ingreso promedio por unidad (CLP)" value={candidate.unitPrice} onChange={v=>update('unitPrice',v)}/>
       <Field label="Costo variable por unidad (CLP)" value={candidate.variableCostPerUnit} onChange={v=>update('variableCostPerUnit',v)}/>
       <label className="bl-field">Compatibilidad de uso (declarada)
        <select value={candidate.zoning} onChange={e=>update('zoning',e.target.value as LocationCandidate['zoning'])}>
         <option value="unknown">No verificada</option><option value="declared_compatible">Creo que es compatible; falta comprobar</option><option value="declared_incompatible">Declarada incompatible</option>
        </select>
       </label>
      </div>
      <button className="bl-expand" type="button" onClick={()=>setExpanded(v=>!v)} aria-expanded={expanded}>Información de acceso declarada <ChevronDown size={15}/></button>
      {expanded&&<div className="bl-fields">
       <label className="bl-field">Minutos de viaje (vacío = desconocido)<input type="number" min="0" value={candidate.travelMinutes??''} onChange={e=>update('travelMinutes',e.target.value===''?null:N(e.target.value))}/></label>
       <label className="bl-field">Estacionamientos propios (vacío = desconocido)<input type="number" min="0" value={candidate.parkingSpaces??''} onChange={e=>update('parkingSpaces',e.target.value===''?null:N(e.target.value))}/></label>
      </div>}
     </div>}
    </div>
    <div className="bl-panel">
     <div className="bl-panel-head"><strong><BarChart3 size={16}/> Tablero de decisión</strong><span>03 / 03</span></div>
     {errors.length>0?<div className="bl-error" role="alert">{errors.map((e,i)=><p key={i}>{e}</p>)}</div>:<>
      <div className="bl-kpis">
       <div><span>Ocupación mensual · {chosen?.name}</span><strong>{clp(chosen?.monthlyOccupancy??null)}</strong><small>Arriendo y gastos comunes declarados</small></div>
       <div><span>Ventas mínimas para equilibrio</span><strong>{chosen?.breakEvenUnits===null?'Indeterminado':chosen?.breakEvenUnits}</strong><small>Incluye otros gastos fijos y margen unitario</small></div>
       <div><span>Resultado operativo mensual estimado</span><strong>{clp(chosen?.netMonthly??null)}</strong><small>Ingresos estimados, no flujo observado</small></div>
      </div>
      <div className="bl-evidence">
       <strong><ShieldAlert size={16}/> Factibilidad: {chosen?.status==='blocked'?'BLOQUEADO POR REGLA':'REQUIERE REVISIÓN'}</strong>
       {chosen?.blockReasons.map(x=><p className="bl-block" key={x}>{x}</p>)}
       {chosen?.reviewReasons.map(x=><p key={x}>{x}</p>)}
       <span>Fuente de ingresos y costes: usuario · Transporte: {chosen?.evidence.travelMinutes==='unavailable'?'sin datos':'declarado'} · Permisos: no verificados</span>
      </div>
      <div className="bl-section-title"><h2>Comparación económica</h2><span>CLP · supuestos constantes · no incluye impuestos ni financiamiento</span></div>
      <div className="bl-table-wrap"><table className="bl-table"><thead><tr><th>Alternativa</th><th>Ocupación / mes</th><th>Equilibrio</th><th>Neto / mes estimado</th><th>Resultado {study.months} meses*</th><th>Revisión</th></tr></thead><tbody>{results.map(r=><tr key={r.id} className={r.id===candidate?.id?'selected':''}><td><strong>{r.name}</strong></td><td>{clp(r.monthlyOccupancy)}</td><td>{r.breakEvenUnits??'—'}</td><td>{clp(r.netMonthly)}</td><td>{clp(r.horizonCashflow)}</td><td>{r.status==='blocked'?'Bloqueado':'Pendiente'}</td></tr>)}</tbody></table></div>
      <p className="bl-note">*Resultado aritmético sin descuento financiero, inflación, impuestos, variaciones de ocupación ni financiación. No es VAN ni pronóstico de ventas. Ninguna alternativa se califica como jurídicamente apta.</p>
      <div className="bl-section-title"><h2>Sensibilidad de actividad</h2><span>{candidate?.name}</span></div>
      <div className="bl-scenarios">{chosen?.scenarios.map(s=><div key={s.label}><span>{s.label}</span><strong>{clp(s.netMonthly)}</strong><small>{s.units} unidades/mes</small></div>)}</div>
     </>}
    </div>
   </div>
  </div>
  <div className="bl-source"><CheckCircle2 size={17}/><div><strong>Qué calculó realmente el sistema</strong><p>Los indicadores financieros se recalculan al editar cantidades. No hay integración con Google Maps, catastro de tránsito, estacionamientos, ventas reales, normativa municipal ni Deep Geo. Los datos desconocidos se muestran como desconocidos, no como cero.</p></div><ArrowRight size={17}/></div>
 </section>;
}
