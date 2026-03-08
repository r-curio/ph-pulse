"use client";

import { memo, useCallback, useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import { streamChat } from "@/lib/api";
import type { ChatMessage, ChatSSEEvent, SourceInfo } from "@/lib/types";

/** Suggested starter questions shown when the chat is empty. */
const STARTER_QUESTIONS = [
  {
    label: "Which region has the highest poverty rate in 2023?",
    icon: (
      <svg className="h-4 w-4 shrink-0 text-chart-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden="true">
        <path d="M3 3v18h18" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M7 16l4-8 4 4 6-6" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    label: "How has poverty in BARMM changed over the years?",
    icon: (
      <svg className="h-4 w-4 shrink-0 text-chart-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden="true">
        <circle cx="12" cy="12" r="10" />
        <path d="M12 6v6l4 2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    label: "What are the top 5 poorest municipalities?",
    icon: (
      <svg className="h-4 w-4 shrink-0 text-chart-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden="true">
        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 1 1 18 0z" />
        <circle cx="12" cy="10" r="3" />
      </svg>
    ),
  },
  {
    label: "What does the 2026 forecast look like?",
    icon: (
      <svg className="h-4 w-4 shrink-0 text-chart-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden="true">
        <path d="M12 2L2 7l10 5 10-5-10-5z" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M2 17l10 5 10-5M2 12l10 5 10-5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
];

/** Readable labels for tool call names. */
const TOOL_LABELS: Record<string, string> = {
  get_regional_poverty: "regional poverty data",
  get_national_poverty: "national poverty data",
  get_historical_poverty: "historical poverty data",
  get_historical_national: "national historical data",
  get_municipal_poverty: "municipal poverty data",
  get_top_bottom_municipalities: "municipality rankings",
  get_forecasts: "forecast predictions",
  get_forecast_summary: "forecast summary",
};

/** Shared Tailwind classes for markdown prose rendering. */
const PROSE_CLASSES =
  "prose prose-sm prose-invert max-w-none prose-p:my-1.5 prose-ul:my-1.5 prose-ol:my-1.5 prose-li:my-0.5 prose-headings:my-2 prose-headings:font-semibold prose-headings:text-foreground prose-strong:text-foreground prose-p:text-foreground/90 prose-li:text-foreground/90 prose-a:text-primary prose-a:no-underline hover:prose-a:underline prose-code:rounded prose-code:bg-background/60 prose-code:px-1.5 prose-code:py-0.5 prose-code:text-xs prose-code:font-normal prose-code:text-primary/80 prose-code:before:content-none prose-code:after:content-none prose-pre:rounded-lg prose-pre:bg-background/60 prose-pre:text-xs prose-pre:border prose-pre:border-border/40 prose-hr:border-border/40";

interface AssistantState {
  /** The accumulated text so far. */
  text: string;
  /** Data sources cited. */
  sources: SourceInfo[];
  /** Tools currently being queried (shown as loading indicators). */
  activeTools: string[];
  /** Whether the response is still streaming. */
  isStreaming: boolean;
  /** Error message if the stream failed. */
  error: string | null;
}

/**
 * Real-time chat panel that streams AI responses via SSE.
 * Manages conversation history in React state (client-side session).
 */
export function ChatPanel() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [assistant, setAssistant] = useState<AssistantState | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const isLoading = assistant?.isStreaming ?? false;

  /** Scroll to bottom when messages change or assistant streams. */
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, assistant?.text]);

  /** Handle an SSE event from the streaming response. */
  const handleEvent = useCallback((event: ChatSSEEvent) => {
    switch (event.type) {
      case "tool_call":
        setAssistant((prev) =>
          prev
            ? {
                ...prev,
                activeTools: [...prev.activeTools, event.name],
              }
            : prev
        );
        break;
      case "token":
        setAssistant((prev) =>
          prev
            ? {
                ...prev,
                text: prev.text + event.text,
                activeTools: [], // Clear tools once text starts
              }
            : prev
        );
        break;
      case "source":
        setAssistant((prev) =>
          prev
            ? {
                ...prev,
                sources: [
                  ...prev.sources,
                  { table: event.table, description: event.description },
                ],
              }
            : prev
        );
        break;
      case "error":
        setAssistant((prev) =>
          prev
            ? { ...prev, error: event.message, isStreaming: false }
            : prev
        );
        break;
      case "done":
        setAssistant((prev) =>
          prev ? { ...prev, isStreaming: false } : prev
        );
        break;
    }
  }, []);

  /** Send a message and stream the response. */
  const sendMessage = useCallback(
    async (content: string) => {
      if (!content.trim() || isLoading) return;

      const userMsg: ChatMessage = { role: "user", content: content.trim() };
      const updatedMessages = [...messages, userMsg];

      setMessages(updatedMessages);
      setInput("");
      setAssistant({
        text: "",
        sources: [],
        activeTools: [],
        isStreaming: true,
        error: null,
      });

      const controller = new AbortController();
      abortRef.current = controller;

      try {
        await streamChat(updatedMessages, handleEvent, controller.signal);
      } catch (err) {
        if (err instanceof Error && err.name === "AbortError") return;
        setAssistant((prev) =>
          prev
            ? {
                ...prev,
                error:
                  err instanceof Error
                    ? err.message
                    : "An unexpected error occurred.",
                isStreaming: false,
              }
            : prev
        );
      }
    },
    [messages, isLoading, handleEvent]
  );

  /** Finalize the assistant message into the conversation history. */
  useEffect(() => {
    if (assistant && !assistant.isStreaming && assistant.text) {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: assistant.text },
      ]);
      setAssistant(null);
      inputRef.current?.focus();
    }
  }, [assistant]);

  /** Handle form submit. */
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

  /** Handle starter question click. */
  const handleStarter = (question: string) => {
    sendMessage(question);
  };

  /** Cancel an in-progress stream. */
  const handleCancel = () => {
    abortRef.current?.abort();
    setAssistant((prev) =>
      prev ? { ...prev, isStreaming: false } : prev
    );
  };

  return (
    <div className="flex h-[calc(100vh-12rem)] flex-col rounded-lg border border-border bg-card">
      {/* Messages area */}
      <div className="flex-1 space-y-4 overflow-y-auto p-4 sm:p-6">
        {messages.length === 0 && !assistant && (
          <div className="flex h-full flex-col items-center justify-center gap-8">
            {/* Gemini-inspired glow icon */}
            <div className="relative">
              <div className="absolute -inset-4 rounded-full bg-primary/10 blur-xl" />
              <div className="relative flex h-14 w-14 items-center justify-center rounded-2xl border border-border bg-muted">
                <svg className="h-7 w-7 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} aria-hidden="true">
                  <path d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09z" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 0 0-2.455 2.456z" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
            </div>

            <div className="text-center">
              <p className="text-base font-medium text-foreground">
                Ask about Philippine poverty data
              </p>
              <p className="mt-1.5 text-sm text-muted-foreground">
                Query real-time data from PH-Pulse with natural language
              </p>
            </div>

            <div className="grid w-full max-w-lg grid-cols-1 gap-2 sm:grid-cols-2">
              {STARTER_QUESTIONS.map((q) => (
                <button
                  key={q.label}
                  type="button"
                  onClick={() => handleStarter(q.label)}
                  className="group flex cursor-pointer items-start gap-3 rounded-lg border border-border/60 bg-muted/30 px-3.5 py-3 text-left text-sm text-foreground/80 transition-all hover:border-primary/30 hover:bg-muted/60 hover:text-foreground"
                >
                  <span className="mt-0.5 transition-transform group-hover:scale-110">
                    {q.icon}
                  </span>
                  <span className="leading-snug">{q.label}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg, i) => (
          <MessageBubble key={i} message={msg} />
        ))}

        {/* Streaming assistant response */}
        {assistant && (
          <div className="flex justify-start" aria-live="polite">
            <div className="max-w-[85%] space-y-2">
              {/* Tool call indicators */}
              {assistant.activeTools.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {assistant.activeTools.map((tool) => (
                    <span
                      key={tool}
                      className="inline-flex items-center gap-1.5 rounded-md border border-primary/20 bg-primary/5 px-2.5 py-1 text-xs text-primary"
                    >
                      <span className="inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-primary" />
                      Querying {TOOL_LABELS[tool] ?? tool}
                    </span>
                  ))}
                </div>
              )}

              {/* Streaming text */}
              {assistant.text && (
                <div className="rounded-xl rounded-tl-sm border border-border/40 bg-muted/80 px-4 py-3 text-sm leading-relaxed text-foreground">
                  <div className={PROSE_CLASSES}>
                    <ReactMarkdown>{assistant.text}</ReactMarkdown>
                  </div>
                  {assistant.isStreaming && (
                    <span className="ml-0.5 inline-block h-4 w-0.5 animate-pulse rounded-full bg-primary/60" />
                  )}
                </div>
              )}

              {/* Loading indicator when no text yet */}
              {!assistant.text && assistant.isStreaming && assistant.activeTools.length === 0 && (
                <div className="rounded-xl rounded-tl-sm border border-border/40 bg-muted/80 px-4 py-3 text-sm text-muted-foreground">
                  <span className="inline-flex gap-1">
                    <span className="animate-bounce [animation-delay:0ms]">.</span>
                    <span className="animate-bounce [animation-delay:150ms]">.</span>
                    <span className="animate-bounce [animation-delay:300ms]">.</span>
                  </span>
                </div>
              )}

              {/* Error */}
              {assistant.error && (
                <div className="rounded-lg border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm text-destructive">
                  {assistant.error}
                </div>
              )}

              {/* Source citations */}
              {assistant.sources.length > 0 && !assistant.isStreaming && (
                <SourceCitations sources={assistant.sources} />
              )}
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input bar */}
      <form
        onSubmit={handleSubmit}
        className="flex items-center gap-2 border-t border-border/60 bg-card/80 p-3 backdrop-blur-sm sm:p-4"
      >
        <div className="relative flex-1">
          <input
            ref={inputRef}
            type="text"
            aria-label="Chat message input"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about Philippine poverty data..."
            disabled={isLoading}
            className="w-full rounded-lg border border-border/60 bg-background py-2.5 pl-3.5 pr-3.5 text-sm text-foreground placeholder:text-muted-foreground/60 focus:border-primary/40 focus:outline-none focus:ring-1 focus:ring-primary/30 disabled:cursor-not-allowed disabled:opacity-50"
          />
        </div>
        {isLoading ? (
          <button
            type="button"
            onClick={handleCancel}
            className="flex cursor-pointer items-center gap-1.5 rounded-lg bg-muted px-3.5 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-muted/80"
          >
            <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <rect x="6" y="6" width="12" height="12" rx="1" />
            </svg>
            Stop
          </button>
        ) : (
          <button
            type="submit"
            disabled={!input.trim()}
            className="flex cursor-pointer items-center gap-1.5 rounded-lg bg-primary px-3.5 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Send
            <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden="true">
              <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        )}
      </form>
    </div>
  );
}

/** Inline source citation pills displayed after an assistant response. */
function SourceCitations({ sources }: { sources: SourceInfo[] }) {
  return (
    <div className="flex items-center gap-2 flex-wrap pt-0.5">
      <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground/60">
        Sources
      </span>
      {sources.map((src) => (
        <span
          key={src.table}
          className="inline-flex items-center gap-1.5 rounded-md border border-border/50 bg-muted/50 px-2 py-0.5 text-xs text-muted-foreground transition-colors hover:border-primary/30 hover:text-foreground"
          title={src.table}
        >
          <svg
            className="h-3 w-3 shrink-0 text-primary/50"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            aria-hidden="true"
          >
            <path d="M4 7v10c0 2 1 3 3 3h10c2 0 3-1 3-3V7c0-2-1-3-3-3H7c-2 0-3 1-3 3z" />
            <path d="M8 2v3M16 2v3M4 9h16" strokeLinecap="round" />
          </svg>
          {src.description}
        </span>
      ))}
    </div>
  );
}

/** Single chat message bubble, memoized to prevent re-renders during streaming. */
const MessageBubble = memo(function MessageBubble({
  message,
}: {
  message: ChatMessage;
}) {
  const isUser = message.role === "user";

  if (isUser) {
    return (
      <div className="flex justify-end">
        <div className="max-w-[80%] rounded-xl rounded-tr-sm bg-primary px-4 py-2.5 text-sm leading-relaxed text-primary-foreground whitespace-pre-wrap">
          {message.content}
        </div>
      </div>
    );
  }

  return (
    <div className="flex justify-start">
      <div className="max-w-[85%] rounded-xl rounded-tl-sm border border-border/40 bg-muted/80 px-4 py-3 text-sm leading-relaxed text-foreground">
        <div className={PROSE_CLASSES}>
          <ReactMarkdown>{message.content}</ReactMarkdown>
        </div>
      </div>
    </div>
  );
});
