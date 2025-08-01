import { Dropdown, Menu, Button } from 'antd'
import React from 'react'

interface DropdownOption {
  key: string
  label: string
}

interface CommonDropdownProps {
  options: DropdownOption[]
  onSelect: (key: string) => void
  label?: string
}

const CommonDropdown: React.FC<CommonDropdownProps> = ({ options, onSelect, label = 'Select' }) => {
  const menu = <Menu onClick={({ key }) => onSelect(key)} items={options} />

  return (
    <Dropdown overlay={menu} trigger={['click']}>
      <Button>{label}</Button>
    </Dropdown>
  )
}

export default CommonDropdown
