import { jest, describe, beforeEach, it, expect } from "@jest/globals";
import request from "supertest";
import app from "../src/app.js";
import { User } from "../src/models/user.model.js";

// Mock User Model database calls dynamically to avoid ES modules static compilation issues
User.findOne = jest.fn();
User.create = jest.fn();

describe("Auth Controller Unit Tests", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("POST /api/v1/auth/register", () => {
    it("should return 400 if any required field is missing", async () => {
      const response = await request(app)
        .post("/api/v1/auth/register")
        .send({
          fullName: "John Doe",
          email: "john@example.com"
        });

      expect(response.statusCode).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain("fields are required");
    });

    it("should return 400 if passwords do not match", async () => {
      const response = await request(app)
        .post("/api/v1/auth/register")
        .send({
          fullName: "John Doe",
          email: "john@example.com",
          password: "password123",
          confirmPassword: "password321"
        });

      expect(response.statusCode).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain("Passwords do not match");
    });

    it("should return 409 if user email already exists", async () => {
      // Mock duplicate search return
      User.findOne.mockResolvedValue({ email: "duplicate@example.com" });

      const response = await request(app)
        .post("/api/v1/auth/register")
        .send({
          fullName: "John Doe",
          email: "duplicate@example.com",
          password: "password123",
          confirmPassword: "password123"
        });

      expect(response.statusCode).toBe(409);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain("already exists");
    });
  });
});
