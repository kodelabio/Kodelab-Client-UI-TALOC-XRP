import { Button, Checkbox, message } from 'antd'
import { Action, StepComponentsProps } from '../CreateVault'
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { TxLifecycle } from '@/constants'
import { DAI } from '@/maker'
import { BigNumber } from 'bignumber.js'
import TxLink from '@/components/TxLink'
import Section from '@/components/layout/Section'
import useMaker from '@/hooks/useMaker'
import { formatter, prettifyNumber } from '@/utils/ui'

type SummaryType = {
  cdpParams: StepComponentsProps['cdpParams']
  selectedIlk: StepComponentsProps['selectedIlk']
  ilkData: CollateralTypeData
  enableSubmit: boolean
  capturedDispatch: (action: Action) => void
}
const CDPCreateConfirmSummary = ({
  cdpParams,
  selectedIlk,
  capturedDispatch,
  enableSubmit,
  ilkData,
}: SummaryType) => {
  const currency = selectedIlk.currency
  const [hasReadTOS, setHasReadTOS] = useState(false)
  const [hasUnderstoodSF, setHasUnderstoodSF] = useState(false)

  const { liquidationPenalty, liquidationRatio, annualStabilityFee } = ilkData
  const rows = [
    ['Depositing', `${prettifyNumber(cdpParams.gemsToLock)} ${selectedIlk.gem}`],
    ['Generating', `${prettifyNumber(cdpParams.daiToDraw)}  HGBP`],
    [
      'Your collateralization ratio',
      `${formatter(
        ilkData.calculateCollateralizationRatio(
          new BigNumber(cdpParams.gemsToLock),
          DAI(cdpParams.daiToDraw),
        ),
      )}%`,
    ],
    ['Liquidation ratio', `${+prettifyNumber(liquidationRatio, true, 2, false) * 100}%`],
    [
      'Liquidation price',
      ` ${prettifyNumber(
        ilkData.calculateliquidationPrice(
          currency(cdpParams.gemsToLock || '0'),
          DAI(cdpParams.daiToDraw || '0'),
        ),
      )}`,
    ],
    ['Liquidation fee', `${formatter(liquidationPenalty, { percentage: true })}%`],
    [
      'Stability fee',
      `${formatter(annualStabilityFee, {
        percentage: true,
        rounding: BigNumber.ROUND_HALF_UP,
      })}%`,
    ],
  ]
  return (
    <div>
      <p className="fz-18 mtb-20">Confirm treasury Details</p>
      <Section>
        {rows.map(([title, value], index) => {
          return (
            <div key={index} className="row bd-bottom plr-30 ptb-18">
              <div className="f-3">{title}</div>
              <div className="f-7">{value}</div>
            </div>
          )
        })}
        <div className="plr-30 ptb-20">
          <div className="mb-10">
            <Checkbox checked={hasReadTOS} onChange={() => setHasReadTOS((state) => !state)}>
              I have read and accept the{' '}
              <a target="_blank" href="./pdf/HoT-Privacy-Policy.pdf" className="link-text">
                Terms of service
              </a>
            </Checkbox>
          </div>
          <Checkbox
            checked={hasUnderstoodSF}
            onChange={() => setHasUnderstoodSF((state) => !state)}
          >
            <div>I understand the stability fee is not fixed and is likely to change over time</div>
          </Checkbox>
        </div>
      </Section>
      <div className="mt-50">
        <Button
          shape="round"
          className="w-160"
          onClick={() =>
            capturedDispatch({
              type: 'set-step',
              payload: -1,
            })
          }
        >
          Back
        </Button>
        <Button
          shape="round"
          className="w-160"
          type="primary"
          onClick={() =>
            capturedDispatch({
              type: 'set-step',
              payload: 1,
            })
          }
          disabled={!hasReadTOS || !hasUnderstoodSF || !enableSubmit}
        >
          Continue
        </Button>
      </div>
    </div>
  )
}

const CreateConfirmed = ({ hash, txState }: { hash: string; txState: string }) => {
  const { maker } = useMaker()
  const [waitTime, setWaitTime] = useState('8 minutes')
  const router = useNavigate()
  useEffect(() => {
    ;(async () => {
      const waitTime = await maker.service('gas').getWaitTime('fast')
      const minutes = Math.round(waitTime)
      const seconds = Math.round(waitTime * 6) * 10
      const waitTimeText =
        waitTime < 1 ? `${seconds} seconds` : `${minutes} ${minutes === 1 ? 'minute' : 'minutes'}`

      setWaitTime(waitTimeText)
    })()
  })

  return (
    <Section className="ptb-100 text-center">
      <p className="fz-22 mb-4">
        {txState === TxLifecycle.CONFIRMED
          ? 'Your treasury has been created'
          : 'Your treasury is being created'}
      </p>
      <div className="o-5">You can safely leave this page.`</div>
      <p className="mt-40 o-5">Transaction hash</p>
      <div className="mb-30">
        <TxLink hash={hash} />
      </div>
      <Button shape="round" type="primary" className="w-140" onClick={() => router(-1)}>
        Exit
      </Button>
    </Section>
  )
}

const CreateConfirmCDP = ({
  dispatch,
  cdpParams,
  selectedIlk,
  collateralTypesData,
}: StepComponentsProps) => {
  const { maker } = useMaker()
  const [enableSubmit, setEnableSubmit] = useState(true)

  const { gemsToLock, daiToDraw, txState } = cdpParams

  const [openCDPTxHash, setOpenCDPTxHash] = useState('')

  async function capturedDispatch(action: Action) {
    if (action.payload < 1) return dispatch(action)
    const txObject = maker
      .service('mcd:cdpManager')
      .openLockAndDraw(selectedIlk.symbol, selectedIlk.currency(gemsToLock), daiToDraw)

    setEnableSubmit(false)

    const txMgr = maker.service('transactionManager')
    txMgr.listen(txObject, {
      pending: (tx: PlainObject) => setOpenCDPTxHash(tx.hash),
      confirmed: () => {
        dispatch({ type: 'transaction-confirmed', payload: '' })
        // message.success('Your treasury has been created')
      },
      error: () => setEnableSubmit(true),
    })
    await txMgr.confirm(txObject, 1)
  }

  if (openCDPTxHash) return <CreateConfirmed hash={openCDPTxHash} txState={txState} />
  return (
    <CDPCreateConfirmSummary
      cdpParams={cdpParams}
      selectedIlk={selectedIlk}
      capturedDispatch={capturedDispatch}
      enableSubmit={enableSubmit}
      ilkData={collateralTypesData?.find((x) => x.symbol === selectedIlk.symbol)!}
    />
  )
}

export default CreateConfirmCDP
