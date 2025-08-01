import { message } from 'antd'
import { useCallback, useEffect, useState } from 'react'
import downloadArrowIcon from '@/assets/icons/down-arrow-icon.svg'
import filterIcon from '@/assets/icons/filter-icon.svg'
import searchIcon from '@/assets/icons/search-icon.svg'
import FooterLogo from '@/assets/img/logo-kodelab-footer.png'
import '@/assets/theme/css/modal.css'
import apiService from '@/services/apiService'
import { useSessionStorage } from 'usehooks-ts'

export default () => {
  const [allAudit, setAllAudit] = useSessionStorage('allAudit', []) //useState([])
  const [filteredAudit, setFilteredAudit] = useState([])

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const getallAudit = useCallback(async () => {
    try {
      setLoading(true)

      if (allAudit.length > 1) setLoading(false)

      setError(null)
      const clients = await apiService.getAllAudit()
      setAllAudit(clients.data)
      setFilteredAudit(clients.data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch clients')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    getallAudit()
  }, [])

  const handleUserSearch = (e) => {
    const searchValue = e.target.value.toLowerCase().trim()

    if (!searchValue) {
      // If search is empty, show all vaults
      setFilteredAudit(allAudit)
      return
    }

    const filtered = allAudit.filter(
      (item) =>
        item.name.toLowerCase().includes(searchValue) ||
        item.event.toLowerCase().includes(searchValue) ||
        item.ipAddress.toLowerCase().includes(searchValue) ||
        item.date.toLowerCase().includes(searchValue) ||
        item.status.toLowerCase().includes(searchValue),
    )
    setFilteredAudit(filtered)
  }

  if (loading) return <div>Loading...</div>
  if (error) return <div>Error: {error}</div>

  return (
    <>
      <div className="security-audit-tiles">
        <div>
          <p>Overall security score</p>
          <p>92</p>
        </div>
        <div>
          <p>Total alerts</p>
          <p>15</p>
        </div>
        <div>
          <p>Suspicious activities</p>
          <p>3</p>
        </div>
        <div>
          <p>Failed login attempts</p>
          <p>4</p>
        </div>
      </div>
      <div className="teams-header" style={{ padding: '16px 0' }}>
        <div className="title-area">
          <p style={{ color: '#4F4F4F', fontSize: 26 }}>Audit logs</p>
        </div>
        <div className="action-area">
          <img src={filterIcon} alt="Filter" onClick={() => message.info('Coming soon ')} />
          <button className="download-btn" onClick={() => message.info('Coming soon ')}>
            <img src={downloadArrowIcon} alt="download report" />
            Report
          </button>
          <div className="search-bar-area" style={{ width: 'auto' }}>
            <img src={searchIcon} alt="search" />
            <input type="text" name="" id="" placeholder="Search..." onChange={handleUserSearch} />
          </div>
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
                <th className="summary-column-name-item">Date added</th>
                <th className="summary-column-item">Team Member</th>
                <th className="summary-column-name-item">Event</th>
                <th className="summary-column-name-item">IP Address</th>
                <th className="summary-column-name-item">Risk level</th>
              </tr>
            </thead>

            <tbody className="summary-table-body">
              {filteredAudit.map((item, index) => (
                <tr
                  key={index}
                  className={`${item.status.toLowerCase() == 'danger' && 'table-row-danger'} ${
                    item.status.toLowerCase() == 'warning' && 'table-row-warning'
                  } table-vaults-item`}
                >
                  <td className="table-property">{item.date}</td>

                  <td className="table-borrowing">{item.name}</td>

                  <td className="table-property">{item.event}</td>
                  <td className="table-property">{item.ipAddress}</td>

                  <td className="table-risk">
                    {(() => {
                      if (item.status.toLowerCase() == 'info')
                        return <p className={'table-low'}>{'Low'}</p>
                      if (item.status.toLowerCase() == 'danger')
                        return <p className={'table-high'}>{'High'}</p>
                      if (item.status.toLowerCase() == 'warning')
                        return <p className={'table-average'}>{'Average'}</p>
                      return <p className={'table-high'}>{item.status}</p>
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
  )
}
