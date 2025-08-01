import DSRInfo from './components/DsrInfo'
import History from './components/History'
import PropertyDashboard from './components/PropertyDashboard'
import PropertySelection from './components/PropertySelection'
import { useEffect, useMemo, useState, useCallback } from 'react'
import { Navigate, Route, Routes, useLocation } from 'react-router-dom'
 import { BASE_URL } from '@/constants'
import { RAY } from '@/constants'
import { fromWei, hideLoading, showLoading } from '@/utils'
import BigNumber from 'bignumber.js'
import Header from '@/components/Header'
import Property from '@/components/PropertyCard'
import BankSideBar from '@/components/BankSideBar'
import useUserMangement from '@/hooks/useUserMangement'
import useVaults from '@/hooks/useVaults'
import useWeb3 from '@/hooks/useWeb3'
import { BN } from '@/utils/bignumber'
import { format_time } from '@/utils/format'
import { prettifyNumber } from '@/utils/ui'
import { useNavigate } from 'react-router-dom'

export default ({title,children}) => {
  const { walletAddress } = useWeb3()
  const { userVaults } = useVaults()
  const [lastInfo, setLastInfo] = useState({
    debitAmount: 0,
    lockValue: 0,
  })

  const router = useNavigate()

  const initSavings: SavingData = {
    daiSavingsRate: new BigNumber(0),
    dateEarningsLastAccrued: new Date(),
    savingsRateAccumulator: new BigNumber(0),
    savingsDai: new BigNumber(0),
    daiLockedInDsr: new BigNumber(0),
  }
  const { logout, user, checkLogin } = useUserMangement()

  useEffect(() => {
    checkLogin()
  }, [])

  const [dsrSavings, setDsrSavings] = useState<SavingData>(initSavings)

  const [savings, setSavings] = useState<SavingData>(initSavings)

  const [refreshKey, setRefreshKey] = useState(0)

  const [uiState, setUIState] = useState(0)

  const mergeData = (
    { chi_, dsr_, rho_ }: { chi_: string; dsr_: string; rho_: string },
    savingsDai: BigNumber,
  ) => {
    const savingsRateAccumulator = new BigNumber(chi_).div(RAY)
    const daiSavingsRate = new BigNumber(dsr_).div(RAY)
    return {
      savingsDai,
      daiLockedInDsr: savingsDai.times(savingsRateAccumulator),
      daiSavingsRate,
      dateEarningsLastAccrued: new Date(+rho_ * 1000),
      savingsRateAccumulator,
    }
  }

  const [userInfo, setUserInfo] = useState({
    amount: new BigNumber(0),
    pie: new BigNumber(0),
    gie: new BigNumber(0),
  })

  const getData = useCallback(async () => {

    // if (walletAddress) {
    // const { contract } = getDsrContract()
    // const { userInfo, govParms, daiParms } = contract.methods
    // const { amount, pie, gie } = await userInfo(walletAddress).call()
    // const dp = await daiParms().call()
    // const gp = await govParms().call()

    let amount = '5000000000000000000000' // 5000
    let pie = '5000000000000000000000'
    let gie = '3000000000000000000'
    let dp = {
      chi_: '3000000000000000000',
      dsr_: '3000000000000000000',
      rho_: '1692789402',
    }
    let gp = {
      chi_: '',
      dsr_: '',
      rho_: '',
    }

    const info = {
      amount: new BigNumber(fromWei(amount)),
      pie: new BigNumber(fromWei(pie)),
      gie: new BigNumber(fromWei(gie)),
    }

    // setUserInfo(info)
    // setSavings(mergeData(gp, info.gie))
    // setDsrSavings(mergeData(dp, info.pie))
    // }
  }, [walletAddress])

  // const onFinish = useCallback(() => {
  //   getData()
  //   setRefreshKey(Date.now())
  // }, [getData])

  // useEffect(() => {
  //   getData()
  // }, [getData])

  const allDatas = useMemo(() => {
    if (userVaults?.length) {
      const totalCollLocked = userVaults
        .reduce((acc, { collateralValue }) => collateralValue.plus(acc), BN(0))
        .toNumber()
        .toFixed(2)
      const borrowedApr = userVaults.map((item) => {
        return `${prettifyNumber(item['annualStabilityFee'].times(100))}%`
      })
      const borrowValue = userVaults
        .reduce((acc, { debtValue }) => debtValue.plus(acc), BN(0))
        .toNumber()
        .toFixed(2)
      return {
        totalCollLocked,
        borrowedApr: borrowedApr[0],
        borrowValue,
      }
    } else {
      return {
        totalCollLocked: '0.00',
        borrowedApr: '0.00',
        borrowValue: '0.00',
      }
    }
  }, [userVaults])

  const vaultDatas = useMemo(() => {
    const vaultsData = Array.isArray(userVaults) && userVaults.length ? userVaults : null
    
    const datas = vaultsData?.sort((a, b) => {
      return a.collateralAmount.gt(0) ? 1 : b.collateralAmount.gt(0) ? -1 : 0
    })

    return datas
  }, [userVaults])

  useEffect(() => {
    if (!walletAddress) return
    fetch(`${BASE_URL}/value/getValueList?walletAddress=${walletAddress}&lastDay=30`)
      .then((res) => res.json())
      .then((res) => {
        if (res.data.valueList?.length) {
          setLastInfo(res.data.valueList[0])
        }
      })
  }, [walletAddress])

  const navigateToPage = (page) => {
    // router('/home/vault/dashboard')
  }

  return (
    <section className="main-page" >
      <BankSideBar currentPage={uiState} navigateToPage={navigateToPage} />
      <div className="main-window">
        <div className="main-window-line">
          <Header title={title} />

          {children}
          {/* {uiState == 0 ? (
            <PropertySelection user={user} navigateToPage={navigateToPage}></PropertySelection>
          ) : (
            uiState == 1 ? <PropertyDashboard></PropertyDashboard> :<History  user={user} navigateToPage={navigateToPage}></History>
          )} */}
          {/* <main>
            <Routes>
              <Route path="/" element={ <PropertySelection user={user} navigateToPage={navigateToPage}></PropertySelection>} />
              <Route path="/home/property-dashboard" element={ <PropertyDashboard></PropertyDashboard> } />
              <Route path="/history" element={<History  user={user} navigateToPage={navigateToPage}></History>} />
            </Routes>
          </main> */}
        </div>
      </div>
    </section>
  )
}
