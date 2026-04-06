import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const ProtectedRoute = ({ children, role, premium }) => {
  const { user } = useAuth();

  if (!user) return <Navigate to="/" />;

  if (role && user.role !== role) {
    if (user.role === 'admin') {
      return children;
    }
    return <Navigate to="/access-denied" />;
  }

  if (premium && !user.is_premium) {
    // Also allow admin to bypass this check
    if (user.role === 'admin') {
      return children;
    }
    return <Navigate to="/premium-features" />;
  }

  return children;
};

export default ProtectedRoute;