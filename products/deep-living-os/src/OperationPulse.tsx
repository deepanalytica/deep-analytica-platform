import {Activity,Check,ChevronDown,LoaderCircle} from 'lucide-react';
import './operation-pulse.css';

export type OperationFlow={
 kind:'consulta'|'escritura'|'demo';
 phase:'preparando'|'ejecutando'|'sincronizando'|'completado'|'error';
 title:string;
};
const stepMap={
 consulta:['Preparar','Consultar','Actualizado'],
 escritura:['Validar','Guardar','Sincronizar','Confirmado'],
 demo:['Preparar','Aplicar ejemplo','Listo']
} as const;
export default function OperationPulse({flow}:{flow:OperationFlow|null}){
 const steps=flow?stepMap[flow.kind]:[];
 const active=flow?(flow.phase==='preparando'?0:flow.phase==='ejecutando'?1:flow.phase==='sincronizando'?2:steps.length-1):0;
 const busy=Boolean(flow&&flow.phase!=='completado'&&flow.phase!=='error');
 return <details className={'op-pulse '+(busy?'working':flow?.phase==='error'?'error':'ready')}>
  <summary><span className="op-dot"/><Activity size={14}/><span className="op-summary">{!flow?'Sistema disponible':busy?flow.title:flow.phase==='error'?'Acción con error':'Última acción completada'}</span><ChevronDown size={13}/></summary>
  <div className="op-inspector">
   <div className="op-title"><strong>{flow?.title||'Actividad de Deep Living'}</strong><span>{!flow?'Sin operación en curso':busy?'En ejecución':flow.phase==='error'?'Requiere atención':'Completado'}</span></div>
   {!flow?<p>Las operaciones registradas muestran sus estados mientras se ejecutan. El simulador incluye el avance detallado de cada trayectoria.</p>:<>
   <div className="op-stages" aria-label="Etapas de operación">
    {steps.map((step,i)=><div className={'op-stage '+(flow.phase==='error'&&i===active?'failed':i<active?'complete':i===active?'active':'pending')} key={step}>
     <span>{i<active?<Check size={12}/>:busy&&i===active?<LoaderCircle size={12}/>:i+1}</span>
     <small>{step}</small>
    </div>)}
   </div>
   <p>{flow.phase==='error'?'El proceso no se confirmó. Revisa el mensaje mostrado.':busy?'Los nodos avanzan únicamente cuando termina el paso correspondiente.':'Los cambios de estado representan acciones ya terminadas.'}</p>
   </>}
  </div>
 </details>;
}
