import { getRoleIds } from '@/utils/roleUtils'

// Initialize with default values that will be updated
export let ROLE_IDS = {
  KODELAB_SUPER_ADMIN: 1,
  KODELAB_FCA_VIEW: 2,
  CLIENT_ADMIN: 3,
  CLIENT_END_USER: 4,
}

// // Immediately invoke async function to update ROLE_IDS
// ;(async () => {
//   try {
//     const roleIds = await getRoleIds()
//     if (Object.keys(roleIds).length > 0) {
//       ROLE_IDS = roleIds
//     }
//   } catch (error) {

//   }
// })()

// For backward compatibility
export { ROLE_IDS as default }
