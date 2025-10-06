import { createWatchlist, addItemToWatchlist, getWatchlistWithItems } from './models/watchlist.js';

async function testWatchlistFunctionality() {
  try {
    console.log('Testing watchlist functionality...');
    console.log('Note: This test requires a running MySQL database.');
    console.log('If you encounter connection errors, please ensure the database is running.');
    
    // Create a test watchlist
    const userId = 'test-user';
    const watchlistName = 'Test Watchlist';
    
    console.log(`Creating watchlist: ${watchlistName} for user: ${userId}`);
    const watchlistId = await createWatchlist({ name: watchlistName, user_id: userId });
    console.log(`Watchlist created with ID: ${watchlistId}`);
    
    // Add items to the watchlist
    const symbols = ['AAPL', 'MSFT', 'GOOGL'];
    for (const symbol of symbols) {
      console.log(`Adding ${symbol} to watchlist`);
      await addItemToWatchlist({ watchlist_id: watchlistId, symbol });
    }
    
    // Retrieve the watchlist with items
    const watchlist = await getWatchlistWithItems(watchlistId);
    console.log('Retrieved watchlist with items:');
    console.log(JSON.stringify(watchlist, null, 2));
    
    // Verify the items
    if (watchlist && watchlist.items.length === symbols.length) {
      console.log('✅ Test passed: All symbols were added to the watchlist');
    } else {
      console.log('❌ Test failed: Not all symbols were added to the watchlist');
    }
    
    console.log('Watchlist testing completed');
  } catch (error) {
    console.error('Error during watchlist testing:', error);
  }
}

// Run the test
testWatchlistFunctionality();