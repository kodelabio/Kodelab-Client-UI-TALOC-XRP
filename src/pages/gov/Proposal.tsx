import { Button } from 'antd'
import ProposalCreate from './ProposalCreate'
import ProposalDetail from './ProposalDetail'
import { useCallback, useRef, useState } from 'react'
import { useToggle } from 'ahooks'
import styled from 'styled-components'
import List from '@/components/List'
import Table from '@/components/Table'
import { Display } from '@/components/layout/Display'
import useWeb3 from '@/hooks/useWeb3'
import { format_time } from '@/utils/format'
import { getSpellContract } from '@/utils/getContract'

export type ProposalData = {
  spell: string
  sender: string
  desc: string
  expire: string
  status: string
  approveds: string[]
}

export type PageProps = {
  setRouter: React.Dispatch<React.SetStateAction<'list' | 'create' | 'detail'>>
  setRefresh: React.Dispatch<React.SetStateAction<number>>
  setId: React.Dispatch<React.SetStateAction<number>>
  id: number
}

export const FullScreen = styled.div`
  position: fixed;
  left: 0;
  top: 80px;
  bottom: 0;
  right: 0;
  padding: 70px;
  background: #fff;
  z-index: 999;
  overflow: auto;
  .wrap {
    max-width: 1100px;
    margin: 0 auto;
  }
`
const ProposalList = ({ setRouter, setId }: PageProps) => {
  const [list, setList] = useState<({ id: number } & ProposalData)[]>([])
  const pageSize = 8
  const [loading, { toggle }] = useToggle()

  const dataList = useRef<number[]>([])

  const getList = useCallback(
    async (page: number) => {
      const { contract } = getSpellContract()
      toggle()
      if (page === 1) {
        const lastId = (await contract.methods.lastId().call()) || 0
        dataList.current = Array.from(Array(+lastId), (v, k) => k + 1).reverse()
      }
      const arr: typeof list = []
      for (let i = 0; i < pageSize; i++) {
        const id = dataList.current[(page - 1) * pageSize + i]
        if (!id) break
        const res = await contract.methods.getProposalMSG(id).call()
        arr.push({
          ...res,
          id,
        })
      }
      setList(arr)
      toggle()
    },
    [toggle],
  )

  return (
    <div>
      <div className="row-between mb-30">
        <div className="fz-30 text-center">新资产投票</div>
        <Button shape="round" type="primary" size="middle" onClick={() => setRouter('create')}>
          新提案
        </Button>
      </div>
      <div className="bd-all">
        <List
          loading={loading}
          total={dataList.current.length}
          pageSize={pageSize}
          onChange={getList}
        >
          <Table head={['投票ID', 'SPELL合约描述', '投票状态', '结束时间', '操作']}>
            {list.map((item, index) => (
              <tr key={index}>
                <td>{item.id}</td>
                <td>
                  <div className="one-line">{item.desc}</div>
                </td>
                <td>{item.status === '0' ? '投票中' : item.status === '1' ? '成功' : '失败'}</td>
                <td>{format_time(+item.expire)}</td>
                <td
                  className="pointer underline cgreen"
                  onClick={() => {
                    setId(item.id)
                    setRouter('detail')
                  }}
                >
                  详情
                </td>
              </tr>
            ))}
          </Table>
        </List>
      </div>
    </div>
  )
}

export default () => {
  const [router, setRouter] = useState<'create' | 'list' | 'detail'>('list')
  const [id, setId] = useState(0)
  const { walletAddress } = useWeb3()
  const [refreshKey, setRefresh] = useState(0)
  const props = {
    setRouter,
    setId,
    id,
    setRefresh,
  }
  return (
    <FullScreen>
      <div className="wrap">
        {walletAddress ? (
          <div>
            {router === 'create' && <ProposalCreate {...props} />}
            <Display key={refreshKey} show={router === 'list'}>
              <ProposalList {...props} />
            </Display>
            {router === 'detail' && <ProposalDetail {...props} />}
          </div>
        ) : (
          <div className="text-center pt-100">请先连接钱包</div>
        )}
      </div>
    </FullScreen>
  )
}
