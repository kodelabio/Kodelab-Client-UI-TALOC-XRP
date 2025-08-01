import { message } from 'antd'
import { useTheme } from '../../context/ThemeContext'
import React, { useCallback, useEffect, useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAppKit } from '@reown/appkit/react'
import { useAccount, useDisconnect } from 'wagmi'
import rightArrowIcon from '@/assets/icons/right-arrow.svg'
import loginBgImage from '@/assets/svgs/client-bg-image.png'
import kodelabConsultancyLogo from '@/assets/svgs/kodelab-consuntancy.svg'
import kodelabLogo from '@/assets/svgs/kodelab-logo.svg'
import apiService from '@/services/apiService'
import { useSessionStorage } from 'usehooks-ts'
import styled from 'styled-components/macro'
import useUserMangement from '@/hooks/useUserMangement'
import { set } from 'lodash'

const ContainerWrap = styled.div`
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: #ffffff;
  overflow-x: hidden;
`

export default () => {
  const [isLoading, setIsLoading] = useState(false)
  const [credentials, setCredentials] = useState({
    email: '',
    password: 'kodelab',
    twoFactorCode: '',
  })
  const [currentPage, setCurrentPage] = useState('login') // 'login' or 'verify'
  const [code, setCode] = useState(['', '', '', '', '', ''])
  const [error, setError] = useState('')
  const [tempUserData, setTempUserData] = useState(null)

  const navigate = useNavigate()
  const { login } = useUserMangement()
  const { setTheme } = useTheme()
  const [user, setUser] = useSessionStorage('selectedUser', null)

  const emailInputRef = useRef(null)
  const codeInputRefs = useRef([])

  // Reown AppKit hooks
  const { open, close } = useAppKit()
  const { address: walletAddress, isConnected } = useAccount()
  const { disconnect } = useDisconnect()

  useEffect(() => {
    // Check if user is already logged in
    if (apiService.isAuthenticated() && user) {
      handleRoleBasedNavigation(user)
    } else {
      // Focus email input on component mount
      setTimeout(() => {
        emailInputRef.current?.focus()
      }, 100)
    }
  }, [])

  const handleEmailLogin = async (e) => {
    e?.preventDefault()
    setError('')

    if (!credentials?.email?.trim()) {
      setError('Please enter your email address')
      message.warning('Please enter your email address')
      return false
    }

    setIsLoading(true)
    try {
      const response = await apiService.login(credentials.email, credentials.password)

      if (response.data) {
        setTempUserData(response.data.user)
        setCurrentPage('verify')

        // Reset and focus on first verification code input
        setCode(['', '', '', '', '', ''])
        setTimeout(() => {
          setCurrentPage('verify')
        }, 100)
      }
    } catch (error) {
      message.error(error.message || 'Invalid credentials')
    } finally {
      setIsLoading(false)
    }
  }

  const handleVerifyCodeChange = (index, value) => {
    // Only allow digits
    const numericValue = value.replace(/[^0-9]/g, '')

    // Update the code array
    const newCode = [...code]
    newCode[index] = numericValue
    setCode(newCode)

    // Auto-focus next input if a digit was entered
    if (numericValue && index < 5) {
      document.getElementById(`code-${index + 1}`)?.focus()
    }
  }

  const handleVerifyKeyDown = (index, e) => {
    // Move to previous input on backspace if current is empty
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      document.getElementById(`code-${index - 1}`).focus()
    }
  }

  const handleVerifySubmit = async (e, verificationCode = null) => {
    if (e) e.preventDefault()
    setError('')

    const completeCode = verificationCode || code.join('')

    if (completeCode.length !== 6) {
      setError('Please enter the complete verification code')
      return
    }

    setIsLoading(true)
    try {
      const response = await apiService.verify2FA(tempUserData.id, completeCode)

      if (response.data) {
        const userData = response.data.user
        setTempUserData(userData)
        setCurrentPage('walletConnect')
      }
    } catch (error) {
      message.error(error.message || 'Invalid 2FA code')
    } finally {
      setIsLoading(false)
    }
  }

 useEffect(() => {
  // Only run if loading is expected
  setIsLoading(true)

  // If walletAddress is missing
  if (!walletAddress) {
    console.log("walletAddress --> ", walletAddress)
    // message.error('Wallet address not found. Please connect your wallet.')
    setIsLoading(false)
    return
  }

  // If tempUserData or its walletAddress is missing
  if (!tempUserData || !tempUserData.walletAddress) {
    // message.error('No wallet address associated with this account.')
    setIsLoading(false)
    return
  }

  const normalizedWallet = walletAddress.toLowerCase()
  const expectedWallet = tempUserData.walletAddress.toLowerCase()

  if (normalizedWallet === expectedWallet) {
    // ✅ Wallet address matches, continue login
    setTheme(tempUserData.theme || 'kodelabTheme')
    login(tempUserData)
    setUser(tempUserData)
    handleRoleBasedNavigation(tempUserData)
  } else {
    message.error('Wallet address does not match the one associated with your email. Please try again.')
    disconnect()
    login(null)
    setUser(null)
    setCurrentPage('login')
    sessionStorage.clear()
  }

  setIsLoading(false)
}, [walletAddress])

  // Updated wallet connection handler using Reown AppKit
  const handelWalletConnect = async (e) => {
    if (e) e.preventDefault()
    setError('')

    setIsLoading(true)
    try {
      // Open Reown AppKit modal for wallet connection
      await open()
    } catch (error) {
      message.error(error.message || 'Wallet connection failed')
      setIsLoading(false)
    }
    // Note: setIsLoading(false) is handled in the walletAddress useEffect
  }

  const handleRoleBasedNavigation = async (userData) => {
    try {
      // Fetch the default route for the user's role
      const routePath = await apiService.getDefaultRoute(userData.role.code)

      if (!routePath.data?.route) {
        throw new Error('Failed to fetch the default route for the user role')
      }

      // Check if user role is not END_USER, then set vault data
      if (userData.role.code !== 'END_USER') {
        // sessionStorage.setItem('selectedVault', JSON.stringify(DEFAULT_VAULT_DATA))
      }

      // Navigate to the appropriate route
      navigate(routePath.data.route)
    } catch (error) {
      navigate('/error')
    }
  }

  return (
    <ContainerWrap>
      <div className="login-screen-container">
        <div className="login-area">
          {/* Welcome screen */}
          <>
            {/* Collect email and OTP */}
            {currentPage === 'login' ? (
              <>
                <div className="login-top-section">
                  <div className="company-logo">
                    <img src={kodelabConsultancyLogo} alt="Kodelab Consultancy Logo" />
                  </div>
                </div>

                <div className="login-form-section">
                  <h1 style={{ marginBottom: 10, color: '#7A7A7A' }}>
                    <strong style={{ color: '#1C1C1C' }}>K</strong>odeLab
                    <strong style={{ color: '#1C1C1C' }}> C</strong>onsulting
                  </h1>
                  <p style={{ color: '#1C1C1C', fontSize: '2rem' }}>
                    Unlock the power of your properties
                  </p>
                  <form onSubmit={handleEmailLogin}>
                    <label htmlFor="email">Email</label>
                    <input
                      className="borrow-input-field"
                      id="email"
                      type="email"
                      placeholder="example@company.com"
                      ref={emailInputRef}
                      value={credentials.email}
                      onChange={(e) =>
                        setCredentials({
                          ...credentials,
                          email: e.target.value,
                        })
                      }
                      disabled={isLoading}
                    />
                    <div
                      style={{
                        display: 'flex',
                        flexWrap: 'wrap',
                        justifyContent: 'flex-start',
                        alignItems: 'center',
                      }}
                    >
                      <button>{isLoading ? 'Loading...' : 'Log in'}</button>
                      <button style={{ borderRadius: '50%', padding: 12 }}>
                        <img src={rightArrowIcon} alt="Login right arrow" />
                      </button>
                    </div>
                  </form>
                </div>

                <div className="login-bottom-section">
                  <p style={{ color: '#434343', fontSize: 16 }}>
                    With RWAs, investing in physical assets becomes simpler and more accessible than
                    ever before.{' '}
                  </p>
                </div>
              </>
            ) : (currentPage === 'verify' ? (
              <>
                <div className="login-top-section">
                  <div className="company-logo">
                    <img src={kodelabConsultancyLogo} alt="Kodelab Consultancy Logo" />
                  </div>
                </div>
                <div className="login-form-section">
                  <div className="back-link">
                    <button className="back-button" onClick={() => setCurrentPage('login')}>
                      ← Back
                    </button>
                  </div>
                  <h1 style={{ marginBottom: 0 }}>Enter the verification code</h1>
                  <form onSubmit={handleVerifySubmit}>
                    <div className="verification-inputs">
                      {code.map((digit, index) => (
                        <React.Fragment key={index}>
                          {index === 3 && <div className="separator">-</div>}
                          <input
                            id={`code-${index}`}
                            type="password"
                            inputMode="numeric"
                            pattern="[0-9]*"
                            className="code-input"
                            maxLength={1}
                            value={digit}
                            onChange={(e) => handleVerifyCodeChange(index, e.target.value)}
                            onKeyDown={(e) => handleVerifyKeyDown(index, e)}
                            required
                            style={{
                              width: '40px',
                              height: '50px',
                              backgroundColor: '#F9F9F9',
                              border: 'none',
                            }}
                          />
                        </React.Fragment>
                      ))}
                    </div>
                    <div
                      style={{
                        display: 'flex',
                        flexWrap: 'wrap',
                        justifyContent: 'flex-start',
                        alignItems: 'center',
                      }}
                    >
                      <button>{isLoading ? 'Verifying...' : 'Verify'}</button>
                      <button style={{ borderRadius: '50%', padding: 12 }}>
                        <img src={rightArrowIcon} alt="Verify right arrow" />
                      </button>
                    </div>
                  </form>
                </div>

                <div className="login-bottom-section">
                  <p style={{ color: '#434343', fontSize: 16 }}>
                    With RWAs, investing in physical assets becomes simpler and more accessible than
                    ever before.{' '}
                  </p>
                </div>
              </>
            ) : <>
              <div className="login-top-section">
                <div className="company-logo">
                  <img src={kodelabConsultancyLogo} alt="Kodelab Consultancy Logo" />
                </div>
              </div>
              <div className="login-form-section">
                <div className="back-link">
                  <button className="back-button" onClick={() => setCurrentPage('login')}>
                    ← Back
                  </button>
                </div>
                <h1 style={{ marginBottom: 0 }}>Connect the wallet associated with your email</h1>
                <form onSubmit={handelWalletConnect}>
                  <div
                    style={{
                      display: 'flex',
                      flexWrap: 'wrap',
                      justifyContent: 'flex-start',
                      alignItems: 'center',
                    }}
                  >
                    <button type="submit">{isLoading ? 'Connecting...' : 'Connect Wallet'}</button>
                    <button type="submit" style={{ borderRadius: '50%', padding: 12 }}>
                      <img src={rightArrowIcon} alt="Connect wallet arrow" />
                    </button>
                  </div>
                </form>
              </div>

              <div className="login-bottom-section">
                <p style={{ color: '#434343', fontSize: 16 }}>
                  With RWAs, investing in physical assets becomes simpler and more accessible than
                  ever before.{' '}
                </p>
              </div>
            </>)}
          </>
        </div>
        <div className="login-image-area">
          <img src={loginBgImage} alt="background" />
        </div>
      </div>
    </ContainerWrap>
  )
}