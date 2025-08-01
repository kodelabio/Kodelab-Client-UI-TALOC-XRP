import { Button, Drawer } from 'antd'
import FilterComponent from './FilterComponent'
import React, { useState } from 'react'
import filterIcon from '@/assets/icons/filter-icon.svg'
import { CloseOutlined } from '@ant-design/icons'

const ReportDrawer = () => {
  const [open, setOpen] = useState(false)
  const [drawerVisible, setDrawerVisible] = useState(true)

  const showDrawer = () => setOpen(true)
  const closeDrawer = () => setOpen(false)

  const customHeader = (
    <div className="drawer-header">
      <h1 className="drawer-title">Filter</h1>
      <CloseOutlined onClick={closeDrawer} className="drawer-close-icon" />
    </div>
  )

  return (
    <>
      <img src={filterIcon} alt="Filter" onClick={showDrawer} style={{ cursor: 'pointer' }} />

      <Drawer
        title={customHeader}
        placement="right"
        closable={false}
        onClose={closeDrawer}
        open={open}
        width="25%"
        className="custom-report-drawer"
      >
        <p>This is your report content.</p>
        <FilterComponent visible={drawerVisible} onClose={() => setDrawerVisible(false)} />
      </Drawer>
    </>
  )
}

export default ReportDrawer
