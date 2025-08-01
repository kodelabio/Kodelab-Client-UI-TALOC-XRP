import { Spin } from 'antd'
import { useCallback, useEffect, useRef, useState } from 'react'
import InfiniteScroll from 'react-infinite-scroll-component'
import Table from '@/components/Table'
import TxLink from '@/components/TxLink'
import useWeb3 from '@/hooks/useWeb3'
import { format_time } from '@/utils/format'
import { request } from '@/utils/request'

type RecrodInfo = {
  transaction_hash: string
  amount: string
  event_time: string
  coin_type: string
}

export default () => {
  const { walletAddress } = useWeb3()
  const [list, setList] = useState<RecrodInfo[]>([])

  const lastKey = useRef<string | null>()
  const getList = useCallback(() => {
    if (!walletAddress) return
    request
      .post('/accountBooks/extract/list', {
        user_address: walletAddress,
        last_evaluated_key: lastKey.current,
      })
      .then((res) => {
        setList((data) => {
          const prev = lastKey.current ? data : []
          return prev.concat(res.data.data || [])
        })
        lastKey.current = res.data.last_evaluated_key
      })
  }, [walletAddress])

  useEffect(() => {
    getList()
  }, [getList])

  return (
    <InfiniteScroll
      dataLength={list.length}
      next={getList}
      hasMore={lastKey.current !== null}
      loader={<Spin className="row-center ptb-30" />}
    >
      <div>
        <Table
          css={`
            th:not(:last-child) {
              width: 15%;
            }
          `}
          head={['Claim amount', 'Pick up date', 'State', 'Tx hash']}
        >
          {list.map((item, index) => (
            <tr key={index}>
              <td>
                {item.amount} {item.coin_type.toUpperCase()}
              </td>
              <td>{format_time(+item.event_time * 1000)}</td>
              <td>Successed</td>
              <td>
                <TxLink hash={item.transaction_hash} />
              </td>
            </tr>
          ))}
        </Table>
        {!list.length && lastKey.current === null && (
          <div className="ptb-30 text-center c-999">No data</div>
        )}
      </div>
    </InfiniteScroll>
  )
}
