// Tipo compatible con Supabase
export type DatabaseType = {
  _public: {
    Tables: {
      cliente: {
        Row: Database._public.Tables.cliente["Row"];
        Insert: Database._public.Tables.cliente["Insert"];
        Update: Database._public.Tables.cliente["Update"];
      };
    };
    Views: {};
    Functions: {};
    Enums: {};
  };
};
// Archivo compatible con Supabase y TypeScript
// Simula el archivo generado por la CLI de Supabase

export type Json = string | number | boolean | null | { [key: string]: Json } | Json[];

export namespace Database {
  export namespace _public {
    export namespace Tables {
      export type cliente = {
        Row: {
          id_cliente: string;
          nombre: string;
          ruc: string;
          direccion?: string | null;
          telefono?: string | null;
          estado: boolean;
          created_at: string;
        };
        Insert: {
          id_cliente?: string;
          nombre: string;
          ruc: string;
          direccion?: string | null;
          telefono?: string | null;
          estado: boolean;
          created_at?: string;
        };
        Update: {
          id_cliente?: string;
          nombre?: string;
          ruc?: string;
          direccion?: string | null;
          telefono?: string | null;
          estado?: boolean;
          created_at?: string;
        };
      };
    }
    export type Tables = {
      cliente: Tables.cliente;
    };
    export type Views = never;
    export type Functions = never;
    export type Enums = never;
  }
}
