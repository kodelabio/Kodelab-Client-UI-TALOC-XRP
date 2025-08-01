import { Button } from 'antd'
import BorrowList from './components/BorrowList'
import { useEffect, useMemo, useState } from 'react'
import { BsPlus } from 'react-icons/bs'
import { BASE_URL } from '@/constants'
import Card from '@/components/layout/Card'
import Grid from '@/components/layout/Grid'
import Title from '@/components/layout/Title'
import useVaults from '@/hooks/useVaults'
import useWeb3 from '@/hooks/useWeb3'
import { BN } from '@/utils/bignumber'
import { format_time } from '@/utils/format'
import { prettifyNumber } from '@/utils/ui'

export default () => {
  const { walletAddress } = useWeb3()
  const { userVaults } = useVaults()
  const [lastInfo, setLastInfo] = useState({
    debitAmount: 0,
    lockValue: 0,
  })

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
    const datas = vaultsData
      ?.filter((vault) => {
        return vault.collateralAmount && vault.collateralAmount.gt(0)
      })
      .sort((a, b) => {
        return a.collateralAmount.gt(0) ? -1 : b.collateralAmount.gt(0) ? 1 : 0
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

  return (
    <div>
      <Title title="Vault">
        <Button type="primary" shape="round" href="#/createVault">
          <div className="pt-6 row">
            <BsPlus size={20} />
            New vault
          </div>
        </Button>
      </Title>
      <div className="p-30">
        <Grid className="mb-30" column={4} m={2}>
          <Card
            description="Value locked"
            date="Since last month"
            value={`  ${allDatas.totalCollLocked}`}
            currentVaule={allDatas.totalCollLocked}
            lastVaule={lastInfo.lockValue}
          />
          <Card
            description="Borrowed amount"
            date="Since last month"
            value={`  ${allDatas.borrowValue}`}
            currentVaule={allDatas.borrowValue}
            lastVaule={lastInfo.debitAmount}
          />
          <Card
            description="Interest rate (APR)"
            date={`Up to ${format_time(Date.now(), 'MM/DD/YYYY')}`}
            value={`${allDatas.borrowedApr}`}
          />
          <Card
            description="Reward HOC"
            date={`Up to ${format_time(Date.now(), 'MM/DD/YYYY')}`}
            value="3.00 %"
          />
        </Grid>

        <BorrowList vaultDatas={vaultDatas} />
      </div>
    </div>
  )
}
