import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { postService } from '../services/api';

export default function Home() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const response = await postService.getAll('published', 20, 0);
      setPosts(response.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load posts');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="container"><p>Loading posts...</p></div>;
  if (error) return <div className="container"><div className="message error">{error}</div></div>;

  return (
    <div className="container">
      <h1>📰 Blog</h1>
      
      {posts.length === 0 ? (
        <p>No posts published yet.</p>
      ) : (
        <div className="posts-list">
          {posts.map((post) => (
            <div key={post.id} className="post-item">
              <h3>{post.title}</h3>
              <div className="post-meta">
                By {post.author_name} • {new Date(post.created_at).toLocaleDateString()}
              </div>
              <div className="post-content">{post.excerpt || post.content.substring(0, 150)}...</div>
              <div className="post-actions">
                <Link to={`/post/${post.id}`}>
                  <button>Read More</button>
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
