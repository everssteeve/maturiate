"use client";

import Link from "next/link";
import { useState } from "react";
import { Menu, X } from "lucide-react";

import { Button } from "@/components/ui/button";

interface PublicHeaderProps {
  isAuthenticated?: boolean;
}

export function PublicHeader({ isAuthenticated }: PublicHeaderProps) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="border-b bg-background">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="text-lg font-bold tracking-tight">
          maturIAté
        </Link>

        {/* Desktop navigation */}
        <nav className="hidden items-center gap-4 md:flex">
          <Link
            href="/state-of-ia"
            className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            State of IA
          </Link>

          {isAuthenticated ? (
            <Button asChild size="sm">
              <Link href="/orgs">Tableau de bord</Link>
            </Button>
          ) : (
            <>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/login">Se connecter</Link>
              </Button>
              <Button size="sm" asChild>
                <Link href="/login">Commencer</Link>
              </Button>
            </>
          )}
        </nav>

        {/* Mobile hamburger */}
        <button
          className="md:hidden"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label={menuOpen ? "Fermer le menu" : "Ouvrir le menu"}
        >
          {menuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <nav className="flex flex-col gap-2 border-t px-4 py-3 md:hidden">
          <Link
            href="/state-of-ia"
            className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            onClick={() => setMenuOpen(false)}
          >
            State of IA
          </Link>

          {isAuthenticated ? (
            <Button asChild size="sm" className="w-full">
              <Link href="/orgs">Tableau de bord</Link>
            </Button>
          ) : (
            <div className="flex flex-col gap-2">
              <Button variant="ghost" size="sm" asChild className="w-full">
                <Link href="/login">Se connecter</Link>
              </Button>
              <Button size="sm" asChild className="w-full">
                <Link href="/login">Commencer</Link>
              </Button>
            </div>
          )}
        </nav>
      )}
    </header>
  );
}
