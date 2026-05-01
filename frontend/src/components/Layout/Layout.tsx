import { ReactNode } from "react";

interface Props {
  children: ReactNode;
}

export function Layout({ children }: Props) {
  return (
    <div className="min-h-screen flex flex-col bg-neutral-cream">
      <header className="bg-neutral-charcoal px-6 py-4">
        <div className="max-w-5xl mx-auto">
          <span className="font-display text-2xl text-white tracking-wide">
            <span className="text-primary">Palmetto</span>
            &nbsp;Weather
          </span>
        </div>
      </header>

      <main className="flex-1 w-full max-w-5xl mx-auto px-6 py-10">
        {children}
      </main>

      <footer className="bg-neutral-charcoal px-6 py-6 max-h-[400px]">
        <div className="max-w-5xl mx-auto flex items-center justify-between text-sm text-neutral-mid">
          <span className="font-display text-white">Palmetto Weather</span>
          <span>© {new Date().getFullYear()} Palmetto</span>
        </div>
      </footer>
    </div>
  );
}
