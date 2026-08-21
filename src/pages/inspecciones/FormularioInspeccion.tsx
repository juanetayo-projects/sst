import { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/auth";
import {
  cargarEstructuraInspeccion,
  categoriaEsVisible,
  mapearCierreAColumnas,
  type EstructuraInspeccion,
} from "@/domain/inspecciones";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Obligatorio } from "@/components/ui/obligatorio";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { MensajeDialog, type Mensaje } from "@/components/ui/mensaje-dialog";
import { CampoDinamico } from "@/components/inspecciones/CampoDinamico";
import { CamposExtintor } from "@/components/inspecciones/CamposExtintor";
import { BloqueCategoria } from "@/components/inspecciones/BloqueCategoria";
import { NavSecciones, type Seccion } from "@/components/inspecciones/NavSecciones";
import { PanelInfograficoSST } from "@/components/inspecciones/PanelInfograficoSST";
import { EvidenciasInspeccion } from "@/components/inspecciones/EvidenciasInspeccion";
import { TablaSolicitudCompra, type SolicitudLocal } from "@/components/inspecciones/TablaSolicitudCompra";
import { TablaCompromisos, type CompromisoLocal } from "@/components/inspecciones/TablaCompromisos";
import { obtenerCategoriaSST, type ColorBloque } from "@/domain/categoriasSST";

export default function FormularioInspeccion() {
  const { codigo, id: idInspeccion } = useParams<{ codigo?: string; id?: string }>();
  const navigate = useNavigate();
  const { session } = useAuth();
  const modoEdicion = Boolean(idInspeccion);

  const [cargando, setCargando] = useState(true);
  const [estructura, setEstructura] = useState<EstructuraInspeccion | null>(
    null,
  );
  const [errorCarga, setErrorCarga] = useState<string | null>(null);
  const [empresas, setEmpresas] = useState<string[]>([]);
  const [sedes, setSedes] = useState<string[]>([]);
  const [estadoOriginal, setEstadoOriginal] = useState<"borrador" | "completada">("borrador");

  const [empresa, setEmpresa] = useState("");
  const [sede, setSede] = useState("");
  const [lugar, setLugar] = useState("");
  const [fecha, setFecha] = useState(() =>
    new Date().toISOString().slice(0, 10),
  );
  const [respuestas, setRespuestas] = useState<Record<string, string>>({});
  const [faltantes, setFaltantes] = useState<Set<string>>(new Set());

  // Id generado en el cliente para una inspección nueva, para poder subir evidencias
  // a Storage desde antes de guardar (se usa como `id` explícito en el insert final).
  const [idNuevo] = useState(() => crypto.randomUUID());
  const idActual = modoEdicion && idInspeccion ? idInspeccion : idNuevo;
  const [evidenciaUrls, setEvidenciaUrls] = useState<string[]>([]);
  const [solicitudes, setSolicitudes] = useState<SolicitudLocal[]>([]);
  const [compromisos, setCompromisos] = useState<CompromisoLocal[]>([]);

  const [guardando, setGuardando] = useState<"borrador" | "completada" | null>(
    null,
  );
  const [mensaje, setMensaje] = useState<Mensaje>(null);

  useEffect(() => {
    if (modoEdicion) {
      if (!idInspeccion) return;
      setCargando(true);
      setErrorCarga(null);
      Promise.resolve(
        supabase
          .from("inspecciones")
          .select("empresa,sede,lugar,fecha_inspeccion,estado,evidencia_urls,tipos_inspeccion(codigo)")
          .eq("id", idInspeccion)
          .single(),
      )
        .then(async ({ data: insp, error: errorInsp }) => {
          if (errorInsp || !insp) {
            setErrorCarga("No se encontró la inspección.");
            setCargando(false);
            return;
          }
          const tipoCodigo = (insp as unknown as { tipos_inspeccion: { codigo: string } }).tipos_inspeccion.codigo;
          const [est, empresasRes, sedesRes, respuestasRes, solicitudesRes, compromisosRes] = await Promise.all([
            cargarEstructuraInspeccion(tipoCodigo),
            supabase.from("empresas").select("nombre").eq("activo", true).order("orden"),
            supabase.from("sedes").select("nombre").eq("activo", true).order("orden"),
            supabase.from("respuestas_inspeccion").select("pregunta_id,valor").eq("inspeccion_id", idInspeccion),
            supabase.from("solicitudes_compra_item").select("id,fecha,tipo_elemento,cantidad,observacion").eq("inspeccion_id", idInspeccion),
            supabase.from("compromisos_ronda").select("id,descripcion,responsable,fecha_compromiso").eq("inspeccion_id", idInspeccion),
          ]);
          setEstructura(est);
          setEmpresas((empresasRes.data ?? []).map((e) => e.nombre));
          setSedes((sedesRes.data ?? []).map((s) => s.nombre));
          setEmpresa(insp.empresa ?? "");
          setSede(insp.sede ?? "");
          setLugar(insp.lugar ?? "");
          setFecha(insp.fecha_inspeccion);
          setEstadoOriginal(insp.estado === "completada" ? "completada" : "borrador");
          setEvidenciaUrls(insp.evidencia_urls ?? []);
          setSolicitudes(
            (solicitudesRes.data ?? []).map((s) => ({
              id: s.id,
              fecha: s.fecha,
              tipo_elemento: s.tipo_elemento,
              cantidad: s.cantidad,
              observacion: s.observacion ?? "",
            })),
          );
          setCompromisos(
            (compromisosRes.data ?? []).map((c) => ({
              id: c.id,
              descripcion: c.descripcion,
              responsable: c.responsable ?? "",
              fecha_compromiso: c.fecha_compromiso,
            })),
          );
          const mapa: Record<string, string> = {};
          for (const f of respuestasRes.data ?? []) mapa[f.pregunta_id] = f.valor ?? "";
          setRespuestas(mapa);
          setCargando(false);
        })
        .catch((e: Error) => {
          setErrorCarga(e.message);
          setCargando(false);
        });
      return;
    }

    if (!codigo) return;
    setCargando(true);
    setErrorCarga(null);
    Promise.all([
      cargarEstructuraInspeccion(codigo),
      supabase
        .from("empresas")
        .select("nombre")
        .eq("activo", true)
        .order("orden"),
      supabase.from("sedes").select("nombre").eq("activo", true).order("orden"),
    ])
      .then(([est, empresasRes, sedesRes]) => {
        setEstructura(est);
        setEmpresas((empresasRes.data ?? []).map((e) => e.nombre));
        setSedes((sedesRes.data ?? []).map((s) => s.nombre));
      })
      .catch((e: Error) => setErrorCarga(e.message))
      .finally(() => setCargando(false));
  }, [codigo, idInspeccion, modoEdicion]);

  function cambiarRespuesta(preguntaId: string, valor: string) {
    setRespuestas((prev) => ({ ...prev, [preguntaId]: valor }));
    setFaltantes((prev) => {
      if (!prev.has(preguntaId)) return prev;
      const copia = new Set(prev);
      copia.delete(preguntaId);
      return copia;
    });
  }

  async function guardar(estado: "borrador" | "completada") {
    if (!estructura || !session) return;

    const categoriasVisibles = estructura.categorias.filter((c) =>
      categoriaEsVisible(c, estructura.encabezado, respuestas),
    );
    const preguntasVisibles = [
      ...estructura.encabezado,
      ...categoriasVisibles.flatMap(
        (c) => estructura.porCategoria.get(c.id) ?? [],
      ),
      ...estructura.cierre,
    ];

    const nuevosFaltantes = new Set<string>();
    if (estado === "completada") {
      if (!empresa) nuevosFaltantes.add("__empresa");
      if (!sede) nuevosFaltantes.add("__sede");
      if (!lugar.trim()) nuevosFaltantes.add("__lugar");
      for (const p of preguntasVisibles) {
        if (p.obligatoria && !respuestas[p.id]) nuevosFaltantes.add(p.id);
      }
    }
    setFaltantes(nuevosFaltantes);
    if (nuevosFaltantes.size > 0) {
      setMensaje({
        tipo: "error",
        titulo: "Faltan campos obligatorios",
        texto:
          "Completa los campos marcados en rojo antes de finalizar la inspección.",
      });
      return;
    }

    setGuardando(estado);
    const { fortalezas, hallazgos, urgente, responsable } =
      mapearCierreAColumnas(estructura.cierre, respuestas);

    const filasRespuestas = (idInsp: string) =>
      preguntasVisibles
        .filter((p) => respuestas[p.id])
        .map((p) => ({
          inspeccion_id: idInsp,
          pregunta_id: p.id,
          valor: respuestas[p.id],
        }));

    // Solicitudes de compra y compromisos se reescriben igual que las respuestas (borrar-e-insertar).
    async function persistirItemsSecundarios(idInsp: string): Promise<string | null> {
      const { error: errorBorradoSolicitudes } = await supabase.from("solicitudes_compra_item").delete().eq("inspeccion_id", idInsp);
      if (errorBorradoSolicitudes) return errorBorradoSolicitudes.message;
      if (solicitudes.length > 0) {
        const { error } = await supabase.from("solicitudes_compra_item").insert(
          solicitudes
            .filter((s) => s.tipo_elemento.trim())
            .map((s) => ({
              inspeccion_id: idInsp,
              fecha: s.fecha,
              tipo_elemento: s.tipo_elemento,
              cantidad: s.cantidad,
              observacion: s.observacion || null,
              created_by: session!.user.id,
            })),
        );
        if (error) return error.message;
      }

      const { error: errorBorradoCompromisos } = await supabase.from("compromisos_ronda").delete().eq("inspeccion_id", idInsp);
      if (errorBorradoCompromisos) return errorBorradoCompromisos.message;
      if (compromisos.length > 0) {
        const { error } = await supabase.from("compromisos_ronda").insert(
          compromisos
            .filter((c) => c.descripcion.trim())
            .map((c) => ({
              inspeccion_id: idInsp,
              descripcion: c.descripcion,
              responsable: c.responsable || null,
              fecha_compromiso: c.fecha_compromiso,
              created_by: session!.user.id,
            })),
        );
        if (error) return error.message;
      }
      return null;
    }

    if (modoEdicion && idInspeccion) {
      // Las respuestas se reescriben mientras la inspección conserva su estado original,
      // porque las políticas RLS de un inspector solo permiten tocar respuestas de una inspección en 'borrador'.
      const { error: errorBorrado } = await supabase
        .from("respuestas_inspeccion")
        .delete()
        .eq("inspeccion_id", idInspeccion);
      if (errorBorrado) {
        setGuardando(null);
        setMensaje({ tipo: "error", titulo: "No se pudo guardar", texto: errorBorrado.message });
        return;
      }

      const filas = filasRespuestas(idInspeccion);
      if (filas.length > 0) {
        const { error: errorRespuestas } = await supabase.from("respuestas_inspeccion").insert(filas);
        if (errorRespuestas) {
          setGuardando(null);
          setMensaje({
            tipo: "error",
            titulo: "Inspección actualizada con errores",
            texto: `No se pudieron guardar todas las respuestas: ${errorRespuestas.message}`,
          });
          return;
        }
      }

      const { error: errorUpdate } = await supabase
        .from("inspecciones")
        .update({
          empresa: empresa || null,
          sede: sede || null,
          lugar: lugar || null,
          fecha_inspeccion: fecha,
          estado,
          fortalezas,
          hallazgos,
          urgente,
          responsable,
          evidencia_urls: evidenciaUrls,
        })
        .eq("id", idInspeccion);

      if (errorUpdate) {
        setGuardando(null);
        setMensaje({ tipo: "error", titulo: "No se pudo guardar", texto: errorUpdate.message });
        return;
      }

      const errorSecundarios = await persistirItemsSecundarios(idInspeccion);
      if (errorSecundarios) {
        setGuardando(null);
        setMensaje({
          tipo: "error",
          titulo: "Inspección actualizada con errores",
          texto: `No se pudieron guardar las solicitudes/compromisos: ${errorSecundarios}`,
        });
        return;
      }

      setGuardando(null);
      setMensaje({
        tipo: "exito",
        titulo: "Inspección actualizada",
        texto: "Los cambios se guardaron correctamente.",
      });
      setTimeout(() => navigate(`/inspecciones/${idInspeccion}`), 1200);
      return;
    }

    const { data: inspeccion, error: errorInspeccion } = await supabase
      .from("inspecciones")
      .insert({
        id: idNuevo,
        tipo_inspeccion_id: estructura.tipo.id,
        inspector_id: session.user.id,
        empresa: empresa || null,
        sede: sede || null,
        lugar: lugar || null,
        fecha_inspeccion: fecha,
        estado,
        fortalezas,
        hallazgos,
        urgente,
        responsable,
        evidencia_urls: evidenciaUrls,
      })
      .select("id")
      .single();

    if (errorInspeccion || !inspeccion) {
      setGuardando(null);
      setMensaje({
        tipo: "error",
        titulo: "No se pudo guardar",
        texto: errorInspeccion?.message ?? "Intenta nuevamente.",
      });
      return;
    }

    const filas = filasRespuestas(inspeccion.id);

    if (filas.length > 0) {
      const { error: errorRespuestas } = await supabase
        .from("respuestas_inspeccion")
        .insert(filas);
      if (errorRespuestas) {
        setGuardando(null);
        setMensaje({
          tipo: "error",
          titulo: "Inspección creada con errores",
          texto: `No se pudieron guardar todas las respuestas: ${errorRespuestas.message}`,
        });
        return;
      }
    }

    const errorSecundarios = await persistirItemsSecundarios(inspeccion.id);
    if (errorSecundarios) {
      setGuardando(null);
      setMensaje({
        tipo: "error",
        titulo: "Inspección creada con errores",
        texto: `No se pudieron guardar las solicitudes/compromisos: ${errorSecundarios}`,
      });
      return;
    }

    setGuardando(null);
    setMensaje({
      tipo: "exito",
      titulo:
        estado === "borrador" ? "Borrador guardado" : "Inspección finalizada",
      texto:
        estado === "borrador"
          ? "Puedes continuar diligenciándola más tarde."
          : "La inspección se registró correctamente.",
    });
    setTimeout(() => navigate("/"), 1200);
  }

  if (cargando) {
    return (
      <div className="p-8 text-center text-sm text-muted-foreground">
        Cargando formulario…
      </div>
    );
  }
  if (errorCarga || !estructura) {
    return (
      <div className="p-8 text-center text-sm text-[var(--error)]">
        {errorCarga ?? "No se encontró el tipo de inspección."}
      </div>
    );
  }

  const categoriasVisibles = estructura.categorias.filter((c) =>
    categoriaEsVisible(c, estructura.encabezado, respuestas),
  );
  const categoriaSST = obtenerCategoriaSST(estructura.tipo.codigo);
  const secciones: Seccion[] = [
    ...categoriasVisibles.map((c) => ({ id: `categoria-${c.id}`, nombre: c.nombre, color: c.color as ColorBloque })),
    ...(estructura.cierre.length > 0 ? [{ id: "cierre", nombre: "Cierre", color: "azul" as ColorBloque }] : []),
  ];

  return (
    <div className="mx-auto max-w-6xl pb-10">
      <div className="lg:grid lg:grid-cols-[1fr_400px] lg:items-start lg:gap-6">
        {categoriaSST && (
          <div className="hidden lg:sticky lg:top-20 lg:order-last lg:block">
            <PanelInfograficoSST categoria={categoriaSST} />
          </div>
        )}
        <div className="space-y-4">
          {categoriaSST && (
            <img
              src={`${import.meta.env.BASE_URL}images/encabezados/${categoriaSST.imagenEncabezado}`}
              alt={`Encabezado — ${categoriaSST.nombre}`}
              className="w-full rounded-xl shadow-relieve"
            />
          )}

          <div className="flex items-center gap-2">
            <Link
              to={modoEdicion ? `/inspecciones/${idInspeccion}` : "/inspecciones/nueva"}
              className="rounded-md p-1.5 text-muted-foreground hover:bg-accent"
            >
              <ArrowLeft className="size-4" />
            </Link>
            <h1 className="text-base font-semibold text-[var(--cac-azul)]">
              {estructura.tipo.nombre}
              {modoEdicion && <span className="ml-2 text-xs font-normal text-muted-foreground">(editando)</span>}
            </h1>
          </div>

          <NavSecciones secciones={secciones} />

          <Card>
            <CardContent className="grid grid-cols-1 gap-3 p-4 sm:grid-cols-2 md:grid-cols-4">
              <div className="space-y-1.5">
                <Label>
                  Empresa
                  <Obligatorio />
                </Label>
                <Select value={empresa} onValueChange={setEmpresa}>
                  <SelectTrigger aria-invalid={faltantes.has("__empresa")}>
                    <SelectValue placeholder="Selecciona…" />
                  </SelectTrigger>
                  <SelectContent>
                    {empresas.map((e) => (
                      <SelectItem key={e} value={e}>
                        {e}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>
                  Sede
                  <Obligatorio />
                </Label>
                <Select value={sede} onValueChange={setSede}>
                  <SelectTrigger aria-invalid={faltantes.has("__sede")}>
                    <SelectValue placeholder="Selecciona…" />
                  </SelectTrigger>
                  <SelectContent>
                    {sedes.map((s) => (
                      <SelectItem key={s} value={s}>
                        {s}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>
                  Lugar
                  <Obligatorio />
                </Label>
                <Input
                  value={lugar}
                  onChange={(e) => setLugar(e.target.value)}
                  aria-invalid={faltantes.has("__lugar")}
                />
              </div>
              <div className="space-y-1.5">
                <Label>
                  Fecha
                  <Obligatorio />
                </Label>
                <Input
                  type="date"
                  value={fecha}
                  onChange={(e) => setFecha(e.target.value)}
                />
              </div>
              {estructura.tipo.codigo === "extintores" &&
              estructura.encabezado.find((p) => p.texto === "Código del Extintor") &&
              estructura.encabezado.find((p) => p.texto === "Tipo de Extintor") &&
              estructura.encabezado.find((p) => p.texto === "Capacidad del extintor") ? (
                <CamposExtintor
                  preguntaCodigo={estructura.encabezado.find((p) => p.texto === "Código del Extintor")!}
                  preguntaTipo={estructura.encabezado.find((p) => p.texto === "Tipo de Extintor")!}
                  preguntaCapacidad={estructura.encabezado.find((p) => p.texto === "Capacidad del extintor")!}
                  sede={sede}
                  respuestas={respuestas}
                  onChange={cambiarRespuesta}
                  faltantes={faltantes}
                />
              ) : (
                estructura.encabezado.map((p) => (
                  <CampoDinamico
                    key={p.id}
                    pregunta={p}
                    tipoRespuesta={estructura.tipo.tipo_respuesta}
                    valor={respuestas[p.id] ?? ""}
                    onChange={(v) => cambiarRespuesta(p.id, v)}
                    invalido={faltantes.has(p.id)}
                  />
                ))
              )}
            </CardContent>
          </Card>

          {categoriasVisibles.map((cat, i) => {
            const siguienteSeccion = secciones[i + 1];
            return (
              <BloqueCategoria
                key={cat.id}
                categoria={cat}
                numero={i + 1}
                preguntas={estructura.porCategoria.get(cat.id) ?? []}
                tipoRespuesta={estructura.tipo.tipo_respuesta}
                respuestas={respuestas}
                faltantes={faltantes}
                onCambiar={cambiarRespuesta}
                siguiente={siguienteSeccion ? { id: siguienteSeccion.id, nombre: siguienteSeccion.nombre } : null}
              />
            );
          })}

          {estructura.cierre.length > 0 && (
            <Card id="cierre" className="scroll-mt-28">
              <CardContent className="grid grid-cols-1 gap-x-6 p-4 md:grid-cols-2">
                <div className="mb-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground md:col-span-2">
                  Cierre de la inspección
                </div>
                {estructura.cierre.map((p) => (
                  <CampoDinamico
                    key={p.id}
                    pregunta={p}
                    tipoRespuesta={estructura.tipo.tipo_respuesta}
                    valor={respuestas[p.id] ?? ""}
                    onChange={(v) => cambiarRespuesta(p.id, v)}
                    invalido={faltantes.has(p.id)}
                  />
                ))}
              </CardContent>
            </Card>
          )}

          <Card>
            <CardContent className="space-y-2 p-4">
              <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Evidencias de soporte</div>
              <EvidenciasInspeccion inspeccionId={idActual} urls={evidenciaUrls} onChange={setEvidenciaUrls} />
            </CardContent>
          </Card>

          <Card>
            <CardContent className="space-y-2 p-4">
              <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Elementos a solicitar a compras</div>
              <TablaSolicitudCompra filas={solicitudes} onChange={setSolicitudes} />
            </CardContent>
          </Card>

          <Card>
            <CardContent className="space-y-2 p-4">
              <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Compromisos de la ronda</div>
              <TablaCompromisos filas={compromisos} onChange={setCompromisos} />
            </CardContent>
          </Card>

          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            {modoEdicion && estadoOriginal === "completada" ? (
              <Button cargando={guardando === "completada"} onClick={() => guardar("completada")}>
                Guardar cambios
              </Button>
            ) : (
              <>
                <Button
                  variant="outline"
                  cargando={guardando === "borrador"}
                  onClick={() => guardar("borrador")}
                >
                  Guardar borrador
                </Button>
                <Button
                  cargando={guardando === "completada"}
                  onClick={() => guardar("completada")}
                >
                  Finalizar inspección
                </Button>
              </>
            )}
          </div>
        </div>
      </div>

      <MensajeDialog mensaje={mensaje} onClose={() => setMensaje(null)} />
    </div>
  );
}
