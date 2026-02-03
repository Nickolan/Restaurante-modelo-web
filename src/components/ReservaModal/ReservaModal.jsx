import React, { useState, useEffect } from 'react';
import './ReservaModal.css';
import { reservasService } from '../../services/reservas.service';
import { X, Calendar, User, Clock, MapPin } from 'lucide-react';

const getDiaSemana = (fechaString) => {
    const dias = ['Domingo', 'Lunes', 'Martes', 'Miercoles', 'Jueves', 'Viernes', 'Sabado'];
    // Ajuste de zona horaria simple para evitar desfases
    const fecha = new Date(fechaString + 'T00:00:00'); 
    return dias[fecha.getDay()];
};

const ReservaModal = ({ isOpen, onClose }) => {
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    
    // Estados de Datos
    const [zonas, setZonas] = useState([]);
    const [horarios, setHorarios] = useState([]);
    const [turnosConfig, setTurnosConfig] = useState([]);
    const [mesas, setMesas] = useState([]);

    // Selección del Usuario
    const [selection, setSelection] = useState({
        fecha: '',
        personas: 2,
        zona_id: null,
        hora: null,     // El string "20:00"
        turno_id: null, // <--- EL ID QUE FALTABA
        mesa_id: null,
        cliente: { nombre: '', dni: '', correo: '' }
    });

    const [reservaConfirmada, setReservaConfirmada] = useState(null);

    // Cargar Zonas al abrir
    useEffect(() => {
        if (isOpen) {
            setLoading(true);
            Promise.all([
                reservasService.getZonas(),
                reservasService.getAllTurnosConfig() // Traemos todos los turnos para tenerlos en memoria
            ]).then(([zonasData, turnosData]) => {
                setZonas(zonasData);
                setTurnosConfig(turnosData);
                setStep(1);
                setReservaConfirmada(null);
                setLoading(false);
            }).catch(err => {
                console.error(err);
                setLoading(false);
            });
        }
    }, [isOpen]);

    // --- MANEJADORES DE PASOS ---

    // Paso 1 -> 2: Buscar Horarios
    const handleSearchHorarios = async () => {
        if (!selection.fecha || !selection.zona_id) return alert("Selecciona fecha y zona");
        setLoading(true);
        try {
            const horas = await reservasService.getHorariosDisponibles(selection.fecha);
            console.log(horas);
            
            setHorarios(horas);
            setStep(2);
        } catch (e) {
            alert("Error al buscar horarios");
        } finally {
            setLoading(false);
        }
    };

    // Paso 2 -> 3: Buscar Mesas (La lógica Core)
    const handleSelectHora = async (hora) => {
        console.log("Hora seleccionada", hora);
        
        setSelection({ ...selection, hora });
        setLoading(true);
        try {
            // AQUÍ SE APLICA LA LÓGICA DE NEGOCIO:
            // Buscamos mesas que cumplan capacidad Y zona Y no estén reservadas
            const mesasDisponibles = await reservasService.getMesasDisponibles(
                selection.fecha,
                hora,
                selection.zona_id,
                selection.personas
            );
            setMesas(mesasDisponibles);
            setStep(3);
        } catch (e) {
            alert("Error al buscar mesas");
        } finally {
            setLoading(false);
        }
    };

    // Paso 4: Confirmar Reserva
    const handleSubmit = async () => {
        setLoading(true);
        try {
            // 1. Encontrar el turno_id correcto
            const diaSemana = getDiaSemana(selection.fecha); // Ej: "Viernes"
            
            // Buscamos en la lista maestra un turno que coincida en HORA y DÍA
            const turnoEncontrado = turnosConfig.find(t => 
                t.hora_spot === selection.hora &&  // "20:00" === "20:00"
                t.dia_semana === diaSemana         // "Viernes" === "Viernes"
            );

            if (!turnoEncontrado) {
                throw new Error(`No se encontró configuración de turno para ${diaSemana} a las ${selection.hora}`);
            }

            console.log("Turno ID encontrado:", turnoEncontrado.id);

            const payload = {
                fecha_reserva: selection.fecha,
                hora: selection.hora,
                mesa_id: selection.mesa_id,
                turno_id: turnoEncontrado.id, // <--- AQUI ENVIAMOS EL ID REAL
                numero_personas: parseInt(selection.personas),
                nombre_cliente: selection.cliente.nombre,
                dni_cliente: selection.cliente.dni,
                correo_cliente: selection.cliente.correo,
            };

            const response = await reservasService.crearReserva(payload);
            setReservaConfirmada(response);
            setStep(5);
        } catch (e) {
            console.error(e);
            alert(e.message || "Error al crear la reserva");
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <button className="close-btn" onClick={onClose}><X /></button>
                
                {/* --- HEADER --- */}
                <div className="modal-header">
                    <h2 className="modal-title">
                        {step === 5 ? '¡Reserva Exitosa!' : 'Reservar Mesa'}
                    </h2>
                    {step < 5 && (
                        <div className="step-indicator">
                            {[1,2,3,4].map(s => (
                                <div key={s} className={`dot ${step >= s ? 'active' : ''}`}></div>
                            ))}
                        </div>
                    )}
                </div>

                {/* --- PASO 1: FECHA, PERSONAS Y ZONA --- */}
                {step === 1 && (
                    <div className="step-content">
                        <div className="input-group">
                            <label><Calendar size={16}/> Fecha</label>
                            <input type="date" className="modal-input" 
                                onChange={e => setSelection({...selection, fecha: e.target.value})}
                            />
                        </div>
                        <div className="input-group">
                            <label><User size={16}/> Personas</label>
                            <input type="number" min="1" max="10" className="modal-input" 
                                value={selection.personas}
                                onChange={e => setSelection({...selection, personas: e.target.value})}
                            />
                        </div>
                        <div className="input-group">
                            <label><MapPin size={16}/> Zona</label>
                            <div className="grid-selection">
                                {zonas.map(z => (
                                    <button key={z.id} 
                                        className={`selection-btn ${selection.zona_id === z.id ? 'selected' : ''}`}
                                        onClick={() => setSelection({...selection, zona_id: z.id})}
                                    >
                                        {z.nombre}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <button className="btn-confirm" style={{width:'100%', marginTop:'20px'}} 
                            onClick={handleSearchHorarios} disabled={loading}>
                            {loading ? 'Buscando...' : 'Buscar Horarios'}
                        </button>
                    </div>
                )}

                {/* --- PASO 2: SELECCIONAR HORARIO --- */}
                {step === 2 && (
                    <div className="step-content">
                        <h3>Selecciona una hora para el {selection.fecha}</h3>
                        <div className="grid-selection">
                            {horarios.map(hora => (
                                <button key={hora} className="selection-btn" onClick={() => handleSelectHora(hora)}>
                                    {hora}
                                </button>
                            ))}
                        </div>
                        {horarios.length === 0 && <p>No hay turnos disponibles para este día.</p>}
                        <div className="modal-actions">
                            <button className="btn-back" onClick={() => setStep(1)}>Atrás</button>
                        </div>
                    </div>
                )}

                {/* --- PASO 3: SELECCIONAR MESA --- */}
                {step === 3 && (
                    <div className="step-content">
                        <h3>Mesas Disponibles</h3>
                        <p style={{color:'#aaa', fontSize:'0.9rem'}}>Capacidad para {selection.personas} personas</p>
                        
                        <div className="grid-selection">
                            {mesas.map(mesa => (
                                <button key={mesa.id} 
                                    className={`selection-btn ${selection.mesa_id === mesa.id ? 'selected' : ''}`}
                                    onClick={() => {
                                        setSelection({...selection, mesa_id: mesa.id});
                                        setStep(4);
                                    }}
                                >
                                    <div>{mesa.numero}</div>
                                    <small>{mesa.descripcion}</small>
                                </button>
                            ))}
                        </div>
                        {mesas.length === 0 && <p style={{color:'red'}}>Lo sentimos, no hay mesas con esa capacidad en este horario.</p>}
                        
                        <div className="modal-actions">
                            <button className="btn-back" onClick={() => setStep(2)}>Atrás</button>
                        </div>
                    </div>
                )}

                {/* --- PASO 4: DATOS DEL CLIENTE --- */}
                {step === 4 && (
                    <div className="step-content">
                        <h3>Confirmar Reserva</h3>
                        <div className="input-group">
                            <input placeholder="Nombre Completo" className="modal-input"
                                onChange={e => setSelection({...selection, cliente: {...selection.cliente, nombre: e.target.value}})}
                            />
                        </div>
                        <div className="input-group">
                            <input placeholder="DNI" className="modal-input"
                                onChange={e => setSelection({...selection, cliente: {...selection.cliente, dni: e.target.value}})}
                            />
                        </div>
                        <div className="input-group">
                            <input placeholder="Correo Electrónico" className="modal-input"
                                onChange={e => setSelection({...selection, cliente: {...selection.cliente, correo: e.target.value}})}
                            />
                        </div>

                        <div className="modal-actions">
                            <button className="btn-back" onClick={() => setStep(3)}>Atrás</button>
                            <button className="btn-confirm" onClick={handleSubmit} disabled={loading}>
                                {loading ? 'Confirmando...' : 'Reservar Ahora'}
                            </button>
                        </div>
                    </div>
                )}

                {/* --- PASO 5: ÉXITO --- */}
                {step === 5 && reservaConfirmada && (
                    <div className="step-content" style={{textAlign:'center'}}>
                        <p>Tu reserva ha sido confirmada.</p>
                        <div style={{background:'#222', padding:'15px', borderRadius:'10px', margin:'20px 0'}}>
                            <h1 style={{color:'#F1C40F'}}>{reservaConfirmada.numero_reserva}</h1>
                            <p>Estado: {reservaConfirmada.estado}</p>
                        </div>
                        <p>Te enviamos los detalles a tu correo.</p>
                        <button className="btn-confirm" onClick={onClose}>Cerrar</button>
                    </div>
                )}

            </div>
        </div>
    );
};

export default ReservaModal;