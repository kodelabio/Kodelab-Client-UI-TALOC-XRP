import { Modal, Spin, message } from 'antd'
import { useEffect, useState } from 'react'
import { useNavigate, useLocation, Navigate } from 'react-router-dom'
import { getFCAReportList, getReportList } from '@/api/api'
import { verifyDocument } from '@/api/blockchain'
import GoBackIcon from '@/assets/icons/arrowBack.svg'
import CloseIcon from '@/assets/icons/close.svg'
import spinner from '@/assets/img/kodelab-spinner-spin.gif'
import FooterLogo from '@/assets/img/logo-kodelab-footer.png'
import styled from 'styled-components/macro'
import useUserMangement from '@/hooks/useUserMangement'

const ContainerWrap = styled.div`
  display: flex;
  justify-content: center;
  flex-direction: column;
  align-items: center;
`

const FCAReports = () => {
  let dummyArray: any[] | (() => any[]) = []
  const [propertyList, setPropertyList] = useState(dummyArray)
  const router = useNavigate()
  const [loader, setLoader] = useState(false)

  const [property, setProperty] = useState({})
  const [historyList, setHistoryList] = useState(dummyArray)
  const { logout, user, checkLogin } = useUserMangement()

  const location = useLocation()
  const navigate = useNavigate()
  const bankName = location.state?.bankName || 'Unknown Bank'

  const handleGoBack = () => {
    let url = location.pathname

    let path = '/home/view/FCAReports'

    if (url.includes('superadmin')) {
      path = path.replace('view', 'superadmin')
    }

    navigate(path)
  }

  useEffect(() => {
    checkLogin()
  }, [])

  const fetchHistory = async () => {
    try {
      setLoader(true)

      const isSuperAdmin = user?.role?.code === 'KODELAB_SUPER_ADMIN'

      const walletToUse = isSuperAdmin
        ? '0x0480Fce195Cd8548425301c7de2DA8bD8025c694' // 👈 replace with desired wallet address for super admin
        : user?.walletAddress

      if (!walletToUse) {

        return
      }

      const response = await getFCAReportList(walletToUse)

      if (Array.isArray(response) && response.some((item) => item !== null)) {
        setHistoryList(response.filter((item) => item !== null))
      } else {

        setHistoryList([])
      }
    } catch (error) {

    } finally {
      setLoader(false)
    }
  }

  useEffect(() => {
    fetchHistory()
  }, [router])

  //modal
  const [isModalOpen, setModalOpen] = useState(false)
  const [selectedHistory, setSelectedHistory] = useState({
    id: '', // Empty ID, can be set later
    type: 'CCR003 Consumer Credit data: Lenders', // Static string as a placeholder
    content: '', // Empty string for decrypted content
    isHashVerify: false, // Default to false, you can later set this to true if the hash is verified
    creatorVerifiedAt: '0', // Default value, assuming creator hasn't verified initially
    docId: '0', // Default value
    hash: '', // Empty hash until you get the real one
    owner: '', // Empty owner address
    party: '', // Empty party address
    status: 'Not Verified', // Default status based on verification check
    partyVerifiedAt: '0', // Default value, assuming party hasn't verified initially
    timestamp: '00.00.00', // Default formatted date, can be updated later
  })

  const showModal = (history) => {
    setSelectedHistory(history)
    setModalOpen(true)
  }

  const handleModalClose = () => {
    setModalOpen(false)
    // setSelectedHistory(null);
  }

  const handleSubmit = async () => {
    try {
      setLoader(true)

      await verifyDocument(user, selectedHistory.docId)
      await new Promise((resolve) => setTimeout(resolve, 100))
      fetchHistory()
      setModalOpen(false)
      message.success('Data underlying report successfully verified')
    } catch (error) {
      message.error('Failed to send the report. Please try again.')
    } finally {
      setLoader(false)
    }
  }

  return (
    <>
      {loader ? (
        <ContainerWrap className="container-wrap">
          <div>
            <img
              style={{
                width: '40px',
                height: '40px',
              }}
              src={spinner}
            />
          </div>
        </ContainerWrap>
      ) : (
        <>
          <div>
            <section className="history-window">
              <div className="back-btn" onClick={handleGoBack}>
                <div className="back-btn-img">
                  <img src={GoBackIcon} alt="GoBackIcon" />
                </div>
                <p>Go back</p>
              </div>

              <div className="history-info-wrapper" style={{ margin: '0px 0px 10px 0px' }}>
                <div className="window-title">
                  <h1>{bankName}</h1>
                </div>
                <div className="time-select">
                  <select
                    className="form-select form-select-transparent "
                    data-control="select2"
                    data-hide-search="true"
                    data-dropdown-css-classname="w-150px"
                    data-placeholder="Select an option"
                    data-kt-table-widget-4="filter_status"
                  >
                    <option value="Show All">Show All</option>
                    <option value="Newest">Newest</option>
                    <option value="Oldest">Oldest</option>
                  </select>
                </div>
              </div>
              <div className="table-window" style={{ position: 'relative', marginBottom: '50px' }}>
                <div className="card-body">
                  {historyList.length > 0 ? (
                    <table className="reports-table">
                      <thead>
                        <tr>
                          <th>Date</th>
                          <th>Report name</th>
                          <th>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {historyList.map((history, index) => (
                          <tr key={index} onClick={() => showModal(history)}>
                            <td>{history.timestamp}</td>
                            <td>{history.type}</td>
                            <td>
                              <span
                                className={`status ${
                                  history.status === 'Verified' ? 'verified' : 'not-verified'
                                }`}
                              >
                                {history.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  ) : (
                    <>
                      <div
                        style={{
                          marginTop: 50,
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

              <div className="pagination-container">
                <div className="pagination-text">
                  Showing {historyList.length} of {historyList.length} data
                </div>
              </div>

              <Modal
                width="auto"
                open={isModalOpen}
                onCancel={handleModalClose}
                footer={null}
                centered
              >
                <section className="report-modal">
                  <div className="modal-close-btn" onClick={handleModalClose}>
                    <img src={CloseIcon} alt=""></img>
                  </div>

                  <div className="modal-content-wrapper">
                    <div className="modal-content">
                      <div className="modal-title">
                        <h3>CCR003 Consumer Credit data: Lenders</h3>
                      </div>

                      <div className="data-content">
                        <table className="data-table">
                          <thead>
                            <tr>
                              <th>Activities</th>
                              <th>Total Value</th>
                              <th>Total number of vaults</th>
                              <th>Value of new advances</th>
                              <th>Average interest rate (%)</th>
                              <th>Total interest outstanding</th>
                            </tr>
                          </thead>
                          <tbody>
                            <tr>
                              <td>Other lending</td>
                              <td>{selectedHistory.content.totalCredit}</td>
                              <td>{selectedHistory.content.totalVault}</td>
                              <td>{selectedHistory.content.totalDebt}</td>
                              <td>{selectedHistory.content.avgInterest}</td>
                              <td>{selectedHistory.content.interest}</td>
                            </tr>
                          </tbody>
                        </table>
                      </div>

                      <div className="hash-wrapper">Hash : {selectedHistory.hash} </div>
                    </div>
                    {selectedHistory.status === 'Verified' ? (
                      <div></div>
                    ) : (
                      <div className="modal-btn" onClick={handleSubmit}>
                        <p>Verify</p>
                      </div>
                    )}
                  </div>

                  {loader && (
                    <div className="loading-overlay">
                      <div className="spinner">
                        <img src={spinner} alt="spinner" />
                      </div>
                    </div>
                  )}
                </section>
              </Modal>
            </section>
          </div>
        </>
      )}
    </>
  )
}

export default FCAReports
