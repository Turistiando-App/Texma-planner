import Link from 'next/link';

export default function NoEncontrado() {
  return (
    <div className="mx-auto max-w-xl px-5 pt-40 text-center">
      <p className="kicker text-rosa">Error 404</p>
      <h1 className="titulo mt-3 text-5xl">Se nos escapó esta puntada.</h1>
      <p className="mt-4 text-tinta-suave">La página que buscás no existe o cambió de lugar.</p>
      <div className="mt-8 flex justify-center gap-3">
        <Link href="/" className="rounded-full bg-rosa px-6 py-3 font-bold text-white">Ir al inicio</Link>
        <Link href="/merceria" className="rounded-full border border-linea bg-papel px-6 py-3 font-bold">Ver mercería</Link>
      </div>
    </div>
  );
}
