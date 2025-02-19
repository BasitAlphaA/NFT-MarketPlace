// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;


import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts-upgradeable/utils/ReentrancyGuardUpgradeable.sol";


//Errors
error NftMarketPlace__PriceMustBeAboveZero();
error NftMarketPlace__NotApprovedForMarketPlace();
error NftMarketPlace__AlreadyListed(address nftAddress , uint256 tokenId);
error NftMarketPlace__NotOwner();
error NftMarketPlace__NotListed(address nftAddress , uint256 tokenId);
error NftMarketPlace__PriceNotMet();
error NftMarketPlace__NoProceeds();
error NftMarketPlace__TransferFailed();


contract NftMarketPlace is ReentrancyGuardUpgradeable {

   struct Listing {
        uint256 price;
        address seller;
    }

//events
event ItemListed (
     address seller,
    address indexed nftAddress,
    uint256 indexed tokenId,
    uint256  price

);
event ItemBought(
    address indexed buyer,
    address indexed nftAddress,
    uint256 indexed tokenId,
    uint256  price
);
event ItemDeleted(
    address seller,
    address nftAddress,
    uint256 tokenId
);



//mapping//
                // NFT contract -> NFT Token -> Listing
    mapping(address => mapping(uint256 => Listing)) private s_listings;
                // owner --> Value spent on NFT  
    mapping(address => uint256) private s_proceeds;

  ////////////////////////
 // Modifiers         ///
////////////////////////
 modifier notListed(
        address nftAddress,
        uint256 tokenId
    ) {
        Listing memory listing = s_listings[nftAddress][tokenId];
        if (listing.price > 0) {
            revert NftMarketPlace__AlreadyListed(nftAddress, tokenId);
        }
        _;
    }
    modifier isOwner(
        address nftAddress,
        uint256 tokenId, 
        address spender
    ){
IERC721 nft = IERC721(nftAddress);
address owner = nft.ownerOf(tokenId);
if(spender != owner){
    revert NftMarketPlace__NotOwner();
}
_;
    }
    modifier isListed(
        address nftAddress,
        uint256 tokenId
    ){
        Listing memory listing = s_listings[nftAddress][tokenId];
        if(listing.price <= 0){
            revert NftMarketPlace__NotListed(nftAddress, tokenId);
        }
        _;
    }



  ////////////////////////
 // Main Functions    ///
////////////////////////

function listItem(  //✅
    address nftAddress,
    uint256 tokenId,
    uint256 price
) 
external
notListed(nftAddress, tokenId)
isOwner(nftAddress, tokenId, msg.sender)
{
 if(price<=0){
    revert NftMarketPlace__PriceMustBeAboveZero();
 }  
  IERC721  nft = IERC721 (nftAddress);
  if(nft.getApproved(tokenId) != address(this)){
    revert NftMarketPlace__NotApprovedForMarketPlace();
  }
  s_listings[nftAddress][tokenId] = Listing(price , msg.sender);
  emit ItemListed(msg.sender, nftAddress , tokenId , price);

}
function buyItem(   //✅
    address nftAddress,
    uint256 tokenId
) 
external
payable
nonReentrant 
isListed(nftAddress , tokenId)
{
Listing memory listing = s_listings[nftAddress][tokenId];
  if(msg.value <= 0){
    revert NftMarketPlace__PriceNotMet();
  }
s_proceeds[listing.seller] += msg.value;

delete (s_listings[nftAddress][tokenId]);
 IERC721(nftAddress).safeTransferFrom( listing.seller,msg.sender, tokenId );
emit ItemBought(msg.sender , nftAddress , tokenId , listing.price);

}
function deleteItem(   //✅
    address nftAddress,
    uint256 tokenId
)
external
isOwner(nftAddress, tokenId, msg.sender)
isListed(nftAddress, tokenId)
 {
    delete(s_listings[nftAddress][tokenId]);
    emit ItemDeleted(msg.sender , nftAddress , tokenId  );
}
function updateListing(   //✅
    address nftAddress,
    uint256 tokenId,
    uint256 newPrice
)
external
isOwner(nftAddress, tokenId, msg.sender)
isListed(nftAddress, tokenId)
{
    if(newPrice <= 0){
        revert NftMarketPlace__PriceMustBeAboveZero(); 
    }
s_listings[nftAddress][tokenId].price = newPrice;
emit ItemListed(msg.sender , nftAddress, tokenId , newPrice);
}
function withdrawProceeds() external {
    uint256 proceeds = s_proceeds[msg.sender];
    if(proceeds <=0){
        revert NftMarketPlace__NoProceeds();
    }
        s_proceeds[msg.sender] = 0;
    (bool success,) = payable(msg.sender).call{value : proceeds}("");
    if(!success){
        revert NftMarketPlace__TransferFailed() ;
    }
}

  ////////////////////////
 // Getter Functions  ///
////////////////////////

function getListing(address nftAddress, uint256 tokenId) external view returns(Listing memory) {
    return s_listings[nftAddress][tokenId];
}
function getProceeds(address seller) external view returns(uint256) {
    return s_proceeds[seller];
}

}

// `ListItem` : list NFTs on marketplace ✅
// `BuyItem` : Buy NFTs✅
// `cancelItem` : Cancel a listing✅
// `updateListing` : Update Price✅
// `withdrawProceeds` : withdraw payment for my bought NFTs



