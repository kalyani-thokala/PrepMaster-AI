# PrepMaster AI REST API Documentation

All API requests expect JSON payloads in the body and return structured responses in the following standard format:

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Description of action",
  "data": { ... }
}
```

---

## 1. Authentication APIs

### Register User
- **Endpoint**: `POST /api/v1/auth/register`
- **Body**:
  ```json
  {
    "fullName": "Candidate Name",
    "email": "candidate@example.com",
    "password": "strongPassword123",
    "confirmPassword": "strongPassword123"
  }
  ```
- **Returns**: Graded user profile document.

### Login User
- **Endpoint**: `POST /api/v1/auth/login`
- **Body**:
  ```json
  {
    "email": "candidate@example.com",
    "password": "strongPassword123",
    "rememberMe": true
  }
  ```
- **Cookies set**: `accessToken` (HTTPOnly), `refreshToken` (HTTPOnly).

### Refresh Session
- **Endpoint**: `POST /api/v1/auth/refresh-token`
- **Headers/Body**: Optional `refreshToken` payload if cookies are blocked.
- **Returns**: Rotated access/refresh keys.

---

## 2. Resume SWOT Optimization

### Scan Resume File
- **Endpoint**: `POST /api/v1/resumes/analyze`
- **Content-Type**: `multipart/form-data`
- **Form-Data**: File field `resume` (PDF or DOCX file, limit 5MB).
- **Returns**: Detailed ATS match and suggestions:
  ```json
  {
    "score": 85,
    "atsScore": 82,
    "strengths": ["Clear metrics"],
    "weaknesses": ["Lack of certifications"],
    "missingSkills": ["Docker"],
    "suggestions": ["Add credentials tags"]
  }
  ```

---

## 3. Assessments & Mock Exams

### Generate Questions Exam
- **Endpoint**: `POST /api/v1/assessments/generate`
- **Body**:
  ```json
  {
    "category": "Quantitative Aptitude",
    "difficulty": "Medium"
  }
  ```
- **Returns**: Clean exam sheet containing questions and options (answers are stripped on output for security).

### Grade Submitted Exam
- **Endpoint**: `POST /api/v1/assessments/submit`
- **Body**:
  ```json
  {
    "assessmentId": "assessment_mongo_id",
    "userAnswers": [
      { "questionIndex": 0, "selectedOption": "Option A" }
    ]
  }
  ```

---

## 4. Coding Practise Arena

### Get Practise Challenges
- **Endpoint**: `GET /api/v1/coding-challenges`
- **Query Params**: `difficulty`, `topic` (optional filtering).

### Run Submission Code
- **Endpoint**: `POST /api/v1/coding-challenges/:id/run`
- **Body**:
  ```json
  {
    "language": "javascript",
    "code": "function solve(input) { return '[0,1]'; }"
  }
  ```
- **Returns**: Sandbox execution status, runtime elapsed, stdout, stderr, and test case matches.
