import type { Pregunta } from "@/domain/inspecciones";

const COLOR_VALOR: Record<string, string> = {
  Cumple: "var(--exito)",
  Sí: "var(--exito)",
  "No Cumple": "var(--error)",
  No: "var(--error)",
  "No Aplica": "var(--neutro)",
};

const ORDEN_VALOR = ["Cumple", "Sí", "No Cumple", "No", "No Aplica"];

function colorPara(valor: string, indice: number): string {
  if (COLOR_VALOR[valor]) return COLOR_VALOR[valor];
  const paleta = ["var(--info)", "var(--advertencia)", "var(--cac-azul-400)"];
  return paleta[indice % paleta.length];
}

function Termometro({
  etiqueta,
  color,
  cantidad,
  pct,
}: {
  etiqueta: string;
  color: string;
  cantidad: number;
  pct: number;
}) {
  const alturaTubo = 64;
  const alturaRelleno = Math.max(pct > 0 ? 6 : 0, Math.round((pct / 100) * alturaTubo));
  return (
    <div className="flex flex-col items-center gap-1">
      <div className="text-xs font-bold tabular" style={{ color }}>
        {pct}%
      </div>
      <div
        className="relative flex w-3.5 items-end overflow-hidden rounded-full"
        style={{ height: alturaTubo, backgroundColor: "var(--muted)" }}
      >
        <div
          className="w-full rounded-full transition-all duration-500"
          style={{ height: alturaRelleno, backgroundColor: color }}
        />
      </div>
      <div
        className="-mt-1.5 size-3.5 shrink-0 rounded-full ring-2"
        style={{ backgroundColor: color, ["--tw-ring-color" as string]: "var(--card)" }}
      />
      <div className="mt-0.5 max-w-16 text-center text-[10px] leading-tight text-muted-foreground">
        {etiqueta}
      </div>
      <div className="text-[11px] font-semibold tabular">{cantidad}</div>
    </div>
  );
}

/** Distribución de respuestas (cantidad + %) por tipo de respuesta, para las preguntas de opción/booleano de una categoría. */
export function TermometroCategoria({
  preguntas,
  respuestas,
}: {
  preguntas: Pregunta[];
  respuestas: Record<string, string>;
}) {
  const conteo = new Map<string, number>();
  for (const p of preguntas) {
    if (p.tipo_campo !== "opcion" && p.tipo_campo !== "booleano") continue;
    const valor = respuestas[p.id];
    if (!valor) continue;
    conteo.set(valor, (conteo.get(valor) ?? 0) + 1);
  }

  const total = Array.from(conteo.values()).reduce((a, b) => a + b, 0);
  if (total === 0) return null;

  const filas = Array.from(conteo.entries())
    .sort(([a], [b]) => {
      const ia = ORDEN_VALOR.indexOf(a);
      const ib = ORDEN_VALOR.indexOf(b);
      if (ia === -1 && ib === -1) return a.localeCompare(b);
      if (ia === -1) return 1;
      if (ib === -1) return -1;
      return ia - ib;
    })
    .map(([valor, cantidad], i) => ({
      valor,
      cantidad,
      pct: Math.round((cantidad / total) * 100),
      color: colorPara(valor, i),
    }));

  return (
    <div className="mb-3 flex flex-wrap items-end justify-center gap-5 rounded-lg border border-border/60 bg-card/60 px-4 py-3">
      {filas.map((f) => (
        <Termometro key={f.valor} etiqueta={f.valor} color={f.color} cantidad={f.cantidad} pct={f.pct} />
      ))}
      <div className="self-center border-l border-border/60 pl-4 text-[11px] text-muted-foreground">
        {total} respuesta{total === 1 ? "" : "s"}
      </div>
    </div>
  );
}
