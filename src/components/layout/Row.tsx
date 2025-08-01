import { ReactNode } from 'react'
import styled from 'styled-components'

const RowWrap = styled.div<{
  alignItems?: string
  justifyContent?: string
  gap?: number
  top?: boolean
}>`
  display: flex;
  justify-content: ${({ justifyContent }) => justifyContent};
  align-items: ${({ alignItems, top }) => (top ? 'flex-start' : alignItems)};
  margin-bottom: ${({ gap }) => gap + 'px'};
`
const Label = styled.div<{ width?: number }>`
  width: ${({ width }) => width + 'px'};
`
export function Row({
  children,
  className,
  label,
  justifyContent = 'flex-start',
  alignItems = 'center',
  gap = 40,
  top = false,
  labelWidth = 160,
  render = true,
}: {
  children?: ReactNode
  className?: string
  justifyContent?: string
  alignItems?: string
  label?: string
  labelWidth?: number
  gap?: number
  top?: boolean
  render?: boolean
}) {
  return render ? (
    <RowWrap
      className={className}
      gap={gap}
      justifyContent={justifyContent}
      alignItems={alignItems}
      top={top}
    >
      {label && (
        <Label width={labelWidth} className="label mr-20">
          {label}
        </Label>
      )}
      <div className="f1 rel">{children}</div>
    </RowWrap>
  ) : null
}
