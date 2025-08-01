import { useCdpNft } from '../hooks/useCdpNft'
import { instantiateMaker } from '../maker'
import { createContext, useState, useEffect, ReactNode, useCallback } from 'react'
// import Maker from '@makerdao/dai'
import useWeb3 from '@/hooks/useWeb3'

type Account = {
  address: string
}
type MakerInstace = Awaited<ReturnType<any>>
type MakerConextValue = {
  maker: MakerInstace
  watcher: PlainObject
  account: Account | null
  ilkList: CdpData[]
  txLastUpdate: PlainObject
} | null
export const MakerObjectContext = createContext<MakerConextValue>(null)

function MakerProvider({ children }: { children: ReactNode }) {
  const [account, setAccount] = useState<Account | null>(null)
  const [txLastUpdate, setTxLastUpdate] = useState({})
  const [maker, setMaker] = useState<MakerInstace | null>(null)
  const [watcher, setWatcher] = useState<PlainObject>({})

  const initAccount = (account: Account) => {
    setAccount(account)
  }

  const removeAccounts = useCallback(() => {
    maker!.service('accounts')._accounts = {}
    maker!.service('accounts')._currentAccount = ''
    setAccount(null)
  }, [maker])

  const { walletAddress } = useWeb3()

  useEffect(() => {
    if (walletAddress && maker) {
      const existingAccount = maker
        .listAccounts()
        .find((account: Account) => account.address.toUpperCase() === walletAddress)
      if (!existingAccount) {
        maker
          .addAccount({
            type: 'browser',
            autoSwitch: true,
          })
          .then(() => {
            maker.useAccountWithAddress(walletAddress)
          })
      }
    }
    if (!walletAddress && maker) {
      removeAccounts()
    }
  }, [maker, walletAddress, removeAccounts])

  const { ilkList, cdpTypes, nftAddresses } = useCdpNft()

  useEffect(() => {
    if (!cdpTypes.length) return
    instantiateMaker({
      cdpTypes,
      nftAddresses,
    }).then((newMaker) => {
      setWatcher(newMaker.watcher)
      setMaker(newMaker.maker)
    })
  }, [cdpTypes, nftAddresses])

  useEffect(() => {
    if (!maker) return
    if (maker.service('accounts').hasAccount()) {
      initAccount(maker.currentAccount())
    }
    maker.on('accounts/CHANGE', (eventObj: PlainObject) => {
      const { account } = eventObj.payload
      initAccount(account)
    })

    const txManagerSub = maker
      .service('transactionManager')
      .onTransactionUpdate((tx: PlainObject, state: string) => {
        if (state === 'mined') {
          const id = tx.metadata?.id
          if (id) {
            maker.service('mcd:cdpManager').resetEventHistoryCache()
            setTxLastUpdate((current) => ({ ...current, [id]: Date.now() }))
          } else if (tx.metadata?.contract === 'PROXY_ACTIONS_DSR') {
            maker.service('mcd:savings').resetEventHistoryCache()
            setTxLastUpdate((current) => ({ ...current, save: Date.now() }))
          }
        }
      })
    return () => {
      txManagerSub.unsub()
    }
  }, [maker])

  return (
    <MakerObjectContext.Provider
      value={{
        maker: maker!,
        watcher,
        account,
        ilkList,
        txLastUpdate,
      }}
    >
      {children}
    </MakerObjectContext.Provider>
  )
}

export default MakerProvider
