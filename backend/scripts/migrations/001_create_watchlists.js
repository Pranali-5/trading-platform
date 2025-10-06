/**
 * Migration: Create watchlists and watchlist_items tables
 */

async function up(connection) {
  // Create watchlists table
  await connection.query(`
    CREATE TABLE IF NOT EXISTS watchlists (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(100) NOT NULL,
      user_id VARCHAR(100) NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      INDEX idx_user_id (user_id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `);

  // Create watchlist_items table
  await connection.query(`
    CREATE TABLE IF NOT EXISTS watchlist_items (
      id INT AUTO_INCREMENT PRIMARY KEY,
      watchlist_id INT NOT NULL,
      symbol VARCHAR(20) NOT NULL,
      added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (watchlist_id) REFERENCES watchlists(id) ON DELETE CASCADE,
      UNIQUE KEY unique_watchlist_symbol (watchlist_id, symbol)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `);

  console.log('Created watchlists and watchlist_items tables');
}

async function down(connection) {
  // Drop tables in reverse order
  await connection.query('DROP TABLE IF EXISTS watchlist_items;');
  await connection.query('DROP TABLE IF EXISTS watchlists;');
  
  console.log('Dropped watchlists and watchlist_items tables');
}

module.exports = { up, down };