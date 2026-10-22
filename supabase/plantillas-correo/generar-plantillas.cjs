// Genera las otras 12 plantillas de correo de Supabase a partir de confirmar-registro.html
// (misma cabecera con el lema, mismos estilos y mismo pie), cambiando solo el cuerpo.
// Uso: node supabase/plantillas-correo/generar-plantillas.cjs
// Si cambias el diseno en confirmar-registro.html, vuelve a correrlo y se actualizan las 12.
// Ojo: reescribe esos 12 archivos; confirmar-registro.html no lo toca.
// Los que tienen `dir` (hoy 3: los que funcionan con código) se escriben en esa subcarpeta, aparte de los demás.
const fs = require('fs');
const path = require('path');

const DIR = __dirname;
const base = fs.readFileSync(path.join(DIR, 'confirmar-registro.html'), 'utf8');

const iEtiqueta = base.indexOf('        <!-- Etiqueta -->');
const iPie = base.indexOf('        <!-- Pie -->');
if (iEtiqueta < 0 || iPie < 0) throw new Error('No encuentro los marcadores en confirmar-registro.html');
const HEAD = base.slice(0, iEtiqueta);
const TAIL = base.slice(iPie);

const MONO = "'SF Mono',Menlo,Consolas,'Courier New',monospace";
const SANS = "'Segoe UI',Arial,Helvetica,sans-serif";
const TG = 'https://t.me/Tin9o';
// En los avisos de seguridad no se confirma que exista {{ .SiteURL }}: la direccion va fija.
const SITIO = 'https://descuentos-peru.vercel.app';

const TONES = {
  green: { bg: '#0b2417', bd: '#14532d', fg: '#00ff88' },
  amber: { bg: '#261c06', bd: '#6b5212', fg: '#febc2e' },
};

const pill = (text, tone = 'green') => {
  const c = TONES[tone];
  return `        <!-- Etiqueta -->
        <tr>
          <td align="center" style="padding:30px 28px 0;">
            <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="border-collapse:separate;">
              <tr>
                <td bgcolor="${c.bg}" style="background-color:${c.bg};border:1px solid ${c.bd};border-radius:999px;padding:7px 16px;font-family:${MONO};font-size:11px;font-weight:bold;letter-spacing:2px;color:${c.fg};">
                  <span class="dp-pls">&#9679;</span> ${text}
                </td>
              </tr>
            </table>
          </td>
        </tr>
`;
};

const title = (t, intro) => `
        <!-- Título y mensaje -->
        <tr>
          <td align="center" style="padding:18px 28px 0;font-family:${SANS};font-size:30px;font-weight:800;line-height:36px;color:#ffffff;">
            ${t}
          </td>
        </tr>
        <tr>
          <td align="center" style="padding:12px 40px 0;font-family:${SANS};font-size:15px;line-height:25px;color:#a1a1aa;">
            ${intro}
          </td>
        </tr>
`;

const codeModule = (label, expiry) => `
        <!-- Módulo del código -->
        <tr>
          <td class="dp-fade" align="center" style="padding:26px 22px 0;">
            <table class="dp-glow" role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="#07130d" style="max-width:380px;background-color:#07130d;background-image:linear-gradient(180deg,#0c2a1a 0%,#06100a 100%);border:2px solid #00ff88;border-radius:18px;border-collapse:separate;box-shadow:0 0 28px rgba(0,255,136,.28);">
              <tr>
                <td style="padding:14px 18px 0;">
                  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                    <tr>
                      <td align="left" style="font-family:${MONO};font-size:11px;font-weight:bold;letter-spacing:2px;color:#00ff88;">${label}</td>
                      <td align="right" style="font-family:${MONO};font-size:11px;letter-spacing:1px;color:#7b9a88;">6 DÍGITOS</td>
                    </tr>
                  </table>
                </td>
              </tr>
              <tr>
                <td height="12" style="height:12px;font-size:0;line-height:0;">&nbsp;</td>
              </tr>
              <tr>
                <td height="1" bgcolor="#14532d" style="height:1px;background-color:#14532d;font-size:0;line-height:0;">&nbsp;</td>
              </tr>
              <tr>
                <td align="center" style="padding:22px 0 20px 12px;font-family:${MONO};font-size:42px;font-weight:bold;letter-spacing:12px;line-height:48px;color:#00ff88;text-shadow:0 0 18px rgba(0,255,136,.55);">
                  {{ .Token }}
                </td>
              </tr>
              <tr>
                <td style="padding:0 18px 18px;">
                  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse:separate;">
                    <tr>
                      <td class="dp-shim" height="6" bgcolor="#00ff88" style="height:6px;background-color:#00ff88;background-image:linear-gradient(90deg,#00a85a 0%,#00ff88 35%,#d6ffe9 50%,#00ff88 65%,#00a85a 100%);border-radius:3px;font-size:0;line-height:0;">&nbsp;</td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>
          </td>
        </tr>
        <tr>
          <td align="center" style="padding:14px 36px 0;font-family:${SANS};font-size:13px;line-height:20px;color:#a1a1aa;">
            ${expiry}
          </td>
        </tr>
`;

// rows: [[etiqueta, valor, destacado?]]
const infoCard = (rows) => {
  const filas = rows
    .map(([label, value, hot], i) => {
      const sep = i > 0
        ? `              <tr><td height="1" bgcolor="#1a2e22" style="height:1px;background-color:#1a2e22;font-size:0;line-height:0;">&nbsp;</td></tr>\n`
        : '';
      return `${sep}              <tr>
                <td style="padding:14px 18px;">
                  <div style="font-family:${MONO};font-size:10px;font-weight:bold;letter-spacing:2px;color:#7b9a88;">${label}</div>
                  <div style="padding-top:5px;font-family:${SANS};font-size:16px;font-weight:bold;line-height:22px;color:${hot ? '#00ff88' : '#ffffff'};word-break:break-all;">${value}</div>
                </td>
              </tr>
`;
    })
    .join('');
  return `
        <!-- Datos -->
        <tr>
          <td style="padding:28px 24px 0;">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="#0e1712" style="background-color:#0e1712;border:1px solid #1a2e22;border-radius:12px;border-collapse:separate;">
${filas}            </table>
          </td>
        </tr>
`;
};

const button = (text, url, fallback = false) => `
        <!-- Botón -->
        <tr>
          <td class="dp-fade2" align="center" style="padding:30px 28px 0;">
            <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="border-collapse:separate;">
              <tr>
                <td align="center" bgcolor="#00ff88" style="background-color:#00ff88;background-image:linear-gradient(180deg,#2dffa0 0%,#00e57a 100%);border-radius:14px;border-bottom:3px solid #00a85a;box-shadow:0 8px 26px rgba(0,255,136,.30);">
                  <a href="${url}" style="display:inline-block;padding:15px 36px;font-family:${SANS};font-size:16px;font-weight:800;color:#04130b;text-decoration:none;border-radius:14px;">${text}</a>
                </td>
              </tr>
            </table>
          </td>
        </tr>
${fallback ? `        <tr>
          <td align="center" style="padding:16px 32px 0;font-family:${SANS};font-size:12px;line-height:18px;color:#8e8e97;">
            ¿El botón no funciona? Copia este enlace y pégalo en tu navegador:
            <div style="padding-top:6px;font-family:${MONO};font-size:11px;line-height:17px;color:#7b9a88;word-break:break-all;">{{ .ConfirmationURL }}</div>
          </td>
        </tr>
` : ''}`;

const notice = (heading, text, tone = 'green') => {
  const c = TONES[tone];
  const bar = tone === 'amber' ? '#febc2e' : '#00ff88';
  return `
        <!-- Aviso -->
        <tr>
          <td style="padding:30px 24px 0;">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="#111114" style="background-color:#111114;border:1px solid #27272a;border-left:4px solid ${bar};border-radius:12px;border-collapse:separate;">
              <tr>
                <td style="padding:16px 18px;">
                  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                    <tr>
                      <td width="36" valign="top" style="width:36px;"><table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr><td width="24" height="24" align="center" bgcolor="${c.bg}" style="width:24px;height:24px;background-color:${c.bg};border:1px solid ${c.bd};border-radius:12px;font-family:${SANS};font-size:13px;font-weight:bold;color:${c.fg};">!</td></tr></table></td>
                      <td valign="top" style="font-family:${SANS};font-size:13px;line-height:20px;color:#d4d4d8;"><strong style="color:#ffffff;">${heading}</strong> ${text}</td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>
          </td>
        </tr>
`;
};

// Pasos "cómo hacerlo": el último es el resultado (con ✓ y en verde). steps: [[negrita, texto], ...]
const stepsBlock = (heading, steps) => {
  const cards = steps.map(([bold, text], i) => {
    const last = i === steps.length - 1;
    const badge = last
      ? `<td width="28" height="28" align="center" bgcolor="#00ff88" style="width:28px;height:28px;background-color:#00ff88;border-radius:8px;font-family:${MONO};font-size:13px;font-weight:bold;color:#050505;">&#10003;</td>`
      : `<td width="28" height="28" align="center" bgcolor="#0b2417" style="width:28px;height:28px;background-color:#0b2417;border:1px solid #14532d;border-radius:8px;font-family:${MONO};font-size:13px;font-weight:bold;color:#00ff88;">${i + 1}</td>`;
    const bg = last ? '#0b2417' : '#0e1712';
    const bd = last ? '#14532d' : '#1a2e22';
    return `              <tr>
                <td bgcolor="${bg}" style="background-color:${bg};border:1px solid ${bd};border-radius:12px;padding:14px 16px;">
                  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                    <tr>
                      <td width="34" valign="top" style="width:34px;"><table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr>${badge}</tr></table></td>
                      <td valign="top" style="font-family:${SANS};font-size:14px;line-height:20px;color:#a1a1aa;"><strong style="color:${last ? '#00ff88' : '#ffffff'};">${bold}</strong><br>${text}</td>
                    </tr>
                  </table>
                </td>
              </tr>
`;
  });
  return `
        <!-- Pasos -->
        <tr>
          <td style="padding:30px 24px 0;">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
              <tr>
                <td style="font-family:${MONO};font-size:11px;font-weight:bold;letter-spacing:3px;color:#7b9a88;padding:0 4px 12px;">${heading}</td>
              </tr>
${cards.join('              <tr><td height="8" style="height:8px;font-size:0;line-height:0;">&nbsp;</td></tr>\n')}            </table>
          </td>
        </tr>
`;
};

const tg = (color = '#febc2e') => `<a href="${TG}" style="color:${color};font-weight:bold;text-decoration:none;">@Tin9o</a>`;

const VENCE = 'Vence en <strong style="color:#ffffff;">1 hora</strong>. Si vence, pide uno nuevo desde la web.';
// Los códigos sirven una sola vez; `donde` dice en qué pantalla de la web se pide otro
const VENCE_UNA_VEZ = (donde) => `Vence en <strong style="color:#ffffff;">1 hora</strong> y sirve una sola vez.<br>Si vence, pide otro en ${donde}.`;
const NOFUI = (extra) => notice('¿No fuiste tú?', `${extra} Escríbenos cuanto antes por Telegram: ${tg()}.`, 'amber');
const SEGURIDAD_CODIGO = notice('Tu seguridad.', 'Nadie del equipo te pedirá este código por Telegram, WhatsApp ni llamada. Si no fuiste tú, ignora este correo y cambia tu contraseña.');

const plantillas = [
  {
    file: 'invitar-usuario.html',
    term: 'preparando tu invitación',
    subject: 'Te invitaron a Descuentos Perú',
    window: 'invitacion',
    preheader: 'Te invitaron a unirte a Descuentos Perú. Acepta la invitación desde este correo.',
    footer: 'Recibiste este correo porque el equipo de Descuentos Perú te invitó a crear una cuenta.',
    body:
      pill('INVITACIÓN') +
      title('Te invitaron a unirte', 'El equipo de <strong style="color:#ffffff;">Descuentos Perú</strong> te invitó a crear tu cuenta.<br>Pulsa el botón para aceptar la invitación y entrar.') +
      button('Aceptar invitación &rarr;', '{{ .ConfirmationURL }}', true) +
      notice('Tu seguridad.', 'Si no esperabas esta invitación, ignora este correo: no pasará nada si no la aceptas.'),
  },
  {
    // Estas 3 funcionan con código (no con enlace) y van en su propia carpeta: son las que hay que volver a pegar en Supabase.
    dir: 'volver-a-pegar',
    file: 'enlace-magico-o-codigo.html',
    term: 'abriendo tu acceso',
    subject: 'Tu acceso a Descuentos Perú',
    window: 'acceso',
    preheader: 'Tu código para entrar es {{ .Token }}. Vence en 1 hora.',
    footer: 'Recibiste este correo porque alguien pidió entrar a Descuentos Perú con esta dirección.',
    body:
      pill('ACCESO A TU CUENTA') +
      title('Entra a tu cuenta', 'Pediste entrar a <strong style="color:#ffffff;">Descuentos Perú</strong> sin contraseña.<br>Escribe este código en la web para entrar.') +
      codeModule('// CÓDIGO DE ACCESO', VENCE_UNA_VEZ('«Entrar con un código por correo»')) +
      stepsBlock('CÓMO ENTRAR', [
        ['Vuelve a la web', 'Regresa a la pestaña donde pediste el código.'],
        ['Escribe el código', 'Los 6 dígitos de arriba, sin espacios.'],
        ['¡Listo, ya estás dentro!', 'Entras a tu cuenta sin escribir tu contraseña.'],
      ]) +
      button('Ir a Descuentos Perú &rarr;', '{{ .SiteURL }}') +
      notice('Tu seguridad.', 'Nadie del equipo te pedirá este código por Telegram, WhatsApp ni llamada. Si no fuiste tú, ignora este correo: sin el código nadie puede entrar a tu cuenta.'),
  },
  {
    dir: 'volver-a-pegar',
    file: 'cambiar-correo.html',
    term: 'verificando el cambio',
    subject: 'Confirma tu nuevo correo en Descuentos Perú',
    window: 'cambio-de-correo',
    preheader: 'Tu código para confirmar el cambio de correo es {{ .Token }}. Vence en 1 hora.',
    footer: 'Recibiste este correo porque se pidió cambiar el correo de una cuenta de Descuentos Perú.',
    // Con "Secure email change" Supabase manda este mismo correo al correo actual y al nuevo, cada uno con su código.
    body:
      pill('CAMBIO DE CORREO') +
      title('Confirma el cambio de correo', 'Pediste cambiar el correo de tu cuenta.<br>Revisa los datos y escribe este código en la web.') +
      infoCard([
        ['CORREO ACTUAL', '{{ .Email }}'],
        ['CORREO NUEVO', '{{ .NewEmail }}', true],
      ]) +
      codeModule('// CÓDIGO DE CAMBIO', VENCE_UNA_VEZ('<em>Mi cuenta &rarr; Cambiar correo</em>')) +
      notice('¿Te llegaron dos correos?', 'Por seguridad puede llegar un código a cada dirección, la actual y la nueva. Si te llegan los dos, escribe <strong style="color:#ffffff;">los dos códigos</strong> en la web.') +
      stepsBlock('CÓMO CONFIRMARLO', [
        ['Vuelve a la web', 'Abre <em>Mi cuenta &rarr; Cambiar correo</em> en la pestaña donde lo pediste.'],
        ['Escribe el código', 'Los 6 dígitos de arriba. Si llegó otro a la otra dirección, escribe también ese.'],
        ['¡Listo, correo nuevo!', 'Desde ahora entras con <strong style="color:#ffffff;">{{ .NewEmail }}</strong>.'],
      ]) +
      NOFUI('No escribas el código: el correo de tu cuenta no cambiará. Cambia tu contraseña por si acaso.'),
  },
  {
    dir: 'volver-a-pegar',
    file: 'restablecer-contrasena.html',
    term: 'protegiendo tu cuenta',
    subject: 'Tu código para restablecer la contraseña',
    window: 'restablecer',
    preheader: 'Tu código para elegir una contraseña nueva es {{ .Token }}. Vence en 1 hora.',
    footer: 'Recibiste este correo porque alguien pidió restablecer la contraseña de una cuenta de Descuentos Perú.',
    body:
      pill('RESTABLECER CONTRASEÑA') +
      title('Crea una contraseña nueva', 'Recibimos una solicitud para cambiar la contraseña de tu cuenta.<br>Escribe este código en la web y elige una nueva.') +
      codeModule('// RECUPERAR CLAVE', VENCE_UNA_VEZ('«¿Olvidaste tu contraseña?»')) +
      stepsBlock('CÓMO RECUPERARLA', [
        ['Vuelve a la web', 'Regresa a la pestaña donde pediste el código y escribe los 6 dígitos de arriba.'],
        ['Elige tu contraseña nueva', 'Mínimo 8 caracteres. Mejor si no la usas en otros sitios.'],
        ['¡Listo, de vuelta en tu cuenta!', 'Entras directo y usas la contraseña nueva desde ahora.'],
      ]) +
      button('Ir a Descuentos Perú &rarr;', '{{ .SiteURL }}') +
      NOFUI('Ignora este correo: tu contraseña actual sigue igual y nadie puede cambiarla sin este código. No se lo des a nadie; el equipo nunca te lo pedirá por Telegram, WhatsApp ni llamada.'),
  },
  {
    file: 'reautenticacion.html',
    term: 'confirmando tu identidad',
    subject: 'Tu código de seguridad de Descuentos Perú',
    window: 'confirmar-identidad',
    preheader: 'Tu código de seguridad es {{ .Token }}. Vence en 1 hora.',
    footer: 'Recibiste este correo porque se pidió confirmar tu identidad en Descuentos Perú.',
    body:
      pill('CONFIRMAR IDENTIDAD') +
      title('Confirma que eres tú', 'Vas a hacer un cambio delicado en tu cuenta.<br>Escribe este código en la web para continuar.') +
      codeModule('// CÓDIGO DE SEGURIDAD', VENCE) +
      SEGURIDAD_CODIGO,
  },
  {
    file: 'seguridad-contrasena-cambiada.html',
    term: 'revisando tu contraseña',
    subject: 'Tu contraseña de Descuentos Perú cambió',
    window: 'aviso-de-seguridad',
    preheader: 'La contraseña de tu cuenta se acaba de cambiar.',
    footer: 'Recibiste este correo porque cambió la contraseña de tu cuenta de Descuentos Perú.',
    body:
      pill('AVISO DE SEGURIDAD', 'amber') +
      title('Tu contraseña cambió', 'La contraseña de tu cuenta de <strong style="color:#ffffff;">Descuentos Perú</strong> se acaba de cambiar.<br>Si fuiste tú, no tienes que hacer nada más.') +
      NOFUI('Tu cuenta podría estar en riesgo: vuelve a cambiar tu contraseña.') +
      button('Revisar mi cuenta &rarr;', SITIO),
  },
  {
    file: 'seguridad-correo-cambiado.html',
    term: 'revisando tu correo',
    subject: 'El correo de tu cuenta de Descuentos Perú cambió',
    window: 'aviso-de-seguridad',
    preheader: 'El correo de tu cuenta cambió de {{ .OldEmail }} a {{ .Email }}.',
    footer: 'Recibiste este correo porque cambió el correo de tu cuenta de Descuentos Perú.',
    body:
      pill('AVISO DE SEGURIDAD', 'amber') +
      title('El correo de tu cuenta cambió', 'Se cambió el correo asociado a tu cuenta de <strong style="color:#ffffff;">Descuentos Perú</strong>.') +
      infoCard([
        ['CORREO ANTERIOR', '{{ .OldEmail }}'],
        ['CORREO NUEVO', '{{ .Email }}', true],
      ]) +
      NOFUI('Alguien más pudo haber cambiado tu correo.') +
      button('Revisar mi cuenta &rarr;', SITIO),
  },
  {
    file: 'seguridad-telefono-cambiado.html',
    term: 'revisando tu teléfono',
    subject: 'El teléfono de tu cuenta de Descuentos Perú cambió',
    window: 'aviso-de-seguridad',
    preheader: 'El teléfono de tu cuenta cambió.',
    footer: 'Recibiste este correo porque cambió el teléfono de tu cuenta de Descuentos Perú.',
    body:
      pill('AVISO DE SEGURIDAD', 'amber') +
      title('El teléfono de tu cuenta cambió', 'Se cambió el número de teléfono asociado a tu cuenta de <strong style="color:#ffffff;">Descuentos Perú</strong>.') +
      infoCard([
        ['TELÉFONO ANTERIOR', '{{ .OldPhone }}'],
        ['TELÉFONO NUEVO', '{{ .Phone }}', true],
      ]) +
      NOFUI('Alguien más pudo haber cambiado tu teléfono.') +
      button('Revisar mi cuenta &rarr;', SITIO),
  },
  {
    file: 'seguridad-metodo-vinculado.html',
    term: 'revisando tu acceso',
    subject: 'Se vinculó un método de acceso a tu cuenta',
    window: 'aviso-de-seguridad',
    preheader: 'Se vinculó {{ .Provider }} como método de acceso a tu cuenta.',
    footer: 'Recibiste este correo porque se vinculó un método de acceso a tu cuenta de Descuentos Perú.',
    body:
      pill('AVISO DE SEGURIDAD', 'amber') +
      title('Nuevo método de acceso', 'Se vinculó un método para entrar a tu cuenta de <strong style="color:#ffffff;">Descuentos Perú</strong>.') +
      infoCard([['MÉTODO VINCULADO', '{{ .Provider }}', true]]) +
      NOFUI('Alguien más pudo haber vinculado ese método a tu cuenta.') +
      button('Revisar mi cuenta &rarr;', SITIO),
  },
  {
    file: 'seguridad-metodo-eliminado.html',
    term: 'revisando tu acceso',
    subject: 'Se quitó un método de acceso de tu cuenta',
    window: 'aviso-de-seguridad',
    preheader: 'Se quitó {{ .Provider }} como método de acceso a tu cuenta.',
    footer: 'Recibiste este correo porque se quitó un método de acceso de tu cuenta de Descuentos Perú.',
    body:
      pill('AVISO DE SEGURIDAD', 'amber') +
      title('Se quitó un método de acceso', 'Se quitó un método para entrar a tu cuenta de <strong style="color:#ffffff;">Descuentos Perú</strong>.') +
      infoCard([['MÉTODO QUITADO', '{{ .Provider }}', true]]) +
      NOFUI('Alguien más pudo haber quitado ese método de tu cuenta.') +
      button('Revisar mi cuenta &rarr;', SITIO),
  },
  {
    file: 'seguridad-mfa-agregado.html',
    term: 'revisando tu verificación',
    subject: 'Se agregó un método de verificación a tu cuenta',
    window: 'aviso-de-seguridad',
    preheader: 'Se agregó un método de verificación ({{ .FactorType }}) a tu cuenta.',
    footer: 'Recibiste este correo porque se agregó un método de verificación a tu cuenta de Descuentos Perú.',
    body:
      pill('AVISO DE SEGURIDAD', 'amber') +
      title('Nuevo método de verificación', 'Se agregó un método de verificación en dos pasos a tu cuenta de <strong style="color:#ffffff;">Descuentos Perú</strong>.') +
      infoCard([['MÉTODO AGREGADO', '{{ .FactorType }}', true]]) +
      NOFUI('Alguien más pudo haber agregado ese método a tu cuenta.') +
      button('Revisar mi cuenta &rarr;', SITIO),
  },
  {
    file: 'seguridad-mfa-eliminado.html',
    term: 'revisando tu verificación',
    subject: 'Se quitó un método de verificación de tu cuenta',
    window: 'aviso-de-seguridad',
    preheader: 'Se quitó un método de verificación ({{ .FactorType }}) de tu cuenta.',
    footer: 'Recibiste este correo porque se quitó un método de verificación de tu cuenta de Descuentos Perú.',
    body:
      pill('AVISO DE SEGURIDAD', 'amber') +
      title('Se quitó un método de verificación', 'Se quitó un método de verificación en dos pasos de tu cuenta de <strong style="color:#ffffff;">Descuentos Perú</strong>.') +
      infoCard([['MÉTODO QUITADO', '{{ .FactorType }}', true]]) +
      NOFUI('Alguien más pudo haber quitado ese método de tu cuenta.') +
      button('Revisar mi cuenta &rarr;', SITIO),
  },
];

const must = (s, from, to) => {
  if (!s.includes(from)) throw new Error('No encontré: ' + from);
  return s.replace(from, () => to);
};

for (const p of plantillas) {
  let head = HEAD;
  head = must(head, '<title>Tu código de Descuentos Perú</title>', `<title>${p.subject}</title>`);
  head = must(head, 'Tu código de confirmación es {{ .Token }}. Vence en 1 hora.', p.preheader);
  head = must(head, 'descuentos.peru ~ verificar', `descuentos.peru ~ ${p.window}`);
  head = must(head, '>verificando cuenta<', `>${p.term}<`);
  let tail = TAIL;
  tail = must(tail, 'Recibiste este correo porque alguien creó una cuenta con esta dirección en Descuentos Perú.', p.footer);
  const outDir = p.dir ? path.join(DIR, p.dir) : DIR;
  fs.mkdirSync(outDir, { recursive: true });
  fs.writeFileSync(path.join(outDir, p.file), head + p.body + '\n' + tail, 'utf8');
  console.log('OK', (p.dir ? p.dir + '/' : '') + p.file, '|', p.subject);
}
