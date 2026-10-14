import React, { useState } from 'react';
import { Play, Globe, Shield } from 'lucide-react';

interface VisualProps {
  className?: string;
  customImage?: string | null;
}

export const StreamingVisual: React.FC<VisualProps> = ({ className = '', customImage }) => {
  const [hasError, setHasError] = useState(false);
  const imgSrc = customImage || '/imagenes/card-streaming.png';

  if (!hasError) {
    return (
      <div className={`relative w-full h-52 sm:h-56 overflow-hidden rounded-t-2xl bg-[#030906] ${className}`}>
        <img
          src={imgSrc}
          alt="Servicios de streaming"
          className="w-full h-full object-cover object-center block transition-transform duration-700 hover:scale-105"
          onError={() => setHasError(true)}
          loading="eager"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#06140c] via-transparent to-transparent opacity-30 pointer-events-none" />
      </div>
    );
  }

  return (
    <div className={`relative w-full h-52 sm:h-56 bg-[#020805] overflow-hidden rounded-t-2xl select-none flex items-center justify-center ${className}`}>
      <div className="relative w-14 h-14 rounded-full border-2 border-emerald-400 bg-emerald-950 flex items-center justify-center shadow-[0_0_25px_rgba(0,255,136,0.8)]">
        <Play className="w-7 h-7 text-[#00ff88] fill-[#00ff88] ml-1" />
      </div>
    </div>
  );
};

export const InvestigacionVisual: React.FC<VisualProps> = ({ className = '', customImage }) => {
  const [hasError, setHasError] = useState(false);
  const imgSrc = customImage || '/imagenes/card-investigacion.png';

  if (!hasError) {
    return (
      <div className={`relative w-full h-52 sm:h-56 overflow-hidden rounded-t-2xl bg-[#030906] ${className}`}>
        <img
          src={imgSrc}
          alt="Información y análisis"
          className="w-full h-full object-cover object-center block transition-transform duration-700 hover:scale-105"
          onError={() => setHasError(true)}
          loading="eager"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#06140c] via-transparent to-transparent opacity-30 pointer-events-none" />
      </div>
    );
  }

  return (
    <div className={`relative w-full h-52 sm:h-56 bg-[#020805] overflow-hidden rounded-t-2xl select-none flex items-center justify-center ${className}`}>
      <Globe className="w-14 h-14 text-[#00ff88] stroke-1 animate-pulse" />
    </div>
  );
};

export const EducacionVisual: React.FC<VisualProps> = ({ className = '', customImage }) => {
  const [hasError, setHasError] = useState(false);
  const imgSrc = customImage || '/imagenes/card-educacion.png';

  if (!hasError) {
    return (
      <div className={`relative w-full h-52 sm:h-56 overflow-hidden rounded-t-2xl bg-[#030906] ${className}`}>
        <img
          src={imgSrc}
          alt="Laboratorios RAT educativos"
          className="w-full h-full object-cover object-center block transition-transform duration-700 hover:scale-105"
          onError={() => setHasError(true)}
          loading="eager"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#06140c] via-transparent to-transparent opacity-30 pointer-events-none" />
      </div>
    );
  }

  return (
    <div className={`relative w-full h-52 sm:h-56 bg-[#020805] overflow-hidden rounded-t-2xl select-none flex items-center justify-center ${className}`}>
      <Shield className="w-14 h-14 text-[#00ff88]" />
    </div>
  );
};

export const LeaksVisual: React.FC<VisualProps> = ({ className = '', customImage }) => {
  const [hasError, setHasError] = useState(false);
  const imgSrc = customImage || '/imagenes/card-leaks.jpg';

  if (!hasError) {
    return (
      <div className={`relative w-full h-52 sm:h-56 overflow-hidden rounded-t-2xl bg-[#030906] ${className}`}>
        <img
          src={imgSrc}
          alt="Auditoría de Leaks y Filtraciones"
          className="w-full h-full object-cover object-center block transition-transform duration-700 hover:scale-105"
          onError={() => setHasError(true)}
          loading="eager"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#06140c] via-transparent to-transparent opacity-30 pointer-events-none" />
      </div>
    );
  }

  return (
    <div className={`relative w-full h-52 sm:h-56 bg-[#020805] overflow-hidden rounded-t-2xl select-none flex items-center justify-center ${className}`}>
      <div className="relative w-14 h-14 rounded-full border-2 border-red-500 bg-red-950/70 flex items-center justify-center shadow-[0_0_25px_rgba(239,68,68,0.7)]">
        <Shield className="w-7 h-7 text-red-400" />
      </div>
    </div>
  );
};

