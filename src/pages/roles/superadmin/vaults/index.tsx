import VaultDashboard from './VaultDashboardV2'
import VaultHistory from './VaultHistory'
import { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getVaultPropertyList } from '@/api/api'
import downloadArrowIcon from '@/assets/icons/down-arrow-icon.svg'
import filterIcon from '@/assets/icons/filter-icon.svg'
import searchIcon from '@/assets/icons/search-icon.svg'
import spinner from '@/assets/img/kodelab-spinner-spin.gif'
import FooterLogo from '@/assets/img/logo-kodelab-footer.png'
import '@/assets/theme/css/modal.css'
import apiService from '@/services/apiService'
import { useSessionStorage } from 'usehooks-ts'
import FilterComponent from '@/components/layout/FilterComponent'
import useUserMangement from '@/hooks/useUserMangement'
import { message } from 'antd'

export default () => {
  const [allVaults, setAllVaults] = useSessionStorage('allVaults', []) //useState([])
  const [displayVaultsPage, setDisplayVaultsPage] = useState(false)
  const { logout, user } = useUserMangement()

  const [vault, setVault] = useSessionStorage('selectedVault', {}) //useState([])

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [filteredVaults, setFilteredVaults] = useState([])
  const [drawerVisible, setDrawerVisible] = useState(false)
  const [isClientAdmin, setIsClientAdmin] = useState(false)
  const [isBackVisible, setIsVisible] = useSessionStorage('isBackVisible', false) //useState([])
  const [loader, setLoader] = useState(false)

  const router = useNavigate()

  const getAllClients = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      setLoader(true)
      if (allVaults.length > 1) setLoading(false)

      const clients = await apiService.getAllVaults(user.id)

      setAllVaults(clients.data)
      setFilteredVaults(clients.data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch clients')
    } finally {
      setLoading(false)
      setLoader(false)
    }
  }, [])

  useEffect(() => {
    if (user?.role.code === 'CLIENT_ADMIN') {
      setIsClientAdmin(true)
    }
    getAllClients()
  }, [])

  if (loader) {
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

  if (error) return <div>Error: {error}</div>

  // useEffect(() => {

  //   if (user) {
  //     setLoader(true)

  //     let proList = getVaultPropertyList(user['id']).then((val) => {
  //       if (val.length < 1) {
  //         setLoader(false)
  //         setPropertyList([])
  //         // router('/users')
  //       } else {
  //          setPropertyList(val)
  //         setLoader(false)
  //       }
  //     })
  //   } else {
  //     setPropertyList([])
  //     setLoader(false)
  //   }
  // }, [user])

  const handleVaultClick = async (vault) => {
    setLoader(true)
    try {
      const val = await getVaultPropertyList(vault.clientEndUser.id)
      if (val && val.length > 0) {
        // Only search if we have data
        const vaultData = val.find((v) => String(v.vatId) === String(vault.vaultId))

        if (vaultData) {
          setVault(vaultData)
          setIsVisible(true)
        } else {

        }
      } else {

        // Optionally handle empty result
        // setPropertyList([]);
      }
      setLoader(false)
    } catch (error) {

      setLoader(false)
      // alert('An error occurred')
      message.error('An error occurred while fetching vault details. Please try again.')
      // Optionally: toast.error('An error occurred');
    }
  }

  const isVaultEmpty = Object.keys(vault).length === 0

  if (!isVaultEmpty) {
    return <VaultDashboard />
  }

  if (!isVaultEmpty) {
    // return (
    //   <>
    //     <VaultDashboard />
    //     <VaultHistory />
    //   </>
    // )

    let path = 'bank'
    if (user.role.code === 'KODELAB_SUPER_ADMIN') {
      path = 'superadmin'
    } else if (user.role.code === 'CLIENT_ADMIN') {
      path = 'bank'
    }

    router(`/home/${path}/vault/dashboard`)
  }

  // Implement the search function
  const handleUserSearch = (e) => {
    const searchTerm = e.target.value.toLowerCase().trim()

    if (!searchTerm) {
      // If search term is empty, show all vaults
      setFilteredVaults(allVaults)
      return
    }

    // Filter vaults based on search term
    const filtered = allVaults.filter((vault) => {
      // Search in vault ID
      if (vault.vaultId && vault.vaultId.toString().toLowerCase().includes(searchTerm)) {
        return true
      }

      // Search in client name
      if (
        vault.clientDetails?.name &&
        vault.clientDetails.name.toLowerCase().includes(searchTerm)
      ) {
        return true
      }

      // Search in end user name
      if (
        vault.clientEndUser?.name &&
        vault.clientEndUser.name.toLowerCase().includes(searchTerm)
      ) {
        return true
      }

      // Search in value
      if (vault.value && vault.value.toString().toLowerCase().includes(searchTerm)) {
        return true
      }

      // Search in limit amount
      if (vault.limitAmount && vault.limitAmount.toString().toLowerCase().includes(searchTerm)) {
        return true
      }

      // Search in available amount
      if (
        vault.availableAmount &&
        vault.availableAmount.toString().toLowerCase().includes(searchTerm)
      ) {
        return true
      }

      // Search in borrowed amount
      if (
        vault.borrowedAmount &&
        vault.borrowedAmount.toString().toLowerCase().includes(searchTerm)
      ) {
        return true
      }

      // Search in risk level
      if (vault.risk && vault.risk.toLowerCase().includes(searchTerm)) {
        return true
      }

      return false
    })

    setFilteredVaults(filtered)
  }

  return (
    <>
      {loader ? (
        <div
          style={{
            height: '100%',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <div style={{ textAlign: 'center' }}>
            <img
              style={{
                width: '40px',
                height: '40px',
              }}
              src={spinner}
            />
            <p style={{ color: '#0397f5' }}>Please Wait...</p>
          </div>
        </div>
      ) : (
        <>
          <div className="transactions-header">
            <div className="search-bar-area">
              <img src={searchIcon} alt="search" />
              <input
                type="text"
                name=""
                id=""
                placeholder="Search..."
                onChange={handleUserSearch}
              />
            </div>
            <div className="add-client-button">
              <FilterComponent visible={drawerVisible} onClose={() => setDrawerVisible(false)} />
              <img
                src={filterIcon}
                alt="Filter"
                onClick={() => setDrawerVisible(true)}
                style={{ cursor: 'pointer', marginRight: 10 }}
              />
              <button className="download-btn">
                <img src={downloadArrowIcon} alt="download report" />
                Report
              </button>
            </div>
          </div>
          <div
            className="table-window"
            style={{ position: 'relative', marginTop: 16, marginBottom: 50 }}
          >
            {/* <!--begin::Card body--> */}
            <div className="card-body">
              {/* <!--begin::Table--> */}
              <table className="summary-table" id="kt_table_widget_4_table">
                {/* <!--begin::Table head--> */}
                <thead className="summary-column">
                  {/* <!--begin::Table row--> */}
                  <tr className="summary-column-name">
                    <th className="summary-column-item">Vault ID</th>
                    <th className="summary-column-item">Client</th>
                    {isClientAdmin && <th className="summary-column-item">Customer Name </th>}
                    <th className="summary-column-item">Value </th>
                    <th className="summary-column-name-item">Limit amount </th>
                    <th className="summary-column-name-item">Available amount</th>
                    <th className="summary-column-name-item">Borrowed amount</th>
                    <th className="summary-column-name-item">Risk</th>
                  </tr>
                </thead>

                <tbody className="summary-table-body">
                  {filteredVaults.length > 0 &&
                    filteredVaults.map((item, index) => (
                      <tr
                        key={index}
                        className="table-vaults-item"
                        style={{ cursor: 'pointer' }}
                        onClick={() => {
                          handleVaultClick(item)
                        }}
                      >
                        <td className="table-borrowing">{item.vaultId}</td>

                        <td className="table-borrowing">{item?.clientDetails?.name}</td>
                        {isClientAdmin && (
                          <td className="table-borrowing">{item?.clientEndUser?.name}</td>
                        )}
                        <td className="table-borrowing">{item.assetValue}</td>
                        <td className="table-property">{item.limitAmount}</td>
                        <td className="table-property">{item.availableAmount}</td>
                        <td className="table-property">{item.borrowedAmount}</td>

                        <td className="table-risk">
                          {(() => {
                            if (item?.risk?.toLowerCase() == 'low')
                              return <p className={'table-low'}>{item.risk}</p>
                            if (item?.risk?.toLowerCase() == 'high')
                              return <p className={'table-high'}>{item.risk}</p>
                            if (item?.risk?.toLowerCase() == 'average')
                              return <p className={'table-average'}>{item.risk}</p>
                            return <p className={'table-high'}>{item.risk}</p>
                          })()}
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
        </>
      )}
    </>
  )
}
