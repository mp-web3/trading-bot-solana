import dotenv from 'dotenv';
import path from 'path';
import { dataSaver } from './utils/data-saver';

// Load environment variables from shared folder
dotenv.config({ path: path.join(__dirname, '../shared/.env') });

console.log('🚀 Solana Trading Bot Starting...');
console.log('📡 Using SolanaTracker API (Exclusive Data Source)\n');

async function analyzeTokens() {
  try {
    console.log('🔍 Fetching recent tokens from SolanaTracker...');
    console.log('⚠️  SolanaTracker API client not yet implemented');
    console.log('📝 Next steps:');
    console.log('   1. Create SolanaTracker API client');
    console.log('   2. Implement token fetching');
    console.log('   3. Use TokenMapper to convert to unified model');
    console.log('   4. Apply filtering and scoring logic\n');
  } catch (error: any) {
    console.error('❌ Error:', error.message);
  }
}

async function main() {
  console.log('Bot is running...\n');

  // Run initial analysis
  await analyzeTokens();

  // Run every 5 minutes
  console.log('⏰ Scheduling analysis every 5 minutes...');
  setInterval(analyzeTokens, 5 * 60 * 1000);
}

main().catch(console.error);
