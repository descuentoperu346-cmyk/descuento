import React, { useState } from 'react';
import { Send } from 'lucide-react';
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
  badge: string;
}

const VENDORS_FLOATING: FloatingVendor[] = [
  {
    id: 'vendedor-whisky',
    name: 'Whisky Perú',
    username: 'whiskyper',
    telegramUrl: 'https://t.me/whiskyper',
    avatar: '/imagenes/perfiles/whisky.jpg',
    badge: '👑 STREAMING'
  },
  {
    id: 'vendedor-nano',
    name: 'El Nano VIP',
    username: 'elnanovip',
    telegramUrl: 'https://t.me/elnanovip',
    avatar: '/imagenes/perfiles/nanovip.jpg',
    badge: '🎬 CINE & IA'
  },
  {
    id: 'vendedor-tino',
    name: 'Tin9o',
    username: 'Tin9o',
    telegramUrl: 'https://t.me/Tin9o',
    avatar: '/imagenes/perfiles/tino.gif',
    badge: '🛡️ OSINT & LEAKS'
  },
  {
    id: 'vendedor-abby',
    name: 'Abbys Perú',
    username: 'AbbysPeru',
    telegramUrl: 'https://t.me/AbbysPeru',
    avatar: '/imagenes/perfiles/abby.jpg',
    badge: '⭐ DISEÑO & HIFI'
  }
];

export const HeroGraphic: React.FC<HeroGraphicProps> = () => {
  const [isPaused, setIsPaused] = useState(false);

  return (
    <div className="flex flex-col items-center justify-center w-full">
      {/* 3D Celestial Atom Orbit: Compact & Balanced */}
      <div
        className="relative w-full max-w-[270px] sm:max-w-[320px] md:max-w-[360px] lg:max-w-[390px] aspect-square mx-auto flex items-center justify-center select-none [--orbit-vendor-r:98px] sm:[--orbit-vendor-r:114px] md:[--orbit-vendor-r:128px] lg:[--orbit-vendor-r:140px] preserve-3d"
        style={{ perspective: '1000px' }}
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        {/* 1. Ambient Background Emerald Radial Glow */}
        <div className="absolute inset-4 rounded-full bg-emerald-500/15 blur-3xl pointer-events-none animate-pulse-glow" />
        <div className="absolute inset-12 rounded-full bg-[#00ff88]/10 blur-2xl pointer-events-none" />

        {/* 2. 3D ATOM GYROSCOPE RINGS (Orbiting in 3D Space with glowing particle nodes) */}
        <div
          className="absolute inset-0 pointer-events-none flex items-center justify-center preserve-3d"
          style={{ perspective: '900px' }}
        >
          {/* 3D Atom Ring 1 */}
          <div className="absolute w-[240px] sm:w-[280px] md:w-[315px] lg:w-[345px] h-[240px] sm:h-[280px] md:h-[315px] lg:h-[345px] rounded-full border border-dashed border-emerald-400/40 shadow-[0_0_15px_rgba(0,255,136,0.2)] animate-atom-3d-1 preserve-3d flex items-center justify-center">
            <div className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-3 h-3 rounded-full bg-[#00ff88] shadow-[0_0_12px_#00ff88] border-2 border-white flex items-center justify-center">
              <div className="w-1 h-1 rounded-full bg-white" />
            </div>
            <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-[#00e676] shadow-[0_0_8px_#00e676]" />
          </div>

          {/* 3D Atom Ring 2 */}
          <div className="absolute w-[240px] sm:w-[280px] md:w-[315px] lg:w-[345px] h-[240px] sm:h-[280px] md:h-[315px] lg:h-[345px] rounded-full border border-emerald-400/35 shadow-[0_0_15px_rgba(0,255,136,0.2)] animate-atom-3d-2 preserve-3d flex items-center justify-center">
            <div className="absolute top-1/2 -right-1.5 -translate-y-1/2 w-3 h-3 rounded-full bg-[#00ff88] shadow-[0_0_12px_#00ff88] border-2 border-white flex items-center justify-center">
              <div className="w-1 h-1 rounded-full bg-white" />
            </div>
            <div className="absolute top-1/2 -left-1 -translate-y-1/2 w-2 h-2 rounded-full bg-cyan-300 shadow-[0_0_8px_#22d3ee]" />
          </div>

          {/* 3D Atom Ring 3 */}
          <div className="absolute w-[240px] sm:w-[280px] md:w-[315px] lg:w-[345px] h-[240px] sm:h-[280px] md:h-[315px] lg:h-[345px] rounded-full border border-emerald-300/40 shadow-[0_0_15px_rgba(0,255,136,0.2)] animate-atom-3d-3 preserve-3d flex items-center justify-center">
            <div className="absolute top-6 right-6 w-3 h-3 rounded-full bg-[#00ff88] shadow-[0_0_12px_#00ff88] border-2 border-white flex items-center justify-center">
              <div className="w-1 h-1 rounded-full bg-white" />
            </div>
          </div>

          {/* Outer Guide Rail */}
          <div className="absolute w-[270px] sm:w-[310px] md:w-[350px] lg:w-[385px] h-[270px] sm:h-[310px] md:h-[350px] lg:h-[385px] rounded-full border border-emerald-500/20 animate-spin-slow pointer-events-none" />
        </div>

        {/* 3. CENTRAL LOGO MEDALLION (Mid Plane z-20, physical barrier for 3D orbit) */}
        <div
          className="relative z-20 w-[170px] sm:w-[205px] md:w-[230px] lg:w-[250px] aspect-square flex items-center justify-center pointer-events-none"
          style={{
            transform: 'translateZ(0px)',
            filter: 'drop-shadow(0 15px 30px rgba(0,0,0,0.95)) drop-shadow(0 0 35px rgba(0,255,136,0.35))'
          }}
        >
          {/* Pulsing Emerald Energy Rim */}
          <div className="absolute -inset-1.5 rounded-full border-2 border-emerald-400/60 bg-emerald-500/10 blur-[1px] animate-pulse pointer-events-none" />

          {/* Central Logo Artwork: Complete Medallion */}
          <img
            src="/imagenes/hero-circle.png"
            alt="Descuentos Perú"
            className="w-full h-full object-contain filter contrast-105 brightness-105 pointer-events-none"
            loading="eager"
          />
        </div>

        {/* 4. 3D ATOM ORBIT: 4 CREATOR BUTTONS TRAVELING IN FRONT & BEHIND THE LOGO */}
        <div className="absolute inset-0 pointer-events-none flex items-center justify-center preserve-3d">
          {VENDORS_FLOATING.map((vendor, index) => {
            // Stagger 4 vendors evenly across 24s orbit (0s, -6s, -12s, -18s)
            const delaySeconds = -index * 6;

            return (
              <div
                key={vendor.id}
                className="absolute top-1/2 left-1/2 pointer-events-auto animate-orbit-atom-vendor preserve-3d"
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
                  className="group flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-1 sm:py-1.5 rounded-full bg-gradient-to-r from-[#03140b]/95 via-[#062214]/95 to-[#020d07]/95 hover:from-[#08301c] hover:via-[#0c3d23] hover:to-[#041a0f] border border-emerald-400/80 hover:border-[#00ff88] shadow-[0_0_20px_rgba(0,255,136,0.5)] hover:shadow-[0_0_32px_rgba(0,255,136,0.9)] backdrop-blur-xl hover:scale-110 active:scale-95 transition-all duration-200 cursor-pointer pointer-events-auto select-none"
                  title={`Abrir Telegram de @${vendor.username} (${vendor.name})`}
                >
                  {/* Creator Photo Avatar with Online Status Glow */}
                  <div className="relative w-5 h-5 sm:w-6 sm:h-6 rounded-full overflow-hidden shrink-0 border border-emerald-300 shadow-[0_0_10px_#00ff88] group-hover:border-white transition-colors">
                    <img
                      src={vendor.avatar}
                      alt={vendor.name}
                      className="w-full h-full object-cover"
                    />
                    <span className="absolute -bottom-0.5 -right-0.5 w-1.5 h-1.5 rounded-full bg-[#00ff88] border border-black animate-pulse shadow-[0_0_5px_#00ff88]" />
                  </div>

                  {/* Creator Username */}
                  <div className="flex flex-col text-left leading-tight">
                    <span className="text-[10px] sm:text-[11px] font-mono font-black text-white group-hover:text-[#00ff88] transition-colors whitespace-nowrap">
                      @{vendor.username}
                    </span>
                    <span className="text-[8px] font-mono text-emerald-300/80 font-semibold tracking-wider uppercase whitespace-nowrap hidden sm:inline">
                      {vendor.name}
                    </span>
                  </div>

                  {/* Telegram Paper Plane Icon */}
                  <div className="w-4 h-4 rounded-full bg-emerald-950/80 border border-emerald-500/50 flex items-center justify-center shrink-0 group-hover:bg-[#00ff88] group-hover:border-[#00ff88] transition-all">
                    <Send className="w-2 h-2 text-[#00ff88] group-hover:text-slate-950 fill-current -rotate-12 transition-colors" />
                  </div>
                </a>
              </div>
            );
          })}
        </div>
      </div>

      {/* Mobile Creator Shortcuts Row (Ensures 1-tap accessibility on compact screens) */}
      <div className="sm:hidden mt-3 flex flex-wrap items-center justify-center gap-1.5 z-30 px-2">
        {VENDORS_FLOATING.map((v) => (
          <a
            key={v.id}
            href={v.telegramUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => recordVendorClickEvent(v.id, v.name, 'telegram', 'Hero Mobile Shortcut')}
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#051a0e]/90 border border-emerald-500/50 text-white text-[10px] font-mono font-bold shadow-md hover:border-[#00ff88] active:scale-95 transition-all"
          >
            <img src={v.avatar} alt={v.name} className="w-4 h-4 rounded-full object-cover border border-emerald-400" />
            <span className="text-[#00ff88]">@{v.username}</span>
            <Send className="w-2.5 h-2.5 text-[#00ff88] fill-[#00ff88] -rotate-12" />
          </a>
        ))}
      </div>
    </div>
  );
};
