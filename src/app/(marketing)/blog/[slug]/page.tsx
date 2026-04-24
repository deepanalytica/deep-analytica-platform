import Link from 'next/link';

export default function BlogPost({ params }: { params: { slug: string } }) {
  // Aquí haremos la petición real: client.fetch(`*[_type == "post" && slug.current == $slug][0]`, { slug: params.slug })
  
  return (
    <article className="pt-[140px] pb-[96px] max-w-[700px] mx-auto px-8 min-h-screen">
      <Link href="/blog" className="font-sans text-[12px] text-fg-3 hover:text-fg-1 transition-colors flex items-center gap-2 mb-[48px] no-underline">
        ← Volver al Radar
      </Link>
      
      <header className="mb-[64px]">
        <div className="font-mono text-[12px] text-accent tracking-[0.05em] mb-[16px] uppercase">Investigación</div>
        <h1 className="font-display font-bold text-[clamp(32px,4vw,56px)] leading-[1.1] tracking-[-0.02em] text-fg-1 mb-[24px]">
          {params.slug.replace(/-/g, ' ')}
        </h1>
        <div className="flex items-center gap-[12px] pt-[24px] border-t border-border-1">
          <div className="w-[40px] h-[40px] rounded-full bg-border-2" />
          <div>
            <div className="font-sans font-medium text-[13px] text-fg-1">Equipo Analytica</div>
            <div className="font-mono text-[11px] text-fg-3">24 Abril 2026 · 5 min read</div>
          </div>
        </div>
      </header>

      <div className="prose prose-invert prose-p:text-fg-2 prose-p:text-[17px] prose-p:leading-[1.7] prose-headings:font-display prose-headings:text-fg-1 prose-a:text-brand-cyan max-w-none">
        <p>Este es el cuerpo del artículo que será inyectado directamente desde Sanity CMS. Cuando escribas en tu panel de administración, el texto aparecerá aquí mágicamente con todos los estilos aplicados.</p>
        <h2>El problema de la caja negra</h2>
        <p>La mayoría de agencias venden IA como magia. Nosotros la construimos como ingeniería de software tradicional: evaluable, auditable y con un SLA.</p>
        <blockquote>La automatización real no reemplaza procesos, los multiplica por diez.</blockquote>
        <p>Fin del contenido de muestra. Todo esto se poblará dinámicmsnte.</p>
      </div>
    </article>
  );
}
