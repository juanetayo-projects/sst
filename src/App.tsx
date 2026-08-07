import { HashRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from '@/lib/auth'
import { ProtectedRoute } from '@/components/ProtectedRoute'
import { Layout } from '@/components/layout/Layout'
import Login from '@/pages/Login'
import ResetPassword from '@/pages/ResetPassword'
import DashboardPage from '@/pages/DashboardPage'
import SeleccionarTipoInspeccion from '@/pages/inspecciones/SeleccionarTipoInspeccion'
import FormularioInspeccion from '@/pages/inspecciones/FormularioInspeccion'
import Historial from '@/pages/inspecciones/Historial'
import DetalleInspeccion from '@/pages/inspecciones/DetalleInspeccion'
import Usuarios from '@/pages/admin/Usuarios'
import Catalogos from '@/pages/admin/Catalogos'

export default function App() {
  return (
    <HashRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route index element={<DashboardPage />} />
            <Route path="inspecciones" element={<Historial />} />
            <Route path="inspecciones/nueva" element={<SeleccionarTipoInspeccion />} />
            <Route path="inspecciones/nueva/:codigo" element={<FormularioInspeccion />} />
            <Route path="inspecciones/:id" element={<DetalleInspeccion />} />
            <Route
              path="admin/usuarios"
              element={
                <ProtectedRoute soloAdmin>
                  <Usuarios />
                </ProtectedRoute>
              }
            />
            <Route
              path="admin/catalogos"
              element={
                <ProtectedRoute soloAdmin>
                  <Catalogos />
                </ProtectedRoute>
              }
            />
          </Route>
        </Routes>
      </AuthProvider>
    </HashRouter>
  )
}
