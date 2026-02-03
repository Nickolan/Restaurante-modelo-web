import React, { useState, useEffect } from 'react';
import { configService } from '../../../services/configuracion.service';
import { Settings, Power, Clock, Info, Save } from 'lucide-react';
import './ConfigAdmin.css';

const ConfigAdmin = () => {
    const [config, setConfig] = useState({
        horario_apertura: '',
        horario_cierre: '',
        bloqueo_pedidos: false
    });

    useEffect(() => {
        configService.getConfig().then(setConfig);
    }, []);

    const handleSave = async () => {
        try {
            await configService.updateConfig(config);
            alert("Configuración actualizada globalmente");
        } catch (e) {
            alert("Error al guardar");
        }
    };

    return (
        <div className="config-container">
            <h1 className="page-title">Configuración del Sistema</h1>
            
            <div className="config-grid">
                {/* BOTÓN DE PÁNICO */}
                <div className={`config-card panic-card ${config.bloqueo_pedidos ? 'active' : ''}`}>
                    <div className="card-icon"><Power size={32}/></div>
                    <div className="card-info">
                        <h2>Estado del Servicio</h2>
                        <p>{config.bloqueo_pedidos ? 'LOS PEDIDOS ESTÁN BLOQUEADOS' : 'El sistema está recibiendo pedidos normalmente'}</p>
                        <button 
                            className={`btn-toggle ${config.bloqueo_pedidos ? 'btn-red' : 'btn-green'}`}
                            onClick={() => setConfig({...config, bloqueo_pedidos: !config.bloqueo_pedidos})}
                        >
                            {config.bloqueo_pedidos ? 'Reactivar Pedidos' : 'Bloquear Pedidos Online'}
                        </button>
                    </div>
                </div>

                {/* HORARIOS */}
                <div className="config-card">
                    <div className="card-icon"><Clock size={32}/></div>
                    <div className="card-info">
                        <h2>Horarios de Atención</h2>
                        <div className="time-inputs">
                            <div className="time-group">
                                <label>Apertura:</label>
                                <input type="time" value={config.horario_apertura} 
                                    onChange={e => setConfig({...config, horario_apertura: e.target.value})} />
                            </div>
                            <div className="time-group">
                                <label>Cierre:</label>
                                <input type="time" value={config.horario_cierre} 
                                    onChange={e => setConfig({...config, horario_cierre: e.target.value})} />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <button className="btn-save-global" onClick={handleSave}>
                <Save size={20}/> Guardar Todos los Cambios
            </button>
        </div>
    );
};

export default ConfigAdmin;