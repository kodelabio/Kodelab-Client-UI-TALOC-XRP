import { Switch } from 'antd'
import useTokenAllowance from '@/hooks/useTokenAllowance'

const TokenAllowance = ({
  token = 'DAI',
  amount = 0,
}: {
  token?: string
  amount: string | number
}) => {
  const { setAllowance, allowanceLoading, hasSufficientAllowance } = useTokenAllowance(token)
  const isHasSufficientAllowance = hasSufficientAllowance(amount)
  const displayTokenName = token === 'DAI' ? ' HGBP' : token
  return !isHasSufficientAllowance && amount ? (
    <div className="row-between fz-16 ptb-20">
      {allowanceLoading
        ? `Unlocking ${displayTokenName}...`
        : `Unlock ${displayTokenName} to continue`}
      <Switch
        checked={isHasSufficientAllowance}
        onChange={setAllowance}
        loading={allowanceLoading}
      />
    </div>
  ) : null
}

export default TokenAllowance
