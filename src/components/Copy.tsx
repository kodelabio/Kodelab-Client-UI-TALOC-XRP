import { Tooltip } from 'antd'
import Svgicon from './Svgicon'
import { ReactNode, useCallback, useState } from 'react'
import { CopyToClipboard } from 'react-copy-to-clipboard'
import classNames from 'classnames'

export default ({
  text,
  children,
  className,
}: {
  text: string
  children?: ReactNode
  className?: string
}) => {
  const [visible, setVisible] = useState(false)
  const onCopy = useCallback(() => {
    if (visible) return
    setVisible(true)
    setTimeout(() => {
      setVisible(false)
    }, 2000)
  }, [visible])
  return (
    <Tooltip className={classNames('mlr-10 pointer', className)} title="Copied" open={visible}>
      <CopyToClipboard text={text} onCopy={onCopy}>
        {children ? (
          <div>{children}</div>
        ) : (
          <div>
            <Svgicon size="14" name="copy" />
          </div>
        )}
      </CopyToClipboard>
    </Tooltip>
  )
}
