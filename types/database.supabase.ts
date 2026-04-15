// Tipo compatible con Supabase
export type DatabaseType = {
  public: {
    Tables: {
      cliente: {
        Row: Database.public.Tables.cliente["Row"];
        Insert: Database.public.Tables.cliente["Insert"];
        Update: Database.public.Tables.cliente["Update"];
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
  export namespace public {
    export namespace Tables {
      export type cliente = {
        Row: {
          id_cliente: string;
          nombre: string;
          created_at: string;
        };
        Insert: {
          id_cliente?: string;
          nombre: string;
          created_at?: string;
        };
        Update: {
          id_cliente?: string;
          nombre?: string;
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
