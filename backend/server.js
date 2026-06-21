const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const pool = require('./db');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// ==================== AUTHENTICATION ====================

// Register
app.post('/api/auth/register', async (req, res) => {
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  try {
    const bcrypt = require('bcryptjs');
    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await pool.query(
      'INSERT INTO users (username, email, password, role) VALUES ($1, $2, $3, $4) RETURNING id, username, email, role',
      [username, email, hashedPassword, 'editor']
    );

    res.status(201).json({ 
      message: 'User registered successfully',
      user: result.rows[0]
    });
  } catch (err) {
    if (err.code === '23505') {
      res.status(400).json({ error: 'Username or email already exists' });
    } else {
      res.status(500).json({ error: err.message });
    }
  }
});

// Login
app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  try {
    const bcrypt = require('bcryptjs');
    const jwt = require('jsonwebtoken');

    const userResult = await pool.query('SELECT * FROM users WHERE email = $1', [email]);

    if (userResult.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const user = userResult.rows[0];
    const validPassword = await bcrypt.compare(password, user.password);

    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const token = jwt.sign(
      { id: user.id, username: user.username, role: user.role },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' }
    );

    res.json({
      message: 'Login successful',
      token,
      user: { id: user.id, username: user.username, email: user.email, role: user.role }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ==================== POSTS ====================

// Get all posts
app.get('/api/posts', async (req, res) => {
  try {
    const { status = 'published', limit = 10, offset = 0 } = req.query;

    let query = 'SELECT p.*, u.username as author_name FROM posts p JOIN users u ON p.author_id = u.id';
    let params = [];
    let paramCount = 1;

    if (status !== 'all') {
      query += ` WHERE p.status = $${paramCount}`;
      params.push(status);
      paramCount++;
    }

    query += ` ORDER BY p.created_at DESC LIMIT $${paramCount} OFFSET $${paramCount + 1}`;
    params.push(parseInt(limit), parseInt(offset));

    const result = await pool.query(query, params);

    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get single post
app.get('/api/posts/:id', async (req, res) => {
  try {
    const postResult = await pool.query(
      'SELECT p.*, u.username as author_name FROM posts p JOIN users u ON p.author_id = u.id WHERE p.id = $1',
      [req.params.id]
    );

    if (postResult.rows.length === 0) {
      return res.status(404).json({ error: 'Post not found' });
    }

    const post = postResult.rows[0];

    // Get comments
    const commentsResult = await pool.query(
      'SELECT * FROM comments WHERE post_id = $1 AND status = $2 ORDER BY created_at DESC',
      [req.params.id, 'approved']
    );

    res.json({ ...post, comments: commentsResult.rows });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create post (requires token)
app.post('/api/posts', verifyToken, async (req, res) => {
  const { title, content, excerpt, category_id, status = 'draft' } = req.body;

  if (!title || !content) {
    return res.status(400).json({ error: 'Title and content are required' });
  }

  try {
    const slug = title.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '');

    const result = await pool.query(
      'INSERT INTO posts (title, slug, content, excerpt, author_id, category_id, status) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
      [title, slug, content, excerpt, req.user.id, category_id || null, status]
    );

    res.status(201).json({ 
      message: 'Post created successfully',
      post: result.rows[0]
    });
  } catch (err) {
    if (err.code === '23505') {
      res.status(400).json({ error: 'Post with this title already exists' });
    } else {
      res.status(500).json({ error: err.message });
    }
  }
});

// Update post
app.put('/api/posts/:id', verifyToken, async (req, res) => {
  const { title, content, excerpt, category_id, status } = req.body;

  try {
    const postResult = await pool.query('SELECT * FROM posts WHERE id = $1', [req.params.id]);

    if (postResult.rows.length === 0) {
      return res.status(404).json({ error: 'Post not found' });
    }

    const post = postResult.rows[0];

    if (post.author_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Not authorized to update this post' });
    }

    const result = await pool.query(
      'UPDATE posts SET title = $1, content = $2, excerpt = $3, category_id = $4, status = $5, updated_at = CURRENT_TIMESTAMP WHERE id = $6 RETURNING *',
      [
        title || post.title,
        content || post.content,
        excerpt !== undefined ? excerpt : post.excerpt,
        category_id || post.category_id,
        status || post.status,
        req.params.id
      ]
    );

    res.json({ 
      message: 'Post updated successfully',
      post: result.rows[0]
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete post
app.delete('/api/posts/:id', verifyToken, async (req, res) => {
  try {
    const postResult = await pool.query('SELECT * FROM posts WHERE id = $1', [req.params.id]);

    if (postResult.rows.length === 0) {
      return res.status(404).json({ error: 'Post not found' });
    }

    const post = postResult.rows[0];

    if (post.author_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Not authorized to delete this post' });
    }

    await pool.query('DELETE FROM posts WHERE id = $1', [req.params.id]);

    res.json({ message: 'Post deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ==================== CATEGORIES ====================

// Get all categories
app.get('/api/categories', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM categories ORDER BY name');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create category
app.post('/api/categories', verifyToken, async (req, res) => {
  const { name, description } = req.body;

  if (!name) {
    return res.status(400).json({ error: 'Category name is required' });
  }

  try {
    const slug = name.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '');

    const result = await pool.query(
      'INSERT INTO categories (name, slug, description) VALUES ($1, $2, $3) RETURNING *',
      [name, slug, description || '']
    );

    res.status(201).json({ 
      message: 'Category created successfully',
      category: result.rows[0]
    });
  } catch (err) {
    if (err.code === '23505') {
      res.status(400).json({ error: 'Category already exists' });
    } else {
      res.status(500).json({ error: err.message });
    }
  }
});

// ==================== COMMENTS ====================

// Get post comments
app.get('/api/posts/:id/comments', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM comments WHERE post_id = $1 ORDER BY created_at DESC',
      [req.params.id]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Add comment
app.post('/api/posts/:id/comments', async (req, res) => {
  const { author_name, author_email, content } = req.body;

  if (!author_name || !author_email || !content) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  try {
    const result = await pool.query(
      'INSERT INTO comments (post_id, author_name, author_email, content, status) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [req.params.id, author_name, author_email, content, 'pending']
    );

    res.status(201).json({ 
      message: 'Comment added and awaiting approval',
      comment: result.rows[0]
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Approve comment
app.put('/api/comments/:id/approve', verifyToken, async (req, res) => {
  try {
    const result = await pool.query(
      'UPDATE comments SET status = $1 WHERE id = $2 RETURNING *',
      ['approved', req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Comment not found' });
    }

    res.json({ 
      message: 'Comment approved',
      comment: result.rows[0]
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ==================== TAGS ====================

// Get all tags
app.get('/api/tags', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM tags ORDER BY name');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create tag
app.post('/api/tags', verifyToken, async (req, res) => {
  const { name } = req.body;

  if (!name) {
    return res.status(400).json({ error: 'Tag name is required' });
  }

  try {
    const slug = name.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '');

    const result = await pool.query(
      'INSERT INTO tags (name, slug) VALUES ($1, $2) RETURNING *',
      [name, slug]
    );

    res.status(201).json({ 
      message: 'Tag created successfully',
      tag: result.rows[0]
    });
  } catch (err) {
    if (err.code === '23505') {
      res.status(400).json({ error: 'Tag already exists' });
    } else {
      res.status(500).json({ error: err.message });
    }
  }
});

// ==================== MIDDLEWARE ====================

function verifyToken(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }

  try {
    const jwt = require('jsonwebtoken');
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ error: 'Invalid token' });
  }
}

// ==================== HEALTH CHECK ====================

app.get('/api/health', async (req, res) => {
  try {
    const result = await pool.query('SELECT NOW()');
    res.json({ 
      status: 'Server is running',
      database: 'Connected',
      timestamp: result.rows[0].now
    });
  } catch (err) {
    res.status(503).json({ 
      status: 'Server error',
      database: 'Disconnected',
      error: err.message
    });
  }
});

// ==================== ERROR HANDLING ====================

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal server error' });
});

// ==================== START SERVER ====================

app.listen(PORT, () => {
  console.log(`\n🚀 CMS Backend running on http://localhost:${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/api/health\n`);
});

