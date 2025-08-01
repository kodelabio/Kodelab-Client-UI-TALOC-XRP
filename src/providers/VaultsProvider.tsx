import useCdpTypes from '../hooks/useCdpTypes'
import useMaker from '../hooks/useMaker'
import { watch } from '../hooks/useObservable'
import { createContext, ReactNode } from 'react'

type VaultsContextValue = {
  userVaults: VaultData[] | undefined
  viewedAddressVaults: VaultData[] | undefined
}

type RawVaultData = {
  vaultAddress: string
  vaultId: number
  vaultType: string
}
type ListType = RawVaultData[] | undefined
export const VaultsContext = createContext<VaultsContextValue>({
  userVaults: [],
  viewedAddressVaults: [],
})

function VaultsProvider({ children }: { children: ReactNode }) {
  const { account } = useMaker()
  const { cdpTypesList } = useCdpTypes()

  const userProxy: string | undefined = watch.proxyAddress('proxyAddress', account?.address)
  const viewedAddressProxy: string | undefined = watch.proxyAddress(account?.address)
  const rawUserVaultsList: ListType = watch.userVaultsList(account?.address)
  const rawViewedAddressVaultsList: ListType = watch.userVaultsList(account?.address)
  const userVaultsList = rawUserVaultsList?.filter((vault) =>
    cdpTypesList.some((cdpType) => cdpType === vault.vaultType),
  )

  const viewedAddressVaultsList = rawViewedAddressVaultsList?.filter((vault) =>
    cdpTypesList.some((cdpType) => cdpType === vault.vaultType),
  )
  const userVaultIds = userVaultsList?.map(({ vaultId }) => vaultId) || []

  const viewedAddressVaultIds = viewedAddressVaultsList?.map(({ vaultId }) => vaultId) || []

  const userVaultsData: VaultData[] | undefined = watch.userVaultsData(
    userVaultIds.length ? userVaultIds : undefined,
  )
  const viewedAddressVaultsData: VaultData[] | undefined = watch.userVaultsData(
    viewedAddressVaultIds.length ? viewedAddressVaultIds : undefined,
  )

  return (
    <VaultsContext.Provider
      value={{
        userVaults:
          rawUserVaultsList !== undefined
            ? userVaultIds && userVaultsData
              ? userVaultsData
              : []
            : userProxy
            ? undefined
            : [],
        viewedAddressVaults:
          viewedAddressProxy === undefined
            ? undefined
            : viewedAddressProxy === null
            ? []
            : viewedAddressVaultsList === undefined
            ? undefined
            : !viewedAddressVaultIds.length
            ? []
            : viewedAddressVaultsData,
      }}
    >
      {children}
    </VaultsContext.Provider>
  )
}

export default VaultsProvider
