import mongoose, { Document, Model, Schema, Types } from "mongoose";

// ── TypeScript interface ──────────────────────────────────────────────
export interface IDocument extends Document {
  userId: Types.ObjectId;
  fileName: string;
  fileSize: number;          // bytes
  mimeType: string;          // always "application/pdf" for now
  pageCount: number;         // number of pages parsed
  rawTextContent: string;    // full extracted text (excluded from index queries)
  parsedSummary?: string;    // AI-generated Markdown study guide (cached)
  createdAt: Date;
  updatedAt: Date;
}

// ── Schema ────────────────────────────────────────────────────────────
const DocumentSchema = new Schema<IDocument>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "userId is required"],
      index: true,
    },
    fileName: {
      type: String,
      required: [true, "fileName is required"],
      trim: true,
      maxlength: [260, "fileName must be under 260 characters"],
    },
    fileSize: {
      type: Number,
      required: [true, "fileSize is required"],
      min: 1,
    },
    mimeType: {
      type: String,
      required: true,
      default: "application/pdf",
    },
    pageCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    rawTextContent: {
      type: String,
      required: [true, "rawTextContent is required"],
      // Intentionally NOT indexed — this can be tens of thousands of chars.
      // Queried only by _id when the AI layer needs it.
    },
    parsedSummary: {
      type: String,
      default: null,
      // Cached AI summary — null means not yet generated.
    },
  },
  { timestamps: true }
);

// Compound index for fast per-user listing
DocumentSchema.index({ userId: 1, createdAt: -1 });

// ── Hot-reload guard ──────────────────────────────────────────────────
const DocumentModel: Model<IDocument> =
  (mongoose.models.Document as Model<IDocument>) ||
  mongoose.model<IDocument>("Document", DocumentSchema);

export default DocumentModel;
