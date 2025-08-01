import { Modal, Button } from 'antd'
import React from 'react'
import styled from 'styled-components'

const StyledModal = styled(Modal)`
  .ant-modal-content {
    background-color: #ffffff;
    border-radius: 12px;
    overflow: hidden;
  }

  .ant-modal-header {
    border-bottom: none;
    padding: 24px 24px 0;
  }

  .ant-modal-body {
    padding: 20px 20px!important
  }

  .ant-modal-footer {
    border-top: none;
    padding: 0 24px 24px;
  }

  .modal-title {
    font-size: 18px;
    font-weight: 600;
    margin-bottom: 8px;
  }

  .modal-message {
    font-size: 14px;
    color: #666;
    margin-bottom: 24px;
  }
`

const ButtonContainer = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 12px;
`

interface LogoutConfirmModalProps {
  visible: boolean
  onCancel: () => void
  onConfirm: () => void
  title?: string
  message?: string
}

const LogoutConfirmModal: React.FC<LogoutConfirmModalProps> = ({
  visible,
  onCancel,
  onConfirm,
  title = 'Confirm Logout',
  message = 'Are you sure you want to log out of your account?',
}) => {
  return (
    <StyledModal
      open={visible}
      onCancel={onCancel}
      footer={null}
      closable={false}
      centered
      width={400}
    >
      <div className="modal-title">{title}</div>
      <div className="modal-message">{message}</div>
      <ButtonContainer>
        <Button onClick={onCancel} style={{ padding: '4px 24px', borderRadius: 20 }}>
          Cancel
        </Button>
        <Button
          type="primary"
          onClick={onConfirm}
          danger
          style={{ padding: '4px 24px', borderRadius: 20 }}
        >
          Yes, Logout
        </Button>
      </ButtonContainer>
    </StyledModal>
  )
}

export default LogoutConfirmModal
