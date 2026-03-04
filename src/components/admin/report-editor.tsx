"use client";

import { useState, useCallback, useEffect, useRef, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  Loader2,
  Plus,
  Trash2,
  GripVertical,
  ArrowUp,
  ArrowDown,
  Eye,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  updateReport,
  publishReport,
  unpublishReport,
} from "@/lib/actions/state-of-ia";
import type { ReportContent, ReportSection } from "@/lib/validations/state-of-ia";

const CHART_TYPE_LABELS: Record<string, string> = {
  distribution: "Distribution des niveaux",
  dimensions: "Scores par dimension",
  trends: "Tendances annuelles",
  segments: "Segmentation",
};

export function ReportEditor({
  reportId,
  year,
  initialContent,
  isPublished: initialIsPublished,
  hasSnapshots,
}: {
  reportId: string;
  year: number;
  initialContent: ReportContent;
  isPublished: boolean;
  hasSnapshots: boolean;
}) {
  const [content, setContent] = useState<ReportContent>(initialContent);
  const [isPublished, setIsPublished] = useState(initialIsPublished);
  const [saveStatus, setSaveStatus] = useState<"saved" | "saving" | "idle">("idle");
  const [error, setError] = useState<string | null>(null);
  const [confirmPublish, setConfirmPublish] = useState(false);
  const [confirmUnpublish, setConfirmUnpublish] = useState(false);
  const [isPending, startTransition] = useTransition();
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const router = useRouter();

  // Auto-save with debounce
  const saveContent = useCallback(
    (newContent: ReportContent) => {
      if (debounceRef.current) clearTimeout(debounceRef.current);

      setSaveStatus("saving");
      debounceRef.current = setTimeout(async () => {
        const res = await updateReport({ reportId, content: newContent });
        if ("error" in res) {
          setError(res.error as string);
          setSaveStatus("idle");
        } else {
          setSaveStatus("saved");
          setTimeout(() => setSaveStatus("idle"), 2000);
        }
      }, 2000);
    },
    [reportId],
  );

  function updateContent(updates: Partial<ReportContent>) {
    const newContent = { ...content, ...updates };
    setContent(newContent);
    saveContent(newContent);
  }

  // Section management
  function addSection() {
    updateContent({
      sections: [...content.sections, { title: "", body: "", chartType: undefined }],
    });
  }

  function updateSection(index: number, updates: Partial<ReportSection>) {
    const newSections = [...content.sections];
    newSections[index] = { ...newSections[index], ...updates };
    updateContent({ sections: newSections });
  }

  function removeSection(index: number) {
    const newSections = content.sections.filter((_, i) => i !== index);
    updateContent({ sections: newSections });
  }

  function moveSection(index: number, direction: "up" | "down") {
    const newIndex = direction === "up" ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= content.sections.length) return;

    const newSections = [...content.sections];
    [newSections[index], newSections[newIndex]] = [newSections[newIndex], newSections[index]];
    updateContent({ sections: newSections });
  }

  // Key insights management
  function addInsight() {
    updateContent({ keyInsights: [...content.keyInsights, ""] });
  }

  function updateInsight(index: number, value: string) {
    const newInsights = [...content.keyInsights];
    newInsights[index] = value;
    updateContent({ keyInsights: newInsights });
  }

  function removeInsight(index: number) {
    const newInsights = content.keyInsights.filter((_, i) => i !== index);
    updateContent({ keyInsights: newInsights });
  }

  // Publish/Unpublish
  function handlePublish() {
    startTransition(async () => {
      setConfirmPublish(false);
      const res = await publishReport({ reportId });
      if ("error" in res) {
        setError(res.error as string);
      } else {
        setIsPublished(true);
        router.refresh();
      }
    });
  }

  function handleUnpublish() {
    startTransition(async () => {
      setConfirmUnpublish(false);
      const res = await unpublishReport({ reportId });
      if ("error" in res) {
        setError(res.error as string);
      } else {
        setIsPublished(false);
        router.refresh();
      }
    });
  }

  // Cleanup debounce on unmount
  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  return (
    <div className="space-y-6">
      {/* Toolbar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {saveStatus === "saving" && (
            <Badge variant="secondary" className="gap-1">
              <Loader2 className="size-3 animate-spin" />
              Sauvegarde en cours...
            </Badge>
          )}
          {saveStatus === "saved" && (
            <Badge variant="secondary" className="gap-1">
              <CheckCircle2 className="size-3" />
              Sauvegardé
            </Badge>
          )}
          {isPublished ? (
            <Badge variant="default">Publié</Badge>
          ) : (
            <Badge variant="secondary">Brouillon</Badge>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" asChild>
            <a href={`/state-of-ia/${year}`} target="_blank" rel="noreferrer">
              <Eye className="mr-2 size-4" />
              Prévisualiser
            </a>
          </Button>
          {isPublished ? (
            <Button variant="outline" onClick={() => setConfirmUnpublish(true)} disabled={isPending}>
              Dépublier
            </Button>
          ) : (
            <Button onClick={() => setConfirmPublish(true)} disabled={isPending}>
              Publier
            </Button>
          )}
        </div>
      </div>

      {!hasSnapshots && (
        <Alert>
          <AlertTriangle className="size-4" />
          <AlertDescription>
            Aucune donnée extraite pour {year}. Le rapport sera publié sans graphiques de données.
          </AlertDescription>
        </Alert>
      )}

      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="size-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Introduction */}
      <Card>
        <CardHeader>
          <CardTitle>Introduction</CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            value={content.introduction}
            onChange={(e) => updateContent({ introduction: e.target.value })}
            placeholder="Introduction du rapport (supporte le Markdown)..."
            className="min-h-32"
          />
        </CardContent>
      </Card>

      {/* Sections */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Sections</CardTitle>
          <Button variant="outline" size="sm" onClick={addSection}>
            <Plus className="mr-2 size-4" />
            Ajouter une section
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {content.sections.length === 0 && (
            <p className="text-sm text-muted-foreground">
              Aucune section. Ajoutez des sections pour structurer le rapport.
            </p>
          )}
          {content.sections.map((section, i) => (
            <div key={i} className="space-y-3 rounded-md border p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1">
                  <GripVertical className="size-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Section {i + 1}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => moveSection(i, "up")}
                    disabled={i === 0}
                    className="size-8"
                  >
                    <ArrowUp className="size-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => moveSection(i, "down")}
                    disabled={i === content.sections.length - 1}
                    className="size-8"
                  >
                    <ArrowDown className="size-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeSection(i)}
                    className="size-8 text-destructive"
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </div>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-1">
                  <Label>Titre</Label>
                  <Input
                    value={section.title}
                    onChange={(e) => updateSection(i, { title: e.target.value })}
                    placeholder="Titre de la section"
                  />
                </div>
                <div className="space-y-1">
                  <Label>Graphique associé</Label>
                  <Select
                    value={section.chartType ?? "none"}
                    onValueChange={(v) =>
                      updateSection(i, {
                        chartType:
                          v === "none"
                            ? undefined
                            : (v as "distribution" | "dimensions" | "trends" | "segments"),
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Aucun</SelectItem>
                      {Object.entries(CHART_TYPE_LABELS).map(([key, label]) => (
                        <SelectItem key={key} value={key}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-1">
                <Label>Contenu (Markdown)</Label>
                <Textarea
                  value={section.body}
                  onChange={(e) => updateSection(i, { body: e.target.value })}
                  placeholder="Contenu de la section..."
                  className="min-h-24"
                />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Key Insights */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Insights clés</CardTitle>
          <Button variant="outline" size="sm" onClick={addInsight}>
            <Plus className="mr-2 size-4" />
            Ajouter
          </Button>
        </CardHeader>
        <CardContent className="space-y-2">
          {content.keyInsights.length === 0 && (
            <p className="text-sm text-muted-foreground">Aucun insight.</p>
          )}
          {content.keyInsights.map((insight, i) => (
            <div key={i} className="flex items-center gap-2">
              <Input
                value={insight}
                onChange={(e) => updateInsight(i, e.target.value)}
                placeholder={`Insight ${i + 1}`}
              />
              <Button
                variant="ghost"
                size="icon"
                onClick={() => removeInsight(i)}
                className="shrink-0 text-destructive"
              >
                <Trash2 className="size-4" />
              </Button>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Methodology */}
      <Card>
        <CardHeader>
          <CardTitle>Méthodologie</CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            value={content.methodology}
            onChange={(e) => updateContent({ methodology: e.target.value })}
            placeholder="Méthodologie de collecte et d'anonymisation (Markdown)..."
            className="min-h-32"
          />
        </CardContent>
      </Card>

      {/* Publish Confirmation */}
      <Dialog open={confirmPublish} onOpenChange={setConfirmPublish}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Publier le rapport {year} ?</DialogTitle>
            <DialogDescription>
              Le rapport sera accessible publiquement sur /state-of-ia/{year}. Les benchmarks
              &quot;Mon positionnement&quot; seront mis à jour.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmPublish(false)}>
              Annuler
            </Button>
            <Button onClick={handlePublish} disabled={isPending}>
              {isPending && <Loader2 className="mr-2 size-4 animate-spin" />}
              Publier
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Unpublish Confirmation */}
      <Dialog open={confirmUnpublish} onOpenChange={setConfirmUnpublish}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Dépublier le rapport {year} ?</DialogTitle>
            <DialogDescription>
              Le rapport ne sera plus accessible publiquement. Les benchmarks ne seront plus
              disponibles pour cette année.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmUnpublish(false)}>
              Annuler
            </Button>
            <Button variant="destructive" onClick={handleUnpublish} disabled={isPending}>
              {isPending && <Loader2 className="mr-2 size-4 animate-spin" />}
              Dépublier
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
