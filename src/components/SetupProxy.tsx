import { Button, Tooltip } from 'antd'
import { BsCheck } from 'react-icons/bs'
import { VendorErrors } from '@/constants'
import { QuestionCircleOutlined } from '@ant-design/icons'
import { useWeb3BlockHeight } from '@/hooks/useBlockHeight'
import useProxy from '@/hooks/useProxy'

const errorStates = {
  [VendorErrors.ENABLE_CONTRACT_DATA]: {
    message: 'There was an error with your ledger wallet...',
    information:
      'If you see this message and are using a ledger hardware wallet, it often means that you need to enable "Contract Data." To do this, go to your Ethereum app on Ledger, choose Settings and then Contract Data.',
    retry: true,
  },
  [VendorErrors.USER_REJECTED]: {
    message: 'The transaction has been rejected on the wallet',
    retry: true,
  },
  [VendorErrors.TIMEOUT]: {
    message: 'Your transaction timed out and was automatically rejected',
    information:
      'This error is often caused because you did not sign the transaction in a reasonable time, and it has been automatically rejected by the wallet. Where this has happened, you often still need to reject the transaction yourself on the wallet to allow you to sign another.',
    retry: true,
  },
}

const parseError = (proxyErrors: any) =>
  errorStates[proxyErrors?.name] || {
    message: 'This transaction is taking longer than usual...',
    information:
      'Transactions to the network may sometimes take longer than expected. This can be for a variety of reasons but may be due to a congested network or a transaction sent with a low gas price. Some wallets enable users to resend a transaction with a higher gas price, otherwise check for your transaction on etherscan and come back again later.',
    retry: false,
  }

const SetupProxy = () => {
  const blockHeight = useWeb3BlockHeight()
  const { setupProxy, proxyLoading, startingBlockHeight, proxyDeployed, proxyErrors, hasProxy } =
    useProxy()

  return (
    <div>
      <p className="fz-16 mb-14">
        Configure your treasury for easy management. This only has to be done once.
      </p>
      {hasProxy ? (
        <Button shape="round" className="w-160" type="primary" disabled>
          <BsCheck size={24} />
        </Button>
      ) : (
        <>
          <Button
            shape="round"
            className="w-160"
            type="primary"
            onClick={setupProxy}
            disabled={proxyLoading || !!(proxyErrors && !parseError(proxyErrors).retry)}
            loading={proxyLoading || !!(proxyErrors && !parseError(proxyErrors).retry)}
          >
            {parseError(proxyErrors).retry ? 'Try Again' : 'Setup'}
          </Button>
          <div className="row pt-8">
            {proxyErrors && (
              <>
                <span className="c-red">{parseError(proxyErrors).message}</span>
                {parseError(proxyErrors).information && (
                  <Tooltip title={parseError(proxyErrors).information}>
                    <span className="ml-10 c-primary">Why is this?</span>
                  </Tooltip>
                )}
              </>
            )}
            {proxyLoading && (
              <p>
                Waiting for confirmations...{' '}
                {startingBlockHeight === 0 ? 0 : Math.min(blockHeight - startingBlockHeight, 10)} of
                10
              </p>
            )}
            {proxyDeployed && <p>Confirmed with 10 confirmation</p>}
            {(proxyLoading || proxyDeployed) && (
              <Tooltip
                className="ml-10"
                title="Waiting for confirmations reduces the risk of your treasury address changing. We
              require users to wait 10 block confirmations to ensure it's been created
              successfully. This will often take around 2 minutes."
              >
                <QuestionCircleOutlined />
              </Tooltip>
            )}
          </div>
        </>
      )}
    </div>
  )
}

export default SetupProxy
