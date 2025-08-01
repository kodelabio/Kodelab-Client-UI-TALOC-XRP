import { useCallback, useEffect, useState } from 'react'
import FooterLogo from '@/assets/img/logo-kodelab-footer.png'
import '@/assets/theme/css/modal.css'
import apiService from '@/services/apiService'
import { useSessionStorage } from 'usehooks-ts'

const SuperAdminDashboard = () => {
  const [allClients, setAllClients] = useSessionStorage('allClients', []) //useState([])

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const getAllClients = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const clients = await apiService.getAllClients()
      setAllClients(clients.data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch clients')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    getAllClients()
  }, [])

  if (loading) return <div>Loading...</div>
  if (error) return <div>Error: {error}</div>

  return (
    <>
      <div className="table-window" style={{ position: 'relative', marginBottom: '50px' }}>
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
              {allClients.map((item, index) => (
                <tr key={index} className="table-vaults-item">
                  <td className="table-borrowing">{item.name}</td>
                  <td className="table-borrowing">
                    {item.contact.email} <br />
                    {item.contact.phone}
                  </td>
                  <td className="table-property">{item.dateAdded}</td>
                  <td className="table-property">{item.vaults}</td>
                  <td className="table-property">{item.kyb}</td>

                  <td className="table-risk">
                    {(() => {
                      if (item.status.toLowerCase() == 'active')
                        return <p className={'table-low'}>{item.status}</p>
                      if (item.status.toLowerCase() == 'inactive')
                        return <p className={'table-high'}>{item.status}</p>
                      if (item.status.toLowerCase() == 'pending')
                        return <p className={'table-average'}>{item.status}</p>
                      return <p className={'table-high'}>{item.status}</p>
                    })()}
                  </td>
                  <td className="table-property">{'Status history'}</td>
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

export default SuperAdminDashboard
