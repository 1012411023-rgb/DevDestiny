import { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/authService';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [role, setRole] = useState(null); // 'company' | 'user'

  // Load from session if needed (simulated)
  useEffect(() => {
    
    const checkToken = async () => {
      const token = localStorage.getItem('devdestany_token');
      const storedRole = localStorage.getItem('mf_role');
      if (token && storedRole) {
        try {
          const userData = await authService.verifyToken(token);
          setUser(userData);
          setRole(storedRole);
          setIsAuthenticated(true);
        } catch (e) {
          localStorage.removeItem('devdestany_token');
          localStorage.removeItem('mf_role');
          setIsAuthenticated(false);
          setUser(null);
          setRole(null);
          window.location.href = '/login';
        }
      }
      setIsAuthLoading(false);
    };
    checkToken();

  }, []);

  const login = async (roleType, email, password) => {
    try {
      const userData = await authService.login({ email, password });
      setUser(userData);
      setRole(roleType);
      setIsAuthenticated(true);
      
      localStorage.setItem('devdestany_token', userData.token);
      localStorage.setItem('mf_role', roleType);
      return userData;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const signup = async (userData) => {
    try {
      const newUser = await authService.signup(userData);
      setUser(newUser);
      setRole(userData.role);
      setIsAuthenticated(true);
      
      localStorage.setItem('devdestany_token', newUser.token);
      localStorage.setItem('mf_role', userData.role);
      return newUser;
    } catch (error) {
       console.error('Signup error:', error);
       throw error;
    }
  };

  const logout = () => {
    setIsAuthenticated(false);
    setUser(null);
    setRole(null);
    localStorage.removeItem('devdestany_token');
    localStorage.removeItem('mf_role');
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, isAuthLoading, role, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
