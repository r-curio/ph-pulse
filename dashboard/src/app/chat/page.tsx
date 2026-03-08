import { ChatPanel } from "@/components/chat/chat-panel";
import { PageTransition } from "@/components/layout/page-transition";

export default function ChatPage() {
  return (
    <PageTransition className="px-4 sm:px-6 lg:px-8 py-8">
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
