import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { coursesApi, quizzesApi } from '../api';
import { Layout } from '../components/layout/Layout';
import { Card, CardBody } from '../components/ui/Card';
import { PageSpinner } from '../components/ui/Spinner';
import { Badge } from '../components/ui/Badge';

export default function DashboardPage() {
  const { user } = useAuth();
  const [data, setData] = useState({ courses: [], loading: true });

  useEffect(() => {
    const load = async () => {
      try {
        if (user?.role === 'instructor' || user?.role === 'admin') {
          const res = await coursesApi.getMine();
          setData({ courses: res.data.data.courses, loading: false });
        } else {
          const res = await coursesApi.getEnrolled();
          setData({ courses: res.data.data.courses, loading: false });
        }
      } catch {
        setData({ courses: [], loading: false });
      }
    };
    if (user) load();
  }, [user]);

  const isInstructor = user?.role === 'instructor' || user?.role === 'admin';

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Welcome back, {user?.name?.split(' ')[0]} 👋
          </h1>
          <p className="mt-1 text-gray-500">
            {isInstructor
              ? 'Manage your courses and track student progress'
              : 'Continue your learning journey'}
          </p>
        </div>

        {/* Quick stats */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <StatCard
            label={isInstructor ? 'My Courses' : 'Enrolled Courses'}
            value={data.courses.length}
            icon="📚"
            color="indigo"
          />
          <StatCard label="Role" value={capitalize(user?.role)} icon="🎓" color="purple" />
          <StatCard label="Status" value="Active" icon="✅" color="green" />
        </div>

        {/* Courses */}
        <div>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">
              {isInstructor ? 'Your Courses' : 'Enrolled Courses'}
            </h2>
            <div className="flex gap-2">
              <Link
                to="/courses"
                className="text-sm text-indigo-600 hover:text-indigo-500 font-medium"
              >
                Browse all →
              </Link>
              {isInstructor && (
                <Link
                  to="/courses/new"
                  className="text-sm text-indigo-600 hover:text-indigo-500 font-medium ml-4"
                >
                  + Create Course
                </Link>
              )}
            </div>
          </div>

          {data.loading ? (
            <PageSpinner />
          ) : data.courses.length === 0 ? (
            <EmptyState isInstructor={isInstructor} />
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {data.courses.map((course) => (
                <CourseCard key={course.id} course={course} />
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}

function StatCard({ label, value, icon, color }) {
  const colors = {
    indigo: 'bg-indigo-50 text-indigo-600',
    purple: 'bg-purple-50 text-purple-600',
    green: 'bg-green-50 text-green-600',
  };
  return (
    <Card>
      <CardBody className="flex items-center gap-4">
        <div className={`flex h-12 w-12 items-center justify-center rounded-xl text-xl ${colors[color]}`}>
          {icon}
        </div>
        <div>
          <p className="text-sm text-gray-500">{label}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
        </div>
      </CardBody>
    </Card>
  );
}

function CourseCard({ course }) {
  const diffColor = {
    '100': 'green',
    '200': 'blue',
    '300': 'yellow',
    '400': 'red',
  };
  return (
    <Link to={`/courses/${course.id}`}>
      <Card className="hover:shadow-md transition-shadow h-full">
        <CardBody className="space-y-3">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-semibold text-gray-900 line-clamp-2">{course.title}</h3>
            {course.level && (
              <Badge color={diffColor[course.level] || 'gray'}>
                {course.level} Level
              </Badge>
            )}
          </div>
          {course.description && (
            <p className="text-sm text-gray-500 line-clamp-2">{course.description}</p>
          )}
          <p className="text-xs text-gray-400">by {course.instructor_name}</p>
        </CardBody>
      </Card>
    </Link>
  );
}

function EmptyState({ isInstructor }) {
  return (
    <Card>
      <CardBody className="py-12 text-center">
        <p className="text-4xl mb-3">📚</p>
        <p className="text-gray-500">
          {isInstructor
            ? "You haven't created any courses yet."
            : "You haven't enrolled in any courses yet."}
        </p>
        <div className="mt-4">
          <Link
            to={isInstructor ? '/courses/new' : '/courses'}
            className="text-indigo-600 hover:text-indigo-500 font-medium text-sm"
          >
            {isInstructor ? 'Create your first course →' : 'Browse courses →'}
          </Link>
        </div>
      </CardBody>
    </Card>
  );
}

function capitalize(s) {
  return s ? s.charAt(0).toUpperCase() + s.slice(1) : '';
}
