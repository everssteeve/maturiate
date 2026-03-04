"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Copy, Check, Trash2, Link2, Clock } from "lucide-react";

import { createShareLink, deleteShareLink } from "@/lib/actions/share-links";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

export type ShareLinkItem = {
  id: string;
  token: string;
  expiresAt: Date | null;
  createdAt: Date;
};

interface ShareDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  orgId: string;
  type: "team" | "campaign" | "org";
  targetId: string;
  existingLinks: ShareLinkItem[];
}

const EXPIRATION_OPTIONS = [
  { value: "none", label: "Jamais" },
  { value: "1d", label: "1 jour" },
  { value: "7d", label: "7 jours" },
  { value: "30d", label: "30 jours" },
  { value: "90d", label: "90 jours" },
];

function getExpiresAt(value: string): Date | undefined {
  if (value === "none") return undefined;
  const days = parseInt(value);
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date;
}

function isExpired(expiresAt: Date | null): boolean {
  if (!expiresAt) return false;
  return expiresAt < new Date();
}

function formatDate(date: Date): string {
  return date.toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function ShareDialog({
  open,
  onOpenChange,
  orgId,
  type,
  targetId,
  existingLinks,
}: ShareDialogProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [expiration, setExpiration] = useState("none");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [newUrl, setNewUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const baseUrl = typeof window !== "undefined" ? window.location.origin : "";

  function handleCreate() {
    setError(null);
    startTransition(async () => {
      const result = await createShareLink({
        orgId,
        type,
        targetId,
        expiresAt: getExpiresAt(expiration),
      });
      if ("error" in result && result.error) {
        setError(result.error);
      } else if ("shareUrl" in result && result.shareUrl) {
        setNewUrl(result.shareUrl);
        await navigator.clipboard.writeText(result.shareUrl);
        setCopiedId("new");
        setTimeout(() => setCopiedId(null), 2000);
        router.refresh();
      }
    });
  }

  function handleCopy(token: string) {
    const url = `${baseUrl}/share/${token}`;
    navigator.clipboard.writeText(url);
    setCopiedId(token);
    setTimeout(() => setCopiedId(null), 2000);
  }

  function handleDelete(linkId: string) {
    setError(null);
    startTransition(async () => {
      const result = await deleteShareLink({ orgId, linkId });
      if (result.error) {
        setError(result.error);
      } else {
        router.refresh();
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[80vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Partager les résultats</DialogTitle>
          <DialogDescription>
            Générez un lien de partage en lecture seule. Les personnes ayant le
            lien pourront consulter les résultats sans avoir besoin d&apos;un
            compte.
          </DialogDescription>
        </DialogHeader>

        {error && <p className="text-sm text-destructive">{error}</p>}

        {newUrl ? (
          <div className="space-y-3">
            <Label>Lien créé</Label>
            <div className="flex items-center gap-2">
              <Input value={newUrl} readOnly className="text-sm" />
              <Button
                variant="outline"
                size="icon"
                onClick={() => {
                  navigator.clipboard.writeText(newUrl);
                  setCopiedId("new");
                  setTimeout(() => setCopiedId(null), 2000);
                }}
              >
                {copiedId === "new" ? (
                  <Check className="size-4 text-green-600" />
                ) : (
                  <Copy className="size-4" />
                )}
              </Button>
            </div>
            <p className="text-sm text-muted-foreground">
              Le lien a été copié dans votre presse-papier.
            </p>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setNewUrl(null);
                  setExpiration("none");
                }}
              >
                Créer un autre lien
              </Button>
              <Button onClick={() => onOpenChange(false)}>Terminé</Button>
            </DialogFooter>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="expiration">Expiration</Label>
              <Select value={expiration} onValueChange={setExpiration}>
                <SelectTrigger id="expiration">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {EXPIRATION_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Button onClick={handleCreate} disabled={isPending} className="w-full">
              <Link2 className="mr-2 size-4" />
              {isPending ? "Création..." : "Créer un lien de partage"}
            </Button>
          </div>
        )}

        {existingLinks.length > 0 && (
          <>
            <Separator />
            <div className="space-y-2">
              <Label>Liens existants</Label>
              <div className="space-y-2">
                {existingLinks.map((link) => {
                  const expired = isExpired(link.expiresAt);
                  return (
                    <div
                      key={link.id}
                      className="flex items-center justify-between rounded-md border px-3 py-2"
                    >
                      <div className="min-w-0 flex-1 space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="truncate font-mono text-xs text-muted-foreground">
                            /share/{link.token.slice(0, 8)}...
                          </span>
                          {expired ? (
                            <Badge variant="destructive" className="text-xs">
                              Expiré
                            </Badge>
                          ) : (
                            <Badge variant="secondary" className="text-xs">
                              Actif
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Clock className="size-3" />
                          {link.expiresAt
                            ? `Expire le ${formatDate(link.expiresAt)}`
                            : "Pas d'expiration"}
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="size-8"
                          onClick={() => handleCopy(link.token)}
                          disabled={expired}
                        >
                          {copiedId === link.token ? (
                            <Check className="size-3.5 text-green-600" />
                          ) : (
                            <Copy className="size-3.5" />
                          )}
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="size-8 text-destructive hover:text-destructive"
                          onClick={() => handleDelete(link.id)}
                          disabled={isPending}
                        >
                          <Trash2 className="size-3.5" />
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
