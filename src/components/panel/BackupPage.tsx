import React, { useRef, useState } from 'react';
import { CheckCircle2, Database, Download, FileUp, RefreshCw, ShieldAlert, TriangleAlert } from 'lucide-react';
import { BACKUP_TABLES, applyBackup, backupFileName, exportBackup, getLastBackup, summarizeBackup, type BackupSummary } from '../../lib/vaultApi';
import { Card, PageHeader, StateNote as Note, primaryBtn, secondaryBtn } from './ui';
import { ConfirmDialog } from './Dialog';

interface BackupPageProps {
  /** false cuando el panel trabaja sin base de datos (modo local) */
  dbMode: boolean;
  /** Se llama después de recuperar filas para que el panel vuelva a leer el contenido */
  onRestored: () => void | Promise<void>;
  onToast: (message: string) => void;
}

const MAX_FILE_BYTES = 60 * 1024 * 1024;
const nf = new Intl.NumberFormat('es-PE');
const fmtWhen = new Intl.DateTimeFormat('es-PE', { dateStyle: 'medium', timeStyle: 'short', timeZone: 'America/Lima' });

const Counts: React.FC<{ counts: Record<string, number>; skipZero?: boolean }> = ({ counts, skipZero }) => (
  <ul className="grid grid-cols-2 gap-x-6 gap-y-1 text-sm sm:grid-cols-3">
    {BACKUP_TABLES.filter((t) => !skipZero || counts[t.key] > 0).map((t) => (
      <li key={t.key} className="flex justify-between gap-2 border-b border-zinc-800/70 py-1">
        <span className="text-zinc-300">{t.label}</span>
        <span className="tabular-nums font-semibold text-white">{nf.format(counts[t.key] ?? 0)}</span>
      </li>
    ))}
  </ul>
);

/** "hace 3 días" a partir de una fecha, para el recordatorio de la última copia. */
const agoText = (iso: string | null) => {
  if (!iso) return null;
  const days = Math.floor((Date.now() - new Date(iso).getTime()) / 86400000);
  const when = days <= 0 ? 'hoy' : days === 1 ? 'ayer' : `hace ${days} días`;
  return `${when} (${fmtWhen.format(new Date(iso))})`;
};

export const BackupPage: React.FC<BackupPageProps> = ({ dbMode, onRestored, onToast }) => {
  const [busy, setBusy] = useState(false);
  const [missing, setMissing] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState<BackupSummary | null>(null);
  const [last, setLast] = useState<string | null>(getLastBackup);

  const fileRef = useRef<HTMLInputElement>(null);
  const [picked, setPicked] = useState<{ name: string; data: unknown; summary: BackupSummary } | null>(null);
  const [pickError, setPickError] = useState('');
  const [confirm, setConfirm] = useState(false);
  const [restoring, setRestoring] = useState(false);
  const [restoreError, setRestoreError] = useState('');
  const [restored, setRestored] = useState<Record<string, number> | null>(null);

  const header = <PageHeader title="Copia de la base de datos" description="Descarga todo el contenido en un archivo y recupera lo que falte. Solo lo ve el desarrollador." />;

  if (!dbMode) {
    return (
      <div className="mx-auto max-w-3xl space-y-5">
        {header}
        <Note icon={Database} tone="zinc" title="Necesita la base de datos conectada">
          <p>Esta copia se hace desde la base de datos de la web. En este modo (sin base de datos) usa “Base de datos y copias” del menú.</p>
        </Note>
      </div>
    );
  }
  if (missing) {
    return (
      <div className="mx-auto max-w-3xl space-y-5">
        {header}
        <Note
          icon={Database}
          tone="amber"
          title="Falta activar la copia de seguridad"
          action={
            <button type="button" onClick={() => setMissing(false)} className={`${secondaryBtn} mt-4`}>
              <RefreshCw className="h-4 w-4" aria-hidden="true" /> Volver a intentar
            </button>
          }
        >
          <p>Esta parte todavía no existe en tu base de datos. Se activa una sola vez:</p>
          <ol className="mt-3 list-decimal space-y-1.5 pl-5">
            <li>
              Abre Supabase → <strong className="text-white">SQL Editor</strong> → <strong className="text-white">New query</strong>.
            </li>
            <li>
              Pega todo el archivo <code className="rounded bg-zinc-800 px-1.5 py-0.5 text-[12px] text-emerald-200">supabase/10-respaldo.sql</code> y pulsa <strong className="text-white">Run</strong>.
            </li>
            <li>Vuelve aquí y pulsa “Volver a intentar”.</li>
          </ol>
        </Note>
      </div>
    );
  }

  const download = async () => {
    setBusy(true);
    setError('');
    setDone(null);
    const res = await exportBackup();
    setBusy(false);
    if (res.status === 'missing') {
      setMissing(true);
      return;
    }
    if (res.status === 'error') {
      setError(res.message);
      return;
    }
    const blob = new Blob([JSON.stringify(res.data.backup, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = backupFileName();
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    setDone(res.data.summary);
    setLast(new Date().toISOString());
    onToast('Copia descargada.');
  };

  const onPick = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    setPicked(null);
    setPickError('');
    setRestored(null);
    setRestoreError('');
    if (!file) return;
    if (file.size > MAX_FILE_BYTES) {
      setPickError('Ese archivo es demasiado grande para ser una copia de esta web.');
      return;
    }
    try {
      const data = JSON.parse(await file.text());
      const s = summarizeBackup(data);
      if ('error' in s) setPickError(s.error);
      else setPicked({ name: file.name, data, summary: s.summary });
    } catch {
      setPickError('No se pudo leer ese archivo. Elige un archivo .json descargado desde aquí.');
    }
  };

  const restore = async () => {
    if (!picked) return;
    setRestoring(true);
    setRestoreError('');
    const res = await applyBackup(picked.data);
    setRestoring(false);
    if ('error' in res) {
      setRestoreError(res.error);
      return;
    }
    setConfirm(false);
    setRestored(res.data);
    setPicked(null);
    const total = Object.values(res.data).reduce((a, b) => a + b, 0);
    onToast(total ? `Se recuperaron ${total} elementos.` : 'No faltaba nada: todo ya estaba en la base.');
    if (total) await onRestored();
  };
  const restoredTotal = restored ? Object.values(restored).reduce((a, b) => a + b, 0) : 0;

  return (
    <div className="mx-auto max-w-3xl space-y-5">
      {header}

      <Card as="section" aria-labelledby="bk-bajar" className="space-y-4 p-5">
        <div>
          <h2 id="bk-bajar" className="text-base font-semibold text-white">
            1 · Descargar una copia
          </h2>
          <p className="mt-1 text-sm text-zinc-300">Baja a tu computadora todo el contenido de la web: productos, tiendas, métodos de pago, artículos, clientes y ventas.</p>
        </div>
        <p className="flex items-start gap-2 rounded-lg border border-amber-400/40 bg-amber-400/10 px-3 py-2.5 text-[13px] text-amber-100">
          <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0 text-amber-300" aria-hidden="true" />
          <span>El archivo incluye datos de tus clientes (nombres, contactos y ventas). Guárdalo en un lugar privado y no lo compartas. No incluye contraseñas ni cuentas.</span>
        </p>
        <div className="flex flex-wrap items-center gap-3">
          <button type="button" onClick={() => void download()} disabled={busy} className={primaryBtn}>
            <Download className="h-4 w-4" aria-hidden="true" /> {busy ? 'Preparando la copia…' : 'Descargar copia ahora'}
          </button>
          <p className="text-xs text-zinc-400" role="status">
            {last ? `Última copia bajada desde este navegador: ${agoText(last)}.` : 'Todavía no has bajado una copia desde este navegador.'}
          </p>
        </div>
        {error && (
          <p role="alert" className="flex items-start gap-2 text-sm text-rose-300">
            <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" /> {error}
          </p>
        )}
        {done && (
          <div className="space-y-2" role="status">
            <p className="flex items-center gap-2 text-sm font-semibold text-emerald-200">
              <CheckCircle2 className="h-4 w-4" aria-hidden="true" /> Copia descargada con {nf.format(done.total)} elementos
            </p>
            <Counts counts={done.counts} />
          </div>
        )}
      </Card>

      <Card as="section" aria-labelledby="bk-subir" className="space-y-4 p-5">
        <div>
          <h2 id="bk-subir" className="text-base font-semibold text-white">
            2 · Recuperar lo que falte
          </h2>
          <p className="mt-1 text-sm text-zinc-300">Elige un archivo de copia. Solo se agrega lo que ya no existe en la base. Lo que hay ahora no se cambia ni se borra.</p>
        </div>
        <input ref={fileRef} type="file" accept=".json,application/json" onChange={onPick} className="sr-only" tabIndex={-1} aria-label="Elegir el archivo de copia" data-testid="backup-file-input" />
        <button type="button" onClick={() => fileRef.current?.click()} className={secondaryBtn}>
          <FileUp className="h-4 w-4" aria-hidden="true" /> Elegir archivo de copia
        </button>
        {pickError && (
          <p role="alert" className="flex items-start gap-2 text-sm text-rose-300">
            <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" /> {pickError}
          </p>
        )}
        {picked && (
          <div className="space-y-3 rounded-lg border border-zinc-800 bg-zinc-900/40 p-4" role="status">
            <p className="text-sm text-zinc-200">
              <span className="font-semibold text-white">{picked.name}</span>
              {picked.summary.createdAt ? ` · hecha el ${fmtWhen.format(new Date(picked.summary.createdAt))}` : ''} · trae {nf.format(picked.summary.total)} elementos:
            </p>
            <Counts counts={picked.summary.counts} />
            <button
              type="button"
              onClick={() => {
                setRestoreError('');
                setConfirm(true);
              }}
              className={primaryBtn}
            >
              Recuperar lo que falte
            </button>
          </div>
        )}
        {restored && (
          <div className="space-y-2" role="status">
            <p className="flex items-center gap-2 text-sm font-semibold text-emerald-200">
              <CheckCircle2 className="h-4 w-4" aria-hidden="true" /> {restoredTotal ? `Se recuperaron ${nf.format(restoredTotal)} elementos que faltaban` : 'No faltaba nada: todo lo de la copia ya estaba en la base'}
            </p>
            {restoredTotal > 0 && <Counts counts={restored} skipZero />}
          </div>
        )}
      </Card>

      <ConfirmDialog
        open={confirm}
        title="¿Recuperar lo que falte?"
        message="Se agregarán a la base los elementos de la copia que ya no existen. Lo que ya está no se cambia ni se borra."
        confirmLabel="Recuperar"
        busy={restoring}
        error={restoreError}
        onConfirm={() => void restore()}
        onCancel={() => setConfirm(false)}
      />
    </div>
  );
};

export default BackupPage;
