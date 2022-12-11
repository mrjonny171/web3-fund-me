import { network } from 'hardhat'
import { DeployFunction } from 'hardhat-deploy/dist/types'
import { HardhatRuntimeEnvironment } from 'hardhat/types'
import { networkConfig } from '../helper-hardhat-config'
import { developmentChains } from '../helper-hardhat-config'

const DECIMALS: number = 8
const INITIAL_ANSWER: number = 200000000000

const deployFundMe: DeployFunction = async (hre: HardhatRuntimeEnvironment) => {
    const { getNamedAccounts, deployments } = hre

    const { deploy, log } = deployments
    const { deployer } = await getNamedAccounts()

    const chainId = network.config.chainId!

    if (chainId == 31337) {
        log('Local network detected! Deploying mocks...')
        await deploy('MockV3Aggregator', {
            contract: 'MockV3Aggregator',
            from: deployer,
            log: true,
            args: [DECIMALS, INITIAL_ANSWER],
        })

        log('Mocks deployed!')
        log('------------------------------------------------------')
    }
}

export default deployFundMe
deployFundMe.tags = ['all', 'mocks']
