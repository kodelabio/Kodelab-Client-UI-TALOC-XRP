// @ts-nocheck
import SideBar from './sidebar/sideBar'
import { useEffect, useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import backMobMenu from '@/assets/icons/ArrowMobIcon.svg'
import ArrowMobIcon from '@/assets/icons/ArrowMobIcon.svg'
import hamburgerMenuIcon from '@/assets/icons/hamburger-menu-icon.svg'
import { useSessionStorage } from 'usehooks-ts'
import Header from '@/components/Header'
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

  const isSelectedEmpty = Object.keys(selectedClient).length === 0
  const isVaultEmpty = Object.keys(vault).length === 0

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

  const onClickBack = () => {
    // Check if we're in the vault dashboard view
    if (!isSelectedEmpty || !isVaultEmpty) {
      // Clear vault data to return to vault list
      setVault({})
      setSelectedClient([])
      setIsBackVisible(false)
      setSelectedVault({})

      // If we're in a vault view, stay on the current URL but show the vault list
      if (!isVaultEmpty) {
        // Prevent navigation, just clear the vault state
        return
      }
    }

    // Only navigate back if we're not in vault view
    navigate(-1)
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
                    <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
                      <h2 className="vault-heade-title-text">
                        {getPageName()}
                        {selectedClient?.length > 0 && ` / ${selectedClient.name}`}
                        {selectedVault?.property?.name &&
                          ` / Vault ${selectedVault?.property?.name}`}
                      </h2>

                      {/* {vault && <h2>{vault.vatId}</h2>} */}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          {children}
        </div>
      </div>
    </section>
  )
}
