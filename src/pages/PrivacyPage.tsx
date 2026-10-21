import React from 'react';
import { ShieldCheck } from 'lucide-react';
import { TELEGRAM_URL, TELEGRAM_USERNAME } from '../data/servicesData';

interface PrivacyPageProps {
  onNavigateToContact: () => void;
}

const sections: { title: string; body: React.ReactNode }[] = [
  {
    title: '1. Qué datos guardamos',
    body: (
      <ul className="list-disc space-y-1.5 pl-5">
        <li>
          <strong className="text-white">Si creas una cuenta:</strong> tu nombre, tu correo y, si quieres, tu teléfono. Con contraseña, esta se guarda cifrada: nadie del equipo
          puede verla.
        </li>
        <li>
          <strong className="text-white">Si entras con Google:</strong> solo recibimos tu <strong className="text-white">correo</strong> y tu{' '}
          <strong className="text-white">nombre</strong>. No recibimos tu contraseña de Google, tu foto ni tus contactos.
        </li>
        <li>
          <strong className="text-white">Si compras:</strong> la tienda anota tu nombre, tu usuario de Telegram o WhatsApp, lo que compraste y hasta cuándo dura, para darte garantía y
          avisarte cuando toque renovar.
        </li>
        <li>
          <strong className="text-white">Visitas y clics:</strong> contamos cuántas personas ven la web y qué productos abren. No guardamos tu dirección IP ni los datos de tu navegador, y
          no contamos a quien tiene activado «No rastrear» (DNT o GPC).
        </li>
      </ul>
    )
  },
  {
    title: '2. Para qué los usamos',
    body: (
      <p>
        Para crear y mantener tu cuenta, atender tus compras, darte garantía y soporte, y mejorar la web con cifras generales. No usamos tus datos para publicidad de terceros.
      </p>
    )
  },
  {
    title: '3. Con quién los compartimos',
    body: (
      <>
        <p>
          <strong className="text-white">No vendemos ni regalamos tus datos.</strong> Solo los ven las personas del equipo que atienden tu compra y estos servicios que hacen funcionar la
          web:
        </p>
        <ul className="mt-2 list-disc space-y-1.5 pl-5">
          <li>Supabase: guarda las cuentas y el catálogo.</li>
          <li>Vercel: publica la web.</li>
          <li>Google: solo si eliges «Continuar con Google».</li>
        </ul>
        <p className="mt-2">La web no procesa pagos: el pago lo coordinas directamente con la tienda por Telegram o WhatsApp.</p>
      </>
    )
  },
  {
    title: '4. Cuánto tiempo los guardamos',
    body: <p>Mientras tengas la cuenta o necesitemos atender una garantía. Si pides que los borremos, los eliminamos, salvo lo que debamos conservar por una compra que siga en garantía.</p>
  },
  {
    title: '5. Tus derechos',
    body: (
      <p>
        Puedes pedir ver, corregir o borrar tus datos, o dejar de recibir avisos, en cualquier momento (derechos de acceso, rectificación, cancelación y oposición de la Ley N.º 29733 de
        Protección de Datos Personales del Perú). Escríbenos por{' '}
        <a href={TELEGRAM_URL} target="_blank" rel="noopener noreferrer" className="font-semibold text-[#00ff88] hover:underline">
          Telegram @{TELEGRAM_USERNAME}
          <span className="sr-only"> (se abre en una pestaña nueva)</span>
        </a>{' '}
        y respondemos tu pedido.
      </p>
    )
  },
  {
    title: '6. Cookies y almacenamiento del navegador',
    body: (
      <p>
        Usamos el almacenamiento de tu navegador solo para mantener tu sesión iniciada y recordar preferencias de la web. No usamos cookies de publicidad.
      </p>
    )
  },
  {
    title: '7. Cambios en esta política',
    body: <p>Si cambiamos algo importante, actualizamos esta página y la fecha de arriba.</p>
  }
];

export const PrivacyPage: React.FC<PrivacyPageProps> = ({ onNavigateToContact }) => (
  <article className="mx-auto max-w-3xl space-y-8 animate-in fade-in duration-300">
    <header className="space-y-3">
      <div className="inline-flex items-center gap-2 rounded-full border border-zinc-700 bg-zinc-900/80 px-3 py-1 font-mono text-[11px] font-semibold uppercase tracking-wider text-[#00ff88]">
        <ShieldCheck className="h-3.5 w-3.5" aria-hidden="true" />
        Descuentos Perú
      </div>
      <h1 className="text-3xl font-black tracking-tight text-white sm:text-4xl">Política de privacidad</h1>
      <p className="text-sm text-slate-300">Última actualización: 21 de octubre de 2026</p>
      <p className="text-sm leading-relaxed text-slate-300">
        Aquí explicamos, en palabras simples, qué datos tuyos guarda Descuentos Perú, para qué los usa y qué puedes hacer con ellos.
      </p>
    </header>

    {sections.map((s) => (
      <section key={s.title} className="space-y-2">
        <h2 className="text-lg font-bold text-white">{s.title}</h2>
        <div className="text-sm leading-relaxed text-slate-300">{s.body}</div>
      </section>
    ))}

    <p className="border-t border-zinc-800 pt-6 text-sm text-slate-300">
      ¿Dudas?{' '}
      <button type="button" onClick={onNavigateToContact} className="cursor-pointer font-semibold text-[#00ff88] hover:underline">
        Ir a Contacto
      </button>
    </p>
  </article>
);
