import React from 'react';
import { CONTACT_EMAIL, LegalDocument, type LegalSection } from '../components/LegalDocument';
import { LEGAL_UPDATED } from '../lib/legal';

interface PrivacyPageProps {
  onNavigateToContact: () => void;
  onNavigateToTerms: () => void;
}

// Texto de la política tal como lo entregó el titular. El "Anexo" del final describe lo que la web hace con las cuentas,
// el ingreso con Google y los datos técnicos (Google lo exige para aprobar el ingreso con Google).
const sections: LegalSection[] = [
  {
    title: '1. Introducción y contexto',
    blocks: [
      'La presente Política de Privacidad describe cómo Descuentos Peru (en adelante, "el Sitio") recopila, usa, conserva y protege la información de las personas que navegan, consultan o compran a través de descuentos-peru.vercel.app.',
      'Descuentos Peru es un proyecto digital dedicado a la oferta y venta de una variedad de productos físicos y digitales a precios de descuento, comercializados tanto dentro del propio Sitio como a través de canales de mensajería (WhatsApp y Telegram). Al ser un proyecto operado íntegramente en línea, toda la relación con el usuario se desarrolla en el entorno digital.',
      'El usuario que ingresa al Sitio acepta esta Política de Privacidad en su totalidad. Si no está de acuerdo, debe abstenerse de navegar y de proporcionar sus datos.'
    ]
  },
  {
    title: '2. Identificación del responsable',
    blocks: [
      'A efectos de la Ley N.º 29733, Ley de Protección de Datos Personales, y su Reglamento aprobado por D.S. N.º 003-2013-JUS, se informa:',
      [
        'Denominación: Descuentos Peru (nombre comercial, sin constituir persona jurídica).',
        'Sitio: descuentos-peru.vercel.app',
        `Correo de contacto: ${CONTACT_EMAIL}`,
        'Ámbito territorial: Perú.'
      ]
    ]
  },
  {
    title: '3. Ámbito de aplicación',
    blocks: [
      'Esta Política se aplica a todos los datos personales que el usuario proporcione o que se generen durante:',
      [
        'La navegación por el Sitio.',
        'La consulta o cotización de productos.',
        'La coordinación y concreción de una compra por WhatsApp o Telegram.',
        'La atención posterior a la venta (consultas, reportes, reclamos).'
      ]
    ]
  },
  {
    title: '4. Definiciones',
    blocks: [
      [
        'Datos personales: toda información que identifique o haga identificable a una persona.',
        'Titular de los datos: el usuario/cliente a quien corresponden los datos.',
        'Tratamiento: cualquier operación sobre los datos (recogida, uso, conservación, etc.).',
        'Consentimiento: manifestación libre, previa, expresa e informada del titular.'
      ]
    ]
  },
  {
    title: '5. Datos que recogemos',
    blocks: [
      'Descuentos Peru se caracteriza por recoger solo los datos estrictamente necesarios para concretar la venta:',
      [
        'Datos de identificación mínima: nombre, apodo o alias con el que el cliente se presenta.',
        'Datos de contacto: número de WhatsApp y/o usuario de Telegram; correo electrónico si el cliente lo brinda.',
        'Datos de la operación: producto solicitado, fecha, monto y referencia del pedido.',
        'Datos de pago: medio utilizado y número o código de operación.'
      ],
      'No recogemos datos sensibles (salud, biometría, etc.) ni más información que la descrita, salvo que el usuario la aporte voluntariamente.'
    ]
  },
  {
    title: '6. Cómo recogemos los datos',
    blocks: [
      'Los datos se obtienen cuando el usuario:',
      ['Rellena un formulario o pulsa un botón de contacto en el Sitio.', 'Escribe por WhatsApp o Telegram para consultar o comprar.', 'Envía su comprobante de pago.', 'Realiza un reporte o reclamo.']
    ]
  },
  {
    title: '7. Finalidad del tratamiento',
    blocks: [
      'Los datos se utilizan exclusivamente para:',
      [
        'Gestionar la compra y coordinar la entrega del producto.',
        'Comunicarnos con el cliente por los canales elegidos.',
        'Verificar y confirmar el pago.',
        'Atender consultas, reportes, post-venta y reclamos.',
        'Llevar un registro interno de las operaciones.'
      ]
    ]
  },
  {
    title: '8. Base legal y consentimiento',
    blocks: [
      'El tratamiento se sustenta en el consentimiento previo, informado, expreso e inequívoco del titular. Al enviar sus datos por el Sitio, WhatsApp o Telegram, el usuario otorga dicho consentimiento conforme a la Ley N.º 29733.'
    ]
  },
  {
    title: '9. Confidencialidad de las ventas y no divulgación',
    blocks: [
      'El usuario reconoce y acepta plenamente que:',
      [
        'Ningún contenido de las ventas será divulgado.',
        'El cliente no declarará ni revelará públicamente qué se vende en el Sitio.',
        'La única referencia permitida serán los leaks (reportajes) y los reportes.'
      ],
      'En consecuencia, el detalle de lo comercializado se considera información reservada del Sitio, salvo que el titular decida hacerlo público.'
    ]
  },
  {
    title: '10. Formas de pago y confidencialidad de los códigos QR',
    blocks: [
      'El cliente podrá pagar por cualquier medio habilitado, abonando al código QR que el Sitio le proporcione. Los nombres, titulares o datos asociados a dichos códigos QR no podrán ser divulgados ni replicados por el cliente sin autorización del Sitio. La sola recepción del QR no genera relación alguna con la entidad emisora del medio de pago.'
    ]
  },
  {
    title: '11. Todo lo visto y comprable no es denunciable ni demandable',
    blocks: [
      'El usuario acepta que todo lo que ve en el Sitio y todo lo que pueda comprar a través de él no podrá ser objeto de denuncia ni de demanda contra Descuentos Peru, en tanto se ajuste a lo aquí descrito y a los Términos y Condiciones.',
      'Fundamento legal: arts. 1354, 1355, 1361 y 1362 del Código Civil (libertad de contratar y buena fe), art. 1542 del Código Civil (transacción), art. 62 de la Constitución Política del Perú y, en lo no pactado, la Ley N.º 29571, Código de Protección y Defensa del Consumidor.'
    ]
  },
  {
    title: '12. Conservación de los datos',
    blocks: [
      'Los datos se conservarán mientras subsista la relación comercial y hasta por el plazo que exija la normativa aplicable. Cumplido el plazo, se eliminarán de forma segura.'
    ]
  },
  {
    title: '13. Comunicación a terceros',
    blocks: [
      'Los datos podrán comunicarse únicamente a proveedores necesarios para la operación (medios de pago, servicios de mensajería, hosting). No vendemos ni cedemos datos a terceros con fines publicitarios ajenos.'
    ]
  },
  {
    title: '14. Transferencia internacional',
    blocks: [
      'Como el Sitio se aloja en una plataforma en la nube, los datos podrían procesarse en servidores ubicados fuera del Perú, aplicándose garantías razonables de protección.'
    ]
  },
  {
    title: '15. Derechos del usuario (ARCO)',
    blocks: [
      `El titular puede ejercer sus derechos de Acceso, Rectificación, Cancelación y Oposición escribiendo a ${CONTACT_EMAIL}, adjuntando identificación. También puede acudir a la Autoridad Nacional de Protección de Datos Personales (www.minjus.gob.pe).`
    ]
  },
  {
    title: '16. Seguridad',
    blocks: ['Aplicamos medidas técnicas y organizativas razonables para proteger los datos frente a accesos, pérdidas o alteraciones no autorizadas.']
  },
  {
    title: '17. Cookies',
    blocks: [
      'El Sitio puede usar cookies técnicas y de análisis necesarias para su funcionamiento. El usuario puede gestionarlas desde su navegador.'
    ]
  },
  {
    title: '18. Menores de edad',
    blocks: ['El Sitio puede ser usado por menores, siempre que cuenten con el respaldo de un adulto para concretar pagos.']
  },
  {
    title: '19. Cambios en la Política',
    blocks: ['Podemos actualizar esta Política. La versión vigente estará siempre publicada en el Sitio.']
  },
  {
    title: '20. Aceptación',
    blocks: ['Navegar, consultar o comprar en descuentos-peru.vercel.app implica la aceptación plena de esta Política de Privacidad.']
  },
  {
    title: '21. Contacto',
    blocks: [`Para cualquier duda: ${CONTACT_EMAIL}`]
  },
  {
    title: 'Anexo. Cuentas de usuario, ingreso con Google y datos técnicos del Sitio',
    blocks: [
      'Este anexo explica, con detalle, qué hace el Sitio cuando una persona crea una cuenta, entra con Google o navega. Complementa los puntos 5, 7, 13 y 14.',
      [
        'Si creas una cuenta: guardamos tu nombre, tu correo y, si quieres, tu teléfono. Si usas contraseña, esta se guarda protegida (no en texto legible): nadie del equipo puede verla.',
        'Si entras con Google: solo recibimos tu correo y tu nombre. No recibimos tu contraseña de Google, tu foto ni tus contactos. Usamos esos dos datos únicamente para crear y mantener tu cuenta en el Sitio y para identificarte cuando vuelves a entrar. No los usamos para publicidad ni los compartimos con terceros con ese fin.',
        'Verificación de seguridad: al crear una cuenta o ingresar puede aparecer una verificación de Cloudflare (Turnstile) para comprobar que quien entra es una persona y no un programa automático.',
        'Visitas y clics: contamos cuántas personas ven el Sitio y qué productos abren. No guardamos tu dirección IP ni los datos de tu navegador, y no contamos a quien tiene activado «No rastrear» (DNT o GPC).',
        'Servicios que hacen funcionar el Sitio: Supabase (guarda las cuentas y el catálogo), Vercel (publica el Sitio) y Google (solo si eliges «Continuar con Google»).',
        'Almacenamiento del navegador: se usa solo para mantener tu sesión iniciada y recordar preferencias. No usamos cookies de publicidad.',
        'Constancia de aceptación: cada vez que marcas las casillas de los Términos y Condiciones, la Política de Privacidad y la no divulgación para crear tu cuenta o ingresar, guardamos la fecha, la versión de los textos que aceptaste y cómo entraste (cuenta nueva, correo, código o Google), ligadas a tu cuenta. Solo sirve para demostrar esa aceptación.',
        'Libro de Reclamaciones: si presentas un reclamo o una queja, guardamos los datos de la hoja (tu nombre, documento, domicilio, teléfono y correo, lo que compraste, el detalle de tu reclamo y nuestra respuesta) solo para atenderla y para cumplir la ley, que nos obliga a conservar el Libro. No necesitas una cuenta para presentarla. Estos datos no se usan para publicidad.',
        `Borrado de tus datos: puedes pedir que eliminemos tu cuenta y los datos asociados escribiendo a ${CONTACT_EMAIL}, salvo lo que debamos conservar por una compra que siga dentro del plazo de reporte y las hojas del Libro de Reclamaciones, que la ley obliga a conservar.`
      ]
    ]
  }
];

export const PrivacyPage: React.FC<PrivacyPageProps> = ({ onNavigateToContact, onNavigateToTerms }) => (
  <LegalDocument
    title="Política de Privacidad"
    updated={LEGAL_UPDATED}
    contactEmail={CONTACT_EMAIL}
    sections={sections}
    onNavigateToContact={onNavigateToContact}
    related={{ href: '/terminos', label: 'Ver los Términos y Condiciones', onNavigate: onNavigateToTerms }}
  />
);
