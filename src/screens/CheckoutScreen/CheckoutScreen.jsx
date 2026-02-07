import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { addProducto, removeProducto } from '../../store/cartSlice'; // Usamos tus acciones existentes
import { FaMapMarkerAlt } from 'react-icons/fa';
import { initMercadoPago, Wallet } from '@mercadopago/sdk-react';
import axios from 'axios';
import './CheckoutScreen.css';

// Variable usadas
const mp_public_key = import.meta.env.VITE_MP_PUBLIC_KEY;
// const google_api_key = import.meta.env.VITE_GOOGLE_API_KEY;

// INICIALIZA MERCADO PAGO CON TU PUBLIC KEY
initMercadoPago(mp_public_key);

const CheckoutScreen = () => {
    const dispatch = useDispatch();
    const { items, totalAmount } = useSelector((state) => state.cart);

    const [formData, setFormData] = useState({
        nombre: '',
        correo: '',
        telefono: '',
        dni: '',
        direccion: ''
    });

    const [mensajeBloqueo, setMensajeBloqueo] = useState(null);

    const [preferenceId, setPreferenceId] = useState(null);
    const costoEnvio = 500; // Costo fijo de ejemplo

    const handleInputChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    useEffect(() => {
        // 1. Consultamos la configuración al cargar
        axios.get('/configuracion/1').then(res => {
            if (res.data.bloqueo_pedidos) {
                // 2. Si está bloqueado, podrías deshabilitar el botón de pago
                setMensajeBloqueo("Lo sentimos, la cocina está temporalmente cerrada.");
            }
        });
    }, []);

    // Función para autocompletar con geolocalización del navegador
    const handleGeoLocation = () => {
        if (navigator.geolocation) {
            // Feedback visual: mostramos que está cargando
            setFormData(prev => ({ ...prev, direccion: 'Obteniendo ubicación...' }));

            navigator.geolocation.getCurrentPosition(async (position) => {
                const { latitude, longitude } = position.coords;

                try {
                    // Petición a la API de Geocoding de Google
                    const response = await axios.post(`/ubicacion`, {
                        latitude, longitude
                    });
                    console.log(response.data);


                    setFormData(prev => ({
                        ...prev,
                        direccion: response.data
                    }));

                } catch (error) {
                    console.error("Error al conectar con Google Maps:", error);
                    setFormData(prev => ({ ...prev, direccion: '' })); // Limpiamos si falla
                    alert("Error al obtener la dirección desde Google Maps.");
                }

            }, (error) => {
                console.error(error);
                setFormData(prev => ({ ...prev, direccion: '' }));
                alert("No se pudo obtener la ubicación. Verifica los permisos del navegador.");
            });
        } else {
            alert("Geolocalización no soportada por este navegador.");
        }
    };

    const handlePagar = async () => {
        // 1. Validaciones básicas
        if (!formData.nombre || !formData.direccion || items.length === 0) {
            alert("Por favor completa los datos y agrega productos.");
            return;
        }

        console.log(items);
        

        try {
            // --- PASO A: Crear el Pedido en tu Base de Datos ---
            // Estructuramos el objeto tal cual lo espera tu entidad Pedido/DetallePedido
            const pedidoPayload = {
                nombre_cliente: formData.nombre,
                dni_cliente: formData.dni,
                correo: formData.correo,
                direccion: formData.direccion,
                total: totalAmount + costoEnvio, // Total calculado
                // Asegúrate que tu backend espere "detalles" o ajusta según tu DTO
                detalles: items.map((item) => ({
                    //pedido_id: null, // El ID se asigna en el backend o tras crear la cabecera, depende de tu lógica actual
                    cantidad: item.cantidad,
                    precio_unitario: item.precio,

                    // --- ESTA ES LA LÓGICA QUE DEBES AGREGAR ---
                    // Si el item tiene la bandera esCombo (que pusiste en ComboCard), lo marcamos como combo
                    tipo_item: item.esCombo ? 'combo' : 'producto',

                    // Si es combo, llenamos combo_id y dejamos producto_id en null
                    combo_id: item.esCombo ? item.id : null,

                    // Si NO es combo, llenamos producto_id y dejamos combo_id en null
                    producto_id: item.esCombo ? null : item.id
                    // -------------------------------------------
                }))
            };

            console.log("Enviando pedido al backend...", pedidoPayload);

            // Llamada al endpoint de crear pedido
            const pedidoResponse = await axios.post('/pedidos/pedido', pedidoPayload);
            const nuevoPedido = pedidoResponse.data;

            console.log("Pedido creado con éxito. ID:", nuevoPedido.id);

            for (const item of items) {

                const detallePayload = {
                    pedido_id: nuevoPedido.id, // Usamos el ID que nos devolvió el paso anterior
                    producto_id: item.esCombo ? null : item.id,
                    cantidad: item.cantidad,
                    precio_unitario: item.precio,
                    combo_id: item.esCombo ? item.id : null,
                    tipo_item: item.esCombo ? 'combo' : 'producto',
                    // Opcional: Si manejas combos y tu backend lo requiere:
                    // combo_id: item.esCombo ? item.id : null 
                };

                await axios.post("/pedidos/detalle", detallePayload);
                console.log(`Detalle guardado: ${item.nombre}`);
            }


            // --- PASO B: Solicitar la Preferencia de Mercado Pago ---
            // Usamos el ID del pedido recién creado
            const preferenciaResponse = await axios.post(`/pedidos/create-preference/${nuevoPedido.id}`);

            const { preferenceId } = preferenciaResponse.data;

            if (preferenceId) {
                setPreferenceId(preferenceId);
                // Opcional: Scrollear hacia el botón de pago
                setTimeout(() => {
                    document.getElementById('wallet_container')?.scrollIntoView({ behavior: 'smooth' });
                }, 100);
            } else {
                alert("Error: El servidor no devolvió un ID de preferencia.");
            }

        } catch (error) {
            console.error("Error al procesar el pedido:", error);
            alert("Hubo un error al comunicarse con el servidor.");
        }
    };

    return (
        <div className="checkout-container">
            {/* Fondo difuminado */}
            <div className="checkout-bg-image"></div>

            <div className="checkout-card">
                {/* --- IZQUIERDA: FORMULARIO --- */}
                <div className="form-section">
                    <h2 className="checkout-title">Mis Datos</h2>

                    <div className="form-group">
                        <input
                            type="text" name="nombre" placeholder="Nombre Completo"
                            className="form-input" value={formData.nombre} onChange={handleInputChange}
                        />
                        <input
                            type="email" name="correo" placeholder="Correo electrónico"
                            className="form-input" value={formData.correo} onChange={handleInputChange}
                        />
                        <input
                            type="tel" name="telefono" placeholder="Teléfono"
                            className="form-input" value={formData.telefono} onChange={handleInputChange}
                        />
                        <input
                            type="text" name="dni" placeholder="DNI"
                            className="form-input" value={formData.dni} onChange={handleInputChange}
                        />

                        <div style={{ position: 'relative' }}>
                            <input
                                type="text" name="direccion" placeholder="Dirección de Envío"
                                className="form-input" style={{ width: '100%' }} value={formData.direccion} onChange={handleInputChange}
                            />
                        </div>

                        <button className="btn-maps" onClick={handleGeoLocation}>
                            <FaMapMarkerAlt /> Autocompletar con Google Maps
                        </button>
                    </div>
                </div>

                {/* --- DERECHA: RESUMEN --- */}
                <div className="summary-section">
                    <h2 className="summary-title">Resumen del Pedido</h2>

                    <div className="summary-items">
                        {items.map((item) => (
                            <div key={item.id} className="summary-item">
                                <img src={item.imagen ? `${item.imagen}` : "https://via.placeholder.com/60"} alt={item.nombre} className="item-image" />

                                <div className="item-details">
                                    <span className="item-name">{item.nombre}</span>
                                    <div className="quantity-control">
                                        <button className="qty-btn" onClick={() => dispatch(removeProducto(item.id))}>-</button>
                                        <span className="item-qty">{item.cantidad}</span>
                                        <button className="qty-btn" onClick={() => dispatch(addProducto(item))}>+</button>
                                    </div>
                                </div>

                                <span className="item-price">${(item.precio * item.cantidad).toFixed(2)}</span>
                            </div>
                        ))}
                        {items.length === 0 && <p style={{ color: '#888' }}>No hay productos en el carrito.</p>}
                    </div>

                    <div className="payment-wrapper">
                            {preferenceId ? (
                                <div id="wallet_container">
                                    <Wallet 
                                        initialization={{ preferenceId: preferenceId }} 
                                        customization={{ 
                                            texts: { valueProp: 'smart_option' },
                                            // Opcional: Visual customization para que combine mejor con tu tema oscuro
                                            visual: {
                                                buttonBackground: 'default', // o 'black'
                                                borderRadius: '10px',
                                            }
                                        }} 
                                    />
                                </div>
                            ) : (
                                <button className="btn-mercadopago" onClick={handlePagar}>
                                    Confirmar y Pagar
                                </button>
                            )}
                        </div>
                </div>
            </div>
        </div>
    );
};

export default CheckoutScreen;