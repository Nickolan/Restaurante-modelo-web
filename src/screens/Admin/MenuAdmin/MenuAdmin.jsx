import React, { useEffect, useState } from 'react';
import { menuService } from '../../../services/menu.service';
import './MenuAdmin.css';
import { Plus, Edit, Trash2, X, Upload, Image as ImageIcon } from 'lucide-react';

const MenuAdmin = () => {
    const [productos, setProductos] = useState([]);
    const [categorias, setCategorias] = useState([]);
    const [loading, setLoading] = useState(true);
    
    // Estado del Modal
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null); // Si es null, es CREAR. Si tiene objeto, es EDITAR.

    // Estado del Formulario
    const [formData, setFormData] = useState({
        nombre: '',
        descripcion: '',
        precio: '',
        categoria_id: ''
    });

    const [selectedFile, setSelectedFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);
    

    // Cargar datos al inicio
    useEffect(() => {
        loadData();
    }, []);

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setSelectedFile(file);
            setPreviewUrl(URL.createObjectURL(file)); // Genera una URL temporal para la vista previa
        }
    };

    const loadData = async () => {
        setLoading(true);
        try {
            const [prods, cats] = await Promise.all([
                menuService.getProductos(),
                menuService.getCategorias()
            ]);
            setProductos(prods);
            setCategorias(cats);
        } catch (error) {
            console.error("Error cargando menú:", error);
            alert("Error al cargar los datos del servidor");
        } finally {
            setLoading(false);
        }
    };

    // --- MANEJADORES DEL MODAL ---
    const openCreateModal = () => {
        setEditingProduct(null);
        setFormData({ nombre: '', descripcion: '', precio: '', categoria_id: '' });
        setSelectedFile(null);
        setPreviewUrl(null);
        setIsModalOpen(true);
    };

    const openEditModal = (producto) => {
        setEditingProduct(producto);
        setFormData({
            nombre: producto.nombre,
            descripcion: producto.descripcion,
            precio: producto.precio,
            imagen: producto.imagen,
            categoria_id: producto.categoria_id // Tu backend debe devolver esto, o producto.categoria.id
        });
        setIsModalOpen(true);
    };

    // --- CRUD ---
    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            // --- USAMOS FORMDATA PARA ENVIAR EL ARCHIVO ---
            const data = new FormData();
            data.append('nombre', formData.nombre);
            data.append('descripcion', formData.descripcion);
            data.append('precio', formData.precio);
            data.append('categoria_id', formData.categoria_id);
            
            if (selectedFile) {
                data.append('image', selectedFile); // 'image' debe coincidir con el backend
            }

            if (editingProduct) {
                await menuService.updateProducto(editingProduct.id, data);
            } else {
                await menuService.createProducto(data);
            }

            setIsModalOpen(false);
            setSelectedFile(null);
            setPreviewUrl(null);
            loadData();
        } catch (error) {
            alert("Error al guardar el producto");
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm("¿Estás seguro de eliminar este producto? Esta acción no se puede deshacer.")) {
            try {
                await menuService.deleteProducto(id);
                setProductos(productos.filter(p => p.id !== id)); // Optimista: eliminar de la vista sin recargar todo
            } catch (error) {
                alert("Error al eliminar");
            }
        }
    };

    return (
        <div className="menu-admin-container">
            {/* Header */}
            <div className="admin-page-header">
                <h1 className="page-title">Gestión del Menú</h1>
                <button className="btn-add" onClick={openCreateModal}>
                    <Plus size={20} /> Nuevo Producto
                </button>
            </div>

            {/* Tabla */}
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
                        {loading ? (
                            <tr><td colSpan="5" style={{textAlign:'center'}}>Cargando productos...</td></tr>
                        ) : productos.map((prod) => (
                            <tr key={prod.id}>
                                <td>
                                    {prod.imagen ? (
                                        <img src={`${prod.imagen}`} alt="mini" className="product-thumb" onError={(e) => e.target.src = 'https://via.placeholder.com/50'}/>
                                    ) : (
                                        <div className="product-thumb" style={{display:'flex', justifyContent:'center', alignItems:'center'}}><ImageIcon size={20} color="#ccc"/></div>
                                    )}
                                </td>
                                <td>
                                    <strong>{prod.nombre}</strong><br/>
                                    <small style={{color:'#888'}}>{prod.descripcion?.substring(0, 30)}...</small>
                                </td>
                                <td>${Number(prod.precio).toFixed(2)}</td>
                                <td>
                                    {/* Asumimos que prod.categoria viene populado gracias a TypeORM */}
                                    <span className="badge-cat">{prod.categoria?.nombre || 'Sin Cat.'}</span>
                                </td>
                                <td>
                                    <button className="action-btn btn-edit" onClick={() => openEditModal(prod)} title="Editar">
                                        <Edit size={18} />
                                    </button>
                                    <button className="action-btn btn-delete" onClick={() => handleDelete(prod.id)} title="Eliminar">
                                        <Trash2 size={18} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* MODAL FORMULARIO */}
            {isModalOpen && (
                <div className="modal-overlay">
                    <div className="modal-form">
                        <div style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
                            <h2>{editingProduct ? 'Editar Producto' : 'Crear Nuevo Producto'}</h2>
                            <button onClick={() => setIsModalOpen(false)} style={{background:'none', border:'none', cursor:'pointer'}}><X size={24}/></button>
                        </div>

                        <form onSubmit={handleSubmit}>
                            <div className="form-group">
                                <label>Nombre del Producto</label>
                                <input className="form-input" 
                                    value={formData.nombre} 
                                    onChange={(e) => setFormData({...formData, nombre: e.target.value})} 
                                />
                            </div>

                            <div style={{display:'flex', gap:'15px'}}>
                                <div className="form-group" style={{flex:1}}>
                                    <label>Precio</label>
                                    <input type="number" step="0.01" className="form-input" 
                                        value={formData.precio} 
                                        onChange={(e) => setFormData({...formData, precio: e.target.value})} 
                                    />
                                </div>
                                <div className="form-group" style={{flex:1}}>
                                    <label>Categoría</label>
                                    <select className="form-select" 
                                        value={formData.categoria_id} 
                                        onChange={(e) => setFormData({...formData, categoria_id: e.target.value})}
                                    >
                                        <option value="">Seleccionar...</option>
                                        {categorias.map(cat => (
                                            <option key={cat.id} value={cat.id}>{cat.nombre}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="form-group">
                                <label>Imagen del Producto</label>
                                <div className="file-upload-wrapper">
                                    {previewUrl || (editingProduct && editingProduct.imagen) ? (
                                        <div className="image-preview-container">
                                            <img src={previewUrl || editingProduct.imagen} alt="Preview" className="image-preview" />
                                            <button type="button" className="btn-remove-img" onClick={() => {setSelectedFile(null); setPreviewUrl(null);}}>Cambiar</button>
                                        </div>
                                    ) : (
                                        <label className="file-dropzone">
                                            <Upload size={30} />
                                            <span>Haz clic para subir imagen</span>
                                            <input type="file" accept="image/*" onChange={handleFileChange} hidden />
                                        </label>
                                    )}
                                </div>
                            </div>

                            <div className="form-group">
                                <label>Descripción</label>
                                <textarea className="form-textarea" 
                                    value={formData.descripcion} 
                                    onChange={(e) => setFormData({...formData, descripcion: e.target.value})} 
                                />
                            </div>

                            <div className="modal-actions">
                                <button type="button" className="btn-cancel" onClick={() => setIsModalOpen(false)}>Cancelar</button>
                                <button type="submit" className="btn-save" disabled={loading}>
                                    {loading ? 'Subiendo...' : 'Guardar'}
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