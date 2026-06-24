import mongoose, { Schema } from "mongoose";

const recommendationsSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true
    },
    weakTopics: {
      type: [String],
      default: []
    },
    guidance: {
      type: String,
      required: true
    },
    recommendedTopics: [
      {
        topic: { type: String, required: true },
        description: { type: String, required: true }
      }
    ]
  },
  {
    timestamps: true
  }
);

recommendationsSchema.index({ user: 1, createdAt: -1 });

export const Recommendations = mongoose.model("Recommendations", recommendationsSchema);
