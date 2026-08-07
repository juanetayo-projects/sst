import type { CategoriaSST } from "@/domain/categoriasSST";

export function PanelInfograficoSST({
  categoria,
}: {
  categoria: CategoriaSST;
}) {
  return (
    <aside className="overflow-hidden rounded-2xl shadow-relieve">
      <img
        src={`${import.meta.env.BASE_URL}images/rondas/${categoria.imagen}`}
        alt={`Infografía — ${categoria.nombre}`}
        className="aspect-[640/1080] w-full object-contain"
      />
    </aside>
  );
}
