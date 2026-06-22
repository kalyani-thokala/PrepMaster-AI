import mongoose, { Schema } from "mongoose";

const assessmentSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    category: {
      type: String,
      required: true,
      enum: ["Quantitative Aptitude", "Logical Reasoning", "Verbal Ability", "Programming Core", "Company Specific", "Data Interpretation", "Profit & Loss", "Percentage", "Time and Work", "Number Series"]
    },
    difficulty: {
      type: String,
      enum: ["Easy", "Medium", "Hard"],
      default: "Medium"
    },
    questions: [
      {
        questionText: { type: String, required: true },
        options: [String],
        correctOption: { type: String, required: true }, // Can be index or text
        explanation: String,
        topic: String,
        type: {
          type: String,
          enum: ["MCQ", "Debugging", "Output Prediction"],
          default: "MCQ"
        }
      }
    ],
    answers: [
      {
        questionIndex: Number,
        selectedOption: String,
        isCorrect: Boolean
      }
    ],
    score: {
      type: Number,
      default: 0,
      min: 0,
      max: 100
    },
    report: {
      totalQuestions: Number,
      correctAnswers: Number,
      wrongAnswers: Number,
      skippedAnswers: Number,
      topicBreakdown: [
        {
          topic: String,
          total: Number,
          correct: Number
        }
      ]
    }
  },
  {
    timestamps: true
  }
);

export const Assessment = mongoose.model("Assessment", assessmentSchema);
