import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { auth } from "@/lib/auth";
import { LoginForm } from "@/components/auth/login-form";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ callbackUrl?: string }>;
}) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (session) redirect("/orgs");

  const { callbackUrl } = await searchParams;

  const hasGoogle = !!process.env.GOOGLE_CLIENT_ID;
  const hasMicrosoft = !!process.env.MICROSOFT_CLIENT_ID;

  return (
    <LoginForm
      callbackUrl={callbackUrl ?? "/orgs"}
      hasGoogle={hasGoogle}
      hasMicrosoft={hasMicrosoft}
    />
  );
}
