export interface networkConfigItem {
    ethUSDPriceFeed?: string
    name?: string
    blockConfirmations?: number
}

export interface networkConfigInfo {
    [key: string]: networkConfigItem
}

export const networkConfig: networkConfigInfo = {
    5: {
        name: 'goerli',
        ethUSDPriceFeed: '0xd4a33860578de61dbabdc8bfdb98fd742fa7028e',
        blockConfirmations: 6,
    },
    137: {
        name: 'polygon',
        ethUSDPriceFeed: '0xf9680d99d6c9589e2a93a78a04a279e509205945',
        blockConfirmations: 6,
    },
    31337: {},
}

export const developmentChains = ['hardhat', 'localhost']
