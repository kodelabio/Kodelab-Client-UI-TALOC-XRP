import useMaker from './useMaker'
import { watch } from './useObservable'
import { NETWORK_INFO } from '@/constants'

type CellingType = PlainObject<CurrencyX> | undefined
type DataType = {
  cdpTypes: CdpData[]
  cdpTypesList: string[]
  gemTypeList: string[]
}
export default function useCdpTypes() {
  const data: DataType = {
    cdpTypes: [],
    cdpTypesList: [],
    gemTypeList: [],
  }
  const { ilkList } = useMaker()

  const types = ilkList.filter((ilk) => ilk.networks.includes(NETWORK_INFO.name))
  const debtAvailableList: CellingType = watch.collateralDebtAvailableList(
    types.map((type) => type.symbol),
  )

  const ceilings: CellingType = watch.collateralDebtCeilings(types.map((type) => type.symbol))

  // console.log(ceilings, 'ceilings')
  // console.log(debtAvailableList, 'debtAvailableList')

  if (!ceilings || !debtAvailableList) return data

  const cdpTypesWithNonZeroDebtCeilings: string[] = Object.entries(ceilings).reduce(
    (acc, [type, ceiling]) => {
      // console.log(type, ceiling.toNumber())
      if (ceiling.gt(0) || !debtAvailableList[type as keyof typeof debtAvailableList].eq(0))
        return [...acc, type]
      return acc
    },
    [] as string[],
  )

  const cdpTypes = types.reduce((acc, type) => {
    if (cdpTypesWithNonZeroDebtCeilings.some((t) => type.symbol === t)) return [...acc, type]
    return acc
  }, [] as CdpData[])

  const cdpTypesList = cdpTypes.reduce((acc, type) => {
    if (!acc.includes(type.key)) acc.push(type.key)
    return acc
  }, [] as string[])

  return { cdpTypes, cdpTypesList } as DataType
}
