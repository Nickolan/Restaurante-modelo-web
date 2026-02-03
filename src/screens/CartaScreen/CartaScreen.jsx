import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchMenuData } from '../../store/menuSlice'; // Acción que creamos antes
import LaCarta from '../../components/LaCarta/LaCarta';
import './CartaScreen.css';

const CartaScreen = () => {
  const dispatch = useDispatch();
  // Seleccionamos las categorías del estado global de Redux
  const { categorias, loading, error } = useSelector((state) => state.menu);

  useEffect(() => {
    dispatch(fetchMenuData());
  }, [dispatch]);

  if (loading) return <div className="loader-gourmet">Preparando la selección...</div>;
  if (error) return <div className="error-gourmet">No se pudo cargar la carta.</div>;

  return (
    <div className="carta-screen-bg">
      <div className="header-discreto">
        <div className="separator-gold"></div>
        <p>MENÚ GASTRONÓMICO</p>
      </div>

      {/* Solo renderizamos si hay categorías disponibles */}
      {categorias.length > 0 && <LaCarta categorias={categorias} />}
      
      <div className="footer-discreto">
        <p>Toque las esquinas para voltear la carta</p>
      </div>
    </div>
  );
};

export default CartaScreen;