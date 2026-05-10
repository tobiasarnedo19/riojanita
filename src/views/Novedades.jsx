import React, { useState, useContext } from 'react';
import { api } from '../services/api';
import { DataContext } from '../context/DataContext';
import { formatCurrency } from '../utils/formatters';
import '../components/ui/ui.css';
import { Plus, CheckCircle } from 'lucide-react';

export default function Novedades() {
  const { 
    novedades, 
    empleados: allEmpleados, 
    globalError, 
    refreshData 
  } = useContext(DataContext);

  const empleados = allEmpleados.filter(e => e.estado === 'ACTIVO');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ id: '', fecha: '', empleado: '', monto: '', tipo: 'VALE', estado: 'PENDIENTE' });

  const openModal = () => {
    const today = new Date().toISOString().split('T')[0];
    setFormData({ id: '', fecha: today, empleado: '', monto: '', tipo: 'VALE', estado: 'PENDIENTE' });
    setIsModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await api.create('Novedades', formData);
      setIsModalOpen(false);
      await refreshData();
    } catch (err) {
      setError('Error al guardar: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const getEmpName = (empId) => {
    const emp = allEmpleados.find(e => e.id === empId);
    return emp ? emp.nombre : empId;
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return dateString;
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const getBadgeStyle = (tipo, estado) => {
    if (estado === 'PAGADO') return { backgroundColor: '#e5e7eb', color: '#6b7280' };
    switch (tipo) {
      case 'FERIADO': return { backgroundColor: '#dcfce7', color: '#15803d' };
      case 'VALE': 
      case 'ANTICIPO': return { backgroundColor: '#fee2e2', color: '#b91c1c' };
      default: return {};
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h2>Registro de Novedades</h2>
        <button className="btn btn-primary" onClick={() => openModal()}>
          <Plus size={18} /> Cargar Novedad
        </button>
      </div>

      {(globalError || error) && <div className="alert alert-error">{globalError || error}</div>}

      <div className="card table-container">
        {novedades.length === 0 ? (
          <p>No hay novedades registradas.</p>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Fecha</th>
                <th>Empleado</th>
                <th>Tipo</th>
                <th>Monto ($)</th>
                <th>Estado</th>
              </tr>
            </thead>
            <tbody>
              {novedades.map(nov => (
                <tr key={nov.id}>
                  <td>{formatDate(nov.fecha)}</td>
                  <td>{getEmpName(nov.empleado)}</td>
                  <td>
                    <span style={{ 
                      padding: '4px 8px', borderRadius: '4px', fontSize: '0.85rem', fontWeight: 'bold',
                      ...getBadgeStyle(nov.tipo, nov.estado)
                    }}>
                      {nov.tipo}
                    </span>
                  </td>
                  <td style={{ fontWeight: '600' }}>{formatCurrency(nov.monto)}</td>
                  <td>
                    {nov.estado === 'PAGADO' ? (
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--color-success)' }}>
                        <CheckCircle size={16} /> Pagado
                      </span>
                    ) : (
                      <span style={{ color: 'var(--color-warning)', fontWeight: '500' }}>Pendiente</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Cargar Novedad</h2>
              <button className="btn close-btn" onClick={() => setIsModalOpen(false)}>✕</button>
            </div>
            <form onSubmit={handleSave}>
              <div className="form-group">
                <label>Fecha</label>
                <input 
                  required type="date" className="input-control" 
                  value={formData.fecha} onChange={e => setFormData({...formData, fecha: e.target.value})}
                />
              </div>
              <div className="form-group">
                <label>Empleado</label>
                <select 
                  required className="input-control" 
                  value={formData.empleado} onChange={e => setFormData({...formData, empleado: e.target.value})}
                >
                  <option value="" disabled>Seleccione...</option>
                  {empleados.map(emp => (
                    <option key={emp.id} value={emp.id}>{emp.nombre}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Tipo de Novedad</label>
                <select 
                  required className="input-control" 
                  value={formData.tipo} onChange={e => setFormData({...formData, tipo: e.target.value})}
                >
                  <option value="VALE">Vale (Descuento)</option>
                  <option value="ANTICIPO">Anticipo (Descuento)</option>
                  <option value="FERIADO">Feriado (Suma)</option>
                </select>
              </div>
              <div className="form-group">
                <label>Monto ($)</label>
                <input 
                  required type="number" step="0.01" min="0" className="input-control" 
                  value={formData.monto} onChange={e => setFormData({...formData, monto: e.target.value})}
                />
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '2rem' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>Cancelar</button>
                <button type="submit" className="btn btn-primary" disabled={loading}>
                  {loading ? 'Guardando...' : 'Guardar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
