import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t py-8">
      <div className="mx-auto flex max-w-7xl flex-col items-center gap-4 px-4 text-sm text-muted-foreground sm:flex-row sm:justify-between sm:px-6">
        <p>&copy; {new Date().getFullYear()} maturIAté — Propulsé par AIAD</p>
        <nav className="flex gap-6">
          <Link
            href="/state-of-ia"
            className="transition-colors hover:text-foreground"
          >
            State of IA
          </Link>
          <Link
            href="/login"
            className="transition-colors hover:text-foreground"
          >
            Se connecter
          </Link>
        </nav>
      </div>
    </footer>
  );
}
