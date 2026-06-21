import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { postService, commentService } from '../services/api';

export default function ViewPost() {
  const { id } = useParams();
  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [commentForm, setCommentForm] = useState({
    author_name: '',
    author_email: '',
    content: '',
  });
  const [submittingComment, setSubmittingComment] = useState(false);
  const [commentSuccess, setCommentSuccess] = useState('');

  useEffect(() => {
    fetchPost();
  }, [id]);

  const fetchPost = async () => {
    try {
      const response = await postService.getById(id);
      setPost(response.data);
      setComments(response.data.comments || []);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load post');
    } finally {
      setLoading(false);
    }
  };

  const handleCommentChange = (e) => {
    setCommentForm({
      ...commentForm,
      [e.target.name]: e.target.value,
    });
  };

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    setSubmittingComment(true);

    try {
      await commentService.create(
        id,
        commentForm.author_name,
        commentForm.author_email,
        commentForm.content
      );
      setCommentSuccess('Comment submitted! It will appear after moderation.');
      setCommentForm({ author_name: '', author_email: '', content: '' });
      setTimeout(() => setCommentSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to submit comment');
    } finally {
      setSubmittingComment(false);
    }
  };

  if (loading) return <div className="container"><p>Loading...</p></div>;
  if (error) return <div className="container"><div className="message error">{error}</div></div>;
  if (!post) return <div className="container"><p>Post not found</p></div>;

  return (
    <div className="container">
      <article className="card">
        <h1>{post.title}</h1>
        <div style={{ color: '#7f8c8d', marginBottom: '1.5rem' }}>
          By <strong>{post.author_name}</strong> • {new Date(post.created_at).toLocaleDateString()}
        </div>
        <div style={{ lineHeight: '1.8', color: '#333' }}>
          {post.content}
        </div>
      </article>

      <section className="card">
        <h2>Comments ({comments.length})</h2>

        {comments.length === 0 ? (
          <p>No comments yet. Be the first to comment!</p>
        ) : (
          <div style={{ marginBottom: '2rem' }}>
            {comments.map((comment) => (
              <div key={comment.id} style={{
                padding: '1rem',
                marginBottom: '1rem',
                borderLeft: '3px solid #3498db',
                backgroundColor: '#f9f9f9',
              }}>
                <strong>{comment.author_name}</strong> • {new Date(comment.created_at).toLocaleDateString()}
                <p style={{ marginTop: '0.5rem' }}>{comment.content}</p>
              </div>
            ))}
          </div>
        )}

        <h3>Leave a Comment</h3>
        {commentSuccess && <div className="message success">{commentSuccess}</div>}
        
        <form onSubmit={handleCommentSubmit}>
          <div className="form-group">
            <label htmlFor="author_name">Name</label>
            <input
              type="text"
              id="author_name"
              name="author_name"
              value={commentForm.author_name}
              onChange={handleCommentChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="author_email">Email</label>
            <input
              type="email"
              id="author_email"
              name="author_email"
              value={commentForm.author_email}
              onChange={handleCommentChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="content">Comment</label>
            <textarea
              id="content"
              name="content"
              value={commentForm.content}
              onChange={handleCommentChange}
              required
            ></textarea>
          </div>

          <button type="submit" disabled={submittingComment}>
            {submittingComment ? 'Submitting...' : 'Submit Comment'}
          </button>
        </form>
      </section>
    </div>
  );
}
