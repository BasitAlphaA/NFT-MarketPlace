///// listItem ///////
// emits event by passing prams✅
// reverts with alr listed✅
// reverts with not owner✅
// reverts with price > 0✅
// reverts with not approved✅
// list the seller and nft price✅
///////////////////////////////////////////////
/////updateListing ////////
// checks if alr listed and owner✅
// reverts with price > 0✅
// update mapping with new price✅
// emits an event✅
//////////////////
//// deleteItem //////
// checks if alr listed and owner✅
// delete the listing mapping & emits an event


import hardhat from "hardhat";
const { ethers, deployments, getNamedAccounts, network } = hardhat;

import { developmentChains, networkConfig } from "../helper-hardhat-config.js";
import { expect, assert } from "chai";
import * as chai from "chai";
import chaiAsPromised from "chai-as-promised";
import { solidity } from "ethereum-waffle";


chai.use(chaiAsPromised);
chai.use(solidity);

!developmentChains.includes(network.name)
  ? describe.skip
  : describe("Nft Marketplace Unit Tests", function () {
    let nftMarketplace, nftMarketplace2, basicNft, basicNft2
    let accounts, deployer, user

    const PRICE = ethers.utils.parseEther("0.1")
    const TOKEN_ID = 0

    beforeEach(async () => {
        accounts = await ethers.getSigners() // could also do with getNamedAccounts
        deployer = accounts[0]
        user = accounts[1]
        await deployments.fixture(["all"])
        nftMarketplace = await ethers.getContract("NftMarketPlace")
        nftMarketplace2 = nftMarketplace.connect(user)
        basicNft = await ethers.getContract("BasicNft")
        basicNft2 = basicNft.connect(user)
        await basicNft.mintNft()
        await basicNft.approve(nftMarketplace.address, TOKEN_ID)
    })
describe("listItem",  ()=>{
    it("emits an event after listing an item", async function () {
        console.log("NFT MARKETPLACE ",nftMarketplace.address)
        expect(await nftMarketplace.listItem(basicNft.address, TOKEN_ID, PRICE)).to.emit(nftMarketplace,
            "ItemListed"
        )
    })
    it("Reverts when item is already listed", async() =>{
      
        await nftMarketplace.listItem(basicNft.address , TOKEN_ID , PRICE)
        await expect(nftMarketplace.listItem(basicNft.address , TOKEN_ID , PRICE)).to.be.revertedWith("NftMarketPlace__AlreadyListed")        //we relisted item to make error occure
    })
    it("Reverts when item lister is not owner", async() =>{
      await  expect(  nftMarketplace2.listItem(basicNft2.address, TOKEN_ID, PRICE)).to.be.revertedWith( "NftMarketPlace__NotOwner")      // we used basicNft2 ( connected to other account ) to make error occure
    })
    it("reverts if price is zero" , async()=>{
        const ZERO_PRICE = ethers.utils.parseEther("0")
      await expect(nftMarketplace.listItem(basicNft.address, TOKEN_ID, ZERO_PRICE)).to.be.revertedWith("NftMarketPlace__PriceMustBeAboveZero") // we passed price "0" to make error occure
    })
    it("reverts when nft is not approved for marketplace", async()=>{
        await basicNft.approve(ethers.constants.AddressZero , TOKEN_ID )
        await expect(nftMarketplace.listItem( basicNft.address, TOKEN_ID , PRICE)).to.be.revertedWith("NftMarketPlace__NotApprovedForMarketPlace") // we passed different account for approval and then list item with differ acc to make error occure
    })
    it("Updates listing with seller and price", async()=>{
        await nftMarketplace.listItem(basicNft.address , TOKEN_ID ,PRICE)
        const listing = await nftMarketplace.getListing(basicNft.address , TOKEN_ID)
        assert.equal(listing.price.toString() , PRICE.toString())
        assert.equal(listing.seller , deployer.address)


    })
})
describe("updateListing" , ()=>{
    it("must be owner and listed", async() =>{
       await expect(nftMarketplace2.updateListing(basicNft2.address, TOKEN_ID, PRICE)).to.be.revertedWith("NftMarketPlace__NotOwner")
        await expect(nftMarketplace.updateListing(basicNft.address, TOKEN_ID ,PRICE)).to.be.revertedWith("NftMarketPlace__NotListed")
    })
    it("Reverts if price will be ZERO" , async ()=>{
        await nftMarketplace.listItem(basicNft.address , TOKEN_ID ,PRICE)
        const ZERO_PRICE = ethers.utils.parseEther("0")
        await expect(nftMarketplace.updateListing(basicNft.address, TOKEN_ID , ZERO_PRICE)).to.be.revertedWith("NftMarketPlace__PriceMustBeAboveZero")
    })
    it("Update listing according to the new price", async()=>{
        await nftMarketplace.listItem(basicNft.address , TOKEN_ID ,PRICE)
        const newPrice = ethers.utils.parseEther("0.2")
        await nftMarketplace.updateListing(basicNft.address, TOKEN_ID ,newPrice)
        const priceOfListing = await nftMarketplace.getListing(basicNft.address, TOKEN_ID)
        assert.equal(newPrice.toString() , priceOfListing.price.toString())
    })
    it("emits an event when item is updated", async() =>{
        await nftMarketplace.listItem(basicNft.address , TOKEN_ID ,PRICE)
        const newPrice = ethers.utils.parseEther("0.2")
        await expect(nftMarketplace.updateListing(basicNft.address , TOKEN_ID , newPrice)).to.emit(nftMarketplace ,"ItemListed")

    })
})
describe("deleteItem" , ()=>{
    it("Checks owner  ", async ()=>{
        await nftMarketplace.listItem(basicNft.address, TOKEN_ID, PRICE)
        await expect(
            nftMarketplace2.deleteItem(basicNft.address, TOKEN_ID)).to.be.revertedWith("NftMarketPlace__NotOwner")
   
      
    })
    it(" reverts if item doesn't listed", async()=>{

        await expect(nftMarketplace.deleteItem(basicNft.address , TOKEN_ID )).to.be.revertedWith("NftMarketPlace__NotListed")
    })
 
    
    it("deletes the item and emits an event", async () => {
        await nftMarketplace.listItem(basicNft.address, TOKEN_ID, PRICE); // first list item 
        await expect(nftMarketplace.deleteItem(basicNft.address, TOKEN_ID))
            .to.emit(nftMarketplace, "ItemDeleted")
            .withArgs(deployer.address, basicNft.address, TOKEN_ID); // check the event here
    
        // Then check that the item is deleted
        const listing = await nftMarketplace.getListing(basicNft.address, TOKEN_ID);
        assert.equal(listing.price.toString(), "0");
        assert.equal(listing.seller, ethers.constants.AddressZero); // Address zero after deletion
    });
})
describe("buyItem" ,()=>{
it("checks if item is listed", async ()=>{
    await expect(nftMarketplace.buyItem(basicNft.address, TOKEN_ID)).to.be.revertedWith("NftMarketPlace__NotListed")
})
it("reverts if price not met" ,async()=>{
    await nftMarketplace.listItem(basicNft.address , TOKEN_ID , PRICE)
    await expect(nftMarketplace.buyItem(basicNft.address , TOKEN_ID)).to.be.revertedWith("NftMarketPlace__PriceNotMet")
})
it("transfer the nft to buyer and update the internal proceeds record" ,async()=>{
    console.log("this is deployer: ",deployer.address)
    console.log("this is user : ",user.address)
    await nftMarketplace.listItem(basicNft.address , TOKEN_ID ,PRICE)
    const listing = await nftMarketplace.getListing(basicNft.address , TOKEN_ID)

    await expect(nftMarketplace2.buyItem(basicNft.address , TOKEN_ID,{ value: PRICE})).to.emit(nftMarketplace , "ItemBought").withArgs(user.address , basicNft.address , TOKEN_ID ,listing.price )
    const newOwner =await  basicNft.ownerOf(TOKEN_ID)
    console.log("New Owner: ", newOwner);  // Add this to log the new owner

    const ownerProceeds = await nftMarketplace.getProceeds(deployer.address)
    assert.equal(newOwner , user.address)
    assert.equal(ownerProceeds.toString() , PRICE.toString())
})

})
describe("withdrawProceeds" , ()=>{
    it("reverts if there is no proceeds", async()=>{
        await expect(nftMarketplace.withdrawProceeds()).to.be.revertedWith("NftMarketPlace__NoProceeds")
    })
    it("withdraws proceeds", async ()=>{
        await nftMarketplace.listItem(basicNft.address , TOKEN_ID ,PRICE)
        await nftMarketplace2.buyItem(basicNft.address , TOKEN_ID , { value: PRICE})
        const deployerProceedsBefore = await nftMarketplace.getProceeds(deployer.address)
        const deployerBalanceBefore = await deployer.getBalance()
        const txResponse = await nftMarketplace.withdrawProceeds()
        const transactionReceipt = await txResponse.wait(1)
        const { gasUsed, effectiveGasPrice } = transactionReceipt
        const gasCost = gasUsed.mul(effectiveGasPrice)
        const deployerBalanceAfter = await deployer.getBalance()
        assert.equal(deployerBalanceAfter.add(gasCost).toString() , deployerProceedsBefore.add(deployerBalanceBefore).toString())
    })
})

/////////////////////////////////////////////////////////////////////
 // baic NFT tests doing it in same tests
 
describe("basic nft Uri", async ()=> {
    let  basicNft
    let accounts, deployer, user

    const PRICE = ethers.utils.parseEther("0.1")
    const TOKEN_ID = 0
    beforeEach(async ()=> {
        basicNft = await ethers.getContract("BasicNft")
        await basicNft.mintNft()
        await basicNft.approve(nftMarketplace.address, TOKEN_ID)
    })
    it("tokenURI test", async()=> {
        const tokenURI = await basicNft.tokenURI(TOKEN_ID)
        const actualTokenURI =   "ipfs://bafybeig37ioir76s7mg5oobetncojcm3c3hxasyd4rvid4jqhy4gkaheg4/?filename=0-PUG.json"
        console.log("THIS IS THE FUCKING TOKEN URI",tokenURI)
        assert.equal(tokenURI.toString(),actualTokenURI )
    })
})

})
