import { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import LandingPage from './pages/public/LandingPage';
import LoginPage from './pages/LoginPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import AdminLayout from './components/layout/AdminLayout';

// Carga diferida (lazy) de páginas del admin para reducir bundle inicial
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'));
const Citas = lazy(() => import('./pages/admin/Citas'));
const ClientesCatalog = lazy(() => import('./pages/admin/ClientesCatalog'));
const ServiciosAdmin = lazy(() => import('./pages/admin/ServiciosAdmin'));
const Inventario = lazy(() => import('./pages/admin/Inventario'));
const Caja = lazy(() => import('./pages/admin/Caja'));
const Reportes = lazy(() => import('./pages/admin/Reportes'));
const Proveedores = lazy(() => import('./pages/admin/Proveedores'));
const Compras = lazy(() => import('./pages/admin/Compras'));
const ServicioProductos = lazy(() => import('./pages/admin/ServicioProductos'));
const Usuarios = lazy(() => import('./pages/admin/Usuarios'));
const Facturas = lazy(() => import('./pages/admin/Facturas'));
const MovimientosInventario = lazy(() => import('./pages/admin/MovimientosInventario'));
const ProveedorProductos = lazy(() => import('./pages/admin/ProveedorProductos'));
const CorteDelDia = lazy(() => import('./pages/admin/CorteDelDia'));
const Devoluciones = lazy(() => import('./pages/admin/Devoluciones'));

function AdminFallback() {
  return (
    <div className="min-h-screen bg-[#120c1a] flex items-center justify-center">
      <div className="text-center">
        <div className="w-10 h-10 border-2 border-salon-gold/30 border-t-salon-gold rounded-full animate-spin mx-auto mb-4" />
        <p className="text-white/30 text-sm">Cargando...</p>
      </div>
    </div>
  );
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />
      <Route path="/admin" element={<AdminLayout />}>
        <Route index element={<Suspense fallback={<AdminFallback />}><AdminDashboard /></Suspense>} />
        <Route path="citas" element={<Suspense fallback={<AdminFallback />}><Citas /></Suspense>} />
        <Route path="clientes" element={<Suspense fallback={<AdminFallback />}><ClientesCatalog /></Suspense>} />
        <Route path="servicios" element={<Suspense fallback={<AdminFallback />}><ServiciosAdmin /></Suspense>} />
        <Route path="inventario" element={<Suspense fallback={<AdminFallback />}><Inventario /></Suspense>} />
        <Route path="caja" element={<Suspense fallback={<AdminFallback />}><Caja /></Suspense>} />
        <Route path="reportes" element={<Suspense fallback={<AdminFallback />}><Reportes /></Suspense>} />
        <Route path="proveedores" element={<Suspense fallback={<AdminFallback />}><Proveedores /></Suspense>} />
        <Route path="compras" element={<Suspense fallback={<AdminFallback />}><Compras /></Suspense>} />
        <Route path="servicio-productos" element={<Suspense fallback={<AdminFallback />}><ServicioProductos /></Suspense>} />
        <Route path="usuarios" element={<Suspense fallback={<AdminFallback />}><Usuarios /></Suspense>} />
        <Route path="facturas" element={<Suspense fallback={<AdminFallback />}><Facturas /></Suspense>} />
        <Route path="movimientos-inventario" element={<Suspense fallback={<AdminFallback />}><MovimientosInventario /></Suspense>} />
        <Route path="proveedor-productos" element={<Suspense fallback={<AdminFallback />}><ProveedorProductos /></Suspense>} />
        <Route path="corte-del-dia" element={<Suspense fallback={<AdminFallback />}><CorteDelDia /></Suspense>} />
        <Route path="devoluciones" element={<Suspense fallback={<AdminFallback />}><Devoluciones /></Suspense>} />
      </Route>
    </Routes>
  );
}

export default App;
