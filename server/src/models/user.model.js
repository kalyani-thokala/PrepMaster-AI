import mongoose, { Schema } from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const userSchema = new Schema(
  {
    fullName: {
      type: String,
      required: [true, "Full name is required"],
      trim: true,
      index: true
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      index: true
    },
    password: {
      type: String,
      required: [true, "Password is required"]
    },
    avatar: {
      type: String, // Cloudinary URL or placeholder URL
      default: ""
    },
    bio: {
      type: String,
      default: ""
    },
    role: {
      type: String,
      enum: ["Student", "Admin", "Super Admin"],
      default: "Student"
    },
    skills: {
      type: [String],
      default: []
    },
    education: [
      {
        institution: String,
        degree: String,
        fieldOfStudy: String,
        startYear: Number,
        endYear: Number,
        grade: String
      }
    ],
    projects: [
      {
        title: String,
        description: String,
        technologies: [String],
        link: String
      }
    ],
    certifications: [
      {
        name: String,
        issuingOrganization: String,
        issueDate: Date,
        credentialUrl: String
      }
    ],
    streak: {
      type: Number,
      default: 0
    },
    achievements: [
      {
        title: String,
        description: String,
        unlockedAt: {
          type: Date,
          default: Date.now
        }
      }
    ],
    interviewCount: {
      type: Number,
      default: 0
    },
    assessmentCount: {
      type: Number,
      default: 0
    },
    readinessScore: {
      type: Number,
      default: 0,
      min: 0,
      max: 100
    },
    subscriptionPlan: {
      type: String,
      enum: ["Free", "Pro", "Enterprise"],
      default: "Free"
    },
    credits: {
      type: Number,
      default: 10
    },
    isDeleted: {
      type: Boolean,
      default: false
    },
    deletedAt: {
      type: Date
    },
    otp: {
      code: String,
      expiresAt: Date
    },
    refreshToken: {
      type: String
    }
  },
  {
    timestamps: true
  }
);

// email is already indexed unique in the field declaration above
userSchema.index({ role: 1 });

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  try {
    this.password = await bcrypt.hash(this.password, 10);
    next();
  } catch (error) {
    next(error);
  }
});

userSchema.methods.isPasswordCorrect = async function (password) {
  return await bcrypt.compare(password, this.password);
};

userSchema.methods.generateAccessToken = function () {
  return jwt.sign(
    {
      _id: this._id,
      email: this.email,
      role: this.role,
      fullName: this.fullName
    },
    process.env.JWT_ACCESS_SECRET,
    {
      expiresIn: process.env.JWT_ACCESS_EXPIRY || "15m"
    }
  );
};

userSchema.methods.generateRefreshToken = function () {
  return jwt.sign(
    {
      _id: this._id
    },
    process.env.JWT_REFRESH_SECRET,
    {
      expiresIn: process.env.JWT_REFRESH_EXPIRY || "7d"
    }
  );
};

export const User = mongoose.model("User", userSchema);
