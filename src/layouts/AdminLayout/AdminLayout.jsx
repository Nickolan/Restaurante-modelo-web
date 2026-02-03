import React from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../../store/authSlice';
import { LayoutDashboard, Coffee, Calendar, ShoppingBag, Settings, LogOut } from 'lucide-react';
import './AdminLayout.css';
import Logo from '../../assets/Logo.png'; 

const AdminLayout = () => {
    const { user } = useSelector(state => state.auth);
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const location = useLocation();

    const handleLogout = () => {
        dispatch(logout());
        navigate('/admin/login');
    };

    const menuItems = [
        { path: '/admin/dashboard', icon: <LayoutDashboard size={20}/>, label: 'Resumen' },
        { path: '/admin/pedidos', icon: <ShoppingBag size={20}/>, label: 'Pedidos' },
        { path: '/admin/reservas', icon: <Calendar size={20}/>, label: 'Reservas' },
        { path: '/admin/menu', icon: <Coffee size={20}/>, label: 'Menú & Carta' },
        { path: '/admin/config', icon: <Settings size={20}/>, label: 'Configuración' },
    ];

    return (
        <div className="admin-container">
            {/* --- SIDEBAR --- */}
            <aside className="admin-sidebar">
                <div className="sidebar-header">
                    <img src={Logo} alt="Admin" className="sidebar-logo" />
                    <small>Panel de Control</small>
                </div>

                <nav className="sidebar-nav">
                    {menuItems.map((item) => (
                        <Link 
                            key={item.path} 
                            to={item.path} 
                            className={`nav-item ${location.pathname === item.path ? 'active' : ''}`}
                        >
                            {item.icon}
                            <span>{item.label}</span>
                        </Link>
                    ))}
                </nav>

                <div className="sidebar-footer">
                    <div className="user-info">
                        <div className="user-avatar">{user?.fullName?.charAt(0) || 'A'}</div>
                        <div className="user-details">
                            <span className="user-name">{user?.fullName || 'Admin'}</span>
                            <span className="user-role">{user?.role || 'Administrador'}</span>
                        </div>
                    </div>
                    <button className="btn-logout" onClick={handleLogout} title="Cerrar Sesión">
                        <LogOut size={18} />
                    </button>
                </div>
            </aside>

            {/* --- CONTENIDO PRINCIPAL --- */}
            <main className="admin-content">
                <Outlet /> {/* Aquí se renderizarán las pantallas hijas */}
            </main>
        </div>
    );
};

export default AdminLayout;