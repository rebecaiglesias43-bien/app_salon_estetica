import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../../services/api';
import { Plus, Trash2, Package, Scissors, AlertCircle } from 'lucide-react';
import { validateMax } from '../../lib/validation';
import ConfirmModal from '../../components/ConfirmModal';
import { useToast } from '../../components/ToastContext';

interface Servicio { ser_id: number; ser_nombre: string; ser_precio: number; }
interface Producto { pro_id: number; pro_nombre: string; pro_stock: number; }
interface Asociacion { sep_id: number; sep_servicio_id: number; sep_producto_id: number; sep_cantidad: number; pro_nombre?: string; }

const glassCard = 'bg-gradient-to-br from-white/5 to-white/[0.02] rounded-2xl border border-white/10';

export default function ServicioProductos() {
  const [searchParams] = useSearchParams();
  const [servicios, setServicios] = useState<Servicio[]>([]);
  const [productos, setProductos] = useState<Producto[]>([]);
  const [selectedServicio, setSelectedServicio] = useState<number | null>(null);
  const [asociaciones, setAsociaciones] = useState<Asociacion[]>([]);
  const [loading, setLoading] = useState(false);

  // Form para nueva asociación
  const [showAdd, setShowAdd] = useState(false);
  const [newLink, setNewLink] = useState({ producto_id: '', cantidad: '1' });
  const [linkError, setLinkError] = useState('');
  const [saving, setSaving] = useState(false);
  const { addToast } = useToast();
  const [confirmDelete, setConfirmDelete] = useState<number | null>(null);

  useEffect(() => {
    Promise.all([
      api.get('/api/servicios/'),
      api.get('/api/productos/'),
    ]).then(([sRes, pRes]) => {
      const list = sRes.data.data || [];
      setServicios(list);
      setProductos(pRes.data.data || []);
      // Auto-seleccionar servicio si viene por query param
      const servicioId = searchParams.get('servicio_id');
      if (servicioId) {
        const id = parseInt(servicioId);
        if (list.some((s: any) => s.ser_id === id)) {
          setSelectedServicio(id);
          setLoading(true);
          api.get(`/api/servicios-productos/servicio/${id}`)
            .then(res => setAsociaciones(res.data || []))
            .catch(() => setAsociaciones([]))
            .finally(() => setLoading(false));
        }
      }
    }).catch(console.error);
  }, []);

  const selectServicio = async (id: number) => {
    setSelectedServicio(id);
    setLoading(true);
    try {
      const res = await api.get(`/api/servicios-productos/servicio/${id}`);
      setAsociaciones(res.data || []);
    } catch {
      setAsociaciones([]);
      addToast('Error al cargar los insumos del servicio', 'error');
    }
    finally { setLoading(false); }
  };

  const handleAdd = async () => {
    setLinkError('');
    if (!newLink.producto_id) { setLinkError('Debe seleccionar un producto'); return; }
    if (!newLink.cantidad || parseInt(newLink.cantidad) <= 0) { setLinkError('La cantidad debe ser mayor a 0'); return; }
    const cantMaxErr = validateMax(newLink.cantidad, 'Cantidad', 999);
    if (cantMaxErr) { setLinkError(cantMaxErr); return; }
    if (!selectedServicio || saving) return;
    setSaving(true);
    try {
      await api.post('/api/servicios-productos/', {
        sep_servicio_id: selectedServicio,
        sep_producto_id: Number(newLink.producto_id),
        sep_cantidad: parseInt(newLink.cantidad) || 1,
      });
      setShowAdd(false);
      setNewLink({ producto_id: '', cantidad: '1' });
      addToast('Insumo vinculado al servicio correctamente');
      selectServicio(selectedServicio);
    } catch (err: any) {
      const msg = err?.response?.data?.error || 'Error al vincular insumo';
      addToast(msg, 'error');
    } finally { setSaving(false); }
  };

  const handleDelete = async (sepId: number) => {
    if (saving) return;
    setSaving(true);
    try {
      await api.delete(`/api/servicios-productos/${sepId}`);
      addToast('Insumo desvinculado del servicio correctamente');
      selectServicio(selectedServicio!);
    } catch (err: any) {
      const msg = err?.response?.data?.error || 'Error al desvincular insumo';
      addToast(msg, 'error');
    } finally { setSaving(false); }
  };

  const selectedName = servicios.find(s => s.ser_id === selectedServicio)?.ser_nombre;

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold">Insumos por Servicio</h1>
          <p className="text-white/30 text-sm mt-1">Define qué productos consume cada servicio (para descuento automático)</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Lista de servicios */}
        <div className={`${glassCard} p-4`}>
          <h3 className="text-sm font-semibold mb-3 flex items-center gap-2"><Scissors size={14} className="text-salon-gold" /> Servicios</h3>
          <div className="space-y-1 max-h-[60vh] overflow-y-auto">
            {servicios.map(s => (
              <button
                key={s.ser_id}
                onClick={() => selectServicio(s.ser_id)}
                className={`w-full text-left px-4 py-2.5 rounded-xl text-sm transition-all ${
                  selectedServicio === s.ser_id
                    ? 'bg-gradient-to-r from-salon-gold/10 to-salon-pink/5 text-white border border-salon-gold/20'
                    : 'text-white/50 hover:text-white/80 hover:bg-white/5'
                }`}
              >
                {s.ser_nombre}
                <span className="text-xs text-white/20 ml-2">${s.ser_precio}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Productos asociados */}
        <div className={`${glassCard} p-4 lg:col-span-2`}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold flex items-center gap-2">
              <Package size={14} className="text-salon-pink" />
              {selectedServicio ? `Insumos para: ${selectedName}` : 'Selecciona un servicio'}
            </h3>
            {selectedServicio && (
              <button onClick={() => setShowAdd(true)} className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-salon-pink/10 text-salon-pink text-xs hover:bg-salon-pink/20 transition-all">
                <Plus size={12} /> Vincular insumo
              </button>
            )}
          </div>

          {!selectedServicio ? (
            <p className="text-white/20 text-sm text-center py-8">← Selecciona un servicio para ver sus productos</p>
          ) : loading ? (
            <p className="text-white/20 text-sm text-center py-8">Cargando...</p>
          ) : asociaciones.length === 0 ? (
            <p className="text-white/20 text-sm text-center py-8">Sin productos vinculados</p>
          ) : (
            <div className="space-y-2">
              {asociaciones.map(a => (
                <div key={a.sep_id} className="flex items-center justify-between bg-white/5 rounded-xl px-4 py-3">
                  <div className="flex items-center gap-3">
                    <Package size={14} className="text-white/30" />
                    <div>
                      <p className="text-sm font-medium">{a.pro_nombre || `Producto #${a.sep_producto_id}`}</p>
                      <p className="text-xs text-white/30">Cantidad usada: {a.sep_cantidad} uds</p>
                    </div>
                  </div>
                  <button onClick={() => setConfirmDelete(a.sep_id)} className="p-2 text-white/20 hover:text-red-400 transition-colors">
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Add form inline */}
          {/* Confirmación de desvinculación */}
          <ConfirmModal
            open={confirmDelete !== null}
            title="Desvincular insumo"
            message="¿Estás seguro de desvincular este producto del servicio?"
            confirmLabel="Desvincular"
            onConfirm={() => { if (confirmDelete !== null) handleDelete(confirmDelete); setConfirmDelete(null); }}
            onCancel={() => setConfirmDelete(null)}
            destructive
          />

          {showAdd && (
            <div className="mt-4 bg-white/5 rounded-xl p-4 border border-white/10">
              {linkError && <div className="text-xs text-red-400 bg-red-500/10 rounded-lg px-3 py-2 mb-3 border border-red-500/10 flex items-center gap-1"><AlertCircle size={10} />{linkError}</div>}
              <div className="flex gap-3 items-end">
                <div className="flex-1">
                  <label className="block text-white/40 text-xs mb-1">Producto</label>
                  <select value={newLink.producto_id} onChange={e => setNewLink(l => ({...l, producto_id: e.target.value}))}
                    className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:border-salon-gold/50">
                    <option value="" className="bg-[#120c1a]">Seleccionar</option>
                    {productos.filter(p => !asociaciones.find(a => a.sep_producto_id === p.pro_id)).map(p => (
                      <option key={p.pro_id} value={p.pro_id} className="bg-[#120c1a]">{p.pro_nombre} (stock: {p.pro_stock})</option>
                    ))}
                  </select>
                </div>
                <div className="w-20">
                  <label className="block text-white/40 text-xs mb-1">Cant.</label>
                  <input type="number" value={newLink.cantidad} onChange={e => setNewLink(l => ({...l, cantidad: e.target.value.replace(/\D/g, '')}))}
                    className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-xs text-center focus:outline-none focus:border-salon-gold/50" min="1" />
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
