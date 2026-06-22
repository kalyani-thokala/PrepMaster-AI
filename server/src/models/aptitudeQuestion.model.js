import mongoose, { Schema } from "mongoose";

const aptitudeQuestionSchema = new Schema(
  {
    category: {
      type: String,
      required: true,
      trim: true
    },
    difficulty: {
      type: String,
      enum: ["Easy", "Medium", "Hard"],
      default: "Medium"
    },
    questionText: {
      type: String,
      required: true
    },
    options: {
      type: [String],
      required: true,
      validate: [opts => opts.length === 4, "Must have exactly 4 options"]
    },
    correctOption: {
      type: String,
      required: true
    },
    explanation: {
      type: String,
      required: true
    },
    topic: {
      type: String,
      default: ""
    }
  },
  {
    timestamps: true
  }
);

export const AptitudeQuestion = mongoose.model("AptitudeQuestion", aptitudeQuestionSchema);
