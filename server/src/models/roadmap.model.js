import mongoose, { Schema } from "mongoose";

const roadmapSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    targetRole: {
      type: String,
      required: true
    },
    currentSkills: {
      type: [String],
      default: []
    },
    missingSkills: {
      type: [String],
      default: []
    },
    milestones: [
      {
        title: String,
        description: String,
        duration: String, // e.g. "Week 1-2"
        skillsToLearn: [String],
        resources: [
          {
            name: String,
            link: String,
            resourceType: { type: String, enum: ["video", "article", "documentation", "course"] }
          }
        ],
        projects: [
          {
            title: String,
            description: String
          }
        ],
        status: {
          type: String,
          enum: ["Not Started", "In Progress", "Completed"],
          default: "Not Started"
        }
      }
    ],
    timeline: {
      type: String, // e.g. "3 Months"
      required: true
    }
  },
  {
    timestamps: true
  }
);

export const Roadmap = mongoose.model("Roadmap", roadmapSchema);
