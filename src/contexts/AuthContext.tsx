import React, { createContext, useContext, useState, useEffect } from 'react';
import { Researcher } from '../lib/types';
import { getCurrentUser, login as storageLogin, logout as storageLogout, syncResearchersWithGoogleSheets } from '../lib/storage';

interface AuthContextType {
  user: Researcher | null;
  login: (username: string, pass: string) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<Researcher | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = getCurrentUser();
    if (storedUser) {
      setUser(storedUser);
    }
    setLoading(false);
    
    // Sync users in the background
    syncResearchersWithGoogleSheets();
  }, []);

  const login = async (username: string, pass: string) => {
    let loggedInUser = storageLogin(username, pass);
    if (loggedInUser) {
      setUser(loggedInUser);
      return true;
    }
    
    // If login fails, try syncing with Google Sheets and try again
    await syncResearchersWithGoogleSheets();
    loggedInUser = storageLogin(username, pass);
    if (loggedInUser) {
      setUser(loggedInUser);
      return true;
    }
    
    return false;
  };

  const logout = () => {
    storageLogout();
    setUser(null);
  };

  if (loading) {
    return <div>Carregando...</div>;
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
        isAuthenticated: !!user,
        isAdmin: !!user?.isAdmin,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
