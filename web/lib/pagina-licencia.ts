/* La página del link de entrega /d/<token> (HTML suelto, sin consumir nada).
   Portada tal cual de api/_lib/pagina.mjs del proyecto viejo de la PWA.
   estado: 'nuevo' | 'listo' | 'vencido' | 'muerto' */
export type EstadoLink = 'nuevo' | 'listo' | 'vencido' | 'muerto';

export function paginaLink({ estado, code = '', apk = '', pwa = '', version = '', token = '' }:
  { estado: EstadoLink; code?: string; apk?: string; pwa?: string; version?: string; token?: string }) {
  const esc = (s: string) => String(s || '').replace(/[&<>"']/g, c =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' } as Record<string, string>)[c]);
  const html = `<!doctype html><html lang="es"><head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="robots" content="noindex,nofollow">
<meta name="color-scheme" content="only light">
<title>TEXMA · Tu licencia</title>
<style>
*{box-sizing:border-box;margin:0;padding:0}
body{background:#FBF7F2;color:#2B2622;font-family:system-ui,-apple-system,Segoe UI,sans-serif;
  line-height:1.5;padding:26px 18px 60px;display:flex;justify-content:center}
.wrap{width:100%;max-width:430px}
h1{font-family:Georgia,serif;font-style:italic;font-size:27px;margin-bottom:4px}
.sub{color:#75695C;font-size:13.5px;margin-bottom:20px}
.card{background:#fff;border:1px solid #EFE7DC;border-radius:20px;padding:20px;margin-bottom:14px;
  box-shadow:0 1px 2px rgba(43,38,34,.04),0 6px 18px rgba(43,38,34,.05)}
.lbl{font-size:10px;letter-spacing:1.6px;text-transform:uppercase;color:#75695C;margin-bottom:10px}
.code{font-family:ui-monospace,SFMono-Regular,monospace;font-size:23px;font-weight:700;letter-spacing:1.5px;
  background:#FBD9E6;color:#A61048;border-radius:14px;padding:15px 10px;text-align:center;word-break:break-all}
button,a.btn{display:block;width:100%;text-align:center;text-decoration:none;font:inherit;font-weight:700;
  border:none;border-radius:14px;padding:15px;margin-top:11px;cursor:pointer}
.p{background:#EC1968;color:#fff;box-shadow:0 4px 14px rgba(236,25,104,.28)}
.g{background:#fff;color:#2B2622;border:1px solid #EFE7DC}
.p:disabled{opacity:.55;box-shadow:none}
.paso{font-size:14px;color:#4A423B;margin-top:12px}
.paso b{display:block;font-size:11px;letter-spacing:1.2px;text-transform:uppercase;color:#75695C;margin-bottom:2px}
.err{color:#9C3B2E;font-size:13.5px;margin-top:12px;min-height:18px}
.hide{display:none!important}
</style></head><body><div class="wrap">
<h1>TEXMA</h1>
<div class="sub" id="sub">Tu planner personal.</div>

<div class="card ${estado === 'nuevo' ? '' : 'hide'}" id="cReclamar">
  <div class="lbl">Tu licencia te está esperando</div>
  <div class="paso">Tocá el botón y te muestro tu código y los links de descarga.
    Se reclama una sola vez, así que hacelo vos desde tu celular.</div>
  <button class="p" id="go">Reclamar mi licencia</button>
  <div class="err" id="err"></div>
</div>

<div class="card ${estado === 'listo' ? '' : 'hide'}" id="cCodigo">
  <div class="lbl">Tu código de licencia</div>
  <div class="code" id="cod">${esc(code)}</div>
  <button class="g" id="copiar">Copiar el código</button>
  <div class="paso" style="margin-top:16px"><b>Guardalo</b>
    Se pega una sola vez, la primera vez que abrís la app, y queda atado a ese celular.</div>
</div>

<div class="card ${estado === 'listo' ? '' : 'hide'}" id="cBajar">
  <div class="lbl">Bajate la app</div>
  <a class="btn p ${apk ? '' : 'hide'}" id="apk" href="${esc(apk)}">Descargar para Android${version ? ' · v' + esc(version) : ''}</a>
  <a class="btn g" id="pwa" href="${esc(pwa)}">Abrir en iPhone o compu</a>
  <div class="paso" style="margin-top:16px"><b>Android</b>
    Al abrir el archivo te va a pedir permiso para «instalar apps desconocidas»: es normal, TEXMA no está en Play Store.</div>
  <div class="paso"><b>iPhone</b>
    Abrilo con Safari → Compartir → «Agregar a inicio».</div>
</div>

<div class="card ${estado === 'vencido' || estado === 'muerto' ? '' : 'hide'}" id="cMuerto">
  <div class="lbl">Este link ya no sirve</div>
  <div class="paso">${estado === 'vencido'
    ? 'El link venció. Escribile a quien te vendió TEXMA y en un minuto te manda uno nuevo — tu licencia no se perdió.'
    : 'No encontré este link. Puede que esté mal copiado o que sea muy viejo. Escribinos y te mandamos otro.'}</div>
</div>

<script>
var T=${JSON.stringify(token)};
var el=function(i){return document.getElementById(i)};
if(el('go')) el('go').onclick=async function(){
  var b=el('go'); b.disabled=true; b.textContent='Un segundo…'; el('err').textContent='';
  try{
    var r=await fetch(location.pathname+location.search,{method:'POST',headers:{'content-type':'application/json'},body:'{}'});
    var j=await r.json();
    if(!r.ok) throw new Error(j.error||('Error '+r.status));
    el('cod').textContent=j.code;
    if(j.apk){ el('apk').href=j.apk; el('apk').classList.remove('hide'); }
    if(j.app) el('pwa').href=j.app;
    el('cReclamar').classList.add('hide');
    el('cCodigo').classList.remove('hide');
    el('cBajar').classList.remove('hide');
    el('sub').textContent='Listo ♥ Guardá el código y bajate la app.';
  }catch(e){
    b.disabled=false; b.textContent='Reclamar mi licencia';
    el('err').textContent=e.message;
  }
};
if(el('copiar')) el('copiar').onclick=function(){
  var t=el('cod').textContent.trim();
  var ok=function(){ el('copiar').textContent='¡Copiado! ✓'; setTimeout(function(){el('copiar').textContent='Copiar el código'},1800); };
  if(navigator.clipboard&&navigator.clipboard.writeText) navigator.clipboard.writeText(t).then(ok,function(){});
  else{ var a=document.createElement('textarea'); a.value=t; document.body.appendChild(a); a.select();
        try{document.execCommand('copy');ok()}catch(e){} a.remove(); }
};
</script>
</div></body></html>`;
  return new Response(html, {
    status: 200,
    headers: {
      'content-type': 'text/html; charset=utf-8',
      'cache-control': 'no-store',
      'x-robots-tag': 'noindex, nofollow',
    },
  });
}
