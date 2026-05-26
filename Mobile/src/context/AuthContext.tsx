import React, {createContext, useContext, useState, useEffect, useCallback} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {login as apiLogin, LoginCredentials, LoginResponse} from '../services/authService';
import {getEmployeeByUserId} from '../services/employeeService';
import {STORAGE_KEYS} from '../utils/constants';

interface AuthContextType {
  user: LoginResponse | null;
  employee: any | null;
  loading: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => Promise<void>;
  refreshEmployee: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const AuthProvider: React.FC<{children: React.ReactNode}> = ({children}) => {
  const [user, setUser] = useState<LoginResponse | null>(null);
  const [employee, setEmployee] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    restoreSession();
  }, []);

  const restoreSession = async () => {
    try {
      const [tokenData, userData] = await AsyncStorage.multiGet([
        STORAGE_KEYS.TOKEN,
        STORAGE_KEYS.USER,
      ]);
      const token = tokenData[1];
      const userJson = userData[1];
      if (token && userJson) {
        const parsedUser = JSON.parse(userJson) as LoginResponse;
        setUser(parsedUser);
        // Fetch employee profile in background
        try {
          const emp = await getEmployeeByUserId(parsedUser.id);
          setEmployee(emp);
        } catch {}
      }
    } catch {}
    finally {
      setLoading(false);
    }
  };

  const login = useCallback(async (credentials: LoginCredentials) => {
    const response = await apiLogin(credentials);
    await AsyncStorage.multiSet([
      [STORAGE_KEYS.TOKEN, response.token],
      [STORAGE_KEYS.USER, JSON.stringify(response)],
    ]);
    setUser(response);
    try {
      const emp = await getEmployeeByUserId(response.id);
      setEmployee(emp);
    } catch {}
  }, []);

  const logout = useCallback(async () => {
    await AsyncStorage.multiRemove([STORAGE_KEYS.TOKEN, STORAGE_KEYS.USER]);
    setUser(null);
    setEmployee(null);
  }, []);

  const refreshEmployee = useCallback(async () => {
    if (!user) return;
    try {
      const emp = await getEmployeeByUserId(user.id);
      setEmployee(emp);
    } catch {}
  }, [user]);

  return (
    <AuthContext.Provider value={{user, employee, loading, login, logout, refreshEmployee}}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
