const { network ,getNamedAccounts} = require("hardhat")
const { developmentChains, VERIFICATION_BLOCK_CONFIRMATIONS } = require("../helper-hardhat-config")
const { verify } = require("../utils/verify")

module.exports = async ({ getNamedAccounts, deployments }) => {
    const { deploy, log } = deployments
    const { deployer } = await getNamedAccounts()

    log("----------------------------------------------------")
const args = []
const nftMarketPlace = await deploy("NftMarketPlace", {
    from : deployer,
    args : args,
    log : true ,
    waitConfirmations: network.config.blockConfirmations || 1,
})
   // Verify the deployment
   if (!developmentChains.includes(network.name) && process.env.ETHERSCAN_API_KEY) {
    log("Verifying...")
    await verify(nftMarketPlace.address, args)
}
log("----------------------------------------------------")

}

module.exports.tags = ["all", "nftmarketplace"]