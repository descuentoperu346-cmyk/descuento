import React, { useState } from 'react';
import {
  Send,
  MessageSquare,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Phone,
  AlertTriangle,
  ExternalLink,
  Users,
  Copy,
  Radio,
  Sparkles
} from 'lucide-react';
import { TELEGRAM_URL, TELEGRAM_USERNAME } from '../data/servicesData';
import { Vendor } from '../data/vendorsData';
import { recordVendorClickEvent } from '../data/telemetryData';

interface ContactPageProps {
  vendors: Vendor[];
}

export const ContactPage: React.FC<ContactPageProps> = ({ vendors }) => {
  const [topic, setTopic] = useState<'streaming' | 'leaks' | 'osint' | 'software' | 'soporte' | 'general'>('streaming');
  const [name, setName] = useState('');
  const [userHandle, setUserHandle] = useState('');
  const [message, setMessage] = useState('');
  const [selectedVendorId, setSelectedVendorId] = useState<string>('vendedor-central');
  const [submitted, setSubmitted] = useState(false);
  const [copiedHandle, setCopiedHandle] = useState(false);

  const selectedVendor = vendors.find((v) => v.id === selectedVendorId) || vendors[0];

  const handleCopyUsername = () => {
    navigator.clipboard.writeText(`@${selectedVendor.username}`);
    setCopiedHandle(true);
    setTimeout(() => setCopiedHandle(false), 2500);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    recordVendorClickEvent(
      selectedVendor.id,
      selectedVendor.name,
      'telegram',
      `Contacto - ${topic.toUpperCase()}`
    );

    const topicLabel =
      topic === 'leaks'
        ? 'Auditoría de Leaks & Filtraciones'
        : topic === 'streaming'
        ? 'Servicios de Streaming'
        : topic === 'osint'
        ? 'Investigación Digital OSINT'
        : topic === 'software'
        ? 'Software & Licencias'
        : topic === 'soporte'
        ? 'Soporte de Garantía'
        : 'Consulta General';

    const text = `¡Hola @${selectedVendor.username}! Vengo desde la página de contacto de Descuentos Perú.\n\n📌 Tema: ${topicLabel}\n👤 Mi Nombre/Alias: ${name || 'Cliente'}\n📱 Contacto: ${userHandle || 'Telegram'}\n\n💬 Mensaje: ${message || 'Deseo solicitar información sobre los servicios disponibles y formas de pago.'}`;

    const url = `https://t.me/${selectedVendor.username}?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
    setSubmitted(true);
  };

  return (
    <div className="space-y-12 sm:space-y-16 animate-in fade-in duration-300">
      
      {/* Top Header Hero */}
      <section className="relative rounded-3xl p-6 sm:p-12 bg-gradient-to-r from-[#031107] via-[#05180d] to-[#020b05] border border-emerald-500/30 shadow-[0_0_50px_rgba(0,255,136,0.12)] overflow-hidden">
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-8">
          <div className="max-w-2xl space-y-4">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-950/80 border border-emerald-500/40 text-[11px] font-mono text-[#00ff88] tracking-widest uppercase">
              <Radio className="w-4 h-4 text-[#00ff88] animate-pulse" />
              <span>CENTRO DE ATENCIÓN DIRECTA // LIMA - PERÚ</span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-tight">
              Canales de Contacto & <span className="text-[#00ff88] neon-glow-green">Soporte Oficial</span>
            </h1>

            <p className="text-sm sm:text-base md:text-lg text-slate-300 leading-relaxed font-normal">
              Estamos en línea para responder tus consultas, verificar pagos y activar cuentas en cuestión de minutos. Elige al creador de tu preferencia (<strong>Whisky Perú</strong>, <strong>Abbys Perú</strong>, <strong>El Nano VIP</strong> o <strong>Tin9o</strong>) o utiliza el formulario de contacto directo.
            </p>
          </div>

          {/* Friendly Peruvian Llama Mascot Greeting */}
          <div className="relative shrink-0 w-48 sm:w-56 lg:w-60 flex items-center justify-center">
            <div className="absolute inset-0 bg-emerald-500/20 rounded-full blur-2xl pointer-events-none" />
            <img
              src="/imagenes/llama-contact.png"
              alt="Mascota Descuentos Perú Soporte"
              className="relative z-10 w-full h-auto max-h-64 object-contain filter drop-shadow-[0_15px_30px_rgba(0,0,0,0.8)]"
            />
          </div>
        </div>
      </section>

      {/* Directory of Official Advisors */}
      <section className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-emerald-950 pb-4">
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
              <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-[#04190e] via-[#062616] to-[#021008] border-2 border-[#00ff88]/60 shadow-[0_0_30px_rgba(0,255,136,0.2)] flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
                <div className="flex items-center gap-4 sm:gap-5">
                  <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-2xl overflow-hidden border-2 border-[#00ff88] p-1.5 bg-black shadow-[0_0_20px_rgba(0,255,136,0.5)] shrink-0">
                    <img src="/imagenes/monograma.png" alt={central.name} className="w-full h-full object-contain" />
                    <span className="absolute bottom-1 right-1 w-3 h-3 rounded-full bg-[#00ff88] border-2 border-black animate-ping" />
                  </div>
                  <div>
                    <span className="px-2.5 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-950 border border-emerald-500/50 text-[#00ff88] uppercase">
                      GRUPO & CANAL PRINCIPAL
                    </span>
                    <h3 className="text-xl sm:text-2xl font-black text-white mt-1">{central.name}</h3>
                    <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-xl">
                      {central.customNotes || 'Administración central, activación de cuentas, validación de pagos Yape/Plin y soporte de garantías.'}
                    </p>
                  </div>
                </div>

                <div className="shrink-0 flex flex-col sm:flex-row md:flex-col gap-2">
                  <a
                    href={central.telegramUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => {
                      recordVendorClickEvent(central.id, central.name, 'telegram', 'Contacto Principal');
                    }}
                    className="px-6 py-3 rounded-2xl font-black text-xs sm:text-sm text-slate-950 bg-[#00ff88] hover:bg-[#00e676] shadow-[0_0_20px_rgba(0,255,136,0.35)] flex items-center justify-center gap-2 transition-all font-mono uppercase whitespace-nowrap active:scale-95"
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
                      className="p-5 sm:p-6 rounded-3xl bg-[#041209] border border-emerald-900/70 hover:border-emerald-500/60 transition-all shadow-xl flex flex-col justify-between space-y-4 group"
                    >
                      <div className="space-y-3.5">
                        <div className="flex items-center gap-3">
                          <div className="relative w-12 h-12 rounded-2xl overflow-hidden border-2 border-emerald-500/60 shadow-md shrink-0 bg-black">
                            <img
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
                            <span className="text-[9px] font-mono text-slate-400">
                              ⭐ {vendor.rating.toFixed(1)} (+{vendor.salesCount} ventas)
                            </span>
                          </div>
                        </div>

                        <p className="text-xs text-slate-300 leading-relaxed font-normal min-h-[40px]">
                          {vendor.customNotes || 'Asesor oficial y creador verificado en Descuentos Perú con soporte continuo.'}
                        </p>
                      </div>

                      <div className="space-y-2 pt-3 border-t border-emerald-950">
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
                            className="w-full py-2 rounded-xl font-bold text-xs text-slate-200 bg-[#06170d] hover:bg-emerald-950/80 border border-emerald-500/50 hover:border-[#00ff88] flex items-center justify-center gap-2 transition-all cursor-pointer font-mono"
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

      {/* Interactive Form & Telegram Message Generator */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left: Form Card */}
        <div className="lg:col-span-7 p-6 sm:p-8 rounded-3xl bg-[#041209] border border-emerald-900/80 shadow-2xl space-y-6">
          <div className="flex items-center gap-3 border-b border-emerald-950 pb-4">
            <div className="w-10 h-10 rounded-xl bg-emerald-950 border border-emerald-500/40 flex items-center justify-center text-[#00ff88]">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-black text-white font-mono">Formulario de Consulta Rápida</h3>
              <span className="text-xs text-slate-400 font-mono">
                Genera tu mensaje listo para enviar al asesor de tu elección
              </span>
            </div>
          </div>

          {submitted ? (
            <div className="py-8 text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-[#00ff88] flex items-center justify-center mx-auto border border-emerald-400">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h4 className="text-xl font-bold text-white">¡Enlace a Telegram Generado!</h4>
              <p className="text-xs sm:text-sm text-slate-300 max-w-md mx-auto">
                Se ha generado tu enlace directo hacia Telegram con tu mensaje pre-redactado. Si no se abrió la ventana emergente, haz clic en el botón de abajo:
              </p>
              <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
                <a
                  href={`https://t.me/${selectedVendor.username}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-6 py-2.5 rounded-xl font-bold text-slate-950 bg-[#00ff88] hover:bg-[#00e676] text-xs font-mono"
                >
                  Abrir Telegram Ahora
                </a>
                <button
                  type="button"
                  onClick={() => setSubmitted(false)}
                  className="px-5 py-2.5 rounded-xl font-bold text-white bg-[#06170d] border border-emerald-800 text-xs font-mono"
                >
                  Enviar Otra Consulta
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-mono font-bold text-slate-300 mb-1.5">
                    ¿Con qué asesor deseas hablar?
                  </label>
                  <select
                    value={selectedVendorId}
                    onChange={(e) => setSelectedVendorId(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#020904] border border-emerald-900/80 text-white font-mono focus:border-[#00ff88] outline-none cursor-pointer"
                  >
                    {vendors.map((v) => (
                      <option key={v.id} value={v.id} className="bg-[#041209] text-white">
                        {v.name} (@{v.username})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-mono font-bold text-slate-300 mb-1.5">
                    Área o Tema de tu Consulta:
                  </label>
                  <select
                    value={topic}
                    onChange={(e) => setTopic(e.target.value as any)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#020904] border border-emerald-900/80 text-white font-mono focus:border-[#00ff88] outline-none cursor-pointer"
                  >
                    <option value="streaming">🎬 Cuentas de Streaming (Netflix, Disney, Spotify)</option>
                    <option value="leaks">🚨 Auditoría de Leaks & Filtraciones de Datos</option>
                    <option value="osint">🕵️ Dossier & Búsqueda OSINT Forense</option>
                    <option value="software">💻 Software Original (Windows 11, Office, Canva)</option>
                    <option value="soporte">🛡️ Soporte Técnico / Garantía de Cuenta</option>
                    <option value="general">💬 Consulta General o Métodos de Pago</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-mono font-bold text-slate-300 mb-1.5">
                    Tu Nombre o Alias:
                  </label>
                  <input
                    type="text"
                    placeholder="Ej: Carlos M."
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#020904] border border-emerald-900/80 text-white focus:border-[#00ff88] outline-none font-sans"
                  />
                </div>

                <div>
                  <label className="block font-mono font-bold text-slate-300 mb-1.5">
                    Tu Usuario de Telegram o Celular:
                  </label>
                  <input
                    type="text"
                    placeholder="Ej: @carlos_lima o 987654321"
                    value={userHandle}
                    onChange={(e) => setUserHandle(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#020904] border border-emerald-900/80 text-white font-mono focus:border-[#00ff88] outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-mono font-bold text-slate-300 mb-1.5">
                  ¿En qué podemos ayudarte?
                </label>
                <textarea
                  rows={4}
                  placeholder="Escribe aquí tu consulta, servicio de interés o duda sobre los métodos de pago..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#020904] border border-emerald-900/80 text-white focus:border-[#00ff88] outline-none font-sans text-xs sm:text-sm leading-relaxed"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-3.5 rounded-xl font-black text-xs sm:text-sm text-slate-950 bg-[#00ff88] hover:bg-[#00e676] shadow-[0_0_25px_rgba(0,255,136,0.35)] transition-all cursor-pointer flex items-center justify-center gap-2 font-mono uppercase tracking-wider"
                >
                  <Send className="w-4 h-4 fill-slate-950" />
                  <span>Enviar Consulta a @{selectedVendor.username} por Telegram</span>
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Right: Security & Schedule Information */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Schedule Card */}
          <div className="p-6 rounded-3xl bg-[#030e06] border border-emerald-900/70 shadow-lg space-y-4">
            <div className="flex items-center gap-2 text-white font-bold text-sm">
              <Clock className="w-4 h-4 text-[#00ff88]" />
              <span>Horarios de Atención & Activación</span>
            </div>
            
            <div className="space-y-2 text-xs font-mono">
              <div className="flex items-center justify-between text-slate-300 py-1 border-b border-emerald-950">
                <span>Lunes a Viernes:</span>
                <span className="text-[#00ff88] font-bold">8:00 AM - 11:59 PM</span>
              </div>
              <div className="flex items-center justify-between text-slate-300 py-1 border-b border-emerald-950">
                <span>Sábados y Domingos:</span>
                <span className="text-[#00ff88] font-bold">9:00 AM - 11:30 PM</span>
              </div>
              <div className="flex items-center justify-between text-slate-300 py-1">
                <span>Feriados Nacionales:</span>
                <span className="text-emerald-400 font-bold">Atención Activa</span>
              </div>
            </div>

            <p className="text-[11px] text-slate-400 leading-relaxed pt-1">
              * Los pagos realizados fuera de horario se programan para activación prioritaria a primera hora de la mañana.
            </p>
          </div>

          {/* Anti-fraud Verification Card */}
          <div className="p-6 rounded-3xl bg-[#070b08] border border-amber-500/30 shadow-lg space-y-3">
            <div className="flex items-center gap-2 text-amber-400 font-bold text-sm">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              <span>Aviso de Seguridad Antifraude</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Existen imitadores en redes sociales. Recuerda que nuestros únicos canales oficiales son los que figuran en esta página web:
            </p>
            <div className="p-3 rounded-xl bg-[#030804] border border-emerald-950 flex items-center justify-between">
              <span className="text-xs font-mono font-bold text-[#00ff88]">
                Canal Oficial: @{TELEGRAM_USERNAME}
              </span>
              <button
                type="button"
                onClick={handleCopyUsername}
                className="text-[11px] font-mono text-slate-400 hover:text-white flex items-center gap-1 cursor-pointer"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>{copiedHandle ? 'Copiado!' : 'Copiar'}</span>
              </button>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Nunca te solicitaremos contraseñas personales de tu correo bancario o datos confidenciales privados.
            </p>
          </div>

          {/* Official Channel Community Box */}
          <div className="p-6 rounded-3xl bg-gradient-to-r from-[#03150a] to-[#010804] border border-emerald-500/40 shadow-xl space-y-3">
            <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-[#00ff88]">
              COMUNIDAD OFICIAL
            </span>
            <h4 className="text-base font-bold text-white">Canal de Telegram Descuentos Perú</h4>
            <p className="text-xs text-slate-300 leading-relaxed">
              Únete para enterarte de ofertas relámpago, cuentas en liquidación y alertas tempranas de seguridad.
            </p>
            <a
              href={TELEGRAM_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs text-slate-950 bg-[#00ff88] hover:bg-[#00e676] shadow-sm transition-all"
            >
              <Send className="w-3.5 h-3.5 fill-slate-950" />
              <span>Unirme al Canal Oficial</span>
            </a>
          </div>

        </div>

      </section>

    </div>
  );
};
