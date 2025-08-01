// @ts-nocheck
import RouteGuard from './components/RouteGuard'
import { ROLE_IDS } from './config/roles'
import BankPropertySelection from './pages/admin/BankPropertySelection'
import Auth from './pages/auth/'
import Demo from './pages/demo'
import OtherGov from './pages/gov/OtherGov'
import Proposal from './pages/gov/Proposal'
import StartGov from './pages/gov/StartGov'
import Home from './pages/home/Home'
import BankHistory from './pages/home/components/BankHistory'
import BankReports from './pages/home/components/BankReports'
import PropertyHistory from './pages/home/components/History'
import PropertyDashboard from './pages/home/components/PropertyDashboard'
import PropertySelection from './pages/home/components/PropertySelection'
import SupportScreen from './pages/home/components/SupportScreen'
import Property from './pages/property/'
import Reward from './pages/reward/Reward'
// ClientHome Admins
import ClientHome from './pages/roles/client/ClientHome'
import BankDashboard from './pages/roles/client/dashboard/Dashboard'
// ClientEndUserHome Admins
import ClientEndUserHome from './pages/roles/clientEndUser/ClientEndUserHome'
import ClintEndUserDashboard from './pages/roles/clientEndUser/dashboard/Dashboard'
import TransactionHistory from './pages/roles/clientEndUser/transaction/TransactionHistory'
//FCA
import FcaHome from './pages/roles/fca/FcaHome'
import FCADashboard from './pages/roles/fca/reports/FCADashboard'
import FCAReports from './pages/roles/fca/reports/FCAReports'
// Super Admins
import SuperAdminHome from './pages/roles/superadmin/SuperAdminHome'
import SuperAdminAudit from './pages/roles/superadmin/audit'
import SuperAdminClients from './pages/roles/superadmin/clients'
import SuperAdminDashboard from './pages/roles/superadmin/dashboard/Dashboard'
import SuperAdminReports from './pages/roles/superadmin/reports'
import SuperAdminTeams from './pages/roles/superadmin/teams'
import SuperAdminVaults from './pages/roles/superadmin/vaults'
import VaultDashboard from './pages/roles/superadmin/vaults/VaultDashboard'
import VaultHistory from './pages/roles/superadmin/vaults/VaultHistory'
import Stake from './pages/stake/Stake'
import Users from './pages/users/'
import CreateVault from './pages/vault/CreateVault'
import Vault from './pages/vault/Vault'
import { useEffect } from 'react'
import { Navigate, Route, Routes, useLocation } from 'react-router-dom'

export default function Router() {
  const { pathname } = useLocation()
  useEffect(() => {
    setTimeout(() => {
      window.scrollTo(0, 0)
    }, 0)
  }, [pathname])
  return (
    <Routes>
      <Route path="/home" element={<Navigate to="/home/dashboard" />}></Route>

      {/* <Route path="/users" element={<Users />}></Route> */}
      <Route path="/auth" element={<Auth />}></Route>

      <Route path="/demo" element={<Demo />}></Route>
      <Route
        path="/property"
        element={
          <RouteGuard allowedRoles={[ROLE_IDS.CLIENT_END_USER]}>
            <Property />
          </RouteGuard>
        }
      ></Route>
      <Route path="/vault" element={<Vault />}></Route>
      <Route path="/createVault" element={<CreateVault />}></Route>
      <Route path="/stake" element={<Stake />}></Route>
      <Route path="/proposal" element={<Proposal />}></Route>
      <Route path="/startGov" element={<StartGov />}></Route>
      <Route path="/otherGOv" element={<OtherGov />}></Route>
      <Route path="/reward" element={<Reward />}></Route>

      <Route
        path="vault/dashboard"
        element={
          <RouteGuard allowedRoles={[ROLE_IDS.CLIENT_END_USER]}>
            <ClientEndUserHome>
              <PropertyDashboard></PropertyDashboard>
            </ClientEndUserHome>
          </RouteGuard>
        }
      />
      <Route
        path="home/support"
        element={
          <RouteGuard allowedRoles={[ROLE_IDS.CLIENT_END_USER]}>
            <ClientEndUserHome>
              <SupportScreen></SupportScreen>
            </ClientEndUserHome>
          </RouteGuard>
        }
      />
      <Route
        path="vault/support"
        element={
          <RouteGuard allowedRoles={[ROLE_IDS.CLIENT_END_USER]}>
            <ClientEndUserHome>
              <SupportScreen></SupportScreen>
            </ClientEndUserHome>
          </RouteGuard>
        }
      />
      <Route
        path="/support"
        element={
          <RouteGuard allowedRoles={[ROLE_IDS.CLIENT_END_USER]}>
            <ClientEndUserHome>
              <SupportScreen></SupportScreen>
            </ClientEndUserHome>
          </RouteGuard>
        }
      />

      <Route
        path="/vault/history"
        element={
          <RouteGuard allowedRoles={[ROLE_IDS.CLIENT_END_USER]}>
            <ClientEndUserHome>
              <PropertyHistory></PropertyHistory>
            </ClientEndUserHome>
          </RouteGuard>
        }
      />
      <Route
        path="home/transactionHistory"
        element={
          <RouteGuard allowedRoles={[ROLE_IDS.CLIENT_END_USER]}>
            <ClientEndUserHome>
              <TransactionHistory></TransactionHistory>
            </ClientEndUserHome>
          </RouteGuard>
        }
      />
      {/* <Route
        path="home/dashboard"
        element={
          <ClientEndUserHome>
            <ClintEndUserDashboard></ClintEndUserDashboard>
          </ClientEndUserHome>
        }
      /> */}
      <Route
        path="home/dashboard"
        element={
          <RouteGuard allowedRoles={[ROLE_IDS.CLIENT_END_USER]}>
            <ClientEndUserHome>
              <PropertySelection></PropertySelection>
            </ClientEndUserHome>
          </RouteGuard>
        }
      />
      <Route
        path="home/bank/dashboard"
        element={
          <RouteGuard allowedRoles={[ROLE_IDS.CLIENT_ADMIN]}>
            <ClientHome>
              <BankDashboard></BankDashboard>
            </ClientHome>
          </RouteGuard>
        }
      />

      <Route
        path="home/bank/vault/dashboard"
        element={
          <RouteGuard allowedRoles={[ROLE_IDS.CLIENT_ADMIN]}>
            <ClientHome>
              <VaultDashboard />
              <VaultHistory />
            </ClientHome>
          </RouteGuard>
        }
      />

      <Route
        path="home/bank/teams"
        element={
          <RouteGuard allowedRoles={[ROLE_IDS.CLIENT_ADMIN]}>
            <ClientHome>
              <SuperAdminTeams></SuperAdminTeams>
            </ClientHome>
          </RouteGuard>
        }
      />

      <Route
        path="home/bank/customers"
        element={
          <RouteGuard allowedRoles={[ROLE_IDS.CLIENT_ADMIN]}>
            <ClientHome>
              <SuperAdminTeams></SuperAdminTeams>
            </ClientHome>
          </RouteGuard>
        }
      />
      <Route
        path="home/bank/properties"
        element={
          <RouteGuard allowedRoles={[ROLE_IDS.CLIENT_ADMIN]}>
            <ClientHome>
              <BankPropertySelection></BankPropertySelection>
            </ClientHome>
          </RouteGuard>
        }
      />
      <Route
        path="home/bank/vault"
        element={
          <RouteGuard allowedRoles={[ROLE_IDS.CLIENT_ADMIN]}>
            <ClientHome>
              <SuperAdminVaults></SuperAdminVaults>
            </ClientHome>
          </RouteGuard>
        }
      />
      <Route
        path="home/bank/reports"
        element={
          <RouteGuard allowedRoles={[ROLE_IDS.CLIENT_ADMIN]}>
            <ClientHome>
              <BankReports></BankReports>
            </ClientHome>
          </RouteGuard>
        }
      />
      <Route
        path="home/bank/Transactions"
        element={
          <RouteGuard allowedRoles={[ROLE_IDS.CLIENT_ADMIN]}>
            <ClientHome>
              <BankHistory></BankHistory>
            </ClientHome>
          </RouteGuard>
        }
      />

      <Route
        path="home/bank/audit"
        element={
          <RouteGuard allowedRoles={[ROLE_IDS.CLIENT_ADMIN]}>
            <ClientHome>
              <SuperAdminAudit></SuperAdminAudit>
            </ClientHome>
          </RouteGuard>
        }
      />

      <Route
        path="home/bank/FCAreports"
        element={
          <RouteGuard allowedRoles={[ROLE_IDS.FCA_VIEW]}>
            <ClientHome>
              <FCADashboard></FCADashboard>
            </ClientHome>
          </RouteGuard>
        }
      />

      <Route
        path="home/bank/FCAReports/reports"
        element={
          <RouteGuard allowedRoles={[ROLE_IDS.FCA_VIEW]}>
            <ClientHome>
              <FCAReports></FCAReports>
            </ClientHome>
          </RouteGuard>
        }
      />

      {/* Super Admin Pages Start */}
      {/* <Route
        path="home/superadmin/dashboard"
        element={
          <SuperAdminHome>
            <BankDashboard></BankDashboard>
          </SuperAdminHome>
        }
      /> */}
      <Route
        path="home/superadmin/dashboard"
        element={
          <RouteGuard allowedRoles={[ROLE_IDS.SUPER_ADMIN]}>
            <SuperAdminHome>
              <SuperAdminClients></SuperAdminClients>
            </SuperAdminHome>
          </RouteGuard>
        }
      />

      <Route
        path="home/superadmin/clients"
        element={
          <RouteGuard allowedRoles={[ROLE_IDS.SUPER_ADMIN]}>
            <SuperAdminHome>
              <SuperAdminClients></SuperAdminClients>
            </SuperAdminHome>
          </RouteGuard>
        }
      />

      <Route
        path="home/superadmin/vaults"
        element={
          <RouteGuard allowedRoles={[ROLE_IDS.SUPER_ADMIN]}>
            <SuperAdminHome>
              <SuperAdminVaults></SuperAdminVaults>
            </SuperAdminHome>
          </RouteGuard>
        }
      />
      <Route
        path="home/superadmin/reports"
        element={
          <RouteGuard allowedRoles={[ROLE_IDS.SUPER_ADMIN]}>
            <SuperAdminHome>
              <SuperAdminReports></SuperAdminReports>
            </SuperAdminHome>
          </RouteGuard>
        }
      />

      <Route
        path="home/superadmin/transactions"
        element={
          <RouteGuard allowedRoles={[ROLE_IDS.SUPER_ADMIN]}>
            <SuperAdminHome>
              <BankHistory></BankHistory>
            </SuperAdminHome>
          </RouteGuard>
        }
      />
      <Route
        path="home/superadmin/FCAreports"
        element={
          <RouteGuard allowedRoles={[ROLE_IDS.SUPER_ADMIN]}>
            <SuperAdminHome>
              <FCADashboard></FCADashboard>
            </SuperAdminHome>
          </RouteGuard>
        }
      />

      <Route
        path="home/superadmin/FCAReports/reports"
        element={
          <RouteGuard allowedRoles={[ROLE_IDS.SUPER_ADMIN]}>
            <SuperAdminHome>
              <FCAReports></FCAReports>
            </SuperAdminHome>
          </RouteGuard>
        }
      />

      {/* FCA Routes  */}

      <Route
        path="home/view/dashboard"
        element={
          <RouteGuard allowedRoles={[ROLE_IDS.FCA_VIEW]}>
            <FcaHome>
              <SuperAdminClients></SuperAdminClients>
            </FcaHome>
          </RouteGuard>
        }
      />

      <Route
        path="home/view/vaults"
        element={
          <RouteGuard allowedRoles={[ROLE_IDS.FCA_VIEW]}>
            <FcaHome>
              <SuperAdminVaults></SuperAdminVaults>
            </FcaHome>
          </RouteGuard>
        }
      />

      <Route
        path="home/view/FCAreports"
        element={
          <RouteGuard allowedRoles={[ROLE_IDS.FCA_VIEW]}>
            <FcaHome>
              <FCADashboard></FCADashboard>
            </FcaHome>
          </RouteGuard>
        }
      />

      <Route
        path="home/view/FCAReports/reports"
        element={
          <RouteGuard allowedRoles={[ROLE_IDS.FCA_VIEW]}>
            <FcaHome>
              <FCAReports></FCAReports>
            </FcaHome>
          </RouteGuard>
        }
      />
      <Route
        path="home/superadmin/vault/dashboard"
        element={
          <RouteGuard allowedRoles={[ROLE_IDS.SUPER_ADMIN]}>
            <SuperAdminHome>
              <VaultDashboard></VaultDashboard>
            </SuperAdminHome>
          </RouteGuard>
        }
      />

      <Route
        path="home/superadmin/teams"
        element={
          <RouteGuard allowedRoles={[ROLE_IDS.SUPER_ADMIN]}>
            <SuperAdminHome>
              <SuperAdminTeams></SuperAdminTeams>
            </SuperAdminHome>
          </RouteGuard>
        }
      />

      <Route
        path="home/superadmin/audit"
        element={
          <RouteGuard allowedRoles={[ROLE_IDS.SUPER_ADMIN]}>
            <SuperAdminHome>
              <SuperAdminAudit></SuperAdminAudit>
            </SuperAdminHome>
          </RouteGuard>
        }
      />

      {/* Super Admin Pages END  */}

      <Route path="*" element={<Navigate to="/auth" />}></Route>
    </Routes>
  )
}
