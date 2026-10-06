'use client';
/* piezas chicas compartidas por las secciones del panel */
/* encabezado común de cada sección */
export type Api = <T>(ruta: string, init?: RequestInit) => Promise<T>;

export function Titulo({ kicker, t, children }: { kicker: string; t: string; children?: React.ReactNode }) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4">
      <div>
        <p className="font-mono text-[11px] uppercase tracking-[.2em] text-neutral-500">{kicker}</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-white md:text-4xl">{t}</h1>
      </div>
      {children}
    </div>
  );
}

export function Aviso({ error }: { error: string }) {
  return error ? <p role="alert" className="mt-6 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">{error}</p> : null;
}

export const fecha = (iso: string) =>
  new Date(iso).toLocaleDateString('es-AR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
