import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ClipboardCheck, ClipboardCopy, MessageSquareText, RotateCcw, Save } from 'lucide-react';
import { Card, PageHeader, primaryBtn, secondaryBtn } from '../ui';
import { Field, inputCls } from '../fields';
import type { SalesState } from '../../../lib/salesStore';
import { copyText } from '../../../lib/clipboard';
import { formatDay } from '../../../lib/salesMath';
import { TEMPLATES, VARIABLES, loadCustomTexts, renderTemplate, saveCustomTexts, suggestTemplate, varsFromSale } from '../../../lib/messageTemplates';
import { ContactLinks, SalesGate, scopeData, type SalesCtx } from './shared';

/** Número de ejemplo que trae el proyecto: nunca debe llegar a un cliente. */
const SAMPLE_DIGITS = '999888777';
const MAX_TEXT = 1500;

const missingReason = (name: string, hasSale: boolean) => {
  if (['tienda', 'medios', 'yape'].includes(name)) return name === 'tienda' ? 'tu tienda no tiene nombre guardado' : name === 'medios' ? 'tu tienda no tiene formas de pago guardadas (revisa Métodos de pago)' : 'tu tienda no tiene un Yape guardado (revisa Métodos de pago)';
  return hasSale ? 'esta venta no tiene ese dato' : 'elige una venta para llenarlo';
};

const Body: React.FC<{ ctx: SalesCtx; state: SalesState }> = ({ ctx, state }) => {
  const { sales, customers } = useMemo(() => scopeData(state, ctx), [state, ctx.isSuperAdmin, ctx.currentVendor.id]);
  const [saleId, setSaleId] = useState('');
  const sale = useMemo(() => sales.find((s) => s.id === saleId) || null, [sales, saleId]);
  const [templateId, setTemplateId] = useState('bienvenida');
  const [custom, setCustom] = useState<Record<string, string>>(loadCustomTexts);
  const baseText = (id: string) => custom[id] ?? TEMPLATES.find((t) => t.id === id)!.text;
  const [text, setText] = useState(() => baseText('bienvenida'));
  const [status, setStatus] = useState('');
  const areaRef = useRef<HTMLTextAreaElement>(null);
  const template = TEMPLATES.find((t) => t.id === templateId)!;
  const original = template.text;
  const saved = custom[templateId] ?? null;

  const pickTemplate = (id: string) => {
    setTemplateId(id);
    setText(baseText(id));
    setStatus('');
  };
  const pickSale = (id: string) => {
    setSaleId(id);
    const s = sales.find((x) => x.id === id) || null;
    // al elegir una venta se propone el mensaje que más conviene según su estado
    pickTemplate(suggestTemplate(s));
  };

  const vendor = ctx.vendors.find((v) => v.id === (sale?.vendorId || ctx.currentVendor.id));
  const yapeRaw = vendor?.paymentConfig?.yapePhone || '';
  const vars = useMemo(
    () =>
      varsFromSale(sale, {
        name: vendor?.name || ctx.currentVendor.name,
        paymentLabels: vendor?.paymentMethods || [],
        yape: yapeRaw.replace(/\D/g, '') === SAMPLE_DIGITS ? '' : yapeRaw
      }),
    [sale, vendor, yapeRaw, ctx.currentVendor.name]
  );
  const rendered = useMemo(() => renderTemplate(text, vars), [text, vars]);
  const customer = sale?.customerId ? customers.find((c) => c.id === sale.customerId) || null : null;

  useEffect(() => {
    if (!status) return;
    const t = window.setTimeout(() => setStatus(''), 4000);
    return () => window.clearTimeout(t);
  }, [status]);

  const insertVar = (name: string) => {
    const el = areaRef.current;
    const at = el ? el.selectionStart : text.length;
    const to = el ? el.selectionEnd : text.length;
    const next = `${text.slice(0, at)}{${name}}${text.slice(to)}`;
    setText(next.slice(0, MAX_TEXT));
    window.setTimeout(() => {
      el?.focus();
      el?.setSelectionRange(at + name.length + 2, at + name.length + 2);
    }, 0);
  };
  const dirty = text !== baseText(templateId);
  const changedFromOriginal = text !== original;

  const saveMine = () => {
    const next = { ...custom };
    if (text === original) delete next[templateId];
    else next[templateId] = text;
    if (!saveCustomTexts(next)) {
      setStatus('No se pudo guardar en este navegador.');
      return;
    }
    setCustom(next);
    setStatus('Tu versión se guardó en este navegador.');
  };
  const restore = () => {
    const next = { ...custom };
    delete next[templateId];
    saveCustomTexts(next);
    setCustom(next);
    setText(original);
    setStatus('Volvió el texto original.');
  };
  const copy = async () => {
    setStatus((await copyText(rendered.text)) ? 'Mensaje copiado. Ya puedes pegarlo en Telegram o WhatsApp.' : 'No se pudo copiar. Selecciona el texto y cópialo a mano.');
  };

  return (
    <div className="mx-auto max-w-6xl space-y-5">
      <PageHeader title="Mensajes listos" description="Textos para copiar y enviar por Telegram o WhatsApp. Elige una venta y se llenan solos el nombre, el producto, el monto y la fecha." />

      <div className="grid items-start gap-5 lg:grid-cols-[18rem_1fr]">
        <Card as="section" aria-labelledby="msg-lista" className="p-3">
          <h2 id="msg-lista" className="px-2 pb-2 pt-1 text-sm font-semibold text-white">
            ¿Qué quieres decir?
          </h2>
          <div className="space-y-1" role="group" aria-label="Mensajes disponibles">
            {TEMPLATES.map((t) => (
              <button
                key={t.id}
                type="button"
                aria-pressed={templateId === t.id}
                onClick={() => pickTemplate(t.id)}
                className={`block w-full rounded-lg border px-3 py-2 text-left focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-300 ${
                  templateId === t.id ? 'border-emerald-400/60 bg-emerald-400/10' : 'border-transparent hover:bg-zinc-900'
                }`}
              >
                <span className="block text-[13px] font-semibold text-white">
                  {t.title}
                  {custom[t.id] && <span className="ml-1.5 rounded bg-zinc-800 px-1 py-0.5 text-[10px] font-medium text-zinc-300">editado</span>}
                </span>
                <span className="mt-0.5 block text-xs text-zinc-400">{t.when}</span>
              </button>
            ))}
          </div>
        </Card>

        <Card as="section" aria-labelledby="msg-editor" className="space-y-4 p-5">
          <h2 id="msg-editor" className="flex items-center gap-2 text-base font-semibold text-white">
            <MessageSquareText className="h-4 w-4 text-emerald-300" aria-hidden="true" /> {template.title}
          </h2>

          <Field label="Venta (para llenar los datos)" hint={sales.length ? 'Opcional. Sin venta, los datos quedan entre llaves, como {cliente}.' : 'Todavía no hay ventas registradas.'}>
            {(a) => (
              <select {...a} value={saleId} onChange={(e) => pickSale(e.target.value)} className={`${inputCls} cursor-pointer`}>
                <option value="">Sin venta</option>
                {sales.slice(0, 150).map((s) => (
                  <option key={s.id} value={s.id}>
                    #{s.number} · {s.customerName} · {s.productTitle} · {formatDay(s.soldAt)}
                  </option>
                ))}
              </select>
            )}
          </Field>

          <Field label="Texto del mensaje" hint="Puedes cambiarlo. Los datos entre llaves se reemplazan solos.">
            {(a) => (
              <>
                <textarea {...a} ref={areaRef} rows={7} maxLength={MAX_TEXT} value={text} onChange={(e) => setText(e.target.value)} className={inputCls} />
                <div className="mt-2 flex flex-wrap gap-1.5" role="group" aria-label="Agregar un dato al texto">
                  {VARIABLES.map((v) => (
                    <button
                      key={v.name}
                      type="button"
                      onClick={() => insertVar(v.name)}
                      title={v.label}
                      aria-label={`Agregar ${v.name}: ${v.label}`}
                      className="rounded-full border border-zinc-700 bg-zinc-900 px-2.5 py-0.5 text-xs text-zinc-200 hover:border-zinc-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-300"
                    >
                      +{' '}
                      <span aria-hidden="true">{'{'}</span>
                      {v.name}
                      <span aria-hidden="true">{'}'}</span>
                    </button>
                  ))}
                </div>
              </>
            )}
          </Field>

          <div className="flex flex-wrap items-center gap-2">
            <button type="button" onClick={saveMine} disabled={!dirty} className={secondaryBtn}>
              <Save className="h-4 w-4" aria-hidden="true" /> Guardar mi versión
            </button>
            <button type="button" onClick={restore} disabled={!changedFromOriginal && !saved} className={secondaryBtn}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" /> Volver al original
            </button>
            <p className="text-xs text-zinc-400">Tus cambios se guardan solo en este navegador.</p>
          </div>

          <div className="space-y-3 border-t border-zinc-800 pt-4">
            <h3 className="text-sm font-semibold text-white">Así quedará el mensaje</h3>
            <p data-testid="msg-preview" className="whitespace-pre-wrap break-words rounded-lg border border-zinc-800 bg-zinc-950 px-4 py-3 text-sm text-zinc-100">
              {rendered.text}
            </p>
            {(rendered.missing.length > 0 || rendered.unknown.length > 0) && (
              <ul className="space-y-1 text-[13px] text-amber-200" aria-label="Datos que faltan">
                {rendered.missing.map((m) => (
                  <li key={m}>
                    Falta el dato <code className="rounded bg-zinc-800 px-1">{`{${m}}`}</code>: {missingReason(m, !!sale)}. Se queda escrito tal cual: cámbialo antes de enviar.
                  </li>
                ))}
                {rendered.unknown.map((m) => (
                  <li key={m}>
                    El dato <code className="rounded bg-zinc-800 px-1">{`{${m}}`}</code> no existe. Revisa cómo lo escribiste.
                  </li>
                ))}
              </ul>
            )}
            <div className="flex flex-wrap items-center gap-3">
              <button type="button" onClick={() => void copy()} className={primaryBtn}>
                <ClipboardCopy className="h-4 w-4" aria-hidden="true" /> Copiar mensaje
              </button>
              {customer ? (
                <ContactLinks customer={customer} text={rendered.text} />
              ) : (
                <span className="text-xs text-zinc-400">{sale ? 'Este cliente no tiene WhatsApp ni Telegram guardado: copia el mensaje y envíalo tú.' : 'Elige una venta para abrir el chat del cliente con un clic.'}</span>
              )}
            </div>
            <p role="status" className="flex min-h-5 items-center gap-1.5 text-xs text-emerald-200">
              {status && (
                <>
                  <ClipboardCheck className="h-3.5 w-3.5" aria-hidden="true" /> {status}
                </>
              )}
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
};

export const MessagesPage: React.FC<{ ctx: SalesCtx }> = ({ ctx }) => <SalesGate ctx={ctx}>{(state) => <Body ctx={ctx} state={state} />}</SalesGate>;
export default MessagesPage;
