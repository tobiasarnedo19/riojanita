import React, { createContext, useState, useEffect } from 'react';
import { api } from '../services/api';

import gsap from 'gsap';

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

  // Animación de carga GSAP
  useEffect(() => {
    if (globalLoading && empleados.length === 0) {
      gsap.to(".loading-logo", { 
        scale: 1.08, 
        filter: "drop-shadow(0 15px 35px rgba(0,0,0,0.4)) brightness(1.1)",
        duration: 1.2, 
        repeat: -1, 
        yoyo: true, 
        ease: "power1.inOut" 
      });
      
      gsap.to(".loading-dot", {
        y: -15,
        opacity: 1,
        duration: 0.6,
        repeat: -1,
        yoyo: true,
        stagger: {
          each: 0.15,
          from: "start"
        },
        ease: "power2.inOut"
      });
    }
  }, [globalLoading, empleados]);

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
          <div className="loading-indicator">
            <div className="loading-dot"></div>
            <div className="loading-dot"></div>
            <div className="loading-dot"></div>
          </div>
        </div>
      ) : (
        children
      )}
    </DataContext.Provider>
  );
};
