import axios from 'axios';

export const pedidosService = {
    // Obtener todos los pedidos (puedes añadir filtros por fecha si quieres)
    getPedidos: async () => {
        const res = await axios.get('/pedidos/pedido');
        return res.data;
    },

    // Actualizar solo el estado del pedido
    updateStatus: async (id, nuevoEstado) => {
        const res = await axios.patch(`/pedidos/pedido/${id}`, { estado: nuevoEstado });
        return res.data;
    },

    // Obtener el detalle completo de un pedido específico
    getPedidoById: async (id) => {
        const res = await axios.get(`/pedidos/pedido/${id}`);
        return res.data;
    }
};