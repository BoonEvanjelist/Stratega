/**
 * POST /api/timetable/generate
 *
 * Accepts { subjectName, examDate } and generates a structured
 * study plan distributing topics evenly across the remaining days.
 * Persists the document to MongoDB and returns it.
 *
 * Study plan topic distribution strategy:
 *   - Day 1-N: "Study Session <n> — Introduction / Core Concepts / Review"
 *   - Penultimate day: "Full Revision & Past Papers"
 *   - Last day: "Light Review & Rest"
 *
 * This gives a realistic, immediately useful scaffold that the
 * user can customise in the UI.
 */
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import dbConnect from "@/lib/dbConnect";
import Timetable, { IStudyPlanDay } from "@/models/Timetable";
import { getSession } from "@/lib/session";

// ── Validation schema ─────────────────────────────────────────────────
const GenerateSchema = z.object({
  subjectName: z
    .string()
    .min(1, { message: "Subject name is required" })
    .max(100)
    .trim(),
  examDate: z.string().refine(
    (d) => !isNaN(Date.parse(d)),
    { message: "examDate must be a valid ISO date string" }
  ),
});

// ── Topic label generator ─────────────────────────────────────────────
function generateTopics(subject: string, days: number): string[] {
  if (days === 1) return [`Full Revision — ${subject}`];

  const phases = [
    `Introduction & Core Concepts — ${subject}`,
    `Deep Dive: Fundamentals — ${subject}`,
    `Practice Problems & Worked Examples — ${subject}`,
    `Advanced Topics & Edge Cases — ${subject}`,
    `Concept Mapping & Connections — ${subject}`,
    `Application & Problem Solving — ${subject}`,
    `Weak Areas Review — ${subject}`,
    `Mock Test & Self-Assessment — ${subject}`,
  ];

  const topics: string[] = [];

  // Last two days are always special
  const studyDays = days - 2 > 0 ? days - 2 : 1;

  for (let i = 0; i < studyDays; i++) {
    // Cycle through phases, repeating if needed
    const phaseIndex = i % phases.length;
    const sessionNum = i + 1;
    topics.push(`Day ${sessionNum}: ${phases[phaseIndex]}`);
  }

  if (days >= 2) {
    topics.push(`Day ${days - 1}: Full Revision, Past Papers & Practice Tests — ${subject}`);
  }
  topics.push(`Day ${days}: Light Review, Rest & Exam Prep — ${subject}`);

  return topics;
}

// ── POST handler ──────────────────────────────────────────────────────
export async function POST(request: NextRequest) {
  // Auth check
  const session = await getSession();
  if (!session?.userId) {
    return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
  }

  // Parse & validate body
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = GenerateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", issues: parsed.error.flatten().fieldErrors },
      { status: 400 }
    );
  }

  const { subjectName, examDate: examDateStr } = parsed.data;
  const examDate = new Date(examDateStr);

  // Compute days remaining (inclusive of today)
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  examDate.setHours(0, 0, 0, 0);

  const msPerDay = 24 * 60 * 60 * 1000;
  const totalDays = Math.ceil((examDate.getTime() - today.getTime()) / msPerDay);

  if (totalDays < 1) {
    return NextResponse.json(
      { error: "Exam date must be at least 1 day in the future" },
      { status: 400 }
    );
  }

  // Generate topic labels
  const topics = generateTopics(subjectName, totalDays);

  // Build study plan array
  const studyPlan: IStudyPlanDay[] = topics.map((topic, i) => {
    const dayDate = new Date(today.getTime() + i * msPerDay);
    return {
      dayNumber: i + 1,
      date: dayDate,
      topicToCover: topic,
      isCompleted: false,
    };
  });

  await dbConnect();

  const timetable = await Timetable.create({
    userId: session.userId,
    subjectName,
    examDate,
    totalDays,
    studyPlan,
  });

  return NextResponse.json(
    { message: "Study plan generated", timetable },
    { status: 201 }
  );
}
