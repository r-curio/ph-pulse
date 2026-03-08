"use client";

import { memo, useCallback, useEffect, useRef, useState } from "react";
import { streamChat } from "@/lib/api";
import type { ChatMessage, ChatSSEEvent, SourceInfo } from "@/lib/types";

/** Suggested starter questions shown when the chat is empty. */
const STARTER_QUESTIONS = [
  "Which region has the highest poverty rate in 2023?",
  "How has poverty in BARMM changed over the years?",
  "What are the top 5 poorest municipalities?",
  "What does the 2026 forecast look like?",
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
      <div className="flex-1 space-y-4 overflow-y-auto p-4">
        {messages.length === 0 && !assistant && (
          <div className="flex h-full flex-col items-center justify-center gap-6">
            <div className="text-center">
              <p className="text-lg font-medium text-foreground">
                Ask about Philippine poverty data
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                Powered by Gemini with real-time data from PH-Pulse
              </p>
            </div>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              {STARTER_QUESTIONS.map((q) => (
                <button
                  key={q}
                  type="button"
                  onClick={() => handleStarter(q)}
                  className="cursor-pointer rounded-lg border border-border bg-muted/50 px-4 py-3 text-left text-sm text-foreground transition-colors hover:bg-muted"
                >
                  {q}
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
            <div className="max-w-[80%] space-y-2">
              {/* Tool call indicators */}
              {assistant.activeTools.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {assistant.activeTools.map((tool) => (
                    <span
                      key={tool}
                      className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-2.5 py-1 text-xs text-primary"
                    >
                      <span className="inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-primary" />
                      Fetching {TOOL_LABELS[tool] ?? tool}
                    </span>
                  ))}
                </div>
              )}

              {/* Streaming text */}
              {assistant.text && (
                <div className="rounded-2xl rounded-tl-sm bg-muted px-4 py-3 text-sm leading-relaxed text-foreground whitespace-pre-wrap">
                  {assistant.text}
                  {assistant.isStreaming && (
                    <span className="ml-0.5 inline-block h-4 w-1 animate-pulse bg-foreground/40" />
                  )}
                </div>
              )}

              {/* Loading indicator when no text yet */}
              {!assistant.text && assistant.isStreaming && assistant.activeTools.length === 0 && (
                <div className="rounded-2xl rounded-tl-sm bg-muted px-4 py-3 text-sm text-muted-foreground">
                  <span className="inline-flex gap-1">
                    <span className="animate-bounce [animation-delay:0ms]">.</span>
                    <span className="animate-bounce [animation-delay:150ms]">.</span>
                    <span className="animate-bounce [animation-delay:300ms]">.</span>
                  </span>
                </div>
              )}

              {/* Error */}
              {assistant.error && (
                <div className="rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
                  {assistant.error}
                </div>
              )}

              {/* Source citations */}
              {assistant.sources.length > 0 && !assistant.isStreaming && (
                <div className="rounded-lg border border-border/60 bg-muted/40 px-3 py-2">
                  <p className="mb-1.5 text-[11px] font-medium tracking-wide text-muted-foreground uppercase">
                    Sources
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {assistant.sources.map((src) => (
                      <span
                        key={src.table}
                        className="inline-flex items-center gap-1 rounded-md border border-border/50 bg-background px-2 py-0.5 text-xs text-muted-foreground"
                        title={src.table}
                      >
                        <svg
                          className="h-3 w-3 shrink-0 text-primary/60"
                          viewBox="0 0 16 16"
                          fill="currentColor"
                          aria-hidden="true"
                        >
                          <path d="M2 3a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V3zm3 1a.5.5 0 0 0 0 1h6a.5.5 0 0 0 0-1H5zm0 3a.5.5 0 0 0 0 1h6a.5.5 0 0 0 0-1H5zm0 3a.5.5 0 0 0 0 1h4a.5.5 0 0 0 0-1H5z" />
                        </svg>
                        {src.description}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input bar */}
      <form
        onSubmit={handleSubmit}
        className="flex items-center gap-2 border-t border-border p-4"
      >
        <input
          ref={inputRef}
          type="text"
          aria-label="Chat message input"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask about Philippine poverty data..."
          disabled={isLoading}
          className="flex-1 rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 disabled:cursor-not-allowed disabled:opacity-50"
        />
        {isLoading ? (
          <button
            type="button"
            onClick={handleCancel}
            className="cursor-pointer rounded-md bg-muted px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted/80"
          >
            Stop
          </button>
        ) : (
          <button
            type="submit"
            disabled={!input.trim()}
            className="cursor-pointer rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Send
          </button>
        )}
      </form>
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

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[80%] px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap ${
          isUser
            ? "rounded-2xl rounded-tr-sm bg-primary text-primary-foreground"
            : "rounded-2xl rounded-tl-sm bg-muted text-foreground"
        }`}
      >
        {message.content}
      </div>
    </div>
  );
});
