# TEXMA · sistema de licencias

> Servidor: **Vercel** (funciones de `/api`) + **Supabase** (tabla `licenses`).
> El Worker de Cloudflare y su KV quedaron dados de baja.

**Desde la V1.3.0 esto está PRENDIDO**: `LIC_ON = true` en `TEXMA.html`. Para volver
a dejar la app libre, poner `false` y subir el `CACHE` de `sw.js`.

El muro aparece **después** del onboarding de 3 pantallas (esas se ven siempre, con
licencia o sin ella). Sin código válido la app no dibuja ninguna vista, no programa
avisos y **no registra el service worker** — o sea, tampoco se sigue actualizando sola.

### Código maestro

Hay una puerta de atrás para nuestros celulares: se escribe en el mismo campo del
muro y entra sin tocar el servidor ni quemar un código de venta. En el fuente vive
el SHA-256 de la frase (`const LIC_MASTER_SHA`), no la frase. Se cambia con
`node scripts/codigo-maestro.mjs "MI FRASE NUEVA"`. Vale la misma advertencia de la
tabla de abajo: quien sepa programar puede sacar el muro igual.

## Qué protege y qué no

| Situación | ¿Lo frena? |
|---|---|
| Pasar el link de entrega a otra persona | A medias — el link muestra el código, pero el código sirve en un solo celular |
| Pasar el código de activación a otra persona | Sí — queda atado al primer celular que lo canjea |
| Copiar el HTML/APK ya activado a otro celular | Sí — la licencia no valida (ID distinto) |
| Sacar la licencia del original y revenderla | Sí — al liberar hay que pedirnos reactivación |
| Alguien que sabe programar abre el HTML y borra el chequeo | **No.** Ninguna app web lo evita |

Si más adelante querés blindaje fuerte: empaquetar con Capacitor en un APK y ofuscar el bundle.
Sube mucho el costo de romperlo, pero tampoco es infinito.

## Cómo está armado

| Qué | Dónde |
|---|---|
| PWA | raíz del repo (`index.html`, `sw.js`, …) servida por Vercel |
| Panel de ventas | `admin.html` → `https://TU-SITIO.vercel.app/admin` |
| Canje del código | `POST /api/activate` · `api/activate.mjs` |
| Link de entrega | `/d/<token>` → `api/claim.mjs` (reescrito en `vercel.json`) |
| Panel (login, lista, nueva, entrega, reset, revocar) | `/api/admin/*` · `api/admin/[accion].mjs` |
| Datos | tabla `licenses` de Supabase · `supabase/licenses.sql` |

## Puesta en marcha (una sola vez)

1. **La tabla**: Supabase → SQL Editor → pegar `supabase/licenses.sql` → Run.
2. **Las variables** (`.env` en local, Vercel → Settings → Environment Variables en producción):
   `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE`, `ADMIN_PASS`, `LIC_PRIV`. Ver `.env.example`.
   - `LIC_PRIV` tiene que ser la pareja de `LIC_PUB` de `TEXMA.html`. Si la vieja
     se perdió: `node server/keygen.mjs`, se **agrega** la pública nueva a `LIC_PUBS`
     (sin borrar la vieja: las licencias ya activadas están firmadas con ella).
3. **Local**: `npm i -g vercel` · `vercel login` · `npm run local` → http://localhost:3000
   (panel en http://localhost:3000/admin).
4. **Producción**: `npm run web:deploy` (o `vercel deploy --prod`). Anotá la URL y
   ponela en `LIC_API_URL` de `TEXMA.html`: es la que usa el APK (en la web las
   llamadas son relativas).
5. **Migrar las ventas viejas del KV** (una vez, antes de borrar el Worker):
   `npx wrangler login` · `npm run migrar:kv -- --dry` · `npm run migrar:kv`.

## Panel

Una sola contraseña, la de `ADMIN_PASS`. Al entrar ponés tu nombre: queda
anotado como «vendedor» en cada venta y el resumen muestra el total por
vendedor. Cambiar `ADMIN_PASS` (y redesplegar) cierra todas las sesiones.

## Vender

1. Cobrás.
2. En el panel: *Nueva venta* → nombre + contacto → **Generar link único**.
3. Le mandás ese link por WhatsApp. Al abrirlo entra a TEXMA con el código ya cargado y se activa sola.
4. El link muere ahí. El código queda pegado a ese celular.

## Casos que van a pasar

- **"Cambié de celular"** → panel → *Liberar celu* → que abra la app y pegue su código.
- **"Formateé y perdí todo"** → igual que arriba. Que antes exporte la copia de seguridad desde Ajustes.
- **Alguien revendió** → panel → *Dar de baja*. La app deja de validar en la próxima apertura.

## Datos

Nada de lo que carga la usuaria sale del celular. El servidor solo guarda:
código, nombre, contacto, precio, ID anónimo del dispositivo y fechas.
