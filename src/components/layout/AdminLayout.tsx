import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, CalendarDays, Users, Scissors, Package,
  DollarSign, BarChart3, LogOut, Menu, X, Truck, ShoppingCart,
  Sparkles, UserCircle, FileText, ArrowLeftRight, UserCog,
  ChevronLeft, ChevronRight, Undo2,
  Layers, Tags, TrendingUp
} from 'lucide-react';
import { motion } from 'motion/react';
import logoImg from '../../image/logo_salon-removebg-preview.png';
import { useState, useEffect } from 'react';
import api from '../../services/api';
import { ToastProvider, useToast } from '../ToastContext';
import PageTransition from '../PageTransition';

// ─── Full-page animated background blobs ───────────────────────────
function AdminBlobs() {
  return (
    <div className="fixed inset-0 pointer-events-none z-0" aria-hidden="true">
      {/* Blob 1 — Dorado — esquina superior izquierda */}
      <motion.div
        animate={{ x: [0, 150, -80, 0], y: [0, -100, 60, 0], scale: [1, 1.2, 0.9, 1], opacity: [0.14, 0.2, 0.12, 0.14] }}
        transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
        style={{ willChange: 'transform, opacity', background: 'rgba(212,168,67,0.18)' }}
        className="absolute -top-40 -left-40 w-[600px] h-[600px] rounded-full blur-[100px]"
      />
      {/* Blob 2 — Rosa — superior derecha */}
      <motion.div
        animate={{ x: [0, -200, 100, 0], y: [0, 150, -50, 0], scale: [1, 0.85, 1.15, 1], opacity: [0.12, 0.18, 0.1, 0.12] }}
        transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
        style={{ willChange: 'transform, opacity', background: 'rgba(186,113,162,0.16)' }}
        className="absolute -top-20 -right-60 w-[550px] h-[550px] rounded-full blur-[100px]"
      />
      {/* Blob 3 — Lavanda/Violeta — centro-izquierda */}
      <motion.div
        animate={{ x: [0, 250, -100, 0], y: [0, -120, 180, 0], scale: [1, 1.1, 0.85, 1], opacity: [0.1, 0.16, 0.08, 0.1] }}
        transition={{ duration: 5.5, repeat: Infinity, ease: 'easeInOut' }}
        style={{ willChange: 'transform, opacity', background: 'rgba(168,85,247,0.14)' }}
        className="absolute top-[30%] -left-40 w-[500px] h-[500px] rounded-full blur-[100px]"
      />
      {/* Blob 4 — Cyan — inferior derecha */}
      <motion.div
        animate={{ x: [0, -180, 80, 0], y: [0, -80, 120, 0], scale: [1, 1.15, 0.9, 1], opacity: [0.08, 0.14, 0.06, 0.08] }}
        transition={{ duration: 6.5, repeat: Infinity, ease: 'easeInOut' }}
        style={{ willChange: 'transform, opacity', background: 'rgba(34,211,238,0.12)' }}
        className="absolute -bottom-40 -right-40 w-[550px] h-[550px] rounded-full blur-[100px]"
      />
      {/* Blob 5 — Dorado sutil — centro-derecha abajo */}
      <motion.div
        animate={{ x: [0, 120, -150, 0], y: [0, -60, 100, 0], scale: [1, 0.9, 1.1, 1], opacity: [0.06, 0.12, 0.05, 0.06] }}
        transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
        style={{ willChange: 'transform, opacity', background: 'rgba(212,168,67,0.12)' }}
        className="absolute bottom-[20%] -right-20 w-[400px] h-[400px] rounded-full blur-[90px]"
      />
    </div>
  );
}

type NavSection = {
  title: string;
  color: string;       // hex color for the section accent
  items: NavItem[];
};

type NavItem = {
  path: string;
  label: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  badge: string | null;
};

const navSections: NavSection[] = [
  {
    title: 'General',
    color: '#d4a843',
    items: [
      { path: '/admin', label: 'Dashboard', icon: LayoutDashboard, badge: null },
    ],
  },
  {
    title: 'Caja / Turno',
    color: '#a78bfa',
    items: [
      { path: '/admin/caja', label: 'Caja', icon: DollarSign, badge: null },
      { path: '/admin/citas', label: 'Citas', icon: CalendarDays, badge: null },
      { path: '/admin/corte-del-dia', label: 'Corte del Día', icon: TrendingUp, badge: null },
      { path: '/admin/compras', label: 'Compras', icon: ShoppingCart, badge: null },
      { path: '/admin/reportes', label: 'Reportes', icon: BarChart3, badge: null },
    ],
  },
  {
    title: 'Operaciones',
    color: '#ec4899',
    items: [
      { path: '/admin/clientes', label: 'Clientes', icon: Users, badge: null },
      { path: '/admin/servicios', label: 'Servicios', icon: Scissors, badge: null },
      { path: '/admin/facturas', label: 'Facturas', icon: FileText, badge: null },
    ],
  },
  {
    title: 'Inventario',
    color: '#22d3ee',
    items: [
      { path: '/admin/inventario', label: 'Inventario', icon: Package, badge: null },
      { path: '/admin/proveedores', label: 'Proveedores', icon: Truck, badge: null },
      { path: '/admin/movimientos-inventario', label: 'Movimientos', icon: ArrowLeftRight, badge: null },
      { path: '/admin/devoluciones', label: 'Devoluciones', icon: Undo2, badge: null },
    ],
  },
  {
    title: 'Configuración',
    color: '#f59e0b',
    items: [
      { path: '/admin/usuarios', label: 'Usuarios', icon: UserCog, badge: null },
      { path: '/admin/servicio-productos', label: 'Insumos por Servicio', icon: Layers, badge: null },
      { path: '/admin/proveedor-productos', label: 'Productos por Proveedor', icon: Tags, badge: null },
    ],
  },
];

function AdminLayoutInner() {
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [username, setUsername] = useState('admin');
  const [citasHoy, setCitasHoy] = useState(0);
  const { addToast } = useToast();

  // Global API error interceptor for admin pages
  useEffect(() => {
    const interceptor = api.interceptors.response.use(
      r => r,
      err => {
        const msg = err.response?.data?.error || err.response?.data?.message || 'Error de conexión';
        // Don't show toast for 401 (handled by auth redirect) or 404
        if (err.response?.status !== 401 && err.response?.status !== 404) {
          addToast(msg, 'error');
        }
        return Promise.reject(err);
      }
    );
    return () => api.interceptors.response.eject(interceptor);
  }, [addToast]);

  useEffect(() => {
    const stored = localStorage.getItem('username');
    if (stored) setUsername(stored);
    // Fetch quick stats
    api.get('/api/finanzas/dashboard')
      .then(res => setCitasHoy(res.data?.total_citas_hoy || 0))
      .catch(() => {});
  }, []);

  const handleLogout = async () => {
    const refreshToken = localStorage.getItem('refresh_token');
    try {
      if (refreshToken) {
        await api.post('/api/auth/logout', { refresh_token: refreshToken });
      }
    } catch { /* Silencioso */ }
    localStorage.removeItem('token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('username');
    navigate('/');
  };

  const isActive = (path: string) => {
    if (path === '/admin') return location.pathname === '/admin';
    return location.pathname.startsWith(path);
  };

  return (
    <div className="min-h-screen text-white relative">
      {/* Full-page animated blobs */}
      <AdminBlobs />

      {/* Background gradient */}
      <div className="fixed inset-0 bg-gradient-to-br from-[#06040a] via-[#0b0812] to-[#100c18] -z-10" />

      {/* Mobile header */}
      <div className="lg:hidden flex items-center justify-between px-4 h-14 bg-[#0b0812]/95 backdrop-blur-xl border-b border-salon-gold/10 sticky top-0 z-50">
        <button onClick={() => setSidebarOpen(!sidebarOpen)} className="text-white/70 hover:text-salon-gold transition-colors">
          {sidebarOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
        <div className="flex items-center gap-2">
          <Sparkles size={14} className="text-salon-gold" />
          <span className="font-bold text-sm tracking-tight">Eliza <span className="text-salon-gold">Styles</span></span>
        </div>
        <div className="flex items-center gap-3">
          {citasHoy > 0 && (
            <span className="relative flex items-center gap-1 text-xs text-salon-gold bg-salon-gold/10 px-2 py-1 rounded-full">
              <CalendarDays size={11} /> {citasHoy}
            </span>
          )}
          <button onClick={handleLogout} className="text-white/40 hover:text-salon-pink transition-colors">
            <LogOut size={18} />
          </button>
        </div>
      </div>

      <div className="flex relative z-10">
        {/* Sidebar */}
        <aside className={`
          fixed lg:sticky lg:top-0 inset-y-0 left-0 z-40
          bg-[#0a0812]/80 backdrop-blur-xl
          border-r border-white/[0.06]
          transform transition-all duration-300 ease-out
          flex flex-col
          ${collapsed ? 'w-[4.5rem]' : 'w-[17rem]'}
          ${sidebarOpen ? 'translate-x-0 shadow-2xl shadow-black/60' : '-translate-x-full'}
          lg:translate-x-0 lg:h-screen
        `}>

          {/* ── Brand ── */}
          <div className="relative z-10 px-4 pt-5 pb-4 flex-shrink-0">
            {/* Ambient glow */}
            <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-40 h-40 bg-salon-gold/10 rounded-full blur-[60px] pointer-events-none" />
            <div className="absolute top-4 right-4 w-20 h-20 bg-pink-500/8 rounded-full blur-[40px] pointer-events-none" />

            <button
              onClick={() => setCollapsed(c => !c)}
              className="hidden lg:flex absolute top-3 -right-3 w-6 h-6 rounded-full bg-white/10 border border-white/10 items-center justify-center text-white/40 hover:text-white hover:bg-white/20 transition-all z-10"
            >
              {collapsed ? <ChevronRight size={12} /> : <ChevronLeft size={12} />}
            </button>

            <div className="flex justify-center relative">
              <img
                src={logoImg}
                alt="Eliza Styles"
                className={`object-contain drop-shadow-[0_0_35px_rgba(212,168,67,0.25)] transition-all duration-300 ${
                  collapsed ? 'w-10 h-10' : 'w-28 h-28'
                }`}
              />
            </div>

            {!collapsed && (
              <div className="text-center mt-2">
                <p className="text-sm font-bold tracking-tight bg-gradient-to-r from-salon-gold via-amber-300 to-salon-gold bg-clip-text text-transparent">
                  Eliza Styles
                </p>
                <p className="text-[10px] text-white/25 tracking-[0.2em] uppercase mt-0.5">
                  Administración
                </p>
              </div>
            )}

            {/* Divider */}
            <div className={`mt-4 border-t border-white/[0.05] ${collapsed ? 'mx-1' : 'mx-2'}`} />
          </div>

          {/* ── Navigation ── */}
          <nav className="relative z-10 flex-1 px-2.5 py-2 space-y-3 overflow-y-auto scrollbar-thin">
            {navSections.map((section) => {
              const sectionActive = section.items.some(item => isActive(item.path));
              const sectionColor = section.color;

              return (
                <div key={section.title} className="space-y-0.5">
                  {/* Section header */}
                  {!collapsed && (
                    <div className="flex items-center gap-2 px-3 pt-1 pb-1.5">
                      <span
                        className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                        style={{ backgroundColor: sectionColor }}
                      />
                      <span
                        className="text-[10px] uppercase tracking-[0.15em] font-semibold"
                        style={{ color: `${sectionColor}99` }}
                      >
                        {section.title}
                      </span>
                      {sectionActive && (
                        <span
                          className="ml-auto w-1 h-1 rounded-full"
                          style={{ backgroundColor: sectionColor }}
                        />
                      )}
                    </div>
                  )}

                  {/* Section items */}
                  {section.items.map((item) => {
                    const Icon = item.icon;
                    const active = isActive(item.path);

                    return (
                      <Link
                        key={item.path}
                        to={item.path}
                        title={collapsed ? item.label : undefined}
                        onClick={() => setSidebarOpen(false)}
                        className={`group flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 relative overflow-hidden ${
                          collapsed ? 'justify-center px-2' : ''
                        } ${
                          active
                            ? 'text-white'
                            : 'text-white/55 hover:text-white/85 hover:bg-white/[0.04]'
                        }`}
                      >
                        {/* Active background glow */}
                        {active && (
                          <>
                            <div
                              className="absolute inset-0 rounded-xl opacity-20"
                              style={{
                                background: `linear-gradient(135deg, ${sectionColor}22, ${sectionColor}08)`,
                              }}
                            />
                            <div
                              className="absolute inset-0 rounded-xl border"
                              style={{ borderColor: `${sectionColor}20` }}
                            />
                            <span
                              className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-r-full"
                              style={{ background: `linear-gradient(to bottom, ${sectionColor}, ${sectionColor}88)` }}
                            />
                          </>
                        )}

                        {/* Icon container */}
                        <div
                          className={`relative flex items-center justify-center w-8 h-8 rounded-lg transition-all duration-200 flex-shrink-0 ${
                            active
                              ? 'bg-white/[0.06]'
                              : 'bg-transparent group-hover:bg-white/[0.03]'
                          }`}
                        >
                          <span
                            style={active ? { color: sectionColor } : undefined}
                            className={
                              active
                                ? 'drop-shadow-[0_0_8px_rgba(212,168,67,0.3)]'
                                : 'text-white/30 group-hover:text-white/55 transition-colors'
                            }
                          >
                            <Icon size={17} />
                          </span>
                        </div>

                        {/* Label */}
                        {!collapsed && (
                          <span className="flex-1 text-[13px] leading-none">
                            {item.label}
                          </span>
                        )}

                        {/* Badge */}
                        {item.badge && (
                          <span
                            className="text-[10px] px-1.5 py-0.5 rounded-full font-semibold flex-shrink-0"
                            style={{
                              backgroundColor: `${sectionColor}18`,
                              color: sectionColor,
                            }}
                          >
                            {item.badge}
                          </span>
                        )}
                      </Link>
                    );
                  })}
                </div>
              );
            })}
          </nav>

          {/* ── Footer: user + logout ── */}
          <div className="relative z-10 flex-shrink-0 border-t border-white/[0.05] p-3">
            <div className={`flex items-center gap-3 px-3 py-2.5 mb-1.5 rounded-xl bg-white/[0.03] border border-white/[0.04] ${collapsed ? 'justify-center' : ''}`}>
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-salon-gold/25 to-pink-500/20 flex items-center justify-center flex-shrink-0 ring-1 ring-salon-gold/20">
                <UserCircle size={15} className="text-salon-gold" />
              </div>
              {!collapsed && (
                <>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold truncate text-white/80">{username}</p>
                    <p className="text-[10px] text-white/25">Administrador</p>
                  </div>
                  <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.5)] animate-pulse" />
                </>
              )}
            </div>
            <button
              onClick={handleLogout}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-white/35 hover:text-red-400 hover:bg-red-500/8 w-full transition-all duration-200 ${collapsed ? 'justify-center' : ''}`}
            >
              <LogOut size={15} />
              {!collapsed && 'Cerrar sesión'}
            </button>
            {!collapsed && (
              <p className="text-center text-[9px] text-white/8 mt-2 tracking-widest uppercase">
                v2.0 · Eliza Styles
              </p>
            )}
          </div>
        </aside>

        {/* Overlay for mobile */}
        {sidebarOpen && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-30 lg:hidden transition-opacity" onClick={() => setSidebarOpen(false)} />
        )}

        {/* Main content */}
        <main className="flex-1 p-5 lg:p-8 h-screen overflow-y-auto">
          <div className="max-w-7xl mx-auto">
            <PageTransition key={location.pathname}>
              <Outlet />
            </PageTransition>
          </div>
        </main>
      </div>
    </div>
  );
}

export default function AdminLayout() {
  return (
    <ToastProvider>
      <AdminLayoutInner />
    </ToastProvider>
  );
}
