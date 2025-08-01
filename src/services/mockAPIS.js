import auditData from '../mocks/audit.json'
import rolesData from '../mocks/roles.json'
import vaultsData from './../mocks/vaults.json'


// Base on chain 
import propertiesData from '@mocks/properties.json';
import usersData from '@mocks/users.json';
import clientData from '@mocks/clients.json';

const mockAPIS = {
  // For Users


  // Login API
  login: async (email, password) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const user = usersData.users.find((u) => u.email === email && u.password === password)

        if (user) {
          const { password, twoFactorCode, ...userWithoutPassword } = user
          resolve({
            status: 200,
            data: {
              user: userWithoutPassword,
              token: `mock-jwt-token-${user.id}`,
            },
          })
        } else {
          reject({
            status: 401,
            message: 'Invalid credentials',
          })
        }
      }, 500)
    })
  },

  // Verify 2FA API
  verify2FA: async (userId, code) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const user = usersData.users.find((u) => u.id === userId)
        const { password, twoFactorCode, ...userWithoutPassword } = user
        if (user && user.twoFactorCode === code) {
          resolve({
            status: 200,
            data: {
              user: userWithoutPassword,
              message: '2FA verification successful',
            },
          })
        } else {
          reject({
            status: 401,
            message: 'Invalid 2FA code',
          })
        }
      }, 300)
    })
  },

  // Verify 2FA API
  getUserById: async (userId) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const user = usersData.users.find((u) => u.id === userId)
        const { password, twoFactorCode, ...userWithoutPassword } = user

        resolve({
          status: 200,
          data: {
            user: userWithoutPassword,
            message: 'successful',
          },
        })
      }, 300)
    })
  },

  // Verify 2FA API
  getUserByIdOrWallet: async (identifier) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const user = usersData.users.find(
          (u) => u.id === identifier || u.walletAddress === identifier,
        )
        const { password, twoFactorCode, ...userWithoutPassword } = user

        resolve({
          status: 200,
          data: {
            user: userWithoutPassword,
            message: 'successful',
          },
        })
      }, 300)
    })
  },

  // Get all users API
  getAllUsers: async () => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const usersWithoutPasswords = usersData.users.map((user) => {
          const { password, ...userWithoutPassword } = user
          return userWithoutPassword
        })

        resolve({
          status: 200,
          data: usersWithoutPasswords,
        })
      }, 300)
    })
  },

  // Get user by ID API
  getUserById: async (userId) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const user = usersData.users.find((u) => u.id === userId)
        if (user) {
          const { password, ...userWithoutPassword } = user
          resolve({
            status: 200,
            data: userWithoutPassword,
          })
        } else {
          reject({
            status: 404,
            message: 'User not found',
          })
        }
      }, 300)
    })
  },

  // Get users by client ID API
  getUsersByClient: async (clientId) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const filteredUsers = usersData.users
          .filter((user) => user.clientBy === clientId)
          .map((user) => {
            const { password, ...userWithoutPassword } = user
            return userWithoutPassword
          })

        resolve({
          status: 200,
          data: filteredUsers,
        })
      }, 300)
    })
  },

  // Get all clients API
  getAllClients: async () => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          status: 200,
          data: clientData.clients,
        })
      }, 300)
    })
  },

  // Get client by token address and ID
  getClientByToken: async (tokenAddress, tokenId) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        try {
          const client = clientData.clients.find(
            (client) =>
              client.properties[tokenAddress] &&
              client.properties[tokenAddress].includes(Number(tokenId)),
          )

          if (client) {
            resolve({
              status: 200,
              data: {
                name: client.name,
                contactName: client.contact.name,
                contactEmail: client.contact.email,
                contactPhone: client.contact.phone,
                dateAdded: client.dateAdded,
                numberOfVaults: client.vaults,
                kyb: client.kyb,
                status: client.status,
                clientId: client.id,
                tokenDetails: {
                  address: tokenAddress,
                  id: tokenId,
                },
              },
            })
          } else {
            resolve({
              status: 404,
              error: 'Client not found',
            })
          }
        } catch (error) {
          reject({
            status: 500,
            error: 'Internal server error',
          })
        }
      }, 300)
    })
  },

  getClientEndUserByToken: async (tokenAddress, tokenId) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        try {
          const user = usersData.users.find(
            (user) =>
              user?.properties?.[tokenAddress] &&
              user.properties[tokenAddress].includes(Number(tokenId)),
          )
          const { password, twoFactorCode, ...userWithoutPassword } = user
          if (user) {
            resolve({
              status: 200,
              data: userWithoutPassword,
            })
          } else {
            resolve({
              status: 404,
              error: 'Property not found',
            })
          }
        } catch (error) {
          reject({
            status: 500,
            error: 'Internal server error',
          })
        }
      }, 300)
    })
  },

  // Get client by ID API
  getClientById: async (clientId) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const client = clientData.clients.find((c) => c.id === clientId)
        if (client) {
          resolve({
            status: 200,
            data: client,
          })
        } else {
          reject({
            status: 404,
            message: 'Client not found',
          })
        }
      }, 300)
    })
  },

  // For roles
  async getRoles() {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          success: true,
          data: rolesData.roles,
        })
      }, 800)
    })
  },

  async getRoleById(roleId) {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const role = rolesData.roles.find((r) => r.id === roleId)
        if (role) {
          const permissions = role.permissions.map((permCode) => {
            return rolesData.permissions.find((p) => p.name === permCode)
          })
          resolve({
            success: true,
            data: {
              name: role.name,
              code: role.code,
              permissions: permissions,
            },
          })
        } else {
          reject({ message: 'Role not found' })
        }
      }, 800)
    })
  },

  async getRoleByCode(roleCode) {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const role = rolesData.roles.find((r) => r.code === roleCode)
        if (role) {
          const permissions = role.permissions.map((permCode) => {
            return rolesData.permissions.find((p) => p.name === permCode)
          })
          resolve({
            success: true,
            data: {
              id: role.id,
              name: role.name,
              code: role.code,
              permissions: permissions,
            },
          })
        } else {
          reject({ message: 'Role not found' })
        }
      }, 800)
    })
  },

  async getRolePermissions(roleCode) {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const role = rolesData.roles.find((r) => r.code === roleCode)
        if (role) {
          const permissions = role.permissions.map((permCode) => {
            return rolesData.permissions.find((p) => p.name === permCode)
          })
          resolve({
            success: true,
            data: permissions,
          })
        } else {
          reject({ message: 'Role not found' })
        }
      }, 800)
    })
  },

  async getDefaultRoute(roleCode) {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const route = rolesData.defaultRoutes[roleCode]

        if (route) {
          resolve({
            success: true,
            data: { route },
          })
        } else {
          reject({ message: 'Default route not found for role' })
        }
      }, 800)
    })
  },

  // To check if a role has a specific permission
  async hasPermission(roleId, permissionName) {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const role = rolesData.roles.find((r) => r.id === roleId)
        if (role) {
          const hasPermission = role.permissions.includes(permissionName)
          resolve({
            success: true,
            data: hasPermission,
          })
        } else {
          reject({ message: 'Role not found' })
        }
      }, 800)
    })
  },

  // To get all permissions
  async getAllPermissions() {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          success: true,
          data: rolesData.permissions,
        })
      }, 800)
    })
  },

  // To get role IDs mapping
  async getRoleIds() {
    return new Promise((resolve) => {
      setTimeout(() => {
        const roleIds = rolesData.roles.reduce((acc, role) => {
          // Convert role code to a more JS-friendly constant name
          const key = role.code
          return {
            ...acc,
            [key]: role.id,
          }
        }, {})

        resolve({
          success: true,
          data: roleIds,
        })
      }, 800)
    })
  },

  // Get all clients API
  getAllAudit: async () => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          status: 200,
          data: auditData.auditLogs,
        })
      }, 300)
    })
  },

  // Get all clients API
  getAllVaults: async () => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          status: 200,
          data: vaultsData.vaults,
        })
      }, 300)
    })
  },

  getAllTeamsById: async (id) => {
    return new Promise((resolve) => {
      const requestingUser = usersData.users.find((user) => user.id === id);

      let teams = [];

      if (requestingUser) {
        if (requestingUser.roleId === 1 || requestingUser.roleId === 2) {
          // Return all users
          teams = usersData.users;
        } else {
          // Return users added by this user
          teams = usersData.users.filter((client) => client.clientBy === id);
        }
      }

      setTimeout(() => {
        resolve({
          status: 200,
          data: teams,
        })
      }, 300)
    })
  },
  getAllTeamsByCompanyId: async (id) => {
    return new Promise((resolve) => {
      let teams = [];

      teams = usersData.users.filter((client) => client.clientBy === id);

      setTimeout(() => {
        resolve({
          status: 200,
          data: teams,
        })
      }, 300)
    })
  },



  // Get all properties API
  getAllProperties: async () => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          status: 200,
          data: propertiesData.properties,
        })
      }, 300)
    })
  },

  getPropertiesByClient: async (clientWalletAddress) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const filtered = propertiesData.properties.filter(
          (prop) => prop.properties.ownerWalletAddress === clientWalletAddress,
        )
        resolve({
          status: 200,
          data: filtered,
        })
      }, 300)
    })
  },

  getPropertiesByTokenId: async (tokenId, clientWalletAddress) => {
    return new Promise((resolve) => {
      setTimeout(() => {


        const property = propertiesData.properties.find((prop) => prop.tokenID === tokenId && prop.properties.ownerWalletAddress === clientWalletAddress)
        resolve({
          status: 200,
          data: property || null, // return null if not found
        })
      }, 300)
    })
  },

  // Get property by token address and ID
  getPropertyByToken: async (tokenAddress, tokenId) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        try {
          // const property = propertiesData.properties.find(
          //   (property) =>
          //     property.contractAddress.toLowerCase() === tokenAddress.toLowerCase() &&
          //     property.tokenID === tokenId,
          // )

          const property = propertiesData.properties

          let assetType = assetTypes.find(
            (assetType) => assetType.id === property.properties['assetType'],
          )

          if (property) {
            resolve({
              status: 200,
              data: property,
            })
          } else {
            resolve({
              status: 404,
              error: 'Property not found',
            })
          }
        } catch (error) {

          resolve({
            status: 500,
            error: 'Internal server error',
          })
        }
      }, 300)
    })
  },

  getAssetTypes: async (assetTypeId) => {
    // Use this array for lookup
    const assetTypes = [
      { id: 5, name: 'Tokenised Shares' },
      { id: 4, name: 'Gold Token A' },
      { id: 1, name: 'Real-Estate Token A' },
    ];

    return new Promise((resolve) => {
      setTimeout(() => {
        const foundType = assetTypes.find((type) => type.id === assetTypeId);
        resolve({
          status: 200,
          data: foundType || null, // return null if not found
        });
      }, 300);
    });
  }
}

export default mockAPIS
