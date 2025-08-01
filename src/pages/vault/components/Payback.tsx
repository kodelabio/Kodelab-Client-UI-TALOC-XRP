import { Button, Input, message } from 'antd'
import { useEffect, useRef, useState } from 'react'
import { decimalRules } from '@/constants'
import { DAI } from '@/maker'
import { hideLoading, showLoading } from '@/utils'
import { useMount } from 'ahooks'
import { BigNumber } from 'bignumber.js'
import TokenAllowance from '@/components/TokenAllowance'
import useMaker from '@/hooks/useMaker'
import useProxy from '@/hooks/useProxy'
import useTokenAllowance from '@/hooks/useTokenAllowance'
import useWalletBalances from '@/hooks/useWalletBalances'
import { subtract, greaterThan, equalTo, minimum } from '@/utils/bignumber'
import { getJugContract } from '@/utils/getContract'
import { toHex } from '@/utils/transform'
import { formatCollateralizationRatio } from '@/utils/ui'
import { formatter, prettifyNumber } from '@/utils/ui'

const { long } = decimalRules

const Payback = ({ vault, close }: { vault: VaultData; close: () => void }) => {
  const { maker } = useMaker()
  const { DAI: daiBalance } = useWalletBalances()
  const { hasProxy } = useProxy()
  const [lastUpdateTime, setLastUpdateTime] = useState(0)
  const { ilks, drip } = getJugContract().contract.methods
  const vaultTypeHex = toHex(vault.vaultType)
  const HALF_HOUR_SECOND = 30 * 60
  const needSettle = lastUpdateTime > 0 && Date.now() / 1000 - lastUpdateTime > HALF_HOUR_SECOND
  const maxRef = useRef(false)

  const getLastUpdateTime = () => {
    ilks(vaultTypeHex)
      .call()
      .then(({ rho }) => {
        setLastUpdateTime(Number(rho))
      })
  }
  useMount(getLastUpdateTime)

  let { debtValue: _debtValue, debtFloor } = vault
  const debtValue = _debtValue.toBigNumber().decimalPlaces(18)

  const vaultUnderDustLimit = debtValue.gt(0) && debtValue.lt(debtFloor)
  const dustLimitation = (input: string) => {
    return greaterThan(debtFloor, subtract(debtValue, input)) && equalTo(input, debtValue) !== true
  }

  const { hasSufficientAllowance } = useTokenAllowance('DAI')

  const [amount, setAmount] = useState('')
  const amountToPayback = amount || 0
  const maxPaybackAmount = debtValue && daiBalance && minimum(debtValue, daiBalance)

  const wipeAll = debtValue.toString() === amount

  const onSettle = () => {
    showLoading()
    if (wipeAll) {
      maxRef.current = true
    }
    drip(vaultTypeHex)
      .send()
      .then(() => {
        getLastUpdateTime()
      })
      .finally(hideLoading)
  }

  useEffect(() => {
    if (maxRef.current) {
      handleChange(maxPaybackAmount.toString())
      maxRef.current = false
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [maxPaybackAmount])

  const payback = async () => {
    showLoading()
    const cdpManager = maker.service('mcd:cdpManager')
    const owner = await cdpManager.getOwner(vault.id)
    if (!owner) {
      hideLoading()
      return
    }

    try {
      if (wipeAll) {
        await cdpManager.wipeAll(vault.id, owner)
      } else {
        await cdpManager.wipe(vault.id, DAI(amount), owner)
      }
      close()
      message.success('Pay back succeeded')
    } catch (error) {
      message.error('Pay back failed')
    } finally {
      hideLoading()
    }
  }

  const [failureMessage, setFailureMessage] = useState('')
  const hasAllowance = !amount || hasSufficientAllowance(amount)
  const handleChange = (val: string) => {
    let msg = ''
    if (+val > Math.min(+daiBalance, +debtValue)) {
      if (greaterThan(val, daiBalance)) {
        msg = 'Insufficient balance'
      } else {
        msg = 'Cannot pay back more than owed'
      }
    } else if (dustLimitation(val)) {
      if (vaultUnderDustLimit) {
        msg =
          'Due to your treasury being below the minimum, you must repay all of your outstanding debt'
      } else {
        msg = `You can repay all your outstanding debt, or a maximum of ${subtract(
          debtValue,
          debtFloor,
        )}  HGBP`
      }
    }

    setAmount(val)
    setFailureMessage(msg)
  }

  const undercollateralized = debtValue.minus(amountToPayback).lt(0)

  const liquidationPrice = undercollateralized
    ? new BigNumber(0)
    : vault.calculateLiquidationPrice({
        debtValue: DAI(debtValue.minus(amountToPayback)),
      })
  const collateralizationRatio = undercollateralized
    ? Infinity
    : vault.calculateCollateralizationRatio({
        debtValue: DAI(debtValue.minus(amountToPayback)),
      })
  return (
    <div>
      <p className="o-8 mb-20">How much  HGBP would you like to pay back?</p>
      <Input
        type="number"
        value={amount}
        min="0"
        addonAfter=" HGBP"
        onChange={(e) => handleChange(e.target.value)}
        placeholder="0.00"
        suffix={
          <i className="link-text" onClick={() => handleChange(maxPaybackAmount.toString())}>
            Max
          </i>
        }
        status={failureMessage || !hasAllowance ? 'error' : undefined}
      />
      <p className="pt-10 c-red">
        {hasAllowance ? failureMessage : 'Amount is higher than your allowance for  HGBP'}
      </p>
      <TokenAllowance amount={amount} />
      <div className="bd-all br-4 fz-16 mtb-20">
        <div className="bd-bottom p-12">
          <p className="fz-12 mb-4 o-6">Your  HGBP balance</p>
          <div>{`${daiBalance && formatter(daiBalance, { precision: long })}  HGBP`}</div>
        </div>
        <div className="bd-bottom p-12">
          <p className="fz-12 mb-4 o-6"> HGBP debt</p>
          <div>{`${formatter(debtValue, { precision: long })}  HGBP`}</div>
        </div>
        <div className="bd-bottom p-12">
          <p className="fz-12 mb-4 o-6">New liquidation price</p>
          <div>{`${prettifyNumber(liquidationPrice, false, 2, false)} GBP`}</div>
        </div>
        <div className="p-12">
          <p className="fz-12 mb-4 o-6">New collateralization ratio</p>
          <div>{formatCollateralizationRatio(collateralizationRatio)}</div>
        </div>
      </div>
      <div>
        {needSettle && (
          <Button shape="round" type="primary" onClick={onSettle}>
            Calculate interest
          </Button>
        )}
        <Button
          shape="round"
          disabled={+amount <= 0 || !hasProxy || !!failureMessage || !hasAllowance || needSettle}
          type="primary"
          onClick={payback}
        >
          Pay back
        </Button>
        <Button shape="round" onClick={close}>
          Cancel
        </Button>
      </div>
    </div>
  )
}
export default Payback
