/* ============================================================
   Dibujos SVG de mercería (sin imágenes externas).
   Se usan en el fondo animado, en el hero y como «foto» de cada
   producto mientras no tenga imagen_url cargada.
============================================================ */
import type { Producto } from '@/lib/tipos';

type P = { color?: string; className?: string };

/* ¿el color es clarito? → los detalles van oscuros para que se vean */
const claro = (hex = '#000') => {
  const h = hex.replace('#', '');
  const r = parseInt(h.slice(0, 2), 16), g = parseInt(h.slice(2, 4), 16), b = parseInt(h.slice(4, 6), 16);
  return (0.299 * r + 0.587 * g + 0.114 * b) / 255 > 0.72;
};

export function Carrete({ color = '#EC1968', className }: P) {
  const det = claro(color) ? 'rgba(43,38,34,.25)' : 'rgba(255,255,255,.28)';
  return (
    <svg viewBox="0 0 100 120" className={className} aria-hidden="true">
      <rect x="14" y="6" width="72" height="14" rx="5" fill="#C9A77C" />
      <rect x="14" y="100" width="72" height="14" rx="5" fill="#B08D63" />
      <rect x="22" y="20" width="56" height="80" rx="4" fill={color} />
      {[30, 42, 54, 66, 78, 90].map(y => (
        <path key={y} d={`M22 ${y} Q50 ${y + 5} 78 ${y}`} stroke={det} strokeWidth="2" fill="none" />
      ))}
    </svg>
  );
}

export function Aguja({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 30 200" className={className} aria-hidden="true">
      <defs>
        <linearGradient id="agujaMetal" x1="0" x2="1">
          <stop offset="0" stopColor="#8A8F96" /><stop offset=".5" stopColor="#E9ECEF" /><stop offset="1" stopColor="#9AA0A6" />
        </linearGradient>
      </defs>
      <path d="M15 196 L10 40 Q10 8 15 4 Q20 8 20 40 Z" fill="url(#agujaMetal)" />
      <ellipse cx="15" cy="26" rx="2.6" ry="11" fill="#F3EEE5" />
    </svg>
  );
}

export function Boton({ color = '#F1EADF', className }: P) {
  const det = claro(color) ? '#2B2622' : '#FFFFFF';
  return (
    <svg viewBox="0 0 100 100" className={className} aria-hidden="true">
      <circle cx="50" cy="50" r="44" fill={color} stroke="rgba(43,38,34,.18)" strokeWidth="2" />
      <circle cx="50" cy="50" r="33" fill="none" stroke={det} strokeOpacity=".22" strokeWidth="3" />
      {[[40, 40], [60, 40], [40, 60], [60, 60]].map(([x, y]) => (
        <circle key={`${x}${y}`} cx={x} cy={y} r="5.5" fill={det} fillOpacity=".55" />
      ))}
    </svg>
  );
}

export function Cierre({ color = '#1E1B19', className }: P) {
  return (
    <svg viewBox="0 0 100 140" className={className} aria-hidden="true">
      <rect x="30" y="4" width="40" height="132" rx="4" fill={color} />
      {Array.from({ length: 10 }, (_, i) => (
        <rect key={i} x={i % 2 ? 50 : 40} y={10 + i * 8} width="10" height="5" rx="1.5" fill="#C8CCD0" />
      ))}
      <rect x="36" y="88" width="28" height="22" rx="6" fill="#B9BEC3" />
      <rect x="45" y="108" width="10" height="24" rx="4" fill="#9EA4AA" />
    </svg>
  );
}

export function Elastico({ color = '#FBFAF6', className }: P) {
  const det = claro(color) ? 'rgba(43,38,34,.22)' : 'rgba(255,255,255,.3)';
  return (
    <svg viewBox="0 0 120 100" className={className} aria-hidden="true">
      <ellipse cx="60" cy="50" rx="50" ry="40" fill={color} stroke="rgba(43,38,34,.16)" strokeWidth="2" />
      <ellipse cx="60" cy="50" rx="18" ry="14" fill="#F3EEE5" />
      {[26, 32, 38].map(r => (
        <ellipse key={r} cx="60" cy="50" rx={r + 8} ry={r} fill="none" stroke={det} strokeWidth="1.6" />
      ))}
    </svg>
  );
}

/* la «foto» del producto: su imagen si tiene, si no el dibujo de su categoría */
export function ProductoVisual({ p, className = '' }: { p: Producto; className?: string }) {
  if (p.imagen_url) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={p.imagen_url} alt={p.titulo} className={`h-full w-full object-cover ${className}`} loading="lazy" />;
  }
  const c = p.color || '#EC1968';
  const cls = `h-3/5 w-auto drop-shadow-[0_10px_18px_rgba(43,38,34,.18)] ${className}`;
  switch (p.categoria) {
    case 'Botones': return <Boton color={c} className={cls} />;
    case 'Cierres': return <Cierre color={c} className={cls} />;
    case 'Elásticos': return <Elastico color={c} className={cls} />;
    default: return <Carrete color={c} className={cls} />;
  }
}
