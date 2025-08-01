import { Button, message, Modal } from 'antd'
import { sidebarModalProps } from '../vault/components/BorrowList'
import DsrDeposit from './components/DsrDeposit'
import DSRInfo from './components/DsrInfo'
import DsrWithdraw from './components/DsrWithdraw'
import History from './components/History'
import { useCallback, useEffect, useState } from 'react'
import { RAY } from '@/constants'
import { fromWei, hideLoading, showLoading } from '@/utils'
import { useToggle } from 'ahooks'
import BigNumber from 'bignumber.js'
import Card from '@/components/layout/Card'
import Grid from '@/components/layout/Grid'
import Title from '@/components/layout/Title'
import useWeb3 from '@/hooks/useWeb3'
import { format_time } from '@/utils/format'
import { getDsrContract } from '@/utils/getContract'

export function calcReward({
  daiSavingsRate,
  daiLockedInDsr,
  dateEarningsLastAccrued,
}: SavingData) {
  if (daiLockedInDsr.gt(0)) {
    const amountChangePerSecond = daiSavingsRate.minus(1).times(daiLockedInDsr)
    const secondsSinceDrip = (Date.now() - dateEarningsLastAccrued.getTime()) / 1000
    const accruedInterestSinceDrip = amountChangePerSecond.times(secondsSinceDrip)
    return accruedInterestSinceDrip
  } else {
    return new BigNumber(0)
  }
}

const initSavings: SavingData = {
  daiSavingsRate: new BigNumber(0),
  dateEarningsLastAccrued: new Date(),
  savingsRateAccumulator: new BigNumber(0),
  savingsDai: new BigNumber(0),
  daiLockedInDsr: new BigNumber(0),
}

const Stake = () => {
  const { walletAddress } = useWeb3()
  const [savings, setSavings] = useState<SavingData>(initSavings)
  const [dsrSavings, setDsrSavings] = useState<SavingData>(initSavings)
  const [refreshKey, setRefreshKey] = useState(0)
  const [showDeposit, { toggle: toggleDeposit }] = useToggle()
  const [showWithdraw, { toggle: toggleWithdraw }] = useToggle()
  const [userInfo, setUserInfo] = useState({
    amount: new BigNumber(0),
    pie: new BigNumber(0),
    gie: new BigNumber(0),
  })
  const displayRate = dsrSavings.daiSavingsRate.gt(0)
    ? `${dsrSavings.daiSavingsRate
        .pow(365 * 24 * 60 * 60)
        .minus(1)
        .times(100)
        .toFixed(2, BigNumber.ROUND_HALF_UP)}%`
    : '- -'

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

  const getData = useCallback(async () => {
    if (walletAddress) {
      const { contract } = getDsrContract()
      const { userInfo, govParms, daiParms } = contract.methods
      const { amount, pie, gie } = await userInfo(walletAddress).call()
      const dp = await daiParms().call()
      const gp = await govParms().call()
      const info = {
        amount: new BigNumber(fromWei(amount)),
        pie: new BigNumber(fromWei(pie)),
        gie: new BigNumber(fromWei(gie)),
      }

      setUserInfo(info)
      setSavings(mergeData(gp, info.gie))
      setDsrSavings(mergeData(dp, info.pie))
    }
  }, [walletAddress])

  const onFinish = useCallback(() => {
    getData()
    setRefreshKey(Date.now())
  }, [getData])

  const harvest = async () => {
    const { contract } = getDsrContract()
    try {
      showLoading()
      await contract.methods.harvest().send()
      message.success('Successful')
      onFinish()
    } catch (error) {
      message.error('Failed')
    } finally {
      hideLoading()
    }
  }

  useEffect(() => {
    getData()
  }, [getData])

  const updateTime = 'Up to ' + format_time(Date.now())

  const buttonProps = {
    className: 'w-140',
    type: 'primary' as const,
    disabled: !walletAddress,
  }

  const infoProps = {
    rewardInfo: {
      hoc: calcReward(savings),
      hgbp: calcReward(dsrSavings),
    },
    lockAmount: userInfo.amount,
    onFinish,
  }
  return (
    <div>
      <Title title="Stake">
        <Button
          shape="round"
          {...buttonProps}
          disabled={!walletAddress || userInfo.amount.eq(0)}
          ghost
          onClick={harvest}
        >
          Harvest
        </Button>
        <Button shape="round" {...buttonProps} ghost onClick={toggleWithdraw}>
          Withdraw
        </Button>
        <Button shape="round" {...buttonProps} onClick={toggleDeposit}>
          Deposit
        </Button>
      </Title>
      <div className="p-30">
        <Grid column={4} m={2}>
          <Card
            description="Total deposit"
            value={
              <div>
                {userInfo.amount.toFixed(4)}
                <i> HGBP</i>
              </div>
            }
            date={updateTime}
          />
          <Card description="Annual percentage yield" value={displayRate} date={updateTime} />
          <Card
            description="Reward  HGBP"
            value={<DSRInfo token=" HGBP" savings={dsrSavings} />}
            date={updateTime}
          />
          <Card
            description="Reward HOC"
            value={<DSRInfo token="HOC" savings={savings} />}
            date={updateTime}
          />
        </Grid>
        <History refreshKey={refreshKey} />
      </div>
      <Modal
        {...sidebarModalProps}
        onCancel={toggleDeposit}
        open={showDeposit}
        title="Deposit  HGBP"
      >
        <DsrDeposit {...infoProps} onClose={toggleDeposit} />
      </Modal>
      <Modal
        {...sidebarModalProps}
        onCancel={toggleWithdraw}
        open={showWithdraw}
        title="Withdraw  HGBP"
      >
        <DsrWithdraw {...infoProps} onClose={toggleWithdraw} />
      </Modal>
    </div>
  )
}

export default Stake
