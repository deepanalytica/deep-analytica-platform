import Link from 'next/link';
import Image from 'next/image';

export function Navbar() {
  return (
    <header className="sticky top-0 bg-bg/88 backdrop-blur-md border-b border-border-1 z-10">
      <div className="max-w-[1200px] mx-auto px-8 py-[18px] flex items-center justify-between">
        <Link href="/">
          <Image 
            src="/logo-dark-bg.svg" 
            alt="Deep Analytica" 
            width={180} 
            height={22} 
            className="h-[22px] w-auto block" 
            priority 
          />
        </Link>
        <nav>
          <ul className="flex gap-7 list-none m-0 p-0">
            <li><Link href="#servicios" className="text-fg-2 font-medium text-sm no-underline hover:text-fg-1 transition-colors">Servicios</Link></li>
            <li><Link href="#casos" className="text-fg-2 font-medium text-sm no-underline hover:text-fg-1 transition-colors">Casos</Link></li>
            <li><Link href="#capacitacion" className="text-fg-2 font-medium text-sm no-underline hover:text-fg-1 transition-colors">Capacitación</Link></li>
            <li><Link href="#metodologia" className="text-fg-2 font-medium text-sm no-underline hover:text-fg-1 transition-colors">Metodología</Link></li>
          </ul>
        </nav>
        <div className="flex gap-2.5">
          <Link href="/login" className="font-sans text-[14px] font-semibold rounded-md px-4 py-2.5 cursor-pointer border border-border-2 bg-transparent text-fg-1 transition-all duration-180 ease-out inline-flex items-center gap-2 hover:border-border-3 hover:bg-[rgba(247,248,255,0.04)]">
            Iniciar sesión
          </Link>
          <Link href="#contacto" className="font-sans text-[14px] font-semibold rounded-md px-4 py-2.5 cursor-pointer border border-transparent bg-brand-cyan text-brand-cyan-ink transition-all duration-180 ease-out inline-flex items-center gap-2 hover:bg-c-400">
            Solicita una demo
          </Link>
        </div>
      </div>
    </header>
  );
}
