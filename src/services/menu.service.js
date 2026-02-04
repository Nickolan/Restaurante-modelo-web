import axios from 'axios';

export const menuService = {
    // Obtener todos los productos (con su categoria)
    getProductos: async () => {
        const res = await axios.get('/menu/producto');
        return res.data;
    },

    // Obtener categorias (para el dropdown del formulario)
    getCategorias: async () => {
        const res = await axios.get('/menu/categoria');
        return res.data;
    },

    createCategoria: async (data) => {
        const res = await axios.post('/menu/categoria', data);
        return res.data;
    },

    updateCategoria: async (id, data) => {
        const res = await axios.patch(`/menu/categoria/${id}`, data);
        return res.data;
    },

    deleteCategoria: async (id) => {
        const res = await axios.delete(`/menu/categoria/${id}`);
        return res.data;
    },

    // Crear
    createProducto: async (data) => {
        const res = await axios.post('/menu/producto', data);
        return res.data;
    },

    // Actualizar
    updateProducto: async (id, data) => {
        const res = await axios.patch(`/menu/producto/${id}`, data);
        return res.data;
    },

    // Eliminar
    deleteProducto: async (id) => {
        const res = await axios.delete(`/menu/producto/${id}`);
        return res.data;
    },
    
    getCombos: async () => {
        const res = await axios.get('/menu/combo'); // Tu endpoint de NestJS
        return res.data;
    },

    createProducto: async (formData) => {
        // Axios detecta automáticamente que es FormData y pone los Headers correctos
        const res = await axios.post('/menu/producto', formData);
        return res.data;
    },

    updateProducto: async (id, formData) => {
        const res = await axios.patch(`/menu/producto/${id}`, formData);
        return res.data;
    },

    deleteProducto: async (id) => {
        const res = await axios.delete(`/menu/producto/${id}`);
        return res.data;
    }
};