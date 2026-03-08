import { ChatPanel } from "@/components/chat/chat-panel";
import { PageTransition } from "@/components/layout/page-transition";

export default function ChatPage() {
  return (
    <PageTransition>
      <header className="mb-6">
        <h1
          className="text-2xl font-bold text-foreground"
          style={{ fontFamily: "var(--font-heading)" }}
        >
          AI Chat
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Natural language queries powered by Gemini
        </p>
      </header>

      <ChatPanel />
    </PageTransition>
  );
}
