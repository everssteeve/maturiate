"use client";

import { useState } from "react";
import { Share2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { ShareDialog, type ShareLinkItem } from "@/components/share/share-dialog";

interface ShareButtonProps {
  orgId: string;
  type: "team" | "campaign" | "org";
  targetId: string;
  existingLinks: ShareLinkItem[];
}

export function ShareButton({ orgId, type, targetId, existingLinks }: ShareButtonProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button variant="outline" onClick={() => setOpen(true)}>
        <Share2 className="mr-2 size-4" />
        Partager
      </Button>
      <ShareDialog
        open={open}
        onOpenChange={setOpen}
        orgId={orgId}
        type={type}
        targetId={targetId}
        existingLinks={existingLinks}
      />
    </>
  );
}
