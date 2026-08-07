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
import { BloqueCategoria } from "@/components/inspecciones/BloqueCategoria";
import { PanelInfograficoSST } from "@/components/inspecciones/PanelInfograficoSST";
import { obtenerCategoriaSST } from "@/domain/categoriasSST";

export default function FormularioInspeccion() {
  const { codigo } = useParams<{ codigo: string }>();
  const navigate = useNavigate();
  const { session } = useAuth();

  const [cargando, setCargando] = useState(true);
  const [estructura, setEstructura] = useState<EstructuraInspeccion | null>(
    null,
  );
  const [errorCarga, setErrorCarga] = useState<string | null>(null);
  const [empresas, setEmpresas] = useState<string[]>([]);
  const [sedes, setSedes] = useState<string[]>([]);

  const [empresa, setEmpresa] = useState("");
  const [sede, setSede] = useState("");
  const [lugar, setLugar] = useState("");
  const [fecha, setFecha] = useState(() =>
    new Date().toISOString().slice(0, 10),
  );
  const [respuestas, setRespuestas] = useState<Record<string, string>>({});
  const [faltantes, setFaltantes] = useState<Set<string>>(new Set());

  const [guardando, setGuardando] = useState<"borrador" | "completada" | null>(
    null,
  );
  const [mensaje, setMensaje] = useState<Mensaje>(null);

  useEffect(() => {
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
  }, [codigo]);

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

    const { data: inspeccion, error: errorInspeccion } = await supabase
      .from("inspecciones")
      .insert({
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

    const filas = preguntasVisibles
      .filter((p) => respuestas[p.id])
      .map((p) => ({
        inspeccion_id: inspeccion.id,
        pregunta_id: p.id,
        valor: respuestas[p.id],
      }));

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

  return (
    <div className="mx-auto max-w-6xl pb-10">
      <div className="lg:grid lg:grid-cols-[1fr_320px] lg:items-start lg:gap-6">
        {categoriaSST && (
          <div className="order-first mb-4 lg:sticky lg:top-20 lg:order-last lg:mb-0">
            <PanelInfograficoSST categoria={categoriaSST} />
          </div>
        )}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Link
              to="/inspecciones/nueva"
              className="rounded-md p-1.5 text-muted-foreground hover:bg-accent"
            >
              <ArrowLeft className="size-4" />
            </Link>
            <h1 className="text-base font-semibold text-[var(--cac-azul)]">
              {estructura.tipo.nombre}
            </h1>
          </div>

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
            </CardContent>
          </Card>

          {estructura.encabezado.length > 0 && (
            <Card>
              <CardContent className="p-4">
                {estructura.encabezado.map((p) => (
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

          {categoriasVisibles.map((cat) => (
            <BloqueCategoria
              key={cat.id}
              categoria={cat}
              preguntas={estructura.porCategoria.get(cat.id) ?? []}
              tipoRespuesta={estructura.tipo.tipo_respuesta}
              respuestas={respuestas}
              faltantes={faltantes}
              onCambiar={cambiarRespuesta}
            />
          ))}

          {estructura.cierre.length > 0 && (
            <Card>
              <CardContent className="p-4">
                <div className="mb-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
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

          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
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
          </div>
        </div>
      </div>

      <MensajeDialog mensaje={mensaje} onClose={() => setMensaje(null)} />
    </div>
  );
}
