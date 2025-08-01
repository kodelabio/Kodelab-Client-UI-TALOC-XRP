import abiMap from '../contracts/abiMap'
import wethAbi from '../contracts/abis/WETH9.json'
import goerliAddresses from '../contracts/addresses/goerli.json'
import kovanAddresses from '../contracts/addresses/kovan.json'
import mainnetAddresses from '../contracts/addresses/mainnet.json'
import testnetAddresses from '../contracts/addresses/testnet.json'
import AuctionService from './AuctionService'
import CdpManager from './CdpManager'
import CdpTypeService from './CdpTypeService'
import SavingsService from './SavingsService'
import SystemDataService from './SystemDataService'
import { ServiceRoles as ServiceRoles_ } from './constants'
import { createCurrency, createCurrencyRatio } from '@makerdao/currency'
import assert from 'assert'
import BigNumber from 'bignumber.js'
import mapValues from 'lodash/mapValues'
import reduce from 'lodash/reduce'
import uniqBy from 'lodash/uniqBy'

export const ServiceRoles = ServiceRoles_
const { CDP_MANAGER, CDP_TYPE, SYSTEM_DATA, AUCTION, SAVINGS } = ServiceRoles

// look up contract ABIs using abiMap.
// if an exact match is not found, prefix-match against keys ending in *, e.g.
// MCD_JOIN_ETH_B matches MCD_JOIN_*
// this implementation assumes that all contracts in kovan.json are also in testnet.json
let addContracts = reduce(
  testnetAddresses,
  (result, testnetAddress, name) => {
    let abi = abiMap[name]
    if (!abi) {
      const prefix = Object.keys(abiMap).find(
        (k) =>
          k.substring(k.length - 1) == '*' &&
          k.substring(0, k.length - 1) == name.substring(0, k.length - 1),
      )
      if (prefix) abi = abiMap[prefix]
    }
    if (abi) {
      result[name] = {
        abi,
        address: {
          testnet: testnetAddress,
          kovan: kovanAddresses[name],
          goerli: goerliAddresses[name],
          mainnet: mainnetAddresses[name],
        },
      }
    }
    return result
  },
  {},
)

export const ETH = createCurrency('ETH')
export const MKR = createCurrency('MKR')
export const USD = createCurrency('USD')
export const USD_ETH = createCurrencyRatio(USD, ETH)

export const WETH = createCurrency('WETH')
export const DAI = createCurrency('DAI')

// Casting for savings dai
export const DSR_DAI = createCurrency('DSR-DAI')

export const REP = createCurrency('REP')
export const ZRX = createCurrency('ZRX')
export const KNC = createCurrency('KNC')
export const OMG = createCurrency('OMG')
export const BAT = createCurrency('BAT')
export const DGD = createCurrency('DGD')
export const GNT = createCurrency('GNT')
export const USDC = createCurrency('USDC')
export const WBTC = createCurrency('WBTC')
export const TUSD = createCurrency('TUSD')
export const MANA = createCurrency('MANA')
export const USDT = createCurrency('USDT')
export const PAXUSD = createCurrency('PAXUSD')
export const COMP = createCurrency('COMP')
export const LRC = createCurrency('LRC')
export const LINK = createCurrency('LINK')
export const YFI = createCurrency('YFI')
export const BAL = createCurrency('BAL')
export const GUSD = createCurrency('GUSD')
export const UNI = createCurrency('UNI')
export const RENBTC = createCurrency('RENBTC')
export const AAVE = createCurrency('AAVE')
export const UNIV2DAIETH = createCurrency('UNIV2DAIETH')
export const UNIV2WBTCETH = createCurrency('UNIV2WBTCETH')
export const UNIV2USDCETH = createCurrency('UNIV2USDCETH')
export const UNIV2DAIUSDC = createCurrency('UNIV2DAIUSDC')
export const UNIV2ETHUSDT = createCurrency('UNIV2ETHUSDT')
export const UNIV2LINKETH = createCurrency('UNIV2LINKETH')
export const UNIV2UNIETH = createCurrency('UNIV2UNIETH')
export const UNIV2WBTCDAI = createCurrency('UNIV2WBTCDAI')
export const UNIV2AAVEETH = createCurrency('UNIV2AAVEETH')
export const UNIV2DAIUSDT = createCurrency('UNIV2DAIUSDT')

export const HOT = createCurrency('HOT')
export const HOTT = createCurrency('HOTT')

export const nTKNA = createCurrency('nTKNA')
export const nTKNB = createCurrency('nTKNB')
export const nTKNC = createCurrency('nTKNC')
export const nTKND = createCurrency('nTKND')
export const nTKNE = createCurrency('nTKNE')
export const nTOKEN = createCurrency('nTOKEN')

export const nHT0002 = createCurrency('nHT0002')

export const defaultCdpTypes = [
  { currency: ETH, ilk: 'ETH-A', decimals: 18 },
  { currency: HOT, ilk: 'HOT-A', decimals: 18 },
  { currency: HOTT, ilk: 'HOTT-A', decimals: 18 },
  { currency: nTKNA, ilk: 'nTKNA-A', decimals: 0 },
  { currency: nTKNB, ilk: 'nTKNB-A', decimals: 0 },
  { currency: nTKNC, ilk: 'nTKNC-A', decimals: 0 },
  { currency: nTKND, ilk: 'nTKND-A', decimals: 0 },
  { currency: nTKNE, ilk: 'nTKNE-A', decimals: 0 },
  { currency: nTOKEN, ilk: 'nTOKEN-A', decimals: 0 },
  { currency: nHT0002, ilk: 'nHT0002-A', decimals: 0 },
]

export const SAI = createCurrency('SAI')

export const ALLOWANCE_AMOUNT = BigNumber(
  '0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff',
)

export const defaultTokens = [
  ...new Set([...defaultCdpTypes.map((type) => type.currency), DAI, WETH, SAI, DSR_DAI]),
]

export const McdPlugin = {
  addConfig: (_, { cdpTypes = defaultCdpTypes, addressOverrides, prefetch = true } = {}) => {
    // console.log(cdpTypes)
    if (addressOverrides) {
      // addContracts = mapValues(addContracts, (contractDetails, name) => ({
      //   ...contractDetails,
      //   address: addressOverrides[name] || contractDetails.address
      // }));
      // console.log(addressOverrides)
      let contractOverrides = reduce(
        addressOverrides,
        (result, address, name) => {
          let abi = abiMap[name]
          if (!abi) {
            if (!name.includes('_')) {
              abi = abiMap['MCD_DAI']
            } else {
              const prefix = Object.keys(abiMap).find(
                (k) =>
                  k.substring(k.length - 1) == '*' &&
                  k.substring(0, k.length - 1) == name.substring(0, k.length - 1),
              )
              if (prefix) abi = abiMap[prefix]
            }
          }
          if (abi) {
            result[name] = {
              abi,
              address,
            }
          }
          return result
        },
        {},
      )
      Object.assign(addContracts, contractOverrides)
      // console.log(addContracts)
    }
    const tokens = uniqBy(cdpTypes, 'currency').map(({ currency, address, abi, decimals }) => {
      const data = address && abi ? { address, abi } : addContracts[currency.symbol]
      assert(data, `No address and ABI found for "${currency.symbol}"`)
      return {
        currency,
        abi: data.abi,
        address: data.address,
        decimals: data.decimals || decimals,
      }
    })

    // console.log(tokens)

    // Set global BigNumber precision to enable exponential operations
    BigNumber.config({ POW_PRECISION: 100 })

    return {
      smartContract: { addContracts },
      token: {
        erc20: [
          { currency: DAI, address: addContracts.MCD_DAI.address },
          { currency: WETH, address: addContracts.ETH.address, abi: wethAbi },
          ...tokens,
        ],
      },
      additionalServices: [CDP_MANAGER, CDP_TYPE, AUCTION, SYSTEM_DATA, SAVINGS],
      [CDP_TYPE]: [CdpTypeService, { cdpTypes, prefetch }],
      [CDP_MANAGER]: CdpManager,
      [SAVINGS]: SavingsService,
      [AUCTION]: AuctionService,
      [SYSTEM_DATA]: SystemDataService,
    }
  },
}
export default McdPlugin
