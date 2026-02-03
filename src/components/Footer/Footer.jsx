import React from 'react';
import { FaGlobe, FaWhatsapp, FaMapMarkerAlt, FaRegCommentDots } from 'react-icons/fa';
import './Footer.css';

const Footer = ({logo}) => {
  return (
    <footer className="footer">
      <div className="footer-container">
        {/* Sección 1: Logo */}
        <div className="footer-section logo-section">
          <img src={logo} alt="" className="navbar-logo" />
        </div>

        {/* Sección 2: Enlaces de Navegación */}
        <div className="footer-section links-section">
          <div className="links-group">
            <a href="/">Fuego Urbano</a>
            <a href="/menu">Menu</a>
            <a href="/nosotros">Nosotros</a>
          </div>
          <div className="links-group">
            <a href="/contacto">Contacto</a>
            <a href="/reservas">Reservaciones</a>
          </div>
        </div>

        {/* Sección 3: Iconos Sociales */}
        <div className="footer-section icons-section">
          <div className="icon-wrapper"><FaGlobe /></div>
          <div className="icon-wrapper"><FaRegCommentDots /></div>
          <div className="icon-wrapper"><FaMapMarkerAlt /></div>
        </div>

        {/* Sección 4: Contacto y Dirección */}
        <div className="footer-section contact-section-footer">
          <p>Whatsapp: <a href="https://wa.me/542611234567" className="footer-underline">+54 261 123 4567</a></p>
          <p>Telefono: <a href="tel:+542659876543" className="footer-underline">+54 265 987 6543</a></p>
          <p>Direccion: Av Siempre Viva 743 Mendoza, Argentina</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;