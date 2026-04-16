import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { quizzesApi } from '../../api';
import { Layout } from '../../components/layout/Layout';
import { Card, CardBody } from '../../components/ui/Card';
import { Input, Select, Textarea } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { Alert } from '../../components/ui/Alert';

export default function CreateQuizPage() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    title: '',
    description: '',
    timeLimit: '',
    maxAttempts: 1,
    passScore: 70,
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) =>
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const payload = {
        title: form.title,
        description: form.description,
        timeLimit: form.timeLimit ? parseInt(form.timeLimit) : null,
        maxAttempts: parseInt(form.maxAttempts),
        passScore: parseInt(form.passScore),
      };
      const res = await quizzesApi.create(courseId, payload);
      navigate(`/quizzes/${res.data.data.quiz.id}/manage`);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create quiz');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="mx-auto max-w-2xl">
        <h1 className="mb-6 text-2xl font-bold text-gray-900">Create Quiz</h1>
        <Card>
          <CardBody>
            <form onSubmit={handleSubmit} className="space-y-5">
              {error && <Alert type="error">{error}</Alert>}
              <Input
                id="title"
                label="Quiz Title *"
                name="title"
                value={form.title}
                onChange={handleChange}
                required
                placeholder="e.g. Midterm Quiz"
              />
              <Textarea
                id="description"
                label="Description"
                name="description"
                value={form.description}
                onChange={handleChange}
                rows={3}
                placeholder="What is this quiz about?"
              />
              <div className="grid grid-cols-3 gap-4">
                <Input
                  id="timeLimit"
                  label="Time Limit (min)"
                  name="timeLimit"
                  type="number"
                  value={form.timeLimit}
                  onChange={handleChange}
                  placeholder="No limit"
                  min="1"
                />
                <Input
                  id="maxAttempts"
                  label="Max Attempts"
                  name="maxAttempts"
                  type="number"
                  value={form.maxAttempts}
                  onChange={handleChange}
                  min="1"
                  required
                />
                <Input
                  id="passScore"
                  label="Pass Score (%)"
                  name="passScore"
                  type="number"
                  value={form.passScore}
                  onChange={handleChange}
                  min="0"
                  max="100"
                  required
                />
              </div>
              <div className="flex gap-3 pt-2">
                <Button type="submit" loading={loading}>Create Quiz</Button>
                <Button type="button" variant="secondary" onClick={() => navigate(-1)}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardBody>
        </Card>
      </div>
    </Layout>
  );
}
