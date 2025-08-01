import { Spin, Modal, message } from 'antd'
import { StepComponentsProps } from '../CreateVault'
import { useCallback, useEffect, useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { getHistoryList, getReportList } from '@/api/api'
import { getTransactionList, getBlockTime } from '@/api/blockchain'
import CloseIcon from '@/assets/icons/close.svg'
import BorrowIcon from '@/assets/img/icons/borrow-icon.svg'
import InterestIcon from '@/assets/img/icons/calendar-icon.svg'
import ExchangeIcon from '@/assets/img/icons/exchange_btn.svg'
import RepayIcon from '@/assets/img/icons/repayment-icon.svg'
import SideCaseIcon from '@/assets/img/icons/sideCase.svg'
import spinner from '@/assets/img/kodelab-spinner-spin.gif'
import FooterLogo from '@/assets/img/logo-kodelab-footer.png'
import Card from '@/components/Card'
import Property from '@/components/PropertyCard'
import BalanceCard from '@/components/layout/BalanceCard'
import BalanceLineChart from '@/components/layout/BalanceLineChart'
import ChartCard from '@/components/layout/ChartCard'
import styled from 'styled-components/macro'
import { getWrapHolder } from '@/hooks/useCdpNft'
import useProxy from '@/hooks/useProxy'
import useTokenAllowance from '@/hooks/useTokenAllowance'
import useUserMangement from '@/hooks/useUserMangement'

const ContainerWrap = styled.div`
  display: flex;
  justify-content: center;
  flex-direction: column;
  align-items: center;
`

const BankReports = () => {
  let dummyArray: any[] | (() => any[]) = []
  const [propertyList, setPropertyList] = useState(dummyArray)
  const router = useNavigate()
  const [loader, setLoader] = useState(false)

  const [property, setProperty] = useState({})
  const [historyList, setHistoryList] = useState(dummyArray)
  const { logout, user, checkLogin } = useUserMangement()

  useEffect(() => {
    checkLogin()
  }, [])

  // let histBorrow = [
  //   {
  //     amount: '800000',
  //     blockHash: '0x4f19aa7cb7a75fe5dc7ffa38768279fc8dddabd12a496fd2b857a262b52bb011',
  //     blockNumber: 9609915,
  //     timestamp: '10/07/2023',
  //     tokenId: '10',
  //     type: 'Borrow',
  //     user: '0x0480Fce195Cd8548425301c7de2DA8bD8025c694',
  //   },
  //   {
  //     amount: '5000',
  //     blockHash: '0x4f19aa7cb7a75fe5dc7ffa38768279fc8dddabd12a496fd2b857a262b52bb011',
  //     blockNumber: 9609915,
  //     timestamp: '01/7/2023',
  //     tokenId: '10',
  //     type: 'Borrow',
  //     user: '0x0480Fce195Cd8548425301c7de2DA8bD8025c694',
  //   },
  //   {
  //     amount: '300000',
  //     blockHash: '0x4f19aa7cb7a75fe5dc7ffa38768279fc8dddabd12a496fd2b857a262b52bb011',
  //     blockNumber: 9609915,
  //     timestamp: '08/04/2023',
  //     tokenId: '10',
  //     type: 'Borrow',
  //     user: '0x0480Fce195Cd8548425301c7de2DA8bD8025c694',
  //   },
  //   {
  //     amount: '400000',
  //     blockHash: '0x4f19aa7cb7a75fe5dc7ffa38768279fc8dddabd12a496fd2b857a262b52bb011',
  //     blockNumber: 9609915,
  //     timestamp: '18/03/2023',
  //     tokenId: '10',
  //     type: 'Borrow',
  //     user: '0x0480Fce195Cd8548425301c7de2DA8bD8025c694',
  //   },
  //   {
  //     amount: '800000',
  //     blockHash: '0x4f19aa7cb7a75fe5dc7ffa38768279fc8dddabd12a496fd2b857a262b52bb011',
  //     blockNumber: 9609915,
  //     timestamp: '10/02/2023',
  //     tokenId: '10',
  //     type: 'Borrow',
  //     user: '0x0480Fce195Cd8548425301c7de2DA8bD8025c694',
  //   },
  // ]
  // let histRepay = [
  //   {
  //     amount: '500000',
  //     blockHash: '0x4f19aa7cb7a75fe5dc7ffa38768279fc8dddabd12a496fd2b857a262b52bb011',
  //     blockNumber: 9609915,
  //     timestamp: '14/06/2023',
  //     tokenId: '10',
  //     type: 'Repay',
  //     user: '0x0480Fce195Cd8548425301c7de2DA8bD8025c694',
  //   },
  //   {
  //     amount: '400000',
  //     blockHash: '0x4f19aa7cb7a75fe5dc7ffa38768279fc8dddabd12a496fd2b857a262b52bb011',
  //     blockNumber: 9609915,
  //     timestamp: '11/06/2023',
  //     tokenId: '10',
  //     type: 'Repay',
  //     user: '0x0480Fce195Cd8548425301c7de2DA8bD8025c694',
  //   },
  //   {
  //     amount: '100000',
  //     blockHash: '0x4f19aa7cb7a75fe5dc7ffa38768279fc8dddabd12a496fd2b857a262b52bb011',
  //     blockNumber: 9609915,
  //     timestamp: '12/04/2023',
  //     tokenId: '10',
  //     type: 'Repay',
  //     user: '0x0480Fce195Cd8548425301c7de2DA8bD8025c694',
  //   },
  // ]
  // let histInterrest = [
  //   {
  //     amount: '5000',
  //     blockHash: '0x4f19aa7cb7a75fe5dc7ffa38768279fc8dddabd12a496fd2b857a262b52bb011',
  //     blockNumber: 9609915,
  //     timestamp: '01/06/2023',
  //     tokenId: '10',
  //     type: 'Interest',
  //     user: '0x0480Fce195Cd8548425301c7de2DA8bD8025c694',
  //   },
  //   {
  //     amount: '600000',
  //     blockHash: '0x4f19aa7cb7a75fe5dc7ffa38768279fc8dddabd12a496fd2b857a262b52bb011',
  //     blockNumber: 9609915,
  //     timestamp: '10/05/2023',
  //     tokenId: '10',
  //     type: 'Interest',
  //     user: '0x0480Fce195Cd8548425301c7de2DA8bD8025c694',
  //   },
  //   {
  //     amount: '5000',
  //     blockHash: '0x4f19aa7cb7a75fe5dc7ffa38768279fc8dddabd12a496fd2b857a262b52bb011',
  //     blockNumber: 9609915,
  //     timestamp: '01/05/2023',
  //     tokenId: '10',
  //     type: 'Interest',
  //     user: '0x0480Fce195Cd8548425301c7de2DA8bD8025c694',
  //   },
  //   {
  //     amount: '5000',
  //     blockHash: '0x4f19aa7cb7a75fe5dc7ffa38768279fc8dddabd12a496fd2b857a262b52bb011',
  //     blockNumber: 9609915,
  //     timestamp: '01/04/2023',
  //     tokenId: '10',
  //     type: 'Interest',
  //     user: '0x0480Fce195Cd8548425301c7de2DA8bD8025c694',
  //   },
  // ]
  // let histExchange = [
  //   {
  //     amount: '400000',
  //     blockHash: '0x4f19aa7cb7a75fe5dc7ffa38768279fc8dddabd12a496fd2b857a262b52bb011',
  //     blockNumber: 9609915,
  //     timestamp: '03/04/2023',
  //     tokenId: '10',
  //     type: 'Exchange',
  //     user: '0x0480Fce195Cd8548425301c7de2DA8bD8025c694',
  //   },
  //   {
  //     amount: '300000',
  //     blockHash: '0x4f19aa7cb7a75fe5dc7ffa38768279fc8dddabd12a496fd2b857a262b52bb011',
  //     blockNumber: 9609915,
  //     timestamp: '09/04/2023',
  //     tokenId: '10',
  //     type: 'Exchange',
  //     user: '0x0480Fce195Cd8548425301c7de2DA8bD8025c694',
  //   },
  // ]

  let reportsData = [
    {
      amount: '800000',
      blockHash: '0x4f19aa7cb7a75fe5dc7ffa38768279fc8dddabd12a496fd2b857a262b52bb011',
      blockNumber: 9609915,
      timestamp: '20.02.25',
      tokenId: '10',
      type: 'CCR003 Consumer Credit data: Lenders',
      user: '0x0480Fce195Cd8548425301c7de2DA8bD8025c694',
      status: 'Not verified',
    },
    {
      amount: '5000',
      blockHash: '0x4f19aa7cb7a75fe5dc7ffa38768279fc8dddabd12a496fd2b857a262b52bb011',
      blockNumber: 9609915,
      timestamp: '10.01.25',
      tokenId: '10',
      type: 'CCR003 Consumer Credit data: Lenders',
      user: '0x0480Fce195Cd8548425301c7de2DA8bD8025c694',
      status: 'Verified',
    },
    {
      amount: '300000',
      blockHash: '0x4f19aa7cb7a75fe5dc7ffa38768279fc8dddabd12a496fd2b857a262b52bb011',
      blockNumber: 9609915,
      timestamp: '02.12.24',
      tokenId: '10',
      type: 'CCR003 Consumer Credit data: Lenders',
      user: '0x0480Fce195Cd8548425301c7de2DA8bD8025c694',
      status: 'Verified',
    },
    {
      amount: '400000',
      blockHash: '0x4f19aa7cb7a75fe5dc7ffa38768279fc8dddabd12a496fd2b857a262b52bb011',
      blockNumber: 9609915,
      timestamp: '22.11.24',
      tokenId: '10',
      type: 'CCR003 Consumer Credit data: Lenders',
      user: '0x0480Fce195Cd8548425301c7de2DA8bD8025c694',
      status: 'Verified',
    },
    {
      amount: '800000',
      blockHash: '0x4f19aa7cb7a75fe5dc7ffa38768279fc8dddabd12a496fd2b857a262b52bb011',
      blockNumber: 9609915,
      timestamp: '18.10.24',
      tokenId: '10',
      type: 'CCR003 Consumer Credit data: Lenders',
      user: '0x0480Fce195Cd8548425301c7de2DA8bD8025c694',
      status: 'Verified',
    },
    {
      amount: '800000',
      blockHash: '0x4f19aa7cb7a75fe5dc7ffa38768279fc8dddabd12a496fd2b857a262b52bb011',
      blockNumber: 9609915,
      timestamp: '17.09.24',
      tokenId: '10',
      type: 'CCR003 Consumer Credit data: Lenders',
      user: '0x0480Fce195Cd8548425301c7de2DA8bD8025c694',
      status: 'Verified',
    },
    {
      amount: '5000',
      blockHash: '0x4f19aa7cb7a75fe5dc7ffa38768279fc8dddabd12a496fd2b857a262b52bb011',
      blockNumber: 9609915,
      timestamp: '16.08.24',
      tokenId: '10',
      type: 'CCR003 Consumer Credit data: Lenders',
      user: '0x0480Fce195Cd8548425301c7de2DA8bD8025c694',
      status: 'Verified',
    },
    {
      amount: '300000',
      blockHash: '0x4f19aa7cb7a75fe5dc7ffa38768279fc8dddabd12a496fd2b857a262b52bb011',
      blockNumber: 9609915,
      timestamp: '15.07.24',
      tokenId: '10',
      type: 'CCR003 Consumer Credit data: Lenders',
      user: '0x0480Fce195Cd8548425301c7de2DA8bD8025c694',
      status: 'Verified',
    },
    {
      amount: '400000',
      blockHash: '0x4f19aa7cb7a75fe5dc7ffa38768279fc8dddabd12a496fd2b857a262b52bb011',
      blockNumber: 9609915,
      timestamp: '12.06.24',
      tokenId: '10',
      type: 'CCR003 Consumer Credit data: Lenders',
      user: '0x0480Fce195Cd8548425301c7de2DA8bD8025c694',
      status: 'Verified',
    },
    {
      amount: '800000',
      blockHash: '0x4f19aa7cb7a75fe5dc7ffa38768279fc8dddabd12a496fd2b857a262b52bb011',
      blockNumber: 9609915,
      timestamp: '11.05.24',
      tokenId: '10',
      type: 'CCR003 Consumer Credit data: Lenders',
      user: '0x0480Fce195Cd8548425301c7de2DA8bD8025c694',
      status: 'Verified',
    },
  ]

  useEffect(() => {
    const fetchHistory = async () => {
      setLoader(true)
      // let property = sessionStorage.getItem('selectedVault')
     

      try {
         const response = await getReportList(user)
        setHistoryList(response)
      } catch (error) {

      } finally {
        setLoader(false)
      }
    }

    fetchHistory()
  }, [router])

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

      await new Promise((resolve) => setTimeout(resolve, 100))

      setModalOpen(false)
      message.success('Your report has been successfully sent to the FCA')
    } catch (error) {
      message.error('Failed to send the report. Please try again.')
    } finally {
      setLoader(false)
    }
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
        {/* <div className="history-info-left">
                <div className="info-date-item">
                  <div className="date-item-title">Opening date:</div>
                  <div className="info-date">{getDate()}</div>
                </div>
                <div className="info-amount-item">
                  <div className="amount-title">Current amount owed:</div>
                  <div className="info-amount">
                    <span> HGBP  </span>
                    {property['debt']}
                  </div>
                </div>
              </div> */}

        {/* <BalanceLineChart></BalanceLineChart> */}
        {/* <div className="vault-header" style={{backgroundColor: 'pink'}}>
          <div className="vault-heade-title">
            <div className="vault-heade-title-text"></div>
          </div>
         </div> */}
        <div className="reports-info-wrapper">
          {/* <div className="info-wrapper-title">BankReports</div> */}

          <div className="history-info-right">
            {/* <div className="vaults-btn-wrap">
                    <div className="vaults-btn-text">Create a report</div>
                  </div> */}

            {/* <div className="d-flex flex-stack flex-wrap gap-4">
                    <div className="operation-select">
                      <select
                        className="form-select form-select-transparent"
                        data-control="select2"
                        data-hide-search="true"
                        data-dropdown-css-classname="w-150px"
                        data-placeholder="Select an option"
                      >
                        <option value="All">All</option>
                        <option value="Borrow">Borrow</option>
                        <option value="Interest">Monthly interest</option>
                        <option value="Repayment">Repayment</option>
                        <option value="Exchange">Exchange</option>
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
                      >
                        <option value="Show All">Show All</option>
                        <option value="Newest">Newest</option>
                        <option value="Oldest">Oldest</option>
                      </select>
                    </div>
                  </div> */}
          </div>
        </div>
      </section>

      <section className="history-window">
        <div className="table-window" style={{ position: 'relative' }}>
          <div className="card-body">
            {historyList.length > 0 ? (
              // <table className="table" id="kt_table_widget_4_table">
              //   <thead className="column-field">
              //     <tr className="column-name">
              //       <th className="column-name-item">Date</th>
              //       <th className="column-name-item">Report name</th>
              //       <th className="column-name-item">Status</th>
              //     </tr>
              //   </thead>

              //   <tbody className="table-body">
              //     {historyList.map((history, index) => (
              //       <tr className="table-item-wrap table-body-item" key={index}>
              //         {/* <div className="table-body-item"> */}
              //         <td className="table-date">{history['timestamp']}</td>
              //         {/* <td className="table-date">{getDate()}</td> */}
              //         <td className="table-action">
              //           <div className="action-img">
              //             <img src={getIcon(history['type'])} alt=""></img>
              //           </div>
              //           <div className="action-text">{history['type']}</div>
              //         </td>
              //         <td className="table-value"> HGBP  {history['amount']}</td>
              //         {/* </div> */}
              //       </tr>
              //     ))}
              //   </tbody>
              // </table>

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
                    height: '50vh',
                    
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
          {/* <ul className="pagination">
            <li className="page-item previous disabled">
              <a href="#" className="page-link">
                <i className="previous"></i>
              </a>
            </li>
            <li className="page-item ">
              <a href="#" className="page-link">
                1
              </a>
            </li>
            <li className="page-item active">
              <a href="#" className="page-link">
                2
              </a>
            </li>
            <li className="page-item next">
              <a href="#" className="page-link">
                <i className="next"></i>
              </a>
            </li>
          </ul> */}
        </div>

        <Modal width="auto" open={isModalOpen} onCancel={handleModalClose} footer={null} centered>
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
                        <td>{ Number(selectedHistory.content.totalCredit || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                        <td>{selectedHistory.content.totalVault}</td>
                        <td>{ Number(selectedHistory.content.totalDebt || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                        <td>{selectedHistory.content.avgInterest}</td>
                        <td>{ Number(selectedHistory.content.totalCurrentInterest || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                <div className="hash-wrapper">Hash : {selectedHistory.hash} </div>
              </div>

              {/* <div className='modal-btn' onClick={handleSubmit}>
                      <p>Verify</p>
                    </div> */}
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
  )
}

export default BankReports
