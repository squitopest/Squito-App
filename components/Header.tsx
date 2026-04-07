import Link from "next/link";

export function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-squito-pine/10 bg-squito-cream/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
        <Link href="/" className="group flex items-baseline gap-2">
          <span className="font-display text-2xl font-semibold tracking-tight text-squito-forest">
            Squito
          </span>
          <span className="hidden text-xs font-medium uppercase tracking-widest text-squito-sage sm:inline">
            Long Island
          </span>
        </Link>
        <nav className="flex items-center gap-2 text-sm font-medium sm:gap-6">
          <Link
            href="/members"
            className="rounded-full px-3 py-2 text-squito-sage transition hover:bg-squito-pine/5 hover:text-squito-forest sm:px-0"
          >
            <span className="sm:hidden">Club</span>
            <span className="hidden sm:inline">Squito Club</span>
          </Link>
          <Link
            href="/book"
            className="rounded-full bg-squito-forest px-4 py-2 text-white transition hover:bg-squito-pine"
          >
            Book
          </Link>
        </nav>
      </div>
    </header>
  );
}
