"use client";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

const EXAMPLE_MESSAGES: ChatMessage[] = [
  {
    role: "user",
    content: "Which region has the highest poverty rate in 2023?",
  },
  {
    role: "assistant",
    content:
      "Based on the latest data, the Bangsamoro Autonomous Region in Muslim Mindanao (BARMM) has the highest poverty incidence at approximately 39.9% in 2023, which is significantly above the national average.",
  },
  {
    role: "user",
    content: "How does this compare to 2021?",
  },
  {
    role: "assistant",
    content:
      "In 2021, BARMM's poverty incidence was 40.0%, so there has been a slight improvement of 0.1 percentage points. The national poverty rate also improved from 18.1% in 2021 to 15.5% in 2023.",
  },
];

/**
 * Mock chat interface displaying hardcoded example Q&A pairs.
 * Input is disabled with a "coming soon" state until the Gemini integration is ready.
 */
export function ChatStub() {
  return (
    <div className="flex flex-col rounded-lg border border-border bg-card">
      {/* Beta banner */}
      <div className="flex items-center gap-2 border-b border-border bg-accent/20 px-4 py-3">
        <span className="rounded-full bg-primary px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-primary-foreground">
          Beta
        </span>
        <span className="text-sm text-muted-foreground">
          This is a preview of the AI chat experience. Live queries are not yet
          available.
        </span>
      </div>

      {/* Messages area */}
      <div className="flex-1 space-y-4 overflow-y-auto p-4">
        {EXAMPLE_MESSAGES.map((msg, i) => (
          <div
            key={i}
            className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[80%] px-4 py-3 text-sm leading-relaxed ${
                msg.role === "user"
                  ? "rounded-2xl rounded-tr-sm bg-primary text-primary-foreground"
                  : "rounded-2xl rounded-tl-sm bg-muted text-foreground"
              }`}
            >
              {msg.content}
            </div>
          </div>
        ))}
      </div>

      {/* Disabled input bar */}
      <div className="flex items-center gap-2 border-t border-border p-4">
        <input
          type="text"
          disabled
          placeholder="AI chat coming soon..."
          className="flex-1 rounded-md border border-border bg-muted px-3 py-2 text-sm text-muted-foreground opacity-50 cursor-not-allowed focus:outline-none"
        />
        <button
          type="button"
          disabled
          className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground opacity-50 cursor-not-allowed"
        >
          Send
        </button>
      </div>
    </div>
  );
}
