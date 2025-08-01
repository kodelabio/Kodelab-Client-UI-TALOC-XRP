import { Button, Input } from 'antd'
import Grid from '../../../components/layout/Grid'
import Section from '../../../components/layout/Section'
import { StepComponentsProps } from '../CreateVault'
import { DAI } from '@/maker'
import BigNumber from 'bignumber.js'
import RatioDisplay, { RatioDisplayTypes } from '@/components/RatioDisplay'
import { cdpParamsAreValid, getMaxDaiAvailable } from '@/utils/cdp'
import { formatCollateralizationRatio, prettifyNumber, formatter } from '@/utils/ui'

type FromProps = {
  selectedIlk: StepComponentsProps['selectedIlk']
  cdpParams: StepComponentsProps['cdpParams']
  collateralizationRatio: CurrencyRatio
  handleInputChange: (event: React.ChangeEvent<HTMLInputElement>) => void
  ilkData: CollateralTypeData
}
function OpenCDPForm({
  selectedIlk,
  cdpParams,
  collateralizationRatio,
  handleInputChange,
  ilkData,
}: FromProps) {
  let {
    calculateMaxDai,
    liquidationRatio,
    debtFloor,
    collateralDebtAvailable: _collateralDebtAvailable,
  } = ilkData

  const collateralDebtAvailable = _collateralDebtAvailable?.toBigNumber()

  const daiAvailable = calculateMaxDai(new BigNumber(1))
  const daiAvailableToGenerate = daiAvailable.gt(collateralDebtAvailable)
    ? collateralDebtAvailable.lt(debtFloor)
      ? new BigNumber(0)
      : collateralDebtAvailable
    : daiAvailable

  const belowDustLimit = debtFloor?.gt(new BigNumber(cdpParams.daiToDraw))
  const aboveDebtCeiling =
    collateralDebtAvailable?.lt(new BigNumber(cdpParams.daiToDraw)) &&
    collateralDebtAvailable?.gte(debtFloor)

  const negDebtAvailable = collateralDebtAvailable?.lt(debtFloor)

  const userCanDrawDaiAmount = daiAvailable?.gte(
    new BigNumber(cdpParams.daiToDraw === '' ? '0' : cdpParams.daiToDraw),
  )

  return (
    <Grid gap={8}>
      <div>The NFT you lock up determines how much  HGBP you can generate.</div>
      <p className="fz-16">You lock up NFT: {selectedIlk.gem}</p>
      <div className="fz-16 mt-36">How much  HGBP would you like to generate?</div>
      <p className="o-5 mb-10">Generate an amount that is safely above the liquidation ratio.</p>
      <Input
        name="daiToDraw"
        addonAfter=" HGBP"
        style={{ maxWidth: 400 }}
        type="number"
        value={cdpParams.daiToDraw}
        onChange={handleInputChange}
      />
      <p className="c-red">
        {(belowDustLimit
          ? `A treasury requires a minimum of ${debtFloor}  HGBP to be generated`
          : null) ||
          (userCanDrawDaiAmount ? null : 'Treasury below liquidation threshold') ||
          (aboveDebtCeiling
            ? `The amount of  HGBP you are trying to generate exceeds the amount of  HGBP available. Please enter less than ${formatter(
                collateralDebtAvailable,
              )}  HGBP`
            : null) ||
          (negDebtAvailable
            ? 'Debt ceiling has been reached. There is currently no  HGBP available for this collateral type.'
            : null)}
      </p>
      <Grid key="keytodrawinfo">
        <div className="row">
          <div>Max avail to generate</div>
          <p className="ml-10">{formatter(daiAvailableToGenerate)}  HGBP</p>
        </div>
        <RatioDisplay
          type={RatioDisplayTypes.TEXT}
          text="The amount of  HGBP you are generating is putting your treasury at risk of liquidation"
          ratio={formatter(collateralizationRatio)}
          ilkLiqRatio={formatter(liquidationRatio, { percentage: true })}
          onlyWarnings={true}
          t="caption"
        />
      </Grid>
    </Grid>
  )
}

const DepositNft = ({
  selectedIlk,
  cdpParams,
  hasSufficientAllowance,
  collateralTypesData,
  hasAllowance,
  dispatch,
}: StepComponentsProps) => {
  const { gemsToLock, daiToDraw } = cdpParams
  const ilkData = collateralTypesData?.find((x) => x.symbol === selectedIlk.symbol)!
  const { calculateMaxDai, debtFloor } = ilkData
  const daiAvailable = calculateMaxDai(new BigNumber(gemsToLock || '0'))

  const collateralizationRatio = ilkData.calculateCollateralizationRatio(
    new BigNumber(gemsToLock || '0'),
    DAI(daiToDraw || '0'),
  )

  function handleInputChange({ target }: React.ChangeEvent<HTMLInputElement>) {
    if (parseFloat(target.value) < 0) return
    dispatch({
      type: `form/set-daiToDraw`,
      payload: { value: target.value },
    })
  }

  const canProgress =
    cdpParamsAreValid(cdpParams, selectedIlk.userGemBalance, debtFloor, daiAvailable) &&
    hasSufficientAllowance(cdpParams.gemsToLock, 0)

  let liquidationPriceDisplay = prettifyNumber(
    ilkData.calculateliquidationPrice(
      selectedIlk.currency(cdpParams.gemsToLock),
      DAI(cdpParams.daiToDraw || '0'),
    ),
    true,
  )
  if ([Infinity, 'Infinity'].includes(liquidationPriceDisplay)) liquidationPriceDisplay = '0.0000'

  return (
    <div>
      <div className="fz-18 mt-20 mb-4">Lock up your NFT and generate  HGBP</div>
      <p className="mb-30 o-5">
        Different collateral types have different risk parameters and collateralization ratios.
      </p>
      <div className="flex">
        <Section className="f-6">
          <div className="p-30">
            <OpenCDPForm
              cdpParams={cdpParams}
              handleInputChange={handleInputChange}
              selectedIlk={selectedIlk}
              ilkData={ilkData}
              collateralizationRatio={collateralizationRatio}
            />
          </div>
        </Section>
        <Section className="f-4 ml-40">
          <div className="bd-bottom p-20">
            <p className="mb-4 fz-13 o-7">Collateralization ratio</p>
            <RatioDisplay
              type={RatioDisplayTypes.TEXT}
              text={`${formatCollateralizationRatio(collateralizationRatio)} (Min ${
                +prettifyNumber(ilkData.liquidationRatio, true, 2, false) * 100
              }%)`}
              ratio={formatter(collateralizationRatio)}
              ilkLiqRatio={formatter(ilkData.liquidationRatio, {
                percentage: true,
              })}
              t="caption"
            />
          </div>
          <div className="bd-bottom p-20">
            <p className="mb-4 fz-13 o-7">Liquidation price</p>
            <div> {liquidationPriceDisplay}</div>
          </div>
          <div className="bd-bottom p-20">
            <p className="mb-4 fz-13 o-7">Current {selectedIlk.gem} price</p>
            <div> {prettifyNumber(ilkData.collateralTypePrice, true, 2, false)} GBP</div>
          </div>
          <div className="p-20">
            <p className="mb-4 fz-13 o-7">Max  HGBP available to generate</p>
            <div>{formatter(getMaxDaiAvailable(ilkData))}</div>
          </div>
        </Section>
      </div>
      <div className="mt-50">
        <Button
          shape="round"
          className="w-160"
          onClick={() => dispatch({ type: 'set-step', payload: hasAllowance ? -2 : -1 })}
        >
          Back
        </Button>
        <Button
          shape="round"
          className="w-160"
          type="primary"
          onClick={() => dispatch({ type: 'set-step', payload: 1 })}
          disabled={!canProgress}
        >
          Continue
        </Button>
      </div>
    </div>
  )
}
export default DepositNft
