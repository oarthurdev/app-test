import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface User {
  id: number;
  name: string;
  email: string;
  phone: string;
  role: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  guestClientId: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  setGuestId: (id: string) => Promise<void>;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:5000';
const GUEST_CLIENT_ID_KEY = 'guestClientId'; // Define a constant for the key

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [guestClientId, setGuestClientId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStoredAuth();
  }, []);

  const loadStoredAuth = async () => {
    try {
      const [storedToken, storedGuestId] = await Promise.all([
        AsyncStorage.getItem('token'),
        AsyncStorage.getItem(GUEST_CLIENT_ID_KEY) // Use the constant here
      ]);

      if (storedToken) {
        const response = await fetch(`${API_URL}/api/auth/me`, {
          headers: {
            Authorization: `Bearer ${storedToken}`,
          },
        });

        if (response.ok) {
          const userData = await response.json();
          setUser(userData);
          setToken(storedToken);
        } else {
          await AsyncStorage.removeItem('token');
        }
      }

      if (storedGuestId) {
        setGuestClientId(storedGuestId);
        console.log('Guest Client ID carregado:', storedGuestId);
      }
    } catch (error) {
      console.error('Erro ao carregar autenticação:', error);
    } finally {
      setLoading(false);
    }
  };

  const setGuestId = async (id: string) => {
    try {
      // Só atualiza se não existir um ID já salvo
      const existingId = await AsyncStorage.getItem(GUEST_CLIENT_ID_KEY);
      if (!existingId) {
        setGuestClientId(id);
        await AsyncStorage.setItem(GUEST_CLIENT_ID_KEY, id);
        console.log('Guest Client ID salvo com sucesso:', id);
      } else {
        // Se já existe, usa o existente
        setGuestClientId(existingId);
        console.log('Guest Client ID existente utilizado:', existingId);
      }
    } catch (error) {
      console.error('Erro ao salvar guestClientId:', error);
      throw error;
    }
  };

  const login = async (email: string, password: string) => {
    try {
      const response = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Erro ao fazer login');
      }

      const data = await response.json();
      setUser(data.user);
      setToken(data.token);
      await AsyncStorage.setItem('token', data.token);
    } catch (error) {
      throw error;
    }
  };

  const logout = async () => {
    try {
      // Remove apenas o token, mantém o guestClientId
      await AsyncStorage.removeItem('token');
      setToken(null);
      setUser(null);
      // NÃO remove o guestClientId para preservar agendamentos feitos como cliente
      console.log('Logout realizado com sucesso');
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, guestClientId, loading, login, logout, setGuestId }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
}