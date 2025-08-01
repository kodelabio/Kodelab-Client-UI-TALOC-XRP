// types/permissions.ts
export interface Permission {
  id: number
  name: string
  description: string
}

export interface Role {
  id: number
  name: string
  permissions: Permission[]
}

export interface User {
  id: number
  role: Role
  // other user properties
}

export const checkPermission = (permissions: Permission[], permissionName: string) => {
  return permissions?.some((permission) => permission.name === permissionName)
}
