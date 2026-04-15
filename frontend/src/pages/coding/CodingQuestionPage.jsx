import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { codingApi } from '../../api';
import { Layout } from '../../components/layout/Layout';
import { Card, CardBody } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Select } from '../../components/ui/Input';
import { PageSpinner } from '../../components/ui/Spinner';
import { Alert } from '../../components/ui/Alert';

const STARTER = {
  javascript: '// Write your solution here\nfunction solution() {\n  \n}\n',
  python: '# Write your solution here\ndef solution():\n    pass\n',
};

export default function CodingQuestionPage() {
  const { questionId } = useParams();
  const [question, setQuestion] = useState(null);
  const [loading, setLoading] = useState(true);
  const [code, setCode] = useState('');
  const [language, setLanguage] = useState('javascript');
  const [submitting, setSubmitting] = useState(false);
  const [submission, setSubmission] = useState(null);
  const [error, setError] = useState('');
  const [history, setHistory] = useState([]);

  useEffect(() => {
    const load = async () => {
      try {
        const [qRes, hRes] = await Promise.all([
          codingApi.getQuestion(questionId),
          codingApi
            .getSubmissionHistory(questionId)
            .catch(() => ({ data: { data: { submissions: [] } } })),
        ]);
        const q = qRes.data.data.question;
        setQuestion(q);
        setLanguage(q.language || 'javascript');
        setCode(q.starter_code || STARTER[q.language] || STARTER.javascript);
        setHistory(hRes.data.data.submissions || []);
      } catch {
        // ignore
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [questionId]);

  const handleSubmit = async () => {
    setSubmitting(true);
    setError('');
    setSubmission(null);
    try {
      const res = await codingApi.submitCode({
        codingQuestionId: questionId,
        code,
        language,
      });
      setSubmission(res.data.data.submission);
      // refresh history
      codingApi
        .getSubmissionHistory(questionId)
        .then((r) => setHistory(r.data.data.submissions || []));
    } catch (err) {
      setError(err.response?.data?.message || 'Submission failed');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <Layout><PageSpinner /></Layout>;

  const diffColor = { easy: 'green', medium: 'yellow', hard: 'red' };
  const statusColor = {
    accepted: 'green',
    wrong_answer: 'red',
    error: 'red',
    pending: 'yellow',
    running: 'yellow',
    timeout: 'red',
  };

  const passedCount =
    submission?.test_results?.filter((t) => t.passed).length ?? 0;
  const totalCount = submission?.test_results?.length ?? 0;

  return (
    <Layout>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Problem description */}
        <div className="space-y-4">
          <Card>
            <CardBody className="space-y-3">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl font-bold text-gray-900 flex-1">{question.title}</h1>
                {question.difficulty && (
                  <Badge color={diffColor[question.difficulty] || 'gray'}>
                    {capitalize(question.difficulty)}
                  </Badge>
                )}
                <Badge color="indigo">{question.points} pts</Badge>
              </div>
              <div
                className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed"
              >
                {question.description}
              </div>
            </CardBody>
          </Card>

          {/* Sample test cases */}
          {question.test_cases?.length > 0 && (
            <Card>
              <CardBody>
                <h2 className="font-semibold text-gray-800 mb-3">Sample Test Cases</h2>
                <div className="space-y-3">
                  {question.test_cases.map((tc, i) => (
                    <div key={tc.id} className="rounded-lg bg-gray-50 p-3 text-sm font-mono">
                      <p className="text-gray-500 text-xs mb-1">Test {i + 1}</p>
                      {tc.input && (
                        <p><span className="text-gray-400">Input: </span>{tc.input}</p>
                      )}
                      <p>
                        <span className="text-gray-400">Expected: </span>
                        {tc.expected_output}
                      </p>
                    </div>
                  ))}
                </div>
              </CardBody>
            </Card>
          )}

          {/* Submission history */}
          {history.length > 0 && (
            <Card>
              <CardBody>
                <h2 className="font-semibold text-gray-800 mb-3">Submission History</h2>
                <div className="space-y-1">
                  {history.slice(0, 5).map((s) => (
                    <div key={s.id} className="flex items-center justify-between text-sm">
                      <span className="text-gray-500 text-xs">
                        {new Date(s.submitted_at).toLocaleString()}
                      </span>
                      <Badge color={statusColor[s.status] || 'gray'}>
                        {s.status.replace('_', ' ').toUpperCase()}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardBody>
            </Card>
          )}
        </div>

        {/* Code editor */}
        <div className="space-y-4">
          <Card>
            <CardBody className="space-y-3">
              <div className="flex items-center justify-between gap-3">
                <h2 className="font-semibold text-gray-800">Your Code</h2>
                <Select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="w-36"
                >
                  <option value="javascript">JavaScript</option>
                  <option value="python">Python</option>
                </Select>
              </div>
              <textarea
                className="w-full rounded-lg border border-gray-300 bg-gray-900 text-green-400 font-mono text-sm px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                rows={18}
                value={code}
                onChange={(e) => setCode(e.target.value)}
                spellCheck={false}
                placeholder="Write your code here..."
              />
              {error && <Alert type="error">{error}</Alert>}
              <Button
                onClick={handleSubmit}
                loading={submitting}
                className="w-full"
                size="lg"
              >
                ▶ Run & Submit
              </Button>
            </CardBody>
          </Card>

          {/* Results */}
          {submission && (
            <Card>
              <CardBody className="space-y-3">
                <div className="flex items-center justify-between">
                  <h2 className="font-semibold text-gray-800">Results</h2>
                  <Badge color={statusColor[submission.status] || 'gray'}>
                    {submission.status.replace('_', ' ').toUpperCase()}
                  </Badge>
                </div>
                {submission.execution_time_ms != null && (
                  <p className="text-sm text-gray-500">
                    Execution time: {submission.execution_time_ms}ms
                  </p>
                )}
                {totalCount > 0 && (
                  <p className="text-sm text-gray-700">
                    Tests passed:{' '}
                    <strong className={passedCount === totalCount ? 'text-green-600' : 'text-red-600'}>
                      {passedCount} / {totalCount}
                    </strong>
                  </p>
                )}
                {submission.error_message && (
                  <Alert type="error">
                    <pre className="text-xs whitespace-pre-wrap">{submission.error_message}</pre>
                  </Alert>
                )}
                <div className="space-y-2">
                  {submission.test_results?.map((t, i) => (
                    <div
                      key={i}
                      className={`rounded-lg p-3 text-xs font-mono ${
                        t.passed ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <span>{t.passed ? '✅' : '❌'}</span>
                        <span className="font-semibold">Test {i + 1}</span>
                      </div>
                      {t.input && t.input !== '[hidden]' && (
                        <p className="text-gray-600">Input: {t.input}</p>
                      )}
                      {t.expectedOutput && t.expectedOutput !== '[hidden]' && (
                        <p className="text-gray-600">Expected: {t.expectedOutput}</p>
                      )}
                      {t.actualOutput && t.actualOutput !== '[hidden]' && !t.passed && (
                        <p className="text-red-600">Got: {t.actualOutput}</p>
                      )}
                      {t.error && (
                        <p className="text-red-600">Error: {t.error}</p>
                      )}
                    </div>
                  ))}
                </div>
              </CardBody>
            </Card>
          )}
        </div>
      </div>
    </Layout>
  );
}

function capitalize(s) {
  return s ? s.charAt(0).toUpperCase() + s.slice(1) : '';
}
