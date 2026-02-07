import React, { useState, useEffect } from 'react';
import { FaEdit, FaTrash, FaPlus, FaArrowLeft, FaSave } from 'react-icons/fa';
import { menuService } from '../../../services/menu.service';
import './AdminCombos.css';

const AdminCombos = () => {
  const [combos, setCombos] = useState([]);
  const [productos, setProductos] = useState([]); 
  const [loading, setLoading] = useState(false);
  
  // Estado para la vista: 'list' o 'detail'
  const [view, setView] = useState('list'); 
  const [selectedCombo, setSelectedCombo] = useState(null);

  // Formularios
  const [comboForm, setComboForm] = useState({ nombre: '', descripcion: '', precio_combo: '' });
  const [itemForm, setItemForm] = useState({ producto_id: '', cantidad: 1 });

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      setLoading(true);
      const [combosData, productosData] = await Promise.all([
        menuService.getCombos(),
        menuService.getProductos()
      ]);
      setCombos(combosData);
      setProductos(productosData);
    } catch (error) {
      console.error("Error cargando datos:", error);
    } finally {
      setLoading(false);
    }
  };

  // --- Lógica del Combo (Padre) ---

  const handleCreateCombo = async (e) => {
    e.preventDefault();
    try {
      await menuService.createCombo(comboForm); // Usando servicio
      setComboForm({ nombre: '', descripcion: '', precio_combo: '' });
      
      // Recargar lista
      const data = await menuService.getCombos();
      setCombos(data);
      
      alert('Combo creado. Ahora selecciona "Administrar" para agregar productos.');
    } catch (error) {
      console.error(error);
      alert('Error creando combo');
    }
  };

  const handleDeleteCombo = async (id) => {
    if (!window.confirm('¿Eliminar este combo?')) return;
    try {
      await menuService.deleteCombo(id); // Usando servicio
      
      // Recargar lista
      const data = await menuService.getCombos();
      setCombos(data);
      
      if (selectedCombo?.id === id) setView('list');
    } catch (error) {
      console.error(error);
      alert('Error eliminando combo');
    }
  };

  const openComboDetail = (combo) => {
    setSelectedCombo(combo);
    setView('detail');
  };

  // --- Lógica de Combo-Productos (Hijos) ---

  const handleAddItem = async (e) => {
    e.preventDefault();
    if (!itemForm.producto_id) return alert('Selecciona un producto');

    try {
      await menuService.addComboProducto({
        combo_id: selectedCombo.id,
        producto_id: parseInt(itemForm.producto_id),
        cantidad: parseInt(itemForm.cantidad)
      }); // Usando servicio
      
      // Recargar el combo específico para ver los items actualizados
      const updatedCombo = await menuService.getComboById(selectedCombo.id);
      setSelectedCombo(updatedCombo);
      
      // Reset form parcial
      setItemForm({ ...itemForm, producto_id: '' }); // Mantenemos la cantidad por comodidad
    } catch (error) {
      console.error(error);
      alert('Error agregando producto al combo');
    }
  };

  const handleRemoveItem = async (itemId) => {
    try {
      await menuService.removeComboProducto(itemId); // Usando servicio
      
      // Recargar el combo específico
      const updatedCombo = await menuService.getComboById(selectedCombo.id);
      setSelectedCombo(updatedCombo);
    } catch (error) {
      console.error(error);
      alert('Error quitando item');
    }
  };

  // --- RENDERIZADO (Igual que antes) ---

  if (view === 'list') {
    return (
      <div className="admin-section">
        <h2>Gestión de Combos</h2>
        
        {/* Formulario Creación Rápida */}
        <form onSubmit={handleCreateCombo} className="admin-form-row">
          <input 
            type="text" placeholder="Nombre del Combo" required 
            value={comboForm.nombre}
            onChange={e => setComboForm({...comboForm, nombre: e.target.value})}
          />
          <input 
            type="number" placeholder="Precio Total" required 
            value={comboForm.precio_combo}
            onChange={e => setComboForm({...comboForm, precio_combo: e.target.value})}
          />
          <input 
            type="text" placeholder="Descripción" 
            value={comboForm.descripcion}
            onChange={e => setComboForm({...comboForm, descripcion: e.target.value})}
          />
          <button type="submit" className="btn-add"><FaPlus /> Crear</button>
        </form>

        {/* Lista de Combos */}
        <div className="items-grid">
          {loading ? <p>Cargando...</p> : combos.map(combo => (
            <div key={combo.id} className="item-card combo-card">
              <div className="card-info">
                <h3>{combo.nombre}</h3>
                <p>${combo.precio_combo}</p>
                <small>{combo.descripcion}</small>
                <p className="item-count">
                    {combo.comboProductos?.length || 0} productos incluidos
                </p>
              </div>
              <div className="card-actions">
                <button 
                    className="btn-edit" 
                    onClick={() => openComboDetail(combo)}
                >
                    <FaEdit /> Administrar Items
                </button>
                <button 
                    className="btn-delete" 
                    onClick={() => handleDeleteCombo(combo.id)}
                >
                    <FaTrash />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // VISTA DE DETALLE
  return (
    <div className="admin-section detail-view">
      <button className="btn-back" onClick={() => {
          setView('list');
          loadInitialData(); // Refrescar lista principal al volver
      }}>
        <FaArrowLeft /> Volver a Combos
      </button>

      <div className="combo-header">
        <h2>Editando: {selectedCombo?.nombre}</h2>
        <span className="price-tag">${selectedCombo?.precio_combo}</span>
      </div>

      <div className="combo-content-layout">
        
        <div className="add-item-panel">
          <h3>Agregar Producto al Combo</h3>
          <form onSubmit={handleAddItem}>
            <div className="form-group">
                <label>Producto:</label>
                <select 
                    value={itemForm.producto_id}
                    onChange={e => setItemForm({...itemForm, producto_id: e.target.value})}
                    required
                >
                    <option value="">-- Seleccionar --</option>
                    {productos.map(p => (
                        <option key={p.id} value={p.id}>{p.nombre} (${p.precio})</option>
                    ))}
                </select>
            </div>
            
            <div className="form-group">
                <label>Cantidad:</label>
                <input 
                    type="number" min="1" 
                    value={itemForm.cantidad}
                    onChange={e => setItemForm({...itemForm, cantidad: e.target.value})}
                />
            </div>

            <button type="submit" className="btn-save"><FaPlus /> Agregar al Combo</button>
          </form>
        </div>

        <div className="current-items-list">
          <h3>Contenido del Combo</h3>
          {selectedCombo?.comboProductos && selectedCombo.comboProductos.length > 0 ? (
            <ul>
              {selectedCombo.comboProductos.map(cp => (
                <li key={cp.id} className="combo-item-row">
                    <span className="qty-badge">x{cp.cantidad}</span>
                    <span className="prod-name">{cp.producto?.nombre || 'Producto no disponible'}</span>
                    <button 
                        className="btn-delete-small"
                        onClick={() => handleRemoveItem(cp.id)}
                    >
                        <FaTrash />
                    </button>
                </li>
              ))}
            </ul>
          ) : (
            <p className="empty-msg">Este combo aún no tiene productos.</p>
          )}
        </div>

      </div>
    </div>
  );
};

export default AdminCombos;