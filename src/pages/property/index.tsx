import { message, Spin } from 'antd'
import { Modal } from 'antd'
import { useTheme } from '../../context/ThemeContext'
import { useCallback, useEffect, useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { useNavigate } from 'react-router-dom'
import {
  getAvailablePropertyList,
  getPropertyList,
  getVaultPropertyList,
  sendMessageToSlack,
} from '@/api/api'
import { getInterestRate,  getMMBalance } from '@/api/blockchain'
import blacklogOutBtn from '@/assets/icons/blackLogOut.svg'
import CloseIcon from '@/assets/icons/close.svg'
import spinner from '@/assets/img/kodelab-spinner-spin.gif'
import FooterLogo from '@/assets/img/logo-kodelab-footer.png'
import logoImg from '@/assets/img/moblogo.png'
import endUserLogo from '@/assets/svgs/end-user-logo.svg'
import logoClientAdmin from '@/assets/theme/img/AbuDhabiBank-icon.svg'
import logoFCATheme from '@/assets/theme/img/FCA.svg'
import CheckIcon from '@/assets/theme/img/checkBox.svg'
import logoKodelabTheme from '@/assets/theme/img/logo.png'
import LogoutConfirmModal from '@/components/common/LogoutConfirmModal'
import styled from 'styled-components/macro'
import useUserMangement from '@/hooks/useUserMangement'
import { useVaultOperations } from '@/hooks/useVaultOperations'

const ContainerWrap = styled.div`
  height: '100%';
  display: flex;
  justify-content: center;
  flex-direction: column;
  align-items: center;
`
export default () => {
  let BankWalletAddress = import.meta.env.VITE_WALLET_ADDRESS
  const MAX_STEPPER = 1
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [stepper, setStepper] = useState(0)
  const [termAndCondition, setTermAndCondition] = useState(false)
  let dummyArray: any[] | (() => any[]) = []
  const [propertyList, setPropertyList] = useState(dummyArray)

  const { logout, user, checkLogin } = useUserMangement()
  const [loader, setLoader] = useState(false)

  const [currentSetp, setCurrentSetp] = useState(0)
  const [stepBarOpen, stepBarClose] = useState(false)
  const [logoutModalVisible, setLogoutModalVisible] = useState(false)
  const router = useNavigate()
  // useVaultOperations()
  const { registerVault } = useVaultOperations()
  


  const { setTheme } = useTheme()

  useEffect(() => {
    checkLogin()
  }, [])

  useEffect(() => {
    if (user) {
      if (sessionStorage.getItem('isDashboard') != 'true') {
        // getVaultPropertyList(user['id']).then((value) => {
        //   if (value.length > 0) {
        //     sessionStorage.setItem('isDashboard', 'true')
        //     router('/home/dashboard')
        //   } else {
        //     setLoader(false)
        //   }
        // })
      }
    }
  }, [user])

  useEffect(() => {
    setLoader(true)
    if (user) {
      getAvailablePropertyList(user).then((val) => {

        let userProperty = []
        for (let obj of val) {
          if (
            obj['properties']['ownerWalletAddress'].toLowerCase() ==
            user['walletAddress'].toLocaleLowerCase()
          ) {
            userProperty.push(obj)
          }
        }
        setPropertyList(userProperty)
        if (userProperty && userProperty.length > 0) {
          setSelectedIndex(0)
        }
        setLoader(false)
      })
    }
  }, [user])

  useEffect(() => {
    if (propertyList.length > 0) {
      setSelectedIndex(0)
    }
  }, [propertyList])

  // useEffect(() => {
  //   let property = sessionStorage.getItem('selectedProperty')
  //   if (property) {
  //     router('/home/dashboard')
  //   }
  // }, [setSelectedIndex])

  // const timeToWait = 40000
  const timeToWait = 100

  let checkBalance
  const intervalTimer = 1000
  const maxCheckBanlance = 350
  let counterBalance = 0

  function startBalanceCheck() {
    var numericValue = propertyList[selectedIndex]['properties']['approvedLoanAmount'].replace(
      /,/g,
      '',
    ) // Remove commas and convert to a number

    checkBalance = setInterval(async function () {
      counterBalance++

      if (counterBalance <= maxCheckBanlance) {
        let bal = await getMMBalance(BankWalletAddress)
        if (Number(numericValue) <= Number(bal)) {
          setCurrentSetp(2)
          stopBalanceCheck()
          blockChainRegister()
        }
      } else {
        stopBalanceCheck()
        stepBarClose(false)
        // alert('We currently have a temporary transaction issue. Please try again later.')
        message.error('We currently have a temporary transaction issue. Please try again later.')
      }
    }, intervalTimer)
  }
  function stopBalanceCheck() {
    counterBalance = 0
    clearInterval(checkBalance)
  }

  async function waitAndRegistor() {
    setTimeout(function () {
      setCurrentSetp(1)
      startBalanceCheck()
      // setTimeout(function () {
      //   setCurrentSetp(2)
      //   setTimeout(function () {
      //     setTimeout(function () {
      //       blockChainRegister()
      //     }, timeToWait)
      //   }, timeToWait)
      // }, timeToWait)
    }, timeToWait)
  }

  function blockChainRegister() {
    // register(propertyList[selectedIndex]).then((value) => {
    //   if (value) {
    //     sessionStorage.setItem('selectedProperty', JSON.stringify(propertyList[selectedIndex]))
    //     stepBarClose(!stepBarOpen)
    //     router('/home/dashboard')
    //     setCurrentSetp(3)
    //     sessionStorage.setItem('selectedProperty', JSON.stringify(propertyList[selectedIndex]))
    //   } else {
    //     stepBarClose(false)
    //     // alert('Something went wrong')
    //     message.error('Something went wrong. Please try again later.')
    //   }

    //   return value
    // })

    registerVault(propertyList[selectedIndex]).then((value) => {
      if (value) {
        sessionStorage.setItem('selectedProperty', JSON.stringify(propertyList[selectedIndex]))
        stepBarClose(!stepBarOpen)
        router('/home/dashboard')
        setCurrentSetp(3)
        sessionStorage.setItem('selectedProperty', JSON.stringify(propertyList[selectedIndex]))
      } else {
        stepBarClose(false)
        // alert('Something went wrong')
        // message.error('Something went wrong. Please try again later.')
      }

      return value
    })
  }

  async function next() {
    if (stepper >= MAX_STEPPER) {
      if (termAndCondition) {
        // setLoader(true)
        // alert('Request Send To the bank')

        var numericValue = propertyList[selectedIndex]['properties']['approvedLoanAmount'].replace(
          /,/g,
          '',
        ) // Remove commas and convert to a number

        stepBarClose(!stepBarOpen)
        let bal = await getMMBalance(BankWalletAddress)
        let type = 'Fund Required'

        if (Number(numericValue) <= Number(bal)) {
          // setTimeout(function () {
          //   setCurrentSetp(1)
          //   setTimeout(function () {
          //     setCurrentSetp(2)
          //     setTimeout(function () {
          //       setTimeout(function () {
          //         blockChainRegister()
          //       }, 1000)
          //     }, 1000)
          //   }, 1000)
          // }, 1000)
          type = 'Fund Not Required'
        } else {
          // sendMessageToSlack(obj)
          // waitAndRegistor()
        }

        let obj = {
          BankAddress: BankWalletAddress,
          amount: numericValue,
          transactionType: 'cbdcToBankWallet',
          type: type,
        }

        sendMessageToSlack(obj)
        waitAndRegistor()

        // register(propertyList[selectedIndex]).then((value) => {
        //   sessionStorage.setItem('selectedProperty', JSON.stringify(propertyList[selectedIndex]))
        //   setLoader(false)
        //   router('/home/dashboard')
        // })
        // sessionStorage.setItem('selectedProperty', JSON.stringify(propertyList[selectedIndex]))

        // setLoader(false)

        // router('/home/dashboard')
      } else {
        // alert('Please Accept the terms & conditions')
        message.error('Please accept the terms & conditions')
      }
      return
    }

    if (selectedIndex == -1) {
      // alert('Please Select property')
      message.error('Please select a property')
      return
    }

    setStepper(stepper + 1)
  }

  function back() {
    if (stepper == 0) {
      return
    }
    setStepper(stepper - 1)
  }

  const { theme } = useTheme()
  const logoMap: Record<string, string> = {
    clientAdmin: logoClientAdmin,
    FCATheme: logoFCATheme,
    kodelabTheme: logoKodelabTheme,
  }

  // Function to handle logout confirmation
  const handleLogoutConfirm = () => {
    // Close the modal
    setLogoutModalVisible(false)

    // Perform logout actions
    sessionStorage.clear()
    setTheme('kodelabTheme')
    logout()
    router('/users')
  }

  // Function to cancel logout
  const handleLogoutCancel = () => {
    setLogoutModalVisible(false)
  }

  if (loader) {
    return (
      <div
        style={{
          width: '100%',
          height: '100vh',
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
    <ContainerWrap>
      <div
        className="logo-header-wrap"
        style={{
          display: 'flex',
          alignItems: 'center',
          padding: '10px 20px',
          justifyContent: 'space-between',
          width: '100%',
          background: '#114080',
        }}
      >
        <div className="logo-wrap">
          <div className="page-logo" style={{ marginBottom: '0px', marginRight: '20px' }}>
            <img src={endUserLogo} alt="Logo" />
          </div>
          {/* <div className="logo-name" style={{ marginRight: 10 }}>
                Welcome, {user?.['userName']}
              </div> */}
        </div>

        <div className="property-btn-wrapper">
          <div
            className="property-dashboard-btn"
            onClick={() => {
              router('/home/dashboard')
            }}
          >
            Homepage
          </div>

          <div
            className="dashboard-back-btn"
            onClick={() => {
              setLogoutModalVisible(true)
            }}
          >
            <div className="dashboard-back-btn-text">Logout</div>
            <div className="dashboard-btn-img">
              <img src={blacklogOutBtn} alt=""></img>
            </div>
          </div>

          <LogoutConfirmModal
            visible={logoutModalVisible}
            onCancel={handleLogoutCancel}
            onConfirm={handleLogoutConfirm}
          />
        </div>
      </div>

      <section className="first-screen-window">
        {stepper == 0 ? (
          propertyList.length > 0 ? (
            <section className="first-screen-window">
              <div className="first-screen-title">
                <div className="fs-title-text">Select an asset</div>
              </div>

              <div className="fs-tabs-wrapper ">
                {propertyList.map((property, index) => (
                  <div
                    key={index}
                    className={
                      selectedIndex == index ? 'fs-property-tab selected' : 'fs-property-tab'
                    }
                    onClick={() => setSelectedIndex(index)}
                  >
                    <div className="property-tab-description" style={{ padding: '10px' }}>
                      {property['name']}
                    </div>
                    <div className="property-tab-img">
                      <img src={property['image']}></img>
                    </div>
                    <div className="property-value-deckription">Asset value </div>
                    <div className="property-summ-wrap">
                      <div className="property-summ-text"> HGBP </div>
                      <div className="property-summ">{property['properties']['assetValue']}</div>
                    </div>
                    <div
                      className="property-value-deckription"
                      style={{ color: '#6f6f6f', fontSize: '16px' }}
                    >
                      No. of units : {property['properties']['numberOfUnits']}{' '}
                    </div>
                    <div
                      className="property-value-description"
                      style={{ color: '#6f6f6f', fontSize: '16px' }}
                    >
                      Owned by:{' '}
                      {property.ownedByBank
                        ? 'Bank'
                        : property.user?.userName || property.properties.ownerWalletAddress}
                    </div>

                  </div>
                ))}
              </div>
              <div className="fs-btn-wrapper">
                {stepper != 0 && (
                  <div
                    className="back-btn-wrap"
                    onClick={() => {
                      back()
                    }}
                  >
                    <div className="back-btn">Go back</div>
                  </div>
                )}

                {propertyList.length != 0 && (
                  <div
                    className="next-btn-wrap"
                    onClick={() => {
                      next()
                    }}
                  >
                    <div className="next-btn">{stepper == MAX_STEPPER ? 'Confirm' : 'Next'}</div>
                  </div>
                )}
              </div>
            </section>
          ) : (
            <section className="first-screen-window" style={{ fontSize: 20 }}>
              No properties available{' '}
            </section>
          )
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <div className="first-screen-title">
              <div className="fs-title-text">Our offer to you</div>
            </div>
            <div className="offer-tab">
              <div className="offer-first-description">
                We are prepared to offer you{' '}
                <span>HGBP {propertyList[selectedIndex]['properties']['approvedLoanAmount']} </span>
                {'( ' +
                  propertyList[selectedIndex]['properties']['maximumLoanPercentage'] +
                  ' LTV )'}
                {/* or {propertyList[selectedIndex]['properties']['maximumLoanPercentage']} LTV
                    </span>{' '}
                    of credit */}
                {/* , which would take your max overall LTV to{' '} */}
                {/* <span> */}
                {/* {' '}
                      {propertyList[selectedIndex]['properties']['maximumLoanPercentage']}
                    </span> */}
                .
              </div>
              <div className="offer-second-description">
                The interest rate we are prepared to offer on this credit facility is{' '}
                <span>{getInterestRate().value}%</span>.
              </div>
            </div>

            <div className="terms-wrapper">
              <div
                className="terms-checkbox checked"
                onClick={() => {
                  setTermAndCondition(!termAndCondition)
                }}
              >
                {termAndCondition && <img src={CheckIcon} alt=""></img>}
              </div>
              <div className="label-wrap">
                <div className="label-text">I've read and accept</div>
                <div className="label-link">
                  <a className="label-link" href="">
                    terms & conditions
                  </a>
                </div>
              </div>
            </div>
            <div className="fs-btn-wrapper" style={{ alignSelf: 'flex-end' }}>
              {stepper != 0 && (
                <div
                  className="back-btn-wrap"
                  onClick={() => {
                    back()
                  }}
                >
                  <div className="back-btn">Go back</div>
                </div>
              )}

              {propertyList.length != 0 && (
                <div
                  className="next-btn-wrap"
                  onClick={() => {
                    next()
                  }}
                >
                  <div className="next-btn">{stepper == MAX_STEPPER ? 'Confirm' : 'Next'}</div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* stepperModal */}
        <Modal open={stepBarOpen}>
          <section className="stepper-popup">
            <div className="borrow-popup-wrapper">
              <div className="stepper-title-wrapper">
                <div className="stepper-title">
                  We're in the process of creating the vault. Please bear with us.
                </div>
                {/* <div
                      className="borrow-popup-close-btn"
                      onClick={() => {
                        stopBalanceCheck()
                        stepBarClose(!stepBarOpen)
                      }}
                    >
                      <img src={CloseIcon} alt=""></img>
                    </div> */}
              </div>

              <div className="stepper-wrapper">
                {currentSetp >= 1 ? (
                  <div className="stepper-item completed">
                    <div className="step-counter">1</div>
                    <div className="step-name">Initialise</div>
                  </div>
                ) : (
                  <div className="stepper-item active">
                    <div className="step-counter">1</div>
                    <div className="step-name">Initialise</div>
                  </div>
                )}
                {currentSetp >= 2 ? (
                  <div className="stepper-item completed">
                    <div className="step-counter">2</div>
                    <div className="step-name">Fund transfer</div>
                  </div>
                ) : (
                  <div className="stepper-item active">
                    <div className="step-counter">2</div>
                    <div className="step-name">Fund transfer</div>
                  </div>
                )}
                {currentSetp >= 3 ? (
                  <div className="stepper-item completed">
                    <div className="step-counter">3</div>
                    <div className="step-name">Vault creation</div>
                  </div>
                ) : (
                  <div className="stepper-item active">
                    <div className="step-counter">3</div>
                    <div className="step-name">Vault creation</div>
                  </div>
                )}
              </div>
              <div
                style={{
                  display: 'flex',

                  alignItems: 'center',

                  justifyContent: 'center',
                }}
              >
                {/* <Spin className="row-center ptb-30" /> */}
                <img
                  style={{
                    width: '40px',
                    height: '40px',
                  }}
                  src={spinner}
                />
              </div>
            </div>
          </section>
        </Modal>
      </section>
      <div className="footer-wrapper">
        <div className="footer-text">Powered by</div>
        <div className="footer-img">
          <img src={FooterLogo}></img>
        </div>
      </div>
    </ContainerWrap>
  )
}
