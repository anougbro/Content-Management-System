import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { postService, categoryService, tagService } from '../services/api';

export default function Dashboard({ user }) {
  const [stats, setStats] = useState({
    posts: 0,
    categories: 0,
    tags: 0,
  });
  const [recentPosts, setRecentPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [postsRes, categoriesRes, tagsRes] = await Promise.all([
        postService.getAll('all', 5, 0),
        categoryService.getAll(),
        tagService.getAll(),
      ]);

      setRecentPosts(postsRes.data);
      setStats({
        posts: postsRes.data.length,
        categories: categoriesRes.data.length,
        tags: tagsRes.data.length,
      });
    } catch (err) {
      console.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="container"><p>Loading...</p></div>;

  return (
    <div className="container">
      <h1>Dashboard</h1>

      <div className="dashboard-grid">
        <div className="stat-card">
          <h3>Total Posts</h3>
          <div className="number">{stats.posts}</div>
          <Link to="/posts"><button style={{ marginTop: '1rem' }}>Manage Posts</button></Link>
        </div>
        <div className="stat-card">
          <h3>Categories</h3>
          <div className="number">{stats.categories}</div>
          <Link to="/categories"><button style={{ marginTop: '1rem' }}>Manage Categories</button></Link>
        </div>
        <div className="stat-card">
          <h3>Tags</h3>
          <div className="number">{stats.tags}</div>
          <Link to="/tags"><button style={{ marginTop: '1rem' }}>Manage Tags</button></Link>
        </div>
      </div>

      <div className="action-buttons">
        <Link to="/posts/create"><button>✍️ Create New Post</button></Link>
        <Link to="/categories"><button className="secondary">📂 Add Category</button></Link>
        <Link to="/tags"><button className="secondary">🏷️ Add Tag</button></Link>
      </div>

      <section className="card">
        <h2>Recent Posts</h2>
        {recentPosts.length === 0 ? (
          <p>No posts yet. <Link to="/posts/create">Create one now!</Link></p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Title</th>
                <th>Status</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {recentPosts.map((post) => (
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
                  <td>{new Date(post.created_at).toLocaleDateString()}</td>
                  <td>
                    <Link to={`/posts/edit/${post.id}`}><button style={{ padding: '0.4rem 0.8rem', fontSize: '12px' }}>Edit</button></Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </div>
  );
}
