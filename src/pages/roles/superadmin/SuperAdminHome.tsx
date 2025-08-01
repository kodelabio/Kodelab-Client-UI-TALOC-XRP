import SideBar from './sidebar/sideBar'
import { useEffect, useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import backMobMenu from '@/assets/icons/ArrowMobIcon.svg'
import ArrowMobIcon from '@/assets/icons/ArrowMobIcon.svg'
import hamburgerMenuIcon from '@/assets/icons/hamburger-menu-icon.svg'
import notificationIcon from '@/assets/icons/notification.svg'
import { useSessionStorage } from 'usehooks-ts'
import Header from '@/components/Header'
import UserProfile from '@/components/UserProfile'
import useUserMangement from '@/hooks/useUserMangement'

export default ({ title, children }) => {
  const navigate = useNavigate()
  const [isBackVisible, setIsBackVisible] = useSessionStorage('isBackVisible', false) //useState([])
  const [vault, setVault] = useSessionStorage('selectedVault', {}) //useState([])
  const [allVaults, setAllVaults] = useSessionStorage('allVaults', []) //useState([])
  const [selectedClient, setSelectedClient] = useSessionStorage('selectedClient', []) //useState([])
  const [selectedVault, setSelectedVault] = useSessionStorage('selectedVault', {}) //useState({})
  const { logout, user, checkLogin } = useUserMangement()
  const location = useLocation()

  // State for mobile menu visibility
  const [visibleMenu, setVisibleMenu] = useState(false)

  // Get the last segment of the path
  const getPageName = () => {
    const pathSegments = location.pathname.split('/')
    const pageName = pathSegments[pathSegments.length - 1]
    if (pageName === 'dashboard') {
      return 'Clients'
    }
    return pageName.charAt(0).toUpperCase() + pageName.slice(1).toLowerCase()
  }

  // Get page name from hash (for hash router)
  const getPageNameFromHash = () => {
    const hashSegments = location.hash.split('/')
    return hashSegments[hashSegments.length - 1]
  }

  // Toggle mobile menu visibility
  const toggleMobileMenu = () => {
    setVisibleMenu(!visibleMenu)
  }

  const [uiState, setUIState] = useState(0)

  const navigateToPage = (page) => {
    // router('/home/vault/dashboard')
  }
  const isVaultEmpty = Object.keys(vault).length === 0

  const isSelectedEmpty = Object.keys(selectedClient).length === 0

  const onClickBack = () => {
    if (isSelectedEmpty) {
      navigate(-1)
    }
    setVault({})
    setSelectedClient([])

    setIsBackVisible(false)
    setSelectedVault({})
    //  // goes to previous page
  }

  useEffect(() => {}, [isBackVisible])

  return (
    <section className="main-page">
      <SideBar
        currentPage={uiState}
        navigateToPage={navigateToPage}
        visibleMenu={visibleMenu}
        setVisibleMenu={setVisibleMenu}
      />
      <div className="main-window">
        <div className="main-window-line">
          {/* <Header title={title} /> */}

          <div className="vault-header">
            <div className="side-menu-mobile">
              <div className="hamburger-menu" onClick={toggleMobileMenu}>
                <img src={hamburgerMenuIcon} alt="Menu" />
              </div>
            </div>
            <div className="header-container">
              <div className="title-container">
                {' '}
                <div className="vault-header-container">
                  <div className="vault-heade-title">
                    {isBackVisible && (
                      <div
                        onClick={() => {
                          onClickBack()
                        }}
                        className=""
                      >
                        <img src={ArrowMobIcon}></img>
                      </div>
                    )}
                    <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'flex-end' }}>
                      <h1 className="vault-heade-title-text">
                        {getPageName()}
                        {selectedClient?.name && ` / ${selectedClient.name}`}
                        {vault && vault.vatId && ` / Vault ${vault.vatId}`}
                      </h1>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="user-info">
              <div className="notification-icon">
                <img src={notificationIcon} alt="notification" />
              </div>
              <UserProfile />
            </div>
          </div>
          {children}
        </div>
      </div>
    </section>
  )
}
