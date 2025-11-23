/**
 * Wallet Mapper Service
 * Converts SolanaTracker API responses to unified Wallet entity
 */

import {
    Wallet,
    WalletPreview,
    WalletClassification,
    WalletPerformance,
    WalletTiming,
    WalletBehavior,
    WalletPortfolio,
    WalletHistory,
    WalletSystemInfo,
} from '../../types/entities/wallet';
import {
    SolanaTrackerWalletPnL,
    SolanaTrackerTopTrader,
    SolanaTrackerWalletInfo,
    SolanaTrackerTokenPnL,
} from '../../types/api/solanatracker';
import { WalletType, WalletStatus, TraderTier, TradingPattern } from '../../types/enums';

export class WalletMapper {
    /**
     * Create unified wallet from SolanaTracker Top Trader data
     */
    static fromTopTrader(
        topTrader: SolanaTrackerTopTrader,
        pnlData?: SolanaTrackerWalletPnL,
        portfolioData?: SolanaTrackerWalletInfo
    ): Wallet {
        return {
            address: topTrader.address,

            classification: this.mapClassification(topTrader, pnlData),
            performance: this.mapPerformance(topTrader, pnlData),
            timing: this.mapTiming(pnlData),
            behavior: this.mapBehavior(topTrader, pnlData),
            portfolio: this.mapPortfolio(portfolioData),
            history: this.mapHistory(pnlData),
            system: this.createSystemInfo(topTrader),
        };
    }

    /**
     * Create unified wallet from SolanaTracker PnL data
     */
    static fromPnL(
        pnlData: SolanaTrackerWalletPnL,
        portfolioData?: SolanaTrackerWalletInfo
    ): Wallet {
        return {
            address: pnlData.address,

            classification: this.classifyFromPnL(pnlData),
            performance: this.performanceFromPnL(pnlData),
            timing: this.mapTiming(pnlData),
            behavior: this.behaviorFromPnL(pnlData),
            portfolio: this.mapPortfolio(portfolioData),
            history: this.mapHistory(pnlData),
            system: this.systemInfoFromPnL(pnlData),
        };
    }

    /**
     * Create preview/summary version for lists
     */
    static toPreview(wallet: Wallet, rank?: number): WalletPreview {
        return {
            address: wallet.address,
            type: wallet.classification.type,
            tier: wallet.classification.reputation.tier,

            totalPnl: wallet.performance.pnl.totalSol,
            roi: wallet.performance.returns.roi,
            winRate: wallet.performance.trades.winRate,
            totalTrades: wallet.performance.trades.total,

            lastTradeAt: wallet.history.summary.lastTradeAt,
            tradesLast7Days: wallet.performance.recent.trades,

            rank,

            isActive: wallet.system.isActive,
            isMonitored: wallet.system.isMonitored,
        };
    }

    // ============================================================================
    // PRIVATE MAPPERS
    // ============================================================================

    private static mapClassification(
        topTrader: SolanaTrackerTopTrader,
        pnlData?: SolanaTrackerWalletPnL
    ): WalletClassification {
        const tier = this.determineTraderTier(topTrader.winRate, topTrader.totalPnl);

        return {
            type: tier === TraderTier.UNKNOWN ? WalletType.POTENTIAL_SMART : WalletType.TOP_TRADER,
            confidenceScore: this.calculateConfidenceScore(topTrader),

            traits: {
                isEarlyEntrySpecialist: false, // Need more data
                isSwingTrader: topTrader.tradesPerDay < 3,
                isSniper: topTrader.tradesPerDay > 10,
                isScalper: topTrader.tradesPerDay > 20,
                isHodler: topTrader.tradesPerDay < 0.5,
                isDeveloper: false,
                isWhale: topTrader.totalPnl > 500,
            },

            reputation: {
                score: this.calculateReputationScore(topTrader),
                tier,
                rank: topTrader.rank,
                isWhitelisted: tier >= TraderTier.GOLD,
                isBlacklisted: false,
            },

            tradingPattern: this.determineTradingPattern(pnlData),
        };
    }

    private static mapPerformance(
        topTrader: SolanaTrackerTopTrader,
        pnlData?: SolanaTrackerWalletPnL
    ): WalletPerformance {
        const stats = pnlData?.stats || {
            totalTrades: topTrader.totalTrades,
            winningTrades: topTrader.winningTrades,
            losingTrades: topTrader.losingTrades,
            winRate: topTrader.winRate,
            avgWinSol: 0,
            avgLossSol: 0,
            profitFactor: 0,
            largestWinSol: topTrader.bestTrade?.profitSol || 0,
            largestLossSol: 0,
        };

        return {
            trades: {
                total: topTrader.totalTrades,
                winning: topTrader.winningTrades,
                losing: topTrader.losingTrades,
                breakeven: topTrader.totalTrades - topTrader.winningTrades - topTrader.losingTrades,
                winRate: topTrader.winRate,
            },

            pnl: {
                totalSol: topTrader.totalPnl,
                totalUsd: topTrader.totalPnlUsd || 0,
                realizedSol: pnlData?.totalRealizedPnl || topTrader.totalPnl,
                unrealizedSol: pnlData?.totalUnrealizedPnl || 0,
                totalInvestedSol: pnlData?.totalInvested || 0,

                largestWinSol: stats.largestWinSol,
                largestLossSol: stats.largestLossSol,
                avgWinSol: stats.avgWinSol,
                avgLossSol: stats.avgLossSol,
            },

            returns: {
                roi: topTrader.roi,
                profitFactor: stats.profitFactor,
                avgReturnPerTrade: topTrader.totalPnl / topTrader.totalTrades,
            },

            consistency: {
                consecutiveWins: 0,
                consecutiveLosses: 0,
                longestWinStreak: 0,
                longestLossStreak: 0,
            },

            recent: {
                trades: Math.floor(topTrader.tradesPerDay * 30),
                winRate: topTrader.winRate,
                pnlSol: topTrader.totalPnl * 0.3, // Estimate
                roi: topTrader.roi * 0.3,
            },
        };
    }

    private static mapTiming(pnlData?: SolanaTrackerWalletPnL): WalletTiming {
        if (!pnlData) {
            return this.createDefaultTiming();
        }

        const avgHoldTime = this.calculateAverageHoldTime(pnlData.tokens);

        return {
            entry: {
                avgTokenAgeAtEntry: 0, // Need historical data
                earlyEntryRate: 0,
                earlyEntrySuccessRate: 0,
                avgEntryMcap: 0,
                preferredEntryWindow: 'unknown',
            },

            exit: {
                avgHoldTimeMinutes: avgHoldTime,
                avgHoldTimeHours: avgHoldTime / 60,
                avgExitMultiplier: this.calculateAvgMultiplier(pnlData.tokens),
                exitEfficiency: 0,
                takesLossesQuickly: false,
            },

            speed: {
                avgTimeToEnter: 0,
                avgTimeToExit: 0,
                isLikelyBot: false,
                usesJitoBundles: false,
            },
        };
    }

    private static mapBehavior(
        topTrader: SolanaTrackerTopTrader,
        pnlData?: SolanaTrackerWalletPnL
    ): WalletBehavior {
        const avgBuySize = pnlData
            ? pnlData.tokens.reduce((sum: number, t: any) => sum + t.totalInvestedSol, 0) / pnlData.tokens.length
            : 0;

        return {
            sizing: {
                avgBuySizeSol: avgBuySize,
                avgSellSizeSol: avgBuySize * 0.8, // Estimate
                minPositionSol: 0,
                maxPositionSol: 0,
                typicalRiskPerTrade: 0,
                positionSizeConsistency: 0,
            },

            frequency: {
                tradesPerDay: topTrader.tradesPerDay,
                mostActiveHour: 0,
                mostActiveDay: '',
                isActiveWeekends: true,
                tradingDays: topTrader.activeDays,
            },

            preferences: {
                avgLiquidityTarget: 0,
                avgMcapTarget: 0,
            },

            patterns: {
                followsSmartMoney: false,
                isFollowedByOthers: topTrader.rank ? topTrader.rank <= 100 : false,
                frontRuns: false,
                copiesWallets: [],
                copiedBy: [],
            },

            risk: {
                averageRiskLevel: topTrader.winRate > 70 ? 'conservative' : 'aggressive',
                diversification: topTrader.activeTokens > 10 ? 80 : 40,
                maxDrawdownTolerance: 0,
                usesStopLosses: topTrader.winRate > 60,
            },
        };
    }

    private static mapPortfolio(portfolioData?: SolanaTrackerWalletInfo): WalletPortfolio {
        if (!portfolioData) {
            return this.createDefaultPortfolio();
        }

        return {
            current: {
                totalValueSol: portfolioData.totalValueUsd / 200, // Estimate SOL price
                totalValueUsd: portfolioData.totalValueUsd,
                tokenCount: portfolioData.tokenCount,
                largestHoldingSol: 0,
                largestHoldingPercentage: 0,
            },

            sol: {
                balance: portfolioData.solBalance,
                lastChecked: new Date(portfolioData.lastUpdated),
            },

            topHoldings: portfolioData.tokens.map((t: any) => ({
                mint: t.mint,
                symbol: t.symbol,
                name: t.name,
                amount: t.amount,
                valueSol: t.valueUsd / 200,
                valueUsd: t.valueUsd,
                percentage: t.percentage,
                currentPrice: t.priceUsd,
            })),

            composition: {
                activePositions: portfolioData.tokenCount,
                profitablePositions: 0,
                losingPositions: 0,
                avgPositionSize: portfolioData.totalValueUsd / portfolioData.tokenCount,
            },
        };
    }

    private static mapHistory(pnlData?: SolanaTrackerWalletPnL): WalletHistory {
        if (!pnlData) {
            return this.createDefaultHistory();
        }

        const successfulTokens = pnlData.tokens.filter((t: any) => t.isWinner);
        const failedTokens = pnlData.tokens.filter((t: any) => !t.isWinner);

        return {
            summary: {
                firstTradeAt: new Date(pnlData.firstTradeAt || Date.now()),
                lastTradeAt: new Date(pnlData.lastTradeAt || Date.now()),
                totalTrades: pnlData.stats.totalTrades,
                totalVolumeSol: pnlData.totalInvested,
                totalVolumeUsd: 0,
                uniqueTokensTraded: pnlData.tokens.length,
            },

            recentTrades: [],

            notable: {},

            successfulTokens: successfulTokens.map((t: any) => ({
                mint: t.mint,
                symbol: t.symbol,
                entryMcap: 0,
                exitMcap: 0,
                multiplier: t.multiplier,
                profitSol: t.totalPnl,
                holdingPeriodDays: t.holdingPeriodDays,
                entryDate: new Date(t.firstBuyAt),
                exitDate: t.lastSellAt ? new Date(t.lastSellAt) : undefined,
            })),

            failedTokens: failedTokens.map((t: any) => ({
                mint: t.mint,
                symbol: t.symbol,
                lossSol: Math.abs(t.totalPnl),
                lossPercent: t.roi,
            })),
        };
    }

    private static createSystemInfo(topTrader: SolanaTrackerTopTrader): WalletSystemInfo {
        return {
            firstSeenAt: new Date(topTrader.firstTradeAt),
            lastSeenAt: new Date(topTrader.lastTradeAt),
            lastAnalyzedAt: new Date(),
            discoveredVia: 'top_traders',

            isMonitored: topTrader.rank ? topTrader.rank <= 100 : false,
            alertsEnabled: false,
            copyTradingEnabled: false,
            priority: topTrader.rank && topTrader.rank <= 50 ? 'high' : 'medium',

            transactionCount: topTrader.totalTrades,
            dataCompleteness: 75,
            lastDataRefresh: new Date(),

            status: topTrader.lastTradeAt > Date.now() - 7 * 24 * 60 * 60 * 1000
                ? WalletStatus.ACTIVE
                : WalletStatus.INACTIVE,
            isActive: topTrader.lastTradeAt > Date.now() - 7 * 24 * 60 * 60 * 1000,

            notes: undefined,
            tags: [],
        };
    }

    // ============================================================================
    // HELPER METHODS
    // ============================================================================

    private static determineTraderTier(winRate: number, totalPnl: number): TraderTier {
        if (winRate >= 80 && totalPnl >= 500) return TraderTier.DIAMOND;
        if (winRate >= 70 && totalPnl >= 100) return TraderTier.PLATINUM;
        if (winRate >= 60 && totalPnl >= 50) return TraderTier.GOLD;
        if (winRate >= 50 && totalPnl >= 20) return TraderTier.SILVER;
        if (winRate >= 40 && totalPnl >= 5) return TraderTier.BRONZE;
        return TraderTier.UNKNOWN;
    }

    private static calculateConfidenceScore(topTrader: SolanaTrackerTopTrader): number {
        let score = 0;

        // Base on win rate
        score += topTrader.winRate;

        // Add for total trades (more data = more confidence)
        if (topTrader.totalTrades > 100) score += 20;
        else if (topTrader.totalTrades > 50) score += 10;
        else if (topTrader.totalTrades > 20) score += 5;

        // Add for profitability
        if (topTrader.totalPnl > 100) score += 15;
        else if (topTrader.totalPnl > 50) score += 10;
        else if (topTrader.totalPnl > 20) score += 5;

        return Math.min(score, 100);
    }

    private static calculateReputationScore(topTrader: SolanaTrackerTopTrader): number {
        return (topTrader.winRate + (topTrader.roi / 10)) / 2;
    }

    private static determineTradingPattern(pnlData?: SolanaTrackerWalletPnL): TradingPattern {
        if (!pnlData) return TradingPattern.ONE_TRADE;

        const avgHoldTime = this.calculateAverageHoldTime(pnlData.tokens);

        if (avgHoldTime < 60) return TradingPattern.SCALPER;
        if (avgHoldTime < 1440) return TradingPattern.DAY_TRADER;
        if (avgHoldTime < 10080) return TradingPattern.SWING_TRADER;
        return TradingPattern.HOLDER;
    }

    private static calculateAverageHoldTime(tokens: SolanaTrackerTokenPnL[]): number {
        if (tokens.length === 0) return 0;

        const total = tokens.reduce((sum: number, t: any) => sum + (t.avgHoldTimeHours || 0) * 60, 0);
        return total / tokens.length;
    }

    private static calculateAvgMultiplier(tokens: SolanaTrackerTokenPnL[]): number {
        if (tokens.length === 0) return 1;

        const total = tokens.reduce((sum: number, t: any) => sum + t.multiplier, 0);
        return total / tokens.length;
    }

    // Default creators for missing data
    private static createDefaultTiming(): WalletTiming {
        return {
            entry: {
                avgTokenAgeAtEntry: 0,
                earlyEntryRate: 0,
                earlyEntrySuccessRate: 0,
                avgEntryMcap: 0,
                preferredEntryWindow: 'unknown',
            },
            exit: {
                avgHoldTimeMinutes: 0,
                avgHoldTimeHours: 0,
                avgExitMultiplier: 0,
                exitEfficiency: 0,
                takesLossesQuickly: false,
            },
            speed: {
                avgTimeToEnter: 0,
                avgTimeToExit: 0,
                isLikelyBot: false,
                usesJitoBundles: false,
            },
        };
    }

    private static createDefaultPortfolio(): WalletPortfolio {
        return {
            current: {
                totalValueSol: 0,
                totalValueUsd: 0,
                tokenCount: 0,
                largestHoldingSol: 0,
                largestHoldingPercentage: 0,
            },
            sol: {
                balance: 0,
                lastChecked: new Date(),
            },
            topHoldings: [],
            composition: {
                activePositions: 0,
                profitablePositions: 0,
                losingPositions: 0,
                avgPositionSize: 0,
            },
        };
    }

    private static createDefaultHistory(): WalletHistory {
        return {
            summary: {
                firstTradeAt: new Date(),
                lastTradeAt: new Date(),
                totalTrades: 0,
                totalVolumeSol: 0,
                totalVolumeUsd: 0,
                uniqueTokensTraded: 0,
            },
            recentTrades: [],
            notable: {},
            successfulTokens: [],
            failedTokens: [],
        };
    }

    // Alternative constructors for PnL-only data
    private static classifyFromPnL(pnlData: SolanaTrackerWalletPnL): WalletClassification {
        const tier = this.determineTraderTier(pnlData.stats.winRate, pnlData.totalPnl);

        return {
            type: tier === TraderTier.UNKNOWN ? WalletType.UNKNOWN : WalletType.POTENTIAL_SMART,
            confidenceScore: pnlData.stats.totalTrades > 20 ? 60 : 30,

            traits: {
                isEarlyEntrySpecialist: false,
                isSwingTrader: false,
                isSniper: false,
                isScalper: false,
                isHodler: false,
                isDeveloper: false,
                isWhale: pnlData.totalPnl > 100,
            },

            reputation: {
                score: pnlData.stats.winRate,
                tier,
                isWhitelisted: false,
                isBlacklisted: false,
            },

            tradingPattern: this.determineTradingPattern(pnlData),
        };
    }

    private static performanceFromPnL(pnlData: SolanaTrackerWalletPnL): WalletPerformance {
        return {
            trades: {
                total: pnlData.stats.totalTrades,
                winning: pnlData.stats.winningTrades,
                losing: pnlData.stats.losingTrades,
                breakeven: pnlData.stats.totalTrades - pnlData.stats.winningTrades - pnlData.stats.losingTrades,
                winRate: pnlData.stats.winRate,
            },

            pnl: {
                totalSol: pnlData.totalPnl,
                totalUsd: 0,
                realizedSol: pnlData.totalRealizedPnl,
                unrealizedSol: pnlData.totalUnrealizedPnl,
                totalInvestedSol: pnlData.totalInvested,

                largestWinSol: pnlData.stats.largestWinSol || 0,
                largestLossSol: pnlData.stats.largestLossSol || 0,
                avgWinSol: pnlData.stats.avgWinSol,
                avgLossSol: pnlData.stats.avgLossSol,
            },

            returns: {
                roi: pnlData.roi,
                profitFactor: pnlData.stats.profitFactor,
                avgReturnPerTrade: pnlData.totalPnl / pnlData.stats.totalTrades,
            },

            consistency: {
                consecutiveWins: 0,
                consecutiveLosses: 0,
                longestWinStreak: 0,
                longestLossStreak: 0,
            },

            recent: {
                trades: 0,
                winRate: pnlData.stats.winRate,
                pnlSol: pnlData.totalPnl,
                roi: pnlData.roi,
            },
        };
    }

    private static behaviorFromPnL(pnlData: SolanaTrackerWalletPnL): WalletBehavior {
        const avgBuySize = pnlData.totalInvested / pnlData.stats.totalTrades;

        return {
            sizing: {
                avgBuySizeSol: avgBuySize,
                avgSellSizeSol: avgBuySize * 0.8,
                minPositionSol: 0,
                maxPositionSol: 0,
                typicalRiskPerTrade: 0,
                positionSizeConsistency: 0,
            },

            frequency: {
                tradesPerDay: pnlData.activeDays ? pnlData.stats.totalTrades / pnlData.activeDays : 0,
                mostActiveHour: 0,
                mostActiveDay: '',
                isActiveWeekends: true,
                tradingDays: pnlData.activeDays || 0,
            },

            preferences: {
                avgLiquidityTarget: 0,
                avgMcapTarget: 0,
            },

            patterns: {
                followsSmartMoney: false,
                isFollowedByOthers: false,
                frontRuns: false,
                copiesWallets: [],
                copiedBy: [],
            },

            risk: {
                averageRiskLevel: pnlData.stats.winRate > 70 ? 'conservative' : 'aggressive',
                diversification: pnlData.tokens.length > 10 ? 80 : 40,
                maxDrawdownTolerance: 0,
                usesStopLosses: pnlData.stats.winRate > 60,
            },
        };
    }

    private static systemInfoFromPnL(pnlData: SolanaTrackerWalletPnL): WalletSystemInfo {
        return {
            firstSeenAt: new Date(pnlData.firstTradeAt || Date.now()),
            lastSeenAt: new Date(pnlData.lastTradeAt || Date.now()),
            lastAnalyzedAt: new Date(),
            discoveredVia: 'manual',

            isMonitored: false,
            alertsEnabled: false,
            copyTradingEnabled: false,
            priority: 'medium',

            transactionCount: pnlData.stats.totalTrades,
            dataCompleteness: 60,
            lastDataRefresh: new Date(),

            status: WalletStatus.ACTIVE,
            isActive: true,

            notes: undefined,
            tags: [],
        };
    }
}

