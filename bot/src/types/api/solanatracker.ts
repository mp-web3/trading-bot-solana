/**
 * SolanaTracker Data API Response Types
 * API Docs: https://docs.solanatracker.io/data-api/
 * 
 * SolanaTracker provides comprehensive token and wallet analytics,
 * including risk assessment, PnL tracking, and top trader identification.
 */

// ============================================================================
// TOKEN SEARCH & DISCOVERY
// ============================================================================

/**
 * Response from /search endpoint
 * Docs: https://docs.solanatracker.io/data-api/search/token-search
 */
export interface SolanaTrackerSearchResponse {
    status: string;
    data: SolanaTrackerToken[];
    total: number;
    pages: number;
    page: number;
    nextCursor?: string;
    hasMore: boolean;
}

export interface SolanaTrackerToken {
    id: string;                    // Composite ID: poolAddress_mint
    name: string;
    symbol: string;
    mint: string;
    image?: string;
    decimals: number;

    // Social presence
    hasSocials: boolean;
    socials?: SolanaTrackerSocials;

    // Pool & Market info
    poolAddress: string;
    quoteToken: string;            // Usually SOL address
    market: string;                // "pumpfun", "raydium", etc.
    launchpad?: SolanaTrackerLaunchpadInfo;

    // Price & Market data
    liquidityUsd: number;
    marketCapUsd: number;
    priceUsd: number;

    // Volume across timeframes (this is GOLD!)
    volume: number;                // Default timeframe
    volume_5m?: number;
    volume_15m?: number;
    volume_30m?: number;
    volume_1h?: number;
    volume_6h?: number;
    volume_12h?: number;
    volume_24h?: number;

    // Trading activity
    buys: number;
    sells: number;
    totalTransactions: number;

    // Holder distribution (CRITICAL for smart money!)
    holders: number;
    top10: number;                 // % held by top 10 holders
    dev: number;                   // % held by developer
    insiders: number;              // % held by insiders
    snipers: number;               // % held by snipers

    // Safety metrics
    lpBurn: number;                // LP burn % (0-100)
    freezeAuthority: string | null;
    mintAuthority: string | null;

    // Deployer info
    deployer: string;              // Deployer wallet address

    // Token status
    status: 'graduating' | 'graduated' | 'default';

    // Timestamps
    createdAt: number;             // Unix timestamp (ms)
    lastUpdated: number;

    // Token details
    tokenDetails?: {
        creator: string;
        tx: string;                  // Creation transaction signature
        time: number;                // Unix timestamp (seconds)
    };

    // Fee tracking
    fees?: {
        total: number;               // Total fees in SOL
        totalTrading: number;        // Trading fees in SOL
        totalTips: number;           // Priority fees in SOL
    };

    // Verification
    jupiter?: boolean;             // Listed on Jupiter
    verified?: boolean;
}

export interface SolanaTrackerSocials {
    twitter?: string;
    telegram?: string;
    discord?: string;
    website?: string;
    facebook?: string;
    instagram?: string;
    youtube?: string;
    reddit?: string;
    tiktok?: string;
    github?: string;
}

export interface SolanaTrackerLaunchpadInfo {
    curvePercentage?: number;      // Bonding curve % (pump.fun)
}

// ============================================================================
// TOKEN STATISTICS
// ============================================================================

/**
 * Response from /stats/:mint endpoint
 * Docs: https://docs.solanatracker.io/data-api/stats/get-token-stats
 */
export interface SolanaTrackerStatsResponse {
    status: string;
    data: SolanaTrackerTokenStats;
}

export interface SolanaTrackerTokenStats {
    mint: string;
    name: string;
    symbol: string;
    image?: string;

    // Current market data
    price: number;
    priceChange24h?: number;
    priceChange1h?: number;

    liquidity: number;
    marketCap: number;
    fdv: number;

    // Volume
    volume24h: number;
    volume1h?: number;

    // Trading activity
    transactions24h: number;
    buys24h: number;
    sells24h: number;

    // Holders
    holders: number;
    holderChange24h?: number;

    // Pool info
    poolAddress: string;
    dex: string;

    // Additional metadata
    createdAt: number;
    lastUpdated: number;
}

// ============================================================================
// RISK ASSESSMENT
// ============================================================================

/**
 * Response from /risk/:mint endpoint
 * Docs: https://docs.solanatracker.io/data-api/risk
 * 
 * THIS IS UNIQUE TO SOLANATRACKER!
 */
export interface SolanaTrackerRiskResponse {
    status: string;
    data: SolanaTrackerRiskData;
}

export interface SolanaTrackerRiskData {
    mint: string;

    // Overall risk score (1-10, where 10 = highest risk)
    riskScore: number;
    riskLevel: 'low' | 'medium' | 'high' | 'critical';

    // Categorized risk factors
    warnings: string[];            // Minor concerns
    dangers: string[];             // Major red flags
    liquidityIssues: string[];     // Liquidity-related risks
    insiderRisks: string[];        // Insider trading concerns

    // Detailed analysis
    analysis: {
        socialPresence: 'none' | 'low' | 'medium' | 'high';
        liquidityRating: 'poor' | 'fair' | 'good' | 'excellent';
        holderDistribution: 'concerning' | 'fair' | 'healthy' | 'excellent';
        contractSafety: 'unsafe' | 'risky' | 'safe' | 'verified';

        // Specific checks
        mintAuthorityDisabled: boolean;
        freezeAuthorityDisabled: boolean;
        hasMetadata: boolean;
        hasWebsite: boolean;
        hasTwitter: boolean;
        hasTelegram: boolean;

        // Concentration metrics
        top10Concentration: number;
        devHoldingPercentage: number;
        insiderPercentage: number;

        // Liquidity
        liquidityUsd: number;
        liquidityRatio: number;       // Liquidity / Market Cap
    };

    // Recommendations
    recommendation: 'avoid' | 'high-risk' | 'moderate-risk' | 'acceptable';
}

// ============================================================================
// WALLET ANALYTICS
// ============================================================================

/**
 * Response from /wallet/:address endpoint
 * Docs: https://docs.solanatracker.io/data-api/wallet/get-basic-wallet-information
 */
export interface SolanaTrackerWalletResponse {
    status: string;
    data: SolanaTrackerWalletInfo;
}

export interface SolanaTrackerWalletInfo {
    address: string;

    // SOL balance
    solBalance: number;

    // Token holdings
    tokens: SolanaTrackerTokenHolding[];
    tokenCount: number;
    totalValueUsd: number;

    // Metadata
    lastUpdated: number;
}

export interface SolanaTrackerTokenHolding {
    mint: string;
    symbol: string;
    name: string;
    image?: string;
    decimals: number;

    // Holding details
    amount: number;                // Token amount
    valueUsd: number;              // Current value in USD
    priceUsd: number;              // Current price
    percentage: number;            // % of wallet's portfolio

    // Token metadata
    verified?: boolean;
    liquidity?: number;
    marketCap?: number;
}

// ============================================================================
// WALLET PnL (PROFIT & LOSS) - THIS IS INCREDIBLE!
// ============================================================================

/**
 * Response from /pnl/:address endpoint
 * Docs: https://docs.solanatracker.io/data-api/pnl/get-wallet-pnl
 * 
 * Pre-computed PnL saves you from building this entire system!
 */
export interface SolanaTrackerPnLResponse {
    status: string;
    data: SolanaTrackerWalletPnL;
}

export interface SolanaTrackerWalletPnL {
    address: string;

    // Overall performance
    totalRealizedPnl: number;      // Profit/loss from closed positions (SOL)
    totalUnrealizedPnl: number;    // Profit/loss from open positions (SOL)
    totalPnl: number;              // Total P&L (SOL)
    totalInvested: number;         // Total capital invested (SOL)
    roi: number;                   // Return on investment (%)

    // Per-token breakdown
    tokens: SolanaTrackerTokenPnL[];

    // Overall statistics
    stats: {
        totalTrades: number;
        winningTrades: number;
        losingTrades: number;
        winRate: number;             // % (0-100)
        avgWinSol: number;
        avgLossSol: number;
        profitFactor: number;        // gross profit / gross loss
        largestWinSol: number;
        largestLossSol: number;
    };

    // Activity timeline
    firstTradeAt?: number;
    lastTradeAt?: number;
    activeDays?: number;
}

export interface SolanaTrackerTokenPnL {
    mint: string;
    symbol: string;
    name: string;
    image?: string;

    // Buy side
    totalBought: number;           // Total tokens bought
    avgBuyPrice: number;           // Average buy price (per token)
    totalInvestedSol: number;      // Total SOL spent
    buyCount: number;              // Number of buy transactions

    // Sell side
    totalSold: number;             // Total tokens sold
    avgSellPrice: number;          // Average sell price (per token)
    totalReceivedSol: number;      // Total SOL received
    sellCount: number;             // Number of sell transactions

    // Current holding
    currentHolding: number;        // Tokens still held
    currentPrice: number;          // Current price per token
    currentValueSol: number;       // Current value (SOL)

    // PnL breakdown
    realizedPnl: number;           // P&L from sells (SOL)
    unrealizedPnl: number;         // P&L from holdings (SOL)
    totalPnl: number;              // Total P&L (SOL)
    roi: number;                   // % return

    // Performance classification
    isWinner: boolean;             // totalPnl > 0
    multiplier: number;            // Current/entry price ratio

    // Timing
    firstBuyAt: number;            // Unix timestamp
    lastSellAt?: number;
    lastBuyAt?: number;
    holdingPeriodDays: number;
    avgHoldTimeHours?: number;

    // Trading pattern
    tradingPattern?: 'scalper' | 'swing' | 'holder' | 'one-trade';
}

// ============================================================================
// TOP TRADERS (SMART MONEY IDENTIFICATION!)
// ============================================================================

/**
 * Response from /top-traders endpoint
 * Docs: https://docs.solanatracker.io/data-api/top-traders/get-top-traders-all-tokens
 * 
 * This identifies smart money wallets for you!
 */
export interface SolanaTrackerTopTradersResponse {
    status: string;
    data: SolanaTrackerTopTrader[];
    total: number;
    page: number;
    hasMore: boolean;
}

export interface SolanaTrackerTopTrader {
    address: string;

    // Overall performance
    totalPnl: number;              // Total profit (SOL)
    totalPnlUsd: number;           // Total profit (USD)
    roi: number;                   // Return on investment (%)
    winRate: number;               // Win rate (%)

    // Activity metrics
    totalTrades: number;
    winningTrades: number;
    losingTrades: number;
    activeTokens: number;          // Number of different tokens traded

    // Recent activity
    lastTradeAt: number;
    firstTradeAt: number;
    activeDays: number;
    tradesPerDay: number;

    // Best performance
    bestTrade?: {
        mint: string;
        symbol: string;
        profitSol: number;
        multiplier: number;
    };

    // Current holdings
    currentHoldingsValue?: number;

    // Ranking
    rank?: number;
}

/**
 * Response from /top-traders/:mint endpoint
 * Top traders for a specific token
 */
export interface SolanaTrackerTokenTopTradersResponse {
    status: string;
    data: SolanaTrackerTokenTopTrader[];
    total: number;
}

export interface SolanaTrackerTokenTopTrader {
    address: string;

    // Token-specific performance
    tokenPnl: number;              // P&L on THIS token (SOL)
    tokenPnlUsd: number;
    tokenRoi: number;              // ROI on THIS token (%)

    // Position
    currentHolding: number;
    currentHoldingValue: number;
    isStillHolding: boolean;

    // Entry/exit
    entryPrice: number;
    avgBuyPrice: number;
    avgSellPrice?: number;
    currentPrice: number;
    multiplier: number;

    // Timing
    firstBoughtAt: number;
    lastActivityAt: number;
    holdingDays: number;

    // Trading activity on this token
    buyCount: number;
    sellCount: number;
    totalInvestedSol: number;

    // Classification
    traderType?: 'early-buyer' | 'diamond-hands' | 'profit-taker' | 'active-trader';
}

// ============================================================================
// REAL-TIME WEBSOCKET TYPES
// ============================================================================

/**
 * WebSocket message types
 * Docs: https://docs.solanatracker.io/datastream/websockets/tokenstatistics
 */
export interface SolanaTrackerWebSocketMessage {
    type: 'subscribe' | 'unsubscribe' | 'tokenStatistics' | 'error';
    topic?: string;
    mint?: string;
    data?: any;
    error?: string;
}

export interface SolanaTrackerTokenStatisticsUpdate {
    type: 'tokenStatistics';
    data: {
        mint: string;
        timestamp: number;

        // Real-time price & volume
        price: number;
        priceChange5m: number;
        priceChange1h: number;

        volume5m: number;
        volume1h: number;
        volume24h: number;

        // Real-time activity
        buys5m: number;
        sells5m: number;

        // Liquidity & market cap
        liquidity: number;
        marketCap: number;

        // Holder changes
        holders: number;
        holderChange5m: number;
    };
}

// ============================================================================
// SEARCH QUERY PARAMETERS
// ============================================================================

/**
 * Query parameters for /search endpoint
 * All filters available for token discovery
 */
export interface SolanaTrackerSearchParams {
    // Search & pagination
    query?: string;                // Search by symbol, name, or address
    symbol?: string;               // Exact symbol match
    page?: number;
    limit?: number;                // Max 500
    cursor?: string;               // For cursor-based pagination

    // Sorting
    sortBy?:
    | 'liquidityUsd'
    | 'marketCapUsd'
    | 'priceUsd'
    | 'volume'
    | 'volume_5m' | 'volume_15m' | 'volume_30m'
    | 'volume_1h' | 'volume_6h' | 'volume_12h' | 'volume_24h'
    | 'top10' | 'dev' | 'insiders' | 'snipers'
    | 'holders' | 'buys' | 'sells' | 'totalTransactions'
    | 'fees.total' | 'fees.totalTrading' | 'fees.totalTips'
    | 'createdAt' | 'lpBurn' | 'curvePercentage';
    sortOrder?: 'asc' | 'desc';

    // Metadata filters
    hasImage?: boolean;
    image?: string;
    launchpad?: string;            // "pumpfun", "moonshot", etc.
    market?: string;

    // Time filters
    minCreatedAt?: number;
    maxCreatedAt?: number;

    // Price & market filters
    minLiquidity?: number;
    maxLiquidity?: number;
    minMarketCap?: number;
    maxMarketCap?: number;

    // Volume filters (by timeframe)
    minVolume?: number;
    maxVolume?: number;
    volumeTimeframe?: '5m' | '15m' | '30m' | '1h' | '6h' | '12h' | '24h';
    minVolume_5m?: number;
    maxVolume_5m?: number;
    minVolume_15m?: number;
    maxVolume_15m?: number;
    minVolume_30m?: number;
    maxVolume_30m?: number;
    minVolume_1h?: number;
    maxVolume_1h?: number;
    minVolume_6h?: number;
    maxVolume_6h?: number;
    minVolume_12h?: number;
    maxVolume_12h?: number;
    minVolume_24h?: number;
    maxVolume_24h?: number;

    // Activity filters
    minBuys?: number;
    maxBuys?: number;
    minSells?: number;
    maxSells?: number;
    minTotalTransactions?: number;
    maxTotalTransactions?: number;

    // Holder filters (CRITICAL!)
    minHolders?: number;
    maxHolders?: number;
    minTop10?: number;             // 0-100 (%)
    maxTop10?: number;
    minDev?: number;               // 0-100 (%)
    maxDev?: number;
    minInsiders?: number;          // 0-100 (%)
    maxInsiders?: number;
    minSnipers?: number;           // 0-100 (%)
    maxSnipers?: number;

    // Safety filters
    lpBurn?: number;               // 0-100 (%)
    freezeAuthority?: string;      // Use "null" for disabled
    mintAuthority?: string;        // Use "null" for disabled

    // Deployer filters
    deployer?: string;
    creator?: string;

    // Status
    status?: 'graduating' | 'graduated' | 'default';
    minCurvePercentage?: number;
    maxCurvePercentage?: number;

    // Social filters
    twitter?: string;
    telegram?: string;
    discord?: string;
    website?: string;
    facebook?: string;
    instagram?: string;
    youtube?: string;
    reddit?: string;
    tiktok?: string;
    github?: string;

    // Fee filters
    minFeesTotal?: number;
    maxFeesTotal?: number;
    minFeesTrading?: number;
    maxFeesTrading?: number;
    minFeesTips?: number;
    maxFeesTips?: number;

    // Display options
    showAllPools?: boolean;
    showPriceChanges?: boolean;
}

// Types are exported via their interface declarations above

