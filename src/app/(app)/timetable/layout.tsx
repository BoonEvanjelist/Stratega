import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Smart Timetable",
  description: "AI-generated study plans with daily milestones and progress tracking for your upcoming exams.",
};

export default function TimetableLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
