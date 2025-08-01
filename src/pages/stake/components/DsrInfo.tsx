import { useEffect, useState, useRef, useCallback } from 'react'

type TickProps = {
  amount: number
  increment: number
  decimals: number
  lastTime: number
}
function Ticker({ amount, increment, decimals, lastTime }: TickProps) {
  const [counter, setCounter] = useState(amount)
  const requestRef = useRef(0)
  const animate = useCallback(() => {
    setCounter((Date.now() - lastTime) * increment)
    requestRef.current = requestAnimationFrame(animate)
  }, [increment, lastTime])

  useEffect(() => {
    if (amount) {
      animate()
    }
    return () => cancelAnimationFrame(requestRef.current)
  }, [animate, amount])
  return <div>{amount > 0 ? counter.toFixed(decimals) : (0).toFixed(decimals)}</div>
}

function DSRInfo({ savings, token }: { savings: SavingData; token: string }) {
  const { daiSavingsRate, dateEarningsLastAccrued, daiLockedInDsr: locked } = savings
  const decimals = locked.lt(0.00000001) || locked.gt(100000) ? 4 : locked.lt(1000) ? 8 : 6

  // 每秒利息 = (dsr利率 - 1) * 存款额
  const amountChangePerSecond = daiSavingsRate.minus(1).times(locked)
  // 上次chi改变距离现在时间
  const secondsSinceDrip = (Date.now() - dateEarningsLastAccrued.getTime()) / 1000
  // 累计利息 = 每秒利息 * 上次chi改变距离现在时间
  const accruedInterestSinceDrip = amountChangePerSecond.times(secondsSinceDrip)
  // 每毫秒利息
  const amountChangePerMillisecond = amountChangePerSecond.div(1000)

  return (
    <div className="row">
      <Ticker
        amount={accruedInterestSinceDrip.toNumber()}
        increment={amountChangePerMillisecond.toNumber()}
        lastTime={dateEarningsLastAccrued.getTime()}
        decimals={decimals}
      />
      <span className="fz-18 ml-10">{token}</span>
    </div>
  )
}

export default DSRInfo
