import React, { useState } from 'react';
import axios from 'axios';
import './ConsultaScreen.css';
import { Search, ShoppingBag, Calendar, CheckCircle, Clock } from 'lucide-react';

const ConsultaScreen = () => {
    const [dni, setDni] = useState('');
    const [numero, setNumero] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    
    // Almacena el objeto respuesta y el tipo ('pedido' o 'reserva')
    const [resultado, setResultado] = useState(null); 
    const [tipo, setTipo] = useState(null); 

    const handleBuscar = async () => {
        if (!dni || !numero) {
            setError("Por favor ingresa ambos campos.");
            return;
        }

        setLoading(true);
        setError('');
        setResultado(null);

        try {
            // ESTRATEGIA: Intentamos buscar en paralelo en ambos endpoints
            // Esto es eficiente y cubre el caso donde el usuario no sabe distinguir
            const [pedidoRes, reservaRes] = await Promise.allSettled([
                axios.get(`/pedidos/buscar?dni=${dni}&numero=${numero}`),
                axios.get(`/reservas/buscar?dni=${dni}&numero=${numero}`)
            ]);

            // 1. Verificamos si se encontró un PEDIDO
            if (pedidoRes.status === 'fulfilled' && pedidoRes.value.data) {
                setResultado(pedidoRes.value.data);
                setTipo('pedido');
                setLoading(false);
                return;
            }

            // 2. Verificamos si se encontró una RESERVA
            if (reservaRes.status === 'fulfilled' && reservaRes.value.data) {
                setResultado(reservaRes.value.data);
                setTipo('reserva');
                setLoading(false);
                return;
            }

            // 3. Si ninguno trajo datos
            setError("No encontramos ninguna orden o reserva con esos datos. Verifica que el número y DNI sean correctos.");

        } catch (err) {
            console.error(err);
            setError("Ocurrió un error al consultar. Intenta nuevamente.");
        } finally {
            setLoading(false);
        }
    };

    // Función auxiliar para renderizar el badge de estado
    const renderStatus = (estado) => {
        const est = estado?.toLowerCase();
        let cssClass = 'status-yellow'; // pendiente
        if (est === 'pagado' || est === 'confirmada') cssClass = 'status-green';
        if (est === 'cancelado') cssClass = 'status-red';

        return <span className={`status-badge ${cssClass}`}>{estado}</span>;
    };

    return (
        <div className="consulta-container">
            <div className="consulta-overlay"></div>
            
            <div className="consulta-content">
                <h1 className="consulta-title">Consulta tu Orden o Reserva</h1>
                <p className="consulta-subtitle">Ingresa los datos para ver estado en tiempo real</p>

                {/* --- INPUTS --- */}
                <div className="inputs-row">
                    <input 
                        type="text" 
                        placeholder="N° Orden / Reserva" 
                        className="consulta-input"
                        value={numero}
                        onChange={(e) => setNumero(e.target.value)}
                    />
                    <input 
                        type="text" 
                        placeholder="DNI / Documento" 
                        className="consulta-input"
                        value={dni}
                        onChange={(e) => setDni(e.target.value)}
                    />
                </div>

                {/* --- BOTÓN --- */}
                <button className="btn-search" onClick={handleBuscar} disabled={loading}>
                    {loading ? (
                        <span><Search size={20} style={{verticalAlign:'middle'}}/> Buscando...</span>
                    ) : (
                        "Buscar Estado"
                    )}
                </button>

                {/* --- MENSAJE ERROR --- */}
                {error && <div className="error-msg">{error}</div>}

                {/* --- RESULTADO TARJETA --- */}
                {resultado && (
                    <div className="result-card">
                        
                        {/* CABECERA DE RESULTADO */}
                        <div className="result-header">
                            <div style={{display:'flex', alignItems:'center', gap:'10px'}}>
                                {tipo === 'pedido' ? <ShoppingBag color="#F1C40F" size={30}/> : <Calendar color="#F1C40F" size={30}/>}
                                <div>
                                    <h3 style={{margin:0}}>{tipo === 'pedido' ? 'Detalle de Pedido' : 'Reserva de Mesa'}</h3>
                                    <small style={{color:'#888'}}>{tipo === 'pedido' ? resultado.numero_orden : resultado.numero_reserva}</small>
                                </div>
                            </div>
                            {renderStatus(resultado.estado)}
                        </div>

                        {/* CUERPO - SI ES PEDIDO */}
                        {tipo === 'pedido' && (
                            <>
                                <div className="result-detail-row">
                                    <span className="label">Cliente:</span>
                                    <span className="value">{resultado.nombre_cliente}</span>
                                </div>
                                <div className="result-detail-row">
                                    <span className="label">Total:</span>
                                    <span className="value" style={{fontSize:'1.2rem', color:'#F1C40F'}}>${resultado.total}</span>
                                </div>
                                <div className="result-detail-row">
                                    <span className="label">Dirección:</span>
                                    <span className="value" style={{textAlign:'right', fontSize:'0.9rem'}}>{resultado.direccion}</span>
                                </div>
                                
                                {/* Lista de productos si el backend los devuelve (detalle_pedido) */}
                                {resultado.detalles && (
                                    <div className="items-list">
                                        <p style={{margin:'0 0 10px 0', fontSize:'0.9rem', color:'#000'}}>Productos:</p>
                                        {resultado.detalles.map((d, i) => (
                                            <div key={i} style={{display:'flex', justifyContent:'space-between', marginBottom:'5px', color: '#000'}}>
                                                <span>{d.cantidad}x {d.producto?.nombre || d.combo?.nombre || 'Item'}</span>
                                                <b>${d.precio_unitario}</b>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </>
                        )}

                        {/* CUERPO - SI ES RESERVA */}
                        {tipo === 'reserva' && (
                            <>
                                <div className="result-detail-row">
                                    <span className="label">Fecha:</span>
                                    <span className="value">{resultado.fecha_reserva}</span>
                                </div>
                                <div className="result-detail-row">
                                    <span className="label">Hora:</span>
                                    <span className="value"><Clock size={16} style={{verticalAlign:'middle'}}/> {resultado.turno?.hora_spot || resultado.hora || 'S/D'}</span>
                                </div>
                                <div className="result-detail-row">
                                    <span className="label">Mesa:</span>
                                    <span className="value">
                                        {resultado.mesa ? `Mesa ${resultado.mesa.numero_mesa} (${resultado.mesa.zona?.nombre})` : 'Asignación pendiente'}
                                    </span>
                                </div>
                                <div className="result-detail-row">
                                    <span className="label">Personas:</span>
                                    <span className="value">{resultado.numero_personas}</span>
                                </div>
                                
                                <div style={{marginTop:'20px', textAlign:'center', color:'#888', fontSize:'0.9rem'}}>
                                    <CheckCircle size={16} style={{verticalAlign:'middle', marginRight:'5px'}}/>
                                    Preséntate con tu DNI al llegar.
                                </div>
                            </>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ConsultaScreen;