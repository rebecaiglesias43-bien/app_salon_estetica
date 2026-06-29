import { useEffect, useState, Fragment } from 'react';
import api from '../../services/api';
import { ArrowLeftRight, ArrowUp, ArrowDown, X, Package, ChevronRight, ChevronDown, ShoppingCart, Users } from 'lucide-react';

import Pagination from '../../components/Pagination';

interface Movimiento {
  inm_id: number;
  inm_producto_id: number;
  inm_cita_id?: number | null;
  inm_tipo: string;
  inm_cantidad: number;
  inm_fecha: string;
  inm_motivo: string;
  pro_nombre?: string;
}

interface GrupoCita {
  inm_cita_id: number;
  cit_fecha: string;
  cli_nombre: string;
  cli_apellido: string;
  num_productos: number;
  total_cantidad: number;
  productos: {
    inm_id: number;
    inm_producto_id: number;
    inm_cantidad: number;
    pro_nombre: string;
  }[];
}

const glassCard = 'bg-gradient-to-br from-white/5 to-white/[0.02] rounded-2xl border border-white/10';

export default function MovimientosInventario() {
  const [grupos, setGrupos] = useState<GrupoCita[]>([]);
  const [individuales, setIndividuales] = useState<Movimiento[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandidos, setExpandidos] = useState<Set<number>>(new Set());

  // Filtros
  const [filterDesde, setFilterDesde] = useState('');
  const [filterHasta, setFilterHasta] = useState('');
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [total, setTotal] = useState(0);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Cargar grupos (citas) e individuales (entradas, manuales) en paralelo
      const params: any = { page, limit: 10 };
      const [resGrupos, resIndividual] = await Promise.all([
        api.get('/api/inventario-movimientos/agrupados', { params }),
        api.get('/api/inventario-movimientos/', { params }),
      ]);
      setGrupos(resGrupos.data.data || []);
      // Filtrar solo movimientos sin cita_id (entradas/manuales)
      const todos = (resIndividual.data.data || []) as Movimiento[];
      setIndividuales(todos.filter(m => !m.inm_cita_id));
      setPages(resIndividual.data.pages || 1);
      setTotal(resIndividual.data.total || 0);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  useEffect(() => { setPage(1); }, [filterDesde, filterHasta]);
  useEffect(() => { fetchData(); }, [page, filterDesde, filterHasta]);

  // Totales
  const totalCitas = grupos.length;
  const totalProductosConsumidos = grupos.reduce((s, g) => s + g.num_productos, 0);
  const totalEntradas = individuales.filter(m => m.inm_tipo === 'Entrada').reduce((s, m) => s + m.inm_cantidad, 0);
  const totalIndividuales = individuales.length;

  const toggleExpandido = (citaId: number) => {
    setExpandidos(prev => {
      const next = new Set(prev);
      if (next.has(citaId)) next.delete(citaId);
      else next.add(citaId);
      return next;
    });
  };

  const limpiarFiltros = () => {
    setFilterDesde('');
    setFilterHasta('');
  };

  const hayFiltros = filterDesde || filterHasta;

  return (
    <div>
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold">Movimientos de Inventario</h1>
          <p className="text-white/30 text-sm mt-1">Historial de entradas y salidas de productos</p>
        </div>

      </div>

      {/* ─── Filtros ─── */}
      <div className="flex items-center gap-3 mb-6 flex-wrap">
        <input type="date" value={filterDesde} onChange={e => setFilterDesde(e.target.value)}
          className="px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:border-salon-gold/50 [color-scheme:dark]" />
        <span className="text-white/20 text-xs">—</span>
        <input type="date" value={filterHasta} onChange={e => setFilterHasta(e.target.value)}
          className="px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:border-salon-gold/50 [color-scheme:dark]" />
        {hayFiltros && (
          <button onClick={limpiarFiltros} className="flex items-center gap-1 px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white/40 text-xs hover:text-white">
            <X size={12} /> Limpiar
          </button>
        )}
      </div>

      {/* ─── Totales ─── */}
      {(totalCitas > 0 || totalIndividuales > 0) && (
        <div className="flex items-center gap-3 mb-4 flex-wrap">
          {totalCitas > 0 && (
            <div className="flex items-center gap-1.5 text-xs text-red-400 bg-red-500/10 px-3 py-1.5 rounded-full">
              <Users size={12} /> {totalCitas} citas · {totalProductosConsumidos} productos
            </div>
          )}
          {totalEntradas > 0 && (
            <div className="flex items-center gap-1.5 text-xs text-green-400 bg-green-500/10 px-3 py-1.5 rounded-full">
              <ArrowUp size={12} /> {totalEntradas} entradas
            </div>
          )}
          {totalIndividuales > 0 && (
            <span className="text-[10px] text-white/20">{totalIndividuales} movimientos individuales</span>
          )}
        </div>
      )}

      {loading ? (
        <div className="p-12 text-center text-white/30">Cargando...</div>
      ) : grupos.length === 0 && individuales.length === 0 ? (
        <div className={`${glassCard} p-12 text-center`}>
          <ArrowLeftRight size={48} className="mx-auto text-white/10 mb-3" />
          <p className="text-white/30">Sin movimientos registrados</p>
          {hayFiltros && <p className="text-white/15 text-xs mt-1">Probá ajustando los filtros</p>}
        </div>
      ) : (
        <div className={`${glassCard} overflow-hidden`}>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/5 text-white/30 text-xs">
                  <th className="text-left px-4 py-3 font-medium w-8"></th>
                  <th className="text-left px-4 py-3 font-medium">Producto / Cliente</th>
                  <th className="text-left px-4 py-3 font-medium">Tipo</th>
                  <th className="text-right px-4 py-3 font-medium">Cantidad</th>
                  <th className="text-left px-4 py-3 font-medium">Detalle</th>
                  <th className="text-right px-4 py-3 font-medium">Fecha</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {/* ─── Grupos de citas ─── */}
                {grupos.map(g => {
                  const expandido = expandidos.has(g.inm_cita_id);
                  const nombreCliente = `${g.cli_nombre} ${g.cli_apellido || ''}`.trim();
                  return (
                    <Fragment key={`grupo-${g.inm_cita_id}`}>
                      {/* Fila resumen de la cita */}
                      <tr className="group hover:bg-white/[0.02] transition-colors cursor-pointer" onClick={() => toggleExpandido(g.inm_cita_id)}>
                        <td className="px-4 py-3">
                          <button className="text-white/30 hover:text-white transition-colors">
                            {expandido ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                          </button>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <Users size={14} className="text-red-400/60 shrink-0" />
                            <span className="font-semibold text-white/80">{nombreCliente}</span>
                            <span className="text-white/20 text-[10px]">Cita #{g.inm_cita_id}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-red-500/10 text-red-400">
                            <ArrowDown size={10} /> Salida
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-red-400/80 text-xs font-mono">
                            {g.num_productos} productos · {g.total_cantidad} uni.
                          </span>
                        </td>
                        <td className="px-4 py-3 text-white/40 text-xs">Consumo en cita</td>
                        <td className="px-4 py-3 text-right text-white/30 text-xs">{g.cit_fecha}</td>
                      </tr>
                      {/* Productos de la cita (expandidos) */}
                      {expandido && (
                        <tr key={`prods-${g.inm_cita_id}`}>
                          <td colSpan={6} className="px-0 py-0">
                            <table className="w-full bg-white/[0.01]">
                              <tbody>
                                {g.productos.map(p => (
                                  <tr key={`prod-${g.inm_cita_id}-${p.inm_id}`} className="border-t border-white/[0.03]">
                                    <td className="w-8"></td>
                                    <td className="px-4 py-2 pl-10 text-white/50 text-xs flex items-center gap-2">
                                      <ArrowDown size={10} className="text-red-400/40 shrink-0" />
                                      {p.pro_nombre}
                                    </td>
                                    <td className="px-4 py-2"></td>
                                    <td className="px-4 py-2 text-red-400/60 text-xs font-mono text-right">-{p.inm_cantidad}</td>
                                    <td className="px-4 py-2"></td>
                                    <td className="px-4 py-2"></td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </td>
                        </tr>
                      )}
                    </Fragment>
                  );
                })}
                {/* ─── Movimientos individuales (entradas, manuales) ─── */}
                {individuales.map(m => (
                  <tr key={m.inm_id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="px-4 py-3"></td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        {m.inm_tipo === 'Entrada' ? (
                          <ShoppingCart size={14} className="text-green-400/60 shrink-0" />
                        ) : (
                          <Package size={14} className="text-orange-400/60 shrink-0" />
                        )}
                        <span className="font-medium">{m.pro_nombre || `Producto #${m.inm_producto_id}`}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full ${
                        m.inm_tipo === 'Entrada' ? 'bg-green-500/10 text-green-400' : 'bg-orange-500/10 text-orange-400'
                      }`}>
                        {m.inm_tipo === 'Entrada' ? <ArrowUp size={10} /> : <ArrowLeftRight size={10} />}
                        {m.inm_tipo}
                      </span>
                    </td>
                    <td className={`px-4 py-3 text-right font-mono ${m.inm_tipo === 'Entrada' ? 'text-green-400' : 'text-orange-400'}`}>
                      {m.inm_tipo === 'Entrada' ? '+' : ''}{m.inm_cantidad}
                    </td>
                    <td className="px-4 py-3 text-white/40 text-xs">{m.inm_motivo || '—'}</td>
                    <td className="px-4 py-3 text-right text-white/30 text-xs">{m.inm_fecha}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="px-4">
            <Pagination page={page} pages={pages} total={total} limit={10} onChange={setPage} />
          </div>
        </div>
      )}

    </div>
  );
}
