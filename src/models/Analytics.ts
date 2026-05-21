import mongoose, { Document, Model, Schema, Types } from "mongoose";

export interface ISessionHistory {
  date: Date;
  focusBlockDuration: number; // in minutes
}

export interface IAnalytics extends Document {
  userId: Types.ObjectId;
  totalStudyTime: number; // total minutes studied across all time
  sessionHistory: ISessionHistory[];
  performanceSummary: {
    weakTopics: string[];
    aiRecommendations: string[];
  };
  createdAt: Date;
  updatedAt: Date;
}

const SessionHistorySchema = new Schema<ISessionHistory>({
  date: { type: Date, required: true },
  focusBlockDuration: { type: Number, required: true },
}, { _id: false });

const AnalyticsSchema = new Schema<IAnalytics>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true, // One analytics document per user
      index: true,
    },
    totalStudyTime: {
      type: Number,
      default: 0,
    },
    sessionHistory: {
      type: [SessionHistorySchema],
      default: [],
    },
    performanceSummary: {
      weakTopics: {
        type: [String],
        default: [],
      },
      aiRecommendations: {
        type: [String],
        default: [],
      },
    },
  },
  { timestamps: true }
);

const AnalyticsModel: Model<IAnalytics> =
  (mongoose.models.Analytics as Model<IAnalytics>) ||
  mongoose.model<IAnalytics>("Analytics", AnalyticsSchema);

export default AnalyticsModel;
