import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { quizzesApi } from '../../api';
import { useAuth } from '../../context/AuthContext';
import { Layout } from '../../components/layout/Layout';
import { Card, CardBody } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { PageSpinner } from '../../components/ui/Spinner';
import { Alert } from '../../components/ui/Alert';

export default function ManageQuizPage() {
  const { quizId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(true);
  const [publishing, setPublishing] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    const load = () => {
      quizzesApi
        .getById(quizId)
        .then((res) => setQuiz(res.data.data.quiz))
        .catch(() => navigate(-1))
        .finally(() => setLoading(false));
    };
    load();
  }, [quizId, navigate]);

  const handlePublishToggle = async () => {
    setPublishing(true);
    setMessage({ type: '', text: '' });
    try {
      const res = await quizzesApi.update(quizId, { is_published: !quiz.is_published });
      setQuiz((q) => ({ ...q, is_published: res.data.data.quiz.is_published }));
      setMessage({
        type: 'success',
        text: res.data.data.quiz.is_published ? 'Quiz published!' : 'Quiz unpublished.',
      });
    } catch {
      setMessage({ type: 'error', text: 'Failed to update publish status.' });
    } finally {
      setPublishing(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Delete this quiz and all its questions? This cannot be undone.')) return;
    setDeleting(true);
    try {
      await quizzesApi.delete(quizId);
      navigate(-1);
    } catch {
      setMessage({ type: 'error', text: 'Failed to delete quiz.' });
      setDeleting(false);
    }
  };

  if (loading) return <Layout><PageSpinner /></Layout>;

  const typeLabel = { multiple_choice: 'MCQ', true_false: 'T/F', short_answer: 'Short' };

  return (
    <Layout>
      <div className="space-y-6">
        {message.text && <Alert type={message.type}>{message.text}</Alert>}

        {/* Header */}
        <Card>
          <CardBody className="space-y-3">
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div className="space-y-1 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  {quiz.is_published ? (
                    <Badge color="green">Published</Badge>
                  ) : (
                    <Badge color="yellow">Draft</Badge>
                  )}
                  {quiz.time_limit && (
                    <Badge color="gray">⏱ {quiz.time_limit} min</Badge>
                  )}
                  <Badge color="indigo">Pass: {quiz.pass_score}%</Badge>
                  <Badge color="gray">Max attempts: {quiz.max_attempts}</Badge>
                </div>
                <h1 className="text-2xl font-bold text-gray-900">{quiz.title}</h1>
                {quiz.description && (
                  <p className="text-gray-500">{quiz.description}</p>
                )}
              </div>
              <div className="flex gap-2 flex-wrap">
                <Button
                  variant="secondary"
                  onClick={handlePublishToggle}
                  loading={publishing}
                >
                  {quiz.is_published ? 'Unpublish' : 'Publish'}
                </Button>
                <Link to={`/quizzes/${quizId}/generate-from-pdf`}>
                  <Button variant="secondary">🤖 Generate from PDF</Button>
                </Link>
                <Link to={`/quizzes/${quizId}`}>
                  <Button variant="secondary">Preview (Take Quiz)</Button>
                </Link>
                <Button variant="danger" onClick={handleDelete} loading={deleting}>
                  Delete Quiz
                </Button>
              </div>
            </div>
          </CardBody>
        </Card>

        {/* Questions */}
        <div>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">
              ❓ Questions ({quiz.questions?.length || 0})
            </h2>
            <Link to={`/quizzes/${quizId}/add-question`}>
              <Button size="sm">+ Add Question</Button>
            </Link>
          </div>

          {quiz.questions?.length === 0 ? (
            <Card>
              <CardBody className="py-10 text-center">
                <p className="text-3xl mb-2">❓</p>
                <p className="text-gray-500">No questions yet. Add your first question!</p>
              </CardBody>
            </Card>
          ) : (
            <div className="space-y-3">
              {quiz.questions?.map((q, idx) => (
                <Card key={q.id}>
                  <CardBody className="space-y-3">
                    <div className="flex items-start gap-3">
                      <span className="text-indigo-600 font-bold text-lg min-w-[2rem]">
                        {idx + 1}.
                      </span>
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-medium text-gray-900 flex-1">
                            {q.question_text}
                          </p>
                          <Badge color="indigo">{typeLabel[q.question_type] || q.question_type}</Badge>
                          <Badge color="gray">{q.points} pt{q.points !== 1 ? 's' : ''}</Badge>
                        </div>
                        {q.options && q.options.length > 0 && (
                          <ul className="space-y-1 ml-1">
                            {q.options.map((opt) => (
                              <li
                                key={opt.id}
                                className={`text-sm flex items-center gap-2 ${
                                  opt.is_correct
                                    ? 'text-green-700 font-medium'
                                    : 'text-gray-600'
                                }`}
                              >
                                <span>{opt.is_correct ? '✅' : '○'}</span>
                                {opt.option_text}
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    </div>
                  </CardBody>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
