import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../../services/api';
import { Plus, Trash2, Truck, Package } from 'lucide-react';
import { validateMax } from '../../lib/validation';

import ConfirmModal from '../../components/ConfirmModal';
import { useToast } from '../../components/ToastContext';

interface Proveedor { prv_id: number; prv_nombre: string; }
interface Producto { pro_id: number; pro_nombre: string; }
interface Asociacion { ppr_id: number; ppr_proveedor_id: number; ppr_producto_id: number; ppr_precio: number; pro_nombre?: string; }

const glassCard = 'bg-gradient-to-br from-white/5 to-white/[0.02] rounded-2xl border border-white/10';

export default function ProveedorProductos() {
  const [searchParams] = useSearchParams();
  const [proveedores, setProveedores] = useState<Proveedor[]>([]);
  const [productos, setProductos] = useState<Producto[]>([]);
  const [selectedProv, setSelectedProv] = useState<number | null>(null);
  const [asociaciones, setAsociaciones] = useState<Asociacion[]>([]);
  const [loading, setLoading] = useState(false);
  const [showAdd, setShowAdd] = useState(false);
  const [newLink, setNewLink] = useState({ producto_id: '', precio: '' });
  const [linkError, setLinkError] = useState('');
  const [saving, setSaving] = useState(false);
  const { addToast } = useToast();
  const [confirmDelete, setConfirmDelete] = useState<number | null>(null);

  useEffect(() => {
    Promise.all([
      api.get('/api/proveedores/'),
      api.get('/api/productos/'),
    ]).then(([pRes, prRes]) => {
      const list = pRes.data.data || [];
      setProveedores(list);
      setProductos(prRes.data.data || []);
      // Auto-seleccionar proveedor si viene por query param
      const prvId = searchParams.get('prv_id');
      if (prvId) {
        const id = parseInt(prvId);
        if (list.some((p: any) => p.prv_id === id)) {
          setSelectedProv(id);
          setLoading(true);
          api.get(`/api/proveedores-productos/proveedor/${id}`)
            .then(res => setAsociaciones(res.data || []))
            .catch(() => setAsociaciones([]))
            .finally(() => setLoading(false));
        }
      }
    }).catch(console.error);
  }, []);

  const selectProveedor = async (id: number) => {
    setSelectedProv(id);
    setLoading(true);
    try {
      const res = await api.get(`/api/proveedores-productos/proveedor/${id}`);
      setAsociaciones(res.data || []);
    } catch {
      setAsociaciones([]);
      addToast('Error al cargar los productos del proveedor', 'error');
    }
    finally { setLoading(false); }
  };

  const handleAdd = async () => {
    setLinkError('');
    if (!newLink.producto_id) { setLinkError('Debe seleccionar un producto'); return; }
    if (!newLink.precio || parseFloat(newLink.precio) <= 0) { setLinkError('El precio debe ser mayor a 0'); return; }
    const maxErr = validateMax(newLink.precio, 'Precio', 10000000, 'moneda');
    if (maxErr) { setLinkError(maxErr); return; }
    if (!selectedProv || saving) return;
    setSaving(true);
    try {
      await api.post('/api/proveedores-productos/', {
        ppr_proveedor_id: selectedProv,
        ppr_producto_id: Number(newLink.producto_id),
        ppr_precio: parseFloat(newLink.precio),
      });
      setShowAdd(false);
      setNewLink({ producto_id: '', precio: '' });
      addToast('Producto vinculado al proveedor correctamente');
      selectProveedor(selectedProv);
    } catch (err: any) {
      const msg = err?.response?.data?.error || 'Error al vincular producto';
      addToast(msg, 'error');
    } finally { setSaving(false); }
  };

  const handleDelete = async (pprId: number) => {
    if (saving) return;
    setSaving(true);
    try {
      await api.delete(`/api/proveedores-productos/${pprId}`);
      addToast('Producto desvinculado del proveedor correctamente');
      selectProveedor(selectedProv!);
    } catch (err: any) {
      const msg = err?.response?.data?.error || 'Error al desvincular producto';
      addToast(msg, 'error');
    } finally { setSaving(false); }
  };

  const selectedName = proveedores.find(p => p.prv_id === selectedProv)?.prv_nombre;

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold">Productos por Proveedor</h1>
          <p className="text-white/30 text-sm mt-1">Define qué productos vende cada proveedor y a qué precio</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Lista de proveedores */}
        <div className={`${glassCard} p-4`}>
          <h3 className="text-sm font-semibold mb-3 flex items-center gap-2"><Truck size={14} className="text-salon-gold" /> Proveedores</h3>
          <div className="space-y-1 max-h-[60vh] overflow-y-auto">
            {proveedores.map(p => (
              <button
                key={p.prv_id}
                onClick={() => selectProveedor(p.prv_id)}
                className={`w-full text-left px-4 py-2.5 rounded-xl text-sm transition-all ${
                  selectedProv === p.prv_id
                    ? 'bg-gradient-to-r from-salon-gold/10 to-salon-pink/5 text-white border border-salon-gold/20'
                    : 'text-white/50 hover:text-white/80 hover:bg-white/5'
                }`}
              >
                {p.prv_nombre}
              </button>
            ))}
          </div>
        </div>

        {/* Productos del proveedor */}
        <div className={`${glassCard} p-4 lg:col-span-2`}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold flex items-center gap-2">
              <Package size={14} className="text-salon-pink" />
              {selectedProv ? `Productos de: ${selectedName}` : 'Selecciona un proveedor'}
            </h3>
            {selectedProv && (
              <button onClick={() => setShowAdd(true)} className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-salon-pink/10 text-salon-pink text-xs hover:bg-salon-pink/20 transition-all">
                <Plus size={12} /> Vincular producto
              </button>
            )}
          </div>

          {!selectedProv ? (
            <p className="text-white/20 text-sm text-center py-8">← Selecciona un proveedor</p>
          ) : loading ? (
            <p className="text-white/20 text-sm text-center py-8">Cargando...</p>
          ) : asociaciones.length === 0 ? (
            <p className="text-white/20 text-sm text-center py-8">Sin productos vinculados</p>
          ) : (
            <div className="space-y-2">
              {asociaciones.map(a => (
                <div key={a.ppr_id} className="flex items-center justify-between bg-white/5 rounded-xl px-4 py-3">
                  <div className="flex items-center gap-3">
                    <Package size={14} className="text-white/30" />
                    <div>
                      <p className="text-sm font-medium">{a.pro_nombre || `Producto #${a.ppr_producto_id}`}</p>
                      <p className="text-xs text-salon-gold">${a.ppr_precio}</p>
                    </div>
                  </div>
                  <button onClick={() => setConfirmDelete(a.ppr_id)} className="p-2 text-white/20 hover:text-red-400 transition-colors">
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Confirmación de desvinculación */}
          <ConfirmModal
            open={confirmDelete !== null}
            title="Desvincular producto"
            message="¿Estás seguro de desvincular este producto del proveedor?"
            confirmLabel="Desvincular"
            onConfirm={() => { if (confirmDelete !== null) handleDelete(confirmDelete); setConfirmDelete(null); }}
            onCancel={() => setConfirmDelete(null)}
            destructive
          />

          {showAdd && (
            <div className="mt-4 bg-white/5 rounded-xl p-4 border border-white/10">
              {linkError && (
                <p className="text-xs text-red-400/90 mb-2 bg-red-500/10 px-3 py-1.5 rounded-lg">{linkError}</p>
              )}
              <div className="flex gap-3 items-end">
                <div className="flex-1">
                  <label className="block text-white/40 text-xs mb-1">Producto</label>
                  <select value={newLink.producto_id} onChange={e => setNewLink(l => ({...l, producto_id: e.target.value}))}
                    className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:border-salon-gold/50">
                    <option value="" className="bg-[#120c1a]">Seleccionar</option>
                    {productos.filter(p => !asociaciones.find(a => a.ppr_producto_id === p.pro_id)).map(p => (
                      <option key={p.pro_id} value={p.pro_id} className="bg-[#120c1a]">{p.pro_nombre}</option>
                    ))}
                  </select>
                </div>
                <div className="w-24">
                  <label className="block text-white/40 text-xs mb-1">Precio</label>
                  <input type="number" inputMode="decimal" value={newLink.precio} onChange={e => setNewLink(l => ({...l, precio: e.target.value.replace(/[^0-9.]/g, '')}))}
                    className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-xs text-center focus:outline-none focus:border-salon-gold/50" min="0" />
                </div>
                <button onClick={handleAdd} disabled={saving} className="px-4 py-2 rounded-lg bg-salon-gold text-black text-xs font-semibold disabled:opacity-50 disabled:cursor-not-allowed">Vincular</button>
                <button onClick={() => setShowAdd(false)} className="px-3 py-2 rounded-lg text-white/30 text-xs hover:text-white/60">Cancelar</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
