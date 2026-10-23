/**
 * Versión de los textos legales (Política de Privacidad y Términos y Condiciones).
 * Es la fecha de «Última actualización» de las dos páginas: la web la guarda junto a la constancia de aceptación
 * (tabla consent_log, SQL 14) para saber QUÉ texto aceptó cada persona.
 * Cuando cambies el texto de las páginas, cambia las dos constantes.
 */
export const LEGAL_VERSION = '2026-10-22';
export const LEGAL_UPDATED = '22 de octubre de 2026';

/**
 * Datos del proveedor que salen impresos en la hoja del Libro de Reclamaciones (la ley los exige: nombre, RUC y domicilio).
 * Completa `ruc` y `address` con los datos reales: mientras estén vacíos la hoja no los muestra y el panel avisa que faltan.
 */
export const PROVIDER = {
  brand: 'Descuentos Peru',
  holder: 'DescuentosPeru2',
  ruc: '',
  address: ''
};
