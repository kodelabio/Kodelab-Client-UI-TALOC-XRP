import { Spin, Tooltip } from 'antd'
import { StepComponentsProps } from '../CreateVault'
import { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getVaultPropertyList } from '@/api/api'
import spinner from '@/assets/img/kodelab-spinner-spin.gif'
import FooterLogo from '@/assets/img/logo-kodelab-footer.png'
import { useSessionStorage } from 'usehooks-ts'
import useUserMangement from '@/hooks/useUserMangement'

const PropertySelection = () => {
  let dummyArray: any[] | (() => any[]) = []

  const [loader, setLoader] = useState(false)

  const [property, setProperty] = useState(dummyArray)

  const [vaultList, setVaultList] = useSessionStorage('vaultList', []) //useState([])
  const [propertyList, setPropertyList] = useState(vaultList)

  const router = useNavigate()

  const { user, checkLogin } = useUserMangement()

  useEffect(() => {
    checkLogin()
  }, [])

  useEffect(() => {
    if (user) {
      setLoader(true)

      let proList = getVaultPropertyList(user.id).then((val) => {
        if (val.length < 1) {
          setLoader(false)
          setPropertyList([])
          // router('/users')
        } else {
          setPropertyList(val)
          setVaultList(val)
          setLoader(false)
        }
      })
    } else {
      setPropertyList([])
      setLoader(false)
    }
  }, [user])

  // useEffect(() => {
  //   let propertyList = getVaultPropertyList(1)
  //   setProperty(propertyList[0])
  // }, [property])

  return (
    <div className="facility-window">
      <div className="cf-tabs-wrapper">
        {!loader ? (
          propertyList.length > 0 ? (
            propertyList.map((property, index) => (
              <div className="cf-property-tab" key={index}>
                <div className="cf-vault">
                  <div className="cf-vault-text">
                    {/* Vault<span>{index + 1}</span> */}

                    {/* <Tooltip title={property['vatAddress'] || ''}> */}
                    {/* <span>
                        {property['vatAddress']
                          ? `HLN${property['vatAddress'].slice(-5).toUpperCase()}`
                          : property['property']['properties']['loanNumber']}
                      </span> */}
                    <span>Vault {property?.vatAddress.slice(-5).toUpperCase()}</span>
                    {/* </Tooltip> */}
                  </div>
                </div>
                <div className="cf-description-wrapper">
                  <div className="cf-tab-description">{property['property']['name']}</div>
                  <div className="cf-property-value">
                    <div className="cf-property-value-deckription">Asset value:</div>
                    <div className="cf-property-summ-wrap">
                      <div className="cf-property-summ-text"> HGBP </div>
                      <div className="cf-property-summ">
                        {property['property']['properties']['assetValue']}
                      </div>
                    </div>
                  </div>
                  {/* <div className="heloc-wrapper">
                <div className="heloc-description">HELOC LTV total:</div>
                <div className="heloc-summ">
                  {property['property']['properties']['maximumLoanPercentage']}
                </div>
              </div> */}
                </div>

                <div className="cf-tab-img">
                  <img src={property['property']['image']}></img>
                </div>
                <div className="cf-total-credit-text">Total credit available</div>
                <div className="cf-total-credit-summ">
                  <div className="cf-credit-summ-text"> HGBP </div>
                  <div className="cf-credit-summ">
                    {' '}
                    {property['property']['properties']['approvedLoanAmount']}
                  </div>
                </div>
                <div
                  className="cf-tab-btn"
                  onClick={() => {
                    sessionStorage.setItem('selectedVault', JSON.stringify(property))

                    router('/vault/dashboard', { state: { property: property } })
                  }}
                >
                  <div className="cf-tab-btn-text">See Vault</div>
                </div>
              </div>
            ))
          ) : (
            <section className="first-screen-window" style={{ fontSize: 20 }}>
              No vaults available{' '}
            </section>
          )
        ) : (
          <>
            <div
              className="spin-wrap"
              // style={{
              //   display: 'flex',
              //   alignItems: 'center',
              //   justifyContent: 'center',
              //   flexDirection: 'column',
              //   position:'absolute',
              //   top:'50%',
              //   right:'50%'
              //   transform: 'translate(-50%, -50%)'
              // }}
            >
              <img
                style={{
                  width: '40px',
                  height: '40px',
                }}
                src={spinner}
              />
              {/* <Spin className="row-center ptb-30" /> */}
              <div
                style={{
                  marginTop: '10px',
                  fontSize: '16px',
                }}
              >
                Fetching vaults...
              </div>
            </div>
          </>
        )}
      </div>
      <div className="mob-footer-wrapper">
        <div className="footer-text">Powered by</div>
        <div className="footer-img">
          <img src={FooterLogo}></img>
        </div>
      </div>
    </div>
  )
}

export default PropertySelection
