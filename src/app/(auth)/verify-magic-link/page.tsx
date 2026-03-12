"use client";

import { useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";

import { signOut } from "@/lib/auth/client";

function VerifyMagicLinkContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const callbackURL = searchParams.get("callbackURL") || "/orgs";
  const [loading, setLoading] = useState(false);

  if (!token) {
    return (
      <div className="rounded-lg border border-red-200 bg-white p-8 text-center shadow-sm">
        <h2 className="mb-2 text-xl font-semibold text-gray-900">
          Lien invalide
        </h2>
        <p className="text-sm text-gray-500">
          Ce lien de connexion est invalide ou a expiré. Veuillez demander un
          nouveau lien depuis la page de connexion.
        </p>
        <a
          href="/login"
          className="mt-4 inline-block rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          Retour à la connexion
        </a>
      </div>
    );
  }

  const verifyUrl = `/api/auth/magic-link/verify?token=${encodeURIComponent(token)}&callbackURL=${encodeURIComponent(callbackURL)}`;

  async function handleClick() {
    setLoading(true);
    // Sign out any existing session before verifying the new magic link
    // to prevent being logged in as the wrong account
    try {
      await signOut();
    } catch {
      // Ignore sign-out errors (e.g. no active session)
    }
    window.location.href = verifyUrl;
  }

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-8 text-center shadow-sm">
      <h2 className="mb-2 text-xl font-semibold text-gray-900">
        Confirmer la connexion
      </h2>
      <p className="mb-6 text-sm text-gray-500">
        Cliquez sur le bouton ci-dessous pour finaliser votre connexion à
        maturIAté.
      </p>
      <button
        type="button"
        onClick={handleClick}
        disabled={loading}
        className="inline-block rounded-md bg-blue-600 px-6 py-3 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
      >
        {loading ? "Connexion en cours…" : "Se connecter"}
      </button>
      <p className="mt-4 text-xs text-gray-400">
        Ce lien expire dans 10 minutes et ne peut être utilisé qu&apos;une seule
        fois.
      </p>
    </div>
  );
}

export default function VerifyMagicLinkPage() {
  return (
    <Suspense
      fallback={
        <div className="rounded-lg border border-gray-200 bg-white p-8 text-center shadow-sm">
          <p className="text-sm text-gray-500">Chargement…</p>
        </div>
      }
    >
      <VerifyMagicLinkContent />
    </Suspense>
  );
}
