import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { codingApi } from '../../api';
import { Layout } from '../../components/layout/Layout';
import { Card, CardBody } from '../../components/ui/Card';
import { Input, Select, Textarea } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { Alert } from '../../components/ui/Alert';

export default function AddCodingQuestionPage() {
  const { quizId } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    title: '',
    description: '',
    starterCode: '',
    language: 'javascript',
    difficulty: 'medium',
    points: 10,
    deadline: '',
    caWeight: 0,
  });
  const [testCases, setTestCases] = useState([
    { input: '', expectedOutput: '', isHidden: false },
  ]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) =>
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleTCChange = (idx, field, value) => {
    setTestCases((tcs) =>
      tcs.map((tc, i) =>
        i === idx ? { ...tc, [field]: field === 'isHidden' ? value : value } : tc
      )
    );
  };

  const addTC = () =>
    setTestCases((tcs) => [...tcs, { input: '', expectedOutput: '', isHidden: false }]);

  const removeTC = (idx) =>
    setTestCases((tcs) => tcs.filter((_, i) => i !== idx));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await codingApi.addQuestion(quizId, {
        ...form,
        points: parseInt(form.points),
        caWeight: parseFloat(form.caWeight) || 0,
        deadline: form.deadline || null,
        testCases: testCases.filter((tc) => tc.expectedOutput),
      });
      navigate(`/coding/${quizId}`);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add question');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="mx-auto max-w-2xl space-y-6">
        <h1 className="text-2xl font-bold text-gray-900">Add Coding Problem</h1>
        <form onSubmit={handleSubmit} className="space-y-5">
          {error && <Alert type="error">{error}</Alert>}
          <Card>
            <CardBody className="space-y-4">
              <Input
                id="title"
                label="Problem Title *"
                name="title"
                value={form.title}
                onChange={handleChange}
                required
                placeholder="e.g. Two Sum"
              />
              <Textarea
                id="description"
                label="Problem Description *"
                name="description"
                value={form.description}
                onChange={handleChange}
                rows={5}
                required
                placeholder="Describe the problem, constraints, examples..."
              />
              <Textarea
                id="starterCode"
                label="Starter Code"
                name="starterCode"
                value={form.starterCode}
                onChange={handleChange}
                rows={4}
                placeholder="Optional boilerplate code for students..."
                className="font-mono"
              />
              <div className="grid grid-cols-3 gap-4">
                <Select id="language" label="Language" name="language" value={form.language} onChange={handleChange}>
                  <option value="javascript">JavaScript</option>
                  <option value="python">Python</option>
                </Select>
                <Select id="difficulty" label="Difficulty" name="difficulty" value={form.difficulty} onChange={handleChange}>
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="hard">Hard</option>
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
              <div className="grid grid-cols-2 gap-4">
                <Input
                  id="deadline"
                  label="Deadline (optional)"
                  name="deadline"
                  type="datetime-local"
                  value={form.deadline}
                  onChange={handleChange}
                />
                <Input
                  id="caWeight"
                  label="CA Weight (%)"
                  name="caWeight"
                  type="number"
                  value={form.caWeight}
                  onChange={handleChange}
                  min="0"
                  max="100"
                  placeholder="0"
                />
              </div>
            </CardBody>
          </Card>

          {/* Test Cases */}
          <Card>
            <CardBody className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="font-semibold text-gray-800">Test Cases</h2>
                <Button type="button" size="sm" variant="secondary" onClick={addTC}>
                  + Add Test Case
                </Button>
              </div>
              {testCases.map((tc, idx) => (
                <div key={idx} className="rounded-lg border border-gray-200 p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-600">Test Case {idx + 1}</span>
                    {testCases.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeTC(idx)}
                        className="text-xs text-red-500 hover:text-red-700"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                  <Input
                    label="Input"
                    value={tc.input}
                    onChange={(e) => handleTCChange(idx, 'input', e.target.value)}
                    placeholder="Input (leave blank if none)"
                  />
                  <Input
                    label="Expected Output *"
                    value={tc.expectedOutput}
                    onChange={(e) => handleTCChange(idx, 'expectedOutput', e.target.value)}
                    placeholder="Expected output"
                    required
                  />
                  <label className="flex items-center gap-2 text-sm text-gray-600">
                    <input
                      type="checkbox"
                      checked={tc.isHidden}
                      onChange={(e) => handleTCChange(idx, 'isHidden', e.target.checked)}
                      className="accent-indigo-600"
                    />
                    Hidden (not shown to students)
                  </label>
                </div>
              ))}
            </CardBody>
          </Card>

          <div className="flex gap-3">
            <Button type="submit" loading={loading}>Add Problem</Button>
            <Button type="button" variant="secondary" onClick={() => navigate(-1)}>
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </Layout>
  );
}
