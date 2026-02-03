import React from 'react';
import { useSelector } from 'react-redux';
import { Navigate, Outlet } from 'react-router-dom';

const ProtectedRoute = () => {
    const { isAuthenticated, user } = useSelector((state) => state.auth);

    // 1. Si no está autenticado, mandar al login
    if (!isAuthenticated) {
        return <Navigate to="/admin/login" replace />;
    }

    // 2. Si está autenticado pero NO es admin (seguridad extra)
    if (user?.role !== 'admin') {
        alert("Acceso denegado: Se requieren permisos de administrador.");
        return <Navigate to="/" replace />; // Mandar al Home público
    }

    // 3. Si todo ok, renderizar el contenido protegido (Outlet)
    return <Outlet />;
};

export default ProtectedRoute;