import React, { useState } from 'react'; // 1. Importamos useState
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../../store/authSlice';
// 2. Importamos los iconos Menu y X
import { 
    LayoutDashboard, Coffee, Calendar, ShoppingBag, 
    Settings, LogOut, MapPin, Menu, X 
} from 'lucide-react';
import './AdminLayout.css';
import Logo from '../../assets/Logo.png'; 

const AdminLayout = () => {
    const { user } = useSelector(state => state.auth);
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const location = useLocation();

    // 3. Estado para controlar la sidebar en móvil
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    const handleLogout = () => {
        dispatch(logout());
        navigate('/admin/login');
    };

    const menuItems = [
        { path: '/admin/dashboard', icon: <LayoutDashboard size={20}/>, label: 'Resumen' },
        { path: '/admin/pedidos', icon: <ShoppingBag size={20}/>, label: 'Pedidos' },
        { path: '/admin/reservas', icon: <Calendar size={20}/>, label: 'Reservas' },
        { path: '/admin/menu', icon: <Coffee size={20}/>, label: 'Menú & Carta' },
        { path: '/admin/combos', icon: <Coffee size={20}/>, label: 'Combos' },
        { path: '/admin/zonas', icon: <MapPin size={20}/>, label: 'Zonas' },
        { path: '/admin/config', icon: <Settings size={20}/>, label: 'Configuración' },
    ];

    return (
        <div className="admin-container">
            
            {/* --- OVERLAY (Fondo oscuro en móvil) --- */}
            {/* Si está abierto, mostramos este div para cerrar al hacer clic fuera */}
            {isSidebarOpen && (
                <div 
                    className="sidebar-overlay active" 
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}

            {/* --- SIDEBAR --- */}
            {/* 4. Agregamos la clase dinámica 'open' si el estado es true */}
            <aside className={`admin-sidebar ${isSidebarOpen ? 'open' : ''}`}>
                <div className="sidebar-header">
                    <img src={Logo} alt="Admin" className="sidebar-logo" />
                    
                    {/* 5. Botón Cerrar (Solo visible en móvil por CSS) */}
                    <button 
                        className="close-sidebar-btn" 
                        onClick={() => setIsSidebarOpen(false)}
                    >
                        <X size={24} />
                    </button>
                </div>

                <nav className="sidebar-nav">
                    {menuItems.map((item) => (
                        <Link 
                            key={item.path} 
                            to={item.path} 
                            className={`nav-item ${location.pathname === item.path ? 'active' : ''}`}
                            // 6. Cerramos el menú al hacer clic en un enlace (UX móvil)
                            onClick={() => setIsSidebarOpen(false)}
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
                {/* 7. Botón Hamburguesa (Solo visible en móvil por CSS) */}
                <button 
                    className="menu-toggle-btn" 
                    onClick={() => setIsSidebarOpen(true)}
                >
                    <Menu size={24} />
                </button>

                <Outlet /> 
            </main>
        </div>
    );
};

export default AdminLayout;