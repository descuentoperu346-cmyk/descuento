import React from 'react';
import { CONTACT_EMAIL, LegalDocument, type LegalSection } from '../components/LegalDocument';
import { LEGAL_UPDATED } from '../lib/legal';

interface TermsPageProps {
  onNavigateToContact: () => void;
  onNavigateToPrivacy: () => void;
}

/**
 * Dirección del Libro de Reclamaciones virtual (cláusula 16). Mientras esté vacía, la página lo dice con honestidad
 * ("enlace por publicar") en lugar de mostrar un enlace roto. Cuando exista, pega aquí la dirección completa.
 */
export const LIBRO_RECLAMACIONES_URL = 'https://descuentos-peru.vercel.app/reclamaciones';

// Texto de los términos tal como lo entregó el titular.
const sections: LegalSection[] = [
  {
    title: '1. Introducción y contexto',
    blocks: [
      'Los presentes Términos y Condiciones regulan el acceso, la navegación y el uso del Sitio Descuentos Peru (descuentos-peru.vercel.app), así como las condiciones de compra de los productos ofrecidos y la relación entre el Sitio y el usuario/cliente.',
      'Descuentos Peru es un proyecto digital que ofrece una variedad de productos físicos y digitales a precios de descuento, comercializados por la web y por canales de mensajería (WhatsApp y Telegram). El usuario, al ingresar o comprar, acepta íntegramente estos Términos.'
    ]
  },
  {
    title: '2. Identificación del titular',
    blocks: [
      [
        'Denominación: Descuentos Peru (nombre comercial, sin constituir persona jurídica).',
        'Sitio: descuentos-peru.vercel.app',
        `Correo: ${CONTACT_EMAIL}`,
        'Ámbito: Perú (Lima).'
      ]
    ]
  },
  {
    title: '3. Objeto y ámbito de aplicación',
    blocks: [
      'Estos Términos tienen por objeto regular el uso del Sitio y las compras realizadas a través de él o de sus canales asociados. Se aplican a todo visitante y a todo cliente.'
    ]
  },
  {
    title: '4. Aceptación',
    blocks: ['El uso del Sitio implica la aceptación plena y sin reservas de estos Términos. Quien no los acepte debe abstenerse de usar y comprar en el Sitio.']
  },
  {
    title: '5. Capacidad',
    blocks: ['El usuario declara ser mayor de edad o contar con respaldo de un adulto, y tener capacidad para contratar.']
  },
  {
    title: '6. Descripción del servicio y de los productos',
    blocks: [
      'El Sitio ofrece variedad de productos físicos y digitales, sujetos a disponibilidad de stock y a cambios sin previo aviso. Las imágenes, descripciones y características son referenciales y pueden presentar variaciones mínimas.'
    ]
  },
  {
    title: '7. Naturaleza del Sitio',
    blocks: [
      'Descuentos Peru es un comerciante independiente. No es fabricante, importador, distribuidor oficial ni representante de marca alguna. No se garantiza que los productos cuenten con garantía oficial del fabricante ni que sean idénticos a versiones oficiales o de tienda.'
    ]
  },
  {
    title: '8. Origen lícito',
    blocks: ['El Sitio declara comercializar productos de origen lícito, adquiridos de buena fe.']
  },
  {
    title: '9. Proceso de compra',
    blocks: [
      'La compra puede iniciarse desde la web o coordinarse por WhatsApp/Telegram. El pedido queda confirmado solo cuando el pago haya sido verificado. Hasta ese momento, el producto no queda reservado.'
    ]
  },
  {
    title: '10. Precios y pagos',
    blocks: [
      'Los precios se expresan en soles (S/) y pueden variar sin aviso. Se aceptan los medios de pago habilitados, abonando al código QR que el Sitio proporcione. Los nombres, titulares o datos asociados a dichos códigos QR no podrán ser divulgados ni replicados por el cliente sin autorización del Sitio.'
    ]
  },
  {
    title: '11. Entrega',
    blocks: [
      'La entrega se coordina por los canales de contacto indicados, según la naturaleza del producto (físico o digital). Los plazos son estimados y pueden variar por factores ajenos al Sitio.'
    ]
  },
  {
    title: '12. Confidencialidad y no divulgación',
    blocks: [
      'El cliente acepta plenamente que:',
      ['Ningún contenido de las ventas será divulgado.', 'No declarará ni revelará públicamente qué se vende en el Sitio.', 'Lo único que podrá referir serán los leaks (reportajes) y los reportes.']
    ]
  },
  {
    title: '13. No denuncia ni demanda',
    blocks: [
      'Las partes convienen que todo lo que se ve en el Sitio y todo lo que se pueda comprar a través de él no podrá ser objeto de denuncia ni de demanda contra Descuentos Peru, canalizándose las observaciones por reportes y las excepciones por leaks (reportajes).',
      'Fundamento legal: arts. 1354, 1355, 1361 y 1362 del Código Civil, art. 1542 del Código Civil, art. 62 de la Constitución Política del Perú y la Ley N.º 29571.'
    ]
  },
  {
    title: '14. Plazo de reporte',
    blocks: [
      'El cliente tiene cinco (5) días calendario desde la entrega (o desde la recepción del enlace/archivo, en productos digitales) para reportar cualquier disconformidad. Vencido el plazo, el producto se tiene por aceptado.'
    ]
  },
  {
    title: '15. Garantía y devoluciones',
    blocks: [
      'No se aceptan devoluciones. Las observaciones se canalizan por reporte dentro del plazo de cinco (5) días del punto 14. Los productos se ofrecen y entregan en el estado en que se ofrecen, sin más garantías que las expresamente pactadas.'
    ]
  },
  {
    title: '16. Libro de Reclamaciones',
    blocks: [
      LIBRO_RECLAMACIONES_URL ? (
        <p>
          El Sitio cuenta con Libro de Reclamaciones virtual, disponible en{' '}
          <a href={LIBRO_RECLAMACIONES_URL} target="_blank" rel="noopener noreferrer" className="font-semibold text-[#00ff88] hover:underline">
            {LIBRO_RECLAMACIONES_URL}
            <span className="sr-only"> (se abre en una pestaña nueva)</span>
          </a>
          , conforme a la Ley N.º 29571.
        </p>
      ) : (
        'El Sitio cuenta con Libro de Reclamaciones virtual, disponible en (enlace por publicar), conforme a la Ley N.º 29571.'
      )
    ]
  },
  {
    title: '17. Uso permitido y prohibido',
    blocks: [
      'El usuario se compromete a usar el Sitio conforme a ley y buena fe. Queda prohibido: extraer datos de forma masiva, introducir virus, suplantar identidad, o divulgar el contenido de las ventas incumpliendo el punto 12.'
    ]
  },
  {
    title: '18. Propiedad intelectual',
    blocks: [
      'Los contenidos del Sitio (textos, imágenes, logos, diseño) son de su titular o de terceros licenciantes y no pueden reproducirse sin autorización.'
    ]
  },
  {
    title: '19. Limitación de responsabilidad',
    blocks: [
      'La responsabilidad del Sitio se limita al valor pagado por el producto. No responde por daños indirectos, lucro cesante, el uso que el cliente dé a los productos, ni reclamos de terceros (marcas, autores, fabricantes), salvo dolo o negligencia grave.'
    ]
  },
  {
    title: '20. Naturaleza de las obligaciones',
    blocks: ['Las obligaciones del Sitio son civiles y comerciales; no asume responsabilidad penal salvo dolo o negligencia grave.']
  },
  {
    title: '21. Aceptación electrónica',
    blocks: ['La aceptación por medios electrónicos tiene plena validez conforme a la Ley N.º 27269 (Ley de Firmas y Certificados Digitales).']
  },
  {
    title: '22. Conciliación previa',
    blocks: ['Antes de cualquier acción, las partes procurarán conciliación extrajudicial conforme a la Ley N.º 26872.']
  },
  {
    title: '23. Duración y modificación',
    blocks: ['Estos Términos rigen mientras el Sitio esté operativo. El titular puede modificarlos publicando la versión vigente.']
  },
  {
    title: '24. Nulidad parcial',
    blocks: ['Si alguna cláusula resultara nula, el resto seguirá vigente.']
  },
  {
    title: '25. Ley aplicable y jurisdicción',
    blocks: [
      'Se rigen por la legislación peruana. Las partes se someten a los juzgados y tribunales de Lima, con renuncia a cualquier otro fuero (arts. 25–26 del Código Procesal Civil), sin perjuicio de las facultades de INDECOPI.'
    ]
  },
  {
    title: '26. Aceptación final',
    blocks: ['Comprar o navegar en descuentos-peru.vercel.app implica la aceptación plena de estos Términos y Condiciones.']
  },
  {
    title: '27. Contacto',
    blocks: [CONTACT_EMAIL]
  }
];

export const TermsPage: React.FC<TermsPageProps> = ({ onNavigateToContact, onNavigateToPrivacy }) => (
  <LegalDocument
    title="Términos y Condiciones"
    updated={LEGAL_UPDATED}
    contactEmail={CONTACT_EMAIL}
    sections={sections}
    onNavigateToContact={onNavigateToContact}
    related={{ href: '/privacidad', label: 'Ver la Política de Privacidad', onNavigate: onNavigateToPrivacy }}
  />
);
