import { BadgeCheck, ShieldCheck } from "lucide-react";
import { GRADIENTES_BLOQUE, type CategoriaSST } from "@/domain/categoriasSST";

export function PanelInfograficoSST({
  categoria,
}: {
  categoria: CategoriaSST;
}) {
  const [desde, hasta] = GRADIENTES_BLOQUE[categoria.color];
  const Icono = categoria.icono;

  return (
    <aside className={`bloque-datos bloque-${categoria.color} overflow-hidden`}>
      <div
        className="flex flex-col items-center gap-2.5 px-5 py-6 text-center text-white"
        style={{ background: `linear-gradient(135deg, ${desde}, ${hasta})` }}
      >
        <div className="flex size-16 items-center justify-center rounded-2xl bg-white/15 shadow-relieve-oscuro-hundido">
          <Icono className="size-8" strokeWidth={1.75} />
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
