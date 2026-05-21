import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Stratega — AI Student Productivity Platform",
    template: "%s | Stratega",
  },
  description:
    "Stratega supercharges your studies with AI-powered notes, flashcards, scheduling, and smart analytics — all in one premium platform.",
  keywords: ["AI", "student", "productivity", "flashcards", "study", "timetable", "notes"],
  authors: [{ name: "Stratega Team" }],
  openGraph: {
    title: "Stratega — AI Student Productivity Platform",
    description: "Study smarter, not harder. AI-powered tools for students.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=Space+Grotesk:wght@400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body>{children}</body>
    </html>
  );
}
