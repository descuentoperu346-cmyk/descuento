import React from 'react';
import { X, ShieldCheck, Users, Zap, Award } from 'lucide-react';
import { TELEGRAM_URL, TELEGRAM_USERNAME } from '../data/servicesData';

interface AboutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AboutModal: React.FC<AboutModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl bg-[#07170f] border border-emerald-500/40 rounded-2xl shadow-[0_0_50px_rgba(0,230,118,0.25)] overflow-hidden text-slate-100 my-8">
        {/* Modal Top Header with Official Medallion */}
        <div className="p-6 border-b border-emerald-950 flex items-center justify-between bg-gradient-to-r from-[#082215] to-[#06170e]">
          <div className="flex items-center gap-3.5">
            <img
              src="/imagenes/hero-circle.png"
              alt="Descuentos Perú"
              className="w-12 h-12 rounded-full object-contain filter drop-shadow-[0_0_12px_rgba(0,255,136,0.5)] border border-emerald-400/40"
            />
            <div>
              <span className="text-[11px] font-bold tracking-widest text-[#00e676] uppercase block">
                CONÓCENOS
              </span>
              <h3 className="text-xl sm:text-2xl font-black text-white">
                Sobre Descuentos Perú
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

        {/* Modal Body */}
        <div className="p-6 space-y-5 text-sm text-slate-300 leading-relaxed">
          <p>
            <strong>Descuentos Perú</strong> es la plataforma digital de referencia en el país para centralizar en un solo lugar suscripciones oficiales de streaming, investigación digital y trazabilidad con fuentes públicas, y laboratorios educativos de ciberseguridad.
          </p>

          {/* 3 Pillar badges from folder */}
          <div className="grid grid-cols-3 gap-2.5 p-3 rounded-xl bg-[#05140c] border border-emerald-950/80 text-center">
            <div className="flex flex-col items-center gap-1.5 p-1">
              <img src="/imagenes/badge-play.png" alt="Streaming" className="w-7 h-7 object-contain" />
              <span className="text-[11px] font-bold text-white">Streaming</span>
              <span className="text-[9px] text-slate-400">Entretenimiento oficial</span>
            </div>
            <div className="flex flex-col items-center gap-1.5 p-1 border-x border-emerald-950/80">
              <img src="/imagenes/badge-search.png" alt="Investigación" className="w-7 h-7 object-contain" />
              <span className="text-[11px] font-bold text-white">Investigación</span>
              <span className="text-[9px] text-slate-400">OSINT & Datos</span>
            </div>
            <div className="flex flex-col items-center gap-1.5 p-1">
              <img src="/imagenes/badge-edu.png" alt="Educación" className="w-7 h-7 object-contain" />
              <span className="text-[11px] font-bold text-white">Educación</span>
              <span className="text-[9px] text-slate-400">Laboratorios RAT</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-1">
            <div className="bg-[#05140c] p-3.5 rounded-xl border border-emerald-950/80 space-y-1">
              <Zap className="w-5 h-5 text-emerald-400" />
              <div className="font-bold text-white text-xs sm:text-sm">Velocidad & Entrega</div>
              <p className="text-[11px] text-slate-400">Activaciones en minutos con asesoría directa en Telegram.</p>
            </div>
            <div className="bg-[#05140c] p-3.5 rounded-xl border border-emerald-950/80 space-y-1">
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
              <div className="font-bold text-white text-xs sm:text-sm">100% Garantizado</div>
              <p className="text-[11px] text-slate-400">Reemplazo inmediato ante cualquier inconveniente técnico.</p>
            </div>
            <div className="bg-[#05140c] p-3.5 rounded-xl border border-emerald-950/80 space-y-1">
              <Users className="w-5 h-5 text-emerald-400" />
              <div className="font-bold text-white text-xs sm:text-sm">Comunidad Peruana</div>
              <p className="text-[11px] text-slate-400">Miles de clientes en Lima y todas las provincias del país.</p>
            </div>
            <div className="bg-[#05140c] p-3.5 rounded-xl border border-emerald-950/80 space-y-1">
              <Award className="w-5 h-5 text-emerald-400" />
              <div className="font-bold text-white text-xs sm:text-sm">Ética & Seguridad</div>
              <p className="text-[11px] text-slate-400">Privacidad estricta y laboratorios en entornos autorizados.</p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-5 border-t border-emerald-950 bg-[#05110a] flex items-center justify-between">
          <span className="text-xs text-slate-400 font-mono">@{TELEGRAM_USERNAME}</span>
          <a
            href={TELEGRAM_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl text-xs sm:text-sm font-bold text-slate-950 bg-[#00e676] hover:bg-[#00ff88] shadow-[0_0_15px_rgba(0,230,118,0.4)]"
          >
            <img src="/imagenes/telegram-icon.png" alt="" className="w-4 h-4 rounded-full object-contain" />
            <span>Unirse a Telegram</span>
          </a>
        </div>
      </div>
    </div>
  );
};
