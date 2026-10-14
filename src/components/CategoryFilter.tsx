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
    <div id="catalogo-servicios" className="pt-2 pb-6 space-y-6">
      
      {/* Category Pills & Search Controls Deck */}
      <div className="p-4 sm:p-6 rounded-3xl bg-gradient-to-r from-[#03140a]/95 via-[#051c0f]/95 to-[#020d06]/95 border border-emerald-500/30 shadow-[0_0_30px_rgba(0,255,136,0.08)] backdrop-blur-xl space-y-5">
        
        {/* Top Row: Categories Tabs & Search Input */}
        <div className="flex flex-col xl:flex-row items-stretch xl:items-center justify-between gap-4">
          
          {/* Futuristic Category Switcher Pills */}
          <div className="flex flex-wrap items-center gap-2">
            {categories.map((cat) => {
              const isActive = selectedCategory === cat.id;
              const count = categoryCounts ? categoryCounts[cat.id] : undefined;
              const IconComp = cat.icon;

              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => onSelectCategory(cat.id)}
                  className={`group px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap cursor-pointer flex items-center gap-2 relative ${
                    isActive
                      ? 'bg-[#00ff88] text-slate-950 shadow-[0_0_20px_rgba(0,255,136,0.45)] scale-102 font-black'
                      : 'bg-[#041208] text-slate-300 hover:text-white hover:bg-[#082212] border border-emerald-900/80 hover:border-emerald-500/60'
                  }`}
                >
                  <IconComp className={`w-4 h-4 ${isActive ? 'text-slate-950' : 'text-[#00ff88] group-hover:scale-110'} transition-transform`} />
                  <span>{cat.label}</span>
                  {typeof count === 'number' && (
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-bold ${
                        isActive
                          ? 'bg-black/25 text-slate-950'
                          : 'bg-emerald-950 text-emerald-400 border border-emerald-800/60'
                      }`}
                    >
                      {count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Glowing Search Input Bar */}
          <div className="relative w-full xl:w-80 shrink-0">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
              <Search className="w-4 h-4 text-[#00ff88]" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Buscar servicio (ej. Netflix, OSINT)..."
              className="w-full pl-10 pr-10 py-2.5 rounded-2xl bg-[#020b05] border border-emerald-500/40 text-slate-100 text-xs sm:text-sm placeholder-slate-500 focus:outline-none focus:border-[#00ff88] focus:ring-2 focus:ring-[#00ff88]/30 transition-all font-sans shadow-inner"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => onSearchChange('')}
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-white cursor-pointer"
                title="Limpiar búsqueda"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Bottom Row: Creator / Vendor Filter Badges with Photos */}
        {vendors.length > 0 && onSelectVendorId && (
          <div className="pt-4 border-t border-emerald-950/80 flex flex-col sm:flex-row sm:items-center gap-3">
            <span className="text-xs font-mono font-bold text-slate-400 flex items-center gap-1.5 shrink-0 uppercase tracking-wider">
              <Users className="w-3.5 h-3.5 text-[#00ff88]" />
              <span>Filtrar por Creador:</span>
            </span>

            <div className="flex flex-wrap items-center gap-2">
              {/* "Todos" button */}
              <button
                type="button"
                onClick={() => onSelectVendorId('todos')}
                className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer ${
                  selectedVendorId === 'todos'
                    ? 'bg-[#00ff88] text-slate-950 shadow-[0_0_15px_rgba(0,255,136,0.35)]'
                    : 'bg-[#030e06] text-slate-400 hover:text-white border border-emerald-950 hover:border-emerald-700'
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
                      className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-gradient-to-r from-emerald-950 to-emerald-900 border-2 border-[#00ff88] text-white shadow-[0_0_15px_rgba(0,255,136,0.4)] scale-102'
                          : 'bg-[#030e06] text-slate-300 hover:text-white border border-emerald-950 hover:border-emerald-600'
                      }`}
                    >
                      <div className="w-4 h-4 rounded-full overflow-hidden shrink-0 border border-emerald-400">
                        <img
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
