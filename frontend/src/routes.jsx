import { Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Home from "./pages/Home";
import VehicleDetails from "./pages/VehicleDetails";
import MaintenanceSuggestions from "./pages/MaintenanceSuggestions";
import AdminDashboard from "./pages/AdminDashboard";
import UserProfile from "./pages/UserProfile";
import Feedback from "./pages/Feedback";
import UserHistory from "./pages/UserHistory";
import NotAuthorized from "./pages/NotAuthorized";
import AccessDenied from "./pages/AccessDenied";
import PremiumFeatures from "./pages/PremiumFeatures";
import GarageMapPage from "./pages/GarageMapPage";
import ProtectedRoute from "./components/ProtectedRoute";

const RoutesConfig = () => (
  <Routes>
    <Route path="/" element={<Login />} />
    <Route path="/home" element={<Home />} />

    <Route
      path="/vehicle"
      element={
        <ProtectedRoute role="user">
          <VehicleDetails />
        </ProtectedRoute>
      }
    />

    <Route
      path="/maintenance"
      element={
        <ProtectedRoute role="user">
          <MaintenanceSuggestions />
        </ProtectedRoute>
      }
    />

    <Route
      path="/feedback"
      element={
        <ProtectedRoute role="user">
          <Feedback />
        </ProtectedRoute>
      }
    />

    <Route
      path="/history"
      element={
        <ProtectedRoute role="user">
          <UserHistory />
        </ProtectedRoute>
      }
    />

    <Route
      path="/premium-features"
      element={
        <ProtectedRoute role="user">
          <PremiumFeatures />
        </ProtectedRoute>
      }
    />

    <Route
      path="/garage-map"
      element={
        <ProtectedRoute role="user" premium>
          <GarageMapPage />
        </ProtectedRoute>
      }
    />

    <Route
      path="/admin"
      element={
        <ProtectedRoute role="admin">
          <AdminDashboard />
        </ProtectedRoute>
      }
    />

    <Route
      path="/profile"
      element={
        <ProtectedRoute role="user">
          <UserProfile />
        </ProtectedRoute>
      }
    />

    <Route path="/unauthorized" element={<NotAuthorized />} />
    <Route path="/access-denied" element={<AccessDenied />} />
  </Routes>
);

export default RoutesConfig;