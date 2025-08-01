import { abiAddresses } from '@/constants'
import DSPROXY_ABI from '@/constants/abi/DSProxy.json'
import DSR_ABI from '@/constants/abi/DssSavingReward.json'
import ERC20_ABI from '@/constants/abi/Erc20.json'
import HOUSE_TOKEN_ABI from '@/constants/abi/HouseToken.json'
import HOUSE_WRAPPER_ABI from '@/constants/abi/HouseWrapper.json'
import INCENTIVE_ABI from '@/constants/abi/Incentive.json'
import MCD_ADM_ABI from '@/constants/abi/MCD_ADM.json'
import MCD_JUG_ABI from '@/constants/abi/MCD_JUG.json'
import MCD_VAT_ABI from '@/constants/abi/MCD_VAT.json'
import PROXY_ACTIONS_ABI from '@/constants/abi/ProxyActions.json'
import SPELL_RIGEST_ABI from '@/constants/abi/SPELL_RIGEST.json'
import WRAP_TOKEN_ABI from '@/constants/abi/WrapToken.json'
import {
  HouseToken,
  HouseWrapper,
  Erc20,
  WrapToken,
  DssSavingReward,
  SPELL_RIGEST,
  MCD_ADM,
  Incentive,
  MCD_JUG,
  ProxyActions,
  MCD_VAT,
  DSProxy,
} from '@/constants/abi/types'
import store from '@/store'

export function getContract<T = any>(abi: any, contractAddress: string) {
  const { web3, walletAddress } = store.getState().user
  if (!web3) {
    throw new Error('Not found Web3')
  }
  if (!contractAddress) {
    throw new Error('Not found contract address')
  }
  return {
    web3,
    contract: new web3.eth.Contract(abi, contractAddress, {
      from: walletAddress,
    }) as any as T,
    address: walletAddress,
  }
}

export function getErc20Contract(contractAddress: string) {
  return getContract<Erc20>(ERC20_ABI, contractAddress)
}

export function getHouseTokenContract(contractAddress: string) {
  return getContract<HouseToken>(HOUSE_TOKEN_ABI, contractAddress)
}

export function getHouseWrapperContract() {
  return getContract<HouseWrapper>(HOUSE_WRAPPER_ABI, abiAddresses.HouseWrapper)
}

export function getSpellContract() {
  return getContract<SPELL_RIGEST>(SPELL_RIGEST_ABI, abiAddresses.SPELL_RIGEST)
}

export function getWrapTokenContract(contractAddress: string) {
  return getContract<WrapToken>(WRAP_TOKEN_ABI, contractAddress)
}

export function getDsrContract() {
  return getContract<DssSavingReward>(DSR_ABI, abiAddresses.DssSavingReward)
}

export function getAdmContract() {
  return getContract<MCD_ADM>(MCD_ADM_ABI, abiAddresses.MCD_ADM)
}

export function getIncentiveContract() {
  return getContract<Incentive>(INCENTIVE_ABI, abiAddresses.Incentive)
}

export function getJugContract() {
  return getContract<MCD_JUG>(MCD_JUG_ABI, abiAddresses.MCD_JUG)
}

export function getProxyActionsContract() {
  return getContract<ProxyActions>(PROXY_ACTIONS_ABI, abiAddresses.PROXY_ACTIONS)
}

export function getVatContract() {
  return getContract<MCD_VAT>(MCD_VAT_ABI, abiAddresses.MCD_VAT)
}

export function getPoxyContract(contractAddress: string) {
  return getContract<DSProxy>(DSPROXY_ABI, contractAddress)
}
