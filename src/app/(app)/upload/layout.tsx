import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Upload Notes",
  description: "Upload PDF textbooks and lecture notes. Stratega extracts text so your AI tutor can answer questions from your own documents.",
};

export default function UploadLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
