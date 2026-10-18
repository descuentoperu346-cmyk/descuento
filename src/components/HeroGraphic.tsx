import React, { useRef, useState } from 'react';
import { Send, Crown, Sparkles, Film, Shield, Zap, Tv, Search, GraduationCap } from 'lucide-react';
import { recordVendorClickEvent } from '../data/telemetryData';

interface HeroGraphicProps {
  onSelectCategory?: (category: 'streaming' | 'investigacion' | 'educacion') => void;
}

interface FloatingVendor {
  id: string;
  name: string;
  username: string;
  telegramUrl: string;
  avatar: string;
  role: string;
  iconType: 'crown' | 'sparkles' | 'film' | 'shield';
  accentColor: string;
}

const VENDORS_FLOATING: FloatingVendor[] = [
  {
    id: 'vendedor-abby',
    name: 'Abbys Perú',
    username: 'AbbysPeru',
    telegramUrl: 'https://t.me/AbbysPeru',
    avatar: '/imagenes/perfiles/abby.jpg',
    role: 'DISEÑO & HIFI',
    iconType: 'sparkles',
    accentColor: '#38bdf8'
  },
  {
    id: 'vendedor-whisky',
    name: 'Whisky Perú',
    username: 'whiskyper',
    telegramUrl: 'https://t.me/whiskyper',
    avatar: '/imagenes/perfiles/whisky.jpg',
    role: 'STREAMING 4K',
    iconType: 'crown',
    accentColor: '#00ff88'
  },
  {
    id: 'vendedor-nano',
    name: 'El Nano VIP',
    username: 'elnanovip',
    telegramUrl: 'https://t.me/elnanovip',
    avatar: '/imagenes/perfiles/nanovip.jpg',
    role: 'CINE & IA',
    iconType: 'film',
    accentColor: '#a78bfa'
  },
  {
    id: 'vendedor-tino',
    name: 'Tin9o',
    username: 'Tin9o',
    telegramUrl: 'https://t.me/Tin9o',
    avatar: '/imagenes/perfiles/tino.webp',
    role: 'OSINT & LEAKS',
    iconType: 'shield',
    accentColor: '#f43f5e'
  }
];

const CATEGORY_NODES = [
  { id: 'streaming', label: 'Streaming', Icon: Tv, pos: 'left-0 top-[16%]' },
  { id: 'investigacion', label: 'OSINT', Icon: Search, pos: 'right-0 top-[8%]' },
  { id: 'educacion', label: 'Educación', Icon: GraduationCap, pos: 'right-[2%] bottom-[10%]' }
] as const;

export const HeroGraphic: React.FC<HeroGraphicProps> = ({ onSelectCategory }) => {
  const [isPaused, setIsPaused] = useState(false);
  const tiltRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef(0);

  // Inclinación suave del átomo siguiendo el cursor (solo punteros finos; transform, sin repintados)
  const handleMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (rafRef.current || !tiltRef.current) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    rafRef.current = requestAnimationFrame(() => {
      rafRef.current = 0;
      if (tiltRef.current) tiltRef.current.style.transform = `rotateX(${(-y * 14).toFixed(1)}deg) rotateY(${(x * 18).toFixed(1)}deg)`;
    });
  };
  const resetTilt = () => {
    if (tiltRef.current) tiltRef.current.style.transform = 'rotateX(0deg) rotateY(0deg)';
  };

  const renderVendorIcon = (type: FloatingVendor['iconType']) => {
    switch (type) {
      case 'crown':
        return <Crown className="w-2.5 h-2.5 text-amber-400 shrink-0" />;
      case 'sparkles':
        return <Sparkles className="w-2.5 h-2.5 text-cyan-300 shrink-0" />;
      case 'film':
        return <Film className="w-2.5 h-2.5 text-violet-400 shrink-0" />;
      case 'shield':
        return <Shield className="w-2.5 h-2.5 text-emerald-400 shrink-0" />;
      default:
        return <Zap className="w-2.5 h-2.5 text-[#00ff88] shrink-0" />;
    }
  };

  return (
    <div className="flex flex-col items-center justify-center w-full select-none">
      {/* 3D Celestial Cyber Orbit Stage (Compact Proportional Height) */}
      <div
        className="relative w-full max-w-[300px] sm:max-w-[400px] md:max-w-[460px] lg:max-w-[540px] h-[290px] sm:h-[380px] md:h-[420px] lg:h-[470px] mx-auto flex items-center justify-center preserve-3d overflow-hidden sm:overflow-visible"
        style={{ perspective: '1000px' }}
        onMouseEnter={() => setIsPaused(true)}
        onMouseMove={handleMove}
        onMouseLeave={() => {
          setIsPaused(false);
          resetTilt();
        }}
      >
        {/* 1-2. ÁTOMO FUTURISTA: anillo HUD + 3 órbitas elípticas con electrones y estela (SVG, solo transform/opacity) */}
        <div
          ref={tiltRef}
          className="absolute inset-0 pointer-events-none flex items-center justify-center transition-transform duration-300 ease-out"
          aria-hidden="true"
        >
          <svg className="w-full h-full overflow-visible" viewBox="0 0 600 600" preserveAspectRatio="xMidYMid meet" fill="none">
            <defs>
              <radialGradient id="atomAura" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#00ff88" stopOpacity="0.28" />
                <stop offset="45%" stopColor="#0a3d2a" stopOpacity="0.14" />
                <stop offset="100%" stopColor="#07090a" stopOpacity="0" />
              </radialGradient>
              <linearGradient id="atomOrbit" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#22d3ee" stopOpacity="0.45" />
                <stop offset="50%" stopColor="#00ff88" stopOpacity="1" />
                <stop offset="100%" stopColor="#22d3ee" stopOpacity="0.45" />
              </linearGradient>
            </defs>

            <circle cx="300" cy="300" r="290" fill="url(#atomAura)" />

            {/* Anillo HUD exterior con marcas de precisión (giro lento) */}
            <g className="animate-spin-slow" style={{ transformOrigin: '300px 300px' }}>
              <circle cx="300" cy="300" r="284" stroke="#00ff88" strokeOpacity="0.22" strokeWidth="1" strokeDasharray="2 10" />
              {Array.from({ length: 36 }).map((_, i) => (
                <line
                  key={i}
                  x1="300" y1="12" x2="300" y2={i % 3 === 0 ? 30 : 21}
                  stroke={i % 9 === 0 ? '#22d3ee' : '#00ff88'}
                  strokeOpacity={i % 3 === 0 ? 0.7 : 0.3}
                  strokeWidth={i % 3 === 0 ? 2 : 1}
                  transform={`rotate(${i * 10} 300 300)`}
                />
              ))}
            </g>

            {/* Anillo interior opuesto: arcos segmentados */}
            <g className="animate-spin-slow" style={{ transformOrigin: '300px 300px', animationDirection: 'reverse', animationDuration: '50s' }}>
              <circle cx="300" cy="300" r="250" stroke="#22d3ee" strokeOpacity="0.4" strokeWidth="1.5" strokeDasharray="90 60 20 60" />
            </g>

            {/* Órbitas del átomo: 3 elipses a 0°, 60° y 120° */}
            {[0, 60, 120].map((deg, i) => {
              const path = 'M 35 300 a 265 95 0 1 0 530 0 a 265 95 0 1 0 -530 0';
              const dur = [7, 9, 11][i];
              const color = i === 1 ? '#22d3ee' : '#00ff88';
              return (
                <g key={deg} transform={`rotate(${deg} 300 300)`}>
                  <ellipse cx="300" cy="300" rx="265" ry="95" stroke="url(#atomOrbit)" strokeWidth="2.4" />
                  {/* electrón + estela (4 puntos desfasados) */}
                  {[0, 1, 2, 3].map((t) => (
                    <circle key={t} r={7 - t * 1.5} fill={color} fillOpacity={1 - t * 0.27}>
                      <animateMotion dur={`${dur}s`} begin={`${-t * 0.14 - i * 2}s`} repeatCount="indefinite" path={path} />
                    </circle>
                  ))}
                </g>
              );
            })}

            {/* Pulsos de energía desde el núcleo */}
            {[0, 1].map((k) => (
              <circle key={k} cx="300" cy="300" r="120" stroke="#00ff88" strokeWidth="1.5" className="animate-nucleus-pulse" style={{ transformOrigin: '300px 300px', animationDelay: `${k * 2}s` }} />
            ))}

            {/* Retícula de precisión */}
            <g stroke="#00ff88" strokeOpacity="0.35" strokeWidth="1.5">
              <line x1="300" y1="2" x2="300" y2="-12" />
              <line x1="300" y1="598" x2="300" y2="612" />
              <line x1="2" y1="300" x2="-12" y2="300" />
              <line x1="598" y1="300" x2="612" y2="300" />
            </g>
          </svg>
        </div>

        {/* 3. CENTRAL LOGO MEDALLION (Mid Plane z-20: Centerpiece with Peru Flags & Telegram Core) */}
        <div
          className="relative z-20 w-[130px] sm:w-[160px] md:w-[180px] lg:w-[200px] aspect-square flex items-center justify-center pointer-events-none"
          style={{
            transform: 'translateZ(0px)',
            boxShadow: '0 0 60px 8px rgba(0,255,136,0.22)',
            borderRadius: '9999px'
          }}
        >
          {/* Pulsing Emerald Energy Rim */}
          <div className="absolute -inset-1.5 rounded-full border border-emerald-400/60 bg-emerald-500/5 pointer-events-none" />

          {/* Rotating High-Tech Precision Reticle Ring */}
          <div className="absolute -inset-2.5 rounded-full border border-dashed border-emerald-400/30 animate-spin-slow pointer-events-none" />

          {/* Central Logo Artwork: Complete Medallion */}
          <img
            src="/imagenes/hero-circle.webp"
            alt="Descuentos Perú"
            className="w-full h-full object-contain filter contrast-105 brightness-105 pointer-events-none"
            loading="eager"
          />
        </div>

        {/* Accesos a categorías sobre el átomo */}
        {onSelectCategory &&
          CATEGORY_NODES.map(({ id, label, Icon, pos }) => (
            <button
              key={id}
              type="button"
              onClick={() => onSelectCategory(id)}
              className={`absolute z-30 ${pos} inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-zinc-700 bg-zinc-950/90 text-[11px] font-mono font-bold text-zinc-200 hover:text-[#00ff88] hover:border-[#00ff88] transition-colors cursor-pointer`}
            >
              <Icon className="w-3.5 h-3.5" />
              {label}
            </button>
          ))}

        {/* 4. 3D ELLIPTICAL ORBIT: 4 OFFICIAL CREATOR PILLS TRAVELING IN 3D SPACE */}
        <div className="absolute inset-0 pointer-events-none flex items-center justify-center preserve-3d">
          {VENDORS_FLOATING.map((vendor, index) => {
            // Stagger 4 vendors evenly along 24s orbit (-0s, -6s, -12s, -18s)
            const delaySeconds = -index * 6;

            return (
              <div
                key={vendor.id}
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-auto animate-orbit-elliptical-vendor preserve-3d"
                style={{
                  animationDelay: `${delaySeconds}s`,
                  animationPlayState: isPaused ? 'paused' : 'running'
                }}
              >
                <a
                  href={vendor.telegramUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => {
                    recordVendorClickEvent(vendor.id, vendor.name, 'telegram', 'Hero Orbit Button');
                  }}
                  className="group flex items-center gap-1.5 sm:gap-2 px-2 sm:px-2.5 py-1 sm:py-1.5 rounded-full bg-gradient-to-r from-[#03150c]/95 via-[#062415]/95 to-[#020e08]/95 hover:from-[#08301c] hover:via-[#0c3d23] hover:to-[#041a0f] border border-emerald-400/80 hover:border-[#00ff88] shadow-[0_0_16px_rgba(0,255,136,0.4)] hover:shadow-[0_0_28px_rgba(0,255,136,0.85)] backdrop-blur-xl hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer pointer-events-auto select-none"
                  title={`Abrir Telegram oficial de @${vendor.username} (${vendor.name})`}
                >
                  {/* Creator Photo Avatar with Online Status Beacon */}
                  <div className="relative w-5 h-5 sm:w-6 sm:h-6 rounded-full overflow-hidden shrink-0 border-2 border-emerald-300 shadow-[0_0_8px_#00ff88] group-hover:border-white transition-colors">
                    <img
                      loading="lazy" decoding="async"
                      src={vendor.avatar}
                      alt={vendor.name}
                      className="w-full h-full object-cover"
                    />
                    <span className="absolute -bottom-0.5 -right-0.5 w-1.5 h-1.5 rounded-full bg-[#00ff88] border border-black animate-pulse shadow-[0_0_5px_#00ff88]" />
                  </div>

                  {/* Creator Username & Specialized Role with SVG Icon */}
                  <div className="flex flex-col text-left leading-tight">
                    <div className="flex items-center gap-1">
                      <span className="text-[10px] sm:text-[11px] font-mono font-black text-white group-hover:text-[#00ff88] transition-colors whitespace-nowrap">
                        @{vendor.username}
                      </span>
                      {renderVendorIcon(vendor.iconType)}
                    </div>
                    <span className="text-[7.5px] sm:text-[8px] font-mono text-emerald-400 font-bold tracking-wider uppercase whitespace-nowrap">
                      {vendor.name}
                    </span>
                  </div>

                  {/* Telegram Paper Plane SVG Icon Button */}
                  <div className="w-4.5 h-4.5 sm:w-5 sm:h-5 rounded-full bg-emerald-950/90 border border-emerald-500/60 flex items-center justify-center shrink-0 group-hover:bg-[#00ff88] group-hover:border-[#00ff88] transition-all ml-0.5">
                    <Send className="w-2 sm:w-2.5 h-2 sm:h-2.5 text-[#00ff88] group-hover:text-slate-950 fill-current -rotate-12 transition-colors" />
                  </div>
                </a>
              </div>
            );
          })}
        </div>
      </div>

      {/* Mobile Creator Shortcuts Row (Ensures 1-tap accessibility on compact mobile viewports) */}
      <div className="sm:hidden mt-2.5 flex flex-wrap items-center justify-center gap-1.5 z-30 px-2">
        {VENDORS_FLOATING.map((v) => (
          <a
            key={v.id}
            href={v.telegramUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => recordVendorClickEvent(v.id, v.name, 'telegram', 'Hero Mobile Shortcut')}
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#051a0e]/90 border border-emerald-500/60 text-white text-[9px] font-mono font-bold shadow-md hover:border-[#00ff88] active:scale-95 transition-all"
          >
            <img loading="lazy" decoding="async" src={v.avatar} alt={v.name} className="w-3.5 h-3.5 rounded-full object-cover border border-emerald-400" />
            <span className="text-[#00ff88]">@{v.username}</span>
            {renderVendorIcon(v.iconType)}
            <Send className="w-2 h-2 text-[#00ff88] fill-[#00ff88] -rotate-12 ml-0.5" />
          </a>
        ))}
      </div>
    </div>
  );
};

