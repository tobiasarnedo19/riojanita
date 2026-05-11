import React, { useState, useContext } from 'react';
import { api } from '../services/api';
import { DataContext } from '../context/DataContext';
import { formatCurrency } from '../utils/formatters';
import '../components/ui/ui.css';
import { Plus, CheckCircle, Search, Users } from 'lucide-react';

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
  const [formData, setFormData] = useState({ id: '', fecha: '', empleados: [], monto: '', tipo: 'VALE', estado: 'PENDIENTE', observaciones: '' });
  const [searchTerm, setSearchTerm] = useState('');

  const openModal = () => {
    const today = new Date().toISOString().split('T')[0];
    setFormData({ id: '', fecha: today, empleados: [], monto: '', tipo: 'VALE', estado: 'PENDIENTE', observaciones: '' });
    setSearchTerm('');
    setIsModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (formData.empleados.length === 0) {
      setError('Debe seleccionar al menos un empleado');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const records = formData.empleados.map(empId => ({
        ...formData,
        empleado: empId, // Convert back to single employee for the record
        empleados: undefined, // Remove the array
        id: '' // Ensure new ID for each
      }));

      await api.createBulk('Novedades', records);
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
                <th>Observaciones</th>
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
                  <td style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)' }}>{nov.observaciones || '-'}</td>
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
                <label style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span>Seleccionar Empleados ({formData.empleados.length})</span>
                  <button 
                    type="button" 
                    style={{ fontSize: '0.8rem', background: 'none', border: 'none', color: 'var(--color-primary)', cursor: 'pointer', fontWeight: 'bold' }}
                    onClick={() => {
                      if (formData.empleados.length === empleados.length) {
                        setFormData({...formData, empleados: []});
                      } else {
                        setFormData({...formData, empleados: empleados.map(e => e.id)});
                      }
                    }}
                  >
                    {formData.empleados.length === empleados.length ? 'Desmarcar todos' : 'Marcar todos'}
                  </button>
                </label>
                
                <div style={{ position: 'relative', marginBottom: '0.5rem' }}>
                  <Search size={16} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#999' }} />
                  <input 
                    type="text" 
                    placeholder="Buscar empleado..." 
                    className="input-control"
                    style={{ paddingLeft: '32px' }}
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                  />
                </div>

                <div style={{ 
                  maxHeight: '200px', 
                  overflowY: 'auto', 
                  border: '1px solid var(--color-border)', 
                  borderRadius: 'var(--radius-sm)',
                  padding: '0.5rem'
                }}>
                  {empleados
                    .filter(e => e.nombre.toLowerCase().includes(searchTerm.toLowerCase()))
                    .map(emp => (
                      <label key={emp.id} style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '10px', 
                        padding: '6px 8px',
                        cursor: 'pointer',
                        borderRadius: '4px',
                        backgroundColor: formData.empleados.includes(emp.id) ? 'rgba(211, 47, 47, 0.05)' : 'transparent'
                      }}>
                        <input 
                          type="checkbox" 
                          checked={formData.empleados.includes(emp.id)}
                          onChange={e => {
                            const newSelected = e.target.checked 
                              ? [...formData.empleados, emp.id]
                              : formData.empleados.filter(id => id !== emp.id);
                            setFormData({...formData, empleados: newSelected});
                          }}
                        />
                        <span style={{ fontSize: '0.9rem' }}>{emp.nombre}</span>
                      </label>
                    ))}
                </div>
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

              <div className="form-group">
                <label>Observaciones</label>
                <textarea 
                  className="input-control" 
                  style={{ minHeight: '80px', resize: 'vertical' }}
                  placeholder="Detalles adicionales..."
                  value={formData.observaciones} onChange={e => setFormData({...formData, observaciones: e.target.value})}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '2rem' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>Cancelar</button>
                <button type="submit" className="btn btn-primary" disabled={loading}>
                  {loading ? 'Guardando...' : `Guardar (${formData.empleados.length})`}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
