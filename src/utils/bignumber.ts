import BigNumber from 'bignumber.js'

type Bn = string | number | BigNumber
export function equalTo(numberOne: Bn, numberTwo: Bn) {
  return new BigNumber(numberOne.toString()).comparedTo(new BigNumber(numberTwo.toString())) === 0
}

export function greaterThan(numberOne: Bn, numberTwo: Bn) {
  return new BigNumber(numberOne.toString()).comparedTo(new BigNumber(numberTwo.toString())) === 1
}

export function greaterThanOrEqual(numberOne: Bn, numberTwo: Bn) {
  return new BigNumber(numberOne.toString()).comparedTo(new BigNumber(numberTwo.toString())) >= 0
}

export function subtract(numberOne: Bn, numberTwo: Bn) {
  return new BigNumber(numberOne.toString()).minus(new BigNumber(numberTwo.toString())).toFixed()
}

export function add(numberOne: Bn, numberTwo: Bn) {
  return new BigNumber(numberOne.toString()).plus(new BigNumber(numberTwo.toString())).toFixed()
}

export function multiply(numberOne: Bn, numberTwo: Bn) {
  return new BigNumber(numberOne.toString()).times(new BigNumber(numberTwo.toString())).toFixed()
}

export function divide(numberOne: Bn, numberTwo: Bn) {
  return new BigNumber(numberOne.toString())
    .dividedBy(new BigNumber(numberTwo.toString()))
    .toFixed()
}

export function minimum(numberOne: Bn, numberTwo: Bn) {
  return BigNumber.min(numberOne.toString(), numberTwo.toString()).toFixed()
}

export function maximum(numberOne: Bn, numberTwo: Bn) {
  return BigNumber.max(numberOne.toString(), numberTwo.toString()).toFixed()
}

export function BN(number: Bn) {
  return new BigNumber(number)
}
