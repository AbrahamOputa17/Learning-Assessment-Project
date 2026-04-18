import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { quizzesApi } from '../../api';
import { Layout } from '../../components/layout/Layout';
import { Card, CardBody } from '../../components/ui/Card';
import { Input, Select, Textarea } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { Alert } from '../../components/ui/Alert';

const DEFAULT_OPTIONS = [
  { optionText: '', isCorrect: false },
  { optionText: '', isCorrect: false },
];

const TRUE_FALSE_OPTIONS = [
  { optionText: 'True', isCorrect: true },
  { optionText: 'False', isCorrect: false },
];

export default function AddQuestionPage() {
  const { quizId } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    questionText: '',
    questionType: 'multiple_choice',
    points: 1,
  });
  const [options, setOptions] = useState(DEFAULT_OPTIONS);
  const [shortAnswerCorrect, setShortAnswerCorrect] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));

    if (name === 'questionType') {
      if (value === 'true_false') {
        setOptions(TRUE_FALSE_OPTIONS.map((o) => ({ ...o })));
      } else if (value === 'multiple_choice') {
        setOptions(DEFAULT_OPTIONS.map((o) => ({ ...o })));
      }
    }
  };

  const handleOptionText = (idx, text) => {
    setOptions((opts) =>
      opts.map((o, i) => (i === idx ? { ...o, optionText: text } : o))
    );
  };

  const handleOptionCorrect = (idx) => {
    setOptions((opts) =>
      opts.map((o, i) => ({ ...o, isCorrect: i === idx }))
    );
  };

  const addOption = () => {
    setOptions((opts) => [...opts, { optionText: '', isCorrect: false }]);
  };

  const removeOption = (idx) => {
    setOptions((opts) => opts.filter((_, i) => i !== idx));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validate
    if (form.questionType === 'multiple_choice') {
      if (options.some((o) => !o.optionText.trim())) {
        setError('All option texts are required.');
        return;
      }
      if (!options.some((o) => o.isCorrect)) {
        setError('Please mark one option as correct.');
        return;
      }
    }

    setLoading(true);
    try {
      const payload = {
        questionText: form.questionText,
        questionType: form.questionType,
        points: parseInt(form.points, 10) || 1,
        options:
          form.questionType === 'short_answer'
            ? [{ optionText: shortAnswerCorrect, isCorrect: true }]
            : options,
      };
      await quizzesApi.addQuestion(quizId, payload);
      navigate(`/quizzes/${quizId}/manage`);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add question');
    } finally {
      setLoading(false);
    }
  };

  const isTrueFalse = form.questionType === 'true_false';
  const isShortAnswer = form.questionType === 'short_answer';

  return (
    <Layout>
      <div className="mx-auto max-w-2xl space-y-6">
        <h1 className="text-2xl font-bold text-gray-900">Add Question</h1>
        <form onSubmit={handleSubmit} className="space-y-5">
          {error && <Alert type="error">{error}</Alert>}

          <Card>
            <CardBody className="space-y-4">
              <Textarea
                id="questionText"
                label="Question *"
                name="questionText"
                value={form.questionText}
                onChange={handleChange}
                rows={3}
                required
                placeholder="Enter your question here..."
              />
              <div className="grid grid-cols-2 gap-4">
                <Select
                  id="questionType"
                  label="Question Type"
                  name="questionType"
                  value={form.questionType}
                  onChange={handleChange}
                >
                  <option value="multiple_choice">Multiple Choice</option>
                  <option value="true_false">True / False</option>
                  <option value="short_answer">Short Answer</option>
                </Select>
                <Input
                  id="points"
                  label="Points"
                  name="points"
                  type="number"
                  value={form.points}
                  onChange={handleChange}
                  min="1"
                  required
                />
              </div>
            </CardBody>
          </Card>

          {/* Options — MCQ */}
          {!isTrueFalse && !isShortAnswer && (
            <Card>
              <CardBody className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="font-semibold text-gray-800">Answer Options</h2>
                  <Button
                    type="button"
                    size="sm"
                    variant="secondary"
                    onClick={addOption}
                  >
                    + Add Option
                  </Button>
                </div>
                {options.map((opt, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-3 rounded-lg border border-gray-200 p-3"
                  >
                    <input
                      type="radio"
                      name="correctOption"
                      checked={opt.isCorrect}
                      onChange={() => handleOptionCorrect(idx)}
                      title="Mark as correct"
                      className="accent-indigo-600 flex-shrink-0"
                    />
                    <input
                      type="text"
                      value={opt.optionText}
                      onChange={(e) => handleOptionText(idx, e.target.value)}
                      placeholder={`Option ${idx + 1}`}
                      required
                      className="flex-1 rounded-md border border-gray-300 px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                    {options.length > 2 && (
                      <button
                        type="button"
                        onClick={() => removeOption(idx)}
                        className="text-xs text-red-500 hover:text-red-700 flex-shrink-0"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                ))}
                <p className="text-xs text-gray-400">
                  Select the radio button next to the correct answer.
                </p>
              </CardBody>
            </Card>
          )}

          {/* Options — True/False */}
          {isTrueFalse && (
            <Card>
              <CardBody className="space-y-3">
                <h2 className="font-semibold text-gray-800">Correct Answer</h2>
                {options.map((opt, idx) => (
                  <label
                    key={idx}
                    className={`flex items-center gap-3 rounded-lg border p-3 cursor-pointer ${
                      opt.isCorrect ? 'border-indigo-400 bg-indigo-50' : 'border-gray-200'
                    }`}
                  >
                    <input
                      type="radio"
                      name="tfCorrect"
                      checked={opt.isCorrect}
                      onChange={() => handleOptionCorrect(idx)}
                      className="accent-indigo-600"
                    />
                    <span className="text-sm text-gray-800">{opt.optionText}</span>
                  </label>
                ))}
              </CardBody>
            </Card>
          )}

          {/* Short answer */}
          {isShortAnswer && (
            <Card>
              <CardBody>
                <Input
                  id="shortAnswerCorrect"
                  label="Correct Answer *"
                  value={shortAnswerCorrect}
                  onChange={(e) => setShortAnswerCorrect(e.target.value)}
                  required
                  placeholder="The expected correct answer (case-insensitive match)"
                />
              </CardBody>
            </Card>
          )}

          <div className="flex gap-3">
            <Button type="submit" loading={loading}>
              Add Question
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={() => navigate(`/quizzes/${quizId}/manage`)}
            >
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </Layout>
  );
}
