import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { coursesApi } from '../../api';
import { useAuth } from '../../context/AuthContext';
import { Layout } from '../../components/layout/Layout';
import { Card, CardBody } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Input, Select } from '../../components/ui/Input';
import { PageSpinner } from '../../components/ui/Spinner';

export default function CoursesPage() {
  const { user } = useAuth();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ category: '', difficulty: '' });

  const load = async () => {
    setLoading(true);
    try {
      const params = {};
      if (filters.category) params.category = filters.category;
      if (filters.difficulty) params.difficulty = filters.difficulty;
      const res = await coursesApi.getAll(params);
      setCourses(res.data.data.courses);
    } catch {
      setCourses([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    load();
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">All Courses</h1>
          {(user?.role === 'instructor' || user?.role === 'admin') && (
            <Link to="/courses/new">
              <Button>+ New Course</Button>
            </Link>
          )}
        </div>

        {/* Filters */}
        <form onSubmit={handleSearch} className="flex gap-3 flex-wrap">
          <Input
            placeholder="Category..."
            value={filters.category}
            onChange={(e) => setFilters((f) => ({ ...f, category: e.target.value }))}
            className="w-44"
          />
          <Select
            value={filters.difficulty}
            onChange={(e) => setFilters((f) => ({ ...f, difficulty: e.target.value }))}
            className="w-44"
          >
            <option value="">All levels</option>
            <option value="100">100 Level</option>
            <option value="200">200 Level</option>
            <option value="300">300 Level</option>
            <option value="400">400 Level</option>
          </Select>
          <Button type="submit" variant="secondary">Filter</Button>
        </form>

        {loading ? (
          <PageSpinner />
        ) : courses.length === 0 ? (
          <Card>
            <CardBody className="py-12 text-center">
              <p className="text-4xl mb-3">🔍</p>
              <p className="text-gray-500">No courses found.</p>
            </CardBody>
          </Card>
        ) : (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {courses.map((c) => (
              <CourseCard key={c.id} course={c} />
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}

const diffColor = { '100': 'green', '200': 'blue', '300': 'yellow', '400': 'red' };

function CourseCard({ course }) {
  return (
    <Link to={`/courses/${course.id}`}>
      <Card className="hover:shadow-md transition-shadow h-full flex flex-col">
        <CardBody className="flex flex-col gap-3 flex-1">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-semibold text-gray-900 line-clamp-2 flex-1">{course.title}</h3>
            {course.difficulty && (
              <Badge color={diffColor[course.difficulty] || 'gray'}>
                {capitalize(course.difficulty)}
              </Badge>
            )}
          </div>
          {course.category && (
            <Badge color="indigo">{course.category}</Badge>
          )}
          {course.description && (
            <p className="text-sm text-gray-500 line-clamp-3 flex-1">{course.description}</p>
          )}
          <p className="text-xs text-gray-400 mt-auto">by {course.instructor_name}</p>
        </CardBody>
      </Card>
    </Link>
  );
}

function capitalize(s) {
  return s ? s.charAt(0).toUpperCase() + s.slice(1) : '';
}
