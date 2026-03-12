"use client";

import { useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";

function VerifyInviteContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const [loading, setLoading] = useState(false);

  if (!token) {
    return (
      <div className="rounded-lg border border-red-200 bg-white p-8 text-center shadow-sm">
        <h2 className="mb-2 text-xl font-semibold text-gray-900">
          Lien invalide
        </h2>
        <p className="text-sm text-gray-500">
          Ce lien d&apos;invitation est invalide. Contactez l&apos;administrateur de
          l&apos;organisation pour recevoir une nouvelle invitation.
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

  function handleClick() {
    setLoading(true);
    window.location.href = `/invite/${encodeURIComponent(token!)}`;
  }

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-8 text-center shadow-sm">
      <h2 className="mb-2 text-xl font-semibold text-gray-900">
        Invitation à rejoindre une organisation
      </h2>
      <p className="mb-6 text-sm text-gray-500">
        Cliquez sur le bouton ci-dessous pour consulter et accepter votre
        invitation sur maturIAté.
      </p>
      <button
        type="button"
        onClick={handleClick}
        disabled={loading}
        className="inline-block rounded-md bg-blue-600 px-6 py-3 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
      >
        {loading ? "Chargement…" : "Voir l\u2019invitation"}
      </button>
      <p className="mt-4 text-xs text-gray-400">
        Cette invitation expire dans 7 jours.
      </p>
    </div>
  );
}

export default function VerifyInvitePage() {
  return (
    <Suspense
      fallback={
        <div className="rounded-lg border border-gray-200 bg-white p-8 text-center shadow-sm">
          <p className="text-sm text-gray-500">Chargement…</p>
        </div>
      }
    >
      <VerifyInviteContent />
    </Suspense>
  );
}
