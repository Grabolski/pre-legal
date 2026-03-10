"use client";

import { useEffect, useRef, useState, useCallback, useMemo } from "react";
import { Template } from "@/types/template";
import { fetchTemplate, API_BASE } from "@/lib/api";
import { formatDisplayValues } from "@/lib/interpolate";
import { sendChatMessage, ChatMessage } from "@/lib/chat";
import TemplateForm from "@/components/form/TemplateForm";
import MutualNdaPreview from "@/components/preview/MutualNdaPreview";
import DownloadButton from "@/components/ui/DownloadButton";
import ChatPanel from "@/components/chat/ChatPanel";

const TEMPLATE_ID = "mutual-non-disclosure-agreement";

// Shown to the user on load; filtered out before sending to the API
// so the LLM only sees messages it actually generated.
const INITIAL_MESSAGE: ChatMessage = {
  role: "assistant",
  content:
    "Hi! I'm here to help you draft a Mutual Non-Disclosure Agreement. Let's start with the parties involved — what are the full legal names of the two parties entering this agreement?",
};

export default function MutualNdaPage() {
  const [template, setTemplate] = useState<Template | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [formValues, setFormValues] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [messages, setMessages] = useState<ChatMessage[]>([INITIAL_MESSAGE]);
  const [isChatLoading, setIsChatLoading] = useState(false);
  const [chatError, setChatError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);

  // Ref keeps current messages available inside async callbacks without
  // adding messages to the useCallback dependency array.
  const messagesRef = useRef(messages);
  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);

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

  const handleSend = useCallback(
    async (content: string) => {
      if (!template) return;

      const userMessage: ChatMessage = { role: "user", content };
      // Skip the synthetic INITIAL_MESSAGE when sending history to the API:
      // the LLM should only see messages it actually generated.
      const apiMessages = messagesRef.current
        .filter((m) => m !== INITIAL_MESSAGE)
        .concat(userMessage);

      setMessages((prev) => [...prev, userMessage]);
      setIsChatLoading(true);
      setChatError(null);

      try {
        const response = await sendChatMessage(TEMPLATE_ID, apiMessages);
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: response.reply },
        ]);
        if (Object.keys(response.extracted_fields).length > 0) {
          setFormValues((prev) => ({ ...prev, ...response.extracted_fields }));
        }
      } catch (err) {
        setChatError(err instanceof Error ? err.message : "Something went wrong");
      } finally {
        setIsChatLoading(false);
      }
    },
    [template]
  );

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

  const downloadProps = {
    templateId: TEMPLATE_ID,
    displayValues,
    rawContent: template.content,
    formValues,
    variables: template.variables,
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="border-b border-gray-200 bg-white px-6 py-4">
        <div className="mx-auto max-w-7xl flex items-center justify-between">
          <div>
            <a href="/" className="text-xs text-blue-600 hover:underline">← Back</a>
            <h1 className="mt-1 text-lg font-semibold text-gray-900">{template.name}</h1>
            <p className="text-xs text-gray-500">{template.description}</p>
          </div>
          <DownloadButton {...downloadProps} />
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-8">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          {/* Left panel: Chat or Form */}
          <div className="lg:sticky lg:top-8 lg:self-start">
            <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-500">
                  {showForm ? "Fill in Details" : "AI Assistant"}
                </h2>
                <button
                  onClick={() => setShowForm((v) => !v)}
                  className="text-xs text-[#209dd7] hover:underline"
                >
                  {showForm ? "← Back to AI chat" : "Fill manually"}
                </button>
              </div>

              {showForm ? (
                <TemplateForm
                  variables={template.variables}
                  values={formValues}
                  touched={touched}
                  onChange={handleChange}
                  onBlur={handleBlur}
                />
              ) : (
                <>
                  <ChatPanel
                    messages={messages}
                    isLoading={isChatLoading}
                    onSend={handleSend}
                  />
                  {chatError && (
                    <p className="mt-2 text-xs text-red-500">{chatError}</p>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Right panel: Document preview */}
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
          <DownloadButton {...downloadProps} />
        </div>
      </main>
    </div>
  );
}
