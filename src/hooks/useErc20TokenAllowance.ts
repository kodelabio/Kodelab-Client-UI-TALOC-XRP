import { useCallback, useEffect, useState } from 'react'
import { fromWei, toWei } from '@/utils'
import { getErc20Contract } from '@/utils/getContract'

export default (tokenAddress: string, approveAddress: string, amount: number | string) => {
  const [hasAllowance, setHasAllowance] = useState(!amount)
  const [allowanceLoading, setAllowanceLoading] = useState(false)

  const queryAllowance = useCallback(async () => {
    const { contract, address } = getErc20Contract(tokenAddress)
    const limit = await contract.methods.allowance(address, approveAddress).call()
    const res = +fromWei(limit) >= +amount
    setHasAllowance(res)
  }, [amount, approveAddress, tokenAddress])

  useEffect(() => {
    queryAllowance()
  }, [queryAllowance])

  const setAllowance = useCallback(() => {
    const { contract } = getErc20Contract(tokenAddress)
    const value = toWei(String(amount))
    return new Promise((resolve, reject) => {
      setAllowanceLoading(true)
      contract.methods
        .approve(approveAddress, value)
        .send()
        .then(() => {
          setHasAllowance(true)
          resolve(true)
        })
        .catch(() => {
          reject()
        })
        .finally(() => {
          setAllowanceLoading(false)
        })
    })
  }, [amount, approveAddress, tokenAddress])

  return {
    hasAllowance,
    allowanceLoading,
    setAllowance,
  }
}

export async function approve(
  tokenAddress: string,
  approveAddress: string,
  amount: number | string,
) {
  const { contract } = getErc20Contract(tokenAddress)
  const value = toWei(String(amount))
  return contract.methods.approve(approveAddress, value).send()
}

export async function allowance(
  tokenAddress: string,
  approveAddress: string,
  amount: number | string,
) {
  const { contract, address } = getErc20Contract(tokenAddress)
  const limit = await contract.methods.allowance(address, approveAddress).call()
  const limitAmount = fromWei(limit)
  return +limitAmount >= +amount
}
