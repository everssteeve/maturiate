"use client";

import { Download } from "lucide-react";

import { Button } from "@/components/ui/button";

export function PrintButton() {
  return (
    <Button variant="outline" onClick={() => window.print()}>
      <Download className="mr-2 size-4" />
      Télécharger PDF
    </Button>
  );
}
