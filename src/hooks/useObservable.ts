/* eslint-disable react-hooks/rules-of-hooks */
import useMaker from './useMaker'
import { useEffect, useState } from 'react'

const useObservable = (key: string, ...args: any[]) => {
  const { maker } = useMaker()
  const multicall = maker?.service('multicall')
  const [value, setValue] = useState<any>()

  useEffect(() => {
    if (!maker || !multicall.watcher) return
    if (args.findIndex((arg) => typeof arg === 'undefined') !== -1) return
    const sub = multicall.watch(key, ...args).subscribe?.({
      next: (val: any) => {
        setValue(val)
      },
      error: () => {
        setValue(undefined)
      },
    })

    return () => {
      sub.unsubscribe()
      setValue(undefined)
    }
    // eslint-disable-next-line
  }, [
    maker,
    multicall?.watcher,
    key,
    // eslint-disable-next-line react-hooks/exhaustive-deps
    ...args.map((arg) => (typeof arg === 'object' ? JSON.stringify(arg) : arg)),
  ])

  return value
}

export const watch = {
  totalEncumberedDebt: (...args: any) => useObservable('totalEncumberedDebt', ...args),
  debtScalingFactor: (...args: any) => useObservable('debtScalingFactor', ...args),
  priceWithSafetyMargin: (...args: any) => useObservable('priceWithSafetyMargin', ...args),
  debtCeiling: (...args: any) => useObservable('debtCeiling', ...args),
  debtFloor: (...args: any) => useObservable('debtFloor', ...args),
  totalDaiSupply: (...args: any) => useObservable('totalDaiSupply', ...args),
  encumberedCollateral: (...args: any) => useObservable('encumberedCollateral', ...args),
  encumberedDebt: (...args: any) => useObservable('encumberedDebt', ...args),
  unlockedCollateral: (...args: any) => useObservable('unlockedCollateral', ...args),
  globalDebtCeiling: (...args: any) => useObservable('globalDebtCeiling', ...args),
  priceFeedAddress: (...args: any) => useObservable('priceFeedAddress', ...args),
  liquidationRatio: (...args: any) => useObservable('liquidationRatio', ...args),
  ratioDaiUsd: (...args: any) => useObservable('ratioDaiUsd', ...args),
  proxyAddress: (...args: any) => useObservable('proxyAddress', ...args),
  vaultAddress: (...args: any) => useObservable('vaultAddress', ...args),
  vaultType: (...args: any) => useObservable('vaultType', ...args),
  vaultsCreated: (...args: any) => useObservable('vaultsCreated', ...args),
  vaultOwner: (...args: any) => useObservable('vaultOwner', ...args),
  annualStabilityFee: (...args: any) => useObservable('annualStabilityFee', ...args),
  dateStabilityFeesLastLevied: (...args: any) =>
    useObservable('dateStabilityFeesLastLevied', ...args),
  baseCollateralFee: (...args: any) => useObservable('baseCollateralFee', ...args),
  totalSavingsDai: (...args: any) => useObservable('totalSavingsDai', ...args),
  savingsDai: (...args: any) => useObservable('savingsDai', ...args),
  daiSavingsRate: (...args: any) => useObservable('daiSavingsRate', ...args),
  dateEarningsLastAccrued: (...args: any) => useObservable('dateEarningsLastAccrued', ...args),
  savingsRateAccumulator: (...args: any) => useObservable('savingsRateAccumulator', ...args),
  annualDaiSavingsRate: (...args: any) => useObservable('annualDaiSavingsRate', ...args),
  userVaultsList: (...args: any) => useObservable('userVaultsList', ...args),
  userVaultIds: (...args: any) => useObservable('userVaultIds', ...args),
  userVaultAddresses: (...args: any) => useObservable('userVaultAddresses', ...args),
  userVaultTypes: (...args: any) => useObservable('userVaultTypes', ...args),
  collateralValue: (...args: any) => useObservable('collateralValue', ...args),
  userVaultsData: (...args: any) => useObservable('userVaultsData', ...args),
  collateralDebtAvailableList: (...args: any) =>
    useObservable('collateralDebtAvailableList', ...args),
  collateralDebtCeilings: (...args: any) => useObservable('collateralDebtCeilings', ...args),
  daiLockedInDsr: (...args: any) => useObservable('daiLockedInDsr', ...args),
  tokenBalances: (...args: any) => useObservable('tokenBalances', ...args),
  liquidatorAddress: (...args: any) => useObservable('liquidatorAddress', ...args),
  liquidationPenalty: (...args: any) => useObservable('liquidationPenalty', ...args),
  maxAuctionLotSize: (...args: any) => useObservable('maxAuctionLotSize', ...args),
  collateralTypePrice: (...args: any) => useObservable('collateralTypePrice', ...args),
  collateralTypesPrices: (...args: any) => useObservable('collateralTypesPrices', ...args),
  defaultCollateralTypesPrices: (...args: any) =>
    useObservable('defaultCollateralTypesPrices', ...args),
  vaultTypeAndAddress: (...args: any) => useObservable('vaultTypeAndAddress', ...args),
  vaultExternalOwner: (...args: any) => useObservable('vaultExternalOwner', ...args),
  vaultCollateralAndDebt: (...args: any) => useObservable('vaultCollateralAndDebt', ...args),
  vault: (...args: any) => useObservable('vault', ...args),
  collateralAmount: (...args: any) => useObservable('collateralAmount', ...args),
  debtValue: (...args: any) => useObservable('debtValue', ...args),
  collateralizationRatio: (...args: any) => useObservable('collateralizationRatio', ...args),
  liquidationPrice: (...args: any) => useObservable('liquidationPrice', ...args),
  daiAvailable: (...args: any) => useObservable('daiAvailable', ...args),
  minSafeCollateralAmount: (...args: any) => useObservable('minSafeCollateralAmount', ...args),
  collateralAvailableAmount: (...args: any) => useObservable('collateralAvailableAmount', ...args),
  collateralAvailableValue: (...args: any) => useObservable('collateralAvailableValue', ...args),
  totalDaiLockedInDsr: (...args: any) => useObservable('totalDaiLockedInDsr', ...args),
  balance: (...args: any) => useObservable('balance', ...args),
  allowance: (...args: any) => useObservable('allowance', ...args),
  savings: (...args: any) => useObservable('savings', ...args),
  collateralDebt: (...args: any) => useObservable('collateralDebt', ...args),
  collateralTypeCollateralization: (...args: any) =>
    useObservable('collateralTypeCollateralization', ...args),
  systemCollateralization: (...args: any) => useObservable('systemCollateralization', ...args),
  systemCollateralizationValue: (...args: any) =>
    useObservable('systemCollateralizationValue', ...args),
  proxyOwner: (...args: any) => useObservable('proxyOwner', ...args),
  collateralTypeData: (...args: any) => useObservable('collateralTypeData', ...args),
  collateralTypesData: (...args: any) => useObservable('collateralTypesData', ...args),
  collateralDebtAvailable: (...args: any) => useObservable('collateralDebtAvailable', ...args),
  tokenURI: (...args: any) => useObservable('tokenURI', ...args),
  tokenBalance: (...args: any) => useObservable('tokenBalance', ...args),
  tokenAllowanceBase: (...args: any) => useObservable('tokenAllowanceBase', ...args),
  adapterBalance: (...args: any) => useObservable('adapterBalance', ...args),
  tokenAllowance: (...args: any) => useObservable('tokenAllowance', ...args),
  emergencyShutdownActive: (...args: any) => useObservable('emergencyShutdownActive', ...args),
  emergencyShutdownTime: (...args: any) => useObservable('emergencyShutdownTime', ...args),
  tokenPriceLastUpdate: (...args: any) => useObservable('tokenPriceLastUpdate', ...args),
  tokenPriceUpdateInterval: (...args: any) => useObservable('tokenPriceUpdateInterval', ...args),
  tokenPriceNextUpdate: (...args: any) => useObservable('tokenPriceNextUpdate', ...args),
  tokenPricesNextUpdates: (...args: any) => useObservable('tokenPricesNextUpdates', ...args),
}

export default useObservable
