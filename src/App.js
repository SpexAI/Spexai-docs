// src/App.js
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "./context/ThemeContext";
import { AuthProvider } from "./context/AuthContext";
import { GlobalStyle } from "./styles/GlobalStyles";
import Layout from "./components/Layout";
import DocContent from "./components/DocContent";
import Login from "./components/Login";
import Admin from "./components/Admin";
import AdminRoute from "./components/AdminRoute";
import ProtectedRoute from "./components/ProtectedRoute";
import { HelmetProvider } from "react-helmet-async";
import Welcome from "./components/Welcome";

const helmetContext = {};

function App() {
  return (
    <Router>
      <HelmetProvider context={helmetContext}>
        <ThemeProvider>
          <GlobalStyle />
          <AuthProvider>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route
                path="/admin"
                element={
                  <AdminRoute>
                    <Admin />
                  </AdminRoute>
                }
              />
              <Route path="/*" element={<Layout />}>
                <Route index element={<Welcome />} />
                <Route path="docs/:docId" element={<DocContent />} />
                <Route
                  path="protected/docs/:docId"
                  element={
                    <ProtectedRoute>
                      <DocContent />
                    </ProtectedRoute>
                  }
                />
              </Route>
            </Routes>
          </AuthProvider>
        </ThemeProvider>
      </HelmetProvider>
    </Router>
  );
}

export default App;
