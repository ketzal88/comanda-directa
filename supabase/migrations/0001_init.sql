-- Comanda Directa: schema multi-tenant único.
--
-- Un solo proyecto de Supabase para todos los clientes (ver README, sección
-- "Backend"). Todo cuelga de `clientes` por `cliente_id`. El navegador NUNCA
-- habla con Supabase directo: todas las lecturas y escrituras pasan por
-- rutas de Next.js server-side con la service role key. Por eso RLS está
-- habilitado en las tres tablas SIN ninguna policy — default-deny total para
-- los roles `anon`/`authenticated`, y la service role bypassea RLS por
-- diseño de Supabase. Mismo patrón "el panel escribe siempre server-side"
-- que ya usan presencia-carta y sagrado-sushi-carta con las reglas de
-- Firestore.

create extension if not exists pgcrypto;

create table if not exists clientes (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  nombre text not null,
  plantilla text not null default 'clasica',
  tema jsonb not null default '{}'::jsonb,

  -- ConfigCarta (logica/tipos.ts)
  notas text[] not null default '{}',
  cubierto_por_persona integer not null default 0,

  -- ConfigPedido (logica/tipos.ts)
  whatsapp text not null default '',
  modalidades text[] not null default '{}',
  cabecera text not null default '',
  medios_de_pago text[] not null default '{}',
  zonas_envio jsonb not null default '[]'::jsonb,
  descuento_retiro jsonb not null default '{"tipo":"ninguno"}'::jsonb,

  clave_panel_hash text,
  activo boolean not null default true,
  creado_en timestamptz not null default now()
);

create table if not exists categorias (
  id uuid primary key default gen_random_uuid(),
  cliente_id uuid not null references clientes(id) on delete cascade,
  nombre text not null,
  nombre_en text not null default '',
  orden integer not null default 1,
  subcategorias jsonb not null default '[]'::jsonb
);
create index if not exists categorias_cliente_id_idx on categorias(cliente_id);

create table if not exists items (
  id uuid primary key default gen_random_uuid(),
  cliente_id uuid not null references clientes(id) on delete cascade,
  categoria_id uuid not null references categorias(id) on delete cascade,
  nombre text not null,
  subcategoria text,
  orden integer not null default 1,
  -- ENTERO en pesos, igual que en Firestore en los otros dos proyectos.
  -- 0 = sin precio cargado (nunca se muestra "$0").
  precio integer not null default 0,
  variantes jsonb not null default '[]'::jsonb,
  agotado boolean not null default false,
  activo boolean not null default true,
  piezas integer,
  etiquetas text[] not null default '{}',
  descripcion text,
  foto_url text
);
create index if not exists items_cliente_id_idx on items(cliente_id);
create index if not exists items_categoria_id_idx on items(categoria_id);

alter table clientes enable row level security;
alter table categorias enable row level security;
alter table items enable row level security;
-- Sin policies a propósito: ver el comentario del encabezado.
