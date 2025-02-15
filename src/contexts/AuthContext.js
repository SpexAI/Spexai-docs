import { useNavigate } from "react-router-dom";

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const logout = async () => {
    try {
      await signOut(auth);
      setUser(null);
      // Redirect to home or public route after logout
      navigate("/");
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  // ... rest of the existing code ...
}
