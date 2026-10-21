import React, { useEffect } from 'react';
import { Ban, CheckCircle2, Clock, Database, MessageCircle, RefreshCw, RotateCcw, Send, TriangleAlert } from 'lucide-react';
import type { Vendor } from '../../../data/vendorsData';
import type { ServiceItem } from '../../../data/servicesData';
import type { PaymentMethodItem } from '../../../data/paymentsData';
import { ensureSalesLoaded, useSales, type SalesState } from '../../../lib/salesStore';
import type { SaleInput } from '../../../lib/salesApi';
import { relativeDays, STATUS_LABEL, telegramUrl, whatsappUrl, type Customer, type Sale, type SaleStatus, type SubInfo } from '../../../lib/salesMath';
import { Card, primaryBtn, secondaryBtn } from '../ui';

/** Lo que las pantallas de ventas necesitan saber de la sesión y del catálogo. */
export interface SalesCtx {
  vendors: Vendor[];
  /** Tienda con la que se está trabajando */
  currentVendor: Vendor;
  /** Vista de administración: se ven las ventas de todas las tiendas */
  isSuperAdmin: boolean;
  /** Rol ADMIN o DEV (la base solo les deja borrar y ver todo) */
  isStaffAdmin: boolean;
  services: ServiceItem[];
  paymentMethods: PaymentMethodItem[];
  onToast: (msg: string) => void;
}

/** Datos con los que se abre el formulario para una venta nueva (p. ej. al renovar). */
export interface SaleDraft {
  vendorId?: string;
  customerId?: string | null;
  customerName?: string;
  productId?: string | null;
  productTitle?: string;
  plan?: string | null;
  amount?: number;
  paymentMethod?: string | null;
  durationDays?: number | null;
  /** Si se renueva una venta que aún no vence, la nueva empieza a contar desde ese vencimiento */
  renewOf?: Sale;
}

/** Petición desde fuera de la pantalla (buscador, Resumen) para abrir algo concreto. */
export type SalesIntent = { kind: 'new-sale'; draft?: SaleDraft; seq: number } | { kind: 'customer'; id: string; seq: number } | null;

/** Ventas y clientes visibles según la tienda con la que se trabaja. */
export function scopeData(state: SalesState, ctx: Pick<SalesCtx, 'isSuperAdmin' | 'currentVendor'>): { sales: Sale[]; customers: Customer[] } {
  if (ctx.isSuperAdmin) return { sales: state.sales, customers: state.customers };
  const v = ctx.currentVendor.id;
  return { sales: state.sales.filter((s) => s.vendorId === v), customers: state.customers.filter((c) => c.vendorId === v) };
}

export const vendorName = (vendors: Vendor[], id: string) => vendors.find((v) => v.id === id)?.name || id;

/** Copia los datos de una venta para guardarla de nuevo con algún cambio (p. ej. cambiar el estado). */
export function saleToInput(s: Sale, patch: Partial<SaleInput> = {}): SaleInput {
  return {
    vendorId: s.vendorId,
    customerId: s.customerId,
    customerName: s.customerName,
    productId: s.productId,
    productTitle: s.productTitle,
    plan: s.plan,
    amount: s.amount,
    paymentMethod: s.paymentMethod,
    status: s.status,
    soldAt: s.soldAt,
    durationDays: s.durationDays,
    expiresAt: s.expiresAt,
    notes: s.notes,
    ...patch
  };
}

/** Descarga un archivo de texto (CSV) desde el navegador. */
export function downloadText(filename: string, content: string, mime = 'text/csv;charset=utf-8') {
  const url = URL.createObjectURL(new Blob([content], { type: mime }));
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

// ---------------------------------------------------------------- etiquetas de estado (icono + palabra, nunca solo color)
const STATUS_STYLE: Record<SaleStatus, { cls: string; icon: React.ElementType; label: string }> = {
  paid: { cls: 'border-emerald-400/30 bg-emerald-400/10 text-emerald-200', icon: CheckCircle2, label: STATUS_LABEL.paid },
  pending: { cls: 'border-amber-400/40 bg-amber-400/10 text-amber-200', icon: Clock, label: 'Pendiente' },
  cancelled: { cls: 'border-zinc-600 bg-zinc-800 text-zinc-300', icon: Ban, label: STATUS_LABEL.cancelled },
  refunded: { cls: 'border-sky-400/30 bg-sky-400/10 text-sky-200', icon: RotateCcw, label: STATUS_LABEL.refunded }
};
export const StatusChip: React.FC<{ status: SaleStatus }> = ({ status }) => {
  const s = STATUS_STYLE[status];
  const Icon = s.icon;
  return (
    <span className={`inline-flex items-center gap-1 whitespace-nowrap rounded-md border px-1.5 py-0.5 text-[11px] font-semibold ${s.cls}`}>
      <Icon className="h-3 w-3" aria-hidden="true" />
      {s.label}
    </span>
  );
};

const SUB_STYLE = {
  active: { cls: 'border-emerald-400/30 bg-emerald-400/10 text-emerald-200', label: 'Activa' },
  expiring: { cls: 'border-amber-400/40 bg-amber-400/10 text-amber-200', label: 'Por vencer' },
  expired: { cls: 'border-rose-400/40 bg-rose-500/10 text-rose-200', label: 'Vencida' }
} as const;
export const SubChip: React.FC<{ info: SubInfo }> = ({ info }) => {
  const s = SUB_STYLE[info.state];
  const Icon = info.state === 'expired' ? TriangleAlert : info.state === 'expiring' ? Clock : CheckCircle2;
  return (
    <span className={`inline-flex items-center gap-1 whitespace-nowrap rounded-md border px-1.5 py-0.5 text-[11px] font-semibold ${s.cls}`}>
      <Icon className="h-3 w-3" aria-hidden="true" />
      {s.label} · {relativeDays(info.daysLeft)}
    </span>
  );
};

// ---------------------------------------------------------------- puerta de entrada de cada pantalla
interface GateProps {
  ctx: Pick<SalesCtx, 'isStaffAdmin'>;
  children: (state: SalesState) => React.ReactNode;
}

/** Carga los datos y muestra el estado correcto: cargando, error, módulo sin activar, o la pantalla. */
export const SalesGate: React.FC<GateProps> = ({ ctx, children }) => {
  const state = useSales();
  useEffect(() => {
    void ensureSalesLoaded();
  }, []);

  if (state.status === 'idle' || (state.status === 'loading' && state.sales.length === 0 && state.customers.length === 0)) {
    return (
      <div className="mx-auto max-w-7xl py-16 text-center text-sm text-zinc-400" role="status" aria-busy="true">
        <RefreshCw className="mx-auto mb-3 h-5 w-5 animate-spin text-zinc-400" aria-hidden="true" />
        Cargando ventas y clientes…
      </div>
    );
  }
  if (state.status === 'missing') return <ModuleMissing admin={ctx.isStaffAdmin} />;
  if (state.status === 'error') {
    return (
      <Card className="mx-auto max-w-xl p-6 text-center">
        <TriangleAlert className="mx-auto h-7 w-7 text-rose-300" aria-hidden="true" />
        <h2 className="mt-3 text-base font-semibold text-white">No se pudieron cargar los datos</h2>
        <p role="alert" className="mt-1 text-sm text-zinc-400">
          {state.error}
        </p>
        <button type="button" onClick={() => void ensureSalesLoaded(true)} className={`${primaryBtn} mt-4`}>
          <RefreshCw className="h-4 w-4" aria-hidden="true" /> Intentar de nuevo
        </button>
      </Card>
    );
  }
  return <>{children(state)}</>;
};

export const ModuleMissing: React.FC<{ admin: boolean }> = ({ admin }) => (
  <Card className="mx-auto max-w-2xl p-6">
    <div className="flex items-start gap-4">
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-amber-400/40 bg-amber-400/10">
        <Database className="h-5 w-5 text-amber-200" aria-hidden="true" />
      </span>
      <div className="min-w-0">
        <h2 className="text-base font-semibold text-white">Falta activar el módulo de ventas</h2>
        {admin ? (
          <>
            <p className="mt-1 text-sm text-zinc-300">Las tablas de ventas y clientes todavía no existen en tu base de datos. Se crean una sola vez:</p>
            <ol className="mt-3 list-decimal space-y-1.5 pl-5 text-sm text-zinc-300">
              <li>Abre Supabase → <strong className="text-white">SQL Editor</strong> → <strong className="text-white">New query</strong>.</li>
              <li>
                Pega todo el contenido del archivo <code className="rounded bg-zinc-800 px-1.5 py-0.5 text-[12px] text-emerald-200">supabase/06-ventas-y-clientes.sql</code> y pulsa <strong className="text-white">Run</strong>.
              </li>
              <li>Vuelve aquí y pulsa “Comprobar de nuevo”.</li>
            </ol>
          </>
        ) : (
          <p className="mt-1 text-sm text-zinc-300">Pídele al administrador de la web que active el módulo de ventas. Cuando lo haga, aquí podrás registrar tus ventas.</p>
        )}
        <button type="button" onClick={() => void ensureSalesLoaded(true)} className={`${secondaryBtn} mt-4`}>
          <RefreshCw className="h-4 w-4" aria-hidden="true" /> Comprobar de nuevo
        </button>
      </div>
    </div>
  </Card>
);

// ---------------------------------------------------------------- botones de contacto
export const ContactLinks: React.FC<{ customer: Pick<Customer, 'telegram' | 'whatsapp'>; text?: string }> = ({ customer, text }) => {
  const wa = whatsappUrl(customer.whatsapp, text);
  const tg = telegramUrl(customer.telegram);
  if (!wa && !tg) return <span className="text-xs text-zinc-400">Sin contacto</span>;
  return (
    <span className="inline-flex flex-wrap items-center gap-1.5">
      {wa && (
        <a href={wa} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 rounded-md border border-emerald-400/30 bg-emerald-400/10 px-2 py-1 text-xs font-semibold text-emerald-100 hover:bg-emerald-400/20 focus-visible:outline-2 focus-visible:outline-emerald-300">
          <MessageCircle className="h-3.5 w-3.5" aria-hidden="true" /> WhatsApp<span className="sr-only"> (se abre en una pestaña nueva)</span>
        </a>
      )}
      {tg && (
        <a href={tg} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 rounded-md border border-sky-400/30 bg-sky-400/10 px-2 py-1 text-xs font-semibold text-sky-100 hover:bg-sky-400/20 focus-visible:outline-2 focus-visible:outline-sky-300">
          <Send className="h-3.5 w-3.5" aria-hidden="true" /> Telegram<span className="sr-only"> (se abre en una pestaña nueva)</span>
        </a>
      )}
    </span>
  );
};
