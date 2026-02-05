import React, { useState } from 'react'; // 1. Importar useState
import { FaBars, FaTimes } from 'react-icons/fa'; // Importamos FaTimes para el icono de cerrar
import { useSelector } from 'react-redux';
import { ShoppingCart } from 'lucide-react';
import { LuBookOpen } from 'react-icons/lu';
import './Navbar.css';
import { useNavigate } from 'react-router-dom';

const Navbar = ({ logo, onOpenReserva }) => {
  const navigate = useNavigate();
  const { items } = useSelector((state) => state.cart);
  const cantidadTotal = items.reduce((total, item) => total + item.cantidad, 0);

  // 2. Estado para controlar el menú móvil
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // 3. Función para alternar el menú
  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  function irCheckout() {
    if (items.length > 0) {
      navigate('/checkout')
    }
  }

  return (
    <nav className="navbar">
      <div className="navbar-left">
        <div className="navbar-logo-container">
          <img onClick={() => navigate('/')} src={logo} alt="Restaurante Logo" className="navbar-logo" />
        </div>
        
        {/* 4. Botón Toggle: Cambia entre hamburguesa y X */}
        <button className="menu-toggle-btn" onClick={toggleMobileMenu}>
          {isMobileMenuOpen ? <FaTimes /> : <FaBars />}
        </button>
      </div>

      {/* Menú normal para PC */}
      <div className="navbar-center">
        <button className="nav-btn btn-reserve-nav" onClick={onOpenReserva}>
          Reservar
        </button>
        <button className="nav-btn btn-order" onClick={() => navigate('/consulta')}>
          Mis Pedidos
        </button>
      </div>

      <div className="navbar-right">
        <div className="order-note-icon" onClick={irCheckout}>
          <LuBookOpen />
          <span className="order-badge">{cantidadTotal}</span>
        </div>
      </div>

      {/* 5. Nuevo Contenedor para el Menú Móvil */}
      <div className={`mobile-menu-dropdown ${isMobileMenuOpen ? 'active' : ''}`}>
        <button 
          className="nav-btn mobile-nav-btn" 
          onClick={() => { onOpenReserva(); closeMobileMenu(); }}
        >
          Reservar
        </button>
        <button 
          className="nav-btn mobile-nav-btn" 
          onClick={() => { navigate('/consulta'); closeMobileMenu(); }}
        >
          Mis Pedidos
        </button>
      </div>
    </nav>
  );
};

export default Navbar;