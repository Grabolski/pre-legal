"use client";

import { useRouter } from "next/navigation";
import AuthForm from "@/components/ui/AuthForm";
import { signin, storeToken } from "@/lib/auth";

export default function SigninPage() {
  const router = useRouter();

  async function handleSubmit(email: string, password: string) {
    const { access_token } = await signin(email, password);
    storeToken(access_token);
    router.push("/");
  }

  return (
    <AuthForm
      subtitle="Sign in to your account"
      submitLabel="Sign in"
      loadingLabel="Signing in…"
      onSubmit={handleSubmit}
      footerText="No account yet?"
      footerLinkLabel="Sign up"
      footerLinkHref="/signup"
    />
  );
}
