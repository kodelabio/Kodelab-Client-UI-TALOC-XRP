import { greaterThan } from './bignumber'
import assert from 'assert'
import BigNumber from 'bignumber.js'

export function cdpParamsAreValid(
  { gemsToLock, daiToDraw }: any,
  userGemBalance: any,
  debtFloor: any,
  daiAvailable: any,
) {
  // must not open empty cdp or cdp with no dai value
  if (!gemsToLock || !daiToDraw) return false // we technically can do this, but TODO figure out if we should
  // must lock collateral in order to draw dai
  if (!!daiToDraw && !gemsToLock) return false
  // must be positive
  if (parseFloat(daiToDraw) < 0 || parseFloat(gemsToLock) < 0) return false
  // must have enough tokens
  // if (greaterThan(gemsToLock, userGemBalance)) return false;
  // must open a cdp above the liquidation threshold
  if (greaterThan(daiToDraw, daiAvailable)) return false
  // must draw more dai than the dust limit
  if (greaterThan(debtFloor, daiToDraw)) return false
  return true
}

export function getMaxDaiAvailable({ collateralDebtAvailable }: any) {
  const collateralDebtAvailableBN = collateralDebtAvailable?.toBigNumber()

  return collateralDebtAvailableBN?.lt(0) ? new BigNumber(0) : collateralDebtAvailableBN
}
