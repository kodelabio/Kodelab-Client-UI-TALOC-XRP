import Copy from './Copy'
import { NETWORK_INFO } from '@/constants'
import { simpleAddress } from '@/utils'

export default ({ hash, ellipsis }: { hash: string; ellipsis?: boolean }) => {
  return (
    <div style={{ display: 'inline-flex', alignItems: 'center' }}>
      <a className="link-text" target="_blank" href={`${NETWORK_INFO.scanUrl}/tx/${hash}`}>
        {ellipsis ? simpleAddress(hash, 20) : hash}
      </a>
      <Copy text={hash} />
    </div>
  )
}
