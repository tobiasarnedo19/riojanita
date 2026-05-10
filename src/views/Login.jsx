import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { LogIn, User, Lock, AlertCircle } from 'lucide-react';
import '../components/ui/ui.css';

export default function Login() {
  const { login } = useContext(AuthContext);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const result = await login(username, password);
    if (!result.success) {
      setError(result.error);
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-header">
          <img src="/logo.png" alt="Riojanita" className="login-logo" />
          <h1>Acceso al Sistema</h1>
          <p>Gestión de Liquidaciones</p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          {error && (
            <div className="login-error">
              <AlertCircle size={18} />
              <span>{error}</span>
            </div>
          )}

          <div className="login-group">
            <label>Usuario</label>
            <div className="input-with-icon">
              <User size={18} />
              <input 
                type="text" 
                placeholder="Nombre de usuario" 
                value={username} 
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="login-group">
            <label>Contraseña</label>
            <div className="input-with-icon">
              <Lock size={18} />
              <input 
                type="password" 
                placeholder="••••••••" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          <button type="submit" className="login-btn" disabled={loading}>
            {loading ? 'Verificando...' : (
              <>
                <LogIn size={20} /> Ingresar
              </>
            )}
          </button>
        </form>

        <div className="login-footer">
          &copy; {new Date().getFullYear()} Riojanita - Todos los derechos reservados
        </div>
      </div>
    </div>
  );
}
