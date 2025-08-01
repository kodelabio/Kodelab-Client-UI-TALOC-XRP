import { Skeleton, Tag } from 'antd'
import { ReactNode } from 'react'
import styled from 'styled-components/macro'
import useMaker from '@/hooks/useMaker'
import useWeb3 from '@/hooks/useWeb3'

const CardWrap = styled.div`
  border: 1px solid #e2e2e2;
  background-color: #fff;
  padding: 24px 32px;
  border-radius: 6px;
  div {
    margin-bottom: 4px;
  }
  .value-content i {
    margin-left: 10px;
    font-size: 18px;
  }
`

type CardInfo = {
  description: ReactNode
  value: ReactNode
  lastVaule?: string | number
  currentVaule?: string | number
  date: ReactNode
}
export default ({ description, value, lastVaule, date, currentVaule }: CardInfo) => {
  const { maker } = useMaker()
  const { web3 } = useWeb3()
  const RenderTag = () => {
    if (currentVaule && +currentVaule > 0 && lastVaule) {
      const rate = ((Number(currentVaule) - Number(lastVaule)) / (Number(lastVaule) || 1)) * 100
      return (
        <Tag color={rate > 0 ? 'green' : rate < 0 ? 'red' : ''}>
          {rate > 0 && '+'}
          {rate.toFixed(2)} %
        </Tag>
      )
    } else if (currentVaule !== undefined) {
      return <Tag>0.00 %</Tag>
    }
    return null
  }
  return (
    <CardWrap>
      <div className="o-7">{description}</div>
      <Skeleton loading={!maker && web3} className="mt-10" active paragraph={{ rows: 1 }}>
        <div className="fz-24 mb-14 value-content bold">{value}</div>
        <div className="fz-16">
          <RenderTag />
          <span className="fz-14">{date}</span>
        </div>
      </Skeleton>
    </CardWrap>
  )
}
