import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { codingApi } from '../../api';
import { useAuth } from '../../context/AuthContext';
import { Layout } from '../../components/layout/Layout';
import { Card, CardBody } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { PageSpinner } from '../../components/ui/Spinner';

export default function CodingQuizPage() {
  const { quizId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    codingApi
      .getQuiz(quizId)
      .then((res) => setQuiz(res.data.data.quiz))
      .catch(() => navigate(-1))
      .finally(() => setLoading(false));
  }, [quizId]);

  if (loading) return <Layout><PageSpinner /></Layout>;

  const isInstructor = user?.role === 'instructor' || user?.role === 'admin';
  const diffColor = { easy: 'green', medium: 'yellow', hard: 'red' };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{quiz.title}</h1>
            {quiz.description && (
              <p className="mt-1 text-gray-500">{quiz.description}</p>
            )}
          </div>
          {isInstructor && (
            <Link to={`/coding/${quizId}/add-question`}>
              <Button size="sm">+ Add Problem</Button>
            </Link>
          )}
        </div>

        {quiz.questions?.length === 0 ? (
          <Card>
            <CardBody className="py-12 text-center">
              <p className="text-3xl mb-2">💻</p>
              <p className="text-gray-500">No problems yet.</p>
            </CardBody>
          </Card>
        ) : (
          <div className="space-y-3">
            {quiz.questions?.map((q, idx) => (
              <Link key={q.id} to={`/coding/questions/${q.id}`}>
                <Card className="hover:shadow-md transition-shadow">
                  <CardBody className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <span className="text-indigo-600 font-bold text-lg">#{idx + 1}</span>
                      <div>
                        <p className="font-medium text-gray-900">{q.title}</p>
                        <p className="text-xs text-gray-500 mt-0.5">
                          {q.language} · {q.points} pts
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {q.deadline && (
                        <Badge color={new Date() > new Date(q.deadline) ? 'red' : 'gray'}>
                          {new Date() > new Date(q.deadline) ? '⏰ Overdue' : `Due ${new Date(q.deadline).toLocaleDateString()}`}
                        </Badge>
                      )}
                      {q.difficulty && (
                        <Badge color={diffColor[q.difficulty] || 'gray'}>
                          {capitalize(q.difficulty)}
                        </Badge>
                      )}
                      <span className="text-gray-300">→</span>
                    </div>
                  </CardBody>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}

function capitalize(s) {
  return s ? s.charAt(0).toUpperCase() + s.slice(1) : '';
}
