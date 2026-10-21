import type { LeakArticle } from '../../data/leaksData';

/** Lógica del formulario de artículos de Leaks, separada de la pantalla para poder probarla sola. */

export type ArticleCategory = LeakArticle['category'];
export type Severity = LeakArticle['severity'];

export const CATEGORY_OPTIONS: { value: ArticleCategory; label: string; kicker: string }[] = [
  { value: 'filtraciones', label: 'Filtraciones', kicker: 'FILTRACIONES' },
  { value: 'investigaciones', label: 'Investigaciones', kicker: 'INVESTIGACIÓN' },
  { value: 'ciberseguridad', label: 'Ciberseguridad', kicker: 'CIBERSEGURIDAD' },
  { value: 'guias', label: 'Guías de protección', kicker: 'GUÍAS & PROTECCIÓN' },
  { value: 'darkweb', label: 'Dark web y stealers', kicker: 'DARK WEB & STEALERS' },
  { value: 'breaches', label: 'Filtraciones registrales', kicker: 'FILTRACIONES REGISTRALES' },
  { value: 'bancos', label: 'Seguridad financiera', kicker: 'SEGURIDAD FINANCIERA' }
];
export const kickerFor = (c: ArticleCategory) => CATEGORY_OPTIONS.find((o) => o.value === c)?.kicker ?? c.toUpperCase();

export const SEVERITY_OPTIONS: { value: Severity; label: string; help: string }[] = [
  { value: 'critico', label: 'Crítico', help: 'Alerta urgente' },
  { value: 'alto', label: 'Alto', help: 'Riesgo alto' },
  { value: 'medio', label: 'Medio', help: 'Riesgo medio' },
  { value: 'informativo', label: 'Informativo', help: 'Guía o aviso preventivo' }
];

export const LIMITS = { title: 140, summary: 320, scope: 80, author: 60, tags: 200 };

export interface ArticleDraft {
  title: string;
  category: ArticleCategory;
  categoryLabel: string;
  severity: Severity;
  summary: string;
  /** Párrafos separados por una línea en blanco */
  body: string;
  compromisedData: string;
  affectedScope: string;
  author: string;
  authorRole: string;
  authorTelegram: string;
  imageUrl: string;
  featured: boolean;
  tags: string;
}

export const DEFAULT_IMAGE = '/imagenes/card-leaks.jpg';

export function emptyArticleDraft(author = '', telegram = ''): ArticleDraft {
  return {
    title: '',
    category: 'filtraciones',
    categoryLabel: kickerFor('filtraciones'),
    severity: 'alto',
    summary: '',
    body: '',
    compromisedData: '',
    affectedScope: '',
    author,
    authorRole: 'Analista de Seguridad Digital',
    authorTelegram: telegram,
    imageUrl: DEFAULT_IMAGE,
    featured: false,
    tags: ''
  };
}

export const splitList = (s: string) =>
  s
    .split(',')
    .map((x) => x.trim())
    .filter(Boolean);
export const joinParagraphs = (p: string[]) => p.join('\n\n');
export const splitParagraphs = (s: string) =>
  s
    .split(/\n\s*\n/)
    .map((x) => x.trim())
    .filter(Boolean);

/** Si dividir el cuerpo por líneas en blanco devuelve exactamente lo mismo, se puede editar sin perder nada. */
export const canEditBody = (a: LeakArticle) => JSON.stringify(splitParagraphs(joinParagraphs(a.content || []))) === JSON.stringify(a.content || []);

/** Artículos con elementos que este formulario no muestra (figuras, videos, cronología…). */
export const hasRichContent = (a: LeakArticle) =>
  !!(a.evidenceFigures?.length || a.ballisticsCases?.length || a.suspects?.length || a.leakedChats?.length || a.videos?.length || a.sectionImages || a.sidebar || a.keyStats?.length || a.fullBody);

export function draftFromArticle(a: LeakArticle): ArticleDraft {
  return {
    title: a.title,
    category: a.category,
    categoryLabel: a.categoryLabel,
    severity: a.severity,
    summary: a.summary,
    body: joinParagraphs(a.content || []),
    compromisedData: (a.compromisedData || []).join(', '),
    affectedScope: a.affectedScope || '',
    author: a.author,
    authorRole: a.authorRole,
    authorTelegram: a.authorTelegram,
    imageUrl: a.imageUrl,
    featured: !!a.featured,
    tags: (a.tags || []).join(', ')
  };
}

export interface ArticleErrors {
  title?: string;
  summary?: string;
  author?: string;
}
/** Al editar un artículo ya publicado, su texto actual siempre se acepta aunque sea más largo que el límite para los nuevos. */
export const capFor = (limit: number, original?: string) => Math.max(limit, (original || '').length);

export function validateArticle(d: ArticleDraft, base?: LeakArticle | null): ArticleErrors {
  const e: ArticleErrors = {};
  const titleMax = capFor(LIMITS.title, base?.title);
  const summaryMax = capFor(LIMITS.summary, base?.summary);
  if (!d.title.trim()) e.title = 'Escribe el título del artículo.';
  else if (d.title.trim().length > titleMax) e.title = `Máximo ${titleMax} letras.`;
  if (!d.summary.trim()) e.summary = 'Escribe un resumen corto: es lo que se ve en la tarjeta.';
  else if (d.summary.trim().length > summaryMax) e.summary = `Máximo ${summaryMax} letras.`;
  if (!d.author.trim()) e.author = 'Indica quién firma el artículo.';
  return e;
}
export const hasArticleErrors = (e: ArticleErrors) => Object.keys(e).length > 0;

/** "a-z0-9" sin tildes ni símbolos, y distinto de los que ya existen. */
export function slugify(title: string, taken: string[]): string {
  const base =
    title
      .toLowerCase()
      .normalize('NFD')
      .replace(/[̀-ͯ]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 80)
      .replace(/-+$/g, '') || 'articulo';
  let slug = base;
  for (let i = 2; taken.includes(slug); i++) slug = `${base}-${i}`;
  return slug;
}

export function readTimeFor(paragraphs: string[]): string {
  const words = paragraphs.join(' ').split(/\s+/).filter(Boolean).length;
  return `${Math.max(1, Math.ceil(words / 200))} min de lectura`;
}

export const todayLabel = (now = new Date()) => now.toLocaleDateString('es-PE', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'America/Lima' });

/**
 * Arma el artículo a guardar. Al editar parte del original para NO perder lo que el formulario no muestra
 * (figuras, videos, número de leak, etc.) y se conserva su enlace (slug) y su fecha.
 */
export function articleFromDraft(d: ArticleDraft, base: LeakArticle | null, ctx: { id: string; takenSlugs: string[]; now?: Date }): LeakArticle {
  const bodyEditable = !base || canEditBody(base);
  const paragraphs = bodyEditable ? splitParagraphs(d.body) : base!.content;
  const content = paragraphs.length ? paragraphs : [d.summary.trim()];
  const compromised = splitList(d.compromisedData);
  const tags = splitList(d.tags);
  return {
    ...(base || { id: ctx.id, slug: slugify(d.title, ctx.takenSlugs), date: todayLabel(ctx.now) }),
    title: d.title.trim(),
    category: d.category,
    categoryLabel: d.categoryLabel.trim() || kickerFor(d.category),
    severity: d.severity,
    // El tiempo de lectura solo se recalcula si se cambió el cuerpo
    readTime: !base ? readTimeFor(content) : bodyEditable && d.body.trim() !== joinParagraphs(base.content || []).trim() ? readTimeFor(content) : base.readTime,
    author: d.author.trim(),
    authorRole: d.authorRole.trim() || 'Analista de Seguridad Digital',
    authorTelegram: d.authorTelegram.trim().replace(/^@/, ''),
    imageUrl: d.imageUrl || DEFAULT_IMAGE,
    summary: d.summary.trim(),
    content,
    compromisedData: compromised.length ? compromised : base?.compromisedData?.length ? base.compromisedData : ['Datos personales'],
    affectedScope: d.affectedScope.trim() || base?.affectedScope || 'Por confirmar',
    tags: tags.length ? tags : base?.tags?.length ? base.tags : ['Ciberseguridad', 'Perú'],
    featured: d.featured
  } as LeakArticle;
}

export const isArticleDirty = (a: ArticleDraft, b: ArticleDraft) => JSON.stringify(a) !== JSON.stringify(b);
