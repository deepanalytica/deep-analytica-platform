import Image from 'next/image';

export function Footer() {
  return (
    <footer className="pt-[48px] pb-[64px] border-t border-border-1 text-fg-3 text-[13px]">
      <div className="max-w-[1200px] mx-auto px-8 flex flex-col sm:flex-row gap-4 sm:justify-between sm:items-center">
        <div className="flex items-center gap-4">
          <Image src="/logo-dark-bg.svg" alt="Deep Analytica" width={140} height={18} className="h-[18px] w-auto opacity-80 grayscale hover:grayscale-0 transition-all duration-200" />
          <span>© 2026 Deep Analytica</span>
        </div>
        <div>
          contacto@deepanalytica.com · Madrid
        </div>
      </div>
    </footer>
  );
}
