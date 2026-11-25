-- Pedido interno en UNA transacción, y el ocultamiento por stock del cron
-- separado de `activo`.
--
-- Antes el pedido eran 4 llamadas sueltas desde Node (numerar, insertar
-- pedido, insertar líneas, leer y pisar stock): si una fallaba quedaba un
-- pedido sin líneas o sin descontar, y dos pedidos a la vez podían repetir
-- número o pisarse el stock. Acá todo pasa o nada pasa.
--
-- HAY QUE APLICARLA ANTES DE DEPLOYAR el código que la usa.

-- El cron de la planilla (sync-stock) oculta lo que no tiene stock. Antes
-- escribía `activo`, y pisaba lo que el operador había ocultado o mostrado a
-- mano desde el panel. Ahora escribe esta columna; la carta muestra un ítem
-- sólo si `activo and not oculto_por_stock`.
alter table items add column if not exists oculto_por_stock boolean not null default false;

create or replace function crear_pedido_interno(
  p_cliente_id uuid,
  p_comprador text,
  p_telefono text,
  p_nota text,
  p_medio_pago text,
  p_lineas jsonb -- [{item_id, nombre, variante, precio_unitario, cantidad}]
) returns pedidos
language plpgsql
set search_path = public
as $$
declare
  v_numero integer;
  v_pedido pedidos;
begin
  if jsonb_typeof(p_lineas) <> 'array' or jsonb_array_length(p_lineas) = 0 then
    raise exception 'El pedido no tiene productos.';
  end if;

  -- Serializa los pedidos del mismo cliente: el correlativo no se repite.
  perform 1 from clientes where id = p_cliente_id for update;
  if not found then
    raise exception 'Cliente inexistente.';
  end if;

  select coalesce(max(numero), 0) + 1 into v_numero from pedidos where cliente_id = p_cliente_id;

  insert into pedidos (cliente_id, numero, comprador, telefono, nota, medio_pago, total)
  select p_cliente_id, v_numero, p_comprador, p_telefono, p_nota, p_medio_pago,
         coalesce(sum(greatest((l->>'precio_unitario')::int, 0) * (l->>'cantidad')::int), 0)
  from jsonb_array_elements(p_lineas) l
  returning * into v_pedido;

  -- `item_id` sólo queda si el ítem es de este cliente.
  insert into pedido_items (pedido_id, item_id, nombre, variante, precio_unitario, cantidad)
  select v_pedido.id, i.id, l->>'nombre', coalesce(l->>'variante', ''),
         (l->>'precio_unitario')::int, (l->>'cantidad')::int
  from jsonb_array_elements(p_lineas) l
  left join items i on i.id = nullif(l->>'item_id', '')::uuid and i.cliente_id = p_cliente_id;

  -- Descuento en el mismo UPDATE (sin leer y pisar desde Node). 'a_pedido' y
  -- stock NULL (sin límite) no descuentan. En 0 queda agotado.
  update items it
  set stock = greatest(it.stock - v.cant, 0),
      agotado = it.agotado or it.stock - v.cant <= 0
  from (
    select nullif(l->>'item_id', '')::uuid as item_id, sum((l->>'cantidad')::int) as cant
    from jsonb_array_elements(p_lineas) l
    where nullif(l->>'item_id', '') is not null
    group by 1
  ) v
  where it.id = v.item_id
    and it.cliente_id = p_cliente_id
    and it.stock is not null
    and it.tipo_stock <> 'a_pedido';

  return v_pedido;
end;
$$;

-- Sólo la service role (las rutas del panel). Sin esto PostgREST la expone
-- a `anon` con la publishable key.
revoke execute on function crear_pedido_interno(uuid, text, text, text, text, jsonb) from public, anon, authenticated;
grant execute on function crear_pedido_interno(uuid, text, text, text, text, jsonb) to service_role;
