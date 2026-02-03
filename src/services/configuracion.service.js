import axios from 'axios';

export const configService = {
    // Solo suele haber una fila de configuración (ID: 1)
    getConfig: async () => {
        const res = await axios.get('/configuracion/1'); 
        return res.data;
    },

    updateConfig: async (data) => {
        const res = await axios.patch('/configuracion/1', data);
        return res.data;
    }
};