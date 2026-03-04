import Link from "next/link";

export default function ShareLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-background">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
          <div className="flex items-center gap-3">
            <Link href="/" className="text-lg font-bold">
              maturIAté
            </Link>
            <span className="text-sm text-muted-foreground">Résultats partagés</span>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6">{children}</main>
      <footer className="border-t py-6 text-center text-sm text-muted-foreground">
        <p>
          Propulsé par{" "}
          <Link href="/" className="underline hover:text-foreground">
            maturIAté
          </Link>{" "}
          — Évaluez et suivez la maturité IA de vos équipes
        </p>
      </footer>
    </div>
  );
}
