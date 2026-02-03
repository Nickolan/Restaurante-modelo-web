import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { loginStart, loginSuccess, loginFailure } from '../../store/authSlice';
import './LoginScreen.css';
import Logo from '../../assets/Logo.png'; // Asegúrate de tener tu logo aquí
import { Lock, User } from 'lucide-react';

const LoginScreen = () => {
    const [credentials, setCredentials] = useState({ email: '', password: '' });
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { loading, error } = useSelector((state) => state.auth);

    const handleChange = (e) => {
        setCredentials({ ...credentials, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Validaciones simples
        if(!credentials.email || !credentials.password) return;

        dispatch(loginStart());

        try {
            // NOTA: Este endpoint debes crearlo en tu backend NestJS
            const response = await axios.post('/auth/login', credentials);
            
            // Suponemos que el backend devuelve: { token: 'xyz...', user: { role: 'admin', ... } }
            const { token, user } = response.data;

            // Validación de seguridad extra en frontend
            if (user.role !== 'admin') {
                throw new Error("No tienes permisos de administrador.");
            }

            // Guardamos en Redux
            dispatch(loginSuccess({ token, user }));

            // Redirigimos al Dashboard
            navigate('/admin/dashboard');

        } catch (err) {
            console.error(err);
            const msg = err.response?.data?.message || err.message || "Error al iniciar sesión";
            dispatch(loginFailure(msg));
        }
    };

    return (
        <div className="login-container">
            <div className="login-card">
                <img src={Logo} alt="Logo" className="login-logo" />
                <h1 className="login-title">Panel Administrativo</h1>
                <p className="login-subtitle">Ingresa tus credenciales de acceso</p>

                {error && <div className="error-message">{error}</div>}

                <form onSubmit={handleSubmit}>
                    <div className="input-group">
                        <label className="input-label">Usuario / Correo</label>
                        <div style={{position:'relative'}}>
                            <User size={18} color="#666" style={{position:'absolute', left:10, top:12}}/>
                            <input 
                                type="text" 
                                name="email"
                                className="login-input" 
                                style={{paddingLeft: 35}}
                                placeholder="admin@restaurante.com"
                                value={credentials.email}
                                onChange={handleChange}
                            />
                        </div>
                    </div>

                    <div className="input-group">
                        <label className="input-label">Contraseña</label>
                        <div style={{position:'relative'}}>
                            <Lock size={18} color="#666" style={{position:'absolute', left:10, top:12}}/>
                            <input 
                                type="password" 
                                name="password"
                                className="login-input" 
                                style={{paddingLeft: 35}}
                                placeholder="••••••••"
                                value={credentials.password}
                                onChange={handleChange}
                            />
                        </div>
                    </div>

                    <button type="submit" className="btn-login" disabled={loading}>
                        {loading ? 'Verificando...' : 'Ingresar al Sistema'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default LoginScreen;