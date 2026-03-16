import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { SplitPayProvider } from "./context/SplitPayContext";
import Login from "./components/Login";
import Register from "./components/Register";
import Dashboard from "./pages/Dashboard";
import Groups from "./pages/Groups";
import Expenses from "./pages/Expenses";
import Activity from "./pages/Activity";
import Profile from "./pages/Profile";
import YouOwe from "./pages/YouOwe";
import YouAreOwed from "./pages/YouAreOwed";
import BalanceOverview from "./pages/BalanceOverview";

function App() {
  return (
    <SplitPayProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/groups" element={<Groups />} />
          <Route path="/expenses" element={<Expenses />} />
          <Route path="/activity" element={<Activity />} />
          <Route path="/you-owe" element={<YouOwe />} />
          <Route path="/you-are-owed" element={<YouAreOwed />} />
          <Route path="/balance" element={<BalanceOverview />} />
          <Route path="/profile" element={<Profile />} />
        </Routes>
      </Router>
    </SplitPayProvider>
  );
}

export default App;