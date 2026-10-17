export interface EvidenceFigure {
  id: string;
  figureNumber: string;
  title: string;
  caption: string;
  imageUrl: string;
  evidenceType: string;
  source: string;
}

export interface BallisticsCase {
  date: string;
  location: string;
  event: string;
  status?: string;
}

export interface SuspectEntry {
  name: string;
  alias?: string;
  role: string;
  status: string;
  statusType: 'detenido' | 'capturado' | 'fallecido' | 'fugitivo' | 'investigado';
}

export interface LeakedChatEntry {
  sender: string;
  recipient: string;
  date: string;
  quote: string;
  context: string;
  verified: boolean;
}

export interface LeakArticle {
  id: string;
  title: string;
  subtitle?: string;
  slug: string;
  category: 'filtraciones' | 'ciberseguridad' | 'investigaciones' | 'guias' | 'breaches' | 'darkweb' | 'bancos';
  categoryLabel: string;
  severity: 'critico' | 'alto' | 'medio' | 'informativo';
  date: string;
  readTime: string;
  author: string;
  authorRole: string;
  authorTelegram: string;
  imageUrl: string;
  summary: string;
  content: string[];
  compromisedData: string[];
  affectedScope: string;
  tags: string[];
  featured?: boolean;
  leakNumber?: number;
  dossierCode?: string;
  classificationNotice?: string;
  evidenceFigures?: EvidenceFigure[];
  ballisticsCases?: BallisticsCase[];
  suspects?: SuspectEntry[];
  leakedChats?: LeakedChatEntry[];
  openQuestions?: string[];
  isUpcoming?: boolean;
}

export const INITIAL_LEAKS_ARTICLES: LeakArticle[] = [
  // 1. LEAD DOSSIER: CHINA POLO (LEAK #1)
  {
    id: 'leak-china-polo',
    leakNumber: 1,
    title: 'China Polo: los chats, la ruta del dinero y las muertes que dejaron preguntas abiertas',
    subtitle: 'Un arma vinculada a otros cinco ataques, pagos por aplicaciones, conversaciones divulgadas por la prensa y una captura en Venezuela permiten reconstruir parte del asesinato de Susy Aponte Polo. La identidad de quien habría encargado el crimen sigue siendo la pieza decisiva.',
    slug: 'china-polo-chats-ruta-del-dinero-muertes-preguntas-abiertas',
    category: 'investigaciones',
    categoryLabel: 'LEAK #01 // INVESTIGACIÓN',
    severity: 'critico',
    date: '14 Octubre, 2026',
    readTime: '12 min de lectura',
    author: 'Unidad de Investigación DP',
    authorRole: 'Periodismo OSINT & Análisis Forense',
    authorTelegram: 'Tin9o',
    imageUrl: '/imagenes/china-polo-dossier.jpg',
    dossierCode: 'DOSSIER-DIVINCRI-ANC-2026-001',
    classificationNotice: 'Información contrastada hasta la noche del 14 de octubre de 2026, hora de Perú. Este artículo reconstruye fuentes públicas; las declaraciones y documentos difundidos por medios se atribuyen a sus respectivas publicaciones.',
    summary: 'Un arma vinculada a otros cinco ataques, pagos por aplicaciones, conversaciones divulgadas por la prensa y una captura en Venezuela permiten reconstruir parte del asesinato de Susy Aponte Polo. La identidad de quien habría encargado el crimen sigue siendo la pieza decisiva.',
    affectedScope: 'Crimen organizado, sicariato político y peritaje balístico DIRINCRI',
    compromisedData: [
      'Peritaje balístico Glock 9mm vinculada a 6 atentados',
      'Trazabilidad de pagos por S/ 80 y S/ 200 en billeteras digitales',
      'Oferta sicarial inicial de S/ 10.000 incrementada a S/ 15.000',
      'Conversaciones interceptadas: "Si no la matas tú, la mato yo"',
      'Captura en Guárico de Adrián Solís Ruiz alias "José"',
      'Fallecimiento documentado de Beángel Toro en Portuguesa',
      'Identidad en reserva del presunto contratante "Pure" o "Viejo"'
    ],
    tags: ['#ChinaPolo', '#Caraz', '#PeritajeBalistico', '#RutaDelDinero', '#Ancash', '#Dirincri', '#LeakExclusivo'],
    featured: true,
    evidenceFigures: [
      {
        id: 'fig-01',
        figureNumber: 'FIGURA 01: PERITAJE BALÍSTICO',
        title: 'Cotejo Microscópico DIRINCRI - Glock 9mm',
        caption: 'La pericia balística relacionó la pistola Glock recuperada en Caraz con otros cinco ataques violentos en Lima y provincias entre 2025 y 2026. El arma había sido denunciada como sustraída de la vivienda de un efectivo policial en Villa El Salvador en 2023.',
        imageUrl: '/imagenes/china-polo-balistica.jpg',
        evidenceType: 'Cotejo Pericial Balístico',
        source: 'Peritaje Balístico / América Noticias'
      },
      {
        id: 'fig-02',
        figureNumber: 'FIGURA 02: RUTA DEL DINERO',
        title: 'Trazabilidad de Billeteras Digitales y Pagos Logísticos',
        caption: 'Esquema de transferencias fraccionadas: pagos de 80 soles por noche de hospedaje en Caraz y giros de 200 soles reportados por televisión. Cuentas a nombre de Ronald José Toro Ardila con manejo atribuido a su media hermana Beángel Alexandra Toro.',
        imageUrl: '/imagenes/china-polo-ruta-dinero.jpg',
        evidenceType: 'Registros Financieros Digitales',
        source: 'Extractos Bancarios / ATV / Willax'
      },
      {
        id: 'fig-03',
        figureNumber: 'FIGURA 03: ESCENA DEL CRIMEN & HUIDA',
        title: 'Planimetría Forense en Caraz - Mercado La Explanada',
        caption: 'Reconstrucción de los desplazamientos previos, lugar del atentado durante la transmisión en vivo y la posterior persecución de 2 kilómetros en mototaxi frustrada por la suboficial PNP Kimberlly Tanta Leiva (de franco) y compañeros.',
        imageUrl: '/imagenes/china-polo-mapa-caraz.jpg',
        evidenceType: 'Planimetría Táctica y Croquis Policial',
        source: 'División de Investigación Criminal / La República'
      },
      {
        id: 'fig-04',
        figureNumber: 'FIGURA 04: EXPEDIENTE Y ANTECEDENTES',
        title: 'Dossier de Advertencias, Garantías y Relevos Policiales',
        caption: 'Expediente que reúne la solicitud de garantías de julio presentada por Susy Aponte Polo, la advertencia penitenciaria emitida el 10 de septiembre por el Gral. Víctor Revoredo y la carta atribuida a Yasmin La Rosa Ramos ("La Gringa").',
        imageUrl: '/imagenes/china-polo-dossier.jpg',
        evidenceType: 'Expediente Documental y Notarial',
        source: 'Defensoría del Pueblo / Fuentes Judiciales'
      }
    ],
    ballisticsCases: [
      {
        date: '8 de marzo de 2025',
        location: 'Surco, Lima',
        event: 'Ataque con dos heridos en las inmediaciones del paradero Ricardo Palma.',
        status: 'Cotejo balístico coincidente'
      },
      {
        date: '2 de mayo de 2026',
        location: 'Cañete, Lima Provincias',
        event: 'Ataque con arma de fuego contra Guillermo Sánchez Pimienta.',
        status: 'Mismo percutor identificado'
      },
      {
        date: '28 de mayo de 2026',
        location: 'Chorrillos, Lima',
        event: 'Asesinato por impacto de proyectil de Nelson José Contreras García.',
        status: 'Casquillos homologados'
      },
      {
        date: '29 de mayo de 2026',
        location: 'San Borja, Lima',
        event: 'Asesinato del agente de seguridad privada Claudio Humberto Pardo Chayayma.',
        status: 'Homologación balística DIRINCRI'
      },
      {
        date: '12 de julio de 2026',
        location: 'Los Olivos, Lima',
        event: 'Ataque armado contra el bus de la agrupación Estrellas de la Cumbia, con tres personas heridas.',
        status: 'Casquillos 9mm percutidos'
      },
      {
        date: '19 de septiembre de 2026',
        location: 'Caraz, Huaylas (Áncash)',
        event: 'Asesinato de la periodista y candidata al GORE Áncash Susy Aponte Polo en mitin proselitista.',
        status: 'Arma incautada al tirador'
      }
    ],
    suspects: [
      {
        name: 'Luis Iván Obispo Díaz',
        alias: 'Tirador intervenido',
        role: 'Presunto autor material del ataque. La prensa ha publicado declaraciones en las que admite haber recibido el encargo.',
        status: 'Prisión preventiva de 18 meses; trasladado al penal de Huaraz.',
        statusType: 'detenido'
      },
      {
        name: 'Ronald José Toro Ardila',
        alias: 'Titular de la cuenta',
        role: 'Presunto financista o apoyo logístico mediante cuentas y transferencias. Su defensa sostiene que prestó su cuenta a su media hermana y desconocía el fin.',
        status: 'Prisión preventiva de 18 meses; trasladado al penal de Huaraz.',
        statusType: 'detenido'
      },
      {
        name: 'Adrián José Solís Ruiz',
        alias: 'José',
        role: 'Presunto reclutador y coordinador directo del grupo sicarial. Contacto operativo de Obispo.',
        status: 'Capturado en Calabozo, estado de Guárico (Venezuela). Se coordinan declaraciones vía cooperación judicial.',
        statusType: 'capturado'
      },
      {
        name: 'Beángel Alexandra Toro',
        alias: 'Alexandra Toro Montezuma',
        role: 'Presunto apoyo logístico del grupo; señalada por administrar transferencias de hospedaje y logística. Pareja de Solís.',
        status: 'Fallecida en accidente de tránsito en el estado Portuguesa (Venezuela) junto a su menor hija.',
        statusType: 'fallecido'
      },
      {
        name: 'Ricardo Morocho',
        alias: 'Morocho',
        role: 'Señalado por la investigación como integrante del grupo y posible ejecutor alternativo ("Si no la matas tú, la mato yo").',
        status: 'No habido; sin confirmación fiable de captura en fuentes verificadas.',
        statusType: 'fugitivo'
      },
      {
        name: 'Sujeto sin identificar',
        alias: 'Pure / Viejo',
        role: 'Señalado en los testimonios preliminares como la persona que habría ordenado y financiado el crimen desde la cúspide.',
        status: 'Línea de investigación abierta; identidad final no acreditada.',
        statusType: 'investigado'
      }
    ],
    leakedChats: [
      {
        sender: 'Ricardo Morocho ("Morocho")',
        recipient: 'Luis Iván Obispo Díaz',
        date: 'Previo al ataque en Caraz',
        quote: 'Si no la matas tú, la mato yo',
        context: 'Presión interna divulgada por la prensa para forzar la ejecución del atentado tras frustrarse intentos previos.',
        verified: true
      },
      {
        sender: 'Andrea Gonzáles Monserrate',
        recipient: 'Luis Iván Obispo Díaz',
        date: 'Septiembre de 2026',
        quote: 'Reclamos insistentes sobre el envío de dinero y preguntas por la demora del encargo',
        context: 'Conversaciones publicadas por La República atribuidas a la pareja de Obispo sobre los pagos pendientes.',
        verified: true
      },
      {
        sender: 'Beángel Alexandra Toro',
        recipient: 'Familiares de Ronald Toro',
        date: '13 de octubre de 2026',
        quote: 'Afirmaciones reconociendo el manejo de la cuenta bancaria y exhibiendo capturas de pagos en Caraz por S/ 80',
        context: 'Material difundido por Willax previo a su entrega formal a la Fiscalía provincial.',
        verified: false
      }
    ],
    openQuestions: [
      '¿Quién es realmente "Pure" o "Viejo"? ¿El alias identifica al contratante final o a un intermediario de la red sicarial?',
      '¿De dónde salió el dinero? ¿Quién aportó los fondos antes de que circularan por las cuentas de Ronald Toro y Beángel Toro?',
      '¿Qué revelará Adrián Solís en sus declaraciones? ¿Permitirá su testimonio identificar a quien encargó el ataque tras su captura en Venezuela?',
      '¿Quiénes son realmente "Morocho" y "Gocha"? ¿Las diferentes descripciones corresponden a personas distintas o a confusiones de testimonios?',
      '¿Qué falló en la coordinación de la protección policial tras las alertas penitenciarias advertidas el 10 de septiembre por el Gral. Víctor Revoredo?',
      '¿Qué revelarán las pericias técnicas de los teléfonos y registros íntegros, más allá de los fragmentos divulgados por la prensa?'
    ],
    content: [
      'La novedad más reciente cambia una parte importante del caso: Adrián José Solís Ruiz, señalado como presunto coordinador del asesinato de "La China" Polo, está vivo y fue detenido en Venezuela. La República informó el 14 de octubre que su captura ocurrió el día 9 en Calabozo, estado de Guárico. Su detención podría permitir avanzar hacia la persona que contrató al grupo. En la información pública revisada, esa persona sigue apareciendo principalmente detrás de un alias: "Pure" o "Viejo".',
      'La investigación también incluye una muerte que sí está documentada: la de una mujer señalada como integrante del grupo que acompañó al presunto ejecutor. Falleció en un accidente de tránsito en Venezuela junto con su hija. Sin embargo, las noticias sobre ese accidente, la fuga de su pareja y otras personas fallecidas han terminado mezclándose. Separar esas historias resulta indispensable para entender qué ocurrió.',
      'Susy Aponte Polo era periodista y candidata al Gobierno Regional de Áncash por Socios por Áncash. Fue asesinada el 19 de septiembre de 2026, durante una actividad proselitista en las inmediaciones del mercado La Explanada, en Caraz. El ataque ocurrió mientras concedía una entrevista que se transmitía en directo. La Defensoría del Pueblo confirmó ese mismo día el asesinato y reportó inicialmente cinco personas heridas.',
      'La grabación del ataque hizo visible el crimen. La reconstrucción posterior comenzó a revelar los desplazamientos previos, las personas que acompañaron al sospechoso y las cuentas utilizadas para cubrir gastos.',
      'Una testigo, Ana Armijos Julca, declaró que estaba a pocos metros de Polo y reconoció al hombre que disparó. También resultó herida. Después del ataque, el sospechoso Luis Iván Obispo Díaz, que había recibido disparos durante su huida, intentó escapar en una mototaxi. La suboficial Kimberlly Tanta Leiva, que estaba de franco, lo observó, lo siguió y avisó a sus compañeros. Según su testimonio publicado por La República, la persecución se prolongó aproximadamente dos kilómetros antes de que otros agentes lo capturaran.',
      'Los indicios publicados describen un seguimiento previo de la víctima. En declaraciones atribuidas a Obispo, el grupo intentó encontrar una oportunidad para atacarla en Nuevo Chimbote y siguió sus desplazamientos hacia Huaraz y Caraz. La presencia de seguridad habría frustrado intentos anteriores. También se habrían utilizado las publicaciones y transmisiones de la candidata para conocer sus movimientos. Son detalles procedentes de la versión del detenido, que necesitan contrastarse con registros y otras pruebas.',
      'Las declaraciones de las recepcionistas del alojamiento de Caraz aportan una referencia más concreta: cuatro personas llegaron el 16 de septiembre, permanecieron tres noches y salieron el día del asesinato, poco después del mediodía. El hospedaje costaba 80 soles por noche y los pagos se relacionaron con una cuenta a nombre de Ronald Toro. Estos testimonios permiten contrastar parte de la narración del detenido con personas ajenas al grupo.',
      'La cifra de 15.000 soles necesita una precisión: corresponde al monto que, según las declaraciones publicadas, se habría ofrecido al ejecutor. Una cobertura de la audiencia judicial señaló que la oferta inicial habría sido de 10.000 soles y después aumentó. Eso no demuestra que se pagara íntegramente ni que fuera el presupuesto total de la operación. Traslados, alojamiento, comunicaciones y otras personas podían representar gastos adicionales.',
      'Obispo habría identificado a un hombre conocido como "José", posteriormente relacionado con Adrián Solís Ruiz, como su contacto para el encargo. En esa cadena aparece "Pure" o "Viejo": según la versión publicada, José le habría dicho que esa persona pagaba. Obispo no ofreció una identificación comprobable del supuesto contratante final. La referencia permite formular una línea de investigación; por sí sola no permite atribuir el crimen a alguien concreto.',
      'Las conversaciones divulgadas por la prensa muestran, además, presiones para ejecutar el ataque. La República publicó mensajes atribuidos a "Ricardo Morocho" o "Morocho", entre ellos: "Si no la matas tú, la mato yo". La cobertura lo presenta como otro integrante del grupo y posible ejecutor alternativo. También describe comunicaciones cercanas al momento del crimen y coordinaciones posteriores. En las fuentes revisadas no encontré una confirmación fiable de su captura ni una identificación completa que permita ir más allá del nombre o alias publicado.',
      'Otra conversación difundida corresponde a Andrea Gonzáles Monserrate, identificada como pareja de Obispo. La República publicó mensajes atribuidos a ella que reclamaban dinero y preguntaban por la demora del encargo. Su aparición en esos intercambios merece investigación, pero la cobertura consultada no permite afirmar que exista una condena ni establecer por sí sola su responsabilidad penal.',
      'ATV añadió un movimiento específico: una supuesta transferencia de 200 soles, el 18 de septiembre, de Beángel Toro a Andrea. Ese dato, tal como fue divulgado, puede contribuir a reconstruir relaciones y movimientos económicos. No acredita el pago completo de los 15.000 soles ni demuestra por sí mismo cuál era el conocimiento de cada receptora sobre el destino del dinero.',
      'La ruta del dinero conduce también a Ronald José Toro Ardila, detenido en Lima y señalado por la investigación como presunto financista o responsable logístico. Su defensa sostiene una versión distinta: habría permitido que su media hermana utilizara su cuenta y no habría conocido el propósito criminal de las operaciones. La República recogió su negativa a conocer al ejecutor y su explicación sobre el uso de la cuenta. La diferencia es central: identificar al titular de una cuenta permite seguir transferencias, pero todavía hay que establecer quién la operaba, quién aportaba los fondos y qué sabía cada participante.',
      'Uno de los hallazgos más recientes son las conversaciones atribuidas a Beángel Toro con sus familiares. Willax informó el 13 de octubre que, después de la detención de Ronald, ella habría reconocido que manejaba la cuenta utilizada para distintos gastos, mientras negaba haber salido de Lima. Según la publicación, compartió capturas de movimientos entre el 16 y el 19 de septiembre, incluido un pago de 80 soles por hospedaje en Caraz. La noticia también recogió la interpretación del abogado de Ronald, Eduardo Medina Almonte, favorable a su defendido.',
      'Hay una diferencia importante entre ese material y una pericia judicial concluida: la propia nota de Willax anunciaba que las conversaciones y registros serían entregados formalmente a la Fiscalía. Por ello, corresponde tratarlos como material difundido por un medio y por personas interesadas en el caso, pendiente de la valoración y autenticación que procedan. La publicación de capturas no sustituye esa comprobación.',
      'Otro nombre incompleto es "Gocha" o "Gotcha". Las versiones recogidas por la prensa no coinciden: Ronald la habría descrito como una peruana llamada Geraldine, vinculada al Callao; Obispo habló de una venezolana que vendía comida en Bayóvar. Esa discrepancia impide asegurar que ambos se refieran a la misma persona. Tampoco permite completar su identidad a partir de semejanzas de nombres o apodos.',
      'El arma abre una investigación que excede Caraz. América Noticias informó que una pericia balística relacionó la Glock de nueve milímetros recuperada en el caso con otros cinco ataques. Según esa reconstrucción, había sido robada de la vivienda de un policía en Villa El Salvador en 2023.',
      'La conexión publicada es balística: relaciona el arma con los hechos. No demuestra que todos tuvieran el mismo ejecutor o autor intelectual, ni que el propietario al que se la robaron participara en ellos.',
      'Antes del crimen, Polo había dejado advertencias. Willax difundió una solicitud de garantías de julio en la que la periodista señalaba a Juan Lázaro Calderón Altamirano, descrito como expolicía y familiar, como una persona de la que temía una agresión. El mismo medio recogió su rechazo a esas acusaciones y su afirmación de que respondían a motivaciones políticas. La existencia de la denuncia acredita que Polo expresó ese temor; no prueba que Calderón haya encargado el asesinato.',
      'También se publicó que el 10 de septiembre el general Víctor Revoredo le habría advertido sobre amenazas procedentes de tres establecimientos penitenciarios. Esa información ayuda a entender por qué su seguridad era una preocupación anterior al ataque y por qué su muerte provocó cuestionamientos sobre las medidas de protección.',
      'En este punto conviven declaraciones que parecen contradictorias, aunque se refieren a situaciones diferentes. El mando policial informó que Polo había contado con acompañamiento en Chimbote, incluso la noche del 18 de septiembre. La subprefecta de Huaylas, Sheila Herrera Pablo, sostuvo que el partido no había solicitado garantías para la actividad específica de Caraz. Una afirmación no elimina la otra: recibir protección en una ciudad y tramitar garantías para un acto en otra son hechos distintos.',
      'La Defensoría del Pueblo reclamó medidas urgentes y expresó preocupación por la falta de protección efectiva. La cuestión que sigue abierta es concreta: qué amenazas conocía cada autoridad, qué medidas se dispusieron y cómo se coordinó la protección durante los desplazamientos de la candidata.',
      'Las hipótesis políticas aparecieron desde los primeros días. En la cobertura se mencionaron las denuncias y reportajes que Polo preparaba sobre autoridades locales. La República recogió referencias a Walter Soto, alcalde provincial del Santa, y a Ladislao Cruz Villachica, "Lalo Villa", alcalde de Nuevo Chimbote. También publicó sus descargos: Soto rechazó que Calderón fuera su asesor o amigo, y Cruz Villachica negó relación con el asesinato. Que una autoridad fuera objeto de una investigación periodística no establece su participación en el crimen.',
      'Una versión adicional surgió de un audio difundido por Beto a Saber y recogido por Expreso: el objetivo inicial habría sido Brenda Campos, una fiscalizadora ciudadana, y posteriormente el grupo habría dirigido el ataque contra Polo. Campos habló de denuncias por presuntas irregularidades municipales y de sus solicitudes de protección. El elemento central de esa historia, sin embargo, era una grabación atribuida a una fuente anónima. No encontré una resolución fiscal o judicial pública que confirme ese supuesto cambio de objetivo.',
      'En medio de esos señalamientos, Rosa Bartra, abogada de Walter Soto, rechazó en una entrevista con Exitosa que su patrocinado tuviera vinculación con el asesinato. Ese descargo debe acompañar la acusación: el audio difundido no permite presentar al alcalde como autor intelectual probado.',
      'Otra pieza divulgada es una carta atribuida a Yasmin La Rosa Ramos, "La Gringa". ATV informó que el documento, fechado el 25 de octubre de 2025, contenía su afirmación de que colaboraba como agente especial de la Policía y mencionaba a cinco oficiales. El reportaje también recordó una grabación difundida por Polo de una reunión con Óscar Arriola, durante la cual habría ingresado una llamada de La Rosa Ramos.',
      'ATV relacionó además el ataque al bus de Estrellas de la Cumbia con la denuncia de la agrupación sobre extorsiones de La Jauría Nueva Generación. Son conexiones que justifican contrastar documentos, comunicaciones y testimonios. La carta, la llamada y la coincidencia del arma no acreditan por sí solas que La Rosa, Arriola o esa organización ordenaran matar a Polo. Tampoco he autenticado independientemente la carta ni la condición que su autora afirmaba tener.',
      'Existe otro episodio relevante en los días previos al crimen. Según una reconstrucción de Día D, recogida por Áncash Noticias, Polo había coordinado encontrarse con Luis Miguel Llanos el domingo 20 de septiembre para explorar una futura reunión con la Fiscalía de la Nación y compartir información que consideraba importante. Conviene conservar la distinción: la noticia describe una gestión para conseguir una reunión, no una cita oficial ya confirmada con el fiscal de la Nación. Tampoco demuestra que ese material fuera el móvil del asesinato.',
      'El cambio de puesto de Víctor Revoredo, conocido poco después del ataque, alimentó más sospechas. El ministro del Interior, César Astudillo, negó relación entre el relevo y el crimen y sostuvo que los cambios habían sido preparados antes. La proximidad temporal explica las preguntas públicas, pero no prueba una maniobra para facilitar el asesinato o encubrirlo.',
      'La muerte en Venezuela corresponde a Beángel Alexandra Toro, identificada también en distintas noticias como Alexandra Toro Montezuma. Era media hermana de Ronald y pareja de Adrián Solís. La investigación la situaba entre las personas que acompañaron al grupo y le atribuía funciones de apoyo. RPP informó que murió en un accidente de tránsito en el estado Portuguesa, junto con su hija menor, y que el fallecimiento fue comunicado durante una audiencia del caso.',
      'La fecha que recogen RPP y otras reconstrucciones posteriores es el 30 de septiembre. También existen diferencias entre publicaciones sobre la escritura de su nombre y la edad de la niña. Esas inconsistencias aconsejan evitar precisiones que las fuentes no sostienen de manera uniforme. La menor fue una víctima del accidente; no una integrante de la organización investigada.',
      'La muerte de una persona que podía aportar información sobre los contactos del grupo originó la sospecha de que hubiera sido silenciada. Panamericana informó que el juez Miguel Ángel Dueñas planteó que esa posibilidad debía esclarecerse. Se trata de una hipótesis, no de una conclusión pericial. En las fuentes revisadas no aparece una prueba pública de sabotaje del vehículo o de un homicidio encubierto como accidente.',
      'Adrián Solís viajaba con ella y sobrevivió. La República informó que recibió atención hospitalaria y después abandonó el establecimiento mientras era buscado. Su posterior captura permite corregir la versión de que ambos integrantes de la pareja habrían muerto.',
      'Hay otra muerte que pertenece a una historia diferente: Olimpia Pachas Osorio, de 72 años, herida durante el ataque en Caraz, falleció posteriormente en un hospital de Huaraz. RPP informó el deceso el 30 de septiembre. Era una víctima de la balacera, no una sospechosa. Su muerte amplía las consecuencias humanas del ataque más allá de la periodista.',
      'También aparece Edwin Iván Cotrina Quijano, "Cojo Giordano" o "Cojo Jordano". Según la advertencia de Polo difundida por Willax, él le habría hablado de una amenaza contra su vida. Pero Cotrina fue asesinado en marzo de 2025, mucho antes del crimen de Caraz. Su muerte no debe incorporarse a una supuesta secuencia de cómplices eliminados después del asesinato de la periodista. La relación que se publica procede del relato de Polo sobre una advertencia anterior.',
      'Entre los detalles menos comentados aparece el registro de la muerte en Sinadef. La República informó que, en la consulta examinada en septiembre, el tipo de muerte figuraba como "no se conoce/ignorado", pese a que el asesinato era investigado penalmente. La observación resulta relevante para la calidad de las estadísticas, pero no demuestra por sí sola un encubrimiento. Además, describe una consulta de ese momento: no he verificado que el registro continúe igual actualmente.',
      'La cobertura también recordó que Polo afrontaba acusaciones en el caso conocido como "Los Elegantes de Áncash", relacionado con presuntas irregularidades en licencias de conducir. Se difundió un pedido fiscal de pena y ella había rechazado las imputaciones. Ese antecedente forma parte de su trayectoria pública, pero no equivale a una condena ni establece el motivo de su asesinato. Las fuentes consultadas no permiten unir ambos casos como una relación probada.',
      'La captura de un presunto coordinador puede acercar esas respuestas. Pero para identificar a quien ordenó matar a China Polo hace falta demostrar la conexión entre el encargo, el dinero y las personas que tomaron las decisiones. Los nombres mencionados en denuncias previas, los contactos políticos o una conversación difundida no sustituyen esa prueba.'
    ]
  },

  // 2. EXPEDIENTE LEAK #02: CORRUPCIÓN CONGRESO & AMÉRICA TV (PRÓXIMA LIBERACIÓN)
  {
    id: 'leak-congreso-america-tv',
    leakNumber: 2,
    title: 'Nuevo caso de corrupción liberado del Congreso: pagos a América TV para callar coimas en el Congreso',
    subtitle: 'Comprobantes de transferencias bancarias, facturas de pauta clandestina y chats entre operadores parlamentarios y directivos mediáticos para silenciar investigaciones por cobro de coimas en el Congreso de la República.',
    slug: 'nuevo-caso-corrupcion-congreso-pagos-america-tv-callar-coimas',
    category: 'filtraciones',
    categoryLabel: 'PRÓXIMO LEAK #02 // CONGRESO',
    severity: 'critico',
    date: 'Próxima Liberación (Octubre 2026)',
    readTime: '15 min de lectura',
    author: 'Unidad de Investigación DP',
    authorRole: 'Periodismo Forense & Inteligencia OSINT',
    authorTelegram: 'Tin9o',
    imageUrl: '/imagenes/leak-congreso-america-tv.jpg',
    dossierCode: 'DOSSIER-CONG-CORRUPCION-2026-002',
    classificationNotice: 'EXPEDIENTE EN FASE FINAL DE DESCLASIFICACIÓN PÚBLICA Y COTEJO DE FIRMAS DIGITALES.',
    summary: 'Filtración documentaria sobre una red de blindaje mediático: legisladores y operadores de comisiones canalizaron fondos públicos y aportes ilícitos hacia emisarios vinculados a América TV con el fin expreso de vetar reportajes sobre cobro de coimas en el Congreso.',
    affectedScope: 'Congreso de la República, medios de comunicación corporativos y comisiones fiscalizadoras',
    compromisedData: [
      'Extractos de transferencias bancarias fraccionadas a operadores de prensa',
      'Facturas de publicidad institucional simulada para encubrir pagos de sobornos',
      'Registros de chat de WhatsApp coordinando la censura de coberturas en vivo',
      'Audios de reuniones reservadas sobre distribución de fondos en comisiones ordinarias',
      'Nómina de legisladores aportantes del fondo de blindaje mediático',
      'Registros de visitas a instalaciones televisivas no reportados en agenda oficial'
    ],
    tags: ['#CongresoPeru', '#AmericaTV', '#CoimasCongreso', '#PautaClandestina', '#BlindajeMediatico', '#LeakExclusivo', '#Corrupcion'],
    featured: true,
    isUpcoming: true,
    evidenceFigures: [
      {
        id: 'cong-01',
        figureNumber: 'FIGURA 01: MESA DIRECTIVA',
        title: 'Operadores de Mesa Directiva y Enlaces de Pauta',
        caption: 'Coordinación de transferencias y asignación presupuestal de pauta publicitaria clandestina del Congreso.',
        imageUrl: '/imagenes/caso-congreso/figura-01.jpg',
        evidenceType: 'Expediente Administrativo',
        source: 'Unidad de Investigación DP'
      },
      {
        id: 'cong-02',
        figureNumber: 'FIGURA 02: ÓRGANOS DE CONTROL',
        title: 'Vínculos con Órganos de Control y Fiscalías',
        caption: 'Seguimiento a carpetas fiscales y comisiones investigadoras sobre cobro de comisiones y blindaje mediático.',
        imageUrl: '/imagenes/caso-congreso/figura-02.jpg',
        evidenceType: 'Registros Fiscales',
        source: 'Unidad de Investigación DP'
      },
      {
        id: 'cong-03',
        figureNumber: 'FIGURA 03: ANTECEDENTE HISTÓRICO',
        title: 'Alberto Fujimori - Control de Líneas Editoriales',
        caption: 'Precedente histórico de control de coberturas televisivas (Caso Vladivideos / América TV).',
        imageUrl: '/imagenes/caso-congreso/figura-03.jpg',
        evidenceType: 'Precedente Judicial',
        source: 'Archivo Histórico Judicial'
      },
      {
        id: 'cong-04',
        figureNumber: 'FIGURA 04: COMISIONES PARLAMENTARIAS',
        title: 'Dirección Parlamentaria y Comisiones Ordinarias',
        caption: 'Gestión de comisiones de fiscalización y distribución de montos encubiertos en publicidad institucional.',
        imageUrl: '/imagenes/caso-congreso/figura-04.jpg',
        evidenceType: 'Contratos y Facturas',
        source: 'Unidad de Investigación DP'
      },
      {
        id: 'cong-05',
        figureNumber: 'FIGURA 05: EJECUTIVO ANTERIOR',
        title: 'Martín Vizcarra - Presupuestos de Publicidad Estatal',
        caption: 'Investigaciones por direccionamiento de gasto publicitario estatal y contrataciones en el Ejecutivo.',
        imageUrl: '/imagenes/caso-congreso/figura-05.jpg',
        evidenceType: 'Carpetas Preliminares',
        source: 'Unidad de Investigación DP'
      },
      {
        id: 'cong-06',
        figureNumber: 'FIGURA 06: PODER EJECUTIVO',
        title: 'Dina Boluarte - Decretos de Urgencia y Pauta Oficial',
        caption: 'Decretos de urgencia y partidas de imagen institucional vinculadas a pactos con bancadas congresales.',
        imageUrl: '/imagenes/caso-congreso/figura-06.jpg',
        evidenceType: 'Partidas Presupuestarias',
        source: 'Unidad de Investigación DP'
      },
      {
        id: 'cong-07',
        figureNumber: 'FIGURA 07: EJECUTIVO ANTERIOR',
        title: 'Pedro Castillo - Gestiones y Licitaciones Regionales',
        caption: 'Expedientes por irregularidades en comisiones, licitaciones regionales y reclamos por pauta periodística.',
        imageUrl: '/imagenes/caso-congreso/figura-07.jpg',
        evidenceType: 'Declaraciones Fiscales',
        source: 'Unidad de Investigación DP'
      },
      {
        id: 'cong-08',
        figureNumber: 'FIGURA 08: ANTECEDENTE HISTÓRICO',
        title: 'Alan García - Pauta Oficial y Coberturas Dominicales',
        caption: 'Patrones históricos de asignación de publicidad estatal y condicionamiento de reportajes dominicales.',
        imageUrl: '/imagenes/caso-congreso/figura-08.jpg',
        evidenceType: 'Precedente Documentado',
        source: 'Archivo Histórico Judicial'
      },
      {
        id: 'cong-09',
        figureNumber: 'FIGURA 09: FUERZA POPULAR',
        title: 'Keiko Fujimori - Coordinación de Bancada Parlamentaria',
        caption: 'Dirección política de la bancada mayoritaria en comisiones de presupuesto y alianzas de veto mediático.',
        imageUrl: '/imagenes/caso-congreso/figura-09.jpg',
        evidenceType: 'Registros de Bancada',
        source: 'Unidad de Investigación DP'
      }
    ],
    content: [
      'La Unidad de Investigación de Descuentos Perú se encuentra finalizando el peritaje y cotejo forense del expediente "Operación Silencio en el Parlamento", una exhaustiva recopilación de registros bancarios, contratos de servicios de comunicación y mensajes interceptados que revelan pagos encubiertos destinados a evitar que salieran a la luz esquemas de cobro de coimas en el Congreso.',
      'De acuerdo con las evidencias en custodia, diversos legisladores que integraban comisiones de presupuesto y fiscalización habrían acordado derivaciones de dinero hacia operadores de medios de televisión de alcance nacional —con especial énfasis en América TV— para bloquear o suavizar reportajes de investigación sobre adjudicaciones irregulares en gobiernos regionales.',
      'El esquema operaba mediante contratos de "asesoría en comunicación estratégica" y pauta publicitaria no devengada, triangulados a través de pequeñas agencias creadas con meses de anticipación. De esta forma, el dinero salía formalmente amparado bajo conceptos de imagen institucional mientras en la práctica condicionaba la línea editorial.',
      'El informe final incluirá los comprobantes íntegros, los números de operación bancaria, las transcripciones forenses y el análisis balístico y digital de los metadatos correspondientes. La desclasificación total se llevará a cabo en la fecha fijada por el cronómetro de la plataforma.'
    ]
  },

  // 3. Featured Lead Hero Article (Anterior)
  {
    id: 'leak-hero-db',
    title: 'Qué hacer cuando se expone una base de datos',
    slug: 'que-hacer-cuando-se-expone-una-base-de-datos',
    category: 'investigaciones',
    categoryLabel: 'ANÁLISIS',
    severity: 'alto',
    date: '14 Octubre, 2026',
    readTime: '7 min de lectura',
    author: 'Tin9o (@Tin9o)',
    authorRole: 'Especialista en Inteligencia OSINT & Brechas',
    authorTelegram: 'Tin9o',
    imageUrl: '/imagenes/banner-filtraciones.png',
    summary: 'Protocolo inmediato y exhaustivo de respuesta ante incidentes de exfiltración de bases de datos masivas: verificación de integridad, contención de credenciales y auditoría de accesos no autorizados.',
    affectedScope: 'Bases de datos SQL/NoSQL & credenciales expuestas',
    compromisedData: [
      'Usuarios y contraseñas hasheadas/planas',
      'DNI y datos personales sensibles',
      'Historial de transacciones y compras',
      'Tokens de API y llaves de servicio'
    ],
    tags: ['#BaseDeDatos', '#DataBreach', '#ForenseDigital', '#RespuestaAIncidentes', '#OSINT'],
    featured: false,
    content: [
      'Cuando una base de datos corporativa o de un servicio en línea queda expuesta en internet —ya sea por un error en la configuración de permisos (como buckets S3 públicos o clústeres de Elasticsearch desprotegidos) o por una inyección SQL maliciosa— el tiempo de reacción es el factor más determinante para mitigar el impacto.',
      'El primer paso consiste en validar la veracidad y frescura de la filtración. En los foros de la dark web abundan los "combos" reciclados de filtraciones antiguas combinadas bajo nuevos nombres comerciales. Mediante técnicas OSINT y cotejo de marcas de tiempo (timestamps), es posible determinar si la fuga corresponde a eventos recientes o a listas consolidadas del pasado.',
      'El segundo paso innegociable es la revocación forzosa de sesiones activas y la rotación inmediata de secretos y llaves de servicio (API keys, certificados SSL y credenciales de base de datos). Los atacantes suelen buscar tokens de acceso con privilegios elevados para garantizar persistencia silenciosa en la infraestructura.',
      'Para los usuarios finales afectados, la recomendación principal es cambiar de inmediato las contraseñas en todos los servicios donde se haya utilizado la misma combinación de correo y clave, activar autenticación de dos factores (2FA) mediante aplicaciones TOTP (evitando SMS) y monitorizar posibles intentos de suplantación o phishing dirigido.'
    ]
  },

  // 3. Últimas publicaciones - 1
  {
    id: 'leak-fake-alert',
    title: 'Cómo reconocer una alerta falsa',
    slug: 'como-reconocer-una-alerta-falsa',
    category: 'guias',
    categoryLabel: 'GUÍA',
    severity: 'medio',
    date: '13 Octubre, 2026',
    readTime: '4 min',
    author: 'Redacción DP',
    authorRole: 'Ciberseguridad & Prevención',
    authorTelegram: 'DESCUENTOSPER2',
    imageUrl: '/imagenes/banner-phishing.png',
    summary: 'Identifica las tácticas de alarmismo psicológico y phishing con supuestas alertas rojas que buscan forzar clics desesperados o la descarga de troyanos.',
    affectedScope: 'Navegación web y notificaciones push fraudulentas',
    compromisedData: [
      'Ingeniería social de alta urgencia',
      'Ventanas emergentes falsas con logos de antivirus',
      'Phishing para captura de credenciales'
    ],
    tags: ['#FakeAlert', '#Scam', '#Phishing', '#EducacionDigital'],
    featured: false,
    content: [
      'Las alertas falsas son uno de los vectores más comunes de engaño digital. Suelen presentarse como ventanas emergentes en el navegador con sirenas animadas, logos apócrifos de antivirus reconocidos o avisos judiciales que aseguran que tu equipo ha sido infectado con decenas de virus.',
      'El objetivo detrás de estas pantallas es generar angustia y apresurar a la víctima para que llame a números de soporte falsos, compre licencias fraudulentas o instale programas de control remoto tipo AnyDesk o TeamViewer que entregan el control total del equipo al estafador.',
      'Cómo identificar una alerta falsa: (1) Revisa la barra de direcciones; si la alerta aparece en una página web desconocida y no desde la aplicación nativa de tu antivirus instalado, es 100% falsa. (2) Desconfía de temporizadores regresivos que amenazan con bloquear tu disco duro. (3) Nunca llames a números telefónicos incluidos en mensajes emergentes.'
    ]
  },

  // 4. Últimas publicaciones - 2
  {
    id: 'leak-report-reveal',
    title: 'Qué revela un reporte de filtración',
    slug: 'que-revela-un-reporte-de-filtracion',
    category: 'filtraciones',
    categoryLabel: 'ANÁLISIS',
    severity: 'alto',
    date: '12 Octubre, 2026',
    readTime: '6 min',
    author: 'Tin9o (@Tin9o)',
    authorRole: 'Especialista en Inteligencia OSINT & Brechas',
    authorTelegram: 'Tin9o',
    imageUrl: '/imagenes/card-investigacion.png',
    summary: 'Aprende a interpretar hashes criptográficos, metadatos de exfiltración, volcados SQL y campos comprometidos para medir el verdadero alcance de una filtración.',
    affectedScope: 'Auditoría y análisis técnico de volcados de datos',
    compromisedData: [
      'Cotejo de registros cruzados',
      'Volcados SQL y colecciones JSON',
      'Hashes MD5, SHA-1 y bcrypt expuestos'
    ],
    tags: ['#DataBreach', '#HashCracking', '#AnalisisTecnico', '#OSINT'],
    featured: false,
    content: [
      'Un reporte de filtración auténtico contiene elementos técnicos específicos que permiten certificar su procedencia. Entre ellos destacan los volcados de esquemas relacionales (tablas DDL), los identificadores únicos autoincrementales y los metadatos de exportación propios de motores como MySQL, PostgreSQL u Oracle.',
      'Para los analistas de seguridad, el examen de los campos comprometidos revela si los atacantes obtuvieron hashes con sal (salts) o contraseñas en texto claro. Los algoritmos débiles como MD5 o SHA-1 son vulnerables a tablas arcoíris en minutos, mientras que bcrypt o Argon2 ofrecen mayor resistencia temporal.',
      'Desmitificar los anuncios de filtraciones exige prudencia técnica: muchos actores maliciosos inflan las cifras agregando datos sintéticos o duplicando registros para exigir rescates elevados a empresas desprevenidas.'
    ]
  },

  // 5. Últimas publicaciones - 3
  {
    id: 'leak-three-steps',
    title: '3 pasos ante un incidente de seguridad',
    slug: '3-pasos-ante-un-incidente-de-seguridad',
    category: 'ciberseguridad',
    categoryLabel: 'PROTECCIÓN',
    severity: 'alto',
    date: '11 Octubre, 2026',
    readTime: '5 min',
    author: 'Redacción DP',
    authorRole: 'Respuesta Rápida a Incidentes',
    authorTelegram: 'DESCUENTOSPER2',
    imageUrl: '/imagenes/leak-shield-lock.jpg',
    summary: 'Plan de acción en tres fases para aislar el equipo comprometido, preservar la evidencia forense y restaurar la operatividad sin perder datos.',
    affectedScope: 'Equipos endpoint, redes domésticas y cuentas críticas',
    compromisedData: [
      'Aislamiento de red inmediato',
      'Recolección de logs de memoria y procesos',
      'Cambio de credenciales maestras y restablecimiento'
    ],
    tags: ['#IncidentResponse', '#SeguridadDigital', '#PrimerosAuxiliosIT', '#Defensa'],
    featured: false,
    content: [
      'Ante la sospecha o confirmación de una intrusión en tu estación de trabajo o servidor, la improvisación es el peor enemigo. Los primeros sesenta minutos tras el incidente definen si el impacto será contenido o catastrófico.',
      'Paso 1: Desconexión física inmediata de la red (cable Ethernet y Wi-Fi). No apagues el equipo abruptamente para evitar la pérdida de evidencia volátil en la memoria RAM que servirá al peritaje forense.',
      'Paso 2: Desde un dispositivo alternativo seguro y no comprometido, procede al cambio de credenciales de acceso a correos principales, servicios en la nube y banca electrónica.',
      'Paso 3: Realiza un escaneo exhaustivo con herramientas antimalware reconocidas en modo sin conexión y reinstala el sistema operativo si se detectó la ejecución de rootkits o troyanos de acceso remoto (RAT).'
    ]
  },

  // 6. Explora la revista - 1
  {
    id: 'leak-understand-exposure',
    title: 'Cómo entender el nivel de exposición de tus datos',
    slug: 'como-entender-el-nivel-de-exposicion-de-tus-datos',
    category: 'filtraciones',
    categoryLabel: 'FILTRACIONES',
    severity: 'medio',
    date: '10 Octubre, 2026',
    readTime: '5 min de lectura',
    author: 'Tin9o (@Tin9o)',
    authorRole: 'Especialista en Inteligencia OSINT & Brechas',
    authorTelegram: 'Tin9o',
    imageUrl: '/imagenes/leak-doc-analysis.jpg',
    summary: 'Conoce los distintos niveles de riesgo según el tipo de datos expuestos: desde el correo electrónico público hasta el DNI, celular y huellas biométricas.',
    affectedScope: 'Perfiles de usuario y bases de datos personales peruanas',
    compromisedData: [
      'Nivel 1: Datos de contacto públicos (correo, alias)',
      'Nivel 2: Documentos oficiales (DNI, fecha de nacimiento)',
      'Nivel 3: Credenciales de acceso y tokens',
      'Nivel 4: Datos financieros y biométricos'
    ],
    tags: ['#NivelDeRiesgo', '#ExposicionDeDatos', '#Privacidad', '#DNI'],
    featured: false,
    content: [
      'No todas las filtraciones conllevan el mismo nivel de peligro para el usuario común. Clasificar la severidad del incidente es clave para priorizar los esfuerzos defensivos sin caer en pánico.',
      'Una exposición de solo correos y nombres (Nivel 1) incrementa el spam y el phishing genérico, pero no compromete de inmediato tus fondos ni tus cuentas si cuentas con contraseñas robustas.',
      'Por el contrario, la filtración simultánea de DNI, teléfono, dirección residencial y clave hasheada (Niveles 2 y 3) habilita ataques de SIM swapping, fraude por suplantación en operadores de telefonía y apertura no autorizada de créditos financieros.',
      'En Perú, la recurrente circulación de padrones con información del Reniec y Sunat exige a los ciudadanos verificar periódicamente su reporte en centrales de riesgo para detectar a tiempo créditos no solicitados.'
    ]
  },

  // 7. Explora la revista - 2
  {
    id: 'leak-suspicious-email',
    title: 'Señales de un correo sospechoso',
    slug: 'senales-de-un-correo-sospechoso',
    category: 'ciberseguridad',
    categoryLabel: 'CIBERSEGURIDAD',
    severity: 'medio',
    date: '09 Octubre, 2026',
    readTime: '6 min de lectura',
    author: 'Redacción DP',
    authorRole: 'Especialista Anti-Phishing',
    authorTelegram: 'DESCUENTOSPER2',
    imageUrl: '/imagenes/banner-escudo.png',
    summary: 'Encabezados fraudulentos, spoofing de dominios bancarios y lenguaje de coacción psicológica: radiografía de una campaña de phishing moderna.',
    affectedScope: 'Bandejas de correo corporativo y personal',
    compromisedData: [
      'Credenciales de correo electrónico',
      'Archivos adjuntos maliciosos (ISO, ZIP, PDF)',
      'Enlaces señuelo a plataformas clonadas'
    ],
    tags: ['#Phishing', '#EmailSecurity', '#IngenieriaSocial', '#Ciberdefensa'],
    featured: false,
    content: [
      'El phishing sigue siendo el punto de entrada de más del 80% de los ciberataques contra personas y organizaciones. Aunque los filtros antispam modernos bloquean millones de mensajes cada día, las campañas dirigidas utilizan técnicas cada vez más sofisticadas.',
      'Entre las principales señales de alarma se encuentran: discrepancias entre el nombre visible del remitente y la dirección real del correo electrónico en el encabezado, solicitudes urgentes de pago o verificación bajo amenaza de bloqueo inmediato, y enlaces que redirigen a dominios tipográficamente similares (typosquatting).',
      'Adicionalmente, el adjunto de archivos comprimidos (.zip, .7z) o imágenes de disco (.iso) suele ocultar ejecutables maliciosos o troyanos tipo stealer listos para capturar contraseñas al primer clic.',
      'Regla de oro: Si recibes una notificación de tu banco o proveedor de servicios solicitando verificar tus datos, nunca hagas clic en el enlace del correo; accede siempre escribiendo manualmente la dirección web oficial en tu navegador.'
    ]
  },

  // 8. Explora la revista - 3
  {
    id: 'leak-protect-identity',
    title: 'Protege tu identidad digital',
    slug: 'protege-tu-identidad-digital',
    category: 'guias',
    categoryLabel: 'GUÍAS',
    severity: 'informativo',
    date: '08 Octubre, 2026',
    readTime: '5 min de lectura',
    author: 'Tin9o (@Tin9o)',
    authorRole: 'Protección & Privacidad OSINT',
    authorTelegram: 'Tin9o',
    imageUrl: '/imagenes/llama-investigacion.png',
    summary: 'Pasos para auditar tu huella digital, eliminar perfiles olvidados y reducir las probabilidades de suplantación de identidad en línea.',
    affectedScope: 'Huella digital y privacidad personal',
    compromisedData: [
      'Números de DNI y documentos de identidad',
      'Correos secundarios y contraseñas olvidadas',
      'Números de teléfono históricos y direcciones'
    ],
    tags: ['#Privacidad', '#IdentidadDigital', '#OSINT', '#ProteccionDeDatos'],
    featured: false,
    content: [
      'Cada servicio en el que te registraste en los últimos diez años almacena una porción de tu vida digital. Muchas de esas plataformas quedan en el abandono por parte de sus desarrolladores, convirtiéndose en blancos fáciles para filtraciones masivas.',
      'Auditar tu huella digital consiste en rastrear en qué plataformas tu correo electrónico figura en brechas conocidas (utilizando monitores reconocidos como Have I Been Pwned) y proceder a dar de baja aquellas cuentas que ya no utilizas.',
      'Asimismo, minimiza la información pública que compartes en redes sociales: fechas exactas de cumpleaños, números telefónicos y ubicaciones en tiempo real son insumos que los atacantes recopilan para responder preguntas de seguridad bancaria o personalizar ataques de ingeniería social.',
      'Tu identidad digital es tu activo más valioso en la era conectada; protegerla de manera preventiva es mucho más sencillo y económico que resolver un caso de fraude o suplantación consumado.'
    ]
  }
];

export const LEAKS_ARTICLES_STORAGE_KEY = 'dp_leaks_articles_v7';

export function getStoredLeakArticles(): LeakArticle[] {
  try {
    // Purge old stale caches so updated media and URLs immediately propagate
    if (typeof window !== 'undefined' && window.localStorage) {
      ['dp_leaks_articles', 'dp_leaks_articles_v2', 'dp_leaks_articles_v3', 'dp_leaks_articles_v4', 'dp_leaks_articles_v5', 'dp_leaks_articles_v6'].forEach(k => {
        try { localStorage.removeItem(k); } catch {}
      });
    }

    const raw = localStorage.getItem(LEAKS_ARTICLES_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        // Guarantee that initial baseline articles always have valid current imageUrl and media
        const initialMap = new Map(INITIAL_LEAKS_ARTICLES.map(a => [a.id, a]));
        const merged: LeakArticle[] = parsed.map(item => {
          const init = initialMap.get(item.id);
          if (init) {
            return {
              ...init,
              ...item,
              imageUrl: init.imageUrl, // ALWAYS ensure image URL is updated to latest valid file
              evidenceFigures: init.evidenceFigures || item.evidenceFigures,
              ballisticsCases: init.ballisticsCases || item.ballisticsCases,
              suspects: init.suspects || item.suspects,
              leakedChats: init.leakedChats || item.leakedChats,
              openQuestions: init.openQuestions || item.openQuestions
            };
          }
          return item;
        });

        for (const init of INITIAL_LEAKS_ARTICLES) {
          if (!merged.some(m => m.id === init.id)) {
            merged.push(init);
          }
        }
        return merged;
      }
    }
  } catch (e) {
    console.warn('Error reading stored leak articles, using initial data', e);
  }
  return INITIAL_LEAKS_ARTICLES;
}

export function saveStoredLeakArticles(articles: LeakArticle[]): void {
  try {
    localStorage.setItem(LEAKS_ARTICLES_STORAGE_KEY, JSON.stringify(articles));
  } catch (e) {
    console.error('Error saving leak articles to localStorage', e);
  }
}
