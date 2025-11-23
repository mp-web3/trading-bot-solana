import axios from 'axios';
import { JupiterToken } from '../types/entities/token';

const JUPITER_BASE_URL = 'https://lite-api.jup.ag/tokens/v2/';

export class JupiterClient {
    private baseUrl: string;

    constructor() {
        this.baseUrl = JUPITER_BASE_URL;
    }

    /**
     * Fetch recently created tokens (new launches)
     * Returns up to 30 tokens that recently had their first pool created
     */
    async getRecentTokens(): Promise<JupiterToken[]> {
        try {
            const response = await axios.get(`${this.baseUrl}recent`);
            return response.data;
        } catch (error: any) {
            console.error('Error fetching recent tokens:', error.message);
            throw error;
        }
    }

    /**
     * Filter tokens by criteria for meme token analysis
     */
    filterMemeTokens(tokens: JupiterToken[], criteria: {
        maxMarketCap?: number;
        minLiquidity?: number;
        minHolderCount?: number;
        requireAuditPass?: boolean;
    } = {}): JupiterToken[] {
        const {
            maxMarketCap = 500000, // Under 500k market cap
            minLiquidity = 5000, // At least $5k liquidity
            minHolderCount = 50, // At least 50 holders
            requireAuditPass = true,
        } = criteria;

        return tokens.filter(token => {
            // Market cap filter
            if (token.mcap && token.mcap > maxMarketCap) return false;

            // Liquidity filter
            if (token.liquidity && token.liquidity < minLiquidity) return false;

            // Holder count filter
            if (token.holderCount && token.holderCount < minHolderCount) return false;

            // Audit filters (safety checks)
            if (requireAuditPass && token.audit) {
                if (token.audit.isSus) return false;
                if (!token.audit.mintAuthorityDisabled) return false;
                if (!token.audit.freezeAuthorityDisabled) return false;
                if (token.audit.devBalancePercentage && token.audit.devBalancePercentage > 20) return false;
            }

            return true;
        });
    }

    /**
     * Score tokens based on multiple factors
     */
    scoreToken(token: JupiterToken): number {
        let score = 0;

        // Volume growth score
        if (token.stats24h?.volumeChange && token.stats24h.volumeChange > 0) {
            score += Math.min(token.stats24h.volumeChange / 100, 10); // Max 10 points
        }

        // Liquidity score
        if (token.liquidity) {
            score += Math.min(token.liquidity / 10000, 10); // Max 10 points
        }

        // Holder growth score
        if (token.stats24h?.holderChange && token.stats24h.holderChange > 0) {
            score += Math.min(token.stats24h.holderChange, 10); // Max 10 points
        }

        // Organic score
        if (token.organicScore) {
            score += token.organicScore / 10; // Max 10 points
        }

        // Price momentum
        if (token.stats24h?.priceChange && token.stats24h.priceChange > 0) {
            score += Math.min(token.stats24h.priceChange / 10, 10); // Max 10 points
        }

        // Verified bonus
        if (token.isVerified) {
            score += 5;
        }

        return Math.round(score * 10) / 10; // Round to 1 decimal
    }
}

// Export singleton instance
export const jupiterClient = new JupiterClient();

