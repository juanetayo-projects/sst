import { BadgeCheck, ShieldCheck } from "lucide-react";
import type { CategoriaSST, ColorBloque } from "@/domain/categoriasSST";

const GRADIENTES: Record<ColorBloque, [string, string]> = {
  rojo: ["#E14B3F", "#A61B12"],
  azul: ["#16468E", "#0D2D6B"],
  verde: ["#22B06B", "#0B7A43"],
  ambar: ["#D9820F", "#8A3F05"],
  violeta: ["#7C3AED", "#5219A8"],
  teal: ["#14988E", "#0B5D56"],
};

export function PanelInfograficoSST({
  categoria,
}: {
  categoria: CategoriaSST;
}) {
  const [desde, hasta] = GRADIENTES[categoria.color];

  return (
    <aside className={`bloque-datos bloque-${categoria.color} overflow-hidden`}>
      <div
        className="flex flex-col items-center gap-2 px-5 py-6 text-center text-white"
        style={{ background: `linear-gradient(135deg, ${desde}, ${hasta})` }}
      >
        <div className="flex size-20 items-center justify-center rounded-2xl bg-white/90 p-2 shadow-inner">
          <img
            src={`${import.meta.env.BASE_URL}images/iconos-sst/${categoria.icono}`}
            alt=""
            className="size-full object-contain"
          />
        </div>
        <h3 className="text-sm font-bold uppercase tracking-wide">
          {categoria.nombre}
        </h3>
      </div>

      <div className="space-y-4 p-4">
        <div>
          <div className="bloque-titulo mb-1">Objetivo</div>
          <p className="text-sm">{categoria.objetivo}</p>
        </div>
        <div>
          <div className="bloque-titulo mb-1">Descripción</div>
          <p className="text-sm text-muted-foreground">
            {categoria.descripcion}
          </p>
        </div>
        <div>
          <div className="bloque-titulo mb-1">Frecuencia sugerida</div>
          <p className="text-sm font-medium">{categoria.frecuencia}</p>
        </div>
      </div>

      <div className="space-y-2 border-t border-border/60 bg-muted/40 p-4 text-xs text-muted-foreground">
        <div className="flex items-center gap-1.5">
          <BadgeCheck className="size-3.5 shrink-0" />
          Alineado con la norma ISO 9001:2015
        </div>
        <div className="flex items-center gap-1.5">
          <ShieldCheck className="size-3.5 shrink-0" />
          Resolución 0312 de 2019 — Estándares Mínimos SG-SST
        </div>
        <p className="pt-1 text-center text-[11px] font-medium italic text-[var(--cac-azul)]">
          «Cuidamos lo más importante: la vida»
        </p>
      </div>
    </aside>
  );
}
