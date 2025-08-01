import useCdpTypes from '@/hooks/useCdpTypes'
import useMaker from '@/hooks/useMaker'
import { watch } from '@/hooks/useObservable'

type RawVaultData = {
  vaultAddress: string
  vaultId: number
  vaultType: string
}
type ListType = RawVaultData[] | undefined
function useVaults() {
  const { account } = useMaker()
  const { cdpTypesList } = useCdpTypes()
  const rawUserVaultsList: ListType = watch.userVaultsList(account?.address)
  const userVaultsList = rawUserVaultsList?.filter((vault) =>
    cdpTypesList.some((cdpType) => cdpType === vault.vaultType),
  )

  const userVaultIds = userVaultsList?.map(({ vaultId }) => vaultId) || []

  const userVaultsData: VaultData[] | undefined = watch.userVaultsData(
    userVaultIds.length ? userVaultIds : undefined,
  )

  return {
    userVaults: userVaultsData,
  }
}

export default useVaults
