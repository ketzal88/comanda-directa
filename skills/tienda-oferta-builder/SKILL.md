---
name: tienda-oferta-builder
description: |
  Arma una oferta o promoción para una tienda online partiendo del margen, no del
  entusiasmo: elige qué producto, con qué mecánica, hasta qué descuento aguanta y
  por cuántos días. Usar cuando el pedido sea "armemos una promo", "qué oferta
  hacemos", "cuánto descuento le puedo poner", "necesito mover stock", "qué hacemos
  para el Hot Sale / Black Friday / Día de la Madre", o "subir el ticket promedio".
  Incluye el cálculo de ROAS de equilibrio para no vender a pérdida con ads.
allowed-tools:
  - Read
  - Write
  - Bash
---

# Tienda — constructor de ofertas

Una promo mal armada no es neutra: vende más y deja menos. Este skill arma la oferta
en un orden que hace imposible ese resultado, porque el margen se calcula **antes** de
elegir el descuento y no después.

**Este skill decide la oferta. No escribe el copy.** Los textos salen de `ad-copy-deck`.

---

## Paso 0 — Sin estos dos datos no hay oferta

1. **Costo unitario** del producto candidato.
2. **Stock disponible** de ese producto.

Falta alguno → no se arma la promo, se pide el dato. Una promo sin costo es una apuesta,
y una promo sin stock es un problema de atención al cliente esperando a pasar: agotar en
el día 2 de una campaña de 10 días quema el presupuesto de ads y deja gente enojada.

Si el cliente no tiene los costos a mano, sirve una planilla de dos columnas: SKU y costo.
Para sacar los candidatos del catálogo, corré primero `tienda-data-triage`.

---

## Paso 1 — Elegir el producto por objetivo

El producto correcto depende de qué querés que pase. Son objetivos distintos y se
excluyen entre sí: elegí uno.

| Objetivo | Qué producto va | Qué producto NO va |
|---|---|---|
| **Liquidar capital inmovilizado** | Los zombie: con stock y sin ventas en 90 días | El bestseller |
| **Subir el ticket promedio** | Complementos del bestseller, en bundle | El producto suelto con descuento |
| **Captar cliente nuevo** | Entrada de gama, bajo riesgo percibido, alta probabilidad de recompra | El producto premium |
| **Defender temporada alta** | El bestseller, con mecánica que no toque el precio de lista | Descuento directo al bestseller |

**La regla que más se rompe:** descontar el producto que ya se vende bien. No genera
demanda nueva — le regala margen a la venta que igual iba a ocurrir, y además entrena
al cliente a esperar la próxima promo antes de comprar a precio lleno.

---

## Paso 2 — Elegir la mecánica

El descuento porcentual directo es la mecánica más usada y casi siempre la peor. Hay
seis, y cada una hace algo distinto:

| Mecánica | Qué logra | Costo real para el margen | Cuándo va |
|---|---|---|---|
| **% de descuento directo** | Volumen rápido | El más alto: se aplica a todo, incluso a quien pagaba precio lleno | Liquidación real de stock muerto |
| **Bundle / combo** | Sube el ticket | Bajo: el descuento se reparte entre 2 o 3 productos | Objetivo AOV. La primera opción a probar. |
| **2x1 o 3x2** | Mueve unidades | Equivale a 50% o 33% en el producto regalado | Solo con margen arriba del 55% |
| **Envío gratis desde $X** | Sube el ticket, no toca el precio | Fijo y acotado: el costo del envío | Casi siempre la mejor relación esfuerzo/resultado |
| **Escalonado por monto** | Sube el ticket | Controlable por tramo | Catálogo con productos de precio parecido |
| **Regalo con compra** | Percepción alta, precio intacto | El costo del regalo, no su precio de venta | Cuando NO querés tocar el precio de lista |

Dos que valen doble: **envío gratis con piso** y **bundle**. Las dos suben el ticket
promedio sin comunicarle al mercado que tu precio de lista era negociable.

El piso del envío gratis se calcula, no se elige: **AOV × 1,15 a 1,25**. Más bajo que
eso y se lo regalás a quien ya compraba ese monto; más alto y nadie lo alcanza.

---

## Paso 3 — El cálculo que define el techo del descuento

Dos números, en este orden.

### Margen de contribución después del descuento

```
margen % = (precio con descuento − costo) ÷ precio con descuento
```

### ROAS de equilibrio

```
ROAS de equilibrio = 1 ÷ margen %
```

Es el ROAS mínimo que la campaña necesita para no perder plata. Debajo de eso, cada
venta que traen los ads cuesta más de lo que deja.

**Lo que casi nadie ve:** el descuento no baja el margen en la misma proporción, lo baja
mucho más rápido. Un 20% de descuento sobre un producto de 40% de margen no te deja 20%
de margen: te deja 25%, y te sube el ROAS necesario de 2,5x a 4,0x.

| Margen original | Descuento | Margen nuevo | ROAS de equilibrio | Unidades extra para ganar lo mismo |
|---|---|---|---|---|
| 50% | 10% | 44,4% | 2,3x | 1,25x |
| 50% | 20% | 37,5% | 2,7x | 1,67x |
| 50% | 30% | 28,6% | 3,5x | 2,50x |
| 40% | 10% | 33,3% | 3,0x | 1,33x |
| 40% | 20% | 25,0% | 4,0x | 2,00x |
| 40% | 30% | 14,3% | 7,0x | 4,00x |
| 30% | 10% | 22,2% | 4,5x | 1,50x |
| 30% | 20% | 12,5% | 8,0x | 3,00x |
| 30% | 30% | 0% | nunca cierra | imposible |

Leé la última columna antes de prometer nada. Un 30% off en un producto de 40% de margen
necesita **cuatro veces** las unidades para dejar la misma ganancia. Casi ninguna promo
multiplica por cuatro.

**Esta tabla es optimista.** El margen real está además neto de comisión de la pasarela
de pago, del envío que subsidiás y de impuestos sobre la venta. Si trabajás con el margen
bruto del producto, el ROAS de equilibrio verdadero es más alto que el de la tabla.
Cuando tengas esos números, restalos del margen antes de entrar en la tabla.

### El gate

- ROAS de equilibrio **por encima de 5x** → la mecánica no cierra. Volvé al paso 2 y
  elegí una que no toque el precio.
- **Nunca** propongas una promo cuyo ROAS de equilibrio sea mayor al ROAS histórico del
  cliente en ese canal. Sacá el histórico con `get_channel_metrics`, no de memoria.

---

## Paso 4 — La ventana

Las promos se acortan, no se estiran.

| Tipo | Duración | Por qué |
|---|---|---|
| Liquidación de zombie | 7 a 10 días | Suficiente para dos oleadas de creativos |
| Evento de calendario | Los días del evento y ni uno más | Extenderla le enseña al cliente que la fecha no importaba |
| Envío gratis con piso | Permanente | No es una promo, es una política de precio |
| Bundle | Permanente o por temporada | Es una oferta de catálogo, no un descuento |

Una promo sin fecha de fin no es una promo: es el precio nuevo. Si va a quedar, bajá la
lista y dejá de llamarla oferta.

---

## Paso 5 — El entregable

```
OFERTA — [cliente] — [fecha]

Objetivo: [liquidar stock / subir AOV / captar / defender temporada]

Producto: [SKU + nombre]
  Costo: $X · Precio lista: $Y · Stock: N unidades
  Margen actual: Z%

Mecánica: [una de las seis]
  Precio en promo: $W
  Margen en promo: Z2%
  ROAS de equilibrio: N,Nx
  ROAS histórico del canal: N,Nx  ← tiene que ser MAYOR al de equilibrio

Ventana: del DD/MM al DD/MM (N días)
Techo de unidades: N (= stock disponible)

CÓMO SE COMUNICA
  Canales: [Meta / email / WhatsApp / on-site]
  Los copies salen aparte con ad-copy-deck.

CUÁNDO SE CORTA ANTES
  - Stock por debajo de N unidades
  - ROAS real debajo de N,Nx a las 72 horas
```

Las condiciones de corte van escritas **antes** de lanzar. Definidas en caliente, con la
campaña andando y el cliente mirando, nunca se definen igual.

---

## Qué viene después

- Los copies → `ad-copy-deck` (formato obligatorio) + `paid-ads-meta` (ángulos)
- El mecanismo on-site (banner, popup, barra) → `popups`
- Email y WhatsApp del lanzamiento → `email-whatsapp-specialist`
- Calendario de temporada alta argentina y benchmarks de ROAS por margen →
  `ecommerce-marketing-manager`
- Sacar los candidatos del catálogo → `tienda-data-triage`

## Errores que se repiten

| Error | Qué pasa |
|---|---|
| Descontar el bestseller | Regalás margen sobre ventas que ya tenías |
| Promo sin fecha de fin | Deja de funcionar y ya no podés volver al precio de lista |
| 2x1 con margen debajo del 55% | Vendés a pérdida sin darte cuenta |
| Envío gratis sin piso | El ticket chico se come el margen entero |
| Descuento sobre precio ya inflado para la ocasión | El cliente compara con el histórico y lo ve |
| Promo mensual permanente | El mercado aprende a esperar y se muere la venta a precio lleno |
| No mirar el stock | Se agota el día 2 con el presupuesto de ads ya comprometido |
