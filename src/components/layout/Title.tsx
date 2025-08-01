import { Button } from 'antd'
import { Back } from './Back'
import { ReactNode } from 'react'
import { BsBoxArrowInRight } from 'react-icons/bs'
import { useNavigate } from 'react-router'
import { LeftOutlined } from '@ant-design/icons'
import styled from 'styled-components/macro'

const TitleWrap = styled.div`
  display: flex;
  align-items: center;
  padding: 18px 30px;
  background: #fff;
  font-size: 24px;
  border-bottom: 1px solid #e2e2e2;
`

export default ({
  title,
  children,
  back,
}: {
  title: string
  children?: ReactNode
  back?: boolean
}) => {
  return (
    <TitleWrap>
      {back && <Back />}
      <div className="f1 bold">{title}</div>
      {children}
    </TitleWrap>
  )
}
