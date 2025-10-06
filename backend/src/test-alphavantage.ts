import 'dotenv/config';
import { alphaVantageClient } from './services/alphavantage';

async function testAlphaVantageAPI() {
  console.log('Testing Alpha Vantage API...');
  
  // Test single quote
  console.log('\nTesting single quote for AAPL:');
  const appleQuote = await alphaVantageClient.getQuote('AAPL');
  console.log(appleQuote);
  
  // Test multiple quotes
  console.log('\nTesting multiple quotes:');
  const symbols = ['MSFT', 'GOOGL'];
  const quotes = await alphaVantageClient.getMultipleQuotes(symbols);
  console.log(quotes);
  
  console.log('\nTest completed!');
}

testAlphaVantageAPI().catch(error => {
  console.error('Test failed:', error);
});