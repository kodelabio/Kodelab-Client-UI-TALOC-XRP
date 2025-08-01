// @ts-nocheck
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
  const { logout, user, checkLogin } = useUserMangement()
  const location = useLocation()

  // State for mobile menu visibility
  const [visibleMenu, setVisibleMenu] = useState(false)

  // Get the last segment of the path
  const getPageName = () => {
    const pathSegments = location.pathname.split('/')
    const pageName = pathSegments[pathSegments.length - 1]
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

  const onClickBack = () => {
    setVault({})
    setSelectedClient({})
    setIsBackVisible(false)
    navigate(-1) // goes to previous page
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
          <Header
            title={title}
            isBackVisible={isBackVisible}
            onClickBack={onClickBack}
            visibleMenu={visibleMenu}
            setVisibleMenu={setVisibleMenu}
            vault={vault}
          />
          {children}
        </div>
      </div>
    </section>
  )
}
