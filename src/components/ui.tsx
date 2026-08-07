import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export type ColorKpi = "azul" | "verde" | "ambar" | "rojo";

const TEXTO_KPI: Record<ColorKpi, string> = {
  azul: "text-[var(--cac-azul-800)]",
  verde: "text-[#065f46]",
  ambar: "text-[#92400e]",
  rojo: "text-[#991b1b]",
};

/** Tarjeta KPI neumórfica — fondo pastel por color + chip de ícono con degradado saturado. */
export function MetricCard({
  titulo,
  valor,
  icono: Icono,
  sub,
  color = "azul",
}: {
  titulo: string;
  valor: ReactNode;
  icono?: LucideIcon;
  sub?: string;
  color?: ColorKpi;
}) {
  return (
    <div
      className="flex items-center gap-3.5 rounded-2xl p-4 shadow-relieve transition-all hover:-translate-y-0.5 hover:shadow-relieve-hover"
      style={{ backgroundImage: `var(--kpi-${color}-fondo)` }}
    >
      {Icono && (
        <div
          className="flex size-11 shrink-0 items-center justify-center rounded-2xl text-white shadow-relieve-sm"
          style={{ backgroundImage: `var(--kpi-${color}-icono)` }}
        >
          <Icono className="size-5" />
        </div>
      )}
      <div className="min-w-0">
        <div className={cn("text-2xl font-extrabold tabular leading-tight", TEXTO_KPI[color])}>{valor}</div>
        <div className="text-xs font-semibold text-muted-foreground">{titulo}</div>
        {sub && <div className="text-[10px] text-muted-foreground/80">{sub}</div>}
      </div>
    </div>
  );
}

export function PageHeader({
  titulo,
  acciones,
}: {
  titulo: string;
  acciones?: ReactNode;
}) {
  return (
    <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
      <h1 className="text-lg font-semibold text-[var(--cac-azul)]">{titulo}</h1>
      <div className="flex flex-wrap gap-2">{acciones}</div>
    </div>
  );
}

export function FilterBar({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "mb-4 flex flex-wrap items-end gap-3 rounded-xl border border-border bg-card p-3 shadow-relieve-sm",
        className,
      )}
    >
      {children}
    </div>
  );
}
