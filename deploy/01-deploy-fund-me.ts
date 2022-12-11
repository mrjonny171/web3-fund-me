//import

import { network } from 'hardhat'
import { DeployFunction } from 'hardhat-deploy/dist/types'
import { HardhatRuntimeEnvironment } from 'hardhat/types'
import { networkConfig } from '../helper-hardhat-config'
import verify from '../utils/verify'

const deployFundMe: DeployFunction = async (hre: HardhatRuntimeEnvironment) => {
    const { getNamedAccounts, deployments } = hre

    const { deploy, log } = deployments
    const { deployer } = await getNamedAccounts()

    const chainId = network.config.chainId!

    let ethUSDPriceFeedAddress: string
    if (chainId == 31337) {
        const MockV3Aggregator = await deployments.get('MockV3Aggregator')
        ethUSDPriceFeedAddress = MockV3Aggregator.address
    } else {
        ethUSDPriceFeedAddress = networkConfig[chainId]['ethUSDPriceFeed']!
    }

    const args = [ethUSDPriceFeedAddress]
    const fundMe = await deploy('FundMe', {
        from: deployer,
        args: args,
        log: true,
        waitConfirmations: networkConfig[chainId]['blockConfirmations'] || 0,
    })
    log('----------------------------------------------')

    if (chainId != 31337 && process.env.ETHERSCAN_API_KEY) {
        await verify(fundMe.address, args)
    }
}

export default deployFundMe
deployFundMe.tags = ['all', 'fundme']
