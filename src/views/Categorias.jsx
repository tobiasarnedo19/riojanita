import React, { useState, useContext } from 'react';
import { api } from '../services/api';
import { DataContext } from '../context/DataContext';
import { AuthContext } from '../context/AuthContext';
import { formatCurrency } from '../utils/formatters';
import '../components/ui/ui.css';
import { Plus, Edit2, History, X, Clock } from 'lucide-react';

export default function Categorias() {
  const { categorias, historialHoras, globalError, refreshData } = useContext(DataContext);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [formData, setFormData] = useState({ id: '', categoria: '', valor_hora: '' });

  const openModal = (cat = null) => {
    if (cat) {
      setFormData(cat);
    } else {
      setFormData({ id: '', categoria: '', valor_hora: '' });
    }
    setIsModalOpen(true);
  };

  const { user } = useContext(AuthContext);

  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    if (user?.role !== 'GERENCIA') {
      setError('No tienes permisos para realizar esta acción.');
      setLoading(false);
      return;
    }
    try {
      const dataToSave = { ...formData, responsable: user?.username || 'Administrador' };
      if (formData.id) {
        await api.update('Categorias', dataToSave);
      } else {
        await api.create('Categorias', dataToSave);
      }
      setIsModalOpen(false);
      await refreshData();
    } catch (err) {
      setError('Error al guardar: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return '';
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return dateString;
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    const seconds = String(d.getSeconds()).padStart(2, '0');
    return `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`;
  };

  return (
    <div>
      <div className="view-header">
        <h2>Categorías y Valores</h2>
        <div className="view-actions">
          <button className="btn btn-secondary" onClick={() => setIsHistoryOpen(true)}>
            <History size={18} /> <span className="hidden-mobile">Ver Historial</span>
          </button>
          {user?.role === 'GERENCIA' && (
            <button className="btn btn-primary" onClick={() => openModal()}>
              <Plus size={18} /> <span className="hidden-mobile">Nueva Categoría</span>
            </button>
          )}
        </div>
      </div>

      {(globalError || error) && <div className="alert alert-error">{globalError || error}</div>}

      <div className="card" style={{ padding: '0', background: 'none', boxShadow: 'none' }}>
        {categorias.length === 0 ? (
          <p>No hay categorías registradas.</p>
        ) : (
          <>
            <div className="desktop-table card" style={{ padding: '2rem' }}>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Categoría</th>
                    <th>Valor Hora ($)</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {categorias.map(cat => (
                    <tr key={cat.id}>
                      <td>{cat.categoria}</td>
                      <td style={{ fontWeight: '600' }}>{formatCurrency(cat.valor_hora)}</td>
                      <td>
                        {user?.role === 'GERENCIA' && (
                          <button className="btn btn-secondary" onClick={() => openModal(cat)}>
                            <Edit2 size={16} /> Editar
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mobile-cards">
              {categorias.map(cat => (
                <div key={cat.id} className="card-item">
                  <div className="card-row">
                    <span className="card-label">Categoría</span>
                    <span className="card-value" style={{ fontWeight: '700', color: 'var(--color-primary)' }}>{cat.categoria}</span>
                  </div>
                  <div className="card-row">
                    <span className="card-label">Valor Hora</span>
                    <span className="card-value" style={{ fontWeight: '600' }}>{formatCurrency(cat.valor_hora)}</span>
                  </div>
                  {user?.role === 'GERENCIA' && (
                    <div style={{ marginTop: '1rem' }}>
                      <button className="btn btn-secondary" style={{ width: '100%' }} onClick={() => openModal(cat)}>
                        <Edit2 size={16} /> Editar Categoría
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* MODAL EDITAR / NUEVO */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>{formData.id ? 'Editar Categoría' : 'Nueva Categoría'}</h2>
              <button className="btn close-btn" onClick={() => setIsModalOpen(false)}><X size={24} /></button>
            </div>
            <form onSubmit={handleSave}>
              <div className="form-group">
                <label>Nombre de la Categoría</label>
                <input 
                  required type="text" className="input-control" 
                  value={formData.categoria} onChange={e => setFormData({...formData, categoria: e.target.value})}
                />
              </div>
              <div className="form-group">
                <label>Valor por Hora ($)</label>
                <input 
                  required type="number" step="0.01" className="input-control" 
                  value={formData.valor_hora} onChange={e => setFormData({...formData, valor_hora: e.target.value})}
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

      {/* MODAL HISTORIAL */}
      {isHistoryOpen && (
        <div className="modal-overlay">
          <div className="modal-content modal-content-lg">
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <Clock size={24} color="var(--color-primary)" />
                <h2 style={{ margin: 0 }}>Historial de Cambios en Horas</h2>
              </div>
              <button className="btn close-btn" onClick={() => setIsHistoryOpen(false)}><X size={24} /></button>
            </div>
            
            <div className="table-container" style={{ marginTop: '1rem' }}>
              {historialHoras.length === 0 ? (
                <p style={{ textAlign: 'center', padding: '2rem', color: 'var(--color-text-muted)' }}>No hay cambios registrados aún.</p>
              ) : (
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Fecha</th>
                      <th>Categoría</th>
                      <th>Valor Anterior</th>
                      <th>Valor Nuevo</th>
                      <th>Responsable</th>
                    </tr>
                  </thead>
                  <tbody>
                    {historialHoras.map(hist => (
                      <tr key={hist.id_historial}>
                        <td style={{ fontSize: '0.85rem' }}>{formatDateTime(hist.timestamp)}</td>
                        <td style={{ fontWeight: '600' }}>{hist.categoria}</td>
                        <td style={{ color: 'var(--color-text-muted)' }}>{formatCurrency(hist.valor_anterior)}</td>
                        <td style={{ fontWeight: 'bold', color: 'var(--color-primary)' }}>{formatCurrency(hist.valor_actual)}</td>
                        <td>
                          <span className="status-badge" style={{ backgroundColor: '#f3f4f6', color: '#374151', fontSize: '0.75rem' }}>
                            {hist.responsable}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
