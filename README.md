# PrepMaster AI —Placement Preparation Ecosystem

PrepMaster AI is an enterprise-grade, placement preparation platform helping candidates crack placements, coding rounds, aptitude exams, and mock interviews using Google Gemini AI.

---

## 🚀 Key Features

- **Resume SWOT Scan**: ATS score evaluator pointing out missing skill tags, strengths, and formatting recommendations.
- **AI Interview Arena**: Role-specific mock interviews with speech grading and coaching critique summaries.
- **LeetCode Coding Suite**: Interactive Monaco Editor executing candidate submissions against pre-configured test cases.
- **Timed MCQ Portal**: Aptitude and Core CS subject assessments featuring section timers and solution reviews.
- **AI Career Coach**: Interactive chat panel offering placement tips, and roadmap milestones advice.

---

## 🛠️ Architecture and Tech Stack

```
PrepMaster-AI/
├── client/                 # React 19 Frontend (Vite)
├── server/                 # Express Backend (Node.js)
├── docker/                 # Container Dockerfiles
└── docs/                   # API Documentation
```

### Stack
- **Client**: React 19, Vite, Tailwind CSS, Framer Motion, Zustand, Monaco Editor, Recharts.
- **Server**: Express.js, MongoDB Mongoose, JWT Authentications, Node Child Process Compiler.
- **AI Brain**: Google Gemini API (`gemini-1.5-flash` model).

---

## ⚙️ Local Setup Guide

### 1. Prerequisite Configuration
Create a `.env` configuration file inside `server/` pointing to your MongoDB host, SMTP, and Google Gemini API keys:
```env
PORT=5000
MONGODB_URI=your_mongodb_connection_uri
JWT_ACCESS_SECRET=long_secure_jwt_access_key
JWT_REFRESH_SECRET=long_secure_jwt_refresh_key
GEMINI_API_KEY=your_google_gemini_api_key
```

### 2. Run Backend Express Server
```bash
cd server
npm install
npm run dev
```

### 3. Run Frontend React Client
```bash
cd client
npm install
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 🐳 Docker Deployment

To launch the entire platform (MongoDB + Express Backend + React Frontend Nginx) in one command:
```bash
cd docker
docker-compose up --build
```
The React frontend client will be available at [http://localhost](http://localhost).
