import mongoose, { Schema } from "mongoose";

const aptitudeTestSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true
    },
    topic: {
      type: String,
      required: true,
      trim: true,
      index: true
    },
    difficulty: {
      type: String,
      enum: ["Easy", "Medium", "Hard"],
      required: true,
      index: true
    },
    questions: [
      {
        question: { type: String, required: true },
        options: {
          type: [String],
          required: true,
          validate: [opts => opts.length === 4, "Must have exactly 4 options"]
        },
        correctAnswer: { type: String, required: true },
        explanation: { type: String, required: true },
        topic: { type: String, required: true },
        difficulty: { type: String, required: true },
        marks: { type: Number, default: 1 }
      }
    ],
    duration: {
      type: Number, // in seconds
      required: true
    }
  },
  {
    timestamps: true
  }
);

aptitudeTestSchema.index({ user: 1, topic: 1, difficulty: 1 });

export const AptitudeTest = mongoose.model("AptitudeTest", aptitudeTestSchema);
