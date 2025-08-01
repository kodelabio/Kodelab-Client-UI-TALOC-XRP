import { Avatar, Dropdown, Menu, Space, Tooltip, Typography } from 'antd'
import LogoutConfirmModal from './common/LogoutConfirmModal'
import React, { useState } from 'react'
import { useNavigate } from 'react-router'
import { UserOutlined, LogoutOutlined } from '@ant-design/icons'
import useUserMangement from '@/hooks/useUserMangement'

const { Text } = Typography

const UserProfile = () => {
  const { logout, user: useDetails } = useUserMangement()
  const router = useNavigate()
  const [logoutModalVisible, setLogoutModalVisible] = useState(false)

  const handleLogout = () => {
    sessionStorage.clear()
    logout()
    router('/users')
  }

  // Function to handle logout confirmation
  const handleLogoutConfirm = () => {
    // Close the modal
    setLogoutModalVisible(false)

    // Perform logout actions
    sessionStorage.clear()
    logout()
    router('/users')
  }

  // Function to cancel logout
  const handleLogoutCancel = () => {
    setLogoutModalVisible(false)
  }

  const menu = (
    <>
      <Menu>
        <Menu.Item key="profile" disabled style={{ cursor: 'default' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <Avatar src={useDetails.avatar} size="large" />
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <Text strong>{useDetails.name}</Text>
              <Text type="secondary" style={{ fontSize: '12px' }}>
                {useDetails.email}
              </Text>
            </div>
          </div>
        </Menu.Item>
        <Menu.Divider />
        <Tooltip title="Logout" placement="bottom">
          <Menu.Item
            key="logout"
            onClick={() => setLogoutModalVisible(true)}
            icon={<LogoutOutlined />}
          >
            Logout 
          </Menu.Item>
        </Tooltip>
      </Menu>
      <LogoutConfirmModal
        visible={logoutModalVisible}
        onCancel={handleLogoutCancel}
        onConfirm={handleLogoutConfirm}
      />
    </>
  )

  return (
    <Dropdown overlay={menu} placement="bottomRight" trigger={['click']}>
      <Space style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 12 }}>
        <Avatar src={useDetails.imageSrc} />
        <Text>{useDetails.name}</Text>
      </Space>
    </Dropdown>
  )
}

export default UserProfile
