import { Template, TemplateIndexEntry } from "@/types/template";

export const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

export async function fetchTemplates(): Promise<TemplateIndexEntry[]> {
  const res = await fetch(`${API_BASE}/templates/`);
  if (!res.ok) throw new Error("Failed to fetch templates");
  return res.json();
}

export async function fetchTemplate(id: string): Promise<Template> {
  const res = await fetch(`${API_BASE}/templates/${id}`);
  if (!res.ok) throw new Error(`Template '${id}' not found`);
  return res.json();
}
