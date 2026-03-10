"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { fetchTemplates } from "@/lib/api";
import { TemplateIndexEntry } from "@/types/template";

const CATEGORY_LABELS: Record<string, string> = {
  confidentiality: "Confidentiality",
  employment: "Employment",
  services: "Services",
  property: "Property",
  consumer: "Consumer",
};

function DocumentIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
      className="w-5 h-5 text-[#209dd7]"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z"
      />
    </svg>
  );
}

export default function Home() {
  const [templates, setTemplates] = useState<TemplateIndexEntry[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchTemplates()
      .then(setTemplates)
      .catch((err) => setError(err.message));
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4 py-12">
      <div className="max-w-2xl w-full">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-[#032147]">Pre-Legal</h1>
          <p className="mt-2 text-gray-500">Draft common legal agreements in minutes</p>
        </div>

        {error && (
          <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-center text-sm text-red-700">
            Failed to load templates: {error}
          </div>
        )}

        {!error && templates.length === 0 && (
          <p className="text-center text-sm text-gray-400 animate-pulse">Loading templates…</p>
        )}

        <div className="space-y-3">
          {templates.map((t) => (
            <div
              key={t.id}
              className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex items-start gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-50">
                  <DocumentIcon />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h2 className="font-semibold text-gray-900">{t.name}</h2>
                    {t.category && (
                      <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-500">
                        {CATEGORY_LABELS[t.category] ?? t.category}
                      </span>
                    )}
                  </div>
                  <p className="mt-1 text-sm text-gray-500">{t.description}</p>
                  <Link
                    href={`/create/${t.id}`}
                    className="mt-3 inline-flex items-center gap-1 rounded-md bg-[#209dd7] px-4 py-2 text-sm font-medium text-white hover:bg-[#1a7fb0] transition-colors"
                  >
                    Create document
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                      className="w-4 h-4"
                    >
                      <path
                        fillRule="evenodd"
                        d="M3 10a.75.75 0 0 1 .75-.75h10.638L10.23 5.29a.75.75 0 1 1 1.04-1.08l5.5 5.25a.75.75 0 0 1 0 1.08l-5.5 5.25a.75.75 0 1 1-1.04-1.08l4.158-3.96H3.75A.75.75 0 0 1 3 10Z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
