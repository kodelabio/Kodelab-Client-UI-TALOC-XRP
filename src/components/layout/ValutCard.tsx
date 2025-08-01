import { Skeleton, Tag } from 'antd'
import { ReactNode } from 'react'
import styled from 'styled-components/macro'
import useMaker from '@/hooks/useMaker'
import useWeb3 from '@/hooks/useWeb3'

const CardWrap = styled.div`
border-radius: 12px;
background: var(--white, #FFF);
box-shadow: 0px 0px 10px 0px rgba(0, 0, 0, 0.10);
display:flex;
flex-direction: column;

  background-color: #fff;
  padding: 24px 16px;
  border-radius: 6px;
  
  div {
    margin-bottom: 4px;
  }
  .value-content i {
    margin-left: 10px;
    font-size: 18px;
  }
`

const TextTitleWrap = styled.div`
color: #3C3C3C;
font-family: Lato;
font-size: 18px;
font-style: normal;
font-weight: 400;
line-height: 22px; /* 122.222% */å`

const TextSubTitleWrap = styled.div`
color: var(--text, #1C1C1C);
font-family: Lato;
font-size: 32px;
font-style: normal;
font-weight: 500;
line-height: normal;`

type CardInfo = {
  vault: any,
  title: string
  ltv: string
  imageUrl: string,
  address: ReactNode
  value: ReactNode
  lastVaule?: string | number
  currentVaule?: string | number
  date: ReactNode
}
export default ({ title, ltv, vault, address, imageUrl, value, lastVaule, date, currentVaule }: CardInfo) => {
  const { maker } = useMaker()
  const { web3 } = useWeb3()

  return (
    <CardWrap>

      <div className="o-7">
        {vault.collateralAmount && vault.collateralAmount.gt(0) ?
          <Tag style={{ color: '#024200', backgroundColor: '#E8F6FE', paddingLeft: 15, paddingRight: 15, paddingBottom: 8, paddingTop: 8, borderRadius: 20 }}>
            {title}
          </Tag>
          : <Tag style={{ color: '#420000', backgroundColor: '#FAD4D4', paddingLeft: 15, paddingRight: 15, paddingBottom: 8, paddingTop: 8, borderRadius: 20 }}>
            {title}
          </Tag>
        }

      </div>
      <div className="o-7">{address}</div>
      <Skeleton loading={!maker && web3} className="mt-10" active paragraph={{ rows: 1 }}>
        <div className="fz-24 mb-14 value-content bold">HK{value}</div>
        <div className="fz-16">
          <span className="fz-14">HELOC LTV total: {ltv}%</span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <img style={{ height: 200, width: 200 }} src={imageUrl}></img>
          <TextTitleWrap>Total credit available</TextTitleWrap>
          <TextSubTitleWrap>HK{value}</TextSubTitleWrap>

        </div>
      </Skeleton>
    </CardWrap>
  )
}
