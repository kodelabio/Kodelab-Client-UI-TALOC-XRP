import useActionState from './useActionState'
import useMaker from './useMaker'
import { watch } from './useObservable'
import usePrevious from './usePrevious'
import { useEffect, useState } from 'react'

export default function useProxy() {
  const { maker, account } = useMaker()
  const [startedWithoutProxy, setStartedWithoutProxy] = useState(false)
  const [startingBlockHeight, setStartingBlockHeight] = useState(0)
  const [proxyDeployed, setProxyDeployed] = useState(false)

  const proxyAddress = watch.proxyAddress(account?.address)
  const prevProxy = usePrevious(proxyAddress)

  useEffect(() => {
    if (prevProxy === undefined && proxyAddress === null) {
      setStartedWithoutProxy(true)
    }
  }, [proxyAddress, prevProxy])

  const [setupProxy, proxyLoading, , proxyErrors] = useActionState(async () => {
    try {
      if (!account) return null
      if (proxyAddress) return proxyAddress

      const txPromise = maker.service('proxy').ensureProxy()

      const txMgr = maker.service('transactionManager')
      txMgr.listen(txPromise, {
        mined: (tx: any) => {
          setStartingBlockHeight(tx._blockNumberWhenMined)
        },
        confirmed: () => {
          setProxyDeployed(true)
        },
        error: () => {
          setStartingBlockHeight(0)
        },
      })

      await txMgr.confirm(txPromise, 10)
    } catch (e) {
      setStartingBlockHeight(0)
    }
  })

  return {
    proxyAddress,
    startedWithoutProxy,
    setupProxy,
    proxyLoading,
    initialProxyCheck: proxyAddress === undefined,
    proxyErrors,
    startingBlockHeight,
    proxyDeployed,
    hasProxy: startedWithoutProxy ? proxyDeployed : !!proxyAddress,
  }
}
