"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { Template } from "@/types/template";
import { fetchTemplate, API_BASE } from "@/lib/api";
import { formatDisplayValues } from "@/lib/interpolate";
import TemplateForm from "@/components/form/TemplateForm";
import MutualNdaPreview from "@/components/preview/MutualNdaPreview";
import DownloadButton from "@/components/ui/DownloadButton";

const TEMPLATE_ID = "mutual-non-disclosure-agreement";

export default function MutualNdaPage() {
  const [template, setTemplate] = useState<Template | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [formValues, setFormValues] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  useEffect(() => {
    fetchTemplate(TEMPLATE_ID)
      .then((t) => {
        setTemplate(t);
        const initial: Record<string, string> = {};
        t.variables.forEach((v) => (initial[v.key] = ""));
        setFormValues(initial);
      })
      .catch((err) => setError(err.message));
  }, []);

  const handleChange = useCallback((key: string, value: string) => {
    setFormValues((prev) => ({ ...prev, [key]: value }));
  }, []);

  const handleBlur = useCallback((key: string) => {
    setTouched((prev) => ({ ...prev, [key]: true }));
  }, []);

  const displayValues = useMemo(
    () => (template ? formatDisplayValues(template.variables, formValues) : formValues),
    [template, formValues]
  );

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-center">
          <p className="text-sm font-semibold text-red-700">Failed to load template</p>
          <p className="mt-1 text-xs text-red-500">{error}</p>
          <p className="mt-2 text-xs text-gray-500">
            Make sure the backend is running at{" "}
            <code className="rounded bg-gray-100 px-1">{API_BASE}</code>
          </p>
        </div>
      </div>
    );
  }

  if (!template) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-sm text-gray-500 animate-pulse">Loading template…</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="border-b border-gray-200 bg-white px-6 py-4">
        <div className="mx-auto max-w-7xl flex items-center justify-between">
          <div>
            <a href="/" className="text-xs text-blue-600 hover:underline">← Back</a>
            <h1 className="mt-1 text-lg font-semibold text-gray-900">{template.name}</h1>
            <p className="text-xs text-gray-500">{template.description}</p>
          </div>
          <DownloadButton
            templateId={TEMPLATE_ID}
            displayValues={displayValues}
            rawContent={template.content}
            formValues={formValues}
            variables={template.variables}
          />
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-8">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          {/* Form panel */}
          <div className="lg:sticky lg:top-8 lg:self-start">
            <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
              <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-gray-500">
                Fill in Details
              </h2>
              <TemplateForm
                variables={template.variables}
                values={formValues}
                touched={touched}
                onChange={handleChange}
                onBlur={handleBlur}
              />
            </div>
          </div>

          {/* Preview panel */}
          <div>
            <div className="rounded-xl border border-gray-200 bg-white p-8 shadow-sm">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-500">
                  Document Preview
                </h2>
                <span className="rounded-full bg-yellow-50 px-2 py-0.5 text-xs text-yellow-700">
                  Live preview
                </span>
              </div>
              <div className="border-t border-gray-100 pt-6">
                <MutualNdaPreview formValues={displayValues} />
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 flex justify-center">
          <DownloadButton
            templateId={TEMPLATE_ID}
            displayValues={displayValues}
            rawContent={template.content}
            formValues={formValues}
            variables={template.variables}
          />
        </div>
      </main>
    </div>
  );
}
