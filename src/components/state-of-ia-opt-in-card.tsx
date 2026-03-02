"use client";

import { useState, useTransition } from "react";

import { toggleStateOfIaOptIn } from "@/lib/actions/organizations";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface StateOfIaOptInCardProps {
  orgId: string;
  optIn: boolean;
  optInDate: Date | null;
  readOnly?: boolean;
}

export function StateOfIaOptInCard({ orgId, optIn, optInDate, readOnly }: StateOfIaOptInCardProps) {
  const [pending, startTransition] = useTransition();
  const [showConfirmDisable, setShowConfirmDisable] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  function handleEnable() {
    startTransition(async () => {
      await toggleStateOfIaOptIn({ orgId, optIn: true });
      setMessage("Participation au State of IA activée.");
    });
  }

  function handleDisable() {
    startTransition(async () => {
      await toggleStateOfIaOptIn({ orgId, optIn: false });
      setMessage("Participation au State of IA désactivée.");
      setShowConfirmDisable(false);
    });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>State of IA</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="rounded-lg bg-muted/50 p-4 text-sm text-muted-foreground">
          <p className="mb-2">
            Le <strong>State of IA</strong> est un rapport annuel publié par AIAD qui permet de
            benchmarker la maturité IA des organisations.
          </p>
          <ul className="list-inside list-disc space-y-1">
            <li>Les données sont agrégées au niveau de l&apos;organisation (pas individuelles)</li>
            <li>
              L&apos;identité de l&apos;organisation est irréversiblement anonymisée (hash SHA-256)
            </li>
            <li>Seuls le secteur et la taille sont conservés pour la segmentation</li>
            <li>
              En contrepartie, vous accédez au benchmark &laquo; Mon positionnement &raquo; pour
              comparer votre organisation
            </li>
          </ul>
        </div>

        {optIn ? (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="inline-block size-2 rounded-full bg-green-500" />
              <span className="text-sm font-medium">Participation active</span>
            </div>
            {optInDate && (
              <p className="text-xs text-muted-foreground">
                Activée le {new Date(optInDate).toLocaleDateString("fr-FR")}
              </p>
            )}
            {!readOnly && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowConfirmDisable(true)}
                disabled={pending}
              >
                Désactiver la participation
              </Button>
            )}
          </div>
        ) : (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="inline-block size-2 rounded-full bg-muted-foreground" />
              <span className="text-sm font-medium">Non participant</span>
            </div>
            {!readOnly && (
              <Button size="sm" onClick={handleEnable} disabled={pending}>
                {pending ? "Activation..." : "Activer la participation"}
              </Button>
            )}
          </div>
        )}

        {message && <p className="text-sm text-green-600">{message}</p>}

        <Dialog open={showConfirmDisable} onOpenChange={setShowConfirmDisable}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Désactiver la participation</DialogTitle>
              <DialogDescription>
                Êtes-vous sûr ? Votre organisation ne contribuera plus au rapport annuel et
                n&apos;aura plus accès au benchmark.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowConfirmDisable(false)}>
                Annuler
              </Button>
              <Button variant="destructive" onClick={handleDisable} disabled={pending}>
                Désactiver
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}
