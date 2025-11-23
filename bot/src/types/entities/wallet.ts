/**
 * UNIFIED WALLET MODEL
 * Combines data from SolanaTracker PnL & Top Traders APIs (primary)
 * plus SolScan and Helius for transaction history
 */

import { WalletType, WalletStatus, TraderTier, TradingPattern } from '../enums';

export interface Wallet {
    // ===== IDENTITY =====
    address: string;

    // ===== CLASSIFICATION (From SolanaTracker + our analysis) =====
    classification: WalletClassification;

    // ===== PERFORMANCE (From SolanaTracker PnL API!) =====
    performance: WalletPerformance;

    // ===== TIMING & STRATEGY =====
    timing: WalletTiming;

    // ===== TRADING BEHAVIOR =====
    behavior: WalletBehavior;

    // ===== PORTFOLIO (From SolanaTracker Wallet API!) =====
    portfolio: WalletPortfolio;

    // ===== TRANSACTION HISTORY =====
    history: WalletHistory;

    // ===== SYSTEM INFO =====
    system: WalletSystemInfo;
}

// ============================================================================
// SUB-INTERFACES
// ============================================================================

export interface WalletClassification {
    type: WalletType;
    confidenceScore: number;           // 0-100

    // Sub-classifications
    traits: {
        isEarlyEntrySpecialist: boolean;
        isSwingTrader: boolean;
        isSniper: boolean;
        isScalper: boolean;
        isHodler: boolean;
        isDeveloper: boolean;
        isWhale: boolean;
    };

    // Reputation (from SolanaTracker Top Traders!)
    reputation: {
        score: number;                   // 0-100
        tier: TraderTier;
        rank?: number;                   // Global rank if top trader
        isWhitelisted: boolean;
        isBlacklisted: boolean;
    };

    // Trading pattern identification
    tradingPattern: TradingPattern;
}

export interface WalletPerformance {
    // Trade statistics (FROM SOLANATRACKER PNL API!)
    trades: {
        total: number;
        winning: number;
        losing: number;
        breakeven: number;
        winRate: number;                 // 0-100 (%)
    };

    // Profitability (FROM SOLANATRACKER!)
    pnl: {
        totalSol: number;                // Total P&L in SOL
        totalUsd: number;                // Total P&L in USD
        realizedSol: number;             // From closed positions
        unrealizedSol: number;           // From open positions
        totalInvestedSol: number;        // Capital deployed

        // Best/worst trades
        largestWinSol: number;
        largestLossSol: number;
        avgWinSol: number;
        avgLossSol: number;
    };

    // Returns (FROM SOLANATRACKER!)
    returns: {
        roi: number;                     // Overall ROI (%)
        profitFactor: number;            // gross profit / gross loss
        sharpeRatio?: number;            // Risk-adjusted returns
        avgReturnPerTrade: number;
    };

    // Consistency
    consistency: {
        consecutiveWins: number;
        consecutiveLosses: number;
        longestWinStreak: number;
        longestLossStreak: number;
        volatility?: number;             // Standard deviation of returns
        consistencyScore?: number;       // How consistent is performance
    };

    // Recent performance (last 30 days)
    recent: {
        trades: number;
        winRate: number;
        pnlSol: number;
        roi: number;
    };
}

export interface WalletTiming {
    // Entry timing
    entry: {
        avgTokenAgeAtEntry: number;      // Minutes from token launch
        earlyEntryRate: number;          // % of trades within first 10 min
        earlyEntrySuccessRate: number;   // Win rate on early entries
        avgEntryMcap: number;
        preferredEntryWindow: string;    // "0-10m", "10-30m", "30m-1h", etc.
    };

    // Exit timing (FROM SOLANATRACKER!)
    exit: {
        avgHoldTimeMinutes: number;
        avgHoldTimeHours: number;
        avgExitMultiplier: number;       // Typical profit multiplier
        exitEfficiency: number;          // How close to peak price (0-1)
        takesLossesQuickly: boolean;     // Cuts losses fast
    };

    // Speed
    speed: {
        avgTimeToEnter: number;          // Seconds from signal to entry
        avgTimeToExit: number;
        isLikelyBot: boolean;            // Sub-second execution
        usesJitoBundles: boolean;        // Detectable from tx history
    };
}

export interface WalletBehavior {
    // Position sizing
    sizing: {
        avgBuySizeSol: number;
        avgSellSizeSol: number;
        minPositionSol: number;
        maxPositionSol: number;
        typicalRiskPerTrade: number;     // % of portfolio
        positionSizeConsistency: number; // How consistent is sizing
    };

    // Trading frequency
    frequency: {
        tradesPerDay: number;
        mostActiveHour: number;          // 0-23 (UTC)
        mostActiveDay: string;           // 'Monday', etc
        isActiveWeekends: boolean;
        tradingDays: number;             // Days with at least 1 trade
    };

    // Preferences (detected patterns)
    preferences: {
        favoriteDex?: string;
        favoriteLaunchpad?: string;
        avgLiquidityTarget: number;      // Prefers tokens with X liquidity
        avgMcapTarget: number;           // Prefers tokens at X mcap
        tokenTypePreference?: string;    // "pump.fun", "raydium", etc.
    };

    // Social trading patterns
    patterns: {
        followsSmartMoney: boolean;      // Copies other successful wallets
        isFollowedByOthers: boolean;     // Others copy this wallet
        frontRuns: boolean;              // Front-running detected
        copiesWallets: string[];         // Addresses they seem to copy
        copiedBy: string[];              // Addresses that copy them
    };

    // Risk behavior
    risk: {
        averageRiskLevel: 'conservative' | 'moderate' | 'aggressive' | 'degen';
        diversification: number;         // 0-100 (100 = highly diversified)
        maxDrawdownTolerance: number;    // % they're willing to lose
        usesStopLosses: boolean;
    };
}

export interface WalletPortfolio {
    // Current holdings (FROM SOLANATRACKER WALLET API!)
    current: {
        totalValueSol: number;
        totalValueUsd: number;
        tokenCount: number;
        largestHoldingSol: number;
        largestHoldingPercentage: number;
    };

    // SOL balance
    sol: {
        balance: number;
        lastChecked: Date;
    };

    // Top holdings (FROM SOLANATRACKER!)
    topHoldings: Array<{
        mint: string;
        symbol: string;
        name: string;
        amount: number;
        valueSol: number;
        valueUsd: number;
        percentage: number;             // % of portfolio

        // Performance on this token
        entryPrice?: number;
        currentPrice: number;
        unrealizedPnl?: number;
        unrealizedPnlPercent?: number;

        // Timing
        firstBoughtAt?: Date;
        holdingDays?: number;
    }>;

    // Portfolio composition
    composition: {
        activePositions: number;
        profitablePositions: number;
        losingPositions: number;
        avgPositionSize: number;
    };
}

export interface WalletHistory {
    // Trade history summary
    summary: {
        firstTradeAt: Date;
        lastTradeAt: Date;
        totalTrades: number;
        totalVolumeSol: number;
        totalVolumeUsd: number;
        uniqueTokensTraded: number;
    };

    // Recent trades (keep last 100)
    recentTrades: WalletTrade[];

    // Notable trades
    notable: {
        bestTrade?: WalletTrade;
        worstTrade?: WalletTrade;
        largestTrade?: WalletTrade;
    };

    // Success stories (FROM SOLANATRACKER TOKEN PNL!)
    successfulTokens: Array<{
        mint: string;
        symbol: string;
        entryMcap: number;
        exitMcap: number;
        multiplier: number;
        profitSol: number;
        holdingPeriodDays: number;
        entryDate: Date;
        exitDate?: Date;
    }>;

    // Failed trades (learn from mistakes)
    failedTokens: Array<{
        mint: string;
        symbol: string;
        lossSol: number;
        lossPercent: number;
        reason?: string;                // Why it failed
    }>;
}

export interface WalletTrade {
    id: string;
    mint: string;
    symbol: string;
    action: 'buy' | 'sell';
    timestamp: Date;
    amountSol: number;
    amountTokens: number;
    price: number;
    signature: string;

    // Context at time of trade
    tokenAgeMinutes: number;
    tokenMcap: number;
    tokenLiquidity: number;
    holderCount?: number;

    // Outcome (if sell)
    profitSol?: number;
    profitPercent?: number;
    multiplier?: number;
    holdDurationMinutes?: number;

    // Classification
    wasEarlyEntry?: boolean;          // <10 min from launch
    wasSuccessful?: boolean;
    tradingPattern?: TradingPattern;
}

export interface WalletSystemInfo {
    // Discovery
    firstSeenAt: Date;
    lastSeenAt: Date;
    lastAnalyzedAt: Date;
    discoveredVia: 'top_traders' | 'token_holder' | 'manual' | 'copy_trading';

    // Tracking
    isMonitored: boolean;              // Are we following this wallet?
    alertsEnabled: boolean;            // Get alerts on their trades?
    copyTradingEnabled: boolean;       // Auto-copy their trades?
    priority: 'low' | 'medium' | 'high' | 'critical';

    // Data quality
    transactionCount: number;
    dataCompleteness: number;          // 0-100%
    lastDataRefresh: Date;

    // Status
    status: WalletStatus;
    isActive: boolean;                 // Traded in last 7 days

    // Notes
    notes?: string;                    // Manual notes
    tags: string[];                    // Custom tags

    // Internal
    internalId?: string;               // Our database ID
}

// ============================================================================
// SIMPLIFIED WALLET (For lists)
// ============================================================================

export interface WalletPreview {
    address: string;
    type: WalletType;
    tier: TraderTier;

    // Key metrics
    totalPnl: number;
    roi: number;
    winRate: number;
    totalTrades: number;

    // Recent activity
    lastTradeAt: Date;
    tradesLast7Days: number;

    // Rank
    rank?: number;

    // Status
    isActive: boolean;
    isMonitored: boolean;
}

