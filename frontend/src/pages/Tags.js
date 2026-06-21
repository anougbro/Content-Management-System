import React, { useState, useEffect } from 'react';
import { tagService } from '../services/api';

export default function Tags() {
  const [tags, setTags] = useState([]);
  const [tagName, setTagName] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchTags();
  }, []);

  const fetchTags = async () => {
    try {
      const response = await tagService.getAll();
      setTags(response.data || []);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load tags');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setSubmitting(true);

    try {
      await tagService.create(tagName);
      setSuccess('Tag created successfully!');
      setTagName('');
      fetchTags();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create tag');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="container"><p>Loading...</p></div>;

  return (
    <div className="container">
      <h1>Tags</h1>

      {error && <div className="message error">{error}</div>}
      {success && <div className="message success">{success}</div>}

      <form onSubmit={handleSubmit}>
        <h2>Add New Tag</h2>
        <div className="form-group">
          <label htmlFor="tagName">Tag Name *</label>
          <input
            type="text"
            id="tagName"
            value={tagName}
            onChange={(e) => setTagName(e.target.value)}
            required
            placeholder="e.g., JavaScript"
          />
        </div>

        <button type="submit" disabled={submitting}>
          {submitting ? 'Creating...' : 'Create Tag'}
        </button>
      </form>

      <h2 style={{ marginTop: '3rem' }}>All Tags ({tags.length})</h2>
      
      {tags.length === 0 ? (
        <div className="card">
          <p>No tags yet.</p>
        </div>
      ) : (
        <div style={{ 
          display: 'flex',
          flexWrap: 'wrap',
          gap: '0.5rem',
          padding: '1rem',
          backgroundColor: '#f5f5f5',
          borderRadius: '4px'
        }}>
          {tags.map((tag) => (
            <span key={tag.id} style={{
              padding: '0.5rem 1rem',
              backgroundColor: '#3498db',
              color: 'white',
              borderRadius: '20px',
              fontSize: '14px',
            }}>
              {tag.name}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
