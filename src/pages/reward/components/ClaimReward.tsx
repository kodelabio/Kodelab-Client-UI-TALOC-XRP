import { Button, Input, message, Radio, Tabs } from 'antd'
import { useMemo, useState } from 'react'
import { abiAddresses } from '@/constants'
import { hideLoading, showLoading } from '@/utils'
import styled from 'styled-components'
import { useWithdrawReward } from '@/hooks/useWithdrawReward'

const Wrap = styled.div`
  .ant-tabs-nav-list {
    flex: 1;
  }
  .ant-tabs-tab {
    flex: 1;
    justify-content: center;
    margin-left: 0;
    &.ant-tabs-tab-active {
      background-color: #464a53;
      .ant-tabs-tab-btn {
        color: #fff;
      }
    }
  }
`
export default ({
  rewardInfo,
  onClose,
  onFinish,
}: {
  rewardInfo: {
    HOC: string
     HGBP: string
  }
  onClose: () => void
  onFinish: () => void
}) => {
  type Keys = keyof typeof rewardInfo
  const { withdraw } = useWithdrawReward()
  const [activeKey, setActiveKey] = useState(Number(rewardInfo. HGBP) > 0 ? ' HGBP' : 'HOC')

  const contractAddress = useMemo(() => {
    return activeKey === ' HGBP' ? abiAddresses.MCD_DAI : abiAddresses.MCD_GOV
  }, [activeKey])

  const amount = rewardInfo[activeKey as Keys]

  const handleWithdraw = () => {
    showLoading()
    withdraw(amount, contractAddress, activeKey.toLowerCase())
      .then(() => {
        message.success('Claim succeeded')
        onClose()
      })
      .catch((err: any) => {
        message.error(err?.errmsg || 'Claim failed')
      })
      .finally(() => {
        hideLoading()
        onFinish()
      })
  }

  const RenderItem = (symbol: Keys) => {
    return {
      key: symbol,
      label: symbol,
      children: <Input value={rewardInfo[symbol]} readOnly addonAfter={symbol} />,
    }
  }

  return (
    <Wrap>
      <p className="o-8 mb-20">Claim rewards are only support the single currency everytime</p>
      <Tabs
        type="card"
        activeKey={activeKey}
        onChange={setActiveKey}
        items={[RenderItem(' HGBP'), RenderItem('HOC')]}
      />

      <div className="bd-all br-4 fz-16 mtb-20">
        <div className="bd-bottom p-12">
          <p className="fz-12 mb-4 o-6"> HGBP reward</p>
          <div>{rewardInfo. HGBP}  HGBP</div>
        </div>
        <div className="p-12">
          <p className="fz-12 mb-4 o-6">HOC reward</p>
          <div>{rewardInfo.HOC} HOC</div>
        </div>
      </div>
      <div>
        <Button
          shape="round"
          disabled={+amount <= 0}
          type="primary"
          className="w-120"
          onClick={handleWithdraw}
        >
          Claim
        </Button>
        <Button shape="round" onClick={onClose}>
          Cancel
        </Button>
      </div>
    </Wrap>
  )
}
