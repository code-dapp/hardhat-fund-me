//***first method
//imports
//main function
//caling main function
//***second method
// function deployFunc(hre) {
//     console.log("hi")
// }
// module.exports.defaults = deployFunc()
//==
// const helperconfig = require("../helper-hardhat-config")
// const networkConfig = helperconfig.networkConfig

const { networkConfig, developmentChains } = require("../helper-hardhat-config")
const { network } = require("hardhat") //this network thing is coming from hardhat
const { verify } = require("../utils/verify")

module.exports = async ({ getNamedAccounts, deployments }) => {
    const { deploy, log } = deployments
    const { deployer } = await getNamedAccounts()
    const chainId = network.config.chainId
    // const ethUsdPriceFeedAddress = networkConfig[chainId]["ethUsdPriceFeed"]
    let ethUsdPriceFeedAddress // with let we can actualy apdate it
    if (developmentChains.includes(network.name)) {
        const ethUsdAggregator = await deployments.get("MockV3Aggregator")
        ethUsdPriceFeedAddress = ethUsdAggregator.address
        // if we are on developmentchains get price feed from mockv3aggregator
    } else {
        ethUsdPriceFeedAddress = networkConfig[chainId]["ethUsdPriceFeed"]
    }
    const args = [ethUsdPriceFeedAddress]
    const fundMe = await deploy("FundMe", {
        from: deployer,
        args: args,
        log: true,
        // we add waitconfirmations to give etherscan the chance to index our transaction
        waitConfirmations: network.config.blockConfirmations || 1,
    })

    if (
        !developmentChains.includes(network.name) &&
        process.env.ETHERSCAN_API_KEY
    ) {
        await verify(fundMe.address, args)
    }

    log("----------------------------------------------------")
}

module.exports.tags = ["all", "Fundme"]
