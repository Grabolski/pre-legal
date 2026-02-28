import { Variable } from "@/types/template";

export function replaceVariables(
  content: string,
  values: Record<string, string>
): string {
  return content.replace(/\{\{(\w+)\}\}/g, (_, key) => values[key] ?? `[${key}]`);
}

function formatDate(iso: string): string {
  if (!iso) return "";
  const [year, month, day] = iso.split("-").map(Number);
  const date = new Date(year, month - 1, day);
  return date.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
}

/** Returns a copy of formValues with date fields formatted for human-readable display. */
export function formatDisplayValues(
  variables: Variable[],
  formValues: Record<string, string>
): Record<string, string> {
  const result = { ...formValues };
  for (const v of variables) {
    if (v.type === "date" && result[v.key]) {
      result[v.key] = formatDate(result[v.key]);
    }
  }
  return result;
}
