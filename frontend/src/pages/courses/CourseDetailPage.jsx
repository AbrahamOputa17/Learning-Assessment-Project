import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { coursesApi, quizzesApi, codingApi } from '../../api';
import { useAuth } from '../../context/AuthContext';
import { Layout } from '../../components/layout/Layout';
import { Card, CardBody, CardHeader } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { PageSpinner } from '../../components/ui/Spinner';
import { Alert } from '../../components/ui/Alert';

export default function CourseDetailPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [quizzes, setQuizzes] = useState([]);
  const [codingQuizzes, setCodingQuizzes] = useState([]);
  const [myScores, setMyScores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    const load = async () => {
      try {
        const [cRes, qRes, cqRes] = await Promise.all([
          coursesApi.getById(id),
          quizzesApi.getByCourse(id).catch(() => ({ data: { data: { quizzes: [] } } })),
          codingApi.getQuizzesByCourse(id).catch(() => ({ data: { data: { quizzes: [] } } })),
        ]);
        setCourse(cRes.data.data.course);
        setQuizzes(qRes.data.data.quizzes || []);
        setCodingQuizzes(cqRes.data.data.quizzes || []);
        // fetch student's own coding scores (only for non-owners)
        const isOwnerLoad =
          user?.id === cRes.data.data.course?.instructor_id || user?.role === 'admin';
        if (!isOwnerLoad) {
          const scoresRes = await codingApi.getMyScores(id).catch(() => null);
          setMyScores(scoresRes?.data?.data?.scores || []);
        }
      } catch {
        navigate('/courses');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  const handleEnroll = async () => {
    setEnrolling(true);
    try {
      await coursesApi.enroll(id);
      setMessage({ type: 'success', text: 'Successfully enrolled!' });
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Enrollment failed' });
    } finally {
      setEnrolling(false);
    }
  };

  const handlePublishToggle = async () => {
    setPublishing(true);
    try {
      const res = await coursesApi.update(id, { is_published: !course.is_published });
      setCourse(res.data.data.course);
      setMessage({
        type: 'success',
        text: res.data.data.course.is_published ? 'Course published!' : 'Course unpublished.',
      });
    } catch {
      setMessage({ type: 'error', text: 'Failed to update publish status' });
    } finally {
      setPublishing(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Delete this course? This cannot be undone.')) return;
    try {
      await coursesApi.delete(id);
      navigate('/courses');
    } catch {
      setMessage({ type: 'error', text: 'Failed to delete course' });
    }
  };

  if (loading) return <Layout><PageSpinner /></Layout>;

  const isOwner =
    user?.id === course?.instructor_id ||
    user?.role === 'admin';

  const diffColor = { '100': 'green', '200': 'blue', '300': 'yellow', '400': 'red' };

  return (
    <Layout>
      <div className="space-y-6">
        {message.text && (
          <Alert type={message.type}>{message.text}</Alert>
        )}

        {/* Course header */}
        <Card>
          <CardBody className="space-y-4">
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div className="space-y-2 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  {course.level && (
                    <Badge color={diffColor[course.level] || 'gray'}>
                      {course.level} Level
                    </Badge>
                  )}
                  {course.category && <Badge color="indigo">{course.category}</Badge>}
                  {!course.is_published && <Badge color="yellow">Draft</Badge>}
                </div>
                <h1 className="text-2xl font-bold text-gray-900">{course.title}</h1>
                <p className="text-gray-500">Instructor: {course.instructor_name}</p>
                {course.description && (
                  <p className="text-gray-700 mt-2">{course.description}</p>
                )}
              </div>
              <div className="flex gap-2 flex-wrap">
                {isOwner ? (
                  <>
                    <Link to={`/courses/${id}/edit`}>
                      <Button variant="secondary">Edit Course</Button>
                    </Link>
                    <Button
                      variant="secondary"
                      onClick={handlePublishToggle}
                      loading={publishing}
                    >
                      {course.is_published ? 'Unpublish' : 'Publish'}
                    </Button>
                    <Button variant="danger" onClick={handleDelete}>Delete</Button>
                  </>
                ) : (
                  <Button onClick={handleEnroll} loading={enrolling}>
                    Enroll Now
                  </Button>
                )}
              </div>
            </div>
          </CardBody>
        </Card>

        {/* Quizzes */}
        <section>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">📝 Quizzes</h2>
            {isOwner && (
              <Link to={`/courses/${id}/quizzes/new`}>
                <Button size="sm">+ Add Quiz</Button>
              </Link>
            )}
          </div>
          {quizzes.length === 0 ? (
            <p className="text-sm text-gray-400">No quizzes yet.</p>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2">
              {quizzes.map((q) => (
                <Link key={q.id} to={isOwner ? `/quizzes/${q.id}/manage` : `/quizzes/${q.id}`}>
                  <Card className="hover:shadow-md transition-shadow">
                    <CardBody className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-900">{q.title}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          {q.question_count || 0} questions
                          {q.time_limit ? ` · ${q.time_limit} min` : ''}
                        </p>
                      </div>
                      {!q.is_published && <Badge color="yellow">Draft</Badge>}
                    </CardBody>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </section>

        {/* Coding Quizzes */}
        <section>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">💻 Coding Challenges</h2>
            {isOwner && (
              <Link to={`/courses/${id}/coding/new`}>
                <Button size="sm">+ Add Coding Quiz</Button>
              </Link>
            )}
          </div>
          {codingQuizzes.length === 0 ? (
            <p className="text-sm text-gray-400">No coding challenges yet.</p>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2">
              {codingQuizzes.map((q) => (
                <Link key={q.id} to={`/coding/${q.id}`}>
                  <Card className="hover:shadow-md transition-shadow">
                    <CardBody className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-900">{q.title}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          {q.question_count || 0} problems
                          {q.time_limit ? ` · ${q.time_limit} min` : ''}
                        </p>
                      </div>
                      {!q.is_published && <Badge color="yellow">Draft</Badge>}
                    </CardBody>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </section>
        {/* My Coding Scores (students only) */}
        {!isOwner && myScores.length > 0 && (
          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">📊 My Progress</h2>
            <Card>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-100 text-left text-xs text-gray-500 uppercase tracking-wide">
                      <th className="px-4 py-3">Problem</th>
                      <th className="px-4 py-3 text-right">Raw Score</th>
                      <th className="px-4 py-3 text-right">Final Score</th>
                      <th className="px-4 py-3 text-right">CA Contribution</th>
                    </tr>
                  </thead>
                  <tbody>
                    {myScores.map((s) => (
                      <tr key={s.id} className="border-b border-gray-50 hover:bg-gray-50">
                        <td className="px-4 py-3 font-medium text-gray-900">{s.question_title}</td>
                        <td className="px-4 py-3 text-right text-gray-600">
                          {Number(s.raw_score).toFixed(1)} / {s.question_points}
                        </td>
                        <td className="px-4 py-3 text-right text-gray-600">
                          {Number(s.final_score).toFixed(1)}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <Badge color={Number(s.ca_contribution) > 0 ? 'indigo' : 'gray'}>
                            {Number(s.ca_contribution).toFixed(2)}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </section>
        )}
      </div>
    </Layout>
  );
}

