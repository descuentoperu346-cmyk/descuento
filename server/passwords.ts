import crypto from 'crypto';

/**
 * Hash de PIN/contraseña con scrypt (incluido en Node, sin dependencias).
 * Formato guardado: scrypt:<sal en hex>:<hash en hex>
 * Se usa ":" y no "$" para que ningún panel de variables de entorno lo interprete.
 */
const KEY_LENGTH = 32;
const PREFIX = 'scrypt';

export function hashPin(pin: string): string {
  const salt = crypto.randomBytes(16);
  const hash = crypto.scryptSync(pin, salt, KEY_LENGTH);
  return `${PREFIX}:${salt.toString('hex')}:${hash.toString('hex')}`;
}

export function verifyPin(pin: string, stored: string): boolean {
  const parts = stored.split(':');
  if (parts.length !== 3 || parts[0] !== PREFIX) return false;
  try {
    const salt = Buffer.from(parts[1], 'hex');
    const expected = Buffer.from(parts[2], 'hex');
    if (salt.length === 0 || expected.length !== KEY_LENGTH) return false;
    const actual = crypto.scryptSync(pin, salt, KEY_LENGTH);
    return crypto.timingSafeEqual(actual, expected);
  } catch {
    return false;
  }
}
