import { Modal } from 'antd'
import { Spin } from 'antd'
import { StepComponentsProps } from '../CreateVault'
import { useCallback, useEffect, useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { getBalance, getInterestRate, getInterest, getBorrowAmount } from '@/api/blockchain'
import infoBtn from '@/assets/icons/infoBtn.svg'
import spinner from '@/assets/img/kodelab-spinner-spin.gif'
import FooterLogo from '@/assets/img/logo-kodelab-footer.png'
// import BarChart from '@/assets/img/barchart.svg'
import Chart from 'chart.js/auto'
import { getRelativePosition } from 'chart.js/helpers'
import { isNumber } from 'lodash'
import Canvas from '@/components/Canvas'
import Card from '@/components/Card'
import Property from '@/components/PropertyCard'
import BalanceCard from '@/components/layout/BalanceCard'
import BarChart from '@/components/layout/BarChart'
import ChartCard from '@/components/layout/ChartCard'
import SummaryTable from '@/components/layout/SummaryTable'
import { getWrapHolder } from '@/hooks/useCdpNft'
import useProxy from '@/hooks/useProxy'
import useTokenAllowance from '@/hooks/useTokenAllowance'
import useUserMangement from '@/hooks/useUserMangement'

const PropertyDashboard = () => {
  const [interestPercentage, setInterestPercentage] = useState({
    value: '-',
    date: '-',
  })

  const { logout, user, checkLogin } = useUserMangement()
  const [loader, setLoader] = useState(false)

  useEffect(() => {
    checkLogin()
  }, [])

  const location = useLocation()
  const router = useNavigate()

  const [property, setProperty] = useState()

  const [propertyNFT, setPropertyNFT] = useState({})

  useEffect(() => {
    setInterestPercentage(getInterestRate())
  }, [])

  useEffect(() => {
    setLoader(true)
    let property = sessionStorage.getItem('selectedVault')
    if (property) {
      let p = JSON.parse(property)
      setProperty(p)
      setLoader(false)
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
      router('/home/dashboard')
    }
  }, [])

  const [interest, setInterest] = useState('0')

  const [payToggled, togglePayBack] = useState(false)
  const [errorPopupOpenToggled, toggleCloseErrorPopup] = useState(false)

  const [time, setTime] = useState(120)

  useEffect(() => {

    if (property) {
      getInterest(property.vatId).then((value) => {
        // console.log('value ........');
        // console.log(value);
        // console.log(typeof Number(value));
        // console.log('value ........');
        setInterest(value)
      })
    }
    if (user) {
      getBalance(user).then((value) => {
        setBalance(value)
      })
    }
  }, [user, property])

  const [balance, setBalance] = useState(0)

  const [creditSum, setCreditSum] = useState(0)
  const [borrowedSum, setBorrowedSum] = useState(0)

  useEffect(() => {
    if (property) {
      let cs =
        getNumber(property['property']['properties']['approvedLoanAmount']) -
        getNumber(property['debt'])
      setCreditSum(cs)
      let bs = getNumber(property['debt'])
      setBorrowedSum(bs)
    }
  }, [property])

  useEffect(() => {
    if (user) {
      if (property) {
        setInterval(() => {
          getBalance(user).then((value) => {
            setBalance(value)
          })

          getBorrowAmount(property.vatId).then((obj) => {
            let update = false

            if (!obj.activit) {
              // sessionStorage.removeItem('selectedVault')
              // router('/home/dashboard')
            } else {
              if (
                property.value == undefined ||
                obj.value == undefined ||
                property.value != getNumber(obj.value)
              ) {
                property.value = getNumber(obj.value)
                update = true
              }

              if (
                property.debt == undefined ||
                obj.debt == undefined ||
                property.debt != getNumber(obj.debt)
              ) {
                property.debt = getNumber(obj.debt)
                update = true
              }
              if (update) {
                setProperty(property)
                let cs =
                  getNumber(property['property']['properties']['approvedLoanAmount']) -
                  getNumber(property['debt'])

                setCreditSum(cs)
                let bs = getNumber(property['debt'])
                setBorrowedSum(bs)

                sessionStorage.setItem('selectedVault', JSON.stringify(property))
              }
            }
          })
        }, 2000)

        setInterval(() => {
          getInterest(property.vatId).then((value) => {
            setInterest(value)
          })
        }, 2000)
      }
    }
  }, [user])

  function getNumber(str) {
    if (str == undefined || str == 0) {
      return 0
    }

    return parseFloat(String(str).replace(/,/g, ''))
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
          {/* <Spin className="row-center ptb-30" /> */}
          <div>
            <img
              style={{
                width: '40px',
                height: '40px',
              }}
              src={spinner}
            />
          </div>
        </div>
      ) : (
        property && (
          <div>
            <div className="first-main-line">
              <div className="first-main-line-left">
                <ChartCard
                  title="Total Credit Limit"
                  valueText=" HGBP  "
                  value={
                    getNumber(property['property']['properties']['approvedLoanAmount']) +
                    getNumber(property['property']['properties']['originalLoanValue'])
                  }
                  mortgageText="Fixed mortgage outstanding"
                  mortgageSumm={getNumber(property['property']['properties']['originalLoanValue'])}
                  creditText="Total available credit"
                  creditSumm={creditSum}
                  approveLoan={property['property']['properties']['approvedLoanAmount']}
                  borrowedText="Borrowed"
                  borrowedSumm={borrowedSum}
                  btnName="Optimise"
                  modalToggled={() => togglePayBack(!payToggled)}
                  // errorToggled={() => toggleCloseErrorPopup(!errorPopupOpenToggled)} //(to show 'erroe-modal')
                />
              </div>
              <div className="first-main-line-right">
                <BalanceCard
                  title=" HGBP  Balance"
                  value={balance}
                  valueText=" HGBP  "
                  sendBtnName="Send"
                  investBtnName="Invest"
                  exchangeBtnName="Exchange"
                  modalToggled={() => togglePayBack(!payToggled)}
                />
                <div className="interest-tabs-wrapper">
                  <Card
                    title="Interest rate (APR)"
                    // value={interestPercentage.value + '%'}
                    date={interestPercentage.date}
                    valueText={interestPercentage.value + '%'}
                  />
                  <Card
                    title="Accrued interest"
                    value={interest}
                    valueText=" HGBP  "
                    date={getDate()}
                    infoBtn={infoBtn}
                  />
                </div>
              </div>
            </div>

            <div className="main-window-line">
              <div
                className="second-main-line"
                style={{ marginBottom: '50px', position: 'relative', gap: 10 }}
              >
                <BarChart
                  vatAddress={property.vatAddress}
                  fixedMortgag={getNumber(property['property']['properties']['originalLoanValue'])}
                ></BarChart>
                <div className="second-main-line-right">
                  <Property property={property} />
                </div>
                <div
                  className="mob-footer-wrapper"
                  style={{ position: 'absolute', right: '0px', bottom: '-55px' }}
                >
                  <div className="footer-text">Powered by</div>
                  <div className="footer-img">
                    <img src={FooterLogo}></img>
                  </div>
                </div>
              </div>
            </div>
            {/* <div className="main-window-line">
            <SummaryTable
              title="Summary"
              summaryType="Type"
              summaryBorrowing="Outstanding borrowing"
              summaryCredit="Total credit available"
              summaryCurrent="Current LTV borrowed"
              titleCredit="Credit Facility"
              creditBorrowSumm={' HGBP  ' + propertyNFT.debt}
              creditAvailableSumm={' HGBP  ' + (property['approveLoan'] - propertyNFT.debt)}
              currentCreditRate="0%"
              titleMortgage="Fixed Term Mortgage"
              mortgageBorrowSumm={' HGBP  ' + property['fixedMortgage']}
              mortgageAvailebleSumm="N/A"
              currentMortgageRate="20%"
              titleTotal="Total"
              totalBorrowSumm={' HGBP  ' + (+property['fixedMortgage'] + +propertyNFT.debt)}
              totalAvailebleSumm={' HGBP  ' + (property['approveLoan'] - propertyNFT.debt)}
              currentTotalRate="20%/40%"
              btnName="Optimise"
            />{' '}This option is not available
          </div> */}

            {/* demoModal */}
            <Modal width={440} open={payToggled}>
              <section className="demo-popup">
                <div className="borrow-popup-wrapper">
                  <div className="borrow-popup-close-btn">
                    {/* <img src={CloseIcon} alt=""></img> */}
                  </div>
                  <div className="demo-popup-title"> in demo</div>

                  <div className="borrow-btn-wrap" onClick={() => togglePayBack(!payToggled)}>
                    <div className="borrow-btn-text">Close</div>
                  </div>
                </div>
              </section>
            </Modal>

            {/* errorModal */}
            <Modal width={440} open={errorPopupOpenToggled}>
              <section className="error-popup">
                <div className="borrow-popup-wrapper">
                  <div className="borrow-popup-close-btn"></div>
                  <div className="demo-popup-title">
                    Oops, something went wrong. Please try again later.
                  </div>

                  <div
                    className="borrow-btn-wrap"
                    onClick={() => toggleCloseErrorPopup(!errorPopupOpenToggled)}
                  >
                    <div className="borrow-btn-text">Okay</div>
                  </div>
                </div>
              </section>
            </Modal>
          </div>
        )
      )}
    </>
  )
}

export default PropertyDashboard
