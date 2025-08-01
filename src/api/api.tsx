import {
  getTokenUri,
  getPropertyFromVault,

  getAllByVaultByUser,
  getPropertyInfromationByToken,
  getInterest,
  getDocumentsByCreator,
  getDocument,
  getDocumentsByParty,
  getNftOwner,
  getBankContractAddress
} from './blockchain'
import Goldassest from '@/assets/img/property/goldassest.png'
import Property1 from '@/assets/img/property/property-1.png'
import Property2 from '@/assets/img/property/property-2.png'
import Property3 from '@/assets/img/property/property-3.png'
import Property4 from '@/assets/img/property/property-4.png'
import Property5 from '@/assets/img/property/property-4.png'
import Property6 from '@/assets/img/property/property-4.png'
import TokenisedShares from '@/assets/img/property/tokenised-shares.png'
import FCAImg from '@/assets/img/users/FCA-admin-profile.png'
import Admin from '@/assets/img/users/admin.png'
import BankAdmin from '@/assets/img/users/bank-admin-profile.png'
import User1 from '@/assets/img/users/user-1.png'
import User2 from '@/assets/img/users/user-2.png'
import User3 from '@/assets/img/users/user-3.png'
import User4 from '@/assets/img/users/user-4.png'
import User5 from '@/assets/img/users/user-5.png'
import UserProfile from '@/assets/img/users/user-profile.png'
import apiService from '@/services/apiService'
import axios from 'axios'
import { getTransactionDetail } from '@/hooks/useDsrEventHistory'

let BankWalletAddress = import.meta.env.VITE_WALLET_ADDRESS

const VITE_XRP_API_URL = import.meta.env.VITE_XRP_API_URL


let assetTypes = [
  {
    id: 1,
    name: 'Tokenised Shares',
  },
  {
    id: 4,
    name: 'Gold Token A',
  },
  {
    id: 5,
    name: 'Real-Estate Token A',
  },
]
let propertyList = [
  // {
  //   contractAddress: PROPERTY_NFT_ADDRESS,
  //   tokenID: '1',
  //   name: 'Blackfriars',
  //   image: Property4,
  //   properties: {
  //     assetType: 5,
  //     ownerWalletAddress: '0x8CA98bfb2A38b9E656d54424f96FbE87549C8669',
  //     assetValue: '10000000',
  //     numberOfUnits:'1',
  //     approvedLoanAmount: '2000000',
  //     maximumLoanPercentage: '20%',
  //     originalLoanValue: '0',
  //     loanNumber: 'HLN53962',
  //     customerNumber: 'CN013673',
  //     addressLine1: '98 Ho Chung Rd',
  //     addressLine2: 'Sai Kung',
  //     city: 'London',
  //     country: 'UK',
  //     assetValuationDate: '10/31/2023',
  //     loanCurrency: ' HGBP',
  //     talocCurrency: 'Hypothetical e- HGBP',
  //     defaultFlag: 'No',
  //   },
  // },
  // {
  //   contractAddress: PROPERTY_NFT_ADDRESS,
  //   tokenID: '2',
  //   name: 'Hamilton Lane Credit Fund',
  //   image: TokenisedShares,
  //   properties: {
  //     assetType: 1,
  //     ownerWalletAddress: '0x8CA98bfb2A38b9E656d54424f96FbE87549C8669',
  //     numberOfUnits:'25,000',
  //     assetValue: '10000000',
  //     approvedLoanAmount: '2000000',
  //     maximumLoanPercentage: '20%',
  //     originalLoanValue: '0',
  //     loanNumber: 'HLN53962',
  //     customerNumber: 'CN013673',
  //     addressLine1: '98 Ho Chung Rd',
  //     addressLine2: 'Sai Kung',
  //     city: 'Hong Kong',
  //     country: 'China',
  //     assetValuationDate: '10/31/2023',
  //     loanCurrency: ' HGBP',
  //     talocCurrency: 'Hypothetical e- HGBP',
  //     defaultFlag: 'No',
  //   },
  // },
  // {
  //   contractAddress: PROPERTY_NFT_ADDRESS,
  //   tokenID: '7',
  //   name: 'Brevan Howard Master Fund',
  //   image: TokenisedShares,
  //   properties: {
  //     assetType: 1,
  //     ownerWalletAddress: '0x8CA98bfb2A38b9E656d54424f96FbE87549C8669',
  //     assetValue: '4000000',
  //     numberOfUnits:'20,000',
  //     approvedLoanAmount: '800000',
  //     maximumLoanPercentage: '20%',
  //     originalLoanValue: '0',
  //     loanNumber: 'HLN53962',
  //     customerNumber: 'CN013673',
  //     addressLine1: '98 Ho Chung Rd',
  //     addressLine2: 'Sai Kung',
  //     city: 'Hong Kong',
  //     country: 'China',
  //     assetValuationDate: '10/31/2023',
  //     loanCurrency: ' HGBP',
  //     talocCurrency: 'Hypothetical e- HGBP',
  //     defaultFlag: 'No',
  //   },
  // },
  // {
  //   contractAddress: '0x00F7d1e28d3F7f86a121E4f689188AA997aABde5',
  //   tokenID: '4',
  //   name: 'Blackrock ICS Money Market Fund',
  //   image: TokenisedShares,
  //   properties: {
  //     assetType: 1,
  //     ownerWalletAddress: '0x8CA98bfb2A38b9E656d54424f96FbE87549C8669',
  //     assetValue: '10000000',
  //     numberOfUnits:'25,000',
  //     approvedLoanAmount: '2000000',
  //     maximumLoanPercentage: '20%',
  //     originalLoanValue: '0',
  //     loanNumber: 'HLN53962',
  //     customerNumber: 'CN013673',
  //     addressLine1: '98 Ho Chung Rd',
  //     addressLine2: 'Sai Kung',
  //     city: 'Hong Kong',
  //     country: 'China',
  //     assetValuationDate: '10/31/2023',
  //     loanCurrency: ' HGBP',
  //     talocCurrency: 'Hypothetical e- HGBP',
  //     defaultFlag: 'No',
  //   },
  // },
  // {
  //   contractAddress: '0x00F7d1e28d3F7f86a121E4f689188AA997aABde5',
  //   tokenID: '5',
  //   name: 'Gold Token A',
  //   image: Goldassest,
  //   properties: {
  //     assetType: 4,
  //     ownerWalletAddress: '0x8CA98bfb2A38b9E656d54424f96FbE87549C8669',
  //     assetValue: '1000000',
  //     numberOfUnits:'30,000',
  //     approvedLoanAmount: '200000',
  //     maximumLoanPercentage: '20%',
  //     originalLoanValue: '0',
  //     loanNumber: 'HLN53962',
  //     customerNumber: 'CN013673',
  //     addressLine1: '-',
  //     addressLine2: '-',
  //     city: '-',
  //     country: '-',
  //     assetValuationDate: '10/31/2023',
  //     loanCurrency: ' HGBP',
  //     talocCurrency: 'Hypothetical e- HGBP',
  //     defaultFlag: 'No',
  //   },
  // },
]

async function getPropertyByTokenID(clientWalletAddress) {
  let resFilteredPropertyList = await apiService.getPropertiesByClient(clientWalletAddress)
  let filteredPropertyList = resFilteredPropertyList.data

  return filteredPropertyList

  // return propertyList.find(
  //   (property) => property.properties['ownerWalletAddress'] === clientWalletAddress,
  // )
}

async function getPropertyByClient(clientWalletAddress, tokenId) {

  let resFilteredPropertyList = await apiService.getPropertiesByTokenId(tokenId, clientWalletAddress)
  let filteredPropertyList = resFilteredPropertyList.data

  return filteredPropertyList

}

const config = {
  headers: {
    'Access-Control-Allow-Origin': '*',
    'Content-Type': 'application/json',
    'Access-Control-Allow-Methods': 'GET, PUT, POST, DELETE, OPTIONS',
  },
}

// async function getPropertyList() {
//   let baseURL = BlockChainExplorer + '/address' + '/' + BankWalletAddress + '/tokens?type=JSON'

//   let propertyList = await axios.get(baseURL).then(async (response) => {
//     let propertyList = []

//     for (let obj of response.data.items) {
//       try {
//         const tempElement = document.createElement('div')
//         tempElement.innerHTML = obj
//         const spanElement = tempElement.querySelector('span[data-address-hash]')
//         const dataAddressHash = spanElement?.getAttribute('data-address-hash')
//         let nftURL = await getTokenUri(dataAddressHash)
//         const searchParams = new URLSearchParams(new URL(nftURL).search)
//         const docId = searchParams.get('doc_id')
//         const { data: responseObject } = await axios.get(
//           'https://portal-integ.toko.network' + '/v1/juno/download_document?doc_id=' + docId,
//         )

//         responseObject['contractAddress'] = dataAddressHash

//         propertyList.push(responseObject)
//       } catch (e) {
//         // // console.log('invalid property' ,e)
//       }
//     }
//     return propertyList
//   })
//   return propertyList
// }

async function getHistoryList(contractAddress) {

  // const baseURL = `${BlockChainExplorer}/address/${BankWalletAddress}/tokens?type=JSON`
  const baseURL = `${VITE_XRP_API_URL}/addresses/${contractAddress}/token-transfers`
  const response = await axios.get(baseURL)
  const historyList = response.data.items
  // // console.log(historyList);

  // Process the response data
  const formattedHistory = historyList
    .filter((item) => item.token?.type !== 'ERC-721') // Ignore ERC-721 transactions
    .map((item) => {
      const amount = item.total?.value
        ? (Number(BigInt(item.total.value)) / 1e18).toFixed(3)
        : '0.000'

      // const timestamp = new Date(item.timestamp).toLocaleDateString('en-GB') // Format: DD/MM/YYYY
      const timestamp = new Date(item.timestamp).toLocaleString('en-GB', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
      }).replace(',', ''); // Format: DD/MM/YYYY, HH:MM
      // console.log("1",item)
      // console.log("2",item.total?.value);
      // Determine transaction type
      let transactionType = 'Repay' // Default type
      // if (item.from.hash === '0x6F47347fA379a10b061e48A512878Cf28FabD1fe' && contractAddress == BankWalletAddress) {
      //   transactionType = 'Repay'
      // }
      // if(transactionType == "Repay"){
      //   const transactionDetails =   getTransaction(item.block_hash);
      //   // console.log(transactionDetails);
      // }
      if (
        item.from.hash === '0x6F47347fA379a10b061e48A512878Cf28FabD1fe' &&
        contractAddress != BankWalletAddress
      ) {
        transactionType = 'Deposit'
      } else if (item.from.hash === '0x6F47347fA379a10b061e48A512878Cf28FabD1fe') {
        transactionType = 'Pay'
      } else if (item.method === '0xd8aed145' && contractAddress != BankWalletAddress) {
        transactionType = 'Repay'
      } else if (item.method === '0x0ecbcdab') {
        transactionType = 'Borrow'
      } else if (item.method === '0xd8aed145') {
        transactionType = 'Interest'
      }

      return {
        amount,
        blockHash: item.block_hash,
        blockNumber: item.block_number,
        timestamp,
        tokenId: item.total?.token_id || 'N/A',
        type: transactionType,
        transactionHash: item.block_hash,
        from: item.from.hash,
        to: item.to.hash,
        user: item.from.hash,
        toDetails: getUserByWallet(item.from.hash),
        fromDetails: getUserByWallet(item.from.hash),
      }
    })
  console.log(formattedHistory);
  // // console.log(formattedHistory)
  return formattedHistory

  // return [
  //   {
  //     amount: '400000',
  //     blockHash: '0x4f19aa7cb7a75fe5dc7ffa38768279fc8dddabd12a496fd2b857a262b52bb011',
  //     blockNumber: 9609915,
  //     timestamp: '03/04/2023',
  //     tokenId: '10',
  //     type: 'Exchange',
  //     user: '0x0480Fce195Cd8548425301c7de2DA8bD8025c694',
  //   },
  //   {
  //     amount: '300000',
  //     blockHash: '0x4f19aa7cb7a75fe5dc7ffa38768279fc8dddabd12a496fd2b857a262b52bb011',
  //     blockNumber: 9609915,
  //     timestamp: '09/04/2023',
  //     tokenId: '10',
  //     type: 'Exchange',
  //     user: '0x0480Fce195Cd8548425301c7de2DA8bD8025c694',
  //   },
  // ];
}
async function getPropertyList() {
  // const baseURL = `${BlockChainExplorer}/address/${BankWalletAddress}/tokens?type=JSON`
  const baseURL = `${VITE_XRP_API_URL}/addresses/${BankWalletAddress}/nft/collections?type=`

  try {
    const response = await axios.get(baseURL)
    // console.log('baseURLbaseURL 12==> ')
    let tokenContract = response.data.items[0].token
    let tokenInstances = response.data.items[0].token_instances

    // const fetchPropertiesPromises = response.data.items.map(async (obj) => {
    //   try {
    //     const tempElement = document.createElement('div')
    //     tempElement.innerHTML = obj

    //     const spanElement = tempElement.querySelector('span[data-address-hash]')
    //     const dataAddressHash = spanElement?.getAttribute('data-address-hash')

    //     const nftURL = await getTokenUri(dataAddressHash)
    //     const searchParams = new URLSearchParams(new URL(nftURL).search)
    //     const docId = searchParams.get('doc_id')

    //     const { data: responseObject } = await axios.get(
    //       `https://portal-integ.toko.network/v1/juno/download_document?doc_id=${docId}`,
    //     )

    //     responseObject['contractAddress'] = dataAddressHash
    //     return responseObject
    //   } catch (innerError) {
    //     // Handle specific token processing error if needed
    //     // console.error('Error processing a token:', innerError);
    //     return null // Return null for items that had issues
    //   }
    // })

    // const properties = await Promise.all(fetchPropertiesPromises)
    // // console.log("properties ==> ",properties)

    // let property = [
    //   {
    //     properties: {
    //       'ownerWalletAddress': 'getPropertyList',
    //     },
    //   },
    // ]
    // Extract IDs from the API response
    // let apiTokenIDs = tokenInstances.map((item) => item.id)
    // // console.log('apiTokenIDs ==>', apiTokenIDs)
    // // Filter the propertyList to only include items where the tokenID is NOT in the API response
    // let filteredPropertyList = propertyList.filter((property) =>
    //   apiTokenIDs.includes(property.tokenID),
    // )
    let resFilteredPropertyList = await apiService.getAllProperties()
    let filteredPropertyList = resFilteredPropertyList.data

    const userPropertiesInValut = [] // Array to store property data
    const userRes = await apiService.getAllTeamsById(1003)
    const usersList = userRes.data
    for (let i = 0; i < usersList.length; i++) {
      let propertyData = []
      try {
        const user = usersList[i]
        propertyData = await getPropertyFromVault(user.walletAddress)
      } catch (e) { }
      userPropertiesInValut.push(...propertyData)
    }

    // // console.log("userPropertiesInValut",userPropertiesInValut)

    // Map over the filtered property list and append user details
    filteredPropertyList = filteredPropertyList.map((property) => {
      // Find the user by matching wallet address
      // let user = userList.find(
      //   (user) => user.walletAddress === property.properties['ownerWalletAddress'],
      // )
      let user = getUserByWallet(property.properties['ownerWalletAddress'])

      let assetType = assetTypes.find(
        (assetType) => assetType.id === property.properties['assetType'],
      )

      let vaultDetail = userPropertiesInValut.find((vault) => vault.tokenId === property['tokenID'])

      // Return the updated property object with user details
      return {
        ...property,
        vaultDetail: vaultDetail
          ? {
            isActive: vaultDetail.activit,
          }
          : null,
        user: user
          ? {
            id: user.id,
            userName: user.userName,
            userRole: user.userRole,
            imageSrc: user.imageSrc,
          }
          : null,
        assetType: assetType ? assetType : null,
      }
    })
    // console.log('filteredPropertyList', filteredPropertyList)

    return filteredPropertyList //properties.filter((property) => property !== null) // Filter out the null results
  } catch (error) {
    let resFilteredPropertyList = await apiService.getAllProperties()
    const allPropertyList = resFilteredPropertyList.data

    return allPropertyList
    // return [] // Return an empty array on failure
  }
}

async function getAvailablePropertyList(currentUser) {
  try {
    const owners = await getAllNftOwners(currentUser); // on-chain owners


    const apiTokenContractIDs = owners
      .filter(item => {
        const owner = item.owner.toLowerCase();
        return owner === BankWalletAddress.toLowerCase() ||
          owner === currentUser.walletAddress.toLowerCase();
      })
      .map(item => item.tokenId); const tokenIdSet = new Set(apiTokenContractIDs.map(String));

    const allPropertyListResponse = await apiService.getAllProperties();
    const allPropertyList = allPropertyListResponse.data ?? [];

    let filteredPropertyList = allPropertyList.filter(
      ({ tokenID }) => tokenID != null && tokenIdSet.has(String(tokenID))
    );

    const userRes = await apiService.getAllTeamsById(1003);
    const users = userRes.data ?? [];

    const userPropertiesInVault = [];
    for (let user of users) {
      try {
        const propertyData = await getPropertyFromVault(user.walletAddress);
        userPropertiesInVault.push(...propertyData);
      } catch (e) {

      }
    }

    const finalList = filteredPropertyList.map((property) => {
      const tokenId = String(property.tokenID);
      const chainOwnerData = owners.find((o) => String(o.tokenId) === tokenId);
      const ownerWallet = chainOwnerData?.owner;

      const user = users.find(
        (u) => u.walletAddress?.toLowerCase() === ownerWallet?.toLowerCase()
      );

      const assetType = assetTypes.find(
        (a) => a.id === property.properties['assetType']
      );

      const vaultDetail = userPropertiesInVault.find(
        (vault) => String(vault.tokenId) === tokenId
      );

      return {
        ...property,
        vaultDetail: vaultDetail
          ? { isActive: vaultDetail.activit }
          : null,
        user: user
          ? {
            id: user.id,
            userName: user.name,
            userRole: user.userRole,
            imageSrc: user.imageSrc,
          }
          : {
            userName: 'Vault',
          },
        assetType: assetType ?? null,
        ownedByBank: ownerWallet?.toLowerCase() === BankWalletAddress.toLowerCase(),
      };
    });

    return finalList;
  } catch (error) {

    return [];
  }
}


async function getAllNftOwners(user) {
  const results = []

  for (const [tokenAddress, tokenIds] of Object.entries(user.properties)) {
    for (const tokenId of tokenIds) {
      const owner = await getNftOwner(tokenAddress, tokenId)
      results.push({
        owner,
        tokenId,
        tokenAddress,
      })
    }
  }

  return results
}

async function getAllByVault() {
  const users = getUserList()

  const valutsDetails = [];
  for (let i = 0; i < users.length; i++) {
    try {

      let user = users[i]

      let valuts = await getAllByVaultByUser(user.walletAddress)

      // let firstTenValuts = valuts.slice(0, 10)


      for (let j = 0; j < valuts.length; j++) {
        const v = await getPropertyInfromationByToken(valuts[j], user.walletAddress)

        if (v?.activit) {
          let currentInterest = await getInterest(valuts[j])
          v['currentInterest'] = currentInterest
          // console.log(currentInterest)
          valutsDetails.push(v)
        }

        if (valutsDetails.length > 8) {
          // console.log(' valutsDetails break...')
          break
        }
      }



      // userPropertiesInValut.push(...propertyData)
    } catch (e) {

    }
  }

  return valutsDetails
}



async function getVaultPropertyList(userId: any) {
  const userResponse = await apiService.getUserByIdOrWallet(userId)
  const user = userResponse.data


  const propertyFromVault = await getPropertyFromVault(user.walletAddress).then((value2) => {
    return value2
  })

  return propertyFromVault
}

function getAssetDetails(id) {
  return assetTypes.find((asset) => asset.id === id) || { name: 'N/A' }
}
function getUserList() {
  // 1️⃣  Read from localStorage
  const stored = sessionStorage.getItem('selectedUser');
  if (!stored) return userList;            // nothing stored yet

  // 2️⃣  Parse and normalise the id to a string
  let selectedId: string | undefined;
  try {
    const parsed = JSON.parse(stored);     // may throw
    selectedId = parsed?.id !== undefined ? String(parsed.id) : undefined;
  } catch (err) {

    return userList;                       // fall back gracefully
  }

  if (selectedId === undefined) return userList;

  // 3️⃣  Filter by matching id (converted to string on both sides)
  const filtered = userList.filter(user => String(user.clientBy) === selectedId);

  // 4️⃣  Return the result (or the whole list if nothing matched)
  return filtered.length ? filtered : userList;
}

function getUserByWallet(walletAddress) {
  let user = getUserList().find((user) => user.walletAddress === walletAddress)

  return user ? user : { userName: 'Vault' }
}
function getUserById(id) {
  let user = userList.find((user) => user.id === id)

  return user ? user : null
}

function getBankDetails(id) {
  return { wallet: BankWalletAddress }
}

function getFCADetails(id) {
  return getUserById(id)
}

async function getReportList(user) {
  try {
    // Step 1: Get the list of document IDs for the creator (user's wallet address)
    const docIds = await getDocumentsByCreator(user.walletAddress)

    // Step 2: Loop through each document ID to get full details
    const reportList = []
    for (let i = 0; i < docIds.length; i++) {
      const docId = docIds[i]

      // Step 3: Fetch the document details using the docId
      const document = await getDocument(docId)

      // Step 4: Add the document details to the report list
      reportList.push(document)
    }
    reportList.reverse()
    return reportList // Return the full list of reports
  } catch (error) {

    throw new Error('Failed to get report list')
  }
}

async function getFCAReportList(walletAddress) {
  try {
    // Step 1: Get the list of document IDs for the creator (user's wallet address)
    const docIds = await getDocumentsByParty(walletAddress)

    // Step 2: Loop through each document ID to get full details
    const reportList = []
    for (let i = 0; i < docIds.length; i++) {
      const docId = docIds[i]

      // Step 3: Fetch the document details using the docId
      const document = await getDocument(docId)

      // Step 4: Add the document details to the report list
      reportList.push(document)
    }
    reportList.reverse()
    return reportList // Return the full list of reports
  } catch (error) {

    throw new Error('Failed to get report list')
  }
}

export {
  getPropertyList,
  getUserList,
  getVaultPropertyList,
  getFCADetails,
  getPropertyByTokenID,
  getPropertyByClient,
  getHistoryList,
  getBankDetails,
  // getMessageFromSlack,
  getAllByVault,
  getAssetDetails,
  getReportList,
  getFCAReportList,
  getAvailablePropertyList,
}
