import Link from 'next/link';

export default function BlogPost({ params }: { params: { slug: string } }) {
  // Aquí haremos la petición real: client.fetch(`*[_type == "post" && slug.current == $slug][0]`, { slug: params.slug })
  
  return (
    <article className="pt-[140px] pb-[96px] max-w-[700px] mx-auto px-8 min-h-screen">
      <Link href="/blog" className="font-sans text-[12px] text-fg-3 hover:text-fg-1 transition-colors flex items-center gap-2 mb-[48px] no-underline">
        ← Volver al radar
      </Link>
      
      <header className="mb-[64px]">
        <div className="font-mono text-[12px] text-accent tracking-[0.05em] mb-[16px] uppercase">Método aplicado</div>
        <h1 className="font-display font-bold text-[clamp(32px,4vw,56px)] leading-[1.1] tracking-[-0.02em] text-fg-1 mb-[24px]">
          {params.slug.replace(/-/g, ' ')}
        </h1>
        <div className="flex items-center gap-[12px] pt-[24px] border-t border-border-1">
          <div className="w-[40px] h-[40px] rounded-full bg-border-2" />
          <div>
            <div className="font-sans font-medium text-[13px] text-fg-1">Equipo Deep Analytica</div>
            <div className="font-mono text-[11px] text-fg-3">24 Abril 2026 · 5 min de lectura</div>
          </div>
        </div>
      </header>

      <div className="prose prose-invert prose-p:text-fg-2 prose-p:text-[17px] prose-p:leading-[1.7] prose-headings:font-display prose-headings:text-fg-1 prose-a:text-brand-cyan max-w-none">
        <p>Este contenido se publicará desde Sanity CMS. El radar reunirá aprendizajes sobre estrategia, performance marketing, IA aplicada y transferencia de capacidades.</p>
        <h2>El problema no es la herramienta</h2>
        <p>La mayoría de equipos ya tiene acceso a IA. Lo difícil es saber qué delegar, cómo evaluar resultados y cuándo convertir un flujo manual en un sistema de agentes.</p>
        <blockquote>Dirigir IA es aprender a formular decisiones, no acumular prompts.</blockquote>
        <p>Pronto este espacio se poblará con casos, guías y playbooks para organizaciones públicas y privadas.</p>
      </div>
    </article>
  );
}
