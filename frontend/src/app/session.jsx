import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { api } from "../api/client.js";

const SessionCtx = createContext(null);
const tokenKey = "waihuli_token";
const userKey = "waihuli_user";

export function SessionProvider({ children }) {
  const [token, setToken] = useState(localStorage.getItem(tokenKey) || "");
  const [user, setUser] = useState(() => {
    const raw = localStorage.getItem(userKey);
    return raw ? JSON.parse(raw) : null;
  });
  const [booting, setBooting] = useState(Boolean(token));

  useEffect(() => {
    if (!token) {
      setBooting(false);
      return;
    }

    let alive = true;
    api
      .get("/auth/me")
      .then(({ data }) => {
        if (!alive) {
          return;
        }
        setUser(data.user);
        localStorage.setItem(userKey, JSON.stringify(data.user));
      })
      .catch(() => {
        if (!alive) {
          return;
        }
        localStorage.removeItem(tokenKey);
        localStorage.removeItem(userKey);
        setToken("");
        setUser(null);
      })
      .finally(() => {
        if (alive) {
          setBooting(false);
        }
      });

    return () => {
      alive = false;
    };
  }, [token]);

  const login = (nextToken, nextUser) => {
    localStorage.setItem(tokenKey, nextToken);
    localStorage.setItem(userKey, JSON.stringify(nextUser));
    setToken(nextToken);
    setUser(nextUser);
  };

  const logout = () => {
    localStorage.removeItem(tokenKey);
    localStorage.removeItem(userKey);
    setToken("");
    setUser(null);
  };

  const value = useMemo(
    () => ({
      token,
      user,
      booting,
      login,
      logout,
      setUser
    }),
    [booting, token, user]
  );

  return <SessionCtx.Provider value={value}>{children}</SessionCtx.Provider>;
}

export const useSession = () => useContext(SessionCtx);
