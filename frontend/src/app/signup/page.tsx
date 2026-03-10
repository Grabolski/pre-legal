"use client";

import { useRouter } from "next/navigation";
import AuthForm from "@/components/ui/AuthForm";
import { signup, storeToken } from "@/lib/auth";

export default function SignupPage() {
  const router = useRouter();

  async function handleSubmit(email: string, password: string) {
    const { access_token } = await signup(email, password);
    storeToken(access_token);
    router.push("/");
  }

  return (
    <AuthForm
      subtitle="Create your account"
      submitLabel="Create account"
      loadingLabel="Creating account…"
      showPasswordHint
      onSubmit={handleSubmit}
      footerText="Already have an account?"
      footerLinkLabel="Sign in"
      footerLinkHref="/signin"
    />
  );
}
