import BigNumber_ from 'bignumber.js'

declare global {
  type BigNumber = BigNumber_
  type PlainObject<T = any> = Record<string, T>

  class Currency extends BigNumber_ {
    _amount: BigNumber
    symbol: string
    constructor(amount: string | number, shift?: string | number)
    isEqual(other: Currency): boolean
    toString(decimals?: number, keepSymbol?: boolean): string
    toBigNumber(): BigNumber
    toNumber(): number
    toFixed(shift?: string | number): string
    isSameType(other: Currency): boolean
  }

  class CurrencyX extends Currency {
    type: ReturnType<typeof createCurrency>
  }

  class CurrencyRatio extends Currency {
    constructor(
      amount: string | number,
      numerator: CreatorFn,
      denominator: CreatorFn,
      shift?: string | number,
    )
    numerator: CreatorFn
    denominator: CreatorFn
  }

  interface CreatorFn {
    (amount: string | number | BigNumber, shift?: string | number): CurrencyX
  }

  interface CollateralTypeData {
    annualStabilityFee: BigNumber
    calculateCollateralizationRatio: (
      collateralAmount: CurrencyX | BigNumber,
      debtValue: CurrencyX | BigNumber,
    ) => CurrencyRatio
    calculateMaxDai: (collateralAmount: BigNumber) => BigNumber
    calculateliquidationPrice: (collateralAmount: CurrencyX, debtValue: CurrencyX) => CurrencyRatio
    collateralDebtAvailable: CurrencyX
    collateralTypePrice: CurrencyRatio
    debtFloor: BigNumber
    liquidationPenalty: BigNumber
    liquidationRatio: CurrencyRatio
    priceWithSafetyMargin: BigNumber
    symbol: string
  }

  interface CdpData {
    slug: string
    symbol: string
    key: string
    gem: string
    currency: CreatorFn
    networks: string[]
    wrapAddress: string
  }

  interface VaultData {
    id: number
    annualStabilityFee: BigNumber
    calculateCollateralizationRatio: (params: {
      collateralValue?: CurrencyX | BigNumber
      debtValue?: CurrencyX | BigNumber
    }) => CurrencyRatio
    calculateLiquidationPrice: (params: {
      collateralValue?: CurrencyX | BigNumber
      debtValue?: CurrencyX | BigNumber
      liquidationRatio?: CurrencyRatio
    }) => CurrencyRatio
    collateralAmount: CurrencyX
    collateralAvailableAmount: CurrencyX
    collateralAvailableValue: CurrencyX
    collateralDebtAvailable: CurrencyX
    collateralTypePrice: CurrencyX
    collateralValue: CurrencyX
    collateralizationRatio: CurrencyRatio
    daiAvailable: CurrencyX
    debtFloor: BigNumber
    debtValue: CurrencyX
    encumberedCollateral: BigNumber
    encumberedDebt: BigNumber
    externalOwnerAddress: string
    liquidationPenalty: BigNumber
    liquidationPrice: CurrencyRatio
    liquidationRatio: CurrencyRatio
    minSafeCollateralAmount: CurrencyX
    ownerAddress: string
    unlockedCollateral: BigNumber
    vaultAddress: string
    vaultType: string
  }

  interface SavingData {
    daiLockedInDsr: BigNumber
    daiSavingsRate: BigNumber
    dateEarningsLastAccrued: Date
    savingsDai: BigNumber
    savingsRateAccumulator: BigNumber
    annualDaiSavingsRate?: BigNumber
    fetchedSavings?: boolean
    proxyAddress?: string | undefined
  }
}
