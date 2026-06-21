import React, { useState, useEffect } from 'react';
import { categoryService } from '../services/api';

export default function Categories() {
  const [categories, setCategories] = useState([]);
  const [formData, setFormData] = useState({ name: '', description: '' });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await categoryService.getAll();
      setCategories(response.data || []);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load categories');
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
    setSuccess('');
    setSubmitting(true);

    try {
      await categoryService.create(formData.name, formData.description);
      setSuccess('Category created successfully!');
      setFormData({ name: '', description: '' });
      fetchCategories();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create category');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="container"><p>Loading...</p></div>;

  return (
    <div className="container">
      <h1>Categories</h1>

      {error && <div className="message error">{error}</div>}
      {success && <div className="message success">{success}</div>}

      <form onSubmit={handleSubmit}>
        <h2>Add New Category</h2>
        <div className="form-group">
          <label htmlFor="name">Category Name *</label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            placeholder="e.g., Technology"
          />
        </div>

        <div className="form-group">
          <label htmlFor="description">Description</label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Category description (optional)"
          ></textarea>
        </div>

        <button type="submit" disabled={submitting}>
          {submitting ? 'Creating...' : 'Create Category'}
        </button>
      </form>

      <h2 style={{ marginTop: '3rem' }}>All Categories ({categories.length})</h2>
      
      {categories.length === 0 ? (
        <div className="card">
          <p>No categories yet.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '1rem' }}>
          {categories.map((cat) => (
            <div key={cat.id} className="card">
              <h3>{cat.name}</h3>
              {cat.description && <p>{cat.description}</p>}
              <small>Slug: {cat.slug}</small>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
