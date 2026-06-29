import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { motion, AnimatePresence } from 'motion/react';
import { Clock, CheckCircle, Plus, CreditCard, ShoppingCart, DollarSign, BarChart3, AlertCircle } from 'lucide-react';

interface ActividadFactura { fac_id: number; fac_total: number; fac_estado: string; cli_nombre?: string; cli_apellido?: string; }
interface ActividadCompra { com_id: number; com_total: number; prv_nombre: string; }
interface ActividadData { facturas: ActividadFactura[]; compras: ActividadCompra[]; total_ingresos: number; total_egresos: number; }

interface Corte {
  cor_id: number;
  cor_fecha_apertura: string;
  cor_fecha_cierre?: string;
  cor_base_inicial: number;
  cor_ingresos?: number;
  cor_egresos?: number;
  cor_ganancia_neta?: number;
  cor_periodo: string;
  cor_estado: string;
}

export default function Caja() {
  const navigate = useNavigate();
  const [corteAbierto, setCorteAbierto] = useState<Corte | null>(null);
  const [cortes, setCortes] = useState<Corte[]>([]);
  const [loading, setLoading] = useState(true);
  const [actividad, setActividad] = useState<ActividadData | null>(null);
  const [montoApertura, setMontoApertura] = useState('50000');
  const [periodo, setPeriodo] = useState('diario');
  const [filterPeriodo, setFilterPeriodo] = useState('');
  const [montoError, setMontoError] = useState('');

  const glassCard = 'bg-gradient-to-br from-white/5 to-white/[0.02] rounded-2xl border border-white/10';

  const fetchData = async () => {
    setLoading(true);
    try {
      const params: any = { limit: 20 };
      if (filterPeriodo) params.periodo = filterPeriodo;
      const [res, resOpen] = await Promise.all([
        api.get('/api/cortes-caja/', { params }),
        api.get('/api/cortes-caja/abierto').catch(() => ({ data: null })),
      ]);
      setCortes(res.data.data || []);
      const openCorte = resOpen.data;
      setCorteAbierto(openCorte);
      // Si hay corte abierto, obtener actividad del período
      if (openCorte) {
        api.get(`/api/cortes-caja/${openCorte.cor_id}/actividad`)
          .then(aRes => setActividad(aRes.data))
          .catch(() => setActividad(null));
      } else {
        setActividad(null);
      }
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, [filterPeriodo]);

  const abrirCorte = async () => {
    setMontoError('');
    const monto = parseInt(montoApertura, 10);
    if (!montoApertura || isNaN(monto) || monto < 0) { setMontoError('Debe ingresar un monto base válido (mínimo $0)'); return; }
    if (monto > 300000) { setMontoError('El monto base máximo es $300,000'); return; }
    try {
      await api.post('/api/cortes-caja/abrir', { cor_base_inicial: monto, cor_periodo: periodo });
      fetchData();
    } catch (err: any) { setMontoError(err.response?.data?.error || 'Error al abrir el corte'); }
  };

  const cerrarCorte = async () => {
    if (!corteAbierto) return;
    try {
      await api.put(`/api/cortes-caja/${corteAbierto.cor_id}/cerrar`, {});
      setCorteAbierto(null);
      fetchData();
    } catch (err) { console.error(err); }
  };

  // ─── Variants compartidos ───
  const fadeUp = { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0, transition: { duration: 0.35, ease: 'easeOut' } } };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1, transition: { duration: 0.3 } }}>
      {/* ─── Header ─── */}
      <motion.div variants={fadeUp} initial="initial" animate="animate" className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold">Caja</h1>
          <p className="text-white/30 text-sm mt-1">Control de cortes de caja</p>
        </div>
        <select value={filterPeriodo} onChange={e => setFilterPeriodo(e.target.value)}
          className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:border-salon-gold/50">
          <option value="" className="bg-[#120c1a]">Todos</option>
          <option value="diario" className="bg-[#120c1a]">Diario</option>
          <option value="semanal" className="bg-[#120c1a]">Semanal</option>
          <option value="mensual" className="bg-[#120c1a]">Mensual</option>
        </select>
      </motion.div>

      {/* ─── Corte actual ─── */}
      <motion.div variants={fadeUp} className={`${glassCard} p-6 mb-6`}>
        <AnimatePresence mode="wait">
          {corteAbierto ? (
            <motion.div
              key="abierto"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95, y: -10 }}
              transition={{ duration: 0.35, ease: 'easeOut' }}
            >
              <motion.div
                initial={{ opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
                className="flex items-center gap-2 mb-4"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.25, delay: 0.15 }}
                  className="w-8 h-8 rounded-full bg-green-500/10 flex items-center justify-center"
                >
                  <CheckCircle size={16} className="text-green-400" />
                </motion.div>
                <span className="font-semibold">Corte abierto — <span className="text-salon-gold capitalize">{corteAbierto.cor_periodo}</span></span>
              </motion.div>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="grid grid-cols-2 gap-4 text-sm mb-4"
              >
                <div><span className="text-white/40">Base inicial:</span> <span className="font-medium">${corteAbierto.cor_base_inicial}</span></div>
                <div><span className="text-white/40">Apertura:</span> <span className="font-medium">{new Date(corteAbierto.cor_fecha_apertura).toLocaleString()}</span></div>
              </motion.div>

              {/* ─── Actividad del período ─── */}
              {actividad && (
                <motion.div
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.25 }}
                  className="mb-4 space-y-3"
                >
                  <div className="flex items-center gap-4 flex-wrap">
                    <motion.div
                      initial={{ opacity: 0, x: -12 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.3 }}
                      className="flex items-center gap-2 text-sm bg-green-500/10 rounded-xl px-4 py-2 border border-green-500/10"
                    >
                      <DollarSign size={14} className="text-green-400" />
                      <span className="text-white/60">Ingresos:</span>
                      <span className="font-bold text-green-400">${actividad.total_ingresos.toLocaleString()}</span>
                    </motion.div>
                    <motion.div
                      initial={{ opacity: 0, x: 12 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.35 }}
                      className="flex items-center gap-2 text-sm bg-red-500/10 rounded-xl px-4 py-2 border border-red-500/10"
                    >
                      <DollarSign size={14} className="text-red-400" />
                      <span className="text-white/60">Egresos:</span>
                      <span className="font-bold text-red-400">${actividad.total_egresos.toLocaleString()}</span>
                    </motion.div>
                  </div>

                  {/* Facturas del período */}
                  {actividad.facturas.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.4 }}
                    >
                      <p className="text-xs text-white/30 mb-2 flex items-center gap-1"><CreditCard size={12} /> Facturas ({actividad.facturas.length})</p>
                      <div className="space-y-1 max-h-32 overflow-y-auto">
                        {actividad.facturas.map((f, i) => (
                          <motion.div
                            key={f.fac_id}
                            initial={{ opacity: 0, x: -8 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.45 + i * 0.04 }}
                            className="flex justify-between text-xs bg-white/5 rounded-lg px-3 py-1.5"
                          >
                            <span className="text-white/50">{f.cli_nombre || f.cli_apellido || 'Venta directa'} · #{f.fac_id}</span>
                            <span className={f.fac_estado === 'pagado' ? 'text-green-400' : 'text-yellow-400'}>${f.fac_total}</span>
                          </motion.div>
                        ))}
                      </div>
                    </motion.div>
                  )}

                  {/* Compras del período */}
                  {actividad.compras.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.5 }}
                    >
                      <p className="text-xs text-white/30 mb-2 flex items-center gap-1"><ShoppingCart size={12} /> Compras ({actividad.compras.length})</p>
                      <div className="space-y-1 max-h-32 overflow-y-auto">
                        {actividad.compras.map((c, i) => (
                          <motion.div
                            key={c.com_id}
                            initial={{ opacity: 0, x: -8 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.55 + i * 0.04 }}
                            className="flex justify-between text-xs bg-white/5 rounded-lg px-3 py-1.5"
                          >
                            <span className="text-white/50">{c.prv_nombre} · #{c.com_id}</span>
                            <span className="text-red-400">${c.com_total}</span>
                          </motion.div>
                        ))}
                      </div>
                    </motion.div>
                  )}

                  {actividad.facturas.length === 0 && actividad.compras.length === 0 && (
                    <p className="text-xs text-white/20">Sin movimientos en este período aún</p>
                  )}
                </motion.div>
              )}

              <motion.button
                onClick={cerrarCorte}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                className="px-6 py-2.5 rounded-full bg-gradient-to-r from-salon-gold to-salon-pink text-black text-sm font-semibold hover:shadow-[0_0_25px_rgba(212,168,67,0.3)] transition-shadow"
              >
                Cerrar Corte (auto-cálculo)
              </motion.button>
              <p className="text-xs text-white/20 mt-2">Ingresos y egresos se calculan automáticamente de facturas y compras del período.</p>
            </motion.div>
          ) : (
            <motion.div
              key="cerrado"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ duration: 0.35, ease: 'easeOut' }}
            >
              <p className="text-white/40 text-sm mb-4">No hay corte abierto</p>
              <div className="flex items-center gap-3 flex-wrap">
                <motion.input
                  type="text" inputMode="decimal" maxLength={10} value={montoApertura}
                  whileFocus={{ scale: 1.02 }}
                  onChange={e => {
                    let val = e.target.value.replace(/[^0-9]/g, '');
                    if (/^0+$/.test(val)) val = '0';
                    const num = parseInt(val, 10);
                    if (val === '') {
                      setMontoApertura('');
                      setMontoError('');
                    } else if (num > 300000) {
                      setMontoApertura('300000');
                      setMontoError('El monto base máximo es $300,000. Se ha ajustado automáticamente.');
                    } else {
                      setMontoApertura(val);
                      setMontoError('');
                    }
                  }}
                  className={`px-4 py-2.5 rounded-xl bg-white/5 border text-white text-sm w-36 focus:outline-none [color-scheme:dark] ${montoError ? 'border-red-400/50' : 'border-white/10 focus:border-salon-gold/50'}`} placeholder="$ Base"
                />
                {montoError && (
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-red-400 text-[10px] mt-1 w-full flex items-center gap-1"
                  >
                    <AlertCircle size={10} />{montoError}
                  </motion.p>
                )}
                <select value={periodo} onChange={e => setPeriodo(e.target.value)}
                  className="px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-salon-gold/50">
                  <option value="diario" className="bg-[#120c1a]">Diario</option>
                  <option value="semanal" className="bg-[#120c1a]">Semanal</option>
                  <option value="mensual" className="bg-[#120c1a]">Mensual</option>
                </select>
                <motion.button
                  onClick={abrirCorte}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-salon-pink to-salon-lavender text-white text-sm font-semibold hover:shadow-[0_0_25px_rgba(186,113,162,0.3)] transition-shadow"
                >
                  <span>
                    <Plus size={14} />
                  </span>
                  Abrir corte
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* ─── Historial ─── */}
      <motion.div variants={fadeUp} className={`${glassCard} overflow-hidden`}>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.15 }}
          className="p-4 border-b border-white/5"
        >
          <h3 className="font-semibold">Historial de Cortes</h3>
        </motion.div>
        {loading ? (
          <div className="p-8 text-center text-white/30">Cargando...</div>
        ) : cortes.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="p-8 text-center text-white/30"
          >
            Sin cortes registrados
          </motion.div>
        ) : (
          <div className="divide-y divide-white/5">
            {cortes.map((corte, index) => (
              <motion.div
                key={corte.cor_id}
                initial={{ opacity: 0, x: 16 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.25, delay: index * 0.03 }}
                className="p-4 flex flex-col sm:flex-row sm:items-center justify-between hover:bg-white/[0.02] hover:translate-x-1 transition-all duration-200 gap-3 sm:gap-0 cursor-default"
              >
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ duration: 0.2, delay: index * 0.03 }}
                    className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${corte.cor_estado === 'Abierto' ? 'bg-green-500/10' : 'bg-white/5'}`}
                  >
                    {corte.cor_estado === 'Abierto' ? <Clock size={14} className="text-green-400" /> : <CheckCircle size={14} className="text-white/30" />}
                  </motion.div>
                  <div className="text-sm min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-medium capitalize truncate">{corte.cor_estado}</span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/5 text-white/30 uppercase shrink-0">{corte.cor_periodo}</span>
                    </div>
                    <p className="text-xs text-white/30 mt-0.5 truncate">
                      {new Date(corte.cor_fecha_apertura).toLocaleDateString()} · Base: ${corte.cor_base_inicial}
                      {corte.cor_ganancia_neta !== undefined && corte.cor_ganancia_neta !== null && (
                        <> · <span className={corte.cor_ganancia_neta >= 0 ? 'text-green-400' : 'text-red-400'}>${corte.cor_ganancia_neta}</span></>
                      )}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
                  {corte.cor_ingresos !== undefined && corte.cor_ingresos !== null && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: index * 0.04 + 0.1 }}
                      className="text-right text-[10px] sm:text-xs leading-tight"
                    >
                      <p className="text-white/30 whitespace-nowrap">Ing: ${corte.cor_ingresos}</p>
                      <p className="text-white/30 whitespace-nowrap">Egr: ${corte.cor_egresos}</p>
                    </motion.div>
                  )}
                  <motion.button
                    onClick={() => navigate(`/admin/corte-del-dia?corte_id=${corte.cor_id}`)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-lg text-[11px] sm:text-xs text-salon-gold border border-salon-gold/30 hover:bg-salon-gold/10 hover:border-salon-gold/60 transition-colors flex items-center gap-1 font-medium whitespace-nowrap"
                    title="Ver corte del día"
                  >
                    <BarChart3 size={13} className="shrink-0" />
                    <span className="hidden sm:inline">Reporte</span>
                  </motion.button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}