import Link from 'next/link';
import { LeadForm } from '@/components/marketing/LeadForm';

export default function LandingPage() {
  return (
    <>
      {/* HERO SECTION */}
      <section className="pt-[96px] pb-[64px] relative overflow-hidden border-t-0">
        <div className="max-w-[1200px] mx-auto px-8 grid grid-cols-1 lg:grid-cols-[1.1fr_0.9fr] gap-[64px] items-center relative">
          {/* Chevron background */}
          <div className="absolute right-[-120px] top-0 bottom-0 w-[720px] pointer-events-none flex items-center justify-center opacity-10">
            <svg viewBox="0 0 275 252" fill="none" className="w-full h-auto"><path d="M275 144.086L0 251V200.203L202.936 126.164L200.87 128.986V121.848L202.936 124.836L0 50.6318V0L275 106.901V144.086Z" fill="var(--color-brand-cyan)"/></svg>
          </div>
          
          <div>
            <span className="font-sans font-semibold text-[11px] tracking-[0.1em] uppercase text-accent">Consultoría · Análisis · IA aplicada</span>
            <h1 className="font-display font-bold text-[clamp(44px,5.6vw,76px)] leading-[1.02] tracking-[-0.03em] my-[18px] text-fg-1 text-balance">
              Datos que responden <em className="not-italic text-accent">preguntas de negocio</em>.
            </h1>
            <p className="text-[19px] leading-[1.55] text-fg-2 max-w-[52ch] mb-[36px]">
              Diseñamos pipelines de IA a medida, estudios de mercado con metodología, y formación que el equipo usa al día siguiente. Sin POCs de laboratorio.
            </p>
            <div className="flex gap-[12px]">
              <Link href="#contacto" className="font-sans font-semibold rounded-md cursor-pointer border transition-all duration-180 ease-out inline-flex items-center gap-2 no-underline bg-brand-cyan text-brand-cyan-ink hover:bg-c-400 px-[22px] py-[14px] text-[15px] border-transparent">
                Habla con un consultor
              </Link>
              <Link href="#casos" className="font-sans font-semibold rounded-md cursor-pointer border transition-all duration-180 ease-out inline-flex items-center gap-2 no-underline bg-transparent text-fg-1 border-border-2 hover:border-border-3 hover:bg-[rgba(247,248,255,0.04)] px-[22px] py-[14px] text-[15px]">
                Ver casos de estudio
              </Link>
            </div>
            
            <div className="mt-[56px] flex items-center gap-[24px] text-fg-3 font-mono font-medium text-[12px] tracking-[0.04em]">
              <span>Confían en nosotros</span>
              <div className="flex gap-[28px] opacity-70">
                <span className="font-display font-semibold text-fg-3 text-[14px] tracking-[0.02em]">RETAIL·ES</span>
                <span className="font-display font-semibold text-fg-3 text-[14px] tracking-[0.02em]">BANCA NORD</span>
                <span className="font-display font-semibold text-fg-3 text-[14px] tracking-[0.02em]">LOGIQ</span>
                <span className="font-display font-semibold text-fg-3 text-[14px] tracking-[0.02em]">MERIDIA</span>
              </div>
            </div>
          </div>
          
          <div className="bg-bg-elevated border border-border-1 rounded-[14px] p-[20px] relative z-10 shadow-3">
            <div className="flex justify-between items-baseline mb-[10px]">
              <span className="font-display font-semibold text-[14px] tracking-[0.02em] text-fg-1">retail-segmentation · prod</span>
              <span className="font-mono text-[11px] text-fg-3">Últimas 12 semanas</span>
            </div>
            <svg viewBox="0 0 440 140" className="w-full h-[140px]" preserveAspectRatio="none">
              <defs><linearGradient id="hv" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#33E1ED" stopOpacity="0.35"/><stop offset="100%" stopColor="#33E1ED" stopOpacity="0"/></linearGradient></defs>
              <g stroke="rgba(247,248,255,0.08)" strokeWidth="1"><line x1="0" y1="35" x2="440" y2="35"/><line x1="0" y1="70" x2="440" y2="70"/><line x1="0" y1="105" x2="440" y2="105"/></g>
              <path d="M0,110 L40,100 L80,95 L120,85 L160,70 L200,62 L240,50 L280,42 L320,30 L360,22 L400,18 L440,12 L440,140 L0,140 Z" fill="url(#hv)"/>
              <path d="M0,110 L40,100 L80,95 L120,85 L160,70 L200,62 L240,50 L280,42 L320,30 L360,22 L400,18 L440,12" fill="none" stroke="#33E1ED" strokeWidth="2"/>
            </svg>
            <div className="grid grid-cols-3 gap-[16px] mt-[16px] pt-[16px] border-t border-border-1">
              <div><div className="font-display font-bold text-[28px] leading-none tracking-[-0.02em] tabular-nums text-fg-1">2.4M</div><div className="font-sans font-medium text-[10px] tracking-[0.08em] uppercase text-fg-3 mt-[6px]">Eventos/día</div><div className="font-mono font-medium text-[11px] text-success-500 mt-[2px] tabular-nums">↑ estable</div></div>
              <div><div className="font-display font-bold text-[28px] leading-none tracking-[-0.02em] tabular-nums text-fg-1">180<span className="text-[16px] text-fg-3"> ms</span></div><div className="font-sans font-medium text-[10px] tracking-[0.08em] uppercase text-fg-3 mt-[6px]">Latencia p50</div><div className="font-mono font-medium text-[11px] text-success-500 mt-[2px] tabular-nums">↓ 40 ms</div></div>
              <div><div className="font-display font-bold text-[28px] leading-none tracking-[-0.02em] tabular-nums text-fg-1">34%</div><div className="font-sans font-medium text-[10px] tracking-[0.08em] uppercase text-fg-3 mt-[6px]">Δ tiempo lectura</div><div className="font-mono font-medium text-[11px] text-success-500 mt-[2px] tabular-nums">↑ 12 pts</div></div>
            </div>
          </div>
        </div>
      </section>

      {/* SERVICIOS SECTION */}
      <section id="servicios" className="py-[96px] border-t border-border-1">
        <div className="max-w-[1200px] mx-auto px-8">
          <div className="max-w-[780px] mb-[56px]">
            <span className="font-sans font-semibold text-[11px] tracking-[0.1em] uppercase text-fg-3 mb-[14px] inline-block">Servicios</span>
            <h2 className="font-display font-bold text-[clamp(32px,3.5vw,48px)] leading-[1.1] tracking-[-0.025em] mb-[16px] text-fg-1 text-balance">Cuatro prácticas, un método.</h2>
            <p className="text-[17px] text-fg-2 m-0 leading-[1.55] max-w-[60ch] text-pretty">Proyectos con alcance definido, entregables medibles y transferencia de conocimiento al equipo interno. No dejamos cajas negras.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-[1px] bg-border-1 border border-border-1 rounded-[14px] overflow-hidden shadow-2">
            
            <div className="bg-bg p-[32px] flex flex-col gap-[12px] transition-colors duration-180 hover:bg-bg-elevated">
              <span className="font-mono font-semibold text-[11px] text-accent tracking-[0.08em]">01 / Marketing</span>
              <h3 className="font-display font-semibold text-[22px] tracking-[-0.015em] mt-[4px] mb-[6px] text-fg-1">Marketing estratégico</h3>
              <p className="text-fg-2 text-[14px] leading-[1.55] m-0">Posicionamiento, arquitectura de marca, GTM y planes de medios con KPIs cuantificados.</p>
              <ul className="mt-[8px] mb-0 p-0 list-none">
                <li className="font-mono font-medium text-[12px] text-fg-3 py-[5px] border-t border-border-1">Auditoría · Posicionamiento · Plan 12 meses</li>
                <li className="font-mono font-medium text-[12px] text-fg-3 py-[5px] border-t border-border-1">Presupuesto medido · Attribution model</li>
              </ul>
            </div>

            <div className="bg-bg p-[32px] flex flex-col gap-[12px] transition-colors duration-180 hover:bg-bg-elevated">
              <span className="font-mono font-semibold text-[11px] text-accent tracking-[0.08em]">02 / Research</span>
              <h3 className="font-display font-semibold text-[22px] tracking-[-0.015em] mt-[4px] mb-[6px] text-fg-1">Estudios de mercado</h3>
              <p className="text-fg-2 text-[14px] leading-[1.55] m-0">Metodología cuali + cuanti, muestras dimensionadas, entregables con nivel de confianza declarado.</p>
              <ul className="mt-[8px] mb-0 p-0 list-none">
                <li className="font-mono font-medium text-[12px] text-fg-3 py-[5px] border-t border-border-1">Segmentación · Concept test · MaxDiff</li>
                <li className="font-mono font-medium text-[12px] text-fg-3 py-[5px] border-t border-border-1">Dashboards vivos, no PDFs estáticos</li>
              </ul>
            </div>

            <div className="bg-bg p-[32px] flex flex-col gap-[12px] transition-colors duration-180 hover:bg-bg-elevated">
              <span className="font-mono font-semibold text-[11px] text-accent tracking-[0.08em]">03 / Data</span>
              <h3 className="font-display font-semibold text-[22px] tracking-[-0.015em] mt-[4px] mb-[6px] text-fg-1">Análisis de datos</h3>
              <p className="text-fg-2 text-[14px] leading-[1.55] m-0">Modelado, ETL moderno y data warehousing. Del CSV suelto al stack analítico operativo.</p>
              <ul className="mt-[8px] mb-0 p-0 list-none">
                <li className="font-mono font-medium text-[12px] text-fg-3 py-[5px] border-t border-border-1">Snowflake · dbt · Airflow · Metabase</li>
                <li className="font-mono font-medium text-[12px] text-fg-3 py-[5px] border-t border-border-1">Governance · Calidad de datos</li>
              </ul>
            </div>

            <div className="bg-bg p-[32px] flex flex-col gap-[12px] transition-colors duration-180 hover:bg-bg-elevated">
              <span className="font-mono font-semibold text-[11px] text-accent tracking-[0.08em]">04 / IA</span>
              <h3 className="font-display font-semibold text-[22px] tracking-[-0.015em] mt-[4px] mb-[6px] text-fg-1">Pipelines de IA a medida</h3>
              <p className="text-fg-2 text-[14px] leading-[1.55] m-0">RAG, clasificadores, forecasting y asistentes internos. Despliegue en tu infra o gestionado.</p>
              <ul className="mt-[8px] mb-0 p-0 list-none">
                <li className="font-mono font-medium text-[12px] text-fg-3 py-[5px] border-t border-border-1">Evaluación continua · Guardrails</li>
                <li className="font-mono font-medium text-[12px] text-fg-3 py-[5px] border-t border-border-1">Handoff técnico al equipo interno</li>
              </ul>
            </div>

          </div>
        </div>
      </section>

      {/* CASOS DE ESTUDIO */}
      <section id="casos" className="py-[96px] border-t border-border-1">
        <div className="max-w-[1200px] mx-auto px-8">
          <div className="max-w-[780px] mb-[56px]">
            <span className="font-sans font-semibold text-[11px] tracking-[0.1em] uppercase text-fg-3 mb-[14px] inline-block">Casos de estudio</span>
            <h2 className="font-display font-bold text-[clamp(32px,3.5vw,48px)] leading-[1.1] tracking-[-0.025em] mb-[16px] text-fg-1 text-balance">Resultados cuantificados, no anécdotas.</h2>
            <p className="text-[17px] text-fg-2 m-0 leading-[1.55] max-w-[60ch] text-pretty">Tres proyectos recientes con el impacto medido seis meses después del handoff.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-[20px]">
            
            <div className="bg-bg-elevated border border-border-1 rounded-[12px] p-[24px] cursor-pointer transition-all duration-180 ease-out hover:border-border-2 hover:-translate-y-[2px] shadow-1 hover:shadow-2">
              <span className="font-sans font-semibold text-[10px] tracking-[0.08em] uppercase text-fg-3">Retail · e-commerce</span>
              <h3 className="font-display font-semibold text-[18px] leading-[1.3] tracking-[-0.01em] my-[8px] text-fg-1 text-balance">Segmentación en tiempo real para 2,4M eventos diarios</h3>
              <div className="font-display font-bold text-[40px] leading-none tracking-[-0.02em] tabular-nums text-accent mt-[14px]">34%</div>
              <div className="font-sans font-medium text-[11px] tracking-[0.06em] uppercase text-fg-3 mt-[6px]">Reducción tiempo de lectura</div>
              <p className="text-[13px] text-fg-2 leading-[1.5] mt-[16px] border-t border-border-1 pt-[14px]">Pipeline de features y resúmenes automáticos servidos al equipo de producto cada lunes 07:00.</p>
            </div>

            <div className="bg-bg-elevated border border-border-1 rounded-[12px] p-[24px] cursor-pointer transition-all duration-180 ease-out hover:border-border-2 hover:-translate-y-[2px] shadow-1 hover:shadow-2">
              <span className="font-sans font-semibold text-[10px] tracking-[0.08em] uppercase text-fg-3">Banca · B2B</span>
              <h3 className="font-display font-semibold text-[18px] leading-[1.3] tracking-[-0.01em] my-[8px] text-fg-1 text-balance">Modelo de churn B2B con señales conversacionales</h3>
              <div className="font-display font-bold text-[40px] leading-none tracking-[-0.02em] tabular-nums text-accent mt-[14px]">+18<span className="text-[24px]">pts</span></div>
              <div className="font-sans font-medium text-[11px] tracking-[0.06em] uppercase text-fg-3 mt-[6px]">Precision vs. modelo heurístico</div>
              <p className="text-[13px] text-fg-2 leading-[1.5] mt-[16px] border-t border-border-1 pt-[14px]">Clasificador con features extraídas de transcripciones de soporte, entrenado sobre 14 meses de histórico.</p>
            </div>

            <div className="bg-bg-elevated border border-border-1 rounded-[12px] p-[24px] cursor-pointer transition-all duration-180 ease-out hover:border-border-2 hover:-translate-y-[2px] shadow-1 hover:shadow-2">
              <span className="font-sans font-semibold text-[10px] tracking-[0.08em] uppercase text-fg-3">Industrial</span>
              <h3 className="font-display font-semibold text-[18px] leading-[1.3] tracking-[-0.01em] my-[8px] text-fg-1 text-balance">Asistente RAG sobre 12k documentos técnicos</h3>
              <div className="font-display font-bold text-[40px] leading-none tracking-[-0.02em] tabular-nums text-accent mt-[14px]">92<span className="text-[24px]"> ms</span></div>
              <div className="font-sans font-medium text-[11px] tracking-[0.06em] uppercase text-fg-3 mt-[6px]">Latencia p50 de respuesta</div>
              <p className="text-[13px] text-fg-2 leading-[1.5] mt-[16px] border-t border-border-1 pt-[14px]">Arquitectura pgvector + re-ranking; evaluación continua con conjunto de golden-queries internas.</p>
            </div>

          </div>
        </div>
      </section>

      {/* CAPACITACION */}
      <section id="capacitacion" className="py-[96px] border-t border-border-1">
        <div className="max-w-[1200px] mx-auto px-8">
          <div className="max-w-[780px] mb-[56px]">
            <span className="font-sans font-semibold text-[11px] tracking-[0.1em] uppercase text-fg-3 mb-[14px] inline-block">Dos audiencias · un sistema</span>
            <h2 className="font-display font-bold text-[clamp(32px,3.5vw,48px)] leading-[1.1] tracking-[-0.025em] mb-[16px] text-fg-1 text-balance">Rigor para empresas, acceso para PyMEs.</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-[20px]">
            
            <div className="border border-border-1 rounded-[14px] p-[32px] bg-bg-elevated shadow-1">
              <span className="font-mono font-semibold text-[11px] tracking-[0.08em] uppercase text-accent">Empresas</span>
              <h3 className="font-display font-bold text-[26px] tracking-[-0.02em] my-[10px] text-fg-1">Consultoría técnica con alcance definido</h3>
              <p className="text-fg-2 text-[15px] leading-[1.55] mb-[20px]">Diagnóstico, diseño, implementación y transferencia. El equipo interno queda capacitado para operar el sistema sin dependencia continua.</p>
              <ul className="list-none m-0 p-0">
                <li className="py-[10px] border-t border-border-1 font-sans font-medium text-[13px] text-fg-2 flex justify-between items-center after:content-['→'] after:text-fg-4 after:font-mono">Arquitecturas de datos + IA</li>
                <li className="py-[10px] border-t border-border-1 font-sans font-medium text-[13px] text-fg-2 flex justify-between items-center after:content-['→'] after:text-fg-4 after:font-mono">Estudios de mercado longitudinales</li>
                <li className="py-[10px] border-t border-border-1 font-sans font-medium text-[13px] text-fg-2 flex justify-between items-center after:content-['→'] after:text-fg-4 after:font-mono">Integraciones con el stack existente</li>
                <li className="py-[10px] border-t border-border-1 font-sans font-medium text-[13px] text-fg-2 flex justify-between items-center after:content-['→'] after:text-fg-4 after:font-mono">SLA y soporte de plataforma</li>
              </ul>
            </div>

            <div className="border border-border-1 rounded-[14px] p-[32px] bg-bg-elevated shadow-1">
              <span className="font-mono font-semibold text-[11px] tracking-[0.08em] uppercase text-accent">PyMEs · Emprendedores</span>
              <h3 className="font-display font-bold text-[26px] tracking-[-0.02em] my-[10px] text-fg-1">Capacitación en IA generativa, accionable desde el lunes</h3>
              <p className="text-fg-2 text-[15px] leading-[1.55] mb-[20px]">Programa por cohortes con ejercicios sobre tus propios datos. Plantillas, checklists y oficina de horas para integrar lo aprendido.</p>
              <ul className="list-none m-0 p-0">
                <li className="py-[10px] border-t border-border-1 font-sans font-medium text-[13px] text-fg-2 flex justify-between items-center after:content-['→'] after:text-fg-4 after:font-mono">Bootcamp Fundamentos · 4 semanas</li>
                <li className="py-[10px] border-t border-border-1 font-sans font-medium text-[13px] text-fg-2 flex justify-between items-center after:content-['→'] after:text-fg-4 after:font-mono">Taller Construye tu primer pipeline</li>
                <li className="py-[10px] border-t border-border-1 font-sans font-medium text-[13px] text-fg-2 flex justify-between items-center after:content-['→'] after:text-fg-4 after:font-mono">Programa Asistente interno con RAG</li>
                <li className="py-[10px] border-t border-border-1 font-sans font-medium text-[13px] text-fg-2 flex justify-between items-center after:content-['→'] after:text-fg-4 after:font-mono">Oficina de horas mensual</li>
              </ul>
            </div>

          </div>
        </div>
      </section>

      {/* CONTACTO CTA */}
      <section id="contacto" className="py-[96px] border-t border-border-1 mb-10">
        <div className="max-w-[1200px] mx-auto px-8">
          <div className="bg-bg-elevated border border-border-1 rounded-[20px] p-[64px] grid grid-cols-1 md:grid-cols-[1.3fr_1fr] gap-[48px] items-center relative overflow-hidden shadow-3">
            <div className="absolute right-[-80px] top-[-40px] w-[400px] h-[400px] opacity-5 pointer-events-none">
              <svg viewBox="0 0 275 252" fill="none" className="w-full h-full"><path d="M275 144.086L0 251V200.203L202.936 126.164L200.87 128.986V121.848L202.936 124.836L0 50.6318V0L275 106.901V144.086Z" fill="var(--color-brand-cyan)"/></svg>
            </div>
            
            <div className="relative z-10">
              <h2 className="font-display font-bold text-[40px] leading-[1.1] tracking-[-0.025em] m-0 mb-[16px] text-fg-1">Ponle números a una pregunta concreta.</h2>
              <p className="text-fg-2 text-[16px] leading-[1.55] m-0">Cuéntanos el problema en 3 líneas. En 48 h te llegamos con un alcance, un calendario y un presupuesto aproximado — sin formulario kilométrico.</p>
            </div>
            
            <div className="relative z-10 w-full max-w-sm">
              <LeadForm />
            </div>
          </div>
        </div>
      </section>

    </>
  );
}
