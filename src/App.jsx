import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";
import AddExpensePage from "./pages/AddExpensePage";
import ActivityPage from "./pages/ActivityPage";
import BalancesPage from "./pages/BalancesPage";
import DashboardPage from "./pages/DashboardPage";
import GroupDetailsPage from "./pages/GroupDetailsPage";
import GroupsPage from "./pages/GroupsPage";
import LoginPage from "./pages/LoginPage";
import ProfilePage from "./pages/ProfilePage";
import RegisterPage from "./pages/RegisterPage";

function App() {
  const location = useLocation();
  const currentUser = JSON.parse(localStorage.getItem("splitpayUser"));
  const isAuthRoute = location.pathname === "/login" || location.pathname === "/register";
  const showAuthedChrome = Boolean(currentUser) && !isAuthRoute;
  const mainClassName = [
    "page-container",
    showAuthedChrome ? "page-container--authed" : "",
    isAuthRoute ? "page-container--auth" : ""
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={`app-shell ${showAuthedChrome ? "app-shell--authed" : ""}`}>
      {showAuthedChrome ? <Navbar /> : null}
      <main className={mainClassName}>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/groups"
            element={
              <ProtectedRoute>
                <GroupsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/groups/:groupId"
            element={
              <ProtectedRoute>
                <GroupDetailsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/expenses/add"
            element={
              <ProtectedRoute>
                <AddExpensePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/expenses"
            element={
              <ProtectedRoute>
                <AddExpensePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/balances"
            element={
              <ProtectedRoute>
                <BalancesPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/activity"
            element={
              <ProtectedRoute>
                <ActivityPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/"
            element={<Navigate to={currentUser ? "/dashboard" : "/login"} replace />}
          />
          <Route
            path="*"
            element={<Navigate to={currentUser ? "/dashboard" : "/login"} replace />}
          />
        </Routes>
      </main>
    </div>
  );
}

export default App;
