import { BsArrowLeft, BsArrowLeftShort } from 'react-icons/bs'
import { useNavigate } from 'react-router'
import { ArrowLeftOutlined, LeftOutlined } from '@ant-design/icons'
import styled from 'styled-components/macro'
import {getTransactionList} from '@/api/blockchain'

export default ({ vaultsNameDate, vaultsNameLTV, vaultsNameRatio, vaultsNameProperty, vaultsNameRisk,
  vaultsDate, vaultsLTV, vaultsRatio, vaultsProperty, vaultsRisk }) => {
  return (
    <div className="vaults-container">
             
    
                <div className="table-window">

                  {/* <!--begin::Card body--> */}
                  <div className="card-body">
                    {/* <!--begin::Table--> */}
                    <table className="summary-table" id="kt_table_widget_4_table">
                      {/* <!--begin::Table head--> */}
                      <thead className="summary-column">
                        {/* <!--begin::Table row--> */}
                        <tr className="summary-column-name">
                          <th className="summary-column-name-item">{vaultsNameDate}</th>
                          <th className="summary-column-name-item">{vaultsNameLTV}</th>
                          <th className="summary-column-name-item">{vaultsNameRatio}</th>
                          <th className="summary-column-name-item">{vaultsNameProperty}</th>
                          <th className="summary-column-name-item">{vaultsNameRisk}</th>
                        </tr>
                        {/* <!--end::Table row--> */}
                      </thead>

                      {/* <!--end::Table head--> */}
                      {/* <!--begin::Table body--> */}
                      <tbody className="summary-table-body">

                        <tr className="table-vaults-item">
                          <td className="table-type">{vaultsDate}</td>
                          <td className="table-borrowing">{vaultsLTV}</td>
                          <td className="table-available">{vaultsRatio}</td>
                          <td className="table-property">{vaultsProperty}</td>
                          <td className="table-ltv">{vaultsRisk}</td>
                        </tr>
                        <tr className="table-vaults-item">
                          <td className="table-type">{vaultsDate}</td>
                          <td className="table-borrowing">{vaultsLTV}</td>
                          <td className="table-available">{vaultsRatio}</td>
                          <td className="table-property">{vaultsProperty}</td>
                          <td className="table-ltv">{vaultsRisk}</td>
                        </tr>
                        <tr className="table-vaults-item">
                          <td className="table-type">{vaultsDate}</td>
                          <td className="table-borrowing">{vaultsLTV}</td>
                          <td className="table-available">{vaultsRatio}</td>
                          <td className="table-property">{vaultsProperty}</td>
                          <td className="table-ltv">{vaultsRisk}</td>
                        </tr>
                        

                      </tbody>
                      {/* <!--end::Table body--> */}
                    </table>
                    {/* <!--end::Table--> */}
                  </div>
                  {/* <!--end::Card body--> */}
                </div>






                {/* <div className="pagination-container">
                <div className="pagination-text">
                  Showing {historyList.length} of {historyList.length} data
                </div>
                </div> */}
              </div>
  )
}
