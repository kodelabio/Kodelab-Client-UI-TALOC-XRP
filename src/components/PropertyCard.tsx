import { BsArrowLeft, BsArrowLeftShort } from 'react-icons/bs'
import { useNavigate } from 'react-router'
import { ArrowLeftOutlined, LeftOutlined } from '@ant-design/icons'
import styled from 'styled-components/macro'
import { getAssetDetails } from '@/api/api'

export default ({ title="Property", property }) => {

  return (
    <div className="property-tab">
      <div className="property-tab-title">{getAssetDetails(property['property']['properties']['assetType']).name}</div>
      <div className="property-tab-description">{property['property']['name']}</div>
      <div className="property-tab-img">
        <img  src={property['property']['image']}></img>
      </div>
      <div className="property-value-deckription">Asset value</div>
      <div className="property-summ-wrap">
        <div className="property-summ-text"> HGBP  </div>
        <div className="property-summ">{property['property']['properties']['assetValue']}</div>
      </div>
    </div>
  )
}
