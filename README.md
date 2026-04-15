<!-- Despliegue forzado: actualización menor para activar build en Vercel -->
# AGH ERP Web

Plataforma ERP modular construida con Next.js App Router, TypeScript estricto, Tailwind CSS y Supabase.

## Stack

- Next.js 16 (App Router)
- TypeScript estricto
- Tailwind CSS v4
- Supabase (PostgreSQL + Auth)
- React Hook Form + Zod

## Estructura

- app: rutas, layouts y API routes
- modules: dominios ERP (auth, clientes, etc.)
- components: UI reutilizable
- services: integraciones (Supabase)
- lib: utilidades, constantes, entorno
- types: tipos globales y DB
- hooks: hooks reutilizables

## Variables de entorno

Copia .env.example en .env.local y completa:

NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

## Modelo inicial requerido

El modulo clientes usa la tabla public.cliente con estos campos:

- id_cliente uuid primary key default uuid_generate_v4()
- nombre varchar not null
- ruc varchar not null
- direccion varchar null
- telefono varchar null
- estado boolean not null default true
- created_at timestamptz not null default now()
- created_by uuid null
- updated_at timestamptz null
- updated_by uuid null

## Recomendacion SQL minima

Asegura extension UUID:

create extension if not exists "uuid-ossp";

## Desarrollo local

1. Instalar dependencias
npm install

2. Ejecutar app
npm run dev

3. Abrir
http://localhost:3000

## Flujo funcional incluido

- Login con tabla usuario (nombre_usuario y clave)
- Persistencia de sesion
- Rutas protegidas con proxy
- Layout ERP con sidebar y header
- Dashboard inicial
- CRUD completo del modulo Clientes
- Validacion con Zod
- Formularios con React Hook Form

## Despliegue en Vercel

1. Subir repositorio a GitHub.
2. Importar proyecto en Vercel.
3. Configurar variables de entorno del proyecto:
	- NEXT_PUBLIC_SUPABASE_URL
	- NEXT_PUBLIC_SUPABASE_ANON_KEY
	- SUPABASE_SERVICE_ROLE_KEY
4. Deploy.
5. Configurar en Supabase Auth URLs de redireccion para tu dominio Vercel.

## Seguridad recomendada (siguiente paso)

- Activar RLS en todas las tablas ERP.
- Crear politicas por usuario/rol.
- Agregar tabla de roles y permisos por modulo.

## Nota de autenticacion

- El login actual valida contra public.usuario (nombre_usuario y clave).
- Define AUTH_SESSION_SECRET para firmar la cookie de sesion.
