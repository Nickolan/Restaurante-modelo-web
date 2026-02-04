import React, { useState, useEffect } from 'react';
import './ReservaModal.css';
import { reservasService } from '../../services/reservas.service';
import { X, Calendar, User, Clock, MapPin } from 'lucide-react';

// --- HELPERS DE NORMALIZACIÓN (Igual que en Admin) ---
const normalizarTexto = (txt) => {
    if (!txt) return "";
    return txt.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
};

const normalizarHora = (hora) => {
    if (!hora) return "";
    return hora.substring(0, 5); // "20:00:00" -> "20:00"
};

const getDiaSemana = (fechaString) => {
    const dias = ['Domingo', 'Lunes', 'Martes', 'Miercoles', 'Jueves', 'Viernes', 'Sabado'];
    // Forzamos hora local para evitar saltos de día por timezone
    const fecha = new Date(fechaString + 'T00:00:00'); 
    return dias[fecha.getDay()];
};

const ReservaModal = ({ isOpen, onClose }) => {
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    
    // Estados de Datos
    const [zonas, setZonas] = useState([]);
    const [horarios, setHorarios] = useState([]);
    const [turnosConfig, setTurnosConfig] = useState([]); // Nuestra fuente de verdad
    const [mesas, setMesas] = useState([]);

    // Selección del Usuario
    const [selection, setSelection] = useState({
        fecha: '',
        personas: 2,
        zona_id: null,
        hora: null,
        mesa_id: null,
        cliente: { nombre: '', dni: '', correo: '' }
    });

    const [reservaConfirmada, setReservaConfirmada] = useState(null);

    // Cargar Zonas y Configuración al abrir
    useEffect(() => {
        if (isOpen) {
            setLoading(true);
            Promise.all([
                reservasService.getZonas(),
                reservasService.getAllTurnosConfig() 
            ]).then(([zonasData, turnosData]) => {
                setZonas(zonasData);
                setTurnosConfig(turnosData || []); // Aseguramos array
                setStep(1);
                setReservaConfirmada(null);
                setSelection(prev => ({...prev, fecha: '', hora: null, mesa_id: null})); // Reset parcial
                setLoading(false);
            }).catch(err => {
                console.error(err);
                setLoading(false);
            });
        }
    }, [isOpen]);

    // --- MANEJADORES DE PASOS ---

    // Paso 1 -> 2: Calcular Horarios (LÓGICA LOCAL)
    const handleSearchHorarios = () => {
        if (!selection.fecha || !selection.zona_id) return alert("Selecciona fecha y zona");
        
        setLoading(true);
        try {
            const diaActual = getDiaSemana(selection.fecha); // Ej: "Viernes"
            
            // 1. Filtramos los turnos configurados para ese día
            const turnosDelDia = turnosConfig.filter(t => 
                normalizarTexto(t.dia_semana) === normalizarTexto(diaActual)
            );

            // 2. Extraemos las horas limpias (sin duplicados)
            const horasDisponibles = [...new Set(turnosDelDia.map(t => normalizarHora(t.hora_spot)))];
            
            // 3. Ordenamos
            horasDisponibles.sort();

            console.log(`Día: ${diaActual}, Horarios encontrados:`, horasDisponibles);

            setHorarios(horasDisponibles);
            setStep(2);
        } catch (e) {
            console.error(e);
            alert("Error al procesar horarios");
        } finally {
            setLoading(false);
        }
    };

    // Paso 2 -> 3: Buscar Mesas (Mantenemos llamada al backend para disponibilidad real)
    const handleSelectHora = async (hora) => {
        setSelection({ ...selection, hora });
        setLoading(true);
        try {
            const mesasDisponibles = await reservasService.getMesasDisponibles(
                selection.fecha,
                hora, // Enviamos "20:00", el backend lo maneja
                selection.zona_id,
                selection.personas
            );
            setMesas(mesasDisponibles);
            setStep(3);
        } catch (e) {
            alert("Error al buscar mesas disponibles");
        } finally {
            setLoading(false);
        }
    };

    // Paso 4: Confirmar Reserva (Buscando ID estricto)
    const handleSubmit = async () => {
        setLoading(true);
        try {
            const diaSemana = getDiaSemana(selection.fecha);
            
            // BÚSQUEDA ROBUSTA DEL ID
            const turnoEncontrado = turnosConfig.find(t => 
                normalizarHora(t.hora_spot) === normalizarHora(selection.hora) &&
                normalizarTexto(t.dia_semana) === normalizarTexto(diaSemana)
            );

            if (!turnoEncontrado) {
                throw new Error(`Error de configuración: No se encontró ID de turno para ${diaSemana} a las ${selection.hora}`);
            }

            const payload = {
                fecha_reserva: selection.fecha,
                hora: selection.hora,
                mesa_id: selection.mesa_id,
                turno_id: turnoEncontrado.id, // <--- ID SEGURO
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
                                value={selection.fecha}
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
                            {loading ? 'Cargando...' : 'Buscar Horarios'}
                        </button>
                    </div>
                )}

                {/* --- PASO 2: SELECCIONAR HORARIO --- */}
                {step === 2 && (
                    <div className="step-content">
                        <h3>Horarios para el {selection.fecha}</h3>
                        <div className="grid-selection">
                            {horarios.map(hora => (
                                <button key={hora} className="selection-btn" onClick={() => handleSelectHora(hora)}>
                                    {hora}
                                </button>
                            ))}
                        </div>
                        {horarios.length === 0 && (
                            <div style={{textAlign:'center', color:'#e74c3c', marginTop:20}}>
                                <p>No hay turnos configurados para este día de la semana.</p>
                            </div>
                        )}
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
                                    <div>Mesa {mesa.numero_mesa}</div>
                                    <small>{mesa.capacidad} pax</small>
                                </button>
                            ))}
                        </div>
                        {mesas.length === 0 && <p style={{color:'red', textAlign:'center', marginTop:20}}>No hay mesas disponibles con esa capacidad.</p>}
                        
                        <div className="modal-actions">
                            <button className="btn-back" onClick={() => setStep(2)}>Atrás</button>
                        </div>
                    </div>
                )}

                {/* --- PASO 4: DATOS DEL CLIENTE --- */}
                {step === 4 && (
                    <div className="step-content">
                        <h3>Tus Datos</h3>
                        <div className="input-group">
                            <input placeholder="Nombre Completo" className="modal-input"
                                onChange={e => setSelection({...selection, cliente: {...selection.cliente, nombre: e.target.value}})}
                            />
                        </div>
                        <div className="input-group">
                            <input placeholder="DNI (Identificación)" className="modal-input"
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
                                {loading ? 'Reservando...' : 'Confirmar Reserva'}
                            </button>
                        </div>
                    </div>
                )}

                {/* --- PASO 5: ÉXITO --- */}
                {step === 5 && reservaConfirmada && (
                    <div className="step-content" style={{textAlign:'center'}}>
                        <div style={{color:'#2ecc71', marginBottom:15}}>
                            <Calendar size={48} />
                        </div>
                        <h2 style={{color: 'white'}}>¡Reserva Confirmada!</h2>
                        <div style={{background:'#222', padding:'20px', borderRadius:'10px', margin:'20px 0', border:'1px solid #333'}}>
                            <h1 style={{color:'#F1C40F', fontSize:'2rem', margin:0}}>{reservaConfirmada.numero_reserva}</h1>
                            <p style={{color:'#aaa', margin:'5px 0 0'}}>Código de Reserva</p>
                        </div>
                        <p style={{fontSize:'0.9rem', color:'#ccc'}}>
                            Te esperamos el <strong>{selection.fecha}</strong> a las <strong>{selection.hora}</strong>.
                        </p>
                        <button className="btn-confirm" onClick={onClose} style={{marginTop:20}}>Cerrar</button>
                    </div>
                )}

            </div>
        </div>
    );
};

export default ReservaModal;