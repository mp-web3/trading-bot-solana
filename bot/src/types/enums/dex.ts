/**
 * DEX (Decentralized Exchange) identifiers
 */

export enum Dex {
    RAYDIUM = 'raydium',
    ORCA = 'orca',
    METEORA = 'meteora',
    PUMP_FUN = 'pumpfun',
    JUPITER = 'jupiter',
    PHOENIX = 'phoenix',
    LIFINITY = 'lifinity',
    UNKNOWN = 'unknown',
}

export enum Launchpad {
    PUMP_FUN = 'pump.fun',
    MOONSHOT = 'moonshot',
    LETS_BONK = 'letsbonk.fun',
    BAGS = 'bags',
    RAYDIUM = 'raydium',
    METEORA = 'meteora',
    UNKNOWN = 'unknown',
}

export const DEX_DISPLAY_NAMES: Record<Dex, string> = {
    [Dex.RAYDIUM]: 'Raydium',
    [Dex.ORCA]: 'Orca',
    [Dex.METEORA]: 'Meteora',
    [Dex.PUMP_FUN]: 'Pump.fun',
    [Dex.JUPITER]: 'Jupiter',
    [Dex.PHOENIX]: 'Phoenix',
    [Dex.LIFINITY]: 'Lifinity',
    [Dex.UNKNOWN]: 'Unknown',
};

