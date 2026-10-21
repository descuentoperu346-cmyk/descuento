import React, { useEffect, useMemo, useRef, useState } from 'react';
import { AlertTriangle, Check, CheckCircle2, Copy, Landmark, Pencil, Plus, QrCode, Smartphone, Trash2, Upload, X } from 'lucide-react';
import type { Vendor, VendorPaymentConfig } from '../../data/vendorsData';
import type { PaymentMethodItem } from '../../data/paymentsData';
import { optimizeImage } from '../../lib/imageUpload';
import { deleteNote, useTrashReady } from '../../lib/vaultApi';
import { Card, PageHeader, primaryBtn, secondaryBtn } from './ui';
import { Field, Switch, inputCls } from './fields';
import { ConfirmDialog, Dialog } from './Dialog';
import {
  INSTRUCTIONS_MAX,
  METHOD_TYPES,
  accountError,
  cciError,
  configFromDraft,
  draftFromConfig,
  isPaymentDirty,
  isSampleValue,
  labelsFromDraft,
  normalizeMobile,
  slugId,
  validatePayments,
  type PaymentDraft
} from './paymentsForm';

interface PaymentsPageProps {
  vendor: Vendor;
  /** Administración: además de los datos de su tienda, administra los métodos que muestra la web */
  isSuperAdmin: boolean;
  paymentMethods: PaymentMethodItem[];
  onSaveVendor: (config: VendorPaymentConfig, labels: string[]) => void;
  onUpdateMethods: (list: PaymentMethodItem[]) => void;
  onToast: (message: string) => void;
}

const LOGOS: Record<string, string> = {
  yape: '/imagenes/iconos-pago/yape-app.jpg',
  plin: '/imagenes/iconos-pago/plin.jpg',
  bcp: '/imagenes/iconos-pago/bcp-app.jpg',
  interbank: '/imagenes/iconos-pago/interbank-app.jpg'
};

/** Estado de un método: siempre icono + palabra, nunca solo color. */
const Status: React.FC<{ state: 'ready' | 'empty' | 'sample' }> = ({ state }) =>
  state === 'ready' ? (
    <span className="inline-flex items-center gap-1 rounded-md border border-emerald-400/40 bg-emerald-400/10 px-1.5 py-0.5 text-[11px] font-semibold text-emerald-200">
      <CheckCircle2 className="h-3 w-3" aria-hidden="true" /> Listo
    </span>
  ) : state === 'sample' ? (
    <span className="inline-flex items-center gap-1 rounded-md border border-amber-400/40 bg-amber-400/10 px-1.5 py-0.5 text-[11px] font-semibold text-amber-200">
      <AlertTriangle className="h-3 w-3" aria-hidden="true" /> Número de ejemplo
    </span>
  ) : (
    <span className="inline-flex items-center rounded-md border border-zinc-700 bg-zinc-900 px-1.5 py-0.5 text-[11px] font-semibold text-zinc-300">No lo ofreces</span>
  );

const SampleNote: React.FC<{ value: string }> = ({ value }) =>
  isSampleValue(value) ? (
    <p className="mt-1 flex items-start gap-1.5 text-xs text-amber-200">
      <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden="true" /> Este dato es de ejemplo. Cámbialo por el real antes de cobrar.
    </p>
  ) : null;

// ======================================================================= Mi tienda
const StorePayments: React.FC<{ vendor: Vendor; onSaveVendor: PaymentsPageProps['onSaveVendor']; onToast: (m: string) => void }> = ({ vendor, onSaveVendor, onToast }) => {
  const initial = useMemo(() => draftFromConfig(vendor.paymentConfig), [vendor.id, vendor.paymentConfig]);
  const [draft, setDraft] = useState<PaymentDraft>(initial);
  const [submitted, setSubmitted] = useState(false);
  const [qrBusy, setQrBusy] = useState(false);
  const [qrError, setQrError] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    setDraft(initial);
    setSubmitted(false);
    setQrError('');
  }, [initial]);

  const dirty = isPaymentDirty(draft, initial);
  useEffect(() => {
    if (!dirty) return;
    const warn = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = '';
    };
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [dirty]);

  const errors = useMemo(() => validatePayments(draft), [draft]);
  const shown = submitted ? errors : {};
  const set = <K extends keyof PaymentDraft>(k: K, v: PaymentDraft[K]) => setDraft((d) => ({ ...d, [k]: v }));

  const stateOf = (...values: string[]): 'ready' | 'empty' | 'sample' => {
    const filled = values.filter((v) => v.trim());
    if (!filled.length) return 'empty';
    return filled.some(isSampleValue) ? 'sample' : 'ready';
  };
  const yape = stateOf(draft.yapePhone);
  const plin = stateOf(draft.plinPhone);
  const bcp = stateOf(draft.bcpAccount, draft.bcpCci);
  const inter = stateOf(draft.interbankAccount);
  const configured = [yape, plin, bcp, inter].filter((s) => s !== 'empty').length;

  const onQr = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    setQrBusy(true);
    setQrError('');
    const res = await optimizeImage(file, { maxSide: 800, png: true });
    setQrBusy(false);
    if (res.ok && res.dataUrl) set('qrImageUrl', res.dataUrl);
    else setQrError(res.error || 'No se pudo usar esa imagen.');
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    if (Object.keys(errors).length) {
      requestAnimationFrame(() => formRef.current?.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus());
      return;
    }
    onSaveVendor(configFromDraft(draft, vendor.paymentConfig), labelsFromDraft(draft, vendor.paymentMethods || []));
  };

  const copy = async (label: string, value: string) => {
    try {
      await navigator.clipboard.writeText(value);
      onToast(`${label} copiado.`);
    } catch {
      onToast('No se pudo copiar. Selecciónalo y cópialo a mano.');
    }
  };

  const preview: { key: string; label: string; value: string }[] = [
    draft.yapePhone.trim() && { key: 'yape', label: 'Yape', value: normalizeMobile(draft.yapePhone) || draft.yapePhone.trim() },
    draft.plinPhone.trim() && { key: 'plin', label: 'Plin', value: normalizeMobile(draft.plinPhone) || draft.plinPhone.trim() },
    draft.bcpAccount.trim() && { key: 'bcp', label: 'Cuenta BCP', value: draft.bcpAccount.trim() },
    draft.bcpCci.trim() && { key: 'cci', label: 'CCI (otros bancos)', value: draft.bcpCci.trim() },
    draft.interbankAccount.trim() && { key: 'ib', label: 'Cuenta Interbank', value: draft.interbankAccount.trim() }
  ].filter(Boolean) as { key: string; label: string; value: string }[];

  return (
    <div className="grid items-start gap-5 lg:grid-cols-12">
      <form ref={formRef} onSubmit={submit} noValidate className="space-y-5 lg:col-span-7" aria-label={`Datos de cobro de ${vendor.name}`}>
        {/* Billeteras */}
        <Card as="section" aria-labelledby="pg-billeteras" className="space-y-4 p-5">
          <div className="flex items-center gap-2">
            <Smartphone className="h-4 w-4 text-emerald-300" aria-hidden="true" />
            <h2 id="pg-billeteras" className="text-base font-semibold text-white">
              Billeteras digitales
            </h2>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <div className="flex items-center justify-between gap-2">
                <span className="flex items-center gap-2 text-[13px] font-semibold text-zinc-100">
                  <img src={LOGOS.yape} alt="" width={24} height={24} className="h-6 w-6 rounded-md" /> Yape
                </span>
                <Status state={yape} />
              </div>
              <Field label="Número de Yape" error={shown.yapePhone}>
                {(a) => <input {...a} inputMode="tel" autoComplete="off" value={draft.yapePhone} onChange={(e) => set('yapePhone', e.target.value)} placeholder="Ej.: 987 654 321" className={inputCls} />}
              </Field>
              <SampleNote value={draft.yapePhone} />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between gap-2">
                <span className="flex items-center gap-2 text-[13px] font-semibold text-zinc-100">
                  <img src={LOGOS.plin} alt="" width={24} height={24} className="h-6 w-6 rounded-md" /> Plin
                </span>
                <Status state={plin} />
              </div>
              <Field label="Número de Plin" error={shown.plinPhone}>
                {(a) => <input {...a} inputMode="tel" autoComplete="off" value={draft.plinPhone} onChange={(e) => set('plinPhone', e.target.value)} placeholder="Ej.: 987 654 321" className={inputCls} />}
              </Field>
              <SampleNote value={draft.plinPhone} />
            </div>
          </div>
          <p className="text-xs text-zinc-400">Deja vacío el que no uses: los clientes solo verán lo que llenes.</p>
        </Card>

        {/* Bancos */}
        <Card as="section" aria-labelledby="pg-bancos" className="space-y-4 p-5">
          <div className="flex items-center gap-2">
            <Landmark className="h-4 w-4 text-emerald-300" aria-hidden="true" />
            <h2 id="pg-bancos" className="text-base font-semibold text-white">
              Cuentas bancarias
            </h2>
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between gap-2">
              <span className="flex items-center gap-2 text-[13px] font-semibold text-zinc-100">
                <img src={LOGOS.bcp} alt="" width={24} height={24} className="h-6 w-6 rounded-md" /> BCP
              </span>
              <Status state={bcp} />
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Cuenta BCP" error={shown.bcpAccount} hint="Entre 10 y 20 dígitos.">
                {(a) => <input {...a} inputMode="numeric" autoComplete="off" value={draft.bcpAccount} onChange={(e) => set('bcpAccount', e.target.value)} placeholder="Ej.: 194-12345678-0-45" className={inputCls} />}
              </Field>
              <Field label="CCI (para otros bancos)" error={shown.bcpCci} hint="Tiene 20 dígitos.">
                {(a) => <input {...a} inputMode="numeric" autoComplete="off" value={draft.bcpCci} onChange={(e) => set('bcpCci', e.target.value)} placeholder="Ej.: 002-194-001234567845-17" className={inputCls} />}
              </Field>
            </div>
            <SampleNote value={draft.bcpAccount} />
            <SampleNote value={draft.bcpCci} />
          </div>
          <div className="space-y-2 border-t border-zinc-800/80 pt-4">
            <div className="flex items-center justify-between gap-2">
              <span className="flex items-center gap-2 text-[13px] font-semibold text-zinc-100">
                <img src={LOGOS.interbank} alt="" width={24} height={24} className="h-6 w-6 rounded-md" /> Interbank
              </span>
              <Status state={inter} />
            </div>
            <Field label="Cuenta Interbank" error={shown.interbankAccount} hint="Entre 10 y 20 dígitos.">
              {(a) => <input {...a} inputMode="numeric" autoComplete="off" value={draft.interbankAccount} onChange={(e) => set('interbankAccount', e.target.value)} placeholder="Ej.: 200-3009876543" className={inputCls} />}
            </Field>
            <SampleNote value={draft.interbankAccount} />
          </div>
        </Card>

        {/* QR e instrucciones */}
        <Card as="section" aria-labelledby="pg-qr" className="space-y-4 p-5">
          <div className="flex items-center gap-2">
            <QrCode className="h-4 w-4 text-emerald-300" aria-hidden="true" />
            <h2 id="pg-qr" className="text-base font-semibold text-white">
              Código QR e indicaciones
            </h2>
          </div>
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-zinc-800 bg-white p-1">
              {draft.qrImageUrl ? <img src={draft.qrImageUrl} alt="Tu código QR de pago" className="h-full w-full object-contain" /> : <QrCode className="h-8 w-8 text-zinc-400" aria-hidden="true" />}
            </div>
            <div className="space-y-2">
              <input ref={fileRef} type="file" accept="image/png,image/jpeg,image/webp" onChange={onQr} className="sr-only" tabIndex={-1} aria-label="Elegir la imagen de tu código QR" data-testid="payment-qr-input" />
              <div className="flex flex-wrap gap-2">
                <button type="button" onClick={() => fileRef.current?.click()} disabled={qrBusy} className={secondaryBtn}>
                  <Upload className="h-4 w-4" aria-hidden="true" /> {qrBusy ? 'Preparando…' : draft.qrImageUrl ? 'Cambiar QR' : 'Subir mi QR'}
                </button>
                {draft.qrImageUrl && (
                  <button type="button" onClick={() => set('qrImageUrl', '')} className={secondaryBtn}>
                    <X className="h-4 w-4" aria-hidden="true" /> Quitar
                  </button>
                )}
              </div>
              <p className="text-xs text-zinc-400">Aparece al cliente cuando elige pagarte con Yape o Plin.</p>
              {qrError && (
                <p role="alert" className="text-xs text-rose-300">
                  {qrError}
                </p>
              )}
            </div>
          </div>
          <Field label="Indicaciones para el cliente" hint="Ejemplo: Envía la captura del pago a mi Telegram para activar tu servicio." error={shown.paymentInstructions}>
            {(a) => (
              <>
                <textarea {...a} rows={3} value={draft.paymentInstructions} onChange={(e) => set('paymentInstructions', e.target.value)} className={inputCls} />
                <p className="mt-1 flex text-xs">
                  <span className={`ml-auto tabular-nums ${draft.paymentInstructions.trim().length > INSTRUCTIONS_MAX ? 'text-rose-300' : 'text-zinc-400'}`}>
                    {draft.paymentInstructions.trim().length}/{INSTRUCTIONS_MAX}
                  </span>
                </p>
              </>
            )}
          </Field>
        </Card>

        <div className="sticky bottom-3 z-10 flex flex-wrap items-center gap-2 rounded-xl border border-zinc-700 bg-[#14141a]/95 p-3 shadow-xl backdrop-blur">
          <button type="submit" disabled={!dirty} className={primaryBtn}>
            Guardar cambios
          </button>
          <button type="button" disabled={!dirty} onClick={() => setDraft(initial)} className={secondaryBtn}>
            Descartar
          </button>
          <span role="status" className={`ml-auto text-xs ${dirty ? 'text-amber-200' : 'text-zinc-400'}`}>
            {dirty ? 'Tienes cambios sin guardar' : 'Todo guardado'}
          </span>
        </div>
      </form>

      {/* Vista del cliente */}
      <aside className="space-y-3 lg:sticky lg:top-20 lg:col-span-5" aria-label="Vista del cliente">
        <p className="text-sm font-semibold text-white">Así lo verá tu cliente</p>
        <Card className="space-y-3 p-4">
          <p className="text-[13px] text-zinc-300">
            Pago a <strong className="text-white">{vendor.name}</strong>
          </p>
          {preview.length === 0 ? (
            <p className="flex items-start gap-2 rounded-lg border border-amber-400/30 bg-amber-400/5 p-3 text-[13px] text-amber-100">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-300" aria-hidden="true" />
              Todavía no hay ningún método. Sin esto, tus clientes no sabrán cómo pagarte.
            </p>
          ) : (
            <ul className="divide-y divide-zinc-800/70">
              {preview.map((p) => (
                <li key={p.key} className="flex items-center justify-between gap-3 py-2">
                  <div className="min-w-0">
                    <p className="text-xs text-zinc-400">{p.label}</p>
                    <p className="truncate font-mono text-sm text-white">{p.value}</p>
                  </div>
                  <button type="button" onClick={() => copy(p.label, p.value)} aria-label={`Copiar ${p.label}`} className="rounded-lg border border-zinc-700 p-2 text-zinc-300 hover:bg-white/5 hover:text-white focus-visible:outline-2 focus-visible:outline-emerald-300">
                    <Copy className="h-4 w-4" aria-hidden="true" />
                  </button>
                </li>
              ))}
            </ul>
          )}
          {draft.qrImageUrl && (
            <div className="flex items-center gap-3 border-t border-zinc-800/70 pt-3">
              <img src={draft.qrImageUrl} alt="" className="h-16 w-16 rounded-lg bg-white object-contain p-1" />
              <p className="text-xs text-zinc-400">El cliente podrá abrir tu QR en grande para escanearlo.</p>
            </div>
          )}
          {draft.paymentInstructions.trim() && <p className="rounded-lg bg-zinc-900 p-3 text-[13px] italic text-zinc-300">“{draft.paymentInstructions.trim()}”</p>}
        </Card>
        <p className="text-xs text-zinc-400">
          {configured} de 4 métodos con datos. {draft.yapePhone.trim() || draft.plinPhone.trim() ? 'La vista se actualiza mientras escribes; recuerda guardar.' : ''}
        </p>
      </aside>
    </div>
  );
};

// ======================================================================= Métodos de la web (administración)
interface MethodForm {
  id: string | null;
  name: string;
  type: PaymentMethodItem['type'];
  beneficiaryName: string;
  phoneNumber: string;
  accountNumber: string;
  cciNumber: string;
  instructions: string;
  active: boolean;
}
const emptyMethod = (): MethodForm => ({ id: null, name: '', type: 'wallet', beneficiaryName: '', phoneNumber: '', accountNumber: '', cciNumber: '', instructions: '', active: true });
const methodToForm = (m: PaymentMethodItem): MethodForm => ({
  id: m.id,
  name: m.name,
  type: m.type,
  beneficiaryName: m.beneficiaryName || '',
  phoneNumber: m.phoneNumber || '',
  accountNumber: m.accountNumber || '',
  cciNumber: m.cciNumber || '',
  instructions: m.instructions || '',
  active: m.active
});

const WebMethods: React.FC<{ methods: PaymentMethodItem[]; onUpdate: (list: PaymentMethodItem[]) => void; onToast: (m: string) => void }> = ({ methods, onUpdate, onToast }) => {
  const [editing, setEditing] = useState<MethodForm | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [removing, setRemoving] = useState<PaymentMethodItem | null>(null);
  const trashReady = useTrashReady();

  const open = (f: MethodForm) => {
    setErrors({});
    setEditing(f);
  };

  const save = () => {
    if (!editing) return;
    const e: Record<string, string> = {};
    if (!editing.name.trim()) e.name = 'Escribe el nombre del método.';
    if (editing.phoneNumber.trim() && !normalizeMobile(editing.phoneNumber)) e.phoneNumber = 'Celular de 9 dígitos que empiece con 9.';
    const acc = accountError(editing.accountNumber, 'Cuenta');
    if (acc) e.accountNumber = acc;
    const cci = cciError(editing.cciNumber);
    if (cci) e.cciNumber = cci;
    setErrors(e);
    if (Object.keys(e).length) return;
    const base = editing.id ? methods.find((m) => m.id === editing.id) : undefined;
    const item: PaymentMethodItem = {
      ...(base || { id: slugId(editing.name, methods.map((m) => m.id)), icon: editing.type, active: true, beneficiaryName: '', name: '', type: editing.type }),
      name: editing.name.trim(),
      type: editing.type,
      active: editing.active,
      beneficiaryName: editing.beneficiaryName.trim(),
      phoneNumber: editing.phoneNumber.trim() ? normalizeMobile(editing.phoneNumber) || editing.phoneNumber.trim() : undefined,
      accountNumber: editing.accountNumber.trim() || undefined,
      cciNumber: editing.cciNumber.trim() || undefined,
      instructions: editing.instructions.trim() || undefined
    };
    onUpdate(base ? methods.map((m) => (m.id === item.id ? item : m)) : [...methods, item]);
    onToast(base ? `Método “${item.name}” actualizado.` : `Método “${item.name}” agregado.`);
    setEditing(null);
  };

  const toggle = (m: PaymentMethodItem) => onUpdate(methods.map((x) => (x.id === m.id ? { ...x, active: !x.active } : x)));
  const sample = (m: PaymentMethodItem) => [m.phoneNumber, m.accountNumber, m.cciNumber].some(isSampleValue);
  const activeCount = methods.filter((m) => m.active).length;

  return (
    <div className="space-y-4">
      <Card className="p-4 text-[13px] text-zinc-300">
        Estos son los métodos que la web muestra en su franja “Pagos oficiales en Perú”. Los datos de cobro que ve cada cliente al comprar son los de la tienda que lo atiende (pestaña “Mi tienda”).
      </Card>
      <Card>
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-zinc-800/80 p-4">
          <p className="text-sm font-semibold text-white">
            {methods.length} métodos · {activeCount} visibles en la web
          </p>
          <button type="button" onClick={() => open(emptyMethod())} className={primaryBtn}>
            <Plus className="h-4 w-4" aria-hidden="true" /> Agregar método
          </button>
        </div>
        <ul className="divide-y divide-zinc-800/60" aria-label="Métodos de pago de la web">
          {methods.map((m) => (
            <li key={m.id} className="flex flex-wrap items-center gap-3 p-4">
              <img src={m.logoUrl || '/imagenes/iconos-pago/bcp.png'} alt="" width={32} height={32} className="h-8 w-8 shrink-0 rounded-lg bg-zinc-900 object-cover" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-white">{m.name}</p>
                <p className="flex flex-wrap items-center gap-x-2 text-xs text-zinc-400">
                  <span>{METHOD_TYPES.find((t) => t.value === m.type)?.label || 'Otro'}</span>
                  {m.beneficiaryName && <span>· {m.beneficiaryName}</span>}
                  {sample(m) && (
                    <span className="inline-flex items-center gap-1 rounded bg-amber-400/10 px-1 py-px font-semibold text-amber-200">
                      <AlertTriangle className="h-3 w-3" aria-hidden="true" /> Dato de ejemplo
                    </span>
                  )}
                </p>
              </div>
              <span className="inline-flex items-center gap-2">
                <Switch checked={m.active} label={`${m.name}: ${m.active ? 'visible en la web, pulsa para ocultarlo' : 'oculto, pulsa para mostrarlo'}`} onChange={() => toggle(m)} />
                <span className={`text-xs font-medium ${m.active ? 'text-emerald-200' : 'text-zinc-400'}`}>{m.active ? 'Visible' : 'Oculto'}</span>
              </span>
              <span className="inline-flex items-center gap-1">
                <button type="button" onClick={() => open(methodToForm(m))} aria-label={`Editar ${m.name}`} title="Editar" className="rounded-lg p-2 text-zinc-300 hover:bg-white/5 hover:text-white focus-visible:outline-2 focus-visible:outline-emerald-300">
                  <Pencil className="h-4 w-4" aria-hidden="true" />
                </button>
                <button type="button" onClick={() => setRemoving(m)} aria-label={`Eliminar ${m.name}`} title="Eliminar" className="rounded-lg p-2 text-rose-300 hover:bg-rose-500/10 hover:text-rose-200 focus-visible:outline-2 focus-visible:outline-rose-300">
                  <Trash2 className="h-4 w-4" aria-hidden="true" />
                </button>
              </span>
            </li>
          ))}
        </ul>
      </Card>

      <Dialog
        open={editing !== null}
        onClose={() => setEditing(null)}
        title={editing?.id ? 'Editar método de pago' : 'Agregar método de pago'}
        footer={
          <>
            <button type="button" onClick={() => setEditing(null)} className={secondaryBtn}>
              Cancelar
            </button>
            <button type="button" onClick={save} className={primaryBtn}>
              <Check className="h-4 w-4" aria-hidden="true" /> Guardar
            </button>
          </>
        }
      >
        {editing && (
          <div className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Nombre" required error={errors.name}>
                {(a) => <input {...a} data-autofocus value={editing.name} onChange={(e) => setEditing({ ...editing, name: e.target.value })} className={inputCls} />}
              </Field>
              <Field label="Tipo">
                {(a) => (
                  <select {...a} value={editing.type} onChange={(e) => setEditing({ ...editing, type: e.target.value as PaymentMethodItem['type'] })} className={`${inputCls} cursor-pointer`}>
                    {METHOD_TYPES.map((t) => (
                      <option key={t.value} value={t.value}>
                        {t.label}
                      </option>
                    ))}
                  </select>
                )}
              </Field>
            </div>
            <Field label="A nombre de">
              {(a) => <input {...a} value={editing.beneficiaryName} onChange={(e) => setEditing({ ...editing, beneficiaryName: e.target.value })} className={inputCls} />}
            </Field>
            <div className="grid gap-4 sm:grid-cols-3">
              <Field label="Celular" error={errors.phoneNumber}>
                {(a) => <input {...a} inputMode="tel" value={editing.phoneNumber} onChange={(e) => setEditing({ ...editing, phoneNumber: e.target.value })} placeholder="987 654 321" className={inputCls} />}
              </Field>
              <Field label="Cuenta" error={errors.accountNumber}>
                {(a) => <input {...a} inputMode="numeric" value={editing.accountNumber} onChange={(e) => setEditing({ ...editing, accountNumber: e.target.value })} className={inputCls} />}
              </Field>
              <Field label="CCI" error={errors.cciNumber}>
                {(a) => <input {...a} inputMode="numeric" value={editing.cciNumber} onChange={(e) => setEditing({ ...editing, cciNumber: e.target.value })} className={inputCls} />}
              </Field>
            </div>
            <Field label="Indicaciones">
              {(a) => <textarea {...a} rows={2} value={editing.instructions} onChange={(e) => setEditing({ ...editing, instructions: e.target.value })} className={inputCls} />}
            </Field>
            <label className="inline-flex cursor-pointer items-center gap-2 text-[13px] text-zinc-200">
              <input type="checkbox" checked={editing.active} onChange={(e) => setEditing({ ...editing, active: e.target.checked })} className="h-4 w-4 cursor-pointer accent-[#00ff88]" />
              Mostrar en la web
            </label>
          </div>
        )}
      </Dialog>

      <ConfirmDialog
        open={removing !== null}
        title="¿Eliminar este método?"
        message={`“${removing?.name ?? ''}” dejará de aparecer en la web. ${deleteNote(trashReady)}`}
        confirmLabel="Eliminar método"
        danger
        onConfirm={() => {
          if (removing) {
            if (methods.length <= 1) onToast('Debe quedar al menos un método de pago.');
            else {
              onUpdate(methods.filter((m) => m.id !== removing.id));
              onToast(`Método “${removing.name}” eliminado.`);
            }
          }
          setRemoving(null);
        }}
        onCancel={() => setRemoving(null)}
      />
    </div>
  );
};

// ======================================================================= Pantalla
export const PaymentsPage: React.FC<PaymentsPageProps> = ({ vendor, isSuperAdmin, paymentMethods, onSaveVendor, onUpdateMethods, onToast }) => {
  // Si lo único con datos de ejemplo son los métodos de la web, se abre directo esa pestaña
  const [tab, setTab] = useState<'tienda' | 'web'>(() => {
    const c = vendor.paymentConfig;
    const storeSample = [c?.yapePhone, c?.plinPhone, c?.bcpAccount, c?.bcpCci, c?.interbankAccount].some(isSampleValue);
    const webSample = paymentMethods.some((m) => m.active && [m.phoneNumber, m.accountNumber, m.cciNumber].some(isSampleValue));
    return isSuperAdmin && webSample && !storeSample ? 'web' : 'tienda';
  });
  const tabs: { id: 'tienda' | 'web'; label: string }[] = [
    { id: 'tienda', label: 'Mi tienda' },
    { id: 'web', label: 'Métodos de la web' }
  ];
  const onKey = (e: React.KeyboardEvent) => {
    if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
    e.preventDefault();
    const next = tab === 'tienda' ? 'web' : 'tienda';
    setTab(next);
    requestAnimationFrame(() => document.getElementById(`pg-tab-${next}`)?.focus());
  };

  return (
    <div className="mx-auto max-w-6xl space-y-5">
      <PageHeader title="Métodos de pago" description={`Cómo te pagan los clientes de ${vendor.name}. Lo que guardes aquí es lo que ellos ven al comprar.`} />

      {isSuperAdmin && (
        <div role="tablist" aria-label="Tipo de método de pago" onKeyDown={onKey} className="inline-flex rounded-lg border border-zinc-800 bg-zinc-900 p-1">
          {tabs.map((t) => (
            <button
              key={t.id}
              id={`pg-tab-${t.id}`}
              type="button"
              role="tab"
              aria-selected={tab === t.id}
              aria-controls={`pg-panel-${t.id}`}
              tabIndex={tab === t.id ? 0 : -1}
              onClick={() => setTab(t.id)}
              className={`rounded-md px-3 py-1.5 text-[13px] font-semibold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-300 ${tab === t.id ? 'bg-emerald-400/15 text-emerald-100' : 'text-zinc-300 hover:text-white'}`}
            >
              {t.label}
            </button>
          ))}
        </div>
      )}

      <div id={`pg-panel-${tab}`} role={isSuperAdmin ? 'tabpanel' : undefined} aria-labelledby={isSuperAdmin ? `pg-tab-${tab}` : undefined}>
        {tab === 'tienda' || !isSuperAdmin ? (
          <StorePayments key={vendor.id} vendor={vendor} onSaveVendor={onSaveVendor} onToast={onToast} />
        ) : (
          <WebMethods methods={paymentMethods} onUpdate={onUpdateMethods} onToast={onToast} />
        )}
      </div>
    </div>
  );
};

export default PaymentsPage;
