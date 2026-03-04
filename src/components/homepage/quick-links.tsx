import Link from "next/link";
import { LayoutDashboard, Users, BarChart3, Briefcase } from "lucide-react";

import { Button } from "@/components/ui/button";

interface QuickLinksProps {
  orgId: string;
  role: string;
}

export function QuickLinks({ orgId, role }: QuickLinksProps) {
  const links = getLinksForRole(orgId, role);

  if (links.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2 border-t pt-4">
      {links.map((link) => (
        <Button key={link.href} variant="outline" size="sm" asChild>
          <Link href={link.href}>
            <link.icon className="mr-1.5 size-3.5" />
            {link.label}
          </Link>
        </Button>
      ))}
    </div>
  );
}

function getLinksForRole(
  orgId: string,
  role: string,
): { href: string; label: string; icon: typeof LayoutDashboard }[] {
  switch (role) {
    case "admin":
      return [
        {
          href: `/orgs/${orgId}`,
          label: "Dashboard",
          icon: LayoutDashboard,
        },
        {
          href: `/orgs/${orgId}/campaigns`,
          label: "Campagnes",
          icon: BarChart3,
        },
        { href: `/orgs/${orgId}/teams`, label: "Équipes", icon: Users },
      ];
    case "manager":
      return [
        {
          href: `/orgs/${orgId}`,
          label: "Dashboard",
          icon: LayoutDashboard,
        },
      ];
    case "consultant":
      return [
        {
          href: "/consultant",
          label: "Vue consultant",
          icon: Briefcase,
        },
      ];
    default:
      return [
        {
          href: `/orgs/${orgId}`,
          label: "Dashboard",
          icon: LayoutDashboard,
        },
      ];
  }
}
