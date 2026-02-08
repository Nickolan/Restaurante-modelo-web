import axios from 'axios';

export const reservasService = {
    // 1. Obtener todas las zonas (Sala, Terraza, etc.)
    getZonas: async () => {
        try {
            const res = await axios.get('/reservas/zona');
            return res.data;
        } catch (error) {
            console.error("Error al obtener zonas:", error);
            throw error;
        }
    },

    // 2. Obtener horarios disponibles (Spots)
    // El backend espera: GET /reservas/disponibilidad/horarios?fecha=YYYY-MM-DD
    getHorariosDisponibles: async (fecha) => {
        try {
            const res = await axios.get(`/reservas/disponibilidad/horarios?fecha=${fecha}`);
            return res.data; // Se espera un array de strings ["20:00", "21:00"] o similar
        } catch (error) {
            console.error("Error al obtener horarios:", error);
            throw error;
        }
    },

    // 3. Filtrar Mesas Disponibles (Lógica NOT IN del backend)
    // El backend espera: GET /reservas/disponibilidad/mesas?fecha=...&hora=...&zona_id=...&personas=...
    getMesasDisponibles: async (fecha, hora, zonaId, personas) => {
        try {
            const res = await axios.get('/reservas/disponibilidad/mesas', {
                params: {
                    fecha,
                    hora,
                    zona_id: zonaId,
                    personas
                }
            });
            return res.data; // Retorna array de objetos Mesa disponibles
        } catch (error) {
            console.error("Error al buscar mesas:", error);
            throw error;
        }
    },

    getAllTurnosConfig: async () => {
        try {
            const res = await axios.get('/reservas/turno');
            return res.data; // Retorna array de objetos [{id: 1, dia_semana: 'Viernes', hora_spot: '20:00'}, ...]
        } catch (error) {
            console.error("Error obteniendo configuración de turnos:", error);
            return [];
        }
    },

    // 4. Crear la Reserva
    // El backend espera: POST /reservas/reserva con el body completo
    crearReserva: async (payload) => {
        try {
            const res = await axios.post('/reservas/reserva', payload);
            return res.data; // Retorna la reserva creada con su numero_reserva
        } catch (error) {
            // Es buena práctica capturar si el error es por "Mesa ya reservada" (Race condition)
            if (error.response && error.response.status === 409) {
                throw new Error("Lo sentimos, alguien acaba de reservar esa mesa.");
            }
            console.error("Error al crear reserva:", error);
            throw error;
        }
    },

    getAllMesas: async () => {
        const res = await axios.get('/reservas/mesa');
        return res.data;
    },

    // NUEVO: Obtener una reserva por ID (para ver detalles al hacer clic en mesa ocupada)
    // Nota: Si no tienes este endpoint exacto, podemos omitirlo por ahora
    getReservaById: async (id) => {
        const res = await axios.get(`/reservas/reserva/${id}`);
        return res.data;
    },

    getZonas: async () => {
        const res = await axios.get('/reservas/zona');
        console.log(res.data);

        return res.data;
    },

    createZona: async (data) => {
        const res = await axios.post('/reservas/zona', data);
        return res.data;
    },

    updateZona: async (id, data) => {
        const res = await axios.patch(`/reservas/zona/${id}`, data);
        return res.data;
    },

    deleteZona: async (id) => {
        const res = await axios.delete(`/reservas/zona/${id}`);
        return res.data;
    },
    getMesas: async () => {
        const res = await axios.get('/reservas/mesa');
        return res.data;
    },
    createMesa: async (data) => {
        console.log("Mesa: ", data);
        const res = await axios.post('/reservas/mesa', data);

        return res.data;
    },
    updateMesa: async (id, data) => {
        const res = await axios.patch(`/reservas/mesa/${id}`, data);
        return res.data;
    },
    deleteMesa: async (id) => {
        const res = await axios.delete(`/reservas/mesa/${id}`);
        return res.data;
    },
    getTurnos: async () => {
        const response = await axios.get('/reservas/turno');
        return response.data;
    },

    createTurno: async (data) => {
        // data espera: { dia_semana: string, hora_spot: string (HH:MM) }
        const response = await axios.post('/reservas/turno', data);
        return response.data;
    },

    deleteTurno: async (id) => {
        const response = await axios.delete(`/reservas/turno/${id}`);
        return response.data;
    },
    getAllReservas: async () => {
        const res = await axios.get('/reservas/reserva');
        return res.data;
    }
};