/* ============================================================
   MAIL · envío por SMTP (solo servidor)
   ------------------------------------------------------------
   Por defecto: Gmail de TEXMA (texma.ok@gmail.com) con una «contraseña
   de aplicación» de Google. Gmail no pide dominio propio, a diferencia
   de Resend/SendGrid. Variables de entorno (Vercel):
     SMTP_USER   texma.ok@gmail.com
     SMTP_PASS   contraseña de aplicación de 16 letras (NO la clave de la cuenta)
     SMTP_HOST   opcional · smtp.gmail.com
     SMTP_PORT   opcional · 465
     MAIL_AVISOS opcional · adónde llegan los avisos de tickets nuevos
                 (por defecto, el mismo SMTP_USER)
   Sin SMTP_USER/SMTP_PASS, mailConfigurado() da false: los tickets se
   guardan igual y el panel avisa que no se pueden mandar respuestas.
============================================================ */
import nodemailer, { type Transporter } from 'nodemailer';
import { SITIO } from './sitio';

const env = (k: string) => String(process.env[k] ?? '').trim();
export const mailConfigurado = () => !!(env('SMTP_USER') && env('SMTP_PASS'));
export const mailAvisos = () => env('MAIL_AVISOS') || env('SMTP_USER') || SITIO.mail;

let transporte: Transporter | null = null;
function smtp() {
  if (!mailConfigurado()) throw new Error('Faltan SMTP_USER / SMTP_PASS en el servidor: no se pueden mandar mails');
  if (transporte) return transporte;
  const port = Number(env('SMTP_PORT') || 465);
  transporte = nodemailer.createTransport({
    host: env('SMTP_HOST') || 'smtp.gmail.com',
    port,
    secure: port === 465,
    auth: { user: env('SMTP_USER'), pass: env('SMTP_PASS').replace(/\s+/g, '') },
  });
  return transporte;
}

export const esc = (s: string) => String(s ?? '').replace(/[&<>"']/g, c =>
  ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' } as Record<string, string>)[c]);
const parrafos = (t: string) => esc(t).split(/\n{2,}/).map(p => `<p style="margin:0 0 14px">${p.replace(/\n/g, '<br>')}</p>`).join('');

/* plantilla con la marca: lino, tinta y rosa */
function plantilla(titulo: string, cuerpo: string) {
  return `<!doctype html><html lang="es"><body style="margin:0;background:#F3EEE5;padding:28px 12px;font-family:Helvetica,Arial,sans-serif;color:#2B2622">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td align="center">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#FAF7F1;border:1px solid #E4DCCD;border-radius:20px">
<tr><td style="padding:26px 28px 6px"><div style="font-family:Georgia,serif;font-style:italic;font-weight:700;font-size:26px"><span style="color:#EC1968">T</span>EXMA</div></td></tr>
<tr><td style="padding:6px 28px 4px"><h1 style="margin:0 0 14px;font-size:19px;line-height:1.3">${esc(titulo)}</h1>${cuerpo}</td></tr>
<tr><td style="padding:10px 28px 24px;font-size:12px;color:#75695C;border-top:1px solid #E4DCCD">TEXMA · ${esc(SITIO.ciudad)} · <a href="${SITIO.url}" style="color:#A61048">${esc(SITIO.url.replace(/^https?:\/\//, ''))}</a></td></tr>
</table></td></tr></table></body></html>`;
}

type DatosTicket = { nombre: string; email: string; motivo: string; mensaje: string };

/* aviso al negocio: entró un ticket nuevo (armado aparte del envío, para poder probarlo) */
export function armarAviso(t: DatosTicket) {
  const cuerpo = `
    <p style="margin:0 0 14px">Entró una consulta nueva en el sitio.</p>
    <table role="presentation" cellpadding="0" cellspacing="0" style="font-size:14px;margin:0 0 16px">
      <tr><td style="padding:2px 12px 2px 0;color:#75695C">Cliente</td><td><b>${esc(t.nombre || '—')}</b></td></tr>
      <tr><td style="padding:2px 12px 2px 0;color:#75695C">Mail</td><td>${esc(t.email)}</td></tr>
      <tr><td style="padding:2px 12px 2px 0;color:#75695C">Motivo</td><td>${esc(t.motivo)}</td></tr>
    </table>
    <div style="background:#F3EEE5;border-radius:14px;padding:14px 16px;margin:0 0 18px">${parrafos(t.mensaje)}</div>
    <p style="margin:0 0 18px"><a href="${SITIO.url}/admin" style="display:inline-block;background:#EC1968;color:#fff;text-decoration:none;font-weight:700;padding:11px 20px;border-radius:99px">Responder desde el panel</a></p>`;
  return {
    subject: `Nuevo ticket · ${t.motivo} · ${t.nombre || t.email}`,
    html: plantilla('Nuevo ticket de soporte', cuerpo),
    text: `Nuevo ticket\nCliente: ${t.nombre}\nMail: ${t.email}\nMotivo: ${t.motivo}\n\n${t.mensaje}\n\nResponder: ${SITIO.url}/admin`,
  };
}
export async function avisarTicketNuevo(t: DatosTicket) {
  await smtp().sendMail({ from: `"TEXMA · Soporte" <${env('SMTP_USER')}>`, to: mailAvisos(), replyTo: t.email, ...armarAviso(t) });
}

/* respuesta formal al cliente */
export function armarRespuesta(t: DatosTicket, respuesta: string) {
  const hola = t.nombre ? `Hola ${t.nombre.split(/\s+/)[0]}:` : 'Hola:';
  const cuerpo = `
    <p style="margin:0 0 14px">${esc(hola)}</p>
    ${parrafos(respuesta)}
    <p style="margin:18px 0 6px;font-size:12px;color:#75695C">Tu consulta (${esc(t.motivo)}):</p>
    <div style="border-left:3px solid #E4DCCD;padding:2px 0 2px 12px;margin:0 0 18px;font-size:13px;color:#75695C">${parrafos(t.mensaje)}</div>
    <p style="margin:0 0 18px">Saludos,<br><b>El equipo de TEXMA</b></p>`;
  return {
    subject: `Re: tu consulta a TEXMA · ${t.motivo}`,
    html: plantilla('Respuesta a tu consulta', cuerpo),
    text: `${hola}\n\n${respuesta}\n\n— Tu consulta (${t.motivo}):\n${t.mensaje}\n\nSaludos,\nEl equipo de TEXMA`,
  };
}
export async function enviarRespuesta(t: DatosTicket, respuesta: string) {
  await smtp().sendMail({ from: `"TEXMA" <${env('SMTP_USER')}>`, to: t.email, replyTo: mailAvisos(), ...armarRespuesta(t, respuesta) });
}
