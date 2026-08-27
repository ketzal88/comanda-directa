---
name: grand-slam-offer
description: |
  Construye una oferta de servicio desde cero cuando la que hay no da vuelta el
  numero: define el resultado prometido, el stack de valor, la prueba y en que
  escalones se vende (DFY / DWY / DIY). Usar cuando el pedido sea "la oferta no
  cierra", "por que no convierte si el trafico esta bien", "que le agregamos",
  "cuanto cobramos por esto", "armemos un plan de entrada", "necesitamos algo mas
  fuerte que la competencia" o el cliente arranca un servicio nuevo. Basado en la
  Value Equation ($100M Offers), adaptado a servicios argentinos.
allowed-tools:
  - Read
  - Write
metadata:
  category: foundation
  upstream:
    - avatar-extraction
  downstream:
    - offer-extraction
    - schwartz-awareness-mapper
---

# Grand Slam Offer — constructor de ofertas de servicio

Cuando una campana tiene buen CTR, buen CPC y mal CPA, el problema casi nunca esta en
los ads. Esta en que lo que se ofrece del otro lado del clic no vale lo que cuesta
decidirlo. Este skill arregla eso: no escribe el anuncio, **cambia lo que el anuncio
tiene para ofrecer**.

**Este skill decide la oferta. No escribe el copy.** Los textos salen de `ad-copy-deck`
y el angulo de `offer-extraction`.

---

## Antes de abrirlo: ¿es este el skill?

| Situacion | Skill |
|---|---|
| Tienda online, promo o descuento, hay que cuidar el margen | `tienda-oferta-builder` |
| Servicio, B2B, inmobiliaria, high-ticket, consultoria | **este** |
| La oferta ya existe y funciona, falta el angulo para el ad | `offer-extraction` |
| La oferta ya existe, falta saber a que nivel de conciencia hablarle | `schwartz-awareness-mapper` |

Si el cliente vende productos fisicos por tienda, salite de aca. La logica del margen es
otra y `tienda-oferta-builder` la tiene.

---

## Paso 0 — El diagnostico manda

La Value Equation dice que el valor percibido de una oferta es:

```
              resultado deseado  x  probabilidad percibida de lograrlo
  valor  =  ------------------------------------------------------------
                    tiempo hasta el resultado  x  esfuerzo del comprador
```

No es una formula para calcular nada. Es un **diagnostico de cuatro casillas**: la
oferta que no convierte tiene roto uno de los cuatro terminos, y cada uno se arregla
distinto. Empezar a agregar bonos sin saber cual esta roto es como subir el presupuesto
sin saber que campana convierte.

Preguntale al cliente (o mira los datos) y ubica el sintoma:

| Sintoma real | Termino roto | A que paso ir |
|---|---|---|
| "Esta bueno pero no es para mi ahora" | Resultado deseado | Paso 1 |
| "¿Y esto funciona? ¿Tenes casos?" | Probabilidad percibida | Paso 3 (prueba) y 4 (stack) |
| "Lo dejamos para mas adelante" | Tiempo hasta el resultado | Paso 2 |
| "Se me hace mucho quilombo ahora" | Esfuerzo del comprador | Paso 2 y 5 (DFY) |
| "Esta caro" | **Ninguno. Es sintoma, no causa.** | Ver abajo |

**"Esta caro" nunca es el problema.** Es como se pronuncia cualquiera de los otros
cuatro. Nadie dice "no confio en que funcione", dice "esta caro". Si el cliente te pide
bajar el precio, resolve primero cual de los cuatro terminos esta flojo; casi siempre
es la probabilidad percibida y se arregla con prueba, no con descuento.

---

## Paso 1 — El resultado prometido

El numerador de arriba. Tiene que ser una sola frase que el comprador ya queria antes
de conocer al cliente.

Tres filtros, los tres o no sirve:

1. **Especifico.** "Mas clientes" no. "6 reuniones agendadas por mes con empresas de
   50+ empleados" si.
2. **Del comprador, no del proveedor.** "Gestion integral de tus redes" es lo que hace
   el proveedor. "Que te entren consultas por WhatsApp sin que tengas que postear vos"
   es lo que le pasa al comprador.
3. **Verificable.** Si nadie puede decir al final si paso o no paso, no es un resultado,
   es una sensacion.

Escribilo asi y no de otra forma:

> Consegui **[resultado especifico]** en **[plazo]** sin **[el sacrificio que espera hacer]**.

El "sin" es la mitad del trabajo. Es donde entra lo que el comprador cree que le va a
costar y vos le sacas de encima.

---

## Paso 2 — Acortar el tiempo y el esfuerzo

El denominador. Los dos terminos que mas rapido mueven la aguja y los que menos plata
cuestan.

**Tiempo:** el numero que importa no es cuanto tarda el resultado completo, es **cuanto
tarda la primera senal de que va a funcionar**. Si el resultado real llega a los 90 dias,
la oferta necesita algo visible en la primera semana o el comprador la vive como una
apuesta a ciegas.

Preguntas para encontrarla:
- ¿Que puede ver el cliente el dia 3 que hoy no ve?
- ¿Que parte del trabajo ya esta hecha antes de empezar (plantilla, auditoria, setup)?
- ¿Que se puede entregar armado en vez de pedirselo?

**Esfuerzo:** contar los pasos que el comprador tiene que dar entre que firma y que ve
el resultado. Cada decision que le queda a el es una posibilidad de que se frene.

- Reemplazar "mandanos tus materiales" por "te mandamos un formulario de 6 campos"
- Reemplazar "definamos el publico" por "te propusimos 3 publicos, elegi uno"
- Reemplazar cualquier hoja en blanco por una plantilla con ejemplo

---

## Paso 3 — La probabilidad percibida, sin garantia

**Ningun cliente de Worker ofrece garantia.** Ninguno firmo una hasta hoy y no hay que
proponerla como default (estado a agosto 2026). El material de Hormozi apoya casi toda
la probabilidad percibida en la garantia; aca esa palanca no existe, asi que hay que
construirla con lo unico que queda: **prueba**.

Prueba, en orden de fuerza real:

**1. Un numero especifico y verificable.** Es lo mas fuerte que hay y casi siempre esta
disponible en el Brain o en el worklog. No "muchos clientes conformes" sino "18 consultas
por WhatsApp en marzo" o "4,8 con 1.377 resenas". El numero raro convence mas que el
redondo, porque el redondo se lee como inventado.

**2. Bajar la apuesta del primer paso.** Cuando no podes prometer el resultado, achica
lo que arriesga por averiguarlo: mes sin permanencia, diagnostico previo sin costo,
arrancar por un solo canal antes del paquete completo. Mueve el mismo termino que la
garantia y no compromete a nadie.

**3. Mostrar el proceso.** Que el comprador vea de antemano que va a pasar semana por
semana baja la incertidumbre sin prometer un resultado. "El dia 3 tenes el plan, el dia
10 los primeros anuncios corriendo, el dia 30 el reporte" es una promesa de **trabajo**,
que si se puede cumplir.

**4. Prueba social especifica.** Un caso parecido al del comprador vale mas que diez
genericos. Sale de `case-study-builder` y `testimonial-collector`.

Reglas duras:

- **No escribir una garantia que nadie firmo.** En Argentina lo que dice el anuncio
  integra el contrato (Ley 24.240, art. 8): una garantia enunciada es exigible aunque
  haya sido un recurso de copy. Si algun dia un cliente quiere ofrecer una, va al
  contrato primero y al ad despues.
- **Los numeros salen del Brain en vivo, no del CLAUDE.md del cliente.** Los snapshots
  quedan viejos. Traelos con `get_channel_metrics` antes de ponerlos en una oferta.
- **Si no hay ningun numero presentable, decilo.** Una oferta sin prueba se sostiene en
  el paso 1 y 2 (resultado claro, primer hito rapido), no en adjetivos.

---

## Paso 4 — El stack de valor (con freno de mano)

Cada componente que se agrega tiene que matar una objecion concreta. Si no mata ninguna,
no suma valor: suma confusion y baja la claridad de la oferta.

El orden correcto es objecion primero, componente despues:

```
objecion  ->  que la desarma  ->  componente con nombre y formato
```

Ejemplo:
- "No tengo tiempo de sacar las fotos" -> se lo sacamos de encima -> **Sesion de
  producto incluida, 20 fotos editadas, mes 1**
- "No se leer los numeros" -> se los traducimos -> **Reporte mensual de 1 pagina con
  las 3 decisiones del mes**

### Lo que NO se importa de Hormozi

Esto es lo que hay que dejar del lado de afuera. El material original esta escrito para
info-products y coaching de Estados Unidos, y tres de sus movidas mas caracteristicas
funcionan como senal de chanta en el mercado argentino:

1. **Precios de anclaje inventados.** "Valor $2.000 USD, hoy incluido" cuando ese bono
   nunca se vendio a $2.000. Es el tell mas rapido de infoproducto trucho. Los
   componentes se listan por lo que hacen, no por un precio fantasma.
2. **Urgencia falsa.** "Solo 3 lugares" cuando hay los que sean. Ademas de quemar la
   marca, es publicidad enganosa bajo la misma ley del paso 3.
3. **Stacks de 9 bonos.** Mas de 4 o 5 componentes y el comprador deja de leer. Cada
   bono que agregas le baja el peso a los otros.

Si el resultado del stack se lee como una landing de curso de trading, hay que sacar
cosas. Pasada de `humanizer` obligatoria antes de que esto llegue a un cliente.

---

## Paso 5 — La escalera de entrega

La misma oferta se puede vender en tres formatos, y elegir mal el formato hunde una
propuesta que estaba bien:

| Formato | Quien ejecuta | Valor percibido | Escalabilidad | Va cuando |
|---|---|---|---|---|
| **DIY** | El comprador | Bajo | Alta | El problema es simple y el precio tiene que ser bajo |
| **DWY** | Los dos | Medio | Media | Acompanar mejora el resultado y hay presupuesto medio |
| **DFY** | Worker / el cliente | Alto | Baja | Urge, es complejo, o el comprador no tiene ni tiempo ni skill |

Para la mayoria de los clientes B2B de Worker el default correcto es **DFY**, porque el
comprador es un dueno o gerente sin tiempo, y porque el valor percibido es donde mas
falta hace. DIY solo tiene sentido como escalon de entrada barato para captar y despues
subir.

**Escalera de 3 escalones** (opcional, pero es lo que sube el ticket promedio):

- **Entrada** — algo chico, rapido, que ya entrega un resultado. Sirve para que prueben.
- **Core** — la oferta principal, la del paso 1.
- **Premium** — el core mas acceso, mas velocidad o mas alcance.

No armes los tres a la vez. Arranca por el core; los otros dos salen despues, cuando el
core ya se vendio al menos una vez.

---

## Salida

**No generar un documento de 13 secciones.** La oferta terminada entra en menos de una
pagina y va como bloque corto:

```
RESULTADO      Consegui [X] en [plazo] sin [sacrificio].
PARA           [a quien, del icp.md]
INCLUYE        - componente 1 (mata: objecion)
               - componente 2 (mata: objecion)
               - componente 3 (mata: objecion)
PRUEBA         [el numero del paso 3 + de donde salio]
FORMATO        DFY / DWY / DIY + escalones si los hay
PRECIO         [numero] — [por que ese numero]
PRIMER HITO    Que ve el comprador en los primeros [N] dias
```

Despues:

1. Guardar en `clients/{tipo}/{slug}/deliverables/YYYY-MM-DD-oferta-{servicio}.md`
2. Entrada en el `worklog.md` del cliente con la decision y el por que
3. Si va a presentacion, el HTML sale de `worker-proposals` — no reescribir el bloque
   de arriba en prosa larga
4. Si de aca salen ads, seguir con `offer-extraction` -> `schwartz-awareness-mapper` ->
   `ad-copy-deck`

---

## Origen

La Value Equation, el stack de bonos y la escalera DFY/DWY/DIY vienen de *$100M Offers*
(Alex Hormozi). El plugin `hormozi-skills` (MIT, instalado en la maquina de Gabriel)
tiene el material completo en ingles y mas granular si hace falta profundizar.

Lo que se cambio: el diagnostico de 4 terminos como puerta de entrada (en el
original cada palanca es una skill suelta), el paso 3 reescrito con prueba en vez de
garantia (ningun cliente de Worker firma una, y en Argentina la enunciada es exigible),
los tres anti-patrones del paso 4, y la salida corta en vez del documento largo.
