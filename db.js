require("dotenv").config(); // Load environment variables from .env file
const { Pool } = require("pg");

const pool = new Pool({
  user: process.env.DB_USER, // PostgreSQL username
  host: process.env.DB_HOST, // Database host
  database: process.env.DB_NAME, // Database name
  password: process.env.DB_PASSWORD, // Database password
  port: process.env.DB_PORT || 5432, // Default PostgreSQL port
});

// Function to test database connection
pool.connect()
  .then(client => {
    console.log("✅ Database connected successfully!");
    client.release();
  })
  .catch(err => {
    console.error("❌ Database connection failed!");
    // Log error details securely (avoid exposing stack trace in production)
    console.error(err.message);
  });

module.exports = pool;
