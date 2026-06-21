# PostgreSQL Setup Guide for CMS

This guide will help you install and configure PostgreSQL for the CMS application.

## 📦 Installing PostgreSQL

### Windows

1. Download PostgreSQL installer from https://www.postgresql.org/download/windows/
2. Run the installer and follow the wizard
3. **Important**: Remember the password you set for the `postgres` user
4. During installation, keep the default port (5432)
5. Complete the installation

**Verify Installation:**
```bash
psql --version
```

### macOS

Using Homebrew (recommended):
```bash
brew install postgresql
```

If you don't have Homebrew, install it first from https://brew.sh/

**Start PostgreSQL:**
```bash
brew services start postgresql
```

**Verify Installation:**
```bash
psql --version
```

### Linux (Ubuntu/Debian)

```bash
sudo apt-get update
sudo apt-get install postgresql postgresql-contrib
```

**Start PostgreSQL:**
```bash
sudo service postgresql start
```

**Verify Installation:**
```bash
psql --version
```

---

## 🗄️ Initial Setup

### Step 1: Access PostgreSQL

Open a terminal/command prompt and connect to PostgreSQL:

```bash
psql -U postgres
```

You'll be prompted to enter the password you set during installation.

### Step 2: Create a Super User (Optional but Recommended)

While logged in as postgres, you can create a dedicated user. But the default postgres user will work fine.

### Step 3: Test the Connection

If you're in the psql prompt, type:
```sql
\l
```

This lists all databases. You should see the default `postgres` database.

Type `\q` to exit.

---

## 🔧 CMS-Specific Setup

### Step 1: Configure Backend

1. Navigate to the backend directory:
```bash
cd backend
```

2. Update the `.env` file with your PostgreSQL credentials:
```env
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=your_postgres_password
DB_NAME=cms_database
```

### Step 2: Install Dependencies

```bash
npm install
```

### Step 3: Run Database Setup

This script will automatically:
- Create the database user (cms_user)
- Create the database (cms_database)
- Create all necessary tables
- Create indexes for performance

```bash
npm run setup-db
```

**Expected Output:**
```
🚀 Starting database setup...

✅ Connected to PostgreSQL server
✅ Created user: cms_user
✅ Created database: cms_database
✅ Granted privileges to cms_user

📋 Creating tables...

✅ Created users table
✅ Created categories table
✅ Created posts table
✅ Created tags table
✅ Created post_tags junction table
✅ Created comments table
✅ Created database indexes

✅ ✅ ✅ Database setup completed successfully! ✅ ✅ ✅
```

---

## ✅ Verifying Your Setup

### Check if PostgreSQL is Running

**Windows:**
1. Open Task Manager
2. Look for `postgres.exe` in the processes

**macOS/Linux:**
```bash
brew services list  # macOS
sudo service postgresql status  # Linux
```

### Test Connection from Node.js

From the backend directory:
```bash
node -e "const pool = require('./db'); pool.query('SELECT NOW()').then(r => console.log(r.rows[0])).catch(e => console.log(e.message))"
```

### Access Database via pgAdmin (Optional)

pgAdmin is a visual tool for managing PostgreSQL:

1. Install pgAdmin from https://www.pgadmin.org/
2. Open pgAdmin
3. Create a connection to localhost:5432
4. Use credentials: postgres / your_password
5. You should see the `cms_database` database

---

## 🚀 Running the CMS

### Terminal 1 - Backend

```bash
cd backend
npm start
```

You should see:
```
✅ Connected to PostgreSQL database
🚀 CMS Backend running on http://localhost:5000
```

### Terminal 2 - Frontend

```bash
cd frontend
npm start
```

The browser will automatically open to http://localhost:3000

---

## 🐛 Troubleshooting

### Error: "FATAL: role 'postgres' does not exist"

**Solution:** PostgreSQL user might not be configured correctly.

Try:
```bash
psql -h localhost -U postgres -c "SELECT 1"
```

If it fails, reinstall PostgreSQL and ensure you configure the postgres user.

### Error: "could not connect to server"

**Solution:** PostgreSQL might not be running.

**Start PostgreSQL:**
- **Windows:** Search for "Services" → Find PostgreSQL → Start it
- **macOS:** `brew services start postgresql`
- **Linux:** `sudo service postgresql start`

### Error: "database 'cms_database' does not exist"

**Solution:** Run the setup script again:
```bash
npm run setup-db
```

Make sure to use the correct postgres password in `.env`

### Error: "password authentication failed"

**Solution:** Check your `.env` file. The DB_PASSWORD should match your postgres password.

If you forgot the password, you'll need to:
1. Reset the postgres user password (varies by OS)
2. Or reinstall PostgreSQL

### Error: "Port 5432 already in use"

**Solution:** PostgreSQL is running but your `.env` has the wrong port.

Check what port PostgreSQL is using:
```bash
psql -h localhost -l
```

Update `.env` accordingly.

---

## 📚 PostgreSQL Basic Commands

Once connected to psql:

```sql
\l                    -- List all databases
\du                   -- List all users/roles
\c cms_database       -- Connect to cms_database
\dt                   -- List all tables
\d posts              -- Describe posts table
SELECT COUNT(*) FROM posts;  -- Count posts
\q                    -- Quit
```

---

## 🔐 Production Recommendations

For production deployment:

1. **Change Credentials**: Use strong, unique passwords
2. **Limit Connections**: Set max_connections in postgresql.conf
3. **Enable SSL**: Use SSL connections to PostgreSQL
4. **Backups**: Set up regular automated backups
5. **Monitoring**: Use tools like pg_stat_statements to monitor queries
6. **Connection Pooling**: Consider using PgBouncer for connection pooling
7. **Security**: Use environment variables, never commit .env files

---

## 📖 Additional Resources

- PostgreSQL Official Docs: https://www.postgresql.org/docs/
- pgAdmin: https://www.pgadmin.org/
- Node-postgres (pg) Documentation: https://node-postgres.com/
- PostgreSQL Performance Tips: https://www.postgresql.org/docs/current/performance-tips.html

---

## 🎉 You're Ready!

Once setup-db completes successfully, your CMS is ready to use with a professional PostgreSQL database!
