import { ReactNode, useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Calendar, 
  Package, 
  Wallet, 
  Users, 
  Scissors, 
  PieChart, 
  LogOut,
  Menu,
  X
} from 'lucide-react';

interface SidebarProps {
  children: ReactNode;
}

const navItems = [
  { path: '/admin', icon: LayoutDashboard, label: 'Dashboard' },
  { path: '/admin/citas', icon: Calendar, label: 'Citas' },
  { path: '/admin/inventario', icon: Package, label: 'Inventario' },
  { path: '/admin/caja', icon: Wallet, label: 'Caja' },
  { path: '/admin/clientes', icon: Users, label: 'Clientes' },
  { path: '/admin/servicios', icon: Scissors, label: 'Servicios' },
  { path: '/admin/reportes', icon: PieChart, label: 'Reportes' },
];

export default function AdminLayout({ children }: SidebarProps) {
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem('isAuthenticated');
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-salon-bg flex overflow-hidden">
      {/* Overlay for mobile */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-30 lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside 
        id="admin-sidebar" 
        className={`fixed inset-y-0 left-0 w-64 bg-white border-r border-salon-pink/30 z-40 transform transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0 ${
          isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        } flex flex-col`}
      >
        <div className="p-8 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-serif text-salon-gold tracking-tighter">Elegancia</h1>
            <p className="text-[10px] uppercase tracking-widest text-gray-400 mt-1">Management System</p>
          </div>
          <button 
            className="lg:hidden p-2 text-gray-400 hover:text-salon-gold transition-colors"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <X size={20} />
          </button>
        </div>
        
        <nav className="flex-1 px-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/admin'}
              onClick={() => setIsMobileMenuOpen(false)}
              className={({ isActive }) => 
                `flex items-center gap-3 px-4 py-3 rounded-2xl text-[13px] font-medium transition-all ${
                  isActive 
                  ? 'bg-salon-pink/20 text-salon-dark shadow-sm' 
                  : 'text-gray-500 hover:bg-gray-50 hover:text-salon-dark'
                }`
              }
            >
              <item.icon size={18} className="shrink-0" />
              <span className="truncate">{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="p-6">
          <div className="bg-salon-lavender/10 p-4 rounded-2xl border border-salon-lavender/20 hidden lg:block">
            <p className="text-[10px] text-salon-lavender font-bold uppercase mb-1">Tip del día</p>
            <p className="text-[11px] text-gray-500 leading-relaxed">Recuerda dar de baja manual las botellas de tinte al abrirlas.</p>
          </div>
          <button 
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 w-full rounded-2xl text-xs font-bold text-gray-400 hover:text-salon-error hover:bg-red-50 transition-all mt-4"
          >
            <LogOut size={16} />
            <span className="truncate">Cerrar Sesión</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        {/* Header */}
        <header className="h-20 bg-white/50 backdrop-blur-md border-b border-salon-pink/30 px-6 lg:px-8 flex items-center justify-between sticky top-0 z-30 shrink-0">
          <div className="flex items-center gap-4">
            <button 
              className="lg:hidden p-2 bg-white rounded-xl shadow-sm border border-salon-pink/20 text-salon-gold"
              onClick={() => setIsMobileMenuOpen(true)}
            >
              <Menu size={20} />
            </button>
            <div>
              <h2 className="text-lg font-serif text-gray-800">Panel de Control</h2>
              <p className="text-[10px] text-gray-400 uppercase tracking-widest font-bold">Resumen Diario</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right hidden md:block">
              <p className="text-[10px] font-bold text-salon-dark uppercase tracking-wide">Estado de Caja</p>
              <p className="text-[10px] text-green-500 font-bold uppercase flex items-center gap-1 justify-end">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span> Abierta
              </p>
            </div>
            <div className="w-10 h-10 rounded-full bg-salon-cream border border-salon-pink flex items-center justify-center text-salon-gold font-bold shadow-sm">
              A
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-auto p-4 lg:p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
