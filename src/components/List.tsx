import { Pagination, Skeleton, Spin } from 'antd'
import { ReactNode, useCallback, useEffect, useState } from 'react'
import useWeb3 from '@/hooks/useWeb3'

interface Params {
  total?: number
  emptyTips?: ReactNode
  pageSize?: number
  onChange: ((page: number) => void) | null
  children: ReactNode
  refreshKey?: number | string | boolean
  loading?: boolean
}

export default function List({
  total,
  pageSize = 20,
  onChange,
  children,
  refreshKey,
  emptyTips,
  loading = false,
}: Params) {
  const [current, setCurrrent] = useState(1)
  const { walletAddress } = useWeb3()
  const handleChange = useCallback(
    (page: number) => {
      setCurrrent(page)
      onChange?.(page)
    },
    [onChange],
  )
  useEffect(() => {
    if (onChange) {
      handleChange(1)
    }
  }, [handleChange, onChange, refreshKey])
  return (
    <Spin spinning={loading && !!walletAddress}>
      <div className="list-wrap mH-180">
        {children}

        {!walletAddress ? (
          <div className="text-center c-999 ptb-30">No account</div>
        ) : (
          <>
            {!total && !loading && (
              <div className="text-center c-999 ptb-30">{emptyTips || 'no data'}</div>
            )}
            {onChange && (
              <Pagination
                total={total}
                current={current}
                pageSize={pageSize}
                onChange={handleChange}
                className="mtb-40 text-center"
                hideOnSinglePage={true}
                showSizeChanger={false}
                showTotal={(total, range) => `${range[0]}-${range[1]} of ${total} items`}
              />
            )}
          </>
        )}
      </div>
    </Spin>
  )
}
