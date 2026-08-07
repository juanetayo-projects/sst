import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/** Card de métrica con degradado institucional — para filas de KPI en dashboards. */
export function MetricCard({
  titulo,
  valor,
  icono,
  sub,
}: {
  titulo: string;
  valor: ReactNode;
  icono?: ReactNode;
  sub?: string;
}) {
  return (
    <div className="rounded-2xl border border-[var(--cac-azul-800)]/40 bg-gradient-to-br from-[var(--cac-azul)] to-[var(--cac-azul-contraste)] p-5 text-white shadow-[0_10px_30px_-8px_rgba(13,45,107,0.55)] transition-shadow hover:shadow-[0_14px_36px_-6px_rgba(13,45,107,0.6)]">
      <div className="flex items-center justify-between">
        <span className="text-sm/5 opacity-80">{titulo}</span>
        {icono}
      </div>
      <div className="mt-2 text-3xl font-bold tabular">{valor}</div>
      {sub && <div className="mt-1 text-xs opacity-75">{sub}</div>}
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
