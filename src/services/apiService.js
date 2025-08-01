// src/services/apiService.js
// import {
//   getAllByBankContractAndUser
// } from '@/api/api/blockchain'
import {
  getAllByBankContractAndUser,
  getPropertyByVaultAddressToken,
  getInterestByBank,
  getDocumentsByParty,
  getDocument,
  getBankContractAddress,
} from './../api/blockchain'
import mockAPIS from './mockAPIS'
import { getAssetDetails, getBankDetails, getFCADetails, getHistoryList } from '@/api/api'
import { data } from 'autoprefixer'

class ApiService {
  // Auth Services
  async login(walletAddress, password) {
    try {
      // You can add pre-processing here if needed
      const response = await mockAPIS.login(walletAddress, password)

      // You can add post-processing here if needed
      // For example, storing token in localStorage
      if (response.data.token) {
        sessionStorage.setItem('token', response.data.token)
      }

      return response
    } catch (error) {
      // You can add error handling/transformation here
      throw error
    }
  }

  async verify2FA(userId, code) {
    try {
      const response = await mockAPIS.verify2FA(userId, code)
      if (!response.data?.user) {
        throw new Error('2FA verification failed')
      }

      const userData = response.data.user
      if (!userData.roleId) {
        throw new Error('User role information is missing')
      }
      const roleResponse = await mockAPIS.getRoleById(response.data.user.roleId)

      // Combine user and role information
      return {
        success: true,
        data: {
          user: {
            ...response.data.user,
            role: roleResponse.data,
          },
        },
      }
    } catch (error) {
      throw error
    }
  }

  async getUserById(userId) {
    try {
      const response = await mockAPIS.getUserById(userId)
      const roleResponse = await mockAPIS.getRoleById(response.data.user.roleId)

      // Combine user and role information
      return {
        success: true,
        data: {
          ...response.data.user,
          role: roleResponse.data,
        },
      }
    } catch (error) {
      throw error
    }
  }

  async getUserByIdOrWallet(userId) {
    try {
      const response = await mockAPIS.getUserByIdOrWallet(userId)
      const roleResponse = await mockAPIS.getRoleById(response.data.user.roleId)

      // Combine user and role information
      return {
        success: true,
        data: {
          ...response.data.user,
          role: roleResponse.data,
        },
      }
    } catch (error) {
      throw error
    }
  }

  // User Services
  async getAllUsers() {
    try {
      const response = await mockAPIS.getAllUsers()

      return response
    } catch (error) {
      throw error
    }
  }

  async getUserById(userId) {
    try {
      const response = await mockAPIS.getUserById(userId)
      return response
    } catch (error) {
      throw error
    }
  }

  async getUsersByClient(clientId) {
    try {
      const response = await mockAPIS.getUsersByClient(clientId)
      return response
    } catch (error) {
      throw error
    }
  }

  // Client Services
  async getAllClients() {
    try {
      const allClient = await mockAPIS.getAllClients()
      const clients = allClient.data

      const clientsWithDetails = await Promise.all(
        clients.map(async (client) => {
          const userDetailsRepo = await mockAPIS.getUserById(client.id)

          const userDetails = userDetailsRepo.data

          return {
            ...client,
            userDetails,
          }
        }),
      )

      const res = {
        data: clientsWithDetails,
      }

      return res
    } catch (error) {
      throw error
    }
  }

  async getClientById(clientId) {
    try {
      const response = await mockAPIS.getClientById(clientId)
      return response
    } catch (error) {
      throw error
    }
  }

  async getDefaultRoute(roleCode) {
    try {
      const response = await mockAPIS.getDefaultRoute(roleCode)
      return response
    } catch (error) {
      throw error
    }
  }

  async getAllVaults(uid) {
    try {

      // const response = await mockAPIS.getAllVaults()
      const alv = await this.processVaultData(uid)

      const response = {
        data: alv.vaults,
        summary: alv.summary,
      }

      return response
    } catch (error) {
      throw error
    }
  }
  async processVaultData(uid) {
    try {
      // Get all vaults
      const allVaults = await this.getAllByVault(uid)

      // Format each vault using Promise.all to wait for all async operations
      const formattedVaults = await Promise.all(
        allVaults.map(async (vault) => {
          // Calculate risk based on utilization ratio
          const calculateRisk = (value, debt) => {

            const totalLimit = Number(value) + Number(debt)
            const utilizationRatio = totalLimit > 0 ? Number(debt) / totalLimit : 0

            if (utilizationRatio < 0.3) return 'Low'
            if (utilizationRatio < 0.7) return 'Average'
            return 'High'
          }
          // Calculate amounts
          const assetValue = Number(vault['property']['properties']['assetValue']) //Number(vault.value)

          const limitAmount = Number(vault['property']['properties']['approvedLoanAmount'])
          const borrowedAmount = Number(vault.debt)
          const availableAmount = Number(vault.value)

          // Get client details
          const clientDetails = await mockAPIS.getClientByToken(vault.tokenAddress, vault.tokenId)

          const clientEndUser = await mockAPIS.getClientEndUserByToken(
            vault.tokenAddress,
            vault.tokenId,
          )
          // Get property details
          const propertyDetailsRespo = await mockAPIS.getPropertiesByTokenId(
            vault.tokenId,
            clientEndUser?.data?.walletAddress
          );

          // get asset type details
          const assetTypeId = propertyDetailsRespo.data?.properties?.assetType;
          const assetTypes = await mockAPIS.getAssetTypes(assetTypeId);

          let propertyDetails ={
            ...propertyDetailsRespo.data,
            assetType:assetTypes.data
          }



          return {
            vaultId: Number(vault.vatId),
            tokenId: Number(vault.tokenId),
            tokenAddress: vault.tokenAddress,
            vault: vault,
            client: clientDetails?.data?.clientName || `Client${vault.tokenId}`,
            value: Number(vault.value).toLocaleString('en-US', {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            }),
            clientDetails: clientDetails?.data || null,
            clientEndUser: clientEndUser?.data || null,
            limitAmount: limitAmount.toLocaleString('en-US'),
            assetValue: assetValue,
            availableAmount: availableAmount.toLocaleString('en-US'),
            borrowedAmount: borrowedAmount.toLocaleString('en-US'),
            risk: calculateRisk(vault.value, vault.debt),
            property: propertyDetails,
          }
        }),
      )

      // Calculate totals
      const totalVault = allVaults.length
      const totalDebt = allVaults.reduce((sum, vault) => sum + Number(vault.debt), 0)
      const totalValue = allVaults.reduce((sum, vault) => sum + Number(vault.value), 0);
      const totalCurrentInterest = allVaults.reduce(
        (sum, vault) => sum + Number(vault.currentInterest || 0),
        0,
      );

      // current time 
      const currentTime = new Date().toLocaleString('en-US', {
        timeZone: 'UTC',
      })

      // avg interest rate
      const avgInterestRate = 5
      return {
        vaults: formattedVaults,
        summary: {
          totalVault,
          totalCurrentInterest: totalCurrentInterest.toLocaleString('en-US', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          }),
          totalDebt: totalDebt.toLocaleString('en-US', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          }),
          totalValue: totalValue.toLocaleString('en-US', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          }),
          avgInterestRate: avgInterestRate, // Assuming a fixed interest rate for simplicity
          totalCredit: (totalDebt + totalValue).toLocaleString('en-US', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          }),
          currentTime: currentTime, // Add current time to summary
        },
      }
    } catch (error) {

      throw error
    }
  }

  async getAllAudit() {
    try {
      const response = await mockAPIS.getAllAudit()
      return response
    } catch (error) {
      throw error
    }
  }

  async getAllTeamsById(id) {
    try {
      const response = await mockAPIS.getAllTeamsById(id)
      const users = response.data // Extract the list of users from response

      // Process each user in the list
      const processedUsers = await Promise.all(
        users.map(async (user) => {
          const { password, twoFactorCode, ...userWithoutSensitiveData } = user // Remove sensitive data
          const roleResponse = await mockAPIS.getRoleById(user.roleId) // Fetch role for each user
          return { ...userWithoutSensitiveData, role: roleResponse.data } // Combine user data with role
        }),
      )

      const res = {
        data: processedUsers, // Return the processed list of users
        status: 200,
      }

      return res
    } catch (error) {
      throw error
    }
  }

  async getAllTeamsByCompanyId(id) {
    try {
      const response = await mockAPIS.getAllTeamsByCompanyId(id)
      const users = response.data // Extract the list of users from response

      // Process each user in the list
      const processedUsers = await Promise.all(
        users.map(async (user) => {
          const { password, twoFactorCode, ...userWithoutSensitiveData } = user // Remove sensitive data
          const roleResponse = await mockAPIS.getRoleById(user.roleId) // Fetch role for each user
          return { ...userWithoutSensitiveData, role: roleResponse.data } // Combine user data with role
        }),
      )

      const res = {
        data: processedUsers, // Return the processed list of users
        status: 200,
      }

      return res
    } catch (error) {
      throw error
    }
  }

  async getPropertyByToken(tokenAddress, tokenId) {
    const response = await mockAPIS.getPropertyByToken(tokenAddress, tokenId)

    return response
  }

  // Helper methods
  isAuthenticated() {
    return sessionStorage.getItem('token') !== null
  }

  getToken() {
    return sessionStorage.getItem('token')
  }

  logout() {
    sessionStorage.removeItem('token')
    // Add any other cleanup needed
  }
  async getAllByVault(id) {

    // get user from local storage
    // const user = JSON.parse(sessionStorage.getItem('selectedUser'))
    const bankContract = await getBankContractAddress(id);//user.bankContract;


    try {
      const responseUsers = await mockAPIS.getAllTeamsById(id)

      const users = responseUsers.data

      // Group users by roleId
      const groupedByRoleId = users.reduce((acc, user) => {
        const roleId = user.roleId;
        if (!roleId) return acc; // skip users without roleId
        if (!acc[roleId]) acc[roleId] = [];
        acc[roleId].push(user);
        return acc;
      }, {});

      const banks = users.filter(u => u.roleId === 3);
      const clients = users.filter(u => u.roleId === 4);


      const allVaultDetails = []

      for (let i = 0; i < banks.length; i++) {
        const bank = banks[i];
        const bankContract = bank.bankContract; // or whatever property holds the contract

        for (let j = 0; j < clients.length; j++) {
          const client = clients[j];

          try {
            const valuts = await getAllByBankContractAndUser(bankContract, client.walletAddress);

            for (let k = 0; k < valuts.length; k++) {
              try {
                const v = await getPropertyByVaultAddressToken(
                  valuts[k],
                  bankContract,
                  client.walletAddress,
                );

                if (v?.activit) {
                  const currentInterest = await getInterestByBank(valuts[k], bankContract);
                  v['currentInterest'] = currentInterest;
                  v['userWallet'] = client.walletAddress;
                  allVaultDetails.push(v);
                }

                if (allVaultDetails.length > 100) break; // optional safety limit
              } catch (innerErr) {
                // handle inner error
              }
            }
          } catch (userErr) {
            // handle user error
          }
        }
      }

      return allVaultDetails
    } catch (err) {

      throw err
    }
  }

  // Get all properties API
  async getAllProperties() {
    try {
      const response = await mockAPIS.getAllProperties()
      return response
    } catch (error) {
      throw error
    }
  }

  // Get all properties API
  async getPropertiesByClient(clientWalletAddress) {
    try {
      const response = await mockAPIS.getPropertiesByClient(clientWalletAddress)
      return response
    } catch (error) {
      throw error
    }
  }

  async getPropertiesByTokenId(tokenId, clientWalletAddress) {
    try {
      const response = await mockAPIS.getPropertiesByTokenId(tokenId, clientWalletAddress)
      return response
    } catch (error) {
      throw error
    }
  }

  async getReportList(walletAddress) {
    try {
      // Step 1: Get the list of document IDs for the creator (user's wallet address)
      const docIds = await getDocumentsByParty(walletAddress)
      // Step 2: Loop through each document ID to get full details
      const reportList = []
      for (let i = 0; i < docIds.length; i++) {
        const docId = docIds[i]

        // Step 3: Fetch the document details using the docId
        const document = await getDocument(docId)

        // Step 4: Add the document details to the report list
        reportList.push(document)
      }
      reportList.reverse()
      return reportList // Return the full list of reports
    } catch (error) {

      throw new Error('Failed to get report list')
    }
  }

  getInterestRate() {
    return {
      value: '5',
      date: format_time(Date.now(), 'DD/MM/YYYY'),
    }
  }
}

// Create a singleton instance
const apiService = new ApiService()
export default apiService
