/**
 * Convierte los párrafos de una guía en bloques con forma propia:
 *  - "Paso 1: ..."                       -> pasos numerados
 *  - "Regla de oro: ..." / "Importante:" -> aviso destacado
 *  - "Cómo identificar...: (1) a (2) b"  -> lista de comprobación
 *  - el primer párrafo                   -> entradilla
 * El texto no se modifica: solo cambia cómo se presenta.
 */
export interface Step {
  n: number;
  title: string;
  body: string;
}

export type ProseNode =
  | { type: 'lead'; text: string }
  | { type: 'p'; text: string }
  | { type: 'steps'; items: Step[] }
  | { type: 'callout'; label: string; text: string }
  | { type: 'checklist'; intro: string; items: string[] };

const STEP = /^Paso\s+(\d+)\s*:\s*([\s\S]+)$/i;
const CALLOUT = /^(Regla de oro|Importante|Nota|Atención|Recuerda)\s*:\s*([\s\S]+)$/i;
const ENUM_START = /\(1\)\s/;

/** Título = primera oración; el resto es el desarrollo del paso. */
function splitSentence(text: string): { title: string; body: string } {
  // No corta dentro de paréntesis: busca el primer ". " fuera de ()
  let depth = 0;
  for (let i = 0; i < text.length - 1; i++) {
    const c = text[i];
    if (c === '(') depth++;
    else if (c === ')') depth = Math.max(0, depth - 1);
    else if (c === '.' && depth === 0 && text[i + 1] === ' ') {
      return { title: text.slice(0, i).trim(), body: text.slice(i + 2).trim() };
    }
  }
  return { title: text.replace(/\.$/, '').trim(), body: '' };
}

function parseChecklist(text: string): { intro: string; items: string[] } | null {
  const m = ENUM_START.exec(text);
  if (!m || !/\(2\)\s/.test(text)) return null;
  const intro = text.slice(0, m.index).trim().replace(/:$/, '');
  const items = text
    .slice(m.index)
    .split(/\s*\(\d+\)\s+/)
    .map((s) => s.trim())
    .filter(Boolean);
  return items.length >= 2 ? { intro, items } : null;
}

export function parseProse(blocks: string[]): ProseNode[] {
  const out: ProseNode[] = [];
  let leadDone = false;
  blocks.forEach((raw) => {
    const text = raw.trim();
    if (!text) return;

    const step = STEP.exec(text);
    if (step) {
      const { title, body } = splitSentence(step[2]);
      const item: Step = { n: parseInt(step[1], 10), title, body };
      const last = out[out.length - 1];
      if (last && last.type === 'steps') last.items.push(item);
      else out.push({ type: 'steps', items: [item] });
      leadDone = true;
      return;
    }

    const callout = CALLOUT.exec(text);
    if (callout) {
      out.push({ type: 'callout', label: callout[1], text: callout[2] });
      leadDone = true;
      return;
    }

    const list = parseChecklist(text);
    if (list) {
      out.push({ type: 'checklist', intro: list.intro, items: list.items });
      leadDone = true;
      return;
    }

    if (!leadDone) {
      out.push({ type: 'lead', text });
      leadDone = true;
    } else {
      out.push({ type: 'p', text });
    }
  });
  return out;
}

/** Escala "Nivel 1: ... Nivel 4: ..." (p. ej. niveles de exposición de datos). */
export function parseLevels(items: string[]): { level: number; text: string }[] | null {
  const parsed = items.map((t) => /^Nivel\s+(\d+)\s*:\s*(.+)$/i.exec(t));
  if (items.length < 2 || parsed.some((m) => !m)) return null;
  return parsed.map((m) => ({ level: parseInt(m![1], 10), text: m![2] }));
}
