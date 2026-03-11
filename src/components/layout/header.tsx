"use client";

import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { LogOut, User, Briefcase, LayoutDashboard, Building2 } from "lucide-react";

import { useSession } from "@/lib/auth/client";
import { signOutAction } from "@/lib/actions/auth";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { OrgSwitcher } from "@/components/org-switcher";

function UserAvatar({ name, image }: { name: string; image?: string | null }) {
  if (image) {
    return (
      <Image
        src={image}
        alt={name}
        width={32}
        height={32}
        className="size-8 rounded-full object-cover"
      />
    );
  }

  const initials = name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="flex size-8 items-center justify-center rounded-full bg-primary text-xs font-medium text-primary-foreground">
      {initials}
    </div>
  );
}

interface HeaderProps {
  organizations?: { id: string; name: string; logo: string | null }[];
  isConsultant?: boolean;
  user?: { name: string; email: string; image?: string | null } | null;
}

export function Header({ organizations, isConsultant, user: userProp }: HeaderProps) {
  const params = useParams();
  const { data: session } = useSession();

  const user = userProp ?? session?.user;
  const orgId = params?.orgId as string | undefined;

  return (
    <header className="border-b bg-background">
      <div className="flex h-14 items-center justify-between px-4 sm:px-6">
        <div className="flex items-center gap-3">
          <Link href="/orgs" className="text-lg font-bold tracking-tight">
            maturIAté
          </Link>

          {orgId && organizations && organizations.length > 0 && (
            <>
              <span className="text-muted-foreground">/</span>
              <OrgSwitcher organizations={organizations} currentOrgId={orgId} />
            </>
          )}

          {isConsultant && (
            <Link
              href="/consultant"
              className="ml-2 flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
            >
              <Briefcase className="size-4" />
              <span className="hidden sm:inline">Vue consultant</span>
            </Link>
          )}
        </div>

        {user && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex items-center gap-2 px-2">
                <UserAvatar name={user.name} image={user.image} />
                <span className="hidden text-sm font-medium sm:inline-block">
                  {user.name}
                </span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem asChild>
                <Link href="/">
                  <LayoutDashboard className="mr-2 size-4" />
                  Tableau de bord
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/orgs">
                  <Building2 className="mr-2 size-4" />
                  Mes organisations
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/profile">
                  <User className="mr-2 size-4" />
                  Mon profil
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <form action={signOutAction}>
                <DropdownMenuItem asChild>
                  <button type="submit" className="w-full">
                    <LogOut className="mr-2 size-4" />
                    Se déconnecter
                  </button>
                </DropdownMenuItem>
              </form>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    </header>
  );
}
