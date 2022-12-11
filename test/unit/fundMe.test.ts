import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers'
import { assert, expect } from 'chai'
import { deployments, ethers, network } from 'hardhat'
import { connected } from 'process'
import { developmentChains } from '../../helper-hardhat-config'
import { FundMe, MockV3Aggregator } from '../../typechain-types'

//Unit tests are for local testing

!developmentChains.includes(network.name)
    ? describe.skip
    : describe('FundMe', () => {
          let fundMe: FundMe
          let deployer: SignerWithAddress
          let mockV3Aggregator: MockV3Aggregator
          const sendValue = ethers.utils.parseEther('1')

          beforeEach(async () => {
              const accounts = await ethers.getSigners()
              deployer = accounts[0]
              await deployments.fixture(['all'])
              fundMe = await ethers.getContract('FundMe', deployer)
              mockV3Aggregator = await ethers.getContract(
                  'MockV3Aggregator',
                  deployer
              )
          })

          describe('constructor', async () => {
              it('sets the aggregator addresses correctly', async () => {
                  const response = await fundMe.getPriceFeed()
                  assert.equal(response, mockV3Aggregator.address)
              })
          })

          describe('fund', async () => {
              it('Not enough eth send to the contract', async () => {
                  await expect(
                      fundMe.fund({
                          value: 10,
                      })
                  ).to.be.revertedWith('You need to spend more ETH!')
              })

              it('update the amount sent to the contract', async () => {
                  await fundMe.fund({
                      value: sendValue,
                      from: deployer.address,
                  })
                  const accountValue = await fundMe.getAddressToAmountFunded(
                      deployer.address
                  )
                  assert.equal(accountValue.toString(), sendValue.toString())
              })

              it('adds funder to array of funders', async () => {
                  await fundMe.fund({
                      value: sendValue,
                      from: deployer.address,
                  })

                  const funderAddress = await fundMe.getFunder(0)
                  assert.equal(funderAddress, deployer.address)
              })
          })

          describe('withdraw', async () => {
              beforeEach(async () => {
                  await fundMe.fund({
                      value: sendValue,
                      from: deployer.address,
                  })
              })

              it('withdraw ETH from a single funder', async () => {
                  //Arrange

                  const startingFundMeBalance =
                      await fundMe.provider.getBalance(fundMe.address)

                  const startingDeployerBalance =
                      await fundMe.provider.getBalance(deployer.address)

                  //Act
                  const txResponse = await fundMe.withdraw({
                      from: deployer.address,
                  })
                  const txReceipt = await txResponse.wait(1)

                  const { gasUsed, effectiveGasPrice } = txReceipt
                  const gasCost = gasUsed.mul(effectiveGasPrice)

                  const endingFundMeBalance = await fundMe.provider.getBalance(
                      fundMe.address
                  )

                  const endingDeployerBalance =
                      await fundMe.provider.getBalance(deployer.address)

                  //Assert
                  assert.equal(endingFundMeBalance.toString(), '0'.toString())
                  assert.equal(
                      endingDeployerBalance.add(gasCost).toString(),
                      startingFundMeBalance
                          .add(startingDeployerBalance)
                          .toString()
                  )
              })

              it('Withdraw ETH from multiple funders', async () => {
                  //Arrange
                  const accounts = await ethers.getSigners()

                  for (let i = 1; i < 5; i++) {
                      let fundMeConnectedAccount = await fundMe.connect(
                          accounts[i]
                      )
                      await fundMeConnectedAccount.fund({ value: sendValue })
                  }

                  const startingFundMeBalance =
                      await fundMe.provider.getBalance(fundMe.address)

                  const startingDeployerBalance =
                      await fundMe.provider.getBalance(deployer.address)

                  //Act
                  const txResponse = await fundMe.withdraw({
                      from: deployer.address,
                  })
                  const txReceipt = await txResponse.wait(1)

                  const { gasUsed, effectiveGasPrice } = txReceipt
                  const gasCost = gasUsed.mul(effectiveGasPrice)

                  const endingFundMeBalance = await fundMe.provider.getBalance(
                      fundMe.address
                  )

                  const endingDeployerBalance =
                      await fundMe.provider.getBalance(deployer.address)

                  //Assert
                  assert.equal(endingFundMeBalance.toString(), '0'.toString())
                  assert.equal(
                      endingDeployerBalance.add(gasCost).toString(),
                      startingFundMeBalance
                          .add(startingDeployerBalance)
                          .toString()
                  )

                  for (let i = 0; i < 5; i++) {
                      assert.equal(
                          await (
                              await fundMe.getAddressToAmountFunded(
                                  accounts[i].address
                              )
                          ).toString(),
                          '0'.toString()
                      )
                  }
              })

              it('Only allows the user to withdraw if he is the owner', async () => {
                  const accounts = await ethers.getSigners()
                  const attackerAccount = accounts[1]

                  const attackerConnectedAccount = await fundMe.connect(
                      attackerAccount
                  )

                  await expect(
                      attackerConnectedAccount.withdraw()
                  ).to.be.revertedWithCustomError(fundMe, 'FundMe__NotOwner')
              })
          })
      })
