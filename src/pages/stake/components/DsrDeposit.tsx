import { Button, Input, message } from 'antd'
import { useState } from 'react'
import { abiAddresses, decimalRules } from '@/constants'
import { hideLoading, showLoading, toWei } from '@/utils'
import SetupProxy from '@/components/SetupProxy'
import useErc20TokenAllowance from '@/hooks/useErc20TokenAllowance'
import useProxy from '@/hooks/useProxy'
import useWalletBalances from '@/hooks/useWalletBalances'
import { getDsrContract } from '@/utils/getContract'
import { formatter } from '@/utils/ui'

const { long } = decimalRules

export default ({
  lockAmount,
  onClose,
  onFinish,
}: {
  lockAmount: BigNumber
  onClose: () => void
  onFinish: () => void
}) => {
  const { MCD_DAI, DssSavingReward } = abiAddresses
  const { contract } = getDsrContract()
  const { DAI: daiBalance } = useWalletBalances()
  const [amount, setAmount] = useState('')
  const { hasProxy } = useProxy()
  const { hasAllowance, allowanceLoading, setAllowance } = useErc20TokenAllowance(
    MCD_DAI,
    DssSavingReward,
    amount,
  )

  const deposit = async () => {
    showLoading()
    try {
      await contract.methods.enterStaking(toWei(amount)).send()
      onFinish()
      onClose()
      message.success('Deposit succeeded')
    } catch (error) {
      message.error('Deposit failed')
    } finally {
      hideLoading()
    }
  }

  const [failureMessage, setFailureMessage] = useState('')

  const handleChange = (val: string) => {
    let msg = ''
    if (+val > daiBalance.toNumber()) {
      msg = 'Insufficient balance'
    }
    setAmount(val)
    setFailureMessage(msg)
  }

  return hasProxy ? (
    <div>
      <p className="o-8 mb-20">How much  HGBP would you like to deposit?</p>
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
              setAmount(daiBalance ? daiBalance.toString() : '')
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
          <p className="fz-12 mb-4 o-6">Your  HGBP balance</p>
          <div>{`${daiBalance && formatter(daiBalance, { precision: long })}  HGBP`}</div>
        </div>
        <div className="p-12">
          <p className="fz-12 mb-4 o-6">Locked in dsr</p>
          <div>{lockAmount.toFixed(6)}  HGBP</div>
        </div>
      </div>
      <div>
        {!hasAllowance ? (
          <Button
            shape="round"
            type="primary"
            disabled={!!failureMessage}
            loading={allowanceLoading}
            onClick={setAllowance}
          >
            Approve  HGBP
          </Button>
        ) : (
          <Button
            shape="round"
            disabled={+amount <= 0 || !!failureMessage}
            type="primary"
            onClick={deposit}
          >
            Deposit
          </Button>
        )}

        <Button shape="round" onClick={onClose}>
          Cancel
        </Button>
      </div>
    </div>
  ) : (
    <SetupProxy />
  )
}
