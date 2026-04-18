import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';

// Auth
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';

// Dashboard
import DashboardPage from './pages/DashboardPage';

// Courses
import CoursesPage from './pages/courses/CoursesPage';
import CourseDetailPage from './pages/courses/CourseDetailPage';
import CreateCoursePage from './pages/courses/CreateCoursePage';
import EditCoursePage from './pages/courses/EditCoursePage';

// Quizzes
import TakeQuizPage from './pages/quizzes/TakeQuizPage';
import CreateQuizPage from './pages/quizzes/CreateQuizPage';
import ManageQuizPage from './pages/quizzes/ManageQuizPage';
import AddQuestionPage from './pages/quizzes/AddQuestionPage';
import GenerateFromPdfPage from './pages/quizzes/GenerateFromPdfPage';

// Coding
import CodingQuizPage from './pages/coding/CodingQuizPage';
import CodingQuestionPage from './pages/coding/CodingQuestionPage';
import CreateCodingQuizPage from './pages/coding/CreateCodingQuizPage';
import AddCodingQuestionPage from './pages/coding/AddCodingQuestionPage';

// Profile
import ProfilePage from './pages/profile/ProfilePage';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Protected routes */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/courses"
            element={
              <ProtectedRoute>
                <CoursesPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/courses/new"
            element={
              <ProtectedRoute roles={['instructor', 'admin']}>
                <CreateCoursePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/courses/:id/edit"
            element={
              <ProtectedRoute roles={['instructor', 'admin']}>
                <EditCoursePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/courses/:id"
            element={
              <ProtectedRoute>
                <CourseDetailPage />
              </ProtectedRoute>
            }
          />

          {/* Quiz routes */}
          <Route
            path="/quizzes/:quizId"
            element={
              <ProtectedRoute>
                <TakeQuizPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/quizzes/:quizId/manage"
            element={
              <ProtectedRoute roles={['instructor', 'admin']}>
                <ManageQuizPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/quizzes/:quizId/add-question"
            element={
              <ProtectedRoute roles={['instructor', 'admin']}>
                <AddQuestionPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/quizzes/:quizId/generate-from-pdf"
            element={
              <ProtectedRoute roles={['instructor', 'admin']}>
                <GenerateFromPdfPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/courses/:courseId/quizzes/new"
            element={
              <ProtectedRoute roles={['instructor', 'admin']}>
                <CreateQuizPage />
              </ProtectedRoute>
            }
          />

          {/* Coding routes */}
          <Route
            path="/coding/:quizId"
            element={
              <ProtectedRoute>
                <CodingQuizPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/coding/questions/:questionId"
            element={
              <ProtectedRoute>
                <CodingQuestionPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/courses/:courseId/coding/new"
            element={
              <ProtectedRoute roles={['instructor', 'admin']}>
                <CreateCodingQuizPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/coding/:quizId/add-question"
            element={
              <ProtectedRoute roles={['instructor', 'admin']}>
                <AddCodingQuestionPage />
              </ProtectedRoute>
            }
          />

          {/* Profile */}
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            }
          />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
