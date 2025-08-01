import { Modal, Button } from 'antd'

// For custom styles

const RemoveTeamMemberModal = ({ visible, email, onCancel, onConfirm }) => {
  return (
    <Modal open={visible} footer={null} closable={false} centered className="remove-team-modal">
      <h2 className="modal-title">Remove a team member</h2>
      <p className="modal-message">
        Are you sure you want to remove <strong>{email}</strong> from the team?
      </p>
      <p className="modal-subtext">They will immediately lose access to their account</p>

      <div className="modal-actions">
        <Button onClick={onCancel} className="cancel-btn">
          Cancel
        </Button>
        <Button onClick={onConfirm} className="remove-btn">
          Remove
        </Button>
      </div>
    </Modal>
  )
}

export default RemoveTeamMemberModal
