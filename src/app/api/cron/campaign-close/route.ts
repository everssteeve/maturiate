import { NextResponse } from "next/server";
import { and, eq, lt, isNotNull } from "drizzle-orm";

import { db } from "@/lib/db";
import { campaigns } from "@/lib/db/schema";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const now = new Date();

  const expiredCampaigns = await db
    .update(campaigns)
    .set({ status: "closed", updatedAt: now })
    .where(
      and(
        eq(campaigns.status, "active"),
        isNotNull(campaigns.endDate),
        lt(campaigns.endDate, now),
      ),
    )
    .returning({ id: campaigns.id, name: campaigns.name });

  return NextResponse.json({
    closed: expiredCampaigns.length,
    campaigns: expiredCampaigns.map((c) => c.name),
  });
}
