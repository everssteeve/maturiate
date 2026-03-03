"use client";

import { useState, useTransition } from "react";
import { Plus, Pencil, ToggleLeft, ToggleRight } from "lucide-react";

import { DIMENSIONS } from "@/data/dimensions";
import {
  createBonusQuestion,
  updateBonusQuestion,
  toggleBonusQuestion,
} from "@/lib/actions/diagnostics";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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

interface BonusQuestion {
  id: string;
  orgId: string;
  dimensionId: string;
  text: string;
  options: string[];
  active: boolean;
  createdAt: Date;
}

interface BonusQuestionsManagerProps {
  orgId: string;
  questions: BonusQuestion[];
}

export function BonusQuestionsManager({ orgId, questions }: BonusQuestionsManagerProps) {
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Create/Edit dialog
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<BonusQuestion | null>(null);
  const [formText, setFormText] = useState("");
  const [formDimension, setFormDimension] = useState("tools");
  const [formOptions, setFormOptions] = useState(["", "", "", ""]);

  function openCreate() {
    setEditTarget(null);
    setFormText("");
    setFormDimension("tools");
    setFormOptions(["", "", "", ""]);
    setDialogOpen(true);
  }

  function openEdit(q: BonusQuestion) {
    setEditTarget(q);
    setFormText(q.text);
    setFormDimension(q.dimensionId);
    setFormOptions([...q.options]);
    setDialogOpen(true);
  }

  function handleSave() {
    if (!formText.trim() || formOptions.some((o) => !o.trim())) return;

    startTransition(async () => {
      if (editTarget) {
        const result = await updateBonusQuestion({
          orgId,
          questionId: editTarget.id,
          text: formText.trim(),
          dimensionId: formDimension,
          options: formOptions.map((o) => o.trim()),
        });
        if (result && "error" in result && result.error) {
          setMessage({ type: "error", text: result.error });
        } else {
          setMessage({ type: "success", text: "Question modifiée." });
        }
      } else {
        await createBonusQuestion({
          orgId,
          text: formText.trim(),
          dimensionId: formDimension,
          options: formOptions.map((o) => o.trim()),
        });
        setMessage({ type: "success", text: "Question créée." });
      }
      setDialogOpen(false);
    });
  }

  function handleToggle(q: BonusQuestion) {
    startTransition(async () => {
      const result = await toggleBonusQuestion({
        orgId,
        questionId: q.id,
        active: !q.active,
      });
      if (result?.error) {
        setMessage({ type: "error", text: result.error });
      } else {
        setMessage({
          type: "success",
          text: q.active ? "Question désactivée." : "Question activée.",
        });
      }
    });
  }

  function updateOption(index: number, value: string) {
    setFormOptions((prev) => {
      const next = [...prev];
      next[index] = value;
      return next;
    });
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Questions bonus ({questions.length})</CardTitle>
        <Button size="sm" onClick={openCreate}>
          <Plus className="mr-1 size-4" />
          Ajouter
        </Button>
      </CardHeader>
      <CardContent>
        {message && (
          <p
            className={`mb-3 text-sm ${message.type === "error" ? "text-destructive" : "text-green-600"}`}
          >
            {message.text}
          </p>
        )}

        {questions.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Aucune question bonus. Les questions bonus sont optionnelles et spécifiques à votre
            organisation.
          </p>
        ) : (
          <div className="space-y-3">
            {questions.map((q) => {
              const dim = DIMENSIONS.find((d) => d.id === q.dimensionId);
              return (
                <div
                  key={q.id}
                  className="flex items-start justify-between gap-3 rounded-lg border p-3"
                >
                  <div className="flex-1">
                    <p className="text-sm font-medium">{q.text}</p>
                    <div className="mt-1 flex gap-2">
                      <Badge variant="outline" className="text-xs">
                        {dim?.short ?? q.dimensionId}
                      </Badge>
                      {q.active ? (
                        <Badge className="bg-green-100 text-green-800 text-xs">Active</Badge>
                      ) : (
                        <Badge variant="secondary" className="text-xs">
                          Inactive
                        </Badge>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="sm" className="size-8 p-0" onClick={() => openEdit(q)}>
                      <Pencil className="size-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="size-8 p-0"
                      onClick={() => handleToggle(q)}
                      disabled={pending}
                    >
                      {q.active ? (
                        <ToggleRight className="size-4 text-green-600" />
                      ) : (
                        <ToggleLeft className="size-4 text-muted-foreground" />
                      )}
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Create/Edit dialog */}
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>{editTarget ? "Modifier la question" : "Nouvelle question bonus"}</DialogTitle>
              <DialogDescription>
                Les questions bonus sont optionnelles et ne comptent pas dans le score comparatif.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Dimension</Label>
                <Select value={formDimension} onValueChange={setFormDimension}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {DIMENSIONS.map((d) => (
                      <SelectItem key={d.id} value={d.id}>
                        {d.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Question</Label>
                <Input
                  placeholder="Texte de la question"
                  value={formText}
                  onChange={(e) => setFormText(e.target.value)}
                  maxLength={500}
                />
              </div>
              {formOptions.map((opt, i) => (
                <div key={i}>
                  <Label>Option {i + 1} (niveau {i + 1})</Label>
                  <Input
                    placeholder={`Réponse de niveau ${i + 1}`}
                    value={opt}
                    onChange={(e) => updateOption(i, e.target.value)}
                  />
                </div>
              ))}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDialogOpen(false)}>
                Annuler
              </Button>
              <Button
                onClick={handleSave}
                disabled={pending || !formText.trim() || formOptions.some((o) => !o.trim())}
              >
                {editTarget ? "Modifier" : "Créer"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}
