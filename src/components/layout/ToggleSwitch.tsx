import { Segmented } from 'antd'

const ToggleSwitch = ({ selected, onSelect }) => {
  return (
    <Segmented
      options={['Week', 'Month', 'Year']}
      value={selected}
      onChange={onSelect}
      className="custom-toggle-switch"
    />
  )
}

export default ToggleSwitch
