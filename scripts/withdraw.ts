import { ethers, getNamedAccounts } from 'hardhat'
import { FundMe } from '../typechain-types'

async function main() {
    const { deployer } = await getNamedAccounts()
    const fundMe: FundMe = await ethers.getContract('FundMe', deployer)

    console.log('Withdrawing from the contract...')

    const txResponse = await fundMe.withdraw()
    await txResponse.wait(1)

    console.log('Withdrawed!')
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.log(error)
        process.exit(1)
    })
