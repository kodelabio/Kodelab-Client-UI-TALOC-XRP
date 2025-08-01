import useActionState from './useActionState'
import { depositAndApprove } from './useCdpNft'
import useMaker from './useMaker'
import { watch } from './useObservable'
import { useState } from 'react'
import BigNumber from 'bignumber.js'

function toNumberDecimals(value: string | number, decimals = 18) {
  const tenPowDecimals = new BigNumber(10).pow(decimals)
  return new BigNumber(value).div(tenPowDecimals).toFixed(10)
}
export default function useTokenAllowance(tokenSymbol: string, wrapTokenAddress?: string) {
  const { maker, account } = useMaker()
  const proxyAddress = watch.proxyAddress(account?.address)
  const allowance = watch.tokenAllowance(account?.address, proxyAddress || undefined, tokenSymbol)

  const hasFetchedAllowance = proxyAddress === null || allowance !== undefined
  const hasAllowance =
    tokenSymbol === 'ETH' || (allowance !== undefined && allowance !== null && !allowance.eq(0))

  const hasSufficientAllowance = (value: string | number, decimals = 18) => {
    value = value || 0
    return parseFloat(String(value)) <= +toNumberDecimals(allowance, decimals)
    // return BigNumber(value).isLessThanOrEqualTo(allowance);
  }

  const [startedWithoutAllowance, setStartedWithoutAllowance] = useState(false)
  const [setAllowance, allowanceLoading, , allowanceErrors] = useActionState(async () => {
    const token = maker.getToken(tokenSymbol)
    let txPromise
    if (wrapTokenAddress) {
      txPromise = depositAndApprove(wrapTokenAddress, proxyAddress)
    } else {
      txPromise = token.approveUnlimited(proxyAddress)
    }
    setStartedWithoutAllowance(true)
    return await txPromise
  })

  return {
    proxyAddress,
    hasAllowance,
    hasFetchedAllowance,
    setAllowance,
    allowanceLoading,
    allowanceErrors,
    startedWithoutAllowance,
    allowance,
    hasSufficientAllowance,
  }
}
