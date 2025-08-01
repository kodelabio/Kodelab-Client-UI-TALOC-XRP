import { message } from 'antd'
import RightSideBar from '../sidebar/slideOutPanel'
import VaultDashboardV2 from '../vaults/VaultDashboardV2'
import ClientDashboard from './ClientDashboard'
import { useCallback, useEffect, useState } from 'react'
import SearchIcon from '@/assets/icons/BsSearch.svg'
import searchIcon from '@/assets/icons/search-icon.svg'
import FooterLogo from '@/assets/img/logo-kodelab-footer.png'
import '@/assets/theme/css/modal.css'
import '@/assets/theme/css/roles/superadmin/index.css'
import apiService from '@/services/apiService'
import { useSessionStorage } from 'usehooks-ts'

export default () => {
  const [allClients, setAllClients] = useSessionStorage('allClients', []) //useState([])
  const [filteredClients, setFilteredClients] = useState([])
  const [isBackVisible, setIsVisible] = useSessionStorage('isBackVisible', false) //useState([])
  const [selectedClient, setSelectedClient] = useSessionStorage('selectedClient', []) //useState([])
  const [selectedVault, setSelectedVault] = useSessionStorage('selectedVault', {}) //useState({})
  const [allVaultsCount, setAllVaultsCount] = useState(0)

  const [sidebarClient, setSidebarClient] = useState(null)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const timeline = [
    {
      date: 'Today',
      items: [
        {
          dotColor: 'blue',
          title: 'KYB request',
          badge: { text: 'Pending', type: 'pending' },
          author: 'Emma Rossi',
          message: 'I’ve send request to the client to provide documents',
        },
        {
          dotColor: 'green',
          title: 'Check client details',
          badge: { text: 'Paused', type: 'paused' },
          author: 'Emma Rossi',
          message: 'There is no KYB documents',
        },
      ],
    },
    {
      date: 'Yesterday',
      items: [
        {
          dotColor: 'green',
          title: 'Client created',
          badge: { text: 'Completed', type: 'completed' },
          author: 'system',
          message: '',
        },
      ],
    },
  ]

  const getAllClients = useCallback(async () => {
    try {
      setLoading(true)

      // if (allClients.length > 1) setLoading(false)

      setError(null)
      const clients = await apiService.getAllClients()
      const allVaultsData = await apiService.getAllVaults(1001)
      setAllClients(clients.data)
      setFilteredClients(clients.data)
      setAllVaultsCount(allVaultsData.data.length)
    } catch (err) {

      setError(err instanceof Error ? err.message : 'Failed to fetch clients')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    getAllClients()
  }, [])

  const handleUserClick = async (client) => {
    try {
      if (client) {
        if (client.status?.toLowerCase() === 'pending') {
          // alert('Client is in pending status')
          message.info('Client is in pending status')
        } else {
          setSelectedClient(client)
          setIsVisible(true)
        }
      } else {

      }
    } catch (error) {

      // alert('An error occurred')
      message.error('An error occurred while selecting the client')
      // Optionally: toast.error('An error occurred');
    }
  }

  if (loading) return <div>Loading...</div>
  if (error) return <div>Error: {error}</div>

  const isVaultSelected = Object.keys(selectedVault).length > 0

  if (isVaultSelected) {
    return (
      <>
        <VaultDashboardV2 />
      </>
    )
  }

  const isSelectedClientEmpty = Object.keys(selectedClient).length === 0

  if (!isSelectedClientEmpty) {
    return (
      <>
        <ClientDashboard />
      </>
    )
  }

  function getStatusClass(status) {
    if (!status) return 'table-high'
    const s = status.toLowerCase()
    if (s === 'active') return 'table-low'
    if (s === 'inactive') return 'table-high'
    if (s === 'pending') return 'table-average'
    return 'table-high'
  }

  const handleUserSearch = (e) => {
    const searchTerm = e.target.value.toLowerCase()
    const filtered = allClients.filter((client) => {
      return (
        client.name.toLowerCase().includes(searchTerm) ||
        client.contact.email.toLowerCase().includes(searchTerm) ||
        client.contact.phone.toLowerCase().includes(searchTerm) ||
        client.dateAdded.toLowerCase().includes(searchTerm)
      )
    })
    setFilteredClients(filtered)
  }

  // // search
  // const [search, setSearch] = useState('')

  // const handleInput = (e) => {
  //   setSearch(e.target.value)
  // }

  // const filteredClients = allClients.filter(client => {
  //   if (!search) return true
  //   const searchLower = search.toLowerCase()
  //   return (
  //     (client.name && client.name.toLowerCase().includes(searchLower)) ||
  //     (client.contact?.email && client.contact.email.toLowerCase().includes(searchLower)) ||
  //     (client.contact?.phone && client.contact.phone.toLowerCase().includes(searchLower))
  //   )
  // })

  return (
    <div className="window-content">
      {/* <div className='action-bar'>
        <div className='action-bar'>
          <div className='search-wrapper'>
            <div className='search-icon'>
              <img src={SearchIcon} alt='search' />
            </div>
            <input
              type='text'
              placeholder='Search...'
              className='search-input'
              value={search}
              onChange={handleInput}
            />
          </div>
          <div className='add-client-btn'>
            <p> + Add client</p>
          </div>
        </div>
      </div> */}
      <div className="transactions-header">
        <div className="search-bar-area">
          <img src={searchIcon} alt="search" />
          <input type="text" name="" id="" placeholder="Search..." onChange={handleUserSearch} />
        </div>
        <div className="add-client-button">
          <button onClick={() => message.info('Coming Soon')}>+ Add client</button>
        </div>
      </div>
      <div className="table-window" style={{ position: 'relative' }}>
        {/* <!--begin::Card body--> */}
        <div className="card-body">
          {/* <!--begin::Table--> */}
          <table className="summary-table" id="kt_table_widget_4_table">
            {/* <!--begin::Table head--> */}
            <thead className="summary-column">
              {/* <!--begin::Table row--> */}
              <tr className="summary-column-name">
                <th className="summary-column-item">Company name</th>
                <th className="summary-column-item">Contact </th>
                <th className="summary-column-name-item">Date added</th>
                <th className="summary-column-name-item">Vaults</th>
                <th className="summary-column-name-item">KYB</th>
                <th className="summary-column-name-item">Status</th>
                <th className="summary-column-name-item">Action</th>
              </tr>
            </thead>

            <tbody className="summary-table-body">
              {filteredClients?.map((item, index) => (
                <tr
                  key={index}
                  className="table-vaults-item"
                  style={{ cursor: 'pointer' }}
                  onClick={() => {
                    handleUserClick(item)
                  }}
                >
                  <td className="table-borrowing">{item.name}</td>
                  <td className="table-borrowing">
                    {item.contact.email} <br />
                    {item.contact.phone}
                  </td>
                  <td className="table-property">{item.dateAdded}</td>
                  <td className="table-property">{allVaultsCount}</td>
                  <td className="table-property">{item.kyb}</td>

                  <td className="table-risk">
                    <p className={getStatusClass(item.status)}>{item.status}</p>
                  </td>

                  <td
                    style={{ cursor: 'pointer' }}
                    className="table-property"
                    onClick={(e) => {
                      e.stopPropagation()
                      setSidebarClient(item)
                      setSidebarOpen(true)
                    }}
                  >
                    {'Status'}
                  </td>
                </tr>
              ))}
            </tbody>
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
      <RightSideBar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        client={sidebarClient}
        getStatusClass={getStatusClass}
        timeline={timeline}
      ></RightSideBar>
    </div>
  )
}
