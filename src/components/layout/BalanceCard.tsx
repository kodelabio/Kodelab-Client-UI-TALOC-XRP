import { BsArrowLeft, BsArrowLeftShort } from 'react-icons/bs'
import { useNavigate } from 'react-router'
import { ArrowLeftOutlined, LeftOutlined } from '@ant-design/icons'
import styled from 'styled-components/macro'

export default ({ title, valueText, value, sendBtnName, investBtnName, exchangeBtnName , modalToggled}) => {
 
 

  return (
    <div className="balance-tab">
    <div className="balance-tab-title">{title}</div>
    <div className="balance-summ-wrapper">
      <div className="balance-summ-text">{valueText}</div>
      <div className="balance-summ"> {(Math.round(value * 100)/100).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}</div>
    </div>
    <div className="balance-btn-wrapper" onClick={modalToggled}>
      <div className="send-btn-wrap unable">
        <div className="send-btn">{sendBtnName}</div>
      </div>
      <div className="invest-btn-wrap" onClick={modalToggled}>
        <div className="invest-btn">{investBtnName}</div>
      </div>
      <div className="exchange-btn-wrap" onClick={modalToggled}>
        <div className="exchange-btn">{exchangeBtnName}</div>
      </div>
    </div>
  </div>
  )
}
