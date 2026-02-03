import React from 'react';
import { useDispatch } from 'react-redux';
import { addProducto } from '../../store/cartSlice';
import './ComboCard.css';
import { ShoppingCart } from 'lucide-react';

const ComboCard = ({ combo }) => {
    const dispatch = useDispatch();

    const handleAdd = () => {
        // Adaptamos la estructura para que el carrito la entienda igual que un producto
        dispatch(addProducto({
            id: combo.id, // ID único para evitar choque con productos normales
            nombre: combo.nombre,
            precio: parseFloat(combo.precio_combo), // Usamos precio_combo del backend
            imagen: 'combo-default.png', // O combo.imagen si le agregas foto
            esCombo: true,
            descripcion: combo.descripcion
        }));
    };

    return (
        <div className="combo-card">
            <div className="combo-image-container">
                {/* Si no tienes imagen de combo, usa un placeholder elegante */}
                <img 
                    src={combo.imagen ? `/images/${combo.imagen}` : "https://cdn-icons-png.flaticon.com/512/1046/1046751.png"} 
                    alt={combo.nombre} 
                    className="combo-image" 
                />
            </div>
            
            <h3 className="combo-title">{combo.nombre}</h3>
            <p className="combo-desc">{combo.descripcion}</p>
            
            <div className="combo-footer">
                <span className="combo-price">${combo.precio_combo}</span>
                <button className="btn-add-combo" onClick={handleAdd}>
                    AGREGAR <ShoppingCart size={14} style={{marginLeft:5, verticalAlign:'middle'}}/>
                </button>
            </div>
        </div>
    );
};

export default ComboCard;