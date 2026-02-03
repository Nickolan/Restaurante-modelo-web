import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { X, ShoppingCart } from 'lucide-react';
import './LaCarta.css';
import axios from 'axios'
import { addProducto } from '../../store/cartSlice';

const LaCarta = ({ categorias }) => {
  const dispatch = useDispatch();
  const [currentPage, setCurrentPage] = useState(0);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [bloqueado, setBloqueado] = useState(false);

  // Aplanamos items para la paginación dinámica
  const itemsPorPagina = 12;
  const todosLosItems = [];
  categorias.forEach(cat => {
    todosLosItems.push({ type: 'titulo', content: cat.nombre, id: `cat-${cat.id}` });
    cat.productos.forEach(prod => {
      todosLosItems.push({ type: 'producto', content: prod, id: prod.id });
    });
  });

  const totalPaginas = Math.ceil(todosLosItems.length / itemsPorPagina);
  const itemsVisibles = todosLosItems.slice(currentPage * itemsPorPagina, (currentPage + 1) * itemsPorPagina);

  const handleOrder = (product) => {
    // Despachamos el producto al estado global
    dispatch(addProducto(product));
    
    // Feedback visual opcional: cerrar el drawer o mostrar un mensaje
    setSelectedProduct(null);
  };

  useEffect(() => {
        // 1. Consultamos la configuración al cargar
        axios.get('/configuracion/1').then(res => {
            if (res.data.bloqueo_pedidos) {
                // 2. Si está bloqueado, podrías deshabilitar el botón de pago
                setBloqueado(true);
                setMensajeBloqueo("Lo sentimos, la cocina está temporalmente cerrada.");
            }
        });
  }, []);

  return (
    <div className="perspective-container">
      <div className="carta-inner">
        <div className="carta-face">
          <div className="decor-border">
            <h1 className="menu-main-title">MENÚ</h1>
            
            <div className="items-wrapper">
              {itemsVisibles.map((item) => (
                item.type === 'titulo' ? (
                  <h2 key={item.id} className="categoria-titulo">{item.content.toUpperCase()}</h2>
                ) : (
                  <div 
                    key={item.id} 
                    className="producto-linea clickable"
                    onClick={() => setSelectedProduct(item.content)}
                  >
                    <span className="p-nombre">{item.content.nombre}</span>
                    <span className="p-puntos"></span>
                    <span className="p-precio">${parseFloat(item.content.precio).toFixed(2)}</span>
                  </div>
                )
              ))}
            </div>

            <div className="flip-controls">
              <button onClick={() => setCurrentPage(p => Math.max(0, p - 1))} disabled={currentPage === 0} className="flip-btn">Anterior</button>
              <span className="page-number">Pág. {currentPage + 1} de {totalPaginas}</span>
              <button onClick={() => setCurrentPage(p => Math.min(totalPaginas - 1, p + 1))} disabled={currentPage === totalPaginas - 1} className="flip-btn">Siguiente</button>
            </div>
          </div>
        </div>
      </div>

      {/* PANEL DESPLEGABLE LATERAL (DRAWER) */}
      <div className={`product-drawer ${selectedProduct ? 'open' : ''}`}>
        {selectedProduct && (
          <div className="drawer-content">
            <button className="close-btn" onClick={() => setSelectedProduct(null)}><X size={30} /></button>
            
            <div className="product-detail-image" 
                 style={{ backgroundImage: `url(${selectedProduct.imagen || 'default.jpg'})` }}>
            </div>
            
            <div className="product-detail-info">
              <h2 className="detail-name">{selectedProduct.nombre}</h2>
              <p className="detail-description">{selectedProduct.descripcion || "Sin descripción disponible."}</p>
              <p className="detail-price">${parseFloat(selectedProduct.precio).toFixed(2)}</p>
              
              {
                bloqueado ? <h2>Servicio de pedidos Bloqueado</h2> : <button className="order-btn" onClick={() => handleOrder(selectedProduct)}>
                ORDENAR
              </button>
              }
              
            </div>
          </div>
        )}
      </div>
      
      {/* Overlay para cerrar al hacer clic fuera */}
      {selectedProduct && <div className="drawer-overlay" onClick={() => setSelectedProduct(null)}></div>}
    </div>
  );
};

export default LaCarta;