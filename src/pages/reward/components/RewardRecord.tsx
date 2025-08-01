import { Spin } from 'antd'
import { useCallback, useEffect, useRef, useState } from 'react'
import InfiniteScroll from 'react-infinite-scroll-component'
import Table from '@/components/Table'
import useWeb3 from '@/hooks/useWeb3'
import { request } from '@/utils/request'

type RewardInfo = {
  loan: string
  team: string
  liquidity_hoc: string
  liquidity_hgbp: string
  date: string
  get_time: string
}

export default ({ type }: { type: 'borrow' | 'liquidity' }) => {
  const { walletAddress } = useWeb3()
  const [list, setList] = useState<RewardInfo[]>([])

  const lastKey = useRef<string | null>()
  const getList = useCallback(() => {
    if (!walletAddress) return
    request
      .post('/accountBooks/import/list', {
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
          head={
            type === 'borrow' ? ['Reward amount', 'Date'] : [' HGBP reward', 'HOC reward', 'Date']
          }
        >
          {list.map((item, index) => (
            <tr key={index}>
              {type === 'borrow' ? (
                <td>{item.loan || item.team} HOC</td>
              ) : (
                <>
                  <td>{item.liquidity_hgbp}  HGBP</td>
                  <td>{item.liquidity_hoc} HOC</td>
                </>
              )}
              <td>{item.date}</td>
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
