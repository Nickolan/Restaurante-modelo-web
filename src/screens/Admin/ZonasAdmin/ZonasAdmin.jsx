import React, { useState, useEffect } from 'react';
import { 
  MapPin, 
  Plus, 
  Edit, 
  Trash2, 
  Save, 
  X, 
  LayoutGrid, 
  Square, 
  Users,
  FileText,
  Lock,
  Unlock
} from 'lucide-react';
import { reservasService } from '../../../services/reservas.service';
import './ZonasAdmin.css';

const ZonasAdmin = () => {
  const [zonas, setZonas] = useState([]);
  const [mesas, setMesas] = useState([]);
  const [loading, setLoading] = useState(false);

  // Estado formulario Zona
  const [zonaForm, setZonaForm] = useState({
    id: null,
    nombre: ''
  });

  // Estado formulario Mesa (Actualizado con descripcion)
  const [mesaForm, setMesaForm] = useState({
    id: null,
    numero_mesa: '',
    capacidad: '',
    descripcion: '', 
    zona_id: ''
  });

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    setLoading(true);
    try {
      const [zonasData, mesasData] = await Promise.all([
        reservasService.getZonas(),
        reservasService.getMesas()
      ]);
      setZonas(zonasData);
      setMesas(mesasData);
    } catch (error) {
      console.error("Error al cargar datos:", error);
    } finally {
      setLoading(false);
    }
  };

  // --- ZONAS ---
  const handleSaveZona = async (e) => {
    e.preventDefault();
    if (!zonaForm.nombre.trim()) return;

    try {
      if (zonaForm.id) {
        await reservasService.updateZona(zonaForm.id, { nombre: zonaForm.nombre });
      } else {
        await reservasService.createZona({ nombre: zonaForm.nombre });
      }
      setZonaForm({ id: null, nombre: '' });
      fetchAllData();
    } catch (error) {
      alert("Error al guardar la zona.");
    }
  };

  const handleEditZona = (zona) => {
    setZonaForm({ id: zona.id, nombre: zona.nombre });
  };

  const handleDeleteZona = async (id) => {
    const mesasEnZona = mesas.filter(m => m.zona?.id === id || m.zona_id === id);
    if (mesasEnZona.length > 0) {
      alert("No puedes eliminar esta zona porque tiene mesas asignadas.");
      return;
    }
    if (!window.confirm("¿Eliminar esta zona?")) return;

    try {
      await reservasService.deleteZona(id);
      fetchAllData();
    } catch (error) {
      alert("No se pudo eliminar la zona.");
    }
  };

  // --- MESAS ---
  const handleSaveMesa = async (e) => {
    e.preventDefault();
    
    // Validaciones
    if (!mesaForm.numero_mesa || !mesaForm.capacidad || !mesaForm.zona_id) {
      alert("Número, Capacidad y Zona son obligatorios");
      return;
    }

    // CONVERSIÓN ESTRICTA A INT
    const payload = {
      numero_mesa: parseInt(mesaForm.numero_mesa, 10),     // Asegura INT
      capacidad: parseInt(mesaForm.capacidad, 10), // Asegura INT
      descripcion: mesaForm.descripcion,           // String
      zona_id: parseInt(mesaForm.zona_id, 10)      // Asegura INT
    };

    try {
      if (mesaForm.id) {
        await reservasService.updateMesa(mesaForm.id, payload);
      } else {
        await reservasService.createMesa(payload);
      }
      // Resetear form
      setMesaForm({ id: null, numero_mesa: '', capacidad: '', descripcion: '', zona_id: '' });
      fetchAllData();
    } catch (error) {
      console.error(error);
      alert("Error al guardar la mesa. Verifica que el número no esté duplicado.");
    }
  };

  const handleEditMesa = (mesa) => {
    setMesaForm({
      id: mesa.id,
      numero_mesa: mesa.numero_mesa,
      capacidad: mesa.capacidad,
      descripcion: mesa.descripcion || '', // Manejar nulls
      zona_id: mesa.zona ? mesa.zona.id : ''
    });
  };

  const handleDeleteMesa = async (id) => {
    if (!window.confirm("¿Eliminar esta mesa permanentemente?")) return;
    try {
      await reservasService.deleteMesa(id);
      fetchAllData();
    } catch (error) {
      alert("Error al eliminar la mesa.");
    }
  };

  const handleToggleEstado = async (mesa) => {
    // Si el estado actual es 'bloqueada', pasamos a 'disponible', si no, a 'bloqueada'
    // Asumimos que si viene null/undefined es 'disponible'
    const esBloqueada = mesa.estado === 'bloqueada';
    const nuevoEstado = esBloqueada ? 'disponible' : 'bloqueada';

    try {
      // Llamamos al update existente pasando solo el campo estado
      await reservasService.updateMesa(mesa.id, { estado: nuevoEstado });
      fetchAllData(); // Recargamos para ver el cambio
    } catch (error) {
      console.error(error);
      alert("No se pudo cambiar el estado de la mesa.");
    }
  };

  return (
    <div className="zonas-admin-page fade-in">
      <div className="page-header">
        <h1>Gestión de Espacios</h1>
        <p>Configura las zonas, mesas y disponibilidad.</p>
      </div>

      <div className="admin-panels-grid">
        
        {/* PANEL IZQUIERDO: ZONAS */}
        <section className="admin-panel">
          <div className="panel-header">
            <LayoutGrid size={20} className="text-accent" />
            <h2>Zonas</h2>
          </div>
          {/* Formulario Zonas */}
          <form onSubmit={handleSaveZona} className="inline-form">
            <input 
              type="text"
              placeholder="Nombre zona"
              value={zonaForm.nombre}
              onChange={(e) => setZonaForm({...zonaForm, nombre: e.target.value})}
              className="admin-input"
            />
            <button type="submit" className="btn-icon-primary">
              {zonaForm.id ? <Save size={18} /> : <Plus size={18} />}
            </button>
            {zonaForm.id && (
              <button type="button" className="btn-icon-secondary" onClick={() => setZonaForm({id: null, nombre: ''})}>
                <X size={18} />
              </button>
            )}
          </form>
          {/* Lista Zonas */}
          <div className="list-container">
            {zonas.map(zona => (
              <div key={zona.id} className="list-item">
                <span className="item-name">{zona.nombre}</span>
                <div className="item-actions">
                  <button onClick={() => handleEditZona(zona)} className="action-btn edit"><Edit size={16} /></button>
                  <button onClick={() => handleDeleteZona(zona.id)} className="action-btn delete"><Trash2 size={16} /></button>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* PANEL DERECHO: MESAS */}
        <section className="admin-panel">
          <div className="panel-header">
            <Square size={20} className="text-accent" />
            <h2>Mesas</h2>
          </div>

          {/* Formulario Mesa */}
          <form onSubmit={handleSaveMesa} className="grid-form">
            <div className="form-row">
              <div className="input-group">
                <span className="input-icon">#</span>
                <input 
                  type="number" placeholder="Nro"
                  value={mesaForm.numero_mesa}
                  onChange={(e) => setMesaForm({...mesaForm, numero_mesa: e.target.value})}
                  className="admin-input small" min="1"
                />
              </div>
              <div className="input-group">
                <Users size={14} className="input-icon" />
                <input 
                  type="number" placeholder="Cap."
                  value={mesaForm.capacidad}
                  onChange={(e) => setMesaForm({...mesaForm, capacidad: e.target.value})}
                  className="admin-input small" min="1"
                />
              </div>
              <div className="input-group grow">
                <MapPin size={14} className="input-icon" />
                <select 
                  value={mesaForm.zona_id}
                  onChange={(e) => setMesaForm({...mesaForm, zona_id: e.target.value})}
                  className="admin-select"
                >
                  <option value="">Zona...</option>
                  {zonas.map(z => <option key={z.id} value={z.id}>{z.nombre}</option>)}
                </select>
              </div>
            </div>
            <div className="form-row">
              <div className="input-group full-width">
                <FileText size={14} className="input-icon" />
                <input 
                  type="text" placeholder="Descripción (ej: Ventana)"
                  value={mesaForm.descripcion}
                  onChange={(e) => setMesaForm({...mesaForm, descripcion: e.target.value})}
                  className="admin-input"
                />
              </div>
            </div>
            <div className="form-buttons">
              <button type="submit" className="btn-primary">{mesaForm.id ? 'Actualizar' : 'Agregar'}</button>
              {mesaForm.id && (
                <button type="button" className="btn-secondary" onClick={() => setMesaForm({id: null, numero_mesa: '', capacidad: '', descripcion: '', zona_id: ''})}>Cancelar</button>
              )}
            </div>
          </form>

          {/* Tabla de Mesas */}
          <div className="table-container">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Estado</th> {/* Nueva Columna */}
                  <th>Mesa</th>
                  <th>Info</th>
                  <th>Zona</th>
                  <th align="right">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {mesas.map(mesa => {
                  const isBlocked = mesa.estado === 'bloqueada';
                  return (
                    <tr key={mesa.id} className={isBlocked ? 'row-bloqueada' : ''}>
                      {/* Indicador de Estado */}
                      <td>
                        <span className={`badge-estado ${isBlocked ? 'bloqueada' : 'disponible'}`}>
                          {isBlocked ? <Lock size={12}/> : <Unlock size={12}/>}
                        </span>
                      </td>

                      <td><span className="badge-number">#{mesa.numero_mesa}</span></td>
                      <td>
                        <div className="mesa-info">
                          <span className="capacidad">{mesa.capacidad} pers.</span>
                          {mesa.descripcion && <span className="descripcion-text">{mesa.descripcion}</span>}
                        </div>
                      </td>
                      <td><span className="badge-zona">{mesa.zona?.nombre || 'S/Z'}</span></td>
                      
                      <td align="right">
                        <div className="item-actions">
                          {/* Botón de Bloqueo/Desbloqueo */}
                          <button 
                            onClick={() => handleToggleEstado(mesa)} 
                            className={`action-btn ${isBlocked ? 'unlock' : 'lock'}`}
                            title={isBlocked ? "Desbloquear Mesa" : "Bloquear Mesa"}
                          >
                            {isBlocked ? <Unlock size={16} /> : <Lock size={16} />}
                          </button>
                          
                          <button onClick={() => handleEditMesa(mesa)} className="action-btn edit"><Edit size={16} /></button>
                          <button onClick={() => handleDeleteMesa(mesa.id)} className="action-btn delete"><Trash2 size={16} /></button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  );
};

export default ZonasAdmin;