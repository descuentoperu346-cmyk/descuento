import React, { useEffect, useRef, useState } from 'react';
import { BookOpen, CheckCircle2, Printer, TriangleAlert } from 'lucide-react';
import { Field, inputCls } from '../components/panel/fields';
import { CONTACT_EMAIL, LegalLink, linkify } from '../components/LegalDocument';
import { PROVIDER } from '../lib/legal';
import { submitComplaint } from '../lib/complaintsStore';
import {
  DOC_LABEL,
  GOOD_LABEL,
  KIND_HELP,
  KIND_LABEL,
  LIMITS,
  REPLY_LABEL,
  complaintNumber,
  emptyComplaintDraft,
  formatDateTimeLima,
  hasComplaintErrors,
  validateComplaint,
  type ComplaintDraft,
  type ComplaintKind,
  type ComplaintReceipt,
  type DocType,
  type GoodType,
  type ReplyVia
} from '../lib/complaintsLogic';
import { formatDay } from '../lib/salesMath';

interface ComplaintsPageProps {
  onNavigateToTerms: () => void;
  onNavigateToPrivacy: () => void;
}

// Al imprimir solo sale la hoja: sin menú, sin pie de página y con letras negras sobre fondo blanco.
const PRINT_CSS = `
@media print {
  body * { visibility: hidden !important; }
  #hoja-reclamacion, #hoja-reclamacion * { visibility: visible !important; }
  #hoja-reclamacion { position: absolute; left: 0; top: 0; width: 100%; padding: 0 !important; border: 0 !important; background: #fff !important; }
  #hoja-reclamacion * { color: #000 !important; background: transparent !important; border-color: #999 !important; box-shadow: none !important; }
  .no-imprimir { display: none !important; }
}`;

const sectionCls = 'space-y-4 rounded-xl border border-zinc-800/80 bg-[#101013] p-5';
const radioCls = 'h-4 w-4 shrink-0 cursor-pointer accent-[#00ff88]';

const Count: React.FC<{ value: string; max: number }> = ({ value, max }) => (
  <p className={`mt-1 text-right text-xs tabular-nums ${value.trim().length > max ? 'text-rose-300' : 'text-slate-400'}`}>
    {value.trim().length}/{max}
  </p>
);

/** Un dato de la hoja impresa: etiqueta + valor. */
const Row: React.FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => (
  <div className="flex flex-col gap-0.5 sm:flex-row sm:gap-3">
    <dt className="shrink-0 font-semibold text-white sm:w-44">{label}</dt>
    <dd className="min-w-0 whitespace-pre-line break-words text-slate-200">{children}</dd>
  </div>
);

interface Filed {
  receipt: ComplaintReceipt;
  draft: ComplaintDraft;
}

/** La hoja ya registrada: es la constancia que la persona imprime o guarda. */
const Hoja: React.FC<{ filed: Filed; onNew: () => void }> = ({ filed, onNew }) => {
  const { receipt: r, draft: d } = filed;
  const headingRef = useRef<HTMLHeadingElement>(null);
  useEffect(() => {
    headingRef.current?.focus();
    window.scrollTo({ top: 0 });
  }, []);
  const amount = d.amount.trim() ? `S/ ${d.amount.trim().replace(',', '.')}` : null;
  return (
    <div className="space-y-5">
      <div role="status" className="no-imprimir flex items-start gap-3 rounded-xl border border-emerald-400/30 bg-emerald-400/10 p-4 text-sm text-emerald-100">
        <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0" aria-hidden="true" />
        <div>
          <p className="font-semibold">Tu hoja de reclamación se registró.</p>
          <p className="mt-1">
            Guarda tu número: <strong className="tabular-nums">{complaintNumber(r.number)}</strong>. Imprime esta hoja o guárdala como PDF.
            Si quieres una copia por correo, escríbenos a {linkify(CONTACT_EMAIL)} con tu número de hoja.
          </p>
        </div>
      </div>

      <article id="hoja-reclamacion" className="space-y-5 rounded-xl border border-zinc-800/80 bg-[#101013] p-5 text-sm sm:p-6">
        <header className="space-y-1 border-b border-zinc-800 pb-4">
          <h2 ref={headingRef} tabIndex={-1} className="text-xl font-bold text-white focus:outline-none">
            Hoja de Reclamación N.º {complaintNumber(r.number)}
          </h2>
          <p className="text-slate-300">
            Libro de Reclamaciones virtual · Presentada el {formatDateTimeLima(r.createdAt)} (hora de Lima)
          </p>
        </header>

        <section aria-labelledby="h-prov" className="space-y-1.5">
          <h3 id="h-prov" className="font-bold text-[#00ff88]">
            Proveedor
          </h3>
          <dl className="space-y-1.5">
            <Row label="Nombre">
              {PROVIDER.brand} ({PROVIDER.holder})
            </Row>
            {PROVIDER.ruc && <Row label="RUC">{PROVIDER.ruc}</Row>}
            {PROVIDER.address && <Row label="Domicilio">{PROVIDER.address}</Row>}
            <Row label="Sitio web">descuentos-peru.vercel.app</Row>
            <Row label="Correo">{linkify(CONTACT_EMAIL)}</Row>
          </dl>
        </section>

        <section aria-labelledby="h-cons" className="space-y-1.5">
          <h3 id="h-cons" className="font-bold text-[#00ff88]">
            Identificación del consumidor
          </h3>
          <dl className="space-y-1.5">
            <Row label="Nombre">{d.consumerName.trim()}</Row>
            <Row label="Documento">
              {DOC_LABEL[d.docType]} {d.docNumber.trim()}
            </Row>
            <Row label="Domicilio">{d.address.trim()}</Row>
            <Row label="Teléfono">{d.phone.trim()}</Row>
            <Row label="Correo">{d.email.trim().toLowerCase()}</Row>
            {d.isMinor && (
              <Row label="Padre, madre o representante">
                {d.guardianName.trim()}
                {d.guardianDoc.trim() ? ` · Documento ${d.guardianDoc.trim()}` : ''}
              </Row>
            )}
          </dl>
        </section>

        <section aria-labelledby="h-bien" className="space-y-1.5">
          <h3 id="h-bien" className="font-bold text-[#00ff88]">
            Identificación del bien contratado
          </h3>
          <dl className="space-y-1.5">
            <Row label="Tipo">{GOOD_LABEL[d.goodType]}</Row>
            <Row label="Descripción">{d.goodDescription.trim()}</Row>
            {amount && <Row label="Monto">{amount}</Row>}
            {d.orderRef.trim() && <Row label="Pedido o referencia">{d.orderRef.trim()}</Row>}
          </dl>
        </section>

        <section aria-labelledby="h-det" className="space-y-1.5">
          <h3 id="h-det" className="font-bold text-[#00ff88]">
            Detalle de la reclamación
          </h3>
          <dl className="space-y-1.5">
            <Row label="Tipo">{KIND_LABEL[d.kind]}</Row>
            <Row label="Detalle">{d.detail.trim()}</Row>
            <Row label="Pedido del consumidor">{d.request.trim()}</Row>
          </dl>
        </section>

        <section aria-labelledby="h-resp" className="space-y-1.5">
          <h3 id="h-resp" className="font-bold text-[#00ff88]">
            Respuesta
          </h3>
          <dl className="space-y-1.5">
            <Row label="Medio elegido">{REPLY_LABEL[d.replyVia]}</Row>
            <Row label="Plazo para responder">Hasta el {formatDay(r.dueAt)} (15 días hábiles)</Row>
          </dl>
        </section>

        <p className="border-t border-zinc-800 pt-4 text-xs leading-relaxed text-slate-300">
          Al enviar esta hoja, el consumidor declaró que los datos y el detalle son verdaderos y manifestó su conformidad con los términos de su reclamo o queja.
          La formulación del reclamo no impide acudir a otras vías de solución de controversias ni es requisito previo para interponer una denuncia ante el Indecopi.
        </p>
      </article>

      <div className="no-imprimir flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={() => window.print()}
          className="inline-flex cursor-pointer items-center gap-2 rounded-lg bg-[#00ff88] px-4 py-2.5 text-sm font-bold text-zinc-950 hover:bg-[#00e676] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-200"
        >
          <Printer className="h-4 w-4" aria-hidden="true" /> Imprimir o guardar como PDF
        </button>
        <button
          type="button"
          onClick={onNew}
          className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-zinc-700 bg-zinc-900 px-4 py-2.5 text-sm font-semibold text-zinc-100 hover:border-zinc-600 hover:bg-zinc-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-300"
        >
          Registrar otra hoja
        </button>
      </div>
    </div>
  );
};

/** Libro de Reclamaciones virtual (Ley N.º 29571). Cualquier persona puede presentar un reclamo o una queja, con o sin cuenta. */
export const ComplaintsPage: React.FC<ComplaintsPageProps> = ({ onNavigateToTerms, onNavigateToPrivacy }) => {
  const [draft, setDraft] = useState<ComplaintDraft>(emptyComplaintDraft);
  const [showErrors, setShowErrors] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [filed, setFiled] = useState<Filed | null>(null);
  const honeypot = useRef<HTMLInputElement>(null);
  const set = (patch: Partial<ComplaintDraft>) => setDraft((d) => ({ ...d, ...patch }));
  const errors = validateComplaint(draft);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (busy) return;
    if (honeypot.current?.value) return; // campo trampa: una persona nunca lo llena
    setShowErrors(true);
    setError('');
    if (hasComplaintErrors(errors)) {
      // lleva al primer campo con error, para que no se pierda
      window.setTimeout(() => document.querySelector<HTMLElement>('#libro-form [aria-invalid="true"]')?.focus(), 0);
      return;
    }
    setBusy(true);
    const res = await submitComplaint(draft);
    setBusy(false);
    if ('error' in res) {
      setError(res.unavailable ? `${res.error} Escríbenos a ${CONTACT_EMAIL} con los mismos datos y registraremos tu hoja.` : res.error);
      return;
    }
    setFiled({ receipt: res.receipt, draft });
  };

  const startNew = () => {
    setDraft(emptyComplaintDraft());
    setShowErrors(false);
    setError('');
    setFiled(null);
    window.scrollTo({ top: 0 });
  };

  const err = (k: keyof ComplaintDraft) => (showErrors ? errors[k] : undefined);

  return (
    <div className="mx-auto max-w-3xl space-y-8 animate-in fade-in duration-300">
      <style>{PRINT_CSS}</style>
      <header className="no-imprimir space-y-3">
        <div className="inline-flex items-center gap-2 rounded-full border border-zinc-700 bg-zinc-900/80 px-3 py-1 font-mono text-[11px] font-semibold uppercase tracking-wider text-[#00ff88]">
          <BookOpen className="h-3.5 w-3.5" aria-hidden="true" />
          Descuentos Perú
        </div>
        <h1 className="text-3xl font-black tracking-tight text-white sm:text-4xl">Libro de Reclamaciones</h1>
        <div className="space-y-2 text-sm leading-relaxed text-slate-300">
          <p>
            Si tuviste un problema con un producto o con la atención, cuéntanoslo aquí. Es gratis y no necesitas una cuenta.
            Responderemos en un máximo de <strong className="text-white">15 días hábiles</strong>, por el medio que elijas.
          </p>
          <p>
            Presentar una hoja no te impide acudir a otras vías ni es requisito previo para denunciar ante el Indecopi.
            Proveedor: {PROVIDER.brand} ({PROVIDER.holder}){PROVIDER.ruc ? ` · RUC ${PROVIDER.ruc}` : ''}{PROVIDER.address ? ` · ${PROVIDER.address}` : ''}.
          </p>
        </div>
      </header>

      {filed ? (
        <Hoja filed={filed} onNew={startNew} />
      ) : (
        <form id="libro-form" onSubmit={submit} noValidate className="space-y-6">
          <p className="text-xs text-slate-400">
            Los campos con <span className="text-emerald-300">*</span> son obligatorios.
          </p>

          <fieldset className={sectionCls}>
            <legend className="px-1 text-base font-bold text-white">1. ¿Qué quieres presentar?</legend>
            <div className="grid gap-3 sm:grid-cols-2">
              {(Object.keys(KIND_LABEL) as ComplaintKind[]).map((k) => (
                <label
                  key={k}
                  className={`flex cursor-pointer items-start gap-3 rounded-lg border p-3 text-sm ${draft.kind === k ? 'border-emerald-400/70 bg-emerald-400/10' : 'border-zinc-700 bg-zinc-900/60 hover:border-zinc-500'}`}
                >
                  <input type="radio" name="kind" value={k} checked={draft.kind === k} onChange={() => set({ kind: k })} className={`${radioCls} mt-0.5`} />
                  <span>
                    <span className="block font-semibold text-white">{KIND_LABEL[k]}</span>
                    <span className="block text-xs text-slate-300">{KIND_HELP[k]}</span>
                  </span>
                </label>
              ))}
            </div>
          </fieldset>

          <fieldset className={sectionCls}>
            <legend className="px-1 text-base font-bold text-white">2. Tus datos</legend>
            <Field label="Nombre completo" required error={err('consumerName')}>
              {(a) => <input {...a} value={draft.consumerName} maxLength={LIMITS.name} autoComplete="name" onChange={(e) => set({ consumerName: e.target.value })} className={inputCls} />}
            </Field>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Tipo de documento" required>
                {(a) => (
                  <select {...a} value={draft.docType} onChange={(e) => set({ docType: e.target.value as DocType })} className={`${inputCls} cursor-pointer`}>
                    {(Object.keys(DOC_LABEL) as DocType[]).map((t) => (
                      <option key={t} value={t}>
                        {DOC_LABEL[t]}
                      </option>
                    ))}
                  </select>
                )}
              </Field>
              <Field label="Número de documento" required error={err('docNumber')}>
                {(a) => (
                  <input
                    {...a}
                    value={draft.docNumber}
                    maxLength={draft.docType === 'DNI' ? 8 : LIMITS.doc}
                    inputMode={draft.docType === 'DNI' ? 'numeric' : 'text'}
                    onChange={(e) => set({ docNumber: draft.docType === 'DNI' ? e.target.value.replace(/\D/g, '') : e.target.value })}
                    className={inputCls}
                  />
                )}
              </Field>
            </div>
            <Field label="Domicilio" required error={err('address')} hint="Calle, número y distrito.">
              {(a) => <input {...a} value={draft.address} maxLength={LIMITS.address} autoComplete="street-address" onChange={(e) => set({ address: e.target.value })} className={inputCls} />}
            </Field>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Teléfono o WhatsApp" required error={err('phone')}>
                {(a) => <input {...a} type="tel" value={draft.phone} maxLength={LIMITS.phone} autoComplete="tel" onChange={(e) => set({ phone: e.target.value })} className={inputCls} />}
              </Field>
              <Field label="Correo electrónico" required error={err('email')}>
                {(a) => <input {...a} type="email" value={draft.email} maxLength={LIMITS.email} autoComplete="email" onChange={(e) => set({ email: e.target.value })} className={inputCls} />}
              </Field>
            </div>
            <label className="flex cursor-pointer items-center gap-2 text-sm text-slate-200">
              <input type="checkbox" checked={draft.isMinor} onChange={(e) => set({ isMinor: e.target.checked })} className={radioCls} />
              Soy menor de edad
            </label>
            {draft.isMinor && (
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Nombre de tu padre, madre o representante" required error={err('guardianName')}>
                  {(a) => <input {...a} value={draft.guardianName} maxLength={LIMITS.name} onChange={(e) => set({ guardianName: e.target.value })} className={inputCls} />}
                </Field>
                <Field label="Su documento (opcional)" error={err('guardianDoc')}>
                  {(a) => <input {...a} value={draft.guardianDoc} maxLength={LIMITS.doc} onChange={(e) => set({ guardianDoc: e.target.value })} className={inputCls} />}
                </Field>
              </div>
            )}
          </fieldset>

          <fieldset className={sectionCls}>
            <legend className="px-1 text-base font-bold text-white">3. Lo que compraste</legend>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Es un" required>
                {(a) => (
                  <select {...a} value={draft.goodType} onChange={(e) => set({ goodType: e.target.value as GoodType })} className={`${inputCls} cursor-pointer`}>
                    {(Object.keys(GOOD_LABEL) as GoodType[]).map((t) => (
                      <option key={t} value={t}>
                        {GOOD_LABEL[t]}
                      </option>
                    ))}
                  </select>
                )}
              </Field>
              <Field label="Monto pagado en soles (opcional)" error={err('amount')}>
                {(a) => <input {...a} inputMode="decimal" value={draft.amount} maxLength={11} placeholder="Ejemplo: 25.50" onChange={(e) => set({ amount: e.target.value })} className={inputCls} />}
              </Field>
            </div>
            <Field label="Descripción" required error={err('goodDescription')} hint="Por ejemplo: «Cuenta de streaming por 1 mes».">
              {(a) => <input {...a} value={draft.goodDescription} maxLength={LIMITS.good} onChange={(e) => set({ goodDescription: e.target.value })} className={inputCls} />}
            </Field>
            <Field label="Número de pedido o referencia (opcional)" error={err('orderRef')}>
              {(a) => <input {...a} value={draft.orderRef} maxLength={LIMITS.order} onChange={(e) => set({ orderRef: e.target.value })} className={inputCls} />}
            </Field>
          </fieldset>

          <fieldset className={sectionCls}>
            <legend className="px-1 text-base font-bold text-white">4. Qué pasó y qué pides</legend>
            <Field label="Detalle" required error={err('detail')} hint="Cuéntanos qué pasó, cuándo y cómo.">
              {(a) => (
                <>
                  <textarea {...a} rows={5} value={draft.detail} onChange={(e) => set({ detail: e.target.value })} className={inputCls} />
                  <Count value={draft.detail} max={LIMITS.detail} />
                </>
              )}
            </Field>
            <Field label="Tu pedido" required error={err('request')} hint="La solución que esperas: reposición, devolución, una disculpa…">
              {(a) => (
                <>
                  <textarea {...a} rows={3} value={draft.request} onChange={(e) => set({ request: e.target.value })} className={inputCls} />
                  <Count value={draft.request} max={LIMITS.request} />
                </>
              )}
            </Field>
            <Field label="¿Cómo quieres recibir la respuesta?" required>
              {(a) => (
                <select {...a} value={draft.replyVia} onChange={(e) => set({ replyVia: e.target.value as ReplyVia })} className={`${inputCls} cursor-pointer`}>
                  {(Object.keys(REPLY_LABEL) as ReplyVia[]).map((v) => (
                    <option key={v} value={v}>
                      {REPLY_LABEL[v]}
                    </option>
                  ))}
                </select>
              )}
            </Field>
          </fieldset>

          <div className={sectionCls}>
            <div>
              <label className="flex cursor-pointer items-start gap-3 text-sm text-slate-200">
                <input
                  id="libro-conformidad"
                  type="checkbox"
                  checked={draft.conformity}
                  onChange={(e) => set({ conformity: e.target.checked })}
                  aria-invalid={err('conformity') ? true : undefined}
                  aria-describedby={err('conformity') ? 'libro-conformidad-err' : undefined}
                  className={`${radioCls} mt-0.5`}
                />
                <span>
                  Declaro que los datos y lo que escribí en esta hoja son verdaderos, y estoy conforme con los términos de mi reclamo o queja.{' '}
                  <span className="text-emerald-300" aria-hidden="true">
                    *
                  </span>
                </span>
              </label>
              {err('conformity') && (
                <p id="libro-conformidad-err" role="alert" className="mt-1 text-xs text-rose-300">
                  {err('conformity')}
                </p>
              )}
            </div>
            <p className="text-xs leading-relaxed text-slate-400">
              Usamos tus datos solo para atender tu reclamo o queja y guardar el registro que exige la ley. Mira la{' '}
              <LegalLink href="/privacidad" onNavigate={onNavigateToPrivacy}>
                Política de Privacidad
              </LegalLink>{' '}
              y los{' '}
              <LegalLink href="/terminos" onNavigate={onNavigateToTerms}>
                Términos y Condiciones
              </LegalLink>
              .
            </p>

            {/* Campo trampa contra programas automáticos: las personas no lo ven ni lo llenan */}
            <div aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
              <label>
                No escribas aquí
                <input ref={honeypot} type="text" name="website" tabIndex={-1} autoComplete="off" />
              </label>
            </div>

            {error && (
              <p role="alert" className="flex items-start gap-2 rounded-lg border border-rose-400/40 bg-rose-500/10 px-3 py-2 text-[13px] text-rose-200">
                <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
                <span>{error}</span>
              </p>
            )}
            {showErrors && hasComplaintErrors(errors) && (
              <p role="alert" className="text-[13px] text-rose-300">
                Revisa los campos marcados en rojo para poder enviar la hoja.
              </p>
            )}
            <button
              type="submit"
              disabled={busy}
              className="inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg bg-[#00ff88] px-4 py-3 text-sm font-bold text-zinc-950 hover:bg-[#00e676] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-200 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
            >
              {busy ? 'Enviando…' : 'Enviar hoja de reclamación'}
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default ComplaintsPage;
