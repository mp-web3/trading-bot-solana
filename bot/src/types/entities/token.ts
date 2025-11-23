import { JupiterSwapStats } from "./index";

export interface JupiterToken {
    id: string; // mint address
    name: string;
    symbol: string;
    icon: string | null;
    decimals: number;
    twitter?: string;
    telegram?: string;
    website?: string;
    dev?: string;
    circSupply?: number;
    totalSupply?: number;
    holderCount?: number;
    fdv?: number; // fully diluted valuation
    mcap?: number; // market cap
    usdPrice?: number;
    liquidity?: number;
    stats5m?: JupiterSwapStats;
    stats1h?: JupiterSwapStats;
    stats6h?: JupiterSwapStats;
    stats24h?: JupiterSwapStats;
    audit?: {
        isSus?: boolean;
        mintAuthorityDisabled?: boolean;
        freezeAuthorityDisabled?: boolean;
        topHoldersPercentage?: number;
        devBalancePercentage?: number;
        devMigrations?: number;
    };
    organicScore?: number;
    organicScoreLabel?: 'high' | 'medium' | 'low';
    isVerified?: boolean;
    updatedAt: string;
}


// {
//     "url": "https://example.com",
//     "chainId": "text",
//     "tokenAddress": "text",
//     "icon": "https://example.com",
//     "header": "https://example.com",
//     "description": "text",
//     "links": [
//       {
//         "type": "text",
//         "label": "text",
//         "url": "https://example.com"
//       }
//     ]
//   }

export interface DexScreenerToken {
    url: string;
    chainId: string;
    tokenAddress: string;
    icon: string;
    header: string;
    description: string;


}