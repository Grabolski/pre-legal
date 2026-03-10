"use client";

import { useEffect, useRef, useState, useCallback, useMemo } from "react";
import { Template } from "@/types/template";
import { fetchTemplate, API_BASE } from "@/lib/api";
import { formatDisplayValues } from "@/lib/interpolate";
import { sendChatMessage, ChatMessage } from "@/lib/chat";
import TemplateForm from "@/components/form/TemplateForm";
import MutualNdaPreview from "@/components/preview/MutualNdaPreview";
import GenericPreview from "@/components/preview/GenericPreview";
import DownloadButton from "@/components/ui/DownloadButton";
import ChatPanel from "@/components/chat/ChatPanel";

interface Props {
  templateId: string;
}

function makeInitialMessage(templateName: string): ChatMessage {
  return {
    role: "assistant",
    content: `Hi! I'm here to help you draft a ${templateName}. Let's get started — what details would you like to use for this document?`,
  };
}

export default function CreateDocumentPage({ templateId }: Props) {
  const [template, setTemplate] = useState<Template | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [formValues, setFormValues] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isChatLoading, setIsChatLoading] = useState(false);
  const [chatError, setChatError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);

  // initialMessageRef holds the synthetic greeting so we can filter it from API calls
  const initialMessageRef = useRef<ChatMessage | null>(null);

  // Ref keeps current messages available inside async callbacks
  const messagesRef = useRef(messages);
  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);

  useEffect(() => {
    fetchTemplate(templateId)
      .then((t) => {
        setTemplate(t);
        const initial: Record<string, string> = {};
        t.variables.forEach((v) => (initial[v.key] = ""));
        setFormValues(initial);
        const greeting = makeInitialMessage(t.name);
        initialMessageRef.current = greeting;
        setMessages([greeting]);
      })
      .catch((err) => setError(err.message));
  }, [templateId]);

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
      // Filter out the synthetic greeting before sending to the API
      const apiMessages = messagesRef.current
        .filter((m) => m !== initialMessageRef.current)
        .concat(userMessage);

      setMessages((prev) => [...prev, userMessage]);
      setIsChatLoading(true);
      setChatError(null);

      try {
        const response = await sendChatMessage(templateId, apiMessages);
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
    [template, templateId]
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
    templateId,
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
                {templateId === "mutual-non-disclosure-agreement" ? (
                  <MutualNdaPreview formValues={displayValues} />
                ) : (
                  <GenericPreview content={template.content} formValues={displayValues} />
                )}
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
