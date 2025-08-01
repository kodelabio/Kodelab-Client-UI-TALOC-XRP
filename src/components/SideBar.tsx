import { useTheme } from '../context/ThemeContext'
import { useEffect, useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import backMobMenu from '@/assets/icons/ArrowMobIcon.svg'
import ArrowBackIcon from '@/assets/icons/arrowBack.svg'
import historyMobMenu from '@/assets/icons/historyMobIcon.svg'
import HomeIcon from '@/assets/icons/home.svg'
import homeMobMenu from '@/assets/icons/homeMobIcon.svg'
import logOutBtn from '@/assets/icons/logOutIcon.svg'
import logoutMobMenu from '@/assets/icons/logoutMobIcon.svg'
import mobMenu from '@/assets/icons/mobMenuBtn.svg'
import propertyMobMenu from '@/assets/icons/propertiesMobIcon.svg'
import PropertyIcon from '@/assets/icons/propertyIcon.svg'
import SideCaseIcon from '@/assets/icons/sideCase.svg'
import SideDetailIcon from '@/assets/icons/sideDetail.svg'
import SupportIcon from '@/assets/icons/support.svg'
import supportMobMenu from '@/assets/icons/supportMobIcon.svg'
import vaultMobMenu from '@/assets/icons/vaultMobIcon.svg'
import FooterLogo from '@/assets/img/logo-kodelab-footer.png'
import logoClientAdmin from '@/assets/theme/img/AbuDhabiBank-icon.svg'
import logoFCATheme from '@/assets/theme/img/FCA.svg'
import logoKodelabTheme from '@/assets/theme/img/logo.png'
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
  const [height, setHeight] = useState(0)

  useEffect(() => {})

  const [visibleMenu, toggleMenu] = useState(false)

  useEffect(() => {
    checkLogin()
  }, [])
  const [screenSize, setScreenSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  })

  useEffect(() => {
    const handleResize = () => {
      toggleMenu(false)

      // setScreenSize({
      //   width: window.innerWidth,
      //   height: window.innerHeight,
      // })
    }

    window.addEventListener('resize', handleResize)

    // Clean up the event listener when the component unmounts
    return () => {
      window.removeEventListener('resize', handleResize)
    }
  }, [])

  //change logo by theme
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
        <div className="side-menu-container">
          <div className="side-menu-logo">
            <img src={logoMap[theme] || logoKodelabTheme} alt="Logo" />
          </div>

          <svg id="svg" style={{ display: 'none' }}>
            <defs>
              {/* <filter id="colorFilter">
                <feColorMatrix
                color-interpolation-filters="sRGB"
                type="matrix"
                values="0.3275 0      0      0      0
                        0      0.7451 0      0      0
                        0      0      0.6235 0      0
                        0      0      0      1      0"/>
              </filter> */}
            </defs>
          </svg>
          <div className="side-btn-wrapper">
            <div className="main-btn-wrap">
              {pathname.includes('vault') && (
                <div
                  className="side-menu-btn-wrap"
                  onClick={() => {
                    toggleMenu(!visibleMenu)
                    sessionStorage.removeItem('selectedVault')
                    router('/home/dashboard')
                  }}
                >
                  <div className="mob-menu-btn-img">
                    <img src={backMobMenu}></img>
                  </div>
                  <div className="side-menu-btn-img">
                    <img src={ArrowBackIcon}></img>
                  </div>
                  {/* <div className="side-menu-btn-text">Back</div> */}
                  {/* <!-- <div class="side-menu-btn-text">Homepage</div> --> */}
                </div>
              )}
              {pathname.includes('home/') && (
                <div
                  className={
                    pathname.includes('home/dashboard')
                      ? 'side-menu-btn-wrap side-selected'
                      : 'side-menu-btn-wrap'
                  }
                  onClick={() => {
                    toggleMenu(!visibleMenu)
                    router('/home/dashboard')
                  }}
                >
                  <div className="mob-menu-btn-img">
                    <img src={homeMobMenu}></img>
                  </div>
                  <div className="side-menu-btn-img">
                    <img src={HomeIcon}></img>
                  </div>
                  <div className="side-menu-btn-text">Homepage</div>
                </div>
              )}
              {pathname.includes('home/') && (
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
                  <div className="mob-menu-btn-img">
                    <img src={propertyMobMenu}></img>
                  </div>
                  <div className="side-menu-btn-img">
                    <img src={PropertyIcon}></img>
                  </div>
                  <div className="side-menu-btn-text">Assets</div>
                </div>
              )}
              ,
              {/* {pathname.includes('home/') && (
                <div
                  className={
                    pathname.includes('oldproperty')
                      ? 'side-menu-btn-wrap side-selected'
                      : 'side-menu-btn-wrap'
                  }
                  onClick={() => {
                    toggleMenu(!visibleMenu)
                    sessionStorage.removeItem('selectedProperty')
                    router('/property')
                  }}
                >
                  <div className="mob-menu-btn-img">
                    <img src={propertyMobMenu}></img>
                  </div>
                  <div className="side-menu-btn-img">
                    <img src={PropertyIcon}></img>
                  </div>
                  <div className="side-menu-btn-text">old Vault</div>
                </div>
              )} */}
              {pathname.includes('vault') && (
                <div
                  className={
                    pathname.includes('dashboard')
                      ? 'side-menu-btn-wrap side-selected'
                      : 'side-menu-btn-wrap'
                  }
                  onClick={() => {
                    toggleMenu(!visibleMenu)
                    router('/vault/dashboard')
                  }}
                >
                  <div className="mob-menu-btn-img">
                    <img src={vaultMobMenu}></img>
                  </div>
                  <div className="side-menu-btn-img">
                    <img src={SideCaseIcon}></img>
                  </div>
                  <div className="side-menu-btn-text">Vault</div>
                </div>
              )}
              {pathname.includes('vault') && (
                <div
                  className={
                    pathname.includes('history')
                      ? 'side-menu-btn-wrap side-selected'
                      : 'side-menu-btn-wrap'
                  }
                  onClick={() => {
                    toggleMenu(!visibleMenu)
                    router('/vault/history')
                  }}
                >
                  <div className="mob-menu-btn-img">
                    <img src={historyMobMenu}></img>
                  </div>
                  <div className="side-menu-btn-img">
                    <img src={SideDetailIcon}></img>
                  </div>
                  <div className="side-menu-btn-text">History</div>
                </div>
              )}
              ,
              {
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
                  <div className="mob-menu-btn-img">
                    <img src={supportMobMenu}></img>
                  </div>
                  <div className="side-menu-btn-img">
                    <img src={SupportIcon} alt=""></img>
                  </div>
                  <div className="side-menu-btn-text">Support</div>
                </div>
              }
            </div>

            {/*logout on all side-bars*/}
            {/* class 'side-selected' was removed from 'logout' btn */}
            {
              <div
                className={
                  pathname.includes('home/') ? 'side-menu-btn-wrap ' : 'side-menu-btn-wrap '
                }
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
                  <img src={logoutMobMenu}></img>
                </div>
                <div className="side-menu-btn-img">
                  <img src={logOutBtn} alt=""></img>
                </div>
                <div className="side-menu-btn-text">Logout</div>
              </div>
            }
            {/* logout on all side-bars */}

            {/* {pathname.includes('home/') && (
            <div
              className="side-menu-close-btn"
              onClick={() => {
                toggleMenu(!visibleMenu)
                sessionStorage.clear()
                logout()
                router('/users')
              }}
            >
              <div className="side-menu-btn-img">
                <img src={logOutBtn} alt=""></img>
              </div>
              <div className="side-menu-btn-text" style={{ marginRight: '10px' }}>
                Logout
              </div>
              
            </div>
          )} */}
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
