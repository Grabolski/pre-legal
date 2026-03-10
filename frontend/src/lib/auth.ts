import { API_BASE } from "./api";

const TOKEN_KEY = "prelegal_token";

export interface TokenResponse {
  access_token: string;
  token_type: string;
}

async function authPost(
  path: string,
  body: object,
  fallbackError: string
): Promise<TokenResponse> {
  const res = await fetch(`${API_BASE}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error((err as { detail?: string }).detail ?? fallbackError);
  }
  return res.json();
}

export const signup = (email: string, password: string) =>
  authPost("/auth/signup", { email, password }, "Signup failed");

export const signin = (email: string, password: string) =>
  authPost("/auth/signin", { email, password }, "Invalid credentials");

export function storeToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
}

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function clearToken(): void {
  localStorage.removeItem(TOKEN_KEY);
}

export function isAuthenticated(): boolean {
  return getToken() !== null;
}
