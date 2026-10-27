import {useEffect,useState} from 'react';
import {Activity,AlertTriangle,ArrowRight,BarChart3,BookOpen,CheckCircle2,ChevronDown,Download,GitBranch,Info,Layers3,RefreshCcw,ShieldAlert,SlidersHorizontal} from 'lucide-react';
import type {Property} from './core';
import {ACTIONS,DEFAULT_ASSUMPTIONS,SCENARIOS,runDecisionModelProgressive,millionCLP,type Assumptions,type DecisionProgress,type DecisionResult,type ScenarioId} from './decision-engine';
import './decision-intelligence.css';

type Props={properties:Property[]};
type Param={key:keyof Assumptions;label:string;min:number;max:number;step:number;unit:string};
const params:Param[]=[
 {key:'price',label:'Valor estimado actual',min:1000000,max:100000000000,step:1000000,unit:'CLP'},
 {key:'monthlyRent',label:'Arriendo mensual estimado',min:0,max:50000000,step:10000,unit:'CLP'},
 {key:'occupancy',label:'Ocupación anual',min:0,max:1,step:.01,unit:'0 a 1'},
 {key:'annualMaintenance',label:'Mantención anual',min:0,max:50000000,step:50000,unit:'CLP'},
 {key:'annualTax',label:'Contribuciones anuales',min:0,max:20000000,step:50000,unit:'CLP'},
 {key:'discountRate',label:'Tasa de descuento real',min:0,max:.4,step:.005,unit:'0 a 1'},
 {key:'annualPriceGrowth',label:'Variación real del valor',min:-.4,max:.5,step:.005,unit:'anual'},
 {key:'priceVolatility',label:'Volatilidad hipotética',min:0,max:.7,step:.005,unit:'anual'},
 {key:'eventProbability',label:'Probabilidad anual de evento',min:0,max:1,step:.005,unit:'0 a 1'},
 {key:'damageFraction',label:'Severidad base del daño',min:0,max:1,step:.01,unit:'0 a 1'},
 {key:'insuranceCoverage',label:'Cobertura efectiva de pérdida',min:0,max:1,step:.01,unit:'0 a 1'},
 {key:'renovationCost',label:'Coste de remodelación',min:0,max:200000000,step:1000000,unit:'CLP'},
 {key:'mitigationCost',label:'Coste de mitigación',min:0,max:200000000,step:1000000,unit:'CLP'}
];
const pctKeys=new Set<keyof Assumptions>(['occupancy','discountRate','annualPriceGrowth','priceVolatility','eventProbability','damageFraction','insuranceCoverage']);
const STEP_NAMES:{[key:string]:string}={familia:'Ciclo de vida',sucesion:'Situación sucesoria',finanzas:'Situación financiera',territorio:'Entorno urbano',amenaza:'Riesgo físico',mercado:'Mercado'};
function formatInput(key:keyof Assumptions,value:number){return pctKeys.has(key)?(value*100).toFixed(1):String(Math.round(value));}
function readInput(key:keyof Assumptions,v:number){return pctKeys.has(key)?v/100:v;}
function downloadJson(data:unknown,filename:string){
 const blob=new Blob([JSON.stringify(data,null,2)],{type:'application/json;charset=utf-8'});
 const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=filename;document.body.appendChild(a);a.click();a.remove();URL.revokeObjectURL(url);
}

const PHASES=[
 {key:'validating',label:'Entrada',sub:'Datos y límites'},
 {key:'filtering',label:'Reglas',sub:'Restricciones'},
 {key:'simulating',label:'Monte Carlo',sub:'Trayectorias'},
 {key:'aggregating',label:'Métricas',sub:'Percentiles'},
 {key:'complete',label:'Informe',sub:'Comparación'}
] as const;
function ProcessFlow({progress,error}:{progress:DecisionProgress;error:boolean}){
 const index=PHASES.findIndex(p=>p.key===progress.phase);
 return <div className="di-process-flow" aria-label="Etapas del proceso de cálculo">
  {PHASES.map((p,i)=><div className={'di-flow-node '+(error&&i===index?'failed':i<index?'done':i===index?'active':'pending')} key={p.key}>
   <span className="di-flow-dot">{i<index?<CheckCircle2 size={14}/>:String(i+1).padStart(2,'0')}</span>
   <strong>{p.label}</strong><small>{p.sub}</small>
   {i<PHASES.length-1&&<span className="di-flow-connector" aria-hidden="true"/>}
  </div>)}
 </div>;
}
export default function DecisionIntelligence({properties}:Props){
 const eligible=properties.filter(p=>p.operation_type==='venta'&&p.price>0);
 const [propertyId,setPropertyId]=useState('manual');
 const [base,setBase]=useState<Assumptions>(DEFAULT_ASSUMPTIONS);
 const [scenario,setScenario]=useState<ScenarioId>('base');
 const [iterations,setIterations]=useState(1600);
 const [advanced,setAdvanced]=useState(false);
 const [showTree,setShowTree]=useState(true);
 const [metric,setMetric]=useState<'mean'|'p10'|'cvar10'>('mean');
 const [seed,setSeed]=useState(20261027);
 const activeProperty=eligible.find(p=>p.id===propertyId);
 const current=SCENARIOS.find(s=>s.id===scenario)!;
 const [analysis,setAnalysis]=useState<{data:DecisionResult|null;error:string}>({data:null,error:''});
 const [progress,setProgress]=useState<DecisionProgress>({phase:'validating',processed:0,total:0,actionDone:0,actionTotal:0,message:'Preparando escenario'});
 const [history,setHistory]=useState<string[]>([]);
 const [rerun,setRerun]=useState(0);
 useEffect(()=>{
  const abort=new AbortController();
  setAnalysis({data:null,error:''});
  setHistory([]);
  setProgress({phase:'validating',processed:0,total:0,actionDone:0,actionTotal:0,message:'Preparando nuevo análisis'});
  const timer=setTimeout(()=>{
   let lastEvent='';
   void runDecisionModelProgressive(base,scenario,seed,iterations,p=>{
    if(abort.signal.aborted)return;
    setProgress(p);
    const event=p.phase==='simulating'?p.phase+':'+p.actionId+':'+p.actionDone:p.phase;
    if(lastEvent!==event){lastEvent=event;setHistory(prev=>[p.message,...prev].slice(0,7));}
   },abort.signal).then(data=>{if(!abort.signal.aborted)setAnalysis({data,error:''});}).catch(e=>{
    if(!abort.signal.aborted)setAnalysis({data:null,error:e instanceof Error?e.message:'Error de simulación'});
   });
  },130);
  return()=>{clearTimeout(timer);abort.abort();};
 },[base,scenario,seed,iterations,rerun]);
 const data=analysis.data;
 const working=!data&&!analysis.error;
 const percentage=progress.total>0?Math.round(progress.processed/progress.total*100):0;
 const ranked=data?data.actions.filter(a=>a.allowed).sort((a,b)=>b[metric]-a[metric]):[];
 const max=Math.max(...ranked.map(x=>Math.max(0,x[metric])),1);
 const blocked=data?data.actions.filter(a=>!a.allowed):[];
 function change<K extends keyof Assumptions>(key:K,value:Assumptions[K]){setBase(p=>({...p,[key]:value}));}
 function onProperty(id:string){setPropertyId(id);const p=eligible.find(x=>x.id===id);if(p)setBase(s=>({...s,price:p.price}));}
 const exportReport=()=>{if(!data)return;const {actions,...meta}=data;downloadJson({schema:'deep-living/decision-report/v0.1',generated_at:new Date().toISOString(),demo:true,linked_property:activeProperty?{id:activeProperty.id,title:activeProperty.title,commune:activeProperty.commune}:null,...meta,actions:actions.map(({values,...rest})=>rest)},'deep-living-decision-'+scenario+'.json');};
 return <section className="di-root" aria-labelledby="decision-heading">
   <header className="di-hero">
    <div className="di-hero-bg" aria-hidden="true"><span/><span/><span/></div>
    <div className="di-hero-top"><span className="di-kicker"><Layers3 size={15}/> DEEP LIVING / DECISION INTELLIGENCE</span><span className="di-version">LABORATORIO v0.1</span></div>
    <div className="di-hero-main">
     <div><h1 id="decision-heading">Explora las decisiones.<br/><em>Comprende las consecuencias.</em></h1><p>Simula alternativas inmobiliarias, pérdidas extremas y acontecimientos de vida o territorio. Conoce cada supuesto antes de elegir.</p></div>
     <div className="di-hero-count"><strong>07</strong><span>decisiones<br/>comparables</span></div>
    </div>
    <div className="di-status"><span><CheckCircle2 size={14}/> Motor reproducible</span><span><ShieldAlert size={14}/> Datos hipotéticos</span><span><GitBranch size={14}/> Árbol explicable</span></div>
   </header>

   <div className="di-workspace">
    <aside className="di-config" aria-label="Configuración del caso">
     <div className="di-panel-head"><span><SlidersHorizontal size={17}/> CONFIGURACIÓN</span><span className="di-index">01 / 03</span></div>
     <label className="di-field">Inmueble del inventario
      <select value={propertyId} onChange={e=>onProperty(e.target.value)}><option value="manual">Caso manual · ficticio</option>{eligible.map(p=><option value={p.id} key={p.id}>{p.title} · {p.commune}</option>)}</select>
     </label>
     <label className="di-field">Contexto de la decisión
      <select value={scenario} onChange={e=>setScenario(e.target.value as ScenarioId)}>{SCENARIOS.map(s=><option key={s.id} value={s.id}>{s.label}</option>)}</select>
     </label>
     <div className="di-context"><small>{STEP_NAMES[current.family]}</small><strong>{current.summary}</strong><p>{current.note}</p></div>
     <div className="di-divider"/>
     <div className="di-subheading"><span>Supuestos base</span><button onClick={()=>setBase(()=>({...DEFAULT_ASSUMPTIONS,price:activeProperty?.price||DEFAULT_ASSUMPTIONS.price}))}><RefreshCcw size={13}/> Restablecer</button></div>
     {params.slice(0,7).map(p=><label className="di-field" key={p.key}>{p.label}<span className="di-number"><input inputMode="decimal" type="number" min={pctKeys.has(p.key)?p.min*100:p.min} max={pctKeys.has(p.key)?p.max*100:p.max} step={pctKeys.has(p.key)?p.step*100:p.step} value={formatInput(p.key,base[p.key] as number)} onChange={e=>change(p.key,readInput(p.key,Number(e.target.value)) as never)}/><span>{pctKeys.has(p.key)?'%':p.unit}</span></span></label>)}
     <button className="di-expand" aria-expanded={advanced} onClick={()=>setAdvanced(v=>!v)}><span>Riesgos, seguros y obras</span><ChevronDown className={advanced?'rotate':''} size={16}/></button>
     {advanced&&<>
      {params.slice(7).map(p=><label className="di-field" key={p.key}>{p.label}<span className="di-number"><input inputMode="decimal" type="number" min={pctKeys.has(p.key)?p.min*100:p.min} max={pctKeys.has(p.key)?p.max*100:p.max} step={pctKeys.has(p.key)?p.step*100:p.step} value={formatInput(p.key,base[p.key] as number)} onChange={e=>change(p.key,readInput(p.key,Number(e.target.value)) as never)}/><span>{pctKeys.has(p.key)?'%':p.unit}</span></span></label>)}
      <label className="di-field">Horizonte temporal<select value={base.years} onChange={e=>change('years',Number(e.target.value))}>{[2,5,10,15,20,30].map(n=><option key={n} value={n}>{n} años</option>)}</select></label>
      <label className="di-field">Iteraciones<select value={iterations} onChange={e=>setIterations(Number(e.target.value))}><option value={400}>400 · exploración</option><option value={1600}>1.600 · estándar</option><option value={5000}>5.000 · mayor precisión numérica</option></select></label>
      <label className="di-field">Semilla reproducible<input type="number" value={seed} onChange={e=>setSeed(Number(e.target.value))}/></label>
     </>}
     <div className="di-divider"/>
     <div className="di-checks"><label><input type="checkbox" checked={base.legalCleared} onChange={e=>change('legalCleared',e.target.checked)}/> Facultades de disposición declaradas</label><label><input type="checkbox" checked={base.habitable} onChange={e=>change('habitable',e.target.checked)}/> Habitabilidad declarada</label><label><input type="checkbox" checked={base.liquidityUrgent} onChange={e=>change('liquidityUrgent',e.target.checked)}/> Requiere liquidez inmediata</label></div>
     <p className="di-helper"><Info size={13}/> Estas casillas son declaraciones de escenario; no verifican títulos ni inspecciones.</p>
    </aside>

    <div className="di-results">
     <div className="di-panel-head"><span><Activity size={17}/> SIMULACIÓN DE ALTERNATIVAS</span><span className="di-index">02 / 03</span></div>
     <div className="di-controlbar"><span className={'di-runtime-indicator '+(working?'running':analysis.error?'failed':'finished')}><span className="di-light"/>{analysis.error?'ANÁLISIS DETENIDO':working?'MOTOR EN EJECUCIÓN':'ANÁLISIS COMPLETADO'}</span><button type="button" className="di-rerun" onClick={()=>setRerun(v=>v+1)}><RefreshCcw size={14}/> Recalcular</button></div>
     <ProcessFlow progress={progress} error={Boolean(analysis.error)}/>
     <div className="di-progress-area"><div className="di-progress-text"><strong>{progress.message}</strong><span>{progress.processed.toLocaleString('es-CL')} / {progress.total.toLocaleString('es-CL')} rutas · {percentage}%</span></div><div className="di-progress-track" role="progressbar" aria-label="Rutas efectivamente calculadas" aria-valuemin={0} aria-valuemax={100} aria-valuenow={percentage}><span style={{width:percentage+'%'}}/></div></div>
     <div className="di-live-actions"><div className="di-live-heading"><Activity size={15}/> TRAZA DE EJECUCIÓN <span>{progress.actionDone}/{progress.actionTotal} alternativas calculadas</span></div><div className="di-live-grid">{ACTIONS.map(a=>{const done=progress.phase==='complete';const active=working&&progress.actionId===a.id&&progress.phase==='simulating';const blockedNow=progress.phase!=='validating'&&((!base.legalCleared&&a.id!=='hold')||(!base.habitable&&['rent','renovate_rent','mitigate_rent'].includes(a.id))||((base.liquidityUrgent||current.changes.liquidityUrgent)&&a.id!=='sell_now')||(scenario==='sin_titulos'&&a.id!=='hold'));
       return <span key={a.id} className={'di-action-node '+(blockedNow?'blocked':active?'active':done?'complete':'waiting')}><i className="di-action-led"/>{a.label}</span>;
      })}</div><div className="di-event-list" aria-label="Actividad reciente">{history.slice(0,4).map((item,i)=><span key={i}>{item}</span>)}</div></div>
     {analysis.error&&<div className="di-alert error" role="alert">{analysis.error}</div>}
     {data&&<>
      <div className="di-alert"><AlertTriangle size={17}/><span><strong>Entorno de laboratorio.</strong> Resultados hipotéticos, sin conexión a fuentes territoriales, mercados o registros. No constituyen recomendaciones de inversión.</span></div>
      <div className="di-kpis">
       <div className="di-kpi featured"><span>MEJOR VALOR ESPERADO ELEGIBLE</span><strong>{data.top?millionCLP(data.top.mean):'—'}</strong><small>{data.top?.label||'Sin acción admisible'}</small></div>
       <div className="di-kpi"><span>P10 · PEOR DECIL</span><strong>{data.top?millionCLP(data.top.p10):'—'}</strong><small>Percentil 10 de la alternativa</small></div>
       <div className="di-kpi"><span>CVaR 10</span><strong>{data.top?millionCLP(data.top.cvar10):'—'}</strong><small>Media del peor 10 %</small></div>
      </div>
      <div className="di-chart-head"><div><h2>Frontera de decisiones</h2><p>Valor presente · CLP reales · {data.iterations.toLocaleString('es-CL')} trayectorias por alternativa</p></div><div className="di-segments" aria-label="Métrica de comparación">{([{id:'mean',label:'Media'},{id:'p10',label:'P10'},{id:'cvar10',label:'CVaR'}] as const).map(m=><button key={m.id} className={metric===m.id?'active':''} aria-pressed={metric===m.id} onClick={()=>setMetric(m.id)}>{m.label}</button>)}</div></div>
      <div className="di-bars">{ranked.map((r,i)=><div className="di-bar-row" key={r.id}><div className="di-bar-title"><strong><span>{String(i+1).padStart(2,'0')}</span> {r.label}</strong><b>{millionCLP(r[metric])}</b></div><div className="di-track"><div className={i===0?'leader':''} style={{width:(Math.max(0,r[metric])/max*100)+'%'}}/></div><p>{ACTIONS.find(a=>a.id===r.id)?.detail} · P90 {millionCLP(r.p90)} · supera venta inmediata en {(r.probBetterThanSell*100).toFixed(0)} % de las trayectorias</p></div>)}</div>
      {blocked.length>0&&<div className="di-blocked"><ShieldAlert size={17}/><div><strong>Alternativas restringidas por reglas duras</strong>{blocked.map(r=><p key={r.id}>{r.label}: {r.reason}</p>)}</div></div>}
      <div className="di-method"><span><BarChart3 size={17}/> Sensibilidad, no certeza</span><p>El orden cambia con la tasa de descuento, el valor del arriendo, gastos, mercado y pérdidas físicas. El motor utiliza distribuciones sintéticas y no puede estimar probabilidades reales por domicilio.</p></div>
      <div className="di-toolbar"><button className="di-btn-primary" onClick={exportReport}><Download size={16}/> Exportar informe JSON</button><span>Sin guardar datos personales ni transmitir información</span></div>
     </>}
    </div>
   </div>
   {data&&<div className="di-tree-panel">
    <div className="di-panel-head"><span><GitBranch size={17}/> ÁRBOL DE DECISIÓN Y EVIDENCIA</span><span className="di-index">03 / 03</span></div>
    <div className="di-tree-title"><div><h2>¿Por qué estas alternativas?</h2><p>El modelo muestra decisiones bloqueadas, verificaciones pendientes y reglas de selección.</p></div><button className="di-expand compact" aria-expanded={showTree} onClick={()=>setShowTree(v=>!v)}>{showTree?'Ocultar':'Mostrar'} recorrido <ChevronDown className={showTree?'rotate':''} size={16}/></button></div>
    {showTree&&<div className="di-tree">{data.tree.map((node,i)=><div className={'di-node '+node.status} key={i}><span className="di-node-number">{String(i+1).padStart(2,'0')}</span><div><strong>{node.question}</strong><p>{node.resolution}</p></div><span className="di-node-state">{node.status==='bloqueo'?'CONTROL':node.status==='revision'?'REVISAR':'PASO'}</span>{i<data.tree.length-1&&<ArrowRight className="di-node-arrow" size={16}/>}</div>)}</div>}
    <div className="di-footnotes"><BookOpen size={15}/><p>{data.warnings.join(' ')} Las métricas tienen incertidumbre de muestreo incluso con semilla reproducible. Se necesita calibración local, validación externa y supervisión humana.</p></div>
   </div>}
  </section>;
}
