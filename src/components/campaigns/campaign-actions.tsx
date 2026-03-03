"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Play, Square, Bell, Trash2 } from "lucide-react";

import { launchCampaign, closeCampaign, sendCampaignReminders, deleteCampaign } from "@/lib/actions/campaigns";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface CampaignActionsProps {
  orgId: string;
  campaignId: string;
  status: string;
  hasTeams: boolean;
  allResponded: boolean;
}

export function CampaignActions({ orgId, campaignId, status, hasTeams, allResponded }: CampaignActionsProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [openDialog, setOpenDialog] = useState<string | null>(null);

  function handleAction(action: () => Promise<{ error?: string; success?: boolean }>) {
    setError(null);
    startTransition(async () => {
      const result = await action();
      if (result.error) {
        setError(result.error);
      } else {
        setOpenDialog(null);
        router.refresh();
      }
    });
  }

  return (
    <div className="flex items-center gap-2">
      {error && (
        <p className="text-sm text-destructive">{error}</p>
      )}

      {status === "draft" && (
        <>
          <Dialog open={openDialog === "launch"} onOpenChange={(o) => setOpenDialog(o ? "launch" : null)}>
            <DialogTrigger asChild>
              <Button disabled={!hasTeams}>
                <Play className="mr-2 size-4" />
                Lancer
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Lancer la campagne</DialogTitle>
                <DialogDescription>
                  Des emails d&apos;invitation seront envoyés aux managers de chaque équipe. Cette
                  action est irréversible.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button variant="outline" onClick={() => setOpenDialog(null)}>
                  Annuler
                </Button>
                <Button
                  disabled={isPending}
                  onClick={() => handleAction(() => launchCampaign({ orgId, campaignId }))}
                >
                  {isPending ? "Lancement..." : "Confirmer le lancement"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Dialog open={openDialog === "delete"} onOpenChange={(o) => setOpenDialog(o ? "delete" : null)}>
            <DialogTrigger asChild>
              <Button variant="destructive" size="icon">
                <Trash2 className="size-4" />
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Supprimer la campagne</DialogTitle>
                <DialogDescription>
                  Cette action est irréversible. La campagne sera définitivement supprimée.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button variant="outline" onClick={() => setOpenDialog(null)}>
                  Annuler
                </Button>
                <Button
                  variant="destructive"
                  disabled={isPending}
                  onClick={() => {
                    setError(null);
                    startTransition(async () => {
                      const result = await deleteCampaign({ orgId, campaignId });
                      if (result.error) {
                        setError(result.error);
                      } else {
                        router.push(`/orgs/${orgId}/campaigns`);
                      }
                    });
                  }}
                >
                  {isPending ? "Suppression..." : "Supprimer"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </>
      )}

      {status === "active" && (
        <>
          {!allResponded && (
            <Dialog open={openDialog === "remind"} onOpenChange={(o) => setOpenDialog(o ? "remind" : null)}>
              <DialogTrigger asChild>
                <Button variant="outline">
                  <Bell className="mr-2 size-4" />
                  Relancer
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Relancer les équipes</DialogTitle>
                  <DialogDescription>
                    Un email de rappel sera envoyé aux managers des équipes n&apos;ayant pas encore
                    rempli leur diagnostic.
                  </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setOpenDialog(null)}>
                    Annuler
                  </Button>
                  <Button
                    disabled={isPending}
                    onClick={() => handleAction(() => sendCampaignReminders({ orgId, campaignId }))}
                  >
                    {isPending ? "Envoi..." : "Envoyer les rappels"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}

          <Dialog open={openDialog === "close"} onOpenChange={(o) => setOpenDialog(o ? "close" : null)}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Square className="mr-2 size-4" />
                Clôturer
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Clôturer la campagne</DialogTitle>
                <DialogDescription>
                  La campagne sera marquée comme terminée. Aucun nouveau diagnostic ne pourra être
                  soumis.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button variant="outline" onClick={() => setOpenDialog(null)}>
                  Annuler
                </Button>
                <Button
                  disabled={isPending}
                  onClick={() => handleAction(() => closeCampaign({ orgId, campaignId }))}
                >
                  {isPending ? "Clôture..." : "Confirmer la clôture"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </>
      )}
    </div>
  );
}
