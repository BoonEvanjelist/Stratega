import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "AI Study Chat",
  description: "Chat with Stratega AI about your uploaded notes. Get Socratic explanations, quizzes, and concept breakdowns powered by Gemini 2.5 Flash.",
};

export default function ChatLayout({ children }: { children: React.ReactNode }) {
  // Full-height layout — fills the parent main container
  return <div className="h-full overflow-hidden" style={{ minHeight: "100vh" }}>{children}</div>;
}
