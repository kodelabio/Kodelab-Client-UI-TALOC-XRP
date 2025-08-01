import { useEffect, useState } from 'react'
import { Navigate } from 'react-router-dom'
import useUserMangement from '@/hooks/useUserMangement'
import { getRoleById, getDefaultRouteForRole } from '@/utils/roleUtils'

interface RouteGuardProps {
  allowedRoles: number[] // Array of role IDs that can access this route
  children: React.ReactNode
  fallbackPath?: string // Where to redirect if access is denied
}

const RouteGuard: React.FC<RouteGuardProps> = ({ allowedRoles, children, fallbackPath }) => {
  const { user, checkLogin } = useUserMangement()
  const [defaultRoute, setDefaultRoute] = useState<string>(fallbackPath || '/auth')
  const [loading, setLoading] = useState<boolean>(true)

  useEffect(() => {
    const loadDefaultRoute = async () => {
      if (user && !allowedRoles.includes(user.roleId)) {
        try {
          const role = await getRoleById(user.roleId)
          if (role?.code) {
            const route = await getDefaultRouteForRole(role.code)
            setDefaultRoute(route)
          }
        } catch (error) {

        }
      }
      setLoading(false)
    }

    loadDefaultRoute()
  }, [user, allowedRoles, fallbackPath])

  // Show loading state while determining the default route
  if (loading) {
    return <div>Loading...</div> // Or a proper loading component
  }

  // Check if user is logged in
  if (!user) {
    return <Navigate to="/auth" />
  }

  // Check if user has permission to access this route
  if (!allowedRoles.includes(user.roleId)) {
    return <Navigate to={defaultRoute} />
  }

  // User has permission, render the route
  return <>{children}</>
}

export default RouteGuard
