import { useEffect, useState, useCallback } from 'react';
import { useSearchParams, useNavigate, useLocation } from 'react-router-dom';
import api from '../../services/api';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { motion } from 'motion/react';
import { TrendingUp, Clock, ShoppingCart, Users, CheckCircle, DollarSign, CalendarDays, ArrowRight, AlertCircle } from 'lucide-react';
import { formatCurrency } from '../../lib/formatters';

interface CorteInfo {
  cor_id: number;
  fecha_apertura: string;
  fecha_cierre?: string | null;
  base_inicial: number;
  ingresos: number;
  egresos: number;
  ganancia_neta: number;
  periodo: string;
  estado: string;
}

interface CorteHistorico {
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

interface DashboardData {
  ingresos_hoy: number;
  total_citas_hoy: number;
  clientes_nuevos: number;
  servicios_activos: number;
  ingresos_semanales: { name: string; fecha: string; ingresos: number }[];
  actividad: { tipo: string; texto: string; monto: number; fecha: string }[];
  corte_activo?: CorteInfo | null;
}

interface ProximasCitasData {
  fecha: string;
  total: number;
  citas: {
    cit_id: number;
    hora: string;
    fecha: string;
    estado: string;
    cliente: string;
    servicios: string;
    precio_total: number;
  }[];
}

export default function AdminDashboard() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [dateStr, setDateStr] = useState('');
  const [cortesHistorial, setCortesHistorial] = useState<CorteHistorico[]>([]);
  const [proximasCitas, setProximasCitas] = useState<ProximasCitasData | null>(null);
  const [loadingCitas, setLoadingCitas] = useState(true);
  const [errorCitas, setErrorCitas] = useState<string | null>(null);
  const corteId = searchParams.get('corte_id');

  useEffect(() => {
    const d = new Date();
    const dias = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
    const meses = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
    setDateStr(`${dias[d.getDay()]}, ${d.getDate()} de ${meses[d.getMonth()]}`);
    // Cargar historial de cortes para el selector
    api.get('/api/cortes-caja/', { params: { limit: 100 } })
      .then(r => setCortesHistorial(r.data.data || []))
      .catch(() => {});
  }, []);

  const location = useLocation();

  const fetchDashboard = useCallback((silent = false) => {
    if (!silent) setLoading(true);
    const params: any = {};
    if (corteId) params.corte_id = parseInt(corteId);
    api.get('/api/finanzas/dashboard', { params })
      .then(res => setData(res.data))
      .catch(console.error)
      .finally(() => { if (!silent) setLoading(false); });
  }, [corteId]);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard, location.pathname]);

  // Auto-refresh cada 30 segundos (silencioso — sin skeleton)
  useEffect(() => {
    const interval = setInterval(() => fetchDashboard(true), 30000);
    return () => clearInterval(interval);
  }, [fetchDashboard]);

  // ─── Cargar próximas citas (endpoint dedicado) ───
  const fetchProximasCitas = useCallback((silent = false) => {
    if (!silent) setLoadingCitas(true);
    setErrorCitas(null);
    api.get('/api/citas/proximas')
      .then(res => {
        setProximasCitas(res.data);
        setErrorCitas(null);
      })
      .catch(err => {
        const msg = err.response?.data?.error || err.message || 'Error de conexión';
        setErrorCitas(msg);
        console.error('Error al cargar próximas citas:', err);
      })
      .finally(() => { if (!silent) setLoadingCitas(false); });
  }, []);

  useEffect(() => {
    fetchProximasCitas();
  }, [fetchProximasCitas]);

  // Auto-refresh de próximas citas cada 30 segundos (silencioso — sin skeleton)
  useEffect(() => {
    const interval = setInterval(() => fetchProximasCitas(true), 30000);
    return () => clearInterval(interval);
  }, [fetchProximasCitas]);

  const weeklyTotal = data?.ingresos_semanales.reduce((s, d) => s + d.ingresos, 0) || 0;

  // ─── Variants ───
  const fadeUp = { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0, transition: { duration: 0.3, ease: 'easeOut' } } };
  const scaleIn = { initial: { opacity: 0, scale: 0.95 }, animate: { opacity: 1, scale: 1, transition: { duration: 0.3, ease: 'easeOut' } } };

  if (loading) return (
    <div className="space-y-6 animate-pulse">
      {/* Header skeleton */}
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <div className="h-3 w-32 bg-white/10 rounded-full" />
          <div className="h-8 w-72 bg-white/10 rounded-lg" />
        </div>
        <div className="h-8 w-32 bg-white/10 rounded-full" />
      </div>
      {/* Selector skeleton */}
      <div className="h-10 w-64 bg-white/10 rounded-xl" />
      {/* Stats skeletons */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[1,2,3,4].map(i => <div key={i} className="h-28 bg-white/[0.03] rounded-2xl border border-white/5" />)}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="h-56 bg-white/[0.03] rounded-2xl border border-white/5" />
        <div className="lg:col-span-2 h-56 bg-white/[0.03] rounded-2xl border border-white/5" />
      </div>
      {/* Chart skeleton */}
      <div className="h-64 bg-white/[0.03] rounded-2xl border border-white/5" />
    </div>
  );
  if (!data) return (
    <div className="p-12 text-center">
      <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-4">
        <DollarSign size={24} className="text-white/20" />
      </div>
      <p className="text-white/30 text-sm">No se pudieron cargar los datos</p>
      <button onClick={() => window.location.reload()} className="mt-4 px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white/50 text-xs hover:bg-white/10 transition-all">
        Reintentar
      </button>
    </div>
  );

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1, transition: { duration: 0.25 } }} className="space-y-6">

      {/* ─── Header ─── */}
      <motion.div variants={fadeUp} className="flex items-start justify-between">
        <div>
          <p className="text-white/30 text-sm font-medium">{dateStr}</p>
          <h1 className="text-3xl lg:text-4xl font-bold tracking-tight mt-0.5">
            Buen día, <span className="bg-gradient-to-r from-salon-gold to-salon-pink bg-clip-text text-transparent">{localStorage.getItem('username') || 'admin'}</span>
          </h1>
        </div>
        <div className="hidden lg:flex items-center gap-2 text-xs text-green-400 bg-green-500/10 px-4 py-2 rounded-full border border-green-500/10">
          <TrendingUp size={14} />
          <span>Sistema activo</span>
        </div>
      </motion.div>

      {/* ─── Selector de Corte ─── */}
      <motion.div variants={fadeUp} initial="initial" animate="animate" className="flex items-center gap-3">
        <div className="flex items-center gap-2 text-xs text-white/40">
          <CalendarDays size={14} />
          <span>Período:</span>
        </div>
        <select
          value={corteId || ''}
          onChange={e => {
            const val = e.target.value;
            if (val) navigate(`/admin?corte_id=${val}`);
            else navigate('/admin');
          }}
          className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:border-salon-gold/50 min-w-[220px]"
        >
          <option value="" className="bg-[#120c1a]">📊 Hoy (vista general)</option>
          {cortesHistorial
            .filter(c => c.cor_estado === 'Cerrado')
            .map(c => (
              <option key={c.cor_id} value={c.cor_id} className="bg-[#120c1a]">
                {new Date(c.cor_fecha_apertura).toLocaleDateString()} — {c.cor_periodo} · ${(c.cor_ganancia_neta ?? 0).toLocaleString()}
              </option>
            ))}
        </select>
        {data.corte_activo && (
          <span className={`text-[10px] px-3 py-1.5 rounded-full flex items-center gap-1 ${data.corte_activo.estado === 'Abierto' ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-white/5 text-white/40 border border-white/10'}`}>
            <CheckCircle size={10} />
            {data.corte_activo.estado === 'Abierto' ? 'Corte activo' : 'Corte histórico'}
            {data.corte_activo.estado !== 'Abierto' && data.corte_activo.ganancia_neta !== undefined && (
              <> · Neto: ${data.corte_activo.ganancia_neta.toLocaleString()}</>
            )}
          </span>
        )}
      </motion.div>

      {/* ─── Fila 1: Stats ─── */}
      <motion.div variants={fadeUp} initial="initial" animate="animate" className="grid grid-cols-2 lg:grid-cols-4 gap-4 min-w-0">
        <div className="relative bg-gradient-to-br from-white/5 to-white/[0.02] rounded-2xl border border-white/10 p-4 lg:p-5 overflow-hidden min-w-0">
          <div className="absolute -top-10 -right-10 w-24 h-24 bg-salon-gold/5 rounded-full blur-2xl" />
          <p className="text-white/40 text-[10px] font-medium uppercase tracking-widest">{corteId ? 'Ingresos período' : 'Ingresos hoy'}</p>
          <p className="text-3xl lg:text-4xl font-bold tracking-tight mt-1">{formatCurrency(data.ingresos_hoy).replace('$', '$')}</p>
          <div className="mt-3 flex items-center gap-1 text-[10px] text-green-400/70">
            <TrendingUp size={10} />
            <span>{data.ingresos_semanales.filter(d => d.ingresos > 0).length} días con ingresos</span>
          </div>
        </div>

        <div className="bg-gradient-to-br from-white/5 to-white/[0.02] rounded-2xl border border-white/10 p-4 lg:p-5 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <Clock size={14} className="text-salon-gold shrink-0" />
            <p className="text-white/40 text-[10px] font-medium uppercase tracking-widest truncate">{corteId ? 'Citas período' : 'Citas hoy'}</p>
          </div>
          <p className="text-3xl lg:text-4xl font-bold tracking-tight">{data.total_citas_hoy}</p>
          <p className="text-[10px] text-white/20 mt-1 truncate">
            {corteId ? 'en el período' : proximasCitas ? `${proximasCitas.total} en próximos 7 días` : 'agendadas'}
          </p>
        </div>

        <div className="bg-gradient-to-br from-white/5 to-white/[0.02] rounded-2xl border border-white/10 p-4 lg:p-5 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <Users size={14} className="text-blue-400 shrink-0" />
            <p className="text-white/40 text-[10px] font-medium uppercase tracking-widest truncate">Clientes nuevos</p>
          </div>
          <p className="text-3xl lg:text-4xl font-bold tracking-tight">+{data.clientes_nuevos}</p>
          <p className="text-[10px] text-white/20 mt-1 truncate">{corteId ? 'en el período' : 'este mes'}</p>
        </div>

        <div className="bg-gradient-to-br from-white/5 to-white/[0.02] rounded-2xl border border-white/10 p-4 lg:p-5 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <ShoppingCart size={14} className="text-green-400 shrink-0" />
            <p className="text-white/40 text-[10px] font-medium uppercase tracking-widest truncate">Servicios activos</p>
          </div>
          <p className="text-3xl lg:text-4xl font-bold tracking-tight">{data.servicios_activos}</p>
          <p className="text-[10px] text-white/20 mt-1 truncate">en catálogo</p>
        </div>
      </motion.div>

      {/* ─── Fila 2: Próximas citas + Actividad ─── */}
      <motion.div variants={fadeUp} initial="initial" animate="animate" className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-5 min-w-0">

        {/* Próximas citas — columna izquierda */}
        <div className="bg-gradient-to-br from-white/5 to-white/[0.02] rounded-2xl border border-white/10 p-5 flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold flex items-center gap-2">
              <Clock size={14} className="text-salon-gold" /> Próximas citas
            </h2>
            <span className="text-[10px] text-white/30">Próximos 7 días</span>
          </div>

          {loadingCitas ? (
            /* Skeleton loading */
            <div className="space-y-3 flex-1">
              {[1, 2, 3].map(i => (
                <div key={i} className="flex items-start gap-3 py-3 border-b border-white/5 last:border-0 animate-pulse">
                  <div className="w-10 h-3 bg-white/10 rounded" />
                  <div className="flex-1 space-y-1.5">
                    <div className="h-3.5 w-24 bg-white/10 rounded" />
                    <div className="h-3 w-32 bg-white/5 rounded" />
                  </div>
                  <div className="h-3 w-12 bg-white/10 rounded" />
                </div>
              ))}
            </div>
          ) : errorCitas ? (
            /* Estado de error */
            <div className="flex-1 flex flex-col items-center justify-center py-8">
              <div className="w-10 h-10 rounded-full bg-red-500/10 flex items-center justify-center mb-3">
                <AlertCircle size={18} className="text-red-400" />
              </div>
              <p className="text-xs text-red-400/80">Error al cargar</p>
              <p className="text-[10px] text-white/20 mt-1 text-center px-4">{errorCitas}</p>
              <button
                onClick={() => fetchProximasCitas()}
                className="mt-3 px-4 py-1.5 rounded-xl bg-white/5 border border-white/10 text-white/50 text-[10px] hover:bg-white/10 hover:text-white transition-all"
              >
                Reintentar
              </button>
            </div>
          ) : !proximasCitas || proximasCitas.citas.length === 0 ? (
            /* Estado vacío */
            <div className="flex-1 flex flex-col items-center justify-center py-8">
              <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center mb-3">
                <CalendarDays size={18} className="text-white/15" />
              </div>
              <p className="text-xs text-white/20">Sin citas próximas</p>
              <p className="text-[10px] text-white/10 mt-1">Las citas agendadas aparecerán aquí</p>
            </div>
          ) : (
            /* Lista de citas — máximo 5 */
            <div className="space-y-0 flex-1 overflow-y-auto">
              {proximasCitas.citas.slice(0, 5).map((c) => (
                <div key={c.cit_id} className="flex items-start gap-3 py-3 border-b border-white/5 last:border-0">
                  <div className="flex flex-col items-center text-xs text-salon-gold font-mono font-medium w-16 pt-0.5 flex-shrink-0">
                    <span>{c.hora || '--:--'}</span>
                    {c.fecha && <span className="text-[9px] text-white/30 font-sans">{new Date(c.fecha + 'T00:00:00').toLocaleDateString('es-MX', { weekday: 'short', day: 'numeric', month: 'short' })}</span>}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{c.cliente || 'Sin nombre'}</p>
                    <p className="text-xs text-white/30 truncate">{c.servicios || 'Sin servicios'}</p>
                  </div>
                  <div className="text-xs text-white/40 font-mono flex-shrink-0">
                    {formatCurrency(c.precio_total)}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Botón Ver más + Contador */}
          {proximasCitas && proximasCitas.citas.length > 0 && (
            <>
              {proximasCitas.citas.length > 5 && (
                <button
                  onClick={() => navigate('/admin/citas')}
                  className="mt-3 w-full flex items-center justify-center gap-2 py-2 rounded-xl bg-white/5 border border-white/10 text-white/50 text-xs hover:bg-white/10 hover:text-white transition-all"
                >
                  Ver más <ArrowRight size={12} />
                </button>
              )}
              <div className="mt-3 pt-3 border-t border-white/5 flex items-center justify-between">
                <span className="text-[10px] text-white/20">
                  {proximasCitas.total} cita{proximasCitas.total !== 1 ? 's' : ''} próximas
                </span>
                <span className="text-[10px] text-white/15">{proximasCitas.fecha} — próximos 7 días</span>
              </div>
            </>
          )}
        </div>

        {/* Actividad Reciente — ocupa 2 columnas */}
        <div className="lg:col-span-2 bg-gradient-to-br from-white/5 to-white/[0.02] rounded-2xl border border-white/10 p-4 lg:p-5 min-w-0">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold">Actividad reciente</h2>
            <span className="text-[10px] text-white/30">{data.actividad.length} eventos</span>
          </div>
          {data.actividad.length === 0 ? (
            <p className="text-xs text-white/20 py-3">Sin actividad reciente</p>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-2 lg:gap-3 min-w-0">
              {data.actividad.slice(0, 8).map((a, i) => (
                <div key={i} className="flex items-center gap-2 lg:gap-3 p-2.5 lg:p-3 rounded-xl bg-white/[0.03] border border-white/5 min-w-0">
                  {a.tipo === 'venta' && <DollarSign size={14} className="text-green-400 flex-shrink-0" />}
                  {a.tipo === 'compra' && <ShoppingCart size={14} className="text-blue-400 flex-shrink-0" />}
                  <p className="text-xs lg:text-sm text-white/70 flex-1 min-w-0 truncate">{a.texto}</p>
                  <span className="text-[10px] lg:text-xs text-salon-pink font-mono flex-shrink-0">{formatCurrency(a.monto)}</span>
                </div>
              ))}
            </div>
          )}
          {data.actividad.length > 8 && (
            <div className="mt-3 pt-3 border-t border-white/5 text-center">
              <span className="text-[10px] text-white/20">+{data.actividad.length - 8} eventos más</span>
            </div>
          )}
        </div>
      </motion.div>

      {/* ─── Chart semanal ─── */}
      <motion.div variants={scaleIn} className="bg-gradient-to-br from-white/5 to-white/[0.02] rounded-2xl border border-white/10 p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-semibold">{corteId ? 'Ingresos del período' : 'Ingresos semanales'}</h2>
            <p className="text-xs text-white/30 mt-0.5">{corteId ? 'Desglose por día dentro del corte' : 'Últimos 7 días de operación'}</p>
          </div>
          <span className="text-xs text-white/30 flex items-center gap-1">
            Total: <span className="text-salon-gold font-semibold">{formatCurrency(weeklyTotal)}</span>
          </span>
        </div>
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={data.ingresos_semanales}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
            <XAxis dataKey="name" stroke="rgba(255,255,255,0.15)" tick={{ fontSize: 12 }} />
            <YAxis stroke="rgba(255,255,255,0.15)" tick={{ fontSize: 12 }} />
            <Tooltip
              contentStyle={{ backgroundColor: '#d4a843', border: '1px solid rgba(212,168,67,0.6)', borderRadius: '12px', color: '#0a0610', fontSize: '12px', fontWeight: 600, boxShadow: '0 4px 20px rgba(212,168,67,0.35)' }}
              cursor={{ fill: 'rgba(212,168,67,0.08)' }}
              formatter={(value: number) => [formatCurrency(value), 'Ingresos']}
            />
            <Bar dataKey="ingresos" fill="url(#goldGradient)" radius={[6, 6, 0, 0]} />
            <defs>
              <linearGradient id="goldGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#d4a843" />
                <stop offset="100%" stopColor="#ba71a2" />
              </linearGradient>
            </defs>
          </BarChart>
        </ResponsiveContainer>
      </motion.div>

    </motion.div>
  );
}