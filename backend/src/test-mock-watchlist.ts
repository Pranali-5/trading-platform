import * as mockWatchlist from './models/mock-watchlist';

async function testMockWatchlistFunctionality() {
  try {
    console.log('Testing mock watchlist functionality...');
    
    // Create a test watchlist
    const userId = 'test-user';
    const watchlistName = 'Test Watchlist';
    
    console.log(`Creating watchlist: ${watchlistName} for user: ${userId}`);
    const watchlist = await mockWatchlist.createWatchlist(watchlistName, userId);
    const watchlistId = watchlist.id ?? 0; // Ensure watchlistId is a number, not undefined
    if (watchlistId === 0) {
      throw new Error('Failed to create watchlist: Invalid ID');
    }
    console.log(`Watchlist created with ID: ${watchlistId}`);
    
    // Add items to the watchlist
    const symbols = ['AAPL', 'MSFT', 'GOOGL'];
    for (const symbol of symbols) {
      console.log(`Adding ${symbol} to watchlist`);
      await mockWatchlist.addItemToWatchlist(watchlistId as number, symbol);
    }
    
    // Retrieve the watchlist with items
    const retrievedWatchlist = await mockWatchlist.getWatchlistWithItems(watchlistId as number);
    console.log('Retrieved watchlist with items:');
    console.log(JSON.stringify(retrievedWatchlist, null, 2));
    
    // Verify the items
    if (retrievedWatchlist && retrievedWatchlist.items.length === symbols.length) {
      console.log('✅ Test passed: All symbols were added to the watchlist');
    } else {
      console.log('❌ Test failed: Not all symbols were added to the watchlist');
    }
    
    // Test removing an item
    const symbolToRemove = 'AAPL';
    console.log(`Removing ${symbolToRemove} from watchlist`);
    const removed = await mockWatchlist.removeItemFromWatchlist(watchlistId as number, symbolToRemove);
    if (removed) {
      console.log(`✅ Test passed: ${symbolToRemove} was removed from the watchlist`);
    } else {
      console.log(`❌ Test failed: ${symbolToRemove} was not removed from the watchlist`);
    }
    
    // Verify the updated watchlist
    const updatedWatchlist = await mockWatchlist.getWatchlistWithItems(watchlistId as number);
    console.log('Updated watchlist with items:');
    console.log(JSON.stringify(updatedWatchlist, null, 2));
    
    if (updatedWatchlist && updatedWatchlist.items && updatedWatchlist.items.length === symbols.length - 1) {
      console.log('✅ Test passed: Watchlist has the correct number of items after removal');
    } else {
      console.log('❌ Test failed: Watchlist does not have the correct number of items after removal');
    }
    
    console.log('Mock watchlist tests completed successfully!');
  } catch (error) {
    console.error('Error during mock watchlist testing:', error);
  }
}

testMockWatchlistFunctionality().catch(error => {
  console.error('Test failed with error:', error);
});