"use client";

import { useActionState } from "react";

import { updateProfile } from "@/lib/actions/users";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export function ProfileForm({
  user,
}: {
  user: { name: string; email: string; image: string | null };
}) {
  const [state, formAction, pending] = useActionState(updateProfile, null);

  const fieldErrors = state && "error" in state ? state.error : null;
  const success = state && "success" in state ? state.success : false;

  return (
    <Card className="max-w-lg">
      <CardHeader>
        <CardTitle>Mon profil</CardTitle>
        <CardDescription>Gérez vos informations personnelles.</CardDescription>
      </CardHeader>
      <CardContent>
        <form action={formAction} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nom</Label>
            <Input id="name" name="name" defaultValue={user.name} required />
            {fieldErrors?.name && (
              <p className="text-sm text-destructive">{fieldErrors.name[0]}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" value={user.email} disabled className="bg-muted" />
            <p className="text-xs text-muted-foreground">
              L&apos;adresse email ne peut pas être modifiée.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="image">Avatar (URL)</Label>
            <Input
              id="image"
              name="image"
              type="url"
              placeholder="https://exemple.com/avatar.jpg"
              defaultValue={user.image ?? ""}
            />
            {fieldErrors?.image && (
              <p className="text-sm text-destructive">{fieldErrors.image[0]}</p>
            )}
          </div>

          <div className="flex items-center gap-3">
            <Button type="submit" disabled={pending}>
              {pending ? "Enregistrement..." : "Enregistrer"}
            </Button>
            {success && (
              <p className="text-sm text-green-600">Profil mis à jour avec succès.</p>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
