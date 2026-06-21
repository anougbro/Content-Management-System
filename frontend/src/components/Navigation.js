import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

export default function Navigation({ user, onLogout }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    onLogout();
    navigate('/');
  };

  return (
    <nav>
      <div className="logo">
        <Link to="/" style={{ textDecoration: 'none', color: 'white' }}>
          📝 CMS
        </Link>
      </div>

      {user ? (
        <>
          <div className="nav-links">
            <Link to="/dashboard">Dashboard</Link>
            <Link to="/posts">Posts</Link>
            <Link to="/categories">Categories</Link>
            <Link to="/tags">Tags</Link>
            <Link to="/comments">Comments</Link>
          </div>
          <div className="nav-right">
            <span>Welcome, {user.username}</span>
            <button onClick={handleLogout} className="secondary">
              Logout
            </button>
          </div>
        </>
      ) : (
        <div className="nav-links">
          <Link to="/login">Login</Link>
          <Link to="/register">Register</Link>
        </div>
      )}
    </nav>
  );
}
