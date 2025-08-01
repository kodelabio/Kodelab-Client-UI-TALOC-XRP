import BigNumber from 'bignumber.js'

export const SAFETY_LEVELS = {
  DANGER: 'danger',
  WARNING: 'warning',
  NEUTRAL: 'neutral',
  SAFE: 'safe',
}

export function getSafetyLevels({ level, overrides = {} }: any) {
  const levels = {
    textColor: '700',
    backgroundColor: '400',
    borderColor: '100',
  }
  const { DANGER, WARNING, NEUTRAL, SAFE } = SAFETY_LEVELS
  const colorPairings = {
    [DANGER]: '#f50',
    [WARNING]: '#faad14',
    [NEUTRAL]: '#999',
    [SAFE]: '#389e0d',
  }

  return Object.entries(levels).reduce(
    (acc, [k, v]) => ({
      ...acc,
      [k]: overrides[k] ? overrides[k] : `${colorPairings[level]}`,
    }),
    {} as any,
  )
}

function lookupCDPSafetyLevel(ratio: any, ilkLiqRatio: any) {
  const dangerThreshold = new BigNumber(0.1).times(ilkLiqRatio).plus(ilkLiqRatio)
  const warningThreshold = new BigNumber(0.5).times(ilkLiqRatio).plus(ilkLiqRatio)
  let level
  if (ratio.lt(dangerThreshold)) level = SAFETY_LEVELS.DANGER
  else if (ratio.lt(warningThreshold)) level = SAFETY_LEVELS.WARNING
  else level = SAFETY_LEVELS.SAFE
  return { level, dangerThreshold, warningThreshold }
}

export const RatioDisplayTypes = {
  CARD: 'card',
  TEXT: 'text',
  PERCENTAGE: 'percentage',
}

export default function RatioDisplay({
  type = null,
  ratio,
  ilkLiqRatio,
  active,
  text,
  show = true,
  onlyWarnings = false,
  ...props
}: any) {
  if (!ratio || ratio === Infinity) return null
  if (!BigNumber.isBigNumber(ratio)) ratio = new BigNumber(ratio)

  if (!BigNumber.isBigNumber(ilkLiqRatio)) ilkLiqRatio = new BigNumber(ilkLiqRatio)

  const { level, warningThreshold } = lookupCDPSafetyLevel(ratio, ilkLiqRatio)
  const showDisplay =
    show && (onlyWarnings ? ratio.lt(warningThreshold) && ratio.gte(ilkLiqRatio) : true)

  const overrides =
    level === SAFETY_LEVELS.WARNING && type === RatioDisplayTypes.CARD
      ? { textColor: '#826318' }
      : undefined
  const { textColor, backgroundColor, borderColor } = getSafetyLevels({
    level,
    overrides,
  })

  switch (type) {
    case RatioDisplayTypes.TEXT:
      return showDisplay ? <span style={{ color: textColor }}>{text}</span> : null
    case RatioDisplayTypes.CARD:
      return showDisplay ? <span style={{ color: textColor }}>{text}</span> : null
    case RatioDisplayTypes.PERCENTAGE:
    default:
      return showDisplay && isFinite(ratio) ? (
        <span style={{ color: textColor }}>{ratio.toString()}%</span>
      ) : null
  }
}
