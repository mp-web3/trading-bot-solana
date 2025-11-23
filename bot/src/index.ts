import dotenv from 'dotenv';
import path from 'path';
import { jupiterClient } from './api/jupiter';
import { dataSaver } from './utils/data-saver';

// Load environment variables from shared folder
dotenv.config({ path: path.join(__dirname, '../shared/.env') });

console.log('🚀 Birdeye Trading Bot Starting...');
console.log('📡 Using Jupiter API (Free - No API Key Required)\n');

async function analyzeTokens() {
  try {
    console.log('🔍 Fetching recent tokens from Jupiter...');
    const recentTokens = await jupiterClient.getRecentTokens();
    console.log(`✅ Found ${recentTokens.length} recently launched tokens\n`);

    // Filter for meme token criteria
    console.log('🎯 Filtering for meme token opportunities...');
    const memeTokens = jupiterClient.filterMemeTokens(recentTokens, {
      maxMarketCap: 500000,  // Under $500k market cap
      minLiquidity: 5000,    // At least $5k liquidity
      minHolderCount: 50,    // At least 50 holders
      requireAuditPass: true, // Safety checks
    });

    console.log(`📊 Found ${memeTokens.length} tokens matching criteria\n`);

    // Score and rank tokens
    const scoredTokens = memeTokens
      .map(token => ({
        ...token,
        score: jupiterClient.scoreToken(token),
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 10); // Top 10

    // Display top 5 tokens
    console.log('🏆 Top 5 Meme Token Opportunities:\n');
    scoredTokens.slice(0, 5).forEach((token, i) => {
      console.log(`${i + 1}. ${token.symbol} (${token.name})`);
      console.log(`   Score: ${token.score}/50`);
      console.log(`   Market Cap: $${(token.mcap || 0).toLocaleString()}`);
      console.log(`   Liquidity: $${(token.liquidity || 0).toLocaleString()}`);
      console.log(`   Holders: ${token.holderCount || 0}`);
      const buyVol = token.stats24h?.buyVolume || 0;
      const sellVol = token.stats24h?.sellVolume || 0;
      console.log(`   24h Volume: $${(buyVol + sellVol).toLocaleString()}`);
      console.log(`   Price Change: ${token.stats24h?.priceChange || 0}%`);
      console.log(`   Organic Score: ${token.organicScoreLabel || 'unknown'}`);
      console.log('');
    });

    // Save data for Python analysis
    dataSaver.saveTokenSnapshot(recentTokens, 'latest_tokens.json');
    dataSaver.logAnalysis({
      topTokens: scoredTokens,
      scores: Object.fromEntries(
        scoredTokens.map(t => [t.symbol, t.score])
      ),
      metadata: {
        totalScanned: recentTokens.length,
        filtered: memeTokens.length,
        topCount: scoredTokens.length,
      },
    });

    console.log('💾 Data saved for Python analysis!\n');

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
