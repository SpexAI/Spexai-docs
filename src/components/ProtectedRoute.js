import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>; // You can create a proper loading component
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  return children;
}
