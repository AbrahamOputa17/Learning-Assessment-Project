import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { codingApi } from '../../api';
import { Layout } from '../../components/layout/Layout';
import { Card, CardBody } from '../../components/ui/Card';
import { Input, Select, Textarea } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { Alert } from '../../components/ui/Alert';

export default function CreateCodingQuizPage() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    title: '',
    description: '',
    timeLimit: '',
    maxAttempts: 3,
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
      };
      const res = await codingApi.createQuiz(courseId, payload);
      navigate(`/coding/${res.data.data.quiz.id}`);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create coding quiz');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="mx-auto max-w-2xl">
        <h1 className="mb-6 text-2xl font-bold text-gray-900">Create Coding Challenge</h1>
        <Card>
          <CardBody>
            <form onSubmit={handleSubmit} className="space-y-5">
              {error && <Alert type="error">{error}</Alert>}
              <Input
                id="title"
                label="Title *"
                name="title"
                value={form.title}
                onChange={handleChange}
                required
                placeholder="e.g. Arrays & Strings Challenge"
              />
              <Textarea
                id="description"
                label="Description"
                name="description"
                value={form.description}
                onChange={handleChange}
                rows={3}
              />
              <div className="grid grid-cols-2 gap-4">
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
              </div>
              <div className="flex gap-3 pt-2">
                <Button type="submit" loading={loading}>Create</Button>
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
