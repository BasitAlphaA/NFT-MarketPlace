const path = require("path")

const {
    frontEndContractsFile,
    frontEndContractsFile2,
    frontEndAbiLocation,
    frontEndAbiLocation2,
} = require("../helper-hardhat-config")
require("dotenv").config()
const fs = require("fs")
const { network } = require("hardhat")

module.exports = async () => {
    if (process.env.UPDATE_FRONT_END) {
        console.log("Writing to front end...")
        await updateContractAddresses()
        await updateAbi()
        console.log("Front end written!")
    }
}
// Safely read and parse JSON files
function safeReadJSON(filePath) {
    try {
        const data = fs.readFileSync(filePath, "utf8");
        return JSON.parse(data);
    } catch (error) {
        if (error.code === "ENOENT") {
            console.warn(`${filePath} does not exist. Creating a new one.`);
        } else {
            console.warn(`Error reading or parsing ${filePath}: ${error.message}`);
        }
        return {}; // Return an empty object if the file doesn't exist or is invalid
    }
}

async function updateAbi() {
    const chainId = network.config.chainId;

    // Fetch and format the NftMarketPlace contract ABI
    const nftMarketplace = await ethers.getContract("NftMarketPlace");
    const contractABI = nftMarketplace.interface.format(ethers.utils.FormatTypes.json);

    // Safely read the front-end ABI JSON file
    let frontEndAbiData = safeReadJSON(frontEndAbiLocation);

    if (!frontEndAbiData[chainId]) {
        frontEndAbiData[chainId] = {};
    }

    // Update the ABI
    frontEndAbiData[chainId]["NftMarketPlace"] = JSON.parse(contractABI);

    // Write the updated ABI
    fs.writeFileSync(frontEndAbiLocation, JSON.stringify(frontEndAbiData, null, 2));

    // Fetch and format the BasicNft contract ABI
    const basicNft = await ethers.getContract("BasicNft");
    const contractABI2 = basicNft.interface.format(ethers.utils.FormatTypes.json);

    // Safely read the second ABI JSON file
    let frontEndAbiData2 = safeReadJSON(frontEndAbiLocation2);

    if (!frontEndAbiData2[chainId]) {
        frontEndAbiData2[chainId] = {};
    }

    // Update the ABI
    frontEndAbiData2[chainId]["BasicNft"] = JSON.parse(contractABI2);

    // Write the updated ABI
    fs.writeFileSync(frontEndAbiLocation2, JSON.stringify(frontEndAbiData2, null, 2));
}


async function updateContractAddresses() {
    const chainId = network.config.chainId;
    const nftMarketplace = await ethers.getContract("NftMarketPlace");

    // Use safeReadJSON to handle potential issues
    const contractAddresses = safeReadJSON(frontEndContractsFile);

    if (!contractAddresses[chainId]) {
        contractAddresses[chainId] = {};
    }
    if (!contractAddresses[chainId]["NftMarketPlace"]) {
        contractAddresses[chainId]["NftMarketPlace"] = [];
    }
    if (!contractAddresses[chainId]["NftMarketPlace"].includes(nftMarketplace.address)) {
        contractAddresses[chainId]["NftMarketPlace"].push(nftMarketplace.address);
    }
    fs.writeFileSync(frontEndContractsFile, JSON.stringify(contractAddresses, null, 2));

    // Repeat for BasicNft
    const basicNft = await ethers.getContract("BasicNft");
    const contractAddresses2 = safeReadJSON(frontEndContractsFile2);

    if (!contractAddresses2[chainId]) {
        contractAddresses2[chainId] = {};
    }
    if (!contractAddresses2[chainId]["BasicNft"]) {
        contractAddresses2[chainId]["BasicNft"] = [];
    }
    if (!contractAddresses2[chainId]["BasicNft"].includes(basicNft.address)) {
        contractAddresses2[chainId]["BasicNft"].push(basicNft.address);
    }
    fs.writeFileSync(frontEndContractsFile2, JSON.stringify(contractAddresses2, null, 2));
}


module.exports.tags = ["all", "frontend"]


// async function updateAbi() {
//     const nftMarketplace = await ethers.getContract("NftMarketplace")
//     fs.writeFileSync(
//         `${frontEndAbiLocation}NftMarketplace.json`,
//         nftMarketplace.interface.format(ethers.utils.FormatTypes.json)
//     )
//     fs.writeFileSync(
//         `${frontEndAbiLocation2}NftMarketplace.json`,
//         nftMarketplace.interface.format(ethers.utils.FormatTypes.json)
//     )

//     const basicNft = await ethers.getContract("BasicNft")
//     fs.writeFileSync(
//         `${frontEndAbiLocation}BasicNft.json`,
//         basicNft.interface.format(ethers.utils.FormatTypes.json)
//     )
//     fs.writeFileSync(
//         `${frontEndAbiLocation2}BasicNft.json`,
//         basicNft.interface.format(ethers.utils.FormatTypes.json)
//     )
// }