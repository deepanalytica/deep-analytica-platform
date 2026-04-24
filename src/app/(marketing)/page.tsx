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
            <span className="font-sans font-semibold text-[11px] tracking-[0.1em] uppercase text-accent">IA · Performance Marketing · Consultoría</span>
            <h1 className="font-display font-bold text-[clamp(44px,5.6vw,76px)] leading-[1.02] tracking-[-0.03em] my-[18px] text-fg-1 text-balance">
              Factorías de IA que multiplican <em className="not-italic text-accent">operaciones</em>.
            </h1>
            <p className="text-[19px] leading-[1.55] text-fg-2 max-w-[52ch] mb-[36px]">
              Superamos el humo tecnológico. Construimos pipelines completos de agentes inteligentes para editar, generar, auditar y escalar modelos operativos de negocio de punta a punta.
            </p>
            <div className="flex gap-[12px]">
              <Link href="#contacto" className="font-sans font-semibold rounded-md cursor-pointer border transition-all duration-180 ease-out inline-flex items-center gap-2 no-underline bg-brand-cyan text-brand-cyan-ink hover:bg-c-400 px-[22px] py-[14px] text-[15px] border-transparent">
                Solicitar un Proyecto
              </Link>
              <Link href="#casos" className="font-sans font-semibold rounded-md cursor-pointer border transition-all duration-180 ease-out inline-flex items-center gap-2 no-underline bg-transparent text-fg-1 border-border-2 hover:border-border-3 hover:bg-[rgba(247,248,255,0.04)] px-[22px] py-[14px] text-[15px]">
                Ver Casos Reales
              </Link>
            </div>
            
            <div className="mt-[56px] flex items-center gap-[24px] text-fg-3 font-mono font-medium text-[12px] tracking-[0.04em]">
              <span>Agilizando la industria:</span>
              <div className="flex gap-[28px] opacity-70">
                <span className="font-display font-semibold text-fg-3 text-[14px] tracking-[0.02em]">EDITORIALES</span>
                <span className="font-display font-semibold text-fg-3 text-[14px] tracking-[0.02em]">AGENCIAS</span>
                <span className="font-display font-semibold text-fg-3 text-[14px] tracking-[0.02em]">PYMES</span>
              </div>
            </div>
          </div>
          
          <div className="bg-bg-elevated border border-border-1 rounded-[14px] p-[20px] relative z-10 shadow-3">
            <div className="flex justify-between items-baseline mb-[10px]">
              <span className="font-display font-semibold text-[14px] tracking-[0.02em] text-fg-1">factoria-agentes · core</span>
              <span className="font-mono text-[11px] text-fg-3">Monitor en vivo</span>
            </div>
            <svg viewBox="0 0 440 140" className="w-full h-[140px]" preserveAspectRatio="none">
              <defs><linearGradient id="hv" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#33E1ED" stopOpacity="0.35"/><stop offset="100%" stopColor="#33E1ED" stopOpacity="0"/></linearGradient></defs>
              <g stroke="rgba(247,248,255,0.08)" strokeWidth="1"><line x1="0" y1="35" x2="440" y2="35"/><line x1="0" y1="70" x2="440" y2="70"/><line x1="0" y1="105" x2="440" y2="105"/></g>
              <path d="M0,110 L40,100 L80,95 L120,85 L160,70 L200,62 L240,50 L280,42 L320,30 L360,22 L400,18 L440,12 L440,140 L0,140 Z" fill="url(#hv)"/>
              <path d="M0,110 L40,100 L80,95 L120,85 L160,70 L200,62 L240,50 L280,42 L320,30 L360,22 L400,18 L440,12" fill="none" stroke="#33E1ED" strokeWidth="2"/>
            </svg>
            <div className="grid grid-cols-3 gap-[16px] mt-[16px] pt-[16px] border-t border-border-1">
              <div><div className="font-display font-bold text-[28px] leading-none tracking-[-0.02em] tabular-nums text-fg-1">100%</div><div className="font-sans font-medium text-[10px] tracking-[0.08em] uppercase text-fg-3 mt-[6px]">Automatización</div><div className="font-mono font-medium text-[11px] text-success-500 mt-[2px] tabular-nums">↑ End-to-end</div></div>
              <div><div className="font-display font-bold text-[28px] leading-none tracking-[-0.02em] tabular-nums text-fg-1">10x</div><div className="font-sans font-medium text-[10px] tracking-[0.08em] uppercase text-fg-3 mt-[6px]">Productividad</div><div className="font-mono font-medium text-[11px] text-success-500 mt-[2px] tabular-nums">Multiplicada</div></div>
              <div><div className="font-display font-bold text-[28px] leading-none tracking-[-0.02em] tabular-nums text-fg-1">0%</div><div className="font-sans font-medium text-[10px] tracking-[0.08em] uppercase text-fg-3 mt-[6px]">Humo Técnico</div><div className="font-mono font-medium text-[11px] text-success-500 mt-[2px] tabular-nums">Resultados reales</div></div>
            </div>
          </div>
        </div>
      </section>

      {/* SERVICIOS SECTION */}
      <section id="servicios" className="py-[96px] border-t border-border-1">
        <div className="max-w-[1200px] mx-auto px-8">
          <div className="max-w-[780px] mb-[56px]">
            <span className="font-sans font-semibold text-[11px] tracking-[0.1em] uppercase text-fg-3 mb-[14px] inline-block">Nuestros Servicios</span>
            <h2 className="font-display font-bold text-[clamp(32px,3.5vw,48px)] leading-[1.1] tracking-[-0.025em] mb-[16px] text-fg-1 text-balance">Transformamos modelos operativos completos.</h2>
            <p className="text-[17px] text-fg-2 m-0 leading-[1.55] max-w-[60ch] text-pretty">Combinamos Inteligencia Artificial, Marketing y Consultoría para generar resultados reales en PyMEs y corporaciones.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-[1px] bg-border-1 border border-border-1 rounded-[14px] overflow-hidden shadow-2">
            
            <div className="bg-bg p-[32px] flex flex-col gap-[12px] transition-colors duration-180 hover:bg-bg-elevated">
              <span className="font-mono font-semibold text-[11px] text-accent tracking-[0.08em]">01 / IA Aplicada</span>
              <h3 className="font-display font-semibold text-[22px] tracking-[-0.015em] mt-[4px] mb-[6px] text-fg-1">Factorías de Agentes</h3>
              <p className="text-fg-2 text-[14px] leading-[1.55] m-0">Construimos ecosistemas tecnológicos donde múltiples agentes de IA trabajan de forma coordinada (end-to-end).</p>
              <ul className="mt-[8px] mb-0 p-0 list-none">
                <li className="font-mono font-medium text-[12px] text-fg-3 py-[5px] border-t border-border-1">Automatización Editorial · Retaguardia Empresarial</li>
              </ul>
            </div>

            <div className="bg-bg p-[32px] flex flex-col gap-[12px] transition-colors duration-180 hover:bg-bg-elevated">
              <span className="font-mono font-semibold text-[11px] text-accent tracking-[0.08em]">02 / Research</span>
              <h3 className="font-display font-semibold text-[22px] tracking-[-0.015em] mt-[4px] mb-[6px] text-fg-1">Estudios de Mercado & Analítica</h3>
              <p className="text-fg-2 text-[14px] leading-[1.55] m-0">Investigación cuantitativa y cualitativa. Estrategias corporativas sostenidas en evidencia real.</p>
              <ul className="mt-[8px] mb-0 p-0 list-none">
                <li className="font-mono font-medium text-[12px] text-fg-3 py-[5px] border-t border-border-1">Nuevos Segmentos · Data Estratégica</li>
              </ul>
            </div>

            <div className="bg-bg p-[32px] flex flex-col gap-[12px] transition-colors duration-180 hover:bg-bg-elevated">
              <span className="font-mono font-semibold text-[11px] text-accent tracking-[0.08em]">03 / Marketing</span>
              <h3 className="font-display font-semibold text-[22px] tracking-[-0.015em] mt-[4px] mb-[6px] text-fg-1">Performance & Embudos</h3>
              <p className="text-fg-2 text-[14px] leading-[1.55] m-0">Diseño de embudos comerciales de alta conversión e identidades visuales para retención de marca.</p>
              <ul className="mt-[8px] mb-0 p-0 list-none">
                <li className="font-mono font-medium text-[12px] text-fg-3 py-[5px] border-t border-border-1">Rigor científico · Optimización continua</li>
              </ul>
            </div>

            <div className="bg-bg p-[32px] flex flex-col gap-[12px] transition-colors duration-180 hover:bg-bg-elevated">
              <span className="font-mono font-semibold text-[11px] text-accent tracking-[0.08em]">04 / Talento</span>
              <h3 className="font-display font-semibold text-[22px] tracking-[-0.015em] mt-[4px] mb-[6px] text-fg-1">Estrategia y Capacitación</h3>
              <p className="text-fg-2 text-[14px] leading-[1.55] m-0">Consultoría estratégica y transferencia de conocimiento mediante talleres y mentorías especializadas.</p>
              <ul className="mt-[8px] mb-0 p-0 list-none">
                <li className="font-mono font-medium text-[12px] text-fg-3 py-[5px] border-t border-border-1">Liderando la disrupción digital desde adentro</li>
              </ul>
            </div>

          </div>
        </div>
      </section>

      {/* BLOG PREVIEWS */}
      <section id="blog" className="py-[96px] border-t border-border-1 bg-bg-elevated/50">
        <div className="max-w-[1200px] mx-auto px-8">
          <div className="max-w-[780px] mb-[56px]">
            <span className="font-sans font-semibold text-[11px] tracking-[0.1em] uppercase text-fg-3 mb-[14px] inline-block">Insights & Artículos</span>
            <h2 className="font-display font-bold text-[clamp(32px,3.5vw,48px)] leading-[1.1] tracking-[-0.025em] mb-[16px] text-fg-1 text-balance">Conocimiento técnico, accionable.</h2>
            <p className="text-[17px] text-fg-2 m-0 leading-[1.55] max-w-[60ch] text-pretty">Flujos de automatización y estrategias de mercado explicadas sin caja negra.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-[20px]">
            
            <Link href="#" className="block bg-bg border border-border-1 rounded-[12px] p-[24px] cursor-pointer transition-all duration-180 ease-out hover:border-border-2 hover:-translate-y-[2px] shadow-1 hover:shadow-2 no-underline">
              <span className="font-sans font-semibold text-[10px] tracking-[0.08em] uppercase text-accent">IA Aplicada</span>
              <h3 className="font-display font-semibold text-[18px] leading-[1.3] tracking-[-0.01em] my-[12px] text-fg-1 text-balance">Factorías de Agentes: Automatización End-to-End</h3>
              <p className="text-[13px] text-fg-2 leading-[1.5] mt-[16px] border-t border-border-1 pt-[14px]">Cómo equipos de agentes IA coordinados están revolucionando la producción de contenido en tiempo récord, como en Visual Art AI.</p>
            </Link>

            <Link href="#" className="block bg-bg border border-border-1 rounded-[12px] p-[24px] cursor-pointer transition-all duration-180 ease-out hover:border-border-2 hover:-translate-y-[2px] shadow-1 hover:shadow-2 no-underline">
              <span className="font-sans font-semibold text-[10px] tracking-[0.08em] uppercase text-accent">Marketing & Ventas</span>
              <h3 className="font-display font-semibold text-[18px] leading-[1.3] tracking-[-0.01em] my-[12px] text-fg-1 text-balance">Del Logo al Cierre: Anatomía del Embudo Perfecto</h3>
              <p className="text-[13px] text-fg-2 leading-[1.5] mt-[16px] border-t border-border-1 pt-[14px]">Más allá de la identidad corporativa pyme: cómo el diseño estratégico y el performance marketing nutren cada etapa de tu relación con el cliente.</p>
            </Link>

            <Link href="#" className="block bg-bg border border-border-1 rounded-[12px] p-[24px] cursor-pointer transition-all duration-180 ease-out hover:border-border-2 hover:-translate-y-[2px] shadow-1 hover:shadow-2 no-underline">
              <span className="font-sans font-semibold text-[10px] tracking-[0.08em] uppercase text-accent">Estrategia</span>
              <h3 className="font-display font-semibold text-[18px] leading-[1.3] tracking-[-0.01em] my-[12px] text-fg-1 text-balance">La Rentabilidad de la Transferencia Tecnológica</h3>
              <p className="text-[13px] text-fg-2 leading-[1.5] mt-[16px] border-t border-border-1 pt-[14px]">El falso ahorro de las herramientas mágicas contra el verdadero ROI de capacitar y mentorear internamente a los líderes de tu empresa.</p>
            </Link>

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
              <h2 className="font-display font-bold text-[40px] leading-[1.1] tracking-[-0.025em] m-0 mb-[16px] text-fg-1">Hablemos de tu Negocio.</h2>
              <p className="text-fg-2 text-[16px] leading-[1.55] m-0">Ya sea para diseñar embudos conversionales, levantar IA aplicada o estudiar el mercado local. Un consultor sénior de Deep Analytica está listo para apoyarte.</p>
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
