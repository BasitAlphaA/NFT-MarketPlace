
// USE THIS FOR TESTING INSTEAD OF FIREEVENT.JS

const { ethers, network } = require("hardhat")

const PRICE = ethers.utils.parseEther("0.1")

async function mintAndList() {
  const contractAddress = "0xeDe31CaB27932D6498d200706A522a459931dCC7"; // Replace with the actual contract address
  const nftMarketplace = await ethers.getContractAt("NftMarketPlace", contractAddress);   
        basicNft = await ethers.getContract("BasicNft")
    
// USE THIS FOR TESTING INSTEAD OF FIREEVENT.JS


    console.log("Minting NFT...")
    const mintTx = await basicNft.mintNft()
    const mintTxReceipt = await mintTx.wait(1)
    const tokenId = mintTxReceipt.events[0].args.tokenId
    console.log("Approving NFT...")
    const approvalTx = await basicNft.approve("0xeDe31CaB27932D6498d200706A522a459931dCC7", tokenId)
    await approvalTx.wait(1)
    console.log("Listing NFT...")
    const tx = await nftMarketplace.listItem(basicNft.address, tokenId, PRICE)
    await tx.wait(1)
    console.log("NFT Listed!")
    console.log("List Item Tx Hash:", tx.hash);
    
//     // Listen for the ItemBought event
//     nftMarketplace.on("ItemBought", (buyer, nftAddress, tokenId, price) => {
//         console.log("Item Bought!");
//         console.log(`Buyer: ${buyer}`);
//         console.log(`NFT Address: ${nftAddress}`);
//         console.log(`Token ID: ${tokenId.toString()}`);
//         console.log(`Price: ${ethers.utils.formatEther(price)} ETH`);
//     });

//     // Simulate buying the item
//     console.log("Simulating Item Purchase...");
//     const buyTx = await nftMarketplace.buyItem(basicNft.address, tokenId, { value: PRICE });
//     await buyTx.wait(1);
//     console.log("Item Purchased!");
// await wait(1)
//   // Listen for the ItemDeleted event
//    nftMarketplace.once("ItemDeleted", (seller, nftAddress, tokenId) => {
//     console.log("Item Deleted!");
//     console.log(`Seller: ${seller}`);
//     console.log(`NFT Address: ${nftAddress}`);
//     console.log(`Token ID: ${tokenId.toString()}`);
//   });

//   // Simulate deleting the item
//   console.log("Simulating Item Deletion...");
//   const gasEstimate = await nftMarketplace.estimateGas.deleteItem(basicNft.address, tokenId);
//   console.log("Estimated Gas:", gasEstimate.toString());
  
//   const deleteTx = await nftMarketplace.deleteItem(basicNft.address, tokenId, { gasLimit: gasEstimate });
//   await deleteTx.wait(1);
  
//   console.log("Item Deleted!");
}



// USE THIS FOR TESTING INSTEAD OF FIREEVENT.JS






mintAndList()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error)
        process.exit(1)
    })

// const { ethers } = require("hardhat");

// async function main() {
//   const contractAddress = "0xeDe31CaB27932D6498d200706A522a459931dCC7"; // Replace with the actual contract address
//   const NftMarketPlace = await ethers.getContractAt("NftMarketPlace", contractAddress);

//   console.log("Interacting with contract at:", contractAddress);

//   // Example interaction: Mint and list an NFT
//   const tx = await NftMarketPlace.listItem(
//     "0xeDe31CaB27932D6498d200706A522a459931dCC7", // Replace with the NFT contract address
//     1, // Replace with the token ID
//     ethers.utils.parseEther("0.1") // Replace with the price in Ether
//   );
//   await tx.wait();
//   console.log("NFT listed successfully!");
// }

// main().catch((error) => {
//   console.error(error);
//   process.exit(1);
// });
//           ##################################
//     ##############################################
//    #$ 0xeDe31CaB27932D6498d200706A522a459931dCC7 $#