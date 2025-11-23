/**
 * UNIFIED TOKEN MODEL
 * Single source: SolanaTracker API
 */

import { TokenStatus, Launchpad, RiskLevel } from '../enums';

export interface Token {
    // ===== CORE IDENTIFIERS =====
    mintAddress: string;
    symbol: string;
    name: string;
    decimals: number;

    // ===== LAUNCH & CREATION =====
    launch: TokenLaunch;

    // ===== MARKET DATA =====
    market: TokenMarket;

    // ===== LIQUIDITY =====
    liquidity: TokenLiquidity;

    // ===== HOLDER INFORMATION (From SolanaTracker!) =====
    holders: TokenHolders;

    // ===== TRADING ACTIVITY =====
    activity: TokenActivity;

    // ===== SECURITY & RISK (From SolanaTracker Risk API!) =====
    security: TokenSecurity;
    risk: TokenRisk;

    // ===== QUALITY METRICS =====
    quality: TokenQuality;

    // ===== OUR ANALYTICS =====
    analytics: TokenAnalytics;

    // ===== METADATA & SOCIAL =====
    metadata: TokenMetadata;

    // ===== SYSTEM INFO =====
    system: TokenSystemInfo;
}

// ============================================================================
// SUB-INTERFACES
// ============================================================================

export interface TokenLaunch {
    launchpad: Launchpad;
    createdAt: Date;
    firstPoolCreatedAt: Date;

    // Developer info
    developer: {
        address: string;
        isVerified?: boolean;
        hasMultipleTokens?: boolean;
        deployerRank?: number;          // If they're a known good dev
    };

    // Initial state (captured at discovery)
    initial: {
        mcap?: number;
        liquidity?: number;
        holderCount?: number;
        price?: number;
    };

    // Graduation info (pump.fun → Raydium)
    graduation?: {
        hasGraduated: boolean;
        graduatedAt?: Date;
        bondingCurvePercentage?: number;  // % of bonding curve completed
    };
}

export interface TokenMarket {
    // Current price
    price: {
        usd: number;
        sol?: number;
        lastUpdated: Date;
        source: 'solanatracker';
    };

    // Market cap & valuation
    marketCap: number;
    fdv: number;

    // Price changes (multi-timeframe from SolanaTracker)
    priceChange: {
        m5: number;
        m15?: number;
        m30?: number;
        h1: number;
        h6: number;
        h24: number;
    };

    // Peak values (our tracking)
    peak: {
        price: number;
        priceAt: Date;
        mcap: number;
        mcapAt: Date;
        multiplierFromLaunch: number;
    };

    // Pool info
    pool: {
        address: string;
        dex: string;
        quoteToken: string;             // Usually SOL
    };
}

export interface TokenLiquidity {
    // Total across all DEXs
    total: number;
    totalUsd: number;

    // LP burn (critical safety metric from SolanaTracker!)
    lpBurnPercentage: number;         // 0-100

    // Per-DEX breakdown (if available from DexScreener)
    byDex?: Map<string, DexLiquidity>;

    // Liquidity history for migration detection
    history: LiquiditySnapshot[];

    // Derived metrics
    metrics: {
        isHealthy: boolean;              // Sufficient liquidity
        liquidityToMcapRatio: number;    // Liquidity / Market Cap
        isFragmented: boolean;           // Spread across many DEXs
        dominantDex?: string;            // Which DEX has most liquidity
    };
}

export interface DexLiquidity {
    dexId: string;
    pairAddress: string;
    liquidityUsd: number;
    volume24h: number;
    percentage: number;                // % of total liquidity
}

export interface LiquiditySnapshot {
    timestamp: Date;
    total: number;
    byDex?: Record<string, number>;
}

export interface TokenHolders {
    // Counts
    total: number;

    // Concentration (FROM SOLANATRACKER - UNIQUE!)
    concentration: {
        top10Percentage: number;         // % held by top 10
        top20Percentage?: number;
        devPercentage: number;           // % held by developer
        insidersPercentage: number;      // % held by insiders
        snipersPercentage: number;       // % held by snipers
    };

    // Top holders (addresses - from SolScan if needed)
    top?: TopHolder[];

    // Distribution
    distribution: {
        whales: number;                  // Holders with >1%
        mediumHolders: number;           // 0.1-1%
        smallHolders: number;            // <0.1%
    };

    // Growth tracking
    growth: {
        h1Change?: number;
        h6Change?: number;
        h24Change?: number;
    };

    // Smart money presence (FROM SOLANATRACKER TOP TRADERS!)
    smartMoney: {
        count: number;                   // How many smart wallets hold this
        topSmartWallets: string[];       // Addresses of smart money holders
        avgWalletScore: number;          // Average score of smart holders
        totalPercentage: number;         // % held by smart money
        recentActivity: 'buying' | 'selling' | 'holding' | 'mixed';
    };
}

export interface TopHolder {
    // From SolScan
    walletAddress: string;
    tokenAmount: number;
    percentage: number;

    // Our enrichment (from SolanaTracker Top Traders)
    classification?: {
        isSmartMoney: boolean;
        isDeveloper: boolean;
        isBot: boolean;
        isExchange: boolean;
        walletScore?: number;
        walletTier?: string;             // 'diamond', 'platinum', etc.
    };

    // Activity tracking
    firstSeenAt?: Date;
    stillHolding: boolean;
    pnlOnThisToken?: number;
}

export interface TokenActivity {
    // Volume (multi-timeframe from SolanaTracker!)
    volume: {
        m5: number;
        m15?: number;
        m30?: number;
        h1: number;
        h6: number;
        h12?: number;
        h24: number;
    };

    // Transaction counts (FROM SOLANATRACKER!)
    transactions: {
        total: number;
        buys: number;
        sells: number;
        buysVsSells: number;             // Ratio
    };

    // Buy/Sell pressure
    pressure: {
        buyVolume24h: number;
        sellVolume24h: number;
        buyPressure: number;             // 0-1, where >0.5 = bullish
        netBuyers24h?: number;
    };

    // Organic activity (not available from SolanaTracker)
    organic?: {
        organicBuyVolume24h: number;
        organicSellVolume24h: number;
        organicBuyerCount24h: number;
        organicPercentage: number;       // % of volume that's organic
    };

    // Trader counts
    traders: {
        uniqueTraders24h?: number;
        repeatedTraders24h?: number;
    };

    // Fee metrics (FROM SOLANATRACKER!)
    fees?: {
        totalFees: number;               // Total fees paid (SOL)
        tradingFees: number;
        priorityFees: number;            // Jito tips
    };
}

export interface TokenSecurity {
    // Authorities (from SolanaTracker)
    authorities: {
        mintDisabled: boolean;
        freezeDisabled: boolean;
        mintAuthority: string | null;
        freezeAuthority: string | null;
        updateAuthority: string | null;
    };

    // LP burn (FROM SOLANATRACKER!)
    lpBurn: {
        percentage: number;              // 0-100
        isFullyBurned: boolean;          // 100%
    };

    // Verification
    verification: {
        isVerified: boolean;
        listedOnJupiter: boolean;
        hasMetadata: boolean;
    };
}

export interface TokenRisk {
    // Overall risk (FROM SOLANATRACKER RISK API!)
    overall: {
        score: number;                   // 1-10 (10 = highest risk)
        level: RiskLevel;
        recommendation: 'avoid' | 'high-risk' | 'moderate-risk' | 'acceptable';
    };

    // Categorized risks (FROM SOLANATRACKER!)
    warnings: string[];                // Minor concerns
    dangers: string[];                 // Major red flags
    liquidityIssues: string[];
    insiderRisks: string[];

    // Detailed analysis
    analysis: {
        socialPresence: 'none' | 'low' | 'medium' | 'high';
        liquidityRating: 'poor' | 'fair' | 'good' | 'excellent';
        holderDistribution: 'concerning' | 'fair' | 'healthy' | 'excellent';
        contractSafety: 'unsafe' | 'risky' | 'safe' | 'verified';
    };

    // Our calculated red flags
    flags: {
        devHoldingTooHigh: boolean;
        top10HoldingTooHigh: boolean;
        liquidityTooLow: boolean;
        suspiciousActivity: boolean;
        recentDevDump: boolean;
        possibleRugpull: boolean;
    };
}

export interface TokenQuality {
    // Organic score (not currently available from SolanaTracker)
    organicScore?: number;             // 0-100
    organicScoreLabel?: 'high' | 'medium' | 'low';

    // Our derived quality metrics
    quality: {
        overallScore: number;            // 0-100
        dataQuality: number;             // How complete is our data
        marketQuality: number;           // Volume, liquidity, etc
        communityQuality: number;        // Holders, organic activity
        socialPresence: number;          // Social media presence
    };
}

export interface TokenAnalytics {
    // Our calculated scores (0-100 each)
    scores: {
        overall: number;                 // Master score
        liquidity: number;
        holders: number;
        volume: number;
        safety: number;
        smartMoney: number;
        momentum: number;
    };

    // Pattern matching
    patterns: {
        matchesSuccessPattern: boolean;
        similarToTokens: string[];       // Mint addresses of similar tokens
        confidenceScore: number;
    };

    // Predictions (future enhancement)
    prediction?: {
        likely5xProbability: number;     // 0-1
        predictedPeakMcap: number;
        estimatedTimeToAPeakHours: number;
    };

    // Top trader sentiment (FROM SOLANATRACKER!)
    topTradersSentiment?: {
        bullish: number;                 // Count buying
        bearish: number;                 // Count selling
        neutral: number;                 // Count holding
        sentiment: 'bullish' | 'bearish' | 'neutral';
    };
}

export interface TokenMetadata {
    // Visual
    image?: string;
    banner?: string;

    // Description
    description?: string;

    // Social links (FROM SOLANATRACKER!)
    social: {
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
    };

    // Tags/Categories
    tags: string[];

    // External URLs
    urls: {
        solanatracker?: string;
        dexscreener?: string;      // Link to DexScreener for charts
        solscan?: string;
    };
}

export interface TokenSystemInfo {
    // Discovery
    firstSeenAt: Date;
    discoveredVia: 'solanatracker' | 'manual' | 'wallet_tracking';

    // Updates
    lastUpdatedAt: Date;
    lastFullEnrichmentAt: Date;
    updateCount: number;

    // Data completeness
    dataCompleteness: number;          // 0-100%
    dataSources: string[];             // Currently: ['solanatracker']
    missingData: string[];             // List of fields we don't have

    // Status
    status: TokenStatus;
    isActive: boolean;
    isMonitored: boolean;              // Are we actively tracking this?
    priority: 'low' | 'medium' | 'high' | 'critical';

    // Database
    snapshotCount: number;             // How many historical snapshots

    // Internal tracking
    internalId?: string;               // Our database ID
}

// ============================================================================
// SIMPLIFIED TOKEN (For lists/previews)
// ============================================================================

export interface TokenPreview {
    mintAddress: string;
    symbol: string;
    name: string;
    image?: string;

    // Key metrics only
    price: number;
    marketCap: number;
    liquidity: number;
    priceChange24h: number;
    volume24h: number;

    // Quick risk check
    riskLevel: RiskLevel;
    riskScore: number;

    // Smart money interest
    smartMoneyCount: number;

    // Our score
    overallScore: number;

    // Status
    status: TokenStatus;
    createdAt: Date;
}
