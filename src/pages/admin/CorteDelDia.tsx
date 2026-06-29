import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts';
import {
  DollarSign, TrendingUp, TrendingDown, CalendarDays, Clock,
  CreditCard, ShoppingCart, ArrowLeft, BarChart3, CheckCircle,
  FileText, Package
} from 'lucide-react';
import { formatCurrency, formatDate } from '../../lib/formatters';

interface CorteDetalle {
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

interface ActividadFacturaDetalle {
  dfa_servicio_id: number;
  dfa_subtotal: number;
  ser_nombre?: string;
}

interface ActividadFactura {
  fac_id: number;
  fac_total: number;
  fac_estado: string;
  fac_fecha: string;
  cli_nombre?: string;
  cli_apellido?: string;
  detalle?: ActividadFacturaDetalle[];
}

interface ActividadCompra {
  com_id: number;
  com_total: number;
  com_fecha: string;
  prv_nombre: string;
}

interface ActividadData {
  facturas: ActividadFactura[];
  compras: ActividadCompra[];
  total_ingresos: number;
  total_egresos: number;
}

interface CorteInfo {
  cor_id: number;
  fecha_apertura: string;
  base_inicial: number;
  ingresos?: number;
  egresos?: number;
  ganancia_neta?: number;
  periodo: string;
  estado: string;
}

interface Resumen {
  ingresos: number;
  egresos: number;
  ganancia: number;
  total_facturas: number;
  total_compras: number;
  corte_abierto: CorteInfo | null;
}

// ─── Colores para el PieChart ───
const PIE_COLORS = ['#d4a843', '#ba71a2', '#22d3ee', '#a78bfa', '#f59e0b', '#34d399', '#f472b6', '#60a5fa'];

export default function CorteDelDia() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const corteId = searchParams.get('corte_id');

  const [corte, setCorte] = useState<CorteDetalle | null>(null);
  const [actividad, setActividad] = useState<ActividadData | null>(null);
  const [resumen, setResumen] = useState<Resumen | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const glassCard = 'bg-gradient-to-br from-white/5 to-white/[0.02] rounded-2xl border border-white/10';
  const glassCardHover = 'bg-gradient-to-br from-white/5 to-white/[0.02] rounded-2xl border border-white/10 hover:border-salon-gold/20 transition-all';

  useEffect(() => {
    if (!corteId) {
      setError('No se especificó un corte de caja');
      setLoading(false);
      return;
    }

    const loadData = async () => {
      setLoading(true);
      setError('');
      try {
        // 1. Obtener info del corte desde el listado
        const cortesRes = await api.get('/api/cortes-caja/', { params: { limit: 100 } });
        const cortes: CorteDetalle[] = cortesRes.data.data || [];
        const found = cortes.find((c: CorteDetalle) => c.cor_id === parseInt(corteId!));
        if (!found) {
          setError('Corte de caja no encontrado');
          setLoading(false);
          return;
        }
        setCorte(found);

        // 2. Obtener actividad del corte
        const actRes = await api.get(`/api/cortes-caja/${corteId}/actividad`);
        setActividad(actRes.data);

        // 3. Obtener resumen financiero
        const resRes = await api.get('/api/finanzas/resumen', { params: { corte_id: parseInt(corteId!) } });
        setResumen(resRes.data);
      } catch (err: any) {
        console.error(err);
        setError(err.response?.data?.error || 'Error al cargar datos del corte');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [corteId]);

  // ── Datos para gráficos ──
  const balanceFinal = corte
    ? (corte.cor_base_inicial || 0) + (corte.cor_ingresos || 0) - (corte.cor_egresos || 0)
    : 0;

  const ingresosPorDia = actividad
    ? (() => {
        const diasMap: Record<string, { ingresos: number; egresos: number }> = {};
        const diasSemana = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

        actividad.facturas.forEach(f => {
          const fecha = f.fac_fecha?.split('T')[0] || '';
          if (!diasMap[fecha]) {
            diasMap[fecha] = { ingresos: 0, egresos: 0 };
          }
          if (f.fac_estado === 'pagado') {
            diasMap[fecha].ingresos += f.fac_total;
          }
        });

        actividad.compras.forEach(c => {
          const fecha = c.com_fecha?.split('T')[0] || '';
          if (!diasMap[fecha]) {
            diasMap[fecha] = { ingresos: 0, egresos: 0 };
          }
          diasMap[fecha].egresos += c.com_total;
        });

        return Object.entries(diasMap)
          .sort(([a], [b]) => a.localeCompare(b))
          .map(([fecha, data]) => {
            // ⚠️ Usar split en vez de new Date(string) para evitar
            // que la zona horaria UTC desfase la fecha un día.
            const [yr, mo, dy] = fecha.split('-').map(Number);
            const d = new Date(yr, mo - 1, dy); // local timezone
            return {
              name: diasSemana[d.getDay()] || fecha.slice(5),
              fecha,
              ingresos: data.ingresos,
              egresos: data.egresos,
            };
          });
      })()
    : [];

  // Distribución de ingresos agrupada por servicio
  const distribucion = actividad
    ? actividad.facturas
        .filter(f => f.fac_estado === 'pagado')
        .reduce<{ name: string; value: number }[]>((acc, f) => {
          if (f.detalle && f.detalle.length > 0) {
            // Agrupar por servicio
            for (const d of f.detalle) {
              const nombre = d.ser_nombre || `Servicio #${d.dfa_servicio_id}`;
              const existente = acc.find(s => s.name === nombre);
              if (existente) {
                existente.value += d.dfa_subtotal;
              } else {
                acc.push({ name: nombre, value: d.dfa_subtotal });
              }
            }
          } else {
            // Fallback: factura sin detalle (una porción por factura)
            const nombre = f.cli_nombre ? `Factura #${f.fac_id} - ${f.cli_nombre}` : `Factura #${f.fac_id}`;
            acc.push({ name: nombre, value: f.fac_total });
          }
          return acc;
        }, [])
    : [];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-10 h-10 border-2 border-salon-gold/30 border-t-salon-gold rounded-full animate-spin mx-auto mb-4" />
          <p className="text-white/30 text-sm">Cargando datos del corte...</p>
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
          onClick={() => navigate('/admin/caja')}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-white/60 hover:text-white hover:bg-white/10 transition-all text-sm"
        >
          <ArrowLeft size={14} /> Volver a Caja
        </button>
      </div>
    );
  }

  if (!corte || !actividad) {
    return <div className="p-8 text-center text-white/30">No hay datos disponibles</div>;
  }

  const totalIngresos = actividad.total_ingresos || resumen?.ingresos || corte.cor_ingresos || 0;
  const totalEgresos = actividad.total_egresos || resumen?.egresos || corte.cor_egresos || 0;
  const gananciaNeta = (corte.cor_ganancia_neta ?? totalIngresos - totalEgresos);

  const statsCards = [
    {
      label: 'Base Inicial',
      value: formatCurrency(corte.cor_base_inicial),
      icon: DollarSign,
      color: 'text-blue-400',
      bg: 'bg-blue-500/10',
    },
    {
      label: 'Ingresos',
      value: formatCurrency(totalIngresos),
      icon: TrendingUp,
      color: 'text-green-400',
      bg: 'bg-green-500/10',
    },
    {
      label: 'Egresos',
      value: formatCurrency(totalEgresos),
      icon: TrendingDown,
      color: 'text-red-400',
      bg: 'bg-red-500/10',
    },
    {
      label: 'Ganancia Neta',
      value: formatCurrency(gananciaNeta),
      icon: BarChart3,
      color: gananciaNeta >= 0 ? 'text-salon-gold' : 'text-red-400',
      bg: gananciaNeta >= 0 ? 'bg-salon-gold/10' : 'bg-red-500/10',
    },
  ];

  const fechaApertura = new Date(corte.cor_fecha_apertura);
  const fechaCierre = corte.cor_fecha_cierre ? new Date(corte.cor_fecha_cierre) : null;

  return (
    <div className="space-y-6">

      {/* ─── Header con navegación ─── */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/admin/caja')}
            className="p-2 rounded-lg text-white/30 hover:text-salon-gold hover:bg-white/5 transition-all"
            title="Volver a Caja"
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold">Corte del Día</h1>
            <p className="text-white/30 text-sm mt-1">
              Corte #{corte.cor_id} ·{' '}
              <span className="capitalize">{corte.cor_periodo}</span> ·{' '}
              {fechaApertura.toLocaleDateString('es-CO', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span
            className={`text-xs px-4 py-1.5 rounded-full flex items-center gap-1.5 border ${
              corte.cor_estado === 'Abierto'
                ? 'bg-green-500/10 text-green-400 border-green-500/20'
                : 'bg-white/5 text-white/40 border-white/10'
            }`}
          >
            <CheckCircle size={12} />
            {corte.cor_estado}
          </span>
          <span className="text-xs text-white/30 bg-white/5 px-3 py-1.5 rounded-full">
            Período: <span className="capitalize text-white/50">{corte.cor_periodo}</span>
          </span>
        </div>
      </div>

      {/* ─── Banner informativo del período ─── */}
      <div className={`${glassCard} p-5 flex flex-wrap items-center gap-6`}>
        <div className="flex items-center gap-3">
          <CalendarDays size={16} className="text-salon-gold" />
          <div className="text-sm">
            <p className="text-white/40 text-xs">Apertura</p>
            <p className="font-medium">{fechaApertura.toLocaleString('es-CO')}</p>
          </div>
        </div>
        <div className="w-px h-8 bg-white/10" />
        <div className="flex items-center gap-3">
          <Clock size={16} className="text-salon-pink" />
          <div className="text-sm">
            <p className="text-white/40 text-xs">Cierre</p>
            <p className="font-medium">
              {fechaCierre ? fechaCierre.toLocaleString('es-CO') : '— Aún abierto —'}
            </p>
          </div>
        </div>
        <div className="w-px h-8 bg-white/10" />
        <div className="flex items-center gap-3">
          <DollarSign size={16} className="text-salon-gold" />
          <div className="text-sm">
            <p className="text-white/40 text-xs">Balance Final</p>
            <p className={`font-bold text-lg ${balanceFinal >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {formatCurrency(balanceFinal)}
            </p>
          </div>
        </div>
      </div>

      {/* ─── Stats Cards ─── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statsCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className={glassCardHover}>
              <div className="p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-white/40">{stat.label}</p>
                    <p className="text-xl lg:text-2xl font-bold mt-1">{stat.value}</p>
                  </div>
                  <div className={`w-11 h-11 rounded-xl ${stat.bg} flex items-center justify-center ${stat.color}`}>
                    <Icon size={20} />
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* ─── Gráficos: BarChart + PieChart ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
        {/* BarChart: Ingresos vs Egresos por día — ocupa 3/5 */}
        <div className={`${glassCard} p-6 lg:col-span-3`}>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-semibold">Ingresos vs Egresos por día</h2>
              <p className="text-xs text-white/30 mt-0.5">Distribución diaria de movimientos</p>
            </div>
            <div className="flex items-center gap-4 text-xs">
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-sm bg-[#d4a843]" />
                <span className="text-white/50">Ingresos</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-sm bg-[#ef4444]" />
                <span className="text-white/50">Egresos</span>
              </span>
            </div>
          </div>
          {ingresosPorDia.length === 0 ? (
            <div className="h-48 flex items-center justify-center text-white/20 text-sm">
              Sin movimientos en este período
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={ingresosPorDia}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="name" stroke="rgba(255,255,255,0.15)" tick={{ fontSize: 12 }} />
                <YAxis stroke="rgba(255,255,255,0.15)" tick={{ fontSize: 12 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0d0814',
                    border: '1px solid rgba(212,168,67,0.25)',
                    borderRadius: '12px',
                    color: '#fff',
                    fontSize: '12px',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.5)',
                  }}
                  cursor={{ fill: 'rgba(255,255,255,0.03)' }}
                  formatter={(value: number, name: string) => [formatCurrency(value), name]}
                  labelFormatter={(label: string) => `Día: ${label}`}
                />
                <Bar dataKey="ingresos" name="Ingresos" fill="#d4a843" radius={[4, 4, 0, 0]} maxBarSize={40} />
                <Bar dataKey="egresos" name="Egresos" fill="#ef4444" radius={[4, 4, 0, 0]} maxBarSize={40} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* PieChart: Distribución — ocupa 2/5 */}
        <div className={`${glassCard} p-6 lg:col-span-2`}>
          <div className="mb-4">
            <h2 className="text-lg font-semibold">Distribución de Ingresos</h2>
            <p className="text-xs text-white/30 mt-0.5">Facturas del período</p>
          </div>
          {distribucion.length === 0 ? (
            <div className="h-48 flex items-center justify-center text-white/20 text-sm">
              Sin facturas en este período
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={distribucion}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={90}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {distribucion.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#d4a843',
                    border: '1px solid rgba(212,168,67,0.6)',
                    borderRadius: '12px',
                    color: '#0a0610',
                    fontSize: '12px',
                    fontWeight: 600,
                    boxShadow: '0 4px 20px rgba(212,168,67,0.35)',
                  }}
                  formatter={(value: number) => [formatCurrency(value), 'Monto']}
                />
                <Legend
                  wrapperStyle={{ fontSize: '10px', color: 'rgba(255,255,255,0.5)' }}
                  formatter={(value: string) => (
                    <span style={{ color: 'rgba(255,255,255,0.6)' }}>
                      {value.length > 18 ? value.slice(0, 18) + '…' : value}
                    </span>
                  )}
                />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* ─── Actividad: Facturas + Compras ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Facturas del período */}
        <div className={`${glassCard} overflow-hidden`}>
          <div className="p-4 border-b border-white/5 flex items-center justify-between">
            <h3 className="font-semibold flex items-center gap-2">
              <CreditCard size={14} className="text-salon-gold" />
              Facturas
            </h3>
            <span className="text-xs text-white/30 bg-white/5 px-2 py-0.5 rounded-full">
              {actividad.facturas.length}
            </span>
          </div>
          {actividad.facturas.length === 0 ? (
            <div className="p-8 text-center text-white/20 text-sm">Sin facturas en este período</div>
          ) : (
            <div className="divide-y divide-white/5 max-h-64 overflow-y-auto">
              {actividad.facturas.map((f) => (
                <div key={f.fac_id} className="p-4 flex items-center justify-between hover:bg-white/[0.02] transition-colors">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-8 h-8 rounded-full bg-green-500/10 flex items-center justify-center flex-shrink-0">
                      <FileText size={14} className="text-green-400" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">
                        {f.cli_nombre || f.cli_apellido || 'Venta directa'}
                      </p>
                      <p className="text-xs text-white/30">
                        Factura #{f.fac_id} · {formatDate(f.fac_fecha) || '—'}
                      </p>
                    </div>
                  </div>
                  <span className={`text-sm font-semibold ml-3 ${
                    f.fac_estado === 'pagado' ? 'text-green-400' : 'text-yellow-400'
                  }`}>
                    {formatCurrency(f.fac_total)}
                  </span>
                </div>
              ))}
            </div>
          )}
          {actividad.facturas.length > 5 && (
            <div className="p-3 border-t border-white/5 text-center">
              <button
                onClick={() => navigate('/admin/facturas')}
                className="text-xs text-salon-gold/60 hover:text-salon-gold transition-colors"
              >
                Ver todas las facturas →
              </button>
            </div>
          )}
        </div>

        {/* Compras del período */}
        <div className={`${glassCard} overflow-hidden`}>
          <div className="p-4 border-b border-white/5 flex items-center justify-between">
            <h3 className="font-semibold flex items-center gap-2">
              <ShoppingCart size={14} className="text-salon-pink" />
              Compras
            </h3>
            <span className="text-xs text-white/30 bg-white/5 px-2 py-0.5 rounded-full">
              {actividad.compras.length}
            </span>
          </div>
          {actividad.compras.length === 0 ? (
            <div className="p-8 text-center text-white/20 text-sm">Sin compras en este período</div>
          ) : (
            <div className="divide-y divide-white/5 max-h-64 overflow-y-auto">
              {actividad.compras.map((c) => (
                <div key={c.com_id} className="p-4 flex items-center justify-between hover:bg-white/[0.02] transition-colors">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-8 h-8 rounded-full bg-blue-500/10 flex items-center justify-center flex-shrink-0">
                      <Package size={14} className="text-blue-400" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">{c.prv_nombre}</p>
                      <p className="text-xs text-white/30">
                        Compra #{c.com_id} · {formatDate(c.com_fecha) || '—'}
                      </p>
                    </div>
                  </div>
                  <span className="text-sm font-semibold text-red-400 ml-3">
                    {formatCurrency(c.com_total)}
                  </span>
                </div>
              ))}
            </div>
          )}
          {actividad.compras.length > 5 && (
            <div className="p-3 border-t border-white/5 text-center">
              <button
                onClick={() => navigate('/admin/compras')}
                className="text-xs text-salon-gold/60 hover:text-salon-gold transition-colors"
              >
                Ver todas las compras →
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
