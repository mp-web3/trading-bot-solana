/**
 * Token Mapper Service
 * Converts API responses to unified Token entity
 * 
 * Source: SolanaTracker (exclusive)
 */

import {
    Token,
    TokenPreview,
    TokenLaunch,
    TokenMarket,
    TokenLiquidity,
    TokenHolders,
    TokenActivity,
    TokenSecurity,
    TokenRisk,
    TokenQuality,
    TokenAnalytics,
    TokenMetadata,
    TokenSystemInfo,
} from '../../types/entities/token';
import {
    SolanaTrackerToken,
    SolanaTrackerRiskData,
    SolanaTrackerSearchParams,
} from '../../types/api/solanatracker';
import { TokenStatus, Launchpad, RiskLevel } from '../../types/enums';

export class TokenMapper {
    /**
     * Create unified token from SolanaTracker data (exclusive source)
     */
    static fromSolanaTracker(
        stToken: SolanaTrackerToken,
        riskData?: SolanaTrackerRiskData
    ): Token {
        return {
            mintAddress: stToken.mint,
            symbol: stToken.symbol,
            name: stToken.name,
            decimals: stToken.decimals,

            launch: this.mapLaunch(stToken),
            market: this.mapMarket(stToken),
            liquidity: this.mapLiquidity(stToken),
            holders: this.mapHolders(stToken),
            activity: this.mapActivity(stToken),
            security: this.mapSecurity(stToken),
            risk: this.mapRisk(stToken, riskData),
            quality: this.mapQuality(stToken),
            analytics: this.createInitialAnalytics(stToken),
            metadata: this.mapMetadata(stToken),
            system: this.createSystemInfo(stToken),
        };
    }

    /**
     * Create preview/summary version for lists
     */
    static toPreview(token: Token): TokenPreview {
        return {
            mintAddress: token.mintAddress,
            symbol: token.symbol,
            name: token.name,
            image: token.metadata.image,

            price: token.market.price.usd,
            marketCap: token.market.marketCap,
            liquidity: token.liquidity.total,
            priceChange24h: token.market.priceChange.h24,
            volume24h: token.activity.volume.h24,

            riskLevel: token.risk.overall.level,
            riskScore: token.risk.overall.score,

            smartMoneyCount: token.holders.smartMoney.count,
            overallScore: token.analytics.scores.overall,

            status: token.system.status,
            createdAt: token.launch.createdAt,
        };
    }

    // ============================================================================
    // PRIVATE MAPPERS
    // ============================================================================

    private static mapLaunch(stToken: SolanaTrackerToken): TokenLaunch {
        return {
            launchpad: this.parseLaunchpad(stToken.market),
            createdAt: new Date(stToken.createdAt),
            firstPoolCreatedAt: new Date(stToken.createdAt),

            developer: {
                address: stToken.deployer || stToken.tokenDetails?.creator || 'unknown',
                isVerified: stToken.verified,
            },

            initial: {
                mcap: stToken.marketCapUsd,
                liquidity: stToken.liquidityUsd,
                holderCount: stToken.holders,
                price: stToken.priceUsd,
            },

            graduation: stToken.launchpad?.curvePercentage !== undefined ? {
                hasGraduated: stToken.status === 'graduated',
                graduatedAt: stToken.status === 'graduated' ? new Date() : undefined,
                bondingCurvePercentage: stToken.launchpad.curvePercentage,
            } : undefined,
        };
    }

    private static mapMarket(stToken: SolanaTrackerToken): TokenMarket {
        return {
            price: {
                usd: stToken.priceUsd,
                lastUpdated: new Date(stToken.lastUpdated),
                source: 'solanatracker',
            },

            marketCap: stToken.marketCapUsd,
            fdv: stToken.marketCapUsd, // Assuming fully diluted

            priceChange: {
                m5: 0, // Not provided, would need historical data
                h1: 0,
                h6: 0,
                h24: 0,
            },

            peak: {
                price: stToken.priceUsd,
                priceAt: new Date(stToken.lastUpdated),
                mcap: stToken.marketCapUsd,
                mcapAt: new Date(stToken.lastUpdated),
                multiplierFromLaunch: 1,
            },

            pool: {
                address: stToken.poolAddress,
                dex: stToken.market,
                quoteToken: stToken.quoteToken,
            },
        };
    }

    private static mapLiquidity(stToken: SolanaTrackerToken): TokenLiquidity {
        return {
            total: stToken.liquidityUsd,
            totalUsd: stToken.liquidityUsd,
            lpBurnPercentage: stToken.lpBurn,

            history: [],

            metrics: {
                isHealthy: stToken.liquidityUsd > 10000,
                liquidityToMcapRatio: stToken.marketCapUsd > 0
                    ? stToken.liquidityUsd / stToken.marketCapUsd
                    : 0,
                isFragmented: false,
                dominantDex: stToken.market,
            },
        };
    }

    private static mapHolders(stToken: SolanaTrackerToken): TokenHolders {
        return {
            total: stToken.holders,

            concentration: {
                top10Percentage: stToken.top10,
                devPercentage: stToken.dev,
                insidersPercentage: stToken.insiders,
                snipersPercentage: stToken.snipers,
            },

            distribution: {
                whales: Math.floor(stToken.holders * (stToken.top10 / 100)),
                mediumHolders: Math.floor(stToken.holders * 0.1),
                smallHolders: Math.floor(stToken.holders * 0.8),
            },

            growth: {},

            smartMoney: {
                count: 0, // Would need to query top traders API
                topSmartWallets: [],
                avgWalletScore: 0,
                totalPercentage: 0,
                recentActivity: 'holding',
            },
        };
    }

    private static mapActivity(
        stToken: SolanaTrackerToken
    ): TokenActivity {
        return {
            volume: {
                m5: stToken.volume_5m || 0,
                m15: stToken.volume_15m,
                m30: stToken.volume_30m,
                h1: stToken.volume_1h || 0,
                h6: stToken.volume_6h || 0,
                h12: stToken.volume_12h,
                h24: stToken.volume_24h || 0,
            },

            transactions: {
                total: stToken.totalTransactions,
                buys: stToken.buys,
                sells: stToken.sells,
                buysVsSells: stToken.sells > 0 ? stToken.buys / stToken.sells : 1,
            },

            pressure: {
                buyVolume24h: (stToken.volume_24h || 0) * (stToken.buys / (stToken.buys + stToken.sells)),
                sellVolume24h: (stToken.volume_24h || 0) * (stToken.sells / (stToken.buys + stToken.sells)),
                buyPressure: stToken.buys / (stToken.buys + stToken.sells),
            },

            // SolanaTracker doesn't provide organic volume breakdown
            organic: undefined,

            traders: {
                uniqueTraders24h: undefined,
            },

            fees: stToken.fees ? {
                totalFees: stToken.fees.total,
                tradingFees: stToken.fees.totalTrading,
                priorityFees: stToken.fees.totalTips,
            } : undefined,
        };
    }

    private static mapSecurity(stToken: SolanaTrackerToken): TokenSecurity {
        return {
            authorities: {
                mintDisabled: stToken.mintAuthority === null,
                freezeDisabled: stToken.freezeAuthority === null,
                mintAuthority: stToken.mintAuthority,
                freezeAuthority: stToken.freezeAuthority,
                updateAuthority: null,
            },

            lpBurn: {
                percentage: stToken.lpBurn,
                isFullyBurned: stToken.lpBurn === 100,
            },

            verification: {
                isVerified: stToken.verified || false,
                listedOnJupiter: stToken.jupiter || false,
                hasMetadata: !!stToken.image,
            },
        };
    }

    private static mapRisk(
        stToken: SolanaTrackerToken,
        riskData?: SolanaTrackerRiskData
    ): TokenRisk {
        if (riskData) {
            return {
                overall: {
                    score: riskData.riskScore,
                    level: riskData.riskLevel as RiskLevel,
                    recommendation: riskData.recommendation,
                },
                warnings: riskData.warnings,
                dangers: riskData.dangers,
                liquidityIssues: riskData.liquidityIssues,
                insiderRisks: riskData.insiderRisks,
                analysis: riskData.analysis,
                flags: {
                    devHoldingTooHigh: stToken.dev > 20,
                    top10HoldingTooHigh: stToken.top10 > 50,
                    liquidityTooLow: stToken.liquidityUsd < 5000,
                    suspiciousActivity: false,
                    recentDevDump: false,
                    possibleRugpull: riskData.riskLevel === 'critical',
                },
            };
        }

        // Calculate basic risk if no SolanaTracker risk data
        return this.calculateBasicRisk(stToken);
    }

    private static mapQuality(
        stToken: SolanaTrackerToken
    ): TokenQuality {
        return {
            organicScore: undefined, // SolanaTracker doesn't provide this
            organicScoreLabel: undefined,

            quality: {
                overallScore: 0, // Calculate based on multiple factors
                dataQuality: 80, // We have most data from SolanaTracker
                marketQuality: stToken.liquidityUsd > 10000 ? 70 : 40,
                communityQuality: stToken.hasSocials ? 60 : 20,
                socialPresence: stToken.hasSocials ? 60 : 20,
            },
        };
    }

    private static createInitialAnalytics(stToken: SolanaTrackerToken): TokenAnalytics {
        return {
            scores: {
                overall: 0, // Calculate
                liquidity: this.scoreLiquidity(stToken.liquidityUsd),
                holders: this.scoreHolders(stToken.holders),
                volume: this.scoreVolume(stToken.volume_24h),
                safety: this.scoreSafety(stToken),
                smartMoney: 0, // Needs top traders data
                momentum: 0, // Needs price history
            },

            patterns: {
                matchesSuccessPattern: false,
                similarToTokens: [],
                confidenceScore: 0,
            },
        };
    }

    private static mapMetadata(stToken: SolanaTrackerToken): TokenMetadata {
        return {
            image: stToken.image,

            social: stToken.socials || {
                twitter: undefined,
                telegram: undefined,
                discord: undefined,
                website: undefined,
            },

            tags: [],

            urls: {
                solanatracker: `https://solanatracker.io/token/${stToken.mint}`,
                solscan: `https://solscan.io/token/${stToken.mint}`,
                dexscreener: `https://dexscreener.com/solana/${stToken.mint}`,
            },
        };
    }

    private static createSystemInfo(stToken: SolanaTrackerToken): TokenSystemInfo {
        return {
            firstSeenAt: new Date(stToken.createdAt),
            discoveredVia: 'solanatracker',

            lastUpdatedAt: new Date(stToken.lastUpdated),
            lastFullEnrichmentAt: new Date(),
            updateCount: 1,

            dataCompleteness: 85,
            dataSources: ['solanatracker'],
            missingData: [],

            status: this.parseTokenStatus(stToken.status),
            isActive: true,
            isMonitored: false,
            priority: 'medium',

            snapshotCount: 0,
        };
    }

    // ============================================================================
    // HELPER METHODS
    // ============================================================================

    private static parseLaunchpad(launchpad: string): Launchpad {
        const lower = launchpad.toLowerCase();
        if (lower.includes('pump')) return Launchpad.PUMP_FUN;
        if (lower.includes('moon')) return Launchpad.MOONSHOT;
        if (lower.includes('raydium')) return Launchpad.RAYDIUM;
        if (lower.includes('meteora')) return Launchpad.METEORA;
        return Launchpad.UNKNOWN;
    }

    private static parseTokenStatus(status: string): TokenStatus {
        switch (status) {
            case 'graduating': return TokenStatus.GRADUATING;
            case 'graduated': return TokenStatus.GRADUATED;
            default: return TokenStatus.ACTIVE;
        }
    }

    private static calculateBasicRisk(stToken: SolanaTrackerToken): TokenRisk {
        let riskScore = 0;
        const warnings: string[] = [];
        const dangers: string[] = [];

        // Calculate risk based on available data
        if (stToken.dev > 20) {
            riskScore += 2;
            warnings.push(`Developer holds ${stToken.dev.toFixed(1)}% of supply`);
        }

        if (stToken.top10 > 50) {
            riskScore += 2;
            warnings.push(`Top 10 holders control ${stToken.top10.toFixed(1)}% of supply`);
        }

        if (stToken.liquidityUsd < 5000) {
            riskScore += 3;
            dangers.push(`Low liquidity: $${stToken.liquidityUsd.toFixed(0)}`);
        }

        if (stToken.mintAuthority !== null) {
            riskScore += 3;
            dangers.push('Mint authority not disabled');
        }

        if (stToken.freezeAuthority !== null) {
            riskScore += 2;
            dangers.push('Freeze authority not disabled');
        }

        return {
            overall: {
                score: Math.min(riskScore, 10),
                level: riskScore < 3 ? RiskLevel.LOW :
                    riskScore < 5 ? RiskLevel.MEDIUM :
                        riskScore < 7 ? RiskLevel.HIGH : RiskLevel.CRITICAL,
                recommendation: riskScore < 5 ? 'acceptable' : 'high-risk',
            },
            warnings,
            dangers,
            liquidityIssues: [],
            insiderRisks: [],
            analysis: {
                socialPresence: stToken.hasSocials ? 'medium' : 'low',
                liquidityRating: stToken.liquidityUsd > 20000 ? 'good' : 'poor',
                holderDistribution: stToken.top10 < 40 ? 'healthy' : 'concerning',
                contractSafety: stToken.mintAuthority === null ? 'safe' : 'risky',
            },
            flags: {
                devHoldingTooHigh: stToken.dev > 20,
                top10HoldingTooHigh: stToken.top10 > 50,
                liquidityTooLow: stToken.liquidityUsd < 5000,
                suspiciousActivity: false,
                recentDevDump: false,
                possibleRugpull: riskScore >= 7,
            },
        };
    }

    // Scoring helpers (0-100)
    private static scoreLiquidity(liquidity: number): number {
        if (liquidity > 100000) return 100;
        if (liquidity > 50000) return 80;
        if (liquidity > 20000) return 60;
        if (liquidity > 10000) return 40;
        if (liquidity > 5000) return 20;
        return 10;
    }

    private static scoreHolders(holders: number): number {
        if (holders > 1000) return 100;
        if (holders > 500) return 80;
        if (holders > 200) return 60;
        if (holders > 100) return 40;
        if (holders > 50) return 20;
        return 10;
    }

    private static scoreVolume(volume24h: number | undefined): number {
        const vol = volume24h || 0;
        if (vol > 100000) return 100;
        if (vol > 50000) return 80;
        if (vol > 20000) return 60;
        if (vol > 10000) return 40;
        if (vol > 5000) return 20;
        return 10;
    }

    private static scoreSafety(stToken: SolanaTrackerToken): number {
        let score = 100;

        if (stToken.mintAuthority !== null) score -= 30;
        if (stToken.freezeAuthority !== null) score -= 20;
        if (stToken.dev > 20) score -= 20;
        if (stToken.top10 > 50) score -= 15;
        if (stToken.lpBurn < 100) score -= 15;

        return Math.max(score, 0);
    }
}

