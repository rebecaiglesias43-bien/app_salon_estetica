/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { JSX } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import LandingPage from './pages/public/LandingPage.tsx';
import LoginPage from './pages/LoginPage.tsx';
import AdminLayout from './components/layout/AdminLayout.tsx';
import AdminDashboard from './pages/admin/AdminDashboard.tsx';
import Citas from './pages/admin/Citas.tsx';
import Inventario from './pages/admin/Inventario.tsx';
import Caja from './pages/admin/Caja.tsx';
import ClientesCatalog from './pages/admin/ClientesCatalog.tsx';
import ServiciosAdmin from './pages/admin/ServiciosAdmin.tsx';
import Reportes from './pages/admin/Reportes.tsx';

/**
 * Route protection for Admin area
 */
interface PrivateRouteProps {
  children: JSX.Element;
}

const PrivateRoute = ({ children }: PrivateRouteProps) => {
  const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';
  return isAuthenticated ? (
    <AdminLayout>{children}</AdminLayout>
  ) : (
    <Navigate to="/login" replace />
  );
};

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />

        {/* Protected Admin Routes */}
        <Route
          path="/admin"
          element={
            <PrivateRoute>
              <AdminDashboard />
            </PrivateRoute>
          }
        />
        <Route
          path="/admin/citas"
          element={
            <PrivateRoute>
              <Citas />
            </PrivateRoute>
          }
        />
        <Route
          path="/admin/inventario"
          element={
            <PrivateRoute>
              <Inventario />
            </PrivateRoute>
          }
        />
        <Route
          path="/admin/caja"
          element={
            <PrivateRoute>
              <Caja />
            </PrivateRoute>
          }
        />
        <Route
          path="/admin/clientes"
          element={
            <PrivateRoute>
              <ClientesCatalog />
            </PrivateRoute>
          }
        />
        <Route
          path="/admin/servicios"
          element={
            <PrivateRoute>
              <ServiciosAdmin />
            </PrivateRoute>
          }
        />
        <Route
          path="/admin/reportes"
          element={
            <PrivateRoute>
              <Reportes />
            </PrivateRoute>
          }
        />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

