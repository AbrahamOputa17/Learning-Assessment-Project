import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../ui/Button';

export function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="sticky top-0 z-40 bg-white border-b border-gray-200">
      <div className="mx-auto flex h-16 max-w-screen-xl items-center justify-between px-4">
        <Link to="/" className="flex items-center gap-2 font-bold text-indigo-600 text-lg">
          <span className="text-2xl">🎓</span>
          <span>LearnAssess</span>
        </Link>

        {user && (
          <div className="flex items-center gap-4">
            <Link
              to="/courses"
              className="text-sm text-gray-600 hover:text-indigo-600 transition-colors"
            >
              Courses
            </Link>
            {user.role === 'instructor' || user.role === 'admin' ? (
              <Link
                to="/courses/new"
                className="text-sm text-gray-600 hover:text-indigo-600 transition-colors"
              >
                Create Course
              </Link>
            ) : null}
            <Link
              to="/profile"
              className="flex items-center gap-2 text-sm text-gray-600 hover:text-indigo-600 transition-colors"
            >
              <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-semibold text-xs">
                {user.name?.[0]?.toUpperCase()}
              </div>
              <span className="hidden sm:inline">{user.name}</span>
            </Link>
            <Button variant="secondary" size="sm" onClick={handleLogout}>
              Sign out
            </Button>
          </div>
        )}
      </div>
    </nav>
  );
}
