import React, { useEffect, useState } from 'react';
import { menuService } from '../../../services/menu.service';
import './MenuAdmin.css';
import { 
    Plus, Edit, Trash2, X, Upload, 
    Save, List, Grid, Image as ImageIcon, Loader 
} from 'lucide-react';

const MenuAdmin = () => {
    // --- ESTADOS GLOBALES ---
    const [activeTab, setActiveTab] = useState('productos'); // 'productos' | 'categorias'
    const [loading, setLoading] = useState(false);
    
    // --- ESTADOS DE DATOS ---
    const [productos, setProductos] = useState([]);
    const [categorias, setCategorias] = useState([]);

    // --- ESTADOS PARA PRODUCTOS (Modal & Upload) ---
    const [isProductModalOpen, setIsProductModalOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);
    const [prodForm, setProdForm] = useState({
        nombre: '',
        descripcion: '',
        precio: '',
        categoria_id: ''
    });
    const [selectedFile, setSelectedFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);

    // --- ESTADOS PARA CATEGORÍAS (Formulario lateral) ---
    const [editingCategory, setEditingCategory] = useState(null);
    const [catForm, setCatForm] = useState({ nombre: '', descripcion: '' });

    // =========================================================
    // 1. CARGA INICIAL
    // =========================================================
    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        try {
            const [prodsData, catsData] = await Promise.all([
                menuService.getProductos(),
                menuService.getCategorias()
            ]);
            setProductos(prodsData);
            setCategorias(catsData);
        } catch (error) {
            console.error("Error cargando datos:", error);
        } finally {
            setLoading(false);
        }
    };

    // =========================================================
    // 2. LÓGICA DE PRODUCTOS
    // =========================================================
    
    // Abrir modal para CREAR
    const openCreateProductModal = () => {
        setEditingProduct(null);
        setProdForm({ nombre: '', descripcion: '', precio: '', categoria_id: '' });
        setSelectedFile(null);
        setPreviewUrl(null);
        setIsProductModalOpen(true);
    };

    // Abrir modal para EDITAR
    const openEditProductModal = (prod) => {
        setEditingProduct(prod);
        setProdForm({
            nombre: prod.nombre,
            descripcion: prod.descripcion,
            precio: prod.precio,
            categoria_id: prod.categoria_id
        });
        setSelectedFile(null);
        setPreviewUrl(prod.imagen); // Mostrar la imagen actual
        setIsProductModalOpen(true);
    };

    // Manejar selección de archivo
    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setSelectedFile(file);
            setPreviewUrl(URL.createObjectURL(file)); // Preview local inmediata
        }
    };

    // Guardar Producto (FormData para imagen)
    const handleSubmitProducto = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const data = new FormData();
            data.append('nombre', prodForm.nombre);
            data.append('descripcion', prodForm.descripcion);
            data.append('precio', prodForm.precio);
            data.append('categoria_id', prodForm.categoria_id);
            
            if (selectedFile) {
                data.append('image', selectedFile); // Clave debe coincidir con backend
            }

            if (editingProduct) {
                await menuService.updateProducto(editingProduct.id, data);
            } else {
                await menuService.createProducto(data);
            }

            setIsProductModalOpen(false);
            loadData();
        } catch (error) {
            alert("Error al guardar producto");
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteProducto = async (id) => {
        if (!window.confirm("¿Eliminar este producto?")) return;
        try {
            await menuService.deleteProducto(id);
            loadData();
        } catch (e) { alert("Error al eliminar"); }
    };

    // =========================================================
    // 3. LÓGICA DE CATEGORÍAS
    // =========================================================

    const handleEditCategory = (cat) => {
        setEditingCategory(cat);
        setCatForm({ nombre: cat.nombre, descripcion: cat.descripcion || '' });
    };

    const handleCancelEditCat = () => {
        setEditingCategory(null);
        setCatForm({ nombre: '', descripcion: '' });
    };

    const handleSubmitCategory = async (e) => {
        e.preventDefault();
        if (!catForm.nombre) return alert("Nombre requerido");
        
        setLoading(true);
        try {
            if (editingCategory) {
                await menuService.updateCategoria(editingCategory.id, catForm);
            } else {
                await menuService.createCategoria(catForm);
            }
            handleCancelEditCat();
            loadData();
        } catch (error) {
            alert("Error al guardar categoría");
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteCategory = async (id) => {
        if (!window.confirm("¿Eliminar categoría? Verifica que no tenga productos.")) return;
        try {
            await menuService.deleteCategoria(id);
            loadData();
        } catch (e) { alert("No se pudo eliminar (posiblemente tiene productos vinculados)"); }
    };

    // =========================================================
    // 4. RENDERIZADO
    // =========================================================
    return (
        <div className="menu-admin-container">
            <h1 className="page-title">Gestión del Menú</h1>

            {/* --- PESTAÑAS SUPERIORES --- */}
            <div className="admin-tabs">
                <button 
                    className={`tab-btn ${activeTab === 'productos' ? 'active' : ''}`}
                    onClick={() => setActiveTab('productos')}
                >
                    <Grid size={18} style={{marginRight:8, verticalAlign:'text-bottom'}}/> Productos
                </button>
                <button 
                    className={`tab-btn ${activeTab === 'categorias' ? 'active' : ''}`}
                    onClick={() => setActiveTab('categorias')}
                >
                    <List size={18} style={{marginRight:8, verticalAlign:'text-bottom'}}/> Categorías
                </button>
            </div>

            {/* ================= SECCIÓN PRODUCTOS ================= */}
            {activeTab === 'productos' && (
                <div className="fade-in">
                    <div className="admin-actions">
                        <button className="btn-add" onClick={openCreateProductModal}>
                            <Plus size={20} /> Nuevo Producto
                        </button>
                    </div>

                    <div className="admin-table-container">
                        <table className="admin-table">
                            <thead>
                                <tr>
                                    <th>Imagen</th>
                                    <th>Nombre</th>
                                    <th>Precio</th>
                                    <th>Categoría</th>
                                    <th>Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {productos.map(prod => (
                                    <tr key={prod.id}>
                                        <td>
                                            <div className="table-img-wrapper">
                                                {prod.imagen ? (
                                                    <img src={prod.imagen} alt={prod.nombre} />
                                                ) : (
                                                    <div className="no-img"><ImageIcon size={16}/></div>
                                                )}
                                            </div>
                                        </td>
                                        <td>{prod.nombre}</td>
                                        <td style={{color:'#F1C40F'}}>${prod.precio}</td>
                                        <td>
                                            <span className="badge-cat">
                                                {prod.categoria?.nombre || 'Sin Cat.'}
                                            </span>
                                        </td>
                                        <td>
                                            <button className="action-icon-btn edit" onClick={() => openEditProductModal(prod)}>
                                                <Edit size={18}/>
                                            </button>
                                            <button className="action-icon-btn delete" onClick={() => handleDeleteProducto(prod.id)}>
                                                <Trash2 size={18}/>
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* ================= SECCIÓN CATEGORÍAS ================= */}
            {activeTab === 'categorias' && (
                <div className="categories-layout fade-in">
                    
                    {/* IZQUIERDA: LISTADO */}
                    <div className="mini-table-container">
                        <table className="admin-table">
                            <thead>
                                <tr>
                                    <th>Nombre</th>
                                    <th style={{width: 100}}>Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {categorias.map(cat => (
                                    <tr key={cat.id}>
                                        <td style={{fontWeight:'bold'}}>{cat.nombre}</td>
                                        <td>
                                            <button className="action-icon-btn edit" onClick={() => handleEditCategory(cat)}>
                                                <Edit size={18} />
                                            </button>
                                            <button className="action-icon-btn delete" onClick={() => handleDeleteCategory(cat.id)}>
                                                <Trash2 size={18} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* DERECHA: FORMULARIO */}
                    <div className="category-form-card">
                        <h3>{editingCategory ? 'Editar Categoría' : 'Nueva Categoría'}</h3>
                        <form onSubmit={handleSubmitCategory}>
                            <div className="form-group">
                                <label>Nombre</label>
                                <input 
                                    className="admin-input" 
                                    value={catForm.nombre}
                                    onChange={e => setCatForm({...catForm, nombre: e.target.value})}
                                    placeholder="Ej: Bebidas"
                                />
                            </div>
                            <div className="form-actions" style={{display:'flex', gap:10, marginTop:20}}>
                                {editingCategory && (
                                    <button type="button" className="btn-cancel" onClick={handleCancelEditCat} style={{flex:1}}>
                                        Cancelar
                                    </button>
                                )}
                                <button type="submit" className="btn-save" style={{flex:1}}>
                                    <Save size={18} style={{marginRight:5, verticalAlign:'middle'}}/>
                                    {editingCategory ? 'Actualizar' : 'Guardar'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* ================= MODAL PRODUCTOS ================= */}
            {isProductModalOpen && (
                <div className="modal-overlay">
                    <div className="modal-form">
                        <div className="modal-header">
                            <h2>{editingProduct ? 'Editar Producto' : 'Nuevo Producto'}</h2>
                            <button className="btn-close-modal" onClick={() => setIsProductModalOpen(false)}>
                                <X size={24}/>
                            </button>
                        </div>
                        
                        <form onSubmit={handleSubmitProducto}>
                            <div className="form-grid">
                                <div className="form-group">
                                    <label>Nombre</label>
                                    <input className="admin-input" required
                                        value={prodForm.nombre}
                                        onChange={e => setProdForm({...prodForm, nombre: e.target.value})}
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Precio</label>
                                    <input type="number" className="admin-input" required
                                        value={prodForm.precio}
                                        onChange={e => setProdForm({...prodForm, precio: e.target.value})}
                                    />
                                </div>
                            </div>

                            <div className="form-group">
                                <label>Categoría</label>
                                <select className="admin-input" required
                                    value={prodForm.categoria_id}
                                    onChange={e => setProdForm({...prodForm, categoria_id: e.target.value})}
                                >
                                    <option value="">Seleccione...</option>
                                    {categorias.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
                                </select>
                            </div>

                            <div className="form-group">
                                <label>Descripción</label>
                                <textarea className="admin-input" rows="2"
                                    value={prodForm.descripcion}
                                    onChange={e => setProdForm({...prodForm, descripcion: e.target.value})}
                                />
                            </div>

                            {/* UPLOAD IMAGEN */}
                            <div className="form-group">
                                <label>Imagen</label>
                                <div className="file-upload-wrapper">
                                    {previewUrl ? (
                                        <div className="image-preview-container">
                                            <img src={previewUrl} alt="Preview" className="image-preview" />
                                            <button type="button" className="btn-remove-img" 
                                                onClick={() => {setSelectedFile(null); setPreviewUrl(null);}}>
                                                Cambiar Imagen
                                            </button>
                                        </div>
                                    ) : (
                                        <label className="file-dropzone">
                                            <Upload size={30} />
                                            <span>Subir foto (JPG/PNG)</span>
                                            <input type="file" accept="image/*" onChange={handleFileChange} hidden />
                                        </label>
                                    )}
                                </div>
                            </div>

                            <div className="modal-actions">
                                <button type="button" className="btn-cancel" onClick={() => setIsProductModalOpen(false)}>
                                    Cancelar
                                </button>
                                <button type="submit" className="btn-save" disabled={loading}>
                                    {loading ? <Loader className="spin" size={18}/> : 'Guardar Producto'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MenuAdmin;