"use client";

import { useEffect, useState, useTransition } from "react";
import { useParams, useRouter } from "next/navigation";
import { Building2, ChevronDown, Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface OrgItem {
  id: string;
  name: string;
  logo: string | null;
}

interface OrgSwitcherProps {
  organizations: OrgItem[];
  currentOrgId: string;
}

export function OrgSwitcher({ organizations, currentOrgId }: OrgSwitcherProps) {
  const router = useRouter();
  const currentOrg = organizations.find((o) => o.id === currentOrgId);

  if (organizations.length <= 1 && currentOrg) {
    return (
      <span className="text-sm font-medium text-muted-foreground">{currentOrg.name}</span>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="flex items-center gap-1.5">
          <div className="flex size-5 items-center justify-center rounded bg-primary/10 text-xs font-bold text-primary">
            {currentOrg?.logo ? (
              <img
                src={currentOrg.logo}
                alt={currentOrg.name}
                className="size-5 rounded object-cover"
              />
            ) : (
              currentOrg?.name.charAt(0).toUpperCase()
            )}
          </div>
          <span className="hidden max-w-[120px] truncate text-sm sm:inline-block">
            {currentOrg?.name}
          </span>
          <ChevronDown className="size-3.5" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-56">
        {organizations.map((org) => (
          <DropdownMenuItem
            key={org.id}
            onClick={() => router.push(`/orgs/${org.id}`)}
            className={org.id === currentOrgId ? "bg-accent" : ""}
          >
            <div className="flex size-6 shrink-0 items-center justify-center rounded bg-primary/10 text-xs font-bold text-primary">
              {org.logo ? (
                <img
                  src={org.logo}
                  alt={org.name}
                  className="size-6 rounded object-cover"
                />
              ) : (
                org.name.charAt(0).toUpperCase()
              )}
            </div>
            <span className="truncate">{org.name}</span>
          </DropdownMenuItem>
        ))}
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => router.push("/orgs")}>
          <Building2 className="size-4" />
          Toutes les organisations
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => router.push("/orgs/new")}>
          <Plus className="size-4" />
          Créer une organisation
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
