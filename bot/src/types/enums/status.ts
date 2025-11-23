/**
 * Status enumerations for entities
 */

export enum TokenStatus {
    ACTIVE = 'active',
    INACTIVE = 'inactive',
    GRADUATED = 'graduated',          // Moved from pump.fun to Raydium
    GRADUATING = 'graduating',        // In process of graduating
    RUGGED = 'rugged',                // Rugpull detected
    SUSPICIOUS = 'suspicious',        // Flagged as suspicious
    DELISTED = 'delisted',
}

export enum WalletStatus {
    ACTIVE = 'active',
    INACTIVE = 'inactive',
    BLACKLISTED = 'blacklisted',
    WHITELISTED = 'whitelisted',
    MONITORING = 'monitoring',        // Under observation
}

export enum TradeAction {
    BUY = 'buy',
    SELL = 'sell',
}

export enum TradeStatus {
    PENDING = 'pending',
    EXECUTING = 'executing',
    EXECUTED = 'executed',
    FAILED = 'failed',
    CANCELLED = 'cancelled',
    PARTIAL = 'partial',              // Partially filled
}

export enum PositionStatus {
    OPEN = 'open',
    CLOSED = 'closed',
    PARTIAL = 'partial',              // Partially exited
}

export enum RiskLevel {
    LOW = 'low',
    MEDIUM = 'medium',
    HIGH = 'high',
    CRITICAL = 'critical',
}

