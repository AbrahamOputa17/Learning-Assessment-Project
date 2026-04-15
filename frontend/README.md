# LearnAssess Frontend

React 18 + Vite + Tailwind CSS frontend for the Learning Assessment System.

## Tech Stack

- **Framework**: React 18
- **Build tool**: Vite 6
- **Styling**: Tailwind CSS v4
- **Routing**: React Router v6
- **HTTP client**: Axios

## Setup

```bash
cd frontend
npm install
npm run dev
```

App opens at **http://localhost:3000**. API calls proxy to `http://localhost:5000`.

## Pages & Routes

| Path | Page | Auth |
|------|------|------|
| `/login` | Login | Public |
| `/register` | Register | Public |
| `/` | Dashboard | Any |
| `/courses` | Course list | Any |
| `/courses/:id` | Course detail | Any |
| `/courses/new` | Create course | Instructor |
| `/quizzes/:quizId` | Take quiz | Any |
| `/courses/:courseId/quizzes/new` | Create quiz | Instructor |
| `/coding/:quizId` | Coding quiz problems | Any |
| `/coding/questions/:questionId` | Code editor | Any |
| `/courses/:courseId/coding/new` | Create coding quiz | Instructor |
| `/coding/:quizId/add-question` | Add coding problem | Instructor |
| `/profile` | Profile & settings | Any |
