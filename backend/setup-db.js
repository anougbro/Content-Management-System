const { Client } = require('pg');
require('dotenv').config();

const adminClient = new Client({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || '',
  database: 'postgres', // Connect to default postgres database first
});

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  user: process.env.DB_USER || 'cms_user',
  password: process.env.DB_PASSWORD || 'cms_password_123',
  database: process.env.DB_NAME || 'cms_database',
};

const setupDatabase = async () => {
  console.log('🚀 Starting database setup...\n');

  try {
    // Connect as admin to create database and user
    await adminClient.connect();
    console.log('✅ Connected to PostgreSQL server');

    // Create user if not exists
    try {
      await adminClient.query(`CREATE USER ${dbConfig.user} WITH PASSWORD '${dbConfig.password}';`);
      console.log(`✅ Created user: ${dbConfig.user}`);
    } catch (err) {
      if (err.message.includes('already exists')) {
        console.log(`ℹ️  User ${dbConfig.user} already exists`);
      } else {
        throw err;
      }
    }

    // Create database if not exists
    try {
      await adminClient.query(`CREATE DATABASE ${dbConfig.database} OWNER ${dbConfig.user};`);
      console.log(`✅ Created database: ${dbConfig.database}`);
    } catch (err) {
      if (err.message.includes('already exists')) {
        console.log(`ℹ️  Database ${dbConfig.database} already exists`);
      } else {
        throw err;
      }
    }

    // Grant privileges
    await adminClient.query(`GRANT ALL PRIVILEGES ON DATABASE ${dbConfig.database} TO ${dbConfig.user};`);
    console.log(`✅ Granted privileges to ${dbConfig.user}`);

    await adminClient.end();

    // Now connect to the new database to create tables
    const appClient = new Client(dbConfig);
    await appClient.connect();
    console.log('✅ Connected to CMS database\n');

    console.log('📋 Creating tables...\n');

    // Create users table
    await appClient.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(255) UNIQUE NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        role VARCHAR(50) DEFAULT 'editor',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('✅ Created users table');

    // Create categories table
    await appClient.query(`
      CREATE TABLE IF NOT EXISTS categories (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) UNIQUE NOT NULL,
        slug VARCHAR(255) UNIQUE NOT NULL,
        description TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('✅ Created categories table');

    // Create posts table
    await appClient.query(`
      CREATE TABLE IF NOT EXISTS posts (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        slug VARCHAR(255) UNIQUE NOT NULL,
        content TEXT NOT NULL,
        excerpt TEXT,
        author_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        category_id INTEGER REFERENCES categories(id) ON DELETE SET NULL,
        status VARCHAR(50) DEFAULT 'draft',
        featured_image VARCHAR(255),
        views INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT valid_status CHECK (status IN ('draft', 'published'))
      );
    `);
    console.log('✅ Created posts table');

    // Create tags table
    await appClient.query(`
      CREATE TABLE IF NOT EXISTS tags (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) UNIQUE NOT NULL,
        slug VARCHAR(255) UNIQUE NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('✅ Created tags table');

    // Create post_tags junction table
    await appClient.query(`
      CREATE TABLE IF NOT EXISTS post_tags (
        post_id INTEGER NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
        tag_id INTEGER NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
        PRIMARY KEY (post_id, tag_id)
      );
    `);
    console.log('✅ Created post_tags junction table');

    // Create comments table
    await appClient.query(`
      CREATE TABLE IF NOT EXISTS comments (
        id SERIAL PRIMARY KEY,
        post_id INTEGER NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
        author_name VARCHAR(255) NOT NULL,
        author_email VARCHAR(255) NOT NULL,
        content TEXT NOT NULL,
        status VARCHAR(50) DEFAULT 'pending',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT valid_comment_status CHECK (status IN ('pending', 'approved', 'rejected'))
      );
    `);
    console.log('✅ Created comments table');

    // Create indexes for better performance
    await appClient.query(`CREATE INDEX IF NOT EXISTS idx_posts_author_id ON posts(author_id);`);
    await appClient.query(`CREATE INDEX IF NOT EXISTS idx_posts_category_id ON posts(category_id);`);
    await appClient.query(`CREATE INDEX IF NOT EXISTS idx_posts_status ON posts(status);`);
    await appClient.query(`CREATE INDEX IF NOT EXISTS idx_comments_post_id ON comments(post_id);`);
    await appClient.query(`CREATE INDEX IF NOT EXISTS idx_comments_status ON comments(status);`);
    await appClient.query(`CREATE INDEX IF NOT EXISTS idx_post_tags_post_id ON post_tags(post_id);`);
    await appClient.query(`CREATE INDEX IF NOT EXISTS idx_post_tags_tag_id ON post_tags(tag_id);`);
    console.log('✅ Created database indexes');

    await appClient.end();

    console.log('\n✅ ✅ ✅ Database setup completed successfully! ✅ ✅ ✅');
    console.log('\n📝 Database Configuration:');
    console.log(`   Host: ${dbConfig.host}`);
    console.log(`   Port: ${dbConfig.port}`);
    console.log(`   Database: ${dbConfig.database}`);
    console.log(`   User: ${dbConfig.user}`);
    console.log('\n🚀 You can now start the server with: npm start\n');

  } catch (err) {
    console.error('❌ Database setup error:', err.message);
    process.exit(1);
  }
};

// Run setup
setupDatabase();
