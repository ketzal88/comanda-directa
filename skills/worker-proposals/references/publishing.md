# Publicar propuestas en Worker Brain (MCP)

El MCP `Worker Brain` publica HTML en `brain.worker.ar/p/{slug}` y devuelve un
`publicUrl` listo para compartir con el cliente.

## Tools

### `upload_proposal`
Sube o reemplaza una propuesta. Si el slug ya existe hace **upsert**: reemplaza
el HTML y preserva el `createdAt`.

| Parametro     | Req | Detalle |
|---------------|-----|---------|
| `htmlContent` | si  | HTML completo y auto-contenido. Incluye `<!DOCTYPE html>`, `<head>` con todo el CSS inline, `<body>`. **No se permiten assets externos relativos.** Fonts por CDN absoluto (Google Fonts) si funcionan. |
| `title`       | si  | Titulo visible (ej: "Analisis Performance Meta - Bielfer"). |
| `clientName`  | no  | Nombre del cliente para la lista admin. |
| `description` | no  | Descripcion corta que aparece en el preview del link al compartir (WhatsApp, Slack, etc.). Cargarla siempre: mejora el preview. |
| `slug`        | no  | URL slug. Solo minusculas, numeros y guiones. Si no se manda se deriva del title. |
| `isPrivate`   | no  | Default false. Si es true solo los owners la ven en la lista admin, pero el link publico igual funciona para el cliente. |

### `list_proposals`
Lista lo ya publicado. Filtros: `clientName` (exacto), `search` (libre, case-insensitive), `limit`.
Devuelve `title`, `slug`, `clientName`, `isPrivate`, `publicUrl`.

## Reglas de uso

1. **Siempre verificar el slug antes de subir.** Correr `list_proposals` con
   `search` o `clientName` para ver si ya existe. Si existe y la intencion es
   actualizar, reusar el mismo slug (upsert). Si es una propuesta nueva y el
   slug choca, elegir otro para no pisar la anterior.

2. **Publicar es una accion publica: pedir confirmacion explicita.** Antes de
   llamar `upload_proposal`, mostrar al usuario el slug propuesto, el title y si
   va privada o publica, y esperar el OK. No publicar de una salvo que el
   usuario ya haya dicho explicitamente "subilo" / "publicalo".

3. **Auto-contenido o no renderiza.** Antes de subir, chequear que no haya
   rutas relativas (`src="./..."`, `href="assets/..."`). Todo CSS inline en
   `<head>`, imagenes en base64 o URL absoluta, fonts por CDN absoluto.

4. **Slug legible.** Patron `{tipo}-{cliente}` o `{cliente}-{campania}`, ej:
   `propuesta-elepants-dia-del-padre`, `analisis-meta-bielfer`. Sin acentos,
   sin espacios, sin mayusculas.

5. **Devolver el `publicUrl`.** Despues de subir, pasarle al usuario el link
   final tal cual lo devuelve el MCP.
