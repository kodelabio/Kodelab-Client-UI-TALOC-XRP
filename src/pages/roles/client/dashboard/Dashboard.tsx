import { Modal, message, Spin } from 'antd'
import { useCallback, useEffect, useRef, useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import {
  getAllByVault,
  getAssetDetails,
  getBankDetails,
  getFCADetails,
  getHistoryList,
} from '@/api/api'
import {
  getBalance,
  getInterestRate,
  getInterest,
  getBorrowAmount,
  getMMBalance,
  createDocument,
} from '@/api/blockchain'
import CloseIcon from '@/assets/icons/close.svg'
import spinner from '@/assets/img/kodelab-spinner-spin.gif'
import FooterLogo from '@/assets/img/logo-kodelab-footer.png'
import '@/assets/theme/css/modal.css'
import apiService from '@/services/apiService'
import html2canvas from 'html2canvas'
import jsPDF from 'jspdf'
import { delay, isNumber, set } from 'lodash'
import { useSessionStorage } from 'usehooks-ts'
import BarChartBank from '@/components/layout/BarChartBank'
import ChartCard from '@/components/layout/ChartCard'
import ChartCardBank1 from '@/components/layout/ChartCardBank1'
import ChartCardBank2 from '@/components/layout/ChartCardBank2'
import styled from 'styled-components/macro'
import VaultTable from '@/pages/roles/superadmin/vaults/index'
import useUserMangement from '@/hooks/useUserMangement'

const ContainerWrap = styled.div`
  display: flex;
  justify-content: center;
  flex-direction: column;
  align-items: center;
`

const Dashboard = () => {
  const [interestPercentage, setInterestPercentage] = useState({
    value: '-',
    date: '-',
  })
  const router = useNavigate()

  let dummyArray: any[] | (() => any[]) = []

  const [balance, setBalance] = useSessionStorage('BankBalance', '0')
  const [historyList, setHistoryList] = useSessionStorage('BankHistory', dummyArray)

  const { logout, user, checkLogin } = useUserMangement()
  const [loader, setLoader] = useState(false)
  const [allVaults, setAllVaults] = useSessionStorage('allVaults', []) //useState([])

  useEffect(() => {
    checkLogin()
  }, [])

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const getAllClients = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      if (allVaults.length > 1) setLoading(false)

      const clients = await apiService.getAllVaults(user.id)
      setAllVaults(clients.data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch clients')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    getAllClients()
  }, [])

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const balance = await getMMBalance(user.walletAddress)
        setBalance(balance)
        const response = await getHistoryList(user.walletAddress)
        setHistoryList(response) // Replace with actual data if needed
      } catch (error) {

      } finally {
        // setLoader(false)
      }
    }

    fetchHistory()
  }, [router])

  const location = useLocation()

  const [property, setProperty] = useState()

  const [propertyNFT, setPropertyNFT] = useState({})

  useEffect(() => {
    setInterestPercentage(getInterestRate())
  }, [])

  const [pdfUrl, setPdfUrl] = useState(null)
  const [fileName, setFileName] = useState('')
  const pdfComponentRef = useRef<HTMLDivElement>(null)

  async function handlePrint() {
    const element = pdfComponentRef.current
    // Ensure full content is captured, including scrollable areas
    window.scrollTo(0, 0)

    const canvas = await html2canvas(element, {
      scale: 2, // Higher scale for better quality
      useCORS: true, // Fix issues with external images
      scrollY: -window.scrollY, // Capture full scrollable content
    })

    const imgData = canvas.toDataURL('image/png')

    const pdf = new jsPDF('p', 'mm', 'a4')
    const imgWidth = 210 // A4 width in mm
    const imgHeight = (canvas.height * imgWidth) / canvas.width

    pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight)

    // Open the PDF in a new tab
    // window.open(pdf.output("bloburl"), "_blank");
    // Generate Blob URL for PDF preview
    const pdfBlob = pdf.output('blob')
    const pdfUrl = URL.createObjectURL(pdfBlob)
    setPdfUrl(pdfUrl)
    // setIsModalOpen(true);
    // Auto-download the PDF
    // pdf.save("download.pdf");
    // Format filename as "xyz--YYYY-MM-DD.pdf"
    // Get the current date & time for filename
    const now = new Date()
    const formattedDate = now.toISOString().split('T')[0] // YYYY-MM-DD
    const formattedTime = now.toLocaleTimeString('en-GB').replace(/:/g, '-') // HH-MM-SS (24-hour format)
    const generatedFileName = `doc--${formattedDate}--${formattedTime}.pdf`
    setFileName(generatedFileName)

    // Auto-download with custom name when clicking the download button
    const downloadLink = document.createElement('a')
    downloadLink.href = pdfUrl
    downloadLink.download = generatedFileName
    document.body.appendChild(downloadLink)
    downloadLink.click()
    document.body.removeChild(downloadLink)
    setModalOpen(false)
  }

  const [totals, setTotals] = useSessionStorage('totals', {
    totalVault: Number(0),
    totalDebt: Number(0),
    totalAvailableCredit: Number(0),
    totalCredit: Number(0),
    totalCurrentInterest: Number(0),
    avgInterest: Number(5),
    interest: Number(0),
    currentTime: Number(0),
  })

  useEffect(() => {
    const fetchVaults = async () => {
      setLoader(true)
      if (allVaults.length > 0) {
        const totalCurrentInterest = allVaults.reduce(
          (sum, vault) => sum + Number(vault.currentInterest || 0),
          Number(0),
        )
        setInterestEarn(totalCurrentInterest)
        setLoader(false)
      }

      try {
        const alv = await getAllByVault()

        // Calculate total debt and total value
        const totalVault = alv.length
        const totalDebt = alv.reduce((sum, vault) => sum + Number(vault.debt || 0), Number(0))
        const totalAvailableCredit = alv.reduce(
          (sum, vault) => sum + Number(vault.value || 0),
          Number(0),
        )
        const totalCurrentInterest = alv.reduce(
          (sum, vault) => sum + Number(vault.currentInterest || 0),
          Number(0),
        )
        const avgInterest = 5

        const totalCredit = totalDebt + totalAvailableCredit
        const currentTime = 123454
        setTotals({
          totalVault,
          totalDebt,
          totalAvailableCredit,
          totalCredit,
          totalCurrentInterest,
          avgInterest,
          interest: totalCurrentInterest,
          currentTime,
        })
        setInterestEarn(totalCurrentInterest)
        setAllVaults(alv)
      } catch (error) {
      } finally {
        setLoader(false)
      }
    }

    fetchVaults()
  }, [])

  useEffect(() => {
    // setLoader(true)
    let property =
      '{"property":{"name":"98 Ho Chung Road, Sai Kung, Hong Kong","description":"HELOC token issued by Kodelab to represent a customer loan on property address: 98 Ho Chung Road, Sai Kung, Hong Kong","image":"https://portal-integ.toko.network/v1/juno/download_document?doc_id=public-4crsfVSN6kTxHwT9RSvraA&filename=public-ripple_project_customer_3.png&hash=sha512-a8827c17f2a02600279aa5414f40476a76d55685ba047f7bfa838f297d37b4b5fd7e2e5fb0cb9ad24b39eca429ec5f34123ac69d4b7c703c9f79f5de774aec36","properties":{"loanNumber":"HLN53962","ownerWalletAddress":"0xbEb159bDB1A8Eb6545A4dCa5E8e395F293e0128d","customerNumber":"CN013673","addressLine1":"98 Ho Chung Rd","addressLine2":"Sai Kung","city":"Hong Kong","country":"China","assetValue":"25,000,000","assetValuationDate":"10/31/2023","loanCurrency":" HGBP","originalLoanValue":"1,200,000","maximumLoanPercentage":"40%","approvedLoanAmount":"1,200,000","talocCurrency":"Hypothetical e- HGBP","defaultFlag":"No"}},"tokenAddress":"0xAdB218157Fdeb4a6389A5c108D42f48E1B290B0d","value":"499995.0860157402574922","debt":"700004.9139842597425078","interest":"0","time":"1694710167","vatId":"1"}'
    //sessionStorage.getItem('selectedVault')

    if (property) {
      let p = JSON.parse(property)
      setProperty(p)
      // setLoader(false)
      // getPropertyInfromationByToken(p.tokenID).then((propertN) => {
      //   setPropertyNFT(propertN)
      //   let chartData = {
      //     borrowedSumm: propertN.debt,
      //     mortgageSumm: p['fixedMortgage'],
      //     approveLoan: p['approveLoan'] - propertN.debt,
      //   }
      //   sessionStorage.setItem('chartValue', JSON.stringify(chartData))
      //   setLoader(false)
      //   // setInterest(property.interest)
      // })
    } else {
      // router('/home/dashboard')
    }
  }, [])

  const [interest, setInterest] = useState('0')
  const [interestEarn, setInterestEarn] = useState(0)

  const [payToggled, togglePayBack] = useState(false)

  const interestRate = 3

  const [time, setTime] = useState(1000)

  useEffect(() => {
    if (user) {
      // setInterval(() => {
      //   getBalance(user).then((value) => {
      //     setBalance(value)
      //   })
      //   getBorrowAmount(property.vatId).then((obj) => {
      //     let update = false
      //     if (property.value != obj.value) {
      //       property.value = obj.value
      //       update = true
      //     }
      //     if (property.debt != obj.debt) {
      //       property.debt = obj.debt
      //       update = true
      //     }
      //     if (update) {
      //       setProperty(property)
      //       sessionStorage.setItem('selectedVault', JSON.stringify(property))
      //     }
      //     //
      //   })
      // }, 4000)
      // setInterval(() => {
      //   getInterest(property.vatId).then((value) => {
      //     // jaiesh
      //     // console.log('value ........');
      //     // console.log(value);
      //     // console.log(typeof Number(value));
      //     // console.log('value ........');
      //     setInterest(value)
      //   })
      // }, 2000)
      // setInterestEarn(totals.totalDebt)
    }
  }, [totals, user])

  useEffect(() => {
    // wait for 5 seconds
    setTimeout(() => {
      const interestPerSecond =
        (Number(totals.totalDebt) * (interestRate / 100)) / (365 * 24 * 60 * 60) // Annual Rate / Seconds in a Year

      setInterestEarn(interestEarn + interestPerSecond)
      // setInterestEarn(prev => prev + Number(Math.floor(interestPerSecond))); // Update interest every second
      // console.log(interestPerSecond)
    }, time)
  }, [interestEarn])

  function getNumber(str) {
    return parseFloat(str.replace(/,/g, ''))
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

  //open modal window only for FCA
  const [isModalOpen, setModalOpen] = useState(false)

  const [selectedStandard, setSelectedStandard] = useState(null)
  const [selectedDataStandard, setSelectedDataStandard] = useState(null)
  const [selectedActivity, setSelectedActivity] = useState(null)

  const [step, setStep] = useState(1)

  const standards = ['Internal', 'FCA', 'CBUAE']
  const dataStandards = ['CCR003 Consumer Credit data: Lenders']
  const activities = [
    'Home credit loan agreements',
    'Bill of sale loan agreements',
    'Other collateralised loan agreements',
  ]

  const handleModalClose = () => {
    setModalOpen(false)
    setSelectedStandard(null)
    setSelectedDataStandard(null)
    setSelectedActivity(null)
    setStep(1)
    setLoader(false)
  }
  const isValidCombination =
    selectedStandard === 'FCA' &&
    selectedDataStandard === 'CCR003 Consumer Credit data: Lenders' &&
    selectedActivity === 'Other collateralised loan agreements'

  const handleNextStep = () => {
    if (isValidCombination) {
      const interest = interestEarn
      setTotals({
        totalVault: totals.totalVault,
        totalDebt: totals.totalDebt,
        totalAvailableCredit: totals.totalAvailableCredit,
        totalCredit: totals.totalCredit,
        totalCurrentInterest: totals.totalCurrentInterest,
        avgInterest: totals.avgInterest,
        interest: interest,
        currentTime: 123456777,
      })
      setStep(2)
    }
  }

  const handleSubmit = async () => {
    try {
      setLoader(true)
      const fcaDetail = await getFCADetails(54)
      await createDocument(fcaDetail, totals)

      await new Promise((resolve) => setTimeout(resolve, 100))

      setModalOpen(false)
      message.success('Your report has been successfully sent to the FCA')
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
        property && (
          <div>
            <div className="first-main-line" style={{ display: 'flex', flexWrap: 'wrap', gap: 16 }}>
              <div className="tab-wrap">
                <ChartCardBank1
                  title="Overall Credit Limit"
                  valueText=" HGBP  "
                  value={totals.totalCredit}
                  mortgageText="Total fixed mortgages outstanding"
                  mortgageSumm={getNumber(property['property']['properties']['originalLoanValue'])}
                  creditText="Total used credit"
                  creditSumm={totals.totalAvailableCredit}
                  approveLoan={'0'}
                  borrowedText="Total credit available"
                  borrowedSumm={totals.totalDebt}
                  btnName="Optimise"
                  modalToggled={() => togglePayBack(!payToggled)}
                />
              </div>
              <div className="tab-wrap">
                <ChartCardBank2
                  title="Risk statistics"
                  numberOfVault={allVaults.length}
                  lowRisk={
                    allVaults?.filter((item) => {
                      const totalLimit = Number(item.value) + Number(item.debt)
                      const utilizationRatio = totalLimit > 0 ? Number(item.debt) / totalLimit : 0
                      return utilizationRatio < 0.3
                    }).length
                  }
                  avgRisk={
                    allVaults?.filter((item) => {
                      const totalLimit = Number(item.value) + Number(item.debt)
                      const utilizationRatio = totalLimit > 0 ? Number(item.debt) / totalLimit : 0
                      return utilizationRatio >= 0.3 && utilizationRatio < 0.7
                    }).length
                  }
                  highRisk={
                    allVaults?.filter((item) => {
                      const totalLimit = Number(item.value) + Number(item.debt)
                      const utilizationRatio = totalLimit > 0 ? Number(item.debt) / totalLimit : 0
                      return utilizationRatio >= 0.7
                    }).length
                  }
                  valueText=" HGBP  "
                  value={totals.totalVault}
                  mortgageText="Low risk:"
                  mortgageSumm={
                    allVaults?.filter((item) => {
                      const totalLimit = Number(item.value) + Number(item.debt)
                      const utilizationRatio = totalLimit > 0 ? Number(item.debt) / totalLimit : 0
                      return utilizationRatio < 0.3
                    }).length
                  }
                  creditText="Average risk:"
                  creditSumm={
                    allVaults?.filter((item) => {
                      const totalLimit = Number(item.value) + Number(item.debt)
                      const utilizationRatio = totalLimit > 0 ? Number(item.debt) / totalLimit : 0
                      return utilizationRatio >= 0.3 && utilizationRatio < 0.7
                    }).length
                  }
                  approveLoan={property['property']['properties']['approvedLoanAmount']}
                  borrowedText="High risk:"
                  borrowedSumm={
                    allVaults?.filter((item) => {
                      const totalLimit = Number(item.value) + Number(item.debt)
                      const utilizationRatio = totalLimit > 0 ? Number(item.debt) / totalLimit : 0
                      return utilizationRatio >= 0.7
                    }).length
                  }
                  btnName="Optimise"
                  modalToggled={() => togglePayBack(!payToggled)}
                />
              </div>
              <div className="tab-wrap">
                <div className="interest-wrapp">
                  <div className="interest-tab-item-bank">
                    <div>
                      <div className="interest-tab-title">Total Portfolio Interest</div>
                      <div className="interest-summ-wrapper">
                        <div className="interest-summ-text"> HGBP </div>
                        <div className="interest-summ">
                          {interestEarn.toFixed(3).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                        </div>
                      </div>
                    </div>
                    <div className="interest-date-wrapper">
                      <div className="interest-date-text">Up to</div>
                      <div className="interest-date">{getDate()}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="main-window-line">
              <div className="second-main-line" style={{ width: '100%' }}>
                <BarChartBank vatAddress={'0x'}></BarChartBank>
              </div>
            </div>
            <div className="vaults-header">
              <div className="vaults-header-wrapper">
                <div className="vaults-title">
                  <p>Vaults</p>
                </div>
                <div className="vaults-right">
                  <div className="vaults-btn-wrap" onClick={() => setModalOpen(true)}>
                    <div className="vaults-btn-text">Create a report</div>
                  </div>

                  <div className="history-info-right">
                    <div className="d-flex flex-stack flex-wrap gap-4">
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

                      <div className="operation-select">
                        <select
                          className="form-select form-select-transparent"
                          data-control="select2"
                          data-hide-search="true"
                          data-dropdown-css-classname="w-150px"
                          data-placeholder="Select an option"
                        >
                          <option value="All">All risks</option>
                          <option value="Borrow">Low risk</option>
                          <option value="Interest">Average risk</option>
                          <option value="Repayment">High risk</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <VaultTable></VaultTable>

            {/* <div className="pagination-container">
                <div className="pagination-text">
                  Showing {historyList.length} of {historyList.length} data
                </div>
                </div> */}


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
                  {/* <div className="modal-title">
                    <h3>
                      {step === 1 ? 'Create a report' : 'CCR003 Consumer Credit data: Lenders'}
                    </h3>
                  </div> */}

                  <div className="modal-content" ref={pdfComponentRef}>
                    <div className="modal-title">
                      <h3>
                        {step === 1 ? 'Create a report' : 'CCR003 Consumer Credit data: Lenders'}
                      </h3>
                    </div>
                    {step === 1 ? (
                      <>
                        <div className="modal-section">
                          <p>Select standard</p>
                          <div className="chip-group">
                            {standards.map((standard) => (
                              <button
                                key={standard}
                                className={`chip ${
                                  selectedStandard === standard ? 'chip-selected' : ''
                                }`}
                                onClick={() => setSelectedStandard(standard)}
                              >
                                {standard}
                              </button>
                            ))}
                          </div>
                        </div>

                        <div className="modal-section">
                          <p>Data submission standard</p>
                          <div className="chip-group">
                            {dataStandards.map((dataStandard) => (
                              <button
                                key={dataStandard}
                                className={`chip ${
                                  selectedDataStandard === dataStandard ? 'chip-selected' : ''
                                }`}
                                onClick={() => setSelectedDataStandard(dataStandard)}
                              >
                                {dataStandard}
                              </button>
                            ))}
                          </div>
                        </div>

                        <div className="modal-section">
                          <p>Activity</p>
                          <div className="chip-group">
                            {activities.map((activity) => (
                              <button
                                key={activity}
                                className={`chip ${
                                  selectedActivity === activity ? 'chip-selected' : ''
                                }`}
                                onClick={() => setSelectedActivity(activity)}
                              >
                                {activity}
                              </button>
                            ))}
                          </div>
                        </div>
                      </>
                    ) : (
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
                              <td>{totals.totalCredit}</td>
                              <td>{totals.totalVault}</td>
                              <td>{totals.totalDebt.toFixed(3)}</td>
                              <td>{totals.avgInterest}</td>
                              <td>{totals.interest.toFixed(3)}</td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                  {step === 1 ? (
                    <div
                      className={`modal-btn ${!isValidCombination ? 'disabled' : ''}`}
                      onClick={handleNextStep}
                    >
                      <p>Populate report from chain</p>
                    </div>
                  ) : (
                    <div className="modal-btns-wrapper">
                      <div className="save-btn" onClick={handlePrint}>
                        <p>Save</p>
                      </div>

                      <div className="modal-btn" onClick={handleSubmit}>
                        <p>Submit </p>
                      </div>
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
            </Modal>This option is not available

            {/* <Modal width={440} open={payToggled}>
              <section className="demo-popup">
                <div className="borrow-popup-wrapper">
                  <div className="borrow-popup-close-btn">
                    <img src={CloseIcon} alt=""></img>
                  </div>
                  <div className="demo-popup-title"> in demo</div>

                  <div className="borrow-btn-wrap" onClick={() => togglePayBack(!payToggled)}>
                    <div className="borrow-btn-text">Close</div>
                  </div>
                </div>
              </section>
            </Modal> */}
          </div>
        )
      )}
    </>
  )
}

export default Dashboard
