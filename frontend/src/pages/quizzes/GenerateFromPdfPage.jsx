import { useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { quizzesApi } from '../../api';
import { Layout } from '../../components/layout/Layout';
import { Card, CardBody } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Alert } from '../../components/ui/Alert';

export default function GenerateFromPdfPage() {
  const { quizId } = useParams();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [file, setFile] = useState(null);
  const [generating, setGenerating] = useState(false);
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [questions, setQuestions] = useState(null);
  // Track which questions are selected (all selected by default after generation)
  const [selected, setSelected] = useState({});

  const handleFileChange = (e) => {
    const f = e.target.files?.[0];
    if (f && f.type !== 'application/pdf') {
      setError('Please select a PDF file.');
      setFile(null);
      return;
    }
    setError('');
    setFile(f || null);
    setQuestions(null);
    setSuccess('');
  };

  const handleGenerate = async (e) => {
    e.preventDefault();
    if (!file) { setError('Please choose a PDF file first.'); return; }
    setError('');
    setSuccess('');
    setGenerating(true);
    try {
      const formData = new FormData();
      formData.append('pdf', file);
      const res = await quizzesApi.generateFromPdf(quizId, formData);
      const qs = res.data.data.questions;
      setQuestions(qs);
      // Select all by default
      const sel = {};
      qs.forEach((_, i) => { sel[i] = true; });
      setSelected(sel);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to generate questions. Check that OPENAI_API_KEY is configured.');
    } finally {
      setGenerating(false);
    }
  };

  const toggleSelect = (idx) => {
    setSelected((s) => ({ ...s, [idx]: !s[idx] }));
  };

  const handleAddToQuiz = async () => {
    const toAdd = questions.filter((_, i) => selected[i]);
    if (toAdd.length === 0) { setError('Select at least one question to add.'); return; }
    setError('');
    setAdding(true);
    try {
      for (const q of toAdd) {
        await quizzesApi.addQuestion(quizId, {
          questionText: q.questionText,
          questionType: 'multiple_choice',
          points: q.points || 1,
          options: q.options,
        });
      }
      setSuccess(`${toAdd.length} question${toAdd.length !== 1 ? 's' : ''} added to the quiz!`);
      setQuestions(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add some questions.');
    } finally {
      setAdding(false);
    }
  };

  return (
    <Layout>
      <div className="mx-auto max-w-2xl space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">🤖 Generate Questions from PDF</h1>
          <Button variant="secondary" onClick={() => navigate(`/quizzes/${quizId}/manage`)}>
            ← Back to Quiz
          </Button>
        </div>

        {error && <Alert type="error">{error}</Alert>}
        {success && <Alert type="success">{success}</Alert>}

        {/* Upload form */}
        <Card>
          <CardBody className="space-y-4">
            <p className="text-sm text-gray-600">
              Upload a PDF (lecture notes, textbook chapter, etc.) and the AI will generate
              5 multiple-choice questions you can add to your quiz.
            </p>
            <form onSubmit={handleGenerate} className="space-y-4">
              <div
                className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-indigo-400 transition-colors"
                onClick={() => fileInputRef.current?.click()}
              >
                {file ? (
                  <p className="text-sm font-medium text-indigo-700">📄 {file.name}</p>
                ) : (
                  <>
                    <p className="text-3xl mb-2">📄</p>
                    <p className="text-sm text-gray-500">Click to choose a PDF file</p>
                    <p className="text-xs text-gray-400 mt-1">Max 10 MB</p>
                  </>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="application/pdf"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </div>
              <Button type="submit" loading={generating} disabled={!file} className="w-full">
                {generating ? 'Generating…' : '✨ Generate Questions'}
              </Button>
            </form>
          </CardBody>
        </Card>

        {/* Preview generated questions */}
        {questions && questions.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">
                Generated Questions ({questions.length})
              </h2>
              <p className="text-sm text-gray-500">
                {Object.values(selected).filter(Boolean).length} selected
              </p>
            </div>

            {questions.map((q, idx) => (
              <Card
                key={idx}
                className={`cursor-pointer transition-colors ${
                  selected[idx] ? 'ring-2 ring-indigo-500' : 'opacity-60'
                }`}
                onClick={() => toggleSelect(idx)}
              >
                <CardBody className="space-y-3">
                  <div className="flex items-start gap-3">
                    <input
                      type="checkbox"
                      checked={!!selected[idx]}
                      onChange={() => toggleSelect(idx)}
                      onClick={(e) => e.stopPropagation()}
                      className="mt-1 accent-indigo-600 flex-shrink-0"
                    />
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-medium text-gray-900 flex-1">{q.questionText}</p>
                        <Badge color="indigo">MCQ</Badge>
                        <Badge color="gray">{q.points || 1} pt</Badge>
                      </div>
                      <ul className="space-y-1 ml-1">
                        {q.options?.map((opt, oi) => (
                          <li
                            key={oi}
                            className={`text-sm flex items-center gap-2 ${
                              opt.isCorrect ? 'text-green-700 font-medium' : 'text-gray-600'
                            }`}
                          >
                            <span>{opt.isCorrect ? '✅' : '○'}</span>
                            {opt.optionText}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </CardBody>
              </Card>
            ))}

            <div className="flex gap-3">
              <Button onClick={handleAddToQuiz} loading={adding}>
                Add Selected to Quiz
              </Button>
              <Button variant="secondary" onClick={() => navigate(`/quizzes/${quizId}/manage`)}>
                Done
              </Button>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
