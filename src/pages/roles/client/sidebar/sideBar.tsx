// @ts-nocheck
import { useCallback, useEffect, useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import Dashboard from '@/assets/icons/bankDashboard.svg'
import clientAuditIcon from '@/assets/icons/client-audit-icon.svg'
import clientCustomerIcon from '@/assets/icons/client-customer-icon.svg'
import clientDashboardIcon from '@/assets/icons/client-dashboard-icon.svg'
import clientReportsIcon from '@/assets/icons/client-report-icon.svg'
import clientTeamIcon from '@/assets/icons/client-team-icon.svg'
import clientTransactionsIcon from '@/assets/icons/client-transactions-icon.svg'
import clientVaultIcon from '@/assets/icons/client-vault-icon.svg'
import HistoryIcon from '@/assets/icons/clock-icon.svg'
import logOutBtn from '@/assets/icons/logOutIcon.svg'
import logoutMobMenu from '@/assets/icons/logoutMobIcon.svg'
import mobMenu from '@/assets/icons/mobMenuBtn.svg'
import PropertyIcon from '@/assets/icons/propertyIcon.svg'
import ReportsIcon from '@/assets/icons/reports-icon.svg'
import VaultsIcon from '@/assets/icons/vaults-icon.svg'
import FooterLogo from '@/assets/img/logo-kodelab-footer.png'
import mobLogo from '@/assets/img/moblogo.png'
import endUserLogo from '@/assets/svgs/end-user-logo.svg'
import logoClientAdmin from '@/assets/theme/img/AbuDhabiBank-icon.svg'
import logoFCATheme from '@/assets/theme/img/FCA.svg'
// import logoKodelabTheme from '@/assets/theme/img/logo.png'
import logoKodelabTheme from '@/assets/theme/img/side-bar-logo.svg'
import { set } from 'lodash'
import { useSessionStorage } from 'usehooks-ts'
import LogoutConfirmModal from '@/components/common/LogoutConfirmModal'
import useUserMangement from '@/hooks/useUserMangement'
import useWeb3 from '@/hooks/useWeb3'

export default ({ currentPage, navigateToPage, visibleMenu, setVisibleMenu }) => {
  const { connect, disconnect, walletAddress } = useWeb3()
  const { logout, user, checkLogin } = useUserMangement()
  const router = useNavigate()
  const { pathname } = useLocation()
  const [logoutModalVisible, setLogoutModalVisible] = useState(false)
  const [selectedVault, setSelectedVault] = useSessionStorage('selectedVault', {}) //useState({})
  const appVersion = import.meta.env.APP_VERSION

  useEffect(() => {
    checkLogin()
  }, [])

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
    logout()
    router('/users')
  }

  // Function to cancel logout
  const handleLogoutCancel = () => {
    setLogoutModalVisible(false)
  }

  // Function to close mobile menu
  const closeMobileMenu = () => {
    if (setVisibleMenu) {
      setVisibleMenu(false)
    }
  }

  const getMenu = () => {
    return (
      <div
        className="transparent"
        onClick={() => {
          closeMobileMenu()
        }}
      >
        <div className="side-menu-container-bank-client">
          <div className="side-menu-logo">
            <img src={endUserLogo} alt="Logo" />
          </div>

          <div className="side-btn-wrapper">
            <div className="main-btn-wrap">
              {/* {pathname.includes('vault') && (
              <div className="side-menu-btn-wrap"
              onClick={() => {
                toggleMenu(!visibleMenu)
                sessionStorage.removeItem('selectedVault')
                router('/home/dashboard')
                
              }}>
                <div
                  className="side-menu-btn-img"
                  
                >
                  <img src={ArrowBackIcon}></img>
                  
                </div>
                <div className="side-menu-btn-text">Back</div>
            
              </div>
            )} */}

              {/* {pathname.includes('home/') && (
              <div
                className={
                  pathname.includes('property')
                    ? 'side-menu-btn-wrap side-selected'
                    : 'side-menu-btn-wrap'
                }
                onClick={() => {
                  toggleMenu(!visibleMenu)
                  sessionStorage.removeItem('selectedProperty')
                  router('/property')
                }}
              >
                <div className="side-menu-btn-img">
                  <img src={PropertyIcon}></img>
                </div>
                <div className="side-menu-btn-text">Properties</div>
              </div>
            )} */}

              {pathname.includes('home/') && user?.role.code === 'CLIENT_ADMIN' && (
                <div
                  className={
                    pathname.includes('home/bank/dashboard')
                      ? 'side-menu-btn-wrap side-selected'
                      : 'side-menu-btn-wrap'
                  }
                  onClick={() => {
                    closeMobileMenu()
                    router('/home/bank/dashboard')
                  }}
                >
                  <div className="mob-menu-btn-img">
                    <img src={clientDashboardIcon}></img>
                  </div>
                  <div className="side-menu-btn-img">
                    <img src={clientDashboardIcon}></img>
                  </div>
                  <div className="side-menu-btn-text">Dashboard</div>
                </div>
              )}

              {pathname.includes('home/') && user?.role.code === 'CLIENT_ADMIN' && (
                <div
                  className={
                    pathname.includes('home/bank/teams')
                      ? 'side-menu-btn-wrap side-selected'
                      : 'side-menu-btn-wrap'
                  }
                  onClick={() => {
                    closeMobileMenu()
                    router('/home/bank/teams')
                  }}
                >
                  <div className="mob-menu-btn-img">
                    <img src={clientTeamIcon}></img>
                  </div>
                  <div className="side-menu-btn-img">
                    <img src={clientTeamIcon}></img>
                  </div>
                  <div className="side-menu-btn-text">Teams</div>
                </div>
              )}

              {pathname.includes('home/') && user?.role.code === 'CLIENT_ADMIN' && (
                <div
                  className={
                    pathname.includes('home/bank/customers')
                      ? 'side-menu-btn-wrap side-selected'
                      : 'side-menu-btn-wrap'
                  }
                  onClick={() => {
                    closeMobileMenu()
                    router('/home/bank/customers')
                  }}
                >
                  <div className="mob-menu-btn-img">
                    <img src={clientCustomerIcon}></img>
                  </div>
                  <div className="side-menu-btn-img">
                    <img src={clientCustomerIcon}></img>
                  </div>
                  <div className="side-menu-btn-text">Customers</div>
                </div>
              )}
              {/* {pathname.includes('home/') && user?.role.code === 'CLIENT_ADMIN' && (
                <div
                  className={
                    pathname.includes('home/bank/properties')
                      ? 'side-menu-btn-wrap side-selected'
                      : 'side-menu-btn-wrap'
                  }
                  onClick={() => {
                    toggleMenu(!visibleMenu)
                    router('/home/bank/properties')
                  }}
                >
                  <div className="mob-menu-btn-img">
                    <img src={VaultsIcon}></img>
                  </div>
                  <div className="side-menu-btn-img">
                    <img src={VaultsIcon}></img>
                  </div>
                  <div className="side-menu-btn-text">Properties</div>
                </div>
              )} */}

              {pathname.includes('home/') && user?.role.code === 'CLIENT_ADMIN' && (
                <div
                  className={
                    pathname.includes('home/bank/vault')
                      ? 'side-menu-btn-wrap side-selected'
                      : 'side-menu-btn-wrap'
                  }
                  onClick={() => {
                    closeMobileMenu()
                    router('/home/bank/vault')
                    setSelectedVault({})
                  }}
                >
                  <div className="mob-menu-btn-img">
                    <img src={clientVaultIcon}></img>
                  </div>
                  <div className="side-menu-btn-img">
                    <img src={clientVaultIcon}></img>
                  </div>
                  <div className="side-menu-btn-text">Vaults</div>
                </div>
              )}

              {pathname.includes('home/') && user?.role.code === 'CLIENT_ADMIN' && (
                <div
                  className={
                    pathname.includes('home/bank/reports')
                      ? 'side-menu-btn-wrap side-selected'
                      : 'side-menu-btn-wrap'
                  }
                  onClick={() => {
                    closeMobileMenu()
                    router('/home/bank/reports')
                  }}
                >
                  <div className="mob-menu-btn-img">
                    <img src={clientReportsIcon}></img>
                  </div>
                  <div className="side-menu-btn-img">
                    <img src={clientReportsIcon}></img>
                  </div>
                  <div className="side-menu-btn-text">Reports</div>
                </div>
              )}

              {pathname.includes('home/') && user?.role.code === 'CLIENT_ADMIN' && (
                <div
                  className={
                    pathname.includes('home/bank/Transactions')
                      ? 'side-menu-btn-wrap side-selected'
                      : 'side-menu-btn-wrap'
                  }
                  onClick={() => {
                    closeMobileMenu()
                    router('/home/bank/Transactions')
                  }}
                >
                  <div className="mob-menu-btn-img">
                    <img src={clientTransactionsIcon}></img>
                  </div>
                  <div className="side-menu-btn-img">
                    <img src={clientTransactionsIcon}></img>
                  </div>
                  <div className="side-menu-btn-text">Transactions</div>
                </div>
              )}

              {pathname.includes('home/') && user?.role.code === 'CLIENT_ADMIN' && (
                <div
                  className={
                    pathname.includes('/home/bank/audit')
                      ? 'side-menu-btn-wrap side-selected disabled-menu-item'
                      : 'side-menu-btn-wrap disabled-menu-item'
                  }
                  // onClick={() => {
                  //   closeMobileMenu()
                  //   router('/home/bank/audit')
                  // }}
                >
                  <div className="mob-menu-btn-img">
                    <img src={clientAuditIcon}></img>
                  </div>
                  <div className="side-menu-btn-img">
                    <img src={clientAuditIcon}></img>
                  </div>
                  <div className="side-menu-btn-text">Security audit</div>
                </div>
              )}

              {/* {pathname.includes('home/') && user?.role.code === 'KODELAB_FCA_VIEW' && (
                <div
                  className={
                    pathname.includes('/home/bank/FCAreports')
                      ? 'side-menu-btn-wrap side-selected'
                      : 'side-menu-btn-wrap'
                  }
                  onClick={() => {
                    toggleMenu(!visibleMenu)
                    router('/home/bank/FCAreports')
                  }}
                >
                  <div className="mob-menu-btn-img">
                    <img src={ReportsIcon}></img>
                  </div>
                  <div className="side-menu-btn-img">
                    <img src={ReportsIcon}></img>
                  </div>
                  <div className="side-menu-btn-text">Reports</div>
                </div>
              )}

              */}

              {/* {pathname.includes('vault') && (
              <div
                className={
                  pathname.includes('dashboard')
                    ? 'side-menu-btn-wrap side-selected'
                    : 'side-menu-btn-wrap'
                }
                onClick={() =>{
                  toggleMenu(!visibleMenu)
                   router('/vault/dashboard')}}
              >
                <div className="side-menu-btn-img">
                  <img src={SideCaseIcon}></img>
                </div>
                <div className="side-menu-btn-text">Vault</div>
              </div>
            )} */}
              {/* {pathname.includes('vault') && (
              <div
                className={
                  pathname.includes('history')
                    ? 'side-menu-btn-wrap side-selected'
                    : 'side-menu-btn-wrap'
                }
                onClick={() => {
                  toggleMenu(!visibleMenu)
                  router('/vault/history')}}
              >
                <div className="side-menu-btn-img">
                  <img src={SideDetailIcon}></img>
                </div>
                <div className="side-menu-btn-text">History</div>
              </div>
            )} */}
              {/* {
              <div
                className={
                  pathname.includes('support')
                    ? 'side-menu-btn-wrap side-selected'
                    : 'side-menu-btn-wrap'
                }
                onClick={() => {
                  toggleMenu(!visibleMenu)
                  pathname.includes('/home') ? router('/home/support') : router('/vault/support')
                }}
              >
                <div className="side-menu-btn-img">
                  <img src={SupportIcon} alt=""></img>
                </div>
                <div className="side-menu-btn-text">Support</div>
              </div>
            } */}
            </div>

            {pathname.includes('home/') && (
              <div
                className="side-menu-close-btn"
                onClick={() => {
                  setLogoutModalVisible(true)
                }}
              >
                <div className="mob-menu-btn-img">
                  <img src={logOutBtn}></img>
                </div>

                <div className="side-menu-btn-img" style={{ marginBottom: '20px' }}>
                  <img src={logOutBtn} alt=""></img>
                </div>

                <div className="side-menu-btn-text" style={{ marginBottom: '20px' }}>
                  Logout
                </div>
              </div>
            )}
            <LogoutConfirmModal
              visible={logoutModalVisible}
              onCancel={handleLogoutCancel}
              onConfirm={handleLogoutConfirm}
            />
          </div>
          <div className="side-footer-wrapper">
            <div className="logo-area">
              <div className="side-footer-text">Powered by</div>
              <div className="side-footer-img">
                <img src={FooterLogo}></img>
              </div>
            </div>
            <div className="version-area">
              <p>{appVersion}</p>
            </div>
          </div>
        </div>
      </div>
    )
  }
  return (
    <>
      {/* <div className="side-menu-mobile-client">
        <div className="mob-header-wrapper">
          <div className="mob-logo">
            <img src={logoKodelabTheme} alt="Logo" />
          </div>
          <div className="side-menu-btn-img-mob" onClick={() => closeMobileMenu()}>
            <img src={mobMenu} style={{ filter: 'var(--svg-filter)' }}></img>
          </div>
        </div>
        
      </div> */}

      {visibleMenu && <div> {getMenu()}</div>}
      <div className="side-menu">{getMenu()}</div>
    </>
  )
}
