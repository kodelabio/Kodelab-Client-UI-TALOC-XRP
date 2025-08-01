import { Drawer, Input, Select, Button } from 'antd'
import { message } from 'antd'
import React, { useState, useEffect } from 'react'

const { Option } = Select

const EditAccountDrawer = ({ open, onClose, userData, onSave }) => {
  const [fullName, setFullName] = useState(userData?.name || '')
  const [email] = useState(userData?.email || '')
  const [role, setRole] = useState(userData?.role || 'Operator')
  const [windowWidth, setWindowWidth] = useState(window.innerWidth)

  // Update window width when resized
  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth)
    }

    window.addEventListener('resize', handleResize)
    return () => {
      window.removeEventListener('resize', handleResize)
    }
  }, [])

  // Calculate drawer width based on screen size
  const getDrawerWidth = () => {
    if (windowWidth <= 576) {
      return '100%' // Full width on mobile
    } else if (windowWidth <= 768) {
      return '80%' // 80% width on small tablets
    } else {
      return 480 // Original width for larger screens
    }
  }

  const handleSave = () => {
    onSave({ fullName, email, role })
    onClose()
    message.info('Coming soon 🚀')
  }

  return (
    <Drawer
      title="Edit account details"
      placement="right"
      onClose={onClose}
      open={open}
      width={getDrawerWidth()}
      className="edit-account-drawer"
      footer={
        <div
          className="drawer-footer"
          style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}
        >
          <Button
            onClick={onClose}
            style={{
              padding: windowWidth <= 576 ? '4px 16px' : '4px 24px',
              borderRadius: 20,
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            style={{
              padding: windowWidth <= 576 ? '4px 16px' : '4px 24px',
              borderRadius: 20,
              backgroundColor: '#FFFFFF',
              color: '#4686EF',
              border: '1px solid #4686EF',
            }}
          >
            Save
          </Button>
        </div>
      }
    >
      <div className="drawer-input-group">
        <label className="drawer-label">Full name</label>
        <Input value={fullName} onChange={(e) => setFullName(e.target.value)} />
      </div>

      <div className="drawer-input-group">
        <label className="drawer-label">Role</label>
        <Select value={role} onChange={setRole} className="role-select" style={{ width: '100%' }}>
          <Option value="Operator">Operator</Option>
          <Option value="Admin">Admin</Option>
          <Option value="Viewer">Viewer</Option>
          <Option value="Manager">Manager</Option>
        </Select>
      </div>

      <div className="drawer-input-group">
        <label className="drawer-label">Email</label>
        <Input value={email} disabled />
      </div>
    </Drawer>
  )
}

export default EditAccountDrawer
