import React, { useEffect, useMemo, useState } from 'react';
import { BookOpen, CheckCircle2, Clock, Database, Mail, MessageCircle, RefreshCw, RotateCcw, Search, TriangleAlert } from 'lucide-react';
import { Card, PageHeader, StateNote, primaryBtn, secondaryBtn } from './ui';
import { Dialog } from './Dialog';
import { Field, inputCls } from './fields';
import { answerComplaint, ensureComplaintsLoaded, reopenComplaint, useComplaints } from '../../lib/complaintsStore';
import {
  DOC_LABEL,
  GOOD_LABEL,
  KIND_LABEL,
  LIMITS,
  REPLY_LABEL,
  STATUS_LABEL,
  complaintCounts,
  complaintNumber,
  daysToDue,
  formatDateTimeLima,
  isDueSoon,
  isOverdue,
  isPending,
  replyMailto,
  sortComplaints,
  type Complaint
} from '../../lib/complaintsLogic';
import { PROVIDER } from '../../lib/legal';
import { formatDay, relativeDays } from '../../lib/salesMath';

const nf = new Intl.NumberFormat('es-PE');
type Filter = 'pending' | 'answered' | 'all';
const FILTERS: { id: Filter; label: string }[] = [
  { id: 'pending', label: 'Sin responder' },
  { id: 'answered', label: 'Respondidas' },
  { id: 'all', label: 'Todas' }
];

const Tile: React.FC<{ label: string; value: number; hint: string; tone?: 'bad' | 'warn' | 'plain' }> = ({ label, value, hint, tone = 'plain' }) => (
  <Card className="p-4">
    <p className="text-xs font-medium text-zinc-400">{label}</p>
    <p className={`mt-1 text-2xl font-bold tabular-nums ${value > 0 && tone === 'bad' ? 'text-rose-300' : value > 0 && tone === 'warn' ? 'text-amber-200' : 'text-white'}`}>{nf.format(value)}</p>
    <p className="mt-1 text-xs text-zinc-400">{hint}</p>
  </Card>
);

const Chip: React.FC<{ cls: string; children: React.ReactNode }> = ({ cls, children }) => (
  <span className={`inline-flex items-center gap-1 whitespace-nowrap rounded-md border px-1.5 py-0.5 text-[11px] font-semibold ${cls}`}>{children}</span>
);

/** Enlace de WhatsApp con el texto listo; un número de 9 cifras se toma como peruano (+51). */
function whatsappLink(phone: string, text: string): string | null {
  const digits = phone.replace(/\D/g, '');
  if (digits.length < 9) return null;
  const full = digits.length === 9 ? `51${digits}` : digits;
  return `https://wa.me/${full}?text=${encodeURIComponent(text)}`;
}

const firstName = (full: string) => full.trim().split(/\s+/)[0] || '';
const starter = (c: Complaint) =>
  `Hola ${firstName(c.consumerName)}, gracias por escribirnos. Te respondemos sobre tu ${KIND_LABEL[c.kind].toLowerCase()} N.º ${complaintNumber(c.number)} (${formatDay(c.createdAt)}):\n\n`;

const Line: React.FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => (
  <div className="flex flex-col gap-0.5 sm:flex-row sm:gap-3">
    <dt className="shrink-0 text-zinc-400 sm:w-40">{label}</dt>
    <dd className="min-w-0 whitespace-pre-line break-words text-zinc-100">{children}</dd>
  </div>
);

export const ComplaintsAdminPage: React.FC<{ onToast: (message: string) => void }> = ({ onToast }) => {
  const data = useComplaints();
  const [filter, setFilter] = useState<Filter>('pending');
  const [search, setSearch] = useState('');
  const [answering, setAnswering] = useState<Complaint | null>(null);
  const [text, setText] = useState('');
  const [busy, setBusy] = useState(false);
  const [dialogError, setDialogError] = useState('');
  const [rowBusy, setRowBusy] = useState<string | null>(null);
  const [rowError, setRowError] = useState<{ id: string; message: string } | null>(null);

  useEffect(() => {
    void ensureComplaintsLoaded();
  }, []);

  const now = Date.now();
  const counts = useMemo(() => complaintCounts(data.items, now), [data.items]);
  const shown = useMemo(() => {
    const term = search.trim().toLowerCase();
    return sortComplaints(
      data.items.filter((c) => {
        if (filter === 'pending' ? !isPending(c) : filter === 'answered' && isPending(c)) return false;
        return !term || `${c.consumerName} ${c.docNumber} ${c.email} ${c.goodDescription} ${c.detail} ${c.number}`.toLowerCase().includes(term);
      })
    );
  }, [data.items, filter, search]);

  const missingProvider = !PROVIDER.ruc || !PROVIDER.address;

  const openAnswer = (c: Complaint) => {
    setText(c.response || starter(c));
    setDialogError('');
    setAnswering(c);
  };
  const confirmAnswer = async () => {
    if (!answering) return;
    const body = text.trim();
    const greeting = starter(answering).trim();
    if (body.length < 10 || (body.startsWith(greeting) && body.length < greeting.length + 10)) {
      setDialogError('Escribe tu respuesta después del saludo (mínimo 10 letras más).');
      return;
    }
    if (body.length > LIMITS.response) {
      setDialogError(`Máximo ${LIMITS.response} letras.`);
      return;
    }
    setBusy(true);
    setDialogError('');
    const res = await answerComplaint(answering.id, body);
    setBusy(false);
    if (!res.ok) {
      setDialogError(res.error || 'No se pudo guardar.');
      return;
    }
    onToast(`Hoja N.º ${complaintNumber(answering.number)} marcada como respondida.`);
    setAnswering(null);
  };
  const reopen = async (c: Complaint) => {
    setRowBusy(c.id);
    setRowError(null);
    const res = await reopenComplaint(c.id);
    setRowBusy(null);
    if (!res.ok) setRowError({ id: c.id, message: res.error || 'No se pudo guardar.' });
    else onToast(`Hoja N.º ${complaintNumber(c.number)} vuelve a «Sin responder».`);
  };

  const header = <PageHeader title="Libro de reclamaciones" description="Cada reclamo o queja que llega desde la web. La ley te da 15 días hábiles para responder." />;

  if (data.status === 'idle' || (data.status === 'loading' && data.items.length === 0)) {
    return (
      <div className="mx-auto max-w-5xl space-y-5">
        {header}
        <div className="py-16 text-center text-sm text-zinc-400" role="status" aria-busy="true">
          <RefreshCw className="mx-auto mb-3 h-5 w-5 animate-spin" aria-hidden="true" />
          Cargando las hojas…
        </div>
      </div>
    );
  }
  if (data.status === 'missing') {
    return (
      <div className="mx-auto max-w-5xl space-y-5">
        {header}
        <StateNote
          icon={Database}
          tone="amber"
          title="Falta activar el Libro de reclamaciones"
          action={
            <button type="button" onClick={() => void ensureComplaintsLoaded(true)} className={`${secondaryBtn} mt-4`}>
              <RefreshCw className="h-4 w-4" aria-hidden="true" /> Comprobar de nuevo
            </button>
          }
        >
          <p>Esta parte todavía no existe en tu base de datos. Mientras tanto, la web no puede guardar las hojas. Se activa una sola vez:</p>
          <ol className="mt-3 list-decimal space-y-1.5 pl-5">
            <li>
              Abre Supabase → <strong className="text-white">SQL Editor</strong> → <strong className="text-white">New query</strong>.
            </li>
            <li>
              Pega todo el archivo <code className="rounded bg-zinc-800 px-1.5 py-0.5 text-[12px] text-emerald-200">supabase/15-libro-de-reclamaciones.sql</code> y pulsa <strong className="text-white">Run</strong>.
            </li>
            <li>Vuelve aquí y pulsa “Comprobar de nuevo”.</li>
          </ol>
        </StateNote>
      </div>
    );
  }
  if (data.status === 'error') {
    return (
      <div className="mx-auto max-w-5xl space-y-5">
        {header}
        <StateNote
          icon={TriangleAlert}
          tone="rose"
          title="No se pudieron cargar las hojas"
          action={
            <button type="button" onClick={() => void ensureComplaintsLoaded(true)} className={`${primaryBtn} mt-4`}>
              <RefreshCw className="h-4 w-4" aria-hidden="true" /> Intentar de nuevo
            </button>
          }
        >
          <p role="alert">{data.error}</p>
        </StateNote>
      </div>
    );
  }

  const countOf = (f: Filter) => (f === 'pending' ? counts.pending : f === 'answered' ? counts.answered : data.items.length);

  return (
    <div className="mx-auto max-w-5xl space-y-5">
      {header}

      {missingProvider && (
        <div role="note" className="flex items-start gap-3 rounded-xl border border-amber-400/40 bg-amber-400/10 p-4 text-sm text-amber-100">
          <TriangleAlert className="mt-0.5 h-5 w-5 shrink-0" aria-hidden="true" />
          <p>
            <strong>Faltan datos del proveedor en la hoja:</strong> {!PROVIDER.ruc && 'el RUC'}
            {!PROVIDER.ruc && !PROVIDER.address && ' y '}
            {!PROVIDER.address && 'el domicilio'}. La ley los pide en la hoja de reclamación. Dime cuáles son y los agrego.
          </p>
        </div>
      )}

      <section aria-label="Resumen de hojas" className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Tile label="Sin responder" value={counts.pending} hint="Esperan tu respuesta" />
        <Tile label="Vencen pronto" value={counts.dueSoon} hint="Faltan 3 días o menos" tone="warn" />
        <Tile label="Plazo vencido" value={counts.overdue} hint="Pasó el plazo de 15 días hábiles" tone="bad" />
        <Tile label="Respondidas" value={counts.answered} hint="En total" />
      </section>

      <div className="flex flex-wrap items-center gap-2">
        <div className="flex flex-wrap gap-1.5" role="group" aria-label="Filtrar por estado">
          {FILTERS.map((f) => (
            <button
              key={f.id}
              type="button"
              aria-pressed={filter === f.id}
              onClick={() => setFilter(f.id)}
              className={`rounded-full border px-3 py-1 text-xs font-semibold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-300 ${
                filter === f.id ? 'border-emerald-400 bg-emerald-400/15 text-emerald-100' : 'border-zinc-700 bg-zinc-900 text-zinc-200 hover:border-zinc-500'
              }`}
            >
              {f.label} <span className="tabular-nums text-zinc-400">{countOf(f.id)}</span>
            </button>
          ))}
        </div>
        <div className="relative ml-auto w-full sm:w-64">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" aria-hidden="true" />
          <input type="search" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar nombre o correo" aria-label="Buscar hojas" className={`${inputCls} pl-9`} />
        </div>
      </div>

      {shown.length === 0 ? (
        <Card className="flex flex-col items-center gap-2 px-6 py-14 text-center">
          <BookOpen className="h-8 w-8 text-zinc-500" aria-hidden="true" />
          <p className="text-base font-semibold text-white">{data.items.length === 0 ? 'Todavía no hay hojas' : 'No hay hojas con ese filtro'}</p>
          <p className="max-w-md text-sm text-zinc-400">
            {data.items.length === 0 ? 'Cuando alguien presente un reclamo o una queja desde la web, aparecerá aquí.' : 'Prueba con otro estado o con otra palabra.'}
          </p>
        </Card>
      ) : (
        <ul className="space-y-3" aria-label="Hojas de reclamación">
          {shown.map((c) => {
            const overdue = isOverdue(c, now);
            const soon = isDueSoon(c, now);
            const busyRow = rowBusy === c.id;
            const wa = c.replyVia === 'phone' ? whatsappLink(c.phone, c.response || starter(c)) : null;
            return (
              <li key={c.id}>
                <Card className="space-y-3 p-4">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm font-bold tabular-nums text-white">Hoja N.º {complaintNumber(c.number)}</span>
                    <Chip cls={c.kind === 'reclamo' ? 'border-sky-400/40 bg-sky-400/10 text-sky-200' : 'border-violet-400/40 bg-violet-400/10 text-violet-200'}>{KIND_LABEL[c.kind]}</Chip>
                    {c.status === 'answered' ? (
                      <Chip cls="border-emerald-400/30 bg-emerald-400/10 text-emerald-200">
                        <CheckCircle2 className="h-3 w-3" aria-hidden="true" /> {STATUS_LABEL.answered}
                      </Chip>
                    ) : overdue ? (
                      <Chip cls="border-rose-400/40 bg-rose-500/10 text-rose-200">
                        <TriangleAlert className="h-3 w-3" aria-hidden="true" /> Plazo vencido
                      </Chip>
                    ) : (
                      <Chip cls={soon ? 'border-amber-400/40 bg-amber-400/10 text-amber-200' : 'border-zinc-700 bg-zinc-900 text-zinc-200'}>
                        <Clock className="h-3 w-3" aria-hidden="true" /> {STATUS_LABEL.pending}
                      </Chip>
                    )}
                    {c.isMinor && <Chip cls="border-zinc-700 bg-zinc-900 text-zinc-200">Menor de edad</Chip>}
                  </div>

                  <div>
                    <p className="text-sm font-semibold text-white">
                      {c.consumerName}
                      <span className="font-normal text-zinc-300">
                        {' '}
                        · {c.goodDescription}
                      </span>
                    </p>
                    <p className="mt-1 line-clamp-3 whitespace-pre-line break-words text-[13px] text-zinc-300">{c.detail}</p>
                    {c.response && (
                      <p className="mt-2 whitespace-pre-line break-words rounded-lg border border-emerald-400/20 bg-emerald-400/5 px-3 py-2 text-[13px] text-emerald-100">
                        <span className="font-semibold">Tu respuesta:</span> {c.response}
                      </p>
                    )}
                  </div>

                  <p className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-zinc-400">
                    <span>Presentada el {formatDateTimeLima(c.createdAt)}</span>
                    {isPending(c) && (
                      <span className={overdue ? 'font-semibold text-rose-200' : soon ? 'font-semibold text-amber-200' : ''}>
                        Responder antes del {formatDay(c.dueAt)} ({relativeDays(daysToDue(c, now))})
                      </span>
                    )}
                    {c.respondedAt && <span>Respondida el {formatDateTimeLima(c.respondedAt)}</span>}
                  </p>

                  <details className="group rounded-lg border border-zinc-800 bg-zinc-900/40">
                    <summary className="cursor-pointer select-none px-3 py-2 text-xs font-semibold text-zinc-200 focus-visible:outline-2 focus-visible:outline-emerald-300">Ver la hoja completa</summary>
                    <dl className="space-y-1.5 border-t border-zinc-800 px-3 py-3 text-[13px]">
                      <Line label="Documento">
                        {DOC_LABEL[c.docType]} {c.docNumber}
                      </Line>
                      <Line label="Domicilio">{c.address}</Line>
                      <Line label="Teléfono">{c.phone}</Line>
                      <Line label="Correo">{c.email}</Line>
                      {c.isMinor && (
                        <Line label="Representante">
                          {c.guardianName}
                          {c.guardianDoc ? ` · ${c.guardianDoc}` : ''}
                        </Line>
                      )}
                      <Line label="Bien contratado">
                        {GOOD_LABEL[c.goodType]}: {c.goodDescription}
                      </Line>
                      {c.amount != null && <Line label="Monto">S/ {c.amount.toFixed(2)}</Line>}
                      {c.orderRef && <Line label="Pedido o referencia">{c.orderRef}</Line>}
                      <Line label="Detalle">{c.detail}</Line>
                      <Line label="Lo que pide">{c.request}</Line>
                      <Line label="Quiere la respuesta">{REPLY_LABEL[c.replyVia]}</Line>
                    </dl>
                  </details>

                  {rowError?.id === c.id && (
                    <p role="alert" className="text-xs text-rose-300">
                      {rowError.message}
                    </p>
                  )}
                  <div className="flex flex-wrap items-center gap-2">
                    {isPending(c) ? (
                      <button type="button" disabled={busyRow} onClick={() => openAnswer(c)} aria-label={`Responder la hoja ${complaintNumber(c.number)}`} className={primaryBtn}>
                        <CheckCircle2 className="h-4 w-4" aria-hidden="true" /> Responder
                      </button>
                    ) : (
                      <>
                        <button type="button" disabled={busyRow} onClick={() => openAnswer(c)} aria-label={`Ver respuesta de la hoja ${complaintNumber(c.number)}`} className={secondaryBtn}>
                          Ver respuesta
                        </button>
                        <button type="button" disabled={busyRow} onClick={() => void reopen(c)} aria-label={`Reabrir la hoja ${complaintNumber(c.number)}`} className={secondaryBtn}>
                          <RotateCcw className="h-4 w-4" aria-hidden="true" /> Reabrir
                        </button>
                      </>
                    )}
                    {c.response && (
                      <span className="ml-auto inline-flex items-center gap-2 text-xs text-zinc-400">
                        Enviar la respuesta:
                        <a href={replyMailto(c, c.response)} className="inline-flex items-center gap-1 rounded-md border border-zinc-700 bg-zinc-900 px-2 py-1 font-semibold text-zinc-100 hover:border-zinc-500">
                          <Mail className="h-3.5 w-3.5" aria-hidden="true" /> Correo
                        </a>
                        {wa && (
                          <a href={wa} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 rounded-md border border-zinc-700 bg-zinc-900 px-2 py-1 font-semibold text-zinc-100 hover:border-zinc-500">
                            <MessageCircle className="h-3.5 w-3.5" aria-hidden="true" /> WhatsApp
                            <span className="sr-only"> (se abre en una pestaña nueva)</span>
                          </a>
                        )}
                      </span>
                    )}
                  </div>
                </Card>
              </li>
            );
          })}
        </ul>
      )}

      <Dialog
        open={answering !== null}
        onClose={() => !busy && setAnswering(null)}
        title={answering ? `Responder la hoja N.º ${complaintNumber(answering.number)}` : 'Responder'}
        description={
          answering
            ? `${answering.consumerName} pidió la respuesta ${answering.replyVia === 'email' ? `por correo (${answering.email})` : `por teléfono o mensaje (${answering.phone})`}. Escribe la respuesta, guárdala y envíala con los botones «Correo» o «WhatsApp».`
            : undefined
        }
        size="lg"
        dismissible={!busy}
        footer={
          <>
            <button type="button" onClick={() => setAnswering(null)} disabled={busy} className={secondaryBtn}>
              Cancelar
            </button>
            <button type="button" onClick={() => void confirmAnswer()} disabled={busy} className={primaryBtn}>
              {busy ? 'Guardando…' : 'Guardar como respondida'}
            </button>
          </>
        }
      >
        <div className="space-y-3">
          {answering && (
            <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 px-3 py-2 text-[13px] text-zinc-300">
              <p className="font-semibold text-zinc-100">Lo que pide: </p>
              <p className="whitespace-pre-line break-words">{answering.request}</p>
            </div>
          )}
          <Field label="Tu respuesta" required hint="Queda guardada con la fecha. La persona la recibe cuando pulses «Correo» o «WhatsApp» después de guardar.">
            {(a) => (
              <>
                <textarea {...a} rows={8} value={text} onChange={(e) => setText(e.target.value)} className={inputCls} />
                <p className={`mt-1 text-right text-xs tabular-nums ${text.trim().length > LIMITS.response ? 'text-rose-300' : 'text-zinc-400'}`}>
                  {text.trim().length}/{LIMITS.response}
                </p>
              </>
            )}
          </Field>
          {dialogError && (
            <p role="alert" className="rounded-lg border border-rose-400/40 bg-rose-500/10 px-3 py-2 text-[13px] text-rose-200">
              {dialogError}
            </p>
          )}
        </div>
      </Dialog>
    </div>
  );
};

export default ComplaintsAdminPage;
