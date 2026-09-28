# Dónde va el sonido de los avisos

El mp3 propio de TEXMA va en:

```
android/app/src/main/res/raw/notif_texma.mp3
```

Reglas de Android para esa carpeta — **si no se cumplen, el build falla**:

- todo en **minúsculas**
- **guión bajo**, nunca guión medio (`notif-texma.mp3` NO sirve)
- sin espacios, sin acentos, sin mayúsculas, sin empezar con número
- y **nada de otros archivos ahí adentro**: todo lo que se ponga en `res/raw/`
  Android lo trata como recurso, hasta un `.txt` rompe la compilación

Recomendado: 1–2 segundos, mp3 o wav, menos de 100 KB.

## El otro sonido: la ALARMA

`alarma_texma.wav` (15 s) es el de las alarmas de la agenda, y va en la
misma carpeta. No se baja de ningún lado: lo genera

```bash
npm run sonido:alarma
```

Un aviso de 1 segundo para una cita importante se pierde; por eso son dos
archivos y **dos canales distintos** (`texma-avisos-2` y `texma-alarma-1`):
en Android el sonido se define por canal, no por notificación.

Después:

```bash
npm run sync
npm run apk:debug
```

El mismo sonido va también en la raíz del proyecto, **con el mismo nombre**
`notif_texma.mp3` — ese es el que usa la versión web/PWA. Un solo nombre en
todo el proyecto: nunca guión medio, ni en la raíz ni en `res/raw/`.

## ⚠ Si más adelante cambiás el mp3

Android **congela** el sonido dentro del canal de notificaciones cuando la app
se instala. En los celulares que ya la tenían va a seguir sonando el viejo.
Para forzar el cambio hay que cambiar el id del canal en `TEXMA.html`:

```js
const CANAL='texma-avisos';   // → 'texma-avisos-2'
```
