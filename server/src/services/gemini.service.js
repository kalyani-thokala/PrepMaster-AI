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
  }
};
