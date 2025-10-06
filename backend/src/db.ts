import mysql from 'mysql2/promise';

export async function createPool() {
  try {
    const pool = mysql.createPool({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'app',
      password: process.env.DB_PASSWORD || 'app',
      database: process.env.DB_NAME || 'trading',
      port: process.env.DB_PORT ? Number(process.env.DB_PORT) : 3306,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
      connectTimeout: 10000 // 10 seconds timeout
    });
    
    // Test the connection
    try {
      await pool.query('SELECT 1');
      console.log('Database connection successful');
    } catch (error: unknown) {
      console.error('Database connection test failed:', error instanceof Error ? error.message : String(error));
    }
    
    return pool;
  } catch (error: unknown) {
    console.error('Failed to create database pool:', error instanceof Error ? error.message : String(error));
    throw error;
  }
}


