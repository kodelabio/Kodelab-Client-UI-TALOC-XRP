import BankABI from './abi/Bank.json'
import DocABI from './abi/Doc.json'
import EDABI from './abi/ED.json'
import NFTABI from './abi/NFT.json'
import VaultABI from './abi/Vault.json'
import { sendMessageToSlack, getPropertyByTokenID, getPropertyByClient } from './api'
import { parseWeiNumeric, toHex, bytesToString } from '@/dai-plugin-mcd/src/utils.js'
import axios from 'axios'
import { createHash } from 'crypto'
import Web3 from 'web3'
import { format_time } from '@/utils/format'
import { message } from 'antd'
import { parseEther } from 'viem'

let userPrivateString = import.meta.env.VITE_PKEY
let userPrivateKey = JSON.parse(userPrivateString)
let BankPrivateKey = import.meta.env.VITE_BankPrivateKey
let BankWalletAddress = import.meta.env.VITE_WALLET_ADDRESS

const chainId = Number(import.meta.env.VITE_DEFAULT_CHAIN_ID_NETWORK)
const BANK_CONTRACT_TOKEN_ADDRESS = import.meta.env.VITE_BANK_CONTRACT
const ED_TOKEN_ADDRESS = import.meta.env.VITE_E_TOKEN_CONTRACT
const PROPERTY_NFT_ADDRESS = import.meta.env.VITE_HKD_PROPERTY_TOKEN_CONTRACT
let DOC_CONTRACT_ADDRESS = import.meta.env.VITE_DOC_CONTRACT
// get VITE_EVM_RPC_URL
const VITE_EVM_RPC_URL = import.meta.env.VITE_EVM_RPC_URL // Assuming the token has 18 decimals, adjust if necessary
const KEY = 'kodelab' // Symmetric key (same key for encryption and decryption)

// xrpl
// const provider = new Web3.providers.HttpProvider('/evm-sidechain')
const provider = new Web3.providers.HttpProvider(VITE_EVM_RPC_URL)

function getWeb3() {
  let _web3 = new Web3(provider)
  return _web3
}

async function transfer() {
  const web3 = getWeb3()
  let receiver = ''
  let amount = web3.utils.toHex(web3.utils.toWei('1'))

  const contract = new web3.eth.Contract(EDABI, ED_TOKEN_ADDRESS, { from: account })

  // Creating the transaction object
  const tx = {
    from: BankWalletAddress,
    to: ED_TOKEN_ADDRESS,
    value: '0x0',
    data: contract.methods.transfer(receiver, amount).encodeABI(),
    gas: web3.utils.toHex(5000000),
    nonce: web3.eth.getTransactionCount(BankWalletAddress),
    maxPriorityFeePerGas: web3.utils.toHex(web3.utils.toWei('2', 'gwei')),
    chainId: chainId,
    type: 0x2,
  }

  let signedTx = await web3.eth.accounts.signTransaction(tx, privateKey)

  // Sending the transaction to the network
  const receipt = await web3.eth
    .sendSignedTransaction(signedTx.rawTransaction)
    .once('transactionHash', (txhash) => { })
}

async function register(property) {
  const web3 = getWeb3();
  const tokenContract = property.contractAddress;
  const tokenId = property.tokenID;
  const propertyOwnerWallet = property.properties.ownerWalletAddress;
  const ownedByBank = property.ownedByBank;

  const numericValue = property.properties.approvedLoanAmount.replace(/,/g, '');
  // const propertyAllowLoan = web3.utils.toHex(web3.utils.toWei(numericValue));
        const propertyAllowLoan = parseEther(numericValue);
  
  const contract = new web3.eth.Contract(BankABI, BANK_CONTRACT_TOKEN_ADDRESS, {
    from: BankWalletAddress,
  });

  try {
    await allowBankMoney(propertyAllowLoan); // Uses BankPrivateKey

    if (ownedByBank) {
      // ✅ Bank owns the property - full control
      await allowNFT(tokenContract, tokenId); // Uses BankPrivateKey

      const tx = {
        from: BankWalletAddress,
        to: BANK_CONTRACT_TOKEN_ADDRESS,
        value: '0x0',
        data: contract.methods
          .registerVault(propertyOwnerWallet, propertyAllowLoan, tokenContract, tokenId)
          .encodeABI(),
        gas: web3.utils.toHex(6000000),
        nonce: await web3.eth.getTransactionCount(BankWalletAddress),
        maxPriorityFeePerGas: web3.utils.toHex(web3.utils.toWei('2', 'gwei')),
        chainId: chainId,
        type: 0x2,
      };

      const signedTx = await web3.eth.accounts.signTransaction(tx, BankPrivateKey);
      const receipt = await web3.eth.sendSignedTransaction(signedTx.rawTransaction);
      return receipt;
    } else {
      // ❗ User owns the property - requires MetaMask interaction
      if (!window.ethereum || !window.ethereum.isMetaMask) {
        throw new Error("MetaMask is not available.");
      }

      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      const activeAddress = accounts[0].toLowerCase();

      if (activeAddress !== propertyOwnerWallet.toLowerCase()) {
        throw new Error(`Connected wallet (${activeAddress}) does not match property owner (${propertyOwnerWallet})`);
      }

      const userWeb3 = new Web3(window.ethereum);

      // 1. Approve NFT transfer
      const nftContract = new userWeb3.eth.Contract(NFTABI, tokenContract, {
        from: activeAddress,
      });

      const approveTx = {
        from: activeAddress,
        to: tokenContract,
        data: nftContract.methods.approve(BANK_CONTRACT_TOKEN_ADDRESS, tokenId).encodeABI(),
      };

      const approveTxHash = await window.ethereum.request({ method: 'eth_sendTransaction', params: [approveTx] });
      const approveTxReceipt = await waitForReceipt(userWeb3, approveTxHash);
      // if (!approveTxReceipt.status) {
      //   throw new Error("NFT approval transaction failed");
      // }
      // 2. User registers vault using MetaMask
      const bankContract = new userWeb3.eth.Contract(BankABI, BANK_CONTRACT_TOKEN_ADDRESS, {
        from: activeAddress,
      });

      const registerTx = {
        from: activeAddress,
        to: BANK_CONTRACT_TOKEN_ADDRESS,
        data: bankContract.methods
          .registerVaultByUser(activeAddress, propertyAllowLoan, tokenContract, tokenId)
          .encodeABI(),
      };

      const userTxHash = await window.ethereum.request({
        method: 'eth_sendTransaction',
        params: [registerTx],
      });

      const txReceipt = await waitForReceipt(userWeb3, userTxHash);


      // 3. Decode Registered event to get vaultId
      const registeredEventSig = userWeb3.utils.keccak256(
        "Registered(uint256,address,uint256,address,uint256,uint256)"
      );

      const log = txReceipt.logs.find(l => l.topics[0] === registeredEventSig);
      if (!log) throw new Error("VaultRegistered event not found");

      const vaultId = userWeb3.utils.hexToNumber(log.topics[1]); // indexed vaultId

      // 4. Bank deposits funds to vault
      const depositTx = {
        from: BankWalletAddress,
        to: BANK_CONTRACT_TOKEN_ADDRESS,
        value: '0x0',
        data: contract.methods.depositToVault(vaultId).encodeABI(),
        gas: web3.utils.toHex(5000000),
        nonce: await web3.eth.getTransactionCount(BankWalletAddress),
        maxPriorityFeePerGas: web3.utils.toHex(web3.utils.toWei('2', 'gwei')),
        chainId: chainId,
        type: 0x2,
      };

      const signedDepositTx = await web3.eth.accounts.signTransaction(depositTx, BankPrivateKey);
      const depositReceipt = await web3.eth.sendSignedTransaction(signedDepositTx.rawTransaction);

      return depositReceipt;
    }
  } catch (err) {

    return false;
  }
}

const processVaultRegistrationAndDeposit = async (id, value) => {
  try {
    // web3
    const web3 = getWeb3();




    const contract = new web3.eth.Contract(BankABI, BANK_CONTRACT_TOKEN_ADDRESS, {
      from: BankWalletAddress,
    });



    // const vaultId = id.toString(); // if id is BigInt
    const vaultId = Number(id); // 18n -> 18

    await allowBankMoney(value); // Uses BankPrivateKey

    // Bank deposits funds to vault
    const depositTx = {
      from: BankWalletAddress,
      to: BANK_CONTRACT_TOKEN_ADDRESS,
      value: '0x0',
      data: contract.methods.depositToVault(vaultId).encodeABI(),
      gas: web3.utils.toHex(5000000),
      nonce: await web3.eth.getTransactionCount(BankWalletAddress),
      maxPriorityFeePerGas: web3.utils.toHex(web3.utils.toWei('2', 'gwei')),
      chainId: chainId,
      type: 0x2,
    };

    const signedDepositTx = await web3.eth.accounts.signTransaction(depositTx, BankPrivateKey);
    const depositReceipt = await web3.eth.sendSignedTransaction(signedDepositTx.rawTransaction);

    return {
      success: true,
      vaultId,
      depositReceipt
    };

  } catch (error) {

    throw error;
  }
};
async function waitForReceipt(web3: Web3, txHash: string, interval: number = 1000): Promise<any> {
  while (true) {
    const receipt = await web3.eth.getTransactionReceipt(txHash);
    if (receipt) return receipt;
    await new Promise(resolve => setTimeout(resolve, interval));
  }
}

async function borrow(property, amount) {

  const clientWalletAddress = property['property']['properties']['ownerWalletAddress'].toLowerCase();

  const web3 = getWeb3();
  let activeAddress = null;
  let clientPK = null;
  let cbdcWalletAddress = null;

  // 1. Check if MetaMask is injected
  if (window.ethereum && window.ethereum.isMetaMask) {
    const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
    const connectedWallet = accounts[0].toLowerCase();

    if (connectedWallet === clientWalletAddress) {
      activeAddress = connectedWallet;
      // Use MetaMask to send transaction later
    } else {
      throw new Error(`Does not match property owner (${clientWalletAddress})`);
    }
  }

  // 2. If MetaMask is not usable or doesn't match, fall back to stored keys
  // if (!activeAddress) {
  //   const userPrivateKeyObject = userPrivateKey.find(
  //     (obj) => obj.walletAddress.toLowerCase() === clientWalletAddress
  //   );

  //   if (!userPrivateKeyObject) {
  //     throw new Error('Wallet address not found in MetaMask or .env');
  //   }

  //   clientPK = userPrivateKeyObject.privateKey;
  //   cbdcWalletAddress = userPrivateKeyObject.cbdcWalletAddress;
  //   activeAddress = clientWalletAddress;

  //   // Register PK with web3
  //   web3.eth.accounts.wallet.add(clientPK);
  // }

  // Prepare borrow values
  const amountHex = web3.utils.toHex(web3.utils.toWei(amount + ''));
  const tokenID = property.vatId;

  const contract = new web3.eth.Contract(BankABI, BANK_CONTRACT_TOKEN_ADDRESS, {
    from: activeAddress,
  });

  const txData = contract.methods.borrow(tokenID, amountHex).encodeABI();

  try {
    if (clientPK) {
      // Using private key (non-MetaMask)
      const nonce = await web3.eth.getTransactionCount(activeAddress);

      const tx = {
        from: activeAddress,
        to: BANK_CONTRACT_TOKEN_ADDRESS,
        value: '0x0',
        data: txData,
        gas: web3.utils.toHex(5000000),
        nonce,
        maxPriorityFeePerGas: web3.utils.toHex(web3.utils.toWei('2', 'gwei')),
        chainId: chainId,
        type: 0x2,
      };

      const signedTx = await web3.eth.accounts.signTransaction(tx, clientPK);
      const receipt = await web3.eth.sendSignedTransaction(signedTx.rawTransaction);
      return true;
    } else {
      // Using MetaMask
      const txParams = {
        from: activeAddress,
        to: BANK_CONTRACT_TOKEN_ADDRESS,
        data: txData,
      };

      const txHash = await window.ethereum.request({
        method: 'eth_sendTransaction',
        params: [txParams],
      });

      return true;
    }
  } catch (e) {
    // Handle errors, e.g., insufficient funds, user rejection, etc.
    throw new Error(e.message);

  }
}

async function getDataFromHash(hash, walletAddress, amount) {
  try {
    let web3 = getWeb3()
    let result = await web3.eth.getTransactionReceipt(hash)

    let vatId = result.logs[3].topics[1]

    const contract = new web3.eth.Contract(BankABI, BANK_CONTRACT_TOKEN_ADDRESS)
    const valutAddress = await contract.methods.vaults(vatId).call()

    let obj = {
      hash: hash,
      valutAddress: valutAddress,
      walletAddress: walletAddress,
      amount: amount,
      transactionType: 'cbdcToValut',
    }

    // sendMessageToSlack(obj)
  } catch (e) {
    let obj = {
      hash: hash,
      walletAddress: walletAddress,
      amount: amount,
      transactionType: 'cbdcToValut',
    }
    // sendMessageToSlack(obj)
  }
}

async function calculateDebt(user, property, amount) {
  // let userPrivateKeyObject = userPrivateKey.find((obj) => obj.id == user.id)

  // let clientWalletAddress = userPrivateKeyObject.walletAddress
  // let clientPK = userPrivateKeyObject.privateKey

  // let web3 = getWeb3()
  // web3.eth.accounts.privateKeyToAccount(clientPK)

  // let amountHex = web3.utils.toHex(web3.utils.toWei(amount + ''))
  // let tokenID = property.tokenId

  // //console.log(amountHex)
  // const contract = new web3.eth.Contract(BankABI, BANK_CONTRACT_TOKEN_ADDRESS, {
  //   from: clientWalletAddress,
  // })

  // // Creating the transaction object
  // const tx = {
  //   from: clientWalletAddress,
  //   to: BANK_CONTRACT_TOKEN_ADDRESS,
  //   value: '0x0',
  //   data: contract.methods.borrow(tokenID, amountHex).encodeABI(),
  //   gas: web3.utils.toHex(5000000),
  //   nonce: web3.eth.getTransactionCount(clientWalletAddress),
  //   maxPriorityFeePerGas: web3.utils.toHex(web3.utils.toWei('2', 'gwei')),
  //   chainId: chainId,
  //   type: 0x2,
  // }

  // let signedTx = await web3.eth.accounts.signTransaction(tx, clientPK)
  // //console.log('Raw transaction data: ' + signedTx.rawTransaction)

  // try {
  //   const receipt = await web3.eth
  //     .sendSignedTransaction(signedTx.rawTransaction)
  //     .once('transactionHash', (txhash) => {

  //     })
  //   // The transaction is now on chain!
  //   return receipt
  // } catch (e) {
  //   return false
  // }
}

async function allow(property, amount) {
  const clientWalletAddress = property['property']['properties']['ownerWalletAddress'].toLowerCase();
  const web3 = getWeb3(); // or new Web3(provider)
  let activeAddress = null;
  let clientPK = null;
  let useMetaMask = false;

  // 1. Check MetaMask
  if (window.ethereum && window.ethereum.isMetaMask) {
    const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
    const connectedWallet = accounts[0].toLowerCase();

    if (connectedWallet === clientWalletAddress) {
      activeAddress = connectedWallet;
      useMetaMask = true;
    } else {
      throw new Error(`Does not match property owner (${clientWalletAddress})`);
    }
  }

  // 2. Fallback to private key if MetaMask not usable
  if (!activeAddress) {
    // const userPrivateKeyObject = userPrivateKey.find(
    //   (obj) => obj.walletAddress.toLowerCase() === clientWalletAddress
    // );

    // if (!userPrivateKeyObject) {
    //   throw new Error('Wallet address not found in MetaMask or .env');
    // }

    // clientPK = userPrivateKeyObject.privateKey;
    // activeAddress = clientWalletAddress;
    // web3.eth.accounts.wallet.add(clientPK);
  }

  // 3. Setup contract
  const contract = new web3.eth.Contract(EDABI, ED_TOKEN_ADDRESS, {
    from: activeAddress,
  });

  const amountHex = web3.utils.toHex(web3.utils.toWei(amount));

  const txData = contract.methods
    .approve(BANK_CONTRACT_TOKEN_ADDRESS, amountHex)
    .encodeABI();

  try {
    if (!useMetaMask) {
      // Sign manually using private key
      const nonce = await web3.eth.getTransactionCount(activeAddress);

      const tx = {
        from: activeAddress,
        to: ED_TOKEN_ADDRESS,
        value: '0x0',
        data: txData,
        gas: web3.utils.toHex(5000000),
        nonce,
        maxPriorityFeePerGas: web3.utils.toHex(web3.utils.toWei('2', 'gwei')),
        chainId: chainId,
        type: 0x2,
      };

      const signedTx = await web3.eth.accounts.signTransaction(tx, clientPK);
      const receipt = await web3.eth.sendSignedTransaction(signedTx.rawTransaction);
      return receipt;
    } else {
      // Use MetaMask
      const txParams = {
        from: activeAddress,
        to: ED_TOKEN_ADDRESS,
        data: txData,
      };

      const txHash = await window.ethereum.request({
        method: 'eth_sendTransaction',
        params: [txParams],
      });
      const approveTxReceipt = await waitForReceipt(web3, txHash);

      return { transactionHash: approveTxReceipt };
    }
  } catch (err) {

    throw err;
  }
}

async function allowBankMoney(amountHex) {
  let clientWalletAddress = BankWalletAddress
  let clientPK = BankPrivateKey
  let web3 = new Web3(provider)

  const contract = new web3.eth.Contract(EDABI, ED_TOKEN_ADDRESS, { from: clientWalletAddress })

  // Check current allowance
  const currentAllowance = await contract.methods.allowance(clientWalletAddress, BANK_CONTRACT_TOKEN_ADDRESS).call()
 
  web3.eth.accounts.privateKeyToAccount(clientPK)

  const tx = {
    from: clientWalletAddress,
    to: ED_TOKEN_ADDRESS,
    value: '0x0',
    data: contract.methods.approve(BANK_CONTRACT_TOKEN_ADDRESS, amountHex).encodeABI(),
    gas: web3.utils.toHex(5000000),
    nonce: await web3.eth.getTransactionCount(BankWalletAddress),
    maxPriorityFeePerGas: web3.utils.toHex(web3.utils.toWei('2', 'gwei')),
    chainId: chainId,
    type: 0x2,
  }

  let signedTx = await web3.eth.accounts.signTransaction(tx, clientPK)
  const receipt = await web3.eth.sendSignedTransaction(signedTx.rawTransaction)
  // const approveTxHash = await window.ethereum.request({ method: 'eth_sendTransaction', params: [receipt] });
  // const approveTxReceipt = await waitForReceipt(web3, approveTxHash);

  return { alreadyApproved: false, receipt }
}

async function pay(property, amount) {
  const clientWalletAddress = property['property']['properties']['ownerWalletAddress'].toLowerCase();

  const web3 = getWeb3(); // or new Web3(provider), depending on your setup
  let activeAddress = null;
  let clientPK = null;
  let cbdcWalletAddress = null;
  let useMetaMask = false;

  // Check MetaMask
  if (window.ethereum && window.ethereum.isMetaMask) {
    const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
    const connectedWallet = accounts[0].toLowerCase();

    if (connectedWallet === clientWalletAddress) {
      activeAddress = connectedWallet;
      useMetaMask = true;
    } else {
      throw new Error(`Does not match property owner (${clientWalletAddress})`);
    }
  }

  // Fallback to .env keys if MetaMask not usable
  if (!activeAddress) {
    // const userPrivateKeyObject = userPrivateKey.find(
    //   (obj) => obj.walletAddress.toLowerCase() === clientWalletAddress
    // );

    // if (!userPrivateKeyObject) {
    //   throw new Error('Wallet address not found in MetaMask or .env');
    // }

    // clientPK = userPrivateKeyObject.privateKey;
    // cbdcWalletAddress = userPrivateKeyObject.cbdcWalletAddress;
    // activeAddress = clientWalletAddress;

    // // Register PK with web3
    // web3.eth.accounts.wallet.add(clientPK);
  }

  const amountHex = web3.utils.toHex(web3.utils.toWei(amount));
  const tokenID = property.vatId;

  const contract = new web3.eth.Contract(BankABI, BANK_CONTRACT_TOKEN_ADDRESS, {
    from: activeAddress,
  });

  const txData = contract.methods.repay(tokenID, amountHex).encodeABI();

  // Step 1: Run allow() before proceeding
  try {
    await allow(property, amount);

    if (!useMetaMask) {
      // Manually sign with private key
      const nonce = await web3.eth.getTransactionCount(activeAddress);

      const tx = {
        from: activeAddress,
        to: BANK_CONTRACT_TOKEN_ADDRESS,
        value: '0x0',
        data: txData,
        gas: web3.utils.toHex(5000000),
        nonce,
        maxPriorityFeePerGas: web3.utils.toHex(web3.utils.toWei('2', 'gwei')),
        chainId: chainId,
        type: 0x2,
      };

      const signedTx = await web3.eth.accounts.signTransaction(tx, clientPK);
      const receipt = await web3.eth.sendSignedTransaction(signedTx.rawTransaction);

      return true;
    } else {
      // MetaMask flow
      const txParams = {
        from: activeAddress,
        to: BANK_CONTRACT_TOKEN_ADDRESS,
        data: txData,
      };

      const txHash = await window.ethereum.request({
        method: 'eth_sendTransaction',
        params: [txParams],
      });
      const approveTxReceipt = await waitForReceipt(web3, txHash);

      return true;
    }
  } catch (e) {
    throw new Error(e.message);

    // return false;
  }
}

function test() { }

// Actucal Function....

async function getBalance(user) {
  let clientWalletAddress = user['walletAddress']
  // let userPrivateKeyObject = userPrivateKey.find(
  //   (obj) => obj.walletAddress.toLowerCase() == clientWalletAddress.toLowerCase(),
  // )
  // let cbdcWalletAddress = userPrivateKeyObject.cbdcWalletAddress
  // return await getCBDCBalance(cbdcWalletAddress)
  return await getMMBalance(clientWalletAddress)
}

async function getCBDCBalance(cbdcWalletAddress) {
  // const apiUrl = '/chain/api' // Replace with your API URL
  const apiUrl = 'https://hkma-cbdc.devnet.rippletest.net:51234'

  // Define the data you want to send in the POST request
  const postData = {
    method: 'account_lines',
    params: [
      {
        account: cbdcWalletAddress,
      },
    ],
  }

  // Make a POST request using Axios
  let bal = await axios
    .post(apiUrl, postData)
    .then((response) => {
      let temp = 0
      for (let obj of response.data.result.lines) {
        if (obj.currency == ' HGBP') {
          temp = obj.balance
        }
      }

      return temp
    })
    .catch((error) => {
      return 0
    })

  return bal
}

async function getMMBalance(clientWalletAddress) {
  let web3 = new Web3(provider)

  const tokenInst = new web3.eth.Contract(EDABI, ED_TOKEN_ADDRESS)
  const balance = await tokenInst.methods.balanceOf(clientWalletAddress).call()
  let temp = Web3.utils.fromWei(balance, 'ether')
  // console.log("balance from blockchain ",temp);

  return temp //parseWeiNumeric(balance)
}

async function getInterest(tokenId) {
  let web3 = getWeb3()
  const contract = new web3.eth.Contract(BankABI, BANK_CONTRACT_TOKEN_ADDRESS)

  const intrest = await contract.methods.calculateVaultInterest(tokenId).call()

  return parseWeiNumeric(intrest)
}

async function getInterestByBank(tokenId, bankContractAddress) {
  let web3 = getWeb3()
  const contract = new web3.eth.Contract(BankABI, bankContractAddress)

  const intrest = await contract.methods.calculateVaultInterest(tokenId).call()

  return parseWeiNumeric(intrest)
}

async function getBorrowAmount(vatId) {
  let web3 = getWeb3()

  const contract = new web3.eth.Contract(BankABI, BANK_CONTRACT_TOKEN_ADDRESS)

  const intrest = await contract.methods.vaultData(vatId).call()

  let obj = {
    value: Web3.utils.fromWei(intrest.available, 'ether'),
    debt: Web3.utils.fromWei(intrest.debt, 'ether'),
    activit: intrest.active,
  }

  return obj
}

// async function getPropertyInfromationByToken(vatId) {
//   let web3 = getWeb3()
//   const contract = new web3.eth.Contract(BankABI, BANK_CONTRACT_TOKEN_ADDRESS)

//   const intrest = await contract.methods.vaultData(vatId).call()
//   if (!intrest.activit) {
//     let propertyObject = {
//       activit: intrest.activit,
//     }
//     return propertyObject
//   }
//   try {
//     let nftURL = await getTokenUri(intrest.tokenContract)

//     const searchParams = new URLSearchParams(new URL(nftURL).search)
//     const docId = searchParams.get('doc_id')
//     const { data: responseObject } = await axios.get(
//       'https://portal-integ.toko.network' + '/v1/juno/download_document?doc_id=' + docId,
//     )

//     // const { data: responseObject } = await axios.get(
//     //   'https://portal-integ.toko.network' + '/v1/juno/download_document?doc_id=' + docId,
//     // )

//     let propertyObject = {
//       property: responseObject,
//       tokenAddress: intrest.tokenContract,
//       value: parseWeiNumeric(intrest.amt),
//       debt: parseWeiNumeric(intrest.debt),
//       interest: parseWeiNumeric(intrest.inst),
//       time: intrest.tamp,
//       vatId: vatId,
//       activit: intrest.activit,
//     }

//     return propertyObject
//   } catch (e) {}
// }

async function getPropertyInfromationByToken(vatId, clientWalletAddress) {
  // console.log("getPropertyInfromationByToken",vatId);
  let web3 = getWeb3()
  const contract = new web3.eth.Contract(BankABI, BANK_CONTRACT_TOKEN_ADDRESS)

  try {
    const interest = await contract.methods.vaultData(vatId).call()
    const vatAddress = await contract.methods.vaults(vatId).call()
    const responseObject = await getPropertyByClient(clientWalletAddress, interest.tokenId)



    const propertyObject = {
      property: responseObject,
      tokenAddress: interest.tokenContract,
      value: Web3.utils.fromWei(interest.available, 'ether'),
      debt: Web3.utils.fromWei(interest.debt, 'ether'),
      interest: Web3.utils.fromWei(interest.interest, 'ether'),
      time: interest.lastUpdate,
      tokenId: interest.tokenId,
      vatId: vatId,
      vatAddress: vatAddress,
      activit: interest.active,
    }

    //alert("Property information retrieved successfully!");
    return propertyObject
  } catch (error) {
    // alert('Failed to fetch Asset information. Please try again!')

    return null // Return null or some default value on failure
  }
}

async function getPropertyByVaultAddressToken(vatId, bankVaultContract, clientWalletAddress) {
  // console.log("getPropertyInfromationByToken",vatId);
  let web3 = getWeb3()

  const contract = new web3.eth.Contract(BankABI, bankVaultContract)

  try {
    const interest = await contract.methods.vaultData(vatId).call()
    const vatAddress = await contract.methods.vaults(vatId).call()

    const responseObject = await getPropertyByClient(clientWalletAddress, interest.tokenId)

    const propertyObject = {
      property: responseObject,
      tokenAddress: interest.tokenContract,
      value: Web3.utils.fromWei(interest.available, 'ether'),
      debt: Web3.utils.fromWei(interest.debt, 'ether'),
      interest: Web3.utils.fromWei(interest.interest, 'ether'),
      time: interest.lastUpdate,
      tokenId: interest.tokenId,
      vatId: vatId,
      vatAddress: vatAddress,
      activit: interest.active,
    }

    //alert("Property information retrieved successfully!");
    return propertyObject
  } catch (error) {

    // alert('Failed to fetch Asset information. Please try again!')
    message.error('Failed to fetch Asset information. Please try again!')

    return null // Return null or some default value on failure
  }
}
function getInterestRate() {
  return {
    value: '5',
    date: format_time(Date.now(), 'DD/MM/YYYY'),
  }
}

async function getTransactionList(property) {
  let clientWalletAddress = property['property']['properties']['ownerWalletAddress']
  let borrowList = await getBorrowList(clientWalletAddress, property.vatId)
  // let rePayList = await getRepayList(clientWalletAddress, property.vatId)
  // let all = [...borrowList, ...rePayList]

  // all.sort(function (a, b) {
  //   return a.blockNumber - b.blockNumber
  // })

  return []
}

async function getRepayList(clientWalletAddress, tokenId) {
  let web3 = getWeb3()

  let repayList: any[] = []

  var readlogpocContract = new web3.eth.Contract(BankABI, BANK_CONTRACT_TOKEN_ADDRESS)

  // web3.eth
  //   .getPastLogs({
  //     address: BANK_TOKEN_ADDRESS,
  //     fromBlock: '0x1',
  //     toBlock: 'latest',
  //     topics: [web3.utils.sha3("0x0ecbcdab")],
  //   })
  //   .then(console.log)
  //   .catch((e) => console.log(e))

  //     event Borrow(uint256 indexed id, address user, uint256 amount);

  let pastTransferEvents = await readlogpocContract.getPastEvents(
    'Repay',
    {
      fromBlock: 2428515,
      toBlock: 'latest',
    },
    (error, events) => {
      if (!error) {
        return events
      }
    },
  )
  pastTransferEvents.forEach(async function (item, index) {
    if (
      item.returnValues['user'].toLowerCase() === clientWalletAddress.toLowerCase() &&
      item.returnValues['id'] === tokenId
    ) {
      let timestamp = '-'

      let temp = {
        type: 'Repay',
        blockNumber: item['blockNumber'],
        blockHash: item['blockHash'],
        timestamp: timestamp,
        amount: Web3.utils.fromWei(item.returnValues['amount'], 'ether'), // parseWeiNumeric(item.returnValues['amount']),
        user: item.returnValues['user'],
        tokenId: item.returnValues['id'],
      }
      repayList.push(temp)
    }
  })
  return repayList
}

async function getBlockTime(blockNumber) {
  let web3 = getWeb3()
  let tm = (await web3.eth.getBlock(blockNumber)).timestamp
  return tm
}

async function getBorrowList(clientWalletAddress, tokenId) {
  let web3 = getWeb3()

  let borrowList: any[] = []

  // let temp = await getPastLogs(web3,BANK_CONTRACT_TOKEN_ADDRESS,"Borrow",0,222515);
  var readlogpocContract = new web3.eth.Contract(BankABI, BANK_CONTRACT_TOKEN_ADDRESS)
  //     event Borrow(uint256 indexed id, address user, uint256 amount);

  let pastTransferEvents = await readlogpocContract.getPastEvents(
    'Borrow',
    {
      fromBlock: 222515,
      toBlock: 'latest',
    },
    (error, events) => {
      if (!error) {

        return events
      }
    },
  )

  pastTransferEvents.forEach(async function (item, index) {
    if (
      item.returnValues['user'].toLowerCase() === clientWalletAddress.toLowerCase() &&
      item.returnValues['id'] === tokenId
    ) {
      // let timestamp = (await web3.eth.getBlock(item['blockNumber'])).timestamp
      let timestamp = '-'
      let temp = {
        type: 'Borrow',
        blockNumber: item['blockNumber'],
        blockHash: item['blockHash'],
        timestamp: timestamp,
        amount: Web3.utils.fromWei(item.returnValues['amount'], 'ether'), //parseWeiNumeric(item.returnValues['amount']),
        user: item.returnValues['user'],
        tokenId: item.returnValues['id'],
      }
      borrowList.push(temp)
    }
  })

  return borrowList
}

async function getPastLogs(web3, address, topics, fromBlock, toBlock) {
  if (fromBlock <= toBlock) {
    try {
      return await web3.eth.getPastLogs({ address, topics, fromBlock, toBlock })
    } catch (error) {
      const midBlock = (fromBlock + toBlock) >> 1

      const arr1 = await getPastLogs(web3, address, topics, fromBlock, midBlock)
      const arr2 = await getPastLogs(web3, address, topics, midBlock + 1, toBlock)
      return [...arr1, ...arr2]
    }
  }
  return []
}

// async function getPropertyFromVault(userId) {
//   let userPrivateKeyObject = userPrivateKey.find((obj) => obj.id == userId)
//   let clientWalletAddress = userPrivateKeyObject.walletAddress
//   let web3 = getWeb3()
//   let properties: any[] = []
//   let final: any[] = []

//   var contract = new web3.eth.Contract(BankABI, BANK_CONTRACT_TOKEN_ADDRESS)
//   // Temp Fix to fetch only one valut
//   const valuts = await contract.methods.getVaults(clientWalletAddress).call()
//   const d = [...valuts]
//   console.log(d)
//   for (let obj of d.reverse()) {
//     let va = await getPropertyInfromationByToken(obj).then(async (val) => {
//       if (val && val.activit) {
//         final.push(val)
//         return val.activit
//       }
//       return val.activit
//     })
//     if (va) {
//       break
//     }
//   }

//   return final
// }

async function getAllByVaultByUser(clientWalletAddress) {
  // const userPrivateKeyObject = userPrivateKey.find(
  //   (obj) => obj.walletAddress.toLowerCase() === walletAddress.toLowerCase(),
  // )

  // const clientWalletAddress = userPrivateKeyObject.walletAddress
  const web3 = getWeb3()
  const contract = new web3.eth.Contract(BankABI, BANK_CONTRACT_TOKEN_ADDRESS)

  const vaults = await contract.methods.getVaults(clientWalletAddress).call()
  const reversedVaults = [...vaults].reverse()
  return reversedVaults
}

async function getAllByBankContractAndUser(bankContractAddress, clientWalletAddress) {
  // const userPrivateKeyObject = userPrivateKey.find(
  //   (obj) => obj.walletAddress.toLowerCase() === walletAddress.toLowerCase(),
  // )

  // const clientWalletAddress = userPrivateKeyObject.walletAddress
  const web3 = getWeb3()
  const contract = new web3.eth.Contract(BankABI, bankContractAddress)

  const vaults = await contract.methods.getVaults(clientWalletAddress).call()
  const reversedVaults = [...vaults].reverse()
  return reversedVaults
}

async function getPropertyFromVault(clientWalletAddress) {

  // let userPrivateKeyObject = userPrivateKey.find(
  //   (obj) => obj.walletAddress.toLowerCase() == walletAddress.toLowerCase(),
  // )

  // const clientWalletAddress = userPrivateKeyObject.walletAddress
  const web3 = getWeb3()

  const contract = new web3.eth.Contract(BankABI, BANK_CONTRACT_TOKEN_ADDRESS)
  const vaults = await contract.methods.getVaults(clientWalletAddress).call()

  // Reverse the vaults array for processing
  const reversedVaults = [...vaults].reverse()

  // Parallelize fetching property information for all vaults
  const properties = await Promise.all(
    reversedVaults.map(
      async (vault) => await getPropertyInfromationByToken(vault, clientWalletAddress),
    ),
  )

  const activeProperties = properties.filter((property) => property && property.activit === true)
  return activeProperties ? activeProperties : []
}

function getAllLogsFromChain() {
  let web3 = getWeb3()
  // web3.eth.getTransactionList("0xf57aBFa295a37e16A8E40A0a66C985213D1e3C22");
  // web3.eth
  //   .getPastLogs({ fromBlock: '0x0', address: '0xf57aBFa295a37e16A8E40A0a66C985213D1e3C22' })
  //   .then((res) => {
  //     res.forEach((rec) => {
  //       //console.log(rec.blockNumber, rec.transactionHash, rec.topics)
  //     })
  //   })
  //   .catch((err) => //console.log('getPastLogs failed', err))

  var readlogpocContract = new web3.eth.Contract(BankABI, BANK_CONTRACT_TOKEN_ADDRESS)

  web3.eth
    .getPastLogs({
      address: BANK_CONTRACT_TOKEN_ADDRESS,
      fromBlock: '0x1',
      toBlock: 'latest',
    })
    .then(console.log)
    .catch((e) => console.log(e))
}

async function checkBlock() {
  let web3 = getWeb3()
  let block = await web3.eth.getBlock('latest')
  let number = block.number
  let transactions = block.transactions

  if (block != null && block.transactions != null) {
    for (let txHash of block.transactions) {
      let tx = await web3.eth.getTransaction(txHash)
    }
  }
}

async function getTokenUri(tokenADDRESS, tokenID) {
  let web3 = new Web3(provider)

  const tokenInst = new web3.eth.Contract(NFTABI, tokenADDRESS)
  const url = await tokenInst.methods.tokenURI(tokenID).call()

  return url
}

async function getNftOwner(tokenADDRESS, tokenID) {
  const web3 = new Web3(provider)
  const tokenInst = new web3.eth.Contract(NFTABI, tokenADDRESS)
  const owner = await tokenInst.methods.ownerOf(tokenID).call()
  return owner
}

async function allowNFT(tokenContract, tokenId) {
  const web3 = getWeb3()
  web3.eth.accounts.privateKeyToAccount(BankPrivateKey)
  const contract = new web3.eth.Contract(NFTABI, tokenContract, { from: BankWalletAddress })

  // Creating the transaction object
  const tx = {
    from: BankWalletAddress,
    to: tokenContract,
    value: '0x0',
    data: contract.methods.approve(BANK_CONTRACT_TOKEN_ADDRESS, tokenId).encodeABI(),
    gas: web3.utils.toHex(5000000),
    nonce: web3.eth.getTransactionCount(BankWalletAddress),
    maxPriorityFeePerGas: web3.utils.toHex(web3.utils.toWei('2', 'gwei')),
    chainId: chainId,
    type: 0x2,
  }

  let signedTx = await web3.eth.accounts.signTransaction(tx, BankPrivateKey)

  const receipt = await web3.eth
    .sendSignedTransaction(signedTx.rawTransaction)
    .once('transactionHash', (txhash) => { })
  return receipt
}
async function closeVault(ownerAddress, vatID) {

  const expectedAddress = ownerAddress.toLowerCase();
  const fallbackPrivateKey = BankPrivateKey;
  const fallbackAddress = BankWalletAddress.toLowerCase();
  const web3 = getWeb3();

  let activeAddress = null;
  let useMetaMask = false;
  let clientPK = null;

  // Try MetaMask
  if (window.ethereum && window.ethereum.isMetaMask) {
    try {
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      const connected = accounts[0].toLowerCase();
      if (connected === expectedAddress) {
        activeAddress = connected;
        useMetaMask = true;
      }
    } catch (err) {

    }
  }

  // If MetaMask unavailable or address mismatch, fallback to .env keys
  if (!activeAddress) {
    activeAddress = fallbackAddress;
    clientPK = fallbackPrivateKey;
    web3.eth.accounts.wallet.add(clientPK);
  }

  const tokenID = vatID;
  const contract = new web3.eth.Contract(BankABI, BANK_CONTRACT_TOKEN_ADDRESS, {
    from: activeAddress,
  });

  const txData = contract.methods.close(tokenID).encodeABI();

  try {
    if (!useMetaMask) {
      const nonce = await web3.eth.getTransactionCount(activeAddress);

      const tx = {
        from: activeAddress,
        to: BANK_CONTRACT_TOKEN_ADDRESS,
        value: '0x0',
        data: txData,
        gas: web3.utils.toHex(5000000),
        nonce,
        maxPriorityFeePerGas: web3.utils.toHex(web3.utils.toWei('2', 'gwei')),
        chainId: chainId,
        type: 0x2,
      };

      const signedTx = await web3.eth.accounts.signTransaction(tx, clientPK);
      const receipt = await web3.eth.sendSignedTransaction(signedTx.rawTransaction);
      return true;
    } else {
      const txParams = {
        from: activeAddress,
        to: BANK_CONTRACT_TOKEN_ADDRESS,
        data: txData,
      };

      const txHash = await window.ethereum.request({
        method: 'eth_sendTransaction',
        params: [txParams],
      });

      return true;
    }
  } catch (e) {

    return false;
  }
}


async function createDocHash(data) {
  // Convert the object to a JSON string
  // Convert the object to a JSON string
  const dataString = JSON.stringify(data)

  // Convert string to an ArrayBuffer
  const encoder = new TextEncoder()
  const dataBuffer = encoder.encode(dataString)

  // Hash the data using SHA-256
  const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer)

  // Convert the ArrayBuffer to a hex string
  return bufferToHex(hashBuffer)
  // hash.update(dataString);
  // return hash.digest('hex');
}

// Function to verify the hash
async function verifyHash(data: object, originalHash: string): Promise<boolean> {
  const recomputedHash = await createDocHash(data)
  // Compare the recomputed hash with the original hash
  if (recomputedHash === originalHash) {
    // console.log('Hash verified successfully!')
    return true
  } else {
    // console.log('Hash verification failed!')
    return false
  }
}

// XOR Encryption function
function xorEncryptDecrypt(input: string, key: string): string {
  let output = ''
  for (let i = 0; i < input.length; i++) {
    // XOR each character in the string with the key (cycling through the key if necessary)
    output += String.fromCharCode(input.charCodeAt(i) ^ key.charCodeAt(i % key.length))
  }
  return output
}

// Encrypt data
function encryptData(data: object, key: string): string {
  // Convert the object to a JSON string
  const dataString = JSON.stringify(data)

  // XOR encrypt the string with the key
  const encryptedData = xorEncryptDecrypt(dataString, key)

  // Encode the encrypted data in Base64 for safe storage/transfer
  return btoa(encryptedData)
}

// Decrypt data
function decryptData(encryptedData: string, key: string): object {
  // Decode the Base64 encrypted data
  const decodedData = atob(encryptedData)

  // XOR decrypt the string with the same key
  const decryptedData = xorEncryptDecrypt(decodedData, key)

  // Parse the decrypted string back to an object
  return JSON.parse(decryptedData)
}

// Helper function to convert Base64 to ArrayBuffer
function base64ToArrayBuffer(base64: string): ArrayBuffer {
  const binaryString = atob(base64)
  const arrayBuffer = new ArrayBuffer(binaryString.length)
  const uintArray = new Uint8Array(arrayBuffer)
  for (let i = 0; i < binaryString.length; i++) {
    uintArray[i] = binaryString.charCodeAt(i)
  }
  return arrayBuffer
}

function checkVerificationStatus(partyVerifiedAt) {
  if (partyVerifiedAt === '0') {
    return 'Not Verified'
  } else {
    return 'Verified'
  }
}

function convertUnixToFormattedDate(unixTimestamp) {
  const date = new Date(unixTimestamp * 1000) // Convert Unix timestamp to milliseconds
  const year = date.getFullYear().toString().slice(-2) // Get last two digits of the year
  const month = ('0' + (date.getMonth() + 1)).slice(-2) // Format month (1-based)
  const day = ('0' + date.getDate()).slice(-2) // Format day

  return `${day}.${month}.${year}`
}

async function getDocument(docId) {
  let clientWalletAddress = BankWalletAddress
  let clientPK = BankPrivateKey

  let web3 = getWeb3()
  web3.eth.accounts.privateKeyToAccount(clientPK)

  const contract = new web3.eth.Contract(DocABI, DOC_CONTRACT_ADDRESS, {
    from: clientWalletAddress,
  })

  try {
    const document = await contract.methods.getDocument(docId).call()
    // Return the formatted document as a JSON object
    const decryptContent = await decryptData(document.content, KEY)

    const isHashVerify = await verifyHash(decryptData, document.hash)

    return {
      id: document.id,
      type: 'CCR003 Consumer Credit data: Lenders',
      content: decryptContent,
      isHashVerify: isHashVerify,
      creatorVerifiedAt: document.creatorVerifiedAt.toString(), // Assuming it's a number, converting to string
      docId: document.docId.toString(), // Converting to string
      hash: document.hash,
      owner: document.owner,
      party: document.party,
      status: checkVerificationStatus(document.partyVerifiedAt.toString()),
      partyVerifiedAt: document.partyVerifiedAt.toString(),
      timestamp: convertUnixToFormattedDate(document.timestamp.toString()),
    }
  } catch (e) {

    return null
  }
}

// Helper function to convert ArrayBuffer to Base64
function arrayBufferToBase64(buffer: ArrayBuffer): string {
  return btoa(String.fromCharCode(...new Uint8Array(buffer)))
}

async function createDocument(party, data) {
  let clientWalletAddress = BankWalletAddress
  let clientPK = BankPrivateKey
  let partyAddress = party.walletAddress
  const hash = await createDocHash(data)
  verifyHash(data, hash)

  // Encrypt the data
  const content = encryptData(data, KEY)

  // Decrypt the data
  const decryptedData = decryptData(content, KEY)
  // console.log("Decrypted Data:", decryptedData);

  let web3 = getWeb3()
  web3.eth.accounts.privateKeyToAccount(clientPK)

  const contract = new web3.eth.Contract(DocABI, DOC_CONTRACT_ADDRESS, {
    from: clientWalletAddress,
  })

  // Creating the transaction object
  const tx = {
    from: clientWalletAddress,
    to: DOC_CONTRACT_ADDRESS,
    value: '0x0',
    data: contract.methods.createDocument(partyAddress, content, hash).encodeABI(),
    gas: web3.utils.toHex(1000000),
    nonce: web3.eth.getTransactionCount(clientWalletAddress),
    maxPriorityFeePerGas: web3.utils.toHex(web3.utils.toWei('5', 'gwei')),
    chainId: chainId,
    type: 0x2,
  }

  let signedTx = await web3.eth.accounts.signTransaction(tx, clientPK)

  try {
    const receipt = await web3.eth
      .sendSignedTransaction(signedTx.rawTransaction)
      .once('transactionHash', (txhash) => {

      })

    return true
  } catch (e) {

    return false
  }
}
async function verifyDocument(user, docId) {
  // let clientWalletAddress = BankWalletAddress
  // let clientPK = BankPrivateKey
  //  let userPrivateKeyObject = userPrivateKey.find((obj) => obj.id == user.id)

  let userPrivateKeyObject = userPrivateKey.find(
    (obj) => obj.walletAddress.toLowerCase() == user.walletAddress.toLowerCase(),
  )
  let clientWalletAddress = userPrivateKeyObject.walletAddress
  let clientPK = userPrivateKeyObject.privateKey

  let web3 = getWeb3()
  web3.eth.accounts.privateKeyToAccount(clientPK)

  const contract = new web3.eth.Contract(DocABI, DOC_CONTRACT_ADDRESS, {
    from: clientWalletAddress,
  })

  // Creating the transaction object
  const tx = {
    from: clientWalletAddress,
    to: DOC_CONTRACT_ADDRESS,
    value: '0x0',
    data: contract.methods.verifyDocument(docId).encodeABI(),
    gas: web3.utils.toHex(300000),
    nonce: web3.eth.getTransactionCount(clientWalletAddress),
    maxPriorityFeePerGas: web3.utils.toHex(web3.utils.toWei('2', 'gwei')),
    chainId: chainId,
    type: 0x2,
  }

  let signedTx = await web3.eth.accounts.signTransaction(tx, clientPK)

  try {
    const receipt = await web3.eth
      .sendSignedTransaction(signedTx.rawTransaction)
      .once('transactionHash', (txhash) => {

      })

    return true
  } catch (e) {

    return false
  }
}

async function getDocumentsByCreator(creatorAddress) {
  let clientWalletAddress = BankWalletAddress
  let clientPK = BankPrivateKey

  let web3 = getWeb3()
  web3.eth.accounts.privateKeyToAccount(clientPK)

  const contract = new web3.eth.Contract(DocABI, DOC_CONTRACT_ADDRESS, {
    from: clientWalletAddress,
  })

  try {
    const docs = await contract.methods.getDocumentsByCreator(creatorAddress).call()
    return docs
  } catch (e) {

    return []
  }
}
async function getDocumentsByParty(partyAddress) {
  let clientWalletAddress = BankWalletAddress
  let clientPK = BankPrivateKey

  let web3 = getWeb3()
  web3.eth.accounts.privateKeyToAccount(clientPK)

  const contract = new web3.eth.Contract(DocABI, DOC_CONTRACT_ADDRESS, {
    from: clientWalletAddress,
  })

  try {
    const docs = await contract.methods.getDocumentsByParty(partyAddress).call()
    return docs
  } catch (e) {

    return []
  }
}
// Helper function to convert ArrayBuffer to hex string
function bufferToHex(buffer: ArrayBuffer): string {
  const view = new DataView(buffer)
  let hexString = ''
  for (let i = 0; i < buffer.byteLength; i++) {
    hexString += view.getUint8(i).toString(16).padStart(2, '0')
  }
  return hexString
}

// getBankContract Address
async function getBankContractAddress(userId) {
  return BANK_CONTRACT_TOKEN_ADDRESS
}



export {
  getPropertyInfromationByToken,
  getInterest,
  register,
  pay,
  calculateDebt,
  borrow,
  test,
  getBalance,
  getInterestRate,
  getTransactionList,
  getPropertyFromVault,
  getBlockTime,
  getTokenUri,
  getBorrowAmount,
  getDataFromHash,
  getMMBalance,
  closeVault,
  getAllByVaultByUser,
  getDocumentsByCreator,
  getDocumentsByParty,
  getDocument,
  createDocument,
  verifyDocument,
  getAllByBankContractAndUser,
  getPropertyByVaultAddressToken,
  getInterestByBank,
  getNftOwner,
  getBankContractAddress,
  processVaultRegistrationAndDeposit
}
