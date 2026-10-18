import React from 'react';
import { Search, Users, Sparkles, Tv, ShieldCheck, GraduationCap, X } from 'lucide-react';
import { Vendor } from '../data/vendorsData';

interface CategoryFilterProps {
  selectedCategory: string;
  onSelectCategory: (category: string) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  vendors?: Vendor[];
  selectedVendorId?: string;
  onSelectVendorId?: (vendorId: string) => void;
  categoryCounts?: Record<string, number>;
}

export const CategoryFilter: React.FC<CategoryFilterProps> = ({
  selectedCategory,
  onSelectCategory,
  searchQuery,
  onSearchChange,
  vendors = [],
  selectedVendorId = 'todos',
  onSelectVendorId,
  categoryCounts
}) => {
  const categories = [
    { id: 'todos', label: 'Todos los Servicios', icon: Sparkles },
    { id: 'streaming', label: 'Streaming 4K UHD', icon: Tv },
    { id: 'investigacion', label: 'Investigación OSINT', icon: ShieldCheck },
    { id: 'educacion', label: 'Software & Licencias', icon: GraduationCap }
  ];

  return (
    <div id="catalogo-servicios" className="pt-2 pb-6 space-y-4">
      {/* Cyber Command Filter Deck */}
      <div className="p-4 sm:p-5 rounded-3xl bg-gradient-to-r from-[#0d0d0d]/95 via-[#161616]/95 to-[#090909]/95 border-2 border-zinc-700 backdrop-blur-xl relative overflow-hidden space-y-4">
        {/* Cyber Tech Corner Brackets */}
        <div className="absolute top-2.5 left-2.5 w-3 h-3 border-t-2 border-l-2 border-[#00ff88]/60 pointer-events-none" />
        <div className="absolute top-2.5 right-2.5 w-3 h-3 border-t-2 border-r-2 border-[#00ff88]/60 pointer-events-none" />
        <div className="absolute bottom-2.5 left-2.5 w-3 h-3 border-b-2 border-l-2 border-[#00ff88]/60 pointer-events-none" />
        <div className="absolute bottom-2.5 right-2.5 w-3 h-3 border-b-2 border-r-2 border-[#00ff88]/60 pointer-events-none" />

        {/* Top Command Bar: Category Pills + Search Input */}
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 relative z-10">
          
          {/* Streamlined Category Switcher Tabs */}
          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
            {categories.map((cat) => {
              const isActive = selectedCategory === cat.id;
              const count = categoryCounts ? categoryCounts[cat.id] : undefined;
              const IconComp = cat.icon;

              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => onSelectCategory(cat.id)}
                  className={`group px-3 sm:px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5 relative select-none ${
                    isActive
                      ? 'bg-[#00ff88] text-slate-950 font-black scale-102'
                      : 'bg-[#070707] text-slate-300 hover:text-white hover:bg-[#151515] border border-zinc-800/80 hover:border-emerald-500/60'
                  }`}
                >
                  <IconComp className={`w-3.5 h-3.5 ${isActive ? 'text-slate-950' : 'text-[#00ff88] group-hover:scale-110'} transition-transform shrink-0`} />
                  <span>{cat.label}</span>
                  {typeof count === 'number' && (
                    <span
                      className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono font-bold leading-none ${
                        isActive
                          ? 'bg-black/25 text-slate-950'
                          : 'bg-zinc-900 text-emerald-400 border border-zinc-700/60'
                      }`}
                    >
                      {count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Integrated Cyber Search Bar */}
          <div className="relative w-full lg:w-72 shrink-0">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
              <Search className="w-3.5 h-3.5 text-[#00ff88]" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Buscar servicio (ej. Netflix, OSINT)..."
              className="w-full pl-9 pr-9 py-2 rounded-xl bg-[#070707] border border-zinc-700 text-slate-100 text-xs placeholder-slate-500 focus:outline-none focus:border-[#00ff88] focus:ring-2 focus:ring-[#00ff88]/30 transition-all font-sans shadow-inner"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => onSearchChange('')}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-white cursor-pointer"
                title="Limpiar búsqueda"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Bottom Command Bar: Creator / Vendor Filters with Photos */}
        {vendors.length > 0 && onSelectVendorId && (
          <div className="pt-3 border-t border-zinc-700 flex flex-col sm:flex-row sm:items-center gap-2.5 relative z-10">
            <span className="text-[11px] font-mono font-bold text-slate-400 flex items-center gap-1.5 shrink-0 uppercase tracking-wider">
              <Users className="w-3.5 h-3.5 text-[#00ff88]" />
              <span>Filtrar por Creador:</span>
            </span>

            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
              {/* "Todos" button */}
              <button
                type="button"
                onClick={() => onSelectVendorId('todos')}
                className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer select-none ${
                  selectedVendorId === 'todos'
                    ? 'bg-[#00ff88] text-slate-950'
                    : 'bg-[#070707] text-slate-400 hover:text-white border border-zinc-900 hover:border-emerald-700'
                }`}
              >
                Todos los creadores
              </button>

              {/* Individual Vendor Badges with Avatars */}
              {vendors
                .filter((v) => v.active)
                .map((v) => {
                  const isSelected = selectedVendorId === v.id;
                  return (
                    <button
                      key={v.id}
                      type="button"
                      onClick={() => onSelectVendorId(v.id)}
                      className={`flex items-center gap-1.5 px-2.5 py-1.2 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer select-none ${
                        isSelected
                          ? 'bg-gradient-to-r from-zinc-900 to-zinc-800 border-2 border-[#00ff88] text-white scale-102'
                          : 'bg-[#070707] text-slate-300 hover:text-white border border-zinc-900 hover:border-emerald-600'
                      }`}
                    >
                      <div className="w-4 h-4 rounded-full overflow-hidden shrink-0 border border-emerald-400">
                        <img loading="lazy" decoding="async"
                          src={v.avatar}
                          alt={v.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <span>@{v.username}</span>
                      <span className="w-1.5 h-1.5 rounded-full bg-[#00ff88] animate-pulse" />
                    </button>
                  );
                })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

