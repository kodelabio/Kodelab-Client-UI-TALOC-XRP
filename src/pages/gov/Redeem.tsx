import { Button, Input, message } from 'antd'
import { useState } from 'react'
import { abiAddresses } from '@/constants'
import { hideLoading, showLoading, toWei } from '@/utils'
import useErc20TokenAllowance from '@/hooks/useErc20TokenAllowance'
import { getAdmContract } from '@/utils/getContract'

export default ({ balance, onFinish }: { balance: string; onFinish: () => void }) => {
  const [amount, setAmount] = useState('')

  const { setAllowance } = useErc20TokenAllowance(
    abiAddresses.MCD_IOU,
    abiAddresses.MCD_ADM,
    amount,
  )
  const handleRedeem = async (amount: string) => {
    const { free } = getAdmContract().contract.methods
    showLoading()
    try {
      await setAllowance()
      await free(toWei(amount)).send()
      // queryAmount()
      message.success('赎回成功')
      onFinish()
    } catch (error) {
      message.error('赎回失败')
    } finally {
      hideLoading()
    }
  }

  return (
    <div className="redeem-wrap">
      <p className="mb-16 fz-14 pt-10">
        赎回数量(可赎回数量：
        <span style={{ color: '#1aab9b' }}>{balance}HOC</span>)
      </p>
      <div className="input-wrap rel">
        <Input
          status={+amount > +balance ? 'error' : undefined}
          suffix="HOC"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
        />
      </div>
      <Button
        shape="round"
        type="primary"
        disabled={!amount || +amount > +balance}
        onClick={() => handleRedeem(amount)}
        block
        className="mt-40"
      >
        赎回
      </Button>
    </div>
  )
}
