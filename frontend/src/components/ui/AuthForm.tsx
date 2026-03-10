"use client";

import { useState } from "react";
import Link from "next/link";

interface AuthFormProps {
  subtitle: string;
  submitLabel: string;
  loadingLabel: string;
  showPasswordHint?: boolean;
  onSubmit: (email: string, password: string) => Promise<void>;
  footerText: string;
  footerLinkLabel: string;
  footerLinkHref: string;
}

export default function AuthForm({
  subtitle,
  submitLabel,
  loadingLabel,
  showPasswordHint,
  onSubmit,
  footerText,
  footerLinkLabel,
  footerLinkHref,
}: AuthFormProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await onSubmit(email, password);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold" style={{ color: "#032147" }}>
            Pre-Legal
          </h1>
          <p className="mt-2 text-sm" style={{ color: "#888888" }}>
            {subtitle}
          </p>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-8 shadow-sm">
          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <input
                type="password"
                required
                minLength={showPasswordHint ? 8 : undefined}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {showPasswordHint && (
                <p className="mt-1 text-xs" style={{ color: "#888888" }}>
                  Minimum 8 characters
                </p>
              )}
            </div>

            {error && (
              <p className="rounded-md bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-700">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-md py-2.5 text-sm font-semibold text-white transition disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
              style={{ backgroundColor: "#753991" }}
            >
              {loading ? loadingLabel : submitLabel}
            </button>
          </form>

          <p className="mt-6 text-center text-sm" style={{ color: "#888888" }}>
            {footerText}{" "}
            <Link
              href={footerLinkHref}
              className="font-medium"
              style={{ color: "#209dd7" }}
            >
              {footerLinkLabel}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
