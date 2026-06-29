import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { Plus, X, AlertTriangle, Package, AlertCircle, ShoppingCart } from 'lucide-react';
import { validatePositiveNumber, validatePositiveInt, validateMax } from '../../lib/validation';
import ConfirmModal from '../../components/ConfirmModal';
import Pagination from '../../components/Pagination';
import { useToast } from '../../components/ToastContext';

interface Producto { pro_id: number; pro_nombre: string; pro_precio: number; pro_stock: number; pro_estado: string; }
interface Proveedor { prv_id: number; prv_nombre: string; }
const glassCard = 'bg-gradient-to-br from-white/5 to-white/[0.02] rounded-2xl border border-white/10';

export default function Inventario() {
  const navigate = useNavigate();
  const [productos, setProductos] = useState<Producto[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [form, setForm] = useState({ pro_nombre: '', pro_precio: '', pro_stock: '', pro_estado: 'activo', proveedor_id: '' });
  const [errors, setErrors] = useState<{ pro_nombre?: string; pro_precio?: string; pro_stock?: string; api?: string }>({});
  const { addToast } = useToast();
  const [confirmDelete, setConfirmDelete] = useState<number | null>(null);
  const [corteAbierto, setCorteAbierto] = useState<any>(null);
  const [comprandoId, setComprandoId] = useState<number | null>(null);
  const [proveedores, setProveedores] = useState<Proveedor[]>([]);
  const [currentPprId, setCurrentPprId] = useState<number | null>(null);

  const fetchProveedores = async () => { try { const res = await api.get('/api/proveedores/'); setProveedores(res.data.data || []); } catch {} };

  const validateForm = (): boolean => {
    const newErrors: typeof errors = {};
    // Productos pueden tener números y símbolos (ej: "50ml", "400g")
    if (!form.pro_nombre || form.pro_nombre.trim() === '') {
      newErrors.pro_nombre = 'Nombre del producto es requerido';
    } else if (form.pro_nombre.trim().length > 80) {
      newErrors.pro_nombre = 'Nombre no debe exceder 80 caracteres';
    } else if (!/[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ]/.test(form.pro_nombre.trim())) {
      newErrors.pro_nombre = 'Nombre debe contener al menos una letra';
    } else if (/[^a-zA-ZáéíóúÁÉÍÓÚñÑüÜ0-9\s.,\-]/.test(form.pro_nombre.trim())) {
      newErrors.pro_nombre = 'Nombre solo puede contener letras, números, espacios, puntos, comas y guiones';
    }
    const priceErr = validatePositiveNumber(form.pro_precio, 'Precio');
    if (priceErr) newErrors.pro_precio = priceErr;
    const priceMaxErr = validateMax(form.pro_precio, 'Precio', 300000, 'moneda');
    if (priceMaxErr) newErrors.pro_precio = priceMaxErr;
    const stockErr = validatePositiveInt(form.pro_stock, 'Stock');
    if (stockErr) newErrors.pro_stock = stockErr;
    const stockMaxErr = validateMax(form.pro_stock, 'Stock', 999);
    if (stockMaxErr) newErrors.pro_stock = stockMaxErr;
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [total, setTotal] = useState(0);

  const fetch = async (p?: number) => {
    const pg = p ?? page;
    try {
      const res = await api.get('/api/productos/', { params: { page: pg, limit: 24 } });
      setProductos(res.data.data || []);
      setPages(res.data.pages || 1);
      setTotal(res.data.total || 0);
    } catch (err) { console.error(err); addToast('Error al cargar inventario. Verifica tu conexión.', 'error'); }
    finally { setLoading(false); }
  };
  useEffect(() => { fetch(); }, [page]);
  const fetchCorte = async () => { try { const r = await api.get('/api/cortes-caja/abierto'); setCorteAbierto(r.data); } catch { setCorteAbierto(null); } };
  useEffect(() => { fetchCorte(); }, []);

  // Refrescar datos automáticamente al volver a la página
  useEffect(() => {
    const refetch = () => { fetch(); fetchCorte(); };
    const onVisibility = () => { if (document.visibilityState === 'visible') refetch(); };
    window.addEventListener('focus', refetch);
    document.addEventListener('visibilitychange', onVisibility);
    return () => {
      window.removeEventListener('focus', refetch);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, [page]);

  const handleComprar = async (producto: Producto) => {
    if (!corteAbierto) {
      addToast('Debe abrir un corte de caja primero', 'error');
      return;
    }
    setComprandoId(producto.pro_id);
    try {
      const res = await api.get(`/api/proveedores-productos/producto/${producto.pro_id}`);
      const vinculaciones = res.data || [];
      if (vinculaciones.length === 0) {
        addToast('Este producto no tiene proveedor asignado. Vincula uno en Productos por Proveedor.', 'error');
        setComprandoId(null);
        return;
      }
      const vinculo = vinculaciones[0];
      navigate(`/admin/compras?producto_id=${producto.pro_id}&proveedor_id=${vinculo.ppr_proveedor_id}&precio=${vinculo.ppr_precio}`);
    } catch (err) {
      console.error(err);
      addToast('Error al obtener información del proveedor', 'error');
    } finally {
      setComprandoId(null);
    }
  };

  const openCreate = () => { setEditId(null); setCurrentPprId(null); setForm({ pro_nombre: '', pro_precio: '', pro_stock: '0', pro_estado: 'activo', proveedor_id: '' }); setShowForm(true); fetchProveedores(); };
  const openEdit = async (p: Producto) => {
    setEditId(p.pro_id);
    setCurrentPprId(null);
    setForm({ pro_nombre: p.pro_nombre, pro_precio: String(p.pro_precio), pro_stock: String(p.pro_stock), pro_estado: p.pro_estado, proveedor_id: '' });
    setShowForm(true);
    fetchProveedores();
    // Cargar proveedor vinculado actual
    try {
      const res = await api.get(`/api/proveedores-productos/producto/${p.pro_id}`);
      const vinculos = res.data || [];
      if (vinculos.length > 0) {
        setForm(f => ({ ...f, proveedor_id: String(vinculos[0].ppr_proveedor_id) }));
        setCurrentPprId(vinculos[0].ppr_id);
      }
    } catch { /* sin proveedor vinculado */ }
  };
  const handleSave = async () => {
    if (!validateForm()) return;

    const data = { ...form, pro_precio: parseFloat(form.pro_precio), pro_stock: parseInt(form.pro_stock) || 0 };

    if (editId) {
      // ── EDITAR (optimista) ──
      const original = productos.find(p => p.pro_id === editId);

      // Optimista: actualizar producto en la lista local al instante
      setProductos(prev => prev.map(p => p.pro_id === editId ? {
        ...p,
        pro_nombre: data.pro_nombre,
        pro_precio: data.pro_precio,
        pro_stock: data.pro_stock || 0,
        pro_estado: data.pro_estado,
      } : p));
      setShowForm(false);

      try {
        await api.put(`/api/productos/${editId}`, data);
        // Gestionar vínculo proveedor
        if (currentPprId) {
          try { await api.delete(`/api/proveedores-productos/${currentPprId}`); } catch {}
        }
        if (form.proveedor_id) {
          try {
            await api.post('/api/proveedores-productos/', {
              ppr_proveedor_id: Number(form.proveedor_id),
              ppr_producto_id: editId,
              ppr_precio: parseFloat(form.pro_precio) || 0
            });
          } catch (err: any) {
            addToast(err?.response?.data?.error || 'Error al vincular proveedor', 'error');
          }
        }
        addToast('Producto actualizado correctamente');
        // Re-ordenar si el nombre cambió
        setProductos(prev => [...prev].sort((a, b) => a.pro_nombre.localeCompare(b.pro_nombre)));
      } catch (err: any) {
        // Revertir cambios locales si falla el backend
        if (original) {
          setProductos(prev => prev.map(p => p.pro_id === editId ? original : p));
        }
        const msg = err?.response?.data?.error || err?.message || 'Error al actualizar';
        addToast(msg, 'error');
      }
    } else {
      // ── CREAR (optimista) ──
      const tempId = -(Date.now());
      const tempProduct: Producto = {
        pro_id: tempId,
        pro_nombre: data.pro_nombre,
        pro_precio: data.pro_precio,
        pro_stock: data.pro_stock || 0,
        pro_estado: data.pro_estado || 'activo',
      };

      // Optimista: agregar a la lista local al instante
      setProductos(prev => [tempProduct, ...prev]);
      setShowForm(false);
      setPage(1);

      try {
        const res = await api.post('/api/productos/', data);
        const realId: number = res.data?.pro_id || res.data?.id;
        // Reemplazar ID temporal con el real y ordenar alfabéticamente
        setProductos(prev => {
          const updated = prev.map(p => p.pro_id === tempId ? { ...p, pro_id: realId } : p);
          return updated.sort((a, b) => a.pro_nombre.localeCompare(b.pro_nombre));
        });
        setTotal(prev => prev + 1);
        addToast('Producto creado correctamente');

        // Vincular proveedor si se seleccionó
        if (form.proveedor_id && realId) {
          try {
            await api.post('/api/proveedores-productos/', {
              ppr_proveedor_id: Number(form.proveedor_id),
              ppr_producto_id: realId,
              ppr_precio: parseFloat(form.pro_precio) || 0
            });
          } catch (err: any) {
            addToast(err?.response?.data?.error || 'Error al vincular proveedor', 'error');
          }
        }
      } catch (err: any) {
        // Quitar producto temporal si falla
        setProductos(prev => prev.filter(p => p.pro_id !== tempId));
        const msg = err?.response?.data?.error || err?.message || 'Error al crear';
        addToast(msg, 'error');
      }
    }
  };
  const handleDelete = async (id: number) => {
    const original = productos.find(p => p.pro_id === id);
    // Optimista: quitar de la UI al instante
    setProductos(prev => prev.filter(p => p.pro_id !== id));
    setConfirmDelete(null);
    try {
      await api.delete(`/api/productos/${id}`);
      addToast('Producto eliminado correctamente');
      setTotal(prev => prev - 1);
    } catch (err: any) {
      // Restaurar si falla
      if (original) {
        setProductos(prev => [...prev, original]);
      }
      const msg = err?.response?.data?.error || err?.message || 'Error al eliminar';
      addToast(msg, 'error');
    }
  };

  const bajoStock = productos.filter(p => p.pro_stock <= 5);
  const stockNormal = productos.filter(p => p.pro_stock > 5);

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Inventario</h1>
          <p className="text-white/30 text-sm mt-1">{productos.length} productos en almacén</p>
        </div>
        <button onClick={openCreate} className="flex items-center gap-2 px-4 lg:px-5 py-2 lg:py-2.5 rounded-xl bg-gradient-to-r from-salon-gold to-salon-pink text-black text-xs lg:text-sm font-semibold hover:shadow-[0_0_20px_rgba(212,168,67,0.3)] transition-all whitespace-nowrap">
          <Plus size={15} /> Nuevo producto
        </button>
      </div>

      {loading ? <div className="p-12 text-center text-white/30">Cargando...</div> : (
        <div className="space-y-8">
          {/* ⚠️ Alerta de bajo stock */}
          {bajoStock.filter(p => p.pro_stock < 0).length > 0 && (
            <div className={`${glassCard} border-red-500/30 p-5 mb-4`}>
              <div className="flex items-center gap-2 mb-3">
                <AlertCircle size={16} className="text-red-400" />
                <h2 className="text-sm font-semibold text-red-400">⚠️ Stock negativo detectado</h2>
                <span className="text-xs text-red-400/60 font-mono">{bajoStock.filter(p => p.pro_stock < 0).length} productos</span>
              </div>
              <p className="text-[10px] text-red-400/70 mb-3">Estos productos tienen stock negativo porque se consumieron más unidades de las disponibles. Registrá una compra o movimiento de entrada para normalizar el stock.</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {bajoStock.filter(p => p.pro_stock < 0).map(p => (
                  <div key={p.pro_id} className="bg-red-500/10 rounded-xl border border-red-500/20 p-4 flex flex-col gap-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-red-300 truncate">{p.pro_nombre}</p>
                        <p className="text-xs text-red-400 font-mono mt-0.5">Stock: {p.pro_stock} uds</p>
                      </div>
                      <span className="text-sm font-bold text-red-400 whitespace-nowrap">${p.pro_precio}</span>
                    </div>
                    {p.pro_id < 0 ? (
                      <div className="text-[11px] py-1.5 text-center text-white/20 italic">Guardando...</div>
                    ) : (<>
                      {corteAbierto ? (
                        <button
                          onClick={() => handleComprar(p)}
                          disabled={comprandoId === p.pro_id}
                          className="w-full text-[11px] py-2 rounded-lg bg-gradient-to-r from-red-500/25 to-orange-500/15 text-red-300 border border-red-500/20 hover:from-red-500/35 hover:to-orange-500/25 transition-all font-medium flex items-center justify-center gap-1.5 disabled:opacity-40"
                        >
                          <ShoppingCart size={12} />
                          {comprandoId === p.pro_id ? 'Buscando proveedor...' : 'Comprar ahora'}
                        </button>
                      ) : (
                        <div className="w-full text-[10px] py-1.5 text-center text-yellow-400/60 bg-yellow-500/5 rounded-lg border border-yellow-500/10">
                          Abra un corte de caja primero
                        </div>
                      )}
                      <div className="flex gap-2 pt-2">
                        <button onClick={() => openEdit(p)} className="flex-1 text-[11px] py-1.5 rounded-lg bg-white/5 text-red-300/50 hover:text-red-300 hover:bg-red-500/10 transition-all">✏️ Editar</button>
                        <button onClick={() => setConfirmDelete(p.pro_id)} className="flex-1 text-[11px] py-1.5 rounded-lg bg-white/5 text-red-300/50 hover:text-red-400 hover:bg-red-500/10 transition-all">🗑️ Eliminar</button>
                      </div>
                    </>)}
                  </div>
                ))}
              </div>
            </div>
          )}

          {bajoStock.filter(p => p.pro_stock >= 0 && p.pro_stock <= 5).length > 0 && (
            <div className={`${glassCard} border-amber-500/20 p-5`}>
              <div className="flex items-center gap-2 mb-4">
                <AlertTriangle size={16} className="text-amber-400" />
                <h2 className="text-sm font-semibold text-amber-400">Productos con stock bajo</h2>
                <span className="text-xs text-amber-400/60 font-mono">{bajoStock.filter(p => p.pro_stock >= 0 && p.pro_stock <= 5).length} items</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {bajoStock.filter(p => p.pro_stock >= 0 && p.pro_stock <= 5).map(p => (
                  <div key={p.pro_id} className="bg-amber-500/5 rounded-xl border border-amber-500/10 p-4 flex flex-col gap-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-amber-200 truncate">{p.pro_nombre}</p>
                        <p className="text-xs text-amber-400/80 font-mono mt-0.5">Stock: {p.pro_stock} uds</p>
                      </div>
                      <span className="text-sm font-bold text-amber-400 whitespace-nowrap">${p.pro_precio}</span>
                    </div>
                    {p.pro_id < 0 ? (
                      <div className="text-[11px] py-1.5 text-center text-white/20 italic">Guardando...</div>
                    ) : (<>
                      {corteAbierto ? (
                        <button
                          onClick={() => handleComprar(p)}
                          disabled={comprandoId === p.pro_id}
                          className="w-full text-[11px] py-2 rounded-lg bg-gradient-to-r from-amber-500/20 to-orange-500/10 text-amber-300 border border-amber-500/15 hover:from-amber-500/30 hover:to-orange-500/20 transition-all font-medium flex items-center justify-center gap-1.5 disabled:opacity-40"
                        >
                          <ShoppingCart size={12} />
                          {comprandoId === p.pro_id ? 'Buscando proveedor...' : 'Comprar ahora'}
                        </button>
                      ) : (
                        <div className="w-full text-[10px] py-1.5 text-center text-yellow-400/60 bg-yellow-500/5 rounded-lg border border-yellow-500/10">
                          Abra un corte de caja primero
                        </div>
                      )}
                      <div className="flex gap-2 pt-2">
                        <button onClick={() => openEdit(p)} className="flex-1 text-[11px] py-1.5 rounded-lg bg-white/5 text-amber-300/50 hover:text-amber-300 hover:bg-amber-500/10 transition-all">✏️ Editar</button>
                        <button onClick={() => setConfirmDelete(p.pro_id)} className="flex-1 text-[11px] py-1.5 rounded-lg bg-white/5 text-amber-300/50 hover:text-red-400 hover:bg-red-500/10 transition-all">🗑️ Eliminar</button>
                      </div>
                    </>)}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 📦 Estante de productos */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Package size={15} className="text-salon-gold" />
              <h2 className="text-sm font-semibold text-white/70">Stock disponible</h2>
              <span className="text-xs text-white/20 font-mono">{stockNormal.length} productos</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {stockNormal.map(p => (
                <div key={p.pro_id} className="group bg-gradient-to-br from-white/[0.06] to-white/[0.02] rounded-xl border border-white/10 p-4 hover:border-salon-gold/20 hover:shadow-[0_0_15px_rgba(212,168,67,0.06)] transition-all">
                  {/* Nombre + Estado */}
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <h3 className="font-medium text-sm truncate">{p.pro_nombre}</h3>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium whitespace-nowrap shrink-0 ${
                      p.pro_estado === 'activo'
                        ? 'text-green-400 bg-green-500/10'
                        : 'text-red-400 bg-red-500/10'
                    }`}>
                      {p.pro_estado === 'activo' ? 'Activo' : 'Inactivo'}
                    </span>
                  </div>

                  {/* Precio unitario */}
                  <p className="text-lg font-bold text-salon-pink">${Number(p.pro_precio).toLocaleString('es-CO')}</p>
                  <p className="text-[10px] text-white/20 -mt-0.5 mb-2">Precio por unidad</p>

                  {/* Stock + Valor total */}
                  <div className="flex items-center justify-between bg-white/[0.03] rounded-lg px-3 py-2 mb-3">
                    <div className="flex items-center gap-1.5">
                      <Package size={12} className="text-white/30" />
                      <span className="text-xs text-white/60">{p.pro_stock} <span className="text-white/30">uds</span></span>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] text-white/30">Valor: </span>
                      <span className="text-xs font-semibold text-salon-gold">${(Number(p.pro_precio) * (p.pro_stock || 0)).toLocaleString('es-CO')}</span>
                    </div>
                  </div>

                  {/* Acciones */}
                  {p.pro_id < 0 ? (
                    <div className="flex-1 text-[11px] py-1.5 text-center text-white/20 italic border-t border-white/5">Guardando...</div>
                  ) : (
                    <div className="flex gap-2 pt-2 border-t border-white/5">
                      <button onClick={() => openEdit(p)} className="flex-1 text-[11px] py-1.5 rounded-lg bg-white/5 text-white/50 hover:text-salon-pink hover:bg-salon-pink/10 transition-all">✏️ Editar</button>
                      <button onClick={() => setConfirmDelete(p.pro_id)} className="flex-1 text-[11px] py-1.5 rounded-lg bg-white/5 text-white/50 hover:text-red-400 hover:bg-red-500/10 transition-all">🗑️ Eliminar</button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Confirmación de eliminación */}
      <ConfirmModal
        open={confirmDelete !== null}
        title="Eliminar producto"
        message="¿Estás seguro de eliminar este producto? Esta acción no se puede deshacer."
        confirmLabel="Eliminar"
        onConfirm={() => { if (confirmDelete !== null) handleDelete(confirmDelete); setConfirmDelete(null); }}
        onCancel={() => setConfirmDelete(null)}
        destructive
      />

      {/* Modal Form */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm" onClick={() => setShowForm(false)}>
          <div className="bg-[#120c1a] border border-white/10 rounded-2xl shadow-xl w-full max-w-md mx-4 p-6" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold">{editId ? 'Editar' : 'Nuevo'} Producto</h2>
              <button onClick={() => setShowForm(false)}><X size={18} className="text-white/30" /></button>
            </div>
            <div className="space-y-3">
              <div><label className="block text-white/40 text-xs mb-1">Nombre</label>
                <input type="text" maxLength={80} value={form.pro_nombre} onChange={e => { setForm(f => ({...f, pro_nombre: e.target.value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑüÜ0-9\s.,\-]/g, '')})); setErrors(prev => ({...prev, pro_nombre: undefined})); }}
                  className={`w-full px-4 py-2.5 rounded-xl bg-white/5 border text-white text-sm focus:outline-none ${errors.pro_nombre ? 'border-red-400/50' : 'border-white/10 focus:border-salon-gold/50'}`} />
                {errors.pro_nombre && <p className="text-red-400 text-[10px] mt-1 flex items-center gap-1"><AlertCircle size={10} />{errors.pro_nombre}</p>}</div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="block text-white/40 text-xs mb-1">Precio ($)</label>
                  <input type="number" inputMode="decimal" maxLength={10} value={form.pro_precio} onChange={e => { setForm(f => ({...f, pro_precio: e.target.value.replace(/[^0-9.]/g, '')})); setErrors(prev => ({...prev, pro_precio: undefined})); }}
                    className={`w-full px-4 py-2.5 rounded-xl bg-white/5 border text-white text-sm focus:outline-none ${errors.pro_precio ? 'border-red-400/50' : 'border-white/10 focus:border-salon-gold/50'}`} />
                  {errors.pro_precio && <p className="text-red-400 text-[10px] mt-1 flex items-center gap-1"><AlertCircle size={10} />{errors.pro_precio}</p>}</div>
                <div><label className="block text-white/40 text-xs mb-1">Cantidad</label>
                  <input type="number" min="0" maxLength={3} value={form.pro_stock} onChange={e => { setForm(f => ({...f, pro_stock: e.target.value.replace(/\D/g, '')})); setErrors(prev => ({...prev, pro_stock: undefined})); }}
                    className={`w-full px-4 py-2.5 rounded-xl bg-white/5 border text-white text-sm focus:outline-none ${errors.pro_stock ? 'border-red-400/50' : 'border-white/10 focus:border-salon-gold/50'}`} />
                  {errors.pro_stock && <p className="text-red-400 text-[10px] mt-1 flex items-center gap-1"><AlertCircle size={10} />{errors.pro_stock}</p>}</div>
              </div>
              <div><label className="block text-white/40 text-xs mb-1">Proveedor</label>
                <select value={form.proveedor_id} onChange={e => {
                  if (e.target.value === '__nuevo__') { navigate('/admin/proveedores?nuevo=1'); return; }
                  setForm(f => ({...f, proveedor_id: e.target.value}));
                }}
                  className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-salon-gold/50">
                  <option value="" className="bg-[#120c1a]">Sin proveedor</option>
                  {proveedores.map(p => <option key={p.prv_id} value={p.prv_id} className="bg-[#120c1a]">{p.prv_nombre}</option>)}
                  <option value="__nuevo__" className="bg-[#120c1a] text-salon-pink">+ Nuevo proveedor</option>
                </select></div>
              {errors.api && <div className="text-xs text-red-400 bg-red-500/10 rounded-xl px-3 py-2 border border-red-500/10 flex items-center gap-1"><AlertCircle size={10} />{errors.api}</div>}
              <div><label className="block text-white/40 text-xs mb-1">Estado</label>
                <select value={form.pro_estado} onChange={e => setForm(f => ({...f, pro_estado: e.target.value}))}
                  disabled={!editId}
                  className={`w-full px-4 py-2.5 rounded-xl bg-white/5 border text-white text-sm focus:outline-none ${!editId ? 'border-white/5 text-white/30 cursor-not-allowed' : 'border-white/10 focus:border-salon-gold/50'}`}>
                  <option value="activo" className="bg-[#120c1a]">Activo</option>
                  <option value="inactivo" className="bg-[#120c1a]">Inactivo</option>
                </select></div>
              <div className="flex gap-3 pt-2">
                <button onClick={() => setShowForm(false)} className="flex-1 px-4 py-2.5 rounded-xl border border-white/10 text-white/50 text-sm hover:bg-white/5">Cancelar</button>
                <button onClick={handleSave} className="flex-1 px-4 py-2.5 rounded-xl bg-salon-pink text-white text-sm font-semibold hover:bg-salon-lavender">Guardar</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Paginación */}
      {pages > 1 && <Pagination page={page} pages={pages} total={total} limit={24} onChange={(p) => { setPage(p); }} />}
    </div>
  );
}
