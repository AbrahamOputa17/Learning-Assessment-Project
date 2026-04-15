import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { quizzesApi } from '../../api';
import { Layout } from '../../components/layout/Layout';
import { Card, CardBody } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { PageSpinner } from '../../components/ui/Spinner';
import { Alert } from '../../components/ui/Alert';

export default function TakeQuizPage() {
  const { quizId } = useParams();
  const navigate = useNavigate();
  const [state, setState] = useState('loading'); // loading | info | taking | results
  const [quiz, setQuiz] = useState(null);
  const [attempt, setAttempt] = useState(null);
  const [answers, setAnswers] = useState({});
  const [result, setResult] = useState(null);
  const [history, setHistory] = useState([]);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const [qRes, hRes] = await Promise.all([
          quizzesApi.getById(quizId),
          quizzesApi.getAttemptHistory(quizId).catch(() => ({ data: { data: { attempts: [] } } })),
        ]);
        setQuiz(qRes.data.data.quiz);
        setHistory(hRes.data.data.attempts || []);
        setState('info');
      } catch {
        navigate(-1);
      }
    };
    load();
  }, [quizId]);

  const handleStart = async () => {
    setError('');
    try {
      const res = await quizzesApi.startAttempt(quizId);
      setAttempt(res.data.data.attempt);
      setAnswers({});
      setState('taking');
    } catch (err) {
      setError(err.response?.data?.message || 'Could not start quiz');
    }
  };

  const handleAnswer = (questionId, value) => {
    setAnswers((a) => ({ ...a, [questionId]: value }));
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    setError('');
    try {
      const answersPayload = quiz.questions.map((q) => {
        const val = answers[q.id];
        if (q.question_type === 'short_answer') {
          return { questionId: q.id, textAnswer: val || '' };
        }
        return { questionId: q.id, selectedOptionId: val };
      });
      const res = await quizzesApi.submitAttempt(attempt.id, { answers: answersPayload });
      setResult(res.data.data.attempt);
      setState('results');
    } catch (err) {
      setError(err.response?.data?.message || 'Submission failed');
    } finally {
      setSubmitting(false);
    }
  };

  if (state === 'loading') return <Layout><PageSpinner /></Layout>;

  if (state === 'info') {
    return (
      <Layout>
        <div className="mx-auto max-w-xl space-y-6">
          <Card>
            <CardBody className="space-y-4">
              <h1 className="text-2xl font-bold text-gray-900">{quiz.title}</h1>
              {quiz.description && <p className="text-gray-600">{quiz.description}</p>}
              <div className="flex flex-wrap gap-3 text-sm text-gray-500">
                {quiz.time_limit && <span>⏱ {quiz.time_limit} minutes</span>}
                <span>❓ {quiz.questions?.length || 0} questions</span>
                <span>🎯 Pass score: {quiz.pass_score}%</span>
                <span>🔁 Max attempts: {quiz.max_attempts}</span>
              </div>
              {error && <Alert type="error">{error}</Alert>}
              <Button size="lg" onClick={handleStart} className="w-full">
                Start Quiz
              </Button>
            </CardBody>
          </Card>

          {history.length > 0 && (
            <Card>
              <CardBody>
                <h2 className="font-semibold text-gray-800 mb-3">Previous Attempts</h2>
                <div className="space-y-2">
                  {history.map((a, i) => (
                    <div key={a.id} className="flex justify-between text-sm">
                      <span className="text-gray-600">Attempt {history.length - i}</span>
                      <span>
                        <Badge color={a.passed ? 'green' : 'red'}>
                          {a.score?.toFixed(1)}% — {a.passed ? 'Passed' : 'Failed'}
                        </Badge>
                      </span>
                    </div>
                  ))}
                </div>
              </CardBody>
            </Card>
          )}
        </div>
      </Layout>
    );
  }

  if (state === 'taking') {
    return (
      <Layout>
        <div className="mx-auto max-w-2xl space-y-5">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-bold text-gray-900">{quiz.title}</h1>
            <span className="text-sm text-gray-500">
              {Object.keys(answers).length} / {quiz.questions?.length} answered
            </span>
          </div>
          {error && <Alert type="error">{error}</Alert>}

          {quiz.questions?.map((q, idx) => (
            <Card key={q.id}>
              <CardBody className="space-y-3">
                <p className="font-medium text-gray-900">
                  <span className="text-indigo-600 mr-2">Q{idx + 1}.</span>
                  {q.question_text}
                </p>
                {q.question_type === 'short_answer' ? (
                  <textarea
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-y"
                    rows={3}
                    placeholder="Your answer..."
                    value={answers[q.id] || ''}
                    onChange={(e) => handleAnswer(q.id, e.target.value)}
                  />
                ) : (
                  <div className="space-y-2">
                    {q.options?.map((opt) => (
                      <label
                        key={opt.id}
                        className={`flex items-center gap-3 rounded-lg border p-3 cursor-pointer transition-colors ${
                          answers[q.id] === opt.id
                            ? 'border-indigo-500 bg-indigo-50'
                            : 'border-gray-200 hover:border-indigo-200'
                        }`}
                      >
                        <input
                          type="radio"
                          name={`q-${q.id}`}
                          value={opt.id}
                          checked={answers[q.id] === opt.id}
                          onChange={() => handleAnswer(q.id, opt.id)}
                          className="accent-indigo-600"
                        />
                        <span className="text-sm text-gray-800">{opt.option_text}</span>
                      </label>
                    ))}
                  </div>
                )}
              </CardBody>
            </Card>
          ))}

          <Button
            size="lg"
            onClick={handleSubmit}
            loading={submitting}
            className="w-full"
          >
            Submit Quiz
          </Button>
        </div>
      </Layout>
    );
  }

  // Results
  return (
    <Layout>
      <div className="mx-auto max-w-lg space-y-5 text-center">
        <div className="text-6xl">{result?.passed ? '🎉' : '😔'}</div>
        <h1 className="text-2xl font-bold text-gray-900">
          {result?.passed ? 'You Passed!' : 'Not Quite There Yet'}
        </h1>
        <Card>
          <CardBody className="space-y-3">
            <p className="text-4xl font-bold text-indigo-600">{result?.score?.toFixed(1)}%</p>
            <p className="text-gray-600">Pass score: {quiz.pass_score}%</p>
            <Badge color={result?.passed ? 'green' : 'red'} >
              {result?.passed ? 'PASSED' : 'FAILED'}
            </Badge>
          </CardBody>
        </Card>
        <div className="flex gap-3 justify-center">
          <Button onClick={() => setState('info')}>Try Again</Button>
          <Button variant="secondary" onClick={() => navigate(-1)}>Back to Course</Button>
        </div>
      </div>
    </Layout>
  );
}
