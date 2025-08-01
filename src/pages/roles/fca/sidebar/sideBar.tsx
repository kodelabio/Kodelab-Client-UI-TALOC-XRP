import { Tooltip } from 'antd'
import { useEffect, useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import Dashboard from '@/assets/icons/bankDashboard.svg'
import HistoryIcon from '@/assets/icons/clock-icon.svg'
import logOutBtn from '@/assets/icons/logOutIcon.svg'
import mobMenu from '@/assets/icons/mobMenuBtn.svg'
import openSideNavIcon from '@/assets/icons/open-side-nav.svg'
import ReportsIcon from '@/assets/icons/reports-icon.svg'
import VaultsIcon from '@/assets/icons/vaults-icon.svg'
import FooterLogo from '@/assets/img/logo-kodelab-footer.png'
import logoClientAdmin from '@/assets/theme/img/AbuDhabiBank-icon.svg'
import logoFCATheme from '@/assets/theme/img/FCA.svg'
import kodelabSmallLogo from '@/assets/theme/img/logo.png'
// import logoKodelabTheme from '@/assets/theme/img/logo.png'
import logoKodelabTheme from '@/assets/theme/img/side-bar-logo.svg'
import { useTheme } from '@/context/ThemeContext'
import { useSessionStorage } from 'usehooks-ts'
import useUserMangement from '@/hooks/useUserMangement'
import useWeb3 from '@/hooks/useWeb3'
import { checkPermission } from '@/utils/permissions'

export default ({ currentPage, navigateToPage, visibleMenu, setVisibleMenu }) => {
  const { connect, disconnect, walletAddress } = useWeb3()
  const { logout, user, checkLogin } = useUserMangement()
  const router = useNavigate()
  const { pathname } = useLocation()
  const { setTheme } = useTheme()
  const [isBackVisible, setIsVisible] = useSessionStorage('isBackVisible', false) //useState([])
  const [isSidenavOpen, setIsSidenavOpen] = useSessionStorage('isSidenavOpen', true)

  useEffect(() => {
    checkLogin()
  }, [])

  const { theme } = useTheme()
  const logoMap: Record<string, string> = {
    clientAdmin: logoClientAdmin,
    FCATheme: logoFCATheme,
    kodelabTheme: isSidenavOpen ? logoKodelabTheme : kodelabSmallLogo,
  }

  const toggleSideNav = () => {
    const isSidenav = isSidenavOpen
    setIsSidenavOpen(!isSidenav)
  }

  // const hasDashboardPermission = checkPermission(user?.role?.permissions, 'VIEW_DASHBOARD');

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
          setIsVisible(false)
        }}
      >
        <div
          className={
            isSidenavOpen ? 'side-menu-container-bank-open' : 'side-menu-container-bank-close'
          }
        >
          <div className={isSidenavOpen ? 'side-menu-logo' : 'closed-side-menu-logo'}>
            <img
              src={logoMap[theme] || logoKodelabTheme}
              alt="Logo"
              className={isSidenavOpen ? '' : 'closed-logo'}
            />
          </div>
          {/* <div>{user.role.name}</div> */}
          <div className="side-btn-wrapper">
            <div className="main-btn-wrap">
              {pathname.includes('home/') && user?.role.code === 'KODELAB_FCA_VIEW' && (
                <div
                  className={
                    pathname.includes('/home/view/dashboard')
                      ? 'side-menu-btn-wrap side-selected disabled-menu-item'
                      : 'side-menu-btn-wrap disabled-menu-item'
                  }
                  // onClick={() => {
                  //   toggleMenu(!visibleMenu)
                  //   setIsVisible(false)
                  //   router('/home/view/dashboard')
                  // }}
                >
                  <div className="mob-menu-btn-img">
                    <img src={Dashboard}></img>
                  </div>
                  <div className="side-menu-btn-img">
                    <img src={Dashboard}></img>
                  </div>
                  {isSidenavOpen && <div className="side-menu-btn-text">Clients</div>}
                </div>
              )}

              {pathname.includes('home/') && user?.role.code === 'KODELAB_FCA_VIEW' && (
                <div
                  className={
                    pathname.includes('/home/view/FCAreports')
                      ? 'side-menu-btn-wrap side-selected disabled-menu-item'
                      : 'side-menu-btn-wrap disabled-menu-item'
                  }
                  // onClick={() => {
                  //   toggleMenu(!visibleMenu)
                  //   router('/home/view/FCAreports')
                  // }}
                >
                  <div className="mob-menu-btn-img">
                    <img src={ReportsIcon}></img>
                  </div>
                  <div className="side-menu-btn-img">
                    <img src={ReportsIcon}></img>
                  </div>
                  {isSidenavOpen && <div className="side-menu-btn-text">Reports</div>}
                </div>
              )}

              {pathname.includes('home/') && user?.role.code === 'KODELAB_FCA_VIEW' && (
                <div
                  className={
                    pathname.includes('/home/view/vaults')
                      ? 'side-menu-btn-wrap side-selected'
                      : 'side-menu-btn-wrap'
                  }
                  onClick={() => {
                    closeMobileMenu()
                    setIsVisible(false)
                    router('/home/view/vaults')
                  }}
                >
                  <div className="mob-menu-btn-img">
                    <img src={VaultsIcon}></img>
                  </div>
                  <div className="side-menu-btn-img">
                    <img src={VaultsIcon}></img>
                  </div>
                  {isSidenavOpen && <div className="side-menu-btn-text">Vaults</div>}
                </div>
              )}

              {pathname.includes('home/') && user?.role.code === 'KODELAB_SUPER_ADMIN' && (
                <div
                  className={
                    pathname.includes('/home/superadmin/teams')
                      ? 'side-menu-btn-wrap side-selected disabled-menu-item'
                      : 'side-menu-btn-wrap disabled-menu-item'
                  }
                  // onClick={() => {
                  //   toggleMenu(!visibleMenu)
                  //   setIsVisible(false)
                  //   router('/home/superadmin/teams')
                  // }}
                >
                  <div className="mob-menu-btn-img">
                    <img src={ReportsIcon}></img>
                  </div>
                  <div className="side-menu-btn-img">
                    <img src={ReportsIcon}></img>
                  </div>
                  {isSidenavOpen && <div className="side-menu-btn-text">Team</div>}
                </div>
              )}

              {pathname.includes('home/') && user?.role.code === 'KODELAB_SUPER_ADMIN' && (
                <div
                  className={
                    pathname.includes('/home/superadmin/audit')
                      ? 'side-menu-btn-wrap side-selected disabled-menu-item'
                      : 'side-menu-btn-wrap disabled-menu-item'
                  }
                  // onClick={() => {
                  //   toggleMenu(!visibleMenu)
                  //   setIsVisible(false)
                  //   router('/home/superadmin/audit')
                  // }}
                >
                  <div className="mob-menu-btn-img">
                    <img src={ReportsIcon}></img>
                  </div>
                  <div className="side-menu-btn-img">
                    <img src={ReportsIcon}></img>
                  </div>
                  {isSidenavOpen && <div className="side-menu-btn-text">Security audit</div>}
                </div>
              )}
            </div>

            <div className="open-side-nav">
              <Tooltip title={isSidenavOpen ? 'Close sidebar' : 'Open sidebar'} placement="right">
                <img src={openSideNavIcon} alt="side nav icon" onClick={toggleSideNav} />
              </Tooltip>
            </div>
            {/* {pathname.includes('home/') && (
              <div
                className="side-menu-close-btn"
                onClick={() => {
                  toggleMenu(!visibleMenu)
                  setIsVisible(false)
                  sessionStorage.clear()
                  setTheme('kodelabTheme')
                  logout()
                  router('/users')
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
            )} */}
          </div>
          <div className="side-footer-wrapper">
            {isSidenavOpen ? (
              <>
                {' '}
                <div className="side-footer-text">Powered by</div>
                <div className="side-footer-img">
                  <img src={FooterLogo}></img>
                </div>
              </>
            ) : (
              <div className="side-footer-img">
                <img src={FooterLogo}></img>
              </div>
            )}
          </div>
        </div>
      </div>
    )
  }
  return (
    <>
      {/* <div className="side-menu-mobile">
        <div className="mob-header-wrapper">
          <div className="mob-logo">
            <img src={logoMap[theme] || logoKodelabTheme} alt="Logo" />
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
