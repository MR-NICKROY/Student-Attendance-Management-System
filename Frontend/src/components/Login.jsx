import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { loginTeacher } from "../api/api";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async () => {
    setError("");
    if (!username.trim() || !password.trim()) {
      setError("Please enter username and password.");
      return;
    }

    try {
      const { data } = await loginTeacher(username.trim(), password.trim());
      login({ _id: data._id, name: data.name }, data.token);
      navigate("/");
    } catch (err) {
      const msg =
        err.response?.data?.message || "Login failed. Please try again.";
      setError(msg);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") handleLogin();
  };

  return (
    <section className="login-screen">
      <div className="card login-card">
        <div className="login-title">
          <h1>
            <i className="fa-solid fa-door-open"></i>SAMS
          </h1>
          <p>Secure Student Attendance Management System</p>
        </div>

        <div className="form-grid" style={{ marginBottom: "0.6rem" }}>
          <div className="form-field">
            <label htmlFor="login-username">
              <i className="fa-solid fa-user"></i> Username
            </label>
            <input
              id="login-username"
              type="text"
              placeholder="e.g. admin"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              onKeyDown={handleKeyDown}
            />
          </div>
          <div className="form-field">
            <label htmlFor="login-password">
              <i className="fa-solid fa-lock"></i> Password
            </label>
            <input
              id="login-password"
              type="password"
              placeholder="e.g. admin123"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={handleKeyDown}
            />
          </div>
        </div>

        <button
          className="btn btn-primary"
          style={{ width: "100%", justifyContent: "center" }}
          onClick={handleLogin}
        >
          <i className="fa-solid fa-right-to-bracket"></i> Sign in
        </button>

        {error && <p className="error-text">{error}</p>}
      </div>
    </section>
  );
}
