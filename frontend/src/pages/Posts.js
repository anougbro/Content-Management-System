import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { postService } from '../services/api';

export default function Posts() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    fetchPosts();
  }, [statusFilter]);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const response = await postService.getAll(statusFilter, 50, 0);
      setPosts(response.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load posts');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this post?')) {
      try {
        await postService.delete(id);
        setPosts(posts.filter((p) => p.id !== id));
      } catch (err) {
        setError(err.response?.data?.error || 'Failed to delete post');
      }
    }
  };

  if (loading) return <div className="container"><p>Loading posts...</p></div>;

  return (
    <div className="container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1>Posts</h1>
        <Link to="/posts/create"><button>✍️ Create New Post</button></Link>
      </div>

      {error && <div className="message error">{error}</div>}

      <div className="card" style={{ marginBottom: '2rem' }}>
        <label htmlFor="status">Filter by Status: </label>
        <select 
          id="status"
          value={statusFilter} 
          onChange={(e) => setStatusFilter(e.target.value)}
          style={{ marginLeft: '0.5rem', padding: '0.5rem' }}
        >
          <option value="all">All</option>
          <option value="published">Published</option>
          <option value="draft">Draft</option>
        </select>
      </div>

      {posts.length === 0 ? (
        <div className="card">
          <p>No posts found. <Link to="/posts/create">Create one now!</Link></p>
        </div>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Title</th>
              <th>Status</th>
              <th>Author</th>
              <th>Created</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {posts.map((post) => (
              <tr key={post.id}>
                <td><strong>{post.title}</strong></td>
                <td>
                  <span style={{
                    padding: '0.25rem 0.5rem',
                    borderRadius: '3px',
                    backgroundColor: post.status === 'published' ? '#d4edda' : '#fff3cd',
                    color: post.status === 'published' ? '#155724' : '#856404',
                    fontSize: '12px',
                  }}>
                    {post.status}
                  </span>
                </td>
                <td>{post.author_name}</td>
                <td>{new Date(post.created_at).toLocaleDateString()}</td>
                <td>
                  <Link to={`/posts/edit/${post.id}`}>
                    <button style={{ padding: '0.4rem 0.8rem', fontSize: '12px' }}>Edit</button>
                  </Link>
                  <button 
                    className="danger"
                    onClick={() => handleDelete(post.id)}
                    style={{ padding: '0.4rem 0.8rem', fontSize: '12px', marginLeft: '0.5rem' }}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
