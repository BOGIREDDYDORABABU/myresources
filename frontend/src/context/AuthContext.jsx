import { createContext, useContext, useEffect, useState } from "react";
import api from "../api/axios";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem("mr_user");
    return stored ? JSON.parse(stored) : null;
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("mr_token");
    if (!token) {
      setLoading(false);
      return;
    }
    api
      .get("/auth/me")
      .then((res) => {
        setUser(res.data.data);
        localStorage.setItem("mr_user", JSON.stringify(res.data.data));
      })
      .catch(() => {
        localStorage.removeItem("mr_token");
        localStorage.removeItem("mr_user");
        setUser(null);
      })
      .finally(() => setLoading(false));
  }, []);

  async function login(identifier, password) {
    const res = await api.post("/auth/login", { identifier, password });
    const { token, user } = res.data.data;
    localStorage.setItem("mr_token", token);
    localStorage.setItem("mr_user", JSON.stringify(user));
    setUser(user);
    return user;
  }

  async function register(payload) {
    const res = await api.post("/auth/register", payload);
    const { token, user } = res.data.data;
    localStorage.setItem("mr_token", token);
    localStorage.setItem("mr_user", JSON.stringify(user));
    setUser(user);
    return user;
  }

  function logout() {
    localStorage.removeItem("mr_token");
    localStorage.removeItem("mr_user");
    setUser(null);
  }

  function updateUser(updated) {
    localStorage.setItem("mr_user", JSON.stringify(updated));
    setUser(updated);
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
