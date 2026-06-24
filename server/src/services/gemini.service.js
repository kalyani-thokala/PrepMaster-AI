import { GoogleGenerativeAI } from "@google/generative-ai";
import { logger } from "../utils/logger.js";

// Initialize Gemini API Client
const getGeminiClient = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === "your_gemini_api_key_here") {
    logger.warn("GEMINI_API_KEY is not configured. Running Gemini service in mock fallback mode.");
    return null;
  }
  return new GoogleGenerativeAI(apiKey);
};

// Main wrapper to call Gemini and parse JSON safely
const callGeminiJson = async (prompt, systemInstruction = "") => {
  const client = getGeminiClient();
  if (!client) return null;

  try {
    const model = client.getGenerativeModel({
      model: "gemini-1.5-flash",
      systemInstruction: systemInstruction,
      generationConfig: { responseMimeType: "application/json" }
    });

    const result = await model.generateContent(prompt);
    const textResponse = result.response.text();
    return JSON.parse(textResponse);
  } catch (error) {
    logger.error("Gemini API error during JSON execution: ", error);
    return null;
  }
};

// Text completion helper (for chatbot)
const callGeminiText = async (prompt, systemInstruction = "", chatHistory = []) => {
  const client = getGeminiClient();
  if (!client) {
    return "Hello! I am PrepMaster AI Career Coach (Fallback Mode). Please set your GEMINI_API_KEY in the backend .env to connect to the actual Gemini AI engine.";
  }

  try {
    const model = client.getGenerativeModel({
      model: "gemini-1.5-flash",
      systemInstruction: systemInstruction
    });

    const chat = model.startChat({
      history: chatHistory.map((msg) => ({
        role: msg.role === "user" ? "user" : "model",
        parts: [{ text: msg.parts }]
      }))
    });

    const result = await chat.sendMessage(prompt);
    return result.response.text();
  } catch (error) {
    logger.error("Gemini API error during text execution: ", error);
    return "I apologize, but I encountered an error communicating with my AI brain. Please try again shortly.";
  }
};

export const geminiService = {
  // 1. Resume & ATS Score Analyzer
  analyzeResume: async (extractedText) => {
    const prompt = `Analyze this resume and evaluate its structure, details, formatting, and relevance.
    Provide the response in the following JSON format:
    {
      "score": 0 to 100 integer,
      "atsScore": 0 to 100 integer,
      "strengths": ["list of resume strengths"],
      "weaknesses": ["list of weaknesses/gaps"],
      "missingSkills": ["list of standard technical/soft skills missing that are relevant for modern placement"],
      "suggestions": ["list of specific recommendations to improve the resume"]
    }
    
    Resume Text:
    """
    ${extractedText}
    """`;

    const system = "You are a professional ATS system and senior HR recruitment manager. Provide a critical, structured ATS scan score and advice.";
    const result = await callGeminiJson(prompt, system);

    if (result) return result;

    // Fallback Mock Data
    logger.info("Using mock fallback data for Resume Analysis.");
    return {
      score: 72,
      atsScore: 68,
      strengths: ["Clear project descriptions", "Relevant technical stack outlined", "Education details clearly structured"],
      weaknesses: ["Lacks quantifiable metrics in work/project results", "No certifications section", "Weak resume introduction summary"],
      missingSkills: ["Docker", "Jest/Unit Testing", "CI/CD Pipelines", "System Design"],
      suggestions: [
        "Include metrics to showcase impact (e.g., 'Optimized query speeds by 30%')",
        "Add a dedicated certifications section to highlight self-learning",
        "Refine the hero headline to specify target roles clearly"
      ]
    };
  },

  // 2. Mock Interview Answer Grader
  evaluateMockInterview: async (role, questionText, answerText) => {
    const prompt = `Evaluate the candidate's answer for the following question for a '${role}' position:
    Question: "${questionText}"
    Answer: "${answerText}"
    
    Provide the response in the following JSON format:
    {
      "score": 0 to 100 integer,
      "technicalAccuracy": "short feedback regarding technical accuracy (e.g., strong, basic, incorrect details)",
      "communication": "evaluation of fluency and presentation",
      "confidence": "evaluation of expression confidence",
      "clarity": "evaluation of concise response structure",
      "feedbackText": "detailed coaching feedback paragraph on how to improve this specific answer",
      "strengths": ["strengths in the candidate's answer"],
      "weaknesses": ["weaknesses/gaps in the candidate's answer"],
      "recommendations": ["how to re-phrase or expand the answer"]
    }`;

    const system = "You are an elite technical interviewer and behavioral HR specialist. Grade the response rigorously.";
    const result = await callGeminiJson(prompt, system);

    if (result) return result;

    // Fallback Mock Data
    logger.info("Using mock fallback data for Interview Evaluation.");
    return {
      score: 75,
      technicalAccuracy: "Accurate on core definitions but lacking depth in design patterns.",
      communication: "Fluency is good, but uses excessive filler words.",
      confidence: "Displays intermediate confidence with some hesitation.",
      clarity: "The explanation could be structured better (e.g., using STAR method).",
      feedbackText: "You explained the concept correctly, but you missed explaining real-world edge cases. Structure your next answer by briefly explaining the theory first, then sharing a concrete example.",
      strengths: ["Accurate definition of the core concept", "Polite tone"],
      weaknesses: ["Missed mentioning key implementation details", "No real-world scenario shared"],
      recommendations: ["Structure answers using the STAR method", "Mention runtime complexities (Big O) if relevant"]
    };
  },

  // 3. Dynamic Assessments Generator
  generateAssessment: async (category, difficulty) => {
    const prompt = `Generate a set of 5 multiple-choice questions (MCQs) for the category '${category}' with a difficulty level of '${difficulty}'.
    Provide the response in the following JSON format:
    {
      "questions": [
        {
          "questionText": "The question prompt text",
          "options": ["Option A", "Option B", "Option C", "Option D"],
          "correctOption": "Option A (must exactly match one of the options)",
          "explanation": "Detailed explanation of why this answer is correct",
          "topic": "Specific subtopic name (e.g. Blood Relations, Probability, Data Structures)",
          "type": "MCQ"
        }
      ]
    }`;

    const system = "You are a placement examiner generating questions for aptitude and coding recruitment exams. Make them challenging and fully accurate.";
    const result = await callGeminiJson(prompt, system);

    if (result && result.questions && result.questions.length > 0) return result.questions;

    // Fallback Mock Data
    logger.info(`Using mock fallback data for Assessment: ${category} (${difficulty}).`);
    if (category.includes("Aptitude")) {
      return [
        {
          questionText: "If a person sells an item for $300 making a profit of 25%, what was the cost price of the item?",
          options: ["$240", "$250", "$225", "$275"],
          correctOption: "$240",
          explanation: "Cost Price = Selling Price / (1 + Profit Rate) = 300 / 1.25 = 240.",
          topic: "Profit and Loss",
          type: "MCQ"
        },
        {
          questionText: "A bag contains 5 red balls and 3 blue balls. If two balls are drawn at random one after another without replacement, what is the probability that both are red?",
          options: ["5/14", "25/64", "5/8", "15/56"],
          correctOption: "5/14",
          explanation: "Probability = (5/8) * (4/7) = 20/56 = 5/14.",
          topic: "Probability",
          type: "MCQ"
        }
      ];
    } else {
      return [
        {
          questionText: "What is the time complexity of searching in a balanced Binary Search Tree (BST)?",
          options: ["O(log n)", "O(n)", "O(1)", "O(n log n)"],
          correctOption: "O(log n)",
          explanation: "A balanced BST halves the search space at each step, yielding a runtime complexity of O(log n).",
          topic: "Data Structures",
          type: "MCQ"
        },
        {
          questionText: "Which of the following is NOT a solid principle?",
          options: ["Dependency Injection", "Single Responsibility", "Liskov Substitution", "Interface Segregation"],
          correctOption: "Dependency Injection",
          explanation: "SOLID stands for Single Responsibility, Open/Closed, Liskov Substitution, Interface Segregation, and Dependency Inversion. Dependency Injection is a pattern, not a direct principle of SOLID.",
          topic: "Software Engineering",
          type: "MCQ"
        }
      ];
    }
  },

  // 4. AI Career Coach Conversation Chatbot
  generateCareerCoachResponse: async (userMessage, chatHistory = []) => {
    const prompt = userMessage;
    const system = `You are PrepMaster AI Career Coach, a premium, knowledgeable mentor helping students secure dream roles at companies like Google, Amazon, Microsoft, TCS, Infosys, Accenture, and product/service startups.
    Offer pragmatic, actionable strategies. Keep responses structured with headings and bullet points. Never make up facts.`;
    return await callGeminiText(prompt, system, chatHistory);
  },

  // 5. Study Roadmap & Skill Gap Analyzer
  generateRoadmap: async (targetRole, currentSkills) => {
    const prompt = `Create a customized career roadmap for a user targetting the role: '${targetRole}'.
    Their current skills: [${currentSkills.join(", ")}].
    Identify missing skills and create a 3-stage milestone plan (Beginner, Intermediate, Advanced).
    Provide the response in the following JSON format:
    {
      "targetRole": "${targetRole}",
      "currentSkills": [${currentSkills.map(s => `"${s}"`).join(", ")}],
      "missingSkills": ["list of missing skills required for targetRole"],
      "timeline": "e.g. 12 Weeks",
      "milestones": [
        {
          "title": "Stage Title (e.g. Core Foundations, Backend Mastery, Advanced Scaling)",
          "description": "Short description of what is accomplished here",
          "duration": "e.g. Weeks 1-4",
          "skillsToLearn": ["skill name"],
          "resources": [
            {
              "name": "Resource Name",
              "link": "https://example.com/learn",
              "resourceType": "documentation"
            }
          ],
          "projects": [
            {
              "title": "Project Title",
              "description": "Short description of project to practice these skills"
            }
          ]
        }
      ]
    }`;

    const system = "You are an expert career planner and curriculum designer. Build a rigorous, highly-actionable modern learning curriculum roadmap.";
    const result = await callGeminiJson(prompt, system);

    if (result) return result;

    // Fallback Mock Data
    logger.info("Using mock fallback data for Roadmap Generator.");
    return {
      targetRole: targetRole || "Full Stack Developer",
      currentSkills: currentSkills || ["HTML", "CSS", "JavaScript"],
      missingSkills: ["Node.js", "Express", "MongoDB", "React Redux/Zustand", "Docker"],
      timeline: "8 Weeks",
      milestones: [
        {
          title: "Phase 1: Backend Fundamentals",
          description: "Establish strong core understandings of API design, Node runtimes, and databases.",
          duration: "Weeks 1-3",
          skillsToLearn: ["Node.js", "Express", "MongoDB"],
          resources: [
            { name: "Node.js Official Docs", link: "https://nodejs.org", resourceType: "documentation" },
            { name: "Express Complete Guide", link: "https://expressjs.com", resourceType: "article" }
          ],
          projects: [
            { title: "Task Manager REST API", description: "Create a complete CRUD API with JWT authorization." }
          ]
        },
        {
          title: "Phase 2: Frontend Integration & State Management",
          description: "Learn client-server state synchronization, hooks, and advanced UI systems.",
          duration: "Weeks 4-6",
          skillsToLearn: ["React Router DOM", "Zustand", "Tailwind CSS"],
          resources: [
            { name: "Zustand State Management Guide", link: "https://github.com/pmndrs/zustand", resourceType: "documentation" }
          ],
          projects: [
            { title: "Placement Portal Dashboard UI", description: "Design a responsive analytics interface using glassmorphic cards." }
          ]
        },
        {
          title: "Phase 3: Production Readiness & Deployment",
          description: "Containerize applications, set up automated tests, and deploy.",
          duration: "Weeks 7-8",
          skillsToLearn: ["Docker", "CI/CD Github Actions", "Jest Testing"],
          resources: [
            { name: "Docker Containerization Mastery", link: "https://docker.com", resourceType: "video" }
          ],
          projects: [
            { title: "Production App Launch", description: "Dockerize a fullstack app and deploy it on Render & Vercel." }
          ]
        }
      ]
    };
  },

  // 6. Placement Readiness Index Calculator
  evaluatePlacementReadiness: async (fullName, skills, resumeStats, assessmentStats, interviewStats) => {
    const prompt = `Evaluate the placement readiness index for candidate '${fullName}'.
    Candidate Profile:
    - Current Skills: [${skills ? skills.join(", ") : "None"}]
    - Resume details: score = ${resumeStats?.score || 0}, ATS score = ${resumeStats?.atsScore || 0}
    - Assessment performance: total assessments = ${assessmentStats?.total || 0}, average MCQ score = ${assessmentStats?.avgScore || 0}%
    - Mock Interview performance: interviews completed = ${interviewStats?.total || 0}, average rating = ${interviewStats?.avgScore || 0}/100
    
    Calculate the overall readiness index (out of 100) and break it down across categories. Provide actionable recommended steps.
    Provide the response in the following JSON format:
    {
      "overallReadiness": 0 to 100 integer,
      "codingReadiness": 0 to 100 integer,
      "aptitudeReadiness": 0 to 100 integer,
      "communicationReadiness": 0 to 100 integer,
      "interviewReadiness": 0 to 100 integer,
      "recommendedActions": [
        "Specifically detailed action recommendation 1",
        "Action recommendation 2"
      ]
    }`;

    const system = "You are a recruitment director evaluating if a university graduate is ready for software engineering placement drives.";
    const result = await callGeminiJson(prompt, system);

    if (result) return result;

    // Fallback Mock Data
    logger.info("Using mock fallback data for Placement Readiness evaluation.");
    return {
      overallReadiness: 65,
      codingReadiness: 70,
      aptitudeReadiness: 60,
      communicationReadiness: 75,
      interviewReadiness: 55,
      recommendedActions: [
        "Take at least 3 more Quantitative Aptitude mock assessments to raise your aptitude readiness score.",
        "Refine your core project details on your resume using action verbs and concrete statistics.",
        "Conduct a technical mock interview targeting a 'Backend Engineer' role to practice explaining system design concepts."
      ]
    };
  },

  // 7. Dynamic Aptitude Tests Generator
  generateAptitudeQuestions: async (topic, difficulty, count, excludeQuestions = []) => {
    const prompt = `Generate exactly ${count} unique, high-quality multiple-choice questions (MCQs) for the topic/category '${topic}' with a difficulty level of '${difficulty}'.
    ${excludeQuestions.length > 0 ? `To ensure uniqueness, you MUST NOT generate the following questions or anything very similar to them: ${JSON.stringify(excludeQuestions.slice(0, 20))}. Make sure at least 80% are completely new and distinct.` : ""}
    Each question must have exactly 4 choices. One choice must be the correct answer. Provide a detailed step-by-step mathematical or logical explanation.
    Provide the response in the following JSON format:
    {
      "questions": [
        {
          "question": "The question text here",
          "options": ["Option A text", "Option B text", "Option C text", "Option D text"],
          "correctAnswer": "Option A text (must exactly match one of the elements in options array)",
          "explanation": "Detailed step-by-step explanation why this is correct",
          "topic": "${topic}",
          "difficulty": "${difficulty}",
          "marks": 1
        }
      ]
    }`;

    const system = "You are a professional aptitude placement examiner. Create clear, mathematically and logically sound questions. Always return the output in valid JSON format.";
    const result = await callGeminiJson(prompt, system);
    
    if (result && result.questions && Array.isArray(result.questions) && result.questions.length > 0) {
      return result.questions;
    }
    
    throw new Error(`Failed to generate aptitude questions via Gemini for ${topic} (${difficulty})`);
  },

  // 8. Dynamic Coding Challenges Generator
  generateCodingChallenge: async (topic, difficulty) => {
    const prompt = `Generate a unique, creative programming challenge on the topic '${topic}' at difficulty level '${difficulty}'.
    Provide the response in the following JSON format:
    {
      "title": "Problem Title",
      "description": "Clear, markdown-compatible problem description",
      "inputFormat": "Input specification",
      "outputFormat": "Output specification",
      "constraints": "Constraints, e.g. 1 <= N <= 10^5",
      "examples": [
        {
          "input": "Example Input",
          "output": "Example Output",
          "explanation": "Brief explanation of the example"
        }
      ],
      "testCases": [
        {
          "input": "Sample testcase 1 input",
          "output": "Sample testcase 1 output",
          "isSample": true
        },
        {
          "input": "Sample testcase 2 input",
          "output": "Sample testcase 2 output",
          "isSample": true
        }
      ],
      "hiddenTestCases": [
        {
          "input": "Hidden testcase 1 input",
          "output": "Hidden testcase 1 output"
        },
        {
          "input": "Hidden testcase 2 input",
          "output": "Hidden testcase 2 output"
        },
        {
          "input": "Hidden testcase 3 input",
          "output": "Hidden testcase 3 output"
        }
      ],
      "starterCode": [
        { "language": "javascript", "code": "function solve(input) {\\n  // Write your code here\\n  return \\"\\";\\n}" },
        { "language": "python", "code": "def solve(input_str):\\n    # Write your code here\\n    return \\"\\"" },
        { "language": "java", "code": "import java.util.*;\\n\\npublic class Solution {\\n    public static String solve(String input) {\\n        // Write your code here\\n        return \\"\\";\\n    }\\n}" },
        { "language": "cpp", "code": "#include <iostream>\\n#include <string>\\nusing namespace std;\\n\\nstring solve(string input) {\\n    // Write your code here\\n    return \\"\\";\\n}" },
        { "language": "c", "code": "#include <stdio.h>\\n#include <string.h>\\n\\nvoid solve(char* input, char* output) {\\n    // Write your code here\\n}" }
      ]
    }`;

    const system = "You are an elite developer recruitment challenge setter. Build a high-quality, solvable coding puzzle. Always return valid JSON.";
    const result = await callGeminiJson(prompt, system);
    
    if (result && result.title && result.description) {
      return result;
    }
    
    throw new Error(`Failed to generate coding challenge via Gemini for ${topic} (${difficulty})`);
  },

  // 9. AI Code evaluator
  evaluateCodeSubmission: async (title, description, language, code, testCasesResults) => {
    const prompt = `Perform a static analysis and quality review of the candidate's code submission.
    Challenge Title: '${title}'
    Description: '${description}'
    Language: '${language}'
    Candidate Code:
    \`\`\`${language}
    ${code}
    \`\`\`
    Execution Test Cases Results:
    ${JSON.stringify(testCasesResults)}

    Evaluate the following dimensions:
    - Code Quality and readability
    - Time Complexity
    - Space Complexity
    - Optimization opportunities
    - Best practices compliance
    
    Provide the response in the following JSON format:
    {
      "score": 0 to 100 integer (score reflecting correctness + quality),
      "feedback": "Coaching feedback summary paragraph",
      "timeComplexity": "Big O notation",
      "spaceComplexity": "Big O notation",
      "improvements": ["improvement suggestions 1", "improvement suggestions 2"],
      "rating": "Excellent" | "Good" | "Average" | "Poor"
    }`;

    const system = "You are a Senior Principal Software Engineer and Technical Interviewer. Be thorough and constructive. Always return valid JSON.";
    const result = await callGeminiJson(prompt, system);
    
    if (result && result.score !== undefined) {
      return result;
    }

    // Heuristic Fallback
    const allPassed = testCasesResults.allPassed;
    const ratio = testCasesResults.passedCases / (testCasesResults.totalCases || 1);
    return {
      score: allPassed ? 92 : Math.round(ratio * 75),
      feedback: allPassed
        ? "Excellent job! The code is clean and passes all test cases."
        : "Your solution compiles but fails some test cases. Review border cases and index boundaries.",
      timeComplexity: "O(N)",
      spaceComplexity: "O(N)",
      improvements: [
        "Optimize loops to reduce time complexity.",
        "Include input checks to handle null or empty arguments."
      ],
      rating: allPassed ? "Excellent" : "Average"
    };
  },

  // 10. AI Study Recommendations Generator
  generateRecommendations: async (weakTopics) => {
    const prompt = `The candidate has weak performance in the following topics: [${weakTopics.join(", ")}].
    Provide the response in the following JSON format:
    {
      "guidance": "Detailed strategic advice explaining how they can reinforce these concepts.",
      "recommendedTopics": [
        {
          "topic": "Topic Name",
          "description": "Short explanation of what to practice"
        }
      ]
    }`;

    const system = "You are an AI career recommendations planner. Always return valid JSON.";
    const result = await callGeminiJson(prompt, system);
    
    if (result && result.recommendedTopics) {
      return result;
    }
    
    return {
      guidance: `Focus on mastering the fundamentals of ${weakTopics.join(", ")}. Take more practice quizzes and review solutions step-by-step.`,
      recommendedTopics: weakTopics.map((t) => ({
        topic: t,
        description: `Practice basic and advanced questions in ${t}.`
      }))
    };
  }
};
