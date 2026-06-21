# Full-Stack CMS (Content Management System)

A complete, production-ready Content Management System built with Node.js/Express backend, React frontend, and PostgreSQL database. Perfect for blogging, content publishing, and enterprise applications!

## 🚀 Features

### Core Features
- ✅ User Authentication (Registration & Login with JWT)
- ✅ Create, Read, Update, Delete (CRUD) Posts
- ✅ Draft & Published Status Management
- ✅ Categories & Tags Management
- ✅ Comments System with Moderation
- ✅ Public Blog View
- ✅ Admin Dashboard with Statistics
- ✅ Fully Responsive Design
- ✅ Professional PostgreSQL Database

### Backend
- Express.js REST API with PostgreSQL
- JWT Token-Based Authentication
- User Role Support (Editor, Admin)
- Database connection pooling
- Input validation and error handling
- CORS Enabled for frontend communication

### Frontend
- React with React Router
- Modern, Clean UI
- Responsive Design
- Form Validation
- Error Handling & Loading States

## 📋 Requirements

- Node.js (v14 or higher)
- npm (comes with Node.js)
- PostgreSQL (v12 or higher)
- Git (optional)

## ⚠️ IMPORTANT: PostgreSQL Installation Required

This CMS uses PostgreSQL, not SQLite. You **must** have PostgreSQL installed before proceeding.

**👉 [Read the PostgreSQL Setup Guide](./POSTGRESQL_SETUP.md)** for complete installation instructions for your operating system.

## 🛠️ Quick Start (After PostgreSQL is installed)

### 1. Extract the Project

```bash
unzip cms-project.zip
cd cms-project
```

### 2. Backend Setup

```bash
cd backend
npm install
```

### 3. Configure Database

Copy and edit the environment file:

```bash
cp .env.example .env
```

Update `.env` with your PostgreSQL credentials:
```env
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=your_postgres_password
DB_NAME=cms_database
```

### 4. Initialize Database

This command creates the database, user, tables, and indexes:

```bash
npm run setup-db
```

### 5. Frontend Setup

In a new terminal:
```bash
cd frontend
npm install
```

---

## ▶️ Running the Application

### Start Backend Server

From the `backend` directory:

```bash
npm start
```

Expected output:
```
✅ Connected to PostgreSQL database
🚀 CMS Backend running on http://localhost:5000
📊 Health check: http://localhost:5000/api/health
```

### Start Frontend Application

From the `frontend` directory (new terminal):

```bash
npm start
```

This opens your browser at `http://localhost:3000`

---

## 👤 First Time Setup

### 1. Create Your Account

1. Navigate to http://localhost:3000/register
2. Fill in the registration form
3. Submit to create your account

### 2. Log In

1. Click **Login**
2. Use your credentials
3. You'll be directed to the dashboard

### 3. Create Your First Post

1. Click **Dashboard** or **Posts**
2. Click **Create New Post**
3. Fill in the form and publish!

---

## 📁 Project Structure

```
cms-project/
├── README.md                 # Main documentation
├── POSTGRESQL_SETUP.md       # Database setup guide
│
├── backend/
│   ├── package.json          # Dependencies
│   ├── server.js             # Express server & routes
│   ├── db.js                 # PostgreSQL connection
│   ├── setup-db.js           # Database initialization script
│   ├── .env                  # Environment variables (create from .env.example)
│   └── .env.example          # Example environment variables
│
└── frontend/
    ├── public/
    │   └── index.html
    ├── src/
    │   ├── pages/            # Page components
    │   ├── components/       # Reusable components
    │   ├── services/         # API client
    │   ├── App.js
    │   └── index.js
    └── package.json
```

---

## 🔑 Key API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login (returns JWT token)

### Posts
- `GET /api/posts` - Get all posts (paginated, filterable by status)
- `GET /api/posts/:id` - Get single post with comments
- `POST /api/posts` - Create post (auth required)
- `PUT /api/posts/:id` - Update post (auth required)
- `DELETE /api/posts/:id` - Delete post (auth required)

### Categories
- `GET /api/categories` - Get all categories
- `POST /api/categories` - Create category (auth required)

### Tags
- `GET /api/tags` - Get all tags
- `POST /api/tags` - Create tag (auth required)

### Comments
- `GET /api/posts/:id/comments` - Get post comments
- `POST /api/posts/:id/comments` - Add comment
- `PUT /api/comments/:id/approve` - Approve comment (auth required)

### Health Check
- `GET /api/health` - Server & database status

---

## 📊 Database Schema

### Tables

**users**
- id (Primary Key)
- username (Unique)
- email (Unique)
- password (Hashed)
- role (editor/admin)
- created_at (Timestamp)

**posts**
- id (Primary Key)
- title
- slug (URL-friendly)
- content
- excerpt
- author_id (Foreign Key → users)
- category_id (Foreign Key → categories)
- status (draft/published)
- views (Counter)
- created_at, updated_at (Timestamps)

**categories**
- id (Primary Key)
- name (Unique)
- slug (Unique)
- description
- created_at

**tags**
- id (Primary Key)
- name (Unique)
- slug (Unique)
- created_at

**comments**
- id (Primary Key)
- post_id (Foreign Key → posts)
- author_name
- author_email
- content
- status (pending/approved/rejected)
- created_at

**post_tags** (Junction Table)
- post_id (Foreign Key)
- tag_id (Foreign Key)

---

## 🔧 Environment Variables

Create a `.env` file in the backend directory (copy from `.env.example`):

```env
# Server
PORT=5000
NODE_ENV=development
JWT_SECRET=change-this-to-a-random-string-in-production

# Database
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=your_password
DB_NAME=cms_database
```

---

## 🚨 Troubleshooting

### PostgreSQL Issues

**Error: "could not connect to database"**
- Make sure PostgreSQL is running
- Check DB credentials in `.env`
- Verify PostgreSQL port (default: 5432)

**Error: "database 'cms_database' does not exist"**
- Run `npm run setup-db` to create the database

See [POSTGRESQL_SETUP.md](./POSTGRESQL_SETUP.md) for more PostgreSQL troubleshooting.

### Port Already in Use

**Change backend port:**
Edit `.env`:
```env
PORT=5001
```

**Change frontend port:**
```bash
PORT=3001 npm start
```

### Dependencies Installation Issues

```bash
npm install --legacy-peer-deps
```

### Frontend Can't Connect to Backend

Make sure backend is running on `http://localhost:5000`

---

## 📦 Building for Production

### Frontend Build

```bash
cd frontend
npm run build
```

Creates optimized production build in `frontend/build/`

### Backend Deployment

1. Set `NODE_ENV=production` in `.env`
2. Use a strong `JWT_SECRET`
3. Consider using a managed PostgreSQL service (AWS RDS, Heroku Postgres, etc.)
4. Use a Node process manager (PM2, Forever, Systemd)
5. Set up SSL/TLS with Nginx or Apache
6. Enable HTTPS

---

## 🛡️ Security Best Practices

- ✅ Change JWT_SECRET in production
- ✅ Use strong database passwords
- ✅ Keep dependencies updated
- ✅ Use environment variables for secrets
- ✅ Enable HTTPS in production
- ✅ Validate and sanitize user input
- ✅ Use CORS carefully
- ✅ Regular database backups
- ✅ Monitor access logs

---

## 💡 Tips & Tricks

1. **Create categories first** before creating posts
2. **Use drafts** to prepare content
3. **Moderate comments** regularly
4. **Update dependencies** periodically: `npm update`
5. **Monitor database** size and performance
6. **Back up database** regularly

---

## 🎯 Next Steps

1. Complete [PostgreSQL Setup](./POSTGRESQL_SETUP.md)
2. Run the backend and frontend
3. Create your first account
4. Start creating content!
5. Customize styling in `frontend/src/App.css`
6. Deploy to your hosting platform

---

## 📄 License

This CMS is provided for educational and commercial use.

---

## 🤝 Support

**Common Issues:**
- Backend won't start? Check PostgreSQL is running
- Database error? Run `npm run setup-db`
- Port conflict? Change PORT in `.env`
- Frontend blank? Check browser console for errors

**Health Check:** 
Visit `http://localhost:5000/api/health` to verify backend is running with database connection.

---

**Happy Content Creating! 🎉**

#   C o n t e n t - M a n a g e m e n t - S y s t e m  
 