"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Play, AlertTriangle, CheckCircle2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  extractStateOfIaSnapshots,
  checkExistingExtraction,
  createReport,
} from "@/lib/actions/state-of-ia";

type ExtractionResult = {
  success: true;
  extracted: number;
  excluded: { orgName: string; reason: string }[];
  year: number;
};

export function ExtractionPanel({
  optInCount,
  existingYears,
}: {
  optInCount: number;
  existingYears: number[];
}) {
  const currentYear = new Date().getFullYear();
  const [year, setYear] = useState(currentYear);
  const [isPending, startTransition] = useTransition();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [result, setResult] = useState<ExtractionResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  function handleExtract() {
    setError(null);
    setResult(null);

    startTransition(async () => {
      // Check if extraction exists
      const exists = await checkExistingExtraction(year);
      if (exists) {
        setConfirmOpen(true);
        return;
      }

      await doExtraction(false);
    });
  }

  async function doExtraction(replaceExisting: boolean) {
    setConfirmOpen(false);

    const res = await extractStateOfIaSnapshots({ year, replaceExisting });

    if ("error" in res) {
      setError(res.error);
    } else {
      setResult(res);
    }

    router.refresh();
  }

  async function handleCreateReport() {
    setError(null);

    const res = await createReport({ year });
    if ("error" in res && res.error) {
      setError(res.error as string);
    } else {
      router.push(`/admin/state-of-ia/reports/${year}`);
    }
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Extraction annuelle</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-end gap-4">
            <div className="space-y-2">
              <Label htmlFor="year">Année</Label>
              <Input
                id="year"
                type="number"
                min={2024}
                max={2100}
                value={year}
                onChange={(e) => setYear(Number(e.target.value))}
                className="w-32"
              />
            </div>
            <Button onClick={handleExtract} disabled={isPending || optInCount === 0}>
              {isPending ? (
                <Loader2 className="mr-2 size-4 animate-spin" />
              ) : (
                <Play className="mr-2 size-4" />
              )}
              Lancer l&apos;extraction
            </Button>
            <Button variant="outline" onClick={handleCreateReport} disabled={isPending}>
              Créer le rapport {year}
            </Button>
          </div>

          {optInCount === 0 && (
            <Alert>
              <AlertTriangle className="size-4" />
              <AlertDescription>
                Aucune organisation n&apos;a activé la participation au State of IA.
              </AlertDescription>
            </Alert>
          )}

          {error && (
            <Alert variant="destructive">
              <AlertTriangle className="size-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {result && (
            <Alert>
              <CheckCircle2 className="size-4" />
              <AlertDescription>
                <p className="font-medium">
                  Extraction {result.year} terminée — {result.extracted} organisation
                  {result.extracted > 1 ? "s" : ""} extraite{result.extracted > 1 ? "s" : ""}
                </p>
                {result.excluded.length > 0 && (
                  <div className="mt-2">
                    <p className="text-sm font-medium">
                      {result.excluded.length} organisation{result.excluded.length > 1 ? "s" : ""}{" "}
                      exclue{result.excluded.length > 1 ? "s" : ""} :
                    </p>
                    <ul className="mt-1 list-inside list-disc text-sm">
                      {result.excluded.map((e, i) => (
                        <li key={i}>
                          {e.orgName} — {e.reason}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Confirmation dialog for replacing existing extraction */}
      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Remplacer l&apos;extraction existante ?</DialogTitle>
            <DialogDescription>
              Des snapshots existent déjà pour l&apos;année {year}. Voulez-vous les remplacer ?
              Cette action est irréversible.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmOpen(false)}>
              Annuler
            </Button>
            <Button
              variant="destructive"
              onClick={() => startTransition(() => doExtraction(true))}
              disabled={isPending}
            >
              {isPending && <Loader2 className="mr-2 size-4 animate-spin" />}
              Remplacer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
