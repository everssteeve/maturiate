import { createHash } from "crypto";

export function hashOrganization(orgId: string): string {
  const salt = process.env.STATE_OF_IA_HASH_SALT;
  if (!salt) {
    throw new Error("La variable STATE_OF_IA_HASH_SALT n'est pas configurée.");
  }

  return createHash("sha256")
    .update(orgId + salt)
    .digest("hex");
}
