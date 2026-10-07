import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { authService } from '../services';
import { TOKEN_KEY } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [initializing, setInitializing] = useState(Boolean(localStorage.getItem(TOKEN_KEY)));

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    setUser(null);
  }, []);

  // Persistent login: restore the session from the saved token
  useEffect(() => {
    if (!localStorage.getItem(TOKEN_KEY)) return;
    authService
      .profile()
      .then(setUser)
      .catch(() => localStorage.removeItem(TOKEN_KEY))
      .finally(() => setInitializing(false));
  }, []);

  useEffect(() => {
    window.addEventListener('nh:unauthorized', logout);
    return () => window.removeEventListener('nh:unauthorized', logout);
  }, [logout]);

  const acceptSession = useCallback(({ token, user: u }) => {
    localStorage.setItem(TOKEN_KEY, token);
    setUser(u);
    return u;
  }, []);

  const login = useCallback(async (credentials) => acceptSession(await authService.login(credentials)), [acceptSession]);
  const register = useCallback(async (details) => acceptSession(await authService.register(details)), [acceptSession]);

  const value = useMemo(
    () => ({ user, initializing, isAdmin: user?.role === 'admin', login, register, logout, setUser }),
    [user, initializing, login, register, logout]
  );
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
};
