import { NavLink, useNavigate } from "react-router-dom";

function Navbar() {
  const navigate = useNavigate();

  function handleLogout() {
    localStorage.removeItem("splitpayUser");
    navigate("/login");
  }

  return (
    <header className="navbar">
      <div className="navbar__brand-wrap">
        <div className="navbar__brand">SplitPay</div>
        <p className="navbar__sub">Shared spending made clear</p>
      </div>
      <nav className="navbar__links">
        <NavLink to="/dashboard">Dashboard</NavLink>
        <NavLink to="/groups">Groups</NavLink>
        <NavLink to="/expenses">Expenses</NavLink>
        <NavLink to="/activity">Activity</NavLink>
        <NavLink to="/profile">Profile</NavLink>
        <NavLink to="/balances">Balances</NavLink>
      </nav>
      <button className="button button--secondary" type="button" onClick={handleLogout}>
        Logout
      </button>
    </header>
  );
}

export default Navbar;
