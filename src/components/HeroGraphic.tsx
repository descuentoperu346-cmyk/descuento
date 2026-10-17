import React, { useState } from 'react';
import { Send, Crown, Sparkles, Film, Shield, Zap } from 'lucide-react';
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
    avatar: '/imagenes/perfiles/tino.gif',
    role: 'OSINT & LEAKS',
    iconType: 'shield',
    accentColor: '#f43f5e'
  }
];

export const HeroGraphic: React.FC<HeroGraphicProps> = () => {
  const [isPaused, setIsPaused] = useState(false);

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
        className="relative w-full max-w-[280px] sm:max-w-[360px] md:max-w-[420px] lg:max-w-[460px] h-[230px] sm:h-[285px] md:h-[320px] lg:h-[340px] mx-auto flex items-center justify-center preserve-3d overflow-hidden sm:overflow-visible"
        style={{ perspective: '1000px' }}
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        {/* 1. Cybernetic Constellation Background Vector Network & Radar Reticle */}
        <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
          <svg
            className="w-full h-full opacity-65 overflow-visible"
            viewBox="0 0 600 600"
            preserveAspectRatio="xMidYMid meet"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              <radialGradient id="cyberAura" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#00ff88" stopOpacity="0.22" />
                <stop offset="40%" stopColor="#052614" stopOpacity="0.12" />
                <stop offset="80%" stopColor="#050b08" stopOpacity="0" />
              </radialGradient>
              <linearGradient id="orbitGlowGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#00ff88" stopOpacity="0.8" />
                <stop offset="50%" stopColor="#22d3ee" stopOpacity="0.3" />
                <stop offset="100%" stopColor="#00ff88" stopOpacity="0.8" />
              </linearGradient>
            </defs>

            {/* Central Ambient Glow */}
            <circle cx="300" cy="300" r="280" fill="url(#cyberAura)" />

            {/* Constellation Network Grid Lines (Cyber Nodes connecting in 3D space) */}
            <g stroke="#00ff88" strokeOpacity="0.18" strokeWidth="0.8">
              <line x1="80" y1="120" x2="180" y2="160" />
              <line x1="180" y1="160" x2="300" y2="100" />
              <line x1="300" y1="100" x2="430" y2="140" />
              <line x1="430" y1="140" x2="520" y2="110" />
              <line x1="180" y1="160" x2="120" y2="280" />
              <line x1="430" y1="140" x2="490" y2="260" />
              <line x1="120" y1="280" x2="90" y2="440" />
              <line x1="490" y1="260" x2="510" y2="420" />
              <line x1="90" y1="440" x2="200" y2="490" />
              <line x1="200" y1="490" x2="300" y2="520" />
              <line x1="300" y1="520" x2="420" y2="480" />
              <line x1="420" y1="480" x2="510" y2="420" />
              <line x1="120" y1="280" x2="200" y2="350" strokeDasharray="3 3" />
              <line x1="490" y1="260" x2="400" y2="350" strokeDasharray="3 3" />
            </g>

            {/* Constellation Circular Nodes with Glowing Core */}
            <g fill="#00ff88">
              <circle cx="80" cy="120" r="2" fillOpacity="0.6" />
              <circle cx="180" cy="160" r="3.5" fillOpacity="0.9" filter="drop-shadow(0 0 6px #00ff88)" />
              <circle cx="300" cy="100" r="2.5" fillOpacity="0.7" />
              <circle cx="430" cy="140" r="3.5" fillOpacity="0.9" filter="drop-shadow(0 0 6px #00ff88)" />
              <circle cx="520" cy="110" r="2" fillOpacity="0.6" />
              <circle cx="120" cy="280" r="3" fillOpacity="0.8" />
              <circle cx="490" cy="260" r="3.5" fillOpacity="0.9" filter="drop-shadow(0 0 6px #00ff88)" />
              <circle cx="90" cy="440" r="2.5" fillOpacity="0.7" />
              <circle cx="200" cy="490" r="3" fillOpacity="0.8" />
              <circle cx="300" cy="520" r="3" fillOpacity="0.8" />
              <circle cx="420" cy="480" r="3.5" fillOpacity="0.9" filter="drop-shadow(0 0 6px #00ff88)" />
              <circle cx="510" cy="420" r="2.5" fillOpacity="0.7" />
            </g>

            {/* Concentric Radar Reticle Circles with Crosshair Precision Ticks */}
            <circle cx="300" cy="300" r="220" stroke="#00ff88" strokeOpacity="0.12" strokeWidth="1" strokeDasharray="4 6" />
            <circle cx="300" cy="300" r="260" stroke="#00ff88" strokeOpacity="0.08" strokeWidth="1" />
            
            {/* Crosshair Cardinal Guides */}
            <line x1="300" y1="35" x2="300" y2="55" stroke="#00ff88" strokeOpacity="0.4" strokeWidth="1.5" />
            <line x1="300" y1="545" x2="300" y2="565" stroke="#00ff88" strokeOpacity="0.4" strokeWidth="1.5" />
            <line x1="35" y1="300" x2="55" y2="300" stroke="#00ff88" strokeOpacity="0.4" strokeWidth="1.5" />
            <line x1="545" y1="300" x2="565" y2="300" stroke="#00ff88" strokeOpacity="0.4" strokeWidth="1.5" />
          </svg>
        </div>

        {/* 2. 3D Gyroscope Atomic Orbit Rings (Rotating in 3D perspective space) */}
        <div
          className="absolute inset-0 pointer-events-none flex items-center justify-center preserve-3d"
          style={{ perspective: '1000px' }}
        >
          {/* 3D Primary Atom Ring (Tilted Elliptical Orbit) */}
          <div className="absolute w-[205px] sm:w-[250px] md:w-[285px] lg:w-[310px] h-[205px] sm:h-[250px] md:h-[285px] lg:h-[310px] rounded-full border border-dashed border-emerald-400/40 shadow-[0_0_16px_rgba(0,255,136,0.2)] animate-atom-3d-1 preserve-3d flex items-center justify-center">
            {/* Orbiting particle bead with cyan/white core */}
            <div className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-3 h-3 rounded-full bg-[#00ff88] shadow-[0_0_12px_#00ff88] border-2 border-white flex items-center justify-center">
              <div className="w-1 h-1 rounded-full bg-white" />
            </div>
            <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-cyan-300 shadow-[0_0_8px_#22d3ee]" />
          </div>

          {/* 3D Secondary Atom Ring */}
          <div className="absolute w-[205px] sm:w-[250px] md:w-[285px] lg:w-[310px] h-[205px] sm:h-[250px] md:h-[285px] lg:h-[310px] rounded-full border border-emerald-400/30 shadow-[0_0_16px_rgba(0,255,136,0.18)] animate-atom-3d-2 preserve-3d flex items-center justify-center">
            <div className="absolute top-1/2 -right-1.5 -translate-y-1/2 w-3 h-3 rounded-full bg-[#00ff88] shadow-[0_0_12px_#00ff88] border-2 border-white flex items-center justify-center">
              <div className="w-1 h-1 rounded-full bg-white" />
            </div>
            <div className="absolute top-1/2 -left-1 -translate-y-1/2 w-2 h-2 rounded-full bg-emerald-300 shadow-[0_0_8px_#00ff88]" />
          </div>

          {/* 3D Tertiary Atomic Orbit */}
          <div className="absolute w-[205px] sm:w-[250px] md:w-[285px] lg:w-[310px] h-[205px] sm:h-[250px] md:h-[285px] lg:h-[310px] rounded-full border border-emerald-300/35 shadow-[0_0_16px_rgba(0,255,136,0.18)] animate-atom-3d-3 preserve-3d flex items-center justify-center">
            <div className="absolute top-6 right-6 w-3 h-3 rounded-full bg-[#00ff88] shadow-[0_0_12px_#00ff88] border-2 border-white flex items-center justify-center">
              <div className="w-1 h-1 rounded-full bg-white" />
            </div>
          </div>

          {/* Glowing Luminous Toroidal Beads (Gliding along orbit paths) */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-5 h-2.5 rounded-full border-2 border-[#00ff88] bg-emerald-500/30 shadow-[0_0_12px_#00ff88] animate-orbit-toroid-1 pointer-events-none" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-5 h-2.5 rounded-full border-2 border-[#22d3ee] bg-cyan-500/30 shadow-[0_0_12px_#22d3ee] animate-orbit-toroid-2 pointer-events-none" />
        </div>

        {/* 3. CENTRAL LOGO MEDALLION (Mid Plane z-20: Centerpiece with Peru Flags & Telegram Core) */}
        <div
          className="relative z-20 w-[125px] sm:w-[150px] md:w-[170px] lg:w-[185px] aspect-square flex items-center justify-center pointer-events-none"
          style={{
            transform: 'translateZ(0px)',
            filter: 'drop-shadow(0 10px 25px rgba(0,0,0,0.95)) drop-shadow(0 0 35px rgba(0,255,136,0.35))'
          }}
        >
          {/* Pulsing Emerald Energy Rim */}
          <div className="absolute -inset-1.5 rounded-full border-2 border-emerald-400/60 bg-emerald-500/10 blur-[1px] animate-pulse pointer-events-none" />

          {/* Rotating High-Tech Precision Reticle Ring */}
          <div className="absolute -inset-2.5 rounded-full border border-dashed border-emerald-400/30 animate-spin-slow pointer-events-none" />

          {/* Central Logo Artwork: Complete Medallion */}
          <img
            src="/imagenes/hero-circle.png"
            alt="Descuentos Perú"
            className="w-full h-full object-contain filter contrast-105 brightness-105 pointer-events-none"
            loading="eager"
          />
        </div>

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
            <img src={v.avatar} alt={v.name} className="w-3.5 h-3.5 rounded-full object-cover border border-emerald-400" />
            <span className="text-[#00ff88]">@{v.username}</span>
            {renderVendorIcon(v.iconType)}
            <Send className="w-2 h-2 text-[#00ff88] fill-[#00ff88] -rotate-12 ml-0.5" />
          </a>
        ))}
      </div>
    </div>
  );
};
