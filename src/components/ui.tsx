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
  compacto = false,
}: {
  titulo: string;
  valor: ReactNode;
  icono?: LucideIcon;
  sub?: string;
  color?: ColorKpi;
  /** Versión reducida (ícono y tipografía más pequeños, menos padding) para paneles con poco espacio vertical. */
  compacto?: boolean;
}) {
  return (
    <div
      className={cn(
        "flex items-center shadow-relieve transition-all hover:-translate-y-0.5 hover:shadow-relieve-hover",
        compacto ? "gap-2.5 rounded-xl p-2.5" : "gap-3.5 rounded-2xl p-4"
      )}
      style={{ backgroundImage: `var(--kpi-${color}-fondo)` }}
    >
      {Icono && (
        <div
          className={cn(
            "flex shrink-0 items-center justify-center text-white shadow-relieve-sm",
            compacto ? "size-8 rounded-xl" : "size-11 rounded-2xl"
          )}
          style={{ backgroundImage: `var(--kpi-${color}-icono)` }}
        >
          <Icono className={compacto ? "size-4" : "size-5"} />
        </div>
      )}
      <div className="min-w-0">
        <div className={cn("font-extrabold tabular leading-tight", compacto ? "text-lg" : "text-2xl", TEXTO_KPI[color])}>{valor}</div>
        <div className={cn("font-semibold text-muted-foreground", compacto ? "text-[11px]" : "text-xs")}>{titulo}</div>
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
