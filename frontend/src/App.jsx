import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import ResourceDetail from "./pages/ResourceDetail";
import Account from "./pages/Account";
import AccountSettings from "./pages/AccountSettings";
import VerifyEmail from "./pages/VerifyEmail";
import RaiseComplaint from "./pages/RaiseComplaint";

import Wishlist from "./pages/borrower/Wishlist";
import MyBorrows from "./pages/borrower/MyBorrows";
import MyPurchases from "./pages/borrower/MyPurchases";

import OwnerDashboard from "./pages/owner/OwnerDashboard";
import ResourceForm from "./pages/owner/ResourceForm";
import OwnerRequests from "./pages/owner/OwnerRequests";

import AdminDashboard from "./pages/admin/AdminDashboard";
import ManageUsers from "./pages/admin/ManageUsers";
import ManageComplaints from "./pages/admin/ManageComplaints";

export default function App() {
  return (
    <div className="min-h-screen bg-paper">
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/resources/:id" element={<ResourceDetail />} />

        <Route path="/me" element={<ProtectedRoute roles={["BORROWER", "OWNER", "ADMIN"]}><Account /></ProtectedRoute>} />
        <Route path="/me/settings" element={<ProtectedRoute><AccountSettings /></ProtectedRoute>} />
        <Route path="/verify-email" element={<VerifyEmail />} />
        <Route path="/me/wishlist" element={<ProtectedRoute><Wishlist /></ProtectedRoute>} />
        <Route path="/me/borrows" element={<ProtectedRoute><MyBorrows /></ProtectedRoute>} />
        <Route path="/me/purchases" element={<ProtectedRoute><MyPurchases /></ProtectedRoute>} />
        <Route path="/complaints/new" element={<ProtectedRoute><RaiseComplaint /></ProtectedRoute>} />

        <Route path="/owner" element={<ProtectedRoute roles={["OWNER"]}><OwnerDashboard /></ProtectedRoute>} />
        <Route path="/owner/resources/new" element={<ProtectedRoute roles={["OWNER"]}><ResourceForm /></ProtectedRoute>} />
        <Route path="/owner/resources/:id/edit" element={<ProtectedRoute roles={["OWNER"]}><ResourceForm /></ProtectedRoute>} />
        <Route path="/owner/requests" element={<ProtectedRoute roles={["OWNER"]}><OwnerRequests /></ProtectedRoute>} />

        <Route path="/admin" element={<ProtectedRoute roles={["ADMIN"]}><AdminDashboard /></ProtectedRoute>}>
          <Route path="users" element={<ManageUsers />} />
          <Route path="complaints" element={<ManageComplaints />} />
        </Route>

        <Route path="*" element={<NotFound />} />
      </Routes>
    </div>
  );
}

function NotFound() {
  return (
    <div className="py-24 text-center">
      <p className="font-display text-3xl font-semibold text-ink">404</p>
      <p className="text-ink-soft">This page doesn&rsquo;t exist.</p>
    </div>
  );
}
