import { ethers, getNamedAccounts } from 'hardhat'
import { FundMe } from '../typechain-types'

async function main() {
    const { deployer } = await getNamedAccounts()
    const fundMe: FundMe = await ethers.getContract('FundMe', deployer)
    const sendValue = ethers.utils.parseEther('0.1')

    console.log(`Funding contract with ${sendValue} gwei...`)

    const txResponse = await fundMe.fund({ value: sendValue })
    await txResponse.wait(1)

    console.log('Funded!')
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.log(error)
        process.exit(1)
    })
