import React, { createContext, useState, useEffect } from 'react';
import { api } from '../services/api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Verificar si hay sesión guardada
    const savedUser = localStorage.getItem('riojanita_user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  const login = async (username, password) => {
    try {
      console.log('Intentando login para:', username);
      // Intentamos obtener la tabla 'usuarios'
      const users = await api.get('usuarios');
      console.log('Usuarios cargados desde Sheets:', users);

      const foundUser = users.find(u => {
        const uSheet = String(u.Usuario || '').trim().toLowerCase();
        const pSheet = String(u.Contraseña || '').trim();
        const uInput = String(username || '').trim().toLowerCase();
        const pInput = String(password || '').trim();
        
        return uSheet === uInput && pSheet === pInput;
      });

      if (foundUser) {
        const userData = { 
          username: foundUser.Usuario,
          name: foundUser.NombreyApellido || foundUser.Usuario,
          role: foundUser.Permisos || 'Administrador'
        };
        setUser(userData);
        localStorage.setItem('riojanita_user', JSON.stringify(userData));
        return { success: true };
      } else {
        return { success: false, error: 'Usuario o contraseña incorrectos' };
      }
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: 'Error: Asegúrate de tener una hoja llamada "usuarios" en tu Google Sheet.' };
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('riojanita_user');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
