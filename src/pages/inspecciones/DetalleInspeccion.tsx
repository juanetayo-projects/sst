import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, FileDown } from "lucide-react";
import { supabase } from "@/lib/supabase";
import {
  cargarEstructuraInspeccion,
  categoriaEsVisible,
  type EstructuraInspeccion,
} from "@/domain/inspecciones";
import { exportarInspeccionPDF, type SeccionPDF } from "@/lib/exportar";
import { formatearFechaLarga } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RespuestaLinea } from "@/components/inspecciones/RespuestaLinea";
import { TermometroCategoria } from "@/components/inspecciones/TermometroCategoria";
import { NavSecciones, type Seccion } from "@/components/inspecciones/NavSecciones";
import { PanelInfograficoSST } from "@/components/inspecciones/PanelInfograficoSST";
import { obtenerCategoriaSST, COLOR_HEX_BLOQUE, type ColorBloque } from "@/domain/categoriasSST";

type InspeccionDetalle = {
  id: string;
  empresa: string | null;
  sede: string | null;
  lugar: string | null;
  fecha_inspeccion: string;
  estado: string;
  fortalezas: string | null;
  hallazgos: string | null;
  urgente: boolean;
  responsable: string | null;
  tipos_inspeccion: { codigo: string; nombre: string };
  profiles: { nombre_completo: string } | null;
};

export default function DetalleInspeccion() {
  const { id } = useParams<{ id: string }>();
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [inspeccion, setInspeccion] = useState<InspeccionDetalle | null>(null);
  const [estructura, setEstructura] = useState<EstructuraInspeccion | null>(
    null,
  );
  const [respuestas, setRespuestas] = useState<Record<string, string>>({});
  const [exportando, setExportando] = useState(false);

  useEffect(() => {
    if (!id) return;
    setCargando(true);
    setError(null);

    supabase
      .from("inspecciones")
      .select("*, tipos_inspeccion(codigo,nombre), profiles(nombre_completo)")
      .eq("id", id)
      .single()
      .then(async ({ data, error: errorInsp }) => {
        if (errorInsp || !data) {
          setError("No se encontró la inspección.");
          setCargando(false);
          return;
        }
        const insp = data as unknown as InspeccionDetalle;
        setInspeccion(insp);

        const [est, { data: filas }] = await Promise.all([
          cargarEstructuraInspeccion(insp.tipos_inspeccion.codigo),
          supabase
            .from("respuestas_inspeccion")
            .select("pregunta_id,valor")
            .eq("inspeccion_id", id),
        ]);
        setEstructura(est);
        const mapa: Record<string, string> = {};
        for (const f of filas ?? []) mapa[f.pregunta_id] = f.valor ?? "";
        setRespuestas(mapa);
        setCargando(false);
      });
  }, [id]);

  async function exportarPDF() {
    if (!inspeccion || !estructura) return;
    setExportando(true);
    const categoriasVisibles = estructura.categorias.filter((c) =>
      categoriaEsVisible(c, estructura.encabezado, respuestas),
    );
    const secciones: SeccionPDF[] = categoriasVisibles.map((cat) => ({
      titulo: cat.nombre,
      color: COLOR_HEX_BLOQUE[cat.color as keyof typeof COLOR_HEX_BLOQUE] ?? "#0D2D6B",
      filas: (estructura.porCategoria.get(cat.id) ?? [])
        .filter((p) => respuestas[p.id])
        .map((p) => [p.texto, respuestas[p.id]] as [string, string]),
    }));

    await exportarInspeccionPDF({
      titulo: inspeccion.tipos_inspeccion.nombre,
      encabezado: [
        ["Empresa", inspeccion.empresa ?? ""],
        ["Sede", inspeccion.sede ?? ""],
        ["Lugar", inspeccion.lugar ?? ""],
        ["Fecha", formatearFechaLarga(inspeccion.fecha_inspeccion)],
        ...estructura.encabezado
          .filter((p) => respuestas[p.id])
          .map((p) => [p.texto, respuestas[p.id]] as [string, string]),
      ],
      secciones,
      cierre: [
        ["Fortalezas", inspeccion.fortalezas ?? ""],
        ["Hallazgos (Compromisos)", inspeccion.hallazgos ?? ""],
        ["Urgente y/o reiterativo", inspeccion.urgente ? "Sí" : "No"],
        ["Responsable de la inspección", inspeccion.responsable ?? ""],
      ],
    });
    setExportando(false);
  }

  if (cargando)
    return (
      <div className="p-8 text-center text-sm text-muted-foreground">
        Cargando…
      </div>
    );
  if (error || !inspeccion || !estructura) {
    return (
      <div className="p-8 text-center text-sm text-[var(--error)]">
        {error ?? "No encontrada."}
      </div>
    );
  }

  const categoriasVisibles = estructura.categorias.filter((c) =>
    categoriaEsVisible(c, estructura.encabezado, respuestas),
  );
  const categoriaSST = obtenerCategoriaSST(estructura.tipo.codigo);
  const secciones: Seccion[] = [
    ...categoriasVisibles.map((c) => ({ id: `categoria-${c.id}`, nombre: c.nombre, color: c.color as ColorBloque })),
    ...(inspeccion.fortalezas || inspeccion.hallazgos || inspeccion.responsable || inspeccion.urgente
      ? [{ id: "cierre", nombre: "Cierre", color: "azul" as ColorBloque }]
      : []),
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
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Link
                to="/inspecciones"
                className="rounded-md p-1.5 text-muted-foreground hover:bg-accent"
              >
                <ArrowLeft className="size-4" />
              </Link>
              <h1 className="text-base font-semibold text-[var(--cac-azul)]">
                {inspeccion.tipos_inspeccion.nombre}
              </h1>
            </div>
            <Button
              variant="outline"
              size="sm"
              cargando={exportando}
              onClick={exportarPDF}
            >
              <FileDown />
              Exportar PDF
            </Button>
          </div>

          <NavSecciones secciones={secciones} />

          <Card>
            <CardContent className="grid grid-cols-2 gap-3 p-4 text-sm sm:grid-cols-4">
              <div>
                <div className="text-xs text-muted-foreground">Empresa</div>
                {inspeccion.empresa ?? "—"}
              </div>
              <div>
                <div className="text-xs text-muted-foreground">Sede</div>
                {inspeccion.sede ?? "—"}
              </div>
              <div>
                <div className="text-xs text-muted-foreground">Lugar</div>
                {inspeccion.lugar ?? "—"}
              </div>
              <div>
                <div className="text-xs text-muted-foreground">Fecha</div>
                {formatearFechaLarga(inspeccion.fecha_inspeccion)}
              </div>
              <div>
                <div className="text-xs text-muted-foreground">Inspector</div>
                {inspeccion.profiles?.nombre_completo ?? "—"}
              </div>
              <div>
                <div className="text-xs text-muted-foreground">Estado</div>
                <Badge
                  tono={inspeccion.estado === "completada" ? "exito" : "neutro"}
                >
                  {inspeccion.estado === "completada"
                    ? "Completada"
                    : "Borrador"}
                </Badge>
              </div>
              {inspeccion.urgente && (
                <div>
                  <div className="text-xs text-muted-foreground">Prioridad</div>
                  <Badge tono="error">Urgente</Badge>
                </div>
              )}
            </CardContent>
          </Card>

          {estructura.encabezado.filter((p) => respuestas[p.id]).length > 0 && (
            <Card>
              <CardContent className="grid grid-cols-1 gap-x-6 p-4 md:grid-cols-2">
                {estructura.encabezado.map((p) => (
                  <RespuestaLinea
                    key={p.id}
                    pregunta={p}
                    valor={respuestas[p.id]}
                  />
                ))}
              </CardContent>
            </Card>
          )}

          {categoriasVisibles.map((cat, i) => (
            <div
              key={cat.id}
              id={`categoria-${cat.id}`}
              className={`bloque-datos bloque-${cat.color} scroll-mt-28 p-4`}
            >
              <div className="bloque-titulo mb-2 flex items-center gap-1.5">
                <span
                  className="flex size-4 shrink-0 items-center justify-center rounded-full text-[10px] font-bold text-white"
                  style={{ backgroundColor: "var(--bloque-acento)" }}
                >
                  {i + 1}
                </span>
                {cat.nombre}
              </div>
              <TermometroCategoria
                preguntas={estructura.porCategoria.get(cat.id) ?? []}
                respuestas={respuestas}
              />
              <div className="grid grid-cols-1 gap-x-6 md:grid-cols-2">
                {(estructura.porCategoria.get(cat.id) ?? []).map((p) => (
                  <RespuestaLinea
                    key={p.id}
                    pregunta={p}
                    valor={respuestas[p.id]}
                  />
                ))}
              </div>
            </div>
          ))}

          {(inspeccion.fortalezas ||
            inspeccion.hallazgos ||
            inspeccion.responsable ||
            inspeccion.urgente) && (
            <Card id="cierre" className="scroll-mt-28">
              <CardContent className="p-4">
                <div className="mb-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Cierre de la inspección
                </div>
                {inspeccion.fortalezas && (
                  <div className="border-b border-border/60 py-1.5">
                    <div className="text-xs text-muted-foreground">
                      Fortalezas
                    </div>
                    <div className="text-sm">{inspeccion.fortalezas}</div>
                  </div>
                )}
                {inspeccion.hallazgos && (
                  <div className="border-b border-border/60 py-1.5">
                    <div className="text-xs text-muted-foreground">
                      Hallazgos (Compromisos)
                    </div>
                    <div className="text-sm">{inspeccion.hallazgos}</div>
                  </div>
                )}
                <div className="flex items-center justify-between gap-3 border-b border-border/60 py-1.5">
                  <span className="flex-1 text-sm">
                    Urgente y/o reiterativo
                  </span>
                  <Badge tono={inspeccion.urgente ? "error" : "neutro"}>
                    {inspeccion.urgente ? "Sí" : "No"}
                  </Badge>
                </div>
                {inspeccion.responsable && (
                  <div className="py-1.5">
                    <div className="text-xs text-muted-foreground">
                      Responsable de la inspección
                    </div>
                    <div className="text-sm">{inspeccion.responsable}</div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
