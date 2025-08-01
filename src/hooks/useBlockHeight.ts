import useMaker from './useMaker'
import { useState, useEffect } from 'react'

export const useWeb3BlockHeight = (initialState = 0) => {
  const { maker } = useMaker()
  const [blockHeight, setBlockHeight] = useState(initialState)
  if (!maker || !maker.service('web3')) return 0

  maker.service('web3').onNewBlock(setBlockHeight)

  return blockHeight
}

const useBlockHeight = (initialState = 0) => {
  const { watcher } = useMaker()
  const [blockHeight, setBlockHeight] = useState(initialState)

  useEffect(() => {
    if (!watcher) return
    const subscription = watcher.onNewBlock((blockHeight: number) => setBlockHeight(blockHeight))
    return subscription.unsub
  }, [watcher])

  return blockHeight
}

export default useBlockHeight
