import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

export default function AppLayout({ children }) {
  const { teacher, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <section className="app-shell">
      <header className="app-header">
        <div className="brand">
          <div className="brand-logo">
            <i className="fa-solid fa-user-check"></i>
          </div>
          <div className="brand-text">
            <h1>
              <i className="fa-solid fa-clipboard-list"></i> Student Attendance
              System
            </h1>
            <p>Centralized Attendance Portal</p>
          </div>
        </div>
        <div className="user-info">
          <span className="pill">
            <span className="dot"></span>
            {teacher?.name || "Teacher"} Logged In
          </span>
          <button className="btn btn-outline btn-small" onClick={handleLogout}>
            <i className="fa-solid fa-right-from-bracket"></i> Logout
          </button>
        </div>
      </header>

      {children}
    </section>
  );
}
