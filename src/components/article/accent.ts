/** Color de acento del artículo: rosa para expedientes e investigaciones, verde para guías y análisis. */
export type Accent = 'rose' | 'emerald';

export const ACCENTS: Record<
  Accent,
  { text: string; bg: string; border: string; activeBorder: string; soft: string; hoverBorder: string; dot: string; fill: string }
> = {
  rose: {
    text: 'text-rose-400',
    bg: 'bg-rose-500',
    border: 'border-rose-500/40',
    activeBorder: 'border-rose-500',
    soft: 'bg-rose-500/10',
    hoverBorder: 'hover:border-rose-400',
    dot: 'bg-rose-500',
    fill: 'bg-rose-500'
  },
  emerald: {
    text: 'text-[#00ff88]',
    bg: 'bg-[#00ff88]',
    border: 'border-[#00ff88]/40',
    activeBorder: 'border-[#00ff88]',
    soft: 'bg-[#00ff88]/10',
    hoverBorder: 'hover:border-[#00ff88]',
    dot: 'bg-[#00ff88]',
    fill: 'bg-[#00ff88]'
  }
};

export const SEVERITY: Record<string, { label: string; cls: string }> = {
  critico: { label: 'Riesgo crítico', cls: 'border-rose-500/60 bg-rose-500/10 text-rose-300' },
  alto: { label: 'Riesgo alto', cls: 'border-amber-500/60 bg-amber-500/10 text-amber-300' },
  medio: { label: 'Riesgo medio', cls: 'border-sky-500/60 bg-sky-500/10 text-sky-300' },
  informativo: { label: 'Informativo', cls: 'border-emerald-500/60 bg-emerald-500/10 text-emerald-300' }
};
