const { network } = require("hardhat")
const { developmentChains, VERIFICATION_BLOCK_CONFIRMATIONS } = require("../helper-hardhat-config")
const { verify } = require("../utils/verify")

module.exports = async ({ getNamedAccounts, deployments }) => {
    const { deploy, log } = deployments
    const { deployer } = await getNamedAccounts()
    

    log("----------------------------------------------------")
const args = []
const basicNft = await deploy("BasicNft", {
    from : deployer,
    args : args,
    log : true ,
    waitConfirmations: network.config.blockConfirmations || 1,
})
   // Verify the deployment
   if (!developmentChains.includes(network.name) && process.env.ETHERSCAN_API_KEY) {
    log("Verifying...")
    await verify(basicNft.address, arguments)
}
log("deployer : ",deployer.address)

log("----------------------------------------------------")
}

module.exports.tags = ["all", "basicNft"]





