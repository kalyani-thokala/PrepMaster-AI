import mongoose, { Schema } from "mongoose";

const codingTestSchema = new Schema(
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
    title: {
      type: String,
      required: true,
      trim: true
    },
    description: {
      type: String,
      required: true
    },
    inputFormat: {
      type: String,
      required: true
    },
    outputFormat: {
      type: String,
      required: true
    },
    constraints: {
      type: String,
      required: true
    },
    examples: [
      {
        input: { type: String, required: true },
        output: { type: String, required: true },
        explanation: { type: String, default: "" }
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
    starterCode: [
      {
        language: { type: String, required: true },
        code: { type: String, required: true }
      }
    ]
  },
  {
    timestamps: true
  }
);

codingTestSchema.index({ user: 1, topic: 1, difficulty: 1 });

export const CodingTest = mongoose.model("CodingTest", codingTestSchema);
