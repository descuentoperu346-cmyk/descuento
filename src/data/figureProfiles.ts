/**
 * Historial documentado de las figuras del expediente "Caso Congreso - América TV".
 *
 * Reglas editoriales:
 *  - Solo se incluyen hechos con fuente pública enlazada (prensa o resoluciones).
 *  - Cada caso indica su estado procesal actual; una investigación no es una condena.
 *  - Datos verificados con búsquedas en octubre de 2026. Revisar antes de publicar cambios.
 */

export type CaseStatus =
  | 'condenado'
  | 'condena-apelada'
  | 'archivado'
  | 'en-investigacion'
  | 'suspendido'
  | 'sancion-politica'
  | 'fallecido';

export const CASE_STATUS_META: Record<CaseStatus, { label: string; tone: 'red' | 'amber' | 'green' | 'zinc' }> = {
  condenado: { label: 'Condenado', tone: 'red' },
  'condena-apelada': { label: 'Condena apelada', tone: 'red' },
  'en-investigacion': { label: 'En investigación', tone: 'amber' },
  suspendido: { label: 'Suspendido', tone: 'amber' },
  'sancion-politica': { label: 'Sanción del Congreso', tone: 'amber' },
  archivado: { label: 'Archivado', tone: 'green' },
  fallecido: { label: 'Falleció', tone: 'zinc' }
};

export interface ProfileSource {
  title: string;
  url: string;
}

export interface ProfileCase {
  name: string;
  status: CaseStatus;
  period?: string;
  summary: string;
  sources: ProfileSource[];
}

export interface FigureProfile {
  figureId: string;
  headline: string;
  /** Datos biográficos clave (registro público) */
  facts: { label: string; value: string }[];
  /** Hitos en orden cronológico */
  timeline: { date: string; text: string }[];
  /** Referencia biográfica general */
  bioSource: ProfileSource;
  currentStatus: { status: CaseStatus | 'sin-sentencia'; label: string };
  summary: string;
  cases: ProfileCase[];
  /** Lo que afirma este expediente y no tiene fuente pública enlazada */
  unverifiedClaims?: string[];
}

export const FIGURE_PROFILES: Record<string, FigureProfile> = {
  'cong-fig-09': {
    figureId: 'cong-fig-09',
    headline: 'Presidenta del Perú (2026–2031) · Fuerza Popular',
    facts: [
      { label: 'Nombre completo', value: 'Keiko Sofía Fujimori Higuchi' },
      { label: 'Nacimiento', value: '25 de mayo de 1975, Lima' },
      { label: 'Partido', value: 'Fuerza Popular (fundadora y lideresa)' },
      { label: 'Cargos', value: 'Primera dama (1994–2000), congresista (2006–2011), presidenta (2026–2031)' },
      { label: 'Candidaturas presidenciales', value: '2011, 2016, 2021 y 2026 (ganó solo la última)' },
      { label: 'Familiar', value: 'Hija del expresidente Alberto Fujimori' }
    ],
    timeline: [
      { date: '1994–2000', text: 'Asume funciones de primera dama durante el gobierno de su padre.' },
      { date: '2006', text: 'Es elegida congresista con la votación más alta de ese proceso.' },
      { date: '2011', text: 'Primera candidatura presidencial; pierde la segunda vuelta ante Ollanta Humala.' },
      { date: '2016', text: 'Pierde la segunda vuelta ante Pedro Pablo Kuczynski por un margen mínimo.' },
      { date: '2018–2019', text: 'Cumple prisión preventiva en dos oportunidades en el marco del caso Cócteles; recupera la libertad.' },
      { date: '2021', text: 'Pierde la segunda vuelta ante Pedro Castillo.' },
      { date: 'Oct. 2025', text: 'El Tribunal Constitucional anula lo actuado en el caso Cócteles.' },
      { date: 'Jun.–jul. 2026', text: 'Gana la segunda vuelta (50,135 %) y el JNE la proclama presidenta electa.' }
    ],
    bioSource: { title: 'Wikipedia: Keiko Fujimori', url: 'https://es.wikipedia.org/wiki/Keiko_Fujimori' },
    currentStatus: { status: 'archivado', label: 'Caso Cócteles archivado' },
    summary:
      'Lideró Fuerza Popular y fue investigada en el caso Cócteles por presunto lavado de activos y organización criminal. El proceso fue archivado definitivamente por el Poder Judicial en 2026, tras un fallo del Tribunal Constitucional.',
    cases: [
      {
        name: 'Caso Cócteles (aportes a campañas de Fuerza Popular)',
        status: 'archivado',
        period: 'TC oct. 2025 · archivo ejecutado ene. 2026 · apelación rechazada 16 jun. 2026',
        summary:
          'Proceso por presunto lavado de activos y organización criminal. En octubre de 2025 el Tribunal Constitucional declaró fundada su demanda y dejó sin efecto lo actuado desde las investigaciones preliminares, incluida la acusación fiscal de julio de 2025. En enero de 2026 el juzgado ejecutó el fallo y archivó el caso; el 16 de junio de 2026 la Sala de Apelaciones declaró infundada la apelación del Ministerio Público y le prohibió reactivar la misma matriz fáctica y jurídica.',
        sources: [
          {
            title: 'La República: Poder Judicial archiva definitivamente el caso Cócteles',
            url: 'https://larepublica.pe/politica/2026/06/16/poder-judicial-archiva-definitivamente-el-caso-cocteles-contra-keiko-fujimori-hnews-194928'
          },
          {
            title: 'El Peruano: TC declara fundada la demanda de Keiko Fujimori',
            url: 'https://elperuano.pe/noticia/281277-caso-cocteles-tc-declara-fundada-demanda-de-keiko-fujimori-lea-aqui-la-sentencia'
          },
          {
            title: 'Exitosa: Poder Judicial confirma archivamiento definitivo',
            url: 'https://www.exitosanoticias.pe/judiciales/caso-cocteles-poder-judicial-confirma-archivamiento-definitivo-proceso-investigaba-keiko-fujimori-otros-n177881'
          }
        ]
      },
      {
        name: 'Acusación fiscal y prisión preventiva (aportes de Odebrecht a la campaña de 2011)',
        status: 'archivado',
        period: '2018–2021 · luego anulado por el TC',
        summary:
          'En 2018 fue detenida y pasó 13 meses en prisión preventiva por presunto lavado de activos y aportes irregulares de campaña; salió tras una decisión del Tribunal Constitucional. En marzo de 2021 la Fiscalía presentó acusación formal contra ella y otros 41 implicados y pidió 30 años de cárcel. Sostenía que era cabecilla de una organización criminal dentro de Fuerza Popular y que recibió 1,2 millones de dólares de Odebrecht para su campaña de 2011. Ella siempre negó haber conocido esos aportes. Todo lo actuado fue anulado después por el TC (ver caso Cócteles).',
        sources: [
          { title: 'El Espectador: Fiscalía abre investigación por caso Odebrecht', url: 'https://www.elespectador.com/mundo/mas-paises/fiscalia-de-peru-abre-investigacion-a-keiko-fujimori-por-caso-odebrecht-article-710785/' },
          { title: 'El Comercio: cronología de su prisión preventiva', url: 'https://elcomercio.pe/politica/keiko-fujimori-camino-revision-prision-preventiva-cronologia-noticia-570769' },
          { title: 'BAE Negocios: detienen a Keiko Fujimori por lavado y aportes irregulares', url: 'https://www.baenegocios.com/amp/Detienen-a-Keiko-Fujimori-por-lavado-y-aportes-irregularesde-campana-20181010-0063/' }
        ]
      },
      {
        name: 'Fuerza Popular como persona jurídica en el proceso',
        status: 'archivado',
        period: 'Incorporada al proceso; archivado con el caso',
        summary:
          'Un juez incorporó al partido Fuerza Popular como persona jurídica al proceso penal, lo que según la Fiscalía podía permitir pedir su suspensión o disolución al final. Con el archivo definitivo del caso Cócteles, esa vía quedó sin efecto.',
        sources: [
          { title: 'NTN24: el partido de Keiko Fujimori también es investigado', url: 'https://www.ntn24.com//america-latina/peru/partido-opositor-keiko-fujimori-tambien-es-investigado-por-caso-odebrecht-113596' }
        ]
      },
      {
        name: 'Elección presidencial 2026',
        status: 'archivado',
        period: 'Segunda vuelta 7 jun. 2026 · proclamación JNE 3 jul. 2026',
        summary:
          'Ganó la segunda vuelta con 50,135 % de los votos válidos según la ONPE y fue proclamada presidenta electa por el JNE. No es un caso judicial: se incluye para contextualizar su cargo actual.',
        sources: [
          {
            title: 'Infobae: resultados ONPE al 100 %',
            url: 'https://www.infobae.com/peru/2026/06/23/resultados-onpe-en-vivo-a-poco-del-100-keiko-fujimori-y-roberto-sanchez-en-historica-disputa-electoral-en-peru/'
          },
          {
            title: 'Libero: JNE proclama los resultados oficiales',
            url: 'https://libero.pe/tiempoextra/2026/07/02/cuando-se-realizara-proclamacion-oficial-de-resultados-presidenciales-esto-confirmo-jne-keiko-fujimori-35716'
          }
        ]
      }
    ],
    unverifiedClaims: [
      'Este expediente afirma que dirigió la bancada mayoritaria en comisiones de presupuesto y alianzas de veto mediático. No se ha enlazado una fuente pública que respalde ese señalamiento.'
    ]
  },

  'cong-fig-03': {
    figureId: 'cong-fig-03',
    headline: 'Expresidente (1990–2000) · fallecido en 2024',
    facts: [
      { label: 'Nombre completo', value: 'Alberto Kenya Fujimori Inomoto' },
      { label: 'Nacimiento', value: '28 de julio de 1938, Lima' },
      { label: 'Fallecimiento', value: '11 de septiembre de 2024, Lima (86 años)' },
      { label: 'Cargo', value: 'Presidente del Perú (1990–2000)' },
      { label: 'Condena principal', value: '25 años de prisión (2009)' },
      { label: 'Familiar', value: 'Padre de Keiko Fujimori' }
    ],
    timeline: [
      { date: '1990', text: 'Asume la presidencia del Perú.' },
      { date: '5 abr. 1992', text: 'Autogolpe: disuelve el Congreso e interviene el Poder Judicial.' },
      { date: '1991–1992', text: 'Ocurren las matanzas de Barrios Altos y La Cantuta atribuidas al Grupo Colina.' },
      { date: '2000', text: 'Renuncia a la presidencia desde Japón en medio de los escándalos de corrupción de su gobierno.' },
      { date: '2007', text: 'Es extraditado desde Chile para ser juzgado en el Perú.' },
      { date: '7 abr. 2009', text: 'Condenado a 25 años de prisión por Barrios Altos, La Cantuta y dos secuestros.' },
      { date: '2017–2018', text: 'Recibe un indulto humanitario que es anulado en 2018.' },
      { date: 'Dic. 2023', text: 'El Tribunal Constitucional restituye el indulto y es liberado.' },
      { date: '11 sep. 2024', text: 'Fallece a los 86 años.' }
    ],
    bioSource: { title: 'Wikipedia: Alberto Fujimori', url: 'https://es.wikipedia.org/wiki/Alberto_Fujimori' },
    currentStatus: { status: 'fallecido', label: 'Falleció en 2024' },
    summary:
      'Condenado en 2009 a 25 años de prisión por las matanzas de Barrios Altos y La Cantuta y por dos secuestros. Su indulto humanitario fue anulado y luego restituido por el Tribunal Constitucional en 2023. Murió el 11 de septiembre de 2024.',
    cases: [
      {
        name: 'Barrios Altos, La Cantuta y secuestros (Grupo Colina)',
        status: 'condenado',
        period: 'Sentencia 7 abr. 2009',
        summary:
          'Condenado a 25 años de prisión como autor mediato de los asesinatos de Barrios Altos (1991) y La Cantuta (1992) y por los secuestros del periodista Gustavo Gorriti y del empresario Samuel Dyer.',
        sources: [
          {
            title: 'La Nación: diez hitos de la vida política de Fujimori',
            url: 'https://www.lanacion.com.ar/el-mundo/alberto-fujimori-diez-hitos-de-la-vida-politica-del-expresidente-que-murio-a-los-86-anos-nid11092024/'
          }
        ]
      },
      {
        name: 'Indulto humanitario: concesión, anulación y restitución',
        status: 'condenado',
        period: '2017 · anulado oct. 2018 · restituido por el TC en dic. 2023',
        summary:
          'En 2017 se le concedió un indulto humanitario que fue anulado en 2018. En diciembre de 2023 el Tribunal Constitucional, por voto de calidad de su presidente, restituyó el indulto y ordenó su liberación, pese a las objeciones del sistema interamericano de derechos humanos.',
        sources: [
          {
            title: 'El Comercio: indulto anulado',
            url: 'https://elcomercio.pe/politica/alberto-fujimori-indulto-ex-presidente-anulado-noticia-564259'
          },
          {
            title: 'NTN24: Corte Constitucional ordenó su liberación',
            url: 'https://www.ntn24.com/noticias-actualidad/corte-constitucional-de-peru-ordeno-la-liberacion-del-expresidente-fujimori-393571'
          }
        ]
      },
      {
        name: 'Fallecimiento',
        status: 'fallecido',
        period: '11 sep. 2024',
        summary: 'Falleció a los 86 años en su casa de Lima.',
        sources: [
          {
            title: 'Forbes Perú: Alberto Fujimori falleció a los 86 años',
            url: 'https://forbes.pe/actualidad/2024-09-11/expresidente-alberto-fujimori-fallecio-a-los-86-anos/'
          }
        ]
      }
      ,
      {
        name: 'Usurpación de funciones: allanamiento para hacer desaparecer los vladivideos',
        status: 'condenado',
        period: 'Sentencia 2007',
        summary:
          'Condenado a 6 años de prisión por ordenar que un militar se hiciera pasar por fiscal en el allanamiento de la casa de Trinidad Becerra, con el fin de hacer desaparecer los llamados vladivideos.',
        sources: [
          { title: 'Excélsior: los delitos de Alberto Fujimori', url: 'https://www.excelsior.com.mx/global/alberto-fujimori-delitos-sentencias/1673342' }
        ]
      },
      {
        name: 'Peculado: 15 millones de dólares a Vladimiro Montesinos',
        status: 'condenado',
        period: 'Sentencia 2009',
        summary:
          'Condenado a 7 años y 6 meses por peculado y falsedad ideológica por entregar unos 15 millones de dólares de fondos del Estado a su asesor Vladimiro Montesinos. Admitió los hechos pero negó culpabilidad, alegando que luego se reembolsó al Estado.',
        sources: [
          { title: 'Excélsior: los delitos de Alberto Fujimori', url: 'https://www.excelsior.com.mx/global/alberto-fujimori-delitos-sentencias/1673342' },
          { title: 'Jurist: juicio por corrupción', url: 'https://www.jurist.org/news/2009/07/peru-ex-president-fujimori-confesses-to/' }
        ]
      },
      {
        name: 'Interceptaciones telefónicas, pagos a congresistas y compra de líneas editoriales',
        status: 'condenado',
        period: 'Cuarto juicio (2009)',
        summary:
          'Fue juzgado por escuchas telefónicas ilegales, pagos a congresistas para que cambiaran de bancada y la compra ilegal de líneas editoriales de medios. Se declaró culpable de las escuchas y de los pagos a congresistas y aceptó una sentencia anticipada; no se pudo confirmar la pena en las fuentes consultadas.',
        sources: [
          { title: 'El Siglo de Torreón: comienza el cuarto juicio', url: 'https://www.elsiglodetorreon.com.mx/noticia/2009/comienza-cuarto-y-ultimo-juicio-de-fujimori.html' },
          { title: 'América TV: delitos por los que purgaba condena', url: 'https://www.americatv.com.pe/noticias/amp/actualidad/alberto-fujimori-estos-son-delitos-que-purga-condena-n293698' }
        ]
      },
      {
        name: 'Caso de los diarios "chicha" (más de 40 millones de dólares)',
        status: 'archivado',
        period: 'Condena de 8 años (2015) anulada en ago. 2016',
        summary:
          'En 2015 fue condenado a 8 años por desviar más de 40 millones de dólares de las Fuerzas Armadas para financiar tabloides que atacaban a opositores y respaldaban su reelección del año 2000. En agosto de 2016 una sala de la Corte Suprema anuló la condena por falta de prueba de que él ordenara pagos con fondos públicos. La anulación no redujo su tiempo de prisión, porque la ley aplica la pena más larga.',
        sources: [
          { title: 'Metro: anulan una condena por corrupción de Alberto Fujimori', url: 'https://www.metro.pr/noticias/2016/08/16/peru-anulan-condena-corrupcion-alberto-fujimori' },
          { title: 'América TV: régimen marcado por escándalos y corrupción', url: 'https://www.americatv.com.pe/noticias/amp/actualidad/alberto-fujimori-regimen-marcado-escandalos-y-corrupcion-n496666' }
        ]
      }
    ],
    unverifiedClaims: [
      'Este expediente lo presenta como antecedente de compra de coberturas televisivas (Caso Vladivideos / América TV). El cuarto juicio sí abordó la compra de líneas editoriales de medios, pero no se enlazó una fuente que mencione específicamente a América TV.'
    ]
  },

  'cong-fig-05': {
    figureId: 'cong-fig-05',
    headline: 'Expresidente (2018–2020) · exgobernador regional de Moquegua',
    facts: [
      { label: 'Nombre completo', value: 'Martín Alberto Vizcarra Cornejo' },
      { label: 'Nacimiento', value: '22 de marzo de 1963, Lima' },
      { label: 'Profesión', value: 'Ingeniero civil' },
      { label: 'Cargos', value: 'Gobernador regional de Moquegua (2011–2014), ministro de Transportes (2016–2017), presidente (2018–2020)' },
      { label: 'Condena', value: '14 años de prisión (nov. 2025), en apelación' },
      { label: 'Inhabilitación', value: '9 años en la sentencia penal; 10 años impuestos antes por el Congreso' }
    ],
    timeline: [
      { date: '2011–2014', text: 'Gobernador regional de Moquegua: periodo al que corresponden los casos Lomas de Ilo y Hospital de Moquegua.' },
      { date: '2018', text: 'Asume la presidencia tras la renuncia de Pedro Pablo Kuczynski.' },
      { date: '30 sep. 2019', text: 'Disuelve el Congreso.' },
      { date: '9 nov. 2020', text: 'El Congreso lo vaca por incapacidad moral permanente.' },
      { date: '2021', text: 'El Congreso lo inhabilita por 10 años por el caso Vacunagate.' },
      { date: '26 nov. 2025', text: 'Condenado a 14 años de prisión; ingresa al penal de Barbadillo.' },
      { date: '2026', text: 'El TC rechaza un hábeas corpus y la apelación sigue en trámite.' }
    ],
    bioSource: { title: 'Wikipedia: Martín Vizcarra', url: 'https://es.wikipedia.org/wiki/Mart%C3%ADn_Vizcarra' },
    currentStatus: { status: 'condena-apelada', label: 'Condenado a 14 años · apelación en curso' },
    summary:
      'Condenado en noviembre de 2025 a 14 años de prisión por cohecho pasivo propio en los casos Lomas de Ilo y Hospital de Moquegua. Su defensa apeló y el Tribunal Constitucional rechazó un hábeas corpus que buscaba anular la sentencia.',
    cases: [
      {
        name: 'Lomas de Ilo y Hospital Regional de Moquegua',
        status: 'condena-apelada',
        period: 'Sentencia 26 nov. 2025',
        summary:
          'El Cuarto Juzgado Penal Colegiado Nacional lo halló culpable de cohecho pasivo propio por unos S/ 2,3 millones en pagos ilegales de las empresas Obrainsa y Contratistas Generales SAT: 6 años por Lomas de Ilo y 8 por el hospital, con 9 años de inhabilitación y reparación civil. La Fiscalía había pedido 15 años. La apelación fue admitida y el caso será revisado por la Sala de Apelaciones. El Tribunal Constitucional declaró improcedente un hábeas corpus que buscaba anularla.',
        sources: [
          {
            title: 'RPP: Vizcarra sentenciado a 14 años',
            url: 'https://rpp.pe/politica/judiciales/martin-vizcarra-fue-sentenciado-a-14-anos-de-carcel-por-caso-lomas-de-ilo-y-hospital-de-moquegua-noticia-1665414'
          },
          {
            title: 'RPP: TC rechaza hábeas corpus contra la condena',
            url: 'https://rpp.pe/politica/judiciales/tc-rechaza-habeas-corpus-que-buscaba-anular-condena-de-martin-vizcarra-por-casos-lomas-de-ilo-y-hospital-regional-de-moquegua-noticia-1691395'
          },
          {
            title: 'Caretas: Poder Judicial admite su apelación',
            url: 'https://caretas.pe/?p=779978'
          }
        ]
      }
      ,
      {
        name: 'Vacunagate (vacunación irregular durante la pandemia)',
        status: 'sancion-politica',
        period: '2021',
        summary:
          'Se conoció que había recibido de forma reservada la vacuna contra la COVID-19 en octubre de 2020, antes de que se iniciara la inmunización de la población. El Congreso lo inhabilitó para ejercer función pública por 10 años. Es una sanción política del Parlamento, distinta de la condena penal por Lomas de Ilo y Hospital de Moquegua.',
        sources: [{ title: 'Wikipedia: Martín Vizcarra', url: 'https://es.wikipedia.org/wiki/Mart%C3%ADn_Vizcarra' }]
      }
      ,
      {
        name: 'Club de la Construcción: señalamientos de aspirantes a colaboradores eficaces',
        status: 'condena-apelada',
        period: 'Hechos de 2014 · parte de la condena de 2025',
        summary:
          'Aspirantes a colaboradores eficaces afirmaron que, cuando era gobernador regional de Moquegua, recibió sobornos de empresas vinculadas al Club de la Construcción: según un reporte de Correo, el consorcio ICCGSA-Incot habría pagado S/ 1,3 millones por el hospital y Obrainsa-Astaldi habría entregado S/ 1 millón por Lomas de Ilo, en 2014. Son los hechos por los que fue condenado en 2025; él niega las acusaciones.',
        sources: [
          { title: 'Canal N: otras investigaciones abiertas en su contra', url: 'https://canaln.pe/actualidad/martin-vizcarra-otras-investigaciones-abiertas-su-contra-n486041' },
          { title: 'América TV: investigaciones contra Martín Vizcarra', url: 'https://www.americatv.com.pe/noticias/actualidad/investigaciones-contra-martin-vizcarra-n489482' }
        ]
      },
      {
        name: 'Richard Swing: contratos en el Ministerio de Cultura',
        status: 'en-investigacion',
        period: 'Investigación fiscal (estado actual sin verificar)',
        summary:
          'El Ministerio Público investigó su presunta participación en la autorización de nueve contratos por un total de S/ 175 mil a favor del cantante Richard Cisneros (Richard Swing) en el Ministerio de Cultura, además del presunto pago de dinero a cambio de su silencio.',
        sources: [
          { title: 'Canal N: otras investigaciones abiertas en su contra', url: 'https://canaln.pe/actualidad/martin-vizcarra-otras-investigaciones-abiertas-su-contra-n486041' }
        ]
      },
      {
        name: 'Vacunagate: investigación penal',
        status: 'en-investigacion',
        period: 'Estado actual sin verificar',
        summary:
          'Además de la sanción del Congreso, la Fiscalía lo investigó penalmente por el caso Vacunagate por presunta organización criminal y concusión agravada, entre otros delitos.',
        sources: [
          { title: 'Canal N: otras investigaciones abiertas en su contra', url: 'https://canaln.pe/actualidad/martin-vizcarra-otras-investigaciones-abiertas-su-contra-n486041' }
        ]
      }
    ],
    unverifiedClaims: [
      'Este expediente lo vincula con direccionamiento de gasto publicitario estatal hacia conglomerados de televisión. No se ha enlazado una fuente pública que respalde ese señalamiento; la condena documentada es por otro caso.'
    ]
  },

  'cong-fig-06': {
    figureId: 'cong-fig-06',
    headline: 'Expresidenta (2022–2025) · vacada por el Congreso',
    facts: [
      { label: 'Nombre completo', value: 'Dina Ercilia Boluarte Zegarra' },
      { label: 'Nacimiento', value: '31 de mayo de 1962, Chalhuanca (Apurímac)' },
      { label: 'Profesión', value: 'Abogada' },
      { label: 'Cargos', value: 'Ministra de Desarrollo e Inclusión Social (2021–2022), vicepresidenta, presidenta (2022–2025)' },
      { label: 'Salida del cargo', value: 'Vacada por el Congreso con 122 votos (oct. 2025)' },
      { label: 'Investigaciones', value: 'Al menos 11 abiertas al momento de su vacancia' }
    ],
    timeline: [
      { date: '28 jul. 2021', text: 'Asume como vicepresidenta en la fórmula de Perú Libre junto a Pedro Castillo.' },
      { date: '7 dic. 2022', text: 'Asume la presidencia tras el intento de golpe de Pedro Castillo.' },
      { date: 'Dic. 2022–mar. 2023', text: 'Se producen las protestas con decenas de fallecidos que originan investigaciones en su contra.' },
      { date: '2024', text: 'Estalla el caso "Rolexgate" sobre relojes y joyas no declarados.' },
      { date: 'Ago. 2025', text: 'El TC suspende las investigaciones en su contra hasta el fin de su mandato.' },
      { date: 'Oct. 2025', text: 'El Congreso la destituye por incapacidad moral con 122 votos.' },
      { date: 'Feb. 2026', text: 'El Poder Judicial rechaza de forma definitiva el impedimento de salida del país.' }
    ],
    bioSource: { title: 'Wikipedia: Dina Boluarte', url: 'https://es.wikipedia.org/wiki/Dina_Boluarte' },
    currentStatus: { status: 'en-investigacion', label: 'Varias investigaciones abiertas' },
    summary:
      'Fue vacada por incapacidad moral en octubre de 2025. Enfrenta múltiples investigaciones fiscales; ninguna ha terminado en condena según las fuentes consultadas. Los pedidos de impedimento de salida del país fueron rechazados.',
    cases: [
      {
        name: 'Vacancia y medidas contra su salida del país',
        status: 'archivado',
        period: 'Vacancia oct. 2025 · pedido rechazado definitivamente feb. 2026',
        summary:
          'El Congreso la destituyó con 122 votos. La Fiscalía pidió impedirle salir del país, sustentada en tres de las al menos once investigaciones que enfrentaba; el Poder Judicial rechazó los pedidos en doble instancia y, a inicios de febrero de 2026, de forma definitiva, al considerar que no se demostró conducta renuente.',
        sources: [
          {
            title: 'Exitosa: PJ rechaza definitivamente el impedimento de salida',
            url: 'https://www.exitosanoticias.pe/judiciales/dina-boluarte-pj-rechaza-definitivamente-pedido-impedimento-salida-pais-expresidenta-n167979'
          }
        ]
      },
      {
        name: 'Rolexgate y enriquecimiento ilícito',
        status: 'en-investigacion',
        period: 'Desde 2024',
        summary:
          'Denuncia por presunto soborno y una investigación por enriquecimiento ilícito por relojes y joyas no declarados. Ella sostiene que eran préstamos.',
        sources: [
          {
            title: 'Primicias: suspensión de investigaciones, Rolexgate',
            url: 'https://www.primicias.ec/internacional/dina-boluarte-presidenta-peru-suspension-investigaciones-rolexgate-103235/'
          }
        ]
      },
      {
        name: 'Muertes en las protestas (2022–2023)',
        status: 'en-investigacion',
        period: 'Desde 2023',
        summary:
          'Investigación por las muertes ocurridas en las protestas tras su llegada al poder. En agosto de 2025 el Tribunal Constitucional ordenó suspender las investigaciones en su contra hasta el fin de su mandato, que concluyó con su vacancia.',
        sources: [
          {
            title: 'Emol: el TC suspende las investigaciones hasta el fin de su gestión',
            url: 'https://www.emol.com/noticias/Internacional/2025/08/19/1175449/peru-boluarte-suspension-investigaciones-judiciales.html'
          }
        ]
      },
      {
        name: 'Los Dinámicos del Centro (financiamiento de la campaña de Perú Libre 2021)',
        status: 'en-investigacion',
        period: 'Investigación ampliada · careos fijados para el 27 y 28 de oct. de 2025',
        summary:
          'Investigada por presunto lavado de activos agravado como integrante de una organización criminal, en torno al uso del patrimonio de Perú Libre, partido por el que fue candidata a la vicepresidencia junto a Pedro Castillo. La Fiscalía pidió impedirle salir del país por 36 meses y fijó careos que podían decidir si se formalizaba la acusación; el pedido de impedimento fue rechazado.',
        sources: [
          {
            title: 'Emol: la Fiscalía amplía las investigaciones',
            url: 'https://www.emol.com/noticias/Internacional/2025/08/19/1175449/peru-boluarte-suspension-investigaciones-judiciales.html'
          }
        ]
      },
      {
        name: 'Presunta obstrucción: desactivación de un grupo policial de apoyo a fiscales',
        status: 'en-investigacion',
        period: 'Investigación preliminar (2026)',
        summary:
          'La Fiscalía abrió una investigación preliminar por presunta obstrucción relacionada con la desactivación de un grupo policial que apoyaba a fiscales anticorrupción. Es una investigación inicial; no hay acusación ni sentencia.',
        sources: [
          {
            title: 'Diario Las Américas: Fiscalía amplía la investigación',
            url: 'https://www.diariolasamericas.com/america-latina/fiscalia-peru-amplia-investigacion-dina-boluarte-n5332957'
          }
        ]
      },
      {
        name: 'Caso "Cirugías" (falsedad genérica)',
        status: 'archivado',
        period: 'Archivado por la Fiscalía de la Nación',
        summary:
          'Investigación por supuesta falsedad genérica en firmas oficiales durante una intervención médica en 2023. La Fiscalía de la Nación la archivó al determinar técnicamente la autenticidad de las firmas.',
        sources: [
          {
            title: 'RPP: Fiscalía archiva la investigación por falsedad genérica',
            url: 'https://rpp.pe/politica/judiciales/fiscalia-archiva-investigacion-contra-dina-boluarte-por-supuesta-falsedad-generica-noticia-1690514'
          }
        ]
      }
      ,
      {
        name: 'Qali Warma: contratos a la Corporación Belcen',
        status: 'en-investigacion',
        period: 'Declaró ante la Fiscalía en feb. 2025 · estado actual sin verificar',
        summary:
          'La Fiscalía de la Nación investiga negociación incompatible: según la hipótesis fiscal, cuando fue ministra de Desarrollo e Inclusión Social habría favorecido con contratos del programa Qali Warma a la Corporación Belcen.',
        sources: [
          { title: 'Canal N: Boluarte, careos y citaciones judiciales', url: 'https://canaln.pe/actualidad/pj-intenta-sin-exito-entregar-citacion-dina-boluarte-n487402' }
        ]
      },
      {
        name: 'EsSalud: designaciones y beneficios a un amigo de su médico',
        status: 'en-investigacion',
        period: 'Impedimento de salida (18 meses) rechazado por la Corte Suprema',
        summary:
          'Se la investigó por negociación incompatible y aprovechamiento indebido del cargo: habría intervenido en designaciones en EsSalud y facilitado el pago de beneficios sociales a favor de un amigo del médico que le practicó cirugías estéticas. La Corte Suprema confirmó el rechazo del impedimento de salida pedido por este caso.',
        sources: [
          { title: 'Expreso: Corte Suprema rechaza el impedimento de salida', url: 'https://www.expreso.com.pe/judicial/corte-suprema-rechaza-impedimento-de-salida-contra-dina-boluarte-expresidenta-puede-salir-del-peru-ejecutivo-fiscalia-pj-tomas-galvez-noticia/1260949/' }
        ]
      },
      {
        name: 'Pago a un amigo de su hermano Nicanor (Víctor Torres Merino)',
        status: 'en-investigacion',
        period: 'Investigación de la Fiscalía Anticorrupción',
        summary:
          'La Fiscalía Anticorrupción investigó indicios de corrupción por un pago de casi S/ 50 mil a Víctor Torres Merino, amigo de su hermano Nicanor Boluarte. Según la nota, un audio muestra a Torres mencionando a Nicanor en relación con la protección de un cargo público. No se pudo confirmar qué cargos existen contra Nicanor Boluarte.',
        sources: [
          { title: 'Expreso: Fiscalía Anticorrupción investiga a Dina Boluarte', url: 'https://www.expreso.com.pe/judicial/fiscalia-anticorrupcion-investiga-a-dina-boluarte-por-indicios-de-corrupcion-se-pago-a-amigo-de-su-hermano-nicanor-victor-torres-merino-noticia/1061034/' }
        ]
      }
    ],
    unverifiedClaims: [
      'Este expediente la vincula con partidas de imagen institucional usadas para sostener acuerdos con bancadas. No se ha enlazado una fuente pública que respalde ese señalamiento.'
    ]
  },

  'cong-fig-07': {
    figureId: 'cong-fig-07',
    headline: 'Expresidente (2021–2022) · preso',
    facts: [
      { label: 'Nombre completo', value: 'José Pedro Castillo Terrones' },
      { label: 'Nacimiento', value: '19 de octubre de 1969, Puña (Cajamarca)' },
      { label: 'Profesión', value: 'Docente rural y dirigente sindical' },
      { label: 'Cargo', value: 'Presidente del Perú (2021–2022)' },
      { label: 'Condena', value: '11 años, 5 meses y 15 días (nov. 2025)' },
      { label: 'Situación', value: 'Recluido; enfrenta otros procesos por corrupción' }
    ],
    timeline: [
      { date: '2017', text: 'Se vuelve conocido como dirigente de la huelga nacional de maestros.' },
      { date: '28 jul. 2021', text: 'Asume la presidencia tras vencer a Keiko Fujimori en la segunda vuelta.' },
      { date: '2022', text: 'La Fiscalía abre investigaciones por presunta organización criminal, colusión y tráfico de influencias.' },
      { date: '7 dic. 2022', text: 'Anuncia la disolución del Congreso; es vacado y detenido el mismo día.' },
      { date: '27 nov. 2025', text: 'Condenado a 11 años, 5 meses y 15 días por conspiración para la rebelión.' }
    ],
    bioSource: { title: 'Wikipedia: Pedro Castillo', url: 'https://es.wikipedia.org/wiki/Pedro_Castillo' },
    currentStatus: { status: 'condenado', label: 'Condenado a 11 años y 5 meses' },
    summary:
      'Condenado en noviembre de 2025 por conspiración para la rebelión a raíz del intento de disolver el Congreso del 7 de diciembre de 2022. Fue absuelto de otros cargos. Mantiene procesos por presunta corrupción y organización criminal cuyo estado actual no se pudo verificar.',
    cases: [
      {
        name: 'Conspiración para la rebelión (7 de diciembre de 2022)',
        status: 'condenado',
        period: 'Sentencia 27 nov. 2025',
        summary:
          'La Sala Penal Especial de la Corte Suprema le impuso 11 años, 5 meses y 15 días de prisión y 2 años de inhabilitación, y S/ 12 millones de reparación civil solidaria. No se consumó el delito de rebelión, por lo que se aplicó el tipo de conspiración; fue absuelto de abuso de autoridad y de grave perturbación de la tranquilidad pública. La Fiscalía pedía 34 años.',
        sources: [
          {
            title: 'RPP: Poder Judicial lee la sentencia',
            url: 'https://rpp.pe/politica/judiciales/poder-judicial-lee-sentencia-a-pedro-castillo-por-el-fallido-golpe-de-estado-live-3065'
          },
          {
            title: 'Forbes Perú: condenado a 11 años y 5 meses',
            url: 'https://forbes.pe/actualidad/2025-11-27/pedro-castillo-fue-condenado-a-11-anos-y-5-meses-de-prision-por-el-delito-de-conspiracion-para-la-rebelion'
          }
        ]
      },
      {
        name: 'Organización criminal, colusión y tráfico de influencias',
        status: 'en-investigacion',
        period: 'Investigación desde 2022 · estado actual sin verificar',
        summary:
          'La Fiscalía investigó presuntos actos de corrupción en el Ejecutivo: adjudicación de biodiésel, presiones en ascensos militares y la licitación de un puente en San Martín, a partir de declaraciones de la empresaria Karelim López, quien lo señaló como líder de una organización criminal. Su defensa sostuvo que no hay pruebas de hechos concretos. No se pudo confirmar en qué etapa está hoy ese proceso.',
        sources: [
          {
            title: 'Primicias: Fiscalía investiga a Castillo por corrupción',
            url: 'https://www.primicias.ec/noticias/lo-ultimo/fiscalia-investiga-pedro-castillo-corrucion'
          },
          {
            title: 'Congreso: Karelim López se reafirma en sus declaraciones',
            url: 'https://comunicaciones.congreso.gob.pe/?p=170830'
          }
        ]
      }
      ,
      {
        name: 'Denuncia constitucional por organización criminal (Ministerio de Transportes y Puente Tarata)',
        status: 'en-investigacion',
        period: 'Informe aprobado por el Congreso: 59 votos a favor, 23 en contra, 3 abstenciones',
        summary:
          'El Congreso aprobó un informe que recomienda a la Fiscalía acusarlo por organización criminal agravada, tráfico de influencias agravado y, como cómplice, colusión. Según la Fiscalía, habría usado el Ministerio de Transportes y Comunicaciones para obtener un soborno a cambio de beneficiar a un empresario con la obra del puente Tarata. El informe incluye también a los exministros Juan Silva y Geiner Alvarado. Sus sobrinos Fray Vásquez y Gian Marco Castillo figuran entre los presuntos involucrados. No se pudo confirmar si hay acusación formal ni juicio.',
        sources: [
          { title: 'Expreso: Congreso aprueba informe que recomienda acusarlo', url: 'https://www.expreso.com.pe/politica/congreso-aprueba-informe-que-recomienda-acusar-constitucionalmente-a-castillo/' },
          { title: 'Voz de América: Fiscalía presenta denuncia contra Castillo', url: 'https://www.vozdeamerica.com/a/fiscalia-peru-presenta-denuncia-pedro-castillo-/6786150.html' }
        ]
      },
      {
        name: 'Petroperú: designación de su gerente general',
        status: 'en-investigacion',
        period: 'Investigación desde 2022',
        summary:
          'La Fiscalía sostiene que designó a Hugo Chávez Arévalo como gerente general de Petroperú para influir en contrataciones millonarias. Chávez renunció en marzo de 2022 y negó las acusaciones.',
        sources: [
          { title: 'El Ciudadano: el nuevo escándalo que apunta a Castillo', url: 'https://elciudadano.com/?p=891095' }
        ]
      },
      {
        name: 'Bruno Pacheco, exsecretario presidencial',
        status: 'en-investigacion',
        period: 'Entorno investigado',
        summary:
          'Karelim López mencionó a su exsecretario presidencial Bruno Pacheco entre los presuntos integrantes de la organización. Pacheco, antiguo asesor del presidente, se entregó tras meses prófugo.',
        sources: [
          { title: 'Yahoo: asesor del presidente arrestado tras meses prófugo', url: 'https://news.yahoo.com/ex-adviser-peru-president-arrested-152954949.html?fr=sycsrp_catchall' }
        ]
      }
    ],
    unverifiedClaims: [
      'Este expediente menciona ofrecimientos de pauta oficial a cambio de frenar coberturas dominicales. No se ha enlazado una fuente pública que respalde ese señalamiento.'
    ]
  },

  'cong-fig-08': {
    figureId: 'cong-fig-08',
    headline: 'Expresidente (1985–1990 y 2006–2011) · fallecido en 2019',
    facts: [
      { label: 'Nombre completo', value: 'Alan Gabriel Ludwig García Pérez' },
      { label: 'Nacimiento', value: '23 de mayo de 1949, Lima' },
      { label: 'Fallecimiento', value: '17 de abril de 2019, Lima (69 años)' },
      { label: 'Partido', value: 'APRA' },
      { label: 'Cargo', value: 'Presidente del Perú (1985–1990 y 2006–2011)' },
      { label: 'Condenas', value: 'Ninguna' }
    ],
    timeline: [
      { date: '1985', text: 'A los 36 años asume su primer gobierno.' },
      { date: '2006', text: 'Vuelve a la presidencia tras ganar la segunda vuelta.' },
      { date: '2017', text: 'La Procuraduría denuncia presuntos sobornos de Odebrecht por la Línea 1 del Metro de Lima.' },
      { date: '2018', text: 'Un juez le impone 18 meses de impedimento de salida del país.' },
      { date: '17 abr. 2019', text: 'Se dispara cuando la Policía llega a su casa para detenerlo; muere horas después.' }
    ],
    bioSource: { title: 'Wikipedia: Alan García', url: 'https://es.wikipedia.org/wiki/Alan_Garc%C3%ADa' },
    currentStatus: { status: 'fallecido', label: 'Falleció sin sentencia en 2019' },
    summary:
      'Fue investigado por presuntos sobornos de Odebrecht en la Línea 1 del Metro de Lima. Murió el 17 de abril de 2019, cuando la Policía llegó a su casa para ejecutar una orden de detención preliminar. Nunca fue condenado y negó haber recibido sobornos.',
    cases: [
      {
        name: 'Odebrecht · Línea 1 del Metro de Lima',
        status: 'fallecido',
        period: 'Investigación desde 2017 · falleció el 17 abr. 2019',
        summary:
          'La Fiscalía investigaba lavado de activos, tráfico de influencias y colusión por la licitación del Metro de Lima. En 2018 un juez le impuso 18 meses de impedimento de salida del país. El 17 de abril de 2019 se disparó cuando la Policía ingresó a su domicilio para detenerlo por 10 días; murió horas después en el Hospital Casimiro Ulloa. Un día antes había escrito que jamás se vendió.',
        sources: [
          {
            title: 'RPP: cronología de la investigación por Odebrecht',
            url: 'https://rpp.pe/politica/judiciales/cronologia-alan-garcia-de-investigado-por-el-caso-odebrecht-a-solicitante-de-asilo-noticia-1164083'
          },
          {
            title: 'Swissinfo: se suicida cuando iba a ser detenido',
            url: 'https://www.swissinfo.ch/spa/el-expresidente-peruano-alan-garc%c3%ada-se-suicida-cuando-iba-a-ser-detenido-por-caso-odebrecht/44904896'
          }
        ]
      }
      ,
      {
        name: 'Entorno: Luis Nava y Miguel Atala (Petroperú)',
        status: 'en-investigacion',
        period: 'Investigación sobre su entorno',
        summary:
          'Un juzgado dictó prisión preventiva contra Luis Nava Guibert, exsecretario general de la Presidencia, y arresto domiciliario para Miguel Atala, exvicepresidente de Petroperú, quien afirmó haber actuado como testaferro del expresidente García. García nunca fue condenado y negó siempre las acusaciones.',
        sources: [
          { title: 'Andina: prisión preventiva contra el secretario de García', url: 'https://andina.pe/ingles/noticia-peru-judge-orders-preventive-detention-of-expresident-garcias-secretary-750197.aspx' }
        ]
      },
      {
        name: 'Casos de su entorno resueltos: "petroaudios" y Tren Eléctrico',
        status: 'archivado',
        period: 'Petroaudios: absolución en 2016 · Tren Eléctrico: prescripción',
        summary:
          'Según El Comercio, en el caso de los "petroaudios" el Poder Judicial absolvió a todos los implicados en 2016, y en el del Tren Eléctrico de Lima los delitos prescribieron. Ninguno terminó en condena.',
        sources: [
          { title: 'El Comercio: investigaciones por corrupción en el entorno de García', url: 'https://elcomercio.pe/politica/investigaciones-corrupcion-persiguieron-entorno-garcia-noticia-ecpm-628414' }
        ]
      }
    ],
    unverifiedClaims: [
      'Este expediente sostiene que sus convenios sirvieron de modelo del actual blindaje de comisiones congresales. No se ha enlazado una fuente pública que respalde ese señalamiento.'
    ]
  }
};

/** Etiqueta corta para las tarjetas de la cuadrícula */
/** Casos visibles en el adelanto de la figura destacada; el resto se revela al cerrar el contador. */
export const PREVIEW_CASE_COUNT = 2;

export function getFigureBadge(figureId: string): { label: string; tone: 'red' | 'amber' | 'green' | 'zinc' } | null {
  const p = FIGURE_PROFILES[figureId];
  if (!p) return null;
  const st = p.currentStatus.status;
  if (st === 'sin-sentencia') return { label: p.currentStatus.label, tone: 'zinc' };
  return { label: p.currentStatus.label, tone: CASE_STATUS_META[st].tone };
}
