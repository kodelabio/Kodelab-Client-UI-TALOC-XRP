import { ReactNode } from 'react'
import styled from 'styled-components'
import useWeb3 from '@/hooks/useWeb3'

type TableProps = {
  css?: string
  align: string
}
const TableWrap = styled.div<TableProps>`
  table {
    width: 100%;
    text-align: center;
  }
  thead {
    tr {
      background: #fafafa;
    }
    th {
      height: 50px;
      padding-top: 6px;
      padding-bottom: 6px;
      color: #8492a6;
      &:first-child {
        padding-left: 20px;
      }
    }
  }
  tbody tr {
    transition: 0.3s;
    border-bottom: 1px solid #f2f2f2;
    &:hover,
    &.active {
      background-color: #f4f4f4;
    }
  }
  th,
  td {
    text-align: ${({ align }) => align};
  }
  td {
    padding-top: 16px;
    padding-bottom: 16px;
    &:first-child {
      padding-left: 20px;
    }
  }
  ${({ css }) => css}
`

export default ({
  children,
  head,
  className,
  css,
  align = 'left',
}: {
  children: ReactNode
  head: ReactNode[]
  className?: string
  css?: string
  align?: 'left' | 'center'
  emptyTips?: ReactNode
  loading?: boolean
}) => {
  const { walletAddress } = useWeb3()

  return (
    <TableWrap css={css} align={align} className={className}>
      <table>
        <thead>
          <tr>
            {head.map((item, index) => (
              <th key={index}>{item}</th>
            ))}
          </tr>
        </thead>
        {walletAddress && <tbody>{children}</tbody>}
      </table>
    </TableWrap>
  )
}
