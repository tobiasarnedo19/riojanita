import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import React, { useContext } from 'react';
import Layout from './components/Layout';
import Liquidacion from './views/Liquidacion';
import Empleados from './views/Empleados';
import Categorias from './views/Categorias';
import Novedades from './views/Novedades';
import Login from './views/Login';
import { DataProvider } from './context/DataContext';
import { AuthProvider, AuthContext } from './context/AuthContext';

function AppContent() {
  const { user, loading } = useContext(AuthContext);

  if (loading) return null; // O un spinner pequeño

  if (!user) {
    return <Login />;
  }

  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Navigate to="/liquidacion" replace />} />
        <Route path="/liquidacion" element={<Liquidacion />} />
        <Route path="/empleados" element={<Empleados />} />
        <Route path="/categorias" element={<Categorias />} />
        <Route path="/novedades" element={<Novedades />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Layout>
  );
}

function App() {
  return (
    <AuthProvider>
      <DataProvider>
        <BrowserRouter>
          <AppContent />
        </BrowserRouter>
      </DataProvider>
    </AuthProvider>
  );
}

export default App;
