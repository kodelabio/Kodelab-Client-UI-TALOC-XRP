import { Spin } from 'antd'
import { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getPropertyList } from '@/api/api'
import { transform } from 'lodash'
import Card from '@/components/Card'
import Property from '@/components/PropertyCard'
import BalanceCard from '@/components/layout/BalanceCard'
import ChartCard from '@/components/layout/ChartCard'
import { getWrapHolder } from '@/hooks/useCdpNft'
import useProxy from '@/hooks/useProxy'
import useTokenAllowance from '@/hooks/useTokenAllowance'
import useUserMangement from '@/hooks/useUserMangement'
import FooterLogo from '@/assets/img/logo-kodelab-footer.png'
import spinner from '@/assets/img/kodelab-spinner-spin.gif'

const PropertySelection = () => {
  let dummyArray: any[] | (() => any[]) = []

  const [loader, setLoader] = useState(false)

  const [property, setProperty] = useState(dummyArray)
  const [propertyList, setPropertyList] = useState(dummyArray)
  const router = useNavigate()

  const { user, checkLogin } = useUserMangement()

  useEffect(() => {
    checkLogin()
  }, [])

  useEffect(() => {
    if (user) {
      setLoader(true)
      let proList = getPropertyList().then((val) => {
         if (val.length < 1) {
           setLoader(false)
          setPropertyList([])
          // router('/users')
        } else {
          setPropertyList(val)
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
                  Vault <span>{property['properties']['loanNumber']}</span>
                </div>
              </div>
              <div className="cf-description-wrapper">
                <div className="cf-tab-description">{property['name']}</div>
                <div className="cf-property-value">
                  <div className="cf-property-value-deckription">Asset value:</div>
                  <div className="cf-property-summ-wrap">
                    <div className="cf-property-summ-text">{property['properties']['loanCurrency']}  </div>
                    <div className="cf-property-summ">
                      {property['properties']['assetValue']}
                    </div>
                  </div>
                </div>
                {/* <div className="heloc-wrapper">
                <div className="heloc-description">HELOC LTV total:</div>
                <div className="heloc-summ">
                  {property['properties']['maximumLoanPercentage']}
                </div>
              </div> */}
              </div>

              <div className="cf-tab-img">
                <img src={property['image']}></img>
              </div>
              <div className="cf-total-credit-text">Total credit available</div>
              <div className="cf-total-credit-summ">
                <div className="cf-credit-summ-text">{property['properties']['loanCurrency']}  </div>
                <div className="cf-credit-summ">
                  {' '}
                  {property['properties']['approvedLoanAmount']}
                </div>
              </div>
              <div className="footer-text">{property['assetType']['name']}</div>
              <div className="footer-text">{property['user']['userName']}</div>

              {/* <div
                className="cf-tab-btn"
                onClick={() => {
                  sessionStorage.setItem('selectedVault', JSON.stringify(property))

                  router('/vault/dashboard', { state: { property: property } })
                }}
              >
                <div className="cf-tab-btn-text">See Vault</div>
              </div> */}
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
            <img style={{
              width: '40px',
              height: '40px'
            }}
              src={spinner} />
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
