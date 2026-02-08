import React, { useState, useEffect } from 'react';
import { 
  Calendar, Clock, Trash2, Plus, CalendarDays, ListOrdered, 
  UserPlus, Search, CheckCircle, MapPin, Users, Mail, Phone 
} from 'lucide-react';
import { reservasService } from '../../../services/reservas.service';
import './ReservasAdmin.css';

const DIAS_SEMANA = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];

const ReservasAdmin = () => {
  const [activeTab, setActiveTab] = useState('reservas'); // 'reservas' | 'nueva' | 'turnos'
  
  // Datos Maestros
  const [zonas, setZonas] = useState([]);
  const [turnos, setTurnos] = useState([]);
  const [reservas, setReservas] = useState([]);
  const [loading, setLoading] = useState(false);

  // --- ESTADOS: NUEVA RESERVA MANUAL ---
  const [manualStep, setManualStep] = useState(1); // 1: Filtros, 2: Cliente
  const [mesasDisponibles, setMesasDisponibles] = useState([]);
  const [turnosDelDia, setTurnosDelDia] = useState([]);
  
  const [reservaForm, setReservaForm] = useState({
    fecha: '',
    hora: '',     // String HH:MM:SS
    turno_id: '', // ID numérico
    zona_id: '',
    personas: '',
    mesa_id: null,
    nombre_cliente: '',
    dni_cliente: '',
    correo_cliente: '',
    telefono_cliente: ''
  });

  // --- ESTADOS: CONFIGURACIÓN TURNOS ---
  const [turnoForm, setTurnoForm] = useState({
    dia_semana: 'Viernes',
    hora_spot: ''
  });

  // --- EFECTOS ---
  useEffect(() => {
    loadDataInicial();
  }, []);

  useEffect(() => {
    if (activeTab === 'reservas') loadReservas();
    if (activeTab === 'turnos') loadTurnos();
  }, [activeTab]);

  // Filtrar turnos cuando cambia la fecha en el formulario manual
  useEffect(() => {
    if (reservaForm.fecha && turnos.length > 0) {
      // Ajuste de zona horaria simple para obtener el día correcto
      const [year, month, day] = reservaForm.fecha.split('-').map(Number);
      const dateObj = new Date(year, month - 1, day); 
      const nombreDia = DIAS_SEMANA[dateObj.getDay()];

      const filtrados = turnos.filter(t => t.dia_semana === nombreDia);
      setTurnosDelDia(filtrados);
    }
  }, [reservaForm.fecha, turnos]);


  // --- CARGAS DE DATOS ---
  const loadDataInicial = async () => {
    try {
      const [zData, tData] = await Promise.all([
        reservasService.getZonas(),
        reservasService.getTurnos()
      ]);
      setZonas(zData);
      setTurnos(tData);
    } catch (error) {
      console.error("Error cargando maestros:", error);
    }
  };

  const loadReservas = async () => {
    setLoading(true);
    try {
      const data = await reservasService.getAllReservas();
      setReservas(data);
    } catch (error) {
      console.error("Error cargando reservas:", error);
    } finally { setLoading(false); }
  };

  const loadTurnos = async () => {
    try {
      const data = await reservasService.getTurnos();
      setTurnos(data);
    } catch (error) { console.error(error); }
  };


  // --- FUNCIONES: NUEVA RESERVA MANUAL ---
  const handleManualInput = (e) => {
    const { name, value } = e.target;
    if (name === 'turno_obj') {
      // El select guarda un JSON para tener ID y Hora a la vez
      if(!value) return;
      const obj = JSON.parse(value);
      setReservaForm({ ...reservaForm, turno_id: obj.id, hora: obj.hora_spot });
    } else {
      setReservaForm({ ...reservaForm, [name]: value });
    }
  };

  const handleBuscarMesas = async (e) => {
    e.preventDefault();
    if (!reservaForm.fecha || !reservaForm.hora || !reservaForm.zona_id || !reservaForm.personas) {
      alert("Por favor complete todos los campos de búsqueda.");
      return;
    }

    setLoading(true);
    try {
      const result = await reservasService.getMesasDisponibles(
        reservaForm.fecha,
        reservaForm.hora,
        reservaForm.zona_id,
        reservaForm.personas
      );
      setMesasDisponibles(result);
      if (result.length === 0) alert("No se encontraron mesas disponibles para esos criterios.");
    } catch (error) {
      alert("Error al buscar disponibilidad.");
    } finally {
      setLoading(false);
    }
  };

  const handleSelectMesa = (mesaId) => {
    setReservaForm({ ...reservaForm, mesa_id: mesaId });
    setManualStep(2); // Pasar a datos cliente
  };

  const handleConfirmarReserva = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        fecha_reserva: reservaForm.fecha,
        turno_id: parseInt(reservaForm.turno_id),
        mesa_id: reservaForm.mesa_id,
        numero_personas: parseInt(reservaForm.personas),
        nombre_cliente: reservaForm.nombre_cliente,
        dni_cliente: reservaForm.dni_cliente,
        correo_cliente: reservaForm.correo_cliente,
        telefono_cliente: reservaForm.telefono_cliente,
        estado: 'confirmada' // Asumimos estado confirmado por ser admin
      };

      await reservasService.crearReserva(payload);
      alert("¡Reserva creada exitosamente!");
      
      // Reset total
      setReservaForm({
        fecha: '', hora: '', turno_id: '', zona_id: '', personas: '', mesa_id: null,
        nombre_cliente: '', dni_cliente: '', correo_cliente: '', telefono_cliente: ''
      });
      setManualStep(1);
      setMesasDisponibles([]);
      setActiveTab('reservas'); // Volver al listado
      loadReservas();

    } catch (error) {
      alert("Error al crear la reserva: " + (error.message || "Intente nuevamente."));
    } finally {
      setLoading(false);
    }
  };


  // --- FUNCIONES: GESTIÓN DE TURNOS ---
  const handleCreateTurno = async (e) => {
    e.preventDefault();
    if (!turnoForm.hora_spot) return alert("Seleccione una hora");
    try {
      await reservasService.createTurno(turnoForm);
      setTurnoForm({ ...turnoForm, hora_spot: '' });
      loadTurnos();
    } catch (error) { alert("Error al crear turno"); }
  };

  const handleDeleteTurno = async (id) => {
    if (window.confirm("¿Eliminar este horario?")) {
      try {
        await reservasService.deleteTurno(id);
        loadTurnos();
      } catch (error) { alert("Error al eliminar"); }
    }
  };

  // Agrupador para visualización de turnos
  const turnosPorDia = DIAS_SEMANA.map(dia => ({
    dia,
    spots: turnos
      .filter(t => t.dia_semana === dia)
      .sort((a, b) => a.hora_spot.localeCompare(b.hora_spot))
  }));

  return (
    <div className="reservas-page fade-in">
      <div className="page-header">
        <h1>Administración de Reservas</h1>
        <p>Gestione reservas, disponibilidad y horarios del restaurante.</p>
      </div>

      {/* TABS DE NAVEGACIÓN */}
      <div className="tabs-container">
        <button 
          className={`tab-btn ${activeTab === 'reservas' ? 'active' : ''}`}
          onClick={() => setActiveTab('reservas')}
        >
          <ListOrdered size={18} /> Listado
        </button>
        <button 
          className={`tab-btn ${activeTab === 'nueva' ? 'active' : ''}`}
          onClick={() => setActiveTab('nueva')}
        >
          <UserPlus size={18} /> Nueva Reserva
        </button>
        <button 
          className={`tab-btn ${activeTab === 'turnos' ? 'active' : ''}`}
          onClick={() => setActiveTab('turnos')}
        >
          <CalendarDays size={18} /> Configurar Turnos
        </button>
      </div>

      {/* --- SECCIÓN 1: LISTADO DE RESERVAS --- */}
      {activeTab === 'reservas' && (
        <div className="reservas-list-section fade-in">
          <div className="table-container">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Ref</th>
                  <th>Fecha</th>
                  <th>Hora</th>
                  <th>Cliente</th>
                  <th>Mesa</th>
                  <th>Pers.</th>
                  <th>Estado</th>
                </tr>
              </thead>
              <tbody>
                {reservas.map(res => (
                  <tr key={res.id}>
                    <td><span className="badge-ref">{res.numero_reserva?.slice(-4) || `#${res.id}`}</span></td>
                    <td>{new Date(res.fecha_reserva).toLocaleDateString()}</td>
                    <td>{res.turno?.hora_spot.slice(0,5)}</td>
                    <td>
                      <div className="cliente-cell">
                        <span className="cli-name">{res.nombre_cliente}</span>
                        <span className="cli-dni">{res.dni_cliente}</span>
                      </div>
                    </td>
                    <td>Mesa {res.mesa?.numero_mesa} ({res.mesa?.zona?.nombre})</td>
                    <td>{res.numero_personas}</td>
                    <td>
                      <span className={`status-badge ${res.estado}`}>
                        {res.estado}
                      </span>
                    </td>
                  </tr>
                ))}
                {reservas.length === 0 && !loading && (
                  <tr><td colSpan="7" className="empty-text">No hay reservas registradas.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* --- SECCIÓN 2: NUEVA RESERVA MANUAL --- */}
      {activeTab === 'nueva' && (
        <div className="manual-reserva-container fade-in">
          <div className="manual-layout">
            
            {/* Formulario de Búsqueda */}
            <div className="manual-form-card">
              <h3>1. Datos de la Cita</h3>
              <form onSubmit={handleBuscarMesas}>
                <div className="form-group">
                  <label>Fecha</label>
                  <div className="input-icon-wrapper">
                    <Calendar size={16} className="input-icon"/>
                    <input 
                      type="date" name="fecha" 
                      className="admin-input pl-icon"
                      value={reservaForm.fecha} onChange={handleManualInput}
                      min={new Date().toISOString().split('T')[0]}
                      required 
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Zona</label>
                  <div className="input-icon-wrapper">
                    <MapPin size={16} className="input-icon"/>
                    <select name="zona_id" className="admin-select pl-icon" value={reservaForm.zona_id} onChange={handleManualInput} required>
                      <option value="">Seleccionar Zona...</option>
                      {zonas.map(z => <option key={z.id} value={z.id}>{z.nombre}</option>)}
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label>Horario</label>
                  <div className="input-icon-wrapper">
                    <Clock size={16} className="input-icon"/>
                    <select 
                      name="turno_obj" 
                      className="admin-select pl-icon" 
                      onChange={handleManualInput} 
                      required 
                      disabled={!reservaForm.fecha}
                    >
                      <option value="">Seleccionar Hora...</option>
                      {turnosDelDia.map(t => (
                        <option key={t.id} value={JSON.stringify({id: t.id, hora_spot: t.hora_spot})}>
                          {t.hora_spot.slice(0,5)}
                        </option>
                      ))}
                    </select>
                  </div>
                  {reservaForm.fecha && turnosDelDia.length === 0 && <small className="text-error">Sin turnos este día</small>}
                </div>

                <div className="form-group">
                  <label>Personas</label>
                  <div className="input-icon-wrapper">
                    <Users size={16} className="input-icon"/>
                    <input 
                      type="number" name="personas" min="1" max="20"
                      className="admin-input pl-icon"
                      placeholder="Cantidad"
                      value={reservaForm.personas} onChange={handleManualInput}
                      required 
                    />
                  </div>
                </div>

                <button type="submit" className="btn-search-mesas" disabled={loading}>
                  {loading ? 'Buscando...' : <><Search size={18} /> Buscar Mesas</>}
                </button>
              </form>
            </div>

            {/* Resultados y Formulario Final */}
            <div className="manual-results-area">
              
              {/* PASO 1: GRID DE MESAS */}
              {manualStep === 1 && (
                <>
                  <div className="results-header">
                    <h3>2. Seleccionar Mesa Disponible</h3>
                  </div>
                  {mesasDisponibles.length > 0 ? (
                    <div className="mesas-grid-selector">
                      {mesasDisponibles.map(mesa => (
                        <div key={mesa.id} className="mesa-select-card" onClick={() => handleSelectMesa(mesa.id)}>
                          <div className="mesa-top">
                            <span className="mesa-zona">{mesa.zona?.nombre}</span>
                            <Users size={14}/> {mesa.capacidad}
                          </div>
                          <span className="mesa-num-big">{mesa.numero_mesa}</span>
                          <CheckCircle size={20} className="check-icon"/>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="empty-search">
                      <Search size={40} opacity={0.3}/>
                      <p>Complete los filtros para ver mesas disponibles.</p>
                    </div>
                  )}
                </>
              )}

              {/* PASO 2: DATOS CLIENTE */}
              {manualStep === 2 && (
                <div className="cliente-form-wrapper">
                  <div className="step-header">
                    <h3>3. Confirmar Datos del Cliente</h3>
                    <button className="btn-back" onClick={() => setManualStep(1)}>← Cambiar Mesa</button>
                  </div>

                  <div className="reserva-summary-bar">
                    <div className="summary-item">
                      <Calendar size={14}/> {new Date(reservaForm.fecha).toLocaleDateString()}
                    </div>
                    <div className="summary-item">
                      <Clock size={14}/> {reservaForm.hora?.slice(0,5)} hs
                    </div>
                    <div className="summary-item">
                      <Users size={14}/> {reservaForm.personas} pers.
                    </div>
                    <div className="summary-item highlight">
                      Mesa Seleccionada
                    </div>
                  </div>

                  <form onSubmit={handleConfirmarReserva} className="cliente-grid-form">
                    <div className="form-group">
                      <label>Nombre Completo *</label>
                      <input type="text" name="nombre_cliente" className="admin-input" onChange={handleManualInput} required />
                    </div>
                    <div className="form-group">
                      <label>DNI *</label>
                      <input type="text" name="dni_cliente" className="admin-input" onChange={handleManualInput} required />
                    </div>
                    <div className="form-group">
                      <label>Correo Electrónico</label>
                      <input type="email" name="correo_cliente" className="admin-input" onChange={handleManualInput} />
                    </div>
                    <div className="form-group">
                      <label>Teléfono</label>
                      <input type="tel" name="telefono_cliente" className="admin-input" onChange={handleManualInput} />
                    </div>

                    <button type="submit" className="btn-confirm-reserva" disabled={loading}>
                      {loading ? 'Procesando...' : 'CONFIRMAR RESERVA'}
                    </button>
                  </form>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* --- SECCIÓN 3: CONFIGURACIÓN DE TURNOS --- */}
      {activeTab === 'turnos' && (
        <div className="turnos-section fade-in">
          <div className="turnos-layout">
            {/* Formulario Agregar */}
            <div className="turnos-config-card">
              <h3>Agregar Horario de Atención</h3>
              <form onSubmit={handleCreateTurno} className="turno-form">
                <div className='div-row-class'>
                    
                
                <div className="form-group">
                  <label>Día</label>
                  <select 
                    className="admin-select"
                    value={turnoForm.dia_semana}
                    onChange={e => setTurnoForm({...turnoForm, dia_semana: e.target.value})}
                  >
                    {DIAS_SEMANA.map(dia => <option key={dia} value={dia}>{dia}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label>Hora (Spot)</label>
                  <input 
                    type="time" 
                    className="admin-input"
                    value={turnoForm.hora_spot}
                    onChange={e => setTurnoForm({...turnoForm, hora_spot: e.target.value})}
                  />
                </div>
                </div>
                <button type="submit" className="btn-add-turno">
                  <Plus size={18} /> Agregar
                </button>
              </form>
            </div>

            {/* Grilla Visual */}
            <div className="dias-grid">
              {turnosPorDia.map(({ dia, spots }) => (
                <div key={dia} className="dia-card">
                  <div className="dia-header">
                    <CalendarDays size={16} /> {dia}
                  </div>
                  <div className="spots-list">
                    {spots.length > 0 ? (
                      spots.map(turno => (
                        <div key={turno.id} className="spot-chip">
                          <Clock size={12} />
                          <span>{turno.hora_spot.slice(0, 5)}</span>
                          <button className="btn-delete-spot" onClick={() => handleDeleteTurno(turno.id)}>
                            <Trash2 size={12} />
                          </button>
                        </div>
                      ))
                    ) : (
                      <span className="no-spots">Cerrado</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default ReservasAdmin;