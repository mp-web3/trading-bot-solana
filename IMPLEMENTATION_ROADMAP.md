# 🚀 Solana Memecoin Trading Bot - Implementation Roadmap

## 📋 Table of Contents
- [Overview](#overview)
- [Project Goals](#project-goals)
- [Bootstrap Strategy (Free Tier First)](#bootstrap-strategy-free-tier-first)
- [Architecture Overview](#architecture-overview)
- [Data Sources](#data-sources)
- [Database Schema](#database-schema)
- [Scoring Algorithms](#scoring-algorithms)
- [Entry & Exit Strategies](#entry--exit-strategies)
- [Implementation Roadmap](#implementation-roadmap)
- [Success Metrics](#success-metrics)
- [When to Scale](#when-to-scale)
- [Cost Breakdown](#cost-breakdown)
- [Risk Management](#risk-management)

---

## Overview

This trading bot is designed to identify and trade profitable Solana memecoins by:
1. **Collecting** comprehensive on-chain and market data
2. **Analyzing** patterns from successful tokens and smart money wallets
3. **Scoring** tokens, wallets, and developers
4. **Executing** trades based on proven strategies

**Philosophy:** Validate first with free tools, then scale with paid infrastructure only after proving profitability.

---

## Project Goals

### Primary Objectives
- [ ] Build a comprehensive data collection pipeline for Solana memecoins
- [ ] Track and score: tokens, smart money wallets, and developers
- [ ] Identify high-probability entry and exit points
- [ ] Execute profitable trades with proper risk management
- [ ] Scale infrastructure based on proven results

### Success Criteria
- **Win Rate:** >50% of trades profitable
- **Profit Factor:** >2.0 (gross profit / gross loss)
- **Monthly ROI:** >20% after 3 months
- **Max Drawdown:** <30%
- **Consistency:** Profitable across different market conditions

---

## Bootstrap Strategy (Free Tier First)

### Why Start Free?
1. **Validate strategies** before committing to $300-500/month infrastructure
2. **Build historical data** that becomes your competitive advantage
3. **Learn patterns** specific to your trading style
4. **Avoid premature optimization** of infrastructure

### Free Tier Resources

| Resource      | Cost     | Limit              | Use Case                           |
| ------------- | -------- | ------------------ | ---------------------------------- |
| SolanaTracker | Variable | See pricing        | Token data, risk, wallets, traders |
| Helius Free   | Free     | 100k credits/month | RPC calls, token metadata          |
| SolScan API   | Free     | Rate limited       | Holder data, transactions          |
| SQLite        | Free     | Unlimited          | Local database for development     |
| Paper Trading | Free     | Unlimited          | Strategy validation                |

### Graduation Path
```
Free Tier (Weeks 1-10)
    ↓ Prove profitability
Helius Pro ($250/mo)
    ↓ Scale trades
VPS ($50-100/mo)
    ↓ Need faster execution
Jito Bundles (variable)
    ↓ Ready for production
Full Infrastructure ($300-500/mo)
```

---

## Architecture Overview

### Multi-Layer Data Pipeline

```
┌─────────────────────────────────────────┐
│   Layer 1: Data Ingestion               │
│   - Jupiter API (recent tokens)         │
│   - DexScreener (pairs, liquidity)      │
│   - SolScan (holders, transactions)     │
│   - Helius (RPC, metadata)              │
└─────────────────────────────────────────┘
                  ↓
┌─────────────────────────────────────────┐
│   Layer 2: Data Enrichment              │
│   - Fetch additional metrics            │
│   - Calculate derived fields            │
│   - Normalize data formats              │
└─────────────────────────────────────────┘
                  ↓
┌─────────────────────────────────────────┐
│   Layer 3: Storage (SQLite → PostgreSQL)│
│   - Tokens table                        │
│   - Token snapshots (time-series)       │
│   - Wallets & wallet trades             │
│   - Developers                          │
└─────────────────────────────────────────┘
                  ↓
┌─────────────────────────────────────────┐
│   Layer 4: Analytics Engine             │
│   - Pattern detection                   │
│   - Scoring algorithms                  │
│   - Smart money identification          │
│   - Success pattern analysis            │
└─────────────────────────────────────────┘
                  ↓
┌─────────────────────────────────────────┐
│   Layer 5: Decision Engine              │
│   - Entry signal detection              │
│   - Exit signal detection               │
│   - Position sizing                     │
│   - Risk management                     │
└─────────────────────────────────────────┘
                  ↓
┌─────────────────────────────────────────┐
│   Layer 6: Execution (Paper → Real)     │
│   - Paper trading engine                │
│   - Jupiter swap integration            │
│   - Jito bundle submission              │
│   - Transaction monitoring              │
└─────────────────────────────────────────┘
```

---

## Data Sources

### 1. Jupiter API ✅ (Already Implemented)
**Endpoint:** `https://lite-api.jup.ag/tokens/v2/recent`

**Provides:**
- 30 most recent token launches
- Basic token metadata
- Audit information
- Organic scores
- Stats (5m, 1h, 6h, 24h)

**Implementation:**
```typescript
// bot/src/api/jupiter.ts
const response = await axios.get(`${this.baseUrl}recent`);
```

**Rate Limits:** Generous, poll every 2-3 minutes

---

### 2. DexScreener API (To Implement)
**Base URL:** `https://api.dexscreener.com/latest/dex`

**Endpoints:**
- `GET /tokens/{mintAddress}` - Token pairs and liquidity
- `GET /search/?q={query}` - Search tokens

**Provides:**
- Real-time price data
- Liquidity per pool
- 24h volume
- Buy/sell transaction counts
- Price changes across timeframes
- DEX information

**Implementation:**
```typescript
// bot/src/api/dexscreener.ts
export class DexScreenerClient {
    async getTokenPairs(mintAddress: string) {
        const response = await axios.get(
            `https://api.dexscreener.com/latest/dex/tokens/${mintAddress}`
        );
        return response.data;
    }
}
```

**Rate Limits:** No authentication required, rate limits apply

---

### 3. SolScan API (To Implement)
**Base URL:** `https://public-api.solscan.io`

**Endpoints:**
- `GET /token/holders?tokenAddress={mint}` - Token holders
- `GET /token/meta?tokenAddress={mint}` - Token metadata
- `GET /account/transactions?account={address}` - Wallet transactions

**Provides:**
- Top token holders list
- Holder wallet addresses and amounts
- Transaction history
- Account balances

**Implementation:**
```typescript
// bot/src/api/solscan.ts
export class SolscanClient {
    async getTokenHolders(mintAddress: string) {
        const response = await axios.get(
            `https://public-api.solscan.io/token/holders?tokenAddress=${mintAddress}`
        );
        return response.data;
    }
}
```

**Rate Limits:** Free tier has limits, use caching

---

### 4. Helius API (Free Tier to Start)
**Base URL:** `https://api.helius.xyz/v0`

**Provides:**
- Enhanced RPC endpoints
- Token metadata
- Transaction parsing
- Webhook support (paid tiers)

**Free Tier:** 100,000 credits/month (~3,000 requests)

**Sign Up:** https://www.helius.dev/pricing

---

---

## Database Schema

### Technology Choice

**Phase 1 (Weeks 1-8):** SQLite
- File-based, no server setup
- Perfect for development
- Easy to backup and migrate
- Sufficient for data collection phase

**Phase 2 (Week 9+):** PostgreSQL + TimescaleDB
- Better performance at scale
- Time-series optimization
- Multiple connections
- Production-ready

### Core Tables

#### 1. `tokens` - Master Token Registry
```sql
CREATE TABLE tokens (
    mint_address TEXT PRIMARY KEY,
    symbol TEXT,
    name TEXT,
    created_at INTEGER,           -- Token creation timestamp
    first_seen INTEGER,            -- When we discovered it
    deployer_wallet TEXT,          -- Developer address
    
    -- Launch metrics
    initial_liquidity REAL,
    initial_mcap REAL,
    initial_price REAL,
    
    -- Current state (updated frequently)
    current_price REAL,
    current_mcap REAL,
    current_liquidity REAL,
    holder_count INTEGER,
    
    -- Peak performance
    peak_mcap REAL,
    peak_mcap_time INTEGER,
    peak_price REAL,
    peak_price_time INTEGER,
    
    -- Safety metrics
    mint_authority_disabled BOOLEAN,
    freeze_authority_disabled BOOLEAN,
    top_10_holder_percentage REAL,
    is_scam BOOLEAN DEFAULT FALSE,
    rugpull_risk REAL,
    
    -- Derived metrics
    token_score REAL,              -- Our calculated score
    max_multiplier REAL,           -- peak_price / initial_price
    
    -- Status
    is_active BOOLEAN DEFAULT TRUE,
    last_updated INTEGER,
    
    FOREIGN KEY (deployer_wallet) REFERENCES developers(wallet_address)
);

CREATE INDEX idx_tokens_score ON tokens(token_score DESC);
CREATE INDEX idx_tokens_deployer ON tokens(deployer_wallet);
CREATE INDEX idx_tokens_active ON tokens(is_active, last_updated);
```

#### 2. `token_snapshots` - Time-Series Data
```sql
CREATE TABLE token_snapshots (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    mint_address TEXT,
    timestamp INTEGER,
    
    -- Price & market data
    price REAL,
    mcap REAL,
    liquidity REAL,
    volume_5m REAL,
    volume_1h REAL,
    volume_24h REAL,
    
    -- Trading activity
    buys_5m INTEGER,
    sells_5m INTEGER,
    buys_1h INTEGER,
    sells_1h INTEGER,
    buys_24h INTEGER,
    sells_24h INTEGER,
    
    -- Holders
    holder_count INTEGER,
    holder_change_5m INTEGER,
    holder_change_1h INTEGER,
    
    -- Price changes
    price_change_5m REAL,
    price_change_1h REAL,
    price_change_24h REAL,
    
    FOREIGN KEY (mint_address) REFERENCES tokens(mint_address)
);

CREATE INDEX idx_snapshots_mint_time ON token_snapshots(mint_address, timestamp);
```

#### 3. `wallets` - Smart Money Tracking
```sql
CREATE TABLE wallets (
    address TEXT PRIMARY KEY,
    first_seen INTEGER,
    
    -- Classification
    wallet_type TEXT,              -- 'unknown', 'potential_smart', 'confirmed_smart', 'bot', 'whale'
    confidence_score REAL,         -- 0-100, how confident we are
    
    -- Performance metrics
    total_trades INTEGER DEFAULT 0,
    winning_trades INTEGER DEFAULT 0,
    losing_trades INTEGER DEFAULT 0,
    win_rate REAL,                 -- Percentage
    
    -- PnL
    total_pnl_sol REAL DEFAULT 0,
    total_pnl_usd REAL DEFAULT 0,
    roi_percentage REAL,
    largest_win_sol REAL,
    largest_loss_sol REAL,
    
    -- Timing metrics
    avg_hold_time_minutes INTEGER,
    avg_entry_mcap REAL,
    avg_exit_multiplier REAL,      -- Typically exits at Xx
    early_entry_success_rate REAL, -- Success rate when entering <10 min
    
    -- Behavior patterns
    avg_buy_size_sol REAL,
    avg_sell_size_sol REAL,
    favorite_dex TEXT,
    trades_per_day REAL,
    
    -- Activity
    is_active BOOLEAN DEFAULT TRUE,
    last_trade_timestamp INTEGER,
    last_checked INTEGER
);

CREATE INDEX idx_wallets_score ON wallets(confidence_score DESC);
CREATE INDEX idx_wallets_type ON wallets(wallet_type, is_active);
```

#### 4. `wallet_trades` - Track Every Trade
```sql
CREATE TABLE wallet_trades (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    wallet_address TEXT,
    mint_address TEXT,
    
    -- Trade details
    action TEXT,                   -- 'buy' or 'sell'
    timestamp INTEGER,
    amount_sol REAL,
    amount_tokens REAL,
    price REAL,
    transaction_signature TEXT,
    
    -- Context at time of trade
    token_age_minutes INTEGER,
    token_mcap_at_trade REAL,
    token_liquidity_at_trade REAL,
    holder_count_at_trade INTEGER,
    
    -- Outcome (calculated after sell)
    matched_buy_id INTEGER,        -- Link buy to sell
    profit_loss_sol REAL,
    profit_loss_percentage REAL,
    hold_duration_minutes INTEGER,
    exit_multiplier REAL,          -- sell_price / buy_price
    
    -- Classification
    was_early_entry BOOLEAN,       -- Bought within first 10 minutes
    was_successful BOOLEAN,        -- Made profit
    
    FOREIGN KEY (wallet_address) REFERENCES wallets(address),
    FOREIGN KEY (mint_address) REFERENCES tokens(mint_address)
);

CREATE INDEX idx_trades_wallet ON wallet_trades(wallet_address, timestamp);
CREATE INDEX idx_trades_token ON wallet_trades(mint_address, timestamp);
CREATE INDEX idx_trades_action ON wallet_trades(action, timestamp);
```

#### 5. `developers` - Track Token Creators
```sql
CREATE TABLE developers (
    wallet_address TEXT PRIMARY KEY,
    first_seen INTEGER,
    
    -- Track record
    total_tokens_deployed INTEGER DEFAULT 0,
    successful_tokens INTEGER DEFAULT 0,    -- Reached >100k mcap
    failed_tokens INTEGER DEFAULT 0,
    rugpulls INTEGER DEFAULT 0,
    success_rate REAL,
    
    -- Performance
    avg_peak_mcap REAL,
    highest_mcap_achieved REAL,
    total_volume_generated REAL,
    avg_token_lifespan_hours REAL,
    
    -- Best token
    best_token_mint TEXT,
    best_token_mcap REAL,
    
    -- Reputation
    reputation_score REAL,         -- Our calculated score
    is_verified BOOLEAN DEFAULT FALSE,
    is_blacklisted BOOLEAN DEFAULT FALSE,
    
    -- Social presence
    twitter_handle TEXT,
    telegram_handle TEXT,
    website TEXT,
    
    -- Activity
    first_deploy_date INTEGER,
    last_deploy_date INTEGER,
    is_active BOOLEAN DEFAULT TRUE,
    avg_days_between_deploys REAL
);

CREATE INDEX idx_developers_score ON developers(reputation_score DESC);
CREATE INDEX idx_developers_success ON developers(success_rate DESC);
```

#### 6. `paper_trades` - Track Paper Trading Performance
```sql
CREATE TABLE paper_trades (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    mint_address TEXT,
    symbol TEXT,
    
    -- Entry
    entry_time INTEGER,
    entry_price REAL,
    entry_sol REAL,
    entry_mcap REAL,
    entry_reason TEXT,             -- Why we entered
    entry_strategy TEXT,           -- Which strategy triggered
    
    -- Exit
    exit_time INTEGER,
    exit_price REAL,
    exit_sol REAL,
    exit_mcap REAL,
    exit_reason TEXT,              -- Why we exited
    
    -- Performance
    multiplier REAL,               -- exit_price / entry_price
    profit_sol REAL,
    profit_percentage REAL,
    hold_duration_minutes INTEGER,
    
    -- Classification
    was_winner BOOLEAN,
    hit_target BOOLEAN,
    stopped_out BOOLEAN,
    
    FOREIGN KEY (mint_address) REFERENCES tokens(mint_address)
);

CREATE INDEX idx_paper_trades_time ON paper_trades(entry_time);
CREATE INDEX idx_paper_trades_strategy ON paper_trades(entry_strategy, was_winner);
```

---

## Scoring Algorithms

### Token Score (0-100 points)

The token score evaluates the potential of a memecoin based on multiple factors:

```typescript
interface TokenScoringWeights {
    liquidity: 20,        // Sufficient liquidity for entry/exit
    holders: 20,          // Distribution and growth
    volume: 20,           // Trading activity and momentum
    safety: 20,           // Audit and security checks
    smartMoney: 20        // Interest from proven traders
}

function calculateTokenScore(token: TokenData): number {
    let score = 0;
    
    // 1. LIQUIDITY HEALTH (0-20 points)
    if (token.liquidity > 50000) {
        score += 20;
    } else if (token.liquidity > 20000) {
        score += 15;
    } else if (token.liquidity > 10000) {
        score += 10;
    } else if (token.liquidity > 5000) {
        score += 5;
    }
    
    // 2. HOLDER DISTRIBUTION (0-20 points)
    // Count
    if (token.holderCount > 1000) {
        score += 10;
    } else if (token.holderCount > 500) {
        score += 7;
    } else if (token.holderCount > 200) {
        score += 5;
    } else if (token.holderCount > 100) {
        score += 3;
    }
    
    // Distribution (not too concentrated)
    if (token.top10HolderPercentage < 20) {
        score += 10;
    } else if (token.top10HolderPercentage < 30) {
        score += 5;
    } else if (token.top10HolderPercentage < 40) {
        score += 2;
    }
    
    // 3. TRADING VOLUME & MOMENTUM (0-20 points)
    const volume24h = token.buyVolume24h + token.sellVolume24h;
    const volumeToMcap = volume24h / token.mcap;
    
    // Volume relative to market cap
    if (volumeToMcap > 2.0) {        // 200%+ turnover
        score += 10;
    } else if (volumeToMcap > 1.0) {  // 100%+ turnover
        score += 7;
    } else if (volumeToMcap > 0.5) {  // 50%+ turnover
        score += 5;
    } else if (volumeToMcap > 0.25) { // 25%+ turnover
        score += 3;
    }
    
    // Buy/sell pressure
    const buyPressure = token.buyVolume24h / (token.buyVolume24h + token.sellVolume24h);
    if (buyPressure > 0.6) {          // 60%+ buys
        score += 10;
    } else if (buyPressure > 0.55) {  // 55%+ buys
        score += 7;
    } else if (buyPressure > 0.5) {   // Balanced
        score += 5;
    }
    
    // 4. SAFETY & AUDIT (0-20 points)
    if (token.mintAuthorityDisabled) {
        score += 7;  // Can't mint more tokens
    }
    
    if (token.freezeAuthorityDisabled) {
        score += 7;  // Can't freeze accounts
    }
    
    // Rugpull risk score (0 = safe, 1 = likely rug)
    if (token.rugpullRisk < 0.2) {
        score += 6;
    } else if (token.rugpullRisk < 0.4) {
        score += 3;
    }
    
    // 5. SMART MONEY INTEREST (0-20 points)
    const smartMoneyHolders = countSmartWalletsHolding(token);
    
    if (smartMoneyHolders > 10) {
        score += 20;
    } else if (smartMoneyHolders > 5) {
        score += 15;
    } else if (smartMoneyHolders > 3) {
        score += 10;
    } else if (smartMoneyHolders > 1) {
        score += 5;
    }
    
    return Math.min(score, 100);
}
```

### Wallet Score (0-100 points)

Identifies and ranks high-performing traders:

```typescript
interface WalletScoringWeights {
    winRate: 30,          // Consistency in winning trades
    profitability: 25,    // Total profits generated
    consistency: 20,      // Number of trades, track record
    activity: 15,         // Recent activity
    timing: 10            // Entry/exit timing quality
}

function calculateWalletScore(wallet: WalletData): number {
    let score = 0;
    
    // 1. WIN RATE (0-30 points)
    if (wallet.winRate > 0.70) {
        score += 30;
    } else if (wallet.winRate > 0.60) {
        score += 25;
    } else if (wallet.winRate > 0.50) {
        score += 20;
    } else if (wallet.winRate > 0.40) {
        score += 10;
    }
    
    // 2. TOTAL PROFITABILITY (0-25 points)
    if (wallet.totalPnlSol > 1000) {      // 1000+ SOL profit
        score += 25;
    } else if (wallet.totalPnlSol > 500) {
        score += 20;
    } else if (wallet.totalPnlSol > 100) {
        score += 15;
    } else if (wallet.totalPnlSol > 50) {
        score += 10;
    } else if (wallet.totalPnlSol > 10) {
        score += 5;
    }
    
    // 3. CONSISTENCY (0-20 points)
    // Volume of trades
    if (wallet.totalTrades > 100) {
        score += 10;
    } else if (wallet.totalTrades > 50) {
        score += 7;
    } else if (wallet.totalTrades > 20) {
        score += 5;
    } else if (wallet.totalTrades > 10) {
        score += 3;
    }
    
    // Early entry success (buying within first 10 min)
    if (wallet.earlyEntrySuccessRate > 0.6) {
        score += 10;
    } else if (wallet.earlyEntrySuccessRate > 0.5) {
        score += 7;
    } else if (wallet.earlyEntrySuccessRate > 0.4) {
        score += 5;
    }
    
    // 4. ACTIVITY (0-15 points)
    const daysSinceLastTrade = (Date.now() - wallet.lastTradeTimestamp) / (1000 * 60 * 60 * 24);
    
    if (daysSinceLastTrade < 1) {
        score += 15;  // Active today
    } else if (daysSinceLastTrade < 3) {
        score += 10;  // Active this week
    } else if (daysSinceLastTrade < 7) {
        score += 5;   // Active this week
    }
    
    // 5. TIMING QUALITY (0-10 points)
    // Quick profitable trades = sniping skill
    if (wallet.avgHoldTimeMinutes < 60 && wallet.winRate > 0.6) {
        score += 10;  // Excellent sniper
    } else if (wallet.avgHoldTimeMinutes < 240 && wallet.winRate > 0.5) {
        score += 7;   // Good short-term trader
    } else if (wallet.avgHoldTimeMinutes < 1440 && wallet.winRate > 0.45) {
        score += 5;   // Day trader
    }
    
    return Math.min(score, 100);
}
```

### Developer Score (0-100 points)

Ranks token creators by their track record:

```typescript
interface DeveloperScoringWeights {
    successRate: 40,      // % of tokens that succeeded
    trackRecord: 30,      // Historical performance
    reputation: 20,       // Verified, no rugpulls
    activity: 10          // Recent launches
}

function calculateDeveloperScore(developer: DeveloperData): number {
    let score = 0;
    
    // 1. SUCCESS RATE (0-40 points)
    // Based on % of tokens reaching >100k mcap
    if (developer.successRate > 0.5) {
        score += 40;
    } else if (developer.successRate > 0.3) {
        score += 30;
    } else if (developer.successRate > 0.2) {
        score += 20;
    } else if (developer.successRate > 0.1) {
        score += 10;
    } else if (developer.successRate > 0.05) {
        score += 5;
    }
    
    // 2. TRACK RECORD (0-30 points)
    // Number of tokens deployed (shows experience)
    if (developer.totalTokensDeployed > 20) {
        score += 10;
    } else if (developer.totalTokensDeployed > 10) {
        score += 7;
    } else if (developer.totalTokensDeployed > 5) {
        score += 5;
    } else if (developer.totalTokensDeployed > 2) {
        score += 3;
    }
    
    // Highest achievement
    if (developer.highestMcapAchieved > 10000000) {     // 10M+
        score += 20;
    } else if (developer.highestMcapAchieved > 1000000) { // 1M+
        score += 15;
    } else if (developer.highestMcapAchieved > 500000) {  // 500k+
        score += 10;
    } else if (developer.highestMcapAchieved > 100000) {  // 100k+
        score += 5;
    }
    
    // 3. REPUTATION (0-20 points)
    // No rugpulls is critical
    if (developer.rugpulls === 0) {
        score += 10;
    } else if (developer.rugpulls === 1) {
        score += 3;
    }
    // More than 1 rugpull = 0 points
    
    // Verification status
    if (developer.isVerified) {
        score += 5;
    }
    
    // Social presence
    if (developer.twitterHandle || developer.telegramHandle) {
        score += 5;
    }
    
    // 4. ACTIVITY (0-10 points)
    const daysSinceLastDeploy = (Date.now() - developer.lastDeployDate) / (1000 * 60 * 60 * 24);
    
    if (daysSinceLastDeploy < 7) {
        score += 10;  // Active this week
    } else if (daysSinceLastDeploy < 30) {
        score += 7;   // Active this month
    } else if (daysSinceLastDeploy < 90) {
        score += 5;   // Active this quarter
    }
    
    // Penalty for being blacklisted
    if (developer.isBlacklisted) {
        score = 0;
    }
    
    return Math.min(score, 100);
}
```

---

## Entry & Exit Strategies

### Entry Strategies

#### Strategy 1: Smart Money Follow 🎯
**Concept:** Copy trades from proven high-performing wallets

```typescript
interface SmartMoneyFollowStrategy {
    name: "Smart Money Follow",
    
    triggers: {
        smartWalletsRequired: 3,          // Min 3 smart wallets
        smartWalletMinScore: 70,          // Score >70
        timeWindowMinutes: 10,            // All bought within 10 min
        tokenSafetyScore: 60,             // Token safety >60
        minLiquidity: 10000,              // $10k+ liquidity
    },
    
    entry: {
        positionSize: "0.5-1 SOL",
        maxTimeAfterLaunch: 15,           // Enter within 15 min
        maxSlippage: 0.05,                // 5% slippage
    },
    
    targets: {
        profitTarget: "2-5x",
        stopLoss: -0.30,                  // -30%
        trailingStop: 0.15,               // After 2x, 15% trailing
    }
}
```

**Implementation Logic:**
```typescript
async function checkSmartMoneyFollow(token: Token): Promise<boolean> {
    // Get smart wallets (score >70)
    const smartWallets = await db.getWallets({ minScore: 70, isActive: true });
    
    // Check how many bought this token recently
    const recentBuys = await db.getRecentBuys({
        mintAddress: token.id,
        timeWindowMinutes: 10,
        walletAddresses: smartWallets.map(w => w.address)
    });
    
    // Need at least 3 smart wallets
    if (recentBuys.length < 3) return false;
    
    // Token must pass safety checks
    const tokenScore = calculateTokenScore(token);
    if (tokenScore < 60) return false;
    
    // Check liquidity
    if (token.liquidity < 10000) return false;
    
    // Check we're still early (within 15 min of launch)
    const tokenAgeMinutes = (Date.now() - token.createdAt) / (1000 * 60);
    if (tokenAgeMinutes > 15) return false;
    
    return true;  // All conditions met!
}
```

---

#### Strategy 2: Developer Reputation Play 👨‍💻
**Concept:** Bet on proven developers launching new tokens

```typescript
interface DeveloperReputationStrategy {
    name: "Developer Reputation Play",
    
    triggers: {
        developerMinScore: 80,            // Proven developer (score >80)
        minLiquidity: 20000,              // $20k+ liquidity
        maxTop10Holders: 40,              // <40% concentration
        newTokenDetected: true,           // Fresh launch
    },
    
    entry: {
        positionSize: "1-2 SOL",
        maxTimeAfterLaunch: 30,           // Enter within 30 min
        maxSlippage: 0.05,
    },
    
    targets: {
        profitTarget: "5-10x",            // Higher target
        stopLoss: -0.40,                  // Wider stop (more conviction)
        trailingStop: 0.20,               // After 3x, 20% trailing
    }
}
```

**Implementation Logic:**
```typescript
async function checkDeveloperReputation(token: Token): Promise<boolean> {
    // Get developer data
    const developer = await db.getDeveloper(token.deployerWallet);
    if (!developer) return false;
    
    // Check developer score
    const devScore = calculateDeveloperScore(developer);
    if (devScore < 80) return false;
    
    // Check liquidity
    if (token.liquidity < 20000) return false;
    
    // Check holder distribution
    if (token.top10HolderPercentage > 40) return false;
    
    // Check we're early
    const tokenAgeMinutes = (Date.now() - token.createdAt) / (1000 * 60);
    if (tokenAgeMinutes > 30) return false;
    
    // Check developer hasn't dumped immediately
    const devRecentActivity = await checkDeveloperRecentSells(
        token.deployerWallet,
        token.id,
        5 // last 5 minutes
    );
    if (devRecentActivity.hasLargeSells) return false;
    
    return true;
}
```

---

#### Strategy 3: Momentum Surge 📈
**Concept:** Ride short-term momentum spikes

```typescript
interface MomentumSurgeStrategy {
    name: "Momentum Surge",
    
    triggers: {
        tokenAgeHours: { min: 1, max: 6 },  // 1-6 hours old
        volumeSpikeMultiplier: 3,           // Volume 3x average
        priceIncrease1h: 0.50,              // +50% in last hour
        smartMoneyStillHolding: true,       // Not exiting yet
        maxMcap: 500000,                    // Under $500k
    },
    
    entry: {
        positionSize: "0.3-0.5 SOL",        // Smaller size (riskier)
        maxSlippage: 0.08,                  // Higher slippage tolerance
    },
    
    targets: {
        profitTarget: "2-3x",               // Quick flip
        stopLoss: -0.20,                    // Tight stop
        trailingStop: 0.15,
        maxHoldTime: 120,                   // Exit after 2 hours if not hit
    }
}
```

**Implementation Logic:**
```typescript
async function checkMomentumSurge(token: Token): Promise<boolean> {
    // Check token age
    const tokenAgeHours = (Date.now() - token.createdAt) / (1000 * 60 * 60);
    if (tokenAgeHours < 1 || tokenAgeHours > 6) return false;
    
    // Get volume history
    const avgVolume = await db.getAverageVolume(token.id, 6); // 6 hour average
    const currentVolume1h = token.volume1h;
    
    if (currentVolume1h < avgVolume * 3) return false; // Need 3x spike
    
    // Check price momentum
    if (!token.stats1h || token.stats1h.priceChange < 50) return false; // Need +50%
    
    // Check mcap still under threshold
    if (token.mcap > 500000) return false;
    
    // Check smart money isn't exiting
    const smartMoneyActivity = await getSmartMoneyActivity(token.id, 10); // last 10 min
    const sellRatio = smartMoneyActivity.sells / smartMoneyActivity.buys;
    if (sellRatio > 0.5) return false; // More buys than sells
    
    return true;
}
```

---

#### Strategy 4: Liquidity Graduation 🎓
**Concept:** Token graduated from pump.fun to Raydium

```typescript
interface LiquidityGraduationStrategy {
    name: "Liquidity Graduation",
    
    triggers: {
        graduatedToRaydium: true,         // Moved to Raydium
        liquidityAdded: 50000,            // $50k+ added
        noImmediateDump: true,            // Dev didn't dump
        minHolders: 200,                  // Established base
    },
    
    entry: {
        positionSize: "1-2 SOL",
        maxTimeAfterGraduation: 60,       // Within 1 hour
        maxSlippage: 0.05,
    },
    
    targets: {
        profitTarget: "3-10x",
        stopLoss: -0.30,
        trailingStop: 0.20,
    }
}
```

**Implementation Logic:**
```typescript
async function checkLiquidityGraduation(token: Token): Promise<boolean> {
    // Check if graduated
    if (!token.graduatedPool) return false;
    
    // Check time since graduation
    const timeSinceGraduation = Date.now() - token.graduatedAt;
    const minutesSinceGrad = timeSinceGraduation / (1000 * 60);
    if (minutesSinceGrad > 60) return false;
    
    // Check liquidity added
    if (token.liquidity < 50000) return false;
    
    // Check holder count
    if (token.holderCount < 200) return false;
    
    // Check for dev dump
    const devDumped = await checkDeveloperDump(
        token.deployerWallet,
        token.id,
        timeSinceGraduation
    );
    if (devDumped) return false;
    
    return true;
}
```

---

### Exit Strategies

#### Exit Rule 1: Profit Targets (Incremental) 💰

```typescript
interface IncrementalProfitTaking {
    rules: [
        { multiplier: 2, sellPercentage: 25, reason: "Take initial risk off" },
        { multiplier: 3, sellPercentage: 25, reason: "Secure profit" },
        { multiplier: 5, sellPercentage: 25, reason: "Lock in gains" },
        { multiplier: 10, sellPercentage: 25, reason: "Let moonbag ride" }
    ],
    
    finalPosition: {
        activateTrailingStop: true,
        trailingStopPercentage: 0.25,     // 25% trailing stop on last 25%
    }
}
```

**Implementation:**
```typescript
async function checkProfitTargets(position: Position): Promise<ExitAction> {
    const currentPrice = await getCurrentPrice(position.mintAddress);
    const multiplier = currentPrice / position.entryPrice;
    
    // Check each target
    if (multiplier >= 2 && position.remainingPercentage === 100) {
        return { action: 'sell', percentage: 25, reason: '2x target hit' };
    }
    
    if (multiplier >= 3 && position.remainingPercentage === 75) {
        return { action: 'sell', percentage: 25, reason: '3x target hit' };
    }
    
    if (multiplier >= 5 && position.remainingPercentage === 50) {
        return { action: 'sell', percentage: 25, reason: '5x target hit' };
    }
    
    if (multiplier >= 10 && position.remainingPercentage === 25) {
        return { action: 'sell', percentage: 25, reason: '10x target hit - full exit' };
    }
    
    return { action: 'hold' };
}
```

---

#### Exit Rule 2: Smart Money Exit Signal 🚨

```typescript
interface SmartMoneyExitSignal {
    trigger: {
        smartWalletExitPercentage: 0.50,  // 50%+ of smart wallets sold
        timeWindow: 15,                    // Within 15 minutes
    },
    
    action: {
        sellPercentage: 75,                // Sell 75% immediately
        remainingPosition: {
            activateTightStop: true,
            stopPercentage: 0.10,          // 10% stop on remainder
        }
    }
}
```

**Implementation:**
```typescript
async function checkSmartMoneyExit(position: Position): Promise<ExitAction> {
    // Get smart wallets that bought this token
    const smartWallets = await getSmartWalletsBought(position.mintAddress);
    if (smartWallets.length === 0) return { action: 'hold' };
    
    // Check how many have sold in last 15 minutes
    const recentSells = await getRecentSells({
        mintAddress: position.mintAddress,
        walletAddresses: smartWallets.map(w => w.address),
        timeWindowMinutes: 15
    });
    
    const exitPercentage = recentSells.length / smartWallets.length;
    
    if (exitPercentage > 0.50) {
        return {
            action: 'sell',
            percentage: 75,
            reason: 'Smart money exiting - 50%+ sold'
        };
    }
    
    return { action: 'hold' };
}
```

---

#### Exit Rule 3: Time-Based Exit ⏰

```typescript
interface TimeBasedExit {
    rules: {
        maxHoldTimeHours: 24,              // Review after 24 hours
        stagnationThreshold: 0.05,         // <5% price movement
        
        actions: {
            ifStagnant: "exit_at_breakeven",
            ifLosing: "exit_at_minor_loss",
            ifWinning: "continue_holding"
        }
    }
}
```

**Implementation:**
```typescript
async function checkTimeBasedExit(position: Position): Promise<ExitAction> {
    const holdTimeHours = (Date.now() - position.entryTime) / (1000 * 60 * 60);
    
    if (holdTimeHours < 24) return { action: 'hold' };
    
    // Get current status
    const currentPrice = await getCurrentPrice(position.mintAddress);
    const priceChange = (currentPrice - position.entryPrice) / position.entryPrice;
    
    // Check if stagnant (< 5% movement in either direction)
    if (Math.abs(priceChange) < 0.05) {
        return {
            action: 'sell',
            percentage: 100,
            reason: 'Position stagnant after 24h'
        };
    }
    
    // If losing after 24h, consider exiting
    if (priceChange < -0.10) {  // Down >10%
        return {
            action: 'sell',
            percentage: 100,
            reason: 'Cut losses after 24h hold'
        };
    }
    
    return { action: 'hold' };
}
```

---

#### Exit Rule 4: Red Flag Emergency Exit 🚩

```typescript
interface EmergencyExitSignals {
    immediateExitTriggers: [
        {
            signal: "dev_wallet_dump",
            threshold: 0.20,               // Dev moves >20% of supply
            action: "emergency_exit"
        },
        {
            signal: "liquidity_drop",
            threshold: 0.50,               // Liquidity drops >50%
            action: "emergency_exit"
        },
        {
            signal: "rugpull_risk_spike",
            threshold: 0.70,               // Rugpull score >0.7
            action: "emergency_exit"
        },
        {
            signal: "smart_money_mass_exodus",
            threshold: 0.80,               // 80%+ smart wallets dump
            action: "emergency_exit"
        }
    ]
}
```

**Implementation:**
```typescript
async function checkEmergencySignals(position: Position): Promise<ExitAction> {
    const token = await getTokenData(position.mintAddress);
    
    // 1. Check dev wallet movement
    const devMovement = await checkDeveloperMovement(
        token.deployerWallet,
        token.id,
        5 // last 5 minutes
    );
    
    if (devMovement.percentageOfSupply > 0.20) {
        return {
            action: 'emergency_sell',
            percentage: 100,
            reason: '🚨 DEV DUMP DETECTED - Emergency exit'
        };
    }
    
    // 2. Check liquidity drop
    const liquidityHistory = await getLiquidityHistory(token.id, 10); // last 10 min
    const liquidityDrop = (liquidityHistory[0] - token.liquidity) / liquidityHistory[0];
    
    if (liquidityDrop > 0.50) {
        return {
            action: 'emergency_sell',
            percentage: 100,
            reason: '🚨 LIQUIDITY CRASHED - Emergency exit'
        };
    }
    
    // 3. Check rugpull risk
    if (token.rugpullRisk > 0.70) {
        return {
            action: 'emergency_sell',
            percentage: 100,
            reason: '🚨 HIGH RUGPULL RISK - Emergency exit'
        };
    }
    
    // 4. Check smart money exodus
    const smartExodus = await checkSmartMoneyExodus(token.id, 15);
    if (smartExodus.exitPercentage > 0.80) {
        return {
            action: 'emergency_sell',
            percentage: 100,
            reason: '🚨 SMART MONEY EXODUS - Emergency exit'
        };
    }
    
    return { action: 'hold' };
}
```

---

#### Exit Rule 5: Trailing Stop 📉

```typescript
interface TrailingStopConfig {
    activation: {
        afterMultiplier: 2.0,              // Activate after 2x
        initialStopPercentage: 0.15,       // 15% trailing stop
    },
    
    increases: [
        { multiplier: 5, stopPercentage: 0.20 },  // 20% stop after 5x
        { multiplier: 10, stopPercentage: 0.25 }  // 25% stop after 10x
    ]
}
```

**Implementation:**
```typescript
class TrailingStopManager {
    private highWaterMarks: Map<string, number> = new Map();
    
    async checkTrailingStop(position: Position): Promise<ExitAction> {
        const currentPrice = await getCurrentPrice(position.mintAddress);
        const multiplier = currentPrice / position.entryPrice;
        
        // Don't activate until 2x
        if (multiplier < 2.0) return { action: 'hold' };
        
        // Update high water mark
        const currentHighWater = this.highWaterMarks.get(position.id) || currentPrice;
        if (currentPrice > currentHighWater) {
            this.highWaterMarks.set(position.id, currentPrice);
        }
        
        // Determine stop percentage based on multiplier
        let stopPercentage = 0.15;  // Default 15%
        if (multiplier >= 10) {
            stopPercentage = 0.25;
        } else if (multiplier >= 5) {
            stopPercentage = 0.20;
        }
        
        // Check if trailing stop hit
        const highWater = this.highWaterMarks.get(position.id);
        const drawdown = (highWater - currentPrice) / highWater;
        
        if (drawdown > stopPercentage) {
            return {
                action: 'sell',
                percentage: position.remainingPercentage,
                reason: `Trailing stop hit (${(stopPercentage * 100)}%) from ${multiplier.toFixed(2)}x`
            };
        }
        
        return { action: 'hold' };
    }
}
```

---

## Implementation Roadmap

### Week 1-2: Enhanced Data Collection 📊
**Goal:** Expand data sources beyond Jupiter API

**Cost:** $0/month

**Tasks:**

1. **Add DexScreener API Integration**
   ```bash
   # Create new API client
   touch bot/src/api/dexscreener.ts
   ```
   
   - Implement `DexScreenerClient` class
   - Add methods: `getTokenPairs()`, `getEnhancedMetrics()`
   - Test with sample tokens
   - Add error handling and rate limit respect

2. **Add SolScan API Integration**
   ```bash
   touch bot/src/api/solscan.ts
   ```
   
   - Implement `SolscanClient` class
   - Add methods: `getTokenHolders()`, `getTokenMeta()`, `getAccountTransactions()`
   - Add caching layer (to respect rate limits)
   - Test holder data retrieval

3. **Sign up for Helius Free Tier**
   - Go to https://www.helius.dev/pricing
   - Sign up for free tier (100k credits/month)
   - Get API key
   - Add to `.env` file

4. **Update Data Collection Loop**
   ```typescript
   // In bot/src/index.ts
   async function enrichTokenData(token: JupiterToken) {
       // Add DexScreener data
       const dexData = await dexscreenerClient.getEnhancedMetrics(token.id);
       
       // Add holder information
       const holders = await solscanClient.getTokenHolders(token.id);
       
       // Combine all data
       return {
           ...token,
           ...dexData,
           holders: holders
       };
   }
   ```

**Deliverable:** 
- [ ] DexScreener integration complete
- [ ] SolScan integration complete
- [ ] Helius account set up
- [ ] Data enrichment pipeline working
- [ ] Collecting 30+ tokens every 2-3 minutes

---

### Week 3-4: Database Setup 🗄️
**Goal:** Store all collected data for analysis

**Cost:** $0/month

**Tasks:**

1. **Install SQLite Dependencies**
   ```bash
   cd bot
   yarn add better-sqlite3 @types/better-sqlite3
   ```

2. **Create Database Module**
   ```bash
   mkdir bot/src/database
   touch bot/src/database/db.ts
   touch bot/src/database/schema.sql
   ```

3. **Implement Database Class**
   - Create `TokenDatabase` class
   - Implement all tables from schema
   - Add indexes for performance
   - Add helper methods:
     - `insertToken()`
     - `addSnapshot()`
     - `insertWallet()`
     - `recordTrade()`
     - `getTokenHistory()`
     - `getSuccessfulTokens()`

4. **Migrate Data Saver to Use Database**
   ```typescript
   // Replace JSON file writes with database inserts
   // Keep JSON exports for Python analysis
   ```

5. **Create Database Backup System**
   ```bash
   mkdir bot/scripts
   touch bot/scripts/backup-db.sh
   ```
   
   ```bash
   #!/bin/bash
   # Backup database daily
   DATE=$(date +%Y%m%d)
   cp data/tokens.db "data/backups/tokens_$DATE.db"
   ```

6. **Set up Continuous Data Collection**
   ```typescript
   // Run collection every 2 minutes
   setInterval(async () => {
       const tokens = await jupiterClient.getRecentTokens();
       for (const token of tokens) {
           const enriched = await enrichTokenData(token);
           tokenDb.insertToken(enriched);
           tokenDb.addSnapshot(enriched.id, {
               price: enriched.usdPrice,
               mcap: enriched.mcap,
               liquidity: enriched.liquidity,
               // ... more metrics
           });
       }
   }, 2 * 60 * 1000); // Every 2 minutes
   ```

**Deliverable:**
- [ ] SQLite database set up
- [ ] All tables created with indexes
- [ ] Data collection loop writing to database
- [ ] Backup system in place
- [ ] 1000+ tokens tracked after 1 week

---

### Week 5-6: Analytics Engine 🧠
**Goal:** Analyze patterns and build scoring systems

**Cost:** $0/month

**Tasks:**

1. **Create Analytics Module**
   ```bash
   mkdir bot/src/analytics
   touch bot/src/analytics/pattern-detector.ts
   touch bot/src/analytics/scoring.ts
   touch bot/src/analytics/smart-money.ts
   ```

2. **Implement Pattern Analysis**
   ```typescript
   // pattern-detector.ts
   class PatternDetector {
       analyzeSuccessPatterns() {
           // Find tokens that did 5x+
           // Analyze their characteristics
           // Find common patterns
       }
       
       detectLaunchPatterns() {
           // What happens in first hour of successful tokens?
       }
       
       analyzeLiquidityPatterns() {
           // Liquidity patterns of winners vs losers
       }
   }
   ```

3. **Implement Scoring Algorithms**
   - Token scoring (0-100)
   - Wallet scoring (0-100)
   - Developer scoring (0-100)
   - Test scoring on historical data

4. **Build Smart Money Identification**
   ```typescript
   // smart-money.ts
   class SmartMoneyTracker {
       findSmartWallets() {
           // Find wallets that bought successful tokens early
       }
       
       trackSmartWalletActivity() {
           // Monitor what smart wallets are buying now
       }
       
       getSmartMoneySignals(token) {
           // Are smart wallets buying this token?
       }
   }
   ```

5. **Create Analysis Dashboard**
   ```bash
   touch bot/src/analytics/dashboard.ts
   ```
   
   ```typescript
   // Generate daily analytics reports
   - Top performing tokens (last 24h)
   - Smart wallet activity summary
   - Developer leaderboard
   - Success pattern summary
   ```

6. **Run Backtests on Historical Data**
   ```typescript
   // Test scoring algorithms on past data
   // See if high-scored tokens actually performed well
   // Tune weights and parameters
   ```

**Deliverable:**
- [ ] Pattern analysis complete
- [ ] Scoring algorithms implemented and tuned
- [ ] Smart money identification working
- [ ] Analysis dashboard generating reports
- [ ] Documentation of patterns discovered

---

### Week 7-8: Paper Trading Engine 📝
**Goal:** Test strategies without risking real money

**Cost:** $0/month

**Tasks:**

1. **Create Paper Trading Module**
   ```bash
   mkdir bot/src/trading
   touch bot/src/trading/paper-trader.ts
   touch bot/src/trading/strategy-engine.ts
   touch bot/src/trading/position-manager.ts
   ```

2. **Implement Paper Trader**
   ```typescript
   class PaperTrader {
       portfolio: {
           sol: number,
           positions: Map<string, Position>
       }
       
       paperBuy(token, amount, reason)
       paperSell(token, reason)
       getPerformance()
       printReport()
   }
   ```

3. **Implement Strategy Engine**
   ```typescript
   class StrategyEngine {
       strategies = [
           SmartMoneyFollowStrategy,
           DeveloperReputationStrategy,
           MomentumSurgeStrategy,
           LiquidityGraduationStrategy
       ]
       
       checkEntrySignals(token)
       checkExitSignals(position)
       executeStrategy(signal)
   }
   ```

4. **Implement Position Manager**
   ```typescript
   class PositionManager {
       trackPosition(position)
       updatePosition(position, currentPrice)
       checkStopLoss(position)
       checkTakeProfit(position)
       checkTrailingStop(position)
   }
   ```

5. **Implement All Entry Strategies**
   - Smart Money Follow
   - Developer Reputation
   - Momentum Surge
   - Liquidity Graduation

6. **Implement All Exit Rules**
   - Incremental profit taking
   - Smart money exit signals
   - Time-based exits
   - Emergency red flags
   - Trailing stops

7. **Create Paper Trading Loop**
   ```typescript
   setInterval(async () => {
       // Check for entry signals
       const tokens = await getRecentTokens();
       for (const token of tokens) {
           const signals = strategyEngine.checkEntrySignals(token);
           if (signals.shouldEnter) {
               paperTrader.paperBuy(token, signals.amount, signals.reason);
           }
       }
       
       // Check existing positions for exits
       for (const position of paperTrader.getPositions()) {
           const exitSignal = strategyEngine.checkExitSignals(position);
           if (exitSignal.shouldExit) {
               paperTrader.paperSell(position, exitSignal.reason);
           }
       }
       
       // Log performance
       console.log(paperTrader.getPerformance());
   }, 60 * 1000); // Every minute
   ```

8. **Add Paper Trading to Database**
   - Store all paper trades
   - Track performance over time
   - Generate performance reports

**Deliverable:**
- [ ] Paper trading engine fully functional
- [ ] All strategies implemented
- [ ] All exit rules implemented
- [ ] Running 24/7 in paper mode
- [ ] Daily performance reports

---

### Week 9-10: Analysis & Optimization 📈
**Goal:** Analyze results and tune strategies

**Cost:** $0/month

**Tasks:**

1. **Run Paper Trading for 2-4 Weeks**
   - Let system run continuously
   - Don't change strategies mid-test
   - Collect comprehensive data

2. **Analyze Paper Trading Results**
   ```typescript
   // Generate comprehensive analysis
   - Win rate per strategy
   - Profit factor per strategy
   - Best/worst trades
   - Average hold time
   - What conditions lead to wins?
   - What conditions lead to losses?
   ```

3. **Identify Improvements**
   - Which strategies work best?
   - Which fail most often?
   - Should any be disabled?
   - Should parameters be adjusted?

4. **A/B Test Strategy Variations**
   ```typescript
   // Test different parameters
   - Smart money: require 2 vs 3 vs 5 wallets?
   - Stop loss: -20% vs -30% vs -40%?
   - Position size: 0.5 vs 1.0 vs 1.5 SOL?
   ```

5. **Backtest on Historical Data**
   ```typescript
   // Simulate strategies on past tokens
   // See how they would have performed
   // Compare to actual paper trading results
   ```

6. **Calculate Expected ROI**
   ```typescript
   // Based on paper trading results:
   - Average profit per trade
   - Average loss per trade
   - Win rate
   - Trade frequency
   - Expected monthly profit
   ```

7. **Make Go/No-Go Decision**
   
   **GO LIVE if:**
   - Win rate >50%
   - Profit factor >2.0
   - Positive expected value
   - Understand why it works
   - Confident in risk management
   
   **DON'T GO LIVE if:**
   - Win rate <45%
   - Losing paper money
   - Can't explain performance
   - Too many manual adjustments needed
   - Not profitable enough to cover infrastructure costs

8. **Document Final Strategy**
   - Write detailed playbook
   - Document all parameters
   - Create monitoring checklist
   - Define risk limits

**Deliverable:**
- [ ] 2-4 weeks of paper trading data
- [ ] Comprehensive performance analysis
- [ ] Strategy tuning complete
- [ ] Go/no-go decision made
- [ ] If GO: Final strategy documented and ready

---

### Week 11+: Real Trading (Only if Proven) 💰
**Goal:** Execute trades with real money

**Cost:** Starts at $0, scales as profitable

**Phase 11a: Micro Testing (Week 11-12)**

1. **Start with Minimal Capital**
   - Use only 5-10 SOL (~$1k-2k)
   - Position sizes: 0.1-0.2 SOL
   - Goal: Validate in real market conditions

2. **Monitor Closely**
   - Check every trade manually
   - Compare to paper trading performance
   - Look for unexpected behaviors

3. **Track Slippage & Fees**
   - Real costs vs paper trading
   - Adjust position sizes if needed

**Phase 11b: Gradual Scaling (Week 13-16)**

1. **If Performing Well:**
   - Increase to 20-30 SOL
   - Position sizes: 0.5-1.0 SOL
   - Still using free infrastructure

2. **Upgrade Infrastructure as Needed:**
   ```
   Week 13: Consider Helius Pro if hitting rate limits
   Week 14: Consider VPS if execution speed matters
   Week 15: Consider Jito integration for better execution
   ```

3. **Scale Based on Profitability:**
   ```
   If making $500+/month profit → Invest in Helius Pro
   If making $1000+/month profit → Add VPS
   If making $2000+/month profit → Add Jito
   ```

**Phase 11c: Full Production (Week 17+)**

1. **Full Infrastructure:**
   - Helius Pro ($250/month)
   - VPS ($50-100/month)
   - Jito integration (variable)
   - Total: $300-500/month

2. **Scale Capital:**
   - Only if consistently profitable
   - Keep 50% of profits as buffer
   - Never risk more than you can afford to lose

3. **Continuous Monitoring:**
   - Daily performance reviews
   - Weekly strategy adjustments
   - Monthly comprehensive analysis

---

## Success Metrics

### Key Performance Indicators (KPIs)

#### Trading Performance
```typescript
interface TradingKPIs {
    // Core metrics
    winRate: number;              // Target: >50%
    profitFactor: number;         // Target: >2.0 (gross profit / gross loss)
    averageProfitPerTrade: number; // Target: >0.5 SOL
    averageLossPerTrade: number;  // Target: <0.3 SOL
    
    // Risk metrics
    maxDrawdown: number;          // Target: <30%
    sharpeRatio: number;          // Target: >1.5
    sortino Ratio: number;         // Target: >2.0
    
    // Activity
    tradesPerDay: number;         // Target: 3-10
    avgHoldTime: number;          // Target: 2-8 hours
    
    // Returns
    dailyROI: number;             // Target: >1%
    weeklyROI: number;            // Target: >7%
    monthlyROI: number;           // Target: >20%
}
```

#### Data Quality Metrics
```typescript
interface DataQualityKPIs {
    tokensTracked: number;        // Target: >1000
    snapshotsPerToken: number;    // Target: >100
    smartWalletsIdentified: number; // Target: >50
    developersTracked: number;    // Target: >200
    dataCompleteness: number;     // Target: >95%
}
```

### Weekly Tracking Spreadsheet

| Week | Trades | Wins | Losses | Win Rate | Profit (SOL) | ROI % | Drawdown | Notes |
| ---- | ------ | ---- | ------ | -------- | ------------ | ----- | -------- | ----- |
| 1    |        |      |        |          |              |       |          |       |
| 2    |        |      |        |          |              |       |          |       |
| 3    |        |      |        |          |              |       |          |       |
| 4    |        |      |        |          |              |       |          |       |

### Monthly Review Checklist

**Performance Review:**
- [ ] Calculate all KPIs
- [ ] Compare to targets
- [ ] Identify best performing strategies
- [ ] Identify worst performing strategies
- [ ] Calculate profit/loss by strategy
- [ ] Review largest wins and losses
- [ ] Analyze what went right/wrong

**Data Review:**
- [ ] Database size and growth
- [ ] Data quality checks
- [ ] Missing data points
- [ ] API reliability
- [ ] System uptime

**Strategy Review:**
- [ ] Which entry strategies worked best?
- [ ] Which exit rules saved us?
- [ ] Any false signals to filter?
- [ ] Any missed opportunities?
- [ ] Should we add new strategies?

**Risk Management:**
- [ ] Did we follow position sizing rules?
- [ ] Did stop losses work as expected?
- [ ] Any emergency exits triggered?
- [ ] Maximum risk exposure reached?
- [ ] Capital preservation adequate?

**Infrastructure:**
- [ ] Any API rate limit issues?
- [ ] Any downtime?
- [ ] Database performance okay?
- [ ] Need to upgrade anything?

---

## When to Scale

### Decision Matrix: Free → Paid Infrastructure

#### Upgrade to Helius Pro ($250/month)
**Trigger Points:**
- [ ] Hitting free tier rate limits (100k credits)
- [ ] Missing opportunities due to slow data
- [ ] Making >$500/month profit consistently
- [ ] Want faster transaction parsing
- [ ] Want webhook support

**Expected Benefit:**
- More API calls (millions per month)
- Faster data retrieval
- Enhanced features
- Better support

---

#### Add VPS ($50-100/month)
**Trigger Points:**
- [ ] Making >$800/month profit consistently
- [ ] Execution speed matters (late entries)
- [ ] Want 24/7 uptime without local machine
- [ ] Need to be closer to Solana validators

**Expected Benefit:**
- Faster execution
- Lower latency
- 24/7 operation
- More reliable

**Recommended Providers:**
- DigitalOcean (NYC or SF datacenter)
- AWS EC2 (us-east-1 or us-west-2)
- Vultr (close to Solana validators)

---

#### Integrate Jito Bundles (Variable cost)
**Trigger Points:**
- [ ] Making >$1500/month profit consistently
- [ ] Getting front-run frequently
- [ ] Missing trades due to failed transactions
- [ ] Want guaranteed execution order

**Expected Benefit:**
- MEV protection
- Guaranteed transaction order
- Higher success rate on swaps
- Faster execution

**Cost:**
- 0.001-0.01 SOL per bundle (tip)
- Variable based on priority needed
- Budget ~$100-300/month

---

### Full Production Infrastructure

**Total Cost:** ~$400-600/month

**Requirements to Justify:**
- [ ] Consistently profitable for 3+ months
- [ ] Making >$2000/month profit
- [ ] Win rate stable at >50%
- [ ] Clear understanding of edge
- [ ] Risk management working well
- [ ] Can afford infrastructure even during losing months

**Stack:**
```
Helius Pro:         $250/month
VPS (good specs):   $100/month
Jito tips:          $200/month (average)
Other tools:        $50/month
─────────────────────────────────
Total:              $600/month
```

**Break-even Analysis:**
```
Monthly costs: $600
Need to profit: ~3 SOL/month (at $200/SOL)
That's ~0.1 SOL/day
With 1 SOL positions, need 10% daily return
With 5 trades/day, need 2% per trade
```

**Recommendation:** Only upgrade to full production when making 2-3x the infrastructure costs consistently.

---

## Cost Breakdown

### Bootstrap Phase (Weeks 1-10)
**Total: $0/month**

| Service       | Cost | Limit        | Sufficient For   |
| ------------- | ---- | ------------ | ---------------- |
| Jupiter API   | Free | Rate limited | Token discovery  |
| DexScreener   | Free | Generous     | Liquidity data   |
| Helius Free   | Free | 100k credits | Initial testing  |
| SolScan       | Free | Basic tier   | Holder data      |
| SQLite        | Free | Unlimited    | Data storage     |
| Paper Trading | Free | Unlimited    | Strategy testing |

**Runway:** Infinite - can run as long as needed to prove profitability

---

### Growth Phase (Weeks 11-16)
**Total: $0-250/month**

| Service              | Cost     | When to Add               | Benefit                     |
| -------------------- | -------- | ------------------------- | --------------------------- |
| Helius Pro           | $250/mo  | When profitable $500+/mo  | More API calls, faster data |
| Real trading capital | Variable | When paper trading proven | Execute real trades         |

**Runway:** Depends on profitability - upgrade only when justified

---

### Production Phase (Week 17+)
**Total: $400-600/month**

| Service      | Cost    | Purpose                              | ROI Required        |
| ------------ | ------- | ------------------------------------ | ------------------- |
| Helius Pro   | $250/mo | Enhanced RPC & data                  | Core infrastructure |
| VPS          | $100/mo | Fast execution, 24/7 uptime          | Competitive edge    |
| Jito Bundles | $200/mo | MEV protection, guaranteed execution | Trade success rate  |
| Other Tools  | $50/mo  | Monitoring, backups, etc             | Operational         |

**Minimum Profitability:** $1200-1800/month (2-3x costs) to justify

---

## Risk Management

### Position Sizing Rules

```typescript
interface PositionSizingRules {
    // Never risk more than these percentages
    maxRiskPerTrade: 0.05,        // 5% of total capital
    maxOpenPositions: 5,           // Max 5 concurrent positions
    maxTotalRiskExposure: 0.25,   // 25% of capital at risk
    
    // Position sizes by strategy
    smartMoneyFollow: "0.5-1 SOL",
    developerReputation: "1-2 SOL",
    momentumSurge: "0.3-0.5 SOL",   // Riskier = smaller
    liquidityGraduation: "1-2 SOL",
    
    // Adjustments based on conditions
    reduceSizeIf: {
        lowLiquidity: 0.5,          // 50% smaller if liquidity <10k
        highVolatility: 0.7,        // 30% smaller if price volatile
        multipleOpenPositions: 0.8, // 20% smaller if >3 positions
    }
}
```

### Stop Loss Rules

**Hard Rules (Never Break):**
1. **Always set stop loss** on entry - no exceptions
2. **Never move stop loss down** - only up (trailing)
3. **Exit immediately** on emergency signals
4. **Respect max drawdown** - stop trading if down >20% in a day

**Stop Loss Levels:**
- Conservative strategies: -30%
- Aggressive strategies: -20%
- Time-based: Exit if no movement in 24h
- Emergency exits: Immediate (dev dump, liquidity crash)

### Daily Risk Limits

```typescript
interface DailyRiskLimits {
    maxDailyLoss: 0.10,           // Stop trading if down 10% today
    maxConsecutiveLosses: 3,      // Take break after 3 losses
    maxDailyTrades: 15,           // Don't overtrade
    
    cooldownPeriod: {
        after3Losses: 4,           // 4 hours cooldown
        after5Losses: 24,          // 24 hours cooldown
        afterDailyLossLimit: 24    // Stop for the day
    }
}
```

### Capital Preservation

**Golden Rules:**
1. **Start Small:** Begin with only 10-20 SOL
2. **Scale Gradually:** Only increase capital if proven profitable
3. **Withdraw Profits:** Take out 50% of profits regularly
4. **Keep Buffer:** Always have 3 months of infrastructure costs saved
5. **Never All-In:** Never risk more than 50% of capital

### Risk Monitoring Checklist

**Before Each Trade:**
- [ ] Stop loss level set
- [ ] Position size calculated correctly
- [ ] Not exceeding max positions
- [ ] Not exceeding daily trade limit
- [ ] Strategy parameters verified

**Daily:**
- [ ] Review all open positions
- [ ] Check total exposure
- [ ] Update stop losses (trailing)
- [ ] Review daily P&L
- [ ] Check if any limits hit

**Weekly:**
- [ ] Calculate win rate
- [ ] Review largest losses
- [ ] Adjust position sizes if needed
- [ ] Verify strategy performance
- [ ] Update risk parameters

---

## Common Pitfalls & How to Avoid Them

### 1. Premature Scaling 🚫
**Pitfall:** Upgrading to paid infrastructure before proving profitability

**How to Avoid:**
- Stick to free tier until paper trading shows >50% win rate
- Only upgrade when profits justify costs
- Don't confuse infrastructure with edge

### 2. Overtrading 🚫
**Pitfall:** Taking too many trades, chasing losses

**How to Avoid:**
- Set max trades per day limit
- Take breaks after losses
- Let strategies come to you
- Focus on quality over quantity

### 3. Ignoring Stop Losses 🚫
**Pitfall:** Hoping position will recover, moving stop loss down

**How to Avoid:**
- Always set stop loss on entry
- Never move it down
- Accept small losses quickly
- Don't get emotional

### 4. Chasing Pumps 🚫
**Pitfall:** Buying after big price increase (FOMO)

**How to Avoid:**
- Stick to entry strategies
- Don't deviate from plan
- Miss some trades rather than chase
- There's always another opportunity

### 5. Position Size Too Large 🚫
**Pitfall:** Risking too much per trade

**How to Avoid:**
- Follow position sizing rules
- Never risk >5% per trade
- Reduce size if uncertain
- Size down in volatile markets

### 6. Not Taking Profits 🚫
**Pitfall:** Holding too long, giving back gains

**How to Avoid:**
- Use incremental profit taking
- Take profits at 2x, 3x, 5x
- Don't be greedy
- Lock in some gains

### 7. Analysis Paralysis 🚫
**Pitfall:** Collecting data forever without trading

**How to Avoid:**
- Set clear milestones
- After 2 weeks of data, start analyzing
- After 4 weeks, start paper trading
- Don't wait for perfect data

### 8. Ignoring Market Conditions 🚫
**Pitfall:** Trading the same way in all markets

**How to Avoid:**
- Reduce trading in bear markets
- Adjust position sizes
- Some strategies work better in different conditions
- It's okay to sit in cash

---

## Troubleshooting Guide

### Problem: Not Finding Any Good Opportunities

**Possible Causes:**
- Criteria too strict
- Market conditions poor (bear market)
- Not enough data sources
- Scoring algorithm too conservative

**Solutions:**
1. Review scoring thresholds - are they too high?
2. Check if strategies are firing at all
3. Verify data is updating correctly
4. Consider market conditions - wait for better market
5. Run backtest to see if criteria would have worked historically

---

### Problem: High Win Rate but Losing Money

**Possible Causes:**
- Losses bigger than wins (poor risk/reward)
- Stop losses too wide
- Not taking profits early enough
- Trading costs eating profits

**Solutions:**
1. Check average win vs average loss
2. Tighten stop losses
3. Take profits earlier (2x instead of 5x)
4. Reduce position sizes to lower slippage
5. Review profit factor metric

---

### Problem: Paper Trading Works, Real Trading Doesn't

**Possible Causes:**
- Slippage higher than expected
- Execution delays
- Gas fees not accounted for
- Market impact of your trades

**Solutions:**
1. Reduce position sizes
2. Increase slippage tolerance
3. Use limit orders instead of market
4. Check RPC latency
5. Consider upgrading infrastructure

---

### Problem: Missing Data or API Errors

**Possible Causes:**
- Hitting rate limits
- API downtime
- Network issues
- Token too new/no data available

**Solutions:**
1. Add retry logic with exponential backoff
2. Cache data to reduce API calls
3. Have fallback data sources
4. Handle missing data gracefully
5. Upgrade to paid tier if hitting limits

---

### Problem: Database Growing Too Large

**Possible Causes:**
- Storing too many snapshots
- Not cleaning old data
- Inefficient schema

**Solutions:**
1. Set up data retention policy (keep 30 days)
2. Archive old data
3. Add database cleanup script
4. Optimize queries with indexes
5. Consider migrating to PostgreSQL

---

## Next Steps

### Immediate Actions (Today)

1. **Read this entire document** - Understand the full strategy
2. **Review current code** - See what's already implemented
3. **Set up project board** - Track todos from roadmap
4. **Choose starting point** - Week 1-2 tasks

### This Week

1. **Implement DexScreener API** - Get richer data
2. **Implement SolScan API** - Get holder information
3. **Set up SQLite database** - Start storing everything
4. **Start data collection** - Let it run 24/7

### This Month

1. **Collect 2-4 weeks of data** - Build historical dataset
2. **Analyze patterns** - What makes tokens successful?
3. **Build scoring system** - Implement algorithms
4. **Start paper trading** - Test strategies

### Next 3 Months

1. **Month 1:** Data collection + analysis
2. **Month 2:** Paper trading + optimization
3. **Month 3:** Decision point - go live or iterate

### Before Going Live

**Checklist:**
- [ ] Paper traded for 30+ days
- [ ] Win rate >50%
- [ ] Profit factor >2.0
- [ ] Understand why it works
- [ ] Risk management tested
- [ ] Emergency procedures documented
- [ ] Can afford to lose the capital
- [ ] Mental preparation for losses

---

## Additional Resources

### Documentation to Review
- [Jupiter API Docs](https://docs.jup.ag/)
- [Solana Web3.js](https://solana-labs.github.io/solana-web3.js/)
- [Helius Documentation](https://docs.helius.dev/)
- [DexScreener API](https://docs.dexscreener.com/)

### Communities to Join
- Solana Discord
- Jupiter Discord
- /r/SolanaTrading (Reddit)
- Crypto trading strategy forums

### Recommended Reading
- *Algorithmic Trading* by Ernest Chan
- *Technical Analysis of Financial Markets* by John Murphy
- Solana documentation and whitepapers
- MEV and front-running papers

### Tools to Explore
- Solscan (blockchain explorer)
- DexTools (trading view)
- TradingView (charting)

---

## Conclusion

This roadmap provides a comprehensive, bootstrap-friendly approach to building a profitable Solana memecoin trading bot. The key principles are:

1. **Validate Before Scaling** - Use free tools to prove profitability
2. **Data is Your Edge** - Collect and analyze everything
3. **Risk Management First** - Preserve capital above all
4. **Iterate and Improve** - Continuously refine strategies
5. **Scale Deliberately** - Only invest when proven

Remember: **Most trading bots fail.** The ones that succeed are built on:
- Solid data
- Proven strategies
- Rigorous testing
- Proper risk management
- Realistic expectations

Start small, move carefully, and only scale what's proven profitable.

Good luck! 🚀

---

## Version History

- **v1.0** (2025-01-23) - Initial comprehensive roadmap
  - Bootstrap strategy defined
  - Free-tier-first approach
  - Complete implementation guide
  - Risk management framework
  - Scaling decision matrix

---

**Last Updated:** January 23, 2025
**Status:** Ready for Implementation
**Next Review:** After Week 2 (Data Collection Phase)