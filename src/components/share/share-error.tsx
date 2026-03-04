import { LinkIcon, Clock } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export function ShareNotFound() {
  return (
    <Card>
      <CardContent className="flex flex-col items-center gap-4 py-12">
        <LinkIcon className="size-12 text-muted-foreground" />
        <div className="text-center">
          <p className="text-lg font-medium">Lien introuvable</p>
          <p className="text-sm text-muted-foreground">
            Ce lien de partage n&apos;existe pas ou les données associées ont été supprimées.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

export function ShareExpired() {
  return (
    <Card>
      <CardContent className="flex flex-col items-center gap-4 py-12">
        <Clock className="size-12 text-muted-foreground" />
        <div className="text-center">
          <p className="text-lg font-medium">Lien expiré</p>
          <p className="text-sm text-muted-foreground">
            Ce lien de partage a expiré. Veuillez demander un nouveau lien à l&apos;auteur du
            partage.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
