import useUserMangement from './useUserMangement'
import { useState, useEffect, useCallback } from 'react'
import { hasPermission, getRoleById } from '@/utils/roleUtils'

export default function usePermissions() {
  const { user } = useUserMangement()
  const [permissions, setPermissions] = useState<string[]>([])
  const [loading, setLoading] = useState<boolean>(true)

  // Load permissions when user changes
  useEffect(() => {
    const loadPermissions = async () => {
      if (user) {
        try {
          const role = await getRoleById(user.roleId)
          if (role?.permissions) {
            setPermissions(role.permissions.map((p) => p.name))
          }
        } catch (error) {

        }
      } else {
        setPermissions([])
      }
      setLoading(false)
    }

    setLoading(true)
    loadPermissions()
  }, [user])

  // Check if the current user has a specific permission
  const can = useCallback(
    async (permission: string): Promise<boolean> => {
      if (!user) return false

      // First check the cached permissions
      if (permissions.includes(permission)) {
        return true
      }

      // If not in cache or still loading, check via API
      try {
        return await hasPermission(user.roleId, permission)
      } catch (error) {

        return false
      }
    },
    [user, permissions],
  )

  // Synchronous version that only uses cached permissions
  const canSync = useCallback(
    (permission: string): boolean => {
      if (!user || loading) return false
      return permissions.includes(permission)
    },
    [user, permissions, loading],
  )

  return {
    can,
    canSync,
    permissions,
    loading,
  }
}
