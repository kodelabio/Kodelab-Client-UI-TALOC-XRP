import { createContext, ReactNode, useEffect, useMemo, useRef, useState } from 'react'
import { BASE_URL } from '@/constants'
import { createCurrency } from '@makerdao/currency'
import { useMount } from 'ahooks'

export type Cdptype = {
  currency: CreatorFn
  ilk: string
  decimals: number
}

type NftData = {
  ilkName: string
  spellAddress: string
  tokenAddress: string
  pipAddress: string
  joinAddress: string
  flipAddress: string
  status: number
}

export const CdpNftContext = createContext<{
  cdpTypes: Cdptype[]
  ilkList: CdpData[]
  nftAddresses: PlainObject<string>
}>({ cdpTypes: [], ilkList: [], nftAddresses: {} })

export default ({ children }: { children: ReactNode }) => {
  const localData = sessionStorage.getItem('ilkData')
  const [nftList, setNftList] = useState<NftData[]>(localData ? JSON.parse(localData) : [])

  const { cdpTypes, ilkList, nftAddresses } = useMemo(() => {
    const cdpTypes: Cdptype[] = []
    const ilkList: CdpData[] = []
    const nftAddresses: PlainObject = {}
    nftList.forEach((item) => {
      const key = item.ilkName
      if (key.includes('_') || key.includes('-') || item.status !== 5) return
      const currency = createCurrency(key)
      cdpTypes.push({
        currency,
        ilk: `${key}-A`,
        decimals: 0,
      })

      ilkList.push({
        slug: `${key}-a`, // URL param
        symbol: `${key}-A`, // how it's displayed in the UI
        key: `${key}-A`, // the actual ilk name used in the vat
        gem: key, // the actual asset that's being locked
        currency, // the associated dai.js currency type
        networks: ['goerli', 'mainnet'],
        wrapAddress: item.tokenAddress.toLowerCase(),
      })

      const obj = {
        [key]: item.tokenAddress,
        [`VAL_${key}`]: item.pipAddress,
        [`PIP_${key}`]: item.pipAddress,
        [`MCD_JOIN_${key}_A`]: item.joinAddress,
        [`MCD_FLIP_${key}_A`]: item.flipAddress,
      }
      Object.assign(nftAddresses, obj)
    })

    return { cdpTypes, ilkList, nftAddresses }
  }, [nftList])

  function sleep(time: number) {
    return new Promise((resolve) => {
      setTimeout(resolve, time)
    })
  }
  const loadCount = useRef(0)
  const getData = async () => {
    if (loadCount.current) {
      await sleep(5000)
    }
    loadCount.current++
    // fetch(`${BASE_URL}/ilk/getIlkList`)
    //   .then((res) => res.json())
    //   .then((res) => {
    //     const list = res.data.ilkList
    //     if (list) {
    //       sessionStorage.setItem('ilkList', JSON.stringify(list))
    //       setNftList(res.data.ilkList)
    //     }
    //   })
    //   .catch(getData)
  }

  useMount(getData)

  return (
    <CdpNftContext.Provider value={{ cdpTypes, nftAddresses, ilkList }}>
      {children}
    </CdpNftContext.Provider>
  )
}
