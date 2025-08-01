import { Button, message, Modal } from 'antd'
import { Spin } from 'antd'
import Copy from './Copy'
import Svgicon from './Svgicon'
import { useMemo, useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useNavigate, useLocation } from 'react-router-dom'
import {  getInterest, getInterestRate, getBalance } from '@/api/blockchain'
import ArrowMobIcon from '@/assets/icons/ArrowMobIcon.svg'
import CloseIcon from '@/assets/icons/close.svg'
import hamburgerMenuIcon from '@/assets/icons/hamburger-menu-icon.svg'
import spinner from '@/assets/img/kodelab-spinner-spin.gif'
import { NETWORK_INFO } from '@/constants'
import { simpleAddress } from '@/utils'
import { useMount, useToggle } from 'ahooks'
import styled from 'styled-components'
import useUserMangement from '@/hooks/useUserMangement'
// import useVaults from '@/hooks/useVaults'
import useWeb3 from '@/hooks/useWeb3'
import { safeToFixed } from '@/utils/ui'
import { useVaultOperations } from '@/hooks/useVaultOperations'
const HeaderWrap = styled.div`
  position: fixed;
  left: 0;
  width: 100%;
  z-index: 10;
  height: 80px;
  padding: 0 30px 0 10px;
  border-bottom: 1px solid #e2e2e2;
  background-color: #fff;
`
const SplitLine = styled.div`
  width: 1px;
  height: 100%;
  background: #ddd;
  margin: 0 20px;
`

export default ({ title, isBackVisible, onClickBack, visibleMenu, setVisibleMenu, vault }) => {
  const { borrow, pay, closeVault } = useVaultOperations()
  const timeToWait = 120
  // const { connect, disconnect, walletAddress } = useWeb3()
  // const { userVaults } = useVaults()
  // useMount(() => {
  //   if (sessionStorage.getItem('WEB3_CONNECT_CACHED_PROVIDER')) {
  //     connect()
  //   }
  // })

  const [loader, setLoader] = useState(false)
  const [calculateLoader, setCalculateLoader] = useState(false)

  const router = useNavigate()
  const { pathname } = useLocation()

  const { logout, user, checkLogin } = useUserMangement()

  useEffect(() => {
    checkLogin()
  }, [])

  const [property, setProperty] = useState({})
  const [nameOfValut, setNameOfValut] = useState('')

  // Toggle mobile menu visibility
  const toggleMobileMenu = () => {
    if (setVisibleMenu) {
      setVisibleMenu(!visibleMenu)
    }
  }

  useEffect(() => {
    let propertyLocal = sessionStorage.getItem('selectedVault')
    if (propertyLocal) {
      let d = JSON.parse(propertyLocal)
      setProperty(d)
      // Set the loan number based on the property
      if (d['vatAddress']) {
        // If vatAddress exists, set HLN + last 5 characters in uppercase
        // setNameOfValut(`HLN${d['vatAddress'].slice(-5).toUpperCase()}`)
        setNameOfValut(`${d['vatAddress'].slice(-5).toUpperCase()}`)
      } else {
        // If vatAddress doesn't exist, set loanNumber
        // setNameOfValut(d['property']['properties']['loanNumber'])
      }

      // setNameOfValut(d['property']['properties']['loanNumber'])
    } else {
      // router('/home/dashboard')
    }
  }, [router])

  const updateState = () => {
    let propertyLocal = sessionStorage.getItem('selectedVault')

    if (propertyLocal != null) {
      if (propertyLocal) {
        let d = JSON.parse(propertyLocal)

        if (d['debt'] == undefined || d['debt'] > 0) {
          setPayButtonEnable(true)
        } else {
          setPayButtonEnable(false)
        }
        setProperty(d)
      } else {
        // router('/home/dashboard')
      }
    }
  }

  useEffect(() => {
    updateState()
    setInterval(() => {
      updateState()
    }, 2000)
  }, [])

  
  const [visibleBorrow, toggleBorrow] = useState(false)
  const [visibleReset, toggleReset] = useState(false)

  const [payToggled, togglePayBack] = useState(false)
  const [time, setTime] = useState(timeToWait)
  useEffect(() => {
    const timer = time > 0 && setInterval(() => setTime(time - 1), 1000)
    return () => clearInterval(timer)
  }, [time])


  const [amount, setAmount] = useState('')

  const [isPayButtonEnable, setPayButtonEnable] = useState(false)

  const [apoxInterest, setApoxInterest] = useState('-')

  async function borrowAmount(): Promise<void> {
    try {
      if (!amount || isNaN(Number(amount))) {
        message.error('Please enter a valid amount');
        return;
      }

      setLoader(true);
      const rawVault = sessionStorage.getItem('selectedVault');
      if (!rawVault) throw new Error('No vault found in session');

      const vault = JSON.parse(rawVault);
      const currentInterest = await getInterest(vault.vatId);   // accrued interest
      const approvedLoanAmt = getNumber(vault.property.properties.approvedLoanAmount);
      const currentDebt = getNumber(vault.debt);
      const availableToBorrow = approvedLoanAmt - currentDebt - getNumber(currentInterest);

      if (availableToBorrow < Number(amount)) {
        message.error('Insufficient Taloc balance');
        return;
      }

      await borrow(vault, amount);

      vault.debt = currentDebt + Number(amount); // add, don’t overwrite
      sessionStorage.setItem('selectedVault', JSON.stringify(vault));
      setProperty(vault);

      toggleBorrow(!visibleBorrow);
      setApoxInterest('-');
      // message.success(`Successfully borrowed  ${amount} from vault`);

    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      // message.error(`An error occurred while borrowing amount. ${msg}`);
    } finally {
      // 7️⃣ Always turn off the loader
      setLoader(false);
    }
  }

  function closeCustomerVault(): void {

    const ownerAddress = property['property']['properties']['ownerWalletAddress']
    if (ownerAddress == undefined || ownerAddress == '') {
      // alert('Owner address not found')
      message.error('Owner address not found')
      return
    }
    // get owner adddress

    if (amount != '') {
      setLoader(true)
      closeVault(ownerAddress, amount).then((value) => {
        setLoader(false)

        if (!value) {
          // alert('Please check loan is already paid or not')
          message.error('Please check loan is already paid or not. Please try again later.')
        } else {
          sessionStorage.removeItem('selectedVault')
          sessionStorage.removeItem('vaultList')
          // Need time out ....
          router('/home/dashboard')
        }
        toggleReset(!visibleReset)
      })
    } else {

      message.error('Please enter proper amount')
      setLoader(false)
    }
  }

  async function rePayAmount(): Promise<void> {
  try {
    // 1️⃣ Basic validation
    if (!amount || isNaN(Number(amount))) {
      message.error('Please enter a valid amount');
      return;
    }

    setLoader(true);

    // 2️⃣ Check user's balance
    const userBalance = await getBalance(user);
    
    if (Number(userBalance) < Number(amount)) {
      message.error('Insufficient balance to make this payment');
      return;
    }

    // 3️⃣ Process the payment
    await pay(property, amount);

    // 4️⃣ Update local state after successful payment
    // Update property debt (assuming we need to reduce it)
    const updatedProperty = { ...property };
    const currentDebt = getNumber(property.debt);
    updatedProperty.debt = Math.max(0, currentDebt - Number(amount)); // Don't go below 0
    
    // Update session storage if this property is the selected vault
    const selectedVault = sessionStorage.getItem('selectedVault');
    if (selectedVault) {
      const vaultObj = JSON.parse(selectedVault);
      if (vaultObj.vatId === property.vatId) { // Assuming vatId is the identifier
        vaultObj.debt = updatedProperty.debt;
        sessionStorage.setItem('selectedVault', JSON.stringify(vaultObj));
      }
    }
    
    setProperty(updatedProperty);

    // 5️⃣ UI updates and success message
    togglePayBack(!payToggled);
    // message.success(`Successfully repaid ${amount}.`);

  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    // message.error(`An error occurred while processing payment: ${msg}`);
  } finally {
    // 6️⃣ Always turn off the loader
    setLoader(false);
  }
}

  function calculateSimpleInterest(principal) {
    // let time = 30
    // Ensure the rate is in decimal form (e.g., 5% as 0.05)
    const rateDecimal = 0.03 / 12

    // Calculate the simple interest
    const simpleInterest = (principal * rateDecimal) / 1
    return simpleInterest.toFixed(2)
  }
  function isNumberKey(evt) {
    var charCode = evt.which ? evt.which : evt.keyCode
    if (charCode > 31 && (charCode < 48 || charCode > 57)) return false
    return true
  }
  const preventMinus = (evt) => {
    // if (event.code === 'Minus') {
    //   event.preventDefault()
    // }
    var charCode = evt.which ? evt.which : evt.keyCode
    if (charCode > 31 && (charCode < 48 || charCode > 57) && charCode != 46) {
      evt.preventDefault()
      return false
    }

    if (isNaN(amount)) {
      evt.preventDefault()
      return false
    }

    return true

    // var key = window.event ? event.keyCode : event.which;
    // if (event.keyCode === 8 || event.keyCode === 46) {
    //     return true;
    // } else if ( key < 48 || key > 57 ) {
    //     return false;
    // } else {
    //     return true;
    // }
  }

  function getNumber(str) {
    if (str == undefined || str == 0) {
      return 0
    }

    return parseFloat(String(str).replace(/,/g, ''))
  }

  // Get the last segment of the path for page name
  const getPageName = () => {
    const pathSegments = pathname.split('/')
    const pageName = pathSegments[pathSegments.length - 1]
    return pageName.charAt(0).toUpperCase() + pageName.slice(1).toLowerCase()
  }

  return (
    <div className="vault-header">
      <div className="header-container">
        <div className="title-container">
          {pathname.includes('vault/dashboard') && (
            <div className="title-user-name">{user?.['userName']}</div>
          )}
          {pathname.includes('home/dashboard') && (
            <div className="title-user-name">{user?.['userName']}</div>
          )}
          <div className="vault-header-container">
            <div className="vault-heade-title">
              <div className="side-menu-mobile">
                <div className="hamburger-menu" onClick={toggleMobileMenu}>
                  <img src={hamburgerMenuIcon} alt="Menu" />
                </div>
              </div>

              {isBackVisible && (
                <div onClick={onClickBack} className="side-menu-btn-img">
                  <img src={ArrowMobIcon}></img>
                </div>
              )}

              <h1 className="vault-heade-title-text">
                {pathname.includes('vault')
                  ? pathname.includes('vault/dashboard')
                    ? 'Vault ' + nameOfValut
                    : pathname.includes('vault/support')
                      ? 'Support'
                      : 'History'
                  : pathname.includes('home/dashboard')
                    ? 'Credit Facility'
                    : pathname.includes('home/support')
                      ? 'Support'
                      : 'Dashboard'}
              </h1>

              <span className="heade-title-text">
                {pathname.includes('vault')
                  ? pathname.includes('vault/dashboard')
                    ? ''
                    : pathname.includes('vault/support')
                      ? ''
                      : pathname.includes('vault/support')
                        ? 'Properties'
                        : ''
                  : pathname.includes('home/dashboard')
                    ? ''
                    : ''}
              </span>
            </div>
          </div>
        </div>

        {pathname.includes('vault/dashboard') && (
          <div className="vault-header-btn-wrapper">
            <div
              className="borrow-btn-wrap"
              onClick={() => {
                setAmount('')
                toggleBorrow(!visibleBorrow)
                setLoader(false)
                setApoxInterest("-")

              }}
            >
              <div className="borrow-btn">Borrow</div>
            </div>
            {isPayButtonEnable ? (
              <div
                className="pay-btn-wrap"
                onClick={() => {
                  setTime(timeToWait)
                  setAmount('')
                  togglePayBack(!payToggled)
                }}
              >
                <div className="pay-btn">Pay back</div>
              </div>
            ) : (
              <div className="vault-header-btn-wrapper">
                <div
                  className="reset-btn-wrap"
                  onClick={() => {
                    setAmount(property.vatId)
                    toggleReset(!visibleReset)
                    setLoader(false)
                  }}
                >
                  Close Vault
                </div>
              </div>
            )}
          </div>
        )}
      </div>
      <Modal width={440} open={payToggled}>
        <section className="borrow-popup">
          <div className="borrow-popup-wrapper">
            <div
              className="borrow-popup-close-btn"
              onClick={() => {
                // setTime(120)
                setAmount('')
                togglePayBack(!payToggled)
                setLoader(false)
              }}
            >
              <img src={CloseIcon} alt=""></img>
            </div>
            <div className="borrow-popup-title">Pay back</div>
            <div className="borrow-popup-subtitle">All interest and borrowed funds</div>
            <div className="borrow-popup-description">
              We have paused your interest accumulation for 2 minutes
            </div>
            <div className="borrow-popup-description-confirm">
              Please confirm total repayment within this time frame
            </div>
            <div className="countdown-wrapper">
              <p className="countdown">
                {`${Math.floor(time / 60)}`.padStart(2, '0')}:{`${time % 60}`.padStart(2, '0')}
              </p>
            </div>
            <div className="borrow-popup-input-wrapper">
              <div className="borrow-input-wrap">
                <div className="borrow-input-label">Enter amount</div>
                <div className="borrow-input">
                  <input
                    className="borrow-input-field"
                    type="text"
                    placeholder="eHGP 150,000"
                    value={amount}
                    min="0"
                    onKeyPress={preventMinus}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter') {
                        event.preventDefault()
                        rePayAmount()
                      }
                    }}
                    onChange={(event) => {
                      if (!isNaN(event.target.value)) {
                        setAmount(event.target.value)
                      }
                    }}
                  ></input>
                </div>
              </div>
              <div
                className="borrow-max-btn"
                onClick={async () => {
                  // setCalculateLoader(true);

                  let propertyLocal = sessionStorage.getItem('selectedVault')
                  let propertyLocalObj = JSON.parse(propertyLocal)

                  let val = await getInterest(propertyLocalObj.vatId)
                  const apy = getNumber(getInterestRate().value) / 100 // 3% APY
                  const timeInMinutes = timeToWait / 60
                  const perMinuteRate = apy / (365 * 24 * 60) // Assuming 365 days in a year and 24 hours in a day
                  let principal = getNumber(propertyLocalObj['debt'])
                  let interestEarned = principal * perMinuteRate * timeInMinutes

                  if (interestEarned <= 0.01) {
                    interestEarned = 0.01
                  }

                  if (val != 0) {
                    let num = getNumber(val) + interestEarned + getNumber(propertyLocalObj['debt'])
                    let temp = num.toFixed(2)
                    // setCalculateLoader(false);
                    setAmount(temp)
                  } else {
                    // setCalculateLoader(false);
                    setAmount('0')
                  }
                }}
              >
                {calculateLoader ? (
                  <Spin className="max-btn-text" />
                ) : (
                  <div className="max-btn-text">Total</div>
                )}
              </div>
            </div>

            <div className="borrow-btn-wrap" onClick={() => rePayAmount()}>
              {loader ? (
                <Spin className="row-center ptb-30" />
              ) : (
                <div className="borrow-btn-text">Pay back</div>
              )}
            </div>
          </div>
        </section>
      </Modal>
      <Modal width={440} open={visibleBorrow} style={{ backgroundColor: 'transparent' }}>
        <section className="borrow-popup">
          <div className="borrow-popup-wrapper">
            <div className="borrow-popup-close-btn" onClick={() => toggleBorrow(!visibleBorrow)}>
              <img src={CloseIcon} alt=""></img>
            </div>
            <div className="borrow-popup-title">Borrow</div>
            <div className="borrow-popup-subtitle">
              This will increase your monthly interest payment by HGBP {apoxInterest}
            </div>

            <div className="borrow-popup-input-wrapper">
              <div className="borrow-input-wrap">
                <div className="borrow-input-label">Enter amount</div>
                <div className="borrow-input">
                  <input
                    className="borrow-input-field"
                    type="text"
                    placeholder=" HGBP  150,000"
                    value={amount}
                    min="0"
                    pattern="[0-9.]+"
                    onKeyPress={preventMinus}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter') {
                        event.preventDefault()
                        borrowAmount()
                      }
                    }}
                    onChange={(event) => {
                      if (!isNaN(event.target.value)) {
                        setAmount(event.target.value)
                        setApoxInterest(calculateSimpleInterest(event.target.value))
                      }
                    }}
                  ></input>
                </div>
              </div>
              <div
                className="borrow-max-btn"
                onClick={async () => {
                  let val = await getInterest(property.vatId)
                  const apy = getNumber(getInterestRate().value) / 100 // 3% APY
                  const timeInMinutes = timeToWait / 60

                  const perMinuteRate = apy / (365 * 24 * 60) // Assuming 365 days in a year and 24 hours in a day
                  let principal = getNumber(property['debt'])
                  const interestEarned = principal * perMinuteRate * timeInMinutes

                  let num =
                    getNumber(property['property']['properties']['approvedLoanAmount']) -
                    getNumber(property['debt']) -
                    getNumber(val) -
                    interestEarned

                  let temp = num.toFixed(2)
                  if (num > 0) {
                    setAmount(temp)
                  } else {
                    setAmount('0')
                  }
                }}
              >
                <div className="max-btn-text">Max</div>
              </div>
            </div>
            <div className="borrow-btn-wrap" onClick={() => borrowAmount()}>
              {loader ? (
                <Spin className="row-center ptb-30" />
              ) : (
                <div className="borrow-btn-text">Borrow</div>
              )}
            </div>
          </div>
        </section>
      </Modal>

      <Modal open={visibleReset}>
        <section className="borrow-popup">
          <div className="borrow-popup-wrapper">
            <div className="borrow-popup-title">Are you sure you want to close the vault?</div>

            <div className="borrow-popup-input-wrapper"></div>
            <div className="buttons-wrapper">
              <div className="cancel-btn-wrap" onClick={() => toggleReset(!visibleReset)}>
                <div className="cancel-btn-text">Cancel</div>
              </div>

              <div className="borrow-btn-wrap" onClick={() => closeCustomerVault()}>
                {loader ? (
                  <Spin className="row-center ptb-30" />
                ) : (
                  <div className="borrow-btn-text">Close</div>
                )}
              </div>
            </div>
          </div>
        </section>
      </Modal>
    </div>
  )
}
