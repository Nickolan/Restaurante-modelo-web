import React, { useEffect } from 'react';
import { FaInstagram, FaWhatsapp, FaMapMarkerAlt } from 'react-icons/fa';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import Slider from 'react-slick';
import {fetchMenuData} from '../../store/menuSlice';
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import './Home.css';
import ComboCard from '../../components/ComboCard/ComboCard';

import ReservaImage from '../../assets/Reservas.png';
import FondoImage from '../../assets/Fondo.png';
import UbicacionImage from '../../assets/Ubicacion.png';

const Home = ({onOpenReserva}) => {

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { combos, loading } = useSelector((state) => state.menu);

  useEffect(() => {
    dispatch(fetchMenuData());
  }, [dispatch]);

  function navegarCarta() {
    navigate('/carta')
  }

  // Configuración del carrusel (muestra 3 ítems)
  const settings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 3,
    slidesToScroll: 1,
    responsive: [
      { breakpoint: 1024, settings: { slidesToShow: 2 } },
      { breakpoint: 600, settings: { slidesToShow: 1 } }
    ]
  };

  return (
    <div className="home-container">
      {/* SECTOR 1: INTRODUCCIÓN */}
      <section className="intro-section">
        <div className="intro-content">
          <h1 className="restaurant-title">NOMBRE DE TU RESTAURANTE</h1>
        </div>

        {/* Iconos en la esquina inferior derecha */}
        <div className="social-icons-container">
          <a href="https://www.instagram.com/n1ko_lan/" target="_blank" rel="noopener noreferrer">
            <FaInstagram className="icon" />
          </a>
          <a href="https://wa.me/+5492612156574" target="_blank" rel="noopener noreferrer">
            <FaWhatsapp className="icon" />
          </a>
          <a href="#ubicacion">
            <FaMapMarkerAlt className="icon" />
          </a>
        </div>
      </section>

      <section className="menu-section">
        <h2 className="section-subtitle">Nuestros Combos</h2>

        <div className="carousel-container">
          <Slider {...settings}>
            {combos.map(combo => (
              <ComboCard key={combo.id} combo={combo} />
            ))}
          </Slider>
        </div>

        <div className="button-container">
          <button onClick={navegarCarta} className="btn-full-menu">Ver Carta Completa</button>
        </div>
      </section>

      <section id='reservas' className="reservation-section">
        <h2 className="section-title">Reserva tu mesa en minutos</h2>

        <div className="reservation-content">
          <div className="reservation-image-container">
            {/* Aquí colocarás tu imagen grande de reserva */}
            <img
              src={ReservaImage}
              alt="Reserva de mesa"
              className="reservation-image"
            />
          </div>

          <div className="reservation-text-container">
            <p className="highlight-text">
              ¿Planificando una salida con amigos, en pareja o en familia?
            </p>
            <p className="description-text">
              Asegurá tu lugar y vení a disfrutar de un ambiente relajado, buena comida y una experiencia pensada para que la pases bien desde que llegás. Reservar es rápido, simple y te garantiza tu mesa sin esperas.
            </p>
          </div>
        </div>

        <div className="button-container">
          <button onClick={onOpenReserva} className="btn-reserve">Quiero Reservar</button>
        </div>
      </section>

      <section id='nosotros' className="about-section">
        {/* Título siguiendo la regla de estilo establecida */}
        <h2 className="section-title">Nosotros</h2>

        <div className="about-content">


          <div className="about-text-container">
            <p className="about-description">
              El Chato es un restaurante colombiano contemporáneo en Bogotá que, bajo la visión del chef Álvaro Clavijo, explora la biodiversidad del país a través de menús en permanente transformación elaborados con productos de la región. Reconocido como el mejor restaurante de América Latina en 2025 por The 50 Best Restaurants, El Chato integra creatividad, técnica e investigación para ofrecer una experiencia que honra y proyecta la identidad gastronómica colombiana.
            </p>
          </div>

          <div className="about-image-container">
            {/* Imagen representativa del restaurante/chef */}
            <img
              src={FondoImage}
              alt="Restaurante El Chato"
              className="about-image"
            />
          </div>
        </div>
      </section>

      {/* SECTOR 5: CONTACTO */}
      <section id='contacto' className="contact-section">
        <h2 className="section-title">Contacto</h2>

        <div className="contact-info-grid">
          {/* Columna Izquierda: Horarios */}
          <div className="contact-column">
            <h3 className="contact-subtitle">Horarios</h3>
            <ul className="schedule-list">
              <li><strong>Lunes y Martes:</strong> de 2:00pm A 11:00pm</li>
              <li><strong>Miércoles a Sábados:</strong> 12:00pm A 11:00pm</li>
              <li><strong>Domingos:</strong> 12:00pm A 5:00pm</li>
            </ul>
          </div>

          {/* Columna Derecha: Canales de contacto */}
          <div className="contact-column">
            <h3 className="contact-subtitle">Comunicate con nosotros</h3>
            <p className="contact-detail"><strong>Whatsapp:</strong> +54 261 123 4567</p>
            <p className="contact-detail"><strong>Teléfono:</strong> +54 265 987 6543</p>
          </div>
        </div>

        {/* Zona Inferior: Imagen Panorámica */}
        <div id='ubicacion' className="contact-map-image-container">
          <img
            src={UbicacionImage}
            alt="Ubicación y fachada"
            className="contact-full-image"
          />
        </div>
      </section>
    </div>
  );
};

export default Home;