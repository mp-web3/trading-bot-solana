# 🎯 SolanaTracker-Only Architecture

## Overview
This project uses **SolanaTracker exclusively** as its single data source for all token, wallet, and market data.

## Why SolanaTracker Only?

### ✅ Complete Feature Set
- **Token Discovery**: Search & filter tokens by various criteria
- **Market Data**: Real-time prices, volume, liquidity across all DEXs
- **Risk Assessment**: Built-in rug detection & safety scores
- **Wallet Analytics**: PnL tracking, performance metrics, behavior analysis
- **Smart Money**: Top trader identification & wallet scoring
- **Real-time Feeds**: WebSocket support for live data streaming
- **Social & Metadata**: Links, images, community info

### ✅ Simplicity Benefits
- Single API to learn and integrate
- No data merging or conflict resolution
- Consistent data structures across all endpoints
- Single point of maintenance
- Easier debugging and troubleshooting

### ✅ Cost Efficiency
- One subscription instead of multiple
- No redundant API calls
- Predictable monthly costs
- Free tier available for testing

### ✅ Development Speed
- Faster initial implementation
- Less code to write and maintain
- Fewer edge cases to handle
- Quicker feature iterations

## Project Structure

```
bot/src/
├── types/
│   ├── api/
│   │   ├── index.ts
│   │   └── solanatracker.ts          # All API types (630 lines)
│   │
│   ├── entities/
│   │   ├── index.ts
│   │   ├── token.ts                  # Unified Token model (469 lines)
│   │   └── wallet.ts                 # Unified Wallet model (370 lines)
│   │
│   ├── enums/
│   │   ├── index.ts
│   │   ├── dex.ts                    # DEX platforms
│   │   ├── status.ts                 # Token/wallet statuses
│   │   ├── strategy.ts               # Trading strategies
│   │   └── trader.ts                 # Trader classifications
│   │
│   └── README.md                     # Type system documentation
│
├── services/
│   └── mappers/
│       ├── index.ts
│       ├── token-mapper.ts           # SolanaTracker → Token (490 lines)
│       └── wallet-mapper.ts          # SolanaTracker → Wallet (645 lines)
│
├── api/ (to be created)
│   └── solanatracker-client.ts       # HTTP client for SolanaTracker
│
└── index.ts                          # Main entry point
```

## SolanaTracker API Endpoints

### Token Endpoints
```typescript
// Search/discover tokens
GET /tokens/search?sort=createdAt&order=desc&limit=50

// Get token details
GET /tokens/:mint

// Get risk assessment
GET /tokens/:mint/risk

// Get top traders for a token
GET /tokens/:mint/top-traders
```

### Wallet Endpoints
```typescript
// Get wallet PnL
GET /wallets/:address/pnl

// Get wallet info
GET /wallets/:address

// Get wallet positions
GET /wallets/:address/positions
```

### WebSocket
```typescript
// Real-time token updates
ws://api.solanatracker.io/ws
```

## Data Flow

```
SolanaTracker API
      ↓
API Types (solanatracker.ts)
      ↓
Mappers (token-mapper.ts, wallet-mapper.ts)
      ↓
Entity Types (token.ts, wallet.ts)
      ↓
Database / Business Logic
```

## Implementation Checklist

### Phase 1: API Client (Current Phase)
- [x] Define all API types
- [x] Define all entity types
- [x] Create mapper services
- [ ] Create SolanaTracker HTTP client
- [ ] Add error handling
- [ ] Add rate limiting
- [ ] Test all endpoints

### Phase 2: Data Collection
- [ ] Set up database (SQLite for bootstrap)
- [ ] Create data collection service
- [ ] Implement token discovery loop
- [ ] Store tokens with mappers
- [ ] Track historical snapshots
- [ ] Monitor wallet activity

### Phase 3: Analysis & Scoring
- [ ] Token scoring algorithm
- [ ] Wallet scoring algorithm
- [ ] Smart money identification
- [ ] Pattern recognition
- [ ] Risk assessment integration

### Phase 4: Trading Logic
- [ ] Define entry strategies
- [ ] Define exit strategies
- [ ] Paper trading engine
- [ ] Backtesting framework
- [ ] Performance tracking

### Phase 5: Execution
- [ ] Real trading (when confident)
- [ ] Position management
- [ ] Risk management
- [ ] Monitoring & alerts

## Getting Started

### 1. Get API Key
```bash
# Sign up at https://www.solanatracker.io/
# Get your API key from dashboard
```

### 2. Set Environment Variables
```bash
# Create .env file
echo "SOLANATRACKER_API_KEY=your_key_here" >> shared/.env
```

### 3. Create API Client
```typescript
// bot/src/api/solanatracker-client.ts
import axios from 'axios';
import {
  SolanaTrackerToken,
  SolanaTrackerRiskData,
  SolanaTrackerWalletPnL
} from '../types/api/solanatracker';

export class SolanaTrackerClient {
  private apiKey: string;
  private baseUrl = 'https://api.solanatracker.io';

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async searchTokens(params: SolanaTrackerSearchParams): Promise<SolanaTrackerToken[]> {
    // Implementation
  }

  async getTokenRisk(mint: string): Promise<SolanaTrackerRiskData> {
    // Implementation
  }

  async getWalletPnL(address: string): Promise<SolanaTrackerWalletPnL> {
    // Implementation
  }

  // ... more methods
}
```

### 4. Use Mappers
```typescript
import { TokenMapper } from './services/mappers/token-mapper';
import { solanaTrackerClient } from './api/solanatracker-client';

// Fetch token from API
const stToken = await solanaTrackerClient.searchTokens({ limit: 1 })[0];
const riskData = await solanaTrackerClient.getTokenRisk(stToken.mint);

// Convert to unified model
const token = TokenMapper.fromSolanaTracker(stToken, riskData);

// Now you have a complete Token entity!
console.log(token.risk.overall.level); // RiskLevel enum
console.log(token.analytics.scores.overall); // Calculated score
```

## Code Quality

✅ **Zero linter errors**  
✅ **Fully typed TypeScript**  
✅ **Comprehensive JSDoc comments**  
✅ **Separation of concerns**  
✅ **Extensible architecture**  
✅ **Single source of truth**  

## Next Steps

1. **Implement SolanaTracker Client** - Create the HTTP client
2. **Test Integration** - Verify all endpoints work
3. **Set Up Database** - Create tables matching entity schemas
4. **Build Collection Loop** - Start ingesting token data
5. **Implement Scoring** - Add custom logic on top of SolanaTracker data

---

**Status**: Architecture complete ✅ | Ready for implementation 🚀

