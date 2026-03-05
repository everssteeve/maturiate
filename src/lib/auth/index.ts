import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { magicLink } from "better-auth/plugins";

import { db } from "@/lib/db";
import * as schema from "@/lib/db/schema";
import { getResend } from "@/lib/email";
import { MagicLinkEmail } from "@/lib/email/templates/magic-link";

const socialProviders: Record<string, { clientId: string; clientSecret: string }> = {};

if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  socialProviders.google = {
    clientId: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  };
}

if (process.env.MICROSOFT_CLIENT_ID && process.env.MICROSOFT_CLIENT_SECRET) {
  socialProviders.microsoft = {
    clientId: process.env.MICROSOFT_CLIENT_ID,
    clientSecret: process.env.MICROSOFT_CLIENT_SECRET,
  };
}

export const auth = betterAuth({
  trustedOrigins: process.env.NODE_ENV === "development"
    ? ["http://localhost:3000", "http://localhost:3001"]
    : process.env.BETTER_AUTH_URL
      ? [process.env.BETTER_AUTH_URL]
      : [],
  database: drizzleAdapter(db, {
    provider: "pg",
    schema,
    usePlural: true,
  }),
  emailAndPassword: {
    enabled: false,
  },
  plugins: [
    magicLink({
      sendMagicLink: async ({ email, url }) => {
        try {
          const result = await getResend().emails.send({
            from: process.env.EMAIL_FROM || "maturIAté <onboarding@resend.dev>",
            to: email,
            subject: "Votre lien de connexion — maturIAté",
            react: MagicLinkEmail({ url }),
          });
          console.log("[Magic Link] Email envoyé:", JSON.stringify(result));
        } catch (error) {
          console.error("[Magic Link] Erreur envoi email:", error);
          throw error;
        }
      },
      expiresIn: 600,
    }),
  ],
  socialProviders,
});
