import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { useAuth } from "./lib/AuthContext";
import { hasOnboarded } from "./pages/Onboarding";
import Layout from "./components/Layout";
import ProtectedRoute from "./components/ProtectedRoute";
import Feed from "./pages/Feed";
import Upload from "./pages/Upload";
import Leaderboard from "./pages/Leaderboard";
import Profile from "./pages/Profile";
import Explore from "./pages/Explore";
import Notifications from "./pages/Notifications";
import Messages from "./pages/Messages";
import Challenges from "./pages/Challenges";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Onboarding from "./pages/Onboarding";

function RootRedirect() {
  const { session, loading } = useAuth();
  const { pathname } = useLocation();
  if (loading) return null;
  // First-visit gate: not signed in + hasn't completed onboarding → /welcome
  if (!session && !hasOnboarded() && pathname === "/") {
    return <Navigate to="/welcome" replace />;
  }
  return <Feed />;
}

export default function App() {
  return (
    <Routes>
      <Route path="/welcome" element={<Onboarding />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />

      <Route element={<Layout />}>
        <Route index element={<RootRedirect />} />
        <Route path="explore" element={<Explore />} />
        <Route path="leaderboard" element={<Leaderboard />} />
        <Route path="challenges" element={<Challenges />} />
        <Route path="u/:username" element={<Profile />} />
        <Route
          path="upload"
          element={
            <ProtectedRoute>
              <Upload />
            </ProtectedRoute>
          }
        />
        <Route
          path="profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />
        <Route path="notifications" element={<Notifications />} />
        <Route
          path="messages"
          element={
            <ProtectedRoute>
              <Messages />
            </ProtectedRoute>
          }
        />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
