import { Button, Modal, Spin } from 'antd'
import { useEffect, useState } from 'react'
import { useToggle } from 'ahooks'
import List from '@/components/List'
import Table from '@/components/Table'
import TxLink from '@/components/TxLink'
import Section from '@/components/layout/Section'
import useDsrEventHistory, { ActiveEventInfo, EventInfo } from '@/hooks/useDsrEventHistory'
import useWeb3 from '@/hooks/useWeb3'
import { format_num, format_time } from '@/utils/format'
import { formatEventDescription } from '@/utils/ui'

export default ({ refreshKey }: { refreshKey: number }) => {
  const { web3 } = useWeb3()
  const [visible, { toggle }] = useToggle()

  const { getData, list, total, loading, refresh } = useDsrEventHistory()

  useEffect(() => {
    // refreshKey && refresh()
    if (refreshKey) {
      setTimeout(() => {
        refresh()
      }, 3000)
    }
  }, [refreshKey, refresh])

  const [activeItem, setActiveItem] = useState<ActiveEventInfo | null>(null)
  const getDetail = async (data: EventInfo) => {
    setActiveItem(data)
    toggle()
  }

  return (
    <Section title="History" className="mt-30 mH-400">
      <List
        onChange={getData}
        emptyTips="Deposit  HGBP to see your first transaction and start earning"
        loading={loading}
        total={list.length ? total : 0}
        pageSize={10}
        key={refreshKey}
      >
        <Table head={['Activity', 'Date', 'Tx hash', 'action']}>
          {list.map((item, index) => (
            <tr key={index}>
              <td>{formatEventDescription(item)}</td>
              <td>{format_time(item.timestamp * 1000)}</td>
              <td>
                <TxLink hash={item.txHash} />
              </td>
              <td>
                <Button
                  shape="round"
                  size="middle"
                  type="primary"
                  onClick={() => getDetail(item)}
                  ghost
                >
                  Detail
                </Button>
              </td>
            </tr>
          ))}
        </Table>
      </List>
      <Modal open={visible} width={600} title="Transaction Detail" onCancel={toggle}>
        {activeItem && (
          <Spin spinning={activeItem.gov === undefined}>
            <div className="c-666">
              <p className="row pt-20">
                <span className="w-120"> HGBP reward:</span>
                <span className="c-333">{format_num(activeItem.dai, 6)}  HGBP</span>
              </p>
              <p className="row">
                <span className="w-120">HOC reward:</span>
                <span className="c-333">{format_num(activeItem.gov, 6)} HOC</span>
              </p>
              <p className="row bd-top pt-20 mt-20">
                <span className="w-120">Type:</span>
                <span>{formatEventDescription(activeItem)}</span>
              </p>
              <p className="row">
                <span className="w-120">Date:</span>
                <span>{format_time(activeItem.timestamp * 1000)}</span>
              </p>
              <div className="pt-10 flex">
                <span className="w-120">Tx hash:</span>
                <div className="f1">
                  <TxLink ellipsis hash={activeItem.txHash} />
                </div>
              </div>
            </div>
          </Spin>
        )}
      </Modal>
    </Section>
  )
}
