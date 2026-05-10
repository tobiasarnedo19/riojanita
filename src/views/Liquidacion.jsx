import React, { useState, useEffect, useRef, useContext, useMemo } from 'react';
import { api } from '../services/api';
import { generateReciboPDF, generatePlanillaPDF } from '../services/pdfService';
import { DataContext } from '../context/DataContext';
import { formatCurrency } from '../utils/formatters';
import gsap from 'gsap';
import '../components/ui/ui.css';
import { Save, Trash2, CheckSquare, Plus, X, ArrowRight, Eye, Check, FileDown, FileText, Download } from 'lucide-react';

// Componente para la Vista Previa del Recibo Individual (Estilo Ticket 6x4)
const ReciboPreview = ({ liq, empName, onDownload, onClose }) => {
  const formatDateSimple = (date) => {
    return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear().toString().substr(-2)}`;
  };

  return (
    <div className="modal-overlay" style={{ zIndex: 1100 }}>
      <div className="modal-content" style={{ maxWidth: '350px', padding: '1.5rem' }}>
        <div className="modal-header">
          <h3 style={{ margin: 0 }}>Vista Previa</h3>
          <button className="btn close-btn" onClick={onClose}><X size={20} /></button>
        </div>
        
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.5rem', backgroundColor: '#f5f5f5', padding: '20px', borderRadius: '8px' }}>
          <div style={{ 
            width: '230px', height: '150px', backgroundColor: 'white', padding: '8px', 
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)', border: '1px solid #333',
            fontFamily: 'Arial, sans-serif', color: '#333', lineHeight: '1.1', boxSizing: 'border-box',
            display: 'flex', flexDirection: 'column', justifyContent: 'space-between'
          }}>
            <div style={{ display: 'flex', justifyContent: 'flex-end', borderBottom: '1px solid #ddd', paddingBottom: '4px', marginBottom: '5px' }}>
              <div style={{ textAlign: 'right', fontSize: '7px', fontWeight: 'bold' }}>FECHA: {formatDateSimple(new Date())}</div>
            </div>
            <div style={{ marginBottom: '5px' }}>
              <div style={{ fontSize: '10px', fontWeight: 'bold', overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>{empName}</div>
              <div style={{ fontSize: '7px', color: '#666' }}>{liq.fecha}</div>
            </div>
            <div style={{ fontSize: '8px', flexGrow: 1 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2px' }}>
                <span>{liq.total_horas} ({formatCurrency(liq.valor_hora)})</span>
                <span>{formatCurrency(liq.total_horas * liq.valor_hora)}</span>
              </div>
              {parseFloat(liq.feriados) > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2px', color: 'green' }}>
                  <span>Feriados:</span>
                  <span>+{formatCurrency(liq.feriados)}</span>
                </div>
              )}
              {parseFloat(liq.vales_anticipos) > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#d32f2f' }}>
                  <span>Vales/Ant:</span>
                  <span>-{formatCurrency(liq.vales_anticipos)}</span>
                </div>
              )}
            </div>
            <div style={{ backgroundColor: '#333', color: 'white', padding: '4px', borderRadius: '2px', textAlign: 'right', marginTop: '4px' }}>
              <div style={{ fontSize: '7px', textTransform: 'uppercase', opacity: 0.9, fontWeight: 'bold' }}>TOTAL</div>
              <div style={{ fontSize: '13px', fontWeight: '800' }}>{formatCurrency(liq.total)}</div>
            </div>
          </div>
        </div>

        <button className="btn btn-primary" style={{ width: '100%' }} onClick={onDownload}>
          <Download size={18} /> Descargar PDF
        </button>
      </div>
    </div>
  );
};

// Componente para la Vista Previa de Planilla Completa (A4 Miniature)
const PlanillaPreview = ({ planilla, getEmpName, onDownload, onClose }) => {
  return (
    <div className="modal-overlay" style={{ zIndex: 1100 }}>
      <div className="modal-content modal-content-lg" style={{ maxWidth: '800px' }}>
        <div className="modal-header">
          <h3 style={{ margin: 0 }}>Vista Previa Planilla A4 ({planilla.empleados.length} recibos)</h3>
          <button className="btn close-btn" onClick={onClose}><X size={20} /></button>
        </div>
        
        <p style={{ fontSize: '0.9rem', color: '#666', marginBottom: '1rem' }}>Esta es una miniatura de cómo se organizarán los recibos en la hoja A4.</p>

        <div style={{ 
          backgroundColor: '#ddd', padding: '20px', borderRadius: '8px', 
          maxHeight: '500px', overflowY: 'auto', display: 'flex', justifyContent: 'center' 
        }}>
          {/* Simulación de hoja A4 */}
          <div style={{ 
            width: '600px', backgroundColor: 'white', padding: '20px', 
            boxShadow: '0 4px 15px rgba(0,0,0,0.2)',
            display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px'
          }}>
            {planilla.empleados.map((liq, i) => (
              <div key={i} style={{ 
                border: '1px solid #ccc', padding: '4px', height: '80px', fontSize: '6px',
                display: 'flex', flexDirection: 'column', justifyContent: 'space-between', opacity: 0.8
              }}>
                <div style={{ borderBottom: '1px solid #eee', paddingBottom: '2px', fontWeight: 'bold' }}>{getEmpName(liq.empelado)}</div>
                <div style={{ flexGrow: 1, paddingTop: '4px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Haberes</span><span>{formatCurrency(liq.total)}</span></div>
                </div>
                <div style={{ backgroundColor: '#f0f0f0', textAlign: 'right', padding: '2px' }}>TOTAL: {formatCurrency(liq.total)}</div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1.5rem' }}>
          <button className="btn btn-secondary" onClick={onClose}>Cerrar</button>
          <button className="btn btn-primary" onClick={onDownload}>
            <Download size={18} /> Descargar PDF A4
          </button>
        </div>
      </div>
    </div>
  );
};

export default function Liquidacion() {
  const {
    empleados: allEmpleados,
    categorias,
    novedades: allNovedades,
    liquidaciones,
    globalError,
    refreshData
  } = useContext(DataContext);

  // Filtrar activos/pendientes solo para la vista
  const empleados = allEmpleados.filter(e => e.estado === 'ACTIVO');
  const novedades = allNovedades.filter(n => n.estado === 'PENDIENTE');

  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const [showNewForm, setShowNewForm] = useState(false);
  const [approvalModal, setApprovalModal] = useState({ open: false, liq: null, nextStatus: '' });
  const [previewLiq, setPreviewLiq] = useState(null); 
  const [previewPlanilla, setPreviewPlanilla] = useState(null); // Nuevo estado para preview de planilla
  
  // Nuevo estado para ver el detalle de una planilla
  const [selectedPlanilla, setSelectedPlanilla] = useState(null);

  // Estados para el formulario nuevo
  const [fechaDesde, setFechaDesde] = useState('');
  const [fechaHasta, setFechaHasta] = useState('');
  const [selectedEmpleados, setSelectedEmpleados] = useState([]);
  const [borrador, setBorrador] = useState([]);

  const tableRef = useRef(null);

  // Agrupar liquidaciones por planilla_id o timestamp
  const planillas = useMemo(() => {
    const groups = {};
    liquidaciones.forEach(liq => {
      const key = liq.planilla_id || liq.timestamp;
      if (!groups[key]) {
        groups[key] = {
          id: key,
          timestamp: liq.timestamp,
          periodo: liq.fecha,
          total: 0,
          estado: 'CONTROLADO POR GERENCIA',
          empleados: []
        };
      }
      groups[key].total += parseFloat(liq.total || 0);
      groups[key].empleados.push(liq);
      
      const currentStatus = liq.estado;
      if (currentStatus === 'PENDIENTE') {
        groups[key].estado = 'PENDIENTE';
      } else if (currentStatus === 'CONTROLADO POR ADMINISTRACION' && groups[key].estado !== 'PENDIENTE') {
        groups[key].estado = 'CONTROLADO POR ADMINISTRACION';
      }
    });
    return Object.values(groups);
  }, [liquidaciones]);

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return dateString;
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const getEmpName = (empId) => {
    const emp = allEmpleados.find(e => e.id === empId);
    return emp ? emp.nombre : empId;
  };

  const getCatValue = (catId) => {
    const cat = categorias.find(c => c.id === catId || c.categoria === catId);
    return cat ? parseFloat(cat.valor_hora) || 0 : 0;
  };

  const getNovedadesCalc = (empId, fDesde, fHasta) => {
    let empNovs = novedades.filter(n => String(n.empleado) === String(empId));
    if (fDesde && fHasta) {
      empNovs = empNovs.filter(n => {
        const nFecha = n.fecha.split('T')[0];
        return nFecha >= fDesde && nFecha <= fHasta;
      });
    }
    let feriados = 0;
    let vales_anticipos = 0;
    let idsUsados = [];
    empNovs.forEach(n => {
      const monto = parseFloat(n.monto) || 0;
      const tipoNormalizado = String(n.tipo).toUpperCase();
      if (tipoNormalizado === 'FERIADO') feriados += monto;
      if (tipoNormalizado === 'VALE' || tipoNormalizado === 'ANTICIPO') vales_anticipos += monto;
      idsUsados.push(n.id);
    });
    return { feriados, vales_anticipos, idsUsados };
  };

  const toggleEmpleado = (empId) => {
    if (selectedEmpleados.includes(empId)) {
      setSelectedEmpleados(selectedEmpleados.filter(id => id !== empId));
    } else {
      setSelectedEmpleados([...selectedEmpleados, empId]);
    }
  };

  const toggleTodos = () => {
    if (selectedEmpleados.length === empleados.length) {
      setSelectedEmpleados([]);
    } else {
      setSelectedEmpleados(empleados.map(e => e.id));
    }
  };

  const handleGenerarBorrador = () => {
    if (!fechaDesde || !fechaHasta) {
      setError('Debes ingresar la Fecha de Inicio y Fin.');
      return;
    }
    if (fechaDesde > fechaHasta) {
      setError('La fecha de inicio no puede ser mayor a la fecha de fin.');
      return;
    }
    if (selectedEmpleados.length === 0) {
      setError('Debes seleccionar al menos un empleado.');
      return;
    }

    setError(null);
    setSuccessMsg('');
    const newBorrador = [];

    selectedEmpleados.forEach(empId => {
      const emp = empleados.find(x => x.id === empId);
      const valor_hora = getCatValue(emp.categoria);
      const { feriados, vales_anticipos, idsUsados } = getNovedadesCalc(empId, fechaDesde, fechaHasta);

      newBorrador.push({
        uid: Math.random().toString(),
        empleado: empId,
        nombre: emp.nombre,
        total_horas: 0,
        valor_hora,
        feriados,
        vales_anticipos,
        total: feriados - vales_anticipos,
        novedadesIds: idsUsados,
        estado: 'PENDIENTE',
        f_desde: fechaDesde,
        f_hasta: fechaHasta
      });
    });

    setBorrador(newBorrador);
  };

  const handleHorasChange = (uid, val) => {
    const horas = parseFloat(val) || 0;
    setBorrador(prev => prev.map(row => {
      if (row.uid === uid) {
        const total = (horas * row.valor_hora) + row.feriados - row.vales_anticipos;
        return { ...row, total_horas: horas, total };
      }
      return row;
    }));
  };

  const removeRow = (uid) => {
    setBorrador(borrador.filter(b => b.uid !== uid));
  };

  const handleSave = async () => {
    if (borrador.length === 0) {
      setError('No hay empleados en el borrador.');
      return;
    }

    setIsSaving(true);
    setError(null);
    setSuccessMsg('');

    try {
      const periodoStr = `${fechaDesde} a ${fechaHasta}`;
      const payloadLiq = borrador.map(b => ({
        fecha: periodoStr,
        f_desde: b.f_desde,
        f_hasta: b.f_hasta,
        empelado: b.empleado,
        total_horas: b.total_horas,
        valor_hora: b.valor_hora,
        vales_anticipos: b.vales_anticipos,
        feriados: b.feriados,
        total: b.total,
        estado: 'PENDIENTE'
      }));

      let allNovIds = [];
      borrador.forEach(b => {
        allNovIds = [...allNovIds, ...b.novedadesIds];
      });

      await api.liquidar(payloadLiq, allNovIds);
      
      setSuccessMsg('Liquidación guardada correctamente.');
      await refreshData();
      
      setTimeout(() => {
        setBorrador([]);
        setSelectedEmpleados([]);
        setShowNewForm(false);
        setSuccessMsg('');
      }, 1500);

    } catch (err) {
      setError('Error al guardar: ' + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleUpdateStatus = async () => {
    const liqToUpdate = approvalModal.liq;
    const nextStatus = approvalModal.nextStatus;

    setApprovalModal({ open: false, liq: null, nextStatus: '' });

    if (selectedPlanilla) {
      const updatedLiqs = selectedPlanilla.empleados.map(l => 
         l.id === liqToUpdate.id ? { ...l, estado: nextStatus } : l
      );
      setSelectedPlanilla({ ...selectedPlanilla, empleados: updatedLiqs });
    }

    try {
      await api.update('Liquidaciones', { 
        id: liqToUpdate.id, 
        estado: nextStatus 
      });
      await refreshData(true);
    } catch (err) {
      console.error(err);
      alert('Hubo un problema al guardar en la base de datos.');
      await refreshData();
    }
  };

  const handleDownloadPDF = (liq) => {
    const empName = getEmpName(liq.empelado);
    generateReciboPDF(liq, empName);
    setPreviewLiq(null);
  };

  const handleDownloadPlanillaCompleta = async (p) => {
    setIsSaving(true);
    try {
      await generatePlanillaPDF(p, getEmpName);
      setPreviewPlanilla(null); // Cerrar al descargar
    } finally {
      setIsSaving(false);
    }
  };

  useEffect(() => {
    if (showNewForm && tableRef.current && borrador.length > 0) {
      gsap.fromTo(
        tableRef.current.querySelectorAll('.borrador-row'),
        { opacity: 0, y: 10 },
        { opacity: 1, y: 0, duration: 0.3, stagger: 0.05, ease: 'power1.out' }
      );
    }
  }, [borrador, showNewForm]);

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h2>Planillas de Liquidación</h2>
        <button className="btn btn-primary" onClick={() => {
          setError(null);
          setSuccessMsg('');
          setShowNewForm(true);
        }}>
          <Plus size={18} /> Nueva Planilla
        </button>
      </div>

      {(globalError || error) && <div className="alert alert-error">{globalError || error}</div>}

      <div className="card table-container">
        {planillas.length === 0 ? (
          <p>No hay planillas registradas.</p>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Fecha Lote</th>
                <th>Período</th>
                <th>Cant. Empleados</th>
                <th>Total a Liquidar</th>
                <th>Estado General</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {planillas.map(p => (
                <tr key={p.id}>
                  <td>{formatDate(p.timestamp)}</td>
                  <td>{p.periodo}</td>
                  <td>{p.empleados.length}</td>
                  <td style={{ fontWeight: 'bold' }}>{formatCurrency(p.total)}</td>
                  <td>
                    <span className="status-badge" style={{ 
                      backgroundColor: p.estado === 'PENDIENTE' ? '#fef3c7' : p.estado === 'CONTROLADO POR ADMINISTRACION' ? '#dbeafe' : '#dcfce7',
                      color: p.estado === 'PENDIENTE' ? '#d97706' : p.estado === 'CONTROLADO POR ADMINISTRACION' ? '#1e40af' : '#15803d'
                    }}>
                      {p.estado}
                    </span>
                  </td>
                  <td style={{ display: 'flex', gap: '0.5rem' }}>
                    <button className="btn btn-secondary" style={{ fontSize: '0.75rem' }} onClick={() => setSelectedPlanilla(p)}>
                      <Eye size={14} /> Detalle
                    </button>
                    <button className="btn btn-secondary" style={{ fontSize: '0.75rem', color: 'var(--color-primary)' }} title="Vista Previa Planilla" onClick={() => setPreviewPlanilla(p)}>
                      <FileText size={14} /> PDF A4
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* MODAL DETALLE DE PLANILLA */}
      {selectedPlanilla && (
        <div className="modal-overlay">
          <div className="modal-content modal-content-lg">
            <div className="modal-header">
              <div>
                <h2 style={{ margin: 0 }}>Detalle de Planilla</h2>
                <small style={{ color: 'var(--color-text-muted)' }}>{selectedPlanilla.periodo} | Generado: {formatDate(selectedPlanilla.timestamp)}</small>
              </div>
              <button className="btn close-btn" onClick={() => setSelectedPlanilla(null)}>
                <X size={24} />
              </button>
            </div>

            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Empleado</th>
                    <th>Horas</th>
                    <th>Valor Hora</th>
                    <th>Adicionales</th>
                    <th>Total</th>
                    <th>Estado</th>
                    <th style={{ textAlign: 'center' }}>Acción</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedPlanilla.empleados.map(liq => (
                    <tr key={liq.id}>
                      <td>{getEmpName(liq.empelado)}</td>
                      <td>{liq.total_horas}h</td>
                      <td>{formatCurrency(liq.valor_hora)}</td>
                      <td>
                        <span style={{ color: 'var(--color-success)', fontSize: '0.8rem' }}>+{formatCurrency(liq.feriados)}</span> / 
                        <span style={{ color: 'var(--color-danger)', fontSize: '0.8rem' }}>-{formatCurrency(liq.vales_anticipos)}</span>
                      </td>
                      <td style={{ fontWeight: 'bold' }}>{formatCurrency(liq.total)}</td>
                      <td>
                        <span className="status-badge" style={{ 
                          backgroundColor: liq.estado === 'PENDIENTE' ? '#fef3c7' : liq.estado === 'CONTROLADO POR ADMINISTRACION' ? '#dbeafe' : '#dcfce7',
                          color: liq.estado === 'PENDIENTE' ? '#d97706' : liq.estado === 'CONTROLADO POR ADMINISTRACION' ? '#1e40af' : '#15803d'
                        }}>
                          {liq.estado}
                        </span>
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', justifyContent: 'center' }}>
                          {liq.estado === 'PENDIENTE' && (
                            <button className="btn btn-primary" style={{ fontSize: '0.65rem', padding: '4px 8px', whiteSpace: 'nowrap' }} 
                              onClick={() => setApprovalModal({ open: true, liq: liq, nextStatus: 'CONTROLADO POR ADMINISTRACION' })}>
                              Aprobar Admin
                            </button>
                          )}
                          {liq.estado === 'CONTROLADO POR ADMINISTRACION' && (
                            <button className="btn btn-primary" style={{ backgroundColor: '#2563eb', fontSize: '0.65rem', padding: '4px 8px', whiteSpace: 'nowrap' }} 
                              onClick={() => setApprovalModal({ open: true, liq: liq, nextStatus: 'CONTROLADO POR GERENCIA' })}>
                              Aprobar Gerencia
                            </button>
                          )}
                          {liq.estado !== 'PENDIENTE' && (
                            <button className="btn btn-secondary" style={{ padding: '4px', color: 'var(--color-primary)' }} title="Vista Previa Recibo" onClick={() => setPreviewLiq(liq)}>
                              <Eye size={18} />
                            </button>
                          )}
                          {liq.estado === 'CONTROLADO POR GERENCIA' && (
                            <Check size={16} style={{ color: 'var(--color-success)' }} />
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* VISTA PREVIA INDIVIDUAL */}
      {previewLiq && (
        <ReciboPreview 
          liq={previewLiq} 
          empName={getEmpName(previewLiq.empelado)} 
          onDownload={() => handleDownloadPDF(previewLiq)} 
          onClose={() => setPreviewLiq(null)} 
        />
      )}

      {/* VISTA PREVIA PLANILLA (BATCH) */}
      {previewPlanilla && (
        <PlanillaPreview 
          planilla={previewPlanilla} 
          getEmpName={getEmpName} 
          onDownload={() => handleDownloadPlanillaCompleta(previewPlanilla)} 
          onClose={() => setPreviewPlanilla(null)} 
        />
      )}

      {showNewForm && (
        <div className="modal-overlay" style={{ alignItems: 'flex-start', paddingTop: '3rem' }}>
          <div className="modal-content modal-content-lg">
            <div className="modal-header">
              <h2 style={{ margin: 0 }}>Generar Nueva Liquidación</h2>
              <button className="btn close-btn" onClick={() => setShowNewForm(false)}>
                <X size={24} />
              </button>
            </div>
            
            {error && <div className="alert alert-error">{error}</div>}
            {successMsg && <div className="alert alert-success">{successMsg}</div>}
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2rem', marginTop: '1rem', marginBottom: '2rem' }}>
              <div>
                <div className="form-group">
                  <label>Fecha de Inicio</label>
                  <input type="date" className="input-control" value={fechaDesde} onChange={e => setFechaDesde(e.target.value)} />
                </div>
                <div className="form-group">
                  <label>Fecha de Fin</label>
                  <input type="date" className="input-control" value={fechaHasta} onChange={e => setFechaHasta(e.target.value)} />
                </div>
              </div>

              <div>
                <div className="form-group">
                  <label style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span>Seleccionar Empleados</span>
                    <button type="button" onClick={toggleTodos} style={{ color: 'var(--color-primary)', fontSize: '0.85rem', fontWeight: '600' }}>
                      {selectedEmpleados.length === empleados.length ? 'Desmarcar Todos' : 'Marcar Todos'}
                    </button>
                  </label>
                  <div style={{ maxHeight: '135px', overflowY: 'auto', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)', padding: '0.5rem', backgroundColor: '#fafafa' }}>
                    {empleados.map(emp => (
                      <label key={emp.id} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.4rem', fontWeight: '500', cursor: 'pointer' }}>
                        <input type="checkbox" checked={selectedEmpleados.includes(emp.id)} onChange={() => toggleEmpleado(emp.id)} style={{ width: '16px', height: '16px', accentColor: 'var(--color-primary)' }} />
                        {emp.nombre}
                      </label>
                    ))}
                  </div>
                </div>
                <button className="btn btn-secondary" onClick={handleGenerarBorrador} style={{ width: '100%', marginTop: '0.5rem' }}>
                  <CheckSquare size={18} /> Generar Borrador
                </button>
              </div>
            </div>

            {borrador.length > 0 && (
              <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: '2rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                  <h3 style={{ margin: 0 }}>Borrador de Liquidación</h3>
                  <button className="btn btn-primary" onClick={handleSave} disabled={isSaving}>
                    <Save size={18} /> {isSaving ? 'Guardando...' : 'Confirmar Liquidación'}
                  </button>
                </div>
                
                <div className="table-container">
                  <table className="data-table" ref={tableRef}>
                    <thead>
                      <tr>
                        <th>Empleado</th>
                        <th>Valor Hora</th>
                        <th>Horas Trab.</th>
                        <th>Feriados (+)</th>
                        <th>Vales/Ant. (-)</th>
                        <th>Total</th>
                        <th></th>
                      </tr>
                    </thead>
                    <tbody>
                      {borrador.map((row, index) => (
                        <tr key={row.uid} className="borrador-row">
                          <td>{row.nombre}</td>
                          <td>{formatCurrency(row.valor_hora)}</td>
                          <td>
                            <input 
                              type="number" className="input-control" style={{ width: '80px', padding: '0.25rem 0.5rem' }}
                              value={row.total_horas} onChange={e => handleHorasChange(row.uid, e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                  e.preventDefault();
                                  const inputs = tableRef.current.querySelectorAll('input[type="number"]');
                                  if (inputs[index + 1]) { inputs[index + 1].focus(); inputs[index + 1].select(); }
                                }
                              }}
                              min="0" step="0.5"
                            />
                          </td>
                          <td style={{ color: 'var(--color-success)', fontWeight: '500' }}>+{formatCurrency(row.feriados)}</td>
                          <td style={{ color: 'var(--color-danger)', fontWeight: '500' }}>-{formatCurrency(row.vales_anticipos)}</td>
                          <td style={{ fontWeight: 'bold', fontSize: '1.1rem' }}>{formatCurrency(row.total)}</td>
                          <td><button className="btn" style={{ color: 'var(--color-danger)', padding: '0.25rem' }} onClick={() => removeRow(row.uid)}><Trash2 size={18} /></button></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {approvalModal.open && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Confirmar Aprobación</h2>
              <button className="btn close-btn" onClick={() => setApprovalModal({ open: false, liq: null, nextStatus: '' })}>
                <X size={24} />
              </button>
            </div>
            <p>¿Estás seguro que deseas pasar la liquidación de <strong>{getEmpName(approvalModal.liq.empelado)}</strong> al estado <strong>{approvalModal.nextStatus}</strong>?</p>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '2rem' }}>
              <button className="btn btn-secondary" onClick={() => setApprovalModal({ open: false, liq: null, nextStatus: '' })}>Cancelar</button>
              <button className="btn btn-primary" onClick={handleUpdateStatus}>Confirmar Aprobación</button>
            </div>
          </div>
        </div>
      )}

      {isSaving && (
        <div className="saving-overlay">
          <img src="/logo.png" alt="Cargando" className="saving-logo" />
          <div className="saving-text">Procesando...</div>
        </div>
      )}
    </div>
  );
}
