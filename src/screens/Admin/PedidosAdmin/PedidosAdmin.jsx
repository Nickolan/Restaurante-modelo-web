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

            {/* MODAL DE DETALLE (Simplificado) */}
            {selectedPedido && (
                <div className="modal-overlay" onClick={() => setSelectedPedido(null)}>
                    <div className="modal-form" onClick={e => e.stopPropagation()} style={{background: '#1a1a1a', color: 'white'}}>
                        <h2>Detalle del Pedido {selectedPedido.numero_orden}</h2>
                        <hr style={{borderColor:'#333', margin:'15px 0'}}/>
                        
                        <p><strong>Dirección:</strong> {selectedPedido.direccion}</p>
                        <p><strong>DNI:</strong> {selectedPedido.dni_cliente}</p>
                        
                        <h4 style={{marginTop:20, color:'#F1C40F'}}>Productos:</h4>
                        <div style={{background:'#222', padding:15, borderRadius:10}}>
                            {selectedPedido.detalles?.map((det, i) => (
                                <div key={i} style={{display:'flex', justifyContent:'space-between', marginBottom:10}}>
                                    <span>{det.cantidad}x {det.producto?.nombre || 'Producto'}</span>
                                    <span>${det.precio_unitario}</span>
                                </div>
                            ))}
                        </div>

                        <div className="modal-actions">
                            <button className="btn-save" onClick={() => setSelectedPedido(null)}>Cerrar</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PedidosAdmin;