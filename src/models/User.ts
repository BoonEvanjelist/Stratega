import mongoose, { Document, Model, Schema } from "mongoose";

// ── TypeScript interface ─────────────────────────────────────────────
export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  image?: string;
  studyStreak: number;
  lastActiveDate?: Date;
  createdAt: Date;
}

// ── Schema definition ────────────────────────────────────────────────
const UserSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      minlength: [2, "Name must be at least 2 characters"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Please provide a valid email address"],
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [8, "Password must be at least 8 characters"],
      // Never select password by default — callers must explicitly opt in
      select: false,
    },
    image: {
      type: String,
      default: "",
    },
    studyStreak: {
      type: Number,
      default: 0,
      min: 0,
    },
    lastActiveDate: {
      type: Date,
    },
  },
  {
    // Automatically manages `createdAt` and `updatedAt`
    timestamps: { createdAt: "createdAt", updatedAt: "updatedAt" },
  }
);

// ── Prevent model re-compilation during hot-reload ───────────────────
const User: Model<IUser> =
  (mongoose.models.User as Model<IUser>) ||
  mongoose.model<IUser>("User", UserSchema);

export default User;
