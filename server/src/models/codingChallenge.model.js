import mongoose, { Schema } from "mongoose";

const codingChallengeSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },
    difficulty: {
      type: String,
      enum: ["Easy", "Medium", "Hard"],
      default: "Medium"
    },
    topic: {
      type: String,
      required: true,
      trim: true
    },
    description: {
      type: String,
      required: true
    },
    starterCode: [
      {
        language: { type: String, required: true }, // e.g. javascript, python, cpp, java, c
        code: { type: String, required: true }
      }
    ],
    testCases: [
      {
        input: { type: String, required: true },
        output: { type: String, required: true },
        isSample: { type: Boolean, default: true }
      }
    ],
    hiddenTestCases: [
      {
        input: { type: String, required: true },
        output: { type: String, required: true }
      }
    ],
    solution: {
      type: String,
      default: ""
    }
  },
  {
    timestamps: true
  }
);

export const CodingChallenge = mongoose.model("CodingChallenge", codingChallengeSchema);
