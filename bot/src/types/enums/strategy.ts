/**
 * Trading strategy enumerations
 */

export enum StrategyType {
    SMART_MONEY_FOLLOW = 'smart_money_follow',
    DEVELOPER_REPUTATION = 'developer_reputation',
    MOMENTUM_SURGE = 'momentum_surge',
    LIQUIDITY_GRADUATION = 'liquidity_graduation',
    MANUAL = 'manual',
}

export enum SignalType {
    ENTRY = 'entry',
    EXIT = 'exit',
    PARTIAL_EXIT = 'partial_exit',
    EMERGENCY_EXIT = 'emergency_exit',
    STOP_LOSS = 'stop_loss',
    TAKE_PROFIT = 'take_profit',
    TRAILING_STOP = 'trailing_stop',
}

export enum ExitReason {
    TAKE_PROFIT = 'take_profit',
    STOP_LOSS = 'stop_loss',
    TRAILING_STOP = 'trailing_stop',
    TIME_BASED = 'time_based',
    SMART_MONEY_EXIT = 'smart_money_exit',
    DEV_DUMP = 'dev_dump',
    LIQUIDITY_CRASH = 'liquidity_crash',
    RUGPULL_DETECTED = 'rugpull_detected',
    MANUAL = 'manual',
}

export const STRATEGY_DISPLAY_NAMES: Record<StrategyType, string> = {
    [StrategyType.SMART_MONEY_FOLLOW]: 'Smart Money Follow',
    [StrategyType.DEVELOPER_REPUTATION]: 'Developer Reputation',
    [StrategyType.MOMENTUM_SURGE]: 'Momentum Surge',
    [StrategyType.LIQUIDITY_GRADUATION]: 'Liquidity Graduation',
    [StrategyType.MANUAL]: 'Manual Trade',
};

