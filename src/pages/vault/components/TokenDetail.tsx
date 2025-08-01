import { Button, Input, message, Modal } from 'antd'
import { useState } from 'react'
import { abiAddresses } from '@/constants'
import { fromWei, hideLoading, showLoading } from '@/utils'
import { useMount, useToggle } from 'ahooks'
import BigNumber from 'bignumber.js'
import styled from 'styled-components'
import { format_num } from '@/utils/format'
import { getPoxyContract, getProxyActionsContract, getVatContract } from '@/utils/getContract'
import { formatter, prettifyNumber } from '@/utils/ui'

type TokenProps = {
  tokenData: VaultData
  debtCeilings: PlainObject<CurrencyX>
}
const TokenWrap = styled.div`
  .row-between {
    min-height: 40px;
    &:nth-child(even) {
      background-color: #fafafa;
    }
  }
`
export default ({ tokenData, debtCeilings }: TokenProps) => {
  const [open, { toggle }] = useToggle()
  const [amount, setAmount] = useState('')
  useMount(() => {
    const { contract } = getVatContract()
    contract.methods
      .dai(tokenData.vaultAddress)
      .call()
      .then((v) => {
        setAmount(v.slice(0, -27))
      })
  })
  const onWithdraw = () => {
    const { contract } = getProxyActionsContract()
    const { contract: proxyContract } = getPoxyContract(tokenData.ownerAddress)
    const { CDP_MANAGER, MCD_JUG, MCD_JOIN_DAI, PROXY_ACTIONS } = abiAddresses
    const data = contract.methods
      .draw(CDP_MANAGER, MCD_JUG, MCD_JOIN_DAI, tokenData.id, amount)
      .encodeABI()

    showLoading()
    proxyContract.methods['execute(address,bytes)'](PROXY_ACTIONS, data)
      .send()
      .then(() => {
        message.success('Withdrawal succeeded')
        toggle()
        setAmount('')
      })
      .catch(() => {
        message.error('Withdrawal failed')
      })
      .finally(hideLoading)
  }
  return (
    <TokenWrap>
      <div className="token-con">
        <div className="token-bottom">
          <div className="row-between">
            <span>Token</span>
            {/* <span>{tokenData?.name || ''}</span> */}
          </div>
          <div className="row-between">
            <span>Vault ID</span>
            <span>{tokenData?.id || ''}</span>
          </div>
          <div className="row-between">
            <span>Stability fee rate</span>
            <span>
              {tokenData?.annualStabilityFee
                ? `${formatter(tokenData.annualStabilityFee, {
                    percentage: true,
                    rounding: BigNumber.ROUND_HALF_UP,
                  })} %`
                : ''}
            </span>
          </div>
          <div className="row-between">
            <span>Liquidation fee</span>
            <span>
              {tokenData?.liquidationPrice
                ? `${prettifyNumber(tokenData.liquidationPrice, false, 2, false)} GBP`
                : ''}
            </span>
          </div>
          <div className="row-between">
            <span>Min. collateral ratio </span>
            <span>
              {tokenData?.liquidationRatio
                ? `${+prettifyNumber(tokenData.liquidationRatio, true, 2, false) * 100}%`
                : ''}
            </span>
          </div>
          <div className="row-between">
            <span>Dust limit </span>
            <span>
              {tokenData?.debtFloor
                ? formatter(tokenData.debtFloor, {
                    percentage: false,
                    rounding: BigNumber.ROUND_HALF_UP,
                  })
                : ''}
            </span>
          </div>
          <div className="row-between">
            <span>Dust max</span>
            <span>
              {tokenData?.vaultType && debtCeilings[tokenData?.vaultType]
                ? prettifyNumber(debtCeilings[tokenData.vaultType], false, 2, false)
                : ''}
            </span>
          </div>
          <div className="row-between">
            <span>Owner</span>
            {/* <span>{tokenData?.owner || ''}</span> */}
          </div>
          <div className="row-between">
            <span>Asset address</span>
            <span className="fz-12">{tokenData?.ownerAddress || ''}</span>
          </div>
          <div className="row-between">
            <span>Valuation</span>
            <span>
              {tokenData?.collateralValue ? prettifyNumber(tokenData?.collateralValue, true) : ''}
            </span>
          </div>
          <div className="row-between">
            <span>Evaluation date</span>
            {/* <span>
              {tokenData?.valuation_date
                ? formatDate(new Date(Number(tokenData.valuation_date) * 1000))
                : ''}
            </span> */}
          </div>
          <div className="row-between">
            <span>Area</span>
            {/* <span>{`${tokenData?.floorage} ` || ''}</span> */}
          </div>
          <div className="row-between">
            <span>Asset owner</span>
            {/* <span>{tokenData?.owner || ''}</span> */}
          </div>
          <div className="row-between">
            <span>Asset type</span>
            {/* <span>{tokenData?.property_type || ''}</span> */}
          </div>
        </div>
        {+amount > 0 && (
          <Button className="mt-30" type="primary" shape="round" onClick={toggle}>
            Withdraw
          </Button>
        )}

        <Modal title="Withdraw" open={open} onCancel={toggle}>
          <p className="mb-30 o-8">Withdraw from Tokens Vault</p>
          <Input readOnly value={format_num(fromWei(amount))} suffix={' HGBP'} />
          <div className="bd-all plr-14 ptb-14 br-6 mt-20 mb-30">
            <p>Tokens Vault</p>
            <div className="bold pt-4 fz-16">{tokenData.vaultType.split('-')[0]}</div>
          </div>
          <Button type="primary" shape="round" onClick={onWithdraw}>
            Withdraw
          </Button>
          <Button shape="round" onClick={toggle}>
            Cancel
          </Button>
        </Modal>
      </div>
    </TokenWrap>
  )
}
