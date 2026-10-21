import React, { useEffect, useMemo, useRef, useState } from 'react';
import { AlertOctagon, AlertTriangle, ArrowLeft, ExternalLink, FileText, ImagePlus, Info, Pencil, Plus, RotateCcw, Search, ShieldCheck, Star, Trash2, TriangleAlert, X } from 'lucide-react';
import type { LeakArticle } from '../../data/leaksData';
import { optimizeImage, dataUrlKb } from '../../lib/imageUpload';
import { deleteNote, useTrashReady } from '../../lib/vaultApi';
import { Card, PageHeader, primaryBtn, secondaryBtn } from './ui';
import { Field, Switch, inputCls } from './fields';
import { ConfirmDialog } from './Dialog';
import {
  CATEGORY_OPTIONS,
  DEFAULT_IMAGE,
  LIMITS,
  SEVERITY_OPTIONS,
  articleFromDraft,
  canEditBody,
  capFor,
  draftFromArticle,
  emptyArticleDraft,
  hasArticleErrors,
  hasRichContent,
  isArticleDirty,
  kickerFor,
  readTimeFor,
  splitParagraphs,
  validateArticle,
  type ArticleCategory,
  type ArticleDraft,
  type Severity
} from './articlesForm';

interface ArticlesPageProps {
  articles: LeakArticle[];
  authorName: string;
  authorTelegram: string;
  /** true cuando los artículos se guardan en la base de datos */
  dbMode: boolean;
  onUpdate: (list: LeakArticle[], message: string) => void;
  onViewPublic: () => void;
  /** Solo sin base de datos: vuelve a los artículos de ejemplo */
  onReset?: () => void;
  onDirtyChange: (dirty: boolean) => void;
}

const norm = (s: string) =>
  s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '');

const SEV: Record<Severity, { label: string; icon: React.ElementType; chip: string }> = {
  critico: { label: 'Crítico', icon: AlertOctagon, chip: 'border-rose-400/40 bg-rose-500/10 text-rose-200' },
  alto: { label: 'Alto', icon: AlertTriangle, chip: 'border-amber-400/40 bg-amber-400/10 text-amber-200' },
  medio: { label: 'Medio', icon: Info, chip: 'border-sky-400/40 bg-sky-400/10 text-sky-200' },
  informativo: { label: 'Informativo', icon: ShieldCheck, chip: 'border-zinc-600 bg-zinc-800 text-zinc-200' }
};
const SevChip: React.FC<{ severity: Severity }> = ({ severity }) => {
  const s = SEV[severity] || SEV.informativo;
  const Icon = s.icon;
  return (
    <span className={`inline-flex items-center gap-1 rounded-md border px-1.5 py-0.5 text-[11px] font-semibold ${s.chip}`}>
      <Icon className="h-3 w-3" aria-hidden="true" />
      {s.label}
    </span>
  );
};

const counter = (n: number, max: number) => (
  <span className={`ml-auto tabular-nums ${n > max ? 'text-rose-300' : 'text-zinc-400'}`}>
    {n}/{max}
  </span>
);

// ======================================================================= Editor
const ArticleEditor: React.FC<{
  article: LeakArticle | null;
  all: LeakArticle[];
  authorName: string;
  authorTelegram: string;
  dbMode: boolean;
  onSave: (a: LeakArticle, isNew: boolean) => void;
  onClose: () => void;
  onDirtyChange: (dirty: boolean) => void;
}> = ({ article, all, authorName, authorTelegram, dbMode, onSave, onClose, onDirtyChange }) => {
  const initial = useMemo(() => (article ? draftFromArticle(article) : emptyArticleDraft(authorName, authorTelegram)), [article]);
  const [draft, setDraft] = useState<ArticleDraft>(initial);
  const [submitted, setSubmitted] = useState(false);
  const [imgBusy, setImgBusy] = useState(false);
  const [imgError, setImgError] = useState('');
  const [confirmLeave, setConfirmLeave] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    setDraft(initial);
    setSubmitted(false);
  }, [initial]);

  const dirty = isArticleDirty(draft, initial);
  useEffect(() => {
    onDirtyChange(dirty);
  }, [dirty]);
  useEffect(() => () => onDirtyChange(false), []);
  useEffect(() => {
    if (!dirty) return;
    const warn = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = '';
    };
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [dirty]);

  const errors = useMemo(() => validateArticle(draft, article), [draft, article]);
  const shown = submitted ? errors : {};
  const set = <K extends keyof ArticleDraft>(k: K, v: ArticleDraft[K]) => setDraft((d) => ({ ...d, [k]: v }));
  const onCategory = (c: ArticleCategory) => setDraft((d) => ({ ...d, category: c, categoryLabel: !d.categoryLabel || d.categoryLabel === kickerFor(d.category) ? kickerFor(c) : d.categoryLabel }));

  const bodyEditable = !article || canEditBody(article);
  const rich = !!article && hasRichContent(article);
  const gallery = useMemo(() => [...new Set([DEFAULT_IMAGE, ...all.map((a) => a.imageUrl).filter((u) => u && !u.startsWith('data:'))])].slice(0, 8), [all]);

  const onFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    setImgBusy(true);
    setImgError('');
    const res = await optimizeImage(file, { maxSide: 1400 });
    setImgBusy(false);
    if (res.ok && res.dataUrl) set('imageUrl', res.dataUrl);
    else setImgError(res.error || 'No se pudo usar esa imagen.');
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    if (hasArticleErrors(errors)) {
      requestAnimationFrame(() => formRef.current?.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus());
      return;
    }
    const takenSlugs = all.filter((a) => a.id !== article?.id).map((a) => a.slug);
    onSave(articleFromDraft(draft, article, { id: `leak-${Date.now()}`, takenSlugs }), !article);
  };

  const paragraphs = splitParagraphs(draft.body);
  const previewTime = article && !bodyEditable ? article.readTime : readTimeFor(paragraphs.length ? paragraphs : [draft.summary]);
  const errorCount = Object.keys(shown).length;

  return (
    <div className="mx-auto max-w-6xl space-y-5">
      <PageHeader
        title={article ? 'Editar artículo' : 'Nuevo artículo'}
        description={article ? `Estás editando “${article.title}”. Los cambios se ven en la pestaña Leaks al guardar.` : 'Un artículo nuevo sale publicado de inmediato en la pestaña Leaks.'}
        actions={
          <button type="button" onClick={() => (dirty ? setConfirmLeave(true) : onClose())} className={secondaryBtn}>
            <ArrowLeft className="h-4 w-4" aria-hidden="true" /> Volver a la lista
          </button>
        }
      />

      {rich && (
        <p className="flex items-start gap-2 rounded-lg border border-sky-400/30 bg-sky-400/5 p-3 text-[13px] text-sky-100">
          <Info className="mt-0.5 h-4 w-4 shrink-0 text-sky-300" aria-hidden="true" />
          Es un reportaje especial: sus figuras, videos y cronología no se editan aquí y se conservan tal como están.
          {!bodyEditable && ' Tampoco se edita el cuerpo del texto, porque tiene un formato especial.'}
        </p>
      )}

      <div className="grid items-start gap-5 lg:grid-cols-12">
        <form ref={formRef} onSubmit={submit} noValidate className="space-y-5 lg:col-span-8" aria-label={article ? 'Formulario de edición de artículo' : 'Formulario de artículo nuevo'}>
          {submitted && errorCount > 0 && (
            <p role="alert" className="flex items-start gap-2 rounded-lg border border-rose-400/40 bg-rose-500/10 px-3 py-2.5 text-[13px] text-rose-100">
              <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0 text-rose-300" aria-hidden="true" />
              Falta revisar {errorCount} {errorCount === 1 ? 'dato' : 'datos'} antes de guardar. Están marcados abajo.
            </p>
          )}

          <Card as="section" aria-labelledby="ar-datos" className="space-y-4 p-5">
            <h2 id="ar-datos" className="text-base font-semibold text-white">
              1 · Titular y resumen
            </h2>
            <Field label="Título" required error={shown.title}>
              {(a) => <input {...a} value={draft.title} onChange={(e) => set('title', e.target.value)} placeholder="Ej.: Alerta: filtración de datos de una entidad pública" className={inputCls} />}
            </Field>
            <div className="grid gap-4 sm:grid-cols-3">
              <Field label="Categoría">
                {(a) => (
                  <select {...a} value={draft.category} onChange={(e) => onCategory(e.target.value as ArticleCategory)} className={`${inputCls} cursor-pointer`}>
                    {CATEGORY_OPTIONS.map((o) => (
                      <option key={o.value} value={o.value}>
                        {o.label}
                      </option>
                    ))}
                  </select>
                )}
              </Field>
              <Field label="Gravedad">
                {(a) => (
                  <select {...a} value={draft.severity} onChange={(e) => set('severity', e.target.value as Severity)} className={`${inputCls} cursor-pointer`}>
                    {SEVERITY_OPTIONS.map((o) => (
                      <option key={o.value} value={o.value}>
                        {o.label} · {o.help}
                      </option>
                    ))}
                  </select>
                )}
              </Field>
              <Field label="Etiqueta de la tarjeta" hint="Texto pequeño sobre el título.">
                {(a) => <input {...a} value={draft.categoryLabel} onChange={(e) => set('categoryLabel', e.target.value)} maxLength={40} className={inputCls} />}
              </Field>
            </div>
            <Field label="Resumen" required error={shown.summary} hint="Se ve en la tarjeta: de una a tres frases.">
              {(a) => (
                <>
                  <textarea {...a} rows={3} value={draft.summary} onChange={(e) => set('summary', e.target.value)} className={inputCls} />
                  <p className="mt-1 flex text-xs">{counter(draft.summary.trim().length, capFor(LIMITS.summary, article?.summary))}</p>
                </>
              )}
            </Field>
          </Card>

          <Card as="section" aria-labelledby="ar-cuerpo" className="space-y-4 p-5">
            <h2 id="ar-cuerpo" className="text-base font-semibold text-white">
              2 · Texto del artículo
            </h2>
            {bodyEditable ? (
              <Field label="Cuerpo" hint="Deja una línea en blanco entre un párrafo y otro. Si lo dejas vacío se usa el resumen.">
                {(a) => (
                  <>
                    <textarea {...a} rows={10} value={draft.body} onChange={(e) => set('body', e.target.value)} className={`${inputCls} leading-relaxed`} />
                    <p className="mt-1 text-xs text-zinc-400">
                      {paragraphs.length} {paragraphs.length === 1 ? 'párrafo' : 'párrafos'} · {previewTime}
                    </p>
                  </>
                )}
              </Field>
            ) : (
              <p className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-3 text-[13px] text-zinc-300">
                El cuerpo de este artículo tiene un formato especial y se conserva sin cambios ({article!.content.length} bloques).
              </p>
            )}
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Datos expuestos" hint="Separados por coma. Ejemplo: DNI, Nombres, Teléfonos.">
                {(a) => <input {...a} value={draft.compromisedData} onChange={(e) => set('compromisedData', e.target.value)} className={inputCls} />}
              </Field>
              <Field label="Alcance" hint="Ejemplo: +500,000 registros.">
                {(a) => <input {...a} value={draft.affectedScope} onChange={(e) => set('affectedScope', e.target.value)} className={inputCls} />}
              </Field>
            </div>
            <Field label="Etiquetas" hint="Separadas por coma. Ayudan a encontrar el artículo.">
              {(a) => <input {...a} value={draft.tags} onChange={(e) => set('tags', e.target.value)} className={inputCls} />}
            </Field>
          </Card>

          <Card as="section" aria-labelledby="ar-portada" className="space-y-4 p-5">
            <h2 id="ar-portada" className="text-base font-semibold text-white">
              3 · Portada
            </h2>
            <div className="flex flex-wrap items-center gap-4">
              <div className="h-24 w-40 shrink-0 overflow-hidden rounded-lg border border-zinc-800 bg-black">
                <img src={draft.imageUrl || DEFAULT_IMAGE} alt="Portada elegida" className="h-full w-full object-cover" />
              </div>
              <div className="space-y-2">
                <input ref={fileRef} type="file" accept="image/png,image/jpeg,image/webp,image/gif" onChange={onFile} className="sr-only" tabIndex={-1} aria-label="Elegir una imagen de portada desde tu equipo" data-testid="article-image-input" />
                <div className="flex flex-wrap gap-2">
                  <button type="button" onClick={() => fileRef.current?.click()} disabled={imgBusy} className={secondaryBtn}>
                    <ImagePlus className="h-4 w-4" aria-hidden="true" /> {imgBusy ? 'Preparando…' : 'Subir una imagen'}
                  </button>
                  {draft.imageUrl !== DEFAULT_IMAGE && (
                    <button type="button" onClick={() => set('imageUrl', DEFAULT_IMAGE)} className={secondaryBtn}>
                      <X className="h-4 w-4" aria-hidden="true" /> Usar la de siempre
                    </button>
                  )}
                </div>
                <p className="text-xs text-zinc-400" role="status">
                  {draft.imageUrl.startsWith('data:') ? `Imagen lista para guardar (${dataUrlKb(draft.imageUrl)} KB, ya reducida).` : 'La imagen se reduce sola para que la página cargue rápido.'}
                </p>
                {imgError && (
                  <p role="alert" className="text-xs text-rose-300">
                    {imgError}
                  </p>
                )}
              </div>
            </div>
            {gallery.length > 1 && (
              <div>
                <p className="mb-2 text-[13px] font-medium text-zinc-200">O usa una portada ya existente</p>
                <div className="grid grid-cols-4 gap-2 sm:grid-cols-6" role="group" aria-label="Portadas existentes">
                  {gallery.map((g, i) => (
                    <button
                      key={g}
                      type="button"
                      aria-pressed={draft.imageUrl === g}
                      aria-label={`Portada ${i + 1}`}
                      onClick={() => set('imageUrl', g)}
                      className={`overflow-hidden rounded-lg border p-1 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-300 ${draft.imageUrl === g ? 'border-emerald-400 bg-emerald-400/10' : 'border-zinc-800 bg-zinc-900 hover:border-zinc-600'}`}
                    >
                      <img loading="lazy" decoding="async" src={g} alt="" className="h-12 w-full rounded object-cover" />
                    </button>
                  ))}
                </div>
              </div>
            )}
          </Card>

          <Card as="section" aria-labelledby="ar-firma" className="space-y-4 p-5">
            <h2 id="ar-firma" className="text-base font-semibold text-white">
              4 · Firma y portada de la revista
            </h2>
            <div className="grid gap-4 sm:grid-cols-3">
              <Field label="Autor" required error={shown.author}>
                {(a) => <input {...a} value={draft.author} onChange={(e) => set('author', e.target.value)} className={inputCls} />}
              </Field>
              <Field label="Cargo">
                {(a) => <input {...a} value={draft.authorRole} onChange={(e) => set('authorRole', e.target.value)} className={inputCls} />}
              </Field>
              <Field label="Telegram del autor" hint="Sin @">
                {(a) => <input {...a} value={draft.authorTelegram} onChange={(e) => set('authorTelegram', e.target.value.replace('@', ''))} maxLength={40} className={inputCls} />}
              </Field>
            </div>
            <div className="flex items-center gap-3">
              <Switch checked={draft.featured} label={draft.featured ? 'Destacado en la portada, pulsa para quitarlo' : 'No destacado, pulsa para destacarlo en la portada'} onChange={() => set('featured', !draft.featured)} />
              <div>
                <p className="text-[13px] font-semibold text-white">Destacar en la portada de Leaks</p>
                <p className="text-xs text-zinc-400">Aparece primero y más grande.</p>
              </div>
            </div>
          </Card>

          <div className="sticky bottom-3 z-10 flex flex-wrap items-center gap-2 rounded-xl border border-zinc-700 bg-[#14141a]/95 p-3 shadow-xl backdrop-blur">
            <button type="submit" className={primaryBtn}>
              {article ? 'Guardar cambios' : 'Publicar artículo'}
            </button>
            <button type="button" onClick={() => (dirty ? setConfirmLeave(true) : onClose())} className={secondaryBtn}>
              Cancelar
            </button>
            <span role="status" className={`ml-auto text-xs ${dirty ? 'text-amber-200' : 'text-zinc-400'}`}>
              {dirty ? 'Tienes cambios sin guardar' : article ? 'Sin cambios pendientes' : ''}
            </span>
          </div>
          {dbMode && <p className="text-xs text-zinc-400">Se guarda en la base de datos. Las imágenes que subas van a Storage.</p>}
        </form>

        <aside className="space-y-3 lg:sticky lg:top-20 lg:col-span-4" aria-label="Vista previa">
          <p className="text-sm font-semibold text-white">Así se verá la tarjeta</p>
          <Card className="overflow-hidden">
            <img src={draft.imageUrl || DEFAULT_IMAGE} alt="" className="h-36 w-full object-cover" />
            <div className="space-y-2 p-4">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-300">{draft.categoryLabel || kickerFor(draft.category)}</span>
                <SevChip severity={draft.severity} />
                {draft.featured && (
                  <span className="inline-flex items-center gap-1 rounded-md border border-amber-400/40 bg-amber-400/10 px-1.5 py-0.5 text-[11px] font-semibold text-amber-200">
                    <Star className="h-3 w-3" aria-hidden="true" /> Destacado
                  </span>
                )}
              </div>
              <p className="text-base font-bold leading-snug text-white">{draft.title.trim() || 'Título del artículo'}</p>
              <p className="line-clamp-3 text-[13px] text-zinc-300">{draft.summary.trim() || 'Aquí se verá el resumen.'}</p>
              <p className="text-xs text-zinc-400">
                {draft.author.trim() || 'Autor'} · {previewTime}
              </p>
            </div>
          </Card>
        </aside>
      </div>

      <ConfirmDialog
        open={confirmLeave}
        title="Tienes cambios sin guardar"
        message="Si sales ahora, lo que cambiaste en este artículo se pierde."
        confirmLabel="Salir sin guardar"
        danger
        onConfirm={() => {
          setConfirmLeave(false);
          onClose();
        }}
        onCancel={() => setConfirmLeave(false)}
      />
    </div>
  );
};

// ======================================================================= Lista
export const ArticlesPage: React.FC<ArticlesPageProps> = ({ articles, authorName, authorTelegram, dbMode, onUpdate, onViewPublic, onReset, onDirtyChange }) => {
  const trashReady = useTrashReady();
  const [editing, setEditing] = useState<{ article: LeakArticle | null } | null>(null);
  const [query, setQuery] = useState('');
  const [sev, setSev] = useState<Severity | 'all'>('all');
  const [removing, setRemoving] = useState<LeakArticle | null>(null);
  const [confirmReset, setConfirmReset] = useState(false);

  const counts = useMemo(() => {
    const c: Record<string, number> = { all: articles.length };
    SEVERITY_OPTIONS.forEach((o) => (c[o.value] = articles.filter((a) => a.severity === o.value).length));
    return c;
  }, [articles]);

  const rows = useMemo(() => {
    const q = norm(query.trim());
    return articles.filter((a) => (sev === 'all' || a.severity === sev) && (!q || norm(`${a.title} ${a.summary} ${a.categoryLabel} ${(a.tags || []).join(' ')} ${a.author}`).includes(q)));
  }, [articles, sev, query]);

  if (editing) {
    return (
      <ArticleEditor
        key={editing.article?.id ?? 'nuevo'}
        article={editing.article}
        all={articles}
        authorName={authorName}
        authorTelegram={authorTelegram}
        dbMode={dbMode}
        onDirtyChange={onDirtyChange}
        onClose={() => setEditing(null)}
        onSave={(a, isNew) => {
          onUpdate(isNew ? [a, ...articles] : articles.map((x) => (x.id === a.id ? a : x)), isNew ? `Artículo “${a.title}” publicado en la pestaña Leaks.` : `Cambios guardados en “${a.title}”.`);
          setEditing(null);
        }}
      />
    );
  }

  const toggleFeatured = (a: LeakArticle) =>
    onUpdate(articles.map((x) => (x.id === a.id ? { ...x, featured: !x.featured } : x)), a.featured ? `“${a.title}” ya no está destacado.` : `“${a.title}” destacado en la portada.`);

  return (
    <div className="mx-auto max-w-6xl space-y-5">
      <PageHeader
        title="Artículos Leaks"
        description={`${articles.length} artículos · ${counts.critico} críticos · ${articles.filter((a) => a.featured).length} destacados`}
        actions={
          <>
            <button type="button" onClick={onViewPublic} className={secondaryBtn}>
              <ExternalLink className="h-4 w-4" aria-hidden="true" /> Ver la pestaña Leaks
            </button>
            <button type="button" onClick={() => setEditing({ article: null })} className={primaryBtn}>
              <Plus className="h-4 w-4" aria-hidden="true" /> Nuevo artículo
            </button>
          </>
        }
      />

      <Card>
        <div className="space-y-3 border-b border-zinc-800/80 p-4">
          <div className="flex flex-wrap gap-1.5" role="group" aria-label="Filtrar por gravedad">
            {[{ value: 'all' as const, label: 'Todos' }, ...SEVERITY_OPTIONS.map((o) => ({ value: o.value, label: o.label }))].map((f) => {
              const on = sev === f.value;
              return (
                <button
                  key={f.value}
                  type="button"
                  aria-pressed={on}
                  onClick={() => setSev(f.value)}
                  className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-300 ${
                    on ? 'border-emerald-400/50 bg-emerald-400/15 text-emerald-100' : 'border-zinc-700 bg-zinc-900 text-zinc-300 hover:border-zinc-600 hover:text-white'
                  }`}
                >
                  {f.label}
                  <span className={`tabular-nums ${on ? 'text-emerald-200' : 'text-zinc-400'}`}>{counts[f.value]}</span>
                </button>
              );
            })}
          </div>
          <label className="relative block">
            <span className="sr-only">Buscar artículos</span>
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" aria-hidden="true" />
            <input type="search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Buscar por título, resumen, etiqueta o autor…" className="w-full rounded-lg border border-zinc-800 bg-zinc-900/60 py-2 pl-9 pr-3 text-sm text-white placeholder:text-zinc-400 focus:border-emerald-400/60 focus:outline-none" />
          </label>
        </div>

        {rows.length === 0 ? (
          <div className="flex flex-col items-center gap-3 px-6 py-14 text-center">
            <FileText className="h-8 w-8 text-zinc-400" aria-hidden="true" />
            {articles.length === 0 ? (
              <>
                <p className="text-sm font-semibold text-white">Aún no hay artículos</p>
                <button type="button" onClick={() => setEditing({ article: null })} className={primaryBtn}>
                  <Plus className="h-4 w-4" aria-hidden="true" /> Nuevo artículo
                </button>
              </>
            ) : (
              <>
                <p className="text-sm font-semibold text-white">Ningún artículo coincide con lo que buscas</p>
                <button
                  type="button"
                  onClick={() => {
                    setQuery('');
                    setSev('all');
                  }}
                  className={secondaryBtn}
                >
                  Quitar filtros
                </button>
              </>
            )}
          </div>
        ) : (
          <ul className="divide-y divide-zinc-800/60" aria-label="Lista de artículos">
            {rows.map((a) => (
              <li key={a.id} className="flex flex-wrap items-center gap-3 p-4 sm:flex-nowrap">
                <img loading="lazy" decoding="async" src={a.imageUrl || DEFAULT_IMAGE} alt="" className="h-14 w-20 shrink-0 rounded-lg border border-zinc-800 bg-black object-cover" />
                <div className="min-w-0 flex-1 space-y-1">
                  <p className="font-semibold leading-snug text-white">{a.title}</p>
                  <p className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-zinc-400">
                    <SevChip severity={a.severity} />
                    <span>{a.categoryLabel}</span>
                    <span>· {a.date}</span>
                    {a.isUpcoming && <span className="rounded bg-sky-400/10 px-1 py-px font-semibold text-sky-200">Próximamente</span>}
                    {hasRichContent(a) && <span className="rounded bg-zinc-800 px-1 py-px font-semibold text-zinc-300">Reportaje especial</span>}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-1">
                  <button
                    type="button"
                    aria-pressed={!!a.featured}
                    aria-label={a.featured ? `Quitar de destacados: ${a.title}` : `Destacar: ${a.title}`}
                    title={a.featured ? 'Destacado' : 'Destacar'}
                    onClick={() => toggleFeatured(a)}
                    className={`rounded-lg p-2 focus-visible:outline-2 focus-visible:outline-emerald-300 ${a.featured ? 'text-amber-300 hover:bg-amber-400/10' : 'text-zinc-400 hover:bg-white/5 hover:text-white'}`}
                  >
                    <Star className={`h-4 w-4 ${a.featured ? 'fill-amber-300' : ''}`} aria-hidden="true" />
                  </button>
                  <button type="button" onClick={() => setEditing({ article: a })} aria-label={`Editar ${a.title}`} title="Editar" className="rounded-lg p-2 text-zinc-300 hover:bg-white/5 hover:text-white focus-visible:outline-2 focus-visible:outline-emerald-300">
                    <Pencil className="h-4 w-4" aria-hidden="true" />
                  </button>
                  <button type="button" onClick={() => setRemoving(a)} aria-label={`Eliminar ${a.title}`} title="Eliminar" className="rounded-lg p-2 text-rose-300 hover:bg-rose-500/10 hover:text-rose-200 focus-visible:outline-2 focus-visible:outline-rose-300">
                    <Trash2 className="h-4 w-4" aria-hidden="true" />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}

        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-zinc-800/80 px-4 py-3 text-xs text-zinc-400">
          <span>
            Mostrando {rows.length} de {articles.length}
          </span>
          {!dbMode && onReset && (
            <button type="button" onClick={() => setConfirmReset(true)} className="inline-flex items-center gap-1.5 font-medium text-zinc-300 hover:text-white focus-visible:outline-2 focus-visible:outline-emerald-300">
              <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" /> Volver a los artículos de ejemplo
            </button>
          )}
        </div>
      </Card>

      <ConfirmDialog
        open={removing !== null}
        title="¿Eliminar este artículo?"
        message={`“${removing?.title ?? ''}” dejará de verse en la pestaña Leaks. ${deleteNote(trashReady)}`}
        confirmLabel="Eliminar artículo"
        danger
        onConfirm={() => {
          if (removing) onUpdate(articles.filter((a) => a.id !== removing.id), 'Artículo eliminado.');
          setRemoving(null);
        }}
        onCancel={() => setRemoving(null)}
      />
      <ConfirmDialog
        open={confirmReset}
        title="¿Volver a los artículos de ejemplo?"
        message="Se reemplazan todos los artículos de este navegador por los de ejemplo. Lo que hayas escrito se pierde."
        confirmLabel="Reemplazar"
        danger
        onConfirm={() => {
          setConfirmReset(false);
          onReset?.();
        }}
        onCancel={() => setConfirmReset(false)}
      />
    </div>
  );
};

export default ArticlesPage;
