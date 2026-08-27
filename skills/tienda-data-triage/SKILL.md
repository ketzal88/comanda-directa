---
name: tienda-data-triage
description: |
  Convierte un export crudo de una tienda online (pedidos, productos, clientes)
  en las tres o cuatro decisiones que ese archivo habilita. Usar cuando aparezca
  un CSV o Excel de Tiendanube, Shopify o WooCommerce y haya que responder
  "qué me dice esto", "qué producto empujo", "qué saco", "cuánto vale un cliente",
  "por qué bajaron las ventas", o antes de planificar campañas y ofertas para una
  tienda. También cuando el pedido es "analizá las ventas" o "mirá este export".
allowed-tools:
  - Read
  - Write
  - Bash
  - Grep
---

# Tienda — triage de datos

Un export de tienda tiene entre 15 y 60 columnas y casi ninguna sirve sola. Este skill
va de archivo crudo a decisiones, sin pasar por el informe de 12 páginas que nadie lee.

**Regla de salida:** el entregable son **3 o 4 decisiones**, cada una con el número que
la sostiene. No un dashboard. Si un número no cambia ninguna decisión, no va.

---

## Paso 0 — El gate del costo

Antes de calcular nada, respondé esto:

> ¿Tenés el **costo unitario** de cada producto?

- **Sí** → podés hablar de margen, de rentabilidad y de hasta dónde descontar.
- **No** → podés hablar de **facturación, unidades y frecuencia**, nada más.

Esta distinción no es un detalle. El producto que más factura y el que más deja
casi nunca son el mismo, y confundirlos hace que se escale el equivocado. Si no está
el costo, **pedilo antes de seguir** y decí explícitamente en el entregable que los
números son de facturación, no de ganancia.

Pedilo así: *"¿me pasás el costo por producto? Con una planilla de dos columnas
(SKU y costo) alcanza. Sin eso puedo decirte qué vende, pero no qué te conviene vender."*

---

## Paso 1 — Leer el archivo antes de creerle

**No asumas los nombres de las columnas.** Cambian por idioma de la tienda, por versión
del panel y por plataforma. Un cálculo sobre una columna que no es la que pensás falla
sin dar error.

Primero listá qué hay realmente:

```bash
head -1 pedidos.csv | tr ',' '\n' | nl
wc -l pedidos.csv
```

Después mapeá **por concepto**, no por nombre. Estos son los conceptos que necesitás
y hay que encontrar cuál columna los tiene:

| Concepto | Cómo reconocerla |
|---|---|
| Identificador de pedido | Número que se repite en varias filas si el export es por línea de producto |
| Fecha del pedido | Ojo con el formato y con la zona horaria |
| Estado de pago | Pagado / pendiente / reembolsado |
| Estado del pedido | Abierto / cerrado / **cancelado** |
| Email o ID del cliente | Es lo que permite medir recompra |
| SKU o nombre del producto | Si no hay SKU, el nombre es la clave — con sus errores de tipeo |
| Cantidad | Por línea, no por pedido |
| Precio unitario y total | Suelen convivir con y sin impuestos y con y sin envío |
| Canal / origen de venta | En Tiendanube separa web de MercadoLibre |
| Cupón o descuento aplicado | Sin esto el margen queda inflado |

**Una fila no es un pedido.** La mayoría de los exports traen una fila **por producto
dentro del pedido**. Contar filas y llamarlas "pedidos" infla todo entre un 30% y un 80%.
Verificá: si el identificador de pedido se repite, tenés que agrupar antes de contar.

---

## Paso 2 — Limpiar lo que miente

Cuatro cosas ensucian todo export de tienda. Se sacan siempre, y se dice cuántas se sacaron:

1. **Cancelados y reembolsados.** Están en el archivo y suman facturación que no existió.
   Filtralos y reportá el monto que representaban: si es más del 5%, ya es un hallazgo
   en sí mismo.
2. **Pedidos de prueba.** Los del propio dueño, los de $1, los que tienen el email de
   la agencia. Se detectan por email repetido con montos raros.
3. **Ventas de otros canales metidas en la misma tabla.** En Tiendanube el campo de
   canal distingue la web de MercadoLibre, del punto de venta y de las cargas manuales.
   Mezclarlos hace que el "AOV de la tienda" no sea el de la tienda. Segmentá o aclaralo.
4. **Envío dentro del total.** Si el total incluye envío, el margen por producto sale mal.
   Restalo si la columna existe.

Los montos suelen venir como **texto**, no como número — con separador de miles, con
símbolo de moneda, o con coma decimal. Convertí explícitamente antes de sumar, o vas a
estar sumando strings y no vas a enterarte.

---

## Paso 3 — Los seis números

Solo estos. Cada uno existe porque habilita una decisión concreta.

### 1. Ticket promedio (AOV)
Facturación válida ÷ cantidad de **pedidos** (agrupados, no filas).
→ *Habilita:* el piso de envío gratis y si conviene empujar bundles.

### 2. Concentración del catálogo
Qué porcentaje de la facturación hacen los 10 productos más vendidos.
→ *Habilita:* dónde poner el presupuesto de ads. Si el top 10 hace más del 60%, el
catálogo largo es decorado y no vale la pena promocionarlo.

### 3. Margen por producto *(solo si pasó el gate del paso 0)*
`(precio de venta − costo) ÷ precio de venta`, ponderado por unidades vendidas.
→ *Habilita:* qué se puede descontar y qué no. Cruzalo con el punto 2: el cuadrante
interesante es **alto volumen + alto margen**, y casi nunca es el producto que el
dueño cree.

### 4. Productos zombie
Los que tienen stock y **cero o casi cero** unidades vendidas en los últimos 90 días.
→ *Habilita:* la oferta. Es capital inmovilizado, y es el mejor candidato a promo
porque liquidarlo con descuento sigue siendo mejor que no venderlo.

### 5. Tasa de recompra
Clientes con 2 o más pedidos ÷ clientes totales, en una ventana fija (12 meses sirve).
→ *Habilita:* la decisión entre invertir en captación o en retención. Debajo del 20%
en un rubro de consumo repetido, el problema no es el tráfico: es que no hay email
ni WhatsApp trabajando.

### 6. Ventana de recompra
Días **medianos** entre el primer y el segundo pedido de quienes recompraron.
Mediana, no promedio: un cliente que volvió a los 400 días te corre el promedio entero.
→ *Habilita:* cuándo dispara el flujo de recompra. Se programa a ~70% de esa ventana.

---

## Paso 4 — El entregable

Formato fijo. Corto.

```
LO QUE DICE EL ARCHIVO
- Período: [fechas reales del export, no las pedidas]
- Pedidos válidos: N (se descartaron M cancelados/reembolsados = $X)
- Base de cálculo: [con costo / sin costo — facturación solamente]

LOS NÚMEROS
[tabla de los 6, con el valor y una línea de lectura cada uno]

LAS DECISIONES
1. [Acción concreta] — porque [número]
2. [Acción concreta] — porque [número]
3. [Acción concreta] — porque [número]

LO QUE NO PUEDO RESPONDER CON ESTO
- [qué falta y qué habría que pedir]
```

Esa última sección es obligatoria. Un export de pedidos no tiene tráfico, ni sesiones,
ni de dónde vino la venta. Decir "la conversión es X" con solo pedidos es inventar.

---

## De dónde sale el export

| Plataforma | Camino |
|---|---|
| **Tiendanube** | Panel → Pedidos → Exportar. Y por separado Productos → Exportar, Clientes → Exportar. Llegan por email como archivo descargable. |
| **Shopify** | Orders → Export → seleccionar rango y "All orders". Para costos: Products → Inventory, columna de costo por artículo. |
| **WooCommerce** | Analytics → cualquier reporte → Download. Para el detalle crudo conviene un plugin de export de pedidos. |

En Tiendanube el costo por producto **no siempre está cargado** en el panel. Si no está,
va a venir del dueño en una planilla aparte. Contalo como parte del pedido inicial.

---

## Dónde van los archivos

Los exports son **insumo crudo, no memoria del cliente**. Van a `upload/` dentro de la
carpeta del cliente, que está fuera del control de versiones. Lo que sí se guarda es la
conclusión: el entregable en `deliverables/` y la decisión en `worklog.md`.

---

## Qué viene después

- Armar la promo con lo que encontraste → `tienda-oferta-builder`
- Escribir los anuncios → `ad-copy-deck` para el formato, `paid-ads-meta` para los ángulos
- Métricas de canal, ROAS y benchmarks → `ecommerce-marketing-manager`

## Errores que se repiten

| Error | Por qué duele |
|---|---|
| Contar filas como pedidos | Infla pedidos y desinfla el AOV. El error más común de todos. |
| Llamar rentabilidad a la facturación | Se escala el producto que más vende y menos deja. |
| Promediar la ventana de recompra | Un outlier de 400 días corre el flujo de email semanas. |
| Mezclar MercadoLibre con la web | Otro ticket, otro margen, otra elasticidad. Son dos negocios. |
| Reportar el período pedido en vez del real | El export suele traer menos días de los que pediste. Leé la fecha mínima y máxima reales. |
| Sumar montos sin convertirlos a número | Vienen como texto. La suma no falla: da mal y sigue. |
