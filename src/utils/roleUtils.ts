import mockAPIS from '../services/mockAPIS.js'

// Cache for role data to avoid repeated API calls
let roleIdsCache = null
let rolesCache = null
let permissionsCache = null

// Get role IDs mapping (e.g., { SUPER_ADMIN: 1, FCA_VIEW: 2, ... })
export const getRoleIds = async () => {
  if (roleIdsCache) return roleIdsCache

  try {
    const response = await mockAPIS.getRoleIds()
    if (response.success) {
      roleIdsCache = response.data
      return response.data
    }
    return {}
  } catch (error) {

    return {}
  }
}

// Get all roles
export const getRoles = async () => {
  if (rolesCache) return rolesCache

  try {
    const response = await mockAPIS.getRoles()
    if (response.success) {
      rolesCache = response.data
      return response.data
    }
    return []
  } catch (error) {

    return []
  }
}

// Get role by ID
export const getRoleById = async (id) => {
  try {
    const response = await mockAPIS.getRoleById(id)
    if (response.success) {
      return response.data
    }
    return null
  } catch (error) {

    return null
  }
}

// Get role by code
export const getRoleByCode = async (code) => {
  try {
    const response = await mockAPIS.getRoleByCode(code)
    if (response.success) {
      return response.data
    }
    return null
  } catch (error) {

    return null
  }
}

// Get all permissions
export const getPermissions = async () => {
  if (permissionsCache) return permissionsCache

  try {
    const response = await mockAPIS.getAllPermissions()
    if (response.success) {
      permissionsCache = response.data
      return response.data
    }
    return []
  } catch (error) {

    return []
  }
}

// Get default route for a role code
export const getDefaultRouteForRole = async (roleCode) => {
  try {
    const response = await mockAPIS.getDefaultRoute(roleCode)
    if (response.success) {
      return response.data.route
    }
    return '/auth'
  } catch (error) {

    return '/auth'
  }
}

// Check if a role has a specific permission
export const hasPermission = async (roleId, permissionName) => {
  try {
    const response = await mockAPIS.hasPermission(roleId, permissionName)
    if (response.success) {
      return response.data
    }
    return false
  } catch (error) {

    return false
  }
}

// Initialize role IDs for immediate use (useful for constants)
export const initializeRoleIds = async () => {
  if (!roleIdsCache) {
    await getRoleIds()
  }
  return roleIdsCache || {}
}
