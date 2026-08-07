import {
  Siren,
  Flame,
  Sparkles,
  FlaskConical,
  HardHat,
  Ambulance,
  Construction,
  type LucideIcon,
} from "lucide-react";

export type ColorBloque =
  "rojo" | "azul" | "verde" | "ambar" | "violeta" | "teal";

export type CategoriaSST = {
  id: string;
  nombre: string;
  objetivo: string;
  descripcion: string;
  frecuencia: string;
  color: ColorBloque;
  icono: LucideIcon;
  tipos: string[];
};

/**
 * Agrupación de los 10 tipos de inspección en las 7 categorías de ronda SST
 * definidas en la infografía "Clasificación de Rondas de Inspección SST"
 * compartida por la clínica (docs/images/clasificacion_rondas.png), alineada
 * con la Resolución 0312 de 2019 (Estándares Mínimos del SG-SST en Colombia).
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
    tipos: ["emergencias"],
  },
  {
    id: "incendios",
    nombre: "Equipos Contra Incendios",
    objetivo:
      "Garantizar la disponibilidad y operatividad de los equipos contra incendios.",
    descripcion:
      "Verificar el estado y funcionamiento de los equipos para control de incendios.",
    frecuencia: "Mensual (o según nivel de riesgo)",
    color: "rojo",
    icono: Flame,
    tipos: ["extintores"],
  },
  {
    id: "instalaciones",
    nombre: "Instalaciones y Ambiente",
    objetivo:
      "Prevenir accidentes y enfermedades laborales relacionadas con las condiciones físicas del entorno.",
    descripcion:
      "Mantener condiciones seguras y adecuadas en la infraestructura y entorno de trabajo.",
    frecuencia: "Mensual",
    color: "teal",
    icono: Sparkles,
    tipos: ["orden_aseo"],
  },
  {
    id: "quimicas",
    nombre: "Sustancias Químicas",
    objetivo: "Prevenir exposiciones y controlar riesgos químicos.",
    descripcion:
      "Asegurar el manejo, almacenamiento y control seguro de sustancias químicas.",
    frecuencia: "Mensual (o según nivel de riesgo)",
    color: "violeta",
    icono: FlaskConical,
    tipos: ["sustancias_quimicas"],
  },
  {
    id: "epp",
    nombre: "Protección Personal",
    objetivo:
      "Asegurar la protección del trabajador frente a los riesgos de su actividad.",
    descripcion:
      "Verificar la disponibilidad, uso adecuado y estado de los Elementos de Protección Personal.",
    frecuencia: "Mensual",
    color: "verde",
    icono: HardHat,
    tipos: ["epp"],
  },
  {
    id: "vehiculos",
    nombre: "Vehículos y Transporte",
    objetivo:
      "Prevenir accidentes de tránsito y fallas mecánicas durante la operación.",
    descripcion:
      "Verificar las condiciones seguras de los vehículos antes de su operación.",
    frecuencia: "Antes de cada salida",
    color: "azul",
    icono: Ambulance,
    tipos: ["vehiculos_preoperacional"],
  },
  {
    id: "alturas",
    nombre: "Trabajos en Alturas",
    objetivo: "Prevenir caídas y lesiones graves en trabajos en altura.",
    descripcion:
      "Asegurar que las actividades en altura se realicen de manera segura y cumpliendo la normatividad.",
    frecuencia:
      "Antes del inicio de la actividad y periódica durante su ejecución",
    color: "ambar",
    icono: Construction,
    tipos: [
      "alturas_verificacion",
      "alturas_preoperacional",
      "escalera",
      "andamios",
    ],
  },
];

export function obtenerCategoriaSST(
  codigoTipo: string,
): CategoriaSST | undefined {
  return CATEGORIAS_SST.find((c) => c.tipos.includes(codigoTipo));
}
