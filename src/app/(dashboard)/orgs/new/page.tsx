"use client";

import { useActionState } from "react";
import { Building2 } from "lucide-react";

import { createOrganization } from "@/lib/actions/organizations";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function NewOrgPage() {
  const [state, action, pending] = useActionState(createOrganization, null);

  return (
    <div className="mx-auto max-w-lg">
      <div className="mb-6 flex items-center gap-3">
        <Building2 className="size-6" />
        <h1 className="text-2xl font-bold">Créer une organisation</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Informations de l&apos;organisation</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={action} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nom de l&apos;organisation *</Label>
              <Input
                id="name"
                name="name"
                placeholder="Mon organisation"
                required
                maxLength={100}
              />
              {state?.error?.name && (
                <p className="text-sm text-destructive">{state.error.name[0]}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="sector">Secteur d&apos;activité</Label>
              <Select name="sector">
                <SelectTrigger id="sector">
                  <SelectValue placeholder="Sélectionner un secteur" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="esn">ESN</SelectItem>
                  <SelectItem value="editor">Éditeur</SelectItem>
                  <SelectItem value="dsi">DSI</SelectItem>
                  <SelectItem value="startup">Startup</SelectItem>
                  <SelectItem value="other">Autre</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="size">Taille de l&apos;organisation</Label>
              <Select name="size">
                <SelectTrigger id="size">
                  <SelectValue placeholder="Sélectionner une taille" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1-10">1-10 personnes</SelectItem>
                  <SelectItem value="11-50">11-50 personnes</SelectItem>
                  <SelectItem value="51-200">51-200 personnes</SelectItem>
                  <SelectItem value="201-1000">201-1000 personnes</SelectItem>
                  <SelectItem value="1000+">1000+ personnes</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button type="submit" className="w-full" disabled={pending}>
              {pending ? "Création en cours..." : "Créer l'organisation"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
