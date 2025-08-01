import { NETWORK_INFO } from './constants'
import goerliAddresses from './constants/contracts/goerli.json'
import mainnetAddresses from './constants/contracts/mainnet.json'
// import Maker from '@makerdao/dai'
// import McdPlugin, { ETH as _ETH, DAI as _DAI } from '@makerdao/dai-plugin-mcd'
import schemas from '@makerdao/dai-plugin-mcd/schemas'

const ETH =  "" //_ETH as unknown as CreatorFn
const DAI = "" //_DAI as unknown as CreatorFn

const addressOverrides: Record<string, { mainnet: string; goerli: string }> = [
  { network: 'mainnet', contracts: mainnetAddresses },
  { network: 'goerli', contracts: goerliAddresses },
].reduce((acc, { network, contracts }) => {
  for (const [contractName, contractAddress] of Object.entries(contracts)) {
    if (!acc[contractName]) acc[contractName] = {}
    acc[contractName][network] = contractAddress
  }
  return acc
}, {} as PlainObject)

type MakerConfig = {
  nftAddresses: PlainObject
  cdpTypes: {
    currency: CreatorFn
    ilk: string
    decimals: number
  }[]
}
export async function instantiateMaker({ nftAddresses, cdpTypes }: MakerConfig) {
  if (nftAddresses) {
    for (const i in nftAddresses) {
      addressOverrides[i] = {
        goerli: nftAddresses[i],
        mainnet: nftAddresses[i],
      }
    }
  }
  const config = {
    log: true,
    plugins: [
      [
        // McdPlugin,
        {
          cdpTypes,
          prefetch: false,
          addressOverrides,
        },
      ],
    ],
    smartContract: {
      addressOverrides,
    },
    provider: {
      url: NETWORK_INFO.wsRpcUrl,
      type: 'WEBSOCKET',
    },
    web3: {
      pollingInterval: null,
    },
    gas: {
      apiKey: '3e722dd73e76ba3d2eb7507e316727db8a71d1fbc960ed1018e999a53f75',
    },
    multicall: true,
  }

  const maker =  null;// await Maker.create('http', config)

  // Register multicall schemas and map useObservable hook to watch convenience helper
  // const multicall = maker.service('multicall')
  // multicall.registerSchemas({ ...schemas })
  const watcher = null  //multicall.createWatcher({ interval: 'block' })
  // multicall.start()
  return { maker, watcher }
}

export { DAI, ETH }
