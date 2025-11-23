# Type System Architecture

This document describes the complete type system for the Solana Memecoin Trading Bot, designed with **SolanaTracker as the primary data source**.

## 📁 Directory Structure

```
bot/src/types/
├── api/                          # Raw API response types
│   ├── index.ts
│   ├── solanatracker.ts         # PRIMARY DATA SOURCE ⭐
│   ├── jupiter.ts
│   └── dexscreener.ts
│
├── entities/                     # Unified domain models
│   ├── index.ts
│   ├── token.ts                 # Complete token model
│   └── wallet.ts                # Complete wallet model
│
└── enums/                        # Enumerations & constants
    ├── index.ts
    ├── dex.ts
    ├── status.ts
    ├── strategy.ts
    └── trader.ts

bot/src/services/mappers/
├── index.ts
├── token-mapper.ts              # API → Token entity
└── wallet-mapper.ts             # API → Wallet entity
```

## 🎯 Design Philosophy

### 1. **Separation of Concerns**

**API Types** (`types/api/*`)
- Represent **exactly** what external APIs return
- No modifications or computed fields
- One file per API source
- Source of truth for API contracts

**Entity Types** (`types/entities/*`)
- Our **internal** domain models
- Unified view combining multiple sources
- Enriched with computed/derived fields
- Application-centric structure

**Mappers** (`services/mappers/*`)
- Convert API responses → Entity models
- Handle missing data gracefully
- Apply business logic
- Create derived metrics

### 2. **SolanaTracker-First Architecture**

```
Priority Order:
1. SolanaTracker (Primary)    - 80% of data needs
2. Jupiter (Secondary)         - Organic score, swaps
3. DexScreener (Tertiary)      - Multi-DEX breakdown
```

**Why SolanaTracker?**
- ✅ Pre-computed PnL (saves days of work!)
- ✅ Risk assessment API (unique!)
- ✅ Top traders identification (smart money!)
- ✅ Multi-timeframe data (5m, 15m, 30m, 1h, 6h, 12h, 24h)
- ✅ Holder concentration metrics
- ✅ LP burn tracking
- ✅ Fee metrics

## 📦 Core Types

### Token Entity

```typescript
interface Token {
  // Core identifiers
  mintAddress: string;
  symbol: string;
  name: string;
  decimals: number;
  
  // Structured data
  launch: TokenLaunch;              // Launch info & developer
  market: TokenMarket;              // Price & market cap
  liquidity: TokenLiquidity;        // Multi-DEX liquidity
  holders: TokenHolders;            // Distribution & smart money
  activity: TokenActivity;          // Volume & transactions
  security: TokenSecurity;          // Authorities & LP burn
  risk: TokenRisk;                  // Risk assessment (from SolanaTracker!)
  quality: TokenQuality;            // Organic score, etc
  analytics: TokenAnalytics;        // Our computed scores
  metadata: TokenMetadata;          // Social, images, etc
  system: TokenSystemInfo;          // Internal tracking
}
```

**Key Features:**
- **Smart Money Tracking**: `holders.smartMoney` contains count, addresses, and sentiment
- **Risk Assessment**: Pre-computed from SolanaTracker Risk API
- **Multi-timeframe Volume**: 5m, 15m, 30m, 1h, 6h, 12h, 24h
- **Holder Concentration**: Top 10%, dev%, insiders%, snipers%
- **LP Burn**: Critical safety metric (0-100%)

### Wallet Entity

```typescript
interface Wallet {
  address: string;
  
  classification: WalletClassification;  // Type, tier, traits
  performance: WalletPerformance;        // PnL, win rate, ROI (from ST!)
  timing: WalletTiming;                  // Entry/exit patterns
  behavior: WalletBehavior;              // Trading patterns
  portfolio: WalletPortfolio;            // Current holdings (from ST!)
  history: WalletHistory;                // Trade history
  system: WalletSystemInfo;              // Internal tracking
}
```

**Key Features:**
- **Pre-computed PnL**: From SolanaTracker PnL API (no need to calculate!)
- **Trader Tiers**: Bronze → Silver → Gold → Platinum → Diamond
- **Trading Patterns**: Scalper, Day Trader, Swing Trader, Holder
- **Win Rate & ROI**: Already calculated by SolanaTracker
- **Success/Failed Tokens**: Per-token breakdown

## 🔄 Data Flow

### Token Discovery & Enrichment

```typescript
// 1. Fetch from SolanaTracker (primary)
const stResponse = await solanaTrackerApi.searchTokens({
  minLiquidity: 5000,
  maxTop10: 40,
  launchpad: 'pumpfun'
});

// 2. Get risk assessment (SolanaTracker unique feature!)
const riskData = await solanaTrackerApi.getTokenRisk(token.mint);

// 3. Optionally enrich with Jupiter (for organic score)
const jupiterData = await jupiterApi.getToken(token.mint);

// 4. Map to unified Token entity
const token = TokenMapper.fromSolanaTracker(
  stResponse.data[0],
  riskData.data,
  jupiterData
);

// 5. Save to database
await db.insertToken(token);
```

### Wallet/Smart Money Tracking

```typescript
// 1. Get top traders (SolanaTracker identifies them!)
const topTraders = await solanaTrackerApi.getTopTraders({
  minPnl: 10,
  minWinRate: 60,
  limit: 100
});

// 2. For each top trader, get detailed PnL
const pnlData = await solanaTrackerApi.getWalletPnL(trader.address);

// 3. Get current portfolio
const portfolio = await solanaTrackerApi.getWalletInfo(trader.address);

// 4. Map to unified Wallet entity
const wallet = WalletMapper.fromTopTrader(
  trader,
  pnlData.data,
  portfolio.data
);

// 5. Save to database
await db.insertWallet(wallet);
```

## 🎨 Usage Examples

### Example 1: Find High-Quality Tokens

```typescript
import { solanaTrackerApi } from './api/solanatracker-client';
import { TokenMapper } from './services/mappers';
import { RiskLevel } from './types/enums';

// Search for safe, liquid tokens
const response = await solanaTrackerApi.searchTokens({
  minLiquidity: 20000,
  maxTop10: 30,           // Not too concentrated
  maxDev: 10,             // Dev holds <10%
  lpBurn: 100,            // Fully burned
  mintAuthority: 'null',  // Disabled
  freezeAuthority: 'null',// Disabled
  sortBy: 'volume_24h',
  sortOrder: 'desc'
});

// Map and filter
const tokens = await Promise.all(
  response.data.map(async (stToken) => {
    const riskData = await solanaTrackerApi.getTokenRisk(stToken.mint);
    return TokenMapper.fromSolanaTracker(stToken, riskData.data);
  })
);

// Filter for low risk
const safeTokens = tokens.filter(t => 
  t.risk.overall.level === RiskLevel.LOW &&
  t.analytics.scores.overall > 60
);
```

### Example 2: Track Smart Money

```typescript
// Get top 50 traders
const topTraders = await solanaTrackerApi.getTopTraders({
  minWinRate: 70,
  minPnl: 50,
  limit: 50
});

// Find what they're buying NOW
for (const trader of topTraders.data) {
  const portfolio = await solanaTrackerApi.getWalletInfo(trader.address);
  
  // Check their recent positions
  for (const holding of portfolio.data.tokens) {
    const token = await getTokenFromDb(holding.mint);
    
    // Is this a new position? (not in our historical data)
    if (token && isNewPosition(trader.address, holding.mint)) {
      console.log(`🚨 Smart Money Alert!`);
      console.log(`${trader.address} (Win Rate: ${trader.winRate}%)`);
      console.log(`Just bought ${holding.symbol}`);
      console.log(`Token Score: ${token.analytics.scores.overall}`);
      
      // This is your entry signal!
    }
  }
}
```

### Example 3: Risk Assessment

```typescript
const token = await getToken(mintAddress);

// Pre-computed risk from SolanaTracker
if (token.risk.overall.level === RiskLevel.CRITICAL) {
  console.log('⛔ AVOID - Critical Risk!');
  console.log('Dangers:', token.risk.dangers);
  return;
}

if (token.risk.overall.level === RiskLevel.HIGH) {
  console.log('⚠️  High Risk - Proceed with caution');
  console.log('Warnings:', token.risk.warnings);
}

// Additional checks
if (token.security.lpBurn.percentage < 100) {
  console.log(`❌ LP not fully burned (${token.security.lpBurn.percentage}%)`);
}

if (token.holders.concentration.devPercentage > 20) {
  console.log(`❌ Dev holds ${token.holders.concentration.devPercentage}%`);
}

// Smart money validation
if (token.holders.smartMoney.count >= 3) {
  console.log(`✅ ${token.holders.smartMoney.count} smart wallets holding`);
  console.log(`✅ Sentiment: ${token.holders.smartMoney.recentActivity}`);
}
```

## 🔧 Extending the System

### Adding a New Data Source

1. **Create API types**: `types/api/newsource.ts`
2. **Create API client**: `api/newsource-client.ts`
3. **Update mappers**: Add to existing mappers or create new one
4. **Update entities**: Add new fields if needed

Example:
```typescript
// types/api/newsource.ts
export interface NewSourceTokenResponse {
  // ... API response shape
}

// services/mappers/token-mapper.ts
static fromMultipleSources(
  stToken: SolanaTrackerToken,
  newSourceData?: NewSourceTokenResponse
): Token {
  // ... merge data
}
```

### Adding New Entity Types

Create new files in `types/entities/`:
- `developer.ts` - Token creator tracking
- `trade.ts` - Trade execution records
- `position.ts` - Open position management
- `strategy.ts` - Strategy configurations

## 📚 Best Practices

### 1. **Always Use Mappers**
❌ Don't use API types directly in business logic
✅ Always convert to entity types via mappers

```typescript
// ❌ BAD
function analyzeToken(stToken: SolanaTrackerToken) {
  // Using raw API type in business logic
}

// ✅ GOOD
function analyzeToken(token: Token) {
  // Using unified entity type
}
```

### 2. **Handle Missing Data Gracefully**
APIs may return incomplete data:

```typescript
// Mappers handle this
const organicScore = jupiterData?.organicScore ?? 0;
const riskData = riskDataResponse?.data ?? this.calculateBasicRisk(stToken);
```

### 3. **Use Preview Types for Lists**
Don't load full entities for large lists:

```typescript
// For displaying 100s of tokens
const previews: TokenPreview[] = tokens.map(TokenMapper.toPreview);

// For detailed view of ONE token
const fullToken: Token = await getTokenDetails(mintAddress);
```

### 4. **Type Guards for Safety**
```typescript
function isTopTrader(wallet: Wallet): boolean {
  return wallet.classification.type === WalletType.TOP_TRADER &&
         wallet.classification.reputation.tier >= TraderTier.GOLD;
}
```

## 🚀 Next Steps

1. **Implement SolanaTracker Client** (`api/solanatracker-client.ts`)
2. **Set up Database Schema** (matching entity types)
3. **Create Data Collection Service** (using mappers)
4. **Build Analytics Engine** (using entity types)
5. **Implement Trading Strategies** (using entity types)

## 📖 API Documentation

- **SolanaTracker**: https://docs.solanatracker.io/data-api/
- **Jupiter**: https://docs.jup.ag/
- **DexScreener**: https://docs.dexscreener.com/

---

**Last Updated**: January 2025
**Status**: ✅ Complete Type System Ready for Implementation

