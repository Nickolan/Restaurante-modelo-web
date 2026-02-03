import React, { useState, useEffect } from 'react';
import { reservasService } from '../../../services/reservas.service';
import './ReservasAdmin.css';
import { Users, RotateCw, Calendar, Clock, MapPin, X, UserPlus } from 'lucide-react';

// 1. HELPER PARA CALCULAR DÍA (Igual que en cliente) <--- NUEVO
const getDiaSemana = (fechaString) => {
    const dias = ['Domingo', 'Lunes', 'Martes', 'Miercoles', 'Jueves', 'Viernes', 'Sabado'];
    // Forzamos la zona horaria para evitar que '2026-02-02' se lea como el día anterior
    const fecha = new Date(fechaString + 'T00:00:00'); 
    return dias[fecha.getDay()];
};

const ReservasAdmin = () => {
    const [fecha, setFecha] = useState(new Date().toISOString().slice(0, 10));
    const [zonaId, setZonaId] = useState('');
    const [hora, setHora] = useState('');
    
    // Datos maestros
    const [zonas, setZonas] = useState([]);
    const [horarios, setHorarios] = useState([]);
    const [turnosConfig, setTurnosConfig] = useState([]); // <--- 2. NUEVO ESTADO PARA IDS
    
    // Estados visuales
    const [mesasVisuales, setMesasVisuales] = useState([]);
    const [loading, setLoading] = useState(false);
    
    // Modal Manual
    const [selectedMesa, setSelectedMesa] = useState(null);
    const [showManualModal, setShowManualModal] = useState(false);
    const [manualForm, setManualForm] = useState({
        nombre: '', dni: '', correo: '', personas: 2
    });

    // CARGA INICIAL
    useEffect(() => {
        // Ahora cargamos Zonas Y TurnosConfig al mismo tiempo
        Promise.all([
            reservasService.getZonas(),
            reservasService.getAllTurnosConfig() // <--- 3. CARGAMOS LA CONFIGURACIÓN
        ]).then(([zonasData, turnosData]) => {
            setZonas(zonasData);
            if (zonasData.length > 0) setZonaId(zonasData[0].id);
            setTurnosConfig(turnosData || []); 
        }).catch(err => console.error("Error cargando maestros:", err));
    }, []);

    // CARGA DE HORARIOS DISPONIBLES (Strings)
    useEffect(() => {
        if (fecha) {
            reservasService.getHorariosDisponibles(fecha)
                .then(data => {
                    setHorarios(data);
                    // Si hay horarios, pre-seleccionar el primero
                    if (data.length > 0) setHora(data[0]);
                    else setHora('');
                })
                .catch(() => setHorarios([]));
        }
    }, [fecha]);

    // MAPA DE CALOR
    const fetchMapa = async () => {
        if (!fecha || !hora || !zonaId) return;
        setLoading(true);
        setSelectedMesa(null); 
        try {
            const allMesas = await reservasService.getAllMesas();
            const mesasDeZona = allMesas.filter(m => m.zona_id === parseInt(zonaId));
            
            // Traemos las DISPONIBLES según el backend
            const disponibles = await reservasService.getMesasDisponibles(fecha, hora, zonaId, 1);
            const idsDisponibles = new Set(disponibles.map(m => m.id));

            const mapaFinal = mesasDeZona.map(mesa => ({
                ...mesa,
                estadoCalculado: idsDisponibles.has(mesa.id) ? 'free' : 'reserved'
            }));
            setMesasVisuales(mapaFinal);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };
    
    useEffect(() => { fetchMapa(); }, [fecha, hora, zonaId]);

    // MANEJADORES MODAL
    const handleOpenManualModal = () => {
        setManualForm({
            nombre: '', dni: '', correo: '', personas: selectedMesa?.capacidad || 2
        });
        setShowManualModal(true);
    };

    // --- CORRECCIÓN CRÍTICA EN EL SUBMIT ---
    const handleSubmitManual = async (e) => {
        e.preventDefault();
        if (!manualForm.nombre || !manualForm.dni) return alert("Completa nombre y DNI");

        setLoading(true);
        try {
            // 4. BUSCAMOS EL ID DEL TURNO (Misma lógica que en cliente)
            const diaSemana = getDiaSemana(fecha); // Ej: "Viernes"
            
            const turnoEncontrado = turnosConfig.find(t => 
                t.hora_spot === hora &&    // Coincide hora (ej: "21:00")
                t.dia_semana === diaSemana // Coincide día
            );

            if (!turnoEncontrado) {
                throw new Error(`No se encontró un Turno ID configurado para ${diaSemana} a las ${hora}. Revisa la configuración de turnos.`);
            }

            const payload = {
                fecha_reserva: fecha,
                turno_id: turnoEncontrado.id, // <--- AQUI VA EL ID OBLIGATORIO
                mesa_id: selectedMesa.id,
                zona_id: parseInt(zonaId),
                
                nombre_cliente: manualForm.nombre,
                dni_cliente: manualForm.dni,
                correo_cliente: manualForm.correo || 'admin@local.com',
                numero_personas: parseInt(manualForm.personas),
                estado: 'confirmada' // Entra directo
            };

            await reservasService.crearReserva(payload);
            
            alert("✅ Reserva creada con éxito");
            setShowManualModal(false);
            setSelectedMesa(null);
            fetchMapa(); // Recargar mapa
            
        } catch (error) {
            console.error(error);
            // Mensaje de error más amigable
            const msg = error.response?.data?.message || error.message;
            alert(`Error: ${msg}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="reservas-dashboard">
            <h1 style={{marginBottom: 20}}>Gestión de Reservas</h1>

             {/* BARRA SUPERIOR */}
             <div className="control-bar">
                 <div className="control-group">
                    <label className="control-label"><Calendar size={14}/> Fecha</label>
                    <input type="date" className="control-input" value={fecha} onChange={e => setFecha(e.target.value)} />
                </div>
                <div className="control-group">
                    <label className="control-label"><MapPin size={14}/> Zona</label>
                    <select className="control-select" value={zonaId} onChange={e => setZonaId(e.target.value)}>
                        {zonas.map(z => <option key={z.id} value={z.id}>{z.nombre}</option>)}
                    </select>
                </div>
                <div className="control-group">
                    <label className="control-label"><Clock size={14}/> Horario</label>
                    <select className="control-select" value={hora} onChange={e => setHora(e.target.value)}>
                        {horarios.length === 0 && <option>Cerrado</option>}
                        {horarios.map(h => <option key={h} value={h}>{h}</option>)}
                    </select>
                </div>
                <button className="btn-refresh" onClick={fetchMapa} title="Recargar Disponibilidad">
                    <RotateCw size={20} className={loading ? 'spin' : ''}/>
                </button>
            </div>

            {/* PLANO DE MESAS */}
            <div className="floor-plan">
                {mesasVisuales.length === 0 && !loading && <p>Selecciona fecha y horario para ver disponibilidad.</p>}
                
                {mesasVisuales.map(mesa => (
                    <div 
                        key={mesa.id} 
                        className={`table-card status-${mesa.estadoCalculado} ${selectedMesa?.id === mesa.id ? 'status-selected' : ''}`}
                        onClick={() => setSelectedMesa(mesa)}
                    >
                        <span className="table-number">{mesa.numero_mesa}</span>
                        <div className="table-status-text">{mesa.estadoCalculado === 'free' ? 'Libre' : 'Ocupada'}</div>
                    </div>
                ))}
            </div>

            {/* PANEL LATERAL */}
            <div className={`details-panel ${selectedMesa ? 'open' : ''}`}>
                <div className="panel-header">
                    <h2>Mesa {selectedMesa?.numero_mesa}</h2>
                    <button className="btn-close" onClick={() => setSelectedMesa(null)}><X /></button>
                </div>

                {selectedMesa && (
                    <div>
                        <p><strong>Capacidad:</strong> {selectedMesa.capacidad} pax</p>
                        
                        {selectedMesa.estadoCalculado === 'free' ? (
                            <div style={{marginTop: 30}}>
                                <div style={{textAlign:'center', marginBottom:20, color:'#2ecc71'}}>
                                    <UserPlus size={40} />
                                    <p>Mesa Disponible</p>
                                </div>
                                <button className="btn-refresh" style={{width:'100%', background:'#F1C40F', color:'black', fontWeight:'bold'}} onClick={handleOpenManualModal}>
                                    + Crear Reserva
                                </button>
                            </div>
                        ) : (
                            <div style={{marginTop: 30, textAlign:'center', color:'#e74c3c'}}>
                                <p style={{fontWeight:'bold'}}>RESERVADA</p>
                                <p style={{fontSize:'0.9rem', opacity:0.7}}>Esta mesa ya está ocupada en el sistema para este turno.</p>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* MODAL FORMULARIO */}
            {showManualModal && (
                <div className="manual-modal-overlay">
                    <div className="manual-modal-content">
                        <button className="btn-close-modal" onClick={() => setShowManualModal(false)}><X size={24}/></button>
                        
                        <div className="manual-modal-header">
                            <h3>Nueva Reserva Manual</h3>
                            <p style={{color:'#F1C40F'}}>Mesa {selectedMesa?.numero_mesa} • {fecha} • {hora}</p>
                        </div>

                        <form onSubmit={handleSubmitManual}>
                            <div className="form-row">
                                <label>Nombre del Cliente</label>
                                <input className="manual-input" placeholder="Ej: Juan Pérez" autoFocus
                                    value={manualForm.nombre} onChange={e => setManualForm({...manualForm, nombre: e.target.value})}
                                />
                            </div>
                            <div className="form-row">
                                <label>DNI / Identificación</label>
                                <input className="manual-input" placeholder="Documento"
                                    value={manualForm.dni} onChange={e => setManualForm({...manualForm, dni: e.target.value})}
                                />
                            </div>
                            <div className="form-row" style={{display:'flex', gap:15}}>
                                <div style={{flex:1}}>
                                    <label>Personas</label>
                                    <input type="number" className="manual-input" min="1" max={selectedMesa?.capacidad + 2}
                                        value={manualForm.personas} onChange={e => setManualForm({...manualForm, personas: e.target.value})}
                                    />
                                </div>
                                <div style={{flex:2}}>
                                    <label>Correo (Opcional)</label>
                                    <input type="email" className="manual-input" placeholder="juan@mail.com"
                                        value={manualForm.correo} onChange={e => setManualForm({...manualForm, correo: e.target.value})}
                                    />
                                </div>
                            </div>

                            <button type="submit" className="btn-confirm-manual" disabled={loading}>
                                {loading ? 'Procesando...' : 'Confirmar Reserva'}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ReservasAdmin;