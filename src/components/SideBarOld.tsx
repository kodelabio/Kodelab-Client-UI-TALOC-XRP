import Svgicon from './Svgicon'
import { Link, NavLink } from 'react-router-dom'
import styled from 'styled-components/macro'
import useWeb3 from '@/hooks/useWeb3'
import { Button, Modal } from 'antd'

const SidebarWrap = styled.div`
  position: fixed;
  left: 0;
  top: 0px;
  width: 260px;
  z-index: 10;
  height: 100%;
  border-right: 1px solid rgb(226, 226, 234);
  background-color: #004C7C;
  font-weight: bold;
  p {
    opacity: 0.4;
    padding: 30px 40px 10px;
    font-size: 15px;
  }
  a {
    display: flex;
    align-items: center;
    height: 60px;
    padding: 0 40px;
    font-size: 18px;
    color: #D4D4D4;
    svg {
      margin-right: 16px;
    }
    &.active {
      color: #fff;
      background-color: ${({ theme }) => '#0E4082'};
    }
  }
  ${({ theme }) => theme.mob} {
    top: auto;
    bottom: 0;
    width: 100%;
    height: 60px;
    display: flex;
    border-top: 1px solid #696969;
    a {
      flex: 1;
      display: flex;
      justify-content: center;
      flex-direction: column;
      align-items: center;
      font-size: 12px;
      font-weight: normal;
      height: 100%;
      &.active {
        background: none !important;
        color: #498fec;
      }
      svg {
        margin: 0;
      }
    }
    p,
    p ~ p ~ a {
      display: none;
    }
  }
`
export default () => {
  const { connect, disconnect, walletAddress } = useWeb3()


  return (
    <SidebarWrap>
      <NavLink to="/home">
        <Svgicon name="x_vault" />
        Home
      </NavLink>
      <NavLink to="/createVault">
        <Svgicon name="x_vault" />
        New Valut
      </NavLink>
      
      <Link to="/" className="o-4">
        Support
      </Link>
      {!walletAddress ?
        <div style={{ position: 'absolute', display: 'flex', bottom: 50, width: '100%', justifyContent: 'space-around' }}>
          <Button shape="round" type="primary" onClick={connect}>
            Connect wallet
          </Button>
        </div>
        :
        <div style={{ position: 'absolute', display: 'flex', bottom: 50, width: '100%', justifyContent: 'space-around' }}>
          <Button shape="round" type="default" onClick={disconnect}>
            Disconnect
          </Button>
        </div>
      }
    </SidebarWrap>

  )
}
