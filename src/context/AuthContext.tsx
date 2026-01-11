import React, { useCallback, useRef, useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

interface User {
  id: string;
  email: string | undefined;
  role: string;
  legacyRole: string;
  clientId: number;
  profilePhotoUrl?: string; // إضافة رابط الصورة للمستخدم
}
interface Role {
  id: number;
  name: string;
  roleKey: string;
  type: string;
  baseRoleKey: string;
  parentId: number | null;
  clientId: number | null;
}
interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>; // وظيفة لتحديث بيانات المستخدم فوراً
  roles: Role[]
}

const AuthContext = React.createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [roles, setRoles] = useState<Role[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('token'));
  const [isLoading, setIsLoading] = useState(true);

  const effectRan = useRef(false);

  const fetchUser = useCallback(async (currentToken: string) => {
    try {
      axios.defaults.headers.common['Authorization'] = `Bearer ${currentToken}`;
      const { data } = await axios.get(`${import.meta.env.VITE_BASE_URL}/api/users/me?t=${new Date().getTime()}`);
      console.log('User data from API:', data);
      setUser(data);
    } catch (error) {
      console.error("Failed to fetch user, logging out.", error);
      localStorage.removeItem('token');
      setToken(null);
      setUser(null);
      delete axios.defaults.headers.common['Authorization'];
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchRoles = useCallback(async () => {
    if (roles.length > 0) return;
    try {
      console.log('Fetching roles from:', `${import.meta.env.VITE_BASE_URL}/api/roles`);
      const { data } = await axios.get(`${import.meta.env.VITE_BASE_URL}/api/roles`);
      console.log('Roles data received from API:', data);

      // Order requested by user
      const roleOrder = [
        'decision_maker',
        'advisor',
        'admin',
        'basic_admin',
        'agent',
        'finance',
        'limited_access_user'
      ];

      const sortedRoles = [...data].sort((a, b) => {
        const indexA = roleOrder.indexOf(a.roleKey);
        const indexB = roleOrder.indexOf(b.roleKey);

        // Handle cases where roleKey might not be in the list (if any new ones are added)
        if (indexA === -1) return 1;
        if (indexB === -1) return -1;

        return indexA - indexB;
      });

      setRoles(sortedRoles);
    } catch (error) {
      console.error("Failed to fetch roles", error);
    }
  }, [roles.length]);

  useEffect(() => {
    if (token) {
      console.log('AuthContext: Token found, fetching user and roles...');
      fetchUser(token);
      fetchRoles();
    } else {
      console.log('AuthContext: No token, skipping fetch');
      setIsLoading(false);
    }
  }, [token, fetchUser, fetchRoles]);

  const login = async (email: string, password: string) => {
    const response = await axios.post(`${import.meta.env.VITE_BASE_URL}/api/auth/login`, {
      email,
      password,
    });

    const { token: newToken } = response.data;

    if (newToken) {
      // الخطوة 1: تخزين التوكن الجديد
      localStorage.setItem('token', newToken);

      setToken(newToken);

      await fetchUser(newToken);
    }
  };

  const logout = async () => {
    try {
      if (localStorage.getItem('token')) {
        await axios.post(`${import.meta.env.VITE_BASE_URL}/api/auth/logout`);
      }
    } catch (error) {
      console.error("Server logout failed, proceeding with client-side cleanup.", error);
    } finally {
      localStorage.removeItem('token');
      setToken(null);
      setUser(null);
      delete axios.defaults.headers.common['Authorization'];
    }
  };

  const refreshUser = useCallback(async () => {
    if (token) {
      await fetchUser(token);
    }
  }, [token, fetchUser]);

  return (
    <AuthContext.Provider value={{ user, token, isLoading, login, logout, refreshUser, roles }}>
      {!isLoading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = React.useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const useLogout = () => {
  const navigate = useNavigate();
  const { logout: contextLogout } = useAuth();

  const logoutAndRedirect = async () => {
    await contextLogout();
    navigate('/login');
  };

  return logoutAndRedirect;
}