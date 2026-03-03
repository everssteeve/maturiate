"use client";

import { useTransition, useState } from "react";

import { createCampaign } from "@/lib/actions/campaigns";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface CampaignFormProps {
  orgId: string;
}

export function CampaignForm({ orgId }: CampaignFormProps) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    const formData = new FormData(e.currentTarget);
    const name = formData.get("name") as string;
    const startDate = formData.get("startDate") as string;
    const endDate = formData.get("endDate") as string;

    if (!name.trim()) {
      setError("Le nom de la campagne est requis.");
      return;
    }

    if (!startDate) {
      setError("La date de début est requise.");
      return;
    }

    startTransition(async () => {
      try {
        await createCampaign({
          orgId,
          name: name.trim(),
          startDate: new Date(startDate),
          endDate: endDate ? new Date(endDate) : undefined,
        });
      } catch (e) {
        if (e instanceof Error && e.message !== "NEXT_REDIRECT") {
          setError(e.message || "Une erreur est survenue.");
        }
      }
    });
  }

  return (
    <Card className="max-w-lg">
      <CardHeader>
        <CardTitle>Créer une campagne</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <p className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">{error}</p>
          )}

          <div className="space-y-2">
            <Label htmlFor="name">Nom de la campagne</Label>
            <Input
              id="name"
              name="name"
              placeholder="Ex : Campagne Q1 2026"
              required
              maxLength={100}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="startDate">Date de début</Label>
            <Input id="startDate" name="startDate" type="date" required />
          </div>

          <div className="space-y-2">
            <Label htmlFor="endDate">Date de fin (optionnelle)</Label>
            <Input id="endDate" name="endDate" type="date" />
          </div>

          <Button type="submit" disabled={isPending}>
            {isPending ? "Création..." : "Créer la campagne"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
