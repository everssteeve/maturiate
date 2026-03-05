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
        const from = process.env.EMAIL_FROM || "maturIAté <onboarding@resend.dev>";
        console.log("[Magic Link] Envoi vers:", email, "from:", from, "RESEND_API_KEY set:", !!process.env.RESEND_API_KEY);
        try {
          const { data, error } = await getResend().emails.send({
            from,
            to: email,
            subject: "Votre lien de connexion — maturIAté",
            react: MagicLinkEmail({ url }),
          });
          if (error) {
            console.error("[Magic Link] Resend error:", JSON.stringify(error));
            throw new Error(`Resend error: ${error.message}`);
          }
          console.log("[Magic Link] Email envoyé:", JSON.stringify(data));
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
