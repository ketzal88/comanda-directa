-- Descuento por forma de pago ("10% pagando en efectivo o transferencia").
-- Un medio que no figura en el objeto no descuenta nada.
alter table clientes
  add column if not exists descuentos_pago jsonb not null default '{}'::jsonb;
