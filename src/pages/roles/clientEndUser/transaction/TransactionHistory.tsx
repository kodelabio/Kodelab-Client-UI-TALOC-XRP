import { message, Spin, Pagination } from 'antd'
import { useCallback, useEffect, useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { getHistoryList, getVaultPropertyList } from '@/api/api'
import BorrowIcon from '@/assets/img/icons/borrow-icon.svg'
import InterestIcon from '@/assets/img/icons/calendar-icon.svg'
import ExchangeIcon from '@/assets/img/icons/exchange_btn.svg'
import RepayIcon from '@/assets/img/icons/repayment-icon.svg'
import SideCaseIcon from '@/assets/img/icons/sideCase.svg'
import spinner from '@/assets/img/kodelab-spinner-spin.gif'
import FooterLogo from '@/assets/img/logo-kodelab-footer.png'
import { useSessionStorage } from 'usehooks-ts'
import useUserMangement from '@/hooks/useUserMangement'

const TransactionHistory = () => {
  let dummyArray: any[] | (() => any[]) = []
  const router = useNavigate()
  const [loader, setLoader] = useState(false)
  const [property, setProperty] = useState({})
  const [historyList, setHistoryList] = useState(dummyArray)
  const [filteredHistoryList, setFilteredHistoryList] = useState(dummyArray)
  const [actionTypeFilter, setActionTypeFilter] = useState('All')
  const [timeFilter, setTimeFilter] = useState('Show All')
  const [vaultList, setVaultList] = useSessionStorage('vaultList', [])
  const [propertyList, setPropertyList] = useState(vaultList)

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [paginatedData, setPaginatedData] = useState([])

  const { logout, user, checkLogin } = useUserMangement()

  useEffect(() => {
    if (user) {
      setLoader(true)

      let proList = getVaultPropertyList(user.walletAddress).then((val) => {
        if (val.length < 1) {
          setLoader(false)
          setPropertyList([])
        } else {
          setPropertyList(val)
          setVaultList(val)
          setLoader(false)
        }
      })
    } else {
      setPropertyList(dummyArray)
      setLoader(false)
    }
  }, [user])

  useEffect(() => {
    checkLogin()
  }, [])

  useEffect(() => {
    if (vaultList.length > 0) {
      fetchAllVaultHistories()
    }
  }, [vaultList])

  const fetchAllVaultHistories = async () => {
    setLoader(true)

    try {
      const allHistories = await Promise.all(
        vaultList.map(async (vault) => {
          try {
            const history = await getHistoryList(vault.vatAddress)

            // Add vault info into each history item
            const historyWithVault = (history || []).map((item) => ({
              ...item,
              vault, // attaching the entire vault object
            }))

            return historyWithVault
          } catch (error) {

            return []
          }
        }),
      )

      // Flatten and sort by time (latest first)
      const combinedHistory = allHistories.flat().sort((a, b) => {
        // Ensure time is treated as a number
        return Number(b.time) - Number(a.time)
      })

      setHistoryList(combinedHistory)
      setFilteredHistoryList(combinedHistory) // Initialize filtered list with all history
    } catch (err) {

    } finally {
      setLoader(false)
    }
  }

  // Apply filters whenever historyList, actionTypeFilter, or timeFilter changes
  useEffect(() => {
    applyFilters()
  }, [historyList, actionTypeFilter, timeFilter])

  // Update paginated data when filtered list or pagination settings change
  useEffect(() => {
    updatePaginatedData()
  }, [filteredHistoryList, currentPage, pageSize])

  // Function to apply both filters
  const applyFilters = () => {
    let filtered = [...historyList]

    // Apply action type filter
    if (actionTypeFilter !== 'All') {
      filtered = filtered.filter((item) => item.type === actionTypeFilter)
    }

    // Apply time filter
    if (timeFilter === 'Newest') {
      filtered = sortByTimestamp(filtered, 'desc')
    } else if (timeFilter === 'Oldest') {
      filtered = sortByTimestamp(filtered, 'asc')
    }

    setFilteredHistoryList(filtered)
    // Reset to first page when filters change
    setCurrentPage(1)
  }

  // Function to update paginated data
  const updatePaginatedData = () => {
    const startIndex = (currentPage - 1) * pageSize
    const endIndex = startIndex + pageSize
    setPaginatedData(filteredHistoryList.slice(startIndex, endIndex))
  }

  // Function to handle page change
  const handlePageChange = (page, pageSize) => {
    setCurrentPage(page)
  }

  // Handle page size change
  const handlePageSizeChange = (current, size) => {
    setPageSize(size)
    setCurrentPage(1) // Reset to first page when page size changes
  }

  function getIcon(type: any): string | undefined {
    switch (type) {
      case 'Repay':
        return RepayIcon
      case 'Borrow':
        return BorrowIcon
      case 'Interest':
        return InterestIcon
      case 'Exchange':
        return ExchangeIcon
      case 'Deposit':
        return SideCaseIcon
    }
    return BorrowIcon
  }

  function getDate(): string | undefined {
    const date = new Date()

    let day = date.getDate()
    let month = date.getMonth() + 1
    let year = date.getFullYear()
    // This arrangement can be altered based on how we want the date's format to appear.
    let currentDate = `${day}/${month}/${year}`
    return currentDate
  }

  function formatNumber(number) {
    if (typeof number === 'number') {
      return number.toLocaleString('en-US')
    }
    if (typeof number === 'string' && !isNaN(number)) {
      return parseFloat(number).toLocaleString('en-US')
    }
    return number // return as-is if not a valid number
  }

  // Function to sort by timestamp
  const sortByTimestamp = (data, order = 'asc') => {
    return [...data].sort((a, b) => {
      // Convert DD/MM/YYYY to Date objects for comparison
      const dateA = convertToDate(a.timestamp)
      const dateB = convertToDate(b.timestamp)

      return order === 'asc' ? dateA.getTime() - dateB.getTime() : dateB.getTime() - dateA.getTime()
    })
  }

  // Helper function to convert DD/MM/YYYY to Date object
  const convertToDate = (dateString) => {
    if (!dateString) return new Date(0) // Default date if timestamp is missing

    const [day, month, year] = dateString.split('/')
    return new Date(`${year}-${month}-${day}`)
  }

  // Handle action type filter change
  const handleActionTypeChange = (e) => {
    setActionTypeFilter(e.target.value)
  }

  // Handle time filter change
  const handleTimeFilterChange = (e) => {
    setTimeFilter(e.target.value)
  }

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

  return (
    <div>
      <section className="history-window">
        <div className="history-info-left">
          <div className="info-date-item">
            <div className="date-item-title">Opening date:</div>
            <div className="info-date">{getDate()}</div>
          </div>
        </div>
        <div className="history-info-wrapper">
          <div className="info-wrapper-title">Table</div>
          <div className="history-info-right">
            <div className="d-flex flex-stack flex-wrap gap-4">
              <div className="operation-select">
                <select
                  className="form-select form-select-transparent"
                  data-control="select2"
                  data-hide-search="true"
                  data-dropdown-css-classname="w-150px"
                  data-placeholder="Select an option"
                  value={actionTypeFilter}
                  onChange={handleActionTypeChange}
                >
                  <option value="All">All</option>
                  <option value="Borrow">Borrow</option>
                  <option value="Interest">Monthly interest</option>
                  <option value="Repay">Fund Vault</option>
                  <option value="Exchange">Exchange</option>
                  <option value="Deposit">Deposit</option>
                </select>
              </div>

              <div className="time-select">
                <select
                  className="form-select form-select-transparent "
                  data-control="select2"
                  data-hide-search="true"
                  data-dropdown-css-classname="w-150px"
                  data-placeholder="Select an option"
                  data-kt-table-widget-4="filter_status"
                  value={timeFilter}
                  onChange={handleTimeFilterChange}
                >
                  <option value="Show All">Show All</option>
                  <option value="Newest">Newest</option>
                  <option value="Oldest">Oldest</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="history-window">
        <div className="table-window" style={{ position: 'relative' }}>
          <div className="card-body">
            {filteredHistoryList.length > 0 ? (
              <>
                <table className="table" id="kt_table_widget_4_table">
                  <thead className="column-field">
                    <tr className="column-name">
                      <th className="column-name-item">Date</th>
                      <th className="column-name-item">Vault</th>
                      <th className="column-name-item">Action type</th>
                      <th className="column-name-item">Value in HGBP </th>
                    </tr>
                  </thead>

                  <tbody className="table-body">
                    {paginatedData.map((history, index) => (
                      <tr className="table-item-wrap table-body-item" key={index}>
                        <td className="table-date">{history['timestamp']}</td>
                        <td className="table-date">{history['vault'].vatId}</td>
                        <td className="table-action">
                          <div className="action-img">
                            <img src={getIcon(history['type'])} alt=""></img>
                          </div>
                          <div className="action-text">
                            {history['type'] === 'Repay' ? 'Fund Vault' : history['type']}
                          </div>
                        </td>
                        <td className="table-value"> HGBP {formatNumber(history['amount'])}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'flex-end' }}>
                  <Pagination
                    current={currentPage}
                    pageSize={pageSize}
                    total={filteredHistoryList.length}
                    onChange={handlePageChange}
                    showSizeChanger
                    onShowSizeChange={handlePageSizeChange}
                    pageSizeOptions={['5', '10', '20', '50']}
                    showTotal={(total, range) =>
                      `Showing ${range[0]}-${range[1]} of ${total} items`
                    }
                  />
                </div>
              </>
            ) : (
              <>
                <div
                  style={{
                    marginTop: 30,
                    marginBottom: 30,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  No data available in table
                </div>
              </>
            )}

            <div
              className="mob-footer-wrapper"
              style={{ position: 'absolute', right: '0px', bottom: '-100px' }}
            >
              <div className="footer-text">Powered by</div>
              <div className="footer-img">
                <img src={FooterLogo}></img>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

export default TransactionHistory
