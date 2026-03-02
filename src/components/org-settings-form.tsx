"use client";

import { useActionState } from "react";
import Image from "next/image";
import { useState } from "react";

import { updateOrganization } from "@/lib/actions/organizations";
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

interface OrgSettingsFormProps {
  org: {
    id: string;
    name: string;
    logo: string | null;
    sector: string | null;
    size: string | null;
  };
  readOnly?: boolean;
}

export function OrgSettingsForm({ org, readOnly }: OrgSettingsFormProps) {
  const [state, action, pending] = useActionState(updateOrganization, null);
  const [logoUrl, setLogoUrl] = useState(org.logo ?? "");

  if (readOnly) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Informations de l&apos;organisation</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <span className="text-sm font-medium text-muted-foreground">Nom</span>
            <p>{org.name}</p>
          </div>
          {org.logo && (
            <div>
              <span className="text-sm font-medium text-muted-foreground">Logo</span>
              <Image
                src={org.logo}
                alt={org.name}
                width={48}
                height={48}
                className="mt-1 size-12 rounded-lg object-cover"
              />
            </div>
          )}
          {org.sector && (
            <div>
              <span className="text-sm font-medium text-muted-foreground">Secteur</span>
              <p>{org.sector}</p>
            </div>
          )}
          {org.size && (
            <div>
              <span className="text-sm font-medium text-muted-foreground">Taille</span>
              <p>{org.size}</p>
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Informations de l&apos;organisation</CardTitle>
      </CardHeader>
      <CardContent>
        <form action={action} className="space-y-4">
          <input type="hidden" name="orgId" value={org.id} />

          <div className="space-y-2">
            <Label htmlFor="name">Nom *</Label>
            <Input id="name" name="name" defaultValue={org.name} required maxLength={100} />
            {state?.error?.name && (
              <p className="text-sm text-destructive">{state.error.name[0]}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="logo">Logo (URL)</Label>
            <Input
              id="logo"
              name="logo"
              defaultValue={org.logo ?? ""}
              placeholder="https://example.com/logo.png"
              onChange={(e) => setLogoUrl(e.target.value)}
            />
            {logoUrl && (
              <div className="mt-2">
                <img
                  src={logoUrl}
                  alt="Aperçu du logo"
                  className="size-12 rounded-lg object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = "none";
                  }}
                />
              </div>
            )}
            {state?.error?.logo && (
              <p className="text-sm text-destructive">{state.error.logo[0]}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="sector">Secteur d&apos;activité</Label>
            <Select name="sector" defaultValue={org.sector ?? ""}>
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
            <Label htmlFor="size">Taille</Label>
            <Select name="size" defaultValue={org.size ?? ""}>
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

          {state?.success && (
            <p className="text-sm text-green-600">Organisation mise à jour.</p>
          )}

          <Button type="submit" disabled={pending}>
            {pending ? "Enregistrement..." : "Enregistrer"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
