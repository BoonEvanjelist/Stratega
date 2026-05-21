import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Flashcards",
  description: "AI-generated spaced-repetition flashcard decks from your uploaded notes. Study smarter with the SM-2 algorithm.",
};

export default function FlashcardsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
