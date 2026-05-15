import { Navigate } from "react-router-dom";
import { useAuth } from "../lib/AuthContext";
import { hasOnboarded } from "../pages/Onboarding";

/**
 * Wrap the public app routes. If the visitor isn't signed in AND hasn't
 * completed onboarding, send them to /welcome first.
 */
export default function OnboardingGate({ children }) {
  const { session, loading } = useAuth();
  if (loading) return null;
  if (!session && !hasOnboarded()) {
    return <Navigate to="/welcome" replace />;
  }
  return children;
}
