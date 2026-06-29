import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell
} from 'recharts';
import {
  DollarSign, TrendingUp, TrendingDown, ShoppingCart, CalendarDays,
  AlertTriangle, Clock, CheckCircle, BarChart3, ArrowRight,
  CreditCard, Package, Target, Receipt, Percent,
  ArrowUpRight, ArrowDownRight, Eye
} from 'lucide-react';
import { formatCurrency } from '../../lib/formatters';

// ─── Interfaces ───
interface CorteInfo {
  cor_id: number;
  fecha_apertura: string;
  base_inicial: number;
  periodo: string;
  estado: string;
}

interface Resumen {
  ingresos: number;
  egresos: number;
  ganancia: number;
  total_facturas: number;
  total_compras: number;
  citas_completadas: number;
  bajo_stock: number;
  total_pagado: number;
  corte_abierto: CorteInfo | null;
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
  citas_hoy: { hora: string; cliente: string; servicio: string; precio: number }[];
  ingresos_semanales: { name: string; fecha: string; ingresos: number }[];
  actividad: { tipo: string; texto: string; monto: number; fecha: string }[];
}

// ─── Colores ───
const PIE_COLORS = ['#34d399', '#ef4444', '#f59e0b'];
const TREND_COLORS = { gold: '#d4a843', pink: '#ba71a2' };

// ─── Tooltip personalizado para Tendencia de Ingresos ───
function TrendTooltip({ active, payload, label }: any) {
  if (!active || !payload || !payload.length) return null;
  return (
    <div style={{
      backgroundColor: '#d4a843',
      border: '1px solid rgba(212,168,67,0.6)',
      borderRadius: '12px',
      padding: '10px 14px',
      boxShadow: '0 4px 20px rgba(212,168,67,0.35)',
    }}>
      <p style={{ color: '#0a0610', fontSize: '11px', fontWeight: 400, margin: 0, marginBottom: 4, opacity: 0.7 }}>
        Día: {label}
      </p>
      <p style={{ color: '#0a0610', fontSize: '16px', fontWeight: 700, margin: 0 }}>
        {formatCurrency(payload[0].value)}
      </p>
      <p style={{ color: '#0a0610', fontSize: '10px', fontWeight: 500, margin: 0, marginTop: 2, opacity: 0.6 }}>
        Ingresos
      </p>
    </div>
  );
}

export default function Reportes() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [resumen, setResumen] = useState<Resumen | null>(null);
  const [dashboard, setDashboard] = useState<DashboardData | null>(null);
  const [cortes, setCortes] = useState<CorteHistorico[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [periodo, setPeriodo] = useState('');

  const glassCard = 'bg-gradient-to-br from-white/5 to-white/[0.02] rounded-2xl border border-white/10';
  const glassCardHover = 'bg-gradient-to-br from-white/5 to-white/[0.02] rounded-2xl border border-white/10 hover:border-salon-gold/20 transition-all';

  useEffect(() => {
    const loadAll = async () => {
      setLoading(true);
      setError('');
      try {
        const params: any = {};
        if (periodo) params.periodo = periodo;
        const corteId = searchParams.get('corte_id');
        if (corteId) params.corte_id = parseInt(corteId);

        const [resRes, dashRes, cortesRes] = await Promise.all([
          api.get('/api/finanzas/resumen', { params }),
          api.get('/api/finanzas/dashboard', { params: corteId ? { corte_id: parseInt(corteId) } : {} }).catch(() => ({ data: null })),
          api.get('/api/cortes-caja/', { params: { limit: 15 } }).catch(() => ({ data: { data: [] } })),
        ]);

        setResumen(resRes.data);
        setDashboard(dashRes.data);
        setCortes(cortesRes.data.data || []);
      } catch (err: any) {
        console.error(err);
        if (err.code === 'ERR_NETWORK') setError('No se pudo conectar con el servidor');
        else if (err.response?.status === 401) setError('Sesión expirada');
        else setError('Error al cargar reportes');
      } finally {
        setLoading(false);
      }
    };
    loadAll();
  }, [periodo, searchParams]);

  // ── Indicadores calculados ──
  const ingresos = resumen?.ingresos ?? 0;
  const egresos = resumen?.egresos ?? 0;
  const ganancia = resumen?.ganancia ?? 0;
  const facturas = resumen?.total_facturas ?? 0;
  const compras = resumen?.total_compras ?? 0;

  const margenGanancia = ingresos > 0 ? ((ganancia / ingresos) * 100) : 0;
  const ticketPromedio = facturas > 0 ? (ingresos / facturas) : 0;
  const ratioIngresoEgreso = egresos > 0 ? (ingresos / egresos) : ingresos > 0 ? Infinity : 0;

  // ── Doughnut data ──
  const doughnutData = [
    { name: 'Ingresos', value: ingresos },
    { name: 'Egresos', value: egresos },
    { name: 'Ganancia Neta', value: Math.max(ganancia, 0) },
  ];

  // ── Cortes recientes cerrados ──
  const cortesCerrados = cortes.filter(c => c.cor_estado === 'Cerrado');

  // ── Estado de carga ──
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-10 h-10 border-2 border-salon-gold/30 border-t-salon-gold rounded-full animate-spin mx-auto mb-4" />
          <p className="text-white/30 text-sm">Cargando reportes...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-16">
        <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center mx-auto mb-4">
          <TrendingDown size={24} className="text-red-400" />
        </div>
        <p className="text-red-400 text-sm mb-4">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-white/60 hover:text-white hover:bg-white/10 transition-all text-sm"
        >
          Reintentar
        </button>
      </div>
    );
  }

  if (!resumen) return <div className="p-8 text-center text-white/30">No hay datos disponibles</div>;

  return (
    <div className="space-y-6">

      {/* ═══════════════════ HEADER ═══════════════════ */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold">Reportes Financieros</h1>
          <p className="text-white/30 text-sm mt-1">Visión completa de ingresos, egresos y rentabilidad</p>
        </div>
        <div className="flex items-center gap-3">
          <select value={periodo} onChange={e => setPeriodo(e.target.value)}
            className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:border-salon-gold/50">
            <option value="" className="bg-[#120c1a]">📊 Todo el historial</option>
            <option value="diario" className="bg-[#120c1a]">📅 Diario</option>
            <option value="semanal" className="bg-[#120c1a]">📅 Semanal</option>
            <option value="mensual" className="bg-[#120c1a]">📅 Mensual</option>
          </select>
          {dashboard?.ingresos_semanales && dashboard.ingresos_semanales.length > 0 && (
            <span className="text-[10px] text-white/25 bg-white/5 px-3 py-1.5 rounded-full hidden lg:inline">
              {dashboard.ingresos_semanales.length} días con datos
            </span>
          )}
        </div>
      </div>

      {/* ═══════════════════ BANNER CORTE ACTIVO ═══════════════════ */}
      {resumen.corte_abierto ? (
        <div className="bg-gradient-to-br from-white/5 to-white/[0.02] rounded-2xl border border-green-500/20 p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-green-500/10 flex items-center justify-center">
              <Clock size={16} className="text-green-400" />
            </div>
            <div>
              <p className="text-sm font-medium">
                Corte de caja <span className="text-green-400">abierto</span>
                <span className="text-white/30 ml-2 text-xs capitalize">· {resumen.corte_abierto.periodo}</span>
              </p>
              <p className="text-xs text-white/30">
                Desde {new Date(resumen.corte_abierto.fecha_apertura).toLocaleDateString()} · Base: ${resumen.corte_abierto.base_inicial?.toLocaleString()}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="hidden sm:inline text-xs text-green-400 bg-green-500/10 px-3 py-1.5 rounded-full flex items-center gap-1">
              <CheckCircle size={12} /> Activo
            </span>
            <button
              onClick={() => navigate('/admin/caja')}
              className="text-xs px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-white/50 hover:text-white transition-all"
            >
              Ir a Caja →
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-gradient-to-br from-white/5 to-white/[0.02] rounded-2xl border border-white/10 p-4 flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-white/5 flex items-center justify-center">
            <Clock size={16} className="text-white/30" />
          </div>
          <div>
            <p className="text-sm font-medium">Sin corte de caja activo</p>
            <p className="text-xs text-white/30">Los reportes muestran datos históricos generales</p>
          </div>
        </div>
      )}

      {/* ═══════════════════ CARDS EJECUTIVAS ═══════════════════ */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Ingresos */}
        <div className={glassCardHover}>
          <div className="p-5">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs text-white/40">Ingresos Totales</p>
              <div className="w-10 h-10 rounded-xl bg-green-500/10 flex items-center justify-center">
                <TrendingUp size={18} className="text-green-400" />
              </div>
            </div>
            <p className="text-2xl font-bold">{formatCurrency(ingresos)}</p>
            <div className="flex items-center gap-1 mt-1.5">
              <span className={`text-[10px] flex items-center gap-0.5 ${facturas > 0 ? 'text-green-400/60' : 'text-white/20'}`}>
                <ArrowUpRight size={10} />
                {facturas} facturas
              </span>
            </div>
          </div>
        </div>

        {/* Egresos */}
        <div className={glassCardHover}>
          <div className="p-5">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs text-white/40">Egresos</p>
              <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center">
                <TrendingDown size={18} className="text-red-400" />
              </div>
            </div>
            <p className="text-2xl font-bold">{formatCurrency(egresos)}</p>
            <div className="flex items-center gap-1 mt-1.5">
              <span className={`text-[10px] flex items-center gap-0.5 ${compras > 0 ? 'text-red-400/60' : 'text-white/20'}`}>
                <ArrowDownRight size={10} />
                {compras} compras
              </span>
            </div>
          </div>
        </div>

        {/* Ganancia Neta */}
        <div className={glassCardHover}>
          <div className="p-5">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs text-white/40">Ganancia Neta</p>
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${ganancia >= 0 ? 'bg-salon-gold/10' : 'bg-red-500/10'}`}>
                <DollarSign size={18} className={ganancia >= 0 ? 'text-salon-gold' : 'text-red-400'} />
              </div>
            </div>
            <p className={`text-2xl font-bold ${ganancia >= 0 ? 'text-salon-gold' : 'text-red-400'}`}>
              {formatCurrency(ganancia)}
            </p>
            <div className="flex items-center gap-1 mt-1.5">
              <span className={`text-[10px] flex items-center gap-0.5 ${ganancia >= 0 ? 'text-green-400/60' : 'text-red-400/60'}`}>
                {ganancia >= 0 ? <ArrowUpRight size={10} /> : <ArrowDownRight size={10} />}
                {ganancia >= 0 ? 'Positivo' : 'Negativo'}
              </span>
            </div>
          </div>
        </div>

        {/* Margen de Ganancia % */}
        <div className={glassCardHover}>
          <div className="p-5">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs text-white/40">Margen de Ganancia</p>
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${margenGanancia >= 0 ? 'bg-blue-500/10' : 'bg-red-500/10'}`}>
                <Percent size={18} className={margenGanancia >= 0 ? 'text-blue-400' : 'text-red-400'} />
              </div>
            </div>
            <p className={`text-2xl font-bold ${margenGanancia >= 0 ? 'text-blue-400' : 'text-red-400'}`}>
              {margenGanancia.toFixed(1)}%
            </p>
            {/* Barra de progreso visual */}
            <div className="mt-2 h-1.5 rounded-full bg-white/5 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${margenGanancia >= 0 ? 'bg-gradient-to-r from-salon-gold to-green-400' : 'bg-red-500'}`}
                style={{ width: `${Math.min(Math.abs(margenGanancia), 100)}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* ═══════════════════ GRÁFICOS: 2 COLUMNAS ═══════════════════ */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">

        {/* ─── ÁREA: Tendencia de ingresos (3/5) ─── */}
        <div className={`${glassCard} p-6 lg:col-span-3`}>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <TrendingUp size={16} className="text-salon-gold" />
                Tendencia de Ingresos
              </h2>
              <p className="text-xs text-white/30 mt-0.5">Evolución diaria en el período actual</p>
            </div>
            {dashboard?.ingresos_semanales && (
              <span className="text-xs text-white/30">
                Total:{' '}
                <span className="text-salon-gold font-semibold">
                  {formatCurrency(dashboard.ingresos_semanales.reduce((s, d) => s + d.ingresos, 0))}
                </span>
              </span>
            )}
          </div>
          {dashboard?.ingresos_semanales && dashboard.ingresos_semanales.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart data={dashboard.ingresos_semanales}>
                <defs>
                  <linearGradient id="incomeGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={TREND_COLORS.gold} stopOpacity={0.3} />
                    <stop offset="100%" stopColor={TREND_COLORS.gold} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                <XAxis dataKey="name" stroke="rgba(255,255,255,0.1)" tick={{ fontSize: 11 }} />
                <YAxis stroke="rgba(255,255,255,0.1)" tick={{ fontSize: 11 }} />
                <Tooltip
                  content={<TrendTooltip />}
                  cursor={{ stroke: 'rgba(212,168,67,0.3)', strokeWidth: 1, strokeDasharray: '4 4' }}
                />
                <Area
                  type="monotone"
                  dataKey="ingresos"
                  stroke={TREND_COLORS.gold}
                  strokeWidth={2}
                  fill="url(#incomeGradient)"
                  dot={{ r: 3, fill: TREND_COLORS.gold, strokeWidth: 0 }}
                  activeDot={{ r: 5, fill: TREND_COLORS.pink, strokeWidth: 2, stroke: '#fff' }}
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-64 flex items-center justify-center text-white/15 text-sm">
              <div className="text-center">
                <BarChart3 size={32} className="mx-auto mb-2 opacity-30" />
                <p>Sin datos de tendencia disponibles</p>
                <p className="text-xs mt-1">Abre un corte de caja para ver la evolución diaria</p>
              </div>
            </div>
          )}
        </div>

        {/* ─── DOUGHNUT: Proporción (2/5) ─── */}
        <div className={`${glassCard} p-6 lg:col-span-2`}>
          <div className="mb-4">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <Target size={16} className="text-salon-pink" />
              Distribución Financiera
            </h2>
            <p className="text-xs text-white/30 mt-0.5">Proporción de ingresos vs egresos</p>
          </div>
          {ingresos > 0 || egresos > 0 ? (
            <div className="flex flex-col items-center">
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie
                    data={doughnutData.filter(d => d.value > 0)}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={95}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {doughnutData.filter(d => d.value > 0).map((_, i) => (
                      <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ backgroundColor: '#d4a843', border: '1px solid rgba(212,168,67,0.6)', borderRadius: '12px', color: '#0a0610', fontSize: '12px', fontWeight: 700, boxShadow: '0 4px 20px rgba(212,168,67,0.35)' }}
                    formatter={(value: number, name: string) => [formatCurrency(value), name]}
                  />
                </PieChart>
              </ResponsiveContainer>
              {/* Leyenda personalizada */}
              <div className="flex flex-wrap gap-4 mt-2 text-xs">
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#34d399]" />
                  <span className="text-white/50">Ingresos</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#ef4444]" />
                  <span className="text-white/50">Egresos</span>
                </span>
                {ganancia > 0 && (
                  <span className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#f59e0b]" />
                    <span className="text-white/50">Ganancia</span>
                  </span>
                )}
              </div>
            </div>
          ) : (
            <div className="h-48 flex items-center justify-center text-white/15 text-sm">
              Sin datos financieros
            </div>
          )}
        </div>
      </div>

      {/* ═══════════════════ INDICADORES SECUNDARIOS ═══════════════════ */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Ticket Promedio */}
        <div className={glassCard}>
          <div className="p-4">
            <p className="text-[10px] text-white/30 uppercase tracking-wider mb-1">Ticket Promedio</p>
            <p className="text-lg font-bold text-salon-gold">{formatCurrency(ticketPromedio)}</p>
            <div className="flex items-center gap-1 mt-1">
              <Receipt size={10} className="text-white/20" />
              <span className="text-[10px] text-white/20">{facturas} facturas emitidas</span>
            </div>
          </div>
        </div>

        {/* Ratio Ingreso/Egreso */}
        <div className={glassCard}>
          <div className="p-4">
            <p className="text-[10px] text-white/30 uppercase tracking-wider mb-1">Ratio I/E</p>
            <p className={`text-lg font-bold ${ratioIngresoEgreso >= 1 ? 'text-green-400' : 'text-red-400'}`}>
              {ratioIngresoEgreso === Infinity ? '∞' : ratioIngresoEgreso.toFixed(2)}
            </p>
            <div className="flex items-center gap-1 mt-1">
              <span className="text-[10px] text-white/20">
                {ratioIngresoEgreso >= 1 ? 'Cubre gastos ✓' : 'No cubre gastos ✗'}
              </span>
            </div>
          </div>
        </div>

        {/* Citas Completadas */}
        <div className={glassCard}>
          <div className="p-4">
            <p className="text-[10px] text-white/30 uppercase tracking-wider mb-1">Citas Completadas</p>
            <p className="text-lg font-bold text-salon-pink">{resumen.citas_completadas ?? 0}</p>
            <div className="flex items-center gap-1 mt-1">
              <CalendarDays size={10} className="text-white/20" />
              <span className="text-[10px] text-white/20">servicios realizados</span>
            </div>
          </div>
        </div>

        {/* Bajo Stock */}
        <div className={glassCard}>
          <div className="p-4">
            <p className="text-[10px] text-white/30 uppercase tracking-wider mb-1">Productos Bajo Stock</p>
            <p className={`text-lg font-bold ${(resumen.bajo_stock ?? 0) > 0 ? 'text-yellow-400' : 'text-green-400'}`}>
              {resumen.bajo_stock ?? 0}
            </p>
            <div className="flex items-center gap-1 mt-1">
              <AlertTriangle size={10} className="text-white/20" />
              <span className="text-[10px] text-white/20">
                {(resumen.bajo_stock ?? 0) > 0 ? 'requieren reposición' : 'stock saludable'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ═══════════════════ TABLA DE CORTES + ACTIVIDAD ═══════════════════ */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">

        {/* ─── Cortes de Caja Recientes (3/5) ─── */}
        <div className={`${glassCard} lg:col-span-3 overflow-hidden`}>
          <div className="p-4 border-b border-white/5 flex items-center justify-between">
            <h3 className="font-semibold flex items-center gap-2">
              <Clock size={14} className="text-salon-gold" />
              Cortes de Caja Recientes
            </h3>
            <button
              onClick={() => navigate('/admin/caja')}
              className="text-xs text-salon-gold/60 hover:text-salon-gold transition-colors flex items-center gap-1"
            >
              Ver todos <ArrowRight size={10} />
            </button>
          </div>
          {cortesCerrados.length === 0 ? (
            <div className="p-8 text-center text-white/20 text-sm">Sin cortes de caja registrados</div>
          ) : (
            <div className="divide-y divide-white/5 max-h-72 overflow-y-auto">
              {cortesCerrados.slice(0, 10).map((c) => {
                const gananciaNeta = c.cor_ganancia_neta ?? 0;
                return (
                  <div key={c.cor_id} className="p-3.5 flex items-center justify-between hover:bg-white/[0.02] transition-colors">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 ${
                        gananciaNeta >= 0 ? 'bg-green-500/10' : 'bg-red-500/10'
                      }`}>
                        <DollarSign size={12} className={gananciaNeta >= 0 ? 'text-green-400' : 'text-red-400'} />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium">#{c.cor_id}</span>
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/5 text-white/30 uppercase">
                            {c.cor_periodo}
                          </span>
                        </div>
                        <p className="text-xs text-white/30 truncate">
                          {new Date(c.cor_fecha_apertura).toLocaleDateString()} · Base: ${c.cor_base_inicial?.toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <p className={`text-xs font-semibold ${gananciaNeta >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                          {formatCurrency(gananciaNeta)}
                        </p>
                        <p className="text-[10px] text-white/20">
                          I: ${(c.cor_ingresos ?? 0).toLocaleString()}
                        </p>
                      </div>
                      <button
                        onClick={() => navigate(`/admin/corte-del-dia?corte_id=${c.cor_id}`)}
                        className="p-1.5 rounded-lg text-white/15 hover:text-salon-gold hover:bg-white/5 transition-all"
                        title="Ver corte del día"
                      >
                        <Eye size={13} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* ─── Actividad Reciente (2/5) ─── */}
        <div className={`${glassCard} lg:col-span-2 overflow-hidden`}>
          <div className="p-4 border-b border-white/5 flex items-center justify-between">
            <h3 className="font-semibold flex items-center gap-2">
              <CreditCard size={14} className="text-salon-pink" />
              Actividad Reciente
            </h3>
            <span className="text-xs text-white/30">
              {dashboard?.actividad?.length ?? 0} eventos
            </span>
          </div>
          {!dashboard?.actividad || dashboard.actividad.length === 0 ? (
            <div className="p-8 text-center text-white/20 text-sm">Sin actividad reciente</div>
          ) : (
            <div className="divide-y divide-white/5 max-h-72 overflow-y-auto">
              {dashboard.actividad.slice(0, 8).map((a, i) => (
                <div key={i} className="p-3.5 flex items-center gap-3 hover:bg-white/[0.02] transition-colors">
                  {a.tipo === 'venta' ? (
                    <div className="w-7 h-7 rounded-full bg-green-500/10 flex items-center justify-center flex-shrink-0">
                      <ShoppingCart size={12} className="text-green-400" />
                    </div>
                  ) : (
                    <div className="w-7 h-7 rounded-full bg-blue-500/10 flex items-center justify-center flex-shrink-0">
                      <Package size={12} className="text-blue-400" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium truncate">{a.texto}</p>
                    <p className="text-[10px] text-white/25">
                      {new Date(a.fecha).toLocaleDateString()} · {a.tipo === 'venta' ? 'Venta' : 'Compra'}
                    </p>
                  </div>
                  <span className={`text-xs font-semibold flex-shrink-0 ${
                    a.tipo === 'venta' ? 'text-green-400' : 'text-red-400'
                  }`}>
                    {formatCurrency(a.monto)}
                  </span>
                </div>
              ))}
            </div>
          )}
          {dashboard?.actividad && dashboard.actividad.length > 5 && (
            <div className="p-3 border-t border-white/5 text-center">
              <button
                onClick={() => navigate('/admin/facturas')}
                className="text-xs text-salon-gold/60 hover:text-salon-gold transition-colors"
              >
                Ver actividad completa →
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
