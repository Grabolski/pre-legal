"use client";

import { Variable } from "@/types/template";
import { generatePdf } from "@/lib/generatePdf";

interface Props {
  templateId: string;
  /** Raw form values used to check completion status */
  formValues: Record<string, string>;
  /** Display-formatted values (e.g. dates as "1 March 2026") used for PDF generation */
  displayValues: Record<string, string>;
  rawContent: string;
  variables: Variable[];
}

export default function DownloadButton({ templateId, formValues, displayValues, rawContent, variables }: Props) {
  const allFilled = variables
    .filter((v) => v.required)
    .every((v) => (formValues[v.key] ?? "").trim() !== "");

  return (
    <div className="flex flex-col items-center gap-2">
      <button
        onClick={() => generatePdf(templateId, displayValues, rawContent)}
        disabled={!allFilled}
        className="flex items-center gap-2 rounded-md bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-gray-300 disabled:text-gray-500"
      >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
          <path d="M10.75 2.75a.75.75 0 0 0-1.5 0v8.614L6.295 8.235a.75.75 0 1 0-1.09 1.03l4.25 4.5a.75.75 0 0 0 1.09 0l4.25-4.5a.75.75 0 0 0-1.09-1.03l-2.955 3.129V2.75Z" />
          <path d="M3.5 12.75a.75.75 0 0 0-1.5 0v2.5A2.75 2.75 0 0 0 4.75 18h10.5A2.75 2.75 0 0 0 18 15.25v-2.5a.75.75 0 0 0-1.5 0v2.5c0 .69-.56 1.25-1.25 1.25H4.75c-.69 0-1.25-.56-1.25-1.25v-2.5Z" />
        </svg>
        Download PDF
      </button>
      {!allFilled && (
        <p className="text-xs text-gray-500">Fill in all required fields to download</p>
      )}
    </div>
  );
}
