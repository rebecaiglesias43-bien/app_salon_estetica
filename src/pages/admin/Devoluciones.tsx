import { useEffect, useState } from 'react';
import api from '../../services/api';
import { Undo2, X } from 'lucide-react';
import { useToast } from '../../components/ToastContext';
import Pagination from '../../components/Pagination';

interface DetalleItem {
  dco_id: number;
  dco_compra_id: number;
  dco_producto_id: number;
  dco_cantidad: number;
  dco_precio_unitario: number;
  dco_subtotal: number;
  pro_nombre: string;
  pro_stock: number;
}

interface Compra {
  com_id: number;
  com_proveedor_id: number;
  com_fecha: string;
  com_total: number;
  com_estado: string;
  prv_nombre: string;
  detalle?: DetalleItem[];
}

interface ReturnItem {
  dco_id: number;
  producto_id: number;
  producto_nombre: string;
  cantidad_original: number;
  ya_devuelto: number;
  disponible: number;
  cantidad_devolver: number;
  precio_unitario: number;
  pro_stock: number;
  selected: boolean;
}

const glassCard = 'bg-gradient-to-br from-white/5 to-white/[0.02] rounded-2xl border border-white/10';

const MOTIVOS = [
  'Producto defectuoso',
  'Producto dañado',
  'Producto equivocado',
  'Otro',
];

export default function Devoluciones() {
  const [compras, setCompras] = useState<Compra[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [selectedCompra, setSelectedCompra] = useState<Compra | null>(null);
  const [returnItems, setReturnItems] = useState<ReturnItem[]>([]);
  const [motivo, setMotivo] = useState(MOTIVOS[0]);
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [loadingCompra, setLoadingCompra] = useState(false);
  const { addToast } = useToast();

  const fetch = async () => {
    try {
      const res = await api.get('/api/compras/', { params: { page, limit: 10 } });
      setCompras(res.data.data || []);
      setPages(res.data.pages || 1);
      setTotal(res.data.total || 0);
    } catch (err) { console.error(err); addToast('Error al cargar compras. Verifica tu conexión.', 'error'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetch(); }, [page]);

  const openDevolucion = async (compra: Compra) => {
    setLoadingCompra(true);
    setShowModal(true);
    setSelectedCompra(null); // Limpiar mientras carga
    try {
      const [compraRes, prodRes, movRes] = await Promise.all([
        api.get(`/api/compras/${compra.com_id}`),
        api.get('/api/productos/', { params: { limit: 1000 } }),
        api.get('/api/inventario-movimientos/', { params: { tipo: 'Salida', limit: 1000 } }),
      ]);
      const compraCompleta: Compra = compraRes.data;
      const stockMap: Record<number, number> = {};
      (prodRes.data.data || []).forEach((p: any) => { stockMap[p.pro_id] = p.pro_stock ?? 0; });

      // Calcular cuántos ya se devolvieron SOLO para esta compra
      // El motivo ahora tiene formato: "Devolución|compra_id=X|motivo"
      const devueltosPrevios: Record<number, number> = {};
      (movRes.data.data || []).forEach((m: any) => {
        const motivoRaw: string = m.inm_motivo || '';
        // Solo contar movimientos de tipo devolución (ignorar "Compra", "Uso en servicio", etc.)
        if (!motivoRaw.startsWith('Devolución')) return;
        // Extraer compra_id del motivo (nuevo formato)
        const match = motivoRaw.match(/compra_id=(\d+)/);
        const movCompraId = match ? parseInt(match[1]) : null;
        // Si no tiene compra_id (devoluciones viejas), contar para todas las compras
        if (movCompraId === null || movCompraId === compra.com_id) {
          devueltosPrevios[m.inm_producto_id] = (devueltosPrevios[m.inm_producto_id] || 0) + m.inm_cantidad;
        }
      });

      setSelectedCompra(compraCompleta);
      if (compraCompleta.detalle) {
        setReturnItems(compraCompleta.detalle.map(d => {
          const yaDevuelto = devueltosPrevios[d.dco_producto_id] ?? 0;
          const disponible = Math.max(0, d.dco_cantidad - yaDevuelto);
          const stockActual = stockMap[d.dco_producto_id] ?? d.pro_stock ?? d.dco_cantidad;
          return {
            dco_id: d.dco_id,
            producto_id: d.dco_producto_id,
            producto_nombre: d.pro_nombre,
            cantidad_original: d.dco_cantidad,
            ya_devuelto: yaDevuelto,
            disponible: Math.min(disponible, stockActual),
            cantidad_devolver: Math.min(disponible, stockActual) || 0,
            precio_unitario: d.dco_precio_unitario,
            pro_stock: stockActual,
            selected: false,
          };
        }));
      }
      setMotivo(MOTIVOS[0]);
    } catch (err) {
      console.error(err);
      addToast('Error al cargar la compra', 'error');
      setShowModal(false);
    } finally {
      setLoadingCompra(false);
    }
  };

  const toggleItem = (dcoId: number) => {
    setReturnItems(prev => prev.map(i =>
      i.dco_id === dcoId ? { ...i, selected: !i.selected } : i
    ));
  };

  const updateCantidad = (dcoId: number, cantidad: number) => {
    setReturnItems(prev => prev.map(i => {
      if (i.dco_id !== dcoId) return i;
      if (i.disponible === 0) return { ...i, cantidad_devolver: 0, selected: false };
      return { ...i, cantidad_devolver: Math.max(1, Math.min(cantidad || 1, i.disponible)) };
    }));
  };

  const handleSubmit = async () => {
    const selected = returnItems.filter(i => i.selected);
    if (selected.length === 0) {
      addToast('Seleccione al menos un producto para devolver', 'error');
      return;
    }

    setSubmitting(true);
    try {
      const res = await api.post('/api/devoluciones/', {
        compra_id: selectedCompra?.com_id,
        items: selected.map(item => ({
          producto_id: item.producto_id,
          cantidad: item.cantidad_devolver,
          motivo: motivo
        }))
      });
      const nuevoEstado = res.data?.nuevo_estado || 'Procesada';
      const detalles = selected.map(s => `${s.cantidad_devolver}x ${s.producto_nombre}`).join(', ');
      addToast(`✅ Devueltos: ${detalles} — Compra: ${nuevoEstado}`, 'success');
      setShowModal(false);
      fetch();
    } catch (err: any) {
      const msg = err.response?.data?.error || 'Error al procesar devolución';
      addToast(msg, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold">Devoluciones</h1>
          <p className="text-white/30 text-sm mt-1">Registro de devoluciones de productos defectuosos o dañados</p>
        </div>
      </div>

      {loading ? (
        <div className="p-12 text-center text-white/30">Cargando...</div>
      ) : compras.length === 0 ? (
        <div className={`${glassCard} p-8 text-center`}>
          <Undo2 size={48} className="mx-auto text-white/10 mb-3" />
          <p className="text-white/30">No hay compras registradas</p>
        </div>
      ) : (
        <div className="space-y-3">
          <Pagination page={page} pages={pages} total={total} limit={10} onChange={setPage} />
          {compras.map(c => {
            const isDevuelta = c.com_estado === 'Devuelta';
            const isParcial = c.com_estado === 'Parcialmente devuelta';
            return (
            <div
              key={c.com_id}
              onClick={() => !isDevuelta && openDevolucion(c)}
              className={`${glassCard} p-4 flex items-center justify-between transition-all group ${
                isDevuelta ? 'opacity-40 cursor-default' : 'hover:border-red-400/20 hover:cursor-pointer'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`w-9 h-9 rounded-lg border flex items-center justify-center ${
                  isDevuelta ? 'bg-white/5 border-white/5' :
                  isParcial ? 'bg-amber-500/10 border-amber-500/20' :
                  'bg-red-500/10 border-red-500/20'
                }`}>
                  <Undo2 size={16} className={
                    isDevuelta ? 'text-white/20' : isParcial ? 'text-amber-400' : 'text-red-400'
                  } />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium">{c.prv_nombre || 'Proveedor'}</p>
                    {isDevuelta && <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-white/5 text-white/20 font-medium">Devuelta</span>}
                    {isParcial && <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-amber-500/10 text-amber-400/70 font-medium">Parcial</span>}
                  </div>
                  <p className="text-xs text-white/30">{c.com_fecha?.slice(0, 10)} · ${c.com_total}</p>
                </div>
              </div>
              {!isDevuelta && (
                <span className="text-xs text-red-400/60 group-hover:text-red-400 transition-colors flex items-center gap-1">
                  <Undo2 size={12} /> Devolver
                </span>
              )}
            </div>
          );})}
          <Pagination page={page} pages={pages} total={total} limit={10} onChange={setPage} />
        </div>
      )}

      {/* Modal de devolución */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm py-8" onClick={() => setShowModal(false)}>
          <div className="bg-[#120c1a] border border-white/10 rounded-2xl shadow-xl w-full max-w-2xl mx-4 p-6 max-h-[85vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg font-bold">Devolver productos</h2>
                {selectedCompra && (
                  <p className="text-xs text-white/30 mt-0.5">
                    Compra #{selectedCompra.com_id} · {selectedCompra.prv_nombre} · {selectedCompra.com_fecha?.slice(0, 10)}
                  </p>
                )}
              </div>
              <button onClick={() => setShowModal(false)}><X size={18} className="text-white/30" /></button>
            </div>

            {loadingCompra ? (
              <div className="p-8 text-center text-white/30">
                <div className="animate-spin rounded-full h-8 w-8 border-2 border-salon-gold/30 border-t-salon-gold mx-auto mb-3" />
                <p className="text-sm">Cargando detalle de la compra...</p>
              </div>
            ) : returnItems.length === 0 ? (
              <div className="p-6 text-center text-white/30 text-sm">Esta compra no tiene productos asociados</div>
            ) : (
              <div className="space-y-2 mb-4">
                {returnItems.map(item => {
                  const maxDevolver = item.disponible;
                  const sinStock = maxDevolver <= 0;
                  return (
                  <div key={item.dco_id} className={`rounded-xl border p-3 transition-all ${item.selected ? 'bg-red-500/5 border-red-500/30' : sinStock ? 'bg-white/[0.02] border-white/5 opacity-50' : 'bg-white/5 border-white/10'}`}>
                    <div className="flex items-start gap-3">
                      {sinStock ? (
                        <div className="mt-1 w-4 h-4 shrink-0" />
                      ) : (
                        <input
                          type="checkbox"
                          checked={item.selected}
                          onChange={() => toggleItem(item.dco_id)}
                          className="mt-1 accent-salon-pink shrink-0"
                        />
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <p className="text-sm font-medium truncate">{item.producto_nombre}</p>
                          <span className="text-xs font-mono text-salon-gold shrink-0">${item.precio_unitario}</span>
                        </div>
                        <p className="text-[10px] text-white/30 mt-0.5">
                          Comprados: {item.cantidad_original} · Ya devueltos: {item.ya_devuelto} · <span className="text-salon-gold">Disponible: {item.disponible}</span>
                          {sinStock && <span className="text-red-400 ml-1">(agotado)</span>}
                        </p>
                      </div>
                      {item.selected && !sinStock && (
                        <div className="flex items-center gap-1.5 shrink-0">
                          <label className="text-[10px] text-white/30">Cant:</label>
                          <select
                            value={item.cantidad_devolver}
                            onChange={e => updateCantidad(item.dco_id, parseInt(e.target.value))}
                            className="w-16 px-1 py-1.5 rounded-lg bg-white/5 border border-white/10 text-white text-xs text-center focus:outline-none focus:border-salon-pink/50"
                          >
                            {Array.from({ length: maxDevolver }, (_, i) => i + 1).map(n => (
                              <option key={n} value={n} className="bg-[#120c1a]">{n}</option>
                            ))}
                          </select>
                        </div>
                      )}
                    </div>
                  </div>
                  );
                })}
              </div>
            )}

            {!loadingCompra && selectedCompra && (<>
            <div className="mb-4">
              <label className="block text-white/40 text-xs mb-1">Motivo de la devolución</label>
              <select value={motivo} onChange={e => setMotivo(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-salon-gold/50">
                {MOTIVOS.map(m => <option key={m} value={m} className="bg-[#120c1a]">{m}</option>)}
              </select>
            </div>

            {returnItems.some(i => i.selected) && (
              <div className="text-right text-xs text-white/40 mb-4 bg-white/5 rounded-xl px-4 py-2">
                Productos: {returnItems.filter(i => i.selected).length} ·
                Unidades: {returnItems.filter(i => i.selected).reduce((s, i) => s + i.cantidad_devolver, 0)}
              </div>
            )}

            <div className="flex gap-3 pt-2 border-t border-white/5">
              <button onClick={() => setShowModal(false)}
                className="flex-1 px-4 py-2.5 rounded-xl border border-white/10 text-white/50 text-sm hover:bg-white/5">Cancelar</button>
              <button onClick={handleSubmit}
                disabled={submitting || returnItems.filter(i => i.selected).length === 0}
                className="flex-1 px-4 py-2.5 rounded-xl bg-gradient-to-r from-red-500 to-orange-500 text-white text-sm font-semibold disabled:opacity-40 hover:shadow-[0_0_20px_rgba(239,68,68,0.3)] transition-all">
                {submitting ? 'Procesando...' : 'Registrar Devolución'}
              </button>
            </div>
            </>)}
          </div>
        </div>
      )}
    </div>
  );
}
