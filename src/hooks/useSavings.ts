import BigNumber from 'bignumber.js'
import { watch } from '@/hooks/useObservable'

const initialState = {
  proxyAddress: undefined,
  annualDaiSavingsRate: new BigNumber(0),
  daiSavingsRate: new BigNumber(1),
  dateEarningsLastAccrued: new Date(),
  daiLockedInDsr: new BigNumber(0),
  fetchedSavings: false,
  savingsRateAccumulator: new BigNumber(0),
  savingsDai: new BigNumber(0),
}

function useSavings(address: string) {
  const savings: SavingData = watch.savings(address)
  return savings === undefined
    ? initialState
    : {
        ...savings,
        fetchedSavings: true,
        daiLockedInDsr: (savings.daiLockedInDsr as CurrencyX)?.toBigNumber(),
      }
}

export default useSavings
