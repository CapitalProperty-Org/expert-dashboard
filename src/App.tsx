import { Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import ProtectedRoute from './components/ProtectedRoute';

import PerformanceOverview from "./pages/PerformanceOverview";
import LeadInsights from "./pages/LeadInsights";
import DashboardLayout from "./layouts/DashboardLayout";
import AgentInsights from "./pages/AgentInsights";
import ListingsManagement from "./pages/ListingsManagement";
import ListingsArchive from "./pages/ListingsArchive";
import CtsListings from "./pages/CtsListings";
import ListingsSettings from "./pages/ListingsSettings";
import LeadsManagement from "./pages/LeadsManagement";
import LeadsRegularManagement from "./pages/LeadsRegularManagement";
import CommunityTopSpot from "./pages/CommunityTopSpot";
import Contracts from "./pages/Contracts";
import Payments from "./pages/Payments";
import CreditUsageHistory from "./pages/CreditUsageHistory";
import CreditReturns from "./pages/CreditReturns";
import Users from "./pages/Users";
import Transactions from "./pages/Transactions";
import RolesAndPermissions from "./pages/RolesAndPermissions";
import Security from "./pages/Security";
import Notifications from "./pages/Notifications";
import AddListingPage from "./pages/AddListingPage";
import NewLead from "./pages/NewLead";
import ClaimTransaction from "./pages/ClaimTransaction";
import RequestStatement from "./pages/RequestStatement";
import AddNewUser from "./pages/AddNewUser";
import NewCustomRole from "./pages/NewCustomRole";
import LoginPage from "./pages/LoginPage";
import UserDetails from "./pages/UserDetails";
import CompanyProfile from "./pages/CompanyProfile";
import { ListingsProvider } from "./context/ListingsContext";
import { CreditsProvider } from "./context/CreditsContext";
import LeadDetails from "./pages/LeadDetails";

const AppRoutes = () => {
  const { token, isLoading } = useAuth();

  if (isLoading) {
    return <div>Loading Application...</div>;
  }

  return (
    <Routes>
      <Route path="/login" element={token ? <Navigate to="/" /> : <LoginPage />} />
      <Route path="/add-listing" element={<AddListingPage />} />
      
      <Route element={<ProtectedRoute />}>
        <Route path="/" element={<DashboardLayout />}>
          <Route index element={<PerformanceOverview />} />
          <Route path="lead-insights" element={<LeadInsights />} />
          <Route path="agent-insights" element={<AgentInsights />} />
          <Route path="listings-management" element={
    <ListingsProvider>
        <ListingsManagement />
    </ListingsProvider>
} />

          <Route path="listings-archive" element={
    <ListingsProvider>
        <ListingsArchive />
    </ListingsProvider>
} />
          <Route path="listings-archive" element={<ListingsArchive />} />
          <Route path="cts-listings" element={<CtsListings />} />
          <Route path="listings-settings" element={<ListingsSettings />} />
          <Route path="leads-management" element={<LeadsManagement />} />
          <Route path="new-lead" element={<NewLead />} />
          <Route path="leads/:id" element={<LeadDetails />} />
          <Route path="leads-regular-management" element={<LeadsRegularManagement />} />
          <Route path="community-top-spot" element={<CommunityTopSpot />} />
          <Route path="contracts" element={<Contracts />} />
          <Route path="payments" element={<Payments />} />
          <Route path="transactions" element={<Transactions />} />
          <Route path="claim-transaction" element={<ClaimTransaction />} />
          <Route path="credit-usage-history" element={<CreditsProvider><CreditUsageHistory /></CreditsProvider>} />
          <Route path="credit-returns" element={<CreditReturns />} />
          <Route path="request-statement" element={<RequestStatement />} />
          <Route path="users" element={<Users />} />
          <Route path="add-new-user" element={<AddNewUser />} />
          <Route path="users/:id" element={<UserDetails />} />
          <Route path="company-profile" element={<CompanyProfile />} /> 
          <Route path="add-new-custom-role" element={<NewCustomRole />} />
          <Route path="roles-permissions" element={<RolesAndPermissions />} />
          <Route path="security" element={<Security />} />
          <Route path="notifications" element={<Notifications />} />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}

function App() {
  return (
   <AuthProvider>
        <AppRoutes />
    </AuthProvider>
  );
}

export default App;