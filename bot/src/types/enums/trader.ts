/**
 * Wallet/Trader classification enumerations
 */

export enum WalletType {
    UNKNOWN = 'unknown',
    POTENTIAL_SMART = 'potential_smart',
    CONFIRMED_SMART = 'confirmed_smart',
    TOP_TRADER = 'top_trader',
    BOT = 'bot',
    WHALE = 'whale',
    DEVELOPER = 'developer',
    EXCHANGE = 'exchange',
    SNIPER = 'sniper',
    INSIDER = 'insider',
    RETAIL = 'retail',
}

export enum TraderTier {
    UNKNOWN = 'unknown',
    BRONZE = 'bronze',
    SILVER = 'silver',
    GOLD = 'gold',
    PLATINUM = 'platinum',
    DIAMOND = 'diamond',
}

export enum TradingPattern {
    SCALPER = 'scalper',              // Very short holds (<1h)
    DAY_TRADER = 'day_trader',        // Intraday (1-24h)
    SWING_TRADER = 'swing',           // Multi-day (1-7 days)
    POSITION_TRADER = 'position',     // Long-term (>7 days)
    HOLDER = 'holder',                // Buy and hold
    ONE_TRADE = 'one_trade',          // Single trade only
}

export const WALLET_TYPE_DISPLAY_NAMES: Record<WalletType, string> = {
    [WalletType.UNKNOWN]: 'Unknown',
    [WalletType.POTENTIAL_SMART]: 'Potential Smart Money',
    [WalletType.CONFIRMED_SMART]: 'Confirmed Smart Money',
    [WalletType.TOP_TRADER]: 'Top Trader',
    [WalletType.BOT]: 'Trading Bot',
    [WalletType.WHALE]: 'Whale',
    [WalletType.DEVELOPER]: 'Token Developer',
    [WalletType.EXCHANGE]: 'Exchange Wallet',
    [WalletType.SNIPER]: 'Sniper Bot',
    [WalletType.INSIDER]: 'Insider',
    [WalletType.RETAIL]: 'Retail Trader',
};

export const TRADER_TIER_THRESHOLDS = {
    [TraderTier.BRONZE]: { minWinRate: 40, minPnl: 5 },
    [TraderTier.SILVER]: { minWinRate: 50, minPnl: 20 },
    [TraderTier.GOLD]: { minWinRate: 60, minPnl: 50 },
    [TraderTier.PLATINUM]: { minWinRate: 70, minPnl: 100 },
    [TraderTier.DIAMOND]: { minWinRate: 80, minPnl: 500 },
};

