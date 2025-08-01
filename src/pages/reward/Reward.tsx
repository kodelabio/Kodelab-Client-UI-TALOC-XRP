import { Button, Modal, Tabs } from 'antd'
import { sidebarModalProps } from '../vault/components/BorrowList'
import ClaimReward from './components/ClaimReward'
import RewardRecord from './components/RewardRecord'
import WithdrawRecord from './components/WithdrawRecord'
import { useCallback, useEffect, useState } from 'react'
import { useToggle } from 'ahooks'
import Section from '@/components/layout/Section'
import Title from '@/components/layout/Title'
import useWeb3 from '@/hooks/useWeb3'
import { request, ResponseType } from '@/utils/request'

export default () => {
  const { walletAddress } = useWeb3()
  const [HGBPBalance, setHGBPBalance] = useState('')
  const [HOCBalance, setHOCBalance] = useState('')
  const getBalance = useCallback(
    async (coin_type: string) => {
      if (!walletAddress) return ''
      const res = await request.post<ResponseType<{ amount: string }>>(`/assets`, {
        user_address: walletAddress,
        coin_type,
      })
      return res.data.data.amount
    },
    [walletAddress],
  )

  const getAllBalnce = useCallback(() => {
    getBalance(' HGBP').then((v) => {
      setHGBPBalance(v)
    })
    getBalance('HOC').then((v) => {
      setHOCBalance(v)
    })
  }, [getBalance])

  useEffect(() => {
    getAllBalnce()
  }, [getAllBalnce])

  const [visible, { toggle }] = useToggle()

  return (
    <div>
      <Title title="Reward" />
      <div className="p-30">
        <Section className="mH-600">
          <div className="p-20 bd-bottom row-between mb-10">
            <div>
              <p>Rewards to be claimed: </p>
              <p className="fz-24 bold">
                {HGBPBalance}  HGBP / {HOCBalance} HOC
              </p>
            </div>
            <Button
              type="primary"
              disabled={!walletAddress}
              className="w-160"
              shape="round"
              ghost
              onClick={toggle}
            >
              Withdraw
            </Button>
          </div>
          {walletAddress ? (
            <Tabs
              tabBarStyle={{
                paddingLeft: 20,
                marginBottom: 0,
                fontWeight: 'bold',
                color: '#8492A6',
              }}
              tabBarGutter={60}
              items={[
                {
                  key: '1',
                  label: 'Borrow reward',
                  children: <RewardRecord type="borrow" />,
                },
                {
                  key: '2',
                  label: 'Liquidity reward',
                  children: <RewardRecord type="liquidity" />,
                },
                {
                  key: '3',
                  label: 'Withdraw record',
                  children: <WithdrawRecord />,
                },
              ]}
            />
          ) : (
            <p className="text-center o-5 pt-100">No account</p>
          )}
        </Section>
      </div>
      <Modal {...sidebarModalProps} onCancel={toggle} open={visible} title="Claim reward">
        <ClaimReward
          rewardInfo={{ HOC: HOCBalance,  HGBP: HGBPBalance }}
          onClose={toggle}
          onFinish={getAllBalnce}
        />
      </Modal>
    </div>
  )
}
