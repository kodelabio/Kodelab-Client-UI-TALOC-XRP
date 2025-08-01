import { Button, Input, message } from 'antd'
import { useState } from 'react'
import { DAI } from '@/maker'
import { hideLoading, showLoading } from '@/utils'
import BigNumber from 'bignumber.js'
import RatioDisplay, { RatioDisplayTypes } from '@/components/RatioDisplay'
import useMaker from '@/hooks/useMaker'
import { add, greaterThan } from '@/utils/bignumber'
import { formatCollateralizationRatio, formatter, prettifyNumber } from '@/utils/ui'

const Generate = ({ vault, close }: { vault: VaultData; close: () => void }) => {
  const { maker } = useMaker()

  let {
    debtValue: _debtValue,
    daiAvailable,
    vaultType,
    debtFloor,
    collateralAmount,
    liquidationRatio,
    collateralizationRatio: currentCollateralizationRatio,
    collateralDebtAvailable: _collateralDebtAvailable,
  } = vault
  BigNumber.set({ ROUNDING_MODE: BigNumber.ROUND_DOWN })
  const debtValue = _debtValue.toBigNumber().decimalPlaces(18)
  const collateralDebtAvailable = _collateralDebtAvailable?.toBigNumber()

  const dustLimitValidation = (value: string) => greaterThan(debtFloor, add(value, debtValue))
  const debtCeilingValidation = (value: string) => greaterThan(value, collateralDebtAvailable)

  const [amount, setAmount] = useState('')

  const amountToGenerate =
    amount && !new BigNumber(amount).isNegative() ? new BigNumber(amount) : new BigNumber(0)

  const undercollateralized = daiAvailable.lt(amountToGenerate)

  const generate = async () => {
    try {
      showLoading()
      await maker.service('mcd:cdpManager').draw(vault.id, vaultType, DAI(amount))
      message.success('Generate succeeded')
      close()
    } catch (error) {
       message.error('Generate failed')
    } finally {
      hideLoading()
    }
  }

  const liquidationPrice = vault.calculateLiquidationPrice({
    debtValue: vault?.debtValue.plus(amountToGenerate),
  })

  const collateralizationRatio = vault.calculateCollateralizationRatio({
    debtValue: vault?.debtValue.plus(amountToGenerate),
  })

  const [failureMessage, setFailureMessage] = useState('')

  const handleChange = (val: string) => {
    let msg = ''
    if (+val > formatter(daiAvailable)) {
      msg = 'Treasury below liquidation threshold'
    } else if (dustLimitValidation(val)) {
      msg = `A treasury requires a minimum of ${formatter(debtFloor)}  HGBP to be generated`
    } else if (debtCeilingValidation(val)) {
      msg = `The amount of  HGBP you are trying to generate exceeds the amount of  HGBP available. Please enter less than ${formatter(
        collateralDebtAvailable,
      )}  HGBP`
    }
    setAmount(val)
    setFailureMessage(msg)
  }
  return (
    <div>
      <p className="o-8 mb-20">How much  HGBP would you like to generate?</p>
      <Input
        type="number"
        value={amount}
        min="0"
        addonAfter=" HGBP"
        onChange={(e) => handleChange(e.target.value)}
        placeholder="0.00"
        status={failureMessage ? 'error' : undefined}
      />
      <p className="pt-10 c-red">{failureMessage}</p>
      <RatioDisplay
        type={RatioDisplayTypes.CARD}
        ratio={collateralizationRatio}
        ilkLiqRatio={formatter(liquidationRatio, { percentage: true })}
        text={'The amount of  HGBP you are generating puts your treasury at risk of liquidation'}
        onlyWarnings={true}
        show={amount !== '' && +amount > 0 && !undercollateralized}
        textAlign="center"
      />

      <div className="bd-all br-4 fz-16 mtb-20">
        <div className="bd-bottom p-12">
          <p className="fz-12 mb-4 o-6">Maximum available to generate</p>
          <div>{`${daiAvailable.toBigNumber().toFixed(2)}  HGBP`}</div>
        </div>
        <div className="bd-bottom p-12">
          <p className="fz-12 mb-4 o-6">New liquidation price</p>
          <div>{`${prettifyNumber(liquidationPrice, false, 2, false)} GBP`}</div>
        </div>
        <div className="p-12">
          <p className="fz-12 mb-4 o-6">New collateralization ratio</p>
          <RatioDisplay
            type={RatioDisplayTypes.TEXT}
            ratio={formatter(collateralizationRatio, {
              infinity: currentCollateralizationRatio,
            })}
            ilkLiqRatio={formatter(liquidationRatio, { percentage: true })}
            text={formatCollateralizationRatio(collateralizationRatio)}
          />
        </div>
      </div>
      <div>
        <Button
          shape="round"
          disabled={!amount || !!failureMessage}
          type="primary"
          onClick={generate}
        >
          Generate
        </Button>
        <Button shape="round" onClick={close}>
          Cancel
        </Button>
      </div>
    </div>
  )
}
export default Generate
