import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/AuthComponents/ProtectedRoute";
import AuthRedirectRoute from "./components/AuthComponents/AuthRedirectRoute";
import Home from "./pages/Home";
import Login from "./pages/AuthPages/Login";
import Register from "./pages/AuthPages/Register";
import VerifyEmail from "./pages/AuthPages/VerifyEmail";
import ForgotPassword from "./pages/AuthPages/ForgotPassword";
import ResetPassword from "./pages/AuthPages/ResetPassword";
import Navbar from "./components/Navbar";
import Profile from "./pages/Profile";

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <>
                  <Navbar />
                  <Home />
                </>
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <>
                  <Navbar />
                  <Profile />
                </>
              </ProtectedRoute>
            }
          />
          <Route
            path="/login"
            element={
              <AuthRedirectRoute>
                <Login />
              </AuthRedirectRoute>
            }
          />
          <Route
            path="/register"
            element={
              <AuthRedirectRoute>
                <Register />
              </AuthRedirectRoute>
            }
          />
          <Route
            path="/verify-email"
            element={
              <AuthRedirectRoute>
                <VerifyEmail />
              </AuthRedirectRoute>
            }
          />
          <Route
            path="/forgot-password"
            element={
              <AuthRedirectRoute>
                <ForgotPassword />
              </AuthRedirectRoute>
            }
          />
          <Route
            path="/reset-password/:uidb64/:token"
            element={
              <AuthRedirectRoute>
                <ResetPassword />
              </AuthRedirectRoute>
            }
          />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
