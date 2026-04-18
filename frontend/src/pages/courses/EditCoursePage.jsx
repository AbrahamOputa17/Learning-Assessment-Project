import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { coursesApi } from '../../api';
import { Layout } from '../../components/layout/Layout';
import { Card, CardBody } from '../../components/ui/Card';
import { Input, Select, Textarea } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { Alert } from '../../components/ui/Alert';
import { PageSpinner } from '../../components/ui/Spinner';

export default function EditCoursePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    coursesApi.getById(id).then((res) => {
      const c = res.data.data.course;
      setForm({
        title: c.title || '',
        description: c.description || '',
        category: c.category || '',
        level: c.level || '100',
        is_published: c.is_published ?? false,
      });
    }).catch(() => {
      setError('Course not found or you do not have permission to edit it.');
    });
  }, [id]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((f) => ({ ...f, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await coursesApi.update(id, form);
      navigate(`/courses/${id}`);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update course');
    } finally {
      setLoading(false);
    }
  };

  if (!form && !error) return <Layout><PageSpinner /></Layout>;

  if (!form) {
    return (
      <Layout>
        <div className="mx-auto max-w-2xl">
          <Alert type="error">{error}</Alert>
          <div className="mt-4">
            <Button variant="secondary" onClick={() => navigate('/courses')}>Back to Courses</Button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="mx-auto max-w-2xl">
        <h1 className="mb-6 text-2xl font-bold text-gray-900">Edit Course</h1>
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
                id="level"
                label="Level"
                name="level"
                value={form.level}
                onChange={handleChange}
              >
                <option value="100">100 Level</option>
                <option value="200">200 Level</option>
                <option value="300">300 Level</option>
                <option value="400">400 Level</option>
              </Select>
              <div className="flex items-center gap-3">
                <input
                  id="is_published"
                  name="is_published"
                  type="checkbox"
                  checked={form.is_published}
                  onChange={handleChange}
                  className="h-4 w-4 rounded border-gray-300 accent-indigo-600"
                />
                <label htmlFor="is_published" className="text-sm font-medium text-gray-700">
                  Published (visible to students)
                </label>
              </div>
              <div className="flex gap-3 pt-2">
                <Button type="submit" loading={loading}>Save Changes</Button>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => navigate(`/courses/${id}`)}
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
