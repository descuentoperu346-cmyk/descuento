import React, { useState } from 'react';
import { X, Send, CheckCircle2, MessageSquare } from 'lucide-react';
import { TELEGRAM_USERNAME, TELEGRAM_URL } from '../data/servicesData';
import { recordVendorClickEvent } from '../data/telemetryData';

interface ContactModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ContactModal: React.FC<ContactModalProps> = ({ isOpen, onClose }) => {
  const [topic, setTopic] = useState('streaming');
  const [userHandle, setUserHandle] = useState('');
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    recordVendorClickEvent(
      topic === 'leaks' ? 'vendedor-tino' : 'vendedor-central',
      topic === 'leaks' ? 'Tin9o (@Tin9o) - Inteligencia OSINT & Leaks' : 'Descuentos Perú Central',
      'telegram',
      topic === 'leaks' ? 'Auditoría de Leaks & Filtraciones' : 'Consulta General'
    );

    const preparedText = `Hola @${TELEGRAM_USERNAME}! Tema: ${topic.toUpperCase()}.${userHandle ? ` Mi usuario/cel: ${userHandle}.` : ''} Mensaje: ${message || 'Deseo consultar sobre los servicios disponibles.'}`;
    const url = `https://t.me/descuentosper2?text=${encodeURIComponent(preparedText)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
    setSubmitted(true);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-[#07170f] border border-emerald-500/40 rounded-2xl shadow-[0_0_50px_rgba(0,230,118,0.25)] overflow-hidden text-slate-100 my-8">
        <div className="p-6 border-b border-emerald-950 flex items-center justify-between bg-gradient-to-r from-[#082215] to-[#06170e]">
          <div className="flex items-center gap-3">
            <img
              src="/imagenes/telegram-icon.png"
              alt="Telegram"
              className="w-11 h-11 object-contain filter drop-shadow-[0_0_12px_rgba(0,255,136,0.6)]"
            />
            <div>
              <span className="text-[11px] font-bold tracking-widest text-[#00e676] uppercase block">
                SOPORTE & CONSULTAS
              </span>
              <h3 className="text-xl sm:text-2xl font-black text-white">
                Contactar con un asesor
              </h3>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-emerald-950"
            aria-label="Cerrar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {submitted ? (
          <div className="p-8 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto border border-emerald-400">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h4 className="text-xl font-bold text-white">¡Enlace a Telegram generado!</h4>
            <p className="text-sm text-slate-300">
              Se ha abierto Telegram con tu consulta preparada. Un asesor de Descuentos Perú te atenderá de inmediato.
            </p>
            <div className="pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-2.5 rounded-xl font-bold text-slate-950 bg-[#00ff88] hover:bg-[#00e676]"
              >
                Entendido
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Área de interés
              </label>
              <select
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#05140c] border border-emerald-900 text-slate-200 text-sm focus:outline-none focus:border-emerald-400"
              >
                <option value="leaks">🚨 Auditoría de Leaks & Filtraciones de Datos</option>
                <option value="streaming">Servicios de Streaming (Netflix, Max, Spotify, etc.)</option>
                <option value="investigacion">Investigación Digital & Reportes OSINT</option>
                <option value="educacion">Laboratorios RAT Educativos</option>
                <option value="soporte">Soporte técnico o garantía de cuenta</option>
                <option value="otro">Otras consultas generales</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Tu usuario de Telegram o número (opcional)
              </label>
              <input
                type="text"
                value={userHandle}
                onChange={(e) => setUserHandle(e.target.value)}
                placeholder="@tu_usuario o +51 9XX XXX XXX"
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#05140c] border border-emerald-900 text-slate-200 text-sm focus:outline-none focus:border-emerald-400 placeholder-slate-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Consulta específica
              </label>
              <textarea
                rows={3}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Hola, me gustaría saber si tienen stock de..."
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#05140c] border border-emerald-900 text-slate-200 text-sm focus:outline-none focus:border-emerald-400 placeholder-slate-500"
              />
            </div>

            <div className="pt-2 flex items-center justify-between gap-3">
              <span className="text-[11px] text-slate-400 flex items-center gap-1">
                <MessageSquare className="w-3.5 h-3.5 text-emerald-400" /> Atención inmediata
              </span>
              <button
                type="submit"
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-slate-950 bg-[#00ff88] hover:bg-[#00e676] shadow-[0_0_20px_rgba(0,255,136,0.3)] cursor-pointer"
              >
                <Send className="w-4 h-4 fill-slate-950" />
                <span>Enviar a Telegram</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
