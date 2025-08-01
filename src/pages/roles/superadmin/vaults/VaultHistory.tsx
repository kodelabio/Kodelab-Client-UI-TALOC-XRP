import { Spin } from 'antd'
import { StepComponentsProps } from '../CreateVault'
import { useCallback, useEffect, useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { getHistoryList } from '@/api/api'
import { getTransactionList, getBlockTime } from '@/api/blockchain'
import BorrowIcon from '@/assets/img/icons/borrow-icon.svg'
import InterestIcon from '@/assets/img/icons/calendar-icon.svg'
import ExchangeIcon from '@/assets/img/icons/exchange_btn.svg'
import RepayIcon from '@/assets/img/icons/repayment-icon.svg'
import SideCaseIcon from '@/assets/img/icons/sideCase.svg'
import FooterLogo from '@/assets/img/logo-kodelab-footer.png'
import Card from '@/components/Card'
import Property from '@/components/PropertyCard'
import BalanceCard from '@/components/layout/BalanceCard'
import BalanceLineChart from '@/components/layout/BalanceLineChart'
import ChartCard from '@/components/layout/ChartCard'
import { getWrapHolder } from '@/hooks/useCdpNft'
import useProxy from '@/hooks/useProxy'
import useTokenAllowance from '@/hooks/useTokenAllowance'
import useUserMangement from '@/hooks/useUserMangement'

const VaultHistory = () => {
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
  useEffect(() => {
    const fetchHistory = async () => {
      let property = sessionStorage.getItem('selectedVault')

      if (property) {
        let p = JSON.parse(property)
        setProperty(p)

        setLoader(true)

        try {
          const response = await getHistoryList(p.vatAddress)
          // Handle the response (e.g., update state with data)
          setHistoryList(response) // Replace with actual data if needed
        } catch (error) {

        } finally {
          setLoader(false)
        }
      } else {
        router('/home/dashboard')
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

  return (
    <>
      {loader ? (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Spin className="row-center ptb-30" />
        </div>
      ) : (
        <>
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

              <div className="history-info-wrapper">
                <div className="info-wrapper-title">Transaction history</div>
                <div className="history-info-right">
                  <div className="d-flex flex-stack flex-wrap gap-4">
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
                  </div>
                </div>
              </div>
            </section>

            <section className="history-window">
              <div className="table-window" style={{ position: 'relative', marginBottom: '50px' }}>
                <div className="card-body">
                  {historyList.length > 0 ? (
                    <table className="table" id="kt_table_widget_4_table">
                      <thead className="column-field">
                        <tr className="column-name">
                          <th className="column-name-item">Date</th>
                          <th className="column-name-item">Action type</th>
                          <th className="column-name-item">Value in HGBP </th>
                        </tr>
                      </thead>

                      <tbody className="table-body">
                        {historyList.map((history, index) => (
                          <tr className="table-item-wrap table-body-item" key={index}>
                            {/* <div className="table-body-item"> */}
                            <td className="table-date">{history['timestamp']}</td>
                            {/* <td className="table-date">{getDate()}</td> */}
                            <td className="table-action">
                              <div className="action-img">
                                <img src={getIcon(history['type'])} alt=""></img>
                              </div>
                              <div className="action-text">{history['type']}</div>
                            </td>
                            <td className="table-value"> HGBP {history['amount']}</td>
                            {/* </div> */}
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
            </section>
          </div>
        </>
      )}
    </>
  )
}

export default VaultHistory
