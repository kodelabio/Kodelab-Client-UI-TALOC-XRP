import BigNumber from 'bignumber.js'

export function stringToBytes(str: string) {
  return '0x' + Buffer.from(str).toString('hex')
}

export function bytesToString(hex: string) {
  return Buffer.from(hex.replace(/^0x/, ''), 'hex').toString().replace(/\x00/g, '') // eslint-disable-line no-control-regex
}

export function padRight(string: string, chars: number, sign?: string) {
  return string + new Array(chars - string.length + 1).join(sign ? sign : '0')
}

export function toHex(str: string, { with0x = true, rightPadding = 64 } = {}) {
  let result = ''
  for (let i = 0; i < str.length; i++) {
    result += str.charCodeAt(i).toString(16)
  }
  if (rightPadding > 0) result = padRight(result, rightPadding)
  return with0x ? '0x' + result : result
}

export function fromRay(value: string | number) {
  return new BigNumber(value).shiftedBy(-27)
}

export function fromRad(value: string | number) {
  return new BigNumber(value).shiftedBy(-45)
}

export const isValidAddressString = (addressString: string) =>
  /^0x([A-Fa-f0-9]{40})$/.test(addressString)
