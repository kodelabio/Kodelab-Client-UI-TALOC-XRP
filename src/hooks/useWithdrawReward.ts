import useWeb3 from './useWeb3'
import { useState } from 'react'
import { getIncentiveContract } from '@/utils/getContract'
import { request, ResponseType } from '@/utils/request'

type Params = {
  amount: number | string
  contract_address: string
  user_address: string
  coin_type: string
  timestamp: number
}

type SignRes = {
  signs: { hash: string }[]
  expected_expiration: number
}
async function getSigns(params: Params) {
  const { data: signData } = await request.post<ResponseType<SignRes>>(`/sign`, params)
  return {
    ...signData.data,
    signs: signData.data.signs.map((item) => item.hash),
  }
}

export function withdrawToken(
  amount: string,
  signList: string[],
  expiration: number,
  contractAddr: string,
) {
  const { contract, web3, address } = getIncentiveContract()

  const v: string[] = []
  const rs: string[] = []
  signList.forEach((item) => {
    v.push(Number('0x' + item.slice(130, 132)).toString(10))
    rs.push(item.slice(0, 66), '0x' + item.slice(66, 130))
  })
  return contract.methods
    .withdrawToken(
      [address, contractAddr],
      [web3.utils.toWei(String(amount)), String(expiration)],
      v,
      rs,
    )
    .send()
}

export enum Status {
  Init,
  SignIng,
  WaitConfirm,
  Success,
  Failed,
}

export function useWithdrawReward() {
  const { walletAddress } = useWeb3()
  const [status, setStatus] = useState(Status.Init)
  async function withdraw(amount: string | number, contract_address: string, coin_type: string) {
    try {
      setStatus(Status.SignIng)
      const { signs, expected_expiration } = await getSigns({
        amount,
        coin_type,
        contract_address,
        timestamp: Math.floor(+new Date() / 1000) + 60 * 15,
        user_address: walletAddress,
      })
      setStatus(Status.WaitConfirm)
      await withdrawToken(String(amount), signs, expected_expiration, contract_address)
      setStatus(Status.Success)
    } catch (error) {

      setStatus(Status.Failed)
      throw error
    }
  }
  return {
    status,
    withdraw,
  }
}
