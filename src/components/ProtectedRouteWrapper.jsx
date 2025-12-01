// src/components/ProtectedRouteWrapper.jsx - FINAL VERSION
import { useLocation, Navigate } from "react-router";

const ProtectedRouteWrapper = ({ 
  children, 
  allowedRoles = [],  // Bisa array kosong, 1 role, atau multiple roles
  requireLogin = true
}) => {
  const location = useLocation();
  
  const getUserData = () => {
    const userData = sessionStorage.getItem("user");
    try {
      return userData ? JSON.parse(userData) : null;
    } catch (error) {
      console.error("Error parsing user data:", error);
      return null;
    }
  };

  const isLoggedIn = () => {
    return sessionStorage.getItem("user") !== null;
  };

  const getUserRole = () => {
    const user = getUserData();
    return user?.role || null;
  };
  
  // 1. Cek login
  if (requireLogin && !isLoggedIn()) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // 2. Cek role (jika ada spesifikasi)
  if (allowedRoles.length > 0) {
    const userRole = getUserRole();
    
    // ALLOW MULTIPLE ROLES: cek apakah userRole ada di dalam allowedRoles
    if (!allowedRoles.includes(userRole)) {
      return <Navigate to="/" replace />;
    }
  }

  return children;
};

export default ProtectedRouteWrapper;