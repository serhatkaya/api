const { Pool } = require("pg");

async function getDb() {
  const pool = new Pool({
    connectionString: process.env.POSTGRES_URL,
  });

  try {
    // Check if users table exists
    const usersTableExists = await pool.query(
      `SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'users'
      )`
    );

    // Check if tasks table exists
    const tasksTableExists = await pool.query(
      `SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'tasks'
      )`
    );

    // If users table doesn't exist, create it
    if (!usersTableExists.rows[0].exists) {
      await pool.query(
        `CREATE TABLE users (
          id SERIAL PRIMARY KEY,
          username TEXT NOT NULL UNIQUE,
          password TEXT NOT NULL
        )`
      );
    }

    // If tasks table doesn't exist, create it
    if (!tasksTableExists.rows[0].exists) {
      await pool.query(
        `CREATE TABLE tasks (
          id SERIAL PRIMARY KEY,
          task_number INTEGER,
          title TEXT,
          description TEXT,
          status TEXT,
          user_id INTEGER REFERENCES users(id) ON DELETE CASCADE
        )`
      );
    }
  } catch (err) {
    console.error("Error initializing database:", err);
  }

  return pool;
}

module.exports = { getDb };
