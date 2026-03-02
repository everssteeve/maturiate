"use client";

import Image from "next/image";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { LogOut, User } from "lucide-react";

import { signOut, useSession } from "@/lib/auth/client";
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
}

export function Header({ organizations }: HeaderProps) {
  const router = useRouter();
  const params = useParams();
  const { data: session } = useSession();

  const user = session?.user;
  const orgId = params?.orgId as string | undefined;

  async function handleSignOut() {
    await signOut({
      fetchOptions: {
        onSuccess: () => {
          router.push("/login");
        },
      },
    });
  }

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
              <DropdownMenuItem onClick={() => router.push("/profile")}>
                <User className="mr-2 size-4" />
                Mon profil
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleSignOut}>
                <LogOut className="mr-2 size-4" />
                Se déconnecter
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    </header>
  );
}
