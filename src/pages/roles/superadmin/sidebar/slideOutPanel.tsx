import { Drawer } from 'antd'
import CloseIcon from '../../../../assets/icons/close.svg'
import '../../../../assets/theme/css/roles/superadmin/slideOutPanel.css'
import { useState, useEffect, useRef } from 'react'

export default function SlideOutPanel ({ open, onClose, client, getStatusClass, timeline }) {
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 767)

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 767)
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  //grabbing
  const [dragOffset, setDragOffset] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const panelRef = useRef(null)
  let startY = 0

  const handleTouchStart = e => {
    if (!isMobile) return
    setIsDragging(true)
    startY = e.touches[0].clientY
  }

  const handleTouchMove = e => {
    if (!isDragging) return
    const deltaY = e.touches[0].clientY - startY
    if (deltaY > 0) setDragOffset(deltaY)
  }

  const handleTouchEnd = () => {
    if (!isDragging) return
    setIsDragging(false)
    if (dragOffset > 100) {
      //100px - trigger to close
      onClose()
    }
    setDragOffset(0)
  }

  const [showStatusForm, setShowStatusForm] = useState(false)
  const [selectedStatus, setSelectedStatus] = useState('')
  const [comment, setComment] = useState('')

  useEffect(() => {
    if (client && open) {
      setSelectedStatus(client.status || '')
      setComment('')
      setShowStatusForm(false)
    }
  }, [client, open])

  if (!client) return null

  const handleChangeStatusClick = () => {
    setSelectedStatus(client.status || '')
    setComment('')
    setShowStatusForm(true)
  }

  const handleCancelStatus = () => {
    setShowStatusForm(false)
  }

  const handleStatusChange = e => {
    setSelectedStatus(e.target.value)
  }

  const handleCommentChange = e => {
    setComment(e.target.value)
  }

  const handleUpdateStatus = () => {
    setShowStatusForm(false)
  }

  return (
    <Drawer
      open={open}
      onClose={onClose}
      placement={isMobile ? 'bottom' : 'right'}
      width={isMobile ? '100%' : 530}
      height={isMobile ? '80vh' : undefined}
      closable={false}
      maskClosable={true}
      bodyStyle={{ padding: 0, background: 'transparent' }}
      className={`custom-sidebar-drawer${isMobile ? ' mobile' : ''}`}
    >
      <div
        className='sidebar-panel'
        ref={panelRef}
        onClick={e => e.stopPropagation()}
        style={
          isMobile
            ? {
                transform: `translateY(${dragOffset}px)`,
                transition: isDragging ? 'none' : 'transform 0.3s',
              }
            : {}
        }
      >
        <div
          className='grabber'
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        ></div>
        <div className='sidebar-header'>
          <div className='sidebar-title'>
            <h2>Status</h2>
          </div>
          <div className='sidebar-close' onClick={onClose}>
            <img src={CloseIcon} alt='close' />
          </div>
        </div>

        <div className='sidebar-subtitle'>
          <div className='sidebar-subtitle-info'>
            <div className='sidebar-subtitle-name'>
              <p>{client.name || ''}</p>
            </div>
            <div className={`sidebar-subtitle-status ${getStatusClass(client.status || '')}`}>
              <p>{client.status || ''}</p>
            </div>
          </div>
          <div className='change-status-btn' onClick={handleChangeStatusClick}>
            <p>Change status</p>
          </div>
        </div>

        {showStatusForm && (
          <div className='sidebar-status-form'>
            <div className='status-form-header'>
              <div className='status-form-header-text'>
                <p>Select status</p>
              </div>
              <div className='sidebar-status-select-wrapper'>
                <select
                  value={selectedStatus}
                  onChange={handleStatusChange}
                  className='sidebar-status-select'
                >
                  <option value='Pending'>Pending</option>
                  <option value='Completed'>Completed</option>
                  <option value='Inactive'>Inactive</option>
                  <option value='Active'>Active</option>
                </select>
              </div>
            </div>

            <div className='sidebar-status-comment-wrapper'>
              <div className='status-form-header-text'>
                <p>Add comment</p>
              </div>
              <div className='sidebar-status-comment'>
                <textarea
                  placeholder='Write here...'
                  value={comment}
                  onChange={handleCommentChange}
                />
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div className='sidebar-status-update-btn' onClick={handleUpdateStatus}>
                <p>Update status</p>
              </div>
              <div className='sidebar-status-cancel-btn' onClick={handleCancelStatus}>
                <p>Cancel</p>
              </div>
            </div>
          </div>
        )}

        {timeline &&
          timeline.map(section => (
            <div className='sidebar-section' key={section.date}>
              <div className='sidebar-section-title'>
                <p>{section.date}</p>
              </div>
              {section.items.map((item, idx) => (
                <div className='sidebar-item' key={idx}>
                  <div className='sidebar-dot-wrapper'>
                    <div className={`sidebar-dot sidebar-dot--${item.dotColor}`} />
                    <div className='sidebar-dot-line'></div>
                  </div>
                  <div className='sidebar-item-content'>
                    <div className='sidebar-item-header'>
                      <div className='sidebar-item-title'>
                        <p>{item.title}</p>
                      </div>
                      {item.badge && (
                        <div className={`sidebar-badge sidebar-badge--${item.badge.type}`}>
                          <div
                            className={`sidebar-badge-dot sidebar-badge-dot--${item.badge.type}`}
                          ></div>
                          <div className='sidebar-badge-text'>
                            <p>{item.badge.text}</p>
                          </div>
                        </div>
                      )}
                    </div>
                    <div className='sidebar-item-author'>
                      <p>by {item.author}</p>
                    </div>
                    {item.message && <div className='sidebar-item-message'>{item.message}</div>}
                  </div>
                </div>
              ))}
            </div>
          ))}
      </div>
    </Drawer>
  )
}
