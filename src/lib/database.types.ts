export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.15"
  }
  public: {
    Tables: {
      categorias_pregunta: {
        Row: {
          color: string
          condicion_campo: string | null
          condicion_valor: string | null
          id: string
          nombre: string
          orden: number
          tipo_inspeccion_id: string
        }
        Insert: {
          color?: string
          condicion_campo?: string | null
          condicion_valor?: string | null
          id?: string
          nombre: string
          orden?: number
          tipo_inspeccion_id: string
        }
        Update: {
          color?: string
          condicion_campo?: string | null
          condicion_valor?: string | null
          id?: string
          nombre?: string
          orden?: number
          tipo_inspeccion_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "categorias_pregunta_tipo_inspeccion_id_fkey"
            columns: ["tipo_inspeccion_id"]
            isOneToOne: false
            referencedRelation: "tipos_inspeccion"
            referencedColumns: ["id"]
          },
        ]
      }
      compromisos_ronda: {
        Row: {
          created_at: string
          created_by: string | null
          descripcion: string
          estado: string
          exportado_acta: boolean
          fecha_compromiso: string
          fecha_cumplido: string | null
          id: string
          inspeccion_id: string
          responsable: string | null
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          descripcion: string
          estado?: string
          exportado_acta?: boolean
          fecha_compromiso: string
          fecha_cumplido?: string | null
          id?: string
          inspeccion_id: string
          responsable?: string | null
        }
        Update: {
          created_at?: string
          created_by?: string | null
          descripcion?: string
          estado?: string
          exportado_acta?: boolean
          fecha_compromiso?: string
          fecha_cumplido?: string | null
          id?: string
          inspeccion_id?: string
          responsable?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "compromisos_ronda_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "compromisos_ronda_inspeccion_id_fkey"
            columns: ["inspeccion_id"]
            isOneToOne: false
            referencedRelation: "inspecciones"
            referencedColumns: ["id"]
          },
        ]
      }
      empresas: {
        Row: {
          activo: boolean
          id: string
          nombre: string
          orden: number
        }
        Insert: {
          activo?: boolean
          id?: string
          nombre: string
          orden?: number
        }
        Update: {
          activo?: boolean
          id?: string
          nombre?: string
          orden?: number
        }
        Relationships: []
      }
      inspecciones: {
        Row: {
          created_at: string
          empresa: string | null
          estado: string
          evidencia_urls: string[]
          fecha_inspeccion: string
          fortalezas: string | null
          hallazgos: string | null
          id: string
          inspector_id: string
          lugar: string | null
          observaciones: string | null
          responsable: string | null
          sede: string | null
          tipo_inspeccion_id: string
          updated_at: string
          urgente: boolean
        }
        Insert: {
          created_at?: string
          empresa?: string | null
          estado?: string
          evidencia_urls?: string[]
          fecha_inspeccion?: string
          fortalezas?: string | null
          hallazgos?: string | null
          id?: string
          inspector_id: string
          lugar?: string | null
          observaciones?: string | null
          responsable?: string | null
          sede?: string | null
          tipo_inspeccion_id: string
          updated_at?: string
          urgente?: boolean
        }
        Update: {
          created_at?: string
          empresa?: string | null
          estado?: string
          evidencia_urls?: string[]
          fecha_inspeccion?: string
          fortalezas?: string | null
          hallazgos?: string | null
          id?: string
          inspector_id?: string
          lugar?: string | null
          observaciones?: string | null
          responsable?: string | null
          sede?: string | null
          tipo_inspeccion_id?: string
          updated_at?: string
          urgente?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "inspecciones_inspector_id_fkey"
            columns: ["inspector_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inspecciones_tipo_inspeccion_id_fkey"
            columns: ["tipo_inspeccion_id"]
            isOneToOne: false
            referencedRelation: "tipos_inspeccion"
            referencedColumns: ["id"]
          },
        ]
      }
      inventario_equipos: {
        Row: {
          activo: boolean
          agente_extintor: string | null
          atributos: Json
          capacidad: string | null
          codigo: string
          created_at: string
          empresa: string | null
          fecha_vencimiento: string | null
          id: string
          piso: string | null
          prueba_hidrostatica: string | null
          sede: string | null
          tipo: string | null
          tipo_equipo: string
          ubicacion: string | null
          updated_at: string
        }
        Insert: {
          activo?: boolean
          agente_extintor?: string | null
          atributos?: Json
          capacidad?: string | null
          codigo: string
          created_at?: string
          empresa?: string | null
          fecha_vencimiento?: string | null
          id?: string
          piso?: string | null
          prueba_hidrostatica?: string | null
          sede?: string | null
          tipo?: string | null
          tipo_equipo?: string
          ubicacion?: string | null
          updated_at?: string
        }
        Update: {
          activo?: boolean
          agente_extintor?: string | null
          atributos?: Json
          capacidad?: string | null
          codigo?: string
          created_at?: string
          empresa?: string | null
          fecha_vencimiento?: string | null
          id?: string
          piso?: string | null
          prueba_hidrostatica?: string | null
          sede?: string | null
          tipo?: string | null
          tipo_equipo?: string
          ubicacion?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      permisos_ronda_categoria: {
        Row: {
          categoria_sst: string
          created_at: string
          profile_id: string
        }
        Insert: {
          categoria_sst: string
          created_at?: string
          profile_id: string
        }
        Update: {
          categoria_sst?: string
          created_at?: string
          profile_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "permisos_ronda_categoria_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      preguntas: {
        Row: {
          activa: boolean
          categoria_id: string | null
          created_at: string
          id: string
          obligatoria: boolean
          opciones: Json | null
          orden: number
          texto: string
          tipo_campo: string
          tipo_inspeccion_id: string
        }
        Insert: {
          activa?: boolean
          categoria_id?: string | null
          created_at?: string
          id?: string
          obligatoria?: boolean
          opciones?: Json | null
          orden?: number
          texto: string
          tipo_campo?: string
          tipo_inspeccion_id: string
        }
        Update: {
          activa?: boolean
          categoria_id?: string | null
          created_at?: string
          id?: string
          obligatoria?: boolean
          opciones?: Json | null
          orden?: number
          texto?: string
          tipo_campo?: string
          tipo_inspeccion_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "preguntas_categoria_id_fkey"
            columns: ["categoria_id"]
            isOneToOne: false
            referencedRelation: "categorias_pregunta"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "preguntas_tipo_inspeccion_id_fkey"
            columns: ["tipo_inspeccion_id"]
            isOneToOne: false
            referencedRelation: "tipos_inspeccion"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          activo: boolean
          created_at: string
          email: string
          id: string
          nombre_completo: string
          role: string
          updated_at: string
        }
        Insert: {
          activo?: boolean
          created_at?: string
          email: string
          id: string
          nombre_completo: string
          role?: string
          updated_at?: string
        }
        Update: {
          activo?: boolean
          created_at?: string
          email?: string
          id?: string
          nombre_completo?: string
          role?: string
          updated_at?: string
        }
        Relationships: []
      }
      programaciones_ronda: {
        Row: {
          created_at: string
          created_by: string | null
          empresa: string | null
          estado: string
          fecha_programada: string
          id: string
          inspeccion_id: string | null
          notas: string | null
          responsable_id: string | null
          sede: string | null
          tipo_inspeccion_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          empresa?: string | null
          estado?: string
          fecha_programada: string
          id?: string
          inspeccion_id?: string | null
          notas?: string | null
          responsable_id?: string | null
          sede?: string | null
          tipo_inspeccion_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          empresa?: string | null
          estado?: string
          fecha_programada?: string
          id?: string
          inspeccion_id?: string | null
          notas?: string | null
          responsable_id?: string | null
          sede?: string | null
          tipo_inspeccion_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "programaciones_ronda_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "programaciones_ronda_inspeccion_id_fkey"
            columns: ["inspeccion_id"]
            isOneToOne: false
            referencedRelation: "inspecciones"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "programaciones_ronda_responsable_id_fkey"
            columns: ["responsable_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "programaciones_ronda_tipo_inspeccion_id_fkey"
            columns: ["tipo_inspeccion_id"]
            isOneToOne: false
            referencedRelation: "tipos_inspeccion"
            referencedColumns: ["id"]
          },
        ]
      }
      respuestas_inspeccion: {
        Row: {
          created_at: string
          evidencia_urls: string[]
          id: string
          inspeccion_id: string
          pregunta_id: string
          valor: string | null
        }
        Insert: {
          created_at?: string
          evidencia_urls?: string[]
          id?: string
          inspeccion_id: string
          pregunta_id: string
          valor?: string | null
        }
        Update: {
          created_at?: string
          evidencia_urls?: string[]
          id?: string
          inspeccion_id?: string
          pregunta_id?: string
          valor?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "respuestas_inspeccion_inspeccion_id_fkey"
            columns: ["inspeccion_id"]
            isOneToOne: false
            referencedRelation: "inspecciones"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "respuestas_inspeccion_pregunta_id_fkey"
            columns: ["pregunta_id"]
            isOneToOne: false
            referencedRelation: "preguntas"
            referencedColumns: ["id"]
          },
        ]
      }
      sedes: {
        Row: {
          activo: boolean
          id: string
          nombre: string
          orden: number
        }
        Insert: {
          activo?: boolean
          id?: string
          nombre: string
          orden?: number
        }
        Update: {
          activo?: boolean
          id?: string
          nombre?: string
          orden?: number
        }
        Relationships: []
      }
      solicitudes_compra_item: {
        Row: {
          cantidad: number
          created_at: string
          created_by: string | null
          estado: string
          fecha: string
          id: string
          inspeccion_id: string
          observacion: string | null
          tipo_elemento: string
          unidad_medida: string | null
        }
        Insert: {
          cantidad?: number
          created_at?: string
          created_by?: string | null
          estado?: string
          fecha?: string
          id?: string
          inspeccion_id: string
          observacion?: string | null
          tipo_elemento: string
          unidad_medida?: string | null
        }
        Update: {
          cantidad?: number
          created_at?: string
          created_by?: string | null
          estado?: string
          fecha?: string
          id?: string
          inspeccion_id?: string
          observacion?: string | null
          tipo_elemento?: string
          unidad_medida?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "solicitudes_compra_item_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "solicitudes_compra_item_inspeccion_id_fkey"
            columns: ["inspeccion_id"]
            isOneToOne: false
            referencedRelation: "inspecciones"
            referencedColumns: ["id"]
          },
        ]
      }
      tipos_inspeccion: {
        Row: {
          activo: boolean
          codigo: string
          created_at: string
          descripcion: string | null
          id: string
          nombre: string
          orden: number
          requiere_trabajo: boolean
          tiene_hallazgos: boolean
          tipo_respuesta: string
        }
        Insert: {
          activo?: boolean
          codigo: string
          created_at?: string
          descripcion?: string | null
          id?: string
          nombre: string
          orden?: number
          requiere_trabajo?: boolean
          tiene_hallazgos?: boolean
          tipo_respuesta?: string
        }
        Update: {
          activo?: boolean
          codigo?: string
          created_at?: string
          descripcion?: string | null
          id?: string
          nombre?: string
          orden?: number
          requiere_trabajo?: boolean
          tiene_hallazgos?: boolean
          tipo_respuesta?: string
        }
        Relationships: []
      }
      unidades_medida: {
        Row: {
          activo: boolean
          id: string
          nombre: string
          orden: number
        }
        Insert: {
          activo?: boolean
          id?: string
          nombre: string
          orden?: number
        }
        Update: {
          activo?: boolean
          id?: string
          nombre?: string
          orden?: number
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      is_admin: { Args: never; Returns: boolean }
      is_inspector: { Args: never; Returns: boolean }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
