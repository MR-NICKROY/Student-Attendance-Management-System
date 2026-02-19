import { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext(null);

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }) {
  const [teacher, setTeacher] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // Restore session from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem("sams_auth");
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed.token && parsed.teacher) {
          setToken(parsed.token);
          setTeacher(parsed.teacher);
        }
      }
    } catch (e) {
      console.warn("Failed to restore auth session", e);
    }
    setLoading(false);
  }, []);

  const login = (teacherData, jwtToken) => {
    setTeacher(teacherData);
    setToken(jwtToken);
    localStorage.setItem(
      "sams_auth",
      JSON.stringify({ teacher: teacherData, token: jwtToken })
    );
  };

  const logout = () => {
    setTeacher(null);
    setToken(null);
    localStorage.removeItem("sams_auth");
  };

  return (
    <AuthContext.Provider
      value={{ teacher, token, login, logout, isAuthenticated: !!token, loading }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export default AuthContext;
