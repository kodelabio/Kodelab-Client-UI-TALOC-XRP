import { Currency } from '@makerdao/currency'
import BigNumber from 'bignumber.js'
import round from 'lodash/round'

export function cleanSymbol(s: any) {
  if (s === 'DSR-DAI') return ' HGBP'
  if (s === 'DAI') return ' HGBP'
  if (s === 'USD') return 'GBP'
  if (s.startsWith('USD/')) return 'GBP/' + s.substr(4)

  return s
}

export function formatCollateralizationRatio(ratio: any) {
  if (ratio === Infinity) return 'N/A'
  if (isNaN(ratio)) return '---'
  if (ratio < 0) ratio = 0
  return `${ratio.toFixed(2)}%`
}

export function formatLiquidationPrice(price: number, symbol: string) {
  if (price < 0) price = 0
  return `${round(price, 2).toLocaleString()} ${symbol}/GBP`
}

function getSeparator(locale: string, separatorType: any) {
  const numberWithGroupAndDecimalSeparator = 1000.1
  const numFormat = Intl.NumberFormat(locale)
  return numFormat.formatToParts
    ? numFormat
        .formatToParts(numberWithGroupAndDecimalSeparator)
        .find((part) => part.type === separatorType)?.value
    : null
}

export function prettifyNumber(_num: any, truncate = false, decimalPlaces = 2, keepSymbol = true) {
  if (!_num) return 0
  let symbol = ''
  if (_num.symbol !== undefined) symbol += ' ' + cleanSymbol(_num.symbol)
  const num = parseFloat(_num.toString())
  if (num > Number.MAX_SAFE_INTEGER) return '-'
  let formattedNumber
  if (truncate) {
    if (num > 999999999999) formattedNumber = (num / 1000000000000).toFixed(2) + 'T'
    else if (num > 999999999) formattedNumber = (num / 1000000000).toFixed(2) + 'B'
    else if (num > 999999) formattedNumber = (num / 1000000).toFixed(2) + 'M'
    else if (num > 999) formattedNumber = (num / 1000).toFixed(2) + 'K'
    else if (num === 99.99) formattedNumber = 100
    else if (num > 1) formattedNumber = num.toFixed(2)
    else if (num < 1) formattedNumber = num === 0 ? num.toFixed(2) : num.toFixed(4)
    else if (num < 0.001) formattedNumber = num === 0 ? num.toFixed(2) : num.toFixed(6)
    else if (num < 0.00001) formattedNumber = num === 0 ? num.toFixed(2) : num.toFixed(8)
    else if (num < 0.0000001) formattedNumber = num === 0 ? num.toFixed(2) : num.toFixed(10)
    else formattedNumber = num.toFixed(decimalPlaces)
  } else {
    let decimal = decimalPlaces
    if (num < 1 && num !== 0) decimal = 4
    if (num < 0.001 && num !== 0) decimal = 6
    if (num < 0.00001 && num !== 0) decimal = 8
    if (num < 0.0000001 && num !== 0) decimal = 10
    else if (decimal == null && num < 999999999) decimal = 2

    formattedNumber = num.toLocaleString('en-us', {
      minimumFractionDigits: decimal,
      maximumFractionDigits: decimal,
    })
  }
  return keepSymbol ? formattedNumber + symbol : formattedNumber
}

const { short, medium, long } = {
  long: 6,
  medium: 4,
  short: 2,
}

export const formatCurrencyValue = ({
  value,
  precision = short,
  percentage = false,
  integer = false,
  infinity = 'N/A',
  rounding = BigNumber.ROUND_DOWN,
}: any) => {
  if (value instanceof Currency) value = (value as any).toBigNumber()
  else if (!BigNumber.isBigNumber(value)) value = new BigNumber(value)
  if (['Infinity', Infinity].includes(value.toFixed(precision))) return infinity
  if (percentage) value = value.times(100)
  if (integer) value = value.integerValue(BigNumber.ROUND_HALF_UP)
  if (value.lt(1) && rounding === BigNumber.ROUND_DOWN) {
    precision = value.eq(0) ? short : medium
  }
  return value.toFixed(precision, rounding)
}

export function formatter(target: any, options = {}) {
  return formatCurrencyValue({ value: target, ...options })
}

export function formatDate(d: any) {
  return (
    d.toLocaleDateString('en-us', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }) +
    ', ' +
    d.toLocaleTimeString('en-us')
  )
}

export function prettifyFloat(num: number, decimalPlaces = 2) {
  if (!num && num !== 0) return 'NaN'
  const [, decimalPortion] = num.toString().split('.')
  const decimalPlacesInNumber = decimalPortion ? decimalPortion.length : 0

  return decimalPlacesInNumber > decimalPlaces ? `${num.toFixed(decimalPlaces)}...` : num
}

export function formatEventDescription(e: Record<string, any>) {
  const { amount, gem } = e

  const prettifyAmount = prettifyCurrency(amount, 2)
  switch (e.type) {
    case 'OPEN':
      return `Opened a new treasury with id #${e.id}`
    case 'DEPOSIT':
      return `Deposited ${prettifyAmount} ${gem} into treasury`
    case 'RECLAIM':
      return `Reclaimed ${prettifyAmount} ${gem} after auction(s)`
    case 'DSR_DEPOSIT':
      return `Deposited ${prettifyAmount}  HGBP`
    case 'DSR_WITHDRAW':
      return `Withdraw ${prettifyAmount}  HGBP`
    case 'WITHDRAW':
      return `Withdraw ${prettifyAmount} ${gem} from treasury`
    case 'GENERATE':
      return `Generated ${prettifyAmount} new  HGBP from treasury`
    case 'PAY_BACK':
      return `Repaid ${prettifyAmount}  HGBP to treasury`
    case 'GIVE':
      return `Treasury given to ${e.newOwner} by ${e.prevOwner}`
    case 'MIGRATE':
      return 'Treasury upgraded from SCD'
    case 'BITE':
      return `Auctioned ${prettifyAmount} ${gem} from treasury`
    case 'DSR_HARVEST':
      return `Harvest`
    default:
      return '?'
  }
}

export function prettifyCurrency(num = 0, decimalPlaces = 0) {
  if (num === null) return null
  if (decimalPlaces && num < 1) decimalPlaces = 2
  return new BigNumber(num).toFormat(decimalPlaces, BigNumber.ROUND_CEIL, {
    decimalSeparator: getSeparator('en-us', 'decimal') || '.',
    groupSeparator: getSeparator('en-us', 'group')!,
    groupSize: 3,
  })
}

export function safeToFixed(amount: string | number | BigNumber, digits: number) {
  if (typeof amount === 'string') amount = parseFloat(amount)
  const s = amount.toFixed(digits)
  return s.substring(0, s.length - 1)
}
