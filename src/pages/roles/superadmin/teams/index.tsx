import { message } from 'antd'
import AddMemberModal from './AddMemberModal'
import EditAccountDrawer from './EditAccountDrawer'
import RemoveTeamMemberModal from './RemoveTeamMemberModal'
import { useCallback, useEffect, useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import deleteIcon from '@/assets/icons/delete-icon.svg'
import editIcon from '@/assets/icons/edit-icon.svg'
import searchIcon from '@/assets/icons/search-icon.svg'
import spinner from '@/assets/img/kodelab-spinner-spin.gif'
import FooterLogo from '@/assets/img/logo-kodelab-footer.png'
import '@/assets/theme/css/modal.css'
import apiService from '@/services/apiService'
import { useSessionStorage } from 'usehooks-ts'
import CommonDropdown from '@/components/common/Dropdown'
import useUserMangement from '@/hooks/useUserMangement'

export default () => {
  const [allTeams, setAllTeams] = useSessionStorage('allTeams', []) //useState([])
  const [filteredTeams, setFilteredTeams] = useState([])

  const { logout, user, checkLogin } = useUserMangement()

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const location = useLocation()
  const navigate = useNavigate()

  const [filter, setFilter] = useState(null) //useState([])
  const [isModalVisible, setIsModalVisible] = useState(false)

  const [selectedUser, setSelectedUser] = useState(null)
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)

  const [isRemoveMemberModalOpen, setRemoveMemberModalOpen] = useState(false)

  // bank/teams

  function getRoleFromRoutes(routes) {
    const hasBank = routes.includes('bank')
    const hasTeams = routes.includes('teams')
    const hasCustomers = routes.includes('customers')

    if (hasBank && hasTeams) {
      return 'CLIENT_ADMIN'
    }

    if (hasBank && hasCustomers) {
      return 'CLIENT_END_USER'
    }

    return null // Or some default role
  }

  const getAllClients = useCallback(async () => {
    setLoading(true)
    try {
      const pathSegments = location.pathname.split('/')
      setError(null)

      const response = await apiService.getAllTeamsById(user.id)
      let clients = response?.data || []

      // Check user role and route role to apply the correct filter
      if (
        user.role?.code === 'CLIENT_ADMIN' &&
        getRoleFromRoutes(pathSegments) === 'CLIENT_ADMIN'
      ) {0x8CA98bfb2A38b9E656d54424f96FbE87549C8669
        // Filter for CLIENT_ADMIN role
        clients = clients.filter((client) => client?.role?.code === 'CLIENT_ADMIN')
      } else if (

        user.role?.code === 'CLIENT_ADMIN' &&
        getRoleFromRoutes(pathSegments) === 'CLIENT_END_USER'
      ) {
        // Filter for CLIENT_END_USER role

        clients = clients.filter((client) => client?.role?.code === 'CLIENT_END_USER')
      }
      // Set the filtered clients
      setAllTeams(clients)
      setFilteredTeams(clients)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch clients')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    setAllTeams([])
    getAllClients()
  }, [location, navigate])

  // Implement the search function
  const handleUserSearch = (e) => {
    const searchTerm = e.target.value.toLowerCase().trim()

    if (!searchTerm) {
      // If search term is empty, show all teams
      setFilteredTeams(allTeams || [])
      return
    }

    // Filter teams based on search term
    const filtered = allTeams.filter((item) => {
      // Search in name
      if (item.name && item.name.toLowerCase().includes(searchTerm)) {
        return true
      }

      // Search in role name
      if (item.role && item.role.name && item.role.name.toLowerCase().includes(searchTerm)) {
        return true
      }

      // Search in email
      if (item.email && item.email.toLowerCase().includes(searchTerm)) {
        return true
      }

      // Search in lastActive
      if (item.lastActive && item.lastActive.toLowerCase().includes(searchTerm)) {
        return true
      }

      return false
    })

    setFilteredTeams(filtered)
  }

  const dropdownOptions = [
    { key: '1', label: 'All' },
    { key: '2', label: 'Super Admin' },
    { key: '3', label: 'Administrator' },
    { key: '4', label: 'Operator' },
  ]

  const handleSelect = (key: string) => {
    // console.log('Selected option:', key)
  }

  if (error) return <div>Error: {error}</div>

  if (loading) {
    return (
      <div
        style={{
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <img
          style={{
            width: '40px',
            height: '40px',
          }}
          src={spinner}
        />
        <p style={{ color: '#0397f5' }}>Please Wait...</p>
      </div>
    )
  }

  return (
    <>
      <div className="teams-header">
        <div className="title-area">
          <p>Members</p>
          <p>Role Permission</p>
        </div>
        <div className="action-area">
          <CommonDropdown options={dropdownOptions} onSelect={handleSelect} label="Choose Option" />
          <button className="download-btn" onClick={() => setIsModalVisible(true)}>
            <span>+</span> Add Member
          </button>
          <div className="search-bar-area">
            <img src={searchIcon} alt="search" />
            <input type="text" name="" id="" placeholder="Search..." onChange={handleUserSearch} />
          </div>

          {/* Add member modal */}
          <AddMemberModal
            visible={isModalVisible}
            onCancel={() => setIsModalVisible(false)}
            onAdd={(data) => {
              setIsModalVisible(false)
            }}
          />
        </div>
      </div>
      <div className="table-window" style={{ position: 'relative', marginBottom: '50px' }}>
        {/* <!--begin::Card body--> */}
        <div className="card-body">
          {/* <!--begin::Table--> */}
          <table className="summary-table" id="kt_table_widget_4_table">
            {/* <!--begin::Table head--> */}
            <thead className="summary-column">
              {/* <!--begin::Table row--> */}
              <tr className="summary-column-name">
                <th className="summary-column-item">Name</th>
                <th className="summary-column-item">Role</th>

                <th className="summary-column-item">Email </th>
                <th className="summary-column-item">Last active </th>
                <th className="summary-column-item">Actions</th>
              </tr>
            </thead>

            <tbody className="summary-table-body">
              {filteredTeams?.length > 0 &&
                filteredTeams?.map((item, index) => (
                  <tr key={index} className="table-vaults-item">
                    <td className="table-borrowing">{item.name}</td>
                    <td className="table-borrowing">{item.role.name}</td>
                    <td className="table-borrowing">
                      {item.email} <br />
                    </td>
                    <td className="table-borrowing">{item.lastActive}</td>
                    <td className="table-borrowing table-actions">
                      <div className="action-buttons" style={{ cursor: 'pointer ' }}>
                        <img
                          src={editIcon}
                          alt="Edit"
                          onClick={(e) => {
                            e.stopPropagation() // Prevent row click event
                            // Your edit functionality here
                            setSelectedUser(item)
                            setIsDrawerOpen(true)
                          }}
                        />
                        <img
                          src={deleteIcon}
                          alt="Delete"
                          onClick={(e) => {
                            e.stopPropagation() // Prevent row click event
                            // Your delete functionality here
                            setSelectedUser(item)
                            setRemoveMemberModalOpen(true)
                          }}
                        />
                      </div>
                    </td>

                    {/* <td className="table-risk">
                    {(() => {
                      if (item.status.toLowerCase() == "active") return <p className={'table-low'}>{item.status}</p>
                      if (item.status.toLowerCase() == "inactive") return <p className={'table-high'}>{item.status}</p>
                      if (item.status.toLowerCase() == "pending") return <p className={'table-average'}>{item.status}</p>
                      return <p className={'table-high'}>{item.status}</p>
                    })()}
                  </td>
                  <td className="table-property">{"Status history"}</td> */}
                  </tr>
                ))}
            </tbody>

            {/* Edit account details modal */}
            <EditAccountDrawer
              open={isDrawerOpen}
              onClose={() => setIsDrawerOpen(false)}
              userData={selectedUser}
              onSave={(updatedData) => {
                setIsDrawerOpen(false)
              }}
            />
            {/* Remove team member modal */}
            <RemoveTeamMemberModal
              visible={isRemoveMemberModalOpen}
              email={selectedUser?.email}
              onCancel={() => setRemoveMemberModalOpen(false)}
              onConfirm={() => {
                // call delete API or remove logic
                setRemoveMemberModalOpen(false)
                message.info('Coming soon 🚀')
              }}
            />
            {/* <!--end::Table body--> */}
          </table>
          {/* <!--end::Table--> */}
        </div>
        {/* <!--end::Card body--> */}
        <div
          className="mob-footer-wrapper"
          style={{ position: 'absolute', right: '5px', bottom: '-55px' }}
        >
          <div className="footer-text">Powered by</div>
          <div className="footer-img">
            <img src={FooterLogo}></img>
          </div>
        </div>
      </div>
    </>
  )
}
