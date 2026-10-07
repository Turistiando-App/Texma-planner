'use client';
/* ============================================================
   PERFIL · foto de Google en el Header + menú desplegable
   ------------------------------------------------------------
   Con sesión de Google (Supabase Auth) el Header muestra la foto en
   lugar de «Abrir la app». El menú tiene: Entrar a la app (/app),
   Panel de administración (/admin, solo para ADMIN_EMAILS) y Cerrar
   sesión. El atajo de admin es solo comodidad: /api/admin/* valida
   el mail en el servidor.
============================================================ */
import { AnimatePresence, motion } from 'framer-motion';
import { LayoutDashboard, LogOut, Smartphone } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import type { User } from '@supabase/supabase-js';
import { esAdmin } from '@/lib/admin';
import { supabaseAuth } from '@/lib/supabase';

/* sesión actual, al día con login/logout */
export function useSesion() {
  const [usuario, setUsuario] = useState<User | null>(null);
  useEffect(() => {
    const sb = supabaseAuth();
    if (!sb) return;
    sb.auth.getSession().then(({ data }) => setUsuario(data.session?.user ?? null));
    const { data } = sb.auth.onAuthStateChange((_e, s) => setUsuario(s?.user ?? null));
    return () => data.subscription.unsubscribe();
  }, []);
  return usuario;
}

export const cerrarSesion = async () => {
  await supabaseAuth()?.auth.signOut();
  window.location.href = '/';
};

/* foto de Google (o la inicial si no hay / no carga) */
export function Avatar({ usuario, className = '' }: { usuario: User; className?: string }) {
  const [falla, setFalla] = useState(false);
  const meta = usuario.user_metadata || {};
  const foto: string | undefined = meta.avatar_url || meta.picture;
  const nombre: string = meta.full_name || meta.name || usuario.email || '';
  return foto && !falla
    ? <img src={foto} alt="" referrerPolicy="no-referrer" onError={() => setFalla(true)} className={`rounded-full object-cover ${className}`} />
    : <span className={`grid place-items-center rounded-full bg-rosa-claro font-serif text-lg font-bold italic text-rosa-oscuro ${className}`}>{(nombre[0] || '♥').toUpperCase()}</span>;
}

const item = 'flex w-full items-center gap-3 rounded-2xl px-3 py-2.5 text-left text-sm font-semibold text-tinta transition hover:bg-lino';

/* los links del menú (los usa también el menú mobile del Header) */
export function PerfilLinks({ usuario, onElegir }: { usuario: User; onElegir?: () => void }) {
  return (
    <>
      <a href="/app" className={item} onClick={onElegir}>
        <Smartphone className="h-4 w-4 text-rosa" aria-hidden="true" /> Entrar a la app
      </a>
      {esAdmin(usuario.email) && (
        <a href="/admin" className={item} onClick={onElegir}>
          <LayoutDashboard className="h-4 w-4 text-rosa" aria-hidden="true" /> Panel de administración
        </a>
      )}
      <button type="button" className={`${item} text-[#9C3B2E]`} onClick={() => { onElegir?.(); cerrarSesion(); }}>
        <LogOut className="h-4 w-4" aria-hidden="true" /> Cerrar sesión
      </button>
    </>
  );
}

export default function PerfilMenu({ usuario, className = '' }: { usuario: User; className?: string }) {
  const [abierto, setAbierto] = useState(false);
  const caja = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!abierto) return;
    const fuera = (e: MouseEvent) => { if (caja.current && !caja.current.contains(e.target as Node)) setAbierto(false); };
    const esc = (e: KeyboardEvent) => { if (e.key === 'Escape') setAbierto(false); };
    document.addEventListener('mousedown', fuera);
    window.addEventListener('keydown', esc);
    return () => { document.removeEventListener('mousedown', fuera); window.removeEventListener('keydown', esc); };
  }, [abierto]);

  const meta = usuario.user_metadata || {};
  return (
    <div ref={caja} className="relative">
      <button type="button" onClick={() => setAbierto(v => !v)} aria-haspopup="menu" aria-expanded={abierto}
        aria-label="Tu cuenta" className={`rounded-full p-0.5 ring-2 ring-transparent transition hover:ring-rosa/40 ${abierto ? 'ring-rosa/60' : ''} ${className}`}>
        <Avatar usuario={usuario} className="h-9 w-9" />
      </button>
      <AnimatePresence>
        {abierto && (
          <motion.div role="menu"
            initial={{ opacity: 0, y: -6, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -6, scale: 0.98 }}
            transition={{ duration: 0.16 }}
            className="absolute right-0 top-full z-50 mt-2 w-72 origin-top-right rounded-3xl border border-linea bg-papel p-2 shadow-[0_24px_60px_-20px_rgba(43,38,34,.35)]">
            <div className="flex items-center gap-3 border-b border-linea px-3 pb-3 pt-2">
              <Avatar usuario={usuario} className="h-10 w-10 shrink-0" />
              <div className="min-w-0">
                <p className="truncate text-sm font-bold text-tinta">{meta.full_name || meta.name || 'Tu cuenta'}</p>
                <p className="truncate text-xs text-tinta-suave">{usuario.email}</p>
              </div>
            </div>
            <div className="pt-2"><PerfilLinks usuario={usuario} onElegir={() => setAbierto(false)} /></div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
