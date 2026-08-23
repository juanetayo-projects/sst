import {
  Siren,
  Flame,
  SprayCan,
  FlaskConical,
  HardHat,
  Ambulance,
  Construction,
  type LucideIcon,
} from "lucide-react";

export type ColorBloque = "rojo" | "azul" | "verde" | "ambar" | "violeta" | "teal";

/** Degradado (desde, hasta) por color de bloque — usado en el panel infográfico. */
export const GRADIENTES_BLOQUE: Record<ColorBloque, [string, string]> = {
  rojo: ["#E14B3F", "#A61B12"],
  azul: ["#16468E", "#0D2D6B"],
  verde: ["#22B06B", "#0B7A43"],
  ambar: ["#D9820F", "#8A3F05"],
  violeta: ["#7C3AED", "#5219A8"],
  teal: ["#14988E", "#0B5D56"],
};

/** Tono único por color de bloque — usado en PDF y gráficos. */
export const COLOR_HEX_BLOQUE: Record<ColorBloque, string> = {
  rojo: "#A61B12",
  azul: "#0D2D6B",
  verde: "#0B7A43",
  ambar: "#8A3F05",
  violeta: "#5219A8",
  teal: "#0B5D56",
};

export type CategoriaSST = {
  id: string;
  nombre: string;
  objetivo: string;
  descripcion: string;
  frecuencia: string;
  color: ColorBloque;
  icono: LucideIcon;
  tipos: string[];
  /** Nombre de archivo en `public/images/rondas/` — infografía diseñada a medida para esta ronda. */
  imagen: string;
  /** Nombre de archivo en `public/images/iconos-categorias/` — ícono isométrico de la categoría. */
  iconoImg: string;
  /** Nombre de archivo en `public/images/encabezados/` — banner de encabezado del formulario. */
  imagenEncabezado: string;
};

/**
 * Agrupación de los 11 tipos de inspección en las 7 categorías de ronda SST
 * definidas en la infografía "Clasificación de Rondas de Inspección SST"
 * compartida por la clínica, alineada con la Resolución 0312 de 2019
 * (Estándares Mínimos del SG-SST en Colombia).
 */
export const CATEGORIAS_SST: CategoriaSST[] = [
  {
    id: "emergencias",
    nombre: "Emergencias",
    objetivo: "Asegurar la preparación y respuesta oportuna ante emergencias.",
    descripcion:
      "Verificar la disponibilidad, funcionalidad y condiciones de los recursos para atender emergencias.",
    frecuencia: "Mensual (o según plan de emergencias)",
    color: "rojo",
    icono: Siren,
    tipos: ["emergencias", "botiquines"],
    imagen: "emergencias.webp",
    iconoImg: "emergencias.webp",
    imagenEncabezado: "emergencias.webp",
  },
  {
    id: "incendios",
    nombre: "Equipos Contra Incendios",
    objetivo: "Garantizar la disponibilidad y operatividad de los equipos contra incendios.",
    descripcion: "Verificar el estado y funcionamiento de los equipos para control de incendios.",
    frecuencia: "Mensual (o según nivel de riesgo)",
    color: "rojo",
    icono: Flame,
    tipos: ["extintores"],
    imagen: "incendios.webp",
    iconoImg: "incendios.webp",
    imagenEncabezado: "incendios.webp",
  },
  {
    id: "instalaciones",
    nombre: "Instalaciones y Ambiente",
    objetivo:
      "Prevenir accidentes y enfermedades laborales relacionadas con las condiciones físicas del entorno.",
    descripcion: "Mantener condiciones seguras y adecuadas en la infraestructura y entorno de trabajo.",
    frecuencia: "Mensual",
    color: "teal",
    icono: SprayCan,
    tipos: ["orden_aseo"],
    imagen: "instalaciones.webp",
    iconoImg: "instalaciones.webp",
    imagenEncabezado: "instalaciones.webp",
  },
  {
    id: "quimicas",
    nombre: "Sustancias Químicas",
    objetivo: "Prevenir exposiciones y controlar riesgos químicos.",
    descripcion: "Asegurar el manejo, almacenamiento y control seguro de sustancias químicas.",
    frecuencia: "Mensual (o según nivel de riesgo)",
    color: "violeta",
    icono: FlaskConical,
    tipos: ["sustancias_quimicas"],
    imagen: "quimicas.webp",
    iconoImg: "quimicas.webp",
    imagenEncabezado: "quimicas.webp",
  },
  {
    id: "epp",
    nombre: "Protección Personal",
    objetivo: "Asegurar la protección del trabajador frente a los riesgos de su actividad.",
    descripcion:
      "Verificar la disponibilidad, uso adecuado y estado de los Elementos de Protección Personal.",
    frecuencia: "Mensual",
    color: "verde",
    icono: HardHat,
    tipos: ["epp"],
    imagen: "epp.webp",
    iconoImg: "epp.webp",
    imagenEncabezado: "epp.webp",
  },
  {
    id: "vehiculos",
    nombre: "Vehículos y Transporte",
    objetivo: "Prevenir accidentes de tránsito y fallas mecánicas durante la operación.",
    descripcion: "Verificar las condiciones seguras de los vehículos antes de su operación.",
    frecuencia: "Antes de cada salida",
    color: "azul",
    icono: Ambulance,
    tipos: ["vehiculos_preoperacional"],
    imagen: "vehiculos.webp",
    iconoImg: "vehiculos.webp",
    imagenEncabezado: "vehiculos.webp",
  },
  {
    id: "alturas",
    nombre: "Trabajos en Alturas",
    objetivo: "Prevenir caídas y lesiones graves en trabajos en altura.",
    descripcion:
      "Asegurar que las actividades en altura se realicen de manera segura y cumpliendo la normatividad.",
    frecuencia: "Antes del inicio de la actividad y periódica durante su ejecución",
    color: "ambar",
    icono: Construction,
    tipos: ["alturas_verificacion", "alturas_preoperacional", "escalera", "andamios"],
    imagen: "alturas.webp",
    iconoImg: "alturas.webp",
    imagenEncabezado: "alturas.webp",
  },
];

export function obtenerCategoriaSST(codigoTipo: string): CategoriaSST | undefined {
  return CATEGORIAS_SST.find((c) => c.tipos.includes(codigoTipo));
}
