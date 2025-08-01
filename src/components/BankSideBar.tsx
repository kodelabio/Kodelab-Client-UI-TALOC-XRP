import { Button, Modal } from 'antd'
import { useTheme } from '../context/ThemeContext'
import LogoImage from './../assets/theme/img/logo.png'
import SideSupportIcon from './../assets/theme/img/sideSupport.svg'
import Svgicon from './Svgicon'
import { useCallback, useEffect, useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { useNavigate, useLocation } from 'react-router-dom'
import ArrowBackIcon from '@/assets/icons/arrowBack.svg'
import mobDashboard from '@/assets/icons/bankDasboardMob.svg'
import Dashboard from '@/assets/icons/bankDashboard.svg'
import HistoryIcon from '@/assets/icons/clock-icon.svg'
import HomeIcon from '@/assets/icons/home.svg'
import homeMobMenu from '@/assets/icons/homeMobIcon.svg'
import logOutBtn from '@/assets/icons/logOutIcon.svg'
import logoutMobMenu from '@/assets/icons/logoutMobIcon.svg'
import mobMenu from '@/assets/icons/mobMenuBtn.svg'
import PropertyIcon from '@/assets/icons/propertyIcon.svg'
import ReportsIcon from '@/assets/icons/reports-icon.svg'
import SideCaseIcon from '@/assets/icons/sideCase.svg'
import SideDetailIcon from '@/assets/icons/sideDetail.svg'
import SupportIcon from '@/assets/icons/support.svg'
import VaultsIcon from '@/assets/icons/vaults-icon.svg'
import FooterLogo from '@/assets/img/logo-kodelab-footer.png'
import mobLogo from '@/assets/img/moblogo.png'
import logoClientAdmin from '@/assets/theme/img/AbuDhabiBank-icon.svg'
import logoFCATheme from '@/assets/theme/img/FCA.svg'
import LOGO from '@/assets/theme/img/logo.png'
// import logoKodelabTheme from '@/assets/theme/img/logo.png'
import logoKodelabTheme from '@/assets/theme/img/side-bar-logo.svg'
import styled from 'styled-components/macro'
import useUserMangement from '@/hooks/useUserMangement'
import useWeb3 from '@/hooks/useWeb3'

export default () => {
  const currentPage = 0
  const { connect, disconnect, walletAddress } = useWeb3()
  const { logout, user, checkLogin } = useUserMangement()
  const router = useNavigate()
  const { pathname } = useLocation()
  const { setTheme } = useTheme()
  const [visibleMenu, toggleMenu] = useState(false)

  useEffect(() => {
    checkLogin()
  }, [])

  const { theme } = useTheme()
  const logoMap: Record<string, string> = {
    clientAdmin: logoClientAdmin,
    FCATheme: logoFCATheme,
    kodelabTheme: logoKodelabTheme,
  }
  const getMenu = () => {
    return (
      <div
        className="transparent"
        onClick={() => {
          toggleMenu(!visibleMenu)
        }}
      >
        <div className="side-menu-container-bank">
          <div className="side-menu-logo">
            <img src={logoMap[theme] || logoKodelabTheme} alt="Logo" />
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
                    toggleMenu(!visibleMenu)
                    router('/home/bank/dashboard')
                  }}
                >
                  <div className="mob-menu-btn-img">
                    <img src={Dashboard}></img>
                  </div>
                  <div className="side-menu-btn-img">
                    <img src={Dashboard}></img>
                  </div>
                  <div className="side-menu-btn-text">Dashboard</div>
                </div>
              )}
              {pathname.includes('home/') && user?.role.code === 'CLIENT_ADMIN' && (
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
              )}

              {pathname.includes('home/') && user?.role.code === 'CLIENT_ADMIN' && (
                <div
                  className={
                    pathname.includes('home/bank/vault')
                      ? 'side-menu-btn-wrap side-selected'
                      : 'side-menu-btn-wrap'
                  }
                  onClick={() => {
                    toggleMenu(!visibleMenu)
                    router('/home/bank/vault')
                  }}
                >
                  <div className="mob-menu-btn-img">
                    <img src={VaultsIcon}></img>
                  </div>
                  <div className="side-menu-btn-img">
                    <img src={VaultsIcon}></img>
                  </div>
                  <div className="side-menu-btn-text">Vaults</div>
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
                    toggleMenu(!visibleMenu)
                    router('/home/bank/teams')
                  }}
                >
                  <div className="mob-menu-btn-img">
                    <img src={ReportsIcon}></img>
                  </div>
                  <div className="side-menu-btn-img">
                    <img src={ReportsIcon}></img>
                  </div>
                  <div className="side-menu-btn-text">Teams</div>
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
                    toggleMenu(!visibleMenu)
                    router('/home/bank/reports')
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

              {pathname.includes('home/') && user?.role.code === 'CLIENT_ADMIN' && (
                <div
                  className={
                    pathname.includes('home/bank/Transactions')
                      ? 'side-menu-btn-wrap side-selected'
                      : 'side-menu-btn-wrap'
                  }
                  onClick={() => {
                    toggleMenu(!visibleMenu)
                    router('/home/bank/Transactions')
                  }}
                >
                  <div className="mob-menu-btn-img">
                    <img src={HistoryIcon}></img>
                  </div>
                  <div className="side-menu-btn-img">
                    <img src={HistoryIcon}></img>
                  </div>
                  <div className="side-menu-btn-text">History</div>
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
                  toggleMenu(!visibleMenu)
                  sessionStorage.clear()
                  setTheme('kodelabTheme')
                  logout()
                  router('/users')
                  disconnect()
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
          </div>
          <div className="side-footer-wrapper">
            <div className="side-footer-text">Powered by</div>
            <div className="side-footer-img">
              <img src={FooterLogo}></img>
            </div>
          </div>
        </div>
      </div>
    )
  }
  return (
    <>
      <div className="side-menu-mobile">
        <div className="mob-header-wrapper">
          <div className="mob-logo">
            <img src={logoMap[theme] || logoKodelabTheme} alt="Logo" />
          </div>
          <div className="side-menu-btn-img-mob" onClick={() => toggleMenu(!visibleMenu)}>
            <img src={mobMenu} style={{ filter: 'var(--svg-filter)' }}></img>
          </div>
        </div>
        {visibleMenu && <div> {getMenu()}</div>}
      </div>
      <div className="side-menu">{getMenu()}</div>
    </>
  )
}
