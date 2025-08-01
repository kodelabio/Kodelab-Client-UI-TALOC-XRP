import {
  getHouseTokenContract,
  getHouseWrapperContract,
  getWrapTokenContract,
} from '../utils/getContract'
import { useContext } from 'react'
import { BASE_URL } from '@/constants'
import { CdpNftContext } from '@/providers/CdpNftProvider'
import store from '@/store'

export type NftInfo = {
  id: string
  wrapAddress: string
  isHolder: boolean
  nftAddress: string
}
export function useCdpNft() {
  return useContext(CdpNftContext)
}
export async function getUserNft() {
   const { walletAddress } = store.getState().user
  if (!walletAddress) return
  return new Promise<NftInfo[]>((resolve, reject) => {
    fetch(`${BASE_URL}/exec/getNftList?userWallet=${walletAddress}&pageSize=100`)
      .then((res) => {
        return res.json()
      })
      .then((res) => {
        const data = res.data.nftList
        if (Array.isArray(data)) {
          const list = data.map((item) => {
            return {
              id: item.tokenId,
              wrapAddress: item.wrapAddress.toLowerCase(),
              isHolder: item.wrapHolder === walletAddress,
              nftAddress: item.nftAddress,
            }
          })
          resolve(list)
        } else {
          throw Error()
        }
      })
      .catch((err) => {
        resolve([])
      })
  })
}

export function depositAndApprove(wrapAddress: string, proxyAddress: string) {
  const { contract } = getWrapTokenContract(wrapAddress)
  return contract.methods.depositAndApprove(proxyAddress).send()
}

export function approveNft(wrapAddress: string, nftId: string | number, nftAddress: string) {
  const { contract } = getHouseTokenContract(nftAddress)
  return contract.methods.approve(wrapAddress, nftId).send()
}

export async function queryApprove(
  wrapAddress: string,
  nftId: string | number,
  nftAddress: string,
) {
  const { contract } = getHouseTokenContract(nftAddress)
  const res = await contract.methods.getApproved(nftId).call()
   return res.toLowerCase() === wrapAddress
}

export function withdrawNft(wrapAddress: string) {
  const { contract } = getWrapTokenContract(wrapAddress)
  return contract.methods.withdraw().send()
}

export async function getWrapHolder(wrapAddress: string) {
  const { contract, address } = getHouseWrapperContract()
  const res = await contract.methods.getWrapHolder(wrapAddress).call()
  return res.toLowerCase() === address.toLowerCase()
}
