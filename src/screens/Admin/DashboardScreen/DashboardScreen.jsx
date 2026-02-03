import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { 
    TrendingUp, 
    Users, 
    ShoppingCart, 
    CalendarCheck, 
    Clock, 
    CheckCircle, 
    AlertCircle 
} from 'lucide-react';
import './DashboardScreen.css';

const DashboardScreen = () => {
    // Estado inicial con la estructura que devuelve tu nuevo endpoint
    const [stats, setStats] = useState({
        ventasHoy: 0,
        pedidosPendientes: 0,
        reservasHoy: 0,
        clientesUnicos: 0,
        ultimosPedidos: []
    });
    
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        setLoading(true);
        try {
            // El interceptor de Axios que configuramos antes enviará el token automáticamente
            const response = await axios.get('/admin/stats');
            console.log(response.data);
            
            setStats(response.data);
            setError(null);
        } catch (err) {
            console.error("Error fetching admin stats:", err);
            setError("No se pudieron cargar las estadísticas. Verifica la conexión.");
        } finally {
            setLoading(false);
        }
    };

    // Helper para el estilo de los estados en la tabla
    const getStatusBadgeClass = (estado) => {
        const e = estado.toLowerCase();
        if (e === 'pagado' || e === 'entregado') return 'status-green';
        if (e === 'pendiente' || e === 'en cocina') return 'status-yellow';
        if (e === 'cancelado') return 'status-red';
        return '';
    };

    return (
        <div className="dashboard-wrapper">
            {/* Título y Fecha Actual */}
            <div className="dashboard-header">
                <div>
                    <h1 className="dashboard-title">Resumen de Operaciones</h1>
                    <p className="dashboard-date">
                        {new Date().toLocaleDateString('es-AR', { 
                            weekday: 'long', 
                            year: 'numeric', 
                            month: 'long', 
                            day: 'numeric' 
                        })}
                    </p>
                </div>
                <button className="btn-refresh-stats" onClick={fetchDashboardData} disabled={loading}>
                    <Clock size={16} /> {loading ? 'Actualizando...' : 'Actualizar ahora'}
                </button>
            </div>

            {error && (
                <div className="error-banner">
                    <AlertCircle size={20} /> {error}
                </div>
            )}

            {/* --- GRID DE KPIs --- */}
            <div className="kpi-grid">
                <div className="kpi-card">
                    <div className="kpi-icon icon-gold"><TrendingUp size={24}/></div>
                    <div className="kpi-info">
                        <h3>Ventas de Hoy</h3>
                        <span className="kpi-value">
                            {loading ? '...' : `$${Number(stats.ventasHoy).toLocaleString('es-AR')}`}
                        </span>
                    </div>
                </div>

                <div className="kpi-card">
                    <div className="kpi-icon icon-blue"><ShoppingCart size={24}/></div>
                    <div className="kpi-info">
                        <h3>Pedidos Pendientes</h3>
                        <span className="kpi-value">{loading ? '...' : stats.pedidosPendientes}</span>
                    </div>
                </div>

                <div className="kpi-card">
                    <div className="kpi-icon icon-green"><CalendarCheck size={24}/></div>
                    <div className="kpi-info">
                        <h3>Reservas Hoy</h3>
                        <span className="kpi-value">{loading ? '...' : stats.reservasHoy}</span>
                    </div>
                </div>

                <div className="kpi-card">
                    <div className="kpi-icon icon-purple"><Users size={24}/></div>
                    <div className="kpi-info">
                        <h3>Clientes Únicos</h3>
                        <span className="kpi-value">{loading ? '...' : stats.clientesUnicos}</span>
                    </div>
                </div>
            </div>

            {/* --- SECCIÓN INFERIOR --- */}
            <div className="dashboard-sections">
                
                {/* TABLA DE ÚLTIMOS PEDIDOS */}
                <div className="section-box recent-orders">
                    <h2>Últimas Órdenes</h2>
                    <div className="table-responsive">
                        <table className="admin-mini-table">
                            <thead>
                                <tr>
                                    <th>Orden</th>
                                    <th>Cliente</th>
                                    <th>Total</th>
                                    <th>Estado</th>
                                </tr>
                            </thead>
                            <tbody>
                                {stats.ultimosPedidos.length > 0 ? (
                                    stats.ultimosPedidos.map((p) => (
                                        <tr key={p.id}>
                                            <td><strong>#{p.numero_orden}</strong></td>
                                            <td>{p.nombre_cliente}</td>
                                            <td className="text-gold">${p.total}</td>
                                            <td>
                                                <span className={`status-pill ${getStatusBadgeClass(p.estado)}`}>
                                                    {p.estado}
                                                </span>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="4" className="empty-state">No hay pedidos registrados hoy.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* ESTADO DEL SERVIDOR */}
                <div className="section-box system-status">
                    <h2>Estado del Sistema</h2>
                    <div className="status-item">
                        <CheckCircle size={20} color={loading ? "#888" : "#2ecc71"} />
                        <div>
                            <strong>Servidor API</strong>
                            <p>{loading ? 'Consultando...' : 'Conectado y Sincronizado'}</p>
                        </div>
                    </div>
                    <div className="status-item">
                        <Clock size={20} color="#3498db" />
                        <div>
                            <strong>Último Cierre</strong>
                            <p>Hace 14 horas</p>
                        </div>
                    </div>
                    
                    <div className="system-tip">
                        <p>💡 Recuerda revisar los pedidos pendientes antes del cambio de turno.</p>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default DashboardScreen;