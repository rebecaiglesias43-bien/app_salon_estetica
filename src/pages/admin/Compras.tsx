import { useEffect, useState, useRef } from 'react';
import { useSearchParams, useNavigate, useLocation } from 'react-router-dom';
import api from '../../services/api';
import { ShoppingCart, Plus, Truck, X, AlertCircle, ChevronDown } from 'lucide-react';
import { validatePositiveNumber } from '../../lib/validation';
import Pagination from '../../components/Pagination';
import { useToast } from '../../components/ToastContext';

interface Proveedor { prv_id: number; prv_nombre: string; }
interface Producto { pro_id: number; pro_nombre: string; pro_precio: number; pro_stock: number; }
interface VincProvProd { ppr_id: number; ppr_proveedor_id: number; ppr_producto_id: number; ppr_precio: number; pro_nombre?: string; pro_precio_venta?: number; }
const glassCard = 'bg-gradient-to-br from-white/5 to-white/[0.02] rounded-2xl border border-white/10';

export default function Compras() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [compras, setCompras] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [corteAbierto, setCorteAbierto] = useState<any>(null);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [totalReg, setTotalReg] = useState(0);
  const [refreshKey, setRefreshKey] = useState(0);
  const [showForm, setShowForm] = useState(false);
  const [proveedores, setProveedores] = useState<Proveedor[]>([]);
  const [productos, setProductos] = useState<Producto[]>([]);
  const [form, setForm] = useState({ proveedor_id: '' });
  const [preciosProveedor, setPreciosProveedor] = useState<Record<number, number>>({});
  const [productosDelProveedor, setProductosDelProveedor] = useState<number[]>([]);
  const [errors, setErrors] = useState<{ proveedor_id?: string; api?: string; items?: string }>({});
  const [items, setItems] = useState<{ producto_id: string; cantidad: string; precio_unitario: string }[]>([]);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [detalleCompras, setDetalleCompras] = useState<Record<number, any[]>>({});
  const { addToast } = useToast();

  const fetchCorte = async () => { try { const r = await api.get('/api/cortes-caja/abierto'); setCorteAbierto(r.data); } catch { setCorteAbierto(null); } };
  const fetch = async (pg?: number) => { try { const p = pg ?? page; const res = await api.get('/api/compras/', { params: { page: p, limit: 10 } }); setCompras(res.data.data || []); setPages(res.data.pages || 1); setTotalReg(res.data.total || 0); } catch (err) { console.error(err); addToast('Error al cargar compras. Verifica tu conexión.', 'error'); } finally { setLoading(false); } };
  useEffect(() => { fetch(); fetchCorte(); }, [page, refreshKey]);

  // Auto-abrir y auto-llenar formulario si se navegó con query params desde inventario
  const autoFillDone = useRef(false);
  useEffect(() => {
    const prodId = searchParams.get('producto_id');
    const provId = searchParams.get('proveedor_id');
    if (!prodId || !provId) return;

    if (autoFillDone.current) return; // Ya se auto-llenó, no repetir

    if (!showForm) {
      openCreate();
      return;
    }

    // showForm es true — auto-llenar con los datos del producto
    autoFillDone.current = true; // Marcar antes de cualquier async
    const precio = searchParams.get('precio');
    // Limpiar URL inmediatamente para evitar re-ejecuciones
    navigate(location.pathname, { replace: true });
    setForm(f => ({ ...f, proveedor_id: provId }));
    setItems([{ producto_id: prodId, cantidad: '1', precio_unitario: precio || '' }]);
    cargarPreciosProveedor(Number(provId));
  }, [showForm, searchParams]);

  const openCreate = async () => {
    autoFillDone.current = false;
    try { const [pR, pR2] = await Promise.all([api.get('/api/proveedores/'), api.get('/api/productos/')]); setProveedores(pR.data.data || []); setProductos(pR2.data.data || []); } catch {}
    setForm({ proveedor_id: '' }); setErrors({}); setItems([{ producto_id: '', cantidad: '1', precio_unitario: '' }]); setShowForm(true);
  };

  const cargarPreciosProveedor = async (prvId: number) => {
    try {
      const res = await api.get(`/api/proveedores-productos/proveedor/${prvId}`);
      const data: VincProvProd[] = res.data || [];
      const mapa: Record<number, number> = {};
      const ids: number[] = [];
      data.forEach(v => { mapa[v.ppr_producto_id] = v.ppr_precio; ids.push(v.ppr_producto_id); });
      setPreciosProveedor(mapa);
      setProductosDelProveedor(ids);
    } catch {
      setPreciosProveedor({});
      setProductosDelProveedor([]);
    }
  };

  const addItem = () => setItems([...items, { producto_id: '', cantidad: '1', precio_unitario: '' }]);
  const updateItem = (idx: number, field: string, value: string) => {
    setItems(items.map((item, i) => {
      if (i !== idx) return item;
      const newItem = { ...item, [field]: value };
      if (field === 'producto_id') {
        const prodId = Number(value);
        const precioProv = preciosProveedor[prodId];
        if (precioProv) newItem.precio_unitario = String(precioProv);
        else newItem.precio_unitario = '';
      }
      return newItem;
    }));
  };
  const removeItem = (idx: number) => setItems(items.filter((_, i) => i !== idx));
  const CANTIDADES_OPCIONES = [1,2,3,4,5,6,7,8,9,10,20,30,40,50,60,70,80,90,100,120,150,200,300,400,500,1000];
  // const MAX_CANTIDAD = 9999;
  const validateForm = (): boolean => {
    const newErrors: typeof errors = {};
    if (!form.proveedor_id) newErrors.proveedor_id = 'Debe seleccionar un proveedor';
    const hasProducto = items.some(i => i.producto_id !== '');
    if (!hasProducto) newErrors.items = 'Debe agregar al menos un producto';
    // Validar items
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      if (item.producto_id) {
        // La cantidad se selecciona de valores predefinidos, siempre es válida

        const precErr = validatePositiveNumber(item.precio_unitario, 'Precio');
        if (precErr) { newErrors.items = `Item #${i + 1}: ${precErr}`; break; }

      }
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    setErrors({});
    if (!validateForm()) return;
    try {
      const detalleEnviado = items.filter(i => i.producto_id).map(item => ({
        dco_producto_id: Number(item.producto_id),
        dco_cantidad: parseInt(item.cantidad) || 1,
        dco_precio_unitario: parseFloat(item.precio_unitario) || 0
      }));
      const res = await api.post('/api/compras/', {
        com_proveedor_id: Number(form.proveedor_id),
        detalle: detalleEnviado
      });
      const comId = res.data.com_id;
      // Pre-poblar detalle local para mostrarlo al instante al expandir
      const localDetalle = detalleEnviado.map(d => {
        const prod = productos.find(p => p.pro_id === d.dco_producto_id);
        return {
          pro_nombre: prod?.pro_nombre || 'Producto',
          dco_cantidad: d.dco_cantidad,
          dco_subtotal: d.dco_cantidad * d.dco_precio_unitario,
        };
      });
      setDetalleCompras(prev => ({ ...prev, [comId]: localDetalle }));
      setShowForm(false);
      setPage(1);
      setRefreshKey(k => k + 1); // Forzar refresh de la lista sin race condition
      addToast('Compra registrada exitosamente', 'success');
    } catch (err: any) {
      const msg = err.response?.data?.error || 'Error al registrar la compra';
      setErrors(prev => ({ ...prev, api: msg }));
    }
  };
  const total = items.reduce((s, i) => s + (parseInt(i.cantidad) || 0) * (parseFloat(i.precio_unitario) || 0), 0);

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div><h1 className="text-2xl lg:text-3xl font-bold">Compras</h1><p className="text-white/30 text-sm mt-1">Registro de compras con auto-suma al inventario</p></div>
        {corteAbierto ? (
          <button onClick={openCreate} className="flex items-center gap-1 px-4 py-2 rounded-xl bg-gradient-to-r from-salon-gold to-salon-pink text-black text-xs font-semibold hover:shadow-[0_0_20px_rgba(212,168,67,0.3)]"><Plus size={14} /> Nueva</button>
        ) : (
          <div className="flex items-center gap-2 text-xs text-yellow-400 bg-yellow-500/10 px-4 py-2 rounded-full border border-yellow-500/10">
            <AlertCircle size={14} />
            <span>Abra un corte de caja primero</span>
          </div>
        )}
      </div>
      {loading ? <div className="p-8 text-center text-white/30">Cargando...</div> : compras.length === 0 ? (
        <div className={`${glassCard} p-8 text-center`}><ShoppingCart size={48} className="mx-auto text-white/10 mb-3" /><p className="text-white/30">No hay compras registradas</p></div>
      ) : (
        <div className="space-y-3">
          <Pagination page={page} pages={pages} total={totalReg} limit={10} onChange={setPage} />
          {compras.map(c => {
            const expanded = expandedId === c.com_id;
            const detalle = detalleCompras[c.com_id] || [];
            return (
              <div key={c.com_id}>
                <div
                  onClick={async () => {
                    if (expanded) { setExpandedId(null); return; }
                    setExpandedId(c.com_id);
                    if (detalleCompras[c.com_id] === undefined) {
                      try {
                        const res = await api.get(`/api/compras/${c.com_id}`);
                        const det = res.data.detalle;
                        if (det && det.length > 0) {
                          setDetalleCompras(prev => ({ ...prev, [c.com_id]: det }));
                        } else {
                          setDetalleCompras(prev => ({ ...prev, [c.com_id]: [{ pro_nombre: 'No se encontraron productos en esta compra', dco_cantidad: 0, dco_subtotal: 0 }] }));
                        }
                      } catch (err: any) {
                        const msg = err?.response?.data?.error || err?.message || 'Error de conexión';
                        setDetalleCompras(prev => ({ ...prev, [c.com_id]: [{ pro_nombre: `Error: ${msg}`, dco_cantidad: 0, dco_subtotal: 0 }] }));
                      }
                    }
                  }}
                  className={`${glassCard} p-4 flex items-center justify-between cursor-pointer hover:border-salon-gold/20 transition-all ${expanded ? 'rounded-b-none border-b-0' : ''}`}
                >
                  <div className="flex items-center gap-3">
                    <Truck size={18} className="text-salon-gold" />
                    <div>
                      <p className="text-sm font-medium">{c.prv_nombre || 'Proveedor'}</p>
                      <p className="text-xs text-white/30">{c.com_fecha?.slice(0, 10)} · {c.com_estado}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-salon-pink">${c.com_total}</span>
                    <ChevronDown size={16} className={`text-white/30 transition-transform ${expanded ? 'rotate-180' : ''}`} />
                  </div>
                </div>
                {expanded && (
                  <div className={`${glassCard} rounded-t-none border-t-0 p-4 pt-3 space-y-2`}>
                    {detalle.length === 0 ? (
                      <p className="text-xs text-white/30 text-center py-2">Sin productos en esta compra</p>
                    ) : detalle[0].dco_cantidad === 0 ? (
                      <p className="text-xs text-amber-300/70 text-center py-2">{detalle[0].pro_nombre}</p>
                    ) : (
                      <>
                        <div className="grid grid-cols-3 text-[10px] text-white/30 font-medium pb-1 border-b border-white/5">
                          <span>Producto</span>
                          <span className="text-center">Cantidad</span>
                          <span className="text-right">Subtotal</span>
                        </div>
                        {detalle.map((d: any, i: number) => (
                          <div key={i} className="grid grid-cols-3 text-xs text-white/70">
                            <span className="truncate pr-2">{d.pro_nombre}</span>
                            <span className="text-center">{d.dco_cantidad} uds</span>
                            <span className="text-right font-medium">${d.dco_subtotal}</span>
                          </div>
                        ))}
                      </>
                    )}
                  </div>
                )}
              </div>
            );
          })}
          <Pagination page={page} pages={pages} total={totalReg} limit={10} onChange={setPage} />
        </div>
      )}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm py-8" onClick={() => setShowForm(false)}>
          <div className="bg-[#120c1a] border border-white/10 rounded-2xl shadow-xl w-full max-w-lg mx-4 p-6 modal-enter max-h-[75vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4"><h2 className="text-lg font-bold">Nueva Compra</h2><button onClick={() => setShowForm(false)}><X size={18} className="text-white/30" /></button></div>
            <div className="space-y-4">
              <div><label className="block text-white/40 text-xs mb-1">Proveedor</label>
                <select value={form.proveedor_id} onChange={e => {
                  const val = e.target.value;
                  setForm(f => ({...f, proveedor_id: val}));
                  setErrors(prev => ({...prev, proveedor_id: undefined}));
                  setItems([{ producto_id: '', cantidad: '1', precio_unitario: '' }]);
                  if (val) cargarPreciosProveedor(Number(val));
                }}
                  className={`w-full px-4 py-2.5 rounded-xl bg-white/5 border text-white text-sm focus:outline-none ${errors.proveedor_id ? 'border-red-400/50 focus:border-red-400' : 'border-white/10 focus:border-salon-gold/50'}`}>
                  <option value="" className="bg-[#120c1a]">Seleccionar</option>
                  {proveedores.map(p => <option key={p.prv_id} value={p.prv_id} className="bg-[#120c1a]">{p.prv_nombre}</option>)}
                </select>
                {errors.proveedor_id && <p className="text-red-400 text-[10px] mt-1 flex items-center gap-1"><AlertCircle size={10} />{errors.proveedor_id}</p>}</div>
              <div><div className="flex items-center justify-between mb-2"><label className="block text-white/40 text-xs font-medium">Productos</label><button onClick={addItem} className="text-xs text-salon-pink hover:text-salon-lavender flex items-center gap-1"><Plus size={12} /> Agregar</button></div>
                <div className="space-y-2">
                  {items.map((item, idx) => (
                    <div key={idx} className="flex gap-2 items-start">
                      <select value={item.producto_id} onChange={e => updateItem(idx, 'producto_id', e.target.value)}
                        className="flex-1 px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:border-salon-gold/50">
                        <option value="" className="bg-[#120c1a]">Producto</option>
                        {productos.filter(p => productosDelProveedor.length === 0 || productosDelProveedor.includes(p.pro_id)).map(p => <option key={p.pro_id} value={p.pro_id} className="bg-[#120c1a]">{p.pro_nombre}</option>)}
                      </select>
                      <select value={item.cantidad} onChange={e => updateItem(idx, 'cantidad', e.target.value)} className="w-20 px-2 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-xs text-center focus:outline-none focus:border-salon-gold/50">
                        {CANTIDADES_OPCIONES.map(n => (
                          <option key={n} value={n} className="bg-[#120c1a]">{n.toLocaleString()}</option>
                        ))}
                      </select>
                      <input type="number" readOnly value={item.precio_unitario}
                        className="w-20 px-2 py-2 rounded-xl bg-white/[0.02] border border-white/5 text-white/40 text-xs text-center cursor-not-allowed" placeholder="$" title="Precio fijo del proveedor — no editable" />
                      {items.length > 1 && <button onClick={() => removeItem(idx)} className="mt-1 text-red-400 hover:text-red-500"><X size={14} /></button>}
                    </div>
                  ))}
                </div>
              </div>
              {errors.items && (
                <div className="flex items-start gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-300 text-xs">
                  <AlertCircle size={14} className="shrink-0 mt-0.5" />
                  <span>{errors.items}</span>
                </div>
              )}
              {errors.api && (
                <div className="flex items-start gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-300 text-xs">
                  <AlertCircle size={14} className="shrink-0 mt-0.5" />
                  <span>{errors.api}</span>
                  <button onClick={() => setErrors(prev => ({...prev, api: undefined}))} className="ml-auto text-red-300/50 hover:text-red-300"><X size={12} /></button>
                </div>
              )}
              <div className="flex justify-between items-center py-2 border-t border-white/5">
                <span className="text-sm text-white/40">Total estimado</span><span className="text-lg font-bold text-salon-pink">${total}</span>
              </div>
              <div className="flex gap-3 pt-2">
                <button onClick={() => setShowForm(false)} className="flex-1 px-4 py-2.5 rounded-xl border border-white/10 text-white/50 text-sm hover:bg-white/5">Cancelar</button>
                <button onClick={handleSave} className="flex-1 px-4 py-2.5 rounded-xl bg-gradient-to-r from-salon-gold to-salon-pink text-black text-sm font-semibold disabled:opacity-40">Registrar Compra</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
