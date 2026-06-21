import React, { useState, useEffect } from 'react';
import { postService, commentService } from '../services/api';

export default function Comments() {
  const [posts, setPosts] = useState([]);
  const [selectedPost, setSelectedPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const response = await postService.getAll('all', 50, 0);
      setPosts(response.data || []);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load posts');
    } finally {
      setLoading(false);
    }
  };

  const handlePostChange = async (e) => {
    const postId = e.target.value;
    setSelectedPost(postId);

    if (postId) {
      try {
        const response = await commentService.getByPostId(postId);
        setComments(response.data || []);
      } catch (err) {
        setError(err.response?.data?.error || 'Failed to load comments');
      }
    } else {
      setComments([]);
    }
  };

  const handleApprove = async (commentId) => {
    try {
      await commentService.approve(commentId);
      setComments(comments.map((c) =>
        c.id === commentId ? { ...c, status: 'approved' } : c
      ));
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to approve comment');
    }
  };

  if (loading) return <div className="container"><p>Loading...</p></div>;

  return (
    <div className="container">
      <h1>Comments Management</h1>

      {error && <div className="message error">{error}</div>}

      <div className="card">
        <h2>Select a Post</h2>
        <div className="form-group">
          <label htmlFor="postSelect">Post: </label>
          <select
            id="postSelect"
            value={selectedPost || ''}
            onChange={handlePostChange}
          >
            <option value="">Choose a post to view its comments...</option>
            {posts.map((post) => (
              <option key={post.id} value={post.id}>
                {post.title}
              </option>
            ))}
          </select>
        </div>
      </div>

      {selectedPost && (
        <section className="card">
          <h2>Comments ({comments.length})</h2>

          {comments.length === 0 ? (
            <p>No comments for this post yet.</p>
          ) : (
            <div>
              {comments.map((comment) => (
                <div key={comment.id} style={{
                  padding: '1rem',
                  marginBottom: '1rem',
                  borderLeft: '3px solid #3498db',
                  backgroundColor: comment.status === 'pending' ? '#fff3cd' : '#d4edda',
                }}>
                  <div style={{ marginBottom: '0.5rem' }}>
                    <strong>{comment.author_name}</strong> ({comment.author_email})
                    <span style={{
                      marginLeft: '1rem',
                      padding: '0.25rem 0.5rem',
                      backgroundColor: comment.status === 'pending' ? '#ffc107' : '#28a745',
                      color: 'white',
                      borderRadius: '3px',
                      fontSize: '12px',
                    }}>
                      {comment.status}
                    </span>
                  </div>
                  <p style={{ marginBottom: '1rem' }}>{comment.content}</p>
                  <small style={{ color: '#666' }}>
                    {new Date(comment.created_at).toLocaleString()}
                  </small>

                  {comment.status === 'pending' && (
                    <div>
                      <button 
                        onClick={() => handleApprove(comment.id)}
                        style={{ marginTop: '0.5rem' }}
                      >
                        Approve
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>
      )}
    </div>
  );
}
