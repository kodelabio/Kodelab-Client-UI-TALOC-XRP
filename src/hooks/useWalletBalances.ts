import useMaker from './useMaker'
import { watch } from './useObservable'
import { useMemo } from 'react'
import BigNumber from 'bignumber.js'

const useWalletBalances = () => {
  const { account = { address: '' }, ilkList } = useMaker()

  const newshowWalletTokens = useMemo(() => {
    return ['ETH', 'DAI'].concat(ilkList.map((item: PlainObject) => item.gem))
  }, [ilkList])
  const defaultValues = newshowWalletTokens.reduce((acc, token) => {
    acc[token] = new BigNumber(0)
    return acc
  }, {} as PlainObject)
  const symbols = newshowWalletTokens.filter((v) => v !== 'DSR')
  const dsrBalance = watch.daiLockedInDsr?.(account?.address)
  const tokenBalances = watch.tokenBalances?.(account?.address, symbols)

  return (tokenBalances?.reduce(
    (acc: PlainObject, tokenBalance: PlainObject) => {
      acc[tokenBalance.symbol] = tokenBalance.toBigNumber()
      return acc
    },
    { DSR: dsrBalance?.toBigNumber() },
  ) || defaultValues) as PlainObject<BigNumber>
}

export default useWalletBalances
