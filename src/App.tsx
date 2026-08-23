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
import Inventario from '@/pages/Inventario'
import ProgramacionRondas from '@/pages/ProgramacionRondas'
import Vencimientos from '@/pages/Vencimientos'
import SolicitudesCompra from '@/pages/SolicitudesCompra'
import Compromisos from '@/pages/Compromisos'

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
            <Route
              path="inspecciones"
              element={
                <ProtectedRoute modulo="historial">
                  <Historial />
                </ProtectedRoute>
              }
            />
            <Route
              path="estadisticas"
              element={
                <ProtectedRoute modulo="estadisticas">
                  <Estadisticas />
                </ProtectedRoute>
              }
            />
            <Route
              path="informe-ejecutivo"
              element={
                <ProtectedRoute ocultarAEncuestador modulo="informe-ejecutivo">
                  <InformeEjecutivo />
                </ProtectedRoute>
              }
            />
            <Route
              path="infografia"
              element={
                <ProtectedRoute modulo="infografia">
                  <Infografia />
                </ProtectedRoute>
              }
            />
            <Route
              path="programacion"
              element={
                <ProtectedRoute modulo="programacion">
                  <ProgramacionRondas />
                </ProtectedRoute>
              }
            />
            <Route
              path="vencimientos"
              element={
                <ProtectedRoute modulo="vencimientos">
                  <Vencimientos />
                </ProtectedRoute>
              }
            />
            <Route
              path="inventario"
              element={
                <ProtectedRoute modulo="inventario">
                  <Inventario />
                </ProtectedRoute>
              }
            />
            <Route
              path="solicitudes-compra"
              element={
                <ProtectedRoute modulo="solicitudes-compra">
                  <SolicitudesCompra />
                </ProtectedRoute>
              }
            />
            <Route
              path="compromisos"
              element={
                <ProtectedRoute modulo="compromisos">
                  <Compromisos />
                </ProtectedRoute>
              }
            />
            <Route
              path="inspecciones/nueva"
              element={
                <ProtectedRoute modulo="nueva-inspeccion">
                  <SeleccionarTipoInspeccion />
                </ProtectedRoute>
              }
            />
            <Route
              path="inspecciones/nueva/:codigo"
              element={
                <ProtectedRoute modulo="nueva-inspeccion">
                  <FormularioInspeccion />
                </ProtectedRoute>
              }
            />
            <Route
              path="inspecciones/:id/editar"
              element={
                <ProtectedRoute modulo="historial">
                  <FormularioInspeccion />
                </ProtectedRoute>
              }
            />
            <Route
              path="inspecciones/:id"
              element={
                <ProtectedRoute modulo="historial">
                  <DetalleInspeccion />
                </ProtectedRoute>
              }
            />
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
          </Route>
        </Routes>
      </AuthProvider>
    </HashRouter>
  )
}
