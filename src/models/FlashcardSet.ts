import mongoose, { Document, Model, Schema, Types } from "mongoose";

// ── Card sub-document interface ───────────────────────────────────────
export interface ICard {
  _id: Types.ObjectId;
  front: string;          // question / prompt
  back: string;           // answer / explanation

  // SM-2 spaced repetition parameters
  interval: number;       // days until next review (0 = review today)
  easeFactor: number;     // EF: starts at 2.5, min 1.3
  repetitions: number;    // number of consecutive correct reviews
  nextReviewDate: Date;   // absolute date for next session
}

// ── FlashcardSet document interface ──────────────────────────────────
export interface IFlashcardSet extends Document {
  userId: Types.ObjectId;
  documentId: Types.ObjectId;    // source Document
  title: string;
  cards: ICard[];
  createdAt: Date;
  updatedAt: Date;
}

// ── Card sub-schema ───────────────────────────────────────────────────
const CardSchema = new Schema<ICard>(
  {
    front: {
      type: String,
      required: [true, "Card front is required"],
      trim: true,
      maxlength: [1000, "Card front must be under 1000 characters"],
    },
    back: {
      type: String,
      required: [true, "Card back is required"],
      trim: true,
      maxlength: [3000, "Card back must be under 3000 characters"],
    },
    // SM-2 parameters
    interval:       { type: Number, default: 0,   min: 0 },
    easeFactor:     { type: Number, default: 2.5, min: 1.3 },
    repetitions:    { type: Number, default: 0,   min: 0 },
    nextReviewDate: { type: Date,   default: Date.now },
  },
  { _id: true }  // each card gets its own ObjectId for targeted PATCH
);

// ── FlashcardSet schema ────────────────────────────────────────────────
const FlashcardSetSchema = new Schema<IFlashcardSet>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "userId is required"],
      index: true,
    },
    documentId: {
      type: Schema.Types.ObjectId,
      ref: "Document",
      required: [true, "documentId is required"],
    },
    title: {
      type: String,
      required: [true, "title is required"],
      trim: true,
      maxlength: [200, "title must be under 200 characters"],
    },
    cards: {
      type: [CardSchema],
      validate: {
        validator: (arr: ICard[]) => arr.length > 0,
        message: "A flashcard set must contain at least one card",
      },
    },
  },
  { timestamps: true }
);

// Compound index — per-user listing sorted by newest
FlashcardSetSchema.index({ userId: 1, createdAt: -1 });

// ── Hot-reload guard ──────────────────────────────────────────────────
const FlashcardSetModel: Model<IFlashcardSet> =
  (mongoose.models.FlashcardSet as Model<IFlashcardSet>) ||
  mongoose.model<IFlashcardSet>("FlashcardSet", FlashcardSetSchema);

export default FlashcardSetModel;
