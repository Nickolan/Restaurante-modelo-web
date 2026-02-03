import React from 'react';
import { FaBars } from 'react-icons/fa';
import { useSelector } from 'react-redux';
import { ShoppingCart } from 'lucide-react';
import { LuBookOpen } from 'react-icons/lu'; // Icono de nota/libro para el pedido
import './Navbar.css';
import { useNavigate } from 'react-router-dom';

const Navbar = ({ logo, onOpenReserva }) => {

  const navigate = useNavigate();

  const { items } = useSelector((state) => state.cart);

  // Calculamos la cantidad total de productos
  const cantidadTotal = items.reduce((total, item) => total + item.cantidad, 0);

  function irCheckout() {
    if (items.length > 0) {
      navigate('/checkout')
    }
  }

  return (
    <nav className="navbar">
      <div className="navbar-left">
        <div className="navbar-logo-container">
          {/* Usamos el logo generado anteriormente */}
          <img onClick={() => navigate('/')} src={logo} alt="Restaurante Logo" className="navbar-logo" />
        </div>
        <button className="menu-toggle-btn">
          <FaBars />
        </button>
      </div>

      <div className="navbar-center">
        <button className="nav-btn btn-reserve-nav" onClick={onOpenReserva}>
             Reservar
          </button>
        <button className="nav-btn btn-order" onClick={() => navigate('/consulta')}>Mis Pedidos</button>
      </div>

      <div className="navbar-right">
        <div className="order-note-icon" onClick={irCheckout}>
          <LuBookOpen />
          <span className="order-badge">{cantidadTotal}</span>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;