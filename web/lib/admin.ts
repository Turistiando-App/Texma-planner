/* El único mail que entra a /admin. Lo usan el cliente (para redirigir)
   y las rutas /api/admin (que son las que de verdad protegen los datos). */
export const ADMIN_EMAIL = 'texma.ok@gmail.com';

export const esAdmin = (email?: string | null) => (email || '').trim().toLowerCase() === ADMIN_EMAIL;

export type Licencia = {
  code: string; status: 'pending' | 'active' | 'revoked';
  nombre: string; contacto: string; precio: number; vendedor: string;
  device: string | null; activated_at: string | null; last_seen_at: string | null;
  claim_token: string | null; created_at: string;
};

export type Ticket = {
  id: string; nombre: string; contacto: string; motivo: string; mensaje: string;
  estado: 'pendiente' | 'resuelto'; created_at: string; resuelto_at: string | null;
};

export type Metricas = {
  ventas: number; facturado: number; facturadoMes: number;
  activas: number; activas30: number; pendientes: number; ticketsPendientes: number;
};

/* lead de /checkout (tabla pre_ventas). En el panel:
   pendiente = «Nueva», vendida = «Código enviado», descartada = «Descartada» */
export type PreVenta = {
  id: string; nombre: string; apellido: string; email: string; celular: string;
  estado: 'pendiente' | 'vendida' | 'descartada'; license_code: string | null; created_at: string;
};

/* lo que la pestaña Pre-ventas le pasa al generador al tocar «Generar licencia» */
export type Prefill = { leadId: string; nombre: string; contacto: string; email: string };
