import Link from 'next/link';

export default function BlogListing() {
  // Aquí irá la llamada fetch de Sanity usando `client.fetch(...)`
  // Simularemos los posts mientras configuras tu projectId

  const mockPosts = [
    { slug: 'factorias-de-agentes', title: 'Factorías de Agentes: Automatización End-to-End', date: '24 Abril 2026', excerpt: 'Cómo equipos de agentes IA coordinados están revolucionando la producción de contenido.' },
    { slug: 'anatomia-embudo-perfecto', title: 'Del Logo al Cierre: Anatomía del Embudo Perfecto', date: '15 Abril 2026', excerpt: 'Más allá de la identidad corporativa pyme: cómo el diseño estratégico nutre la relación con el cliente.' },
    { slug: 'rentabilidad-transferencia', title: 'La Rentabilidad de la Transferencia Tecnológica', date: '02 Abril 2026', excerpt: 'El verdadero ROI de capacitar y mentorear internamente a los líderes de tu empresa.' },
  ];

  return (
    <div className="pt-[140px] pb-[96px] max-w-[800px] mx-auto px-8 min-h-screen">
      <span className="font-sans font-semibold text-[11px] tracking-[0.1em] uppercase text-accent mb-[14px] inline-block">Radar de Inteligencia</span>
      <h1 className="font-display font-bold text-[clamp(40px,5vw,64px)] leading-[1.05] tracking-[-0.025em] mb-[48px] text-fg-1 text-balance">
        Artículos, análisis y código abierto.
      </h1>

      <div className="flex flex-col gap-[32px]">
        {mockPosts.map((post) => (
          <Link key={post.slug} href={`/blog/${post.slug}`} className="block group no-underline border-b border-border-1 pb-[32px]">
            <div className="font-mono text-[12px] text-fg-3 mb-[12px]">{post.date}</div>
            <h2 className="font-display font-semibold text-[24px] text-fg-1 leading-[1.3] group-hover:text-brand-cyan transition-colors duration-200">
              {post.title}
            </h2>
            <p className="text-[16px] text-fg-2 leading-[1.6] mt-[12px]">{post.excerpt}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
