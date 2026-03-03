import { requireRole } from "@/lib/permissions";
import { CampaignForm } from "@/components/campaigns/campaign-form";

export default async function NewCampaignPage({
  params,
}: {
  params: Promise<{ orgId: string }>;
}) {
  const { orgId } = await params;
  await requireRole(orgId, "admin");

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">Nouvelle campagne</h1>
      <CampaignForm orgId={orgId} />
    </div>
  );
}
