// @ts-nocheck
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
import { getVaultPropertyList } from '@/api/api'
import {
  getBalance,
  getInterestRate,
  getInterest,
  getBorrowAmount,
  getMMBalance,
  createDocument,
} from '@/api/blockchain'
import CloseIcon from '@/assets/icons/close.svg'
import copyIcon from '@/assets/icons/copy-icon.svg'
import downloadArrowIcon from '@/assets/icons/down-arrow-icon.svg'
import editIcon from '@/assets/icons/edit-icon.svg'
import ethereumIcon from '@/assets/icons/ethereum-icon.svg'
import filterIcon from '@/assets/icons/filter-icon.svg'
import rewardIcon from '@/assets/icons/rewards-icon.svg'
import searchIcon from '@/assets/icons/search-icon.svg'
import tokenIcon from '@/assets/icons/token-icon.png'
import spinner from '@/assets/img/kodelab-spinner-spin.gif'
import FooterLogo from '@/assets/img/logo-kodelab-footer.png'
import '@/assets/theme/css/modal.css'
import html2canvas from 'html2canvas'
import jsPDF from 'jspdf'
import { useSessionStorage } from 'usehooks-ts'
import BarChartBank from '@/components/layout/BarChartBank'
import ChartCard from '@/components/layout/ChartCard'
import ChartCardBank1 from '@/components/layout/ChartCardBank1'
import ChartCardBank2 from '@/components/layout/ChartCardBank2'
import FilterComponent from '@/components/layout/FilterComponent'
import ReportDrawer from '@/components/layout/ReportDrawer'
import SummaryTable from '@/components/layout/SummaryTable'
import VaultBarChart from '@/components/layout/VaultBarChart'
import styled from 'styled-components/macro'
import useUserMangement from '@/hooks/useUserMangement'

const ContainerWrap = styled.div`
  display: flex;
  justify-content: center;
  flex-direction: column;
  align-items: center;
`

const ClientDashboard = () => {
  const [interestPercentage, setInterestPercentage] = useState({
    value: '-',
    date: '-',
  })
  const router = useNavigate()

  const [selectedClient, setSelectedClient] = useSessionStorage('selectedClient', []) //useState([])

  let dummyArray: any[] | (() => any[]) = []

  const [balance, setBalance] = useSessionStorage('BankBalance', '0')
  const [historyList, setHistoryList] = useSessionStorage('BankHistory', dummyArray)

  const { logout, user, checkLogin } = useUserMangement()
  const [loader, setLoader] = useState(false)
  const [allVaults, setAllVaults] = useSessionStorage('selectedClientVaults', []) //useState([])
  const [filteredVaults, setFilteredVaults] = useState([])
  const [drawerVisible, setDrawerVisible] = useState(false)
  const [selectedVault, setSelectedVault] = useSessionStorage('selectedVault', {}) //useState({})

  useEffect(() => {
    checkLogin()
  }, [])

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const walletAddress = selectedClient?.userDetails?.walletAddress

        if (!walletAddress) {

          return
        }

        const bankDetails = getBankDetails(walletAddress)
        if (!bankDetails || !bankDetails.wallet) {

          return
        }

        const balance = await getMMBalance(bankDetails.wallet)
        setBalance(balance)

        const response = await getHistoryList(bankDetails.wallet)
        setHistoryList(response)
      } catch (error) {

      } finally {
        // Optional loader state
        // setLoader(false);
      }
    }

    fetchHistory()
  }, [selectedClient]) // You probably want to depend on `selectedClient` instead of `router`

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

  const valutData = [
    {
      date: '16.08.23',
      borrowing: ' HGBP  8,000,000',
      available: '10%',
      property: 'Unit 20F, Highcliff, 41D Stubbs Rd, Happy Valley, Hong Kong',
      risk: 'Low',
    },
    {
      date: '14.08.23',
      borrowing: ' HGBP  5,600,000',
      available: '46%',
      property: '1016-1018 Tai Nan W St, Cheung Sha Wan, Hong Kong',
      risk: 'Average',
    },
    {
      date: '23.07.23',
      borrowing: ' HGBP  7,020,000',
      available: '52%',
      property: 'Unit 20F, Highcliff, 41D Stubbs Rd, Happy Valley, Hong Kong',
      risk: 'Low',
    },
    {
      date: '08.07.23',
      borrowing: ' HGBP  6,000,000',
      available: '24%',
      property: '1016-1018 Tai Nan W St, Cheung Sha Wan, Hong Kong',
      risk: 'Average',
    },
    {
      date: '18.06.23',
      borrowing: ' HGBP  5,080,000',
      available: '5%',
      property: 'Unit 20F, Highcliff, 41D Stubbs Rd, Happy Valley, Hong Kong',
      risk: 'Low',
    },
    {
      date: '21.06.23',
      borrowing: ' HGBP  8,500,000',
      available: '77%',
      property: '1016-1018 Tai Nan W St, Cheung Sha Wan, Hong Kong',
      risk: 'High',
    },
    {
      date: '08.07.23',
      borrowing: ' HGBP  6,000,000',
      available: '24%',
      property: '1016-1018 Tai Nan W St, Cheung Sha Wan, Hong Kong',
      risk: 'Average',
    },
    {
      date: '23.07.23',
      borrowing: ' HGBP  7,020,000',
      available: '52%',
      property: 'Unit 20F, Highcliff, 41D Stubbs Rd, Happy Valley, Hong Kong',
      risk: 'Low',
    },
  ]

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
        setFilteredVaults(alv)
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

  //  // Calculate interest per second
  //  useEffect(() => {
  //   if (totals.totalDebt > 0) {
  //     const interestPerSecond = (Number(totals.totalDebt) * (interestRate / 100)) / (365 * 24 * 60 * 60); // Annual Rate / Seconds in a Year
  //     console.log(interestPerSecond)
  //     const interval = setInterval(() => {
  //       setInterestEarn(prev => prev + Number(Math.floor(interestPerSecond))); // Update interest every second
  //     }, time);

  //     return () => clearInterval(interval);
  //   }
  // }, [totals, interestEarn]);

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

  const handleVaultClick = async (vault) => {
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
    } catch (error) {
      message.error('Failed to fetch vault details. Please try again.')
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

  const vaultBarChartDummy = [
    { day: 'Mon', value: 90 },
    { day: 'Tue', value: 100 },
    { day: 'Wed', value: 110 },
    { day: 'Thu', value: 90 },
    { day: 'Fri', value: 130 },
    { day: 'Sat', value: 140 },
    { day: 'Sun', value: 124 },
  ]

  // Initialize filteredVaults with allVaults when component loads
  useEffect(() => {
    if (allVaults.length > 0) {
      setFilteredVaults(allVaults)
    }
  }, [allVaults])

  const handleUserSearch = (e) => {
    const searchValue = e.target.value.toLowerCase().trim()

    if (!searchValue) {
      // If search is empty, show all vaults
      setFilteredVaults(allVaults)
      return
    }

    const filtered = allVaults.filter((item) => {
      // Search by Vault ID
      const vaultIdMatch = item.vatId?.toString().toLowerCase().includes(searchValue)

      // Search by Total Credit Limit (value + debt)
      const totalCreditLimit = (Number(item.value) + Number(item.debt) || 0).toFixed(3)
      const creditLimitMatch = totalCreditLimit.includes(searchValue)

      // Search by Utilization Ratio
      const utilizationRatio = (
        (Number(item.debt) / (Number(item.debt) + Number(item.value) || 1)) *
        100
      ).toFixed(3)
      const utilizationMatch = utilizationRatio.includes(searchValue)

      // Search by Property Name
      const propertyMatch = item.property?.name?.toLowerCase().includes(searchValue)

      // Search by Risk Level
      const totalLimit = Number(item.value) + Number(item.debt)
      const ratio = totalLimit > 0 ? Number(item.debt) / totalLimit : 0
      let riskLevel = ''

      if (ratio < 0.3) riskLevel = 'low'
      else if (ratio < 0.7) riskLevel = 'average'
      else riskLevel = 'high'

      const riskMatch = riskLevel.includes(searchValue)

      // Return true if any field matches
      return vaultIdMatch || creditLimitMatch || utilizationMatch || propertyMatch || riskMatch
    })

    setFilteredVaults(filtered)
  }

  const handleCopyToClipBoard = async () => {
    try {
      await navigator.clipboard.writeText(selectedClient?.kyb)
      return true // Successfully copied
    } catch (err) {

      return false // Failed to copy
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
            {/* Header part */}
            <div className="header-wrap">
              <div className="title-area">
                <h1>{selectedClient?.name}</h1>
                <p className={'current-status-' + selectedClient?.status.toLowerCase()}>
                  {selectedClient?.status}
                </p>
              </div>
              <div className="button-area">
                <button className="pause-client" onClick={() => message.info('Coming Soon')}>
                  Pause Client
                </button>
              </div>
            </div>

            {/* Company details and credit limit part */}
            <div
              className="first-main-line"
              style={{ display: 'flex', flexWrap: 'wrap', marginBottom: '20px' }}
            >
              <div style={{ flex: '2', padding: '0px' }}>
                <div className="card-wrap company-details">
                  <div className="card-header">
                    <h3>Company Details</h3>
                    <img src={editIcon} alt="edit" />
                  </div>
                  <div className="card-body">
                    <div className="top-part">
                      <div>
                        <p>Account ID</p>
                        <p>{selectedClient?.id || '-'}</p>
                      </div>
                      <div>
                        <p>Email</p>
                        <p>{selectedClient?.contact?.email || '-'}</p>
                      </div>
                      <div>
                        <p>Phone Number</p>
                        <p>{selectedClient?.contact?.phone || '-'}</p>
                      </div>
                    </div>
                    <div className="bottom-part">
                      <div>
                        <p>Wallet Address</p>
                        <p>{selectedClient?.userDetails?.walletAddress || '-'}</p>
                      </div>
                      <div style={{ paddingLeft: '16px' }}>
                        <p>KYB</p>
                        <div
                          style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                          }}
                        >
                          <p style={{ color: '#0C4FAD' }}>{selectedClient?.kyb || '-'}</p>
                          <img
                            src={copyIcon}
                            alt="copy"
                            style={{ cursor: 'pointer' }}
                            onClick={handleCopyToClipBoard}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="client-credit-chart">
                <ChartCardBank1
                  title="Credit Limit"
                  value={totals.totalCredit}
                  mortgageText="Total fixed mortgages outstanding"
                  mortgageSumm={getNumber(property['property']['properties']['originalLoanValue'])}
                  creditText="Available Credit"
                  creditSumm={totals.totalAvailableCredit}
                  approveLoan={'0'}
                  borrowedText="Borrowed"
                  borrowedSumm={totals.totalDebt}
                  btnName="Optimise"
                  modalToggled={() => togglePayBack(!payToggled)}
                />
              </div>
            </div>
            {/* <div className="first-main-line" style={{ display: 'flex', flexWrap: 'wrap' }}>
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
                  numberOfVault={totals.totalVault}
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
            </div> */}

            {/* Second section with app Id, secret key and reset button*/}
            <div
              className="first-main-line"
              style={{ width: '100%', display: 'flex', flexWrap: 'wrap', marginBottom: '20px' }}
            >
              <div
                className="card-wrap api-details-area"
                style={{
                  width: '100%',
                  height: '100%',
                  backgroundColor: '#fff',
                  borderRadius: '16px',
                  boxShadow: '0px 0px 10px 0px rgba(0, 0, 0, 0.1)',
                  padding: '20px',
                }}
              >
                <p>API</p>
                <label htmlFor="appId">App ID</label>
                <input
                  type="text"
                  name="appId"
                  id="appId"
                  placeholder="App ID"
                  value={selectedClient?.userDetails?.appId}
                  disabled
                />
                <div className="secret-key">
                  <label htmlFor="secretKey">Secret key</label>
                  <div className="secret-key-wrapper">
                    <input
                      type="password"
                      name="secretKey"
                      id="secretKey"
                      placeholder="Secret key"
                      value={selectedClient?.userDetails?.secretKey}
                      disabled
                    />
                    <button className="reset-btn" onClick={() => message.info('Coming Soon')}>
                      Reset
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Third section with token, chain, reward, vaults*/}
            <div
              className="first-main-line"
              style={{ width: '100%', display: 'flex', flexWrap: 'wrap', marginBottom: '20px' }}
            >
              <div
                style={{
                  width: '100%',
                  flex: '2',
                  padding: '0px',
                  display: 'flex',
                  flexDirection: 'column',
                }}
              >
                <div className="token-chain-top-part">
                  <div
                    className="card-wrap"
                    style={{
                      display: 'flex',
                      backgroundColor: '#ffffff',
                      boxShadow: '0px 0px 10px 0px rgba(0, 0, 0, 0.1)',
                    }}
                  >
                    <div className="img">
                      <img src={tokenIcon} alt="Token" />
                    </div>
                    <div className="text">
                      <p>Token</p>
                      <p>{selectedClient?.userDetails.token}</p>
                    </div>
                  </div>
                  <div
                    className="card-wrap"
                    style={{
                      display: 'flex',
                      backgroundColor: '#ffffff',
                      boxShadow: '0px 0px 10px 0px rgba(0, 0, 0, 0.1)',
                    }}
                  >
                    <div className="img">
                      <img src={ethereumIcon} alt="Ethereum" />
                    </div>
                    <div className="text">
                      <p>Chain</p>
                      <p>{selectedClient?.userDetails.chain}</p>
                    </div>
                  </div>
                </div>
                <div className="reward-bottom-part">
                  <div className="img">
                    <img src={rewardIcon} alt="reward" />
                  </div>
                  <div className="text">
                    <p>Reward HOC</p>
                    <p>{selectedClient?.userDetails.reward}</p>
                  </div>
                </div>
              </div>
              <div style={{ width: '100%', flex: '3', padding: '0px' }}>
                <div
                  className="card-wrap"
                  style={{
                    width: '100%',
                    height: '100%',
                    backgroundColor: '#fff',
                    borderRadius: '16px',
                    boxShadow: '0px 0px 10px 0px rgba(0, 0, 0, 0.1)',
                    padding: '20px',
                  }}
                >
                  <VaultBarChart
                    data={vaultBarChartDummy}
                    totalVaults={allVaults.length}
                    range="17/03 - 23/03"
                  />
                </div>
              </div>
            </div>
            <div className="vaults-header">
              <div className="vaults-header-wrapper">
                <div className="vaults-title">
                  <p>Vaults</p>
                </div>
                <div className="vaults-right">
                  <FilterComponent
                    visible={drawerVisible}
                    onClose={() => setDrawerVisible(false)}
                  />
                  <img
                    src={filterIcon}
                    style={{ cursor: 'pointer' }}
                    alt="filter"
                    onClick={() => setDrawerVisible(true)}
                  />
                  <button className="download-btn" onClick={() => setModalOpen(true)}>
                    <img src={downloadArrowIcon} alt="download report" />
                    Report
                  </button>
                  <div className="search-bar">
                    <img src={searchIcon} alt="search" />
                    <input type="text" placeholder="Search..." onChange={handleUserSearch} />
                  </div>
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
                      <th className="summary-column-item">Vault Id</th>
                      <th className="summary-column-item">Total Credit Limit</th>
                      <th className="summary-column-name-item">Utilisation ratio</th>
                      <th className="summary-column-name-item">Asset</th>
                      <th className="summary-column-name-item">Risk</th>
                    </tr>
                  </thead>

                  <tbody className="summary-table-body">
                    {filteredVaults.map((item, index) => (
                      <tr
                        key={index}
                        className="table-vaults-item"
                        onClick={() => handleVaultClick(item)}
                      >
                        <td className="table-type">{item.vatId}</td>
                        <td className="table-borrowing">
                          {(Number(item.value) + Number(item.debt) || 0).toFixed(3)}
                        </td>
                        <td className="table-available">
                          {(
                            (Number(item.debt) / (Number(item.debt) + Number(item.value) || 1)) *
                            100
                          ).toFixed(3)}{' '}
                          %
                        </td>

                        <td className="table-property">{item.property?.name}</td>
                        <td className="table-risk">
                          {(() => {
                            const totalLimit = Number(item.value) + Number(item.debt)
                            const utilizationRatio =
                              totalLimit > 0 ? Number(item.debt) / totalLimit : 0

                            if (utilizationRatio < 0.3)
                              return <p className={'table-low'}>{'Low'}</p>
                            if (utilizationRatio < 0.7)
                              return <p className={'table-average'}>{'Average'}</p>
                            return <p className={'table-high'}>{'High'}</p>
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
                        <p>Submit</p>
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
              </section>This option is not available
            </Modal>

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

export default ClientDashboard
