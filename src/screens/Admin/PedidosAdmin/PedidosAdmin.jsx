import React, { useEffect, useState } from 'react';
import { pedidosService } from '../../../services/pedidos.service';
import { Eye, Clock, Package, CheckCircle, XCircle } from 'lucide-react';
import './PedidosAdmin.css';

const PedidosAdmin = () => {
    const [pedidos, setPedidos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedPedido, setSelectedPedido] = useState(null);

    useEffect(() => {
        loadPedidos();
        // Opcional: Polling cada 30 segundos para nuevos pedidos
        const interval = setInterval(loadPedidos, 30000);
        return () => clearInterval(interval);
    }, []);

    const loadPedidos = async () => {
        try {
            const data = await pedidosService.getPedidos();
            // Ordenar por ID descendente (más recientes primero)
            setPedidos(data.sort((a, b) => b.id - a.id));
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleStatusChange = async (id, nuevoEstado) => {
        try {
            await pedidosService.updateStatus(id, nuevoEstado);
            loadPedidos(); // Recargar lista
        } catch (error) {
            alert("No se pudo actualizar el estado");
        }
    };

    return (
        <div className="pedidos-container">
            <h1 className="page-title">Gestión de Pedidos</h1>
            
            <div className="pedidos-stats">
                <div className="stat-pill">📦 Totales: {pedidos.length}</div>
                <div className="stat-pill">⏳ Pendientes: {pedidos.filter(p => p.estado === 'pendiente').length}</div>
            </div>

            <div className="orders-table-wrapper">
                <table className="orders-table">
                    <thead>
                        <tr>
                            <th>ID Orden</th>
                            <th>Cliente</th>
                            <th>Total</th>
                            <th>Fecha</th>
                            <th>Estado</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {pedidos.map(pedido => (
                            <tr key={pedido.id}>
                                <td><strong>{pedido.numero_orden}</strong></td>
                                <td>
                                    {pedido.nombre_cliente}<br/>
                                    <small style={{color:'#888'}}>{pedido.correo}</small>
                                </td>
                                <td style={{color:'#F1C40F', fontWeight:'bold'}}>${pedido.total}</td>
                                <td>{new Date(pedido.fecha).toLocaleDateString()}</td>
                                <td>
                                    <select 
                                        className={`status-select ${pedido.estado.toLowerCase()}`}
                                        value={pedido.estado}
                                        onChange={(e) => handleStatusChange(pedido.id, e.target.value)}
                                    >
                                        <option value="pendiente">Pendiente</option>
                                        <option value="pagado">Pagado</option>
                                        <option value="en cocina">En Cocina</option>
                                        <option value="enviado">Enviado</option>
                                        <option value="entregado">Entregado</option>
                                        <option value="cancelado">Cancelado</option>
                                    </select>
                                </td>
                                <td>
                                    <button className="btn-view" onClick={() => setSelectedPedido(pedido)}>
                                        <Eye size={18} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* MODAL DE DETALLE MEJORADO */}
            {selectedPedido && (
                <div className="modal-overlay" onClick={() => setSelectedPedido(null)}>
                    <div className="modal-form" onClick={e => e.stopPropagation()} style={{background: '#1a1a1a', color: 'white', maxWidth: '600px'}}>
                        <h2>Detalle del Pedido <span style={{color:'#F1C40F'}}>{selectedPedido.numero_orden}</span></h2>
                        <hr style={{borderColor:'#333', margin:'15px 0'}}/>
                        
                        <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'10px', marginBottom:'20px'}}>
                            <div>
                                <p style={{color:'#888', fontSize:'0.9rem'}}>Cliente</p>
                                <p><strong>{selectedPedido.nombre_cliente}</strong></p>
                                <p style={{fontSize:'0.9rem'}}>{selectedPedido.dni_cliente}</p>
                            </div>
                            <div>
                                <p style={{color:'#888', fontSize:'0.9rem'}}>Dirección</p>
                                <p><strong>{selectedPedido.direccion}</strong></p>
                            </div>
                        </div>
                        
                        <h4 style={{marginTop:20, color:'#F1C40F', borderBottom:'1px solid #333', paddingBottom:'5px'}}>Productos:</h4>
                        <div style={{background:'#222', padding:'15px', borderRadius:'10px', maxHeight:'300px', overflowY:'auto'}}>
                            {selectedPedido.detalles?.map((det, i) => {
                                // Lógica para determinar si es combo o producto
                                const isCombo = det.combo || det.tipo_item === 'combo';
                                const nombre = isCombo ? det.combo?.nombre : det.producto?.nombre;
                                const productosDelCombo = isCombo ? det.combo?.productos : [];

                                return (
                                    <div key={i} style={{borderBottom: '1px solid #333', paddingBottom:'10px', marginBottom:'10px'}}>
                                        {/* Fila Principal: Cantidad - Nombre - Precio */}
                                        <div style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
                                            <div style={{display:'flex', alignItems:'center', gap:'10px'}}>
                                                <span style={{background:'#333', padding:'2px 8px', borderRadius:'4px', fontWeight:'bold'}}>
                                                    {det.cantidad}x
                                                </span>
                                                <span style={{fontWeight: isCombo ? 'bold' : 'normal', fontSize:'1.05rem'}}>
                                                    {nombre || 'Ítem desconocido'}
                                                </span>
                                                {isCombo && (
                                                    <span style={{fontSize:'0.7rem', background:'#F1C40F', color:'black', padding:'2px 6px', borderRadius:'4px', fontWeight:'bold'}}>
                                                        COMBO
                                                    </span>
                                                )}
                                            </div>
                                            <span style={{color:'#F1C40F', fontWeight:'bold'}}>${det.precio_unitario}</span>
                                        </div>

                                        {/* Fila Secundaria: Lista de productos dentro del combo (si existen) */}
                                        {isCombo && productosDelCombo && productosDelCombo.length > 0 && (
                                            <div style={{marginTop:'5px', paddingLeft:'40px'}}>
                                                <ul style={{margin:0, padding:0, listStyle:'none', fontSize:'0.85rem', color:'#aaa'}}>
                                                    {productosDelCombo.map((prod, idx) => (
                                                        <li key={idx}>• {prod.nombre}</li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>

                        <div style={{marginTop:'20px', display:'flex', justifyContent:'space-between', alignItems:'center', fontSize:'1.2rem'}}>
                            <span>Total Pagado:</span>
                            <span style={{color:'#F1C40F', fontWeight:'bold', fontSize:'1.5rem'}}>${selectedPedido.total}</span>
                        </div>

                        <div className="modal-actions" style={{marginTop:'20px'}}>
                            <button className="btn-save" onClick={() => setSelectedPedido(null)} style={{width:'100%'}}>Cerrar Detalle</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PedidosAdmin;