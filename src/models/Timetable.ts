import mongoose, { Document, Model, Schema, Types } from "mongoose";

// ── Sub-document types ────────────────────────────────────────────────
export interface IStudyPlanDay {
  dayNumber: number;
  date: Date;
  topicToCover: string;
  isCompleted: boolean;
}

// ── Main document interface ───────────────────────────────────────────
export interface ITimetable extends Document {
  userId: Types.ObjectId;
  subjectName: string;
  examDate: Date;
  totalDays: number;
  studyPlan: IStudyPlanDay[];
  createdAt: Date;
  updatedAt: Date;
}

// ── Study plan day sub-schema ─────────────────────────────────────────
const StudyPlanDaySchema = new Schema<IStudyPlanDay>(
  {
    dayNumber: {
      type: Number,
      required: true,
      min: 1,
    },
    date: {
      type: Date,
      required: true,
    },
    topicToCover: {
      type: String,
      required: true,
      trim: true,
    },
    isCompleted: {
      type: Boolean,
      default: false,
    },
  },
  { _id: true } // each day gets its own _id for PATCH targeting
);

// ── Timetable schema ──────────────────────────────────────────────────
const TimetableSchema = new Schema<ITimetable>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "userId is required"],
      index: true,
    },
    subjectName: {
      type: String,
      required: [true, "Subject name is required"],
      trim: true,
      maxlength: [100, "Subject name must be under 100 characters"],
    },
    examDate: {
      type: Date,
      required: [true, "Exam date is required"],
    },
    totalDays: {
      type: Number,
      required: true,
      min: 1,
    },
    studyPlan: {
      type: [StudyPlanDaySchema],
      default: [],
    },
  },
  { timestamps: true }
);

// Compound index: quickly fetch all plans for a user sorted by exam date
TimetableSchema.index({ userId: 1, examDate: 1 });

// ── Model (hot-reload safe) ───────────────────────────────────────────
const Timetable: Model<ITimetable> =
  (mongoose.models.Timetable as Model<ITimetable>) ||
  mongoose.model<ITimetable>("Timetable", TimetableSchema);

export default Timetable;
