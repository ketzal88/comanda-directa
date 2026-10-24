-- Back-office de Party Market: stock propio, costos y pedidos internos.
--
-- Todo aditivo: columnas con default y tablas nuevas, así la carta en vivo
-- sigue leyendo `precio`/`activo` como siempre. El stock pasa a vivir ACÁ (no
-- en el Excel): es lo que habilita armar un pedido que descuente stock.

-- Stock y costos por ítem.
alter table items add column if not exists costo integer not null default 0;          -- precio mayorista, ENTERO en pesos
alter table items add column if not exists margen integer not null default 0;          -- % de recargo sobre el costo -> efectivo
alter table items add column if not exists tipo_stock text not null default 'propio';  -- 'propio' | 'consignacion' | 'a_pedido'
alter table items add column if not exists stock integer;                              -- unidades; NULL = sin límite (a pedido)

-- Recargo por pagar en cuotas (%, por cliente). 0 = sin recargo.
alter table clientes add column if not exists recargo_cuotas integer not null default 0;

-- Pedidos internos: los carga el operador. La venta se cierra por WhatsApp;
-- esto es para ordenarlos, numerarlos, descontar stock e imprimir la comanda.
create table if not exists pedidos (
  id uuid primary key default gen_random_uuid(),
  cliente_id uuid not null references clientes(id) on delete cascade,
  -- Correlativo por cliente (1, 2, 3...). Lo que antes se numeraba a mano.
  numero integer not null,
  comprador text not null default '',
  telefono text not null default '',
  nota text not null default '',
  medio_pago text not null default '',
  -- ENTERO en pesos, con los precios que se vieron al armarlo.
  total integer not null default 0,
  creado_en timestamptz not null default now(),
  unique (cliente_id, numero)
);
create index if not exists pedidos_cliente_id_idx on pedidos(cliente_id);

create table if not exists pedido_items (
  id uuid primary key default gen_random_uuid(),
  pedido_id uuid not null references pedidos(id) on delete cascade,
  -- Se guarda el nombre y el precio del momento (si el ítem después cambia o
  -- se borra, la comanda vieja no miente). `item_id` queda de referencia.
  item_id uuid references items(id) on delete set null,
  nombre text not null,
  variante text not null default '',
  precio_unitario integer not null default 0,
  cantidad integer not null default 1
);
create index if not exists pedido_items_pedido_id_idx on pedido_items(pedido_id);

-- Mismo criterio que el resto: RLS on, sin policies (default-deny; la service
-- role bypassa). El navegador nunca habla con Supabase directo.
alter table pedidos enable row level security;
alter table pedido_items enable row level security;
