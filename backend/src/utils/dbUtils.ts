import * as sql from 'mssql';
import { poolPromise } from '../config/db';

export async function executeQuery(query: string, params?: any[]): Promise<any> {
  try {
    const pool = await poolPromise;
    if (!pool) throw new Error('Database connection failed.');
    const request = pool.request();

    // Add parameters if provided
    if (params && Array.isArray(params)) {
      params.forEach((param, index) => {
        request.input(`param${index}`, sql.NVarChar, param);
      });
    }

    const result = await request.query(query);
    console.log('Query executed successfully');
    return result;
  } catch (error) {
    console.error('Error executing query:', error);
    throw error;
  }
}

export async function createTables() {
  const queries = [
    // Create the users table if it doesn't exist
    `IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='users' AND xtype='U')
    CREATE TABLE users (
      id NVARCHAR(50) PRIMARY KEY,                -- Unique user ID (matches Firebase UID)
      email NVARCHAR(255) UNIQUE NOT NULL,         -- User's email address (must be unique)
      displayName NVARCHAR(255),                   -- User's display name
      photoURL NVARCHAR(500),                      -- URL to user's profile photo
      createdAt DATETIME2 DEFAULT GETDATE(),       -- Timestamp when user was created
      updatedAt DATETIME2 DEFAULT GETDATE(),       -- Timestamp when user was last updated
      postCount INT DEFAULT 0                      -- Number of posts by the user
    )`,

    // Create the posts table if it doesn't exist
    `IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='posts' AND xtype='U')
    CREATE TABLE posts (
      id NVARCHAR(255) PRIMARY KEY,                -- Unique post ID
      userId NVARCHAR(50) NOT NULL,               -- ID of the user who created the post
      type NVARCHAR(10) DEFAULT 'Post',            -- Type of post (e.g., 'Post', 'Event')
      title NVARCHAR(45),                          -- Title of the post
      description NVARCHAR(MAX),                   -- Description/content of the post
      latitude DECIMAL(20,17),                     -- Latitude for geolocation
      latitudeDelta DECIMAL(20,17),                -- Latitude delta for map region
      longitude DECIMAL(20,17),                    -- Longitude for geolocation
      longitudeDelta DECIMAL(20,17),               -- Longitude delta for map region
      createdAt DATETIME2 DEFAULT GETDATE(),       -- Timestamp when post was created
      updatedAt DATETIME2 DEFAULT GETDATE(),       -- Timestamp when post was last updated
      private BIT DEFAULT 0,                        -- Boolean flag for private posts, default is false
      FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE -- Link to users table, cascade on delete
    )`,

    // Events table: stores event-specific data linked to a post
    `IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='events' AND xtype='U')
    CREATE TABLE events (
      postId NVARCHAR(255),           -- References the post this event is attached to
      eventStart DATETIME2,           -- Start time of the event
      eventEnd DATETIME2,             -- End time of the event
      PRIMARY KEY (postId),           -- Each event is uniquely identified by its postId
      FOREIGN KEY (postId) REFERENCES posts(id) ON DELETE CASCADE -- Cascade delete if post is removed
    )`,

    // Images table: stores image URLs associated with posts
    `IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='images' AND xtype='U')
    CREATE TABLE images (
      id NVARCHAR(255) PRIMARY KEY,         -- Unique identifier for the image
      postId NVARCHAR(255) NOT NULL,        -- The post this image belongs to
      imageUrl NVARCHAR(1000) NOT NULL,     -- URL of the image (could be a blob or external link)
      FOREIGN KEY (postId) REFERENCES posts(id) ON DELETE CASCADE -- Cascade delete if post is removed
    )`,

    `IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='tags' AND xtype='U')
    CREATE TABLE tags (
      id NVARCHAR(255) PRIMARY KEY,
      name NVARCHAR(100) UNIQUE NOT NULL
    )`,
    
    // Create the post_tags table to associate posts with tags (many-to-many relationship)
    `IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='post_tags' AND xtype='U')
    CREATE TABLE post_tags (
      postId NVARCHAR(255) NOT NULL,    -- ID of the post
      tagId NVARCHAR(255) NOT NULL,     -- ID of the tag
      PRIMARY KEY (postId, tagId),      -- Composite primary key ensures uniqueness
      FOREIGN KEY (postId) REFERENCES posts(id) ON DELETE CASCADE, -- Cascade delete if post is removed
      FOREIGN KEY (tagId) REFERENCES tags(id) ON DELETE CASCADE    -- Cascade delete if tag is removed
    )`,
    `IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='post_viewer' AND xtype='U')
    CREATE TABLE post_viewer (
      post_id NVARCHAR(255) NOT NULL,         -- ID of the post being viewed
      user_id NVARCHAR(50) NOT NULL,         -- ID of the user who viewed the post
      created_by NVARCHAR(50) NOT NULL,      -- Who created the view record (usually same as user_id)
      PRIMARY KEY (post_id, user_id),
      FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
      FOREIGN KEY (user_id) REFERENCES users(id)  -- No cascade to avoid multiple cascade paths
    )`,

    `IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'idx_post_tags_postId')
    CREATE INDEX idx_post_tags_postId ON post_tags(postId)`,

    `IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'idx_post_tags_tagId')
    CREATE INDEX idx_post_tags_tagId ON post_tags(tagId)`,

    `IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'idx_posts_userId')
    CREATE INDEX idx_posts_userId ON posts(userId)`,

    `IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'idx_posts_createdAt')
    CREATE INDEX idx_posts_createdAt ON posts(createdAt)`,

    `IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'idx_users_id')
    CREATE INDEX idx_users_id ON users(id)`,

    `IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'idx_images_postId')
    CREATE INDEX idx_images_postId ON images(postId)`,

    `IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'idx_posts_userId')
    CREATE INDEX idx_posts_userId ON posts(userId)`,

    `IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'idx_post_viewer_post_user')
    CREATE INDEX idx_post_viewer_post_user ON post_viewer(post_id, user_id)`
  ];



  for (const query of queries) {
    try {
      await executeQuery(query);
      console.log('Table/Index created successfully');
    } catch (error) {
      console.error('Error creating table/index:', error);
    }
  }
}

// Function to run a single custom query
export async function runCustomQuery(query: string): Promise<any> {
  return await executeQuery(query);
}

// // Example usage functions
// export async function insertTestUser() {
//   const query = `
//     INSERT INTO users (id, email, displayName, photoURL)
//     VALUES (@param0, @param1, @param2, @param3)
//   `;

//   return await executeQuery(query, [
//     'test-user-1',
//     'test@example.com',
//     'Test User',
//     'https://example.com/photo.jpg'
//   ]);
// }

// export async function insertTestPost() {
//   const query = `
//     INSERT INTO posts (id, userId, content, images, location, latitude, longitude)
//     VALUES (@param0, @param1, @param2, @param3, @param4, @param5, @param6)
//   `;

//   return await executeQuery(query, [
//     'test-post-1',
//     'test-user-1',
//     'This is a test post!',
//     '["https://example.com/image1.jpg"]',
//     'Test Location',
//     40.7128,
//     -74.006
//   ]);
// }