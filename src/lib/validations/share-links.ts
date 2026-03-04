import { z } from "zod";

export const shareLinkTypeEnum = z.enum(["team", "campaign", "org"]);

export const CreateShareLinkSchema = z.object({
  orgId: z.string().uuid(),
  type: shareLinkTypeEnum,
  targetId: z.string().uuid(),
  expiresAt: z.coerce.date().optional(),
});

export const DeleteShareLinkSchema = z.object({
  orgId: z.string().uuid(),
  linkId: z.string().uuid(),
});
