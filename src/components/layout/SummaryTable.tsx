import { BsArrowLeft, BsArrowLeftShort } from 'react-icons/bs'
import { useNavigate } from 'react-router'
import { ArrowLeftOutlined, LeftOutlined } from '@ant-design/icons'
import styled from 'styled-components/macro'
import {getTransactionList} from '@/api/blockchain'

export default ({ title, summaryType, summaryBorrowing,summaryCredit, titleCredit, summaryCurrent, creditBorrowSumm,creditAvailableSumm, currentCreditRate, titleMortgage, mortgageBorrowSumm,
  mortgageAvailebleSumm, currentMortgageRate, titleTotal, totalBorrowSumm, totalAvailebleSumm, currentTotalRate,btnName  }) => {
  return (
    <div className="summury-container">
                <div className="summaru-title">{title}</div>
    
                <div className="table-window">

                  {/* <!--begin::Card body--> */}
                  <div className="card-body">
                    {/* <!--begin::Table--> */}
                    <table className="summary-table" id="kt_table_widget_4_table">
                      {/* <!--begin::Table head--> */}
                      <thead className="summary-column">
                        {/* <!--begin::Table row--> */}
                        <tr className="summary-column-name">
                          <th className="summary-column-name-item">{summaryType}</th>
                          <th className="summary-column-name-item">{summaryBorrowing}</th>
                          <th className="summary-column-name-item">{summaryCredit}</th>
                          <th className="summary-column-name-item">{summaryCurrent}</th>
                        </tr>
                        {/* <!--end::Table row--> */}
                      </thead>

                      {/* <!--end::Table head--> */}
                      {/* <!--begin::Table body--> */}
                      <tbody className="summary-table-body">

                        <tr className="table-summary-item">
                          <td className="table-type">{titleCredit}</td>
                          <td className="table-borrowing">{creditBorrowSumm}</td>
                          <td className="table-available">{creditAvailableSumm}</td>
                          <td className="table-ltv">{currentCreditRate}</td>
                        </tr>
                        <tr className="table-summary-item" style={{ backgroundColor: '#F1F1F1' }}>

                          <td className="table-type">{titleMortgage}</td>
                          <td className="table-borrowing">{mortgageBorrowSumm}</td>
                          <td className="table-available">{mortgageAvailebleSumm}</td>
                          <td className="table-ltv">{currentMortgageRate}</td>

                        </tr>
                        <tr className="table-summary-item" style={{ borderTop: '1px solid rgba(235, 235, 235, 1)' }}>

                          <td className="table-type">{titleTotal}</td>
                          <td className="table-borrowing">{totalBorrowSumm}</td>
                          <td className="table-available">{totalAvailebleSumm}</td>
                          <td className="table-ltv">{currentTotalRate}</td>

                        </tr>


                      </tbody>
                      {/* <!--end::Table body--> */}
                    </table>
                    {/* <!--end::Table--> */}
                  </div>
                  {/* <!--end::Card body--> */}
                </div>






                <div className="summary-optimise-btn" onClick={()=>{getTransactionList()}}>
                  <div className="optimise-btn">{btnName}</div>
                </div>
              </div>
  )
}
