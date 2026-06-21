import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { postService, categoryService } from '../services/api';

export default function EditPost() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    excerpt: '',
    category_id: '',
    status: 'draft',
  });
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchPostAndCategories();
  }, [id]);

  const fetchPostAndCategories = async () => {
    try {
      const [postRes, categoriesRes] = await Promise.all([
        postService.getById(id),
        categoryService.getAll(),
      ]);

      const post = postRes.data;
      setFormData({
        title: post.title,
        content: post.content,
        excerpt: post.excerpt || '',
        category_id: post.category_id || '',
        status: post.status,
      });
      setCategories(categoriesRes.data || []);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load post');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      await postService.update(id, formData);
      setSuccess('Post updated successfully!');
      setTimeout(() => navigate('/posts'), 1500);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update post');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="container"><p>Loading...</p></div>;

  return (
    <div className="container">
      <h1>Edit Post</h1>

      {error && <div className="message error">{error}</div>}
      {success && <div className="message success">{success}</div>}

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="title">Title *</label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            required
            placeholder="Post title"
          />
        </div>

        <div className="form-group">
          <label htmlFor="excerpt">Excerpt</label>
          <textarea
            id="excerpt"
            name="excerpt"
            value={formData.excerpt}
            onChange={handleChange}
            placeholder="Short summary of the post"
            style={{ minHeight: '100px' }}
          ></textarea>
        </div>

        <div className="form-group">
          <label htmlFor="content">Content *</label>
          <textarea
            id="content"
            name="content"
            value={formData.content}
            onChange={handleChange}
            required
            placeholder="Write your post content here"
          ></textarea>
        </div>

        <div className="form-group">
          <label htmlFor="category_id">Category</label>
          <select
            id="category_id"
            name="category_id"
            value={formData.category_id}
            onChange={handleChange}
          >
            <option value="">Select a category</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="status">Status</label>
          <select
            id="status"
            name="status"
            value={formData.status}
            onChange={handleChange}
          >
            <option value="draft">Draft</option>
            <option value="published">Published</option>
          </select>
        </div>

        <div style={{ display: 'flex', gap: '1rem' }}>
          <button type="submit" disabled={submitting}>
            {submitting ? 'Updating...' : 'Update Post'}
          </button>
          <button 
            type="button" 
            className="secondary"
            onClick={() => navigate('/posts')}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
