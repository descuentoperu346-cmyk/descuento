/**
 * Genera la línea ADMIN_PIN_HASH para el .env o para las variables del hosting.
 * Uso:  npm run admin:hash -- "tu clave nueva de al menos 10 caracteres"
 */
import { hashPin } from '../server/passwords';

const pin = process.argv[2];

if (!pin || pin.length < 10) {
  console.error('Falta la clave o es muy corta (mínimo 10 caracteres).');
  console.error('Uso: npm run admin:hash -- "tu clave nueva"');
  process.exit(1);
}

console.log('\nCopia esta línea en tu .env (y en las variables del hosting):\n');
console.log(`ADMIN_PIN_HASH=${hashPin(pin)}\n`);
console.log('Solo se guarda el hash; la clave en sí no queda escrita en ningún archivo.');
console.log('Aviso: la clave quedó en el historial de tu terminal. Bórralo si el equipo no es solo tuyo.');
