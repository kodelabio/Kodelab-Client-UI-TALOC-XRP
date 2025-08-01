import { Button, Input, message } from 'antd'
import { useState } from 'react'
import { decimalRules } from '@/constants'
import { hideLoading, showLoading, toWei } from '@/utils'
import { BigNumber } from 'bignumber.js'
import { getDsrContract } from '@/utils/getContract'

const { long } = decimalRules

export default ({
  lockAmount,
  rewardInfo,
  onClose,
  onFinish,
}: {
  rewardInfo: {
    hoc: BigNumber
    hgbp: BigNumber
  }
  lockAmount: BigNumber
  onClose: () => void
  onFinish: () => void
}) => {
  const [amount, setAmount] = useState('')

  const withdraw = async () => {
    showLoading()
    try {
      const { contract } = getDsrContract()
      await contract.methods.leaveStaking(toWei(amount)).send()
      message.success('Withdrawal succeeded')
      onFinish()
      onClose()
    } catch (error) {
       message.error('Withdrawal failed')
    } finally {
      hideLoading()
    }
  }

  const [failureMessage, setFailureMessage] = useState('')

  const handleChange = (val: string) => {
    let msg = ''
    if (+val > lockAmount.toNumber()) {
      msg = 'Insufficient balance'
    }
    setAmount(val)
    setFailureMessage(msg)
  }

  return (
    <div>
      <p className="o-8 mb-20">
        Withdraw your  HGBP and HOC, System will complete the interest settlement after your
        operation
      </p>
      <Input
        type="number"
        value={amount}
        min="0"
        addonAfter=" HGBP"
        onChange={(e) => handleChange(e.target.value)}
        placeholder="0.00"
        suffix={
          <i
            className="link-text"
            onClick={() => {
              setAmount(lockAmount.gt(0.00000001) ? lockAmount.toString() : '')
            }}
          >
            Max
          </i>
        }
        status={failureMessage ? 'error' : undefined}
      />
      <p className="pt-10 c-red">{failureMessage}</p>

      <div className="bd-all br-4 fz-16 mtb-20">
        <div className="bd-bottom p-12">
          <p className="fz-12 mb-4 o-6">Locked in dsr</p>
          <div>{lockAmount.toFixed(6)}  HGBP</div>
        </div>
        <div className="bd-bottom p-12">
          <p className="fz-12 mb-4 o-6"> HGBP reward</p>
          <div>{rewardInfo.hgbp.toFixed(6)}  HGBP</div>
        </div>
        <div className="p-12">
          <p className="fz-12 mb-4 o-6">HOC reward</p>
          <div>{rewardInfo.hoc.toFixed(6)} HOC</div>
        </div>
      </div>
      <div>
        <Button
          shape="round"
          disabled={+amount <= 0 || !!failureMessage}
          type="primary"
          onClick={withdraw}
        >
          Withdraw
        </Button>
        <Button shape="round" onClick={onClose}>
          Cancel
        </Button>
      </div>
    </div>
  )
}
