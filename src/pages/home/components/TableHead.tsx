import { Tooltip } from 'antd'
import { QuestionCircleOutlined } from '@ant-design/icons'

export const tableHead = [
  '',
  'Collateral type',
  <Tooltip title="The fee calculated based on the outstanding debt of your treasury. This is continuously added to your existing debt.">
    Stability fee
    <QuestionCircleOutlined className="ml-6" />
  </Tooltip>,
  <Tooltip title="The collateral-to-hgbp ratio at which the treasury becomes vulnerable to liquidation.">
    Liq ratio
    <QuestionCircleOutlined className="ml-6" />
  </Tooltip>,
  <Tooltip title="This is the additional fee that you will pay on top of your debt when your position is liquidated. There could also be other costs involved depending on the price your collateral is sold">
    Liq fee
    <QuestionCircleOutlined className="ml-6" />
  </Tooltip>,
  'Hgbp available',
  '',
]
