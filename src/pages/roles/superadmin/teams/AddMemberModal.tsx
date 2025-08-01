import { Modal, Input, Select, Button } from 'antd'
import { message } from 'antd'
import React, { useState } from 'react'
import { CloseOutlined } from '@ant-design/icons'

const { Option } = Select

const AddMemberModal = ({ visible, onCancel, onAdd }) => {
  const [emails, setEmails] = useState<string[]>([])
  const [inputValue, setInputValue] = useState('')
  const [role, setRole] = useState('Operator')

  const handleChange = (value: string[]) => setEmails(value)
  const handleRoleChange = (value: string) => setRole(value)

  const handleAdd = () => {
    onAdd({ emails, role })
    setEmails([])
    setInputValue('')
    message.info('Coming soon 🚀')
  }

  return (
    <Modal
      title="Add a member"
      open={visible}
      onCancel={onCancel}
      footer={null}
      className="add-member-modal"
      closeIcon={<CloseOutlined />}
    >
      <div className="label">Emails</div>
      <div className="input-row">
        <Input
          placeholder="For example, name@company.io"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onPressEnter={() => {
            if (inputValue) {
              setEmails([...emails, inputValue])
              setInputValue('')
            }
          }}
        />
        <Select value={role} onChange={handleRoleChange} className="role-select">
          <Option value="Operator">Operator</Option>
          <Option value="Admin">Admin</Option>
          <Option value="Viewer">Viewer</Option>
          <Option value="Manager">Manager</Option>
        </Select>
      </div>

      <div className="email-tags">
        {emails.map((email, idx) => (
          <span key={idx} className="email-tag">
            {email}
            <span className="remove" onClick={() => setEmails(emails.filter((_, i) => i !== idx))}>
              ×
            </span>
          </span>
        ))}
      </div>

      <div className="footer">
        <Button onClick={onCancel} style={{ padding: '4px 24px', borderRadius: 20 }}>
          Cancel
        </Button>
        <Button
          type="primary"
          onClick={handleAdd}
          style={{ backgroundColor: '#0C4FAD', padding: '4px 24px', borderRadius: 20 }}
        >
          Add
        </Button>
      </div>
    </Modal>
  )
}

export default AddMemberModal
