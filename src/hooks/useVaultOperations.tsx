// @ts-nocheck
import { useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import { writeContract, readContract, waitForTransactionReceipt } from '@wagmi/core'
import { useAppKit } from '@reown/appkit/react'
import { parseEther } from 'viem'
import { config } from './../../config/wagmi'
import BankABI from './../api/abi/Bank.json'
import NFTABI from './../api/abi/NFT.json'
import EDABI from './../api/abi/ED.json'
import { message } from 'antd'
import { useAccount, useChainId, useSwitchChain } from 'wagmi'
import { xrplevmTestnet } from 'wagmi/chains'
import { useState } from 'react'
// processVaultRegistrationAndDeposit
import { processVaultRegistrationAndDeposit, register } from './../api/blockchain';
import { decodeEventLog } from 'viem';
import { estimateGas } from 'wagmi/actions'

export function useVaultOperations() {
  const BANK_CONTRACT_TOKEN_ADDRESS = import.meta.env.VITE_BANK_CONTRACT
  const ED_TOKEN_ADDRESS = import.meta.env.VITE_E_TOKEN_CONTRACT
  const DEFAULT_CHAIN_ID_NETWORK = Number(import.meta.env.VITE_DEFAULT_CHAIN_ID_NETWORK)

  const { address, isConnected ,connector } = useAccount()
  const { open } = useAppKit()
  const { writeContractAsync } = useWriteContract()

  const chainId = useChainId()
  const { switchChain } = useSwitchChain()

  const [transactionHash, setTransactionHash] = useState(null)
  const { data: receipt, isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash: transactionHash,
  })

  // Helper: Ensure wallet is connected
  const ensureWalletConnected = async () => {
    if (!isConnected || !address) {
      message.warning('Please connect your wallet first.')
      await open()
      return new Promise((resolve, reject) => {
        const checkConnection = setInterval(() => {
          if (isConnected && address) {
            clearInterval(checkConnection)
            resolve(true)
          }
        }, 100)
        setTimeout(() => {
          clearInterval(checkConnection)
          reject(new Error('Wallet connection timeout'))
        }, 30000)
      })
    }
    return true
  }

  // Helper: Ensure correct chain
  const ensureCorrectChain = async () => {
    if (chainId !== DEFAULT_CHAIN_ID_NETWORK) {
      try {
        await switchChain({ chainId: DEFAULT_CHAIN_ID_NETWORK })
        await new Promise(resolve => setTimeout(resolve, 1000))
      } catch (switchError) {
        throw new Error(`Please switch to ${DEFAULT_CHAIN_ID_NETWORK} network`)
      }
    }
  }

  // Helper: Validate wallet connection and ownership
  const validateWalletConnection = async (expectedAddress) => {
    await ensureWalletConnected()
    const connectedWallet = address.toLowerCase()
    const expectedWallet = expectedAddress.toLowerCase()
    if (connectedWallet !== expectedWallet) {
      throw new Error(`Wallet address does not match expected address (${expectedAddress})`)
    }
    return connectedWallet
  }

  // Error handler
  const handleError = (error) => {
    setTransactionHash(null)
    if (error.name === 'UserRejectedRequestError') {
      message.error('Transaction was rejected by user')
    } else if (error.name === 'ConnectorNotConnectedError') {
      message.error('Wallet not connected. Please connect your wallet.')
    } else if (error.message?.includes('User rejected')) {
      message.error('Transaction was rejected by user')
    } else if (error.message?.includes('insufficient funds')) {
      message.error('Insufficient funds for transaction')
    } else if (error.message?.includes('switch')) {
      message.error(error.message)
    } else if (error.message?.includes('Wallet connection timeout')) {
      message.error('Wallet connection timed out. Please try again.')
    } else {
      message.error(error.message || 'Transaction failed')
    }
  }

  // Borrow
  const borrow = async (property, amount) => {
    await ensureWalletConnected()
    try {
      if (!isConnected || !address) throw new Error('Wallet not connected. Please connect your wallet first.')
      await ensureCorrectChain()
      const clientWalletAddress = property['property']['properties']['ownerWalletAddress']
      if (address.toLowerCase() !== clientWalletAddress.toLowerCase()) {
        throw new Error(`Wallet address does not match property owner (${clientWalletAddress})`)
      }
      if (!BANK_CONTRACT_TOKEN_ADDRESS) throw new Error('Bank contract address not configured')
      if (!property.vatId) throw new Error('Property vault ID not found')
      if (!amount || isNaN(amount) || parseFloat(amount) <= 0) throw new Error('Invalid borrow amount')
      const amountWei = parseEther(amount.toString())
      const tokenID = property.vatId
      const hash = await writeContractAsync({
        address: BANK_CONTRACT_TOKEN_ADDRESS,
        abi: BankABI,
        functionName: 'borrow',
        args: [tokenID, amountWei],
        account: address,
        // Gas options:
        // gas: 500000n,              // Gas limit (as bigint)
        // gasPrice: 20000000000n,    // Gas price in wei (for legacy transactions)
        // value: 0,
        // gasMultiplier: 1.2,        // Increases estimated gas by 20%
      })
      message.info('Transaction submitted. Waiting for confirmation...')
      setTransactionHash(hash)
      const receipt = await waitForTransactionReceipt(config, { hash, timeout: 60000 })
      if (receipt.status === 'success') {
        setTransactionHash(null)
        return { success: true, hash, receipt }
      } else {
        throw new Error('Transaction failed')
      }
    } catch (error) {
      handleError(error)
      throw error
    }
  }

  // Pay/Repay
  const pay = async (property, amount) => {
    await ensureWalletConnected()
    try {
      await ensureCorrectChain()
      const clientWalletAddress = property['property']['properties']['ownerWalletAddress']
      if (address.toLowerCase() !== clientWalletAddress.toLowerCase()) {
        throw new Error(`Wallet address does not match property owner (${clientWalletAddress})`)
      }
      if (!BANK_CONTRACT_TOKEN_ADDRESS) throw new Error('Bank contract address not configured')
      if (!property.vatId) throw new Error('Property vault ID not found')
      if (!amount || isNaN(amount) || parseFloat(amount) <= 0) throw new Error('Invalid repay amount')

      const amountWei = parseEther(amount.toString())
      const tokenID = property.vatId

      // 1. Approve token spend
      message.info('Approving token spend...')
      await allowToken(ED_TOKEN_ADDRESS, BANK_CONTRACT_TOKEN_ADDRESS, amount)
      message.success('Token spend approved!')

      // 2. Call repay
      const hash = await writeContractAsync({
        address: BANK_CONTRACT_TOKEN_ADDRESS,
        abi: BankABI,
        functionName: 'repay',
        args: [tokenID, amountWei],
        account: address,
        // Gas options:
        // gas: 500000n,              // Gas limit (as bigint)
        // gasPrice: 20000000000n,    // Gas price in wei (for legacy transactions)
        // value: 0,
        // gasMultiplier: 1.2,
      })
      message.info('Repay transaction submitted. Waiting for confirmation...')
      setTransactionHash(hash)
      const receipt = await waitForTransactionReceipt(config, { hash, timeout: 60000 })
      setTransactionHash(null)
      if (receipt.status === 'success') {
        message.success('Payment transaction successful!')
        return { success: true, hash, receipt }
      } else {
        throw new Error('Transaction failed')
      }
    } catch (error) {
      setTransactionHash(null)
      handleError(error)
      throw error
    }
  }

  // Close Vault
  const closeVault = async (ownerAddress, vatID) => {
    await ensureWalletConnected()
    try {
      await ensureCorrectChain()
      if (address.toLowerCase() !== ownerAddress.toLowerCase()) {
        throw new Error(`Wallet address does not match property owner (${ownerAddress})`)
      }
      if (!BANK_CONTRACT_TOKEN_ADDRESS) throw new Error('Bank contract address not configured')
      if (!vatID) throw new Error('Vault ID not found')
      const hash = await writeContractAsync({
        address: BANK_CONTRACT_TOKEN_ADDRESS,
        abi: BankABI,
        functionName: 'close',
        args: [vatID],
        account: address,
        // Gas options:
        // gas: 500000n,              // Gas limit (as bigint)
        // gasPrice: 20000000000n,    // Gas price in wei (for legacy transactions)
        // value: 0,
        // gasMultiplier: 1.2,
      })
      message.info('Transaction submitted. Waiting for confirmation...')
      setTransactionHash(hash)
      const receipt = await waitForTransactionReceipt(config, { hash, timeout: 60000 })
      if (receipt.status === 'success') {
        setTransactionHash(null)
        message.success('Vault closed successfully!')
        return { success: true, hash, receipt }
      } else {
        throw new Error('Transaction failed')
      }
    } catch (error) {
      handleError(error)
      throw error
    }
  }

  const registerVault = async (property) => {

    await ensureWalletConnected();
    try {
      await ensureCorrectChain();
      const propertyOwnerWallet = property.properties.ownerWalletAddress;
      const tokenContract = property.contractAddress;
      const tokenId = property.tokenID;
      const ownedByBank = property.ownedByBank;

      if (ownedByBank) {
        const resp = await register(property)
        return resp;

      }


      if (address.toLowerCase() !== propertyOwnerWallet.toLowerCase()) {
        throw new Error(`Wallet address does not match property owner (${propertyOwnerWallet})`);
      }

      const numericValue = property.properties.approvedLoanAmount.replace(/,/g, '');
      const propertyAllowLoan = parseEther(numericValue);

      // Check if already approved
      message.info('Checking NFT approval status...');
      const alreadyApproved = await isAlreadyApproved(tokenContract, tokenId, BANK_CONTRACT_TOKEN_ADDRESS);

      if (!alreadyApproved) {
        message.info('Step 1/2: Requesting NFT approval...');
        const approveHash = await writeContractAsync({
          address: tokenContract,
          abi: NFTABI,
          functionName: 'approve',
          args: [BANK_CONTRACT_TOKEN_ADDRESS, tokenId],
          account: address,
          // // Gas options:
          // gas: 500000n,              // Gas limit (as bigint)
          // gasPrice: 20000000000n,    // Gas price in wei (for legacy transactions)
          // value: 0,
          // gasMultiplier: 1.2,
        });
        message.info('NFT approval transaction submitted. Waiting for confirmation...');
        const approveReceipt = await waitForTransactionReceipt(config, { hash: approveHash, timeout: 60000 });
        if (approveReceipt.status !== 'success') {
          throw new Error('NFT approval transaction failed');
        }
        message.success('✅ NFT approval confirmed!');
      } else {
        message.info('NFT already approved. Skipping approval step.');
      }

      // Register vault
      message.info('Step 2/2: Requesting vault registration...');
      const registerHash = await writeContractAsync({
        address: BANK_CONTRACT_TOKEN_ADDRESS,
        abi: BankABI,
        functionName: 'registerVaultByUser',
        args: [address, propertyAllowLoan, tokenContract, tokenId],
        account: address,
          // Gas options:
        // gas: 500000n,              // Gas limit (as bigint)
        // gasPrice: 20000000000n,    // Gas price in wei (for legacy transactions)
        // value: 0,
        // gasMultiplier: 1.2,   
      });
      message.info('Vault registration transaction submitted. Waiting for confirmation...');
      setTransactionHash(registerHash);
      const receipt = await waitForTransactionReceipt(config, { hash: registerHash, timeout: 100000 });
      setTransactionHash(null);

      if (receipt.status === 'success') {
        const log = receipt.logs.find(
          l => l.address.toLowerCase() === BANK_CONTRACT_TOKEN_ADDRESS.toLowerCase()
        );
        if (!log) throw new Error('Registered event not found');
        const decoded = decodeEventLog({
          abi: BankABI,
          data: log.data,
          topics: log.topics,
        });
        const { id, value } = decoded.args;

        // 1560000000000000000000000n
        await processVaultRegistrationAndDeposit(id, propertyAllowLoan);
      }
      //
      setTransactionHash(null);

      if (receipt.status === 'success') {
        message.success('🎉 Vault registered successfully!');
        return {
          success: true,
          hash: registerHash,
          receipt,
          message: 'Vault registered. Bank deposit will be processed separately.'
        };
      } else {
        throw new Error('Vault registration transaction failed');
      }
    } catch (error) {
      setTransactionHash(null);
      if (error.message.includes('expired')) {
        message.error('Your transaction request expired. Please try again and confirm promptly in your wallet.');
      } else {
        message.error(`Registration failed: ${error.message}`);
      }
      handleError(error);
      throw error;
    }
  };

  const isAlreadyApproved = async (tokenContract, tokenId, bankAddress) => {
    const approvedAddress = await readContract(config, {
      address: tokenContract,
      abi: NFTABI,
      functionName: 'getApproved',
      args: [tokenId],
      chainId: xrplevmTestnet.id, // or the numeric chain ID
    });
    return approvedAddress.toLowerCase() === bankAddress.toLowerCase();
  };
  const allowToken = async (tokenAddress, spenderAddress, amount) => {
    await ensureWalletConnected()
    try {
      await ensureCorrectChain()
      if (!tokenAddress) throw new Error('Token address is undefined')
      if (!spenderAddress) throw new Error('Spender address is undefined')
      if (!amount || isNaN(amount) || parseFloat(amount) <= 0) throw new Error('Invalid approve amount')

      const amountWei = parseEther(amount)

      // const hash = await writeContractAsync({
      //   address: "0xe4a5385b7416Dfc82e60dE4897edae75Fb349D44",
      //   abi: EDABI,
      //   functionName: 'approve',
      //   args: ["0x523bbC7A6b34e688eBE87f8774e0169FE6A1332f", "10000"],
      //   account: address,  
      //
      // })



      const hash = await writeContractAsync({
        address: ED_TOKEN_ADDRESS,
        abi: EDABI,
        functionName: 'approve',
        args: [BANK_CONTRACT_TOKEN_ADDRESS, amountWei],
        account: address,
        // Gas options:
        // gas: 500000n,              // Gas limit (as bigint)
        // gasPrice: 20000000000n,    // Gas price in wei (for legacy transactions)
        // value: 0,
        // gasMultiplier: 1.2,
      })

      message.info('Token approval submitted. Waiting for confirmation...')
      setTransactionHash(hash)

      const receipt = await waitForTransactionReceipt(config, { hash, timeout: 60000 })
      setTransactionHash(null)

      if (receipt.status === 'success') {
        message.success('Token approval successful!')
        return { success: true, hash, receipt }
      } else {
        throw new Error('Approval failed')
      }
    } catch (error) {
      setTransactionHash(null)
      handleError(error)
      throw error
    }
  }
  // Manual connect function for UI
  const connectWallet = async () => {
    try {
      await open()
    } catch (error) {
      message.error('Failed to open wallet connection modal')
      throw error
    }
  }

  return {
    borrow,
    pay,
    closeVault,
    registerVault,
    allowToken,
    connectWallet,
    isConfirming,
    isSuccess,
    isConnected,
    address,
    validateWalletConnection,
    ensureWalletConnected,
    handleError
  }
}