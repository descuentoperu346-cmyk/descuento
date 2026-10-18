import React, { useState } from 'react';
import {
  Send,
  ShieldCheck,
  CheckCircle2,
  Phone,
  AlertTriangle,
  ExternalLink,
  Users,
  Copy,
  Radio,
  Star
} from 'lucide-react';
import { TELEGRAM_URL, TELEGRAM_USERNAME } from '../data/servicesData';
import { Vendor } from '../data/vendorsData';
import { recordVendorClickEvent } from '../data/telemetryData';

interface ContactPageProps {
  vendors: Vendor[];
}

export const ContactPage: React.FC<ContactPageProps> = ({ vendors }) => {
  const [copiedHandle, setCopiedHandle] = useState(false);

  const handleCopyUsername = () => {
    navigator.clipboard.writeText(`@${TELEGRAM_USERNAME}`);
    setCopiedHandle(true);
    setTimeout(() => setCopiedHandle(false), 2500);
  };

  return (
    <div className="space-y-12 sm:space-y-16 animate-in fade-in duration-300">
      
      {/* Top Header Hero: Canales de Atención & Soporte */}
      <section className="relative rounded-2xl p-5 sm:p-7 md:p-8 bg-gradient-to-r from-[#0d0d0d] via-[#131313] to-[#090909] border border-zinc-700 overflow-hidden">
        <div className="absolute top-0 right-1/4 w-80 h-32 bg-[#00ff88]/5 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-900/80 border border-zinc-700 text-[11px] font-mono text-[#00ff88]">
              <Radio className="w-3.5 h-3.5 text-[#00ff88] animate-pulse" />
              <span className="font-semibold uppercase tracking-wider">Canales Oficiales Verificados · Perú</span>
            </div>

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight leading-tight">
              Atención Directa & <span className="text-[#00ff88] neon-glow-green">Soporte Continuo</span>
            </h1>

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-normal">
              Comunícate directamente con nuestros asesores autorizados por Telegram para contrataciones, consultas técnicas o atención de garantías. Todas las transacciones son respaldadas por la comunidad de Descuentos Perú.
            </p>

            <div className="flex flex-wrap items-center gap-2.5 pt-1 text-xs font-mono text-emerald-300">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-black/60 border border-zinc-700">
                <span className="w-2 h-2 rounded-full bg-[#00ff88] animate-ping" />
                Respuesta media: &lt; 5 min
              </span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-black/60 border border-zinc-700">
                <ShieldCheck className="w-3.5 h-3.5 text-[#00ff88]" />
                Garantía 100% activa
              </span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-black/60 border border-zinc-700">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#00ff88]" />
                Yape / Plin / Bancos
              </span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row lg:flex-col gap-2.5 shrink-0 w-full lg:w-auto lg:min-w-[260px]">
            <a
              href={TELEGRAM_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="px-5 py-3 rounded-xl font-mono text-xs font-bold bg-[#00ff88] text-slate-950 hover:bg-[#00e676] transition-all flex items-center justify-center gap-2 active:scale-95 text-center"
            >
              <Send className="w-4 h-4 text-slate-950" />
              <span>Canal Matriz Telegram</span>
            </a>
            <div className="text-center text-[10px] font-mono text-slate-400">
              @{TELEGRAM_USERNAME} · Canal Verificado
            </div>
          </div>
        </div>
      </section>

      {/* Directory of Official Advisors */}
      <section className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-zinc-900 pb-4">
          <div>
            <span className="text-xs font-mono font-bold uppercase tracking-widest text-[#00ff88]">
              DIRECTORIO DE ASESORES & CREADORES
            </span>
            <h2 className="text-2xl font-black text-white tracking-tight">
              Contacta Directamente con Nuestro Equipo
            </h2>
          </div>
          <span className="text-xs font-mono text-emerald-400 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#00ff88] animate-ping" />
            <span>{vendors.length} Creadores Conectados en Telegram</span>
          </span>
        </div>

        {/* Featured Main Group Card */}
        {(() => {
          const central = vendors.find((v) => v.role === 'admin' || v.id === 'vendedor-central') || vendors[0];
          const creators = vendors.filter((v) => v.id !== central.id && v.active !== false);

          return (
            <div className="space-y-6">
              {/* Featured Central Group Card */}
              <div className="p-4 sm:p-7 md:p-8 rounded-3xl bg-gradient-to-r from-[#111111] via-[#1a1a1a] to-[#0b0b0b] border-2 border-[#00ff88]/60 flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-5">
                  <div className="relative w-14 h-14 sm:w-20 sm:h-20 rounded-2xl overflow-hidden border-2 border-[#00ff88] p-1.5 bg-black shrink-0">
                    <img loading="lazy" decoding="async" src="/imagenes/monograma.png" alt={central.name} className="w-full h-full object-contain" />
                    <span className="absolute bottom-1 right-1 w-3 h-3 rounded-full bg-[#00ff88] border-2 border-black animate-ping" />
                  </div>
                  <div>
                    <span className="px-2.5 py-0.5 rounded text-[10px] font-mono font-bold bg-zinc-900 border border-emerald-500/50 text-[#00ff88] uppercase">
                      GRUPO & CANAL PRINCIPAL
                    </span>
                    <h3 className="text-lg sm:text-2xl font-black text-white mt-1">{central.name}</h3>
                    <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-xl">
                      {central.customNotes || 'Administración central, activación de cuentas, validación de pagos Yape/Plin y soporte de garantías.'}
                    </p>
                  </div>
                </div>

                <div className="shrink-0 flex flex-col sm:flex-row md:flex-col gap-2 w-full md:w-auto">
                  <a
                    href={central.telegramUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => {
                      recordVendorClickEvent(central.id, central.name, 'telegram', 'Contacto Principal');
                    }}
                    className="w-full sm:w-auto px-5 sm:px-6 py-3 rounded-2xl font-black text-xs sm:text-sm text-slate-950 bg-[#00ff88] hover:bg-[#00e676] flex items-center justify-center gap-2 transition-all font-mono uppercase active:scale-95 text-center"
                  >
                    <Send className="w-4 h-4 fill-slate-950" />
                    <span>Unirse al Canal (@{central.username})</span>
                  </a>
                  <span className="text-[10px] font-mono text-slate-400 text-center">Atención directa 24/7</span>
                </div>
              </div>

              {/* 4 Verified Creators in Balanced 4-Column Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
                {creators.map((vendor) => {
                  const isTino = vendor.username === 'Tin9o' || vendor.id === 'vendedor-tino';

                  return (
                    <div
                      key={vendor.id}
                      className="p-5 sm:p-6 rounded-3xl bg-[#0c0c0c] border border-zinc-800/70 hover:border-emerald-500/60 transition-all shadow-xl flex flex-col justify-between space-y-4 group"
                    >
                      <div className="space-y-3.5">
                        <div className="flex items-center gap-3">
                          <div className="relative w-12 h-12 rounded-2xl overflow-hidden border-2 border-emerald-500/60 shadow-md shrink-0 bg-black">
                            <img loading="lazy" decoding="async"
                              src={vendor.avatar}
                              alt={vendor.name}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                            />
                            <span className="absolute bottom-0.5 right-0.5 w-2 h-2 rounded-full bg-[#00ff88] border border-black animate-pulse" />
                          </div>

                          <div className="leading-tight">
                            <h4 className="text-sm font-bold text-white group-hover:text-[#00ff88] transition-colors">
                              {vendor.name}
                            </h4>
                            <span className="text-[11px] text-[#00ff88] font-mono block mt-0.5">
                              @{vendor.username}
                            </span>
                            <span className="text-[9px] font-mono text-slate-400 flex items-center gap-1 mt-0.5">
                              <Star className="w-2.5 h-2.5 text-amber-400 fill-amber-400" />
                              <span>{vendor.rating.toFixed(1)} (+{vendor.salesCount} ventas)</span>
                            </span>
                          </div>
                        </div>

                        <p className="text-xs text-slate-300 leading-relaxed font-normal min-h-[40px]">
                          {vendor.customNotes || 'Asesor oficial y creador verificado en Descuentos Perú con soporte continuo.'}
                        </p>
                      </div>

                      <div className="space-y-2 pt-3 border-t border-zinc-900">
                        <a
                          href={`https://t.me/${vendor.username}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={() => {
                            recordVendorClickEvent(vendor.id, vendor.name, 'telegram', 'Directorio de Asesores');
                          }}
                          className="w-full py-2.5 rounded-xl font-bold text-xs text-slate-950 bg-[#00ff88] hover:bg-[#00e676] shadow-sm flex items-center justify-center gap-2 transition-all cursor-pointer font-mono"
                        >
                          <Send className="w-3.5 h-3.5 fill-slate-950" />
                          <span>Chat en Telegram</span>
                        </a>

                        {vendor.catalogUrl && (
                          <a
                            href={vendor.catalogUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-full py-2 rounded-xl font-bold text-xs text-emerald-300 bg-[#101010] hover:bg-zinc-900/80 border border-emerald-500/50 hover:border-[#00ff88] flex items-center justify-center gap-1.5 transition-all cursor-pointer font-mono"
                          >
                            <ExternalLink className="w-3.5 h-3.5 text-[#00ff88]" />
                            <span>Catálogo de Ventas</span>
                          </a>
                        )}

                        {isTino && (
                          <a
                            href={`https://wa.me/51919192244?text=${encodeURIComponent(
                              '¡Hola @Tin9o! Vengo de la web Descuentos Perú y deseo consultar sobre tus servicios.'
                            )}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={() => {
                              recordVendorClickEvent(vendor.id, vendor.name, 'whatsapp', 'Directorio de Asesores');
                            }}
                            className="w-full py-2 rounded-xl font-bold text-xs text-slate-200 bg-[#101010] hover:bg-zinc-900/80 border border-emerald-500/50 hover:border-[#00ff88] flex items-center justify-center gap-2 transition-all cursor-pointer font-mono"
                          >
                            <Phone className="w-3.5 h-3.5 text-[#00ff88]" />
                            <span>WhatsApp (+51 919 192 244)</span>
                          </a>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })()}
      </section>

      {/* Aviso de Seguridad Antifraude & Canales Verificados (Compact Trust Strip) */}
      <section className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-[#0e0e0e] via-[#090909] to-[#0e0e0e] border border-zinc-700 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-black/60 border border-zinc-700 flex items-center justify-center shrink-0 text-[#00ff88]">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold text-[#00ff88] uppercase tracking-wider">
                Verificación Oficial Antifraude
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-[#00ff88] animate-ping" />
            </div>
            <p className="text-xs text-slate-300 mt-0.5">
              Nuestros únicos canales autorizados son los listados en esta web. Canal central:{' '}
              <strong className="text-white font-mono">@{TELEGRAM_USERNAME}</strong>. Nunca te pediremos datos de tu banca privada.
            </p>
          </div>
        </div>

        <div className="shrink-0 flex items-center gap-2">
          <button
            type="button"
            onClick={handleCopyUsername}
            className="px-3.5 py-2 rounded-xl text-xs font-mono font-bold bg-[#111111] text-emerald-300 border border-zinc-700 hover:border-[#00ff88] hover:text-white transition-all flex items-center gap-1.5 cursor-pointer active:scale-95"
          >
            {copiedHandle ? (
              <>
                <CheckCircle2 className="w-3.5 h-3.5 text-[#00ff88]" />
                <span>¡Copiado!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-[#00ff88]" />
                <span>Copiar @{TELEGRAM_USERNAME}</span>
              </>
            )}
          </button>

          <a
            href={TELEGRAM_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2 rounded-xl text-xs font-mono font-bold bg-[#00ff88] text-slate-950 hover:bg-[#00e676] transition-all flex items-center gap-1.5 active:scale-95"
          >
            <Send className="w-3.5 h-3.5 fill-slate-950" />
            <span>Canal Telegram</span>
          </a>
        </div>
      </section>

    </div>
  );
};

