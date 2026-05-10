import React, { createContext, useState, useEffect } from 'react';
import { api } from '../services/api';

export const DataContext = createContext();

export const DataProvider = ({ children }) => {
  const [empleados, setEmpleados] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [novedades, setNovedades] = useState([]);
  const [liquidaciones, setLiquidaciones] = useState([]);
  const [historialHoras, setHistorialHoras] = useState([]);
  
  const [globalLoading, setGlobalLoading] = useState(true);
  const [globalError, setGlobalError] = useState(null);

  // Cargar datos por primera vez
  useEffect(() => {
    refreshData();
  }, []);

  const refreshData = async (silent = false) => {
    if (!silent) setGlobalLoading(true);
    setGlobalError(null);
    try {
      const [empData, catData, novData, liqData, histData] = await Promise.all([
        api.get('Empleados'),
        api.get('Categorias'),
        api.get('Novedades'),
        api.get('Liquidaciones'),
        api.get('Historial horas')
      ]);
      setEmpleados(empData || []);
      setCategorias(catData || []);
      setNovedades(novData || []);
      setLiquidaciones((liqData || []).reverse()); // Más recientes primero
      setHistorialHoras((histData || []).reverse());
    } catch (err) {
      console.error(err);
      if (!silent) setGlobalError('Error al conectar con la base de datos de Google Sheets.');
    } finally {
      if (!silent) setGlobalLoading(false);
    }
  };

  return (
    <DataContext.Provider value={{
      empleados,
      categorias,
      novedades,
      liquidaciones,
      historialHoras,
      globalLoading,
      globalError,
      refreshData
    }}>
      {globalLoading && empleados.length === 0 ? (
        <div className="loading-overlay">
          <img src="/logo.png" alt="Cargando" className="loading-logo" />
          <p className="loading-text">Cargando sistema...</p>
        </div>
      ) : (
        children
      )}
    </DataContext.Provider>
  );
};
