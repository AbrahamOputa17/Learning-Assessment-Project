import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { coursesApi } from '../../api';
import { Layout } from '../../components/layout/Layout';
import { Card, CardBody, CardHeader } from '../../components/ui/Card';
import { Input, Select, Textarea } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { Alert } from '../../components/ui/Alert';

export default function CreateCoursePage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    title: '',
    description: '',
    category: '',
    difficulty: '100',
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
      const res = await coursesApi.create(form);
      navigate(`/courses/${res.data.data.course.id}`);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create course');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="mx-auto max-w-2xl">
        <h1 className="mb-6 text-2xl font-bold text-gray-900">Create New Course</h1>
        <Card>
          <CardBody>
            <form onSubmit={handleSubmit} className="space-y-5">
              {error && <Alert type="error">{error}</Alert>}
              <Input
                id="title"
                label="Course Title *"
                name="title"
                value={form.title}
                onChange={handleChange}
                placeholder="e.g. Introduction to JavaScript"
                required
              />
              <Textarea
                id="description"
                label="Description"
                name="description"
                value={form.description}
                onChange={handleChange}
                placeholder="Describe what students will learn..."
                rows={4}
              />
              <Input
                id="category"
                label="Category"
                name="category"
                value={form.category}
                onChange={handleChange}
                placeholder="e.g. Programming, Mathematics"
              />
              <Select
                id="difficulty"
                label="Difficulty"
                name="difficulty"
                value={form.difficulty}
                onChange={handleChange}
              >
                <option value="100">100 Level</option>
                <option value="200">200 Level</option>
                <option value="300">300 Level</option>
                <option value="400">400 Level</option>
              </Select>
              <div className="flex gap-3 pt-2">
                <Button type="submit" loading={loading}>Create Course</Button>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => navigate(-1)}
                >
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
