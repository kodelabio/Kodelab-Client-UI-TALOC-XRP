import { Button } from 'antd'
import { ReactNode } from 'react'
import { BsBoxArrowInRight } from 'react-icons/bs'
import { useNavigate } from 'react-router'
import { LeftOutlined } from '@ant-design/icons'
import styled from 'styled-components/macro'

const GridWrap = styled.div<{
  gap?: number
  column: number
  m?: number
  s?: number
}>`
  display: grid;
  grid-template-columns: ${({ column }) => `repeat(${column}, minmax(0, 1fr))`};
  gap: ${({ gap }) => `${gap}px`};
  @media screen and (max-width: 1200px) {
    grid-template-columns: ${({ column, m }) => `repeat(${m || column}, minmax(0, 1fr))`};
  }
  @media screen and (max-width: 768px) {
    grid-template-columns: ${({ s }) => `repeat(${s || 1}, minmax(0, 1fr))`};
  }
`

export default ({
  children,
  column = 1,
  m,
  s,
  gap = 14,
  className,
}: {
  children: ReactNode
  column?: number
  gap?: number
  m?: number
  s?: number
  className?: string
}) => {
  return (
    <GridWrap className={className} gap={gap} s={s} m={m} column={column}>
      {children}
    </GridWrap>
  )
}
