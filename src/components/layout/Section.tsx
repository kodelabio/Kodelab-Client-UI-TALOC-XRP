import { ReactNode } from 'react'
import styled from 'styled-components/macro'

const SectionWrap = styled.div`
  background-color: #fff;
  border: 1px solid #e2e2e2;
  border-radius: 6px;
`

export default ({
  title,
  children,
  className,
}: {
  title?: string
  children?: ReactNode
  className?: string
}) => {
  return (
    <SectionWrap className={className}>
      {title && <div className="fz-18 bold p-20">{title}</div>}
      {children}
    </SectionWrap>
  )
}
