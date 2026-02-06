import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  items: [], // Aquí guardaremos { id, nombre, precio, cantidad, imagen }
  totalAmount: 0,
};

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    addProducto: (state, action) => {
      const nuevoItem = action.payload;
      const itemExistente = state.items.find((item) => item.id === nuevoItem.id);

      if (!itemExistente) {
        // Si no existe, lo agregamos con cantidad 1
        state.items.push({
          id: nuevoItem.id,
          nombre: nuevoItem.nombre,
          precio: nuevoItem.precio,
          imagen: nuevoItem.imagen,
          cantidad: 1,
          esCombo: nuevoItem.esCombo,
        });
      } else {
        // Si ya existe, solo aumentamos la cantidad
        itemExistente.cantidad++;
      }

      // Actualizamos el monto total acumulado
      state.totalAmount = state.items.reduce(
        (total, item) => total + item.precio * item.cantidad,
        0
      );
    },
    
    removeProducto: (state, action) => {
      const id = action.payload;
      const itemExistente = state.items.find((item) => item.id === id);

      if (itemExistente.cantidad === 1) {
        state.items = state.items.filter((item) => item.id !== id);
      } else {
        itemExistente.cantidad--;
      }
      
      state.totalAmount = state.items.reduce(
        (total, item) => total + item.precio * item.cantidad,
        0
      );
    },

    limpiarCarrito: (state) => {
      state.items = [];
      state.totalAmount = 0;
    },
  },
});

export const { addProducto, removeProducto, limpiarCarrito } = cartSlice.actions;
export default cartSlice.reducer;