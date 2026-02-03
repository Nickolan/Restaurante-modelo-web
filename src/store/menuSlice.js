import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { menuService } from '../services/menu.service';

// Thunk para cargar todo junto
export const fetchMenuData = createAsyncThunk('menu/fetchAll', async () => {
    const [categorias, productos, combos] = await Promise.all([
        menuService.getCategorias(),
        menuService.getProductos(),
        menuService.getCombos()
    ]);
    return { categorias, productos, combos };
});

const menuSlice = createSlice({
    name: 'menu',
    initialState: {
        categorias: [],
        productos: [],
        combos: [], // <--- NUEVO ESTADO
        loading: false,
        error: null
    },
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchMenuData.pending, (state) => {
                state.loading = true;
            })
            .addCase(fetchMenuData.fulfilled, (state, action) => {
                state.loading = false;
                state.categorias = action.payload.categorias;
                state.productos = action.payload.productos;
                state.combos = action.payload.combos; // <--- GUARDAMOS COMBOS
            })
            .addCase(fetchMenuData.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message;
            });
    }
});

export default menuSlice.reducer;