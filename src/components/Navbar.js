import { Link, useNavigate } from "react-router-dom";
import "./Navbar.css";

function Navbar() {
  const navigate = useNavigate();

  const handleLogout = () => {
    navigate("/");
  };

  return (
    <div className="navbar">
      <div className="nav-left">
        <h2 className="nav-logo">SplitPay</h2>
      </div>

      <div className="nav-links">
        <Link to="/dashboard">Dashboard</Link>
        <Link to="/groups">Groups</Link>
        <Link to="/expenses">Expenses</Link>
        <Link to="/profile">Profile</Link>
      </div>

      <div className="nav-right">
        <button onClick={handleLogout} className="logout-btn">
          Logout
        </button>
      </div>
    </div>
  );
}

export default Navbar;