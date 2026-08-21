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
import Estadisticas from '@/pages/Estadisticas'
import InformeEjecutivo from '@/pages/InformeEjecutivo'
import Infografia from '@/pages/Infografia'
import Usuarios from '@/pages/admin/Usuarios'
import Catalogos from '@/pages/admin/Catalogos'
import GestionEncuestas from '@/pages/admin/GestionEncuestas'
import EditorEncuesta from '@/pages/admin/EditorEncuesta'
import Inventario from '@/pages/admin/Inventario'
import ProgramacionRondas from '@/pages/ProgramacionRondas'

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
            <Route path="estadisticas" element={<Estadisticas />} />
            <Route
              path="informe-ejecutivo"
              element={
                <ProtectedRoute ocultarAEncuestador>
                  <InformeEjecutivo />
                </ProtectedRoute>
              }
            />
            <Route path="infografia" element={<Infografia />} />
            <Route path="programacion" element={<ProgramacionRondas />} />
            <Route path="inspecciones/nueva" element={<SeleccionarTipoInspeccion />} />
            <Route path="inspecciones/nueva/:codigo" element={<FormularioInspeccion />} />
            <Route path="inspecciones/:id/editar" element={<FormularioInspeccion />} />
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
            <Route
              path="admin/encuestas"
              element={
                <ProtectedRoute soloAdmin>
                  <GestionEncuestas />
                </ProtectedRoute>
              }
            />
            <Route
              path="admin/encuestas/:codigo"
              element={
                <ProtectedRoute soloAdmin>
                  <EditorEncuesta />
                </ProtectedRoute>
              }
            />
            <Route
              path="admin/inventario"
              element={
                <ProtectedRoute soloAdmin>
                  <Inventario />
                </ProtectedRoute>
              }
            />
          </Route>
        </Routes>
      </AuthProvider>
    </HashRouter>
  )
}
