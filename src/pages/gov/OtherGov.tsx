import { FullScreen } from './Proposal'
import { BaseGov } from './StartGov'
import useWeb3 from '@/hooks/useWeb3'

export default () => {
  const { walletAddress } = useWeb3()

  return (
    <FullScreen>
      <div className="wrap">
        {walletAddress ? (
          <>
            <div className="fz-30 mb-40">其他治理</div>
            <BaseGov />
          </>
        ) : (
          <div className="text-center pt-100">请先连接钱包</div>
        )}
      </div>
    </FullScreen>
  )
}
