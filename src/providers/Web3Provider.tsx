import { createAppKit } from '@reown/appkit/react'
import React, { useState } from 'react'

import { WagmiProvider } from 'wagmi'
import { xrplevmTestnet } from '@reown/appkit/networks'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { WagmiAdapter } from '@reown/appkit-adapter-wagmi'

// 0. Setup queryClient
const queryClient = new QueryClient()

// 1. Get projectId from https://cloud.reown.com

const projectId =  import.meta.env.VITE_PUBLIC_PROJECT_ID 


const defaultChainId = Number(import.meta.env.VITE_DEFAULT_CHAIN_ID_NETWORK);




// 2. Create a metadata object - optional
const metadata = {
  name: 'Taloc',
  description: 'Taloc KC',
  url: 'https://taloc.kodelab.io/', // origin must match your domain & subdomain
  icons: ['https://taloc.kodelab.io/kc/kodelab.svg']
}

// 3. Define XRP Mainnet custom chain
const xrpMainnet = {
  id: 1440000,
  name: 'XRPL EVM Sidechain',
  nativeCurrency: {
    decimals: 18,
    name: 'XRP',
    symbol: 'XRP',
  },
  rpcUrls: {
    default: {
      http: ['https://rpc.xrplevm.org'],
    },
    public: {
      http: ['https://rpc.xrplevm.org'],
    },
  },
  blockExplorers: {
    default: {
      name: 'XRPL EVM Explorer',
      url: 'https://explorer.xrplevm.org',
    },
  },
  testnet: false,
}


// 4. Set the networks (including both testnet and mainnet)
const allNetworks = [xrpMainnet,xrplevmTestnet]

// Only keep the network that matches the default chain ID
const networks = allNetworks.filter(net => net.id === defaultChainId);

// 5. Create Wagmi Adapter
const wagmiAdapter = new WagmiAdapter({
  networks,
  projectId,
  ssr: true
})

// 6. Create modal
const modal = createAppKit({
  adapters: [wagmiAdapter],
  networks,
  projectId,
  metadata,
  features: {
    walletConnect: true,
    walletLink: false,
    walletConnectV2: true,
  }
})

// 7. Connect and disconnect methods
async function connect() {
  try {

    modal.open()
  } catch (error) {

  }
}

async function disconnect() {
  try {

    await modal.disconnect()

  } catch (error) {

  }
}

// 8. Additional utility methods
const getConnectionState = () => {
  return modal.getState()
}

const getAccount = () => {
  return modal.getAccount()
}

export function AppKitProvider({ children }) {
  return (
    <WagmiProvider config={wagmiAdapter.wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </WagmiProvider>
  )
}

// Export the methods for use in components
export { connect, disconnect, getConnectionState, getAccount, modal }