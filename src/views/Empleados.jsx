import React, { useState, useContext } from 'react';
import { api } from '../services/api';
import { DataContext } from '../context/DataContext';
import '../components/ui/ui.css';
import { Plus, Edit2, Trash2 } from 'lucide-react';

export default function Empleados() {
  const {
    empleados: allEmpleados,
    categorias,
    globalError,
    refreshData
  } = useContext(DataContext);

  const empleados = allEmpleados.filter(e => e.estado === 'ACTIVO');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ id: '', nombre: '', dni: '', categoria: '', estado: 'ACTIVO' });

  const openModal = (emp = null) => {
    if (emp) {
      setFormData(emp);
    } else {
      setFormData({ id: '', nombre: '', dni: '', categoria: '', estado: 'ACTIVO' });
    }
    setIsModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      if (formData.id) {
        await api.update('Empleados', formData);
      } else {
        await api.create('Empleados', formData);
      }
      setIsModalOpen(false);
      await refreshData();
    } catch (err) {
      setError('Error al guardar: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("¿Seguro que deseas eliminar este empleado?")) return;
    setLoading(true);
    setError(null);
    try {
      await api.update('Empleados', { id, estado: 'INACTIVO' });
      await refreshData();
    } catch (err) {
      setError('Error al eliminar: ' + err.message);
      setLoading(false);
    }
  };

  const getCatName = (catId) => {
    const cat = categorias.find(c => c.id === catId || c.categoria === catId);
    return cat ? cat.categoria : catId;
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h2>Empleados Activos</h2>
        <button className="btn btn-primary" onClick={() => openModal()}>
          <Plus size={18} /> Nuevo Empleado
        </button>
      </div>

      {(globalError || error) && <div className="alert alert-error">{globalError || error}</div>}

      <div className="card table-container">
        {empleados.length === 0 ? (
          <p>No hay empleados registrados.</p>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Nombre</th>
                <th>DNI</th>
                <th>Categoría</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {empleados.map(emp => (
                <tr key={emp.id}>
                  <td>{emp.nombre}</td>
                  <td>{emp.dni}</td>
                  <td>{getCatName(emp.categoria)}</td>
                  <td style={{ display: 'flex', gap: '0.5rem' }}>
                    <button className="btn btn-secondary" onClick={() => openModal(emp)}>
                      <Edit2 size={16} />
                    </button>
                    <button className="btn btn-secondary" style={{ color: 'var(--color-danger)' }} onClick={() => handleDelete(emp.id)}>
                      <Trash2 size={16} />
                    </button>
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
              <h2>{formData.id ? 'Editar Empleado' : 'Nuevo Empleado'}</h2>
              <button className="btn close-btn" onClick={() => setIsModalOpen(false)}>✕</button>
            </div>
            <form onSubmit={handleSave}>
              <div className="form-group">
                <label>Nombre Completo</label>
                <input 
                  required type="text" className="input-control" 
                  value={formData.nombre} onChange={e => setFormData({...formData, nombre: e.target.value})}
                />
              </div>
              <div className="form-group">
                <label>DNI</label>
                <input 
                  required type="text" className="input-control" 
                  value={formData.dni} onChange={e => setFormData({...formData, dni: e.target.value})}
                />
              </div>
              <div className="form-group">
                <label>Categoría</label>
                <select 
                  required className="input-control" 
                  value={formData.categoria} onChange={e => setFormData({...formData, categoria: e.target.value})}
                >
                  <option value="" disabled>Seleccione...</option>
                  {categorias.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.categoria}</option>
                  ))}
                </select>
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
