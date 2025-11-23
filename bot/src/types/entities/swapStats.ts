
export interface JupiterSwapStats {
    priceChange?: number;
    holderChange?: number;
    liquidityChange?: number;
    volumeChange?: number;
    buyVolume?: number;
    sellVolume?: number;
    buyOrganicVolume?: number;
    sellOrganicVolume?: number;
    numBuys?: number;
    numSells?: number;
    numTraders?: number;
    numOrganicBuyers?: number;
    numNetBuyers?: number;
}